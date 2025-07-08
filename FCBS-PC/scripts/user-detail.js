(function() {
    // 全局变量
    window.userData = null;
    window.calendarData = {};

    // 页面加载时获取用户ID并加载用户数据
    document.addEventListener('DOMContentLoaded', function() {
        // 从URL获取用户ID参数
        const urlParams = new URLSearchParams(window.location.search);
        const userId = urlParams.get('id');
        
        if (userId) {
            // 加载用户数据
            loadUserData(userId);
        } else {
            // 没有用户ID参数，显示错误信息
            alert('未指定用户ID，请返回用户列表重新选择');
            goBackToUserList();
        }
    });

    // 返回用户列表页面
    function goBackToUserList() {
        window.location.href = 'user-management.html';
    }

    // 加载用户数据的函数
    function loadUserData(userId) {
        // 这里应该是从服务器获取用户数据的API调用
        // 为了演示，我们使用模拟数据
        
        // 模拟API调用延迟
        setTimeout(() => {
            // 根据用户ID获取不同的模拟数据
            let userData;
            
            switch(userId) {
                case '1':
                    userData = {
                        id: 'UID10001',
                        name: '张小明',
                        phone: '138****1234',
                        gender: '男',
                        age: 32,
                        registerTime: '2023-05-15 14:30',
                        lastLogin: '2023-07-18 09:45',
                        deviceCount: 2,
                        status: '正常',
                        devices: [
                            {
                                id: 'DEV20230515001',
                                type: 1,
                                typeName: '盆底紧致修复仪',
                                bindTime: '2023-05-15 15:20',
                                lastUsed: '2023-07-17 20:30',
                                usageCount: 25,
                                status: '正常'
                            },
                            {
                                id: 'DEV20230610001',
                                type: 3,
                                typeName: '睡眠辅助仪',
                                bindTime: '2023-06-10 18:45',
                                lastUsed: '2023-07-18 06:00',
                                usageCount: 15,
                                status: '正常'
                            }
                        ],
                        plans: [
                            {
                                id: 'PL20230515001',
                                deviceType: 1,
                                deviceTypeName: '盆底紧致修复仪',
                                startTime: '2023-05-16 00:00',
                                endTime: '2023-08-16 00:00',
                                status: '进行中',
                                progress: '65%',
                                details: {
                                    goal: '盆底肌肉力量提升',
                                    frequency: '每周3-4次',
                                    duration: '每次20-30分钟',
                                    intensity: '中等强度，逐渐提升',
                                    notes: '保持规律作息，睡前避免使用电子设备',
                                    createTime: '2023-06-20 21:30:45',
                                    updateTime: '2023-07-16 22:15:30'
                                }
                            }
                        ],
                        usageRecords: [
                            {
                                id: 'UR20230717001',
                                deviceType: 1,
                                deviceTypeName: '盆底紧致修复仪',
                                startTime: '2023-07-17 19:45',
                                endTime: '2023-07-17 20:10',
                                duration: '25分钟',
                                status: '已完成',
                                details: {
                                    goal: '产后盆底肌肉恢复',
                                    currentState: '肌肉收缩力度提升10%，持续时间增加5秒',
                                    process: '0~5分钟：低频（热身）；6~20分钟：中频（训练）；21~25分钟：低频（放松）',
                                    nextSuggestion: '保持当前训练强度，逐渐增加训练时间',
                                    createTime: '2023-07-17 20:10:30',
                                    updateTime: '2023-07-17 20:15:15'
                                }
                            }
                        ]
                    };
                    break;
            }
            
            // 保存用户数据到全局变量，以便其他函数使用
            window.userData = userData;
            
            // 更新用户基本信息
            updateUserInfo(userData);
            
            // 更新设备列表
            updateDeviceList(userData.devices);
            
            // 更新康复计划
            updateRehabPlans(userData.plans);
            
            // 更新使用记录
            updateUsageRecords(userData.usageRecords);
        }, 500);
    }

    // 更新用户基本信息
    function updateUserInfo(userData) {
        document.getElementById('user-name').textContent = userData.name;
        document.getElementById('user-phone').textContent = userData.phone;
        document.getElementById('user-gender').textContent = userData.gender;
        document.getElementById('user-age').textContent = userData.age;
        document.getElementById('user-register-time').textContent = userData.registerTime;
        document.getElementById('user-last-login').textContent = userData.lastLogin;
        document.getElementById('user-device-count').textContent = userData.deviceCount;
        document.getElementById('user-status').textContent = userData.status;
        document.getElementById('user-id').textContent = userData.id;
    }

    // 更新设备列表
    function updateDeviceList(devices) {
        const deviceListBody = document.getElementById('device-list-body');
        
        if (devices && devices.length > 0) {
            let deviceListHTML = '';
            
            devices.forEach(device => {
                deviceListHTML += `
                    <tr class="device-row" onclick="selectDevice(${device.type})">
                        <td>${device.id}</td>
                        <td>
                            <span class="device-type-badge type-${device.type}">${device.typeName}</span>
                        </td>
                        <td>${device.bindTime}</td>
                        <td>${device.lastUsed}</td>
                        <td>${device.usageCount}</td>
                        <td>${device.status}</td>
                        <td>
                            <button class="user-action-btn view-btn">
                                <i class="fas fa-eye"></i> 查看
                            </button>
                        </td>
                    </tr>
                `;
            });
            
            deviceListBody.innerHTML = deviceListHTML;
        } else {
            deviceListBody.innerHTML = `
                <tr>
                    <td colspan="7" class="text-center py-4">该用户暂无绑定设备</td>
                </tr>
            `;
        }
    }

    // 更新康复计划列表
    function updateRehabPlans(plans) {
        const planListBody = document.getElementById('plan-list-body');
        
        if (plans && plans.length > 0) {
            let planListHTML = '';
            
            plans.forEach((plan, index) => {
                planListHTML += `
                    <tr class="plan-row plan-device-${plan.deviceType}">
                        <td>${plan.id}</td>
                        <td>
                            <span class="device-type-badge type-${plan.deviceType}">${plan.deviceTypeName}</span>
                        </td>
                        <td>${plan.startDate}</td>
                        <td>${plan.endDate}</td>
                        <td>
                            <span class="plan-status-badge ${plan.status === '进行中' ? 'active' : 'completed'}">${plan.status}</span>
                        </td>
                        <td>
                            <div class="progress-bar">
                                <div class="progress-value" style="width: ${plan.progress};"></div>
                            </div>
                            <div class="progress-text">${plan.progress}</div>
                        </td>
                        <td>
                            <button class="user-action-btn view-btn" onclick="showPlanDetailModal(${index})">
                                <i class="fas fa-eye"></i> 查看
                            </button>
                        </td>
                    </tr>
                `;
            });
            
            planListBody.innerHTML = planListHTML;
        } else {
            planListBody.innerHTML = `
                <tr>
                    <td colspan="7" class="text-center py-4">该用户暂无康复计划</td>
                </tr>
            `;
        }
    }

    // 加载康复计划时间轴数据
    function loadPlanTimelineData(plan, planIndex) {
        // 这里应该是从服务器获取康复计划详细时间轴数据的API调用
        // 为了演示，我们使用模拟数据
        
        // 模拟API调用延迟
        setTimeout(() => {
            // 根据计划ID获取不同的模拟时间轴数据
            let timelineData;
            
            // 模拟数据 - 根据计划ID生成不同的时间轴数据
            if (plan.id === 'PL20230515001') {
                // 生成时间轴数据 - 过去、当前和未来的训练日
                timelineData = [
                    // 第一阶段训练 (2023-05-16 至 2023-05-30)
                    {
                        date: '2023-05-16',
                        status: 'completed',
                        content: '初始训练：低频率（5Hz）训练，持续时间15分钟，主要针对盆底肌肉基础力量建设。'
                    },
                    {
                        date: '2023-05-18',
                        status: 'completed',
                        content: '基础训练：低频率（5-8Hz）训练，持续时间18分钟，增加了肌肉收缩次数。'
                    },
                    {
                        date: '2023-05-21',
                        status: 'completed',
                        content: '进阶训练：中频率（8-12Hz）训练，持续时间20分钟，增加了肌肉收缩强度。'
                    },
                    {
                        date: '2023-05-24',
                        status: 'completed',
                        content: '强化训练：中频率（10-15Hz）训练，持续时间22分钟，增加了肌肉收缩持续时间。'
                    },
                    {
                        date: '2023-05-27',
                        status: 'completed',
                        content: '评估训练：全频段（5-20Hz）训练，持续时间25分钟，评估肌肉力量恢复情况。'
                    },
                    {
                        date: '2023-05-30',
                        status: 'completed',
                        content: '第一阶段总结：完成基础训练，肌肉力量提升15%，为第二阶段做准备。'
                    },
                    
                    // 第二阶段训练 (2023-06-01 至 2023-06-15)
                    {
                        date: '2023-06-01',
                        status: 'completed',
                        content: '调整训练：根据评估结果，调整为中高频率（12-18Hz）训练，持续时间25分钟。'
                    },
                    {
                        date: '2023-06-04',
                        status: 'completed',
                        content: '强化训练：中高频率（12-18Hz）训练，持续时间25分钟，增加肌肉收缩强度。'
                    },
                    {
                        date: '2023-06-07',
                        status: 'completed',
                        content: '持续训练：中高频率（12-18Hz）训练，持续时间25分钟，保持肌肉力量。'
                    },
                    {
                        date: '2023-06-10',
                        status: 'completed',
                        content: '强化训练：高频率（15-20Hz）训练，持续时间28分钟，进一步增强肌肉力量。'
                    },
                    {
                        date: '2023-06-13',
                        status: 'completed',
                        content: '持续训练：高频率（15-20Hz）训练，持续时间28分钟，巩固训练成果。'
                    },
                    {
                        date: '2023-06-15',
                        status: 'completed',
                        content: '评估训练：全频段（5-20Hz）训练，持续时间30分钟，评估阶段性成果。'
                    },
                    
                    // 第三阶段训练 (2023-06-16 至 2023-07-15)
                    {
                        date: '2023-06-18',
                        status: 'completed',
                        content: '维持训练：中频率（10-15Hz）训练，持续时间25分钟，维持肌肉力量。'
                    },
                    {
                        date: '2023-06-22',
                        status: 'completed',
                        content: '持续训练：中频率（10-15Hz）训练，持续时间25分钟，保持肌肉力量。'
                    },
                    {
                        date: '2023-06-26',
                        status: 'completed',
                        content: '调整训练：根据反馈，调整为中高频率（12-18Hz）训练，持续时间28分钟。'
                    },
                    {
                        date: '2023-06-30',
                        status: 'completed',
                        content: '持续训练：中高频率（12-18Hz）训练，持续时间28分钟，保持肌肉力量。'
                    },
                    {
                        date: '2023-07-04',
                        status: 'completed',
                        content: '强化训练：高频率（15-20Hz）训练，持续时间30分钟，进一步增强肌肉力量。'
                    },
                    {
                        date: '2023-07-08',
                        status: 'completed',
                        content: '持续训练：高频率（15-20Hz）训练，持续时间30分钟，巩固训练成果。'
                    },
                    {
                        date: '2023-07-12',
                        status: 'completed',
                        content: '评估训练：全频段（5-20Hz）训练，持续时间30分钟，评估阶段性成果。'
                    },
                    {
                        date: '2023-07-15',
                        status: 'completed',
                        content: '第三阶段总结：完成维持训练，肌肉力量稳定，为第四阶段做准备。'
                    },
                    
                    // 第四阶段训练 (2023-07-16 至 2023-08-16)
                    {
                        date: '2023-07-18',
                        status: 'current',
                        content: '今日训练：中高频率（12-18Hz）训练，持续时间28分钟，重点加强肌肉持久力。'
                    },
                    {
                        date: '2023-07-21',
                        status: 'future',
                        content: '计划训练：高频率（15-20Hz）训练，持续时间30分钟，进一步提升肌肉力量和持久力。'
                    },
                    {
                        date: '2023-07-24',
                        status: 'future',
                        content: '计划训练：高频率（15-20Hz）训练，持续时间30分钟，巩固训练成果。'
                    },
                    {
                        date: '2023-07-27',
                        status: 'future',
                        content: '计划评估：全频段（5-20Hz）训练，持续时间30分钟，全面评估训练效果。'
                    },
                    {
                        date: '2023-07-30',
                        status: 'future',
                        content: '计划训练：根据评估结果调整训练参数，持续时间30分钟。'
                    },
                    {
                        date: '2023-08-03',
                        status: 'future',
                        content: '计划训练：高频率（15-20Hz）训练，持续时间30分钟，进一步提升肌肉力量。'
                    },
                    {
                        date: '2023-08-07',
                        status: 'future',
                        content: '计划训练：高频率（15-20Hz）训练，持续时间30分钟，巩固训练成果。'
                    },
                    {
                        date: '2023-08-11',
                        status: 'future',
                        content: '计划训练：高频率（15-20Hz）训练，持续时间30分钟，最终训练。'
                    },
                    {
                        date: '2023-08-16',
                        status: 'future',
                        content: '最终评估：全频段（5-20Hz）训练，持续时间30分钟，全面评估整个康复计划的效果。'
                    }
                ];
                
                // 初始化日历
                initCalendar(planIndex, timelineData);
            } else {
                // 默认时间轴数据
                timelineData = [
                    {
                        date: '2023-05-16',
                        status: 'completed',
                        content: '初始训练：基础训练内容'
                    },
                    {
                        date: formatDate(new Date()),
                        status: 'current',
                        content: '今日训练：当前训练内容'
                    },
                    {
                        date: '2023-08-16',
                        status: 'future',
                        content: '计划训练：未来训练内容'
                    }
                ];
                
                // 初始化日历
                initCalendar(planIndex, timelineData);
            }
        }, 300);
    }

    // 更新康复计划时间轴UI
    function updatePlanTimeline(timelineData, planIndex) {
        const timelineContainer = document.getElementById(`horizontal-timeline-items-${planIndex}`);
        
        if (timelineData && timelineData.length > 0) {
            let timelineHTML = '';
            
            timelineData.forEach(item => {
                // 根据状态设置不同的图标
                let icon = '';
                if (item.status === 'completed') {
                    icon = '<i class="fas fa-check"></i>';
                } else if (item.status === 'current') {
                    icon = '<i class="fas fa-play"></i>';
                } else {
                    icon = '<i class="fas fa-clock"></i>';
                }
                
                timelineHTML += `
                    <div class="horizontal-timeline-item">
                        <div class="horizontal-timeline-dot ${item.status}">${icon}</div>
                        <div class="horizontal-timeline-content ${item.status}">
                            <div class="horizontal-timeline-date">${item.date}</div>
                            <div class="horizontal-timeline-text">${item.content}</div>
                        </div>
                    </div>
                `;
            });
            
            timelineContainer.innerHTML = timelineHTML;
            
            // 自动滚动到当前项
            setTimeout(() => {
                const currentItem = timelineContainer.querySelector('.horizontal-timeline-dot.current');
                if (currentItem) {
                    const timeline = document.getElementById(`horizontal-timeline-${planIndex}`);
                    const itemRect = currentItem.getBoundingClientRect();
                    const timelineRect = timeline.getBoundingClientRect();
                    const scrollLeft = itemRect.left - timelineRect.left - (timelineRect.width / 2) + (itemRect.width / 2);
                    timeline.scrollLeft = scrollLeft;
                }
            }, 100);
        } else {
            timelineContainer.innerHTML = '<div class="text-center py-4">暂无训练计划时间轴数据</div>';
        }
    }

    // 滚动时间轴
    function scrollTimeline(planIndex, scrollAmount) {
        const timeline = document.getElementById(`horizontal-timeline-${planIndex}`);
        timeline.scrollBy({
            left: scrollAmount,
            behavior: 'smooth'
        });
    }

    // 格式化日期为YYYY-MM-DD格式
    function formatDate(date) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }

    // 更新使用记录列表
    function updateUsageRecords(records) {
        const usageListBody = document.getElementById('usage-list-body');
        
        if (records && records.length > 0) {
            let usageListHTML = '';
            
            records.forEach((record, index) => {
                usageListHTML += `
                    <tr class="usage-row usage-device-${record.deviceType}">
                        <td>${record.id}</td>
                        <td>
                            <span class="device-type-badge type-${record.deviceType}">${record.deviceTypeName}</span>
                        </td>
                        <td>${record.startTime}</td>
                        <td>${record.endTime}</td>
                        <td>${record.duration}</td>
                        <td>
                            <span class="usage-status-badge completed">${record.status}</span>
                        </td>
                        <td>
                            <button class="user-action-btn view-btn" onclick="toggleUsageDetails(${index})">
                                <i class="fas fa-eye"></i> 查看
                            </button>
                        </td>
                    </tr>
                    <tr id="usage-details-${index}" class="usage-details usage-device-${record.deviceType}" style="display: none;">
                        <td colspan="7">
                            <div class="usage-details-title">使用记录详情</div>
                            <div class="usage-details-item">
                                <span class="usage-details-label">当前目标:</span>
                                <span>${record.details.goal}</span>
                            </div>
                            <div class="usage-details-item">
                                <span class="usage-details-label">当前状态:</span>
                                <span>${record.details.currentState}</span>
                            </div>
                            <div class="usage-details-item">
                                <span class="usage-details-label">使用过程:</span>
                                <span>${record.details.process}</span>
                            </div>
                            <div class="usage-details-item">
                                <span class="usage-details-label">下次建议:</span>
                                <span>${record.details.nextSuggestion}</span>
                            </div>
                            <div class="usage-details-item">
                                <span class="usage-details-label">创建时间:</span>
                                <span>${record.details.createTime}</span>
                            </div>
                            <div class="usage-details-item">
                                <span class="usage-details-label">更新时间:</span>
                                <span>${record.details.updateTime}</span>
                            </div>
                        </td>
                    </tr>
                `;
            });
            
            usageListBody.innerHTML = usageListHTML;
        } else {
            usageListBody.innerHTML = `
                <tr>
                    <td colspan="7" class="text-center py-4">该用户暂无使用记录</td>
                </tr>
            `;
        }
    }

    // 选择设备，高亮显示并过滤康复计划和使用记录
    function selectDevice(deviceType) {
        // 移除所有设备行的选中状态
        const deviceRows = document.querySelectorAll('.device-row');
        deviceRows.forEach(row => row.classList.remove('selected'));
        
        // 为当前点击的设备行添加选中状态
        event.currentTarget.classList.add('selected');
        
        // 更新康复计划和使用记录的过滤状态
        filterPlansByDevice(deviceType);
        filterUsageRecordsByDevice(deviceType);
    }

    // 根据设备类型过滤康复计划
    function filterPlansByDevice(deviceType) {
        const planRows = document.querySelectorAll('.plan-row');
        const planDetails = document.querySelectorAll('.plan-details');
        const filterLabel = document.getElementById('plan-filter-label');
        
        // 隐藏所有计划行和详情
        planRows.forEach(row => row.style.display = 'none');
        planDetails.forEach(detail => detail.style.display = 'none');
        
        // 只显示选中设备的计划
        const devicePlans = document.querySelectorAll('.plan-device-' + deviceType);
        devicePlans.forEach(plan => {
            if (plan.classList.contains('plan-row')) {
                plan.style.display = 'table-row';
            }
        });
        
        // 更新过滤标签
        const deviceType_el = document.querySelector('.device-row.selected .device-type-badge');
        if (deviceType_el) {
            const deviceTypeName = deviceType_el.textContent;
            filterLabel.textContent = '显示' + deviceTypeName + '的康复计划';
        } else {
            filterLabel.textContent = '显示全部设备';
        }
    }

    // 根据设备类型过滤使用记录
    function filterUsageRecordsByDevice(deviceType) {
        const usageRows = document.querySelectorAll('.usage-row');
        const usageDetails = document.querySelectorAll('.usage-details');
        const filterLabel = document.getElementById('usage-filter-label');
        
        // 隐藏所有使用记录行和详情
        usageRows.forEach(row => row.style.display = 'none');
        usageDetails.forEach(detail => detail.style.display = 'none');
        
        // 只显示选中设备的使用记录
        const deviceUsages = document.querySelectorAll('.usage-device-' + deviceType);
        deviceUsages.forEach(usage => {
            if (usage.classList.contains('usage-row')) {
                usage.style.display = 'table-row';
            }
        });
        
        // 更新过滤标签
        const deviceType_el = document.querySelector('.device-row.selected .device-type-badge');
        if (deviceType_el) {
            const deviceTypeName = deviceType_el.textContent;
            filterLabel.textContent = '显示' + deviceTypeName + '的使用记录';
        } else {
            filterLabel.textContent = '显示全部设备';
        }
    }

    // 切换使用记录详情显示/隐藏
    function toggleUsageDetails(usageId) {
        const detailRow = document.getElementById('usage-details-' + usageId);
        if (detailRow.style.display === 'none') {
            detailRow.style.display = 'table-row';
        } else {
            detailRow.style.display = 'none';
        }
        event.stopPropagation(); // 阻止事件冒泡
    }

    // 修改：显示康复计划详情弹窗
    function showPlanDetailModal(planIndex) {
        const modal = document.getElementById('plan-detail-modal');
        const content = document.getElementById('plan-detail-content');
        
        // 显示弹窗
        modal.style.display = 'flex';
        
        // 显示加载状态
        content.innerHTML = `
            <div class="loading-spinner">
                <i class="fas fa-spinner fa-spin"></i> 加载康复计划详情中...
            </div>
        `;
        
        // 尝试加载rehabilitation-plan-detail.html的内容
        // 使用绝对路径或者检查当前路径
        const currentPath = window.location.pathname;
        const basePath = currentPath.substring(0, currentPath.lastIndexOf('/') + 1);
        const targetUrl = basePath + 'rehabilitation-plan-detail.html';
        
        fetch(targetUrl)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.text();
            })
            .then(html => {
                // 提取body内容
                const parser = new DOMParser();
                const doc = parser.parseFromString(html, 'text/html');
                const bodyContent = doc.querySelector('.rehabilitation-plan-container');
                
                if (bodyContent) {
                    content.innerHTML = bodyContent.outerHTML;
                    
                    // 加载对应的CSS文件
                    if (!document.querySelector('link[href="styles/rehabilitation-plan-detail.css"]')) {
                        const link = document.createElement('link');
                        link.rel = 'stylesheet';
                        link.href = 'styles/rehabilitation-plan-detail.css';
                        document.head.appendChild(link);
                    }
                    
                    // 加载对应的JS文件（如果存在）
                    if (!window.rehabilitationPlanDetailLoaded) {
                        const script = document.createElement('script');
                        script.src = 'scripts/rehabilitation-plan-detail.js';
                        script.onerror = () => {
                            console.log('rehabilitation-plan-detail.js not found, continuing without it');
                        };
                        document.head.appendChild(script);
                        window.rehabilitationPlanDetailLoaded = true;
                    }
                } else {
                    content.innerHTML = '<div class="error-message">无法找到康复计划详情内容</div>';
                }
            })
            .catch(error => {
                console.error('加载康复计划详情失败:', error);
                
                // 如果fetch失败，使用备用方案：直接跳转到页面
                content.innerHTML = `
                    <div class="error-message">
                        <p>无法在弹窗中加载内容</p>
                        <button class="user-action-btn view-btn" onclick="window.open('rehabilitation-plan-detail.html', '_blank')">
                            <i class="fas fa-external-link-alt"></i> 在新窗口中打开
                        </button>
                    </div>
                `;
            });
    }

    // 新增：关闭康复计划详情弹窗
    function closePlanDetailModal() {
        const modal = document.getElementById('plan-detail-modal');
        modal.style.display = 'none';
    }

    // 修改 loadPlanDetailsTemplate 函数，添加阶段内容渲染
