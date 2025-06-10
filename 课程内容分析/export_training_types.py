import csv
import re
import os

# 使用绝对路径
script_dir = os.path.dirname(os.path.abspath(__file__))
input_file = os.path.join(script_dir, '课程内容.txt')
output_file = os.path.join(script_dir, '训练类型时长统计.csv')

# 用于存储类型和时长的字典
training_dict = {}

with open(input_file, 'r', encoding='utf-8') as f:
    for line in f:
        line = line.strip()
        if not line:
            continue
        
        # 分割每行的多个训练项目（用tab分隔）
        items = re.split(r'\t+', line)
        
        for item in items:
            item = item.strip()
            if not item:
                continue
            
            # 匹配"训练名称：时长分钟"或"训练名称: 时长分钟"格式
            match = re.match(r'([^:：]+)[:：]\s*([0-9]+)分钟', item)
            if match:
                name = match.group(1).strip()
                duration = match.group(2).strip() + '分钟'
                
                if name not in training_dict:
                    training_dict[name] = set()
                training_dict[name].add(duration)

# 按名称排序，输出csv
with open(output_file, 'w', encoding='utf-8', newline='') as csvfile:
    writer = csv.writer(csvfile)
    writer.writerow(['训练类型', '时长'])
    
    for name in sorted(training_dict.keys()):
        durations = sorted(training_dict[name], key=lambda x: int(x.replace('分钟', '')))
        for duration in durations:
            writer.writerow([name, duration])

print(f'已导出到 {output_file}')
print(f'共找到 {len(training_dict)} 种训练类型')
print(f'总计 {sum(len(durations) for durations in training_dict.values())} 条记录')