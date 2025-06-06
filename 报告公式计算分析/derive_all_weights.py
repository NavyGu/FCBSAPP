import numpy as np
import pandas as pd

# 从CSV文件读取数据
csv_file_path = '/Users/gunavy/Project/TRAE/FCBSAPP/报告公式计算分析/glazer_assessment_reports.csv'
df = pd.read_csv(csv_file_path, sep=' ', header=None, index_col=0)

# 提取各项数据
total_scores = df.loc['总得分'].values.astype(float)
pre_baseline_scores = df.loc['前静息阶段得分'].values.astype(float)
fast_twitch_scores = df.loc['快肌纤维阶段得分'].values.astype(float)
tonic_scores = df.loc['慢肌纤维阶段得分'].values.astype(float)
endurance_scores = df.loc['耐力测试阶段得分'].values.astype(float)
post_baseline_scores = df.loc['后静息阶段得分'].values.astype(float)

# 原始指标数据
# 前静息阶段
pre_avg_values = df.loc['前静息平均值(μV)'].values.astype(float)
pre_variability = df.loc['前静息变异性'].values.astype(float)

# 快肌纤维阶段
fast_max_values = df.loc['快肌纤维最大值(μV)'].values.astype(float)
fast_rise_times = df.loc['快肌纤维上升时间(s)'].values.astype(float)
fast_recovery_times = df.loc['快肌纤维恢复时间(s)'].values.astype(float)

# 慢肌纤维阶段
tonic_avg_values = df.loc['慢肌纤维平均值(μV)'].values.astype(float)
tonic_rise_times = df.loc['慢肌纤维上升时间(s)'].values.astype(float)
tonic_recovery_times = df.loc['慢肌纤维恢复时间(s)'].values.astype(float)
tonic_variability = df.loc['慢肌纤维变异性'].values.astype(float)

# 耐力测试阶段
endurance_avg_values = df.loc['耐力测试平均值(μV)'].values.astype(float)
endurance_variability = df.loc['耐力测试变异性'].values.astype(float)
endurance_fatigue_index = df.loc['耐力测试后10秒比值'].values.astype(float)

# 后静息阶段
post_avg_values = df.loc['后静息平均值(μV)'].values.astype(float)
post_variability = df.loc['后静息变异性'].values.astype(float)

print(f"成功从CSV文件读取了 {len(total_scores)} 个样本的数据")
print(f"总得分: {total_scores}")
print(f"各阶段得分数据已成功加载")

# 第一部分：推导总得分的阶段权重
print("\n===== 第一部分：推导总得分的阶段权重 =====")

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

# 添加详细的验证结果偏差分析
print("\n\n===== 详细验证结果偏差分析 =====")

# 1. 总得分预测偏差分析
print("\n1. 总得分预测偏差分析")
print("="*50)

# 使用推导权重的预测结果
predicted_total_derived = A.dot(stage_weights_normalized)
errors_derived = predicted_total_derived - total_scores

# 使用现有权重的预测结果
predicted_total_existing = A.dot(existing_weights)
errors_existing = predicted_total_existing - total_scores

# 计算统计指标
def calculate_metrics(errors, actual_scores, predicted_scores):
    mae = np.mean(np.abs(errors))  # 平均绝对误差
    mse = np.mean(errors ** 2)     # 均方误差
    rmse = np.sqrt(mse)            # 均方根误差
    mape = np.mean(np.abs(errors / actual_scores)) * 100  # 平均绝对百分比误差
    
    # R²决定系数
    ss_res = np.sum(errors ** 2)
    ss_tot = np.sum((actual_scores - np.mean(actual_scores)) ** 2)
    r2 = 1 - (ss_res / ss_tot)
    
    return mae, mse, rmse, mape, r2

# 推导权重的统计指标
mae_derived, mse_derived, rmse_derived, mape_derived, r2_derived = calculate_metrics(
    errors_derived, total_scores, predicted_total_derived)

# 现有权重的统计指标
mae_existing, mse_existing, rmse_existing, mape_existing, r2_existing = calculate_metrics(
    errors_existing, total_scores, predicted_total_existing)

