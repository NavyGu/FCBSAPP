// 训练方案设计JavaScript
class TrainingPlanDesigner {
    constructor() {
        // 删除 stages 数组
        
        this.waveformChart = null;
        this.currentTab = 'simulation';
        
        this.initializeComponents();
        this.bindEvents();
        this.updatePreview();
    }
    
    initializeComponents() {
        // 删除 this.renderStages();
        this.initializeWaveformChart();
        this.updateTimeline();
        this.updateParamsOverview();
    }
    
    bindEvents() {
        // 参数变化监听
    const inputs = document.querySelectorAll('input, select, textarea');
    inputs.forEach(input => {
        input.addEventListener('change', () => this.updatePreview());
        input.addEventListener('input', () => this.updatePreview());
    });
    
    // 滑块同步
    document.getElementById('frequencySlider').addEventListener('input', (e) => {
        document.getElementById('frequency').value = e.target.value;
        this.updatePreview();
    });
    
    document.getElementById('pulseWidthSlider').addEventListener('input', (e) => {
        document.getElementById('pulseWidth').value = e.target.value;
        this.updatePreview();
    });
    
    // 循环周期类型变化监听
    document.getElementById('cycleType').addEventListener('change', (e) => {
        const cycleType = e.target.value;
        const cycleDistributionGroup = document.getElementById('cycleDistributionGroup');
        
        if (cycleType === 'none') {
            cycleDistributionGroup.style.display = 'none';
        } else {
            cycleDistributionGroup.style.display = 'block';
            
            // 如果选择了预设的循环周期，更新相应的值
            if (cycleType === '10') {
                document.getElementById('restPhase').value = 6;
                document.getElementById('workPhase').value = 4;
            } else if (cycleType === '20') {
                document.getElementById('restPhase').value = 12;
                document.getElementById('workPhase').value = 8;
            }
        }
        
        this.updatePreview();
    });
    }
    
    
    initializeWaveformChart() {
        const ctx = document.getElementById('waveformChart').getContext('2d');
        
        // 生成波形数据
        const frequency = parseFloat(document.getElementById('frequency').value) || 50;
        const pulseWidth = parseFloat(document.getElementById('pulseWidth').value) || 250;
        
        const data = this.generateWaveformData(frequency, pulseWidth);
        
        this.waveformChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: data.labels,
                datasets: [{
                    label: '电刺激波形',
                    data: data.values,
                    borderColor: 'rgb(59, 130, 246)',
                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
                    borderWidth: 2,
                    fill: true,
                    tension: 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    x: {
                        title: {
                            display: true,
                            text: '时间 (ms)'
                        }
                    },
                    y: {
                        title: {
                            display: true,
                            text: '强度 (mA)'
                        },
                        min: 0
                    }
                },
                plugins: {
                    legend: {
                        display: false
                    }
                }
            }
        });
    }
    
    generateWaveformData(frequency, pulseWidth) {
        const period = 1000 / frequency; // 周期 (ms)
        const points = 100;
        const labels = [];
        const values = [];
        
        for (let i = 0; i < points; i++) {
            const time = (i / points) * period * 2;
            labels.push(time.toFixed(1));
            
            // 方波生成
            if (time % period < pulseWidth / 1000) {
                values.push(20); // 峰值强度
            } else {
                values.push(0);
            }
        }
        
        return { labels, values };
    }
    
    updateTimeline() {
        const timeline = document.getElementById('trainingTimeline');
        const workTime = parseFloat(document.getElementById('workTime').value) || 4;
        const restTime = parseFloat(document.getElementById('restTime').value) || 6;
        const totalDuration = parseFloat(document.getElementById('totalDuration').value) || 10;
        
        const cycleTime = workTime + restTime;
        const cycles = Math.floor((totalDuration * 60) / cycleTime);
        
        let html = '';
        let currentTime = 0;
        
        for (let i = 0; i < cycles; i++) {
            const workStart = (currentTime / (totalDuration * 60)) * 100;
            const workWidth = (workTime / (totalDuration * 60)) * 100;
            const restStart = ((currentTime + workTime) / (totalDuration * 60)) * 100;
            const restWidth = (restTime / (totalDuration * 60)) * 100;
            
            html += `
                <div class="timeline-segment work" 
                     style="left: ${workStart}%; width: ${workWidth}%;"
                     title="工作 ${workTime}s">
                    工作
                </div>
                <div class="timeline-segment rest" 
                     style="left: ${restStart}%; width: ${restWidth}%;"
                     title="休息 ${restTime}s">
                    休息
                </div>
            `;
            
            currentTime += cycleTime;
        }
        
        timeline.innerHTML = html;
    }
    
    updateParamsOverview() {
        const overview = document.getElementById('paramsOverview');
    
        const cycleType = document.getElementById('cycleType').value;
        let cycleText = '';
        
        if (cycleType === 'none') {
            cycleText = '无循环';
        } else if (cycleType === 'custom') {
            cycleText = '自定义循环';
        } else {
            cycleText = `${cycleType}秒循环`;
        }
        
        const params = [
            { label: '循环周期', value: cycleText },
            { label: '阶段分布', value: `休息${document.getElementById('restPhase').value}秒 / 训练${document.getElementById('workPhase').value}秒` },
            { label: '电流模式', value: document.getElementById('currentMode').value === 'constant' ? '恒定电流' : '变化电流' },
            { label: '频率', value: `${document.getElementById('frequency').value} Hz` },
            { label: '脉宽', value: `${document.getElementById('pulseWidth').value} μs` },
            { label: '强度范围', value: `${document.getElementById('minIntensity').value}-${document.getElementById('maxIntensity').value} mA` },
            { label: '工作/休息', value: `${document.getElementById('workTime').value}s / ${document.getElementById('restTime').value}s` },
            { label: '总时长', value: `${document.getElementById('totalDuration').value} 分钟` }
        ];
        
        overview.innerHTML = params.map(param => `
            <div class="param-row">
                <span class="param-label">${param.label}</span>
                <span class="param-value">${param.value}</span>
            </div>
        `).join('');
    }
    
    updatePreview() {
        if (this.waveformChart) {
            const frequency = parseFloat(document.getElementById('frequency').value) || 50;
            const pulseWidth = parseFloat(document.getElementById('pulseWidth').value) || 250;
            const data = this.generateWaveformData(frequency, pulseWidth);
            
            this.waveformChart.data.labels = data.labels;
            this.waveformChart.data.datasets[0].data = data.values;
            this.waveformChart.update();
        }
        
        this.updateTimeline();
        this.updateParamsOverview();
    }
}

