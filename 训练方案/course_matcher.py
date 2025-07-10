import pandas as pd
import numpy as np
from typing import Dict, List, Tuple, Any
from dataclasses import dataclass
import re

@dataclass
class UserProfile:
    """用户画像数据结构"""
    age: int
    gender: str
    height: float
    weight: float
    birth_history: str
    surgery_history: str
    menopause_status: str
    main_symptoms: str
    
    # 评估报告数据 - 与test_basic_data.py格式保持一致
    comprehensive_assessment_data: Dict[str, Any]  # 完整的评估数据结构
    
    @property
    def comprehensive_score(self) -> float:
        """获取综合得分"""
        return self.comprehensive_assessment_data.get('total_score', 0.0)
    
    @property
    def stage_scores(self) -> Dict[str, float]:
        """获取各阶段得分"""
        return self.comprehensive_assessment_data.get('stage_scores', {})
    
    @property
    def stage_indicator_scores(self) -> Dict[str, Dict[str, float]]:
        """获取各阶段详细指标得分"""
        return self.comprehensive_assessment_data.get('stage_indicator_scores', {})

@dataclass
class CourseMatch:
    """课程匹配结果"""
    course_name: str
    match_score: float
    match_reasons: List[str]
    priority_level: str
    confidence: float

class CourseMatchingEngine:
    """课程匹配引擎"""
    
    def __init__(self, csv_reports_dir: str = "/Users/gunavy/Project/TRAE/FCBSAPP/训练方案/csv_reports"):
        self.csv_dir = csv_reports_dir
        self.course_profiles = self._load_course_data()
        
        # 匹配权重配置 - 参考Glazer评估计算器权重
        self.weights = {
            'age_match': 0.15,
            'symptom_match': 0.25,
            'score_match': 0.40,  # 提高评估得分权重，因为这是最客观的指标
            'severity_match': 0.12,
            'special_condition': 0.08
        }
        
        # Glazer评估各阶段权重 - 与glazer_assessment_calculator.py保持一致
        self.glazer_stage_weights = {
            'pre_baseline': 0.1,    # 前静息阶段
            'fast_twitch': 0.3,     # 快肌纤维阶段
            'tonic': 0.3,           # 慢肌纤维阶段
            'endurance': 0.2,       # 耐力测试阶段
            'post_baseline': 0.1    # 后静息阶段
        }
        
        # 症状关键词映射
        self.symptom_keywords = {
            '产后': ['产后', '生育', '分娩'],
            '尿失禁': ['漏尿', '尿失禁', '憋不住尿'],
            '脱垂': ['脱垂', '下坠', '坠胀'],
            '疼痛': ['疼痛', '痛', '不适'],
            '松弛': ['松弛', '紧致', '性生活'],
            '便秘': ['便秘', '排便困难', '大便'],
            '放松': ['紧张', '痉挛', '放松']
        }
    
    def _load_course_data(self) -> Dict[str, Dict]:
        """加载课程数据"""
        try:
            # 加载用户基本信息
            basic_info_df = pd.read_csv(f"{self.csv_dir}/用户基本信息.csv")
            # 加载评估报告数据
            assessment_df = pd.read_csv(f"{self.csv_dir}/评估报告数据.csv")
            
            course_profiles = {}
            
            for _, row in basic_info_df.iterrows():
                course_name = row['课程名称']
                course_profiles[course_name] = {
                    'basic_info': row.to_dict(),
                    'assessment': None
                }
            
            for _, row in assessment_df.iterrows():
                course_name = row['课程名称']
                if course_name in course_profiles:
                    course_profiles[course_name]['assessment'] = row.to_dict()
            
            return course_profiles
            
        except Exception as e:
            print(f"加载课程数据失败: {e}")
            return {}
    
    def _parse_score_range(self, score_range: str) -> Tuple[float, float]:
        """解析得分范围字符串"""
        if pd.isna(score_range) or not isinstance(score_range, str):
            return 0.0, 100.0
        
        # 提取数字范围，如 "40-50分" -> (40, 50)
        match = re.search(r'(\d+)-(\d+)', score_range)
        if match:
            return float(match.group(1)), float(match.group(2))
        
        # 单个数字，如 "45分" -> (45, 45)
        match = re.search(r'(\d+)', score_range)
        if match:
            score = float(match.group(1))
            return score, score
        
        return 0.0, 100.0
    
    def _calculate_age_match(self, user_age: int, course_age_range: str) -> float:
        """计算年龄匹配度"""
        if pd.isna(course_age_range):
            return 0.5
        
        # 解析年龄范围，如 "25-40岁"
        match = re.search(r'(\d+)-(\d+)', course_age_range)
        if match:
            min_age, max_age = int(match.group(1)), int(match.group(2))
            if min_age <= user_age <= max_age:
                return 1.0
            elif abs(user_age - min_age) <= 5 or abs(user_age - max_age) <= 5:
                return 0.7
            else:
                return 0.3
        
        return 0.5
    
    def _calculate_symptom_match(self, user_symptoms: str, course_symptoms: str) -> float:
        """计算症状匹配度"""
        if pd.isna(user_symptoms) or pd.isna(course_symptoms):
            return 0.3
        
        user_symptoms = user_symptoms.lower()
        course_symptoms = course_symptoms.lower()
        
        match_score = 0.0
        total_keywords = 0
        
        for category, keywords in self.symptom_keywords.items():
            category_match = False
            for keyword in keywords:
                if keyword in user_symptoms:
                    total_keywords += 1
                    if keyword in course_symptoms or category in course_symptoms:
                        match_score += 1.0
                        category_match = True
                        break
            
            if not category_match and any(kw in course_symptoms for kw in keywords):
                # 课程针对某症状但用户没有，轻微减分
                if any(kw in user_symptoms for kw in keywords):
                    match_score += 0.3
        
        return match_score / max(total_keywords, 1) if total_keywords > 0 else 0.5
    
    def _calculate_score_match(self, user_profile: UserProfile, course_assessment: Dict) -> float:
        """计算评估得分匹配度 - 使用Glazer权重进行加权计算"""
        if not course_assessment:
            return 0.5
        
        stage_matches = {}
        user_stage_scores = user_profile.stage_scores
        
        # 各阶段得分匹配映射
        stage_mappings = {
            'pre_baseline': ('前静息阶段_得分范围', user_stage_scores.get('pre_baseline', 0)),
            'fast_twitch': ('快肌纤维阶段_得分范围', user_stage_scores.get('fast_twitch', 0)),
            'tonic': ('慢肌纤维阶段_得分范围', user_stage_scores.get('tonic', 0)),
            'endurance': ('耐力测试阶段_得分范围', user_stage_scores.get('endurance', 0)),
            'post_baseline': ('后静息阶段_得分范围', user_stage_scores.get('post_baseline', 0))
        }
        
        # 计算各阶段匹配度
        for stage_key, (course_key, user_score) in stage_mappings.items():
            course_range = course_assessment.get(course_key, '')
            
            if pd.isna(course_range) or course_range == '':
                stage_matches[stage_key] = 0.5  # 默认中等匹配度
                continue
                
            min_score, max_score = self._parse_score_range(course_range)
            
            if min_score <= user_score <= max_score:
                stage_matches[stage_key] = 1.0
            elif abs(user_score - min_score) <= 10 or abs(user_score - max_score) <= 10:
                stage_matches[stage_key] = 0.8
            else:
                # 计算距离匹配度
                distance = min(abs(user_score - min_score), abs(user_score - max_score))
                match = max(0, 1 - distance / 40)  # 40分为完全不匹配阈值
                stage_matches[stage_key] = match
        
        # 使用Glazer权重进行加权平均
        weighted_score = 0.0
        total_weight = 0.0
        
        for stage_key, weight in self.glazer_stage_weights.items():
            if stage_key in stage_matches:
                weighted_score += stage_matches[stage_key] * weight
                total_weight += weight
        
        # 综合得分匹配度（额外考虑）
        comprehensive_range = course_assessment.get('综合得分范围', '')
        if not pd.isna(comprehensive_range) and comprehensive_range != '':
            min_score, max_score = self._parse_score_range(comprehensive_range)
            user_total = user_profile.comprehensive_score
            
            if min_score <= user_total <= max_score:
                comprehensive_match = 1.0
            elif abs(user_total - min_score) <= 15 or abs(user_total - max_score) <= 15:
                comprehensive_match = 0.8
            else:
                distance = min(abs(user_total - min_score), abs(user_total - max_score))
                comprehensive_match = max(0, 1 - distance / 50)
            
            # 综合得分占20%权重
            final_score = weighted_score * 0.8 + comprehensive_match * 0.2
        else:
            final_score = weighted_score / total_weight if total_weight > 0 else 0.5
        
        return min(final_score, 1.0)
    
    def _calculate_severity_match(self, user_profile: UserProfile, course_name: str) -> float:
        """根据症状严重程度计算匹配度"""
        # 根据综合得分判断严重程度
        if user_profile.comprehensive_score >= 70:
            severity = 'mild'  # 轻度
        elif user_profile.comprehensive_score >= 40:
            severity = 'moderate'  # 中度
        else:
            severity = 'severe'  # 重度
        
        # 课程难度映射
        if '初步' in course_name or '放松' in course_name:
            course_level = 'beginner'
        elif '增强' in course_name or '抗衰' in course_name:
            course_level = 'advanced'
        else:
            course_level = 'intermediate'
        
        # 匹配逻辑
        if severity == 'severe' and course_level == 'beginner':
            return 1.0
        elif severity == 'moderate' and course_level == 'intermediate':
            return 1.0
        elif severity == 'mild' and course_level == 'advanced':
            return 1.0
        elif abs(['severe', 'moderate', 'mild'].index(severity) - 
                ['beginner', 'intermediate', 'advanced'].index(course_level)) == 1:
            return 0.7
        else:
            return 0.4
    
    def _calculate_special_conditions(self, user_profile: UserProfile, course_info: Dict) -> float:
        """计算特殊条件匹配度"""
        score = 0.5
        
        basic_info = course_info.get('basic_info', {})
        
        # 生育史匹配
        user_birth = user_profile.birth_history.lower()
        course_birth = str(basic_info.get('生育史', '')).lower()
        
        if '产后' in user_birth and '产后' in course_birth:
            score += 0.3
        elif '无' in user_birth and '无' in course_birth:
            score += 0.2
        
        # 手术史匹配
        user_surgery = user_profile.surgery_history.lower()
        course_surgery = str(basic_info.get('手术史', '')).lower()
        
        if '无' in user_surgery and '无' in course_surgery:
            score += 0.2
        elif '有' in user_surgery and '有' in course_surgery:
            score += 0.3
        
        return min(score, 1.0)
    
    def match_courses(self, user_profile: UserProfile, top_n: int = 5) -> List[CourseMatch]:
        """为用户匹配最适合的课程"""
        matches = []
        
        for course_name, course_info in self.course_profiles.items():
            basic_info = course_info.get('basic_info', {})
            assessment_info = course_info.get('assessment', {})
            
            # 计算各维度匹配度
            age_match = self._calculate_age_match(
                user_profile.age, 
                basic_info.get('年龄范围', '')
            )
            
            symptom_match = self._calculate_symptom_match(
                user_profile.main_symptoms,
                basic_info.get('主要症状', '')
            )
            
            score_match = self._calculate_score_match(
                user_profile, 
                assessment_info
            )
            
            severity_match = self._calculate_severity_match(
                user_profile, 
                course_name
            )
            
            special_match = self._calculate_special_conditions(
                user_profile, 
                course_info
            )
            
            # 计算综合匹配度
            total_score = (
                age_match * self.weights['age_match'] +
                symptom_match * self.weights['symptom_match'] +
                score_match * self.weights['score_match'] +
                severity_match * self.weights['severity_match'] +
                special_match * self.weights['special_condition']
            )
            
            # 生成匹配原因
            reasons = []
            if age_match > 0.8:
                reasons.append("年龄范围高度匹配")
            if symptom_match > 0.7:
                reasons.append("症状特征匹配")
            if score_match > 0.8:
                reasons.append("评估得分范围匹配")
            if severity_match > 0.8:
                reasons.append("训练难度适合")
            
            # 确定优先级
            if total_score >= 0.8:
                priority = "高度推荐"
            elif total_score >= 0.6:
                priority = "推荐"
            elif total_score >= 0.4:
                priority = "可考虑"
            else:
                priority = "不推荐"
            
            # 计算置信度
            confidence = min(total_score * 1.2, 1.0)
            
            matches.append(CourseMatch(
                course_name=course_name,
                match_score=total_score,
                match_reasons=reasons,
                priority_level=priority,
                confidence=confidence
            ))
        
        # 按匹配度排序并返回前N个
        matches.sort(key=lambda x: x.match_score, reverse=True)
        return matches[:top_n]
    
    def generate_recommendation_report(self, user_profile: UserProfile, matches: List[CourseMatch]) -> str:
        """生成推荐报告"""
        report = []
        report.append("# 个性化课程推荐报告")
        report.append("\n" + "=" * 50)
        
        # 用户信息摘要
        report.append(f"\n## 用户信息摘要")
        report.append(f"- 年龄: {user_profile.age}岁")
        report.append(f"- 主要症状: {user_profile.main_symptoms}")
        report.append(f"- 综合评估得分: {user_profile.comprehensive_score}分")
        report.append(f"- 生育史: {user_profile.birth_history}")
        
        # 推荐课程
        report.append(f"\n## 推荐课程列表")
        
        for i, match in enumerate(matches, 1):
            report.append(f"\n### {i}. {match.course_name}")
            report.append(f"- **匹配度**: {match.match_score:.2f} ({match.priority_level})")
            report.append(f"- **置信度**: {match.confidence:.2f}")
            report.append(f"- **匹配原因**: {', '.join(match.match_reasons) if match.match_reasons else '基础匹配'}")
        
        # 训练建议
        report.append(f"\n## 训练建议")
        if matches:
            top_match = matches[0]
            if top_match.match_score >= 0.8:
                report.append("建议优先选择排名第一的课程，匹配度很高。")
            elif top_match.match_score >= 0.6:
                report.append("建议从前2-3个课程中选择，都有较好的匹配度。")
            else:
                report.append("建议咨询专业医师，可能需要个性化定制训练方案。")
        
        report.append(f"\n**报告生成时间**: {pd.Timestamp.now().strftime('%Y-%m-%d %H:%M:%S')}")
        
        return "\n".join(report)


