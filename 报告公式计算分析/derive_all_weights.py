import numpy as np

# 用户提供的数据
# 各阶段得分
pre_baseline_scores = np.array([28.43, 59.31, 46.92, 61.22, 0])
fast_twitch_scores = np.array([91.16, 3.88, 3.52, 1.56, 97.06])
tonic_scores = np.array([69.59, 10.3, 12.99, 10.11, 79.28])
endurance_scores = np.array([77.8, 40.88, 46.27, 43.49, 94.6])
post_baseline_scores = np.array([9.45, 2.27, 47.64, 59.81, 18.69])

# 总得分
total_scores = np.array([67.57, 18.59, 23.66, 24.3, 73.69])

# 原始指标数据
# 前静息阶段
pre_avg_values = np.array([8.46, 5.34, 6.27, 5.22, 108.37])
pre_variability = np.array([0.2, 0.18, 0.16, 0.17, 2.82])

# 快肌纤维阶段
fast_max_values = np.array([94.61, 7.03, 9.14, 6.83, 104.15])
fast_rise_times = np.array([0.4, 1.62, 2, 2, 0.36])
fast_recovery_times = np.array([0.18, 3.22, 4, 4, 0.13])

# 慢肌纤维阶段
tonic_avg_values = np.array([33.8, 5.35, 6.12, 5.29, 43.02])
tonic_rise_times = np.array([0.15, 2, 2, 2, 2])
tonic_recovery_times = np.array([0.49, 4, 4, 4, 4])
tonic_variability = np.array([0.32, 0.17, 0.13, 0.16, 0.09])

# 耐力测试阶段
endurance_avg_values = np.array([32.84, 10.45, 6.2, 5.29, 40.66])
endurance_variability = np.array([0.36, 0.47, 0.16, 0.17, 0.03])
endurance_fatigue_index = np.array([0.99, 1.03, 1.01, 1, 1.04])

# 后静息阶段
post_avg_values = np.array([8.82, 10.36, 6.23, 5.29, 104.25])
post_variability = np.array([0.53, 0.47, 0.15, 0.19, 0.11])

# 第一部分：推导总得分的阶段权重
print("===== 第一部分：推导总得分的阶段权重 =====")

# 构建系数矩阵A
A = np.column_stack([
    pre_baseline_scores,
    fast_twitch_scores,
    tonic_scores,
    endurance_scores,
    post_baseline_scores
])

# 使用numpy的最小二乘法求解
stage_weights, residuals, rank, s = np.linalg.lstsq(A, total_scores, rcond=None)

# 处理可能的负权重
stage_weights_non_negative = np.maximum(stage_weights, 0)

# 归一化权重，使其和为1
stage_weights_normalized = stage_weights_non_negative / np.sum(stage_weights_non_negative)

# 输出归一化后的权重
print("\n归一化后的阶段权重系数：")
print(f"前静息阶段权重: {stage_weights_normalized[0]:.4f}")
print(f"快肌纤维阶段权重: {stage_weights_normalized[1]:.4f}")
print(f"慢肌纤维阶段权重: {stage_weights_normalized[2]:.4f}")
print(f"耐力测试阶段权重: {stage_weights_normalized[3]:.4f}")
print(f"后静息阶段权重: {stage_weights_normalized[4]:.4f}")
print(f"权重总和: {np.sum(stage_weights_normalized):.4f}")

# 验证结果
print("\n验证结果：")
predicted_scores = A.dot(stage_weights_normalized)
for i, (pred, actual) in enumerate(zip(predicted_scores, total_scores)):
    print(f"样本 {i+1}: 预测得分 = {pred:.4f}, 实际得分 = {actual:.4f}, 误差 = {pred-actual:.4f}")

print(f"\n残差平方和: {np.sum((predicted_scores - total_scores) ** 2):.6f}")

# 与现有权重比较
existing_weights = np.array([0.1, 0.3, 0.3, 0.2, 0.1])
print("\n现有权重系数：")
print(f"前静息阶段权重: {existing_weights[0]:.4f}")
print(f"快肌纤维阶段权重: {existing_weights[1]:.4f}")
print(f"慢肌纤维阶段权重: {existing_weights[2]:.4f}")
print(f"耐力测试阶段权重: {existing_weights[3]:.4f}")
print(f"后静息阶段权重: {existing_weights[4]:.4f}")

