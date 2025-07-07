# -*- coding: utf-8 -*-
"""
Glazer评估建议系统
基于用户的详细打分数据，提供个性化的训练建议和改善方案
"""

import math
from typing import Dict, List, Tuple

class GlazerRecommendationSystem:
    def __init__(self):
        # 定义得分等级阈值
        self.score_levels = {
            'excellent': 85,    # 优秀
            'good': 70,         # 良好
            'fair': 60,         # 及格
            'poor': 40,         # 较差
            'very_poor': 0      # 很差
        }
        
        # 定义各阶段权重（用于计算优先级）
        self.stage_importance = {
            'fast_twitch': 0.3,     # 快肌纤维最重要
            'tonic': 0.3,           # 慢肌纤维同等重要
            'endurance': 0.2,       # 耐力次之
            'pre_baseline': 0.1,    # 前静息较低
            'post_baseline': 0.1    # 后静息较低
        }
    
    def get_score_level(self, score: float) -> str:
        """获取得分等级"""
        if score >= self.score_levels['excellent']:
            return 'excellent'
        elif score >= self.score_levels['good']:
            return 'good'
        elif score >= self.score_levels['fair']:
            return 'fair'
        elif score >= self.score_levels['poor']:
            return 'poor'
        else:
            return 'very_poor'
    
    def analyze_pre_baseline_issues(self, pre_avg: float, pre_var: float) -> Dict:
        """分析前静息阶段问题"""
        issues = []
        recommendations = []
        
        # 前静息分析
        if pre_avg > 8:  # 前静息平均值过高
            issues.append("前静息状态肌电活动过高，可能存在肌肉紧张")
            recommendations.extend([
                "进行深呼吸放松训练",
                "学习渐进性肌肉放松技术",
                "检查是否存在慢性盆底肌紧张"
            ])
        
        if pre_var > 0.5:  # 前静息变异性过高
            issues.append("前静息状态不稳定，肌肉控制能力需要改善")
            recommendations.extend([
                "加强意识训练，提高对盆底肌的感知",
                "练习静息状态下的肌肉放松"
            ])
        
        return {
            'issues': issues,
            'recommendations': recommendations
        }
    
    def analyze_post_baseline_issues(self, pre_avg: float, post_avg: float, post_var: float) -> Dict:
        """分析后静息阶段问题"""
        issues = []
        recommendations = []
        
        # 后静息分析
        recovery_ratio = post_avg / pre_avg if pre_avg > 0 else 1
        if recovery_ratio > 1.5:  # 后静息比前静息高50%以上
            issues.append("运动后恢复能力不足，肌肉难以回到基线状态")
            recommendations.extend([
                "延长训练间歇时间",
                "加强恢复期的放松训练",
                "逐步增加训练强度，避免过度疲劳"
            ])
        
        if post_var > 0.5:  # 后静息变异性过高
            issues.append("后静息状态不稳定，恢复质量需要改善")
            recommendations.extend([
                "加强恢复期的放松训练",
                "改善训练后的恢复策略"
            ])
        
        return {
            'issues': issues,
            'recommendations': recommendations,
            'recovery_ratio': recovery_ratio
        }
    
    def analyze_fast_twitch_issues(self, max_value: float, rise_time: float, 
                                  recovery_time: float) -> Dict:
        """分析快肌纤维问题"""
        issues = []
        recommendations = []
        
        # 最大收缩力分析
        if max_value < 30:  # 最大值过低
            issues.append("快肌纤维收缩力不足，爆发力较弱")
            recommendations.extend([
                "进行快速收缩训练（Kegel运动）",
                "增加阻抗训练强度",
                "练习快速启动-停止动作"
            ])
        elif max_value > 150:  # 最大值过高，可能代偿
            issues.append("快肌纤维过度激活，可能存在代偿性收缩")
            recommendations.extend([
                "学习精确的肌肉控制技术",
                "避免过度用力，注重动作质量",
                "进行选择性肌肉激活训练"
            ])
        
        # 上升时间分析
        if rise_time > 1.0:  # 上升时间过长
            issues.append("肌肉反应速度较慢，神经肌肉协调性需要改善")
            recommendations.extend([
                "进行快速反应训练",
                "练习节拍器辅助的快速收缩",
                "加强神经肌肉协调性训练"
            ])
        
        # 恢复时间分析
        if recovery_time > 1.0:  # 恢复时间过长
            issues.append("快肌纤维恢复较慢，可能存在疲劳或紧张")
            recommendations.extend([
                "加强放松训练",
                "改善训练间歇的恢复质量",
                "检查是否存在肌肉紧张问题"
            ])
        
        return {
            'issues': issues,
            'recommendations': recommendations,
            'power_efficiency': max_value / (rise_time + 0.1)  # 功率效率指标
        }
    
    def analyze_tonic_issues(self, avg_value: float, rise_time: float, 
                            recovery_time: float, variability: float) -> Dict:
        """分析慢肌纤维问题"""
        issues = []
        recommendations = []
        
        # 持续收缩力分析
        if avg_value < 25:  # 平均值过低
            issues.append("慢肌纤维持续收缩能力不足，肌肉耐力较弱")
            recommendations.extend([
                "进行长时间持续收缩训练",
                "逐步延长收缩保持时间",
                "加强慢肌纤维耐力训练"
            ])
        
        # 变异性分析
        if variability > 0.4:  # 变异性过高
            issues.append("持续收缩过程中稳定性不足，肌肉控制精度需要改善")
            recommendations.extend([
                "练习稳定性收缩训练",
                "使用生物反馈进行精确控制训练",
                "加强本体感觉训练"
            ])
        
        # 时间参数分析
        if rise_time > 1.5 or recovery_time > 1.5:
            issues.append("慢肌纤维激活或放松过程较慢")
            recommendations.extend([
                "改善肌肉激活模式",
                "练习渐进性收缩和放松"
            ])
        
        return {
            'issues': issues,
            'recommendations': recommendations,
            'stability_index': avg_value / (variability + 0.01)  # 稳定性指标
        }
    
    def analyze_endurance_issues(self, avg_value: float, variability: float, 
                                fatigue_index: float) -> Dict:
        """分析耐力测试问题"""
        issues = []
        recommendations = []
        
        # 耐力水平分析
        if avg_value < 20:  # 耐力平均值过低
            issues.append("肌肉耐力不足，长时间工作能力较弱")
            recommendations.extend([
                "进行渐进性耐力训练",
                "延长训练持续时间",
                "加强有氧代谢能力训练"
            ])
        
        # 疲劳指数分析
        if fatigue_index < 0.7:  # 疲劳指数过低，疲劳严重
            issues.append("肌肉抗疲劳能力差，容易出现疲劳衰减")
            recommendations.extend([
                "降低训练强度，逐步适应",
                "增加训练频次，减少单次训练量",
                "加强肌肉代谢能力训练"
            ])
        elif fatigue_index > 1.3:  # 疲劳指数过高，可能代偿
            issues.append("耐力测试后期可能存在代偿性收缩")
            recommendations.extend([
                "学习正确的肌肉激活模式",
                "避免过度代偿，注重动作质量"
            ])
        
        # 变异性分析
        if variability > 0.3:
            issues.append("耐力测试过程中稳定性不足")
            recommendations.extend([
                "加强长时间稳定性训练",
                "改善肌肉协调性"
            ])
        
        return {
            'issues': issues,
            'recommendations': recommendations,
            'endurance_efficiency': avg_value * fatigue_index  # 耐力效率指标
        }
    
    def calculate_priority_scores(self, stage_scores: Dict[str, float]) -> Dict[str, float]:
        """计算各阶段改善优先级"""
        priority_scores = {}
        
        for stage, score in stage_scores.items():
            if stage in self.stage_importance:
                # 优先级 = 重要性权重 × (100 - 得分) / 100
                # 得分越低，重要性越高，优先级越高
                priority = self.stage_importance[stage] * (100 - score) / 100
                priority_scores[stage] = priority
        
        return priority_scores
    
    def generate_course_matching_data(self, stage_scores: Dict[str, float], 
                                     detailed_data: Dict) -> Dict:
        """生成课程匹配所需的数据结构
        
        此方法为未来的课程匹配系统预留接口，
        将根据用户的评估数据和分析结果生成课程匹配所需的数据。
        """
        priority_scores = self.calculate_priority_scores(stage_scores)
        
        # 按优先级排序
        sorted_priorities = sorted(priority_scores.items(), 
                                 key=lambda x: x[1], reverse=True)
        
        # 返回课程匹配所需的基础数据
        course_matching_data = {
            'user_assessment': {
                'total_score': sum(stage_scores[stage] * weight 
                                 for stage, weight in self.stage_importance.items() 
                                 if stage in stage_scores),
                'stage_scores': stage_scores,
                'priority_scores': priority_scores,
                'sorted_priorities': sorted_priorities
            },
            'detailed_metrics': detailed_data,
            'improvement_areas': [stage for stage, score in stage_scores.items() if score < 70],
            'strength_areas': [stage for stage, score in stage_scores.items() if score >= 85],
            'course_requirements': {
                'primary_focus': sorted_priorities[0][0] if sorted_priorities else None,
                'secondary_focus': sorted_priorities[1][0] if len(sorted_priorities) > 1 else None,
                'difficulty_level': self.get_score_level(sum(stage_scores.values()) / len(stage_scores))
            }
        }
        
        return course_matching_data
    
    def get_course_recommendations(self, stage_scores: Dict[str, float], 
                                 detailed_data: Dict) -> Dict:
        """获取课程推荐信息的专用接口
        
        此方法专门为课程匹配系统提供标准化的数据接口，
        返回课程选择和个性化推荐所需的所有信息。
        
        Args:
            stage_scores: 各阶段得分字典
            detailed_data: 详细测量数据
            
        Returns:
            包含课程推荐信息的字典
        """
        course_data = self.generate_course_matching_data(stage_scores, detailed_data)
        
        # 为课程系统提供更详细的推荐信息
        course_recommendations = {
            'user_profile': {
                'total_score': course_data['user_assessment']['total_score'],
                'overall_level': self.get_score_level(course_data['user_assessment']['total_score']),
                'stage_scores': stage_scores,
                'priority_ranking': course_data['user_assessment']['sorted_priorities']
            },
            'training_focus': {
                'primary_area': course_data['course_requirements']['primary_focus'],
                'secondary_area': course_data['course_requirements']['secondary_focus'],
                'improvement_areas': course_data['improvement_areas'],
                'strength_areas': course_data['strength_areas']
            },
            'course_parameters': {
                'difficulty_level': course_data['course_requirements']['difficulty_level'],
                'intensity_recommendation': self._get_intensity_recommendation(stage_scores),
                'duration_recommendation': self._get_duration_recommendation(stage_scores),
                'frequency_recommendation': self._get_frequency_recommendation(stage_scores)
            },
            'personalization_data': {
                'detailed_metrics': detailed_data,
                'priority_scores': course_data['user_assessment']['priority_scores'],
                'adaptation_needs': self._identify_adaptation_needs(stage_scores)
            }
        }
        
        return course_recommendations
    
    def _get_intensity_recommendation(self, stage_scores: Dict[str, float]) -> str:
        """根据得分推荐训练强度"""
        avg_score = sum(stage_scores.values()) / len(stage_scores)
        if avg_score < 40:
            return 'low'  # 低强度
        elif avg_score < 70:
            return 'moderate'  # 中等强度
        else:
            return 'high'  # 高强度
    
    def _get_duration_recommendation(self, stage_scores: Dict[str, float]) -> str:
        """根据得分推荐训练时长"""
        poor_scores = [score for score in stage_scores.values() if score < 60]
        if len(poor_scores) >= 3:
            return 'extended'  # 延长训练
        elif len(poor_scores) >= 1:
            return 'standard'  # 标准训练
        else:
            return 'maintenance'  # 维持训练
    
    def _get_frequency_recommendation(self, stage_scores: Dict[str, float]) -> str:
        """根据得分推荐训练频率"""
        critical_scores = [score for score in stage_scores.values() if score < 40]
        if len(critical_scores) >= 2:
            return 'daily'  # 每日训练
        elif len(critical_scores) >= 1:
            return 'frequent'  # 频繁训练（隔日）
        else:
            return 'regular'  # 常规训练（每周2-3次）
    
    def _identify_adaptation_needs(self, stage_scores: Dict[str, float]) -> List[str]:
        """识别需要特殊适应的训练需求"""
        adaptations = []
        
        # 检查各阶段特殊需求
        if stage_scores.get('pre_baseline', 0) < 30:
            adaptations.append('relaxation_focus')  # 需要重点放松训练
        
        if stage_scores.get('fast_twitch', 0) < 30:
            adaptations.append('strength_building')  # 需要力量建设
        
        if stage_scores.get('tonic', 0) < 30:
            adaptations.append('endurance_foundation')  # 需要耐力基础
        
        if stage_scores.get('endurance', 0) < 30:
            adaptations.append('stamina_improvement')  # 需要耐力改善
        
        if stage_scores.get('post_baseline', 0) < 30:
            adaptations.append('recovery_training')  # 需要恢复训练
        
        return adaptations
    
    def generate_comprehensive_report(self, stage_scores: Dict[str, float], 
                                    detailed_data: Dict) -> Dict:
        """生成综合评估报告"""
        # 分析各阶段问题
        pre_baseline_analysis = self.analyze_pre_baseline_issues(
            detailed_data.get('pre_avg', 0),
            detailed_data.get('pre_var', 0)
        )
        
        post_baseline_analysis = self.analyze_post_baseline_issues(
            detailed_data.get('pre_avg', 0),
            detailed_data.get('post_avg', 0),
            detailed_data.get('post_var', 0)
        )
        
        fast_analysis = self.analyze_fast_twitch_issues(
            detailed_data.get('fast_max', 0),
            detailed_data.get('fast_rise', 0),
            detailed_data.get('fast_recovery', 0)
        )
        
        tonic_analysis = self.analyze_tonic_issues(
            detailed_data.get('tonic_avg', 0),
            detailed_data.get('tonic_rise', 0),
            detailed_data.get('tonic_recovery', 0),
            detailed_data.get('tonic_var', 0)
        )
        
        endurance_analysis = self.analyze_endurance_issues(
            detailed_data.get('endurance_avg', 0),
            detailed_data.get('endurance_var', 0),
            detailed_data.get('endurance_fatigue', 0)
        )
        
        # 计算总分
        total_score = sum(stage_scores[stage] * weight 
                         for stage, weight in self.stage_importance.items() 
                         if stage in stage_scores)
        
        # 生成课程匹配数据
        course_matching_data = self.generate_course_matching_data(stage_scores, detailed_data)
        
        # 汇总所有建议
        all_recommendations = []
        all_recommendations.extend(pre_baseline_analysis['recommendations'])
        all_recommendations.extend(post_baseline_analysis['recommendations'])
        all_recommendations.extend(fast_analysis['recommendations'])
        all_recommendations.extend(tonic_analysis['recommendations'])
        all_recommendations.extend(endurance_analysis['recommendations'])
        
        # 去重并按重要性排序
        unique_recommendations = list(set(all_recommendations))
        
        return {
            'total_score': total_score,
            'overall_level': self.get_score_level(total_score),
            'stage_scores': stage_scores,
            'detailed_analysis': {
                'pre_baseline': pre_baseline_analysis,
                'post_baseline': post_baseline_analysis,
                'fast_twitch': fast_analysis,
                'tonic': tonic_analysis,
                'endurance': endurance_analysis
            },
            'course_matching_data': course_matching_data,
            'key_recommendations': unique_recommendations[:10],  # 前10个关键建议
            'improvement_priorities': self.calculate_priority_scores(stage_scores)
        }
    
    def format_report_text(self, report: Dict) -> str:
        """格式化报告为可读文本"""
        text = f"""# Glazer盆底肌评估报告

## 总体评估
- 总分：{report['total_score']:.1f}分
- 等级：{report['overall_level']}

## 各阶段得分
"""
        
        stage_names = {
            'pre_baseline': '前静息阶段',
            'fast_twitch': '快肌纤维阶段',
            'tonic': '慢肌纤维阶段',
            'endurance': '耐力测试阶段',
            'post_baseline': '后静息阶段'
        }
        
        for stage, score in report['stage_scores'].items():
            name = stage_names.get(stage, stage)
            level = self.get_score_level(score)
            text += f"- {name}：{score:.1f}分 ({level})\n"
        
        # 按重要性排序各阶段问题
        text += "\n## 分阶段问题分析与建议\n\n"
        
        # 计算各阶段的重要性权重得分
        stage_priority = []
        
        # 键名映射：detailed_analysis的键 -> stage_scores的键
        stage_key_mapping = {
            'pre_baseline': 'pre_baseline',
            'post_baseline': 'post_baseline',
            'fast_twitch': 'fast_twitch',
            'tonic': 'tonic', 
            'endurance': 'endurance'
        }
        
        for analysis_key, analysis in report['detailed_analysis'].items():
            # 获取对应的stage_scores键
            stage_key = stage_key_mapping.get(analysis_key, analysis_key)
            if stage_key in report['stage_scores']:
                stage_score = report['stage_scores'][stage_key]
                importance_weight = self.stage_importance.get(stage_key, 0.1)
                priority_score = importance_weight * (100 - stage_score) / 100
                stage_priority.append({
                    'stage': stage_key,
                    'priority_score': priority_score,
                    'analysis': analysis,
                    'score': stage_score
                })
        
        # 按重要性排序（优先级从高到低）
        stage_priority.sort(key=lambda x: x['priority_score'], reverse=True)
        
        # 输出各阶段分析和建议
        for item in stage_priority:
            stage_name = stage_names.get(item['stage'], item['stage'])
            analysis = item['analysis']
            score = item['score']
            level = self.get_score_level(score)
            
            text += f"### {stage_name}（{score:.1f}分 - {level}）\n"
            
            # 分析部分
            if analysis['issues']:
                text += f"**分析：** {'; '.join(analysis['issues'])}\n\n"
            
            # 建议部分
            if analysis['recommendations']:
                text += f"**建议：** {'; '.join(analysis['recommendations'])}\n\n"
        
        text += "\n## 课程推荐\n"
        course_data = report['course_matching_data']
        
        # 显示主要关注领域
        if course_data['course_requirements']['primary_focus']:
            primary_stage = course_data['course_requirements']['primary_focus']
            primary_name = stage_names.get(primary_stage, primary_stage)
            text += f"\n**主要训练重点：** {primary_name}\n"
        
        if course_data['course_requirements']['secondary_focus']:
            secondary_stage = course_data['course_requirements']['secondary_focus']
            secondary_name = stage_names.get(secondary_stage, secondary_stage)
            text += f"**次要训练重点：** {secondary_name}\n"
        
        # 显示建议难度等级
        difficulty = course_data['course_requirements']['difficulty_level']
        text += f"**建议课程难度：** {difficulty}\n"
        
        # 显示需要改善的领域
        if course_data['improvement_areas']:
            improvement_names = [stage_names.get(stage, stage) for stage in course_data['improvement_areas']]
            text += f"**需要改善的领域：** {', '.join(improvement_names)}\n"
        
        # 显示优势领域
        if course_data['strength_areas']:
            strength_names = [stage_names.get(stage, stage) for stage in course_data['strength_areas']]
            text += f"**优势领域：** {', '.join(strength_names)}\n"
        
        text += "\n*具体的训练课程将根据您的评估结果进行个性化匹配和推荐。*\n"
        
        return text

