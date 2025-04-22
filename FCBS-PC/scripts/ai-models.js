// AI模型配置页面的JavaScript代码
document.addEventListener('DOMContentLoaded', function() {
    // 初始化jsPlumb实例
    const jsPlumbInstance = jsPlumb.getInstance({
        Endpoint: ["Dot", { radius: 2 }],
        Connector: ["Bezier", { curviness: 50 }],
        HoverPaintStyle: { stroke: "#1e40af", strokeWidth: 2 },
        ConnectionOverlays: [
            ["Arrow", { 
                location: 1,
                width: 10,
                length: 10,
                foldback: 0.8
            }]
        ],
        Container: "workflow-canvas"
    });
    
    // 设置默认连接样式
    jsPlumbInstance.registerConnectionType("default", {
        anchor: ["Right", "Left"],
        connector: ["Bezier", { curviness: 50 }],
        paintStyle: { stroke: "#6b7280", strokeWidth: 2 },
        hoverPaintStyle: { stroke: "#1e40af", strokeWidth: 3 }
    });
    
    // 初始化画布
    initCanvas(jsPlumbInstance);
    
    // 初始化拖拽功能
    initDragAndDrop(jsPlumbInstance);
    
    // 初始化节点操作
    initNodeOperations(jsPlumbInstance);
    
    // 初始化属性面板
    initPropertiesPanel();
    
    // 初始化模态框
    initModals();
    
    // 初始化工作流操作
    initWorkflowOperations(jsPlumbInstance);
});

// 初始化画布
function initCanvas(jsPlumbInstance) {
    // 使画布可拖动
    const canvas = document.getElementById('workflow-canvas');
    let isDragging = false;
    let startX, startY, scrollLeft, scrollTop;
    
    canvas.addEventListener('mousedown', function(e) {
        // 只有当点击的是画布本身，而不是节点时才允许拖动
        if (e.target === canvas) {
            isDragging = true;
            canvas.style.cursor = 'grabbing';
            startX = e.pageX - canvas.offsetLeft;
            startY = e.pageY - canvas.offsetTop;
            scrollLeft = canvas.scrollLeft;
            scrollTop = canvas.scrollTop;
        }
    });
    
    canvas.addEventListener('mouseleave', function() {
        isDragging = false;
        canvas.style.cursor = 'default';
    });
    
    canvas.addEventListener('mouseup', function() {
        isDragging = false;
        canvas.style.cursor = 'default';
    });
    
    canvas.addEventListener('mousemove', function(e) {
        if (!isDragging) return;
        e.preventDefault();
        const x = e.pageX - canvas.offsetLeft;
        const y = e.pageY - canvas.offsetTop;
        const walkX = (x - startX) * 1;
        const walkY = (y - startY) * 1;
        canvas.scrollLeft = scrollLeft - walkX;
        canvas.scrollTop = scrollTop - walkY;
    });
    
    // 初始化现有节点的连接
    initExistingConnections(jsPlumbInstance);
}

// 初始化现有节点的连接
function initExistingConnections(jsPlumbInstance) {
    // 为每个输出端口添加端点
    document.querySelectorAll('.output-port').forEach(port => {
        jsPlumbInstance.addEndpoint(port, {
            anchor: "Center",
            isSource: true,
            isTarget: false,
            connectionType: "default",
            maxConnections: -1
        });
    });
    
    // 为每个输入端口添加端点
    document.querySelectorAll('.input-port').forEach(port => {
        jsPlumbInstance.addEndpoint(port, {
            anchor: "Center",
            isSource: false,
            isTarget: true,
            connectionType: "default",
            maxConnections: 1
        });
    });
    
    // 创建示例连接
    jsPlumbInstance.connect({
        source: document.querySelector('#node-1 .output-port'),
        target: document.querySelector('#node-2 .input-port'),
        type: "default"
    });
    
    jsPlumbInstance.connect({
        source: document.querySelector('#node-2 .output-port'),
        target: document.querySelector('#node-3 .input-port'),
        type: "default"
    });
    
    jsPlumbInstance.connect({
        source: document.querySelector('#node-3 .output-port'),
        target: document.querySelector('#node-4 .input-port'),
        type: "default"
    });
    
    // 使节点可拖动
    jsPlumbInstance.draggable(document.querySelectorAll('.workflow-node'), {
        grid: [10, 10],
        containment: 'parent',
        stop: function(event) {
            // 拖动结束后重新绘制连接
            jsPlumbInstance.repaintEverything();
        }
    });
}