print("\n推导权重性能指标：")
print(f"  平均绝对误差 (MAE): {mae_derived:.4f}")
print(f"  均方误差 (MSE): {mse_derived:.4f}")
print(f"  均方根误差 (RMSE): {rmse_derived:.4f}")
print(f"  平均绝对百分比误差 (MAPE): {mape_derived:.2f}%")
print(f"  决定系数 (R²): {r2_derived:.4f}")

print("\n现有权重性能指标：")
print(f"  平均绝对误差 (MAE): {mae_existing:.4f}")
print(f"  均方误差 (MSE): {mse_existing:.4f}")
print(f"  均方根误差 (RMSE): {rmse_existing:.4f}")
print(f"  平均绝对百分比误差 (MAPE): {mape_existing:.2f}%")
print(f"  决定系数 (R²): {r2_existing:.4f}")

# 性能改善分析
print("\n性能改善分析：")
print(f"  MAE改善: {((mae_existing - mae_derived) / mae_existing * 100):.2f}%")
print(f"  MSE改善: {((mse_existing - mse_derived) / mse_existing * 100):.2f}%")
print(f"  RMSE改善: {((rmse_existing - rmse_derived) / rmse_existing * 100):.2f}%")
print(f"  MAPE改善: {((mape_existing - mape_derived) / mape_existing * 100):.2f}%")
print(f"  R²改善: {((r2_derived - r2_existing) / abs(r2_existing) * 100):.2f}%")

# 2. 各阶段预测偏差分析
print("\n\n2. 各阶段预测偏差分析")
print("="*50)

# 分析各阶段的预测性能
stages = ['前静息', '快肌纤维', '慢肌纤维', '耐力测试', '后静息']
stage_scores = [pre_baseline_scores, fast_twitch_scores, tonic_scores, endurance_scores, post_baseline_scores]
stage_predictions = [predicted_pre_scores, predicted_fast_scores, predicted_tonic_scores, 
                    predicted_endurance_scores, predicted_post_scores]

for i, (stage_name, actual, predicted) in enumerate(zip(stages, stage_scores, stage_predictions)):
    errors = predicted - actual
    mae, mse, rmse, mape, r2 = calculate_metrics(errors, actual, predicted)
    
    print(f"\n{stage_name}阶段：")
    print(f"  平均绝对误差 (MAE): {mae:.4f}")
    print(f"  均方根误差 (RMSE): {rmse:.4f}")
    print(f"  平均绝对百分比误差 (MAPE): {mape:.2f}%")
    print(f"  决定系数 (R²): {r2:.4f}")
    
    # 找出最大偏差的样本
    max_error_idx = np.argmax(np.abs(errors))
    print(f"  最大偏差样本: 样本{max_error_idx+1}, 偏差: {errors[max_error_idx]:.4f}")

# 3. 样本级别的详细偏差分析
print("\n\n3. 样本级别的详细偏差分析")
print("="*50)

print("\n总得分预测详细对比：")
print("样本\t实际得分\t推导权重预测\t现有权重预测\t推导权重误差\t现有权重误差")
print("-" * 80)
for i in range(len(total_scores)):
    print(f"{i+1}\t{total_scores[i]:.2f}\t\t{predicted_total_derived[i]:.2f}\t\t{predicted_total_existing[i]:.2f}\t\t{errors_derived[i]:.2f}\t\t{errors_existing[i]:.2f}")

# 4. 权重合理性分析
print("\n\n4. 权重合理性分析")
print("="*50)

print("\n阶段权重对比分析：")
stage_names = ['前静息', '快肌纤维', '慢肌纤维', '耐力测试', '后静息']
print("阶段\t\t推导权重\t现有权重\t权重差异\t相对变化")
print("-" * 60)
for i, stage_name in enumerate(stage_names):
    diff = stage_weights_normalized[i] - existing_weights[i]
    rel_change = (diff / existing_weights[i]) * 100 if existing_weights[i] != 0 else float('inf')
    print(f"{stage_name}\t\t{stage_weights_normalized[i]:.4f}\t\t{existing_weights[i]:.4f}\t\t{diff:.4f}\t\t{rel_change:.1f}%")

# 5. 模型稳定性分析
print("\n\n5. 模型稳定性分析")
print("="*50)

