/**
 * 凯格尔训练配置管理类
 */
class KegelTrainingConfig {
    constructor() {
        this.controlPoints = [];
        this.isAddingPoint = false;
        this.isDeletingPoint = false;
        this.editingPointIndex = -1;
        this.waveformCanvas = null;
        this.previewCanvas = null;
        this.waveformCtx = null;
        this.previewCtx = null;
        
        this.init();
    }

    /**
     * 初始化
     */
    init() {
        this.loadCourseInfo();
        this.initializeCanvas();
        this.bindEvents();
        this.updatePreviewInfo();
        this.resetWaveform();
    }

    /**
     * 加载课程信息
     */
    loadCourseInfo() {
        const urlParams = new URLSearchParams(window.location.search);
        const courseName = urlParams.get('courseName') || '未命名课程';
        const category = urlParams.get('category') || '凯格尔训练';
        const duration = urlParams.get('duration') || '10分钟';
        const indications = urlParams.get('indications') || '';
        const overview = urlParams.get('overview') || '';
        const version = urlParams.get('version') || 'v1.0';
        const updater = urlParams.get('updater') || '系统管理员';
        
        // 更新页面信息
        document.getElementById('courseInfo').textContent = `${courseName} - ${category} - ${duration}`;
        
        // 填充表单
        document.getElementById('trainingType').value = '凯格尔训练';
        document.getElementById('courseName').value = courseName;
        document.getElementById('category').value = category;
        document.getElementById('indications').value = indications;
        document.getElementById('overview').value = overview;
        document.getElementById('version').value = version;
        document.getElementById('updater').value = updater;
        document.getElementById('updateTime').value = new Date().toLocaleString('zh-CN');
    }

    /**
     * 初始化画布
     */
    initializeCanvas() {
        this.waveformCanvas = document.getElementById('waveformCanvas');
        this.previewCanvas = document.getElementById('previewCanvas');
        this.waveformCtx = this.waveformCanvas.getContext('2d');
        this.previewCtx = this.previewCanvas.getContext('2d');
        
        // 设置画布样式
        this.setupCanvas(this.waveformCtx);
        this.setupCanvas(this.previewCtx);
    }

    /**
     * 设置画布样式
     */
    setupCanvas(ctx) {
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.imageSmoothingEnabled = true;
    }

    /**
     * 绑定事件
     */
    bindEvents() {
        // 参数变化事件
        ['totalDuration', 'cycleTime', 'emgMin', 'emgMax'].forEach(id => {
            document.getElementById(id).addEventListener('input', () => {
                this.updatePreviewInfo();
            });
        });

        // 画布点击事件
        this.waveformCanvas.addEventListener('click', (e) => {
            this.handleCanvasClick(e);
        });

        // 画布鼠标移动事件
        this.waveformCanvas.addEventListener('mousemove', (e) => {
            this.handleCanvasMouseMove(e);
        });
    }

    /**
     * 处理画布点击
     */
    handleCanvasClick(e) {
        const rect = this.waveformCanvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        const cycleTime = parseFloat(document.getElementById('cycleTime').value);
        const emgMin = parseFloat(document.getElementById('emgMin').value);
        const emgMax = parseFloat(document.getElementById('emgMax').value);
        
        // 转换为实际坐标
        const time = (x - 60) / (this.waveformCanvas.width - 120) * cycleTime;
        const value = emgMax - (y - 40) / (this.waveformCanvas.height - 80) * (emgMax - emgMin);
        
        if (time >= 0 && time <= cycleTime && value >= emgMin && value <= emgMax) {
            if (this.isAddingPoint) {
                this.addControlPoint(time, value);
            } else if (this.isDeletingPoint) {
                this.deleteNearestPoint(time, value);
            }
        }
    }

