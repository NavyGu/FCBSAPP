#!/usr/bin/env python3
# -*- coding: utf-8 -*-

from glazer_assessment_calculator import GlazerAssessmentCalculator

# 创建计算器实例
calculator = GlazerAssessmentCalculator()

# 定义五组参数
data = [
    # 报告1
    {
        "pre_avg": 8.46, "pre_var": 0.2,
        "fast_max": 94.61, "fast_rise": 0.4, "fast_recovery": 0.18,
        "tonic_avg": 33.8, "tonic_rise": 0.15, "tonic_recovery": 0.49, "tonic_var": 0.32,
        "endurance_avg": 32.84, "endurance_var": 0.36, "endurance_fatigue": 0.99,
        "post_avg": 8.82, "post_var": 0.53
    },
    # 报告2
    {
        "pre_avg": 5.34, "pre_var": 0.18,
        "fast_max": 7.03, "fast_rise": 1.62, "fast_recovery": 3.22,
        "tonic_avg": 5.35, "tonic_rise": 2.0, "tonic_recovery": 4.0, "tonic_var": 0.17,
        "endurance_avg": 10.45, "endurance_var": 0.47, "endurance_fatigue": 1.03,
        "post_avg": 10.36, "post_var": 0.47
    },
    # 报告3
    {
        "pre_avg": 6.27, "pre_var": 0.16,
        "fast_max": 9.14, "fast_rise": 2.0, "fast_recovery": 4.0,
        "tonic_avg": 6.12, "tonic_rise": 2.0, "tonic_recovery": 4.0, "tonic_var": 0.13,
        "endurance_avg": 6.2, "endurance_var": 0.16, "endurance_fatigue": 1.01,
        "post_avg": 6.23, "post_var": 0.15
    },
    # 报告4
    {
        "pre_avg": 5.22, "pre_var": 0.17,
        "fast_max": 6.83, "fast_rise": 2.0, "fast_recovery": 4.0,
        "tonic_avg": 5.29, "tonic_rise": 2.0, "tonic_recovery": 4.0, "tonic_var": 0.16,
        "endurance_avg": 5.29, "endurance_var": 0.17, "endurance_fatigue": 1.0,
        "post_avg": 5.29, "post_var": 0.19
    },
    # 报告5
    {
        "pre_avg": 108.37, "pre_var": 2.82,
        "fast_max": 104.15, "fast_rise": 0.36, "fast_recovery": 0.13,
        "tonic_avg": 43.02, "tonic_rise": 2.0, "tonic_recovery": 4.0, "tonic_var": 0.09,
        "endurance_avg": 40.66, "endurance_var": 0.03, "endurance_fatigue": 1.04,
        "post_avg": 104.25, "post_var": 0.11
    }
]

print("===== Glazer评估计算结果 =====\n")

# 计算并输出每组参数的结果
for i, params in enumerate(data):
    print(f"\n----- 报告 {i+1} -----")
    
    # 计算各阶段得分
    pre_baseline_score = calculator.calculate_pre_baseline_score(params["pre_avg"], params["pre_var"])
    fast_twitch_score = calculator.calculate_fast_twitch_score(params["fast_max"], params["fast_rise"], params["fast_recovery"])
    tonic_score = calculator.calculate_tonic_score(params["tonic_avg"], params["tonic_rise"], params["tonic_recovery"], params["tonic_var"])
    endurance_score = calculator.calculate_endurance_score(params["endurance_avg"], params["endurance_var"], params["endurance_fatigue"])
    post_baseline_score = calculator.calculate_post_baseline_score(params["post_avg"], params["post_var"])
    
    # 计算总分
    total_score = calculator.calculate_total_score(
        pre_baseline_score, fast_twitch_score, tonic_score, endurance_score, post_baseline_score
    )
    
    # 输出结果
    print(f"前静息阶段得分: {pre_baseline_score:.2f}")
    print(f"快肌纤维阶段得分: {fast_twitch_score:.2f}")
    print(f"慢肌纤维阶段得分: {tonic_score:.2f}")
    print(f"耐力测试阶段得分: {endurance_score:.2f}")
    print(f"后静息阶段得分: {post_baseline_score:.2f}")
    print(f"总评分: {total_score:.2f}")