// 初始化拖拽功能
function initDragAndDrop(jsPlumbInstance) {
    const nodeTypes = document.querySelectorAll('.node-type');
    const canvas = document.getElementById('workflow-canvas');
    
    nodeTypes.forEach(nodeType => {
        nodeType.addEventListener('dragstart', function(e) {
            e.dataTransfer.setData('nodeType', this.getAttribute('data-node-type'));
        });
    });
    
    canvas.addEventListener('dragover', function(e) {
        e.preventDefault();
    });
    
    canvas.addEventListener('drop', function(e) {
        e.preventDefault();
        const nodeType = e.dataTransfer.getData('nodeType');
        if (nodeType) {
            // 获取相对于画布的位置
            const rect = canvas.getBoundingClientRect();
            const x = e.clientX - rect.left + canvas.scrollLeft;
            const y = e.clientY - rect.top + canvas.scrollTop;
            
            // 创建新节点
            createNewNode(nodeType, x, y, jsPlumbInstance);
        }
    });
}

// 创建新节点
function createNewNode(nodeType, x, y, jsPlumbInstance) {
    // 生成唯一ID
    const nodeId = 'node-' + Date.now();
    
    // 根据节点类型设置标题和图标
    let nodeTitle, nodeIcon, nodeDescription;
    
    switch(nodeType) {
        case 'input':
            nodeTitle = '用户输入';
            nodeIcon = 'fa-sign-in-alt';
            nodeDescription = '接收用户的问题或指令';
            break;
        case 'prompt':
            nodeTitle = '提示词模板';
            nodeIcon = 'fa-comment-alt';
            nodeDescription = '添加系统提示词和上下文';
            break;
        case 'llm':
            nodeTitle = 'GPT-4';
            nodeIcon = 'fa-brain';
            nodeDescription = '处理输入并生成回复';
            break;
        case 'condition':
            nodeTitle = '条件判断';
            nodeIcon = 'fa-code-branch';
            nodeDescription = '根据条件选择不同的处理路径';
            break;
        case 'output':
            nodeTitle = '回复用户';
            nodeIcon = 'fa-sign-out-alt';
            nodeDescription = '将处理结果返回给用户';
            break;
        default:
            nodeTitle = '未知节点';
            nodeIcon = 'fa-question';
            nodeDescription = '未定义的节点类型';
    }
    
    // 创建节点HTML
    const nodeHTML = `
        <div class="workflow-node ${nodeType}-node" id="${nodeId}" data-node-type="${nodeType}" style="left: ${x}px; top: ${y}px;">
            <div class="node-header">
                <div class="node-icon">
                    <i class="fas ${nodeIcon}"></i>
                </div>
                <div class="node-title">${nodeTitle}</div>
                <div class="node-actions">
                    <button class="node-action-btn" data-action="edit">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="node-action-btn" data-action="delete">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
            <div class="node-body">
                <p class="node-description">${nodeDescription}</p>
                ${nodeType === 'llm' ? `
                <div class="node-settings">
                    <div class="setting-item">
                        <span class="setting-label">温度:</span>
                        <span class="setting-value">0.7</span>
                    </div>
                    <div class="setting-item">
                        <span class="setting-label">最大长度:</span>
                        <span class="setting-value">2000</span>
                    </div>
                </div>
                ` : ''}
            </div>
            <div class="node-footer">
                <div class="node-ports">
                    ${nodeType !== 'input' ? `<div class="node-port input-port" data-port-id="input-${nodeId}" data-port-type="input"></div>` : ''}
                    ${nodeType !== 'output' ? `<div class="node-port output-port" data-port-id="output-${nodeId}" data-port-type="output"></div>` : ''}
                </div>
            </div>
        </div>
    `;
    
    // 添加节点到画布
    canvas.insertAdjacentHTML('beforeend', nodeHTML);
    
    // 获取新创建的节点
    const newNode = document.getElementById(nodeId);
    
    // 使节点可拖动
    jsPlumbInstance.draggable(newNode, {
        grid: [10, 10],
        containment: 'parent',
        stop: function(event) {
            // 拖动结束后重新绘制连接
            jsPlumbInstance.repaintEverything();
        }
    });
    
    // 为节点添加端点
    if (nodeType !== 'input') {
        jsPlumbInstance.addEndpoint(newNode.querySelector('.input-port'), {
            anchor: "Center",
            isSource: false,
            isTarget: true,
            connectionType: "default",
            maxConnections: 1
        });
    }
    
    if (nodeType !== 'output') {
        jsPlumbInstance.addEndpoint(newNode.querySelector('.output-port'), {
            anchor: "Center",
            isSource: true,
            isTarget: false,
            connectionType: "default",
            maxConnections: -1
        });
    }
    
    // 添加节点操作事件
    addNodeEventListeners(newNode, jsPlumbInstance);
}