def get_course_recommendations_from_assessment(comprehensive_assessment_data: Dict[str, Any], 
                                               user_basic_info: Dict[str, Any] = None) -> List[Dict[str, Any]]:
    """从评估数据获取课程推荐 - 可直接在test_basic_data.py中使用
    
    Args:
        comprehensive_assessment_data: 完整的评估数据，格式与test_basic_data.py中的comprehensive_assessment_data一致
        user_basic_info: 用户基本信息（可选）
    
    Returns:
        推荐课程列表，格式兼容现有的课程推荐系统
    """
    # 创建匹配引擎
    matcher = CourseMatchingEngine()
    
    # 从评估数据中提取或使用默认的用户基本信息
    if user_basic_info is None:
        user_basic_info = {
            'age': 30,
            'gender': '女性',
            'height': 165.0,
            'weight': 60.0,
            'birth_history': '产后',
            'surgery_history': '无',
            'menopause_status': '未绝经',
            'main_symptoms': '盆底功能障碍'
        }
    
    # 创建用户画像
    user = UserProfile(
        age=user_basic_info.get('age', 30),
        gender=user_basic_info.get('gender', '女性'),
        height=user_basic_info.get('height', 165.0),
        weight=user_basic_info.get('weight', 60.0),
        birth_history=user_basic_info.get('birth_history', '产后'),
        surgery_history=user_basic_info.get('surgery_history', '无'),
        menopause_status=user_basic_info.get('menopause_status', '未绝经'),
        main_symptoms=user_basic_info.get('main_symptoms', '盆底功能障碍'),
        comprehensive_assessment_data=comprehensive_assessment_data
    )
    
    # 进行匹配
    matches = matcher.match_courses(user, top_n=5)
    
    # 转换为兼容格式
    recommended_courses = []
    for match in matches:
        course_info = {
            'name': match.course_name,
            'priority': match.priority_level,
            'description': f"匹配度: {match.match_score:.2f}, 置信度: {match.confidence:.2f}",
            'duration': "根据个人情况调整",
            'frequency': "建议每周3-5次",
            'match_score': match.match_score,
            'match_reasons': match.match_reasons,
            'confidence': match.confidence
        }
        recommended_courses.append(course_info)
    
    return recommended_courses

