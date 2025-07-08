// 课程内容管理JavaScript
class CourseContentManager {
    constructor() {
        this.currentPage = 1;
        this.itemsPerPage = 5;
        this.totalItems = 0;
        this.filteredData = [];
        this.allData = [];
        this.editingIndex = -1;
        
        this.initializeData();
        this.bindEvents();
        this.renderTable();
    }
    
    initializeData() {
        // 基于提供的文件内容初始化数据
        this.allData = [
            {
                trainingType: '促血流',
                courseName: '促血流',
                category: '电刺激',
                duration: '5分钟',
                indications: '血液循环不良、肌肉僵硬',
                overview: '通过电刺激促进局部血液循环，改善肌肉供血状态',
                detailDesign: '单次循环时间10s,每6s休息一次，电刺激一次4s，电压用户自主选择设置',
                version: 'v1.0.0',
                updateTime: '2024-01-15 10:30',
                updater: '张医生'
            },
            {
                trainingType: '促血流',
                courseName: '促血流',
                category: '电刺激',
                duration: '6分钟',
                indications: '血液循环不良、肌肉僵硬',
                overview: '通过电刺激促进局部血液循环，改善肌肉供血状态',
                detailDesign: '延长版促血流训练，适合需要更长时间刺激的患者',
                version: 'v1.0.1',
                updateTime: '2024-01-16 14:20',
                updater: '李医生'
            },
            {
                trainingType: 'A3反射训练',
                courseName: 'A3反射训练',
                category: '凯格尔训练',
                duration: '5分钟',
                indications: '盆底肌反射功能减退',
                overview: '通过特定动作训练A3反射，提高盆底肌反应能力',
                detailDesign: '渐进式反射训练，从简单到复杂的动作组合',
                version: 'v2.1.0',
                updateTime: '2024-01-18 09:15',
                updater: '王医生'
            },
            {
                trainingType: 'I型肌',
                courseName: 'I型肌初步训练',
                category: '凯格尔训练',
                duration: '5分钟',
                indications: 'I型肌纤维功能不足',
                overview: '针对I型肌纤维的基础训练，提高持久收缩能力',
                detailDesign: '低强度持续收缩训练，重点培养肌肉耐力',
                version: 'v1.5.0',
                updateTime: '2024-01-20 16:45',
                updater: '赵医生'
            },
            {
                trainingType: 'II型肌',
                courseName: 'II型肌初步训练',
                category: '凯格尔训练',
                duration: '5分钟',
                indications: 'II型肌纤维功能不足',
                overview: '针对II型肌纤维的基础训练，提高快速收缩能力',
                detailDesign: '高强度间歇性收缩训练，重点培养肌肉爆发力',
                version: 'v1.3.0',
                updateTime: '2024-01-22 11:30',
                updater: '陈医生'
            },
            {
                trainingType: 'I类肌',
                courseName: 'I类肌中强度I',
                category: '电刺激',
                duration: '5分钟',
                indications: '盆底肌力不足、尿失禁',
                overview: '中等强度电刺激训练，适合有一定基础的患者',
                detailDesign: '渐进式电刺激强度调节，配合呼吸节律',
                version: 'v2.0.0',
                updateTime: '2024-01-25 13:20',
                updater: '孙医生'
            },
            {
                trainingType: '混合电刺激',
                courseName: '混合电刺激',
                category: '电刺激',
                duration: '10分钟',
                indications: '复合性盆底功能障碍',
                overview: '多种电刺激模式组合，全面改善盆底功能',
                detailDesign: '结合低频和高频电刺激，分阶段进行综合治疗',
                version: 'v1.8.0',
                updateTime: '2024-01-28 15:10',
                updater: '周医生'
            },
            {
                trainingType: '镇痛',
                courseName: '低频镇痛',
                category: '电刺激',
                duration: '5分钟',
                indications: '盆底疼痛、慢性疼痛',
                overview: '低频电刺激镇痛，缓解局部疼痛症状',
                detailDesign: '特定频率的电刺激，激活内源性镇痛机制',
                version: 'v1.2.0',
                updateTime: '2024-02-01 10:45',
                updater: '吴医生'
            },
            {
                trainingType: '音乐放松',
                courseName: '音乐放松01',
                category: '音乐放松',
                duration: '5分钟',
                indications: '焦虑、紧张、压力大',
                overview: '通过舒缓音乐帮助患者放松身心，减轻治疗压力',
                detailDesign: '精选舒缓音乐，配合呼吸引导，营造放松氛围',
                version: 'v1.0.0',
                updateTime: '2024-02-05 14:30',
                updater: '刘医生'
            },
            {
                trainingType: '游戏',
                courseName: '饥饿鲨鱼',
                category: '游戏互动',
                duration: '10分钟',
                indications: '训练依从性差、儿童患者',
                overview: '通过游戏化训练提高患者参与度和治疗效果',
                detailDesign: '结合盆底肌收缩控制游戏角色，寓教于乐',
                version: 'v2.5.0',
                updateTime: '2024-02-08 16:20',
                updater: '马医生'
            },
            {
                trainingType: '触发电刺激',
                courseName: '触发电刺激训练',
                category: '触发电刺激',
                duration: '8分钟',
                indications: '肌肉反应迟钝、神经传导障碍',
                overview: '通过触发式电刺激增强肌肉反应能力和神经传导',
                detailDesign: '基于生物反馈的触发式电刺激，根据肌肉收缩强度自动调节刺激参数',
                version: 'v1.2.0',
                updateTime: '2024-02-10 11:15',
                updater: '陈医生'
            },
            {
                trainingType: '凯格尔训练',
                courseName: '基础凯格尔训练',
                category: '凯格尔训练',
                duration: '12分钟',
                indications: '盆底肌力不足、产后康复',
                overview: '系统性凯格尔训练，逐步提高盆底肌力和控制能力',
                detailDesign: '分阶段训练：热身-基础收缩-强化训练-放松恢复',
                version: 'v2.0.0',
                updateTime: '2024-02-12 14:30',
                updater: '李医生'
            },
            {
                trainingType: '音乐放松',
                courseName: '深度放松音乐疗法',
                category: '音乐放松',
                duration: '15分钟',
                indications: '焦虑、紧张、失眠、压力过大',
                overview: '结合专业音乐治疗和呼吸引导，达到深度放松效果',
                detailDesign: '三阶段音乐疗法：舒缓导入-深度放松-恢复清醒',
                version: 'v1.5.0',
                updateTime: '2024-02-14 16:45',
                updater: '王医生'
            },
            {
                trainingType: '游戏互动',
                courseName: '平衡球游戏',
                category: '游戏互动',
                duration: '8分钟',
                indications: '协调性训练、儿童康复',
                overview: '通过平衡控制游戏提高盆底肌协调性和控制精度',
                detailDesign: '实时反馈的平衡控制游戏，难度自适应调节',
                version: 'v1.8.0',
                updateTime: '2024-02-16 10:20',
                updater: '赵医生'
            }
        ];
        
        this.filteredData = [...this.allData];
        this.totalItems = this.allData.length;
    }
    