# 示例使用
if __name__ == "__main__":
    # 创建建议系统实例
    recommendation_system = GlazerRecommendationSystem()
    
    # 示例数据
    stage_scores = {
        'pre_baseline': 65.0,
        'fast_twitch': 45.0,
        'tonic': 72.0,
        'endurance': 58.0,
        'post_baseline': 70.0
    }
    
    detailed_data = {
        'pre_avg': 6.5,
        'pre_var': 0.25,
        'post_avg': 8.2,
        'post_var': 0.35,
        'fast_max': 35.0,
        'fast_rise': 1.2,
        'fast_recovery': 0.8,
        'tonic_avg': 38.0,
        'tonic_rise': 0.8,
        'tonic_recovery': 1.1,
        'tonic_var': 0.28,
        'endurance_avg': 28.0,
        'endurance_var': 0.22,
        'endurance_fatigue': 0.85
    }
    
    # 生成报告
    report = recommendation_system.generate_comprehensive_report(stage_scores, detailed_data)
    
    # 注释掉输出部分，避免在导入时产生输出
    # formatted_report = recommendation_system.format_report_text(report)
    # print(formatted_report)
    # print("\n=== 详细训练计划 ===")
    # import json
    # print(json.dumps(report['training_plan'], ensure_ascii=False, indent=2))