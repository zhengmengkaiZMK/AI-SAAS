-- ==========================================
-- AI-SaaS 数据库 Schema
-- 适用于 Supabase (PostgreSQL)
-- 创建日期: 2025-12-23
-- ==========================================

-- 清理现有表（如果存在）
DROP TABLE IF EXISTS chat_history CASCADE;
DROP TABLE IF EXISTS search_history CASCADE;
DROP TABLE IF EXISTS payments CASCADE;
DROP TABLE IF EXISTS user_quotas CASCADE;
DROP TABLE IF EXISTS sessions CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- 清理现有类型
DROP TYPE IF EXISTS membership_type CASCADE;
DROP TYPE IF EXISTS payment_provider CASCADE;
DROP TYPE IF EXISTS payment_status CASCADE;

-- ==========================================
-- 创建枚举类型
-- ==========================================

-- 会员类型枚举
CREATE TYPE membership_type AS ENUM ('FREE', 'PREMIUM', 'ENTERPRISE');

-- 支付提供商枚举
CREATE TYPE payment_provider AS ENUM ('PAYPAL', 'STRIPE');

-- 支付状态枚举
CREATE TYPE payment_status AS ENUM ('PENDING', 'COMPLETED', 'FAILED', 'REFUNDED', 'CANCELLED');

-- ==========================================
-- 用户表 (users)
-- ==========================================
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) NOT NULL UNIQUE,
  email_verified TIMESTAMP WITH TIME ZONE,
  password_hash VARCHAR(255), -- OAuth用户可能没有密码
  name VARCHAR(100),
  avatar TEXT,
  
  -- 会员信息
  membership_type membership_type NOT NULL DEFAULT 'FREE',
  membership_expires_at TIMESTAMP WITH TIME ZONE,
  
  -- OAuth关联
  provider VARCHAR(50), -- 'google', 'github', etc
  provider_id VARCHAR(255),
  
  -- 账户状态
  is_active BOOLEAN NOT NULL DEFAULT true,
  is_banned BOOLEAN NOT NULL DEFAULT false,
  ban_reason TEXT,
  
  -- 时间戳
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  last_login_at TIMESTAMP WITH TIME ZONE,
  
  -- 约束
  CONSTRAINT unique_provider_id UNIQUE (provider, provider_id)
);

-- 为users表创建索引
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_membership_type ON users(membership_type);
CREATE INDEX idx_users_provider ON users(provider, provider_id);

-- 创建更新时间触发器函数
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 为users表添加自动更新updated_at的触发器
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ==========================================
-- 会话表 (sessions) - 用于NextAuth
-- ==========================================
CREATE TABLE sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_token VARCHAR(255) NOT NULL UNIQUE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  expires TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- 为sessions表创建索引
CREATE INDEX idx_sessions_user_id ON sessions(user_id);
CREATE INDEX idx_sessions_expires ON sessions(expires);

-- ==========================================
-- 用户配额表 (user_quotas)
-- ==========================================
CREATE TABLE user_quotas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  
  -- Reddit搜索配额
  searches_used INT NOT NULL DEFAULT 0,
  searches_limit INT NOT NULL DEFAULT 3,
  
  -- ADP对话配额
  messages_used INT NOT NULL DEFAULT 0,
  messages_limit INT NOT NULL DEFAULT 10,
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  
  -- 每个用户每天只能有一条配额记录
  CONSTRAINT unique_user_date UNIQUE (user_id, date),
  
  -- 确保使用量不超过限制
  CONSTRAINT check_searches_valid CHECK (searches_used >= 0 AND searches_used <= searches_limit),
  CONSTRAINT check_messages_valid CHECK (messages_used >= 0 AND messages_used <= messages_limit)
);

-- 为user_quotas表创建索引
CREATE INDEX idx_user_quotas_user_date ON user_quotas(user_id, date);
CREATE INDEX idx_user_quotas_date ON user_quotas(date);

-- ==========================================
-- 支付记录表 (payments)
-- ==========================================
CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  -- 支付平台信息
  provider payment_provider NOT NULL DEFAULT 'PAYPAL',
  provider_order_id VARCHAR(255) NOT NULL UNIQUE, -- PayPal/Stripe订单ID
  provider_payment_id VARCHAR(255) UNIQUE, -- PayPal Capture ID / Stripe Payment Intent ID
  
  -- 订单信息
  amount DECIMAL(10, 2) NOT NULL,
  currency VARCHAR(3) NOT NULL DEFAULT 'USD',
  plan_id VARCHAR(50) NOT NULL, -- 'monthly', 'yearly'
  
  -- 状态
  status payment_status NOT NULL DEFAULT 'PENDING',
  
  -- 元数据（存储额外信息，如优惠码、折扣等）
  metadata JSONB,
  
  -- 时间戳
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  refunded_at TIMESTAMP WITH TIME ZONE,
  
  -- 约束
  CONSTRAINT check_amount_positive CHECK (amount > 0)
);