// 为节点添加事件监听器
function addNodeEventListeners(node, jsPlumbInstance) {
    // 编辑按钮点击事件
    node.querySelector('[data-action="edit"]').addEventListener('click', function() {
        openNodeEditModal(node);
    });
    
    // 删除按钮点击事件
    node.querySelector('[data-action="delete"]').addEventListener('click', function() {
        if (confirm('确定要删除此节点吗？')) {
            // 删除与此节点相关的所有连接
            jsPlumbInstance.removeAllEndpoints(node);
            // 删除节点
            node.remove();
        }
    });
    
    // 节点点击事件，显示属性面板
    node.addEventListener('click', function(e) {
        // 防止事件冒泡到画布
        e.stopPropagation();
        // 显示属性面板
        showPropertiesPanel(node);
    });
}

// 初始化节点操作
function initNodeOperations(jsPlumbInstance) {
    // 为现有节点添加事件监听器
    document.querySelectorAll('.workflow-node').forEach(node => {
        addNodeEventListeners(node, jsPlumbInstance);
    });
}

// 显示属性面板
function showPropertiesPanel(node) {
    const propertiesPanel = document.getElementById('properties-panel');
    const nodeType = node.getAttribute('data-node-type');
    
    // 设置节点名称和描述
    document.getElementById('node-name').value = node.querySelector('.node-title').textContent;
    document.getElementById('node-description').value = node.querySelector('.node-description').textContent;
    
    // 根据节点类型显示不同的属性设置
    document.getElementById('llm-properties').style.display = nodeType === 'llm' ? 'block' : 'none';
    document.getElementById('prompt-properties').style.display = nodeType === 'prompt' ? 'block' : 'none';
    document.getElementById('condition-properties').style.display = nodeType === 'condition' ? 'block' : 'none';
    
    // 存储当前编辑的节点ID
    propertiesPanel.setAttribute('data-editing-node', node.id);
    
    // 显示属性面板
    propertiesPanel.style.display = 'flex';
}

// 初始化属性面板
function initPropertiesPanel() {
    const propertiesPanel = document.getElementById('properties-panel');
    const closeBtn = propertiesPanel.querySelector('.properties-close-btn');
    const applyBtn = propertiesPanel.querySelector('.apply-btn');
    const cancelBtn = propertiesPanel.querySelector('.cancel-btn');
    
    // 关闭按钮点击事件
    closeBtn.addEventListener('click', function() {
        propertiesPanel.style.display = 'none';
    });
    
    // 应用按钮点击事件
    applyBtn.addEventListener('click', function() {
        const nodeId = propertiesPanel.getAttribute('data-editing-node');
        const node = document.getElementById(nodeId);
        
        if (node) {
            // 更新节点名称和描述
            node.querySelector('.node-title').textContent = document.getElementById('node-name').value;
            node.querySelector('.node-description').textContent = document.getElementById('node-description').value;
            
            // 根据节点类型更新特定属性
            const nodeType = node.getAttribute('data-node-type');
            
            if (nodeType === 'llm') {
                // 更新LLM节点的设置
                const temperatureValue = document.getElementById('temperature-slider').value;
                const maxLengthValue = document.getElementById('max-length').value;
                
                const settingsContainer = node.querySelector('.node-settings');
                if (settingsContainer) {
                    settingsContainer.innerHTML = `
                        <div class="setting-item">
                            <span class="setting-label">温度:</span>
                            <span class="setting-value">${temperatureValue}</span>
                        </div>
                        <div class="setting-item">
                            <span class="setting-label">最大长度:</span>
                            <span class="setting-value">${maxLengthValue}</span>
                        </div>
                    `;
                }
            }
        }
        
        // 关闭属性面板
        propertiesPanel.style.display = 'none';
    });
    
    // 取消按钮点击事件
    cancelBtn.addEventListener('click', function() {
        propertiesPanel.style.display = 'none';
    });
    
    // 温度滑块值变化事件
    const temperatureSlider = document.getElementById('temperature-slider');
    const temperatureValue = document.getElementById('temperature-value');
    
    temperatureSlider.addEventListener('input', function() {
        temperatureValue.textContent = this.value;
    });
    
    // Top P滑块值变化事件
    const topPSlider = document.getElementById('top-p-slider');
    const topPValue = document.getElementById('top-p-value');
    
    topPSlider.addEventListener('input', function() {
        topPValue.textContent = this.value;
    });
}

