#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import sys
import os

# 添加训练方案目录到路径
sys.path.append('/Users/gunavy/Project/TRAE/FCBSAPP/训练方案')

from glazer_assessment_calculator import GlazerAssessmentCalculator
from glazer_recommendation_system_weighted import GlazerRecommendationSystemWeighted
from glazer_test_data_loader import GlazerTestDataLoader
from course_matcher import get_course_recommendations_from_assessment

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
        print(f"\n\n{'='*60}")
        print(f"【{case['case_id']}】评估报告")
        print(f"{'='*60}")
        
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
            print("\n=== Glazer肌电评估报告（基于权重优化版本）===\n")
            
            # 总体得分
            print(f"📊 **总体评估**")
            print(f"- 综合得分：{total_score:.1f}分\n")
            
            # 各阶段详细分析
            print("📋 **各阶段详细分析**")
            for stage, score in comprehensive_assessment_data['stage_scores'].items():
                weight_category = recommender.get_stage_weight_category(stage)
                level = recommender.get_score_level_by_weight(score, weight_category)
                level_name = recommender.get_level_name_chinese(level)
                stage_name = stage_names.get(stage, stage)
                
                # 获取阶段权重
                stage_weight = recommender.stage_importance[stage]
                weight_info = f"（权重：{stage_weight:.1f}，{weight_category}）"
                print(f"\n**{stage_name}阶段** {weight_info}")
                print(f"- 平均得分：{score:.1f}分 ({level_name})")
                
                # 输出各指标详细得分
                stage_details = comprehensive_assessment_data['stage_indicator_scores'][stage]
                if stage == 'pre_baseline':
                    avg_level = recommender.get_level_name_chinese(recommender.get_score_level_by_weight(stage_details['avg_score'], weight_category))
                    var_level = recommender.get_level_name_chinese(recommender.get_score_level_by_weight(stage_details['var_score'], weight_category))
                    print(f"  - 平均值：{stage_details['avg_score']:.1f}分 ({avg_level})")
                    print(f"  - 变异性：{stage_details['var_score']:.1f}分 ({var_level})")
                elif stage == 'fast_twitch':
                    max_level = recommender.get_level_name_chinese(recommender.get_score_level_by_weight(stage_details['max_score'], weight_category))
                    rise_level = recommender.get_level_name_chinese(recommender.get_score_level_by_weight(stage_details['rise_time_score'], weight_category))
                    recovery_level = recommender.get_level_name_chinese(recommender.get_score_level_by_weight(stage_details['recovery_time_score'], weight_category))
                    print(f"  - 最大收缩力：{stage_details['max_score']:.1f}分 ({max_level})")
                    print(f"  - 上升时间：{stage_details['rise_time_score']:.1f}分 ({rise_level})")
                    print(f"  - 恢复时间：{stage_details['recovery_time_score']:.1f}分 ({recovery_level})")
                elif stage == 'tonic':
                    avg_level = recommender.get_level_name_chinese(recommender.get_score_level_by_weight(stage_details['avg_score'], weight_category))
                    rise_level = recommender.get_level_name_chinese(recommender.get_score_level_by_weight(stage_details['rise_score'], weight_category))
                    recovery_level = recommender.get_level_name_chinese(recommender.get_score_level_by_weight(stage_details['recovery_score'], weight_category))
                    var_level = recommender.get_level_name_chinese(recommender.get_score_level_by_weight(stage_details['var_score'], weight_category))
                    print(f"  - 平均值：{stage_details['avg_score']:.1f}分 ({avg_level})")
                    print(f"  - 上升时间：{stage_details['rise_score']:.1f}分 ({rise_level})")
                    print(f"  - 恢复时间：{stage_details['recovery_score']:.1f}分 ({recovery_level})")
                    print(f"  - 变异性：{stage_details['var_score']:.1f}分 ({var_level})")
                elif stage == 'endurance':
                    avg_level = recommender.get_level_name_chinese(recommender.get_score_level_by_weight(stage_details['avg_score'], weight_category))
                    var_level = recommender.get_level_name_chinese(recommender.get_score_level_by_weight(stage_details['var_score'], weight_category))
                    fatigue_level = recommender.get_level_name_chinese(recommender.get_score_level_by_weight(stage_details['fatigue_score'], weight_category))
                    print(f"  - 平均值：{stage_details['avg_score']:.1f}分 ({avg_level})")
                    print(f"  - 变异性：{stage_details['var_score']:.1f}分 ({var_level})")
                    print(f"  - 疲劳指数：{stage_details['fatigue_score']:.1f}分 ({fatigue_level})")
                elif stage == 'post_baseline':
                    avg_level = recommender.get_level_name_chinese(recommender.get_score_level_by_weight(stage_details['avg_score'], weight_category))
                    var_level = recommender.get_level_name_chinese(recommender.get_score_level_by_weight(stage_details['var_score'], weight_category))
                    print(f"  - 平均值：{stage_details['avg_score']:.1f}分 ({avg_level})")
                    print(f"  - 变异性：{stage_details['var_score']:.1f}分 ({var_level})")
            
            # 输出优势区域
            if comprehensive_report['strengths_summary']:
                print("\n✅ **优势区域**")
                for strength in comprehensive_report['strengths_summary'][:5]:  # 显示前5个优势
                    print(f"- {strength['evaluation']} ({strength['level']})")
            
            # 输出改进建议（按优先级排序）
            if comprehensive_report['priority_improvements']:
                print("\n⚠️ **优先改进建议**（按重要性排序）")
                for i, improvement in enumerate(comprehensive_report['priority_improvements'][:3], 1):
                    stage_name = stage_names.get(improvement['stage'], improvement['stage'])
                    print(f"\n{i}. **{stage_name}** (权重: {improvement['stage_weight']:.1f})")
                    print(f"   问题：{improvement['evaluation']}")
                    if improvement['recommendations']:
                        print(f"   建议：{', '.join(improvement['recommendations'][:2])}")
            
            # 使用新的智能课程推荐系统
            # 构建用户基本信息（可以根据实际情况调整）
            user_basic_info = {
                'age': 30,  # 可以根据案例调整
                'gender': '女性',
                'height': 165.0,
                'weight': 60.0,
                'birth_history': '产后',
                'surgery_history': '无',
                'menopause_status': '未绝经',
                'main_symptoms': '盆底功能障碍'  # 可以根据评估结果推断
            }
            
            # 获取智能课程推荐
            try:
                recommended_courses = get_course_recommendations_from_assessment(
                    comprehensive_assessment_data, user_basic_info
                )
                
                if recommended_courses:
                    print("\n🎯 **智能课程推荐**（基于Glazer权重匹配）")
                    for course in recommended_courses[:3]:
                        print(f"- **{course['name']}** ({course['priority']}优先级)")
                        print(f"  {course['description']}")
                        print(f"  建议：{course['duration']}，{course['frequency']}")
                        if course['match_reasons']:
                            print(f"  匹配原因：{', '.join(course['match_reasons'])}")
                        print()
                else:
                    print("\n🎯 **智能课程推荐**")
                    print("暂无合适的课程推荐，建议咨询专业医师制定个性化方案。")
            except Exception as e:
                print(f"\n⚠️ 课程推荐系统暂时不可用: {e}")
                # 回退到原有推荐系统
                if comprehensive_report['course_recommendations']['recommended_courses']:
                    print("\n🎯 **推荐课程**（备用推荐）")
                    for course in comprehensive_report['course_recommendations']['recommended_courses'][:3]:
                        print(f"- **{course['name']}** ({course['priority']}优先级)")
                        print(f"  {course['description']}")
                        print(f"  建议：{course['duration']}，{course['frequency']}\n")
            

            

            
        except Exception as e:
            print(f"评估出错: {str(e)}")
    
    print("\n" + "=" * 60)
    print("测试完成")
    print("=" * 60)

if __name__ == "__main__":
    test_basic_data()