class RehabilitationPlanDetail {
    constructor() {
        this.currentLesson = 3;
        this.planData = {
            totalDuration: { hours: 8, minutes: 21 },
            totalLessons: 18,
            completionRate: 11,
            currentStage: 'intermediate'
        };
        this.lessons = [];
        
        this.init();
    }

    init() {
        this.loadPlanData();
        this.bindEvents();
        this.updateProgress();
    }

    // 加载计划数据
    loadPlanData() {
        // 模拟从API加载数据
        this.lessons = [
            {
                id: 1,
                title: '盆底肌认知训练',
                description: '学习正确的盆底肌收缩方法，建立肌肉感知',
                duration: 20,
                stage: 'basic',
                type: 'cognitive',
                status: 'completed',
                date: '06/12',
                trainingItems: [
                    { name: '基础收缩练习', duration: 10, status: 'completed' },
                    { name: '肌肉感知训练', duration: 10, status: 'completed' }
                ]
            },
            {
                id: 2,
                title: '基础呼吸训练',
                description: '学习腹式呼吸，为后续训练打基础',
                duration: 15,
                stage: 'basic',
                type: 'breathing',
                status: 'completed',
                date: '06/14',
                trainingItems: [
                    { name: '腹式呼吸练习', duration: 8, status: 'completed' },
                    { name: '呼吸节奏训练', duration: 7, status: 'completed' }
                ]
            },
            {
                id: 3,
                title: '盆底肌基础收缩',
                description: '进行基础的盆底肌收缩练习，每次收缩保持3-5秒',
                duration: 18,
                stage: 'basic',
                type: 'cognitive',
                status: 'current',
                date: '06/16',
                trainingItems: [
                    { name: '慢速收缩练习', duration: 10, status: 'current' },
                    { name: '快速收缩练习', duration: 8, status: 'pending' }
                ]
            },
            {
                id: 4,
                title: '盆底肌力量训练',
                description: '增强盆底肌力量，提高收缩持续时间',
                duration: 22,
                stage: 'basic',
                type: 'strength',
                status: 'upcoming',
                date: '06/18',
                trainingItems: [
                    { name: '持续收缩训练', duration: 12, status: 'pending' },
                    { name: '间歇性训练', duration: 10, status: 'pending' }
                ]
            }
        ];
    }

