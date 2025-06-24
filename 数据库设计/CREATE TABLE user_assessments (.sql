CREATE TABLE user_assessments (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '评估ID',
    user_id BIGINT NOT NULL COMMENT '用户ID',
    assessment_type ENUM('initial', 'periodic', 'final') NOT NULL COMMENT '评估类型',
    assessment_date DATE NOT NULL COMMENT '评估日期',
    glazer_score INT COMMENT 'Glazer评分',
    muscle_strength_score DECIMAL(4,2) COMMENT '肌力评分',
    endurance_score DECIMAL(4,2) COMMENT '耐力评分',
    coordination_score DECIMAL(4,2) COMMENT '协调性评分',
    symptoms_severity INT COMMENT '症状严重程度(1-10)',
    quality_of_life_score DECIMAL(4,2) COMMENT '生活质量评分',
    assessment_data JSON COMMENT '详细评估数据',
    recommendations TEXT COMMENT '建议',
    assessor_id BIGINT COMMENT '评估者ID',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (assessor_id) REFERENCES users(id) ON DELETE SET NULL
) COMMENT='用户评估数据表';