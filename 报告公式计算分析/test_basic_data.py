#!/usr/bin/env python3
# -*- coding: utf-8 -*-

from glazer_integrated_system import GlazerIntegratedSystem

def test_basic_data():
    """测试基础数据文件中的评估案例"""
    system = GlazerIntegratedSystem()
    
    # 基础数据文件中的测试案例
    test_cases = [
        {
            'name': '测试案例1 - 快肌纤维优秀但静息问题',
            'data': {
                'pre_avg': 8.46, 'pre_var': 0.2,
                'fast_max': 94.61, 'fast_rise': 0.4, 'fast_recovery': 0.18,
                'tonic_avg': 33.8, 'tonic_rise': 0.15, 'tonic_recovery': 0.49, 'tonic_var': 0.32,
                'endurance_avg': 32.84, 'endurance_var': 0.36, 'endurance_fatigue': 0.99,
                'post_avg': 8.82, 'post_var': 0.53
            }
        },
        {
            'name': '测试案例2 - 整体功能较差',
            'data': {
                'pre_avg': 5.34, 'pre_var': 0.18,
                'fast_max': 7.03, 'fast_rise': 1.62, 'fast_recovery': 3.22,
                'tonic_avg': 5.35, 'tonic_rise': 2, 'tonic_recovery': 4, 'tonic_var': 0.17,
                'endurance_avg': 10.45, 'endurance_var': 0.47, 'endurance_fatigue': 1.03,
                'post_avg': 10.36, 'post_var': 0.47
            }
        },
        {
            'name': '测试案例3 - 中等水平',
            'data': {
                'pre_avg': 6.27, 'pre_var': 0.16,
                'fast_max': 9.14, 'fast_rise': 2, 'fast_recovery': 4,
                'tonic_avg': 6.12, 'tonic_rise': 2, 'tonic_recovery': 4, 'tonic_var': 0.13,
                'endurance_avg': 6.2, 'endurance_var': 0.16, 'endurance_fatigue': 1.01,
                'post_avg': 6.23, 'post_var': 0.15
            }
        },
        {
            'name': '测试案例4 - 基础较好',
            'data': {
                'pre_avg': 5.22, 'pre_var': 0.17,
                'fast_max': 6.83, 'fast_rise': 2, 'fast_recovery': 4,
                'tonic_avg': 5.29, 'tonic_rise': 2, 'tonic_recovery': 4, 'tonic_var': 0.16,
                'endurance_avg': 5.29, 'endurance_var': 0.17, 'endurance_fatigue': 1.0,
                'post_avg': 5.29, 'post_var': 0.19
            }
        },
        {
            'name': '测试案例5 - 异常高值',
            'data': {
                'pre_avg': 108.37, 'pre_var': 2.82,
                'fast_max': 104.15, 'fast_rise': 0.36, 'fast_recovery': 0.13,
                'tonic_avg': 43.02, 'tonic_rise': 2, 'tonic_recovery': 4, 'tonic_var': 0.09,
                'endurance_avg': 40.66, 'endurance_var': 0.03, 'endurance_fatigue': 1.04,
                'post_avg': 104.25, 'post_var': 0.11
            }
        }
    ]
    
    print("=" * 60)
    print("Glazer盆底肌评估系统 - 基础数据测试验证")
    print("=" * 60)
    
    for i, case in enumerate(test_cases, 1):
        print(f"\n【{case['name']}】")
        print("-" * 40)
        
        try:
            result = system.process_single_assessment(case['data'])
            
            # 输出核心评估结果
            total_score = result['recommendation_report']['total_score']
            overall_level = result['recommendation_report']['overall_level']
            print(f"总分: {total_score:.1f}分 ({overall_level})")
            
            print("\n各阶段得分:")
            stage_names = {
                'pre_baseline': '前静息',
                'fast_twitch': '快肌纤维', 
                'tonic': '慢肌纤维',
                'endurance': '耐力测试',
                'post_baseline': '后静息'
            }
            
            for stage, score in result['stage_scores'].items():
                grade = system.recommender.get_score_level(score)
                print(f"  {stage_names.get(stage, stage)}: {score:.1f}分 ({grade})")
            
            # 输出按重要性排序的分阶段分析和建议
            print("\n=== 分阶段问题分析与建议（按重要性排序）===")
            
            # 计算各阶段的重要性权重得分
            stage_priority = []
            
            # 键名映射：detailed_analysis的键 -> stage_scores的键
            stage_key_mapping = {
                'pre_baseline': 'pre_baseline',
                'post_baseline': 'post_baseline',
                'fast_twitch': 'fast_twitch',
                'tonic': 'tonic', 
                'endurance': 'endurance'
            }
            
            # 直接遍历detailed_analysis，避免重复
            for analysis_key, analysis in result['recommendation_report']['detailed_analysis'].items():
                # 获取对应的stage_scores键
                stage_key = stage_key_mapping.get(analysis_key, analysis_key)
                if stage_key in result['stage_scores']:
                    stage_score = result['stage_scores'][stage_key]
                    importance_weight = system.recommender.stage_importance.get(stage_key, 0.1)
                    priority_score = importance_weight * (100 - stage_score) / 100
                    stage_priority.append({
                        'stage': stage_key,
                        'priority_score': priority_score,
                        'analysis': analysis,
                        'score': stage_score
                    })
            
            # 按重要性排序（优先级从高到低）
            stage_priority.sort(key=lambda x: x['priority_score'], reverse=True)
            
            # 输出所有阶段分析和建议
            for idx, item in enumerate(stage_priority, 1):
                stage_name = stage_names.get(item['stage'], item['stage'])
                analysis = item['analysis']
                score = item['score']
                level = system.recommender.get_score_level(score)
                
                print(f"\n{idx}. {stage_name}（{score:.1f}分 - {level}）")
                
                # 根据得分等级给出不同的分析和建议
                if score >= 85:  # excellent
                    if analysis['issues']:
                        print(f"   分析：{'; '.join(analysis['issues'][:2])}")
                    else:
                        print(f"   分析：该阶段表现优秀，肌肉功能状态良好")
                    
                    if analysis['recommendations']:
                        print(f"   建议：{'; '.join(analysis['recommendations'][:2])}")
                    else:
                        print(f"   建议：继续保持当前训练强度，定期进行维持性训练")
                        
                elif score >= 70:  # good
                    if analysis['issues']:
                        print(f"   分析：{'; '.join(analysis['issues'][:2])}")
                    else:
                        print(f"   分析：该阶段表现良好，具备进一步提升的潜力")
                    
                    if analysis['recommendations']:
                        print(f"   建议：{'; '.join(analysis['recommendations'][:2])}")
                    else:
                        print(f"   建议：适当增加训练强度，向优秀水平迈进")
                        
                elif score >= 60:  # fair
                    if analysis['issues']:
                        print(f"   分析：{'; '.join(analysis['issues'][:2])}")
                    else:
                        print(f"   分析：该阶段表现中等，有明显改善空间")
                    
                    if analysis['recommendations']:
                        print(f"   建议：{'; '.join(analysis['recommendations'][:2])}")
                    else:
                        print(f"   建议：加强针对性训练，重点提升该阶段功能")
                        
                else:  # poor or very_poor
                    if analysis['issues']:
                        print(f"   分析：{'; '.join(analysis['issues'][:2])}")
                    else:
                        print(f"   分析：该阶段需要重点关注和改善")
                    
                    if analysis['recommendations']:
                        print(f"   建议：{'; '.join(analysis['recommendations'][:2])}")
                    else:
                        print(f"   建议：制定专门的训练计划，循序渐进地改善功能")
            
            # 输出课程匹配信息
            print("\n=== 课程匹配信息 ===")
            course_data = result['recommendation_report']['course_matching_data']
            
            # 显示主要关注领域
            if course_data['course_requirements']['primary_focus']:
                primary_stage = course_data['course_requirements']['primary_focus']
                primary_name = stage_names.get(primary_stage, primary_stage)
                print(f"主要训练重点: {primary_name}")
            
            if course_data['course_requirements']['secondary_focus']:
                secondary_stage = course_data['course_requirements']['secondary_focus']
                secondary_name = stage_names.get(secondary_stage, secondary_stage)
                print(f"次要训练重点: {secondary_name}")
            
            # 显示建议难度等级
            difficulty = course_data['course_requirements']['difficulty_level']
            print(f"建议课程难度: {difficulty}")
            
            # 显示需要改善的领域
            if course_data['improvement_areas']:
                improvement_names = [stage_names.get(stage, stage) for stage in course_data['improvement_areas']]
                print(f"需要改善的领域: {', '.join(improvement_names)}")
            
            # 显示优势领域
            if course_data['strength_areas']:
                strength_names = [stage_names.get(stage, stage) for stage in course_data['strength_areas']]
                print(f"优势领域: {', '.join(strength_names)}")
            
            print("\n*具体的训练课程将根据您的评估结果进行个性化匹配和推荐。*")
            
        except Exception as e:
            print(f"评估出错: {str(e)}")
    
    print("\n" + "=" * 60)
    print("测试完成")
    print("=" * 60)

if __name__ == "__main__":
    test_basic_data()