# 使用示例
def example_usage():
    """使用示例"""
    # 示例评估数据 - 与test_basic_data.py格式一致
    comprehensive_assessment_data = {
        'stage_scores': {
            'pre_baseline': 65.5,
            'fast_twitch': 48.2,
            'tonic': 52.8,
            'endurance': 71.3,
            'post_baseline': 68.9
        },
        'stage_indicator_scores': {
            'pre_baseline': {
                'avg_score': 70.2,
                'var_score': 60.8
            },
            'fast_twitch': {
                'max_score': 45.6,
                'rise_time_score': 52.1,
                'recovery_time_score': 46.9
            },
            'tonic': {
                'avg_score': 55.3,
                'rise_score': 48.7,
                'recovery_score': 51.2,
                'var_score': 56.1
            },
            'endurance': {
                'avg_score': 73.8,
                'var_score': 65.4,
                'fatigue_score': 74.7
            },
            'post_baseline': {
                'avg_score': 72.1,
                'var_score': 65.7
            }
        },
        'total_score': 61.34
    }
    
    # 用户基本信息
    user_basic_info = {
        'age': 32,
        'gender': '女性',
        'height': 165.0,
        'weight': 58.0,
        'birth_history': '产后1年',
        'surgery_history': '无重大手术史',
        'menopause_status': '未绝经',
        'main_symptoms': '产后盆底肌松弛，轻度漏尿，性生活质量下降'
    }
    
    # 获取课程推荐
    recommended_courses = get_course_recommendations_from_assessment(
        comprehensive_assessment_data, user_basic_info
    )
    
    # 返回推荐结果（不打印，避免重复输出）
    
    return recommended_courses

if __name__ == "__main__":
    # 运行示例
    recommended_courses = example_usage()