// 打开节点编辑模态框
function openNodeEditModal(node) {
    const modal = document.getElementById('node-edit-modal');
    const modalBody = modal.querySelector('.modal-body');
    const nodeType = node.getAttribute('data-node-type');
    
    // 根据节点类型生成不同的编辑表单
    let formHTML = '';
    
    switch(nodeType) {
        case 'input':
            formHTML = `
                <div class="property-field">
                    <label class="property-label">节点名称</label>
                    <input type="text" class="property-input" id="modal-node-name" value="${node.querySelector('.node-title').textContent}">
                </div>
                <div class="property-field">
                    <label class="property-label">节点描述</label>
                    <textarea class="property-textarea" id="modal-node-description">${node.querySelector('.node-description').textContent}</textarea>
                </div>
            `;
            break;
        case 'prompt':
            formHTML = `
                <div class="property-field">
                    <label class="property-label">节点名称</label>
                    <input type="text" class="property-input" id="modal-node-name" value="${node.querySelector('.node-title').textContent}">
                </div>
                <div class="property-field">
                    <label class="property-label">节点描述</label>
                    <textarea class="property-textarea" id="modal-node-description">${node.querySelector('.node-description').textContent}</textarea>
                </div>
                <div class="property-field">
                    <label class="property-label">系统提示词</label>
                    <textarea class="property-textarea" id="modal-system-prompt" rows="5">你是一个专业的医疗助手，专注于帮助用户解决健康问题。请提供准确、有帮助的信息，但不要给出诊断或替代专业医疗建议。</textarea>
                </div>
            `;
            break;
        case 'llm':
            formHTML = `
                <div class="property-field">
                    <label class="property-label">节点名称</label>
                    <input type="text" class="property-input" id="modal-node-name" value="${node.querySelector('.node-title').textContent}">
                </div>
                <div class="property-field">
                    <label class="property-label">节点描述</label>
                    <textarea class="property-textarea" id="modal-node-description">${node.querySelector('.node-description').textContent}</textarea>
                </div>
                <div class="property-field">
                    <label class="property-label">选择模型</label>
                    <select class="property-select" id="modal-model-select">
                        <option value="gpt-4">GPT-4</option>
                        <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
                        <option value="claude-3">Claude 3</option>
                        <option value="gemini-pro">Gemini Pro</option>
                        <option value="qwen">Qwen</option>
                    </select>
                </div>
                <div class="property-field">
                    <label class="property-label">温度 (0-2)</label>
                    <div class="property-slider-container">
                        <input type="range" min="0" max="2" step="0.1" value="0.7" class="property-slider" id="modal-temperature-slider">
                        <span class="property-slider-value" id="modal-temperature-value">0.7</span>
                    </div>
                </div>
                <div class="property-field">
                    <label class="property-label">最大长度</label>
                    <input type="number" class="property-input" id="modal-max-length" value="2000">
                </div>
            `;
            break;
        case 'condition':
            formHTML = `
                <div class="property-field">
                    <label class="property-label">节点名称</label>
                    <input type="text" class="property-input" id="modal-node-name" value="${node.querySelector('.node-title').textContent}">
                </div>
                <div class="property-field">
                    <label class="property-label">节点描述</label>
                    <textarea class="property-textarea" id="modal-node-description">${node.querySelector('.node-description').textContent}</textarea>
                </div>
                <div class="property-field">
                    <label class="property-label">条件类型</label>
                    <select class="property-select" id="modal-condition-type">
                        <option value="keyword">关键词匹配</option>
                        <option value="sentiment">情感分析</option>
                        <option value="intent">意图识别</option>
                        <option value="custom">自定义函数</option>
                    </select>
                </div>
                <div class="property-field" id="modal-keyword-condition">
                    <label class="property-label">关键词列表</label>
                    <textarea class="property-textarea" id="modal-keywords" rows="3">疼痛,不适,副作用,问题,帮助</textarea>
                </div>
            `;
            break;
        case 'output':
            formHTML = `
                <div class="property-field">
                    <label class="property-label">节点名称</label>
                    <input type="text" class="property-input" id="modal-node-name" value="${node.querySelector('.node-title').textContent}">
                </div>
                <div class="property-field">
                    <label class="property-label">节点描述</label>
                    <textarea class="property-textarea" id="modal-node-description">${node.querySelector('.node-description').textContent}</textarea>
                </div>
                <div class="property-field">
                    <label class="property-label">输出格式</label>
                    <select class="property-select" id="modal-output-format">
                        <option value="text">纯文本</option>
                        <option value="markdown">Markdown</option>
                        <option value="html">HTML</option>
                        <option value="json">JSON</option>
                    </select>
                </div>
            `;
            break;
        default:
            formHTML = `
                <div class="property-field">
                    <label class="property-label">节点名称</label>
                    <input type="text" class="property-input" id="modal-node-name" value="${node.querySelector('.node-title').textContent}">
                </div>
                <div class="property-field">
                    <label class="property-label">节点描述</label>
                    <textarea class="property-textarea" id="modal-node-description">${node.querySelector('.node-description').textContent}</textarea>
                </div>
            `;
    }
    
    // 设置模态框内容
    modalBody.innerHTML = formHTML;
    
    // 存储当前编辑的节点ID
    modal.setAttribute('data-editing-node', node.id);
    
    // 显示模态框
    modal.style.display = 'flex';
    
    // 为温度滑块添加事件监听器
    const temperatureSlider = document.getElementById('modal-temperature-slider');
    if (temperatureSlider) {
        const temperatureValue = document.getElementById('modal-temperature-value');
        temperatureSlider.addEventListener('input', function() {
            temperatureValue.textContent = this.value;
        });
    }
}