-- 为payments表创建索引
CREATE INDEX idx_payments_user_id ON payments(user_id);
CREATE INDEX idx_payments_status ON payments(status);
CREATE INDEX idx_payments_created_at ON payments(created_at DESC);
CREATE INDEX idx_payments_provider_order_id ON payments(provider_order_id);

-- ==========================================
-- 搜索历史表 (search_history)
-- ==========================================
CREATE TABLE search_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  query TEXT NOT NULL,
  source VARCHAR(50) NOT NULL, -- 'reddit', 'adp'
  results_count INT NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  
  -- 约束
  CONSTRAINT check_source_valid CHECK (source IN ('reddit', 'adp')),
  CONSTRAINT check_results_count_valid CHECK (results_count >= 0)
);

-- 为search_history表创建索引
CREATE INDEX idx_search_history_user_created ON search_history(user_id, created_at DESC);
CREATE INDEX idx_search_history_source ON search_history(source);

-- ==========================================
-- ADP对话历史表 (chat_history)
-- ==========================================
CREATE TABLE chat_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  session_id VARCHAR(255) NOT NULL,
  role VARCHAR(20) NOT NULL, -- 'user', 'assistant'
  content TEXT NOT NULL,
  tokens INT, -- Token消耗（可选）
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  
  -- 约束
  CONSTRAINT check_role_valid CHECK (role IN ('user', 'assistant')),
  CONSTRAINT check_tokens_valid CHECK (tokens IS NULL OR tokens >= 0)
);

-- 为chat_history表创建索引
CREATE INDEX idx_chat_history_user_session ON chat_history(user_id, session_id);
CREATE INDEX idx_chat_history_session_created ON chat_history(session_id, created_at ASC);
CREATE INDEX idx_chat_history_created_at ON chat_history(created_at DESC);

-- ==========================================
-- 插入测试数据（可选）
-- ==========================================

-- 创建一个测试用户
INSERT INTO users (email, name, membership_type, email_verified)
VALUES 
  ('test@example.com', 'Test User', 'FREE', NOW()),
  ('premium@example.com', 'Premium User', 'PREMIUM', NOW());

-- 获取测试用户ID并创建配额记录
DO $$
DECLARE
  test_user_id UUID;
  premium_user_id UUID;
BEGIN
  SELECT id INTO test_user_id FROM users WHERE email = 'test@example.com';
  SELECT id INTO premium_user_id FROM users WHERE email = 'premium@example.com';
  
  -- 为免费用户创建今日配额
  INSERT INTO user_quotas (user_id, date, searches_limit, messages_limit)
  VALUES (test_user_id, CURRENT_DATE, 3, 10);
  
  -- 为高级用户创建今日配额
  INSERT INTO user_quotas (user_id, date, searches_limit, messages_limit)
  VALUES (premium_user_id, CURRENT_DATE, 100, 500);
END $$;

-- ==========================================
-- 创建 Row Level Security (RLS) 策略（推荐）
-- ==========================================

-- 启用RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_quotas ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE search_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_history ENABLE ROW LEVEL SECURITY;

-- 用户只能查看和修改自己的数据
CREATE POLICY "Users can view own data" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own data" ON users
  FOR UPDATE USING (auth.uid() = id);

-- 配额策略
CREATE POLICY "Users can view own quotas" ON user_quotas
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own quotas" ON user_quotas
  FOR UPDATE USING (auth.uid() = user_id);

-- 支付记录策略
CREATE POLICY "Users can view own payments" ON payments
  FOR SELECT USING (auth.uid() = user_id);

-- 搜索历史策略
CREATE POLICY "Users can view own search history" ON search_history
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own search history" ON search_history
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 聊天历史策略
CREATE POLICY "Users can view own chat history" ON chat_history
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own chat history" ON chat_history
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ==========================================
-- 创建视图（可选）
-- ==========================================

-- 用户统计视图
CREATE OR REPLACE VIEW user_stats AS
SELECT 
  u.id,
  u.email,
  u.name,
  u.membership_type,
  u.created_at,
  COUNT(DISTINCT p.id) AS total_payments,
  SUM(CASE WHEN p.status = 'COMPLETED' THEN p.amount ELSE 0 END) AS total_spent,
  COUNT(DISTINCT sh.id) AS total_searches,
  COUNT(DISTINCT ch.id) AS total_messages
