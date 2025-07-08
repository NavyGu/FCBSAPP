// 电刺激配置管理JavaScript
class ElectricalStimulationConfig {
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
                text: "训练开始，请放松身体，准备进行电刺激训练",
                type: "instruction"
            },
            {
                time: 2,
                text: "电刺激开始，请感受肌肉收缩",
                type: "instruction"
            },
            {
                time: 4,
                text: "很好，继续保持",
                type: "encouragement"
            },
            {
                time: 6,
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
            'riseTime', 'fallTime', 'frequency', 'pulseWidth'
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
    }
    
    loadCourseInfo() {
        // 从URL参数获取课程信息
        const urlParams = new URLSearchParams(window.location.search);
        const courseName = urlParams.get('courseName') || '电刺激训练课程';
        const trainingType = urlParams.get('trainingType') || '电刺激';
        const category = urlParams.get('category') || '电刺激';
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
                datasets: [{
                    label: '电刺激强度',
                    data: [],
                    borderColor: '#3b82f6',
                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
                    borderWidth: 2,
                    fill: true,
                    tension: 0.1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: true,
                        text: '电刺激脉冲波形图（多循环预览）',
                        font: {
                            size: 16,
                            weight: 'bold'
                        }
                    },
                    legend: {
                        display: true,
                        position: 'top'
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
                        title: {
                            display: true,
                            text: '刺激强度 (%)'
                        },
                        min: 0,
                        max: 100,
                        grid: {
                            color: 'rgba(0, 0, 0, 0.1)'
                        }
                    }
                },
                elements: {
                    point: {
                        radius: 0
                    }
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
        const isVariableFreq = document.getElementById('variableFreq').checked;
        
        // 生成3个完整循环的波形数据
        const cycles = 3;
        const totalTime = cycles * cycleTime;
        const timeStep = 0.1; // 0.1秒间隔
        const dataPoints = Math.floor(totalTime / timeStep);
        
        const labels = [];
        const data = [];
        
        for (let i = 0; i <= dataPoints; i++) {
            const currentTime = i * timeStep;
            const cyclePosition = currentTime % cycleTime;
            
            labels.push(currentTime.toFixed(1));
            
            let intensity = 0;
            
            if (cyclePosition <= workTime) {
                // 工作阶段
                if (cyclePosition <= riseTime) {
                    // 上升阶段
                    intensity = (cyclePosition / riseTime) * 100;
                } else if (cyclePosition >= workTime - fallTime) {
                    // 下降阶段
                    const fallProgress = (cyclePosition - (workTime - fallTime)) / fallTime;
                    intensity = (1 - fallProgress) * 100;
                } else {
                    // 平台阶段
                    intensity = 100;
                    
                    // 如果启用变频，添加频率变化效果
                    if (isVariableFreq) {
                        const freq1 = parseInt(document.getElementById('freq1').value) || 30;
                        const freq2 = parseInt(document.getElementById('freq2').value) || 80;
                        
                        // 简单的频率变化模拟
                        const freqVariation = Math.sin(cyclePosition * 2) * 10;
                        intensity += freqVariation;
                    }
                }
            } else {
                // 休息阶段
                intensity = 0;
            }
            
            data.push(Math.max(0, Math.min(100, intensity)));
        }
        
        // 更新图表数据
        this.waveformChart.data.labels = labels;
        this.waveformChart.data.datasets[0].data = data;
        
        // 添加区域标注
        this.addWaveformAnnotations();
        
        this.waveformChart.update();
        this.updateCycleCount();
    }
    
    addWaveformAnnotations() {
        // 这里可以添加更复杂的区域标注逻辑
        // 由于Chart.js的annotation插件需要额外引入，这里简化处理
    }
    
    // 语音提示管理
    renderVoicePrompts() {
        const container = document.getElementById('voicePrompts');
        
        if (this.voicePrompts.length === 0) {
            container.innerHTML = `
                <div class="empty-voice-prompts">
                    <i class="fas fa-volume-up"></i>
                    <p>暂无语音提示，点击上方按钮添加</p>
                </div>
            `;
            return;
        }
        
        // 按时间排序
        this.voicePrompts.sort((a, b) => a.time - b.time);
        
        container.innerHTML = this.voicePrompts.map((prompt, index) => `
            <div class="voice-prompt-item">
                <div class="voice-prompt-info">
                    <div class="voice-prompt-time">第 ${prompt.time} 秒</div>
                    <div class="voice-prompt-text">${prompt.text}</div>
                    <div class="voice-prompt-type">${this.getVoiceTypeText(prompt.type)}</div>
                </div>
                <div class="voice-prompt-actions">
                    <button class="voice-action-btn play-btn" onclick="configManager.playVoicePrompt(${index})" title="试听">
                        <i class="fas fa-play"></i>
                    </button>
                    <button class="voice-action-btn edit-btn" onclick="configManager.editVoicePrompt(${index})" title="编辑">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="voice-action-btn delete-btn" onclick="configManager.deleteVoicePrompt(${index})" title="删除">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `).join('');
    }
    
    getVoiceTypeText(type) {
        const typeMap = {
            'instruction': '指导提示',
            'encouragement': '鼓励提示',
            'warning': '注意提示',
            'countdown': '倒计时提示'
        };
        return typeMap[type] || '其他';
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
        
        // 使用Web Speech API播放语音（如果浏览器支持）
        if ('speechSynthesis' in window) {
            const utterance = new SpeechSynthesisUtterance(prompt.text);
            utterance.lang = 'zh-CN';
            utterance.rate = 0.8;
            speechSynthesis.speak(utterance);
        } else {
            alert(`语音内容：${prompt.text}`);
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
        
        const cycleTime = parseInt(document.getElementById('cycleTime').value) || 10;
        if (time >= cycleTime) {
            alert(`触发时间不能超过单次循环时间（${cycleTime}秒）`);
            return;
        }
        
        const promptData = { time, text, type };
        
        if (this.editingVoiceIndex === -1) {
            // 添加新提示
            this.voicePrompts.push(promptData);
        } else {
            // 编辑现有提示
            this.voicePrompts[this.editingVoiceIndex] = promptData;
        }
        
        this.renderVoicePrompts();
        this.closeVoiceModal();
    }
    
    closeVoiceModal() {
        document.getElementById('voiceModal').style.display = 'none';
    }
    
    // 配置保存和预览
    saveConfig() {
        const config = this.getConfigData();
        
        // 这里可以发送到服务器保存
        console.log('保存配置:', config);
        
        // 模拟保存成功
        alert('配置保存成功！');
    }
    
    previewConfig() {
        const config = this.getConfigData();
        
        // 这里可以启动预览模式
        console.log('预览配置:', config);
        
        alert('预览功能开发中...');
    }
    
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
            parameters: {
                totalDuration: parseInt(document.getElementById('totalDuration').value),
                voltageMin: parseInt(document.getElementById('voltageMin').value),
                voltageMax: parseInt(document.getElementById('voltageMax').value),
                cycleTime: parseInt(document.getElementById('cycleTime').value),
                frequency: parseInt(document.getElementById('frequency').value),
                pulseWidth: parseInt(document.getElementById('pulseWidth').value),
                workTime: parseInt(document.getElementById('workTime').value),
                restTime: parseInt(document.getElementById('restTime').value),
                riseTime: parseFloat(document.getElementById('riseTime').value),
                fallTime: parseFloat(document.getElementById('fallTime').value),
                variableFreq: document.getElementById('variableFreq').checked,
                freq1: parseInt(document.getElementById('freq1').value),
                pulse1: parseInt(document.getElementById('pulse1').value),
                freq2: parseInt(document.getElementById('freq2').value),
                pulse2: parseInt(document.getElementById('pulse2').value)
            },
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

// 初始化
let configManager;
document.addEventListener('DOMContentLoaded', function() {
    configManager = new ElectricalStimulationConfig();
});