# -*- coding: utf-8 -*-
"""
Glazer评估集成系统
整合评估计算和建议生成，提供完整的评估流程
"""

import os
import sys
import json
from typing import Dict, List, Tuple

# 导入其他模块
from glazer_assessment_calculator import GlazerAssessmentCalculator
from glazer_recommendation_system import GlazerRecommendationSystem

class GlazerIntegratedSystem:
    def __init__(self):
        self.calculator = GlazerAssessmentCalculator()
        self.recommender = GlazerRecommendationSystem()
    
    def process_single_assessment(self, raw_data: Dict) -> Dict:
        """
        处理单个用户的完整评估
        :param raw_data: 原始测量数据
        :return: 完整的评估结果和建议
        """
        # 1. 计算各阶段得分
        stage_scores = {}
        
        # 前静息阶段
        stage_scores['pre_baseline'] = self.calculator.calculate_pre_baseline_score(
            raw_data['pre_avg'], raw_data['pre_var']
        )
        
        # 快肌纤维阶段
        stage_scores['fast_twitch'] = self.calculator.calculate_fast_twitch_score(
            raw_data['fast_max'], raw_data['fast_rise'], raw_data['fast_recovery']
        )
        
        # 慢肌纤维阶段
        stage_scores['tonic'] = self.calculator.calculate_tonic_score(
            raw_data['tonic_avg'], raw_data['tonic_rise'], 
            raw_data['tonic_recovery'], raw_data['tonic_var']
        )
        
        # 耐力测试阶段
        stage_scores['endurance'] = self.calculator.calculate_endurance_score(
            raw_data['endurance_avg'], raw_data['endurance_var'], 
            raw_data['endurance_fatigue']
        )
        
        # 后静息阶段
        stage_scores['post_baseline'] = self.calculator.calculate_post_baseline_score(
            raw_data['post_avg'], raw_data['post_var']
        )
        
        # 2. 计算总分
        total_score = self.calculator.calculate_total_score(
            stage_scores['pre_baseline'], stage_scores['fast_twitch'],
            stage_scores['tonic'], stage_scores['endurance'], 
            stage_scores['post_baseline']
        )
        
        # 3. 生成建议报告
        recommendation_report = self.recommender.generate_comprehensive_report(
            stage_scores, raw_data
        )
        
        # 4. 整合结果
        integrated_result = {
            'user_data': raw_data,
            'stage_scores': stage_scores,
            'total_score': total_score,
            'recommendation_report': recommendation_report,
            'formatted_report': self.recommender.format_report_text(recommendation_report)
        }
        
        return integrated_result
    
    def process_batch_assessment(self, data_file: str) -> List[Dict]:
        """
        批量处理评估数据
        :param data_file: 数据文件路径
        :return: 批量评估结果
        """
        # 加载数据
        test_data = self.calculator.load_test_data(data_file)
        results = []
        
        for i, data in enumerate(test_data):
            print(f"处理第 {i+1} 个样本...")
            
            # 处理单个评估
            result = self.process_single_assessment(data)
            result['sample_id'] = i + 1
            results.append(result)
        
        return results
    
    def generate_comparison_report(self, results: List[Dict]) -> Dict:
        """
        生成批量评估的对比报告
        :param results: 批量评估结果
        :return: 对比分析报告
        """
        if not results:
            return {}
        
        # 统计各阶段得分分布
        stage_stats = {}
        stages = ['pre_baseline', 'fast_twitch', 'tonic', 'endurance', 'post_baseline']
        
        for stage in stages:
            scores = [r['stage_scores'][stage] for r in results]
            stage_stats[stage] = {
                'mean': sum(scores) / len(scores),
                'min': min(scores),
                'max': max(scores),
                'count_excellent': len([s for s in scores if s >= 85]),
                'count_good': len([s for s in scores if 70 <= s < 85]),
                'count_fair': len([s for s in scores if 60 <= s < 70]),
                'count_poor': len([s for s in scores if s < 60])
            }
        
        # 总分统计
        total_scores = [r['total_score'] for r in results]
        total_stats = {
            'mean': sum(total_scores) / len(total_scores),
            'min': min(total_scores),
            'max': max(total_scores),
            'count_excellent': len([s for s in total_scores if s >= 85]),
            'count_good': len([s for s in total_scores if 70 <= s < 85]),
            'count_fair': len([s for s in total_scores if 60 <= s < 70]),
            'count_poor': len([s for s in total_scores if s < 60])
        }
        
        # 常见问题统计
        common_issues = {}
        for result in results:
            analyses = result['recommendation_report']['detailed_analysis']
            for stage_key, analysis in analyses.items():
                for issue in analysis['issues']:
                    if issue not in common_issues:
                        common_issues[issue] = 0
                    common_issues[issue] += 1
        
        # 按频率排序
        sorted_issues = sorted(common_issues.items(), key=lambda x: x[1], reverse=True)
        
        return {
            'sample_count': len(results),
            'stage_statistics': stage_stats,
            'total_score_statistics': total_stats,
            'common_issues': sorted_issues[:10],  # 前10个最常见问题
            'distribution_summary': {
                'excellent_rate': total_stats['count_excellent'] / len(results),
                'good_rate': total_stats['count_good'] / len(results),
                'fair_rate': total_stats['count_fair'] / len(results),
                'poor_rate': total_stats['count_poor'] / len(results)
            }
        }
    
    def export_results(self, results: List[Dict], output_dir: str):
        """
        导出评估结果
        :param results: 评估结果列表
        :param output_dir: 输出目录
        """
        if not os.path.exists(output_dir):
            os.makedirs(output_dir)
        
        # 导出详细结果JSON
        with open(os.path.join(output_dir, 'detailed_results.json'), 'w', encoding='utf-8') as f:
            json.dump(results, f, ensure_ascii=False, indent=2)
        
        # 导出汇总CSV
        import csv
        csv_file = os.path.join(output_dir, 'summary_results.csv')
        with open(csv_file, 'w', newline='', encoding='utf-8') as f:
            writer = csv.writer(f)
            
            # 写入表头
            headers = ['样本ID', '总分', '前静息', '快肌纤维', '慢肌纤维', '耐力测试', '后静息', '等级']
            writer.writerow(headers)
            
            # 写入数据
            for result in results:
                row = [
                    result['sample_id'],
                    f"{result['total_score']:.2f}",
                    f"{result['stage_scores']['pre_baseline']:.2f}",
                    f"{result['stage_scores']['fast_twitch']:.2f}",
                    f"{result['stage_scores']['tonic']:.2f}",
                    f"{result['stage_scores']['endurance']:.2f}",
                    f"{result['stage_scores']['post_baseline']:.2f}",
                    result['recommendation_report']['overall_level']
                ]
                writer.writerow(row)
        
        # 导出个人报告
        reports_dir = os.path.join(output_dir, 'individual_reports')
        if not os.path.exists(reports_dir):
            os.makedirs(reports_dir)
        
        for result in results:
            report_file = os.path.join(reports_dir, f'report_sample_{result["sample_id"]}.txt')
            with open(report_file, 'w', encoding='utf-8') as f:
                f.write(result['formatted_report'])
        
        # 导出对比报告
        comparison_report = self.generate_comparison_report(results)
        with open(os.path.join(output_dir, 'comparison_report.json'), 'w', encoding='utf-8') as f:
            json.dump(comparison_report, f, ensure_ascii=False, indent=2)
        
        print(f"结果已导出到: {output_dir}")
        print(f"- 详细结果: detailed_results.json")
        print(f"- 汇总表格: summary_results.csv")
        print(f"- 个人报告: individual_reports/")
        print(f"- 对比分析: comparison_report.json")
    
    def interactive_assessment(self):
        """
        交互式评估界面
        """
        print("=== Glazer盆底肌评估系统 ===")
        print("请输入测量数据（输入 'quit' 退出）：")
        
        while True:
            try:
                print("\n--- 新的评估 ---")
                
                # 收集数据
                data = {}
                
                print("前静息阶段:")
                data['pre_avg'] = float(input("  平均值(μV): "))
                data['pre_var'] = float(input("  变异性: "))
                
                print("快肌纤维阶段:")
                data['fast_max'] = float(input("  最大值(μV): "))
                data['fast_rise'] = float(input("  上升时间(s): "))
                data['fast_recovery'] = float(input("  恢复时间(s): "))
                
                print("慢肌纤维阶段:")
                data['tonic_avg'] = float(input("  平均值(μV): "))
                data['tonic_rise'] = float(input("  上升时间(s): "))
                data['tonic_recovery'] = float(input("  恢复时间(s): "))
                data['tonic_var'] = float(input("  变异性: "))
                
                print("耐力测试阶段:")
                data['endurance_avg'] = float(input("  平均值(μV): "))
                data['endurance_var'] = float(input("  变异性: "))
                data['endurance_fatigue'] = float(input("  后10秒比值: "))
                
                print("后静息阶段:")
                data['post_avg'] = float(input("  平均值(μV): "))
                data['post_var'] = float(input("  变异性: "))
                
                # 处理评估
                result = self.process_single_assessment(data)
                
                # 显示结果
                print("\n" + "="*50)
                print(result['formatted_report'])
                print("="*50)
                
                # 询问是否继续
                continue_input = input("\n是否继续评估？(y/n): ").lower()
                if continue_input != 'y':
                    break
                    
            except KeyboardInterrupt:
                print("\n评估已中断")
                break
            except Exception as e:
                print(f"输入错误: {e}")
                print("请重新输入")