// 初始化模态框
function initModals() {
    // 节点编辑模态框
    const nodeEditModal = document.getElementById('node-edit-modal');
    const nodeEditCloseBtn = nodeEditModal.querySelector('.modal-close-btn');
    const nodeEditCancelBtn = nodeEditModal.querySelector('.cancel-btn');
    const nodeEditSaveBtn = nodeEditModal.querySelector('.save-btn');
    
    // 关闭按钮点击事件
    nodeEditCloseBtn.addEventListener('click', function() {
        nodeEditModal.style.display = 'none';
    });
    
    // 取消按钮点击事件
    nodeEditCancelBtn.addEventListener('click', function() {
        nodeEditModal.style.display = 'none';
    });
    
    // 保存按钮点击事件
    nodeEditSaveBtn.addEventListener('click', function() {
        const nodeId = nodeEditModal.getAttribute('data-editing-node');
        const node = document.getElementById(nodeId);
        
        if (node) {
            // 更新节点名称和描述
            node.querySelector('.node-title').textContent = document.getElementById('modal-node-name').value;
            node.querySelector('.node-description').textContent = document.getElementById('modal-node-description').value;
            
            // 根据节点类型更新特定属性
            const nodeType = node.getAttribute('data-node-type');
            
            if (nodeType === 'llm') {
                // 更新LLM节点的设置
                const modelSelect = document.getElementById('modal-model-select');
                const temperatureValue = document.getElementById('modal-temperature-slider').value;
                const maxLengthValue = document.getElementById('modal-max-length').value;
                
                // 更新节点标题为选择的模型名称
                if (modelSelect) {
                    node.querySelector('.node-title').textContent = modelSelect.options[modelSelect.selectedIndex].text;
                }
                
                const settingsContainer = node.querySelector('.node-settings');
                if (settingsContainer) {
                    settingsContainer.innerHTML = `
                        <div class="setting-item">
                            <span class="setting-label">温度:</span>
                            <span class="setting-value">${temperatureValue}</span>
                        </div>
                        <div class="setting-item">
                            <span class="setting-label">最大长度:</span>
                            <span class="setting-value">${maxLengthValue}</span>
                        </div>
                    `;
                }
            }
        }
        
        // 关闭模态框
        nodeEditModal.style.display = 'none';
    });
    
    // 新建工作流模态框
    const newWorkflowModal = document.getElementById('new-workflow-modal');
    const newWorkflowCloseBtn = newWorkflowModal.querySelector('.modal-close-btn');
    const newWorkflowCancelBtn = newWorkflowModal.querySelector('.cancel-btn');
    const newWorkflowCreateBtn = newWorkflowModal.querySelector('.create-btn');
    
    // 关闭按钮点击事件
    newWorkflowCloseBtn.addEventListener('click', function() {
        newWorkflowModal.style.display = 'none';
    });
    
    // 取消按钮点击事件
    newWorkflowCancelBtn.addEventListener('click', function() {
        newWorkflowModal.style.display = 'none';
    });
    
    // 创建按钮点击事件
    newWorkflowCreateBtn.addEventListener('click', function() {
        const workflowName = document.getElementById('workflow-name').value;
        const workflowDescription = document.getElementById('workflow-description').value;
        const workflowScenario = document.getElementById('workflow-scenario').value;
        
        if (!workflowName) {
            alert('请输入工作流名称');
            return;
        }
        
        // 创建新工作流
        createNewWorkflow(workflowName, workflowDescription, workflowScenario);
        
        // 关闭模态框
        newWorkflowModal.style.display = 'none';
    });
    
    // 点击模态框外部关闭模态框
    window.addEventListener('click', function(e) {
        if (e.target === nodeEditModal) {
            nodeEditModal.style.display = 'none';
        }
        if (e.target === newWorkflowModal) {
            newWorkflowModal.style.display = 'none';
        }
    });
}

