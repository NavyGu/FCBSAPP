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

# 构建系数矩阵A
A = np.column_stack([
    pre_baseline_scores,
    fast_twitch_scores,
    tonic_scores,
    endurance_scores,
    post_baseline_scores
])

# 使用numpy的最小二乘法求解
weights, residuals, rank, s = np.linalg.lstsq(A, total_scores, rcond=None)

# 输出原始权重
print("原始推导的权重系数：")
print(f"前静息阶段权重: {weights[0]:.6f}")
print(f"快肌纤维阶段权重: {weights[1]:.6f}")
print(f"慢肌纤维阶段权重: {weights[2]:.6f}")
print(f"耐力测试阶段权重: {weights[3]:.6f}")
print(f"后静息阶段权重: {weights[4]:.6f}")

# 处理可能的负权重
weights_non_negative = np.maximum(weights, 0)

# 归一化权重，使其和为1
weights_normalized = weights_non_negative / np.sum(weights_non_negative)

# 输出归一化后的权重
print("\n归一化后的权重系数：")
print(f"前静息阶段权重: {weights_normalized[0]:.4f}")
print(f"快肌纤维阶段权重: {weights_normalized[1]:.4f}")
print(f"慢肌纤维阶段权重: {weights_normalized[2]:.4f}")
print(f"耐力测试阶段权重: {weights_normalized[3]:.4f}")
print(f"后静息阶段权重: {weights_normalized[4]:.4f}")
print(f"权重总和: {np.sum(weights_normalized):.4f}")

# 验证结果
print("\n验证结果：")
predicted_scores = A.dot(weights)
for i, (pred, actual) in enumerate(zip(predicted_scores, total_scores)):
    print(f"样本 {i+1}: 预测得分 = {pred:.4f}, 实际得分 = {actual:.4f}, 误差 = {pred-actual:.4f}")

print(f"\n残差平方和: {np.sum((predicted_scores - total_scores) ** 2):.6f}")

# 使用归一化权重验证
predicted_scores_norm = A.dot(weights_normalized)
print("\n使用归一化权重的验证结果：")
for i, (pred, actual) in enumerate(zip(predicted_scores_norm, total_scores)):
    print(f"样本 {i+1}: 预测得分 = {pred:.4f}, 实际得分 = {actual:.4f}, 误差 = {pred-actual:.4f}")

print(f"\n归一化权重的残差平方和: {np.sum((predicted_scores_norm - total_scores) ** 2):.6f}")

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