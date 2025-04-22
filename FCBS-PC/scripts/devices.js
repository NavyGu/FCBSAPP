// 设备管理页面的JavaScript代码
document.addEventListener('DOMContentLoaded', function() {
    // 初始化页面
    initDevicePage();
    
    // 为设备标签页添加点击事件
    const tabButtons = document.querySelectorAll('.device-tab-btn');
    tabButtons.forEach(button => {
        button.addEventListener('click', function() {
            const tabId = this.getAttribute('data-tab');
            switchTab(tabId);
        });
    });
});

// 初始化设备页面
function initDevicePage() {
    // 默认显示设备列表页面
    document.getElementById('device-list-page').style.display = 'block';
    document.getElementById('device-detail-page').style.display = 'none';
}

// 显示设备详情页面
function showDeviceDetail(deviceId) {
    document.getElementById('device-list-page').style.display = 'none';
    document.getElementById('device-detail-page').style.display = 'block';
    
    // 在实际应用中，这里应该从后端获取设备详情数据
    console.log(`加载设备详情: ${deviceId}`);
    
    // 默认激活第一个标签页
    switchTab('usage-history');
}

// 返回设备列表页面
function showDeviceList() {
    document.getElementById('device-list-page').style.display = 'block';
    document.getElementById('device-detail-page').style.display = 'none';
}

// 切换标签页
function switchTab(tabId) {
    // 移除所有标签按钮的active类
    const tabButtons = document.querySelectorAll('.device-tab-btn');
    tabButtons.forEach(button => {
        button.classList.remove('active');
    });
    
    // 为当前点击的标签按钮添加active类
    const activeButton = document.querySelector(`.device-tab-btn[data-tab="${tabId}"]`);
    if (activeButton) {
        activeButton.classList.add('active');
    }
    
    // 隐藏所有标签内容
    const tabPanes = document.querySelectorAll('.device-tab-pane');
    tabPanes.forEach(pane => {
        pane.classList.remove('active');
    });
    
    // 显示当前标签内容
    const activePane = document.getElementById(tabId);
    if (activePane) {
        activePane.classList.add('active');
    }
}

// 切换使用记录详情
function toggleUsageDetails(usageId) {
    const detailsRow = document.getElementById(`usage-details-${usageId}`);
    if (detailsRow) {
        if (detailsRow.style.display === 'none') {
            detailsRow.style.display = 'table-row';
        } else {
            detailsRow.style.display = 'none';
        }
    }
}

// 切换维护记录详情
function toggleMaintenanceDetails(maintenanceId) {
    const detailsRow = document.getElementById(`maintenance-details-${maintenanceId}`);
    if (detailsRow) {
        if (detailsRow.style.display === 'none') {
            detailsRow.style.display = 'table-row';
        } else {
            detailsRow.style.display = 'none';
        }
    }
}