class SessionConfigManager {
    constructor() {
        this.courseId = this.getCourseIdFromUrl();
        this.courseData = null;
        this.sessions = [];
        this.currentSessionIndex = -1;
        this.trainingContents = [];
        this.selectedTrainingContents = [];
        
        this.init();
    }
    
    getCourseIdFromUrl() {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get('courseId');
    }
    
    async init() {
        await this.loadCourseData();
        await this.loadTrainingContents();
        this.initializeEvents();
        this.renderSessions();
        this.updateSummary();
    }
    
    async loadCourseData() {
        // 模拟从API加载课程数据
        this.courseData = {
            id: this.courseId,
            name: "盆底肌康复训练课程",
            userProfile: "初学者",
            sessionCount: 8,
            overview: "针对盆底肌功能障碍的综合康复训练课程",
            status: "draft"
        };
        
        // 初始化课节数据
        this.sessions = Array.from({ length: this.courseData.sessionCount }, (_, index) => ({
            id: `session_${index + 1}`,
            name: `第${index + 1}节课`,
            description: "",
            duration: 0,
            trainingContents: [],
            order: index + 1
        }));
        
        // 更新页面标题
        document.getElementById('courseTitle').textContent = `课节配置 - ${this.courseData.name}`;
        document.getElementById('courseMeta').textContent = `${this.courseData.name} | ${this.courseData.userProfile}`;
    }
    
    async loadTrainingContents() {
        // 模拟训练内容数据
        this.trainingContents = [
            {
                id: 1,
                trainingType: "促血流",
                courseName: "盆底肌血液循环促进训练",
                category: "电刺激",
                duration: 15,
                indications: "盆底肌血液循环不良",
                overview: "通过低频电刺激促进盆底肌血液循环",
                details: "频率: 2-10Hz, 脉宽: 200-300μs"
            },
            {
                id: 2,
                trainingType: "I型肌",
                courseName: "I型肌耐力训练",
                category: "电刺激",
                duration: 20,
                indications: "I型肌纤维功能不足",
                overview: "针对I型肌纤维的耐力训练",
                details: "频率: 20Hz, 脉宽: 250μs"
            },
            {
                id: 3,
                trainingType: "II型肌",
                courseName: "II型肌力量训练",
                category: "电刺激",
                duration: 18,
                indications: "II型肌纤维力量不足",
                overview: "针对II型肌纤维的力量训练",
                details: "频率: 50Hz, 脉宽: 300μs"
            },
            {
                id: 4,
                trainingType: "混合肌",
                courseName: "混合肌协调训练",
                category: "电刺激",
                duration: 25,
                indications: "肌肉协调性差",
                overview: "I型和II型肌纤维协调训练",
                details: "交替频率: 20Hz/50Hz"
            },
            {
                id: 5,
                trainingType: "盆底肌协调性",
                courseName: "盆底肌协调性训练",
                category: "凯格尔训练",
                duration: 12,
                indications: "盆底肌协调性障碍",
                overview: "通过生物反馈进行协调性训练",
                details: "收缩5秒，放松10秒"
            },
            {
                id: 6,
                trainingType: "肌肉放松",
                courseName: "盆底肌放松训练",
                category: "音乐放松",
                duration: 10,
                indications: "肌肉紧张",
                overview: "通过音乐引导进行肌肉放松",
                details: "深呼吸配合音乐节拍"
            },
            {
                id: 7,
                trainingType: "游戏",
                courseName: "互动游戏训练",
                category: "游戏互动",
                duration: 8,
                indications: "提高训练兴趣",
                overview: "通过游戏化训练提高参与度",
                details: "收缩控制游戏角色移动"
            }
        ];
    }
    
    initializeEvents() {
        // 训练内容筛选事件
        document.getElementById('trainingTypeFilter').addEventListener('change', () => {
            this.filterTrainingContents();
        });
        
        document.getElementById('categoryFilter').addEventListener('change', () => {
            this.filterTrainingContents();
        });
        
        document.getElementById('durationFilter').addEventListener('change', () => {
            this.filterTrainingContents();
        });
    }
    
