// 页面导航管理器
class DecisionTreeNavigation {
    constructor() {
        this.currentStep = 1;
        this.maxSteps = 4;
        this.stepData = {
            parameters: null,
            rules: null,
            validation: null,
            generation: null
        };
        
        this.init();
    }

    init() {
        this.loadStepData();
        this.updateStepNavigation();
    }

    // 保存当前步骤数据
    saveStepData(step, data) {
        const stepKeys = ['parameters', 'rules', 'validation', 'generation'];
        this.stepData[stepKeys[step - 1]] = data;
        localStorage.setItem('decisionTreeStepData', JSON.stringify(this.stepData));
    }

    // 加载步骤数据
    loadStepData() {
        const saved = localStorage.getItem('decisionTreeStepData');
        if (saved) {
            this.stepData = JSON.parse(saved);
        }
    }

    // 获取当前步骤
    getCurrentStep() {
        const path = window.location.pathname;
        if (path.includes('decision-tree-rules')) return 2;
        if (path.includes('decision-tree-validation')) return 3;
        if (path.includes('decision-tree-generation')) return 4;
        return 1;
    }

    // 更新步骤导航状态
    updateStepNavigation() {
        const currentStep = this.getCurrentStep();
        const stepItems = document.querySelectorAll('.step-item');
        
        stepItems.forEach((item, index) => {
            const stepNumber = index + 1;
            item.classList.remove('active', 'completed');
            
            if (stepNumber < currentStep) {
                item.classList.add('completed');
            } else if (stepNumber === currentStep) {
                item.classList.add('active');
            }
        });
    }

    // 导航到指定步骤
    navigateToStep(step) {
        const pages = [
            'decision-tree-course-generator.html',
            'decision-tree-rules.html',
            'decision-tree-validation.html',
            'decision-tree-generation.html'
        ];
        
        if (step >= 1 && step <= 4) {
            window.location.href = pages[step - 1];
        }
    }

    // 下一步
    nextStep() {
        const currentStep = this.getCurrentStep();
        if (currentStep < this.maxSteps) {
            this.navigateToStep(currentStep + 1);
        }
    }

    // 上一步
    previousStep() {
        const currentStep = this.getCurrentStep();
        if (currentStep > 1) {
            this.navigateToStep(currentStep - 1);
        }
    }

    // 验证步骤完成状态
    validateStep(step) {
        switch (step) {
            case 1:
                return this.validateParameters();
            case 2:
                return this.validateRules();
            case 3:
                return this.validateValidation();
            case 4:
                return true;
            default:
                return false;
        }
    }

    validateParameters() {
        // 检查参数配置是否完整
        return this.stepData.parameters && 
               Object.keys(this.stepData.parameters).length > 0;
    }

    validateRules() {
        // 检查决策树规则是否配置
        return this.stepData.rules && 
               this.stepData.rules.tree && 
               this.stepData.rules.tree.children.length > 0;
    }

    validateValidation() {
        // 检查验证是否通过
        return this.stepData.validation && 
               this.stepData.validation.passed;
    }
}

// 全局导航实例
const navigation = new DecisionTreeNavigation();

// 全局导航函数
function goBack() {
    navigation.previousStep();
}

function goNext() {
    navigation.nextStep();
}

function navigateToStep(step) {
    navigation.navigateToStep(step);
}

// 页面特定的导航函数
function validateAndNext() {
    const currentStep = navigation.getCurrentStep();
    if (navigation.validateStep(currentStep)) {
        navigation.nextStep();
    } else {
        showNotification('请完成当前步骤的配置', 'warning');
    }
}

function proceedToGeneration() {
    navigation.navigateToStep(4);
}

// 通知函数
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification ${type} show`;
    notification.innerHTML = `
        <i class="fas fa-${getNotificationIcon(type)}"></i>
        <span>${message}</span>
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}

function getNotificationIcon(type) {
    const icons = {
        success: 'check-circle',
        error: 'exclamation-circle',
        warning: 'exclamation-triangle',
        info: 'info-circle'
    };
    return icons[type] || 'info-circle';
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', function() {
    navigation.updateStepNavigation();
});