// 创建新工作流
function createNewWorkflow(name, description, scenario) {
    // 清空画布
    const canvas = document.getElementById('workflow-canvas');
    canvas.innerHTML = '';
    
    // 更新工作流选择器
    const workflowSelect = document.getElementById('workflow-select');
    const option = document.createElement('option');
    option.value = name.toLowerCase().replace(/\s+/g, '-');
    option.textContent = name;
    option.selected = true;
    workflowSelect.appendChild(option);
    
    // 创建默认的输入和输出节点
    const jsPlumbInstance = jsPlumb.getInstance({
        Endpoint: ["Dot", { radius: 2 }],
        Connector: ["Bezier", { curviness: 50 }],
        HoverPaintStyle: { stroke: "#1e40af", strokeWidth: 2 },
        ConnectionOverlays: [
            ["Arrow", { 
                location: 1,
                width: 10,
                length: 10,
                foldback: 0.8
            }]
        ],
        Container: "workflow-canvas"
    });
    
    // 创建输入节点
    createNewNode('input', 100, 100, jsPlumbInstance);
    
    // 创建输出节点
    createNewNode('output', 700, 100, jsPlumbInstance);
    
    // 显示成功消息
    alert(`工作流 "${name}" 创建成功！`);
}

// 初始化工作流操作
function initWorkflowOperations(jsPlumbInstance) {
    // 新建工作流按钮点击事件
    const newWorkflowBtn = document.getElementById('new-workflow-btn');
    newWorkflowBtn.addEventListener('click', function() {
        document.getElementById('new-workflow-modal').style.display = 'flex';
    });
    
    // 保存工作流按钮点击事件
    const saveWorkflowBtn = document.getElementById('save-workflow-btn');
    saveWorkflowBtn.addEventListener('click', function() {
        saveWorkflow(jsPlumbInstance);
    });
    
    // 部署工作流按钮点击事件
    const deployWorkflowBtn = document.getElementById('deploy-workflow-btn');
    deployWorkflowBtn.addEventListener('click', function() {
        deployWorkflow(jsPlumbInstance);
    });
    
    // 工作流选择器变化事件
    const workflowSelect = document.getElementById('workflow-select');
    workflowSelect.addEventListener('change', function() {
        loadWorkflow(this.value, jsPlumbInstance);
    });
}

// 保存工作流
function saveWorkflow(jsPlumbInstance) {
    // 获取当前工作流名称
    const workflowSelect = document.getElementById('workflow-select');
    const workflowName = workflowSelect.options[workflowSelect.selectedIndex].text;
    
    // 获取所有节点
    const nodes = [];
    document.querySelectorAll('.workflow-node').forEach(node => {
        const nodeData = {
            id: node.id,
            type: node.getAttribute('data-node-type'),
            title: node.querySelector('.node-title').textContent,
            description: node.querySelector('.node-description').textContent,
            position: {
                left: parseInt(node.style.left),
                top: parseInt(node.style.top)
            }
        };
        
        // 根据节点类型添加特定属性
        if (node.getAttribute('data-node-type') === 'llm') {
            const settings = node.querySelectorAll('.setting-item');
            nodeData.settings = {};
            
            settings.forEach(setting => {
                const label = setting.querySelector('.setting-label').textContent.replace(':', '').trim();
                const value = setting.querySelector('.setting-value').textContent.trim();
                nodeData.settings[label] = value;
            });
        }
        
        nodes.push(nodeData);
    });
    
    // 获取所有连接
    const connections = [];
    jsPlumbInstance.getAllConnections().forEach(conn => {
        connections.push({
            source: conn.source.parentNode.parentNode.id,
            target: conn.target.parentNode.parentNode.id,
            sourcePort: conn.source.getAttribute('data-port-id'),
            targetPort: conn.target.getAttribute('data-port-id')
        });
    });
    
    // 构建工作流数据
    const workflowData = {
        name: workflowName,
        nodes: nodes,
        connections: connections
    };
    
    // 在实际应用中，这里应该将数据发送到后端保存
    console.log('保存工作流:', workflowData);
    
    // 显示成功消息
    alert(`工作流 "${workflowName}" 保存成功！`);
}