    renderSessions() {
        const sessionsList = document.getElementById('sessionsList');
        sessionsList.innerHTML = '';
        
        this.sessions.forEach((session, index) => {
            const sessionElement = document.createElement('div');
            sessionElement.className = 'session-item';
            sessionElement.onclick = () => this.selectSession(index);
            
            const configuredCount = session.trainingContents.length;
            const totalDuration = session.trainingContents.reduce((sum, content) => {
                const trainingContent = this.trainingContents.find(tc => tc.id === content.id);
                return sum + (trainingContent ? trainingContent.duration : 0);
            }, 0);
            
            sessionElement.innerHTML = `
                <div class="session-header">
                    <span class="session-title">${session.name}</span>
                    <span class="session-status ${configuredCount > 0 ? 'configured' : 'empty'}">
                        ${configuredCount > 0 ? '已配置' : '未配置'}
                    </span>
                </div>
                <div class="session-meta">
                    <span class="session-training-count">${configuredCount}个训练内容</span> | 
                    <span>${totalDuration}分钟</span>
                </div>
            `;
            
            sessionsList.appendChild(sessionElement);
        });
    }
    
    selectSession(index) {
        // 移除之前的选中状态
        document.querySelectorAll('.session-item').forEach(item => {
            item.classList.remove('active');
        });
        
        // 添加当前选中状态
        document.querySelectorAll('.session-item')[index].classList.add('active');
        
        this.currentSessionIndex = index;
        this.renderSessionConfig();
        
        // 启用操作按钮
        document.getElementById('duplicateBtn').disabled = false;
        document.getElementById('deleteBtn').disabled = this.sessions.length <= 1;
    }
    
    renderSessionConfig() {
        if (this.currentSessionIndex === -1) return;
        
        const session = this.sessions[this.currentSessionIndex];
        const configContent = document.getElementById('configContent');
        
        configContent.innerHTML = `
            <div class="session-config-form">
                <div class="form-section">
                    <h4>基本信息</h4>
                    <div class="form-row">
                        <div class="form-group">
                            <label>课节名称</label>
                            <input type="text" value="${session.name}" onchange="sessionConfigManager.updateSessionName(${this.currentSessionIndex}, this.value)">
                        </div>
                        <div class="form-group">
                            <label>课节时长</label>
                            <input type="text" value="${this.getSessionDuration(session)}分钟" readonly>
                        </div>
                    </div>
                    <div class="form-group">
                        <label>课节描述</label>
                        <textarea rows="3" placeholder="请输入课节描述..." onchange="sessionConfigManager.updateSessionDescription(${this.currentSessionIndex}, this.value)">${session.description}</textarea>
                    </div>
                </div>
                
                <div class="form-section">
                    <h4>训练内容</h4>
                    <div class="training-contents">
                        <div class="training-contents-header">
                            <h5>已选择的训练内容 (${session.trainingContents.length})</h5>
                            <button class="add-training-btn" onclick="sessionConfigManager.showTrainingContentModal()">
                                <i class="fas fa-plus"></i>
                                添加训练内容
                            </button>
                        </div>
                        <div class="training-contents-list">
                            ${this.renderSessionTrainingContents(session)}
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
    
    renderSessionTrainingContents(session) {
        if (session.trainingContents.length === 0) {
            return '<div class="empty-training-list">暂无训练内容，点击上方按钮添加</div>';
        }
        
        return session.trainingContents.map((content, index) => {
            const trainingContent = this.trainingContents.find(tc => tc.id === content.id);
            if (!trainingContent) return '';
            
            return `
                <div class="training-content-item">
                    <div class="training-content-info">
                        <div class="training-content-name">${trainingContent.courseName}</div>
                        <div class="training-content-meta">
                            ${trainingContent.trainingType} | ${trainingContent.category} | ${trainingContent.duration}分钟
                        </div>
                    </div>
                    <div class="training-content-actions">
                        <button class="remove-training-btn" onclick="sessionConfigManager.removeTrainingContent(${this.currentSessionIndex}, ${index})">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                </div>
            `;
        }).join('');
    }
    
    getSessionDuration(session) {
        return session.trainingContents.reduce((sum, content) => {
            const trainingContent = this.trainingContents.find(tc => tc.id === content.id);
            return sum + (trainingContent ? trainingContent.duration : 0);
        }, 0);
    }
    
    updateSessionName(index, name) {
        this.sessions[index].name = name;
        this.renderSessions();
        this.updateSummary();
    }
    
    updateSessionDescription(index, description) {
        this.sessions[index].description = description;
    }
    
    showTrainingContentModal() {
        this.selectedTrainingContents = [];
        this.renderTrainingContentModal();
        document.getElementById('trainingContentModal').classList.add('show');
    }
    
    closeTrainingContentModal() {
        document.getElementById('trainingContentModal').classList.remove('show');
    }
    
    renderTrainingContentModal() {
        const tableBody = document.getElementById('trainingContentTableBody');
        const filteredContents = this.getFilteredTrainingContents();
        
        tableBody.innerHTML = filteredContents.map(content => `
            <tr>
                <td>
                    <input type="checkbox" value="${content.id}" onchange="sessionConfigManager.toggleTrainingContentSelection(${content.id}, this.checked)">
                </td>
                <td>${content.trainingType}</td>
                <td>${content.courseName}</td>
                <td>${content.category}</td>
                <td>${content.duration}分钟</td>
                <td>${content.indications}</td>
                <td title="${content.overview}">${content.overview.substring(0, 30)}...</td>
            </tr>
        `).join('');
    }
    
    getFilteredTrainingContents() {
        const typeFilter = document.getElementById('trainingTypeFilter').value;
        const categoryFilter = document.getElementById('categoryFilter').value;
        const durationFilter = document.getElementById('durationFilter').value;
        
        return this.trainingContents.filter(content => {
            if (typeFilter && content.trainingType !== typeFilter) return false;
            if (categoryFilter && content.category !== categoryFilter) return false;
            if (durationFilter) {
                if (durationFilter === 'short' && content.duration > 10) return false;
                if (durationFilter === 'medium' && (content.duration <= 10 || content.duration > 20)) return false;
                if (durationFilter === 'long' && content.duration <= 20) return false;
            }
            return true;
        });
    }
    
    filterTrainingContents() {
        this.renderTrainingContentModal();
    }
    
    toggleTrainingContentSelection(contentId, checked) {
        if (checked) {
            if (!this.selectedTrainingContents.includes(contentId)) {
                this.selectedTrainingContents.push(contentId);
            }
        } else {
            this.selectedTrainingContents = this.selectedTrainingContents.filter(id => id !== contentId);
        }
    }
    
    confirmTrainingContentSelection() {
        if (this.currentSessionIndex === -1) return;
        
        const session = this.sessions[this.currentSessionIndex];
        
        // 添加选中的训练内容（避免重复）
        this.selectedTrainingContents.forEach(contentId => {
            if (!session.trainingContents.find(tc => tc.id === contentId)) {
                session.trainingContents.push({ id: contentId });
            }
        });
        
        this.closeTrainingContentModal();
        this.renderSessionConfig();
        this.renderSessions();
        this.updateSummary();
    }
    
    removeTrainingContent(sessionIndex, contentIndex) {
        this.sessions[sessionIndex].trainingContents.splice(contentIndex, 1);
        this.renderSessionConfig();
        this.renderSessions();
        this.updateSummary();
    }
    
    addNewSession() {
        const newSession = {
            id: `session_${this.sessions.length + 1}`,
            name: `第${this.sessions.length + 1}节课`,
            description: "",
            duration: 0,
            trainingContents: [],
            order: this.sessions.length + 1
        };
        
        this.sessions.push(newSession);
        this.renderSessions();
        this.updateSummary();
    }
    
    duplicateSession() {
        if (this.currentSessionIndex === -1) return;
        
        const originalSession = this.sessions[this.currentSessionIndex];
        const duplicatedSession = {
            ...originalSession,
            id: `session_${this.sessions.length + 1}`,
            name: `${originalSession.name} (副本)`,
            order: this.sessions.length + 1,
            trainingContents: [...originalSession.trainingContents]
        };
        
        this.sessions.push(duplicatedSession);
        this.renderSessions();
        this.updateSummary();
    }
    
    deleteSession() {
        if (this.currentSessionIndex === -1 || this.sessions.length <= 1) return;
        
        if (confirm('确定要删除这个课节吗？')) {
            this.sessions.splice(this.currentSessionIndex, 1);
            
            // 重新编号
            this.sessions.forEach((session, index) => {
                session.order = index + 1;
                if (!session.name.includes('副本')) {
                    session.name = `第${index + 1}节课`;
                }
            });
            
            this.currentSessionIndex = -1;
            document.getElementById('configContent').innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-hand-pointer"></i>
                    <p>请选择左侧课节进行配置</p>
                </div>
            `;
            
            document.getElementById('duplicateBtn').disabled = true;
            document.getElementById('deleteBtn').disabled = true;
            
            this.renderSessions();
            this.updateSummary();
        }
    }
    
    updateSummary() {
        const totalSessions = this.sessions.length;
        const configuredSessions = this.sessions.filter(s => s.trainingContents.length > 0).length;
        const totalDuration = this.sessions.reduce((sum, session) => sum + this.getSessionDuration(session), 0);
        
        // 统计训练类型
        const trainingTypes = new Set();
        this.sessions.forEach(session => {
            session.trainingContents.forEach(content => {
                const trainingContent = this.trainingContents.find(tc => tc.id === content.id);
                if (trainingContent) {
                    trainingTypes.add(trainingContent.trainingType);
                }
            });
        });
        
        document.getElementById('totalSessions').textContent = totalSessions;
        document.getElementById('totalDuration').textContent = totalDuration;
        document.getElementById('totalTrainingTypes').textContent = trainingTypes.size;
        document.getElementById('configuredSessions').textContent = configuredSessions;
        
        // 更新训练类型分布图
        this.updateTrainingTypesChart(trainingTypes);
        
        // 更新时长分布图
        this.updateDurationChart();
    }
    
    updateTrainingTypesChart(trainingTypes) {
        const chartContainer = document.getElementById('trainingTypesChart');
        
        if (trainingTypes.size === 0) {
            chartContainer.innerHTML = '<p>暂无训练类型数据</p>';
            return;
        }
        
        const typeCount = {};
        this.sessions.forEach(session => {
            session.trainingContents.forEach(content => {
                const trainingContent = this.trainingContents.find(tc => tc.id === content.id);
                if (trainingContent) {
                    typeCount[trainingContent.trainingType] = (typeCount[trainingContent.trainingType] || 0) + 1;
                }
            });
        });
        
        chartContainer.innerHTML = Object.entries(typeCount)
            .map(([type, count]) => `
                <div style="margin-bottom: 8px; display: flex; justify-content: space-between;">
                    <span>${type}</span>
                    <span style="font-weight: 600; color: #007bff;">${count}次</span>
                </div>
            `).join('');
    }
    
    updateDurationChart() {
        const chartContainer = document.getElementById('durationChart');
        
        const durationRanges = {
            '短时间(≤10分钟)': 0,
            '中等时间(11-20分钟)': 0,
            '长时间(>20分钟)': 0
        };
        
        this.sessions.forEach(session => {
            const duration = this.getSessionDuration(session);
            if (duration <= 10) {
                durationRanges['短时间(≤10分钟)']++;
            } else if (duration <= 20) {
                durationRanges['中等时间(11-20分钟)']++;
            } else {
                durationRanges['长时间(>20分钟)']++;
            }
        });
        
        chartContainer.innerHTML = Object.entries(durationRanges)
            .map(([range, count]) => `
                <div style="margin-bottom: 8px; display: flex; justify-content: space-between;">
                    <span>${range}</span>
                    <span style="font-weight: 600; color: #007bff;">${count}节</span>
                </div>
            `).join('');
    }
    
    async saveCourseConfig() {
        try {
            // 模拟保存到服务器
            const configData = {
                courseId: this.courseId,
                sessions: this.sessions
            };
            
            console.log('保存课程配置:', configData);
            
            // 显示成功消息
            alert('课程配置保存成功！');
            
        } catch (error) {
            console.error('保存失败:', error);
            alert('保存失败，请重试！');
        }
    }
    
    previewCourse() {
        // 生成课程预览
        const previewData = {
            course: this.courseData,
            sessions: this.sessions.map(session => ({
                ...session,
                duration: this.getSessionDuration(session),
                trainingDetails: session.trainingContents.map(content => {
                    return this.trainingContents.find(tc => tc.id === content.id);
                }).filter(Boolean)
            }))
        };
        
        console.log('课程预览数据:', previewData);
        alert('课程预览功能开发中...');
    }
}

// 全局函数
function goBack() {
    window.history.back();
}

function toggleSummary() {
    const summaryContent = document.getElementById('summaryContent');
    const toggleBtn = document.querySelector('.toggle-btn');
    
    summaryContent.classList.toggle('collapsed');
    toggleBtn.classList.toggle('collapsed');
}

// 初始化
let sessionConfigManager;
document.addEventListener('DOMContentLoaded', () => {
    sessionConfigManager = new SessionConfigManager();
});