    bindEvents() {
        // 搜索功能
        document.getElementById('searchInput').addEventListener('input', (e) => {
            this.handleSearch(e.target.value);
        });
        
        // 筛选功能
        document.getElementById('training-type-filter').addEventListener('change', () => {
            this.handleFilter();
        });
        
        document.getElementById('category-filter').addEventListener('change', () => {
            this.handleFilter();
        });
        
        document.getElementById('duration-filter').addEventListener('change', () => {
            this.handleFilter();
        });
    }
    
    handleSearch(searchTerm) {
        if (!searchTerm.trim()) {
            this.filteredData = [...this.allData];
        } else {
            this.filteredData = this.allData.filter(item => 
                item.trainingType.toLowerCase().includes(searchTerm.toLowerCase()) ||
                item.courseName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                item.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
                item.indications.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }
        
        this.totalItems = this.filteredData.length;
        this.currentPage = 1;
        this.renderTable();
    }
    
    handleFilter() {
        const typeFilter = document.getElementById('training-type-filter').value;
        const categoryFilter = document.getElementById('category-filter').value;
        const durationFilter = document.getElementById('duration-filter').value;
        
        this.filteredData = this.allData.filter(item => {
            let matches = true;
            
            if (typeFilter !== 'all') {
                matches = matches && item.trainingType === typeFilter;
            }
            
            if (categoryFilter !== 'all') {
                matches = matches && item.category === categoryFilter;
            }
            
            if (durationFilter !== 'all') {
                const duration = parseInt(item.duration);
                switch (durationFilter) {
                    case 'short':
                        matches = matches && duration <= 10;
                        break;
                    case 'medium':
                        matches = matches && duration > 10 && duration <= 20;
                        break;
                    case 'long':
                        matches = matches && duration > 20;
                        break;
                }
            }
            
            return matches;
        });
        
        this.totalItems = this.filteredData.length;
        this.currentPage = 1;
        this.renderTable();
    }
    
    renderTable() {
        const tbody = document.getElementById('courseTableBody');
        const startIndex = (this.currentPage - 1) * this.itemsPerPage;
        const endIndex = startIndex + this.itemsPerPage;
        const pageData = this.filteredData.slice(startIndex, endIndex);
        
        tbody.innerHTML = pageData.map((item, index) => `
            <tr>
                <td>
                    <span class="training-type-badge ${this.getTrainingTypeBadgeClass(item.trainingType)}">
                        ${item.trainingType}
                    </span>
                </td>
                <td title="${item.courseName}">${this.truncateText(item.courseName, 15)}</td>
                <td>
                    <span class="category-badge ${this.getCategoryBadgeClass(item.category)}">
                        ${item.category}
                    </span>
                </td>
                <td>
                    <span class="duration-badge">${item.duration}</span>
                </td>
                <td title="${item.indications}">${this.truncateText(item.indications, 20)}</td>
                <td title="${item.overview}">${this.truncateText(item.overview, 30)}</td>
                <td>
                    <span class="version-badge">${item.version}</span>
                </td>
                <td>${item.updateTime}</td>
                <td>${item.updater}</td>
                <td>
                    <div style="display: flex; gap: 0.25rem;">
                        <button class="course-action-btn view-btn" onclick="courseManager.viewCourse(${startIndex + index})" title="查看详情">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="course-action-btn design-btn" onclick="courseManager.designCourse(${startIndex + index})" title="设计方案">
                            <i class="fas fa-cogs"></i>
                        </button>
                        <button class="course-action-btn edit-btn" onclick="courseManager.editCourse(${startIndex + index})" title="编辑课程">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="course-action-btn delete-btn" onclick="courseManager.deleteCourse(${startIndex + index})" title="删除课程">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');
        
        this.renderPagination();
    }
    
    renderPagination() {
        const totalPages = Math.ceil(this.totalItems / this.itemsPerPage);
        const pagination = document.getElementById('pagination');
        
        if (totalPages <= 1) {
            pagination.innerHTML = '';
            return;
        }
        
        let paginationHTML = '';
        
        // 上一页按钮
        paginationHTML += `
            <button class="pagination-button" ${this.currentPage === 1 ? 'disabled' : ''} 
                    onclick="courseManager.goToPage(${this.currentPage - 1})">
                <i class="fas fa-chevron-left"></i>
            </button>
        `;
        
        // 页码按钮
        for (let i = 1; i <= totalPages; i++) {
            if (i === this.currentPage) {
                paginationHTML += `<button class="pagination-button active">${i}</button>`;
            } else {
                paginationHTML += `<button class="pagination-button" onclick="courseManager.goToPage(${i})">${i}</button>`;
            }
        }
        
        // 下一页按钮
        paginationHTML += `
            <button class="pagination-button" ${this.currentPage === totalPages ? 'disabled' : ''} 
                    onclick="courseManager.goToPage(${this.currentPage + 1})">
                <i class="fas fa-chevron-right"></i>
            </button>
        `;
        
        pagination.innerHTML = paginationHTML;
    }
    
    goToPage(page) {
        const totalPages = Math.ceil(this.totalItems / this.itemsPerPage);
        if (page >= 1 && page <= totalPages) {
            this.currentPage = page;
            this.renderTable();
        }
    }
    
    getTrainingTypeBadgeClass(type) {
        const typeMap = {
            '促血流': 'type-electrical',
            'A3反射训练': 'type-kegel',
            'I型肌': 'type-kegel',
            'II型肌': 'type-kegel',
            'I类肌': 'type-electrical',
            'II类肌': 'type-electrical',
            '混合电刺激': 'type-electrical',
            '镇痛': 'type-electrical',
            '增强兴奋': 'type-electrical',
            '收缩': 'type-kegel',
            '感觉恢复': 'type-electrical',
            '混合肌': 'type-kegel',
            '盆底肌协调性': 'type-kegel',
            '牵张放松': 'type-kegel',
            '肌肉放松': 'type-kegel',
            '遗尿肌': 'type-electrical',
            '音乐放松': 'type-music',
            '游戏': 'type-game'
        };
        return typeMap[type] || 'type-electrical';
    }
    
    getCategoryBadgeClass(category) {
        const categoryMap = {
            '电刺激': 'cat-electrical',
            '触发电刺激': 'cat-trigger',
            '凯格尔训练': 'cat-kegel',
            '音乐放松': 'cat-music',
            '游戏互动': 'cat-game'
        };
        return categoryMap[category] || 'cat-electrical';
    }
    
    truncateText(text, maxLength) {
        if (text.length <= maxLength) {
            return text;
        }
        return text.substring(0, maxLength) + '...';
    }
    
    viewCourse(index) {
        const course = this.filteredData[index];
        alert(`查看课程详情：\n\n训练类型：${course.trainingType}\n课程名称：${course.courseName}\n方案分类：${course.category}\n训练时长：${course.duration}\n适应症：${course.indications}\n方案描述：${course.overview}\n版本号：${course.version}\n更新时间：${course.updateTime}\n更新人：${course.updater}`);
    }
    
    editCourse(index) {
        this.editingIndex = index;
        const course = this.filteredData[index];
        
        document.getElementById('modalTitle').textContent = '编辑课程';
        document.getElementById('trainingType').value = course.trainingType;
        document.getElementById('courseName').value = course.courseName;
        document.getElementById('category').value = course.category;
        document.getElementById('duration').value = course.duration;
        document.getElementById('indications').value = course.indications;
        document.getElementById('overview').value = course.overview;
        document.getElementById('version').value = course.version;
        document.getElementById('updater').value = course.updater;
        
        document.getElementById('courseModal').style.display = 'flex';
    }
    
    deleteCourse(index) {
        if (confirm('确定要删除这个课程吗？')) {
            const course = this.filteredData[index];
            const originalIndex = this.allData.findIndex(item => 
                item.trainingType === course.trainingType && 
                item.courseName === course.courseName &&
                item.duration === course.duration
            );
            
            if (originalIndex !== -1) {
                this.allData.splice(originalIndex, 1);
                this.handleFilter(); // 重新应用筛选
            }
        }
    }
    
    designCourse(index) {
        const course = this.filteredData[index];
        // 将课程信息作为URL参数传递到设计页面
        const params = new URLSearchParams({
            trainingType: course.trainingType,
            courseName: course.courseName,
            category: course.category,
            duration: course.duration,
            version: course.version
        });
        
        // 根据训练类型跳转到不同的配置页面
        switch (course.category) {
            case '电刺激':
                window.location.href = `electrical-stimulation-config.html?${params.toString()}`;
                break;
            case '触发电刺激':
                // 跳转到触发电刺激配置页面
                window.location.href = `trigger-electrical-stimulation-config.html?${params.toString()}`;
                break;
            case '凯格尔训练':
                window.location.href = `kegel-training-config.html?${params.toString()}`;
                break;
            case '游戏互动':
                // 暂时跳转到通用设计页面，后续添加专门的配置页面
                window.location.href = `training-plan-design.html?${params.toString()}`;
                break;
            case '音乐放松':
                // 暂时跳转到通用设计页面，后续添加专门的配置页面
                window.location.href = `training-plan-design.html?${params.toString()}`;
                break;
            default:
                window.location.href = `training-plan-design.html?${params.toString()}`;
        }
    }


}

// 模态框相关函数
function showAddCourseModal() {
    courseManager.editingIndex = -1;
    document.getElementById('modalTitle').textContent = '添加课程';
    document.getElementById('courseForm').reset();
    document.getElementById('courseModal').style.display = 'flex';
}

function closeCourseModal() {
    document.getElementById('courseModal').style.display = 'none';
}

function saveCourse() {
    const form = document.getElementById('courseForm');
    if (!form.checkValidity()) {
        form.reportValidity();
        return;
    }
    
    const courseData = {
        trainingType: document.getElementById('trainingType').value,
        courseName: document.getElementById('courseName').value,
        category: document.getElementById('category').value,
        duration: document.getElementById('duration').value,
        indications: document.getElementById('indications').value,
        overview: document.getElementById('overview').value,
        version: document.getElementById('version').value,
        updateTime: new Date().toLocaleString('zh-CN'),
        updater: document.getElementById('updater').value
    };
    
    if (courseManager.editingIndex === -1) {
        // 添加新课程
        courseManager.allData.push(courseData);
    } else {
        // 编辑现有课程
        const course = courseManager.filteredData[courseManager.editingIndex];
        const originalIndex = courseManager.allData.findIndex(item => 
            item.trainingType === course.trainingType && 
            item.courseName === course.courseName &&
            item.duration === course.duration
        );
        
        if (originalIndex !== -1) {
            courseManager.allData[originalIndex] = courseData;
        }
    }
    
    courseManager.handleFilter(); // 重新应用筛选
    closeCourseModal();
}

// 初始化
let courseManager;
document.addEventListener('DOMContentLoaded', function() {
    courseManager = new CourseContentManager();
});
