import pandas as pd
import re

# 读取训练内容文件
file_path = r'c:\Users\Admin\Desktop\梵晨博生\FCBSAPP\训练方案\训练内容.txt'

def process_training_data(file_path):
    # 读取文件内容
    with open(file_path, 'r', encoding='utf-8') as file:
        lines = file.readlines()
    
    # 解析表头
    header = lines[0].strip().split('\t')
    
    # 初始化数据列表
    data = []
    
    # 解析每一行数据
    for line in lines[1:]:
        if not line.strip():
            continue
        
        # 分割行数据
        row_data = line.strip().split('\t')
        
        # 确保至少有基本的列
        if len(row_data) < 4:
            continue
        
        # 提取训练课程、节次和计划时间
        course = row_data[0]
        session = row_data[1]
        plan_date = row_data[2]
        
        # 处理课程内容步骤
        steps = []
        for i in range(3, len(row_data)):
            if i < len(row_data) and row_data[i].strip():
                steps.append(row_data[i])
        
        # 将数据添加到列表
        data.append({
            '训练课程': course,
            '节次': session,
            '计划时间': plan_date,
            '课程内容步骤': steps
        })
    
    return data

def extract_unique_course_contents(data):
    # 提取所有唯一的课程内容类型
    unique_contents = set()
    
    for row in data:
        for step in row['课程内容步骤']:
            # 使用正则表达式提取课程内容名称和时间
            match = re.match(r'([^:]+):\s*(\d+)分钟', step)
            if match:
                content_name = match.group(1).strip()
                unique_contents.add(content_name)
    
    return sorted(list(unique_contents))

def create_transformed_table(data, unique_contents):
    # 创建新的数据结构
    transformed_data = []
    
    for row in data:
        new_row = {
            '训练课程': row['训练课程'],
            '节次': row['节次'],
            '计划时间': row['计划时间']
        }
        
        # 初始化所有课程内容为空
        for content in unique_contents:
            new_row[content] = ''
        
        # 填充课程内容的训练时间，格式为"步骤X:Y分钟"
        step_counters = {content: 1 for content in unique_contents}  # 为每种内容类型初始化步骤计数器
        
        for step in row['课程内容步骤']:
            match = re.match(r'([^:]+):\s*(\d+)分钟', step)
            if match:
                content_name = match.group(1).strip()
                duration = match.group(2)
                
                if content_name in unique_contents:
                    # 使用当前步骤计数器的值
                    step_number = step_counters[content_name]
                    # 更新单元格内容为"步骤X:Y分钟"
                    new_row[content_name] = f"步骤{step_number}:{duration}分钟"
                    # 增加该内容类型的步骤计数器
                    step_counters[content_name] += 1
        
        transformed_data.append(new_row)
    
    # 创建DataFrame
    df = pd.DataFrame(transformed_data)
    
    return df

# 处理数据
data = process_training_data(file_path)
unique_contents = extract_unique_course_contents(data)
transformed_df = create_transformed_table(data, unique_contents)

# 保存为Excel文件
output_file = r'c:\Users\Admin\Desktop\梵晨博生\FCBSAPP\训练方案\训练内容表格_步骤格式.xlsx'
transformed_df.to_excel(output_file, index=False)

print(f"数据已处理完成并保存到: {output_file}")

# 打印表格的前10行作为预览
print("\n表格预览:")
print(transformed_df.head(10).to_string())

# 打印统计信息
print(f"\n总行数: {len(transformed_df)}")
print(f"总列数: {len(transformed_df.columns)}")
print(f"唯一训练课程数: {transformed_df['训练课程'].nunique()}")
print(f"唯一课程内容类型数: {len(unique_contents)}")
print("\n课程内容类型列表:")
for i, content in enumerate(unique_contents):
    print(f"{i+1}. {content}")