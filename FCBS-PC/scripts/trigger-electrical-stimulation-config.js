// 触发电刺激配置管理JavaScript
class TriggerElectricalStimulationConfig {
    constructor() {
        this.voicePrompts = [];
        this.editingVoiceIndex = -1;
        this.waveformChart = null;
        
        this.initializePage();
        this.bindEvents();
        this.initializeWaveform();
        this.loadCourseInfo();
    }
    
    initializePage() {
        // 初始化默认语音提示
        this.voicePrompts = [
            {
                time: 0,
                text: "触发电刺激训练开始，请放松身体，准备进行智能训练",
                type: "instruction"
            },
            {
                time: 2,
                text: "请开始收缩肌肉，系统将检测您的收缩强度",
                type: "instruction"
            },
            {
                time: 4,
                text: "检测到收缩信号，电刺激已触发",
                type: "trigger"
            },
            {
                time: 6,
                text: "很好，继续保持这个强度",
                type: "encouragement"
            },
            {
                time: 8,
                text: "休息阶段，请放松肌肉",
                type: "instruction"
            }
        ];
        
        this.renderVoicePrompts();
        this.updateWaveform();
    }
    
    bindEvents() {
        // 参数变化时更新波形图
        const paramInputs = [
            'totalDuration', 'cycleTime', 'workTime', 'restTime', 
            'riseTime', 'fallTime', 'frequency', 'pulseWidth',
            'triggerThreshold', 'triggerDelay', 'minTriggerInterval',
            'triggerDuration', 'maxTriggerCount'
        ];
        
        paramInputs.forEach(id => {
            const element = document.getElementById(id);
            if (element) {
                element.addEventListener('input', () => {
                    this.updateWaveform();
                    this.updateCycleCount();
                });
            }
        });
        
        // 变频参数变化
        const variableFreqInputs = ['freq1', 'pulse1', 'freq2', 'pulse2'];
        variableFreqInputs.forEach(id => {
            const element = document.getElementById(id);
            if (element) {
                element.addEventListener('input', () => {
                    this.updateWaveform();
                });
            }
        });
        
        // 触发敏感度变化
        const triggerSensitivity = document.getElementById('triggerSensitivity');
        if (triggerSensitivity) {
            triggerSensitivity.addEventListener('change', () => {
                this.updateWaveform();
            });
        }
    }
    
    loadCourseInfo() {
        // 从URL参数获取课程信息
        const urlParams = new URLSearchParams(window.location.search);
        const courseName = urlParams.get('courseName') || '触发电刺激训练课程';
        const trainingType = urlParams.get('trainingType') || '触发电刺激';
        const category = urlParams.get('category') || '触发电刺激';
        const duration = urlParams.get('duration') || '10分钟';
        const version = urlParams.get('version') || 'v1.0.0';
        
        // 更新页面显示
        document.getElementById('courseInfo').textContent = 
            `${courseName} | ${trainingType} | ${category} | ${duration}`;
        
        // 填充表单
        document.getElementById('trainingType').value = trainingType;
        document.getElementById('courseName').value = courseName;
        document.getElementById('category').value = category;
        document.getElementById('version').value = version;
        document.getElementById('updateTime').value = new Date().toLocaleString('zh-CN');
    }
    