def main():
    """主函数"""
    system = GlazerIntegratedSystem()
    
    print("Glazer评估集成系统")
    print("1. 交互式评估")
    print("2. 批量处理")
    print("3. 示例演示")
    
    choice = input("请选择模式 (1/2/3): ")
    
    if choice == '1':
        system.interactive_assessment()
    
    elif choice == '2':
        data_file = input("请输入数据文件路径: ")
        if not os.path.exists(data_file):
            print(f"文件不存在: {data_file}")
            return
        
        output_dir = input("请输入输出目录 (默认: ./output): ") or "./output"
        
        print("开始批量处理...")
        results = system.process_batch_assessment(data_file)
        
        print("导出结果...")
        system.export_results(results, output_dir)
        
        print("批量处理完成！")
    
    elif choice == '3':
        # 示例演示
        print("\n=== 示例演示 ===")
        
        sample_data = {
            'pre_avg': 6.5,
            'pre_var': 0.25,
            'fast_max': 35.0,
            'fast_rise': 1.2,
            'fast_recovery': 0.8,
            'tonic_avg': 38.0,
            'tonic_rise': 0.8,
            'tonic_recovery': 1.1,
            'tonic_var': 0.28,
            'endurance_avg': 28.0,
            'endurance_var': 0.22,
            'endurance_fatigue': 0.85,
            'post_avg': 8.2,
            'post_var': 0.35
        }
        
        result = system.process_single_assessment(sample_data)
        print(result['formatted_report'])
    
    else:
        print("无效选择")

if __name__ == "__main__":
    main()