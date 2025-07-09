#!/usr/bin/env python3
# -*- coding: utf-8 -*-

from glazer_assessment_calculator import GlazerAssessmentCalculator
from glazer_recommendation_system_weighted import GlazerRecommendationSystemWeighted
from glazer_test_data_loader import GlazerTestDataLoader

def test_basic_data():
    """测试基础数据文件中的评估案例"""
    
    # 1. 使用测试数据加载器加载数据
    data_loader = GlazerTestDataLoader()
    
    # 验证数据文件
    is_valid, message = data_loader.validate_data_file()
    if not is_valid:
        print(f"数据文件验证失败: {message}")
        return
    
    # 加载测试数据
    test_cases = data_loader.load_test_data()
    if not test_cases:
        print("错误：未能加载到有效的测试数据")
        return
    
    # 2. 初始化评估计算器
    calculator = GlazerAssessmentCalculator()
    
    # 3. 初始化推荐系统
    recommender = GlazerRecommendationSystemWeighted()
    
    print("=" * 60)
    print("Glazer盆底肌评估系统 - 基础数据测试验证")
    print("=" * 60)
    
    # 阶段名称映射
    stage_names = {
        'pre_baseline': '前静息',
        'fast_twitch': '快肌纤维', 
        'tonic': '慢肌纤维',
        'endurance': '耐力测试',
        'post_baseline': '后静息'
    }
    
    for i, case in enumerate(test_cases, 1):
        print(f"\n【{case['case_id']}】")
        print("-" * 40)
        
        try:
            # 2. 使用评估计算器获得评估打分明细
            data = case  # 直接使用case，因为它已经是正确的数据格式
            
            # 计算各阶段得分（现在返回元组：得分和详情）
            pre_baseline_score, pre_baseline_details = calculator.calculate_pre_baseline_score(
                data['pre_baseline_avg'], data['pre_baseline_var']
            )
            
            fast_twitch_score, fast_twitch_details = calculator.calculate_fast_twitch_score(
                data['fast_twitch_max'], data['fast_twitch_rise'], data['fast_twitch_recovery']
            )
            
            tonic_score, tonic_details = calculator.calculate_tonic_score(
                data['tonic_avg'], data['tonic_rise'], data['tonic_recovery'], data['tonic_var']
            )
            
            endurance_score, endurance_details = calculator.calculate_endurance_score(
                data['endurance_avg'], data['endurance_var'], data['endurance_fatigue']
            )
            
            post_baseline_score, post_baseline_details = calculator.calculate_post_baseline_score(
                data['post_baseline_avg'], data['post_baseline_var']
            )
            
            # 计算总分
            total_score = calculator.calculate_total_score(
                pre_baseline_score, fast_twitch_score, tonic_score, 
                endurance_score, post_baseline_score
            )
            
            # 3. 使用推荐系统进行分析建议
            # 封装完整的评估数据（包含阶段总得分、详细得分和最终总得分）
            comprehensive_assessment_data = {
                # 各阶段总得分
                'stage_scores': {
                    'pre_baseline': pre_baseline_score,
                    'fast_twitch': fast_twitch_score,
                    'tonic': tonic_score,
                    'endurance': endurance_score,
                    'post_baseline': post_baseline_score
                },
                # 各阶段详细指标得分
                'stage_indicator_scores': {
                    'pre_baseline': {
                        'avg_score': pre_baseline_details['avg_score'],
                        'var_score': pre_baseline_details['var_score']
                    },
                    'fast_twitch': {
                        'max_score': fast_twitch_details['max_score'],
                        'rise_time_score': fast_twitch_details['rise_score'],
                        'recovery_time_score': fast_twitch_details['recovery_score']
                    },
                    'tonic': {
                        'avg_score': tonic_details['avg_score'],
                        'rise_score': tonic_details['rise_score'],
                        'recovery_score': tonic_details['recovery_score'],
                        'var_score': tonic_details['var_score']
                    },
                    'endurance': {
                        'avg_score': endurance_details['avg_score'],
                        'var_score': endurance_details['var_score'],
                        'fatigue_score': endurance_details['fatigue_score']
                    },
                    'post_baseline': {
                        'avg_score': post_baseline_details['avg_score'],
                        'var_score': post_baseline_details['var_score']
                    }
                },
                # 最终总得分
                'total_score': total_score,
                # 原始输入数据（用于参考）
                'input_data': data
            }
            
            # 生成综合分析报告（传递完整的评估数据）
            comprehensive_report = recommender.generate_comprehensive_analysis(comprehensive_assessment_data)
            
            # 4. 输出案例的所有打分明细和总分信息并输出推荐建议
            print(f"总分: {total_score:.1f}分")
            
            print("\n各阶段得分明细:")
            for stage, score in comprehensive_assessment_data['stage_scores'].items():
                weight_category = recommender.get_stage_weight_category(stage)
                level = recommender.get_score_level_by_weight(score, weight_category)
                level_name = recommender.get_level_name_chinese(level)
                print(f"  {stage_names.get(stage, stage)}: {score:.1f}分 ({level_name})")
            
            # 输出优势区域
            if comprehensive_report['strengths_summary']:
                print("\n=== 优势区域 ===")
                for strength in comprehensive_report['strengths_summary'][:3]:  # 显示前3个优势
                    print(f"- {strength}")
            
            # 输出改进建议（按优先级排序）
            if comprehensive_report['priority_improvements']:
                print("\n=== 优先改进建议（按重要性排序）===")
                for idx, improvement in enumerate(comprehensive_report['priority_improvements'][:5], 1):
                    stage_name = stage_names.get(improvement['stage'], improvement['stage'])
                    print(f"{idx}. {stage_name} - {improvement['evaluation']}")
                    if improvement['recommendations']:
                        print(f"   建议: {'; '.join(improvement['recommendations'][:2])}")
            

            
        except Exception as e:
            print(f"评估出错: {str(e)}")
    
    print("\n" + "=" * 60)
    print("测试完成")
    print("=" * 60)

if __name__ == "__main__":
    test_basic_data()