    /**
     * 处理画布鼠标移动
     */
    handleCanvasMouseMove(e) {
        const rect = this.waveformCanvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        const cycleTime = parseFloat(document.getElementById('cycleTime').value);
        const emgMin = parseFloat(document.getElementById('emgMin').value);
        const emgMax = parseFloat(document.getElementById('emgMax').value);
        
        // 转换为实际坐标
        const time = (x - 60) / (this.waveformCanvas.width - 120) * cycleTime;
        const value = emgMax - (y - 40) / (this.waveformCanvas.height - 80) * (emgMax - emgMin);
        
        // 更新鼠标样式
        if (time >= 0 && time <= cycleTime && value >= emgMin && value <= emgMax) {
            if (this.isAddingPoint) {
                this.waveformCanvas.style.cursor = 'crosshair';
            } else if (this.isDeletingPoint) {
                this.waveformCanvas.style.cursor = 'pointer';
            } else {
                this.waveformCanvas.style.cursor = 'default';
            }
        } else {
            this.waveformCanvas.style.cursor = 'not-allowed';
        }
    }

    /**
     * 添加控制点
     */
    addControlPoint(time, value) {
        // 检查是否已存在相近的点
        const threshold = 1; // 1秒阈值
        const existingPoint = this.controlPoints.find(point => 
            Math.abs(point.time - time) < threshold
        );
        
        if (existingPoint) {
            alert('该时间点附近已存在控制点，请选择其他位置');
            return;
        }
        
        this.controlPoints.push({
            time: Math.round(time * 10) / 10,
            value: Math.round(value * 10) / 10
        });
        
        // 按时间排序
        this.controlPoints.sort((a, b) => a.time - b.time);
        
        this.updateWaveform();
        this.updateControlPointsList();
    }

    /**
     * 删除最近的控制点
     */
    deleteNearestPoint(time, value) {
        if (this.controlPoints.length === 0) return;
        
        let nearestIndex = 0;
        let minDistance = Infinity;
        
        this.controlPoints.forEach((point, index) => {
            const distance = Math.sqrt(
                Math.pow(point.time - time, 2) + 
                Math.pow(point.value - value, 2)
            );
            if (distance < minDistance) {
                minDistance = distance;
                nearestIndex = index;
            }
        });
        
        // 如果距离太远，不删除
        if (minDistance > 10) {
            alert('请点击更接近控制点的位置');
            return;
        }
        
        this.controlPoints.splice(nearestIndex, 1);
        this.updateWaveform();
        this.updateControlPointsList();
    }

    /**
     * 更新波形图
     */
    updateWaveform() {
        this.drawWaveform();
    }

    /**
     * 绘制波形图
     */
    drawWaveform() {
        const ctx = this.waveformCtx;
        const canvas = this.waveformCanvas;
        const cycleTime = parseFloat(document.getElementById('cycleTime').value);
        const emgMin = parseFloat(document.getElementById('emgMin').value);
        const emgMax = parseFloat(document.getElementById('emgMax').value);
        
        // 清空画布
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // 绘制坐标轴
        this.drawAxes(ctx, canvas, cycleTime, emgMin, emgMax);
        
        // 绘制网格
        this.drawGrid(ctx, canvas, cycleTime, emgMin, emgMax);
        
        // 绘制波形
        if (this.controlPoints.length > 1) {
            this.drawWaveformCurve(ctx, canvas, cycleTime, emgMin, emgMax);
        }
        
        // 绘制控制点
        this.drawControlPoints(ctx, canvas, cycleTime, emgMin, emgMax);
    }

    /**
     * 绘制坐标轴
     */
    drawAxes(ctx, canvas, cycleTime, emgMin, emgMax) {
        ctx.strokeStyle = '#333';
        ctx.lineWidth = 2;
        
        // X轴
        ctx.beginPath();
        ctx.moveTo(60, canvas.height - 40);
        ctx.lineTo(canvas.width - 60, canvas.height - 40);
        ctx.stroke();
        
        // Y轴
        ctx.beginPath();
        ctx.moveTo(60, 40);
        ctx.lineTo(60, canvas.height - 40);
        ctx.stroke();
        
        // 绘制刻度和标签
        this.drawAxisLabels(ctx, canvas, cycleTime, emgMin, emgMax);
    }

