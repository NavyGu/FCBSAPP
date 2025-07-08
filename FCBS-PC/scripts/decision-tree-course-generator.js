// 决策树课程生成器主类
class DecisionTreeCourseGenerator {
    constructor() {
        this.currentStep = 1;
        this.maxSteps = 4;
        this.parameters = new Map();
        this.decisionTree = null;
        this.validationResults = [];
        this.generatedCourse = null;
        
        this.init();
    }

    init() {
        this.bindEvents();
        this.initializeParameters();
        this.setupTabSwitching();
        this.loadDefaultTree();
        this.initStepNavigation(); // 确保调用步骤导航初始化
    }

    // 事件绑定
    bindEvents() {
        // 参数配置事件
        document.querySelectorAll('input[data-param]').forEach(input => {
            input.addEventListener('change', (e) => this.updateParameter(e));
        });

        // 范围配置事件
        document.querySelectorAll('input[data-ranges]').forEach(input => {
            input.addEventListener('input', (e) => this.updateParameterRanges(e));
        });

        // 节点类型切换事件
        document.getElementById('nodeType').addEventListener('change', (e) => {
            this.switchNodeEditor(e.target.value);
        });

        // 标签页切换事件
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.switchTab(e));
        });
    }

    // 初始化参数
    initializeParameters() {
        this.parameters.set('basic', {
            age: { enabled: false, ranges: [] },
            gender: { enabled: false, values: [] },
            trainingLevel: { enabled: false, values: [] },
            bmi: { enabled: false, ranges: [] },
            healthConditions: { enabled: false, values: [] },
            goals: { enabled: false, values: [] }
        });

        this.parameters.set('history', {
            totalSessions: { enabled: false, ranges: [] },
            completionRate: { enabled: false, ranges: [] },
            averageIntensity: { enabled: false, ranges: [] },
            preferredDuration: { enabled: false, ranges: [] },
            progressTrend: { enabled: false, values: [] },
            frequency: { enabled: false, ranges: [] }
        });

        this.parameters.set('course', {
            trainingTypes: { enabled: false, values: [] },
            difficultyLevels: { enabled: false, values: [] },
            equipment: { enabled: false, values: [] },
            duration: { enabled: false, ranges: [] }
        });

        this.parameters.set('feedback', {
            comfort: { enabled: false, ranges: [] },
            fatigue: { enabled: false, ranges: [] },
            satisfaction: { enabled: false, ranges: [] },
            difficultyPerception: { enabled: false, ranges: [] },
            commonIssues: { enabled: false, values: [] }
        });

        this.parameters.set('assessment', {
            strength: { enabled: false, ranges: [] },
            endurance: { enabled: false, ranges: [] },
            flexibility: { enabled: false, ranges: [] },
            coordination: { enabled: false, ranges: [] },
            balance: { enabled: false, ranges: [] },
            overallScore: { enabled: false, ranges: [] }
        });
    }

    // 更新参数配置
    updateParameter(event) {
        const checkbox = event.target;
        const paramPath = checkbox.dataset.param.split('.');
        const category = paramPath[0];
        const paramName = paramPath[1];
        
        if (this.parameters.has(category)) {
            const categoryParams = this.parameters.get(category);
            if (categoryParams[paramName]) {
                categoryParams[paramName].enabled = checkbox.checked;
                
                // 更新条件参数选择器
                this.updateConditionParamOptions();
            }
        }
    }

    // 更新参数范围配置
    updateParameterRanges(event) {
        const input = event.target;
        const rangeType = input.dataset.ranges;
        const rangeText = input.value;
        
        // 解析范围文本，如 "差(1-3), 中(4-6), 好(7-10)"
        const ranges = this.parseRangeText(rangeText);
        
        // 查找对应的参数并更新范围
        for (const [category, params] of this.parameters) {
            for (const [paramName, paramConfig] of Object.entries(params)) {
                if (paramName === rangeType) {
                    paramConfig.ranges = ranges;
                    break;
                }
            }
        }
    }

    // 解析范围文本
    parseRangeText(text) {
        const ranges = [];
        const matches = text.match(/([^(]+)\(([^)]+)\)/g);
        
        if (matches) {
            matches.forEach(match => {
                const [, label, range] = match.match(/([^(]+)\(([^)]+)\)/);
                ranges.push({
                    label: label.trim(),
                    range: range.trim()
                });
            });
        }
        
        return ranges;
    }

    // 更新条件参数选择器
    updateConditionParamOptions() {
        const select = document.getElementById('conditionParam');
        select.innerHTML = '<option value="">选择参数</option>';
        
        for (const [category, params] of this.parameters) {
            for (const [paramName, paramConfig] of Object.entries(params)) {
                if (paramConfig.enabled) {
                    const option = document.createElement('option');
                    option.value = `${category}.${paramName}`;
                    option.textContent = this.getParameterDisplayName(category, paramName);
                    select.appendChild(option);
                }
            }
        }
    }

    // 获取参数显示名称
    getParameterDisplayName(category, paramName) {
        const displayNames = {
            'basic.age': '年龄',
            'basic.gender': '性别',
            'basic.trainingLevel': '训练水平',
            'basic.bmi': 'BMI指数',
            'basic.healthConditions': '健康状况',
            'basic.goals': '训练目标',
            'history.totalSessions': '总训练次数',
            'history.completionRate': '完成率',
            'history.averageIntensity': '平均训练强度',
            'history.preferredDuration': '偏好训练时长',
            'history.progressTrend': '进步趋势',
            'history.frequency': '训练频率',
            'course.trainingTypes': '训练类型',
            'course.difficultyLevels': '难度等级',
            'course.equipment': '所需设备',
            'course.duration': '课程时长',
            'feedback.comfort': '舒适度',
            'feedback.fatigue': '疲劳度',
            'feedback.satisfaction': '满意度',
            'feedback.difficultyPerception': '难度感知',
            'feedback.commonIssues': '常见问题',
            'assessment.strength': '肌力评分',
            'assessment.endurance': '耐力评分',
            'assessment.flexibility': '柔韧性评分',
            'assessment.coordination': '协调性评分',
            'assessment.balance': '平衡能力评分',
            'assessment.overallScore': '综合评分'
        };
        
        return displayNames[`${category}.${paramName}`] || `${category}.${paramName}`;
    }

    // 切换节点编辑器
    switchNodeEditor(nodeType) {
        const conditionConfig = document.getElementById('conditionConfig');
        const actionConfig = document.getElementById('actionConfig');
        const resultConfig = document.getElementById('resultConfig');
        
        // 隐藏所有配置区域
        conditionConfig.style.display = 'none';
        actionConfig.style.display = 'none';
        resultConfig.style.display = 'none';
        
        // 显示对应的配置区域
        switch (nodeType) {
            case 'condition':
                conditionConfig.style.display = 'block';
                break;
            case 'action':
                actionConfig.style.display = 'block';
                break;
            case 'result':
                resultConfig.style.display = 'block';
                break;
        }
    }

    // 切换标签页
    switchTab(event) {
        const tabBtn = event.target;
        const tabName = tabBtn.dataset.tab;
        
        // 更新标签按钮状态
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        tabBtn.classList.add('active');
        
        // 更新标签内容
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.remove('active');
        });
        document.getElementById(`${tabName}Tab`).classList.add('active');
    }

    // 设置标签页切换
    setupTabSwitching() {
        // 已在 switchTab 方法中实现
    }

    // 加载默认决策树
    loadDefaultTree() {
        this.decisionTree = {
            id: 'root',
            type: 'condition',
            condition: {
                param: 'basic.trainingLevel',
                operator: '==',
                value: '初学者'
            },
            children: [
                {
                    id: 'beginner_branch',
                    type: 'action',
                    action: {
                        type: 'set_session_count',
                        value: '8-12'
                    },
                    children: []
                },
                {
                    id: 'advanced_branch',
                    type: 'condition',
                    condition: {
                        param: 'history.totalSessions',
                        operator: '>',
                        value: '20'
                    },
                    children: []
                }
            ]
        };
        
        this.renderDecisionTree();
    }

    // 初始化步骤导航
    initStepNavigation() {
        // 绑定步骤点击事件
        document.querySelectorAll('.step-item.clickable').forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const step = parseInt(e.currentTarget.dataset.step);
                this.navigateToStep(step);
            });
        });

        // 更新步骤状态
        this.updateStepNavigation();
    }

    // 导航到指定步骤
    navigateToStep(step) {
        console.log('Navigating to step:', step); // 调试日志
        
        const pages = [
            'decision-tree-course-generator.html',
            'decision-tree-rules.html', 
            'decision-tree-validation.html',
            'decision-tree-generation.html'
        ];
        
        if (step >= 1 && step <= 4) {
            // 保存当前步骤数据
            this.saveCurrentStepData();
            
            // 直接跳转到目标页面
            window.location.href = pages[step - 1];
        }
    }

    // 检查是否可以导航到指定步骤（简化版本）
    canNavigateToStep(targetStep) {
        // 暂时允许所有跳转，后续可以添加验证逻辑
        return true;
    }

    // 更新步骤导航状态
    updateStepNavigation() {
        const stepItems = document.querySelectorAll('.step-item');
        
        stepItems.forEach((item, index) => {
            const stepNumber = index + 1;
            item.classList.remove('active', 'completed', 'disabled');
            
            if (stepNumber === this.currentStep) {
                item.classList.add('active');
            } else if (stepNumber < this.currentStep) {
                item.classList.add('completed');
            }
        });
    }

    // 保存当前步骤数据
    saveCurrentStepData() {
        const stepData = {
            step: this.currentStep,
            parameters: Array.from(this.parameters.entries()),
            timestamp: new Date().toISOString()
        };
        
        localStorage.setItem('decisionTreeCurrentStep', JSON.stringify(stepData));
    }

    // 显示通知消息
    showNotification(message, type = 'info') {
        console.log(`${type.toUpperCase()}: ${message}`);
        alert(message); // 临时使用alert，后续可以改为更好的通知组件
    }

    // 检查步骤是否完成
    isStepCompleted(step) {
        switch (step) {
            case 1:
                return this.validateParameters();
            case 2:
                return this.validateRules();
            case 3:
                return this.validateValidation();
            default:
                return true;
        }
    }

    // 显示步骤验证消息
    showStepValidationMessage(step) {
        const messages = {
            2: '请先完成参数配置',
            3: '请先完成决策树规则配置',
            4: '请先完成规则验证'
        };
        
        this.showNotification(messages[step] || '请按顺序完成各个步骤', 'warning');
    }

    // 添加页面切换动画
    addPageTransition(callback) {
        const overlay = document.createElement('div');
        overlay.className = 'page-transition-overlay';
        overlay.innerHTML = '<div class="loading-spinner"><i class="fas fa-spinner fa-spin"></i></div>';
        document.body.appendChild(overlay);
        
        setTimeout(() => {
            callback();
        }, 300);
    }
}

