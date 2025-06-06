// 课节内容管理JavaScript
document.addEventListener('DOMContentLoaded', function() {
    // 初始化事件监听器
    initEventListeners();
    
    // 加载课节数据
    loadCourseData();
});

// 课节数据
const courseData = [
    {
        id: 1,
        name: '盆底肌评估',
        type: 'assessment',
        duration: 15,
        level: 1,
        effect: '功能评估、基线建立',
        pelvicFreq: 20,
        pelvicIntensity: 10,
        abdominalFreq: 35,
        abdominalIntensity: 8,
        usageCount: 1256
    },
    {
        id: 2,
        name: 'II型肌初步训练',
        type: 'type2',
        duration: 20,
        level: 1,
        effect: '快肌纤维激活、爆发力提升',
        pelvicFreq: 50,
        pelvicIntensity: 15,
        abdominalFreq: 45,
        abdominalIntensity: 12,
        usageCount: 892
    },
    {
        id: 3,
        name: 'I类肌高强度训练',
        type: 'type1',
        duration: 35,
        level: 3,
        effect: '耐力增强、持续收缩能力',
        pelvicFreq: 20,
        pelvicIntensity: 25,
        abdominalFreq: 30,
        abdominalIntensity: 20,
        usageCount: 567
    }
];

function initEventListeners() {
    // 新建课节按钮
    document.getElementById('new-course-btn').addEventListener('click', function() {
        showCourseModal();
    });
    
    // 导入课节按钮
    document.getElementById('import-course-btn').addEventListener('click', function() {
        showImportModal();
    });
    
    // 导出课节按钮
    document.getElementById('export-course-btn').addEventListener('click', function() {
        exportCourses();
    });
    
    // 课节分类筛选
    document.getElementById('course-category').addEventListener('change', function() {
        filterCourses(this.value);
    });
    
    // 等级筛选
    document.getElementById('course-level').addEventListener('change', function() {
        filterCoursesByLevel(this.value);
    });
    
    // 模态框事件
    document.getElementById('modal-cancel').addEventListener('click', hideCourseModal);
    document.getElementById('modal-save').addEventListener('click', saveCourse);
    document.querySelector('.modal-close').addEventListener('click', hideCourseModal);
    document.querySelector('.modal-overlay').addEventListener('click', hideCourseModal);
    
    // 课节卡片按钮事件
    document.addEventListener('click', function(e) {
        if (e.target.closest('.edit-btn')) {
            const courseCard = e.target.closest('.course-card');
            editCourse(courseCard);
        } else if (e.target.closest('.preview-btn')) {
            const courseCard = e.target.closest('.course-card');
            previewCourse(courseCard);
        } else if (e.target.closest('.copy-btn')) {
            const courseCard = e.target.closest('.course-card');
            copyCourse(courseCard);
        } else if (e.target.closest('.delete-btn')) {
            const courseCard = e.target.closest('.course-card');
            deleteCourse(courseCard);
        }
    });
}

function loadCourseData() {
    console.log('加载课节数据...', courseData);
    // 这里可以从服务器加载实际数据
}

function showCourseModal(courseData = null) {
    const modal = document.getElementById('course-detail-modal');
    modal.classList.remove('hidden');
    
    if (courseData) {
        // 编辑模式，填充数据
        document.getElementById('course-name').value = courseData.name || '';
        document.getElementById('course-type').value = courseData.type || 'assessment';
        document.getElementById('course-duration').value = courseData.duration || '';
        document.getElementById('course-level-select').value = courseData.level || '1';
        document.getElementById('course-effect').value = courseData.effect || '';
        document.getElementById('pelvic-frequency').value = courseData.pelvicFreq || '';
        document.getElementById('pelvic-intensity').value = courseData.pelvicIntensity || '';
        document.getElementById('abdominal-frequency').value = courseData.abdominalFreq || '';
        document.getElementById('abdominal-intensity').value = courseData.abdominalIntensity || '';
    } else {
        // 新建模式，清空表单
        document.getElementById('course-name').value = '';
        document.getElementById('course-type').value = 'assessment';
        document.getElementById('course-duration').value = '';
        document.getElementById('course-level-select').value = '1';
        document.getElementById('course-effect').value = '';
        document.getElementById('pelvic-frequency').value = '';
        document.getElementById('pelvic-intensity').value = '';
        document.getElementById('abdominal-frequency').value = '';
        document.getElementById('abdominal-intensity').value = '';
    }
}

function hideCourseModal() {
    const modal = document.getElementById('course-detail-modal');
    modal.classList.add('hidden');
}

function saveCourse() {
    const courseData = {
        name: document.getElementById('course-name').value,
        type: document.getElementById('course-type').value,
        duration: document.getElementById('course-duration').value,
        level: document.getElementById('course-level-select').value,
        effect: document.getElementById('course-effect').value,
        pelvicFreq: document.getElementById('pelvic-frequency').value,
        pelvicIntensity: document.getElementById('pelvic-intensity').value,
        abdominalFreq: document.getElementById('abdominal-frequency').value,
        abdominalIntensity: document.getElementById('abdominal-intensity').value
    };
    
    console.log('保存课节数据:', courseData);
    // 这里发送数据到服务器
    
    hideCourseModal();
    alert('课节保存成功!');
}

function editCourse(courseCard) {
    const title = courseCard.querySelector('.course-title').textContent;
    console.log('编辑课节:', title);
    
    // 模拟获取课节数据
    const mockData = {
        name: title,
        type: 'assessment',
        duration: 15,
        level: 1,
        effect: '功能评估、基线建立',
        pelvicFreq: 20,
        pelvicIntensity: 10,
        abdominalFreq: 35,
        abdominalIntensity: 8
    };
    
    showCourseModal(mockData);
}

function previewCourse(courseCard) {
    const title = courseCard.querySelector('.course-title').textContent;
    console.log('预览课节:', title);
    alert(`预览课节: ${title}`);
}

function copyCourse(courseCard) {
    const title = courseCard.querySelector('.course-title').textContent;
    console.log('复制课节:', title);
    alert(`已复制课节: ${title}`);
}

function deleteCourse(courseCard) {
    const title = courseCard.querySelector('.course-title').textContent;
    if (confirm(`确定要删除课节 "${title}" 吗？`)) {
        console.log('删除课节:', title);
        courseCard.remove();
        alert('课节已删除');
    }
}

function filterCourses(category) {
    const courseCards = document.querySelectorAll('.course-card');
    
    courseCards.forEach(card => {
        if (category === 'all') {
            card.style.display = 'block';
        } else {
            const cardCategory = card.classList.contains(`${category}-card`);
            card.style.display = cardCategory ? 'block' : 'none';
        }
    });
    
    console.log('筛选课节分类:', category);
}

function filterCoursesByLevel(level) {
    const courseCards = document.querySelectorAll('.course-card');
    
    courseCards.forEach(card => {
        if (level === 'all') {
            card.style.display = 'block';
        } else {
            const levelElement = card.querySelector('.course-level');
            const cardLevel = levelElement.classList.contains(`level-${level}`);
            card.style.display = cardLevel ? 'block' : 'none';
        }
    });
    
    console.log('筛选课节等级:', level);
}

function showImportModal() {
    alert('打开导入课节对话框');
}

function exportCourses() {
    alert('导出课节数据');
}