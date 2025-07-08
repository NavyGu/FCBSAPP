CREATE TABLE course_plan_sessions (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '关系ID',
    course_plan_id BIGINT NOT NULL COMMENT '课程计划ID',
    session_id BIGINT NOT NULL COMMENT '课节ID',
    session_order INT NOT NULL COMMENT '课节顺序',
    week_number INT COMMENT '所属周数',
    day_of_week INT COMMENT '星期几(1-7)',
    is_mandatory BOOLEAN DEFAULT TRUE COMMENT '是否必修',
    unlock_condition TEXT COMMENT '解锁条件',
    completion_requirement TEXT COMMENT '完成要求',
    custom_duration INT COMMENT '自定义时长(分钟)',
    custom_intensity INT COMMENT '自定义强度',
    notes TEXT COMMENT '备注',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    FOREIGN KEY (course_plan_id) REFERENCES course_training_plans(id) ON DELETE CASCADE,
    FOREIGN KEY (session_id) REFERENCES course_sessions(id) ON DELETE CASCADE,
    UNIQUE KEY uk_plan_session_order (course_plan_id, session_order)
) COMMENT='课程训练计划及课节配置关系表';