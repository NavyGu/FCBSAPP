#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
课程推荐接口测试脚本
测试新的get_course_recommendations方法
"""

from glazer_integrated_system import GlazerIntegratedSystem
import json

def test_course_interface():
    """测试课程推荐接口"""
    print("=" * 60)
    print("课程推荐接口测试")
    print("=" * 60)
    
    # 创建系统实例
    system = GlazerIntegratedSystem()
    
    # 测试数据（使用正确的格式）
    test_data = {
        'pre_avg': 15.1, 'pre_var': 0.25,
        'fast_max': 48.8, 'fast_rise': 0.35, 'fast_recovery': 0.22,
        'tonic_avg': 30.4, 'tonic_rise': 0.18, 'tonic_recovery': 0.45, 'tonic_var': 0.28,
        'endurance_avg': 24.4, 'endurance_var': 0.31, 'endurance_fatigue': 0.85,
        'post_avg': 10.5, 'post_var': 0.18
    }
    
    # 处理数据
    result = system.process_single_assessment(test_data)
    
    # 获取课程推荐
    course_recommendations = system.recommender.get_course_recommendations(
        result['stage_scores'],
        test_data
    )
    
    print("\n=== 课程推荐详细信息 ===")
    
    # 用户档案
    print("\n【用户档案】")
    profile = course_recommendations['user_profile']
    print(f"总分: {profile['total_score']:.1f}分 ({profile['overall_level']})")
    print("各阶段得分:")
    for stage, score in profile['stage_scores'].items():
        print(f"  {stage}: {score:.1f}分")
    
    # 训练重点
    print("\n【训练重点】")
    focus = course_recommendations['training_focus']
    print(f"主要训练重点: {focus['primary_area']}")
    print(f"次要训练重点: {focus['secondary_area']}")
    print(f"需要改善的领域: {', '.join(focus['improvement_areas'])}")
    if focus['strength_areas']:
        print(f"优势领域: {', '.join(focus['strength_areas'])}")
    
    # 课程参数
    print("\n【课程参数】")
    params = course_recommendations['course_parameters']
    print(f"建议难度级别: {params['difficulty_level']}")
    print(f"训练强度推荐: {params['intensity_recommendation']}")
    print(f"训练时长推荐: {params['duration_recommendation']}")
    print(f"训练频率推荐: {params['frequency_recommendation']}")
    
    # 个性化数据
    print("\n【个性化适应需求】")
    personalization = course_recommendations['personalization_data']
    if personalization['adaptation_needs']:
        print(f"特殊适应需求: {', '.join(personalization['adaptation_needs'])}")
    else:
        print("无特殊适应需求")
    
    print("\n=== JSON格式输出（供课程系统使用）===")
    # 输出JSON格式（去除详细测量数据以简化输出）
    simplified_recommendations = course_recommendations.copy()
    simplified_recommendations['personalization_data'] = {
        'priority_scores': personalization['priority_scores'],
        'adaptation_needs': personalization['adaptation_needs']
    }
    
    print(json.dumps(simplified_recommendations, ensure_ascii=False, indent=2))
    
    print("\n" + "=" * 60)
    print("课程推荐接口测试完成")
    print("=" * 60)

if __name__ == "__main__":
    test_course_interface()