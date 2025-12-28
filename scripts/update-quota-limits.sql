-- 更新现有配额限制从3次改为5次
-- 此脚本用于更新所有FREE用户的配额限制

-- 更新所有现有的免费用户配额记录
UPDATE user_quotas
SET searches_limit = 5
WHERE searches_limit = 3;

-- 打印更新结果
SELECT 
  COUNT(*) as updated_records,
  'Updated quota limits from 3 to 5 searches' as message
FROM user_quotas
WHERE searches_limit = 5;
