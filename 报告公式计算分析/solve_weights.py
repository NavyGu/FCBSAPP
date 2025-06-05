import numpy as np
from scipy.linalg import lstsq

# 定义系数矩阵A和常数向量b
A = np.array([
    [28.43, 91.16, 69.59, 77.80, 9.45],
    [59.31, 3.88, 10.30, 40.88, 2.27],
    [46.92, 3.52, 12.99, 46.27, 47.64],
    [61.22, 1.56, 10.11, 43.49, 59.81],
    [0.00, 97.06, 79.28, 94.60, 18.69]
])

b = np.array([67.57, 18.59, 23.66, 24.30, 73.69])

# 使用最小二乘法求解
weights, residuals, rank, s = lstsq(A, b)

# 输出结果
print("权重求解结果：")
print(f"w1 = {weights[0]:.4f} ({weights[0]*100:.2f}%)")
print(f"w2 = {weights[1]:.4f} ({weights[1]*100:.2f}%)")
print(f"w3 = {weights[2]:.4f} ({weights[2]*100:.2f}%)")
print(f"w4 = {weights[3]:.4f} ({weights[3]*100:.2f}%)")
print(f"w5 = {weights[4]:.4f} ({weights[4]*100:.2f}%)")

print(f"\n权重总和: {sum(weights):.4f}")

# 验证结果
print("\n验证计算结果：")
for i in range(len(b)):
    calculated = np.dot(A[i], weights)
    print(f"方程{i+1}: 计算值 = {calculated:.2f}, 实际值 = {b[i]:.2f}, 误差 = {abs(calculated - b[i]):.4f}")

# 计算残差
if len(residuals) > 0:
    print(f"\n残差平方和: {residuals[0]:.6f}")
    print(f"均方根误差: {np.sqrt(residuals[0]/len(b)):.6f}")

# 使用numpy.linalg.solve方法（如果方程组是方阵且有唯一解）
print("\n使用numpy.linalg.solve方法：")
try:
    weights_solve = np.linalg.solve(A, b)
    print("权重结果（solve方法）：")
    for i, w in enumerate(weights_solve):
        print(f"w{i+1} = {w:.4f} ({w*100:.2f}%)")
except np.linalg.LinAlgError:
    print("矩阵奇异，无法使用solve方法")

# 使用伪逆矩阵方法
print("\n使用伪逆矩阵方法：")
A_pinv = np.linalg.pinv(A)
weights_pinv = np.dot(A_pinv, b)
print("权重结果（伪逆方法）：")
for i, w in enumerate(weights_pinv):
    print(f"w{i+1} = {w:.4f} ({w*100:.2f}%)")