# 计算权重的标准差和变异系数
stage_weights_std = np.std(stage_weights_normalized)
stage_weights_cv = stage_weights_std / np.mean(stage_weights_normalized)

print(f"\n阶段权重分布特征：")
print(f"  权重标准差: {stage_weights_std:.4f}")
print(f"  权重变异系数: {stage_weights_cv:.4f}")
print(f"  权重范围: [{np.min(stage_weights_normalized):.4f}, {np.max(stage_weights_normalized):.4f}]")

# 计算条件数，评估矩阵的数值稳定性
cond_number = np.linalg.cond(A)
print(f"\n系数矩阵条件数: {cond_number:.2f}")
if cond_number > 100:
    print("  警告: 条件数较大，可能存在多重共线性问题")
elif cond_number > 30:
    print("  注意: 条件数中等，建议检查数据质量")
else:
    print("  良好: 条件数较小，数值稳定性良好")

# 6. 残差分布分析
print("\n\n6. 残差分布分析")
print("="*50)

# 分析残差的统计特征
print("\n推导权重残差统计：")
print(f"  残差均值: {np.mean(errors_derived):.4f}")
print(f"  残差标准差: {np.std(errors_derived):.4f}")
print(f"  残差偏度: {np.mean(((errors_derived - np.mean(errors_derived)) / np.std(errors_derived)) ** 3):.4f}")
print(f"  残差峰度: {np.mean(((errors_derived - np.mean(errors_derived)) / np.std(errors_derived)) ** 4):.4f}")

print("\n现有权重残差统计：")
print(f"  残差均值: {np.mean(errors_existing):.4f}")
print(f"  残差标准差: {np.std(errors_existing):.4f}")
print(f"  残差偏度: {np.mean(((errors_existing - np.mean(errors_existing)) / np.std(errors_existing)) ** 3):.4f}")
print(f"  残差峰度: {np.mean(((errors_existing - np.mean(errors_existing)) / np.std(errors_existing)) ** 4):.4f}")

# 7. 预测区间分析
print("\n\n7. 预测区间分析")
print("="*50)

# 计算预测的置信区间（基于残差标准差）
confidence_level = 0.95
z_score = 1.96  # 95%置信区间的z值

print(f"\n{confidence_level*100:.0f}%置信区间分析（推导权重）：")
for i in range(len(total_scores)):
    margin_error = z_score * np.std(errors_derived)
    lower_bound = predicted_total_derived[i] - margin_error
    upper_bound = predicted_total_derived[i] + margin_error
    in_interval = lower_bound <= total_scores[i] <= upper_bound
    print(f"  样本{i+1}: [{lower_bound:.2f}, {upper_bound:.2f}], 实际值: {total_scores[i]:.2f}, 在区间内: {in_interval}")

# 8. 总结和建议
print("\n\n8. 总结和建议")
print("="*50)

print("\n模型性能总结：")
if r2_derived > r2_existing:
    print(f"✓ 推导权重的R²({r2_derived:.4f})优于现有权重({r2_existing:.4f})")
else:
    print(f"✗ 推导权重的R²({r2_derived:.4f})不如现有权重({r2_existing:.4f})")

if rmse_derived < rmse_existing:
    print(f"✓ 推导权重的RMSE({rmse_derived:.4f})优于现有权重({rmse_existing:.4f})")
else:
    print(f"✗ 推导权重的RMSE({rmse_derived:.4f})不如现有权重({rmse_existing:.4f})")

print("\n改进建议：")
if cond_number > 30:
    print("• 考虑使用正则化方法（如Ridge回归）来处理多重共线性")
if mape_derived > 10:
    print("• 平均绝对百分比误差较大，建议增加更多样本数据")
if np.max(np.abs(errors_derived)) > 20:
    print("• 存在较大的异常值，建议检查数据质量或使用鲁棒回归方法")
if stage_weights_cv > 1:
    print("• 权重分布不均匀，建议重新评估各阶段的重要性")

print("\n数据质量建议：")
print(f"• 当前样本数量: {len(total_scores)}个")
print("• 建议收集更多样本数据以提高模型稳定性")
print("• 建议对异常值进行进一步分析和处理")
print("• 考虑使用交叉验证来评估模型的泛化能力")