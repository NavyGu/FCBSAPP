CREATE TABLE user_device_bindings (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '绑定ID',
    user_id BIGINT NOT NULL COMMENT '用户ID',
    device_id BIGINT NOT NULL COMMENT '设备ID',
    binding_code VARCHAR(50) COMMENT '绑定码',
    binding_time DATETIME NOT NULL COMMENT '绑定时间',
    unbinding_time DATETIME COMMENT '解绑时间',
    status ENUM('active', 'inactive') DEFAULT 'active' COMMENT '绑定状态',
    is_primary BOOLEAN DEFAULT FALSE COMMENT '是否为主设备',
    device_alias VARCHAR(50) COMMENT '设备别名',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (device_id) REFERENCES devices(id) ON DELETE CASCADE,
    UNIQUE KEY uk_user_device (user_id, device_id)
) COMMENT='用户设备绑定关系表';