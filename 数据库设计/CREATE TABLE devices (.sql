CREATE TABLE devices (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '设备ID',
    device_code VARCHAR(100) UNIQUE NOT NULL COMMENT '设备编码',
    device_name VARCHAR(100) NOT NULL COMMENT '设备名称',
    device_type ENUM('pelvic_floor', 'hair_growth', 'sleep_aid') NOT NULL COMMENT '设备类型',
    model VARCHAR(50) COMMENT '设备型号',
    manufacturer VARCHAR(100) COMMENT '制造商',
    serial_number VARCHAR(100) UNIQUE COMMENT '序列号',
    firmware_version VARCHAR(20) COMMENT '固件版本',
    hardware_version VARCHAR(20) COMMENT '硬件版本',
    mac_address VARCHAR(17) COMMENT 'MAC地址',
    bluetooth_name VARCHAR(50) COMMENT '蓝牙名称',
    production_date DATE COMMENT '生产日期',
    warranty_period INT COMMENT '保修期(月)',
    status ENUM('active', 'idle', 'maintenance', 'offline', 'retired') DEFAULT 'idle' COMMENT '设备状态',
    last_online_time DATETIME COMMENT '最后在线时间',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间'
) COMMENT='设备表';