# 使用现有权重验证
predicted_scores_existing = A.dot(existing_weights)
print("\n使用现有权重的验证结果：")
for i, (pred, actual) in enumerate(zip(predicted_scores_existing, total_scores)):
    print(f"样本 {i+1}: 预测得分 = {pred:.4f}, 实际得分 = {actual:.4f}, 误差 = {pred-actual:.4f}")

print(f"\n现有权重的残差平方和: {np.sum((predicted_scores_existing - total_scores) ** 2):.6f}")

# 第二部分：推导各阶段内部指标权重
print("\n\n===== 第二部分：推导各阶段内部指标权重 =====")

# 1. 前静息阶段内部指标权重推导
print("\n1. 前静息阶段内部指标权重推导")

# 计算前静息阶段的指标得分
# 平均值评分 - 线性计算 (0-16μV映射到100-0分)
pre_avg_scores = np.maximum(0, np.minimum(100, 100 - (pre_avg_values * 100 / 16)))

# 变异性评分 - 线性计算 (0-0.8映射到100-0分)
pre_var_scores = np.maximum(0, np.minimum(100, 100 - (pre_variability * 100 / 0.8)))

# 构建系数矩阵
A_pre = np.column_stack([pre_avg_scores, pre_var_scores])

# 使用最小二乘法求解
pre_weights, pre_residuals, pre_rank, pre_s = np.linalg.lstsq(A_pre, pre_baseline_scores, rcond=None)

# 处理可能的负权重并归一化
pre_weights_non_negative = np.maximum(pre_weights, 0)
pre_weights_normalized = pre_weights_non_negative / np.sum(pre_weights_non_negative)

print("前静息阶段内部指标权重：")
print(f"平均值权重: {pre_weights_normalized[0]:.4f}")
print(f"变异性权重: {pre_weights_normalized[1]:.4f}")

# 验证结果
predicted_pre_scores = A_pre.dot(pre_weights_normalized)
print("\n验证结果：")
for i, (pred, actual) in enumerate(zip(predicted_pre_scores, pre_baseline_scores)):
    print(f"样本 {i+1}: 预测得分 = {pred:.4f}, 实际得分 = {actual:.4f}, 误差 = {pred-actual:.4f}")

print(f"残差平方和: {np.sum((predicted_pre_scores - pre_baseline_scores) ** 2):.6f}")

# 2. 快肌纤维阶段内部指标权重推导
print("\n2. 快肌纤维阶段内部指标权重推导")

# 计算快肌纤维阶段的指标得分
# 最大值评分 - 线性计算 (0-40μV映射到0-100分)
fast_max_scores = np.maximum(0, np.minimum(100, fast_max_values * 100 / 40))

# 上升时间评分 - 线性计算 (0-2.0s映射到100-0分)
fast_rise_scores = np.maximum(0, np.minimum(100, 100 - (fast_rise_times * 100 / 2.0)))

# 恢复时间评分 - 线性计算 (0-2.0s映射到100-0分)
fast_recovery_scores = np.maximum(0, np.minimum(100, 100 - (fast_recovery_times * 100 / 2.0)))

# 构建系数矩阵
A_fast = np.column_stack([fast_max_scores, fast_rise_scores, fast_recovery_scores])

# 使用最小二乘法求解
fast_weights, fast_residuals, fast_rank, fast_s = np.linalg.lstsq(A_fast, fast_twitch_scores, rcond=None)

# 处理可能的负权重并归一化
fast_weights_non_negative = np.maximum(fast_weights, 0)
fast_weights_normalized = fast_weights_non_negative / np.sum(fast_weights_non_negative)

print("快肌纤维阶段内部指标权重：")
print(f"最大值权重: {fast_weights_normalized[0]:.4f}")
print(f"上升时间权重: {fast_weights_normalized[1]:.4f}")
print(f"恢复时间权重: {fast_weights_normalized[2]:.4f}")

# 验证结果
predicted_fast_scores = A_fast.dot(fast_weights_normalized)
print("\n验证结果：")
for i, (pred, actual) in enumerate(zip(predicted_fast_scores, fast_twitch_scores)):
    print(f"样本 {i+1}: 预测得分 = {pred:.4f}, 实际得分 = {actual:.4f}, 误差 = {pred-actual:.4f}")

print(f"残差平方和: {np.sum((predicted_fast_scores - fast_twitch_scores) ** 2):.6f}")

# 3. 慢肌纤维阶段内部指标权重推导
print("\n3. 慢肌纤维阶段内部指标权重推导")

