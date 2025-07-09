#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""
Glazer测试数据加载器
用于从文件加载Glazer评估的测试数据
"""

import os

class GlazerTestDataLoader:
    def __init__(self):
        # 默认数据文件路径
        self.default_data_file = '/Users/gunavy/Project/TRAE/FCBSAPP/报告公式计算分析/Glazer打分模型基础数据.txt'
    
    def load_test_data(self, file_path=None):
        """
        从文件加载测试数据
        :param file_path: 数据文件路径，如果为None则使用默认路径
        :return: 测试数据列表
        """
        if file_path is None:
            file_path = self.default_data_file
            
        test_data = []
        
        try:
            with open(file_path, 'r', encoding='utf-8') as file:
                lines = file.readlines()
                
                # 解析数据，跳过第一行（如果是标题行）
                data_dict = {}
                for line in lines:
                    line = line.strip()
                    if line:
                        parts = line.split('\t')
                        if len(parts) >= 6:  # 确保有足够的列
                            indicator_name = parts[0]
                            # 提取数值列（跳过指标名称）
                            values = []
                            for i in range(1, len(parts)):
                                try:
                                    values.append(float(parts[i]))
                                except ValueError:
                                    continue
                            data_dict[indicator_name] = values
                
                # 确定有多少组测试数据
                if data_dict:
                    num_tests = len(list(data_dict.values())[0])
                    
                    # 为每组测试数据创建字典
                    for i in range(num_tests):
                        test_case = {
                            'case_id': f'测试案例{i+1}',
                            'pre_baseline_avg': data_dict.get('前静息平均值(μV)', [0])[i] if i < len(data_dict.get('前静息平均值(μV)', [0])) else 0,
                            'pre_baseline_var': data_dict.get('前静息变异性', [0])[i] if i < len(data_dict.get('前静息变异性', [0])) else 0,
                            'fast_twitch_max': data_dict.get('快肌纤维最大值(μV)', [0])[i] if i < len(data_dict.get('快肌纤维最大值(μV)', [0])) else 0,
                            'fast_twitch_rise': data_dict.get('快肌纤维上升时间(s)', [0])[i] if i < len(data_dict.get('快肌纤维上升时间(s)', [0])) else 0,
                            'fast_twitch_recovery': data_dict.get('快肌纤维恢复时间(s)', [0])[i] if i < len(data_dict.get('快肌纤维恢复时间(s)', [0])) else 0,
                            'tonic_avg': data_dict.get('慢肌纤维平均值(μV)', [0])[i] if i < len(data_dict.get('慢肌纤维平均值(μV)', [0])) else 0,
                            'tonic_rise': data_dict.get('慢肌纤维上升时间(s)', [0])[i] if i < len(data_dict.get('慢肌纤维上升时间(s)', [0])) else 0,
                            'tonic_recovery': data_dict.get('慢肌纤维恢复时间(s)', [0])[i] if i < len(data_dict.get('慢肌纤维恢复时间(s)', [0])) else 0,
                            'tonic_var': data_dict.get('慢肌纤维变异性', [0])[i] if i < len(data_dict.get('慢肌纤维变异性', [0])) else 0,
                            'endurance_avg': data_dict.get('耐力测试平均值(μV)', [0])[i] if i < len(data_dict.get('耐力测试平均值(μV)', [0])) else 0,
                            'endurance_var': data_dict.get('耐力测试变异性', [0])[i] if i < len(data_dict.get('耐力测试变异性', [0])) else 0,
                            'endurance_fatigue': data_dict.get('耐力测试后10秒比值', [0])[i] if i < len(data_dict.get('耐力测试后10秒比值', [0])) else 0,
                            'post_baseline_avg': data_dict.get('后静息平均值(μV)', [0])[i] if i < len(data_dict.get('后静息平均值(μV)', [0])) else 0,
                            'post_baseline_var': data_dict.get('后静息变异性', [0])[i] if i < len(data_dict.get('后静息变异性', [0])) else 0
                        }
                        test_data.append(test_case)
                        
        except FileNotFoundError:
            print(f"错误：找不到文件 {file_path}")
        except Exception as e:
            print(f"读取文件时发生错误：{e}")
            
        return test_data
    
    def get_test_case_by_index(self, index, file_path=None):
        """
        根据索引获取单个测试案例
        :param index: 测试案例索引（从0开始）
        :param file_path: 数据文件路径，如果为None则使用默认路径
        :return: 单个测试案例数据
        """
        test_data = self.load_test_data(file_path)
        if 0 <= index < len(test_data):
            return test_data[index]
        else:
            print(f"错误：索引 {index} 超出范围，共有 {len(test_data)} 个测试案例")
            return None
    
    def get_test_case_count(self, file_path=None):
        """
        获取测试案例总数
        :param file_path: 数据文件路径，如果为None则使用默认路径
        :return: 测试案例总数
        """
        test_data = self.load_test_data(file_path)
        return len(test_data)
    
    def validate_data_file(self, file_path=None):
        """
        验证数据文件是否存在且格式正确
        :param file_path: 数据文件路径，如果为None则使用默认路径
        :return: (是否有效, 错误信息)
        """
        if file_path is None:
            file_path = self.default_data_file
            
        if not os.path.exists(file_path):
            return False, f"文件不存在: {file_path}"
        
        try:
            test_data = self.load_test_data(file_path)
            if not test_data:
                return False, "文件中没有有效的测试数据"
            return True, f"成功加载 {len(test_data)} 个测试案例"
        except Exception as e:
            return False, f"文件格式错误: {str(e)}"


def main():
    """测试数据加载器的功能"""
    loader = GlazerTestDataLoader()
    
    print("===== Glazer测试数据加载器 =====\n")
    
    # 验证数据文件
    is_valid, message = loader.validate_data_file()
    print(f"数据文件验证: {message}")
    
    if is_valid:
        # 加载所有测试数据
        test_data = loader.load_test_data()
        print(f"\n成功加载 {len(test_data)} 个测试案例:")
        
        for i, case in enumerate(test_data):
            print(f"  {case['case_id']}: 前静息={case['pre_baseline_avg']:.2f}μV, "
                  f"快肌纤维={case['fast_twitch_max']:.2f}μV, "
                  f"慢肌纤维={case['tonic_avg']:.2f}μV")
        
        # 测试单个案例获取
        print("\n测试获取单个案例:")
        case = loader.get_test_case_by_index(0)
        if case:
            print(f"第一个案例: {case['case_id']}")
            print(f"  前静息平均值: {case['pre_baseline_avg']:.2f}μV")
            print(f"  快肌纤维最大值: {case['fast_twitch_max']:.2f}μV")
            print(f"  慢肌纤维平均值: {case['tonic_avg']:.2f}μV")
    
    print("\n测试完成")


if __name__ == "__main__":
    main()