FROM users u
LEFT JOIN payments p ON u.id = p.user_id
LEFT JOIN search_history sh ON u.id = sh.user_id
LEFT JOIN chat_history ch ON u.id = ch.user_id
GROUP BY u.id, u.email, u.name, u.membership_type, u.created_at;

-- ==========================================
-- 创建有用的函数
-- ==========================================

-- 获取或创建今日配额
CREATE OR REPLACE FUNCTION get_or_create_today_quota(p_user_id UUID)
RETURNS user_quotas AS $$
DECLARE
  v_quota user_quotas;
  v_membership membership_type;
BEGIN
  -- 尝试获取今日配额
  SELECT * INTO v_quota
  FROM user_quotas
  WHERE user_id = p_user_id AND date = CURRENT_DATE;
  
  -- 如果不存在，则创建
  IF NOT FOUND THEN
    -- 获取用户会员类型
    SELECT membership_type INTO v_membership
    FROM users WHERE id = p_user_id;
    
    -- 根据会员类型设置限额
    IF v_membership = 'PREMIUM' THEN
      INSERT INTO user_quotas (user_id, date, searches_limit, messages_limit)
      VALUES (p_user_id, CURRENT_DATE, 100, 500)
      RETURNING * INTO v_quota;
    ELSIF v_membership = 'ENTERPRISE' THEN
      INSERT INTO user_quotas (user_id, date, searches_limit, messages_limit)
      VALUES (p_user_id, CURRENT_DATE, 999999, 999999)
      RETURNING * INTO v_quota;
    ELSE
      INSERT INTO user_quotas (user_id, date, searches_limit, messages_limit)
      VALUES (p_user_id, CURRENT_DATE, 3, 10)
      RETURNING * INTO v_quota;
    END IF;
  END IF;
  
  RETURN v_quota;
END;
$$ LANGUAGE plpgsql;

-- 检查搜索配额
CREATE OR REPLACE FUNCTION check_search_quota(p_user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  v_quota user_quotas;
BEGIN
  v_quota := get_or_create_today_quota(p_user_id);
  RETURN v_quota.searches_used < v_quota.searches_limit;
END;
$$ LANGUAGE plpgsql;

-- 扣减搜索配额
CREATE OR REPLACE FUNCTION decrement_search_quota(p_user_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE user_quotas
  SET searches_used = searches_used + 1
  WHERE user_id = p_user_id AND date = CURRENT_DATE;
END;
$$ LANGUAGE plpgsql;

-- 检查消息配额
CREATE OR REPLACE FUNCTION check_message_quota(p_user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  v_quota user_quotas;
BEGIN
  v_quota := get_or_create_today_quota(p_user_id);
  RETURN v_quota.messages_used < v_quota.messages_limit;
END;
$$ LANGUAGE plpgsql;

-- 扣减消息配额
CREATE OR REPLACE FUNCTION decrement_message_quota(p_user_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE user_quotas
  SET messages_used = messages_used + 1
  WHERE user_id = p_user_id AND date = CURRENT_DATE;
END;
$$ LANGUAGE plpgsql;

-- ==========================================
-- 完成提示
-- ==========================================

DO $$
BEGIN
  RAISE NOTICE '=================================================';
  RAISE NOTICE 'AI-SaaS 数据库 Schema 创建成功！';
  RAISE NOTICE '=================================================';
  RAISE NOTICE '已创建的表:';
  RAISE NOTICE '  - users (用户表)';
  RAISE NOTICE '  - sessions (会话表)';
  RAISE NOTICE '  - user_quotas (配额表)';
  RAISE NOTICE '  - payments (支付记录表)';
  RAISE NOTICE '  - search_history (搜索历史表)';
  RAISE NOTICE '  - chat_history (聊天历史表)';
  RAISE NOTICE '';
  RAISE NOTICE '已创建的函数:';
  RAISE NOTICE '  - get_or_create_today_quota()';
  RAISE NOTICE '  - check_search_quota()';
  RAISE NOTICE '  - decrement_search_quota()';
  RAISE NOTICE '  - check_message_quota()';
  RAISE NOTICE '  - decrement_message_quota()';
  RAISE NOTICE '';
  RAISE NOTICE '已创建测试用户:';
  RAISE NOTICE '  - test@example.com (免费用户)';
  RAISE NOTICE '  - premium@example.com (高级用户)';
  RAISE NOTICE '=================================================';
END $$;
