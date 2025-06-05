#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""
Glazer评估计算器
用于计算盆底肌Glazer评估的各项指标得分
"""

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
            'avg_value': 0.7,     # 平均值权重高，因为静息状态下的基础肌电水平是关键指标，直接反映肌肉的基础张力
            'variability': 0.3    # 变异性权重低，作为辅助指标，反映肌肉在静息状态下的稳定性
        }
        
        self.fast_twitch_weights = {
            'max_value': 0.5,      # 最大值权重最高，直接反映快肌纤维的最大收缩能力，是该阶段最核心的指标
            'rise_time': 0.3,      # 上升时间权重次之，反映收缩速度，是快肌纤维功能的重要特征
            'recovery_time': 0.2   # 恢复时间权重最低，虽然也反映肌肉功能，但在快肌评估中相对次要
        }
        
        self.tonic_weights = {
            'avg_value': 0.4,       # 平均值权重最高，反映慢肌纤维的持续收缩能力，是该阶段的核心指标
            'rise_time': 0.25,      # 上升时间权重中等，反映慢肌收缩过程的特性
            'recovery_time': 0.25,  # 恢复时间权重中等，与上升时间同等重要，共同反映完整的收缩-放松周期
            'variability': 0.1      # 变异性权重最低，作为辅助指标，反映持续收缩过程中的稳定性
        }
        
        self.endurance_weights = {
            'avg_value': 0.45,       # 平均值权重最高，直接反映耐力测试中的整体表现水平
            'variability': 0.15,     # 变异性权重最低，作为辅助指标，反映长时间收缩过程中的稳定性
            'fatigue_index': 0.4     # 疲劳指数权重较高，是评估耐力特性的核心指标，直接反映肌肉抗疲劳能力
        }
        
        # 后静息阶段与前静息阶段使用相同的权重
        self.post_baseline_weights = self.pre_baseline_weights  # 后静息与前静息评估方法相同，但关注点在于运动后肌肉恢复到基线状态的能力
    
    def calculate_pre_baseline_score(self, avg_value, variability):
        """
        计算前静息阶段得分
        :param avg_value: 平均值(μV)
        :param variability: 变异性
        :return: 阶段得分
        """
        # 平均值评分 - 线性计算 (0-16μV映射到100-0分)
        avg_score = max(0, min(100, 100 - (avg_value * 100 / 16)))
        
        # 变异性评分 - 线性计算 (0-0.8映射到100-0分)
        var_score = max(0, min(100, 100 - (variability * 100 / 0.8)))
        
        # 阶段总分 - 使用权重
        return (self.pre_baseline_weights['avg_value'] * avg_score + 
                self.pre_baseline_weights['variability'] * var_score)
    
    def calculate_fast_twitch_score(self, max_value, rise_time, recovery_time):
        """
        计算快肌纤维阶段得分
        :param max_value: 最大值(μV)
        :param rise_time: 上升时间(s)
        :param recovery_time: 恢复时间(s)
        :return: 阶段得分
        """
        # 最大值评分 - 线性计算 (0-40μV映射到0-100分)
        max_score = max(0, min(100, max_value * 100 / 40))
        
        # 上升时间评分 - 线性计算 (0-2.0s映射到100-0分)
        rise_score = max(0, min(100, 100 - (rise_time * 100 / 2.0)))
        
        # 恢复时间评分 - 线性计算 (0-2.0s映射到100-0分)
        recovery_score = max(0, min(100, 100 - (recovery_time * 100 / 2.0)))
        
        # 阶段总分 - 使用权重
        return (self.fast_twitch_weights['max_value'] * max_score + 
                self.fast_twitch_weights['rise_time'] * rise_score + 
                self.fast_twitch_weights['recovery_time'] * recovery_score)
    
    def calculate_tonic_score(self, avg_value, rise_time, recovery_time, variability):
        """
        计算慢肌纤维阶段得分
        :param avg_value: 平均值(μV)
        :param rise_time: 上升时间(s)
        :param recovery_time: 恢复时间(s)
        :param variability: 变异性
        :return: 阶段得分
        """
        # 平均值评分 - 线性计算 (0-35μV映射到0-100分)
        avg_score = max(0, min(100, avg_value * 100 / 35))
        
        # 上升时间评分 - 线性计算 (0-4.0s映射到100-0分)
        rise_score = max(0, min(100, 100 - (rise_time * 100 / 4.0)))
        
        # 恢复时间评分 - 线性计算 (0-4.0s映射到100-0分)
        recovery_score = max(0, min(100, 100 - (recovery_time * 100 / 4.0)))
        
        # 变异性评分 - 线性计算 (0-0.8映射到100-0分)
        var_score = max(0, min(100, 100 - (variability * 100 / 0.8)))
        
        # 阶段总分 - 使用权重
        return (self.tonic_weights['avg_value'] * avg_score + 
                self.tonic_weights['rise_time'] * rise_score + 
                self.tonic_weights['recovery_time'] * recovery_score + 
                self.tonic_weights['variability'] * var_score)
    
    def calculate_endurance_score(self, avg_value, variability, fatigue_index):
        """
        计算耐力测试阶段得分
        :param avg_value: 平均值(μV)
        :param variability: 变异性
        :param fatigue_index: 疲劳指数
        :return: 阶段得分
        """
        # 平均值评分 - 线性计算 (0-30μV映射到0-100分)
        avg_score = max(0, min(100, avg_value * 100 / 30))
        
        # 变异性评分 - 线性计算 (0-0.8映射到100-0分)
        var_score = max(0, min(100, 100 - (variability * 100 / 0.8)))
        
        # 疲劳指数评分 - 线性计算 (中心点为1.0，向两边递减)
        # 0.5-1.0映射到0-100分，1.0-1.5映射到100-0分
        if fatigue_index <= 1.0:
            fatigue_score = max(0, min(100, (fatigue_index - 0.5) * 200))
        else:
            fatigue_score = max(0, min(100, (1.5 - fatigue_index) * 200))
        
        # 阶段总分 - 使用权重
        return (self.endurance_weights['avg_value'] * avg_score + 
                self.endurance_weights['variability'] * var_score + 
                self.endurance_weights['fatigue_index'] * fatigue_score)
    
    def calculate_post_baseline_score(self, avg_value, variability):
        """
        计算后静息阶段得分
        :param avg_value: 平均值(μV)
        :param variability: 变异性
        :return: 阶段得分
        """
        # 平均值评分 - 线性计算 (0-16μV映射到100-0分)
        avg_score = max(0, min(100, 100 - (avg_value * 100 / 16)))
        
        # 变异性评分 - 线性计算 (0-0.8映射到100-0分)
        var_score = max(0, min(100, 100 - (variability * 100 / 0.8)))
        
        # 阶段总分 - 使用权重
        return (self.post_baseline_weights['avg_value'] * avg_score + 
                self.post_baseline_weights['variability'] * var_score)
    
    def calculate_total_score(self, pre_baseline_score, fast_twitch_score, tonic_score, endurance_score, post_baseline_score):
        """
        计算总评分
        :param pre_baseline_score: 前静息阶段得分
        :param fast_twitch_score: 快肌纤维阶段得分
        :param tonic_score: 慢肌纤维阶段得分
        :param endurance_score: 耐力测试阶段得分
        :param post_baseline_score: 后静息阶段得分
        :return: 总评分
        """
        return (self.weights['pre_baseline'] * pre_baseline_score +
                self.weights['fast_twitch'] * fast_twitch_score +
                self.weights['tonic'] * tonic_score +
                self.weights['endurance'] * endurance_score +
                self.weights['post_baseline'] * post_baseline_score)


def main():
    calculator = GlazerAssessmentCalculator()
    
    print("===== Glazer评估计算器 =====\n")
    
    # 获取用户输入
    print("请输入前静息阶段数据:")
    pre_avg = float(input("平均值(μV): "))
    pre_var = float(input("变异性: "))
    
    print("\n请输入快肌纤维阶段数据:")
    fast_max = float(input("最大值(μV): "))
    fast_rise = float(input("上升时间(s): "))
    fast_recovery = float(input("恢复时间(s): "))
    
    print("\n请输入慢肌纤维阶段数据:")
    tonic_avg = float(input("平均值(μV): "))
    tonic_rise = float(input("上升时间(s): "))
    tonic_recovery = float(input("恢复时间(s): "))
    tonic_var = float(input("变异性: "))
    
    print("\n请输入耐力测试阶段数据:")
    endurance_avg = float(input("平均值(μV): "))
    endurance_var = float(input("变异性: "))
    endurance_fatigue = float(input("疲劳指数: "))
    
    print("\n请输入后静息阶段数据:")
    post_avg = float(input("平均值(μV): "))
    post_var = float(input("变异性: "))
    
    # 计算各阶段得分
    pre_baseline_score = calculator.calculate_pre_baseline_score(pre_avg, pre_var)
    fast_twitch_score = calculator.calculate_fast_twitch_score(fast_max, fast_rise, fast_recovery)
    tonic_score = calculator.calculate_tonic_score(tonic_avg, tonic_rise, tonic_recovery, tonic_var)
    endurance_score = calculator.calculate_endurance_score(endurance_avg, endurance_var, endurance_fatigue)
    post_baseline_score = calculator.calculate_post_baseline_score(post_avg, post_var)
    
    # 计算总分
    total_score = calculator.calculate_total_score(
        pre_baseline_score, fast_twitch_score, tonic_score, endurance_score, post_baseline_score
    )
    
    # 输出结果
    print("\n===== 评估结果 =====")
    print(f"前静息阶段得分: {pre_baseline_score:.2f}")
    print(f"快肌纤维阶段得分: {fast_twitch_score:.2f}")
    print(f"慢肌纤维阶段得分: {tonic_score:.2f}")
    print(f"耐力测试阶段得分: {endurance_score:.2f}")
    print(f"后静息阶段得分: {post_baseline_score:.2f}")
    print(f"总评分: {total_score:.2f}")


if __name__ == "__main__":
    main()