// 部署工作流
function deployWorkflow(jsPlumbInstance) {
    // 获取当前工作流名称
    const workflowSelect = document.getElementById('workflow-select');
    const workflowName = workflowSelect.options[workflowSelect.selectedIndex].text;
    
    // 在实际应用中，这里应该将工作流部署到生产环境
    console.log('部署工作流:', workflowName);
    
    // 显示成功消息
    alert(`工作流 "${workflowName}" 部署成功！`);
}

// 加载工作流
function loadWorkflow(workflowId, jsPlumbInstance) {
    // 在实际应用中，这里应该从后端获取工作流数据
    console.log('加载工作流:', workflowId);
    
    // 清空画布
    const canvas = document.getElementById('workflow-canvas');
    canvas.innerHTML = '';
    
    // 根据工作流ID加载不同的示例工作流
    switch(workflowId) {
        case 'default':
            // 创建默认工作流
            createDefaultWorkflow(jsPlumbInstance);
            break;
        case 'pelvic':
            // 创建盆底康复助手工作流
            createPelvicWorkflow(jsPlumbInstance);
            break;
        case 'hair':
            // 创建生发治疗助手工作流
            createHairWorkflow(jsPlumbInstance);
            break;
        case 'sleep':
            // 创建睡眠改善助手工作流
            createSleepWorkflow(jsPlumbInstance);
            break;
        default:
            // 创建空白工作流
            createEmptyWorkflow(jsPlumbInstance);
    }
}

// 创建默认工作流
function createDefaultWorkflow(jsPlumbInstance) {
    // 创建输入节点
    createNewNode('input', 100, 100, jsPlumbInstance);
    
    // 创建提示词节点
    createNewNode('prompt', 300, 100, jsPlumbInstance);
    
    // 创建LLM节点
    createNewNode('llm', 600, 100, jsPlumbInstance);
    
    // 创建输出节点
    createNewNode('output', 900, 100, jsPlumbInstance);
    
    // 等待节点创建完成后添加连接
    setTimeout(() => {
        // 获取所有节点
        const nodes = document.querySelectorAll('.workflow-node');
        
        // 添加连接
        if (nodes.length >= 4) {
            jsPlumbInstance.connect({
                source: nodes[0].querySelector('.output-port'),
                target: nodes[1].querySelector('.input-port'),
                type: "default"
            });
            
            jsPlumbInstance.connect({
                source: nodes[1].querySelector('.output-port'),
                target: nodes[2].querySelector('.input-port'),
                type: "default"
            });
            
            jsPlumbInstance.connect({
                source: nodes[2].querySelector('.output-port'),
                target: nodes[3].querySelector('.input-port'),
                type: "default"
            });
        }
    }, 100);
}

