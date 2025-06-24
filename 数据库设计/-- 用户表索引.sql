-- 用户表索引
CREATE INDEX idx_users_phone ON users(phone);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_type_status ON users(user_type, status);

-- 设备表索引
CREATE INDEX idx_devices_type_status ON devices(device_type, status);
CREATE INDEX idx_devices_serial ON devices(serial_number);

-- 训练记录表索引
CREATE INDEX idx_training_records_user_date ON training_records(user_id, training_date);
CREATE INDEX idx_training_records_device_date ON training_records(device_id, training_date);
CREATE INDEX idx_training_records_plan ON training_records(training_plan_id);

-- 课节表索引
CREATE INDEX idx_course_sessions_type ON course_sessions(training_type);
CREATE INDEX idx_course_sessions_category ON course_sessions(category);
CREATE INDEX idx_course_sessions_status ON course_sessions(status);