#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
训练课程分析系统
分析14套盆底肌训练课程的详细内容，生成用户画像和课程适应性分析
"""

import pandas as pd
import re
import csv
from typing import Dict, List, Tuple
from dataclasses import dataclass
from collections import defaultdict
import os

@dataclass
class SessionAnalysis:
    """课节分析结果"""
    session_name: str
    content: str
    training_type: str
    duration: int
    purpose: str
    target_users: str

@dataclass
class CourseAnalysis:
    """课程分析结果"""
    course_name: str
    total_sessions: int
    session_analyses: List[SessionAnalysis]
    course_summary: str
    target_user_profile: str

class CourseAnalyzer:
    """训练课程分析器"""
    
    def __init__(self):
        self.training_purposes = {
            # 电刺激类型
            '促血流': '改善盆底血液循环，促进组织修复和营养供应',
            '肌肉放松': '缓解肌肉紧张，降低肌张力，改善肌肉柔韧性',
            'I类肌高强度': '强化快肌纤维，提高爆发力和收缩强度',
            'I类肌低强度': '温和刺激快肌纤维，适合初期康复',
            'I类肌中强度': '中等强度刺激快肌纤维，平衡训练',
            'II类肌高强度': '强化慢肌纤维，提高持久力',
            'II类肌低强度': '温和刺激慢肌纤维，基础耐力训练',
            'II类肌中强度': '中等强度慢肌纤维训练，提升耐力',
            '低频镇痛': '缓解疼痛，促进局部血液循环',
            '高频镇痛': '快速镇痛，阻断疼痛信号传导',
            '本体感觉恢复': '恢复肌肉本体感觉，提高肌肉控制精度',
            '遗尿肌过度活动抑制': '抑制膀胱过度活动，改善急迫性尿失禁',
            '遗尿肌收缩抑制': '减少膀胱异常收缩，控制尿意',
            '增强敏感性': '提高神经敏感性，改善感知能力',
            '增强兴奋性': '提高肌肉兴奋性，改善收缩能力',
            '混合电刺激': '综合多种电刺激模式，全面改善功能',
            
            # 凯格尔训练类型
            'I型肌初步训练': '快肌纤维基础训练，建立肌肉记忆',
            'I型肌加强训练': '快肌纤维强化训练，提升收缩力',
            'I型肌强化训练': '快肌纤维深度强化，最大化收缩能力',
            'II型肌初步训练': '慢肌纤维基础训练，建立持久收缩',
            'II型肌加强训练': '慢肌纤维强化训练，提升耐力',
            'II型肌强化训练': '慢肌纤维深度强化，最大化耐力',
            '混合肌初步训练': '快慢肌纤维协调训练基础',
            '混合肌增强训练': '快慢肌纤维协调强化训练',
            '快速收缩训练': '提高肌肉快速收缩能力和反应速度',
            'A3反射训练': '训练肛门收缩反射，改善控制能力',
            '盆底肌功能协调性训练': '提高盆底肌群协调性和整体功能',
            '肌肉收缩放松训练': '训练肌肉收缩和放松的协调性',
            '腹部-会阴部协调训练': '改善腹部和会阴部肌肉协调',
            '渐进控制收缩训练': '逐步提高肌肉控制精度',
            
            # 其他训练类型
            '音乐放松': '通过音乐放松身心，缓解紧张情绪',
            '游戏互动': '通过游戏化训练提高参与度和趣味性'
        }
        
        self.user_profiles = {
            '产后盆底康复': {
                '基本信息': '25-40岁女性，产后6周-2年，体重正常或轻度超重',
                '症状特征': '产后盆底肌松弛，轻度漏尿，阴道松弛，盆底支撑力下降',
                '评估特点': '快肌纤维功能下降，慢肌纤维耐力不足，整体肌张力偏低'
            },
            '私密抗衰养护': {
                '基本信息': '35-55岁女性，可能已绝经或围绝经期，关注私密健康',
                '症状特征': '阴道松弛，性生活质量下降，轻度器官脱垂倾向',
                '评估特点': '肌肉弹性下降，收缩力减弱，需要综合性改善'
            },
            '私密紧致回春（初步）': {
                '基本信息': '30-45岁女性，有生育史，开始关注私密紧致',
                '症状特征': '阴道松弛明显，性生活满意度下降，盆底支撑力不足',
                '评估特点': '快慢肌纤维功能均有下降，需要渐进式强化训练'
            },
            '私密紧致回春（增强）': {
                '基本信息': '已完成初步训练的女性，需要进一步强化效果',
                '症状特征': '在初步改善基础上，追求更好的紧致效果',
                '评估特点': '基础功能已有改善，可承受更高强度训练'
            },
            '私密按摩放松': {
                '基本信息': '各年龄段女性，盆底肌张力过高或疼痛',
                '症状特征': '盆底疼痛，肌肉紧张，性交痛，排便困难',
                '评估特点': '肌张力过高，需要先放松再强化'
            },
            '私密紧致': {
                '基本信息': '25-45岁女性，有明确的紧致需求',
                '症状特征': '阴道松弛，性生活质量下降，盆底功能减退',
                '评估特点': '快慢肌纤维功能下降，需要全面强化'
            },
            '私密放松': {
                '基本信息': '各年龄段女性，主要问题是肌肉过度紧张',
                '症状特征': '盆底疼痛，肌肉痉挛，排便困难，性交困难',
                '评估特点': '肌张力过高，静息状态异常，需要放松训练'
            },
            '压力性尿失禁': {
                '基本信息': '30-60岁女性，多有生育史或肥胖',
                '症状特征': '咳嗽、打喷嚏、运动时漏尿，盆底支撑力不足',
                '评估特点': '快肌纤维功能明显下降，收缩力不足'
            },
            '急迫性尿失禁': {
                '基本信息': '40-70岁女性，可能有神经系统疾病史',
                '症状特征': '突然尿意，难以控制，频繁夜尿',
                '评估特点': '膀胱过度活动，肌肉控制失调'
            },
            '混合型尿失禁': {
                '基本信息': '45-65岁女性，同时存在压力性和急迫性症状',
                '症状特征': '既有压力性漏尿，又有急迫性尿失禁',
                '评估特点': '多重功能障碍，需要综合治疗'
            },
            '盆腔脏器脱垂': {
                '基本信息': '40-70岁女性，多次生育或重体力劳动史',
                '症状特征': '盆腔器官下垂，坠胀感，排便排尿困难',
                '评估特点': '盆底支撑结构严重受损，需要强化训练'
            },
            '便秘(低张型)': {
                '基本信息': '各年龄段，盆底肌张力不足',
                '症状特征': '排便困难，盆底肌收缩力弱，便意不明显',
                '评估特点': '肌张力低下，需要兴奋性训练'
            },
            '便秘(高张型)': {
                '基本信息': '各年龄段，盆底肌张力过高',
                '症状特征': '排便困难，肌肉过度紧张，肛门痉挛',
                '评估特点': '肌张力过高，需要先放松再训练'
            },
            '盆底痛': {
                '基本信息': '20-50岁女性，可能有外伤或手术史',
                '症状特征': '持续性盆底疼痛，性交痛，坐立不安',
                '评估特点': '疼痛敏感，肌肉紧张，需要镇痛和放松'
            }
        }
    
    def parse_training_file(self, file_path: str) -> List[Dict]:
        """解析训练内容文件"""
        training_data = []
        
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                lines = f.readlines()
            
            for line in lines[1:]:  # 跳过标题行
                if line.strip():
                    parts = line.strip().split('\t')
                    if len(parts) >= 6:
                        training_data.append({
                            '训练课程': parts[0],
                            '节次': parts[1],
                            '课节序号': parts[2] if len(parts) > 2 else '',
                            '课节内容': parts[3] if len(parts) > 3 else '',
                            '训练类型': parts[4] if len(parts) > 4 else '',
                            '时长': int(parts[5]) if len(parts) > 5 and parts[5].isdigit() else 0
                        })
        except Exception as e:
            print(f"文件解析错误: {e}")
            return []
        
        return training_data
    
    def analyze_session(self, session_data: Dict) -> SessionAnalysis:
        """分析单个课节"""
        content = session_data['课节内容']
        training_type = session_data['训练类型']
        duration = session_data['时长']
        
        # 获取训练目的
        purpose = self.training_purposes.get(content, '未知训练内容，需要进一步分析')
        
        # 生成适应用户画像
        target_users = self._generate_session_user_profile(content, training_type, duration)
        
        return SessionAnalysis(
            session_name=f"{session_data['节次']}-{content}",
            content=content,
            training_type=training_type,
            duration=duration,
            purpose=purpose,
            target_users=target_users
        )
    
    def _generate_session_user_profile(self, content: str, training_type: str, duration: int) -> str:
        """生成课节适应用户画像"""
        profiles = []
        
        # 基于训练内容判断
        if '放松' in content:
            profiles.append('肌张力过高、疼痛敏感的用户')
        elif '高强度' in content:
            profiles.append('肌肉功能较好、可承受强刺激的用户')
        elif '低强度' in content:
            profiles.append('肌肉功能较弱、需要温和训练的用户')
        elif '初步' in content:
            profiles.append('初次接受训练、基础功能较弱的用户')
        elif '强化' in content:
            profiles.append('已有训练基础、需要进一步提升的用户')
        elif '促血流' in content:
            profiles.append('血液循环不良、组织修复需求的用户')
        elif '镇痛' in content:
            profiles.append('有疼痛症状、需要缓解不适的用户')
        elif '游戏' in content:
            profiles.append('年轻用户、需要趣味性训练的用户')
        
        # 基于训练类型判断
        if training_type == '电刺激':
            profiles.append('肌肉收缩能力较弱、需要被动刺激的用户')
        elif training_type == '凯格尔训练':
            profiles.append('有一定肌肉控制能力、可进行主动训练的用户')
        elif training_type == '触发电刺激':
            profiles.append('需要生物反馈训练、提高肌肉控制精度的用户')
        
        # 基于时长判断
        if duration <= 5:
            profiles.append('耐受性较低、需要短时间训练的用户')
        elif duration >= 20:
            profiles.append('耐受性较好、可进行长时间训练的用户')
        
        return '；'.join(profiles) if profiles else '适合大部分用户'
    
    def analyze_course(self, course_name: str, sessions: List[Dict]) -> CourseAnalysis:
        """分析整个课程"""
        session_analyses = []
        
        for session in sessions:
            analysis = self.analyze_session(session)
            session_analyses.append(analysis)
        
        # 生成课程汇总
        course_summary = self._generate_course_summary(course_name, session_analyses)
        
        # 生成详细的目标用户画像（包含具体字段属性值）
        target_profile = self._generate_detailed_user_profile(course_name, session_analyses)
        
        return CourseAnalysis(
            course_name=course_name,
            total_sessions=len(session_analyses),
            session_analyses=session_analyses,
            course_summary=course_summary,
            target_user_profile=str(target_profile)
        )
    
    def _generate_course_summary(self, course_name: str, sessions: List[SessionAnalysis]) -> str:
        """生成课程汇总分析"""
        # 统计训练类型分布
        type_count = defaultdict(int)
        content_count = defaultdict(int)
        total_duration = 0
        
        for session in sessions:
            type_count[session.training_type] += 1
            content_count[session.content] += 1
            total_duration += session.duration
        
        # 分析训练阶段
        phases = []
        if any('放松' in s.content for s in sessions[:3]):
            phases.append('初期以放松和血液循环改善为主')
        if any('高强度' in s.content for s in sessions):
            phases.append('中期进行强化训练')
        if any('游戏' in s.content for s in sessions):
            phases.append('后期结合游戏化训练提高趣味性')
        
        summary = f"""
        课程总体分析：
        - 总课节数：{len(sessions)}节
        - 总训练时长：{total_duration}分钟
        - 主要训练类型：{', '.join([f'{k}({v}节)' for k, v in type_count.items()])}
        - 训练阶段：{'; '.join(phases) if phases else '渐进式训练'}
        - 课程特点：针对{course_name}的专业化训练方案，采用循序渐进的训练模式
        """
        
        return summary.strip()
    
    def _generate_detailed_user_profile(self, course_name: str, sessions: List[SessionAnalysis]) -> Dict:
        """生成详细的用户画像字段属性值"""
        
        # 基础用户画像模板
        base_profile = {
            '基本信息': {
                '年龄范围': '30-45岁',
                '性别': '女性',
                '身高': '155-170cm',
                '体重': '正常或轻度超重',
                '生育史': '有生育史',
                '手术史': '无重大盆底手术史',
                '绝经状态': '未绝经',
                '主要症状': '盆底功能下降'
            },
            '最近一次评估报告': {
                '综合得分': '55-65分',
                '前静息阶段': {'平均得分': '12-18分', '等级': '一般'},
                '快肌纤维阶段': {'平均得分': '70-80分', '等级': '很好'},
                '慢肌纤维阶段': {'平均得分': '65-75分', '等级': '很好'},
                '耐力测试阶段': {'平均得分': '75-85分', '等级': '优秀'},
                '后静息阶段': {'平均得分': '15-25分', '等级': '较差'}
            }
        }
        
        # 根据课程特点调整用户画像
        if course_name == '产后盆底康复':
            base_profile['基本信息'].update({
                '年龄范围': '25-40岁',
                '生育史': '产后6周-2年',
                '主要症状': '产后盆底肌松弛，轻度漏尿'
            })
            base_profile['最近一次评估报告'].update({
                '综合得分': '40-50分',
                '快肌纤维阶段': {'平均得分': '45-55分', '等级': '一般'},
                '慢肌纤维阶段': {'平均得分': '40-50分', '等级': '一般'}
            })
            
        elif course_name == '私密抗衰养护':
            base_profile['基本信息'].update({
                '年龄范围': '35-55岁',
                '绝经状态': '围绝经期或已绝经',
                '主要症状': '阴道松弛，性生活质量下降'
            })
            base_profile['最近一次评估报告'].update({
                '综合得分': '50-60分',
                '快肌纤维阶段': {'平均得分': '55-65分', '等级': '一般'},
                '慢肌纤维阶段': {'平均得分': '50-60分', '等级': '一般'}
            })
            
        elif course_name == '私密紧致回春（初步）':
            base_profile['基本信息'].update({
                '年龄范围': '30-45岁',
                '生育史': '有生育史，多次怀孕',
                '主要症状': '阴道松弛明显，性生活满意度下降'
            })
            base_profile['最近一次评估报告'].update({
                '综合得分': '35-45分',
                '快肌纤维阶段': {'平均得分': '40-50分', '等级': '一般'},
                '慢肌纤维阶段': {'平均得分': '35-45分', '等级': '较差'}
            })
            
        elif course_name == '私密紧致回春（增强）':
            base_profile['基本信息'].update({
                '年龄范围': '30-45岁',
                '生育史': '已完成初步训练',
                '主要症状': '需要进一步强化紧致效果'
            })
            base_profile['最近一次评估报告'].update({
                '综合得分': '60-70分',
                '快肌纤维阶段': {'平均得分': '65-75分', '等级': '很好'},
                '慢肌纤维阶段': {'平均得分': '60-70分', '等级': '很好'}
            })
            
        elif course_name == '私密按摩放松':
            base_profile['基本信息'].update({
                '年龄范围': '25-50岁',
                '主要症状': '盆底疼痛，肌肉紧张，性交痛'
            })
            base_profile['最近一次评估报告'].update({
                '综合得分': '30-40分',
                '前静息阶段': {'平均得分': '3-8分', '等级': '较差'},
                '后静息阶段': {'平均得分': '5-12分', '等级': '较差'}
            })
            
        elif course_name == '私密紧致':
            base_profile['基本信息'].update({
                '年龄范围': '25-45岁',
                '主要症状': '阴道松弛，性生活质量下降'
            })
            base_profile['最近一次评估报告'].update({
                '综合得分': '45-55分',
                '快肌纤维阶段': {'平均得分': '50-60分', '等级': '一般'},
                '慢肌纤维阶段': {'平均得分': '45-55分', '等级': '一般'}
            })
            
        elif course_name == '私密放松':
            base_profile['基本信息'].update({
                '年龄范围': '20-50岁',
                '主要症状': '盆底疼痛，肌肉痉挛，排便困难'
            })
            base_profile['最近一次评估报告'].update({
                '综合得分': '25-35分',
                '前静息阶段': {'平均得分': '2-5分', '等级': '较差'},
                '后静息阶段': {'平均得分': '3-8分', '等级': '较差'}
            })
            
        elif course_name == '压力性尿失禁':
            base_profile['基本信息'].update({
                '年龄范围': '30-60岁',
                '生育史': '多次生育或肥胖',
                '主要症状': '咳嗽、打喷嚏、运动时漏尿'
            })
            base_profile['最近一次评估报告'].update({
                '综合得分': '35-45分',
                '快肌纤维阶段': {'平均得分': '30-40分', '等级': '较差'},
                '慢肌纤维阶段': {'平均得分': '40-50分', '等级': '一般'}
            })
            
        elif course_name == '急迫性尿失禁':
            base_profile['基本信息'].update({
                '年龄范围': '40-70岁',
                '手术史': '可能有神经系统疾病史',
                '主要症状': '突然尿意，难以控制，频繁夜尿'
            })
            base_profile['最近一次评估报告'].update({
                '综合得分': '30-40分',
                '快肌纤维阶段': {'平均得分': '35-45分', '等级': '较差'},
                '慢肌纤维阶段': {'平均得分': '30-40分', '等级': '较差'}
            })
            
        elif course_name == '混合型尿失禁':
            base_profile['基本信息'].update({
                '年龄范围': '45-65岁',
                '主要症状': '既有压力性漏尿，又有急迫性尿失禁'
            })
            base_profile['最近一次评估报告'].update({
                '综合得分': '30-40分',
                '快肌纤维阶段': {'平均得分': '25-35分', '等级': '较差'},
                '慢肌纤维阶段': {'平均得分': '27-37分', '等级': '较差'}
            })
            
        elif course_name == '盆腔脏器脱垂':
            base_profile['基本信息'].update({
                '年龄范围': '40-70岁',
                '生育史': '多次生育或重体力劳动史',
                '主要症状': '盆腔器官下垂，坠胀感，排便排尿困难'
            })
            base_profile['最近一次评估报告'].update({
                '综合得分': '20-30分',
                '快肌纤维阶段': {'平均得分': '15-25分', '等级': '较差'},
                '慢肌纤维阶段': {'平均得分': '20-30分', '等级': '较差'},
                '耐力测试阶段': {'平均得分': '25-35分', '等级': '较差'}
            })
            
        elif course_name == '便秘(低张型)':
            base_profile['基本信息'].update({
                '年龄范围': '20-60岁',
                '主要症状': '排便困难，盆底肌收缩力弱'
            })
            base_profile['最近一次评估报告'].update({
                '综合得分': '35-45分',
                '快肌纤维阶段': {'平均得分': '30-40分', '等级': '较差'},
                '慢肌纤维阶段': {'平均得分': '35-45分', '等级': '较差'}
            })
            
        elif course_name == '便秘(高张型)':
            base_profile['基本信息'].update({
                '年龄范围': '20-60岁',
                '主要症状': '排便困难，肌肉过度紧张，肛门痉挛'
            })
            base_profile['最近一次评估报告'].update({
                '综合得分': '40-50分',
                '前静息阶段': {'平均得分': '5-12分', '等级': '较差'},
                '后静息阶段': {'平均得分': '8-15分', '等级': '较差'}
            })
            
        elif course_name == '盆底痛':
            base_profile['基本信息'].update({
                '年龄范围': '20-50岁',
                '手术史': '可能有外伤或手术史',
                '主要症状': '持续性盆底疼痛，性交痛，坐立不安'
            })
            base_profile['最近一次评估报告'].update({
                '综合得分': '20-30分',
                '前静息阶段': {'平均得分': '1-5分', '等级': '较差'},
                '后静息阶段': {'平均得分': '2-6分', '等级': '较差'}
            })
        
        return base_profile
    
    def generate_comprehensive_user_profile(self, all_courses: List[CourseAnalysis]) -> Dict:
        """生成综合用户画像信息"""
        
        # 示例盆底评估数据（基于用户提供的数据）
        assessment_data = {
            '综合得分': 59.3,
            '前静息阶段': {'平均得分': 0.0, '等级': '较差'},
            '快肌纤维阶段': {'平均得分': 94.9, '等级': '优秀'},
            '慢肌纤维阶段': {'平均得分': 75.9, '等级': '很好'},
            '耐力测试阶段': {'平均得分': 99.5, '等级': '优秀'},
            '后静息阶段': {'平均得分': 26.4, '等级': '较差'},
            '优势区域': [
                '快肌纤维爆发力卓越，收缩力极其强劲',
                '肌肉反应速度很好，协调性较好',
                '快肌纤维恢复能力卓越，放松极其迅速',
                '慢肌纤维持续收缩能力卓越，耐力极强',
                '持续收缩稳定性优秀，控制精度优秀'
            ],
            '改进建议': [
                '前静息状态欠佳，需要重点进行放松训练',
                '前静息不够稳定，需要训练肌肉感知能力',
                '运动后恢复能力不足，需要加强恢复期放松训练'
            ]
        }
        
        # 基于评估数据推荐适合的课程
        recommended_courses = []
        
        # 前静息和后静息较差，推荐放松类课程
        if assessment_data['前静息阶段']['平均得分'] < 30 or assessment_data['后静息阶段']['平均得分'] < 30:
            recommended_courses.extend(['私密按摩放松', '私密放松', '便秘(高张型)'])
        
        # 快肌纤维优秀，可以进行强化训练
        if assessment_data['快肌纤维阶段']['平均得分'] > 80:
            recommended_courses.extend(['私密紧致', '私密紧致回春（增强）', '压力性尿失禁'])
        
        # 慢肌纤维很好，适合耐力训练
        if assessment_data['慢肌纤维阶段']['平均得分'] > 70:
            recommended_courses.extend(['产后盆底康复', '私密抗衰养护'])
        
        user_profile = {
            '基本信息': {
                '推荐年龄范围': '30-45岁',
                '性别': '女性',
                '身高': '155-170cm',
                '体重': '正常或轻度超重',
                '生育史': '有生育史，1-2次怀孕',
                '手术史': '无重大盆底手术史',
                '绝经状态': '未绝经或围绝经期',
                '主要症状': '轻度漏尿，阴道松弛，盆底功能下降'
            },
            '盆底评估数据': assessment_data,
            '推荐课程': list(set(recommended_courses)),
            '训练建议': {
                '优先级': '先进行放松训练，再进行强化训练',
                '训练频率': '每周3-4次',
                '单次时长': '30-45分钟',
                '训练周期': '12-16周'
            }
        }
        
        return user_profile
    
    def run_analysis(self, file_path: str, output_dir: str = None) -> None:
        """运行完整分析并生成多个CSV文件"""
        if output_dir is None:
            output_dir = "/Users/gunavy/Project/TRAE/FCBSAPP/训练方案/csv_reports"
        
        # 创建输出目录
        os.makedirs(output_dir, exist_ok=True)
        
        # 解析训练数据
        training_data = self.parse_training_file(file_path)
        if not training_data:
            print("❌ 错误：无法解析训练数据文件")
            return
        
        # 按课程分组
        courses = defaultdict(list)
        for data in training_data:
            courses[data['训练课程']].append(data)
        
        all_course_analyses = []
        for course_name, sessions in courses.items():
            course_analysis = self.analyze_course(course_name, sessions)
            all_course_analyses.append(course_analysis)
        
        # 生成多个CSV文件
        self._generate_course_overview_csv(all_course_analyses, output_dir)
        self._generate_session_details_csv(all_course_analyses, output_dir)
        self._generate_course_summary_csv(all_course_analyses, output_dir)
        self._generate_user_profiles_csv(all_course_analyses, output_dir)
        self._generate_assessment_reports_csv(all_course_analyses, output_dir)
        
        print(f"✅ 分析完成！CSV报告已保存到：{output_dir}")
        print("生成的文件包括：")
        print("- 课程概览.csv")
        print("- 课节详细分析.csv")
        print("- 课程汇总分析.csv")
        print("- 用户基本信息.csv")
        print("- 评估报告数据.csv")
    
    def _generate_course_overview_csv(self, all_course_analyses: List[CourseAnalysis], output_dir: str) -> None:
        """生成课程概览CSV文件"""
        data = []
        for i, course_analysis in enumerate(all_course_analyses, 1):
            # 统计训练类型
            type_count = defaultdict(int)
            total_duration = 0
            for session in course_analysis.session_analyses:
                type_count[session.training_type] += 1
                total_duration += session.duration
            
            main_types = ', '.join([f'{k}({v})' for k, v in sorted(type_count.items(), key=lambda x: x[1], reverse=True)])
            
            data.append({
                '序号': i,
                '课程名称': course_analysis.course_name,
                '课节数': course_analysis.total_sessions,
                '总时长(分钟)': total_duration,
                '主要训练类型': main_types
            })
        
        df = pd.DataFrame(data)
        df.to_csv(os.path.join(output_dir, '课程概览.csv'), index=False, encoding='utf-8-sig')
    
    def _generate_session_details_csv(self, all_course_analyses: List[CourseAnalysis], output_dir: str) -> None:
        """生成课节详细分析CSV文件"""
        data = []
        for course_analysis in all_course_analyses:
            for session in course_analysis.session_analyses:
                data.append({
                    '课程名称': course_analysis.course_name,
                    '课节名称': session.session_name,
                    '训练内容': session.content,
                    '训练类型': session.training_type,
                    '时长(分钟)': session.duration,
                    '训练目的': session.purpose,
                    '适应用户': session.target_users
                })
        
        df = pd.DataFrame(data)
        df.to_csv(os.path.join(output_dir, '课节详细分析.csv'), index=False, encoding='utf-8-sig')
    
    def _generate_course_summary_csv(self, all_course_analyses: List[CourseAnalysis], output_dir: str) -> None:
        """生成课程汇总分析CSV文件"""
        data = []
        for course_analysis in all_course_analyses:
            # 统计各类型课节数
            type_count = defaultdict(int)
            total_duration = 0
            for session in course_analysis.session_analyses:
                type_count[session.training_type] += 1
                total_duration += session.duration
            
            electric_count = type_count.get('电刺激', 0)
            kegel_count = type_count.get('凯格尔训练', 0)
            trigger_count = type_count.get('触发电刺激', 0)
            
            data.append({
                '课程名称': course_analysis.course_name,
                '总课节数': course_analysis.total_sessions,
                '总时长(分钟)': total_duration,
                '电刺激课节': electric_count,
                '凯格尔课节': kegel_count,
                '触发电刺激课节': trigger_count,
                '课程特点': f"针对{course_analysis.course_name}的专业训练"
            })
        
        df = pd.DataFrame(data)
        df.to_csv(os.path.join(output_dir, '课程汇总分析.csv'), index=False, encoding='utf-8-sig')
    
    def _generate_user_profiles_csv(self, all_course_analyses: List[CourseAnalysis], output_dir: str) -> None:
        """生成用户基本信息CSV文件"""
        data = []
        for course_analysis in all_course_analyses:
            try:
                profile_dict = eval(course_analysis.target_user_profile)
                basic_info = profile_dict['基本信息']
                
                row = {'课程名称': course_analysis.course_name}
                row.update(basic_info)
                data.append(row)
            except:
                continue
        
        df = pd.DataFrame(data)
        df.to_csv(os.path.join(output_dir, '用户基本信息.csv'), index=False, encoding='utf-8-sig')
    
    def _generate_assessment_reports_csv(self, all_course_analyses: List[CourseAnalysis], output_dir: str) -> None:
        """生成评估报告数据CSV文件"""
        data = []
        for course_analysis in all_course_analyses:
            try:
                profile_dict = eval(course_analysis.target_user_profile)
                assessment = profile_dict['最近一次评估报告']
                
                data.append({
                    '课程名称': course_analysis.course_name,
                    '综合得分范围': assessment['综合得分'],
                    '前静息阶段_得分范围': assessment['前静息阶段']['平均得分'],
                    '前静息阶段_等级': assessment['前静息阶段']['等级'],
                    '快肌纤维阶段_得分范围': assessment['快肌纤维阶段']['平均得分'],
                    '快肌纤维阶段_等级': assessment['快肌纤维阶段']['等级'],
                    '慢肌纤维阶段_得分范围': assessment['慢肌纤维阶段']['平均得分'],
                    '慢肌纤维阶段_等级': assessment['慢肌纤维阶段']['等级'],
                    '耐力测试阶段_得分范围': assessment['耐力测试阶段']['平均得分'],
                    '耐力测试阶段_等级': assessment['耐力测试阶段']['等级'],
                    '后静息阶段_得分范围': assessment['后静息阶段']['平均得分'],
                    '后静息阶段_等级': assessment['后静息阶段']['等级']
                })
            except:
                continue
        
        df = pd.DataFrame(data)
        df.to_csv(os.path.join(output_dir, '评估报告数据.csv'), index=False, encoding='utf-8-sig')
    
    def _write_to_file(self, lines: List[str], file_path: str) -> None:
        """将内容写入文件"""
        try:
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write('\n'.join(lines))
        except Exception as e:
            print(f"❌ 文件写入失败：{e}")

def main():
    """主函数"""
    analyzer = CourseAnalyzer()
    file_path = "/Users/gunavy/Project/TRAE/FCBSAPP/训练方案/训练内容.txt"
    analyzer.run_analysis(file_path)

if __name__ == "__main__":
    main()