// 决策树可视化相关函数
function addRootNode() {
    const generator = window.courseGenerator;
    if (!generator.decisionTree) {
        generator.decisionTree = {
            id: 'root_' + Date.now(),
            type: 'condition',
            condition: null,
            children: []
        };
        generator.renderDecisionTree();
    }
}

function expandAll() {
    document.querySelectorAll('.tree-node').forEach(node => {
        node.classList.add('expanded');
    });
}

function collapseAll() {
    document.querySelectorAll('.tree-node').forEach(node => {
        node.classList.remove('expanded');
    });
}

function validateTree() {
    const generator = window.courseGenerator;
    generator.validateDecisionTree();
}

// 全局导航函数（简化版本）
function navigateToStep(step) {
    console.log('Global navigateToStep called with step:', step);
    
    const pages = [
        'decision-tree-course-generator.html',
        'decision-tree-rules.html', 
        'decision-tree-validation.html',
        'decision-tree-generation.html'
    ];
    
    if (step >= 1 && step <= 4) {
        // 保存当前步骤到localStorage
        localStorage.setItem('currentDecisionTreeStep', step.toString());
        
        // 直接跳转
        window.location.href = pages[step - 1];
    }
}

// 初始化
document.addEventListener('DOMContentLoaded', () => {
    console.log('Initializing DecisionTreeCourseGenerator');
    window.decisionTreeGenerator = new DecisionTreeCourseGenerator();
    
    // 确保全局函数可用
    window.navigateToStep = navigateToStep;
});