// 创建盆底康复助手工作流
function createPelvicWorkflow(jsPlumbInstance) {
    // 创建输入节点
    createNewNode('input', 100, 100, jsPlumbInstance);
    
    // 创建提示词节点
    const promptNode = document.createElement('div');
    promptNode.className = 'workflow-node prompt-node';
    promptNode.id = 'node-prompt-' + Date.now();
    promptNode.setAttribute('data-node-type', 'prompt');
    promptNode.style.left = '300px';
    promptNode.style.top = '100px';
    
    promptNode.innerHTML = `
        <div class="node-header">
            <div class="node-icon">
                <i class="fas fa-comment-alt"></i>
            </div>
            <div class="node-title">盆底康复专家</div>
            <div class="node-actions">
                <button class="node-action-btn" data-action="edit">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="node-action-btn" data-action="delete">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        </div>
        <div class="node-body">
            <p class="node-description">盆底康复专业知识和建议</p>
        </div>
        <div class="node-footer">
            <div class="node-ports">
                <div class="node-port input-port" data-port-id="input-prompt" data-port-type="input"></div>
                <div class="node-port output-port" data-port-id="output-prompt" data-port-type="output"></div>
            </div>
        </div>
    `;
    
    document.getElementById('workflow-canvas').appendChild(promptNode);
    
    // 创建条件节点
    createNewNode('condition', 300, 250, jsPlumbInstance);
    
    // 创建LLM节点
    const llmNode = document.createElement('div');
    llmNode.className = 'workflow-node llm-node';
    llmNode.id = 'node-llm-' + Date.now();
    llmNode.setAttribute('data-node-type', 'llm');
    llmNode.style.left = '600px';
    llmNode.style.top = '100px';
    
    llmNode.innerHTML = `
        <div class="node-header">
            <div class="node-icon">
                <i class="fas fa-brain"></i>
            </div>
            <div class="node-title">GPT-4</div>
            <div class="node-actions">
                <button class="node-action-btn" data-action="edit">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="node-action-btn" data-action="delete">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        </div>
        <div class="node-body">
            <p class="node-description">处理盆底康复相关问题</p>
            <div class="node-settings">
                <div class="setting-item">
                    <span class="setting-label">温度:</span>
                    <span class="setting-value">0.5</span>
                </div>
                <div class="setting-item">
                    <span class="setting-label">最大长度:</span>
                    <span class="setting-value">2500</span>
                </div>
            </div>
        </div>
        <div class="node-footer">
            <div class="node-ports">
                <div class="node-port input-port" data-port-id="input-llm" data-port-type="input"></div>
                <div class="node-port output-port" data-port-id="output-llm" data-port-type="output"></div>
            </div>
        </div>
    `;
    
    document.getElementById('workflow-canvas').appendChild(llmNode);
    
    // 创建输出节点
    createNewNode('output', 900, 100, jsPlumbInstance);
    
    // 使节点可拖动并添加事件监听器
    setTimeout(() => {
        jsPlumbInstance.draggable(promptNode, {
            grid: [10, 10],
            containment: 'parent',
            stop: function(event) {
                jsPlumbInstance.repaintEverything();
            }
        });
        
        jsPlumbInstance.draggable(llmNode, {
            grid: [10, 10],
            containment: 'parent',
            stop: function(event) {
                jsPlumbInstance.repaintEverything();
            }
        });
        
        // 添加端点
        jsPlumbInstance.addEndpoint(promptNode.querySelector('.input-port'), {
            anchor: "Center",
            isSource: false,
            isTarget: true,
            connectionType: "default",
            maxConnections: 1
        });
        
        jsPlumbInstance.addEndpoint(promptNode.querySelector('.output-port'), {
            anchor: "Center",
            isSource: true,
            isTarget: false,
            connectionType: "default",
            maxConnections: -1
        });
        
        jsPlumbInstance.addEndpoint(llmNode.querySelector('.input-port'), {
            anchor: "Center",
            isSource: false,
            isTarget: true,
            connectionType: "default",
            maxConnections: 1
        });
        
        jsPlumbInstance.addEndpoint(llmNode.querySelector('.output-port'), {
            anchor: "Center",
            isSource: true,
            isTarget: false,
            connectionType: "default",
            maxConnections: -1
        });
        
        // 添加节点事件监听器
        addNodeEventListeners(promptNode, jsPlumbInstance);
        addNodeEventListeners(llmNode, jsPlumbInstance);
        
        // 获取所有节点
        const nodes = document.querySelectorAll('.workflow-node');
        
        // 添加连接
        if (nodes.length >= 4) {
            jsPlumbInstance.connect({
                source: nodes[0].querySelector('.output-port'),
                target: nodes[1].querySelector('.input-port'),
                type: "default"
            });
            
            jsPlumbInstance.connect({
                source: nodes[1].querySelector('.output-port'),
                target: nodes[3].querySelector('.input-port'),
                type: "default"
            });
            
            jsPlumbInstance.connect({
                source: nodes[3].querySelector('.output-port'),
                target: nodes[4].querySelector('.input-port'),
                type: "default"
            });
        }
    }, 100);
}

// 创建空白工作流
function createEmptyWorkflow(jsPlumbInstance) {
    // 创建输入节点
    createNewNode('input', 100, 100, jsPlumbInstance);
    
    // 创建输出节点
    createNewNode('output', 700, 100, jsPlumbInstance);
}

// 创建生发治疗助手工作流和睡眠改善助手工作流的函数可以类似实现
function createHairWorkflow(jsPlumbInstance) {
    // 简化实现，类似于盆底康复助手工作流
    createDefaultWorkflow(jsPlumbInstance);
}

function createSleepWorkflow(jsPlumbInstance) {
    // 简化实现，类似于盆底康复助手工作流
    createDefaultWorkflow(jsPlumbInstance);
}