function loadPlanDetailsTemplate(index) {
    console.log('loadPlanDetailsTemplate 被调用，index =', index);
    const detailsContent = document.getElementById(`plan-details-content-${index}`);
    
    if (!detailsContent) {
        console.error(`找不到计划详情内容容器: plan-details-content-${index}`);
        return;
    }
    
    try {
        // 使用内联模板而不是fetch
        const templateHTML = `
            <div class="plan-details-container">
                <!-- 左侧：康复计划总体内容和阶段信息 -->
                <div class="plan-overview">
                    <h4 class="plan-details-title">
                        <i class="fas fa-clipboard-check" style="margin-right: 0.5rem; color: var(--primary);"></i>
                        康复计划总览
                    </h4>
                    
                    <!-- 阶段信息 -->
                    <div class="plan-stages">
                        <div class="plan-stage stage-1">
                            <div class="plan-stage-header">
                                <div class="plan-stage-dot"></div>
                                <h5 class="plan-stage-title">第一阶段：基础训练</h5>
                                <span class="plan-stage-date">2023-05-16 至 2023-05-30</span>
                            </div>
                            <div class="plan-stage-content">
                                <p>低频率（5-8Hz）训练，持续时间15-20分钟，重点建立基础肌肉力量。</p>
                                <p>训练频率：每周3次，周一、周三、周五</p>
                                <p>训练目标：建立基础肌肉力量，提高肌肉收缩能力</p>
                            </div>
                        </div>
                        
                        <div class="plan-stage stage-2">
                            <div class="plan-stage-header">
                                <div class="plan-stage-dot"></div>
                                <h5 class="plan-stage-title">第二阶段：强化训练</h5>
                                <span class="plan-stage-date">2023-06-01 至 2023-06-15</span>
                            </div>
                            <div class="plan-stage-content">
                                <p>中频率（8-15Hz）训练，持续时间20-25分钟，重点提升肌肉力量。</p>
                                <p>训练频率：每周3次，周一、周三、周五</p>
                                <p>训练目标：提升肌肉力量，增强肌肉耐力</p>
                            </div>
                        </div>
                        
                        <div class="plan-stage stage-3">
                            <div class="plan-stage-header">
                                <div class="plan-stage-dot"></div>
                                <h5 class="plan-stage-title">第三阶段：维持训练</h5>
                                <span class="plan-stage-date">2023-06-16 至 2023-07-15</span>
                            </div>
                            <div class="plan-stage-content">
                                <p>中高频率（12-18Hz）训练，持续时间25-30分钟，重点加强肌肉持久力。</p>
                                <p>训练频率：每周3次，周一、周三、周五</p>
                                <p>训练目标：加强肌肉持久力，巩固训练成果</p>
                            </div>
                        </div>
                        
                        <div class="plan-stage stage-4">
                            <div class="plan-stage-header">
                                <div class="plan-stage-dot"></div>
                                <h5 class="plan-stage-title">第四阶段：巩固训练</h5>
                                <span class="plan-stage-date">2023-07-16 至 2023-08-16</span>
                            </div>
                            <div class="plan-stage-content">
                                <p>高频率（15-20Hz）训练，持续时间30分钟，重点进一步提升肌肉力量和持久力。</p>
                                <p>训练频率：每周3次，周一、周三、周五</p>
                                <p>训练目标：进一步提升肌肉力量和持久力，达到最终康复目标</p>
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- 右侧：日历形式显示训练详情 -->
                <div class="plan-calendar">
                    <div class="calendar-header">
                        <h4 class="calendar-title">
                            <i class="fas fa-calendar-day" style="margin-right: 0.5rem; color: var(--primary);"></i>
                            训练日历
                        </h4>
                        <div class="calendar-controls">
                            <button class="calendar-control-btn" onclick="prevMonth(${index})">
                                <i class="fas fa-chevron-left"></i>
                            </button>
                            <span id="calendar-month-${index}">2023年7月</span>
                            <button class="calendar-control-btn" onclick="nextMonth(${index})">
                                <i class="fas fa-chevron-right"></i>
                            </button>
                        </div>
                    </div>
                    
                    <div class="calendar-grid" id="calendar-weekdays-${index}">
                        <div class="calendar-weekday">日</div>
                        <div class="calendar-weekday">一</div>
                        <div class="calendar-weekday">二</div>
                        <div class="calendar-weekday">三</div>
                        <div class="calendar-weekday">四</div>
                        <div class="calendar-weekday">五</div>
                        <div class="calendar-weekday">六</div>
                    </div>
                    
                    <div class="calendar-grid" id="calendar-days-${index}">
                        <!-- 日历内容将通过JavaScript动态加载 -->
                    </div>
                    
                    <div class="calendar-event-details" id="calendar-event-${index}">
                        <!-- 事件详情将通过JavaScript动态加载 -->
                    </div>
                    
                    <div class="calendar-legend">
                        <div class="legend-item">
                            <div class="legend-color stage-1"></div>
                            <div class="legend-text">第一阶段</div>
                        </div>
                        <div class="legend-item">
                            <div class="legend-color stage-2"></div>
                            <div class="legend-text">第二阶段</div>
                        </div>
                        <div class="legend-item">
                            <div class="legend-color stage-3"></div>
                            <div class="legend-text">第三阶段</div>
                        </div>
                        <div class="legend-item">
                            <div class="legend-color stage-4"></div>
                            <div class="legend-text">第四阶段</div>
                        </div>
                        <div class="legend-item">
                            <div class="legend-color completed"></div>
                            <div class="legend-text">已完成</div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        // 设置内容
        detailsContent.innerHTML = templateHTML;
        detailsContent.setAttribute('data-loaded', 'true');
        
        // 加载时间轴数据
        if (window.userData && window.userData.plans && window.userData.plans[index]) {
            loadPlanTimelineData(window.userData.plans[index], index);
        } else {
            console.warn('计划数据不存在:', index);
            // 创建默认时间轴数据
            loadPlanTimelineData({
                id: `PLAN-${index}`,
                deviceType: 1,
                startDate: '2023-05-16',
                endDate: '2023-08-16',
                status: '进行中',
                progress: 65
            }, index);
        }
    } catch (error) {
        console.error('加载计划详情失败:', error);
        detailsContent.innerHTML = `
            <div class="text-center py-4 text-red-500">
                <i class="fas fa-exclamation-circle"></i> 加载计划详情失败: ${error.message}
            </div>
        `;
    }
}

    // 生成模拟的时间轴数据
    function generateTimelineData(plan) {
        // 创建一个模拟的时间轴数据
        const startDate = new Date(plan.startDate || '2023-05-16');
        const endDate = new Date(plan.endDate || '2023-08-16');
        
        const timelineData = [];
        const currentDate = new Date();
        
        // 第一阶段：基础训练
        const phase1End = new Date('2023-05-30');
        
        // 第二阶段：强化训练
        const phase2End = new Date('2023-06-15');
        
        // 第三阶段：维持训练
        const phase3End = new Date('2023-07-15');
        
        // 生成训练日期（每周3-4次）
        let date = new Date(startDate);
        while (date <= endDate) {
            // 每周一、三、五安排训练
            if (date.getDay() === 1 || date.getDay() === 3 || date.getDay() === 5) {
                let status = 'planned';
                if (date < currentDate) {
                    status = 'completed';
                } else if (formatDate(date) === formatDate(currentDate)) {
                    status = 'current';
                }
                
                let content = '';
                let phase = '';
                
                if (date <= phase1End) {
                    phase = '第一阶段';
                    content = '低频率（5-8Hz）训练，持续时间15-20分钟，重点建立基础肌肉力量。';
                } else if (date <= phase2End) {
                    phase = '第二阶段';
                    content = '中频率（8-15Hz）训练，持续时间20-25分钟，重点提升肌肉力量。';
                } else if (date <= phase3End) {
                    phase = '第三阶段';
                    content = '中高频率（12-18Hz）训练，持续时间25-30分钟，重点加强肌肉持久力。';
                } else {
                    phase = '第四阶段';
                    content = '高频率（15-20Hz）训练，持续时间30分钟，重点进一步提升肌肉力量和持久力。';
                }
                
                timelineData.push({
                    date: formatDate(date),
                    phase: phase,
                    content: content,
                    status: status
                });
            }
            
            // 增加一天
            date.setDate(date.getDate() + 1);
        }
        
        return timelineData;
    }

    // 初始化日历
    function initCalendar(planIndex, timelineData) {
        // 获取当前日期
        const today = new Date();
        const currentMonth = today.getMonth();
        const currentYear = today.getFullYear();
        
        // 存储日历数据
        window.calendarData = window.calendarData || {};
        window.calendarData[planIndex] = {
            currentMonth: currentMonth,
            currentYear: currentYear,
            timelineData: timelineData,
            selectedDate: formatDate(today)
        };
        
        // 渲染日历
        renderCalendar(planIndex);
    }

    // 修改 renderCalendar 函数，确保日历上正确显示训练日期和阶段
function renderCalendar(planIndex) {
    const calendarData = window.calendarData[planIndex];
    if (!calendarData) {
        console.error(`日历数据不存在: planIndex=${planIndex}`);
        return;
    }
    
    const year = calendarData.currentYear;
    const month = calendarData.currentMonth;
    
    // 更新月份标题
    const monthNames = ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月'];
    document.getElementById(`calendar-month-${planIndex}`).textContent = `${year}年${monthNames[month]}`;
    
    // 获取当月第一天是星期几
    const firstDay = new Date(year, month, 1).getDay();
    
    // 获取当月天数
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    
    // 生成日历天数
    let daysHTML = '';
    
    // 添加空白格子
    for (let i = 0; i < firstDay; i++) {
        daysHTML += `<div class="calendar-day empty"></div>`;
    }
    
    // 添加日期格子
    for (let day = 1; day <= daysInMonth; day++) {
        const date = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        const isToday = date === formatDate(new Date());
        const isSelected = date === calendarData.selectedDate;
        
        // 检查该日期是否有训练事件
        const event = calendarData.timelineData.find(item => item.date === date);
        let stageClass = '';
        let statusClass = '';
        
        if (event) {
            // 根据日期确定阶段
            const eventDate = new Date(event.date);
            if (eventDate <= new Date('2023-05-30')) {
                stageClass = 'stage-1';
            } else if (eventDate <= new Date('2023-06-15')) {
                stageClass = 'stage-2';
            } else if (eventDate <= new Date('2023-07-15')) {
                stageClass = 'stage-3';
            } else {
                stageClass = 'stage-4';
            }
            
            // 根据状态确定是否完成
            if (event.status === 'completed') {
                statusClass = 'completed';
            } else if (event.status === 'current') {
                statusClass = 'current';
            } else {
                statusClass = 'future';
            }
        }
        
        daysHTML += `
            <div class="calendar-day ${event ? 'has-event ' + stageClass + ' ' + statusClass : ''} ${isToday ? 'today' : ''} ${isSelected ? 'selected' : ''}" 
                 onclick="selectCalendarDay(${planIndex}, '${date}')">
                <span class="calendar-day-number">${day}</span>
                ${event ? '<span class="calendar-event-indicator"></span>' : ''}
            </div>
        `;
    }
    
    // 更新日历
    document.getElementById(`calendar-days-${planIndex}`).innerHTML = daysHTML;
    
    // 更新事件详情
    updateEventDetails(planIndex, calendarData.selectedDate);
}

    // 选择日历日期
    function selectCalendarDay(planIndex, date) {
        const calendarData = window.calendarData[planIndex];
        calendarData.selectedDate = date;
        
        // 移除之前的选中状态
        const selectedDay = document.querySelector(`#calendar-days-${planIndex} .calendar-day.selected`);
        if (selectedDay) {
            selectedDay.classList.remove('selected');
        }
        
        // 添加新的选中状态
        const dayElement = document.querySelector(`#calendar-days-${planIndex} .calendar-day:not(.empty):nth-child(${parseInt(date.split('-')[2]) + document.querySelectorAll(`#calendar-days-${planIndex} .calendar-day.empty`).length})`);
        if (dayElement) {
            dayElement.classList.add('selected');
        }
        
        // 更新事件详情
        updateEventDetails(planIndex, date);
    }

    // 修改 updateEventDetails 函数，确保事件详情正确显示
function updateEventDetails(planIndex, date) {
    const calendarData = window.calendarData[planIndex];
    if (!calendarData) {
        console.error(`日历数据不存在: planIndex=${planIndex}`);
        return;
    }
    
    const event = calendarData.timelineData.find(item => item.date === date);
    const eventDetailsElement = document.getElementById(`calendar-event-${planIndex}`);
    
    if (event) {
        let statusIcon = '';
        let statusText = '';
        let stageClass = '';
        
        // 根据日期确定阶段
        const eventDate = new Date(event.date);
        if (eventDate <= new Date('2023-05-30')) {
            stageClass = 'stage-1';
        } else if (eventDate <= new Date('2023-06-15')) {
            stageClass = 'stage-2';
        } else if (eventDate <= new Date('2023-07-15')) {
            stageClass = 'stage-3';
        } else {
            stageClass = 'stage-4';
        }
        
        if (event.status === 'completed') {
            statusIcon = '<i class="fas fa-check-circle" style="color: #10b981; margin-right: 5px;"></i>';
            statusText = '已完成';
        } else if (event.status === 'current') {
            statusIcon = '<i class="fas fa-play-circle" style="color: #3b82f6; margin-right: 5px;"></i>';
            statusText = '今日训练';
        } else {
            statusIcon = '<i class="fas fa-clock" style="color: #9ca3af; margin-right: 5px;"></i>';
            statusText = '计划训练';
        }
        
        eventDetailsElement.innerHTML = `
            <div class="event-date ${stageClass}">${date}</div>
            <div class="event-status">${statusIcon}${statusText}</div>
            <div class="event-content">${event.content}</div>
        `;
    } else {
        eventDetailsElement.innerHTML = `
            <div class="event-empty">
                <i class="fas fa-calendar-times" style="color: #9ca3af; margin-right: 5px;"></i>
                该日期没有安排训练
            </div>
        `;
    }
}

    // 上一个月
    function prevMonth(planIndex) {
        const calendarData = window.calendarData[planIndex];
        calendarData.currentMonth--;
        
        if (calendarData.currentMonth < 0) {
            calendarData.currentMonth = 11;
            calendarData.currentYear--;
        }
        
        renderCalendar(planIndex);
    }

    // 下一个月
    function nextMonth(planIndex) {
        const calendarData = window.calendarData[planIndex];
        calendarData.currentMonth++;
        
        if (calendarData.currentMonth > 11) {
            calendarData.currentMonth = 0;
            calendarData.currentYear++;
        }
        
        renderCalendar(planIndex);
    }

    // 将日历相关函数暴露到全局作用域
    window.initCalendar = initCalendar;
    window.renderCalendar = renderCalendar;
    window.selectCalendarDay = selectCalendarDay;
    window.prevMonth = prevMonth;
    window.nextMonth = nextMonth;

    // 将需要在全局访问的函数暴露到全局作用域
    window.goBackToUserList = goBackToUserList;
    window.showPlanDetailModal = showPlanDetailModal;
    window.closePlanDetailModal = closePlanDetailModal;
    window.toggleUsageDetails = toggleUsageDetails;
    window.selectDevice = selectDevice;
    window.loadPlanDetailsTemplate = loadPlanDetailsTemplate;
    window.initCalendar = initCalendar;
    window.renderCalendar = renderCalendar;
    window.selectCalendarDay = selectCalendarDay;
    window.updateEventDetails = updateEventDetails;
    window.prevMonth = prevMonth;
    window.nextMonth = nextMonth;
    window.formatDate = formatDate;
})();