    switchTab(tabName) {
        // 切换标签页
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.remove('active');
        });
        
        document.querySelector(`[onclick="switchTab('${tabName}')"]`).classList.add('active');
        document.getElementById(tabName + 'Tab').classList.add('active');
    }
    
    toggleVariableFreq() {
        const checkbox = document.getElementById('variableFreq');
        const params = document.getElementById('variableFreqParams');
        
        if (checkbox.checked) {
            params.style.display = 'grid';
        } else {
            params.style.display = 'none';
        }
        
        this.updateWaveform();
    }
    
    toggleAdaptiveTrigger() {
        const checkbox = document.getElementById('adaptiveTrigger');
        const params = document.getElementById('adaptiveTriggerParams');
        
        if (checkbox.checked) {
            params.style.display = 'grid';
        } else {
            params.style.display = 'none';
        }
        
        this.updateWaveform();
    }
    
    toggleTriggerMode() {
        const triggerMode = document.getElementById('triggerMode').value;
        const manualGroup = document.getElementById('manualThresholdGroup');
        const autoGroup = document.getElementById('autoThresholdGroup');
        
        if (triggerMode === 'manual') {
            manualGroup.style.display = 'block';
            autoGroup.style.display = 'none';
        } else {
            manualGroup.style.display = 'none';
            autoGroup.style.display = 'block';
            // 模拟自动计算阈值
            const autoValue = Math.floor(Math.random() * 50) + 30; // 30-80μV
            document.getElementById('autoThresholdValue').textContent = autoValue;
        }
        
        this.updateWaveform();
    }
    
    updateCycleCount() {
        const totalDuration = parseInt(document.getElementById('totalDuration').value) || 10;
        const cycleTime = parseInt(document.getElementById('cycleTime').value) || 10;
        const totalCycles = Math.floor((totalDuration * 60) / cycleTime);
        
        document.getElementById('totalCycles').textContent = totalCycles;
    }
    
    initializeWaveform() {
        const ctx = document.getElementById('waveformChart').getContext('2d');
        
        this.waveformChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: [],
                datasets: [
                    {
                        label: '工作时间窗口',
                        data: [],
                        borderColor: '#3b82f6',
                        backgroundColor: 'rgba(59, 130, 246, 0.1)',
                        borderWidth: 2,
                        fill: false,
                        tension: 0.1,
                        pointRadius: 0
                    },
                    {
                        label: '触发电刺激',
                        data: [],
                        borderColor: '#f59e0b',
                        backgroundColor: 'rgba(245, 158, 11, 0.2)',
                        borderWidth: 3,
                        fill: true,
                        tension: 0.1,
                        pointRadius: 0
                    },
                    {
                        label: '肌电基线',
                        data: [],
                        borderColor: '#10b981',
                        backgroundColor: 'rgba(16, 185, 129, 0.1)',
                        borderWidth: 1,
                        fill: false,
                        tension: 0,
                        pointRadius: 0,
                        borderDash: [2, 2],
                        yAxisID: 'y1'
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: true,
                        text: '触发电刺激配置预览（肌电基线与阈值设置）',
                        font: {
                            size: 16,
                            weight: 'bold'
                        }
                    },
                    legend: {
                        display: true,
                        position: 'top'
                    },
                    tooltip: {
                        mode: 'index',
                        intersect: false,
                        callbacks: {
                            label: function(context) {
                                let label = context.dataset.label || '';
                                if (label) {
                                    label += ': ';
                                }
                                if (context.parsed.y !== null) {
                                    if (context.datasetIndex === 2) {
                                        label += context.parsed.y.toFixed(1) + 'μV';
                                    } else if (context.datasetIndex === 0) {
                                        label += context.parsed.y.toFixed(1) + 'mA';
                                    } else {
                                        label += context.parsed.y.toFixed(2) + 'mA';
                                    }
                                }
                                return label;
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        title: {
                            display: true,
                            text: '时间 (秒)'
                        },
                        grid: {
                            color: 'rgba(0, 0, 0, 0.1)'
                        }
                    },
                    y: {
                        type: 'linear',
                        display: true,
                        position: 'left',
                        title: {
                            display: true,
                            text: '电流强度 (mA)'
                        },
                        min: 0,
                        max: 5,
                        grid: {
                            color: 'rgba(0, 0, 0, 0.1)'
                        }
                    },
                    y1: {
                        type: 'linear',
                        display: true,
                        position: 'right',
                        title: {
                            display: true,
                            text: '肌电值 (μV)'
                        },
                        min: 0,
                        max: 100,
                        grid: {
                            drawOnChartArea: false,
                            color: 'rgba(16, 185, 129, 0.2)'
                        }
                    }
                },
                elements: {
                    point: {
                        radius: 0
                    }
                },
                interaction: {
                    mode: 'nearest',
                    axis: 'x',
                    intersect: false
                }
            }
        });
    }
    
    updateWaveform() {
        if (!this.waveformChart) return;
        
        const cycleTime = parseInt(document.getElementById('cycleTime').value) || 10;
        const workTime = parseInt(document.getElementById('workTime').value) || 4;
        const restTime = parseInt(document.getElementById('restTime').value) || 6;
        const riseTime = parseFloat(document.getElementById('riseTime').value) || 1;
        const fallTime = parseFloat(document.getElementById('fallTime').value) || 1;
        const triggerMode = document.getElementById('triggerMode').value;
        let triggerThreshold;
        if (triggerMode === 'auto') {
            triggerThreshold = parseInt(document.getElementById('autoThresholdValue').textContent) || 45;
        } else {
            triggerThreshold = parseInt(document.getElementById('triggerThreshold').value) || 50;
        }
        const triggerCondition = document.getElementById('triggerCondition').value;
        const triggerDuration = parseFloat(document.getElementById('triggerDuration').value) || 2;
        const minTriggerInterval = parseFloat(document.getElementById('minTriggerInterval').value) || 1;
        
        // 生成多个循环的数据
        const cyclesToShow = 3; // 显示3个循环
        const timeStep = 0.1; // 时间步长
        const totalTime = cyclesToShow * cycleTime;
        const timePoints = [];
        const workWindowData = [];
        const triggerData = [];
        const detectionData = [];
        
        for (let t = 0; t <= totalTime; t += timeStep) {
            timePoints.push(t.toFixed(1));
            
            const cyclePosition = t % cycleTime;
            let workWindow = 0;
            let triggerStimulation = 0;
            let detectionSignal = 0;
            const currentMax = parseFloat(document.getElementById('currentMax').value) || 3;
            
            // 工作时间窗口
            if (cyclePosition <= workTime) {
                workWindow = 5; // 改为5mA表示工作窗口
                
                // 显示肌电基线（基于用户设置的阈值显示合理的基线值）
                // 基线应该显示在阈值的70-80%左右，表示正常的肌电活动水平
                const baselineLevel = triggerThreshold * 0.75; // 基线设置为阈值的75%
                detectionSignal = baselineLevel; // 显示基线值，等待实际肌电信号输入
                
                // 实际应用中，这里应该从设备获取真实肌电信号
                // 当前仅用于演示触发阈值基线
                
                // 触发电刺激逻辑（仅在实际信号达到阈值时触发）
                // 在实际应用中，shouldTrigger 应该基于真实的肌电信号判断
                let shouldTrigger = false; // 默认不触发，等待实际信号
                
                if (false) { // 暂时禁用自动触发，等待实际肌电信号
                    // 检查是否满足最小触发间隔
                    const lastTriggerTime = this.getLastTriggerTime(t, triggerData, timeStep);
                    if (lastTriggerTime === -1 || (t - lastTriggerTime) >= minTriggerInterval) {
                        // 生成触发电刺激波形
                        const triggerStartTime = cyclePosition;
                        const triggerEndTime = Math.min(triggerStartTime + triggerDuration, workTime);
                        
                        if (cyclePosition >= triggerStartTime && cyclePosition <= triggerEndTime) {
                            const triggerProgress = (cyclePosition - triggerStartTime) / triggerDuration;
                            
                            if (triggerProgress <= riseTime / triggerDuration) {
                                // 上升阶段
                                triggerStimulation = (triggerProgress / (riseTime / triggerDuration)) * currentMax;
                            } else if (triggerProgress >= 1 - (fallTime / triggerDuration)) {
                                // 下降阶段
                                const fallProgress = (triggerProgress - (1 - fallTime / triggerDuration)) / (fallTime / triggerDuration);
                                triggerStimulation = currentMax * (1 - fallProgress);
                            } else {
                                // 平台阶段
                                triggerStimulation = currentMax;
                            }
                        }
                    }
                }
            } else {
                // 休息时间
                workWindow = 0;
                // 休息时间也显示基线值，保持连续性
                const baselineLevel = triggerThreshold * 0.75;
                detectionSignal = baselineLevel;
                triggerStimulation = 0;
            }
            
            workWindowData.push(workWindow);
            triggerData.push(triggerStimulation);
            detectionData.push(detectionSignal);
        }
        
        // 更新图表数据
        this.waveformChart.data.labels = timePoints;
        this.waveformChart.data.datasets[0].data = workWindowData;
        this.waveformChart.data.datasets[1].data = triggerData;
        this.waveformChart.data.datasets[2].data = detectionData;
        
        this.waveformChart.update('none');
        
        // 添加触发阈值线
        this.addTriggerThresholdLine();
    }
    
    getLastTriggerTime(currentTime, triggerData, timeStep) {
        // 查找最近一次触发的时间
        for (let i = triggerData.length - 1; i >= 0; i--) {
            if (triggerData[i] > 0) {
                return i * timeStep;
            }
        }
        return -1;
    }
    
    // 模拟肌电信号输入（用于演示触发功能）
    simulateEMGSignal(currentTime) {
        // 在实际应用中，这里应该从硬件设备获取真实肌电信号
        // 当前仅用于演示目的，可以通过按钮或其他方式手动触发
        return 0; // 返回基线值，等待实际信号输入
    }
    
    // 演示肌电信号触发
    triggerEMGDemo() {
        const triggerMode = document.getElementById('triggerMode').value;
        let triggerThreshold;
        if (triggerMode === 'auto') {
            triggerThreshold = parseInt(document.getElementById('autoThresholdValue').textContent) || 45;
        } else {
            triggerThreshold = parseInt(document.getElementById('triggerThreshold').value) || 50;
        }
        
        // 更新状态显示
        document.getElementById('emgStatus').textContent = `肌电信号: ${triggerThreshold + 10}μV (已触发)`;
        
        // 这里可以添加实际的触发逻辑
        console.log('肌电信号触发演示:', {
            threshold: triggerThreshold,
            currentSignal: triggerThreshold + 10
        });
        
        // 3秒后重置状态
        setTimeout(() => {
            document.getElementById('emgStatus').textContent = '等待肌电信号输入';
        }, 3000);
    }
    
    // 重置演示
    resetEMGDemo() {
        document.getElementById('emgStatus').textContent = '等待肌电信号输入';
        console.log('肌电信号演示已重置');
    }
    
    addTriggerThresholdLine() {
        const triggerMode = document.getElementById('triggerMode').value;
        let triggerThreshold;
        if (triggerMode === 'auto') {
            triggerThreshold = parseInt(document.getElementById('autoThresholdValue').textContent) || 45;
        } else {
            triggerThreshold = parseInt(document.getElementById('triggerThreshold').value) || 50;
        }
        
        // 添加肌电触发阈值参考线
        if (this.waveformChart.options.plugins.annotation) {
            this.waveformChart.options.plugins.annotation.annotations = {
                thresholdLine: {
                    type: 'line',
                    yMin: triggerThreshold,
                    yMax: triggerThreshold,
                    yScaleID: 'y1',
                    borderColor: '#ef4444',
                    borderWidth: 2,
                    borderDash: [10, 5],
                    label: {
                        content: `肌电阈值: ${triggerThreshold}μV`,
                        enabled: true,
                        position: 'end'
                    }
                }
            };
        }
    }
    
    renderVoicePrompts() {
        const container = document.getElementById('voicePrompts');
        container.innerHTML = '';
        
        if (this.voicePrompts.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-volume-mute"></i>
                    <p>暂无语音提示，点击上方按钮添加</p>
                </div>
            `;
            return;
        }
        
        this.voicePrompts.forEach((prompt, index) => {
            const promptElement = document.createElement('div');
            promptElement.className = 'voice-prompt-item';
            promptElement.innerHTML = `
                <div class="voice-time">${prompt.time}s</div>
                <div class="voice-content">
                    <p class="voice-text">${prompt.text}</p>
                    <p class="voice-type">${this.getVoiceTypeText(prompt.type)}</p>
                </div>
                <div class="voice-actions">
                    <button class="voice-action-btn play-btn" onclick="configManager.playVoicePrompt(${index})" title="播放">
                        <i class="fas fa-play"></i>
                    </button>
                    <button class="voice-action-btn edit-btn" onclick="configManager.editVoicePrompt(${index})" title="编辑">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="voice-action-btn delete-btn" onclick="configManager.deleteVoicePrompt(${index})" title="删除">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            `;
            container.appendChild(promptElement);
        });
    }
    
    getVoiceTypeText(type) {
        const typeMap = {
            'instruction': '指导提示',
            'encouragement': '鼓励提示',
            'warning': '注意提示',
            'countdown': '倒计时提示',
            'trigger': '触发提示'
        };
        return typeMap[type] || '未知类型';
    }
    
    addVoicePrompt() {
        this.editingVoiceIndex = -1;
        document.getElementById('voiceModalTitle').textContent = '添加语音提示';
        document.getElementById('voiceTime').value = '';
        document.getElementById('voiceText').value = '';
        document.getElementById('voiceType').value = 'instruction';
        document.getElementById('voiceModal').style.display = 'flex';
    }
    
    editVoicePrompt(index) {
        this.editingVoiceIndex = index;
        const prompt = this.voicePrompts[index];
        
        document.getElementById('voiceModalTitle').textContent = '编辑语音提示';
        document.getElementById('voiceTime').value = prompt.time;
        document.getElementById('voiceText').value = prompt.text;
        document.getElementById('voiceType').value = prompt.type;
        document.getElementById('voiceModal').style.display = 'flex';
    }
    
    deleteVoicePrompt(index) {
        if (confirm('确定要删除这个语音提示吗？')) {
            this.voicePrompts.splice(index, 1);
            this.renderVoicePrompts();
        }
    }
    
    playVoicePrompt(index) {
        const prompt = this.voicePrompts[index];
        
        // 使用Web Speech API播放语音
        if ('speechSynthesis' in window) {
            const utterance = new SpeechSynthesisUtterance(prompt.text);
            utterance.lang = 'zh-CN';
            utterance.rate = 0.9;
            utterance.pitch = 1;
            speechSynthesis.speak(utterance);
        } else {
            alert('您的浏览器不支持语音播放功能');
        }
    }
    
    saveVoicePrompt() {
        const time = parseFloat(document.getElementById('voiceTime').value);
        const text = document.getElementById('voiceText').value.trim();
        const type = document.getElementById('voiceType').value;
        
        if (isNaN(time) || time < 0) {
            alert('请输入有效的触发时间');
            return;
        }
        
        if (!text) {
            alert('请输入语音内容');
            return;
        }
        
        const prompt = { time, text, type };
        
        if (this.editingVoiceIndex >= 0) {
            this.voicePrompts[this.editingVoiceIndex] = prompt;
        } else {
            this.voicePrompts.push(prompt);
        }
        
        // 按时间排序
        this.voicePrompts.sort((a, b) => a.time - b.time);
        
        this.renderVoicePrompts();
        this.closeVoiceModal();
    }
    
    closeVoiceModal() {
        document.getElementById('voiceModal').style.display = 'none';
    }
    
    saveConfig() {
        const config = this.getConfigData();
        
        // 这里应该发送到后端保存
        console.log('保存触发电刺激配置:', config);
        
        // 模拟保存成功
        alert('配置保存成功！');
    }
    
    previewConfig() {
        const config = this.getConfigData();
        
        // 这里可以打开预览窗口或跳转到预览页面
        console.log('预览触发电刺激配置:', config);
        
        alert('预览功能开发中...');
    }
    
    getConfigData() {
        return {
            // 基本信息
            trainingType: document.getElementById('trainingType').value,
            courseName: document.getElementById('courseName').value,
            category: document.getElementById('category').value,
            indications: document.getElementById('indications').value,
            overview: document.getElementById('overview').value,
            version: document.getElementById('version').value,
            updater: document.getElementById('updater').value,
            updateTime: document.getElementById('updateTime').value,
            
            // 基础参数
            totalDuration: parseInt(document.getElementById('totalDuration').value),
            currentMin: parseFloat(document.getElementById('currentMin').value),
            currentMax: parseFloat(document.getElementById('currentMax').value),
            userAdjustableCurrent: document.getElementById('userAdjustableCurrent').checked,
            cycleTime: parseInt(document.getElementById('cycleTime').value),
            frequency: parseInt(document.getElementById('frequency').value),
            pulseWidth: parseInt(document.getElementById('pulseWidth').value),
            workTime: parseInt(document.getElementById('workTime').value),
            restTime: parseInt(document.getElementById('restTime').value),
            riseTime: parseFloat(document.getElementById('riseTime').value),
            fallTime: parseFloat(document.getElementById('fallTime').value),
            
            // 触发参数
            triggerMode: document.getElementById('triggerMode').value,
            triggerCondition: document.getElementById('triggerCondition').value,
            triggerThreshold: document.getElementById('triggerMode').value === 'auto' ? 
                parseInt(document.getElementById('autoThresholdValue').textContent) : 
                parseInt(document.getElementById('triggerThreshold').value),
            triggerDelay: parseInt(document.getElementById('triggerDelay').value),
            minTriggerInterval: parseFloat(document.getElementById('minTriggerInterval').value),
            triggerDuration: parseFloat(document.getElementById('triggerDuration').value),
            triggerSensitivity: document.getElementById('triggerSensitivity').value,
            maxTriggerCount: parseInt(document.getElementById('maxTriggerCount').value),
            
            // 高级参数
            variableFreq: document.getElementById('variableFreq').checked,
            freq1: parseInt(document.getElementById('freq1').value),
            pulse1: parseInt(document.getElementById('pulse1').value),
            freq2: parseInt(document.getElementById('freq2').value),
            pulse2: parseInt(document.getElementById('pulse2').value),
            adaptiveTrigger: document.getElementById('adaptiveTrigger').checked,
            learningCycles: parseInt(document.getElementById('learningCycles').value),
            adjustmentRange: parseInt(document.getElementById('adjustmentRange').value),
            
            // 语音提示
            voicePrompts: this.voicePrompts
        };
    }
}

// 全局函数
function goBack() {
    window.history.back();
}

function switchTab(tabName) {
    configManager.switchTab(tabName);
}

function toggleVariableFreq() {
    configManager.toggleVariableFreq();
}

function toggleAdaptiveTrigger() {
    configManager.toggleAdaptiveTrigger();
}

function toggleTriggerMode() {
    configManager.toggleTriggerMode();
}

function updateWaveform() {
    configManager.updateWaveform();
}

function addVoicePrompt() {
    configManager.addVoicePrompt();
}

function closeVoiceModal() {
    configManager.closeVoiceModal();
}

function saveVoicePrompt() {
    configManager.saveVoicePrompt();
}

function saveConfig() {
    configManager.saveConfig();
}

function previewConfig() {
    configManager.previewConfig();
}

function simulateEMGTrigger() {
    configManager.triggerEMGDemo();
}

function resetEMGDemo() {
    configManager.resetEMGDemo();
}

// 初始化
let configManager;
document.addEventListener('DOMContentLoaded', function() {
    configManager = new TriggerElectricalStimulationConfig();
});

// 点击模态框外部关闭
document.addEventListener('click', function(event) {
    const modal = document.getElementById('voiceModal');
    if (event.target === modal) {
        configManager.closeVoiceModal();
    }
});