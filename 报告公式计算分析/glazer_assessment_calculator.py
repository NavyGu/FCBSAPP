#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""
Glazer评估计算器
用于计算盆底肌Glazer评估的各项指标得分
"""

import math
import os
from glazer_test_data_loader import GlazerTestDataLoader

class GlazerAssessmentCalculator:
    def __init__(self):
        # 定义各阶段权重
        self.weights = {
            'pre_baseline': 0.1,    # 前静息阶段权重较低，因为静息状态主要作为基线参考，对总体功能评估影响较小
            'fast_twitch': 0.3,     # 快肌纤维阶段权重较高，因为快速收缩能力对盆底肌功能至关重要，反映肌肉的即时反应能力
            'tonic': 0.3,           # 慢肌纤维阶段权重同样较高，因为持续收缩能力对盆底肌功能同样重要，反映肌肉的持久性
            'endurance': 0.2,       # 耐力测试阶段权重中等，评估肌肉长时间工作能力，是功能评估的重要组成部分
            'post_baseline': 0.10    # 后静息阶段权重较低，主要用于评估肌肉恢复能力，作为辅助指标
        }
        
        # 定义各阶段内部指标权重
        self.pre_baseline_weights = {
            'avg_value': 0.55,     # 平均值权重高，因为静息状态下的基础肌电水平是关键指标，直接反映肌肉的基础张力
            'variability': 0.45    # 变异性权重低，作为辅助指标，反映肌肉在静息状态下的稳定性
        }
        
        self.fast_twitch_weights = {
            'max_value': 0.4,      # 最大值权重最高，直接反映快肌纤维的最大收缩能力，是该阶段最核心的指标
            'rise_time': 0.3,      # 上升时间权重次之，反映收缩速度，是快肌纤维功能的重要特征
            'recovery_time': 0.3   # 恢复时间权重最低，虽然也反映肌肉功能，但在快肌评估中相对次要
        }
        
        self.tonic_weights = {
            'avg_value': 0.6,       # 平均值权重最高，反映慢肌纤维的持续收缩能力，是该阶段的核心指标
            'rise_time': 0.1,      # 上升时间权重中等，反映慢肌收缩过程的特性
            'recovery_time': 0.1,  # 恢复时间权重中等，与上升时间同等重要，共同反映完整的收缩-放松周期
            'variability': 0.2      # 变异性权重最低，作为辅助指标，反映持续收缩过程中的稳定性
        }
        
        self.endurance_weights = {
            'avg_value': 0.65,       # 平均值权重最高，直接反映耐力测试中的整体表现水平
            'variability': 0.1,     # 变异性权重最低，作为辅助指标，反映长时间收缩过程中的稳定性
            'fatigue_index': 0.25     # 疲劳指数权重较高，是评估耐力特性的核心指标，直接反映肌肉抗疲劳能力
        }
        
        # 后静息阶段权重 - 与前静息不同，更注重平均值
        self.post_baseline_weights = {
            'avg_value': 0.7,     # 平均值权重更高，因为训练后恢复阶段更关注肌肉能否回到基线状态，平均值是关键指标
            'variability': 0.3    # 变异性权重降低，因为训练后的恢复过程中，轻微的变异性是正常的
        }
    
    def calculate_score_curve_smaller_better(self, value, pass_value, perfect_value):
        """
        计算"越小越好"型指标的曲线得分
        :param value: 实际测量值
        :param pass_value: 及格线对应的值（60分）
        :param perfect_value: 满分对应的值（100分）
        :return: 得分(0-100)
        """
        if value <= perfect_value:
            return 100
        else:
            # 使用指数衰减函数：score = 100 - 40 * ((value - perfect_value) / (pass_value - perfect_value))^2
            # 当value > pass_value时，继续按照曲线衰减，可以低于60分直到0分
            ratio = (value - perfect_value) / (pass_value - perfect_value)
            score = 100 - 40 * (ratio ** 2)
            return max(0, min(100, score))  # 最低0分，最高100分
    
    def calculate_score_curve_larger_better(self, value, pass_value, perfect_value):
        """
        计算"越大越好"型指标的曲线得分
        :param value: 实际测量值
        :param pass_value: 及格线对应的值（60分）
        :param perfect_value: 满分对应的值（100分）
        :return: 得分(0-100)
        """
        if value >= perfect_value:
            return 100
        else:
            # 使用对数增长函数：score = 60 + 40 * ((value - pass_value) / (perfect_value - pass_value))^0.5
            # 当value < pass_value时，继续按照曲线衰减，可以低于60分直到0分
            if value >= pass_value:
                ratio = (value - pass_value) / (perfect_value - pass_value)
                score = 60 + 40 * (ratio ** 0.5)
            else:
                # 当低于及格线时，使用线性衰减到0分
                ratio = value / pass_value
                score = 60 * ratio
            return max(0, min(100, score))  # 最低0分，最高100分
    
    def calculate_score_gaussian(self, value, optimal_value, pass_range):
        """
        计算高斯分布型指标的得分（用于耐力测试后10秒比值）
        :param value: 实际测量值
        :param optimal_value: 最优值（100分）
        :param pass_range: 及格范围边界值（60分）
        :return: 得分(0-100)
        """
        # 计算与最优值的偏差
        deviation = abs(value - optimal_value)
        pass_deviation = abs(pass_range - optimal_value)
        
        if deviation == 0:
            return 100
        else:
            # 使用高斯函数：score = 100 - 40 * (deviation / pass_deviation)^2
            # 当偏差超过及格范围时，继续按照曲线衰减，可以低于60分直到0分
            ratio = deviation / pass_deviation
            score = 100 - 40 * (ratio ** 2)
            return max(0, min(100, score))  # 最低0分，最高100分
    
    def calculate_pre_baseline_score(self, avg_value, variability):
        """
        计算前静息阶段得分
        :param avg_value: 平均值(μV)
        :param variability: 变异性
        :return: (阶段得分, 单项得分详情)
        """
        # 平均值评分 - 曲线计算 (越小越好：满分0μV，及格4μV)
        avg_score = self.calculate_score_curve_smaller_better(avg_value, 4, 0)
        
        # 变异性评分 - 曲线计算 (越小越好：满分0，及格0.2)
        var_score = self.calculate_score_curve_smaller_better(variability, 0.2, 0)
        
        # 阶段总分 - 使用权重
        stage_score = (self.pre_baseline_weights['avg_value'] * avg_score + 
                       self.pre_baseline_weights['variability'] * var_score)
        
        # 返回阶段得分和单项得分详情
        details = {
            'avg_score': avg_score,
            'var_score': var_score
        }
        
        return stage_score, details
    
    def calculate_fast_twitch_score(self, max_value, rise_time, recovery_time):
        """
        计算快肌纤维阶段得分
        :param max_value: 最大值(μV)
        :param rise_time: 上升时间(s)
        :param recovery_time: 恢复时间(s)
        :return: (阶段得分, 单项得分详情)
        """
        # 最大值评分 - 曲线计算 (越大越好：及格40μV，满分60μV)
        max_score = self.calculate_score_curve_larger_better(max_value, 40, 60)
        
        # 上升时间评分 - 曲线计算 (越小越好：满分0.1s，及格0.5s)
        rise_score = self.calculate_score_curve_smaller_better(rise_time, 0.5, 0.1)
        
        # 恢复时间评分 - 曲线计算 (越小越好：满分0.1s，及格0.5s)
        recovery_score = self.calculate_score_curve_smaller_better(recovery_time, 0.5, 0.1)
        
        # 阶段总分 - 使用权重
        stage_score = (self.fast_twitch_weights['max_value'] * max_score + 
                       self.fast_twitch_weights['rise_time'] * rise_score + 
                       self.fast_twitch_weights['recovery_time'] * recovery_score)
        
        # 返回阶段得分和单项得分详情
        details = {
            'max_score': max_score,
            'rise_score': rise_score,
            'recovery_score': recovery_score
        }
        
        return stage_score, details
    
    def calculate_tonic_score(self, avg_value, rise_time, recovery_time, variability):
        """
        计算慢肌纤维阶段得分
        :param avg_value: 平均值(μV)
        :param rise_time: 上升时间(s)
        :param recovery_time: 恢复时间(s)
        :param variability: 变异性
        :return: (阶段得分, 单项得分详情)
        """
        # 平均值评分 - 曲线计算 (越大越好：及格35μV，满分50μV)
        avg_score = self.calculate_score_curve_larger_better(avg_value, 35, 45)
        
        # 上升时间评分 - 曲线计算 (越小越好：满分0.2s，及格1s)
        rise_score = self.calculate_score_curve_smaller_better(rise_time, 1, 0.2 )
        
        # 恢复时间评分 - 曲线计算 (越小越好：满分0.2s，及格1s)
        recovery_score = self.calculate_score_curve_smaller_better(recovery_time, 1, 0.2 )
        
        # 变异性评分 - 曲线计算 (越小越好：满分0，及格0.2)
        var_score = self.calculate_score_curve_smaller_better(variability, 0.2, 0)
        
        # 阶段总分 - 使用权重
        stage_score = (self.tonic_weights['avg_value'] * avg_score + 
                       self.tonic_weights['rise_time'] * rise_score + 
                       self.tonic_weights['recovery_time'] * recovery_score + 
                       self.tonic_weights['variability'] * var_score)
        
        # 返回阶段得分和单项得分详情
        details = {
            'avg_score': avg_score,
            'rise_score': rise_score,
            'recovery_score': recovery_score,
            'var_score': var_score
        }
        
        return stage_score, details
    
    def calculate_endurance_score(self, avg_value, variability, fatigue_index):
        """
        计算耐力测试阶段得分
        :param avg_value: 平均值(μV)
        :param variability: 变异性
        :param fatigue_index: 疲劳指数（后10秒比值）
        :return: (阶段得分, 单项得分详情)
        """
        # 平均值评分 - 曲线计算 (越大越好：及格30μV，满分40μV)
        avg_score = self.calculate_score_curve_larger_better(avg_value, 30, 40)
        
        # 变异性评分 - 曲线计算 (越小越好：满分0，及格0.2)
        var_score = self.calculate_score_curve_smaller_better(variability, 0.2, 0)
        
        # 疲劳指数评分 - 高斯分布 (最优值1.0，及格范围0.8或1.2)
        # 取0.8和1.2中离1.0更远的作为及格边界
        fatigue_score = self.calculate_score_gaussian(fatigue_index, 1.0, 0.8)
        
        # 阶段总分 - 使用权重
        stage_score = (self.endurance_weights['avg_value'] * avg_score + 
                       self.endurance_weights['variability'] * var_score + 
                       self.endurance_weights['fatigue_index'] * fatigue_score)
        
        # 返回阶段得分和单项得分详情
        details = {
            'avg_score': avg_score,
            'var_score': var_score,
            'fatigue_score': fatigue_score
        }
        
        return stage_score, details
    
    def calculate_post_baseline_score(self, avg_value, variability):
        """
        计算后静息阶段得分
        :param avg_value: 平均值(μV)
        :param variability: 变异性
        :return: (阶段得分, 单项得分详情)
        """
        # 平均值评分 - 曲线计算 (越小越好：满分0μV，及格4μV)
        avg_score = self.calculate_score_curve_smaller_better(avg_value, 4, 0)
        
        # 变异性评分 - 曲线计算 (越小越好：满分0，及格0.2)
        var_score = self.calculate_score_curve_smaller_better(variability, 0.2, 0)
        
        # 阶段总分 - 使用权重
        stage_score = (self.post_baseline_weights['avg_value'] * avg_score + 
                       self.post_baseline_weights['variability'] * var_score)
        
        # 返回阶段得分和单项得分详情
        details = {
            'avg_score': avg_score,
            'var_score': var_score
        }
        
        return stage_score, details
    
    def calculate_total_score(self, pre_baseline_score, fast_twitch_score, tonic_score, endurance_score, post_baseline_score):
        """
        计算总评分（平均分）
        :param pre_baseline_score: 前静息阶段得分
        :param fast_twitch_score: 快肌纤维阶段得分
        :param tonic_score: 慢肌纤维阶段得分
        :param endurance_score: 耐力测试阶段得分
        :param post_baseline_score: 后静息阶段得分
        :return: 总评分
        """
        return (pre_baseline_score + fast_twitch_score + tonic_score + endurance_score + post_baseline_score) / 5
    
    # 注意：数据加载功能已移至 GlazerTestDataLoader 类
    # 请使用 GlazerTestDataLoader().load_test_data() 来加载测试数据
    
    def batch_calculate(self, test_data):
        """
        批量计算多组测试数据的得分
        :param test_data: 测试数据列表
        :return: 计算结果列表
        """
        results = []
        
        for data in test_data:
            # 计算各阶段得分（包含单项指标得分）
            pre_baseline_score, pre_baseline_details = self.calculate_pre_baseline_score(
                data['pre_baseline_avg'], data['pre_baseline_var']
            )
            
            fast_twitch_score, fast_twitch_details = self.calculate_fast_twitch_score(
                data['fast_twitch_max'], data['fast_twitch_rise'], data['fast_twitch_recovery']
            )
            
            tonic_score, tonic_details = self.calculate_tonic_score(
                data['tonic_avg'], data['tonic_rise'], data['tonic_recovery'], data['tonic_var']
            )
            
            endurance_score, endurance_details = self.calculate_endurance_score(
                data['endurance_avg'], data['endurance_var'], data['endurance_fatigue']
            )
            
            post_baseline_score, post_baseline_details = self.calculate_post_baseline_score(
                data['post_baseline_avg'], data['post_baseline_var']
            )
            
            # 计算总分
            total_score = self.calculate_total_score(
                pre_baseline_score, fast_twitch_score, tonic_score, 
                endurance_score, post_baseline_score
            )
            
            # 保存结果（使用各阶段计算方法返回的详细得分）
            result = {
                'case_id': data['case_id'],
                'pre_baseline_score': pre_baseline_score,
                'pre_baseline_details': pre_baseline_details,
                'fast_twitch_score': fast_twitch_score,
                'fast_twitch_details': fast_twitch_details,
                'tonic_score': tonic_score,
                'tonic_details': tonic_details,
                'endurance_score': endurance_score,
                'endurance_details': endurance_details,
                'post_baseline_score': post_baseline_score,
                'post_baseline_details': post_baseline_details,
                'total_score': total_score,
                'input_data': data
            }
            
            results.append(result)
            
        return results


def main():
    calculator = GlazerAssessmentCalculator()
    data_loader = GlazerTestDataLoader()
    
    print("===== Glazer评估批量计算器 =====\n")
    
    # 验证数据文件
    is_valid, message = data_loader.validate_data_file()
    if not is_valid:
        print(f"数据文件验证失败: {message}")
        return
    
    # 加载测试数据
    print("正在加载测试数据...")
    test_data = data_loader.load_test_data()
    
    if not test_data:
        print("错误：未能加载到有效的测试数据")
        return
    
    print(f"成功加载 {len(test_data)} 组测试数据\n")
    
    # 批量计算
    print("正在进行批量计算...")
    results = calculator.batch_calculate(test_data)
    
    # 输出结果
    print("\n===== 批量计算结果 =====\n")
    
    # 输出表头
    print(f"{'案例编号':<12} {'前静息':<8} {'快肌纤维':<10} {'慢肌纤维':<10} {'耐力测试':<10} {'后静息':<8} {'总评分':<8}")
    print("-" * 80)
    
    # 输出每个案例的结果
    for result in results:
        print(f"{result['case_id']:<12} "
              f"{result['pre_baseline_score']:<8.2f} "
              f"{result['fast_twitch_score']:<10.2f} "
              f"{result['tonic_score']:<10.2f} "
              f"{result['endurance_score']:<10.2f} "
              f"{result['post_baseline_score']:<8.2f} "
              f"{result['total_score']:<8.2f}")
    
    # 输出详细结果
    print("\n===== 详细计算结果 =====\n")
    
    for i, result in enumerate(results, 1):
        print(f"\n--- {result['case_id']} ---")
        data = result['input_data']
        
        print("输入数据:")
        print(f"  前静息: 平均值={data['pre_baseline_avg']:.2f}μV, 变异性={data['pre_baseline_var']:.2f}")
        print(f"  快肌纤维: 最大值={data['fast_twitch_max']:.2f}μV, 上升时间={data['fast_twitch_rise']:.2f}s, 恢复时间={data['fast_twitch_recovery']:.2f}s")
        print(f"  慢肌纤维: 平均值={data['tonic_avg']:.2f}μV, 上升时间={data['tonic_rise']:.2f}s, 恢复时间={data['tonic_recovery']:.2f}s, 变异性={data['tonic_var']:.2f}")
        print(f"  耐力测试: 平均值={data['endurance_avg']:.2f}μV, 变异性={data['endurance_var']:.2f}, 疲劳指数={data['endurance_fatigue']:.2f}")
        print(f"  后静息: 平均值={data['post_baseline_avg']:.2f}μV, 变异性={data['post_baseline_var']:.2f}")
        
        print("计算结果:")
        print(f"  前静息阶段得分: {result['pre_baseline_score']:.2f}")
        print(f"    - 平均值得分: {result['pre_baseline_details']['avg_score']:.2f}")
        print(f"    - 变异系数得分: {result['pre_baseline_details']['var_score']:.2f}")
        
        print(f"  快肌纤维阶段得分: {result['fast_twitch_score']:.2f}")
        print(f"    - 最大值得分: {result['fast_twitch_details']['max_score']:.2f}")
        print(f"    - 上升时间得分: {result['fast_twitch_details']['rise_score']:.2f}")
        print(f"    - 恢复时间得分: {result['fast_twitch_details']['recovery_score']:.2f}")
        
        print(f"  慢肌纤维阶段得分: {result['tonic_score']:.2f}")
        print(f"    - 平均值得分: {result['tonic_details']['avg_score']:.2f}")
        print(f"    - 上升时间得分: {result['tonic_details']['rise_score']:.2f}")
        print(f"    - 恢复时间得分: {result['tonic_details']['recovery_score']:.2f}")
        print(f"    - 变异系数得分: {result['tonic_details']['var_score']:.2f}")
        
        print(f"  耐力测试阶段得分: {result['endurance_score']:.2f}")
        print(f"    - 平均值得分: {result['endurance_details']['avg_score']:.2f}")
        print(f"    - 变异系数得分: {result['endurance_details']['var_score']:.2f}")
        print(f"    - 疲劳指数得分: {result['endurance_details']['fatigue_score']:.2f}")
        
        print(f"  后静息阶段得分: {result['post_baseline_score']:.2f}")
        print(f"    - 平均值得分: {result['post_baseline_details']['avg_score']:.2f}")
        print(f"    - 变异系数得分: {result['post_baseline_details']['var_score']:.2f}")
        
        print(f"  总评分: {result['total_score']:.2f}")
    
    # 统计信息
    total_scores = [result['total_score'] for result in results]
    print("\n===== 统计信息 =====\n")
    print(f"测试案例数量: {len(results)}")
    print(f"最高总分: {max(total_scores):.2f}")
    print(f"最低总分: {min(total_scores):.2f}")
    print(f"平均总分: {sum(total_scores)/len(total_scores):.2f}")


if __name__ == "__main__":
    main()