# 计算慢肌纤维阶段的指标得分
# 平均值评分 - 线性计算 (0-35μV映射到0-100分)
tonic_avg_scores = np.maximum(0, np.minimum(100, tonic_avg_values * 100 / 35))

# 上升时间评分 - 线性计算 (0-4.0s映射到100-0分)
tonic_rise_scores = np.maximum(0, np.minimum(100, 100 - (tonic_rise_times * 100 / 4.0)))

# 恢复时间评分 - 线性计算 (0-4.0s映射到100-0分)
tonic_recovery_scores = np.maximum(0, np.minimum(100, 100 - (tonic_recovery_times * 100 / 4.0)))

# 变异性评分 - 线性计算 (0-0.8映射到100-0分)
tonic_var_scores = np.maximum(0, np.minimum(100, 100 - (tonic_variability * 100 / 0.8)))

# 构建系数矩阵
A_tonic = np.column_stack([tonic_avg_scores, tonic_rise_scores, tonic_recovery_scores, tonic_var_scores])

# 使用最小二乘法求解
tonic_weights, tonic_residuals, tonic_rank, tonic_s = np.linalg.lstsq(A_tonic, tonic_scores, rcond=None)

# 处理可能的负权重并归一化
tonic_weights_non_negative = np.maximum(tonic_weights, 0)
tonic_weights_normalized = tonic_weights_non_negative / np.sum(tonic_weights_non_negative)

print("慢肌纤维阶段内部指标权重：")
print(f"平均值权重: {tonic_weights_normalized[0]:.4f}")
print(f"上升时间权重: {tonic_weights_normalized[1]:.4f}")
print(f"恢复时间权重: {tonic_weights_normalized[2]:.4f}")
print(f"变异性权重: {tonic_weights_normalized[3]:.4f}")

# 验证结果
predicted_tonic_scores = A_tonic.dot(tonic_weights_normalized)
print("\n验证结果：")
for i, (pred, actual) in enumerate(zip(predicted_tonic_scores, tonic_scores)):
    print(f"样本 {i+1}: 预测得分 = {pred:.4f}, 实际得分 = {actual:.4f}, 误差 = {pred-actual:.4f}")

print(f"残差平方和: {np.sum((predicted_tonic_scores - tonic_scores) ** 2):.6f}")

# 4. 耐力测试阶段内部指标权重推导
print("\n4. 耐力测试阶段内部指标权重推导")

# 计算耐力测试阶段的指标得分
# 平均值评分 - 线性计算 (0-30μV映射到0-100分)
endurance_avg_scores = np.maximum(0, np.minimum(100, endurance_avg_values * 100 / 30))

# 变异性评分 - 线性计算 (0-0.8映射到100-0分)
endurance_var_scores = np.maximum(0, np.minimum(100, 100 - (endurance_variability * 100 / 0.8)))

# 疲劳指数评分 - 线性计算 (中心点为1.0，向两边递减)
# 0.5-1.0映射到0-100分，1.0-1.5映射到100-0分
endurance_fatigue_scores = np.zeros_like(endurance_fatigue_index)
for i, fatigue_index in enumerate(endurance_fatigue_index):
    if fatigue_index <= 1.0:
        endurance_fatigue_scores[i] = max(0, min(100, (fatigue_index - 0.5) * 200))
    else:
        endurance_fatigue_scores[i] = max(0, min(100, (1.5 - fatigue_index) * 200))

# 构建系数矩阵
A_endurance = np.column_stack([endurance_avg_scores, endurance_var_scores, endurance_fatigue_scores])

# 使用最小二乘法求解
endurance_weights, endurance_residuals, endurance_rank, endurance_s = np.linalg.lstsq(A_endurance, endurance_scores, rcond=None)

# 处理可能的负权重并归一化
endurance_weights_non_negative = np.maximum(endurance_weights, 0)
endurance_weights_normalized = endurance_weights_non_negative / np.sum(endurance_weights_non_negative)

print("耐力测试阶段内部指标权重：")
print(f"平均值权重: {endurance_weights_normalized[0]:.4f}")
print(f"变异性权重: {endurance_weights_normalized[1]:.4f}")
print(f"疲劳指数权重: {endurance_weights_normalized[2]:.4f}")

# 验证结果
predicted_endurance_scores = A_endurance.dot(endurance_weights_normalized)
print("\n验证结果：")
for i, (pred, actual) in enumerate(zip(predicted_endurance_scores, endurance_scores)):
    print(f"样本 {i+1}: 预测得分 = {pred:.4f}, 实际得分 = {actual:.4f}, 误差 = {pred-actual:.4f}")