// 全局函数
function toggleSection(button) {
    const content = button.closest('.config-section').querySelector('.section-content');
    const icon = button.querySelector('i');
    
    content.classList.toggle('collapsed');
    button.classList.toggle('collapsed');
}

function updateValue(inputId, value) {
    document.getElementById(inputId).value = value;
    designer.updatePreview();
}

function previewPlan() {
    document.getElementById('previewModal').style.display = 'flex';
    switchTab('simulation');
}

function closePreviewModal() {
    document.getElementById('previewModal').style.display = 'none';
}

function switchTab(tabName) {
    // 更新标签页按钮状态
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');
    
    // 更新内容
    const content = document.getElementById('tabContent');
    
    switch (tabName) {
        case 'simulation':
            content.innerHTML = `
                <div class="simulation-view">
                    <div class="simulation-controls">
                        <button class="action-btn primary-btn" onclick="startSimulation()">
                            <i class="fas fa-play"></i> 开始仿真
                        </button>
                        <button class="action-btn" onclick="pauseSimulation()">
                            <i class="fas fa-pause"></i> 暂停
                        </button>
                        <button class="action-btn" onclick="stopSimulation()">
                            <i class="fas fa-stop"></i> 停止
                        </button>
                    </div>
                    <div class="simulation-display">
                        <canvas id="simulationChart" width="800" height="300"></canvas>
                    </div>
                    <div class="simulation-info">
                        <div class="info-item">
                            <span class="info-label">当前阶段:</span>
                            <span class="info-value" id="currentStage">准备阶段</span>
                        </div>
                        <div class="info-item">
                            <span class="info-label">剩余时间:</span>
                            <span class="info-value" id="remainingTime">10:00</span>
                        </div>
                        <div class="info-item">
                            <span class="info-label">当前强度:</span>
                            <span class="info-value" id="currentIntensity">0 mA</span>
                        </div>
                    </div>
                </div>
            `;
            break;
            
        case 'timeline':
            content.innerHTML = `
                <div class="timeline-view">
                    <div class="timeline-chart">
                        <canvas id="timelineChart" width="800" height="400"></canvas>
                    </div>
                </div>
            `;
            break;
            
        // 在 switchTab 函数中的 parameters 部分
        case 'parameters':
        content.innerHTML = `
        <div class="parameters-view">
            <div class="params-table">
                <table class="table">
                    <thead>
                        <tr>
                            <th>参数</th>
                            <th>当前值</th>
                            <th>建议范围</th>
                            <th>说明</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>频率</td>
                            <td>${document.getElementById('frequency').value} Hz</td>
                            <td>20-100 Hz</td>
                            <td>影响肌肉收缩强度和类型</td>
                        </tr>
                        <tr>
                            <td>脉宽</td>
                            <td>${document.getElementById('pulseWidth').value} μs</td>
                            <td>100-400 μs</td>
                            <td>影响刺激的舒适度</td>
                        </tr>
                        <tr>
                            <td>强度</td>
                            <td>${document.getElementById('minIntensity').value}-${document.getElementById('maxIntensity').value} mA</td>
                            <td>5-30 mA</td>
                            <td>根据患者耐受度调整</td>
                        </tr>
                        <tr>
                            <td>工作时间</td>
                            <td>${document.getElementById('workTime').value} s</td>
                            <td>3-10 s</td>
                            <td>肌肉收缩持续时间</td>
                        </tr>
                        <tr>
                            <td>休息时间</td>
                            <td>${document.getElementById('restTime').value} s</td>
                            <td>5-15 s</td>
                            <td>肌肉恢复时间</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    `;
    break;
    }
}