    /**
     * 绘制坐标轴标签
     */
    drawAxisLabels(ctx, canvas, cycleTime, emgMin, emgMax) {
        ctx.fillStyle = '#666';
        ctx.font = '12px Arial';
        ctx.textAlign = 'center';
        
        // X轴标签 - 1秒间隔
        const xSteps = Math.ceil(cycleTime); // 根据循环时间计算步数
        for (let i = 0; i <= xSteps; i++) {
            const time = i; // 每1秒一个刻度
            const x = 60 + (canvas.width - 120) * time / cycleTime;
            
            // 刻度线
            ctx.strokeStyle = '#999';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(x, canvas.height - 40);
            ctx.lineTo(x, canvas.height - 35);
            ctx.stroke();
            
            // 标签
            ctx.fillText(time + 's', x, canvas.height - 20);
        }
        
        // Y轴标签
        ctx.textAlign = 'right';
        const ySteps = 5;
        for (let i = 0; i <= ySteps; i++) {
            const y = 40 + (canvas.height - 80) * i / ySteps;
            const value = emgMax - (emgMax - emgMin) * i / ySteps;
            
            // 刻度线
            ctx.strokeStyle = '#999';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(60, y);
            ctx.lineTo(65, y);
            ctx.stroke();
            
            // 标签
            ctx.fillText(value.toFixed(0), 55, y + 4);
        }
    }

    /**
     * 绘制网格
     */
    drawGrid(ctx, canvas, cycleTime, emgMin, emgMax) {
        ctx.strokeStyle = '#f0f0f0';
        ctx.lineWidth = 1;
        
        // 垂直网格线 - 1秒间隔
        const xSteps = Math.ceil(cycleTime);
        for (let i = 1; i < xSteps; i++) {
            const time = i;
            const x = 60 + (canvas.width - 120) * time / cycleTime;
            ctx.beginPath();
            ctx.moveTo(x, 40);
            ctx.lineTo(x, canvas.height - 40);
            ctx.stroke();
        }
        
        // 水平网格线
        const ySteps = 10;
        for (let i = 1; i < ySteps; i++) {
            const y = 40 + (canvas.height - 80) * i / ySteps;
            ctx.beginPath();
            ctx.moveTo(60, y);
            ctx.lineTo(canvas.width - 60, y);
            ctx.stroke();
        }
    }

