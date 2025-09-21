-- ==========================================
-- Supabase pixelart Schema 权限设置脚本
-- ==========================================
-- 这个脚本用于在 Supabase 中设置 pixelart schema 的权限
-- 请在 Supabase Dashboard 的 SQL Editor 中运行此脚本

-- 1. 授予 authenticated 角色使用 pixelart schema 的权限
GRANT USAGE ON SCHEMA pixelart TO authenticated;
GRANT USAGE ON SCHEMA pixelart TO anon;
GRANT USAGE ON SCHEMA pixelart TO service_role;

-- 2. 授予对所有表的权限
-- 给 authenticated 用户完整权限
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA pixelart TO authenticated;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA pixelart TO authenticated;

-- 给 anon 用户只读权限（可选，根据需要调整）
GRANT SELECT ON ALL TABLES IN SCHEMA pixelart TO anon;

-- 给 service_role 完整权限
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA pixelart TO service_role;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA pixelart TO service_role;

-- 3. 设置默认权限，让未来创建的表也自动获得权限
ALTER DEFAULT PRIVILEGES IN SCHEMA pixelart GRANT ALL ON TABLES TO authenticated;
ALTER DEFAULT PRIVILEGES IN SCHEMA pixelart GRANT ALL ON SEQUENCES TO authenticated;
ALTER DEFAULT PRIVILEGES IN SCHEMA pixelart GRANT SELECT ON TABLES TO anon;
ALTER DEFAULT PRIVILEGES IN SCHEMA pixelart GRANT ALL ON TABLES TO service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA pixelart GRANT ALL ON SEQUENCES TO service_role;

-- 4. 创建 RLS（行级安全）策略示例（可选）
-- 如果你想启用 RLS，可以取消下面的注释并根据需要修改

-- -- 启用 RLS
-- ALTER TABLE pixelart.users ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE pixelart.orders ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE pixelart.credits ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE pixelart.works ENABLE ROW LEVEL SECURITY;

-- -- 创建策略示例：用户只能查看自己的数据
-- CREATE POLICY "用户查看自己的数据" ON pixelart.users
--   FOR SELECT
--   USING (auth.uid()::text = uuid);

-- CREATE POLICY "用户查看自己的订单" ON pixelart.orders
--   FOR SELECT
--   USING (auth.uid()::text = user_uuid);

-- 5. 验证权限设置
-- 运行以下查询来验证权限是否正确设置
SELECT
    schemaname,
    tablename,
    has_table_privilege('authenticated', schemaname||'.'||tablename, 'SELECT') as can_select,
    has_table_privilege('authenticated', schemaname||'.'||tablename, 'INSERT') as can_insert,
    has_table_privilege('authenticated', schemaname||'.'||tablename, 'UPDATE') as can_update,
    has_table_privilege('authenticated', schemaname||'.'||tablename, 'DELETE') as can_delete
FROM pg_tables
WHERE schemaname = 'pixelart';