function startSimulation() {
    console.log('开始仿真训练');
    // 这里可以添加实际的仿真逻辑
}

function pauseSimulation() {
    console.log('暂停仿真');
}

function stopSimulation() {
    console.log('停止仿真');
}

function savePlan() {
    const planData = {
        name: document.getElementById('planName').value,
        type: document.getElementById('trainingType').value,
        category: document.getElementById('planCategory').value,
        duration: document.getElementById('totalDuration').value,
        difficulty: document.getElementById('difficultyLevel').value,
        indications: document.getElementById('indications').value,
        parameters: {
            cycleType: document.getElementById('cycleType').value,
            restPhase: document.getElementById('restPhase').value,
            workPhase: document.getElementById('workPhase').value,
            currentMode: document.getElementById('currentMode').value,
            modulationMode: document.getElementById('modulationMode').value,
            frequency: document.getElementById('frequency').value,
            pulseWidth: document.getElementById('pulseWidth').value,
            minIntensity: document.getElementById('minIntensity').value,
            maxIntensity: document.getElementById('maxIntensity').value,
            userSetIntensity: document.getElementById('userSetIntensity').checked,
            workTime: document.getElementById('workTime').value,
            restTime: document.getElementById('restTime').value,
            waveform: document.getElementById('waveform').value
        },
        safety: {
            autoStop: document.getElementById('autoStop').checked,
            intensityLimit: document.getElementById('intensityLimit').checked,
            maxSafeIntensity: document.getElementById('maxSafeIntensity').value,
            timeoutProtection: document.getElementById('timeoutProtection').value
        },
        version: document.getElementById('planVersion').textContent,
        updateTime: new Date().toISOString()
    };
    
    console.log('保存训练方案:', planData);
    alert('训练方案已保存！');
}

function publishPlan() {
    if (confirm('确定要发布这个训练方案吗？发布后将对所有用户可见。')) {
        console.log('发布训练方案');
        alert('训练方案已发布！');
    }
}

// 初始化
let designer;
document.addEventListener('DOMContentLoaded', function() {
    designer = new TrainingPlanDesigner();
});