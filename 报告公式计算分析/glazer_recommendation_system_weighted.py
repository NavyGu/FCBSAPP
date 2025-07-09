#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Glazer评估建议系统 - 基于权重的分级优化版本
根据各阶段权重和指标重要性设计差异化的评估等级划分

权重设计原则：
- 高权重阶段（fast_twitch: 0.3, tonic: 0.3）：采用7级详细划分
- 中权重阶段（endurance: 0.2）：采用5级标准划分
- 低权重阶段（pre_baseline: 0.1, post_baseline: 0.1）：采用3级简化划分
"""

import math
from typing import Dict, List, Tuple

class GlazerRecommendationSystemWeighted:
    def __init__(self):
        # 定义各阶段权重（用于计算优先级）
        self.stage_importance = {
            'fast_twitch': 0.3,     # 快肌纤维最重要
            'tonic': 0.3,           # 慢肌纤维同等重要
            'endurance': 0.2,       # 耐力次之
            'pre_baseline': 0.1,    # 前静息较低
            'post_baseline': 0.1    # 后静息较低
        }
        
        # 根据权重设计差异化的评估等级体系
        self.weighted_score_levels = {
            # 高权重阶段：7级详细划分
            'high_weight': {
                'exceptional': 95,    # 卓越
                'excellent': 85,      # 优秀
                'very_good': 75,      # 很好
                'good': 65,           # 良好
                'fair': 55,           # 及格
                'poor': 40,           # 较差
                'very_poor': 0        # 很差
            },
            # 中权重阶段：5级标准划分
            'medium_weight': {
                'excellent': 85,      # 优秀
                'good': 70,           # 良好
                'fair': 55,           # 及格
                'poor': 40,           # 较差
                'very_poor': 0        # 很差
            },
            # 低权重阶段：3级简化划分
            'low_weight': {
                'good': 70,           # 良好
                'fair': 50,           # 及格
                'poor': 0             # 较差
            }
        }
        
        # 阶段权重分类映射
        self.stage_weight_category = {
            'fast_twitch': 'high_weight',
            'tonic': 'high_weight',
            'endurance': 'medium_weight',
            'pre_baseline': 'low_weight',
            'post_baseline': 'low_weight'
        }
        
        # 定义各阶段具体指标的评价体系（基于权重差异化设计）
        self.indicator_evaluation_system = {
            # 高权重阶段：快肌纤维（7级详细划分）
            'fast_twitch': {
                'max_score': {
                    'exceptional': {'range': (95, 100), 'evaluation': '快肌纤维爆发力卓越，收缩力极其强劲', 'recommendations': ['保持卓越的爆发力水平', '可以担任高水平运动指导', '考虑参与专业竞技']},
                    'excellent': {'range': (85, 94), 'evaluation': '快肌纤维爆发力优秀，收缩力强劲', 'recommendations': ['保持优秀的爆发力', '可以进行高强度间歇训练', '尝试更具挑战性的动作']},
                    'very_good': {'range': (75, 84), 'evaluation': '快肌纤维爆发力很好，收缩能力较强', 'recommendations': ['继续保持良好的爆发力训练', '适当增加训练强度', '可以尝试进阶训练']},
                    'good': {'range': (65, 74), 'evaluation': '快肌纤维爆发力良好，有进一步提升潜力', 'recommendations': ['加强爆发力专项训练', '增加快速收缩练习', '保持训练连续性']},
                    'fair': {'range': (55, 64), 'evaluation': '快肌纤维爆发力及格，需要重点改善', 'recommendations': ['重点进行爆发力训练', '加强快速收缩训练', '进行Kegel运动']},
                    'poor': {'range': (40, 54), 'evaluation': '快肌纤维爆发力不足，收缩力较弱', 'recommendations': ['优先进行基础力量训练', '练习快速启动-停止动作', '逐步增加训练强度']},
                    'very_poor': {'range': (0, 39), 'evaluation': '快肌纤维爆发力很差，收缩力严重不足', 'recommendations': ['从基础力量训练开始', '需要循序渐进的训练计划', '建议寻求专业康复指导']}
                },
                'rise_time_score': {
                    'exceptional': {'range': (95, 100), 'evaluation': '肌肉反应速度卓越，神经肌肉协调性极佳', 'recommendations': ['保持卓越的反应速度', '可以进行最高难度的协调性训练', '考虑专业运动指导']},
                    'excellent': {'range': (85, 94), 'evaluation': '肌肉反应速度优秀，神经肌肉协调性优秀', 'recommendations': ['保持优秀的反应速度', '可以进行复杂的协调性训练', '尝试高难度动作']},
                    'very_good': {'range': (75, 84), 'evaluation': '肌肉反应速度很好，协调性较好', 'recommendations': ['继续保持良好的反应速度', '适当增加训练复杂度', '加强精细控制训练']},
                    'good': {'range': (65, 74), 'evaluation': '肌肉反应速度良好，协调性有提升空间', 'recommendations': ['加强反应速度训练', '增加协调性练习', '使用节拍器辅助训练']},
                    'fair': {'range': (55, 64), 'evaluation': '肌肉反应速度及格，协调性需要改善', 'recommendations': ['重点训练反应速度', '练习节拍器辅助的快速收缩', '加强神经肌肉协调训练']},
                    'poor': {'range': (40, 54), 'evaluation': '肌肉反应速度较慢，协调性较差', 'recommendations': ['优先进行反应速度训练', '加强神经肌肉协调性训练', '使用节拍器辅助训练']},
                    'very_poor': {'range': (0, 39), 'evaluation': '肌肉反应速度很慢，协调性很差', 'recommendations': ['从基础反应训练开始', '需要大量的协调性练习', '考虑神经肌肉康复训练']}
                },
                'recovery_time_score': {
                    'exceptional': {'range': (95, 100), 'evaluation': '快肌纤维恢复能力卓越，放松极其迅速', 'recommendations': ['保持卓越的恢复能力', '可以进行最高频次训练', '可以指导他人训练']},
                    'excellent': {'range': (85, 94), 'evaluation': '快肌纤维恢复能力优秀，放松迅速', 'recommendations': ['保持优秀的恢复能力', '可以进行高频次训练', '尝试更高强度训练']},
                    'very_good': {'range': (75, 84), 'evaluation': '快肌纤维恢复能力很好，放松较快', 'recommendations': ['继续保持良好的恢复能力', '适当增加训练频次', '保持训练质量']},
                    'good': {'range': (65, 74), 'evaluation': '快肌纤维恢复能力良好，放松速度可以提升', 'recommendations': ['加强放松训练', '改善训练间歇的恢复质量', '学习更好的放松技巧']},
                    'fair': {'range': (55, 64), 'evaluation': '快肌纤维恢复能力及格，放松速度需要改善', 'recommendations': ['重点进行放松训练', '延长训练间歇时间', '学习深度放松技巧']},
                    'poor': {'range': (40, 54), 'evaluation': '快肌纤维恢复较慢，可能存在紧张', 'recommendations': ['优先进行放松训练', '大幅延长训练间歇时间', '检查是否存在肌肉紧张']},
                    'very_poor': {'range': (0, 39), 'evaluation': '快肌纤维恢复很慢，存在明显紧张或疲劳', 'recommendations': ['必须加强放松训练', '大幅延长恢复时间', '可能需要物理治疗']}
                }
            },
            
            # 高权重阶段：慢肌纤维（7级详细划分）
            'tonic': {
                'avg_score': {
                    'exceptional': {'range': (95, 100), 'evaluation': '慢肌纤维持续收缩能力卓越，耐力极强', 'recommendations': ['保持卓越的持续收缩能力', '可以进行最长时间高强度训练', '可以担任专业指导']},
                    'excellent': {'range': (85, 94), 'evaluation': '慢肌纤维持续收缩能力优秀，耐力强', 'recommendations': ['保持优秀的持续收缩能力', '可以进行长时间高强度训练', '尝试更高难度训练']},
                    'very_good': {'range': (75, 84), 'evaluation': '慢肌纤维持续收缩能力很好，耐力较强', 'recommendations': ['继续保持良好的持续收缩能力', '适当延长训练时间', '增加训练强度']},
                    'good': {'range': (65, 74), 'evaluation': '慢肌纤维持续收缩能力良好，耐力有提升空间', 'recommendations': ['加强持续收缩训练', '逐步延长收缩保持时间', '保持训练规律性']},
                    'fair': {'range': (55, 64), 'evaluation': '慢肌纤维持续收缩能力及格，耐力需要提升', 'recommendations': ['重点进行耐力训练', '加强持续收缩训练', '逐步延长收缩保持时间']},
                    'poor': {'range': (40, 54), 'evaluation': '慢肌纤维持续收缩能力不足，耐力较弱', 'recommendations': ['优先进行耐力训练', '从短时间持续收缩开始', '逐步增加持续时间']},
                    'very_poor': {'range': (0, 39), 'evaluation': '慢肌纤维持续收缩能力很差，耐力严重不足', 'recommendations': ['从基础耐力训练开始', '需要循序渐进的训练计划', '可能需要专业康复指导']}
                },
                'var_score': {
                    'exceptional': {'range': (95, 100), 'evaluation': '持续收缩稳定性卓越，控制精度极佳', 'recommendations': ['保持卓越的稳定性', '可以进行最精细的控制训练', '可以指导他人训练']},
                    'excellent': {'range': (85, 94), 'evaluation': '持续收缩稳定性优秀，控制精度优秀', 'recommendations': ['保持优秀的稳定性', '可以进行精细控制训练', '尝试更高难度控制']},
                    'very_good': {'range': (75, 84), 'evaluation': '持续收缩稳定性很好，控制精度较好', 'recommendations': ['继续保持良好的稳定性', '适当增加控制难度', '加强精确性训练']},
                    'good': {'range': (65, 74), 'evaluation': '持续收缩稳定性良好，控制精度可以改善', 'recommendations': ['加强稳定性训练', '使用生物反馈进行精确控制训练', '提高控制精度']},
                    'fair': {'range': (55, 64), 'evaluation': '持续收缩稳定性及格，控制精度需要改善', 'recommendations': ['重点训练稳定性', '加强稳定性训练', '使用生物反馈进行精确控制训练']},
                    'poor': {'range': (40, 54), 'evaluation': '持续收缩稳定性较差，控制精度不足', 'recommendations': ['优先训练稳定性', '加强本体感觉训练', '使用视觉反馈辅助']},
                    'very_poor': {'range': (0, 39), 'evaluation': '持续收缩极不稳定，控制精度很差', 'recommendations': ['从基础稳定性训练开始', '需要大量的控制练习', '必须使用反馈设备']}
                }
            },
            
            # 中权重阶段：耐力（5级标准划分）
            'endurance': {
                'avg_score': {
                    'excellent': {'range': (85, 100), 'evaluation': '肌肉耐力优秀，长时间工作能力强', 'recommendations': ['保持优秀的耐力水平', '可以进行马拉松式训练']},
                    'good': {'range': (70, 84), 'evaluation': '肌肉耐力良好，长时间工作能力较强', 'recommendations': ['继续保持良好的耐力', '适当增加训练时长']},
                    'fair': {'range': (55, 69), 'evaluation': '肌肉耐力一般，长时间工作能力需要提升', 'recommendations': ['加强耐力训练', '逐步延长训练持续时间']},
                    'poor': {'range': (40, 54), 'evaluation': '肌肉耐力不足，长时间工作能力较弱', 'recommendations': ['重点进行耐力训练', '从短时间开始逐步增加', '加强有氧代谢训练']},
                    'very_poor': {'range': (0, 39), 'evaluation': '肌肉耐力很差，长时间工作能力严重不足', 'recommendations': ['从基础耐力训练开始', '需要循序渐进的训练计划', '可能需要专业康复指导']}
                },
                'fatigue_score': {
                    'excellent': {'range': (85, 100), 'evaluation': '抗疲劳能力优秀，疲劳恢复快', 'recommendations': ['保持优秀的抗疲劳能力', '可以进行高强度持续训练']},
                    'good': {'range': (70, 84), 'evaluation': '抗疲劳能力良好，疲劳恢复较快', 'recommendations': ['继续保持良好的抗疲劳能力', '适当增加训练强度']},
                    'fair': {'range': (55, 69), 'evaluation': '抗疲劳能力一般，疲劳恢复需要改善', 'recommendations': ['加强抗疲劳训练', '改善恢复策略']},
                    'poor': {'range': (40, 54), 'evaluation': '抗疲劳能力较差，容易疲劳', 'recommendations': ['降低训练强度', '增加恢复时间', '加强肌肉代谢能力训练']},
                    'very_poor': {'range': (0, 39), 'evaluation': '抗疲劳能力很差，极易疲劳', 'recommendations': ['大幅降低训练强度', '延长恢复时间', '可能需要专业康复指导']}
                }
            },
            
            # 低权重阶段：前静息（3级简化划分）
            'pre_baseline': {
                'avg_score': {
                    'good': {'range': (70, 100), 'evaluation': '前静息状态良好，肌肉基础放松能力较好', 'recommendations': ['保持良好的放松状态', '可适当增加训练强度']},
                    'fair': {'range': (50, 69), 'evaluation': '前静息状态基本正常，但仍有改善空间', 'recommendations': ['加强日常放松练习', '注意训练前的充分准备']},
                    'poor': {'range': (0, 49), 'evaluation': '前静息状态欠佳，肌肉紧张度较高', 'recommendations': ['重点进行放松训练', '学习深呼吸技巧', '检查是否存在慢性紧张']}
                },
                'var_score': {
                    'good': {'range': (70, 100), 'evaluation': '前静息稳定性良好，控制能力较强', 'recommendations': ['保持稳定的控制能力', '适当增加训练难度']},
                    'fair': {'range': (50, 69), 'evaluation': '前静息稳定性一般，控制能力需要提升', 'recommendations': ['加强肌肉感知训练', '练习静息状态的稳定性']},
                    'poor': {'range': (0, 49), 'evaluation': '前静息不够稳定，肌肉控制能力较弱', 'recommendations': ['重点训练肌肉感知能力', '练习静息状态下的肌肉控制', '使用生物反馈辅助训练']}
                }
            },
            # 低权重阶段：后静息（3级简化划分）
            'post_baseline': {
                'avg_score': {
                    'good': {'range': (70, 100), 'evaluation': '运动后恢复能力良好，较快回到基线', 'recommendations': ['保持良好的恢复能力', '适当增加训练频次']},
                    'fair': {'range': (50, 69), 'evaluation': '运动后恢复能力一般，恢复速度需要改善', 'recommendations': ['加强恢复训练', '改善训练后的放松策略']},
                    'poor': {'range': (0, 49), 'evaluation': '运动后恢复能力不足，难以回到基线', 'recommendations': ['延长训练间歇时间', '加强恢复期的放松训练', '避免过度疲劳']}
                },
                'var_score': {
                    'good': {'range': (70, 100), 'evaluation': '运动后恢复稳定性良好，控制能力强', 'recommendations': ['保持稳定的恢复状态', '可以尝试更高强度训练']},
                    'fair': {'range': (50, 69), 'evaluation': '运动后恢复稳定性一般，波动需要改善', 'recommendations': ['加强恢复期的稳定性训练', '注意保持均匀的放松节奏']},
                    'poor': {'range': (0, 49), 'evaluation': '运动后恢复极不稳定，控制能力差', 'recommendations': ['重点训练恢复期的稳定性', '使用生物反馈辅助训练', '建议专业指导']}
                }
            }
        }
    
    def get_stage_weight_category(self, stage: str) -> str:
        """获取阶段权重分类"""
        return self.stage_weight_category.get(stage, 'medium_weight')
    
    def get_score_level_by_weight(self, score: float, weight_category: str) -> str:
        """根据权重分类获取得分等级"""
        levels = self.weighted_score_levels[weight_category]
        
        # 按分数从高到低检查等级
        for level, threshold in sorted(levels.items(), key=lambda x: x[1], reverse=True):
            if score >= threshold:
                return level
        
        # 如果都不满足，返回最低等级
        return list(levels.keys())[-1]
    
    def get_level_name_chinese(self, level: str) -> str:
        """获取等级的中文名称"""
        level_names = {
            'exceptional': '卓越',
            'excellent': '优秀',
            'very_good': '很好',
            'good': '良好', 
            'fair': '及格',
            'poor': '较差',
            'very_poor': '很差'
        }
        return level_names.get(level, level)
    
    def analyze_indicator_by_score(self, stage: str, indicator: str, score: float) -> Dict:
        """根据得分分析具体指标"""
        if stage not in self.indicator_evaluation_system:
            return {'evaluation': '未知阶段', 'recommendations': [], 'level': 'unknown'}
        
        if indicator not in self.indicator_evaluation_system[stage]:
            return {'evaluation': '未知指标', 'recommendations': [], 'level': 'unknown'}
        
        indicator_system = self.indicator_evaluation_system[stage][indicator]
        weight_category = self.get_stage_weight_category(stage)
        level = self.get_score_level_by_weight(score, weight_category)
        
        if level in indicator_system:
            return {
                'evaluation': indicator_system[level]['evaluation'],
                'recommendations': indicator_system[level]['recommendations'],
                'level': level,
                'level_name': self.get_level_name_chinese(level),
                'score': score,
                'weight_category': weight_category
            }
        else:
            return {'evaluation': '评分异常', 'recommendations': [], 'level': 'unknown'}
    
    def analyze_stage_comprehensive(self, stage: str, indicator_scores: Dict[str, float]) -> Dict:
        """综合分析某个阶段的所有指标"""
        stage_analysis = {
            'stage_name': stage,
            'stage_weight': self.stage_importance.get(stage, 0),
            'weight_category': self.get_stage_weight_category(stage),
            'indicators': {},
            'overall_evaluation': '',
            'key_recommendations': [],
            'strengths': [],
            'weaknesses': [],
            'average_score': 0
        }
        
        total_score = 0
        indicator_count = 0
        
        # 分析每个指标
        for indicator, score in indicator_scores.items():
            analysis = self.analyze_indicator_by_score(stage, indicator, score)
            stage_analysis['indicators'][indicator] = analysis
            total_score += score
            indicator_count += 1
            
            # 根据权重分类收集优势和劣势
            weight_category = stage_analysis['weight_category']
            if weight_category == 'high_weight':
                # 高权重阶段：更严格的标准
                if analysis['level'] in ['exceptional', 'excellent', 'very_good']:
                    stage_analysis['strengths'].append({
                        'indicator': indicator,
                        'evaluation': analysis['evaluation'],
                        'level': analysis['level_name']
                    })
                elif analysis['level'] in ['fair', 'poor', 'very_poor']:
                    stage_analysis['weaknesses'].append({
                        'indicator': indicator,
                        'evaluation': analysis['evaluation'],
                        'recommendations': analysis['recommendations']
                    })
            elif weight_category == 'medium_weight':
                # 中权重阶段：标准判断
                if analysis['level'] in ['excellent', 'good']:
                    stage_analysis['strengths'].append({
                        'indicator': indicator,
                        'evaluation': analysis['evaluation'],
                        'level': analysis['level_name']
                    })
                elif analysis['level'] in ['poor', 'very_poor']:
                    stage_analysis['weaknesses'].append({
                        'indicator': indicator,
                        'evaluation': analysis['evaluation'],
                        'recommendations': analysis['recommendations']
                    })
            else:
                # 低权重阶段：宽松标准
                if analysis['level'] == 'good':
                    stage_analysis['strengths'].append({
                        'indicator': indicator,
                        'evaluation': analysis['evaluation'],
                        'level': analysis['level_name']
                    })
                elif analysis['level'] == 'poor':
                    stage_analysis['weaknesses'].append({
                        'indicator': indicator,
                        'evaluation': analysis['evaluation'],
                        'recommendations': analysis['recommendations']
                    })
            
            # 收集关键建议
            stage_analysis['key_recommendations'].extend(analysis['recommendations'])
        
        # 计算平均分
        if indicator_count > 0:
            stage_analysis['average_score'] = total_score / indicator_count
        
        # 生成整体评价
        weight_category = stage_analysis['weight_category']
        avg_level = self.get_score_level_by_weight(stage_analysis['average_score'], weight_category)
        stage_analysis['overall_level'] = avg_level
        stage_analysis['overall_level_name'] = self.get_level_name_chinese(avg_level)
        
        # 去重建议
        stage_analysis['key_recommendations'] = list(set(stage_analysis['key_recommendations']))
        
        return stage_analysis
    
    def generate_comprehensive_analysis(self, assessment_data: Dict) -> Dict:
        """生成综合分析报告
        
        Args:
            assessment_data: 完整的评估数据结构
                格式: {
                    'stage_scores': {...},           # 各阶段总得分
                    'stage_indicator_scores': {...}, # 各阶段详细指标得分
                    'total_score': 65.5,            # 最终总得分
                    'input_data': {...}             # 原始输入数据
                }
        
        Returns:
            综合分析报告字典
        """
        # 提取评估数据
        stage_indicator_scores = assessment_data['stage_indicator_scores']
        stage_scores = assessment_data.get('stage_scores', {})
        total_score_provided = assessment_data.get('total_score', 0)
        input_data = assessment_data.get('input_data', {})
        
        comprehensive_report = {
            'overall_score': 0,
            'stage_analyses': {},
            'priority_improvements': [],
            'strengths_summary': [],
            'course_recommendations': {},
            'training_suggestions': {
                'intensity': '',
                'duration': '',
                'frequency': '',
                'focus_areas': []
            },
            # 新增字段：保存完整的评估数据
            'stage_scores': stage_scores,
            'total_score_provided': total_score_provided,
            'input_data': input_data
        }
        
        total_score = 0
        total_indicators = 0
        
        # 分析各阶段
        for stage, indicator_scores in stage_indicator_scores.items():
            stage_analysis = self.analyze_stage_comprehensive(stage, indicator_scores)
            comprehensive_report['stage_analyses'][stage] = stage_analysis
            
            # 计算总分
            total_score += stage_analysis['average_score']
            total_indicators += 1
            
            # 获取阶段权重用于优先级计算
            stage_weight = self.stage_importance.get(stage, 0)
            
            # 收集优势
            comprehensive_report['strengths_summary'].extend(stage_analysis['strengths'])
            
            # 收集需要改进的区域（基于权重优先级）
            if stage_analysis['weaknesses']:
                for weakness in stage_analysis['weaknesses']:
                    comprehensive_report['priority_improvements'].append({
                        'stage': stage,
                        'stage_weight': stage_weight,
                        'weight_category': stage_analysis['weight_category'],
                        'indicator': weakness['indicator'],
                        'evaluation': weakness['evaluation'],
                        'recommendations': weakness['recommendations'],
                        'priority_score': stage_weight * (100 - stage_analysis['average_score'])  # 权重 * 改进空间
                    })
        
        # 计算最终得分
        if total_score_provided > 0:
            # 如果提供了总分，优先使用提供的总分
            comprehensive_report['overall_score'] = total_score_provided
        else:
            # 否则使用计算得出的平均分
            comprehensive_report['overall_score'] = total_score / total_indicators if total_indicators > 0 else 0
        
        # 按优先级排序改进建议
        comprehensive_report['priority_improvements'].sort(key=lambda x: x['priority_score'], reverse=True)
        
        # 生成课程推荐
        comprehensive_report['course_recommendations'] = self.generate_course_matching_data(comprehensive_report)
        
        # 生成训练建议
        comprehensive_report['training_suggestions'] = self.generate_training_suggestions(comprehensive_report)
        
        return comprehensive_report
    
    def generate_course_matching_data(self, comprehensive_report: Dict) -> Dict:
        """生成课程匹配数据"""
        course_data = {
            'recommended_courses': [],
            'course_priorities': {},
            'training_focus': []
        }
        
        # 基于优先级改进建议推荐课程
        top_priorities = comprehensive_report['priority_improvements'][:3]  # 取前3个优先级
        
        for priority in top_priorities:
            stage = priority['stage']
            weight_category = priority['weight_category']
            
            if stage == 'fast_twitch':
                course_data['recommended_courses'].append({
                    'name': '快肌纤维专项训练',
                    'description': '针对快肌纤维爆发力和反应速度的专项训练',
                    'priority': 'high' if weight_category == 'high_weight' else 'medium',
                    'duration': '4-6周',
                    'frequency': '每周3-4次'
                })
                course_data['training_focus'].append('快肌纤维强化')
                
            elif stage == 'tonic':
                course_data['recommended_courses'].append({
                    'name': '慢肌纤维耐力训练',
                    'description': '提升持续收缩能力和稳定性的训练',
                    'priority': 'high' if weight_category == 'high_weight' else 'medium',
                    'duration': '6-8周',
                    'frequency': '每周4-5次'
                })
                course_data['training_focus'].append('慢肌纤维耐力')
                
            elif stage == 'endurance':
                course_data['recommended_courses'].append({
                    'name': '综合耐力提升训练',
                    'description': '全面提升肌肉耐力和抗疲劳能力',
                    'priority': 'medium',
                    'duration': '8-10周',
                    'frequency': '每周3-4次'
                })
                course_data['training_focus'].append('整体耐力')
                
            elif stage in ['pre_baseline', 'post_baseline']:
                course_data['recommended_courses'].append({
                    'name': '放松与恢复训练',
                    'description': '改善肌肉放松能力和恢复效率',
                    'priority': 'low',
                    'duration': '2-4周',
                    'frequency': '每周2-3次'
                })
                course_data['training_focus'].append('放松恢复')
        
        return course_data
    
    def generate_training_suggestions(self, comprehensive_report: Dict) -> Dict:
        """生成训练建议"""
        overall_score = comprehensive_report['overall_score']
        
        suggestions = {
            'intensity': '',
            'duration': '',
            'frequency': '',
            'focus_areas': []
        }
        
        # 根据总得分确定训练强度
        if overall_score >= 80:
            suggestions['intensity'] = '高强度'
            suggestions['duration'] = '45-60分钟'
            suggestions['frequency'] = '每周4-5次'
        elif overall_score >= 65:
            suggestions['intensity'] = '中高强度'
            suggestions['duration'] = '30-45分钟'
            suggestions['frequency'] = '每周3-4次'
        elif overall_score >= 50:
            suggestions['intensity'] = '中等强度'
            suggestions['duration'] = '20-30分钟'
            suggestions['frequency'] = '每周2-3次'
        else:
            suggestions['intensity'] = '低强度'
            suggestions['duration'] = '15-20分钟'
            suggestions['frequency'] = '每周2次'
        
        # 确定重点训练区域
        top_priorities = comprehensive_report['priority_improvements'][:2]
        for priority in top_priorities:
            stage = priority['stage']
            if stage == 'fast_twitch':
                suggestions['focus_areas'].append('快肌纤维爆发力训练')
            elif stage == 'tonic':
                suggestions['focus_areas'].append('慢肌纤维耐力训练')
            elif stage == 'endurance':
                suggestions['focus_areas'].append('整体耐力提升')
            else:
                suggestions['focus_areas'].append('基础放松训练')
        
        return suggestions
    
    def format_report_text(self, comprehensive_report: Dict) -> str:
        """将报告格式化为可读文本"""
        text = "\n=== Glazer肌电评估报告（基于权重优化版本）===\n\n"
        
        # 总体得分
        text += f"📊 **总体评估**\n"
        text += f"- 综合得分：{comprehensive_report['overall_score']:.1f}分\n\n"
        
        # 各阶段详细分析
        text += "📋 **各阶段详细分析**\n"
        for stage_name, analysis in comprehensive_report['stage_analyses'].items():
            stage_chinese = {
                'pre_baseline': '前静息',
                'fast_twitch': '快肌纤维',
                'tonic': '慢肌纤维', 
                'endurance': '耐力',
                'post_baseline': '后静息'
            }.get(stage_name, stage_name)
            
            weight_info = f"（权重：{analysis['stage_weight']:.1f}，{analysis['weight_category']}）"
            text += f"\n**{stage_chinese}阶段** {weight_info}\n"
            text += f"- 平均得分：{analysis['average_score']:.1f}分 ({analysis['overall_level_name']})\n"
            
            # 具体指标
            for indicator_name, indicator_analysis in analysis['indicators'].items():
                indicator_chinese = {
                    'avg_score': '平均值',
                    'var_score': '变异性',
                    'max_score': '最大收缩力',
                    'rise_time_score': '上升时间',
                    'recovery_time_score': '恢复时间',
                    'fatigue_score': '疲劳指数'
                }.get(indicator_name, indicator_name)
                
                text += f"  - {indicator_chinese}：{indicator_analysis['score']:.1f}分 ({indicator_analysis['level_name']})\n"
        
        # 优势区域
        if comprehensive_report['strengths_summary']:
            text += "\n✅ **优势区域**\n"
            for strength in comprehensive_report['strengths_summary'][:5]:  # 显示前5个优势
                text += f"- {strength['evaluation']} ({strength['level']})\n"
        
        # 优先改进建议
        if comprehensive_report['priority_improvements']:
            text += "\n⚠️ **优先改进建议**（按重要性排序）\n"
            for i, improvement in enumerate(comprehensive_report['priority_improvements'][:3], 1):
                stage_chinese = {
                    'pre_baseline': '前静息',
                    'fast_twitch': '快肌纤维',
                    'tonic': '慢肌纤维',
                    'endurance': '耐力',
                    'post_baseline': '后静息'
                }.get(improvement['stage'], improvement['stage'])
                
                text += f"\n{i}. **{stage_chinese}** (权重: {improvement['stage_weight']:.1f})\n"
                text += f"   问题：{improvement['evaluation']}\n"
                text += f"   建议：{', '.join(improvement['recommendations'][:2])}\n"  # 显示前2个建议
        
        # 课程推荐
        if comprehensive_report['course_recommendations']['recommended_courses']:
            text += "\n🎯 **推荐课程**\n"
            for course in comprehensive_report['course_recommendations']['recommended_courses'][:3]:
                text += f"- **{course['name']}** ({course['priority']}优先级)\n"
                text += f"  {course['description']}\n"
                text += f"  建议：{course['duration']}，{course['frequency']}\n\n"
        
        # 训练建议
        suggestions = comprehensive_report['training_suggestions']
        text += "💪 **训练建议**\n"
        text += f"- 训练强度：{suggestions['intensity']}\n"
        text += f"- 训练时长：{suggestions['duration']}\n"
        text += f"- 训练频率：{suggestions['frequency']}\n"
        if suggestions['focus_areas']:
            text += f"- 重点区域：{', '.join(suggestions['focus_areas'])}\n"
        
        return text


if __name__ == "__main__":
    # 测试基于权重的评估系统
    recommendation_system = GlazerRecommendationSystemWeighted()
    
    # 测试数据
    stage_indicator_scores = {
        'pre_baseline': {
            'avg_score': 75.0,    # 前静息平均值得分
            'var_score': 68.0     # 前静息变异性得分
        },
        'fast_twitch': {
            'max_score': 45.0,         # 最大收缩力得分
            'rise_time_score': 52.0,   # 上升时间得分
            'recovery_time_score': 58.0 # 恢复时间得分
        },
        'tonic': {
            'avg_score': 82.0,    # 持续收缩平均值得分
            'var_score': 76.0     # 持续收缩变异性得分
        },
        'endurance': {
            'avg_score': 55.0,      # 耐力平均值得分
            'fatigue_score': 48.0   # 疲劳指数得分
        },
        'post_baseline': {
            'avg_score': 72.0     # 后静息平均值得分
        }
    }
    
    # 生成综合分析报告
    comprehensive_report = recommendation_system.generate_comprehensive_analysis(stage_indicator_scores)
    
    # 输出格式化报告
    formatted_report = recommendation_system.format_report_text(comprehensive_report)
    print(formatted_report)
    
    print("\n=== 权重分级体系演示 ===\n")
    
    # 演示不同权重阶段的分级差异
    test_scores = [95, 85, 75, 65, 55, 45, 35]
    
    for stage in ['fast_twitch', 'endurance', 'pre_baseline']:
        weight_category = recommendation_system.get_stage_weight_category(stage)
        stage_chinese = {'fast_twitch': '快肌纤维(高权重)', 'endurance': '耐力(中权重)', 'pre_baseline': '前静息(低权重)'}[stage]
        
        print(f"**{stage_chinese}** - {weight_category}:")
        for score in test_scores:
            level = recommendation_system.get_score_level_by_weight(score, weight_category)
            level_name = recommendation_system.get_level_name_chinese(level)
            print(f"  {score}分 -> {level_name}")
        print()