print(f"残差平方和: {np.sum((predicted_endurance_scores - endurance_scores) ** 2):.6f}")

# 5. 后静息阶段内部指标权重推导
print("\n5. 后静息阶段内部指标权重推导")

# 计算后静息阶段的指标得分
# 平均值评分 - 线性计算 (0-16μV映射到100-0分)
post_avg_scores = np.maximum(0, np.minimum(100, 100 - (post_avg_values * 100 / 16)))

# 变异性评分 - 线性计算 (0-0.8映射到100-0分)
post_var_scores = np.maximum(0, np.minimum(100, 100 - (post_variability * 100 / 0.8)))

# 构建系数矩阵
A_post = np.column_stack([post_avg_scores, post_var_scores])

# 使用最小二乘法求解
post_weights, post_residuals, post_rank, post_s = np.linalg.lstsq(A_post, post_baseline_scores, rcond=None)

# 处理可能的负权重并归一化
post_weights_non_negative = np.maximum(post_weights, 0)
post_weights_normalized = post_weights_non_negative / np.sum(post_weights_non_negative)

print("后静息阶段内部指标权重：")
print(f"平均值权重: {post_weights_normalized[0]:.4f}")
print(f"变异性权重: {post_weights_normalized[1]:.4f}")

# 验证结果
predicted_post_scores = A_post.dot(post_weights_normalized)
print("\n验证结果：")
for i, (pred, actual) in enumerate(zip(predicted_post_scores, post_baseline_scores)):
    print(f"样本 {i+1}: 预测得分 = {pred:.4f}, 实际得分 = {actual:.4f}, 误差 = {pred-actual:.4f}")

print(f"残差平方和: {np.sum((predicted_post_scores - post_baseline_scores) ** 2):.6f}")

# 总结所有权重
print("\n\n===== 权重推导总结 =====")
print("\n1. 总得分阶段权重：")
print(f"前静息阶段权重: {stage_weights_normalized[0]:.4f} (现有: {existing_weights[0]:.4f})")
print(f"快肌纤维阶段权重: {stage_weights_normalized[1]:.4f} (现有: {existing_weights[1]:.4f})")
print(f"慢肌纤维阶段权重: {stage_weights_normalized[2]:.4f} (现有: {existing_weights[2]:.4f})")
print(f"耐力测试阶段权重: {stage_weights_normalized[3]:.4f} (现有: {existing_weights[3]:.4f})")
print(f"后静息阶段权重: {stage_weights_normalized[4]:.4f} (现有: {existing_weights[4]:.4f})")

print("\n2. 前静息阶段内部指标权重：")
print(f"平均值权重: {pre_weights_normalized[0]:.4f} (现有: 0.7000)")
print(f"变异性权重: {pre_weights_normalized[1]:.4f} (现有: 0.3000)")

print("\n3. 快肌纤维阶段内部指标权重：")
print(f"最大值权重: {fast_weights_normalized[0]:.4f} (现有: 0.5000)")
print(f"上升时间权重: {fast_weights_normalized[1]:.4f} (现有: 0.3000)")
print(f"恢复时间权重: {fast_weights_normalized[2]:.4f} (现有: 0.2000)")

print("\n4. 慢肌纤维阶段内部指标权重：")
print(f"平均值权重: {tonic_weights_normalized[0]:.4f} (现有: 0.4000)")
print(f"上升时间权重: {tonic_weights_normalized[1]:.4f} (现有: 0.2500)")
print(f"恢复时间权重: {tonic_weights_normalized[2]:.4f} (现有: 0.2500)")
print(f"变异性权重: {tonic_weights_normalized[3]:.4f} (现有: 0.1000)")

print("\n5. 耐力测试阶段内部指标权重：")
print(f"平均值权重: {endurance_weights_normalized[0]:.4f} (现有: 0.4500)")
print(f"变异性权重: {endurance_weights_normalized[1]:.4f} (现有: 0.1500)")
print(f"疲劳指数权重: {endurance_weights_normalized[2]:.4f} (现有: 0.4000)")

print("\n6. 后静息阶段内部指标权重：")
print(f"平均值权重: {post_weights_normalized[0]:.4f} (现有: 0.7000)")
print(f"变异性权重: {post_weights_normalized[1]:.4f} (现有: 0.3000)")