-- ==========================================
-- 清理错误创建的 pixelrt schema
-- ==========================================
-- 警告：运行此脚本会删除 pixelrt schema 及其所有内容！
-- 请确保已经备份了任何重要数据

-- 1. 检查 pixelrt schema 中是否有表（运行前先确认）
SELECT
    'pixelrt' as schema_name,
    COUNT(*) as table_count,
    STRING_AGG(table_name, ', ') as table_names
FROM information_schema.tables
WHERE table_schema = 'pixelrt';

-- 2. 如果确认要删除，取消下面的注释并运行：

-- -- 删除 pixelrt schema 及其所有内容（CASCADE 会删除所有表、视图等）
-- DROP SCHEMA IF EXISTS pixelrt CASCADE;

-- 3. 确认 pixelart schema 存在
CREATE SCHEMA IF NOT EXISTS pixelart;

-- 4. 验证 pixelart schema 中的表
SELECT
    'pixelart' as schema_name,
    COUNT(*) as table_count,
    STRING_AGG(table_name, ', ') as table_names
FROM information_schema.tables
WHERE table_schema = 'pixelart';

-- 5. 清理 Drizzle 迁移历史（如果需要重新运行迁移）
-- 注意：只有在确定需要重新运行所有迁移时才取消注释
-- DELETE FROM drizzle.__drizzle_migrations
-- WHERE hash IN (
--     SELECT hash
--     FROM drizzle.__drizzle_migrations
--     WHERE created_at > '2024-01-01'  -- 调整日期以匹配你的迁移时间
-- );

-- 提示：运行步骤
-- 1. 先运行第1步，检查 pixelrt 中的表
-- 2. 确认数据已备份或不需要
-- 3. 取消第2步的注释并运行，删除 pixelrt schema
-- 4. 运行 pnpm db:migrate 重新创建表在 pixelart schema 中