    // 绑定事件
    bindEvents() {
        // 绑定弹窗关闭事件
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal-overlay')) {
                this.closeCustomizeModal();
            }
        });

        // 绑定ESC键关闭弹窗
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeCustomizeModal();
            }
        });
    }

    // 更新进度显示
    updateProgress() {
        const completedLessons = this.lessons.filter(lesson => lesson.status === 'completed').length;
        const completionRate = Math.round((completedLessons / this.lessons.length) * 100);
        
        // 更新统计数据
        document.querySelector('.stat-number').textContent = this.planData.totalDuration.hours;
        document.querySelectorAll('.stat-number')[1].textContent = this.planData.totalLessons;
        document.querySelectorAll('.stat-number')[2].textContent = completionRate;
    }

    // 开始课程
    startLesson(lessonId) {
        console.log('Starting lesson:', lessonId);
        // 这里可以跳转到训练页面或打开训练界面
        this.showNotification('开始训练课程', 'success');
    }

    // 定制课节
    customizeLesson(lessonId) {
        const lesson = this.lessons.find(l => l.id === lessonId);
        if (lesson) {
            this.openCustomizeModal(lesson);
        }
    }

    // 打开定制弹窗
    openCustomizeModal(lesson) {
        const modal = document.getElementById('customizeModal');
        
        // 填充表单数据
        document.getElementById('lessonName').value = lesson.title;
        document.getElementById('lessonDuration').value = lesson.duration;
        document.getElementById('trainingType').value = lesson.type;
        document.getElementById('lessonDescription').value = lesson.description;
        
        // 清空训练内容列表
        const contentList = document.querySelector('.training-content-list');
        contentList.innerHTML = '';
        
        // 添加现有训练内容
        lesson.trainingItems.forEach(item => {
            this.addTrainingContentItem(item.name, item.duration);
        });
        
        modal.classList.add('show');
        document.body.style.overflow = 'hidden';
    }

    // 关闭定制弹窗
    closeCustomizeModal() {
        const modal = document.getElementById('customizeModal');
        modal.classList.remove('show');
        document.body.style.overflow = 'auto';
    }

    // 添加训练内容项
    addTrainingContentItem(name = '', duration = '') {
        const contentList = document.querySelector('.training-content-list');
        const contentItem = document.createElement('div');
        contentItem.className = 'content-item';
        contentItem.innerHTML = `
            <input type="text" placeholder="训练项目名称" value="${name}">
            <input type="number" placeholder="时长(分钟)" min="1" max="30" value="${duration}">
            <button class="remove-btn" onclick="this.parentElement.remove()">
                <i class="fas fa-trash"></i>
            </button>
        `;
        contentList.appendChild(contentItem);
    }

    // 保存定制内容
    saveCustomization() {
        const lessonName = document.getElementById('lessonName').value;
        const lessonDuration = document.getElementById('lessonDuration').value;
        const trainingType = document.getElementById('trainingType').value;
        const lessonDescription = document.getElementById('lessonDescription').value;
        
        // 收集训练内容
        const trainingItems = [];
        document.querySelectorAll('.content-item').forEach(item => {
            const nameInput = item.querySelector('input[type="text"]');
            const durationInput = item.querySelector('input[type="number"]');
            if (nameInput.value && durationInput.value) {
                trainingItems.push({
                    name: nameInput.value,
                    duration: parseInt(durationInput.value),
                    status: 'pending'
                });
            }
        });
        
        console.log('Saving customization:', {
            name: lessonName,
            duration: lessonDuration,
            type: trainingType,
            description: lessonDescription,
            trainingItems: trainingItems
        });
        
        this.showNotification('课节定制已保存', 'success');
        this.closeCustomizeModal();
    }

    // 显示通知
    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <i class="fas fa-${type === 'success' ? 'check-circle' : 'info-circle'}"></i>
            <span>${message}</span>
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.classList.add('show');
        }, 100);
        
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                if (notification.parentNode) {
                    document.body.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }

    // 导出计划
    exportPlan() {
        console.log('Exporting training plan...');
        this.showNotification('训练计划导出中...', 'info');
    }

    // 继续训练
    continueTreatment() {
        const currentLesson = this.lessons.find(lesson => lesson.status === 'current');
        if (currentLesson) {
            this.startLesson(currentLesson.id);
        } else {
            this.showNotification('没有正在进行的训练课程', 'info');
        }
    }

    // 显示历史记录
    showHistory() {
        console.log('Showing training history...');
        this.showNotification('查看训练历史', 'info');
    }

    // 分享训练计划
    shareTrainingPlan() {
        console.log('Sharing training plan...');
        this.showNotification('分享训练计划', 'info');
    }

    // 返回上一页
    goBack() {
        if (window.history.length > 1) {
            window.history.back();
        } else {
            window.close();
        }
    }
}

// 全局函数
function goBack() {
    if (window.rehabilitationPlan) {
        window.rehabilitationPlan.goBack();
    }
}

function showHistory() {
    if (window.rehabilitationPlan) {
        window.rehabilitationPlan.showHistory();
    }
}

function shareTrainingPlan() {
    if (window.rehabilitationPlan) {
        window.rehabilitationPlan.shareTrainingPlan();
    }
}

function startLesson(lessonId) {
    if (window.rehabilitationPlan) {
        window.rehabilitationPlan.startLesson(lessonId);
    }
}

function customizeLesson(lessonId) {
    if (window.rehabilitationPlan) {
        window.rehabilitationPlan.customizeLesson(lessonId);
    }
}

function closeCustomizeModal() {
    if (window.rehabilitationPlan) {
        window.rehabilitationPlan.closeCustomizeModal();
    }
}

function addTrainingContent() {
    if (window.rehabilitationPlan) {
        window.rehabilitationPlan.addTrainingContentItem();
    }
}

function saveCustomization() {
    if (window.rehabilitationPlan) {
        window.rehabilitationPlan.saveCustomization();
    }
}

function exportPlan() {
    if (window.rehabilitationPlan) {
        window.rehabilitationPlan.exportPlan();
    }
}

function continueTreatment() {
    if (window.rehabilitationPlan) {
        window.rehabilitationPlan.continueTreatment();
    }
}

// 初始化
document.addEventListener('DOMContentLoaded', () => {
    window.rehabilitationPlan = new RehabilitationPlanDetail();
});