    /**
     * 绘制波形曲线
     */
    drawWaveformCurve(ctx, canvas, cycleTime, emgMin, emgMax) {
        ctx.strokeStyle = '#667eea';
        ctx.lineWidth = 3;
        ctx.beginPath();
        
        // 使用样条插值绘制平滑曲线
        const points = this.interpolatePoints(cycleTime, emgMin, emgMax);
        
        points.forEach((point, index) => {
            const x = 60 + (canvas.width - 120) * point.time / cycleTime;
            const y = 40 + (canvas.height - 80) * (emgMax - point.value) / (emgMax - emgMin);
            
            if (index === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        });
        
        ctx.stroke();
    }

    /**
     * 插值生成平滑曲线点
     */
    interpolatePoints(cycleTime, emgMin, emgMax) {
        if (this.controlPoints.length < 2) return [];
        
        const points = [];
        const resolution = 100; // 曲线分辨率
        
        for (let i = 0; i <= resolution; i++) {
            const t = cycleTime * i / resolution;
            const value = this.interpolateValue(t);
            points.push({ time: t, value: Math.max(emgMin, Math.min(emgMax, value)) });
        }
        
        return points;
    }

    /**
     * 线性插值计算值
     */
    interpolateValue(time) {
        if (this.controlPoints.length === 0) return 0;
        if (this.controlPoints.length === 1) return this.controlPoints[0].value;
        
        // 找到时间点前后的控制点
        let leftPoint = this.controlPoints[0];
        let rightPoint = this.controlPoints[this.controlPoints.length - 1];
        
        for (let i = 0; i < this.controlPoints.length - 1; i++) {
            if (time >= this.controlPoints[i].time && time <= this.controlPoints[i + 1].time) {
                leftPoint = this.controlPoints[i];
                rightPoint = this.controlPoints[i + 1];
                break;
            }
        }
        
        // 线性插值
        if (leftPoint.time === rightPoint.time) {
            return leftPoint.value;
        }
        
        const ratio = (time - leftPoint.time) / (rightPoint.time - leftPoint.time);
        return leftPoint.value + (rightPoint.value - leftPoint.value) * ratio;
    }

    /**
     * 绘制控制点
     */
    drawControlPoints(ctx, canvas, cycleTime, emgMin, emgMax) {
        this.controlPoints.forEach((point, index) => {
            const x = 60 + (canvas.width - 120) * point.time / cycleTime;
            const y = 40 + (canvas.height - 80) * (emgMax - point.value) / (emgMax - emgMin);
            
            // 绘制控制点
            ctx.fillStyle = '#ff6b6b';
            ctx.beginPath();
            ctx.arc(x, y, 6, 0, 2 * Math.PI);
            ctx.fill();
            
            // 绘制边框
            ctx.strokeStyle = '#fff';
            ctx.lineWidth = 2;
            ctx.stroke();
            
            // 绘制标签
            ctx.fillStyle = '#333';
            ctx.font = '10px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(`${point.time}s`, x, y - 12);
            ctx.fillText(`${point.value}μV`, x, y + 20);
        });
    }

    /**
     * 更新控制点列表
     */
    updateControlPointsList() {
        const container = document.getElementById('pointsContainer');
        container.innerHTML = '';
        
        if (this.controlPoints.length === 0) {
            container.innerHTML = '<div class="no-points">暂无控制点，请在波形图中添加</div>';
            return;
        }
        
        this.controlPoints.forEach((point, index) => {
            const pointElement = document.createElement('div');
            pointElement.className = 'control-point';
            pointElement.innerHTML = `
                <span>${point.time}s, ${point.value}μV</span>
                <button class="delete-btn" onclick="kegelConfig.removeControlPoint(${index})">
                    <i class="fas fa-times"></i>
                </button>
            `;
            
            // 双击编辑
            pointElement.addEventListener('dblclick', () => {
                this.editControlPoint(index);
            });
            
            container.appendChild(pointElement);
        });
    }

    /**
     * 移除控制点
     */
    removeControlPoint(index) {
        this.controlPoints.splice(index, 1);
        this.updateWaveform();
        this.updateControlPointsList();
    }

    /**
     * 编辑控制点
     */
    editControlPoint(index) {
        this.editingPointIndex = index;
        const point = this.controlPoints[index];
        
        document.getElementById('pointTime').value = point.time;
        document.getElementById('pointValue').value = point.value;
        document.getElementById('pointModalTitle').textContent = '编辑控制点';
        document.getElementById('pointModal').style.display = 'flex';
    }

    /**
     * 更新预览信息
     */
    updatePreviewInfo() {
        const totalDuration = parseFloat(document.getElementById('totalDuration').value) || 10;
        const cycleTime = parseFloat(document.getElementById('cycleTime').value) || 30;
        
        const totalSeconds = totalDuration * 60;
        const totalCycles = Math.ceil(totalSeconds / cycleTime);
        const completeCycles = Math.floor(totalSeconds / cycleTime);
        const lastCycleTime = totalSeconds % cycleTime;
        
        document.getElementById('totalCycles').textContent = totalCycles;
        document.getElementById('completeCycles').textContent = completeCycles;
        document.getElementById('lastCycleTime').textContent = 
            lastCycleTime > 0 ? `${lastCycleTime.toFixed(1)}秒` : `${cycleTime}秒`;
    }

    /**
     * 更新预览
     */
    updatePreview() {
        if (this.controlPoints.length < 2) {
            alert('请至少添加2个控制点才能预览训练效果');
            return;
        }
        
        this.drawPreview();
    }

    /**
     * 绘制预览图
     */
    drawPreview() {
        const ctx = this.previewCtx;
        const canvas = this.previewCanvas;
        const totalDuration = parseFloat(document.getElementById('totalDuration').value) || 10;
        const cycleTime = parseFloat(document.getElementById('cycleTime').value) || 30;
        const emgMin = parseFloat(document.getElementById('emgMin').value);
        const emgMax = parseFloat(document.getElementById('emgMax').value);
        
        const totalSeconds = totalDuration * 60;
        
        // 清空画布
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // 绘制坐标轴
        this.drawPreviewAxes(ctx, canvas, totalSeconds, emgMin, emgMax);
        
        // 绘制预览波形
        this.drawPreviewWaveform(ctx, canvas, totalSeconds, cycleTime, emgMin, emgMax);
    }

    /**
     * 绘制预览坐标轴
     */
    drawPreviewAxes(ctx, canvas, totalSeconds, emgMin, emgMax) {
        ctx.strokeStyle = '#333';
        ctx.lineWidth = 2;
        
        // X轴
        ctx.beginPath();
        ctx.moveTo(60, canvas.height - 40);
        ctx.lineTo(canvas.width - 60, canvas.height - 40);
        ctx.stroke();
        
        // Y轴
        ctx.beginPath();
        ctx.moveTo(60, 40);
        ctx.lineTo(60, canvas.height - 40);
        ctx.stroke();
        
        // X轴标签（时间）
        ctx.fillStyle = '#666';
        ctx.font = '12px Arial';
        ctx.textAlign = 'center';
        
        const xSteps = 10;
        for (let i = 0; i <= xSteps; i++) {
            const x = 60 + (canvas.width - 120) * i / xSteps;
            const time = totalSeconds * i / xSteps;
            
            ctx.strokeStyle = '#999';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(x, canvas.height - 40);
            ctx.lineTo(x, canvas.height - 35);
            ctx.stroke();
            
            ctx.fillText(`${(time / 60).toFixed(1)}m`, x, canvas.height - 20);
        }
        
        // Y轴标签（肌电值）
        ctx.textAlign = 'right';
        const ySteps = 5;
        for (let i = 0; i <= ySteps; i++) {
            const y = 40 + (canvas.height - 80) * i / ySteps;
            const value = emgMax - (emgMax - emgMin) * i / ySteps;
            
            ctx.strokeStyle = '#999';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(60, y);
            ctx.lineTo(65, y);
            ctx.stroke();
            
            ctx.fillText(value.toFixed(0), 55, y + 4);
        }
    }

    /**
     * 绘制预览波形
     */
    drawPreviewWaveform(ctx, canvas, totalSeconds, cycleTime, emgMin, emgMax) {
        ctx.strokeStyle = '#667eea';
        ctx.lineWidth = 2;
        
        const completeCycles = Math.floor(totalSeconds / cycleTime);
        const lastCycleTime = totalSeconds % cycleTime;
        
        // 绘制完整循环
        for (let cycle = 0; cycle < completeCycles; cycle++) {
            this.drawSingleCycleInPreview(ctx, canvas, cycle * cycleTime, cycleTime, totalSeconds, emgMin, emgMax);
        }
        
        // 绘制最后不完整的循环
        if (lastCycleTime > 0) {
            this.drawSingleCycleInPreview(ctx, canvas, completeCycles * cycleTime, lastCycleTime, totalSeconds, emgMin, emgMax);
        }
    }

    /**
     * 在预览中绘制单个循环
     */
    drawSingleCycleInPreview(ctx, canvas, startTime, duration, totalSeconds, emgMin, emgMax) {
        const points = this.interpolatePoints(duration, emgMin, emgMax);
        
        ctx.beginPath();
        points.forEach((point, index) => {
            const globalTime = startTime + point.time;
            const x = 60 + (canvas.width - 120) * globalTime / totalSeconds;
            const y = 40 + (canvas.height - 80) * (emgMax - point.value) / (emgMax - emgMin);
            
            if (index === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        });
        ctx.stroke();
    }

    /**
     * 重置波形
     */
    resetWaveform() {
        this.controlPoints = [
            { time: 0, value: 0 },
            { time: 15, value: 50 },
            { time: 30, value: 0 }
        ];
        this.updateWaveform();
        this.updateControlPointsList();
    }

    /**
     * 清空波形
     */
    clearWaveform() {
        this.controlPoints = [];
        this.updateWaveform();
        this.updateControlPointsList();
    }

    /**
     * 导出波形数据
     */
    exportWaveform() {
        const config = this.getConfigData();
        const dataStr = JSON.stringify(config, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        
        const link = document.createElement('a');
        link.href = URL.createObjectURL(dataBlob);
        link.download = `kegel_training_${config.basicInfo.courseName}_${new Date().getTime()}.json`;
        link.click();
    }

    /**
     * 获取配置数据
     */
    getConfigData() {
        return {
            basicInfo: {
                trainingType: document.getElementById('trainingType').value,
                courseName: document.getElementById('courseName').value,
                category: document.getElementById('category').value,
                indications: document.getElementById('indications').value,
                overview: document.getElementById('overview').value,
                version: document.getElementById('version').value,
                updater: document.getElementById('updater').value,
                updateTime: document.getElementById('updateTime').value
            },
            waveformConfig: {
                totalDuration: parseFloat(document.getElementById('totalDuration').value),
                cycleTime: parseFloat(document.getElementById('cycleTime').value),
                emgRange: {
                    min: parseFloat(document.getElementById('emgMin').value),
                    max: parseFloat(document.getElementById('emgMax').value)
                },
                controlPoints: [...this.controlPoints]
            },
            previewInfo: {
                totalCycles: parseInt(document.getElementById('totalCycles').textContent),
                completeCycles: parseInt(document.getElementById('completeCycles').textContent),
                lastCycleTime: document.getElementById('lastCycleTime').textContent
            }
        };
    }
}

// 全局变量
let kegelConfig;

// 全局函数
function goBack() {
    window.history.back();
}

function toggleAddPointMode() {
    const btn = document.getElementById('addPointBtn');
    kegelConfig.isAddingPoint = !kegelConfig.isAddingPoint;
    kegelConfig.isDeletingPoint = false;
    
    btn.classList.toggle('active', kegelConfig.isAddingPoint);
    document.getElementById('deletePointBtn').classList.remove('active');
    
    kegelConfig.waveformCanvas.style.cursor = kegelConfig.isAddingPoint ? 'crosshair' : 'default';
}

function toggleDeletePointMode() {
    const btn = document.getElementById('deletePointBtn');
    kegelConfig.isDeletingPoint = !kegelConfig.isDeletingPoint;
    kegelConfig.isAddingPoint = false;
    
    btn.classList.toggle('active', kegelConfig.isDeletingPoint);
    document.getElementById('addPointBtn').classList.remove('active');
    
    kegelConfig.waveformCanvas.style.cursor = kegelConfig.isDeletingPoint ? 'pointer' : 'default';
}

function clearWaveform() {
    if (confirm('确定要清空所有控制点吗？')) {
        kegelConfig.clearWaveform();
    }
}

function resetWaveform() {
    if (confirm('确定要重置为默认波形吗？')) {
        kegelConfig.resetWaveform();
    }
}

function generateWaveform() {
    kegelConfig.updateWaveform();
}

function updatePreview() {
    kegelConfig.updatePreview();
}

function exportWaveform() {
    kegelConfig.exportWaveform();
}

function closePointModal() {
    document.getElementById('pointModal').style.display = 'none';
    kegelConfig.editingPointIndex = -1;
}

function saveControlPoint() {
    const time = parseFloat(document.getElementById('pointTime').value);
    const value = parseFloat(document.getElementById('pointValue').value);
    const cycleTime = parseFloat(document.getElementById('cycleTime').value);
    const emgMin = parseFloat(document.getElementById('emgMin').value);
    const emgMax = parseFloat(document.getElementById('emgMax').value);
    
    if (isNaN(time) || isNaN(value)) {
        alert('请输入有效的数值');
        return;
    }
    
    if (time < 0 || time > cycleTime) {
        alert(`时间必须在 0 到 ${cycleTime} 秒之间`);
        return;
    }
    
    if (value < emgMin || value > emgMax) {
        alert(`肌电值必须在 ${emgMin} 到 ${emgMax} μV之间`);
        return;
    }
    
    if (kegelConfig.editingPointIndex >= 0) {
        // 编辑现有点
        kegelConfig.controlPoints[kegelConfig.editingPointIndex] = { time, value };
        kegelConfig.controlPoints.sort((a, b) => a.time - b.time);
    } else {
        // 添加新点
        kegelConfig.addControlPoint(time, value);
    }
    
    closePointModal();
}

function saveConfig() {
    const config = kegelConfig.getConfigData();
    
    // 验证配置
    if (!config.basicInfo.courseName.trim()) {
        alert('请输入课程名称');
        return;
    }
    
    if (config.waveformConfig.controlPoints.length < 2) {
        alert('请至少添加2个控制点');
        return;
    }
    
    // 模拟保存
    console.log('保存配置:', config);
    alert('配置保存成功！');
}

function previewConfig() {
    if (kegelConfig.controlPoints.length < 2) {
        alert('请至少添加2个控制点才能预览');
        return;
    }
    
    kegelConfig.updatePreview();
    
    // 滚动到预览区域
    document.querySelector('.preview-section').scrollIntoView({ 
        behavior: 'smooth' 
    });
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', function() {
    kegelConfig = new KegelTrainingConfig();
});