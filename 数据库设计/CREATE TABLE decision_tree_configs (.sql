CREATE TABLE decision_tree_configs (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '配置ID',
    config_name VARCHAR(100) NOT NULL COMMENT '配置名称',
    config_type ENUM('user_profile', 'course_generation', 'difficulty_adjustment') NOT NULL COMMENT '配置类型',
    decision_rules JSON NOT NULL COMMENT '决策规则(JSON格式)',
    input_parameters JSON COMMENT '输入参数配置',
    output_mapping JSON COMMENT '输出映射配置',
    priority_level INT DEFAULT 1 COMMENT '优先级',
    version VARCHAR(10) DEFAULT '1.0.0' COMMENT '版本号',
    status ENUM('active', 'inactive', 'testing') DEFAULT 'testing' COMMENT '状态',
    created_by BIGINT COMMENT '创建者ID',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
) COMMENT='决策树配置表';