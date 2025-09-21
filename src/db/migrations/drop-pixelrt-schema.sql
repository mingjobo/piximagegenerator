-- ==========================================
-- 删除错误创建的 pixelrt schema
-- ==========================================
-- 执行地点：Supabase Dashboard → SQL Editor

-- 步骤 1: 先检查 pixelrt schema 中有哪些表（安全检查）
SELECT
    'pixelrt' as schema_name,
    COUNT(*) as table_count,
    COALESCE(STRING_AGG(table_name, ', '), '无表') as table_names
FROM information_schema.tables
WHERE table_schema = 'pixelrt';

-- 步骤 2: 删除 pixelrt schema 及其所有内容
-- CASCADE 会自动删除 schema 中的所有对象（表、视图、序列等）
DROP SCHEMA IF EXISTS pixelrt CASCADE;

-- 步骤 3: 确认删除成功
SELECT
    CASE
        WHEN EXISTS (SELECT 1 FROM information_schema.schemata WHERE schema_name = 'pixelrt')
        THEN '❌ pixelrt schema 仍然存在'
        ELSE '✅ pixelrt schema 已成功删除'
    END as status;

-- 步骤 4: 查看现有的 schemas（可选）
SELECT schema_name
FROM information_schema.schemata
WHERE schema_name NOT IN ('pg_catalog', 'information_schema', 'pg_toast', 'auth', 'storage', 'vault', 'extensions', 'graphql', 'graphql_public', 'realtime', 'supabase_functions')
ORDER BY schema_name;