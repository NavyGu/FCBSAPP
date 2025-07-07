import pandas as pd
import numpy as np
from scipy.optimize import minimize
import math

class WeightDerivation:
    def __init__(self):
        # 从glazer_assessment_calculator.py复制的曲线计算函数
        pass
    
    def calculate_score_curve_smaller_better(self, value, pass_value, perfect_value):
        """计算"越小越好"型指标的曲线得分"""
        if value <= perfect_value:
            return 100
        else:
            ratio = (value - perfect_value) / (pass_value - perfect_value)
            score = 100 - 40 * (ratio ** 2)
            return max(0, min(100, score))
    
    def calculate_score_curve_larger_better(self, value, pass_value, perfect_value):
        """计算"越大越好"型指标的曲线得分"""
        if value >= perfect_value:
            return 100
        else:
            if value >= pass_value:
                ratio = (value - pass_value) / (perfect_value - pass_value)
                score = 60 + 40 * (ratio ** 0.5)
            else:
                ratio = value / pass_value
                score = 60 * ratio
            return max(0, min(100, score))
    
    def calculate_score_gaussian(self, value, optimal_value, pass_range):
        """计算高斯分布型指标的得分"""
        deviation = abs(value - optimal_value)
        pass_deviation = abs(pass_range - optimal_value)
        
        if deviation == 0:
            return 100
        else:
            ratio = deviation / pass_deviation
            score = 100 - 40 * (ratio ** 2)
            return max(0, min(100, score))
    
    def load_data(self, csv_file):
        """加载CSV数据"""
        # 读取CSV文件，第一列为指标名称，其余列为样本数据
        df = pd.read_csv(csv_file, header=None, sep=' ')
        
        # 提取数据
        data = {}
        for i, row in df.iterrows():
            indicator_name = row[0]
            values = [float(x) for x in row[1:] if pd.notna(x)]
            data[indicator_name] = values
        
        return data
    
    def calculate_individual_scores(self, data):
        """计算每个指标的单项得分"""
        scores = {}
        
        # 前静息阶段指标得分
        scores['pre_avg'] = [self.calculate_score_curve_smaller_better(v, 4, 0) for v in data['前静息平均值(μV)']]
        scores['pre_var'] = [self.calculate_score_curve_smaller_better(v, 0.2, 0) for v in data['前静息变异性']]
        
        # 快肌纤维阶段指标得分
        scores['fast_max'] = [self.calculate_score_curve_larger_better(v, 40, 60) for v in data['快肌纤维最大值(μV)']]
        scores['fast_rise'] = [self.calculate_score_curve_smaller_better(v, 0.5, 0) for v in data['快肌纤维上升时间(s)']]
        scores['fast_recovery'] = [self.calculate_score_curve_smaller_better(v, 0.5, 0) for v in data['快肌纤维恢复时间(s)']]
        
        # 慢肌纤维阶段指标得分
        scores['tonic_avg'] = [self.calculate_score_curve_larger_better(v, 35, 45) for v in data['慢肌纤维平均值(μV)']]
        scores['tonic_rise'] = [self.calculate_score_curve_smaller_better(v, 1, 0) for v in data['慢肌纤维上升时间(s)']]
        scores['tonic_recovery'] = [self.calculate_score_curve_smaller_better(v, 1, 0) for v in data['慢肌纤维恢复时间(s)']]
        scores['tonic_var'] = [self.calculate_score_curve_smaller_better(v, 0.2, 0) for v in data['慢肌纤维变异性']]
        
        # 耐力测试阶段指标得分
        scores['endurance_avg'] = [self.calculate_score_curve_larger_better(v, 30, 40) for v in data['耐力测试平均值(μV)']]
        scores['endurance_var'] = [self.calculate_score_curve_smaller_better(v, 0.2, 0) for v in data['耐力测试变异性']]
        scores['endurance_fatigue'] = [self.calculate_score_gaussian(v, 1.0, 0.8) for v in data['耐力测试后10秒比值']]
        
        # 后静息阶段指标得分
        scores['post_avg'] = [self.calculate_score_curve_smaller_better(v, 4, 0) for v in data['后静息平均值(μV)']]
        scores['post_var'] = [self.calculate_score_curve_smaller_better(v, 0.2, 0) for v in data['后静息变异性']]
        
        return scores
    
    def derive_weights_for_stage(self, individual_scores, target_scores, stage_indicators):
        """为单个阶段推导权重"""
        def objective(weights):
            # 确保权重和为1
            weights = np.array(weights) / np.sum(weights)
            
            total_error = 0
            for i in range(len(target_scores)):
                predicted_score = sum(weights[j] * individual_scores[stage_indicators[j]][i] 
                                    for j in range(len(stage_indicators)))
                error = (predicted_score - target_scores[i]) ** 2
                total_error += error
            
            return total_error
        
        # 初始权重（均匀分布）
        initial_weights = [1.0 / len(stage_indicators)] * len(stage_indicators)
        
        # 约束条件：权重非负且和为1
        constraints = {'type': 'eq', 'fun': lambda w: np.sum(w) - 1}
        bounds = [(0, 1) for _ in range(len(stage_indicators))]
        
        # 优化
        result = minimize(objective, initial_weights, method='SLSQP', 
                         bounds=bounds, constraints=constraints)
        
        return result.x / np.sum(result.x)  # 确保权重和为1
    
    def derive_all_weights(self, csv_file):
        """推导所有阶段的权重"""
        # 加载数据
        data = self.load_data(csv_file)
        
        # 计算各指标单项得分
        individual_scores = self.calculate_individual_scores(data)
        
        # 提取各阶段目标得分
        target_scores = {
            'pre_baseline': data['前静息阶段得分'],
            'fast_twitch': data['快肌纤维阶段得分'],
            'tonic': data['慢肌纤维阶段得分'],
            'endurance': data['耐力测试阶段得分'],
            'post_baseline': data['后静息阶段得分']
        }
        
        # 推导各阶段权重
        weights_result = {}
        
        # 前静息阶段权重
        pre_indicators = ['pre_avg', 'pre_var']
        weights_result['pre_baseline'] = self.derive_weights_for_stage(
            individual_scores, target_scores['pre_baseline'], pre_indicators)
        
        # 快肌纤维阶段权重
        fast_indicators = ['fast_max', 'fast_rise', 'fast_recovery']
        weights_result['fast_twitch'] = self.derive_weights_for_stage(
            individual_scores, target_scores['fast_twitch'], fast_indicators)
        
        # 慢肌纤维阶段权重
        tonic_indicators = ['tonic_avg', 'tonic_rise', 'tonic_recovery', 'tonic_var']
        weights_result['tonic'] = self.derive_weights_for_stage(
            individual_scores, target_scores['tonic'], tonic_indicators)
        
        # 耐力测试阶段权重
        endurance_indicators = ['endurance_avg', 'endurance_var', 'endurance_fatigue']
        weights_result['endurance'] = self.derive_weights_for_stage(
            individual_scores, target_scores['endurance'], endurance_indicators)
        
        # 后静息阶段权重
        post_indicators = ['post_avg', 'post_var']
        weights_result['post_baseline'] = self.derive_weights_for_stage(
            individual_scores, target_scores['post_baseline'], post_indicators)
        
        return weights_result, individual_scores, target_scores
    
    def print_results(self, weights_result):
        """打印权重结果"""
        print("=== Glazer评估各阶段权重推导结果 ===")
        print()
        
        print("前静息阶段权重:")
        print(f"  平均值权重: {weights_result['pre_baseline'][0]:.4f}")
        print(f"  变异性权重: {weights_result['pre_baseline'][1]:.4f}")
        print()
        
        print("快肌纤维阶段权重:")
        print(f"  最大值权重: {weights_result['fast_twitch'][0]:.4f}")
        print(f"  上升时间权重: {weights_result['fast_twitch'][1]:.4f}")
        print(f"  恢复时间权重: {weights_result['fast_twitch'][2]:.4f}")
        print()
        
        print("慢肌纤维阶段权重:")
        print(f"  平均值权重: {weights_result['tonic'][0]:.4f}")
        print(f"  上升时间权重: {weights_result['tonic'][1]:.4f}")
        print(f"  恢复时间权重: {weights_result['tonic'][2]:.4f}")
        print(f"  变异性权重: {weights_result['tonic'][3]:.4f}")
        print()
        
        print("耐力测试阶段权重:")
        print(f"  平均值权重: {weights_result['endurance'][0]:.4f}")
        print(f"  变异性权重: {weights_result['endurance'][1]:.4f}")
        print(f"  疲劳指数权重: {weights_result['endurance'][2]:.4f}")
        print()
        
        print("后静息阶段权重:")
        print(f"  平均值权重: {weights_result['post_baseline'][0]:.4f}")
        print(f"  变异性权重: {weights_result['post_baseline'][1]:.4f}")
        print()
    
    def validate_results(self, weights_result, individual_scores, target_scores):
        """验证推导结果的准确性"""
        print("=== 权重验证结果 ===")
        print()
        
        stages = {
            'pre_baseline': (['pre_avg', 'pre_var'], '前静息阶段'),
            'fast_twitch': (['fast_max', 'fast_rise', 'fast_recovery'], '快肌纤维阶段'),
            'tonic': (['tonic_avg', 'tonic_rise', 'tonic_recovery', 'tonic_var'], '慢肌纤维阶段'),
            'endurance': (['endurance_avg', 'endurance_var', 'endurance_fatigue'], '耐力测试阶段'),
            'post_baseline': (['post_avg', 'post_var'], '后静息阶段')
        }
        
        for stage_key, (indicators, stage_name) in stages.items():
            weights = weights_result[stage_key]
            target = target_scores[stage_key]
            
            print(f"{stage_name}验证:")
            total_error = 0
            
            for i in range(len(target)):
                predicted = sum(weights[j] * individual_scores[indicators[j]][i] 
                              for j in range(len(indicators)))
                error = abs(predicted - target[i])
                total_error += error
                print(f"  样本{i+1}: 目标={target[i]:.2f}, 预测={predicted:.2f}, 误差={error:.2f}")
            
            avg_error = total_error / len(target)
            print(f"  平均误差: {avg_error:.2f}")
            print()

if __name__ == "__main__":
    # 创建权重推导实例
    derivation = WeightDerivation()
    
    # 推导权重
    csv_file = "/Users/gunavy/Project/TRAE/FCBSAPP/报告公式计算分析/glazer_assessment_reports.csv"
    weights_result, individual_scores, target_scores = derivation.derive_all_weights(csv_file)
    
    # 打印结果
    derivation.print_results(weights_result)
    
    # 验证结果
    derivation.validate_results(weights_result, individual_scores, target_scores)