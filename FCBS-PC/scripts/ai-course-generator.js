class AICourseGenerator {
    constructor() {
        this.currentStep = 1;
        this.totalSteps = 3;
        this.userProfile = {};
        this.aiConfig = {};
        this.generationRules = {};
        this.generatedCourse = null;
        this.init();
    }

    init() {
        this.bindEvents();
        this.updateStepIndicator();
        this.loadUserProfiles();
        this.loadTrainingData();
    }

    bindEvents() {
        // 步骤导航
        document.querySelectorAll('.step-nav-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const step = parseInt(e.target.dataset.step);
                this.goToStep(step);
            });
        });

        // 下一步/上一步按钮
        document.getElementById('nextStep').addEventListener('click', () => this.nextStep());
        document.getElementById('prevStep').addEventListener('click', () => this.prevStep());
        document.getElementById('generateCourse').addEventListener('click', () => this.generateCourse());

        // 用户画像选择
        document.querySelectorAll('input[name="userType"]').forEach(radio => {
            radio.addEventListener('change', (e) => {
                this.updateUserProfile('userType', e.target.value);
                this.loadUserTypeData(e.target.value);
            });
        });

        // AI模型配置
        document.getElementById('analysisWeight').addEventListener('input', (e) => {
            this.updateAIConfig('analysisWeight', e.target.value);
            this.updateWeightDisplay();
        });

        document.getElementById('historyWeight').addEventListener('input', (e) => {
            this.updateAIConfig('historyWeight', e.target.value);
            this.updateWeightDisplay();
        });

        document.getElementById('contentWeight').addEventListener('input', (e) => {
            this.updateAIConfig('contentWeight', e.target.value);
            this.updateWeightDisplay();
        });

        document.getElementById('feedbackWeight').addEventListener('input', (e) => {
            this.updateAIConfig('feedbackWeight', e.target.value);
            this.updateWeightDisplay();
        });

        document.getElementById('assessmentWeight').addEventListener('input', (e) => {
            this.updateAIConfig('assessmentWeight', e.target.value);
            this.updateWeightDisplay();
        });

        // 生成规则配置
        document.getElementById('sessionCountRule').addEventListener('change', (e) => {
            this.updateGenerationRules('sessionCountRule', e.target.value);
            this.toggleCustomSessionCount(e.target.value === 'custom');
        });

        document.getElementById('customSessionCount').addEventListener('input', (e) => {
            this.updateGenerationRules('customSessionCount', e.target.value);
        });

        document.getElementById('difficultyProgression').addEventListener('change', (e) => {
            this.updateGenerationRules('difficultyProgression', e.target.value);
        });

        document.getElementById('contentFocus').addEventListener('change', (e) => {
            this.updateGenerationRules('contentFocus', e.target.value);
        });

        // 保存和预览按钮
        document.getElementById('saveCourse').addEventListener('click', () => this.saveCourse());
        document.getElementById('previewCourse').addEventListener('click', () => this.previewCourse());
        document.getElementById('exportCourse').addEventListener('click', () => this.exportCourse());
    }

    goToStep(step) {
        if (step < 1 || step > this.totalSteps) return;
        
        // 验证当前步骤
        if (!this.validateCurrentStep()) {
            this.showNotification('请完成当前步骤的必填项', 'warning');
            return;
        }

        this.currentStep = step;
        this.updateStepDisplay();
        this.updateStepIndicator();
    }

    nextStep() {
        if (this.currentStep < this.totalSteps) {
            this.goToStep(this.currentStep + 1);
        }
    }

    prevStep() {
        if (this.currentStep > 1) {
            this.goToStep(this.currentStep - 1);
        }
    }

    updateStepDisplay() {
        // 隐藏所有步骤
        document.querySelectorAll('.step-content').forEach(step => {
            step.classList.add('hidden');
        });

        // 显示当前步骤
        document.getElementById(`step${this.currentStep}`).classList.remove('hidden');

        // 更新按钮状态
        document.getElementById('prevStep').style.display = this.currentStep === 1 ? 'none' : 'block';
        document.getElementById('nextStep').style.display = this.currentStep === this.totalSteps ? 'none' : 'block';
        document.getElementById('generateCourse').style.display = this.currentStep === this.totalSteps ? 'block' : 'none';
    }

    updateStepIndicator() {
        document.querySelectorAll('.step-item').forEach((item, index) => {
            const stepNumber = index + 1;
            item.classList.remove('active', 'completed');
            
            if (stepNumber === this.currentStep) {
                item.classList.add('active');
            } else if (stepNumber < this.currentStep) {
                item.classList.add('completed');
            }
        });
    }

    validateCurrentStep() {
        switch (this.currentStep) {
            case 1:
                return this.userProfile.userType;
            case 2:
                return Object.keys(this.aiConfig).length > 0;
            case 3:
                return Object.keys(this.generationRules).length > 0;
            default:
                return true;
        }
    }

    updateUserProfile(key, value) {
        this.userProfile[key] = value;
        this.saveToLocalStorage('userProfile', this.userProfile);
    }

    updateAIConfig(key, value) {
        this.aiConfig[key] = parseFloat(value);
        this.saveToLocalStorage('aiConfig', this.aiConfig);
    }

    updateGenerationRules(key, value) {
        this.generationRules[key] = value;
        this.saveToLocalStorage('generationRules', this.generationRules);
    }

    updateWeightDisplay() {
        const weights = {
            analysis: this.aiConfig.analysisWeight || 20,
            history: this.aiConfig.historyWeight || 20,
            content: this.aiConfig.contentWeight || 20,
            feedback: this.aiConfig.feedbackWeight || 20,
            assessment: this.aiConfig.assessmentWeight || 20
        };

        const total = Object.values(weights).reduce((sum, weight) => sum + weight, 0);
        
        Object.keys(weights).forEach(key => {
            const percentage = ((weights[key] / total) * 100).toFixed(1);
            const displayElement = document.getElementById(`${key}WeightDisplay`);
            if (displayElement) {
                displayElement.textContent = `${percentage}%`;
            }
        });

        // 更新权重分布图
        this.updateWeightChart(weights);
    }

    updateWeightChart(weights) {
        const chartContainer = document.getElementById('weightChart');
        if (!chartContainer) return;

        const total = Object.values(weights).reduce((sum, weight) => sum + weight, 0);
        const colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];
        
        let html = '';
        let currentAngle = 0;
        
        Object.entries(weights).forEach(([key, weight], index) => {
            const percentage = (weight / total) * 100;
            const angle = (weight / total) * 360;
            
            html += `
                <div class="chart-segment" style="
                    background: conic-gradient(from ${currentAngle}deg, ${colors[index]} 0deg, ${colors[index]} ${angle}deg, transparent ${angle}deg);
                "></div>
            `;
            
            currentAngle += angle;
        });
        
        chartContainer.innerHTML = html;
    }

    toggleCustomSessionCount(show) {
        const customInput = document.getElementById('customSessionCount');
        const customContainer = customInput.closest('.form-group');
        
        if (show) {
            customContainer.style.display = 'block';
            customInput.required = true;
        } else {
            customContainer.style.display = 'none';
            customInput.required = false;
        }
    }

    loadUserProfiles() {
        // 模拟加载用户画像数据
        const profiles = {
            beginner: {
                name: '初学者',
                characteristics: ['首次使用', '基础训练', '循序渐进'],
                recommendedSessions: '8-12节',
                avgDuration: '15-20分钟'
            },
            intermediate: {
                name: '进阶者',
                characteristics: ['有一定基础', '中等强度', '技能提升'],
                recommendedSessions: '12-16节',
                avgDuration: '20-30分钟'
            },
            advanced: {
                name: '专业用户',
                characteristics: ['经验丰富', '高强度训练', '个性化需求'],
                recommendedSessions: '16-24节',
                avgDuration: '30-45分钟'
            }
        };

        this.userProfiles = profiles;
    }

    loadUserTypeData(userType) {
        const profile = this.userProfiles[userType];
        if (!profile) return;

        // 更新用户画像显示
        const profileDisplay = document.getElementById('userProfileDisplay');
        if (profileDisplay) {
            profileDisplay.innerHTML = `
                <div class="profile-info">
                    <h4>${profile.name}</h4>
                    <div class="characteristics">
                        ${profile.characteristics.map(char => `<span class="tag">${char}</span>`).join('')}
                    </div>
                    <div class="recommendations">
                        <p><strong>建议课节数：</strong>${profile.recommendedSessions}</p>
                        <p><strong>平均时长：</strong>${profile.avgDuration}</p>
                    </div>
                </div>
            `;
        }
    }

    loadTrainingData() {
        // 模拟加载训练数据
        const trainingData = {
            totalSessions: 156,
            avgDuration: 25,
            completionRate: 85,
            lastAssessment: {
                score: 78,
                date: '2024-01-15',
                improvements: ['肌力提升', '耐力增强']
            },
            recentFeedback: [
                { date: '2024-01-20', rating: 4, comment: '训练强度适中' },
                { date: '2024-01-18', rating: 5, comment: '效果明显' },
                { date: '2024-01-15', rating: 3, comment: '有些困难' }
            ]
        };

        this.trainingData = trainingData;
        this.updateDataDisplay();
    }

    updateDataDisplay() {
        // 更新数据展示
        const elements = {
            'totalSessions': this.trainingData.totalSessions,
            'avgDuration': `${this.trainingData.avgDuration}分钟`,
            'completionRate': `${this.trainingData.completionRate}%`,
            'lastScore': this.trainingData.lastAssessment.score
        };

        Object.entries(elements).forEach(([id, value]) => {
            const element = document.getElementById(id);
            if (element) {
                element.textContent = value;
            }
        });
    }

    async generateCourse() {
        if (!this.validateAllSteps()) {
            this.showNotification('请完成所有必填配置', 'error');
            return;
        }

        this.showLoading(true);
        
        try {
            // 模拟AI生成过程
            await this.simulateAIGeneration();
            
            // 生成课程内容
            this.generatedCourse = this.createCourseContent();
            
            // 显示生成结果
            this.displayGeneratedCourse();
            
            this.showNotification('课程生成成功！', 'success');
        } catch (error) {
            console.error('课程生成失败:', error);
            this.showNotification('课程生成失败，请重试', 'error');
        } finally {
            this.showLoading(false);
        }
    }

    async simulateAIGeneration() {
        const steps = [
            '分析用户画像数据...',
            '处理历史训练记录...',
            '评估当前课程内容...',
            '分析用户反馈...',
            '整合评估报告...',
            '生成个性化课程...'
        ];

        for (let i = 0; i < steps.length; i++) {
            this.updateGenerationProgress(steps[i], (i + 1) / steps.length * 100);
            await new Promise(resolve => setTimeout(resolve, 800));
        }
    }

    updateGenerationProgress(message, percentage) {
        const progressBar = document.getElementById('generationProgress');
        const progressText = document.getElementById('generationText');
        
        if (progressBar) {
            progressBar.style.width = `${percentage}%`;
        }
        
        if (progressText) {
            progressText.textContent = message;
        }
    }

    createCourseContent() {
        const sessionCount = this.generationRules.sessionCountRule === 'custom' 
            ? parseInt(this.generationRules.customSessionCount)
            : this.getRecommendedSessionCount();

        const course = {
            id: Date.now(),
            name: `AI生成课程 - ${new Date().toLocaleDateString()}`,
            userType: this.userProfile.userType,
            sessionCount: sessionCount,
            totalDuration: sessionCount * 25, // 假设每节课25分钟
            difficulty: this.generationRules.difficultyProgression,
            focus: this.generationRules.contentFocus,
            sessions: []
        };

        // 生成具体课节内容
        for (let i = 1; i <= sessionCount; i++) {
            course.sessions.push(this.generateSessionContent(i, sessionCount));
        }

        return course;
    }

    generateSessionContent(sessionNumber, totalSessions) {
        const difficultyLevel = this.calculateDifficultyLevel(sessionNumber, totalSessions);
        const trainingTypes = this.selectTrainingTypes(sessionNumber, this.generationRules.contentFocus);
        
        return {
            sessionNumber: sessionNumber,
            name: `第${sessionNumber}节课`,
            duration: 25,
            difficulty: difficultyLevel,
            trainingContents: trainingTypes,
            objectives: this.generateSessionObjectives(sessionNumber, difficultyLevel),
            notes: this.generateSessionNotes(sessionNumber)
        };
    }

    calculateDifficultyLevel(sessionNumber, totalSessions) {
        const progression = this.generationRules.difficultyProgression;
        const progress = sessionNumber / totalSessions;
        
        switch (progression) {
            case 'gradual':
                if (progress <= 0.3) return '初级';
                if (progress <= 0.7) return '中级';
                return '高级';
            case 'plateau':
                if (progress <= 0.5) return '初级';
                return '中级';
            case 'intensive':
                if (progress <= 0.2) return '中级';
                return '高级';
            default:
                return '中级';
        }
    }

    selectTrainingTypes(sessionNumber, focus) {
        const allTypes = {
            strength: ['肌力训练', '阻抗训练', '等长收缩'],
            endurance: ['耐力训练', '持续收缩', '间歇训练'],
            coordination: ['协调训练', '节律训练', '反应训练'],
            flexibility: ['柔韧训练', '拉伸训练', '放松训练']
        };

        const focusTypes = focus ? allTypes[focus] || [] : [];
        const otherTypes = Object.values(allTypes).flat().filter(type => !focusTypes.includes(type));
        
        // 根据课节数选择训练内容
        const selectedTypes = [];
        
        if (focusTypes.length > 0) {
            selectedTypes.push(focusTypes[sessionNumber % focusTypes.length]);
        }
        
        if (selectedTypes.length < 3) {
            const additionalTypes = otherTypes.slice(0, 3 - selectedTypes.length);
            selectedTypes.push(...additionalTypes);
        }
        
        return selectedTypes;
    }

    generateSessionObjectives(sessionNumber, difficulty) {
        const objectives = {
            '初级': ['建立基础肌力', '学习正确动作', '适应训练节奏'],
            '中级': ['提升肌力水平', '增强肌肉耐力', '改善协调性'],
            '高级': ['达到最佳状态', '维持训练效果', '个性化调整']
        };
        
        return objectives[difficulty] || objectives['中级'];
    }

    generateSessionNotes(sessionNumber) {
        const notes = [
            '注意保持正确姿势',
            '根据个人感受调整强度',
            '训练后注意放松',
            '记录训练感受',
            '如有不适请及时停止'
        ];
        
        return notes[sessionNumber % notes.length];
    }

    getRecommendedSessionCount() {
        const userType = this.userProfile.userType;
        const recommendations = {
            'beginner': 10,
            'intermediate': 14,
            'advanced': 20
        };
        
        return recommendations[userType] || 12;
    }

    displayGeneratedCourse() {
        const resultContainer = document.getElementById('generationResult');
        if (!resultContainer || !this.generatedCourse) return;

        const course = this.generatedCourse;
        
        resultContainer.innerHTML = `
            <div class="course-summary">
                <h3>${course.name}</h3>
                <div class="summary-stats">
                    <div class="stat-item">
                        <span class="stat-number">${course.sessionCount}</span>
                        <span class="stat-label">总课节数</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-number">${course.totalDuration}</span>
                        <span class="stat-label">总时长(分钟)</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-number">${course.difficulty}</span>
                        <span class="stat-label">难度进阶</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-number">${course.focus || '综合'}</span>
                        <span class="stat-label">训练重点</span>
                    </div>
                </div>
            </div>
            
            <div class="sessions-preview">
                <h4>课节预览</h4>
                <div class="sessions-list">
                    ${course.sessions.slice(0, 5).map(session => `
                        <div class="session-item">
                            <div class="session-header">
                                <span class="session-number">${session.sessionNumber}</span>
                                <span class="session-name">${session.name}</span>
                                <span class="session-difficulty">${session.difficulty}</span>
                            </div>
                            <div class="session-content">
                                <div class="training-types">
                                    ${session.trainingContents.map(type => `<span class="training-tag">${type}</span>`).join('')}
                                </div>
                                <div class="session-objectives">
                                    <strong>训练目标：</strong>${session.objectives.join('、')}
                                </div>
                            </div>
                        </div>
                    `).join('')}
                    ${course.sessions.length > 5 ? `<div class="more-sessions">还有 ${course.sessions.length - 5} 节课...</div>` : ''}
                </div>
            </div>
        `;
        
        // 显示结果区域
        resultContainer.style.display = 'block';
    }

    validateAllSteps() {
        return this.userProfile.userType && 
               Object.keys(this.aiConfig).length > 0 && 
               Object.keys(this.generationRules).length > 0;
    }

    saveCourse() {
        if (!this.generatedCourse) {
            this.showNotification('请先生成课程', 'warning');
            return;
        }

        // 保存到本地存储
        const savedCourses = JSON.parse(localStorage.getItem('savedCourses') || '[]');
        savedCourses.push(this.generatedCourse);
        localStorage.setItem('savedCourses', JSON.stringify(savedCourses));
        
        this.showNotification('课程保存成功！', 'success');
    }

    previewCourse() {
        if (!this.generatedCourse) {
            this.showNotification('请先生成课程', 'warning');
            return;
        }

        // 跳转到课程预览页面
        const courseData = encodeURIComponent(JSON.stringify(this.generatedCourse));
        window.open(`session-config.html?preview=true&data=${courseData}`, '_blank');
    }

    exportCourse() {
        if (!this.generatedCourse) {
            this.showNotification('请先生成课程', 'warning');
            return;
        }

        // 导出为JSON文件
        const dataStr = JSON.stringify(this.generatedCourse, null, 2);
        const dataBlob = new Blob([dataStr], {type: 'application/json'});
        
        const link = document.createElement('a');
        link.href = URL.createObjectURL(dataBlob);
        link.download = `${this.generatedCourse.name}.json`;
        link.click();
        
        this.showNotification('课程导出成功！', 'success');
    }

    showLoading(show) {
        const loadingOverlay = document.getElementById('loadingOverlay');
        if (loadingOverlay) {
            loadingOverlay.style.display = show ? 'flex' : 'none';
        }
    }

    showNotification(message, type = 'info') {
        // 创建通知元素
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <i class="fas ${this.getNotificationIcon(type)}"></i>
            <span>${message}</span>
            <button class="close-notification" onclick="this.parentElement.remove()">
                <i class="fas fa-times"></i>
            </button>
        `;
        
        // 添加到页面
        document.body.appendChild(notification);
        
        // 自动移除
        setTimeout(() => {
            if (notification.parentElement) {
                notification.remove();
            }
        }, 5000);
    }

    getNotificationIcon(type) {
        const icons = {
            'success': 'fa-check-circle',
            'error': 'fa-exclamation-circle',
            'warning': 'fa-exclamation-triangle',
            'info': 'fa-info-circle'
        };
        return icons[type] || icons['info'];
    }

    saveToLocalStorage(key, data) {
        try {
            localStorage.setItem(`aiCourseGenerator_${key}`, JSON.stringify(data));
        } catch (error) {
            console.error('保存到本地存储失败:', error);
        }
    }

    loadFromLocalStorage(key) {
        try {
            const data = localStorage.getItem(`aiCourseGenerator_${key}`);
            return data ? JSON.parse(data) : null;
        } catch (error) {
            console.error('从本地存储加载失败:', error);
            return null;
        }
    }

    resetConfiguration() {
        this.userProfile = {};
        this.aiConfig = {};
        this.generationRules = {};
        this.generatedCourse = null;
        
        // 清除本地存储
        ['userProfile', 'aiConfig', 'generationRules'].forEach(key => {
            localStorage.removeItem(`aiCourseGenerator_${key}`);
        });
        
        // 重置表单
        document.querySelectorAll('form').forEach(form => form.reset());
        
        // 回到第一步
        this.currentStep = 1;
        this.updateStepDisplay();
        this.updateStepIndicator();
        
        this.showNotification('配置已重置', 'info');
    }
    // 补充生成规则相关方法
    updateTrainingDistribution() {
        const basicRatio = parseFloat(document.getElementById('basicTrainingRatio').value) || 0.4;
        const intensiveRatio = parseFloat(document.getElementById('intensiveTrainingRatio').value) || 0.4;
        const recoveryRatio = parseFloat(document.getElementById('recoveryTrainingRatio').value) || 0.2;
        
        // 确保比例总和为1
        const total = basicRatio + intensiveRatio + recoveryRatio;
        if (Math.abs(total - 1.0) > 0.01) {
            this.showNotification('训练类型分布比例总和应为100%', 'warning');
            return false;
        }
        
        this.generationRules.trainingDistribution = {
            basic: basicRatio,
            intensive: intensiveRatio,
            recovery: recoveryRatio
        };
        
        this.updateDistributionChart();
        return true;
    }
    
    updateDistributionChart() {
        const distribution = this.generationRules.trainingDistribution;
        if (!distribution) return;
        
        const chartContainer = document.getElementById('distributionChart');
        if (!chartContainer) return;
        
        chartContainer.innerHTML = `
            <div class="chart-bar">
                <div class="bar-segment basic" style="width: ${distribution.basic * 100}%">
                    <span>基础 ${(distribution.basic * 100).toFixed(0)}%</span>
                </div>
                <div class="bar-segment intensive" style="width: ${distribution.intensive * 100}%">
                    <span>强化 ${(distribution.intensive * 100).toFixed(0)}%</span>
                </div>
                <div class="bar-segment recovery" style="width: ${distribution.recovery * 100}%">
                    <span>恢复 ${(distribution.recovery * 100).toFixed(0)}%</span>
                </div>
            </div>
        `;
    }
    
    updateHealthAdjustments() {
        const adjustments = {};
        
        // 获取健康状况调整参数
        document.querySelectorAll('.health-adjustment').forEach(input => {
            const condition = input.dataset.condition;
            const factor = parseFloat(input.value) || 1.0;
            adjustments[condition] = factor;
        });
        
        this.generationRules.healthAdjustments = adjustments;
        this.validateHealthAdjustments();
    }
    
    validateHealthAdjustments() {
        const adjustments = this.generationRules.healthAdjustments;
        if (!adjustments) return;
        
        // 检查调整因子是否在合理范围内
        Object.entries(adjustments).forEach(([condition, factor]) => {
            if (factor < 0.1 || factor > 2.0) {
                this.showNotification(`${condition}调整因子应在0.1-2.0之间`, 'warning');
            }
        });
    }
    
    updatePersonalizationRules() {
        const rules = {
            useCompletionRate: document.querySelector('input[data-rule="completion"]').checked,
            useTrainingFrequency: document.querySelector('input[data-rule="frequency"]').checked,
            useProgressSpeed: document.querySelector('input[data-rule="progress"]').checked,
            useDeviceHabits: document.querySelector('input[data-rule="device"]').checked,
            comfortThreshold: parseFloat(document.getElementById('comfortThreshold').value) || 7,
            fatigueThreshold: parseFloat(document.getElementById('fatigueThreshold').value) || 6
        };
        
        this.generationRules.personalization = rules;
    }
    
    // 补充预览测试相关方法
    loadUserData() {
        const selectedUser = document.getElementById('testUserSelect').value;
        if (!selectedUser) {
            this.showNotification('请选择测试用户', 'warning');
            return;
        }
        
        // 模拟加载用户数据
        this.showLoading(true);
        
        setTimeout(() => {
            const userData = this.getTestUserData(selectedUser);
            this.displayUserData(userData);
            this.showLoading(false);
            
            // 自动生成预览课程
            this.generatePreviewCourse(userData);
        }, 1500);
    }
    
    getTestUserData(userId) {
        const testUsers = {
            'user1': {
                id: 'user1',
                name: '张三',
                profile: {
                    age: 35,
                    gender: '女性',
                    level: '初学者',
                    goals: ['改善体态', '增强体质'],
                    conditions: ['轻度颈椎问题']
                },
                history: {
                    totalSessions: 15,
                    completionRate: 0.85,
                    averageIntensity: 0.6,
                    preferredDuration: 25
                },
                assessment: {
                    strength: 3,
                    endurance: 4,
                    flexibility: 5,
                    coordination: 3,
                    lastUpdate: '2024-01-15'
                },
                feedback: {
                    averageComfort: 7.5,
                    averageFatigue: 4.2,
                    commonComplaints: ['颈部紧张', '时间不够']
                }
            },
            'user2': {
                id: 'user2',
                name: '李四',
                profile: {
                    age: 28,
                    gender: '男性',
                    level: '进阶者',
                    goals: ['增肌', '提升运动表现'],
                    conditions: []
                },
                history: {
                    totalSessions: 45,
                    completionRate: 0.92,
                    averageIntensity: 0.8,
                    preferredDuration: 35
                },
                assessment: {
                    strength: 7,
                    endurance: 6,
                    flexibility: 4,
                    coordination: 6,
                    lastUpdate: '2024-01-18'
                },
                feedback: {
                    averageComfort: 8.2,
                    averageFatigue: 6.1,
                    commonComplaints: ['希望更有挑战性']
                }
            },
            'user3': {
                id: 'user3',
                name: '王五',
                profile: {
                    age: 42,
                    gender: '女性',
                    level: '专业用户',
                    goals: ['维持状态', '预防损伤'],
                    conditions: ['膝关节轻微磨损']
                },
                history: {
                    totalSessions: 120,
                    completionRate: 0.95,
                    averageIntensity: 0.75,
                    preferredDuration: 40
                },
                assessment: {
                    strength: 8,
                    endurance: 8,
                    flexibility: 7,
                    coordination: 8,
                    lastUpdate: '2024-01-20'
                },
                feedback: {
                    averageComfort: 8.8,
                    averageFatigue: 5.5,
                    commonComplaints: ['膝关节偶有不适']
                }
            }
        };
        
        return testUsers[userId] || null;
    }
    
    displayUserData(userData) {
        if (!userData) return;
        
        // 显示用户画像
        document.getElementById('userProfileData').innerHTML = `
            <div class="profile-item">
                <span class="label">姓名：</span><span>${userData.name}</span>
            </div>
            <div class="profile-item">
                <span class="label">年龄：</span><span>${userData.profile.age}岁</span>
            </div>
            <div class="profile-item">
                <span class="label">性别：</span><span>${userData.profile.gender}</span>
            </div>
            <div class="profile-item">
                <span class="label">水平：</span><span>${userData.profile.level}</span>
            </div>
            <div class="profile-item">
                <span class="label">目标：</span><span>${userData.profile.goals.join('、')}</span>
            </div>
            <div class="profile-item">
                <span class="label">健康状况：</span><span>${userData.profile.conditions.length > 0 ? userData.profile.conditions.join('、') : '无特殊情况'}</span>
            </div>
        `;
        
        // 显示训练历史
        document.getElementById('trainingHistoryData').innerHTML = `
            <div class="history-stats">
                <div class="stat">
                    <span class="number">${userData.history.totalSessions}</span>
                    <span class="label">总课节数</span>
                </div>
                <div class="stat">
                    <span class="number">${(userData.history.completionRate * 100).toFixed(0)}%</span>
                    <span class="label">完成率</span>
                </div>
                <div class="stat">
                    <span class="number">${(userData.history.averageIntensity * 10).toFixed(1)}</span>
                    <span class="label">平均强度</span>
                </div>
                <div class="stat">
                    <span class="number">${userData.history.preferredDuration}</span>
                    <span class="label">偏好时长(分)</span>
                </div>
            </div>
        `;
        
        // 显示最新评估
        document.getElementById('assessmentData').innerHTML = `
            <div class="assessment-grid">
                <div class="assessment-item">
                    <span class="label">肌力</span>
                    <div class="progress-bar">
                        <div class="progress" style="width: ${userData.assessment.strength * 10}%"></div>
                    </div>
                    <span class="score">${userData.assessment.strength}/10</span>
                </div>
                <div class="assessment-item">
                    <span class="label">耐力</span>
                    <div class="progress-bar">
                        <div class="progress" style="width: ${userData.assessment.endurance * 10}%"></div>
                    </div>
                    <span class="score">${userData.assessment.endurance}/10</span>
                </div>
                <div class="assessment-item">
                    <span class="label">柔韧</span>
                    <div class="progress-bar">
                        <div class="progress" style="width: ${userData.assessment.flexibility * 10}%"></div>
                    </div>
                    <span class="score">${userData.assessment.flexibility}/10</span>
                </div>
                <div class="assessment-item">
                    <span class="label">协调</span>
                    <div class="progress-bar">
                        <div class="progress" style="width: ${userData.assessment.coordination * 10}%"></div>
                    </div>
                    <span class="score">${userData.assessment.coordination}/10</span>
                </div>
            </div>
            <div class="update-time">更新时间：${userData.assessment.lastUpdate}</div>
        `;
        
        // 显示反馈记录
        document.getElementById('feedbackData').innerHTML = `
            <div class="feedback-summary">
                <div class="feedback-item">
                    <span class="label">平均舒适度：</span>
                    <span class="value">${userData.feedback.averageComfort}/10</span>
                </div>
                <div class="feedback-item">
                    <span class="label">平均疲劳度：</span>
                    <span class="value">${userData.feedback.averageFatigue}/10</span>
                </div>
                <div class="feedback-item">
                    <span class="label">常见反馈：</span>
                    <span class="value">${userData.feedback.commonComplaints.join('、')}</span>
                </div>
            </div>
        `;
        
        // 显示用户数据预览区域
        document.getElementById('userDataPreview').style.display = 'block';
    }
    
    generatePreviewCourse(userData) {
        if (!userData) return;
        
        this.showLoading(true);
        
        // 模拟AI生成过程
        setTimeout(() => {
            const generatedCourse = this.simulateAIGeneration(userData);
            this.displayGenerationResult(generatedCourse);
            this.showLoading(false);
        }, 2000);
    }
    
    simulateAIGeneration(userData) {
        // 基于用户数据和配置规则生成课程
        const sessionCount = this.calculateOptimalSessionCount(userData);
        const totalDuration = this.calculateTotalDuration(userData, sessionCount);
        const difficultyLevel = this.determineDifficultyLevel(userData);
        const mainTrainingTypes = this.selectMainTrainingTypes(userData);
        
        const sessions = [];
        for (let i = 1; i <= sessionCount; i++) {
            sessions.push(this.generateDetailedSession(i, sessionCount, userData));
        }
        
        return {
            name: `${userData.name}的个性化训练课程`,
            sessionCount: sessionCount,
            totalDuration: totalDuration,
            difficulty: difficultyLevel,
            mainTrainingTypes: mainTrainingTypes,
            sessions: sessions,
            generatedAt: new Date().toISOString()
        };
    }
    
    calculateOptimalSessionCount(userData) {
        const baseCount = {
            '初学者': 10,
            '进阶者': 14,
            '专业用户': 18
        }[userData.profile.level] || 12;
        
        // 根据完成率调整
        const completionAdjustment = userData.history.completionRate > 0.9 ? 2 : 
                                   userData.history.completionRate < 0.7 ? -2 : 0;
        
        return Math.max(8, Math.min(20, baseCount + completionAdjustment));
    }
    
    calculateTotalDuration(userData, sessionCount) {
        const avgDuration = userData.history.preferredDuration || 25;
        return sessionCount * avgDuration;
    }
    
    determineDifficultyLevel(userData) {
        const avgAssessment = (userData.assessment.strength + 
                              userData.assessment.endurance + 
                              userData.assessment.flexibility + 
                              userData.assessment.coordination) / 4;
        
        if (avgAssessment >= 7) return '高级进阶';
        if (avgAssessment >= 5) return '中级提升';
        return '基础建立';
    }
    
    selectMainTrainingTypes(userData) {
        const weakestAreas = [];
        const assessment = userData.assessment;
        
        if (assessment.strength <= 5) weakestAreas.push('肌力训练');
        if (assessment.endurance <= 5) weakestAreas.push('耐力训练');
        if (assessment.flexibility <= 5) weakestAreas.push('柔韧训练');
        if (assessment.coordination <= 5) weakestAreas.push('协调训练');
        
        return weakestAreas.length > 0 ? weakestAreas : ['综合训练'];
    }
    
    generateDetailedSession(sessionNumber, totalSessions, userData) {
        const progress = sessionNumber / totalSessions;
        const baseIntensity = userData.history.averageIntensity || 0.6;
        
        // 根据进度调整强度
        let intensity = baseIntensity;
        if (progress <= 0.3) {
            intensity *= 0.8; // 前期降低强度
        } else if (progress >= 0.7) {
            intensity *= 1.1; // 后期提高强度
        }
        
        // 健康状况调整
        if (userData.profile.conditions.length > 0) {
            intensity *= 0.9;
        }
        
        const trainingTypes = this.selectSessionTrainingTypes(sessionNumber, userData);
        const duration = this.calculateSessionDuration(sessionNumber, userData);
        
        return {
            sessionNumber: sessionNumber,
            name: `第${sessionNumber}节 - ${this.getSessionTheme(sessionNumber, totalSessions)}`,
            duration: duration,
            intensity: Math.min(1.0, Math.max(0.3, intensity)),
            trainingTypes: trainingTypes,
            objectives: this.generateSessionObjectives(sessionNumber, userData),
            notes: this.generateSessionNotes(sessionNumber, userData),
            adaptations: this.generateAdaptations(userData)
        };
    }
    
    getSessionTheme(sessionNumber, totalSessions) {
        const progress = sessionNumber / totalSessions;
        
        if (progress <= 0.2) return '基础适应';
        if (progress <= 0.4) return '技能建立';
        if (progress <= 0.6) return '能力提升';
        if (progress <= 0.8) return '强化训练';
        return '巩固完善';
    }
    
    selectSessionTrainingTypes(sessionNumber, userData) {
        const allTypes = ['肌力训练', '耐力训练', '柔韧训练', '协调训练', '平衡训练'];
        const weakAreas = this.selectMainTrainingTypes(userData);
        
        // 确保弱项训练优先
        const selectedTypes = [];
        if (weakAreas.length > 0 && weakAreas[0] !== '综合训练') {
            selectedTypes.push(weakAreas[sessionNumber % weakAreas.length]);
        }
        
        // 添加其他训练类型
        const remainingTypes = allTypes.filter(type => !selectedTypes.includes(type));
        while (selectedTypes.length < 3 && remainingTypes.length > 0) {
            const randomIndex = Math.floor(Math.random() * remainingTypes.length);
            selectedTypes.push(remainingTypes.splice(randomIndex, 1)[0]);
        }
        
        return selectedTypes;
    }
    
    calculateSessionDuration(sessionNumber, userData) {
        const baseDuration = userData.history.preferredDuration || 25;
        const variation = Math.random() * 10 - 5; // ±5分钟随机变化
        return Math.round(baseDuration + variation);
    }
    
    generateAdaptations(userData) {
        const adaptations = [];
        
        userData.profile.conditions.forEach(condition => {
            if (condition.includes('颈椎')) {
                adaptations.push('避免过度仰头动作');
                adaptations.push('增加颈部放松练习');
            }
            if (condition.includes('膝关节')) {
                adaptations.push('减少跳跃类动作');
                adaptations.push('加强股四头肌训练');
            }
        });
        
        return adaptations;
    }
    
    displayGenerationResult(course) {
        if (!course) return;
        
        // 更新汇总信息
        document.getElementById('recommendedSessions').textContent = course.sessionCount;
        document.getElementById('totalDuration').textContent = `${course.totalDuration}分钟`;
        document.getElementById('difficultyLevel').textContent = course.difficulty;
        document.getElementById('mainTrainingTypes').textContent = course.mainTrainingTypes.join('、');
        
        // 更新课程内容预览
        const previewContainer = document.getElementById('courseContentPreview');
        previewContainer.innerHTML = `
            <div class="course-sessions">
                ${course.sessions.slice(0, 6).map(session => `
                    <div class="session-preview">
                        <div class="session-header">
                            <span class="session-number">${session.sessionNumber}</span>
                            <span class="session-name">${session.name}</span>
                            <span class="session-duration">${session.duration}分钟</span>
                        </div>
                        <div class="session-details">
                            <div class="training-types">
                                ${session.trainingTypes.map(type => `<span class="type-tag">${type}</span>`).join('')}
                            </div>
                            <div class="intensity-bar">
                                <span class="label">强度：</span>
                                <div class="bar">
                                    <div class="fill" style="width: ${session.intensity * 100}%"></div>
                                </div>
                                <span class="value">${(session.intensity * 10).toFixed(1)}/10</span>
                            </div>
                            <div class="objectives">
                                <strong>目标：</strong>${session.objectives.slice(0, 2).join('、')}
                            </div>
                            ${session.adaptations.length > 0 ? `
                                <div class="adaptations">
                                    <strong>特殊调整：</strong>${session.adaptations.join('、')}
                                </div>
                            ` : ''}
                        </div>
                    </div>
                `).join('')}
                ${course.sessions.length > 6 ? `
                    <div class="more-sessions">
                        <span>还有 ${course.sessions.length - 6} 节课...</span>
                        <button class="btn secondary-btn" onclick="showAllSessions()">查看全部</button>
                    </div>
                ` : ''}
            </div>
        `;
        
        // 显示生成结果区域
        document.getElementById('generationResult').style.display = 'block';
        
        // 保存生成的课程
        this.generatedCourse = course;
    }
        




}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
    window.aiCourseGenerator = new AICourseGenerator();
});

// 全局函数
function resetConfiguration() {
    if (window.aiCourseGenerator) {
        window.aiCourseGenerator.resetConfiguration();
    }
}

function exportConfiguration() {
    if (window.aiCourseGenerator) {
        const config = {
            userProfile: window.aiCourseGenerator.userProfile,
            aiConfig: window.aiCourseGenerator.aiConfig,
            generationRules: window.aiCourseGenerator.generationRules
        };
        
        const dataStr = JSON.stringify(config, null, 2);
        const dataBlob = new Blob([dataStr], {type: 'application/json'});
        
        const link = document.createElement('a');
        link.href = URL.createObjectURL(dataBlob);
        link.download = 'ai-course-generator-config.json';
        link.click();
    }
}

function importConfiguration() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    
    input.onchange = function(event) {
        const file = event.target.files[0];
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = function(e) {
            try {
                const config = JSON.parse(e.target.result);
                
                if (window.aiCourseGenerator) {
                    window.aiCourseGenerator.userProfile = config.userProfile || {};
                    window.aiCourseGenerator.aiConfig = config.aiConfig || {};
                    window.aiCourseGenerator.generationRules = config.generationRules || {};
                    
                    // 更新界面显示
                    window.aiCourseGenerator.updateWeightDisplay();
                    window.aiCourseGenerator.showNotification('配置导入成功！', 'success');
                }
            } catch (error) {
                console.error('配置文件格式错误:', error);
                if (window.aiCourseGenerator) {
                    window.aiCourseGenerator.showNotification('配置文件格式错误', 'error');
                }
            }
        };
        reader.readAsText(file);
    };
    
    input.click();
}

// 全局函数补充
function loadUserData() {
    if (window.aiCourseGenerator) {
        window.aiCourseGenerator.loadUserData();
    }
}

function showAllSessions() {
    if (window.aiCourseGenerator && window.aiCourseGenerator.generatedCourse) {
        const course = window.aiCourseGenerator.generatedCourse;
        const courseData = encodeURIComponent(JSON.stringify(course));
        window.open(`session-config.html?preview=true&data=${courseData}`, '_blank');
    }
}

function testGeneration() {
    if (window.aiCourseGenerator) {
        // 快速测试生成功能
        const testUser = window.aiCourseGenerator.getTestUserData('user2');
        window.aiCourseGenerator.generatePreviewCourse(testUser);
    }
}