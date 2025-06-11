class CourseModelManager {
    constructor() {
        this.courses = [
            {
                id: 1,
                name: '盆底肌基础训练课程',
                userProfile: '初学者',
                sessionCount: 8,
                overview: '针对盆底肌功能障碍初学者设计的基础训练课程，包含基本的收缩和放松练习。',
                status: 'active',
                indications: '轻度尿失禁、盆底肌力不足',
                tags: ['基础训练', '盆底肌', '初学者'],
                updateTime: '2024-01-15 10:30',
                sessions: [
                    { id: 1, name: '课节1：认识盆底肌', duration: 10, type: '理论学习' },
                    { id: 2, name: '课节2：基础收缩练习', duration: 15, type: '实践训练' }
                ]
            },
            {
                id: 2,
                name: '进阶强化训练课程',
                userProfile: '进阶者',
                sessionCount: 12,
                overview: '适合有一定基础的用户，通过渐进式训练提高盆底肌力量和耐力。',
                status: 'active',
                indications: '中度盆底功能障碍、产后康复',
                tags: ['进阶训练', '强化', '产后康复'],
                updateTime: '2024-01-14 16:45',
                sessions: [
                    { id: 1, name: '课节1：力量评估', duration: 12, type: '评估测试' },
                    { id: 2, name: '课节2：渐进式训练', duration: 20, type: '实践训练' }
                ]
            },
            {
                id: 3,
                name: '专业康复训练课程',
                userProfile: '专业用户',
                sessionCount: 16,
                overview: '专业级康复训练课程，结合多种训练模式和个性化参数调整。',
                status: 'draft',
                indications: '重度盆底功能障碍、术后康复',
                tags: ['专业训练', '康复', '个性化'],
                updateTime: '2024-01-13 09:20',
                sessions: []
            }
        ];
        
        this.currentPage = 1;
        this.itemsPerPage = 5;
        this.currentView = 'table';
        this.editingCourse = null;
        this.currentTags = [];
        this.selectedSession = null;
        
        this.initializeEvents();
        this.renderCourseList();
        this.updateStats();
    }
    
    initializeEvents() {
        // 搜索功能
        document.getElementById('searchInput').addEventListener('input', () => {
            this.currentPage = 1;
            this.renderCourseList();
        });
        
        // 筛选功能
        document.getElementById('userTypeFilter').addEventListener('change', () => {
            this.currentPage = 1;
            this.renderCourseList();
        });
        
        document.getElementById('statusFilter').addEventListener('change', () => {
            this.currentPage = 1;
            this.renderCourseList();
        });
        
        // 视图切换
        document.querySelectorAll('.view-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.view-btn').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                this.currentView = e.target.dataset.view;
                this.renderCourseList();
            });
        });
        
        // 标签输入
        document.getElementById('tagInput').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                this.addTag();
            }
        });
    }
    
    getFilteredCourses() {
        const searchTerm = document.getElementById('searchInput').value.toLowerCase();
        const userTypeFilter = document.getElementById('userTypeFilter').value;
        const statusFilter = document.getElementById('statusFilter').value;
        
        return this.courses.filter(course => {
            const matchesSearch = !searchTerm || 
                course.name.toLowerCase().includes(searchTerm) ||
                course.overview.toLowerCase().includes(searchTerm) ||
                course.indications.toLowerCase().includes(searchTerm);
            
            const matchesUserType = !userTypeFilter || course.userProfile === userTypeFilter;
            const matchesStatus = !statusFilter || course.status === statusFilter;
            
            return matchesSearch && matchesUserType && matchesStatus;
        });
    }
    
    renderCourseList() {
        const filteredCourses = this.getFilteredCourses();
        const startIndex = (this.currentPage - 1) * this.itemsPerPage;
        const endIndex = startIndex + this.itemsPerPage;
        const paginatedCourses = filteredCourses.slice(startIndex, endIndex);
        
        if (this.currentView === 'table') {
            this.renderTableView(paginatedCourses);
            document.getElementById('tableView').classList.remove('hidden');
            document.getElementById('gridView').classList.add('hidden');
        } else {
            this.renderGridView(paginatedCourses);
            document.getElementById('tableView').classList.add('hidden');
            document.getElementById('gridView').classList.remove('hidden');
        }
        
        this.renderPagination(filteredCourses.length);
    }
    
    renderTableView(courses) {
        const tbody = document.getElementById('courseTableBody');
        tbody.innerHTML = courses.map(course => `
            <tr>
                <td>
                    <div class="font-medium text-gray-900">${course.name}</div>
                    <div class="text-sm text-gray-500">${course.tags.map(tag => `<span class="tag-item">${tag}</span>`).join(' ')}</div>
                </td>
                <td>
                    <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        ${course.userProfile}
                    </span>
                </td>
                <td>
                    <span class="font-medium">${course.sessionCount}</span> 课节
                </td>
                <td>
                    <div class="text-sm text-gray-900 text-truncate-2" style="max-width: 200px;">
                        ${course.overview}
                    </div>
                </td>
                <td>
                    <span class="status-badge status-${course.status}">
                        ${this.getStatusText(course.status)}
                    </span>
                </td>
                <td class="text-sm text-gray-500">
                    ${course.updateTime}
                </td>
                <td>
                    <div class="action-buttons">
                        <button class="btn config-btn" onclick="courseManager.configSessions(${course.id})">
                            <i class="fas fa-cog"></i>
                            配置课节
                        </button>
                        <button class="btn edit-btn" onclick="courseManager.editCourse(${course.id})">
                            <i class="fas fa-edit"></i>
                            编辑
                        </button>
                        <button class="btn delete-btn" onclick="courseManager.deleteCourse(${course.id})">
                            <i class="fas fa-trash"></i>
                            删除
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');
    }
    
    renderGridView(courses) {
        const container = document.getElementById('courseGridContainer');
        container.innerHTML = courses.map(course => `
            <div class="course-card">
                <div class="course-card-header">
                    <div>
                        <h3 class="course-card-title">${course.name}</h3>
                        <span class="status-badge status-${course.status}">
                            ${this.getStatusText(course.status)}
                        </span>
                    </div>
                </div>
                <div class="course-card-meta">
                    <span><i class="fas fa-user"></i> ${course.userProfile}</span>
                    <span><i class="fas fa-list"></i> ${course.sessionCount} 课节</span>
                </div>
                <div class="course-card-overview">
                    ${course.overview}
                </div>
                <div class="course-card-footer">
                    <div class="text-sm text-gray-500">
                        ${course.updateTime}
                    </div>
                    <div class="action-buttons">
                        <button class="btn config-btn" onclick="courseManager.configSessions(${course.id})">
                            <i class="fas fa-cog"></i>
                        </button>
                        <button class="btn edit-btn" onclick="courseManager.editCourse(${course.id})">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn delete-btn" onclick="courseManager.deleteCourse(${course.id})">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            </div>
        `).join('');
    }
    
    renderPagination(totalItems) {
        const totalPages = Math.ceil(totalItems / this.itemsPerPage);
        const startItem = (this.currentPage - 1) * this.itemsPerPage + 1;
        const endItem = Math.min(this.currentPage * this.itemsPerPage, totalItems);
        
        document.getElementById('currentStart').textContent = totalItems > 0 ? startItem : 0;
        document.getElementById('currentEnd').textContent = endItem;
        document.getElementById('totalItems').textContent = totalItems;
        
        const paginationControls = document.getElementById('paginationControls');
        let paginationHTML = '';
        
        // 上一页按钮
        paginationHTML += `
            <button class="page-btn" ${this.currentPage === 1 ? 'disabled' : ''} 
                    onclick="courseManager.goToPage(${this.currentPage - 1})">
                <i class="fas fa-chevron-left"></i>
            </button>
        `;
        
        // 页码按钮
        for (let i = 1; i <= totalPages; i++) {
            if (i === 1 || i === totalPages || (i >= this.currentPage - 2 && i <= this.currentPage + 2)) {
                paginationHTML += `
                    <button class="page-btn ${i === this.currentPage ? 'active' : ''}" 
                            onclick="courseManager.goToPage(${i})">
                        ${i}
                    </button>
                `;
            } else if (i === this.currentPage - 3 || i === this.currentPage + 3) {
                paginationHTML += '<span class="page-btn">...</span>';
            }
        }
        
        // 下一页按钮
        paginationHTML += `
            <button class="page-btn" ${this.currentPage === totalPages ? 'disabled' : ''} 
                    onclick="courseManager.goToPage(${this.currentPage + 1})">
                <i class="fas fa-chevron-right"></i>
            </button>
        `;
        
        paginationControls.innerHTML = paginationHTML;
    }
    
    goToPage(page) {
        const totalPages = Math.ceil(this.getFilteredCourses().length / this.itemsPerPage);
        if (page >= 1 && page <= totalPages) {
            this.currentPage = page;
            this.renderCourseList();
        }
    }
    
    updateStats() {
        const totalCourses = this.courses.length;
        const activeCourses = this.courses.filter(c => c.status === 'active').length;
        const draftCourses = this.courses.filter(c => c.status === 'draft').length;
        
        document.getElementById('totalCourses').textContent = totalCourses;
        document.getElementById('activeCourses').textContent = activeCourses;
        document.getElementById('draftCourses').textContent = draftCourses;
    }
    
    getStatusText(status) {
        const statusMap = {
            'active': '已启用',
            'inactive': '已禁用',
            'draft': '草稿'
        };
        return statusMap[status] || status;
    }
    
    // 课程管理方法
    editCourse(courseId) {
        this.editingCourse = this.courses.find(c => c.id === courseId);
        if (this.editingCourse) {
            document.getElementById('modalTitle').textContent = '编辑课程';
            document.getElementById('courseName').value = this.editingCourse.name;
            document.getElementById('userProfile').value = this.editingCourse.userProfile;
            document.getElementById('sessionCount').value = this.editingCourse.sessionCount;
            document.getElementById('courseStatus').value = this.editingCourse.status;
            document.getElementById('courseOverview').value = this.editingCourse.overview;
            document.getElementById('indications').value = this.editingCourse.indications;
            
            this.currentTags = [...this.editingCourse.tags];
            this.renderTags();
            
            document.getElementById('courseModal').style.display = 'flex';
        }
    }
    
    deleteCourse(courseId) {
        if (confirm('确定要删除这个课程吗？此操作不可恢复。')) {
            this.courses = this.courses.filter(c => c.id !== courseId);
            this.renderCourseList();
            this.updateStats();
        }
    }
    
    // 在 CourseModelManager 类中添加方法
    configSessions(courseId) {
    // 跳转到课节配置页面
    window.location.href = `session-config.html?courseId=${courseId}`;
    }
    
    
    
    renderSessionList(sessions) {
        const container = document.getElementById('sessionItems');
        container.innerHTML = sessions.map(session => `
            <div class="session-item" onclick="courseManager.selectSession(${session.id})">
                <div class="session-item-title">${session.name}</div>
                <div class="session-item-meta">${session.duration}分钟 · ${session.type}</div>
            </div>
        `).join('');
    }
    
    selectSession(sessionId) {
        // 移除之前的选中状态
        document.querySelectorAll('.session-item').forEach(item => {
            item.classList.remove('active');
        });
        
        // 添加当前选中状态
        event.target.closest('.session-item').classList.add('active');
        
        // 显示课节详情
        const detailContent = document.getElementById('sessionDetailContent');
        detailContent.innerHTML = `
            <div class="form-group">
                <label>课节名称</label>
                <input type="text" value="课节${sessionId}：示例课节" class="form-control">
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label>课节时长（分钟）</label>
                    <input type="number" value="15" class="form-control">
                </div>
                <div class="form-group">
                    <label>课节类型</label>
                    <select class="form-control">
                        <option value="理论学习">理论学习</option>
                        <option value="实践训练" selected>实践训练</option>
                        <option value="评估测试">评估测试</option>
                    </select>
                </div>
            </div>
            <div class="form-group">
                <label>课节描述</label>
                <textarea rows="3" class="form-control">这是一个示例课节的描述内容...</textarea>
            </div>
            <div class="form-group">
                <label>训练参数</label>
                <div class="form-row">
                    <div class="form-group">
                        <label>频率 (Hz)</label>
                        <input type="number" value="50" class="form-control">
                    </div>
                    <div class="form-group">
                        <label>强度 (mA)</label>
                        <input type="number" value="20" class="form-control">
                    </div>
                </div>
            </div>
        `;
    }
    
    addTag() {
        const tagInput = document.getElementById('tagInput');
        const tagValue = tagInput.value.trim();
        
        if (tagValue && !this.currentTags.includes(tagValue)) {
            this.currentTags.push(tagValue);
            this.renderTags();
            tagInput.value = '';
        }
    }
    
    removeTag(index) {
        this.currentTags.splice(index, 1);
        this.renderTags();
    }
    
    renderTags() {
        const container = document.getElementById('tagsDisplay');
        container.innerHTML = this.currentTags.map((tag, index) => `
            <span class="tag-item">
                ${tag}
                <button type="button" class="tag-remove" onclick="courseManager.removeTag(${index})">
                    <i class="fas fa-times"></i>
                </button>
            </span>
        `).join('');
    }
}

// 全局函数
function showAddCourseModal() {
    courseManager.editingCourse = null;
    document.getElementById('modalTitle').textContent = '添加课程';
    document.getElementById('courseForm').reset();
    courseManager.currentTags = [];
    courseManager.renderTags();
    document.getElementById('courseModal').style.display = 'flex';
}

function closeCourseModal() {
    document.getElementById('courseModal').style.display = 'none';
}

function saveCourse() {
    const formData = {
        name: document.getElementById('courseName').value,
        userProfile: document.getElementById('userProfile').value,
        sessionCount: parseInt(document.getElementById('sessionCount').value),
        status: document.getElementById('courseStatus').value,
        overview: document.getElementById('courseOverview').value,
        indications: document.getElementById('indications').value,
        tags: [...courseManager.currentTags],
        updateTime: new Date().toLocaleString('zh-CN')
    };
    
    if (!formData.name || !formData.userProfile || !formData.sessionCount || !formData.overview) {
        alert('请填写所有必填字段');
        return;
    }
    
    if (courseManager.editingCourse) {
        // 编辑现有课程
        Object.assign(courseManager.editingCourse, formData);
    } else {
        // 添加新课程
        formData.id = Math.max(...courseManager.courses.map(c => c.id)) + 1;
        formData.sessions = [];
        courseManager.courses.push(formData);
    }
    
    courseManager.renderCourseList();
    courseManager.updateStats();
    closeCourseModal();
    
    alert('课程保存成功！');
}

function resetFilters() {
    document.getElementById('searchInput').value = '';
    document.getElementById('userTypeFilter').value = '';
    document.getElementById('statusFilter').value = '';
    courseManager.currentPage = 1;
    courseManager.renderCourseList();
}

function exportConfig() {
    const config = {
        courses: courseManager.courses,
        exportTime: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(config, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'course-config.json';
    a.click();
    URL.revokeObjectURL(url);
}

// 课节配置跳转函数
function configSessions(courseId) {
    window.location.href = `session-config.html?courseId=${courseId}`;
}

// 初始化
let courseManager;
document.addEventListener('DOMContentLoaded', function() {
    courseManager = new CourseModelManager();
});