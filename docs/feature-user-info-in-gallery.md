# Feature: Add User Information to Gallery Cards
# 功能：为画廊卡片添加用户信息

## Overview | 概述
Add user avatar, username, and creation time display to WorkCard components in the pixel gallery.

为像素画廊中的 WorkCard 组件添加用户头像、用户名和创建时间显示。

## Current State | 当前状态
- WorkCard only displays pixel art image and emoji badge
- Gallery API returns work data without user information
- Work interface lacks user fields

- WorkCard 只显示像素艺术图片和表情符号徽章
- Gallery API 返回作品数据但不包含用户信息
- Work 接口缺少用户字段

## Proposed Changes | 建议的修改

### 1. Database Schema | 数据库架构
**Current Work Table | 当前作品表：**
```sql
works {
  id: integer (PK)
  uuid: varchar(255)
  user_uuid: varchar(255) -- FK to users.uuid
  emoji: varchar(50)
  image_url: varchar(255)
  created_at: timestamp
}
```

**Users Table (existing) | 用户表（现有）：**
```sql
users {
  uuid: varchar(255) (PK)
  nickname: varchar(255)
  avatar_url: varchar(255)
  email: varchar(255)
  created_at: timestamp
  ...
}
```

### 2. API Changes | API 修改

**File | 文件: `/src/app/api/gallery/route.ts`**

Current query (works only) | 当前查询（仅作品）：
```typescript
const results = await query
  .orderBy(desc(works.created_at))
  .limit(limit + 1);
```

**Proposed | 建议:** JOIN with users table | 与用户表进行联表查询：
```typescript
import { eq } from "drizzle-orm";
import { users } from "@/db/schema";

const results = await database
  .select({
    // Work fields
    id: works.id,
    uuid: works.uuid,
    user_uuid: works.user_uuid,
    emoji: works.emoji,
    image_url: works.image_url,
    created_at: works.created_at,
    // User fields
    user_nickname: users.nickname,
    user_avatar_url: users.avatar_url,
  })
  .from(works)
  .leftJoin(users, eq(works.user_uuid, users.uuid))
  .where(cursor ? lt(works.id, parseInt(cursor, 10)) : undefined)
  .orderBy(desc(works.created_at))
  .limit(limit + 1);
```

### 3. Type Definitions | 类型定义

**File | 文件: `/src/components/blocks/work-card/index.tsx`**

**Current Work Interface | 当前 Work 接口：**
```typescript
export interface Work {
  id: number;
  uuid: string;
  user_uuid: string;
  emoji: string;
  image_url: string;
  created_at: Date | string;
}
```

**Proposed Extension | 建议的扩展：**
```typescript
export interface Work {
  id: number;
  uuid: string;
  user_uuid: string;
  emoji: string;
  image_url: string;
  created_at: Date | string;
  // New user fields | 新增用户字段
  user_nickname?: string;
  user_avatar_url?: string;
}
```

### 4. UI Design | UI 设计

**Current WorkCard Structure | 当前 WorkCard 结构：**
```
┌─────────────────────┐
│  🎨  ←emoji badge   │
│                     │
│    [pixel image]    │ aspect-square
│                     │
│                     │
└─────────────────────┘
```

**Proposed WorkCard with User Info | 建议的带用户信息的 WorkCard：**
```
┌─────────────────────┐
│  🎨                 │
│                     │
│    [pixel image]    │
│                     │
│                     │
├─────────────────────┤
│ [头像] username     │ ← Avatar (32x32) + username | 头像 (32x32) + 用户名
│        2 hours ago  │ ← Creation time (relative) | 创建时间（相对时间）
└─────────────────────┘
```

### 5. Implementation Details | 实现细节

**User Info Section Styling | 用户信息区域样式：**
- Container | 容器: `h-16 p-3 border-t border-gray-100`
- Avatar | 头像: `w-8 h-8 rounded-full object-cover`
- Username | 用户名: `text-sm font-medium text-gray-900`
- Time | 时间: `text-xs text-gray-500`
- Fallback avatar | 备用头像: Default user icon for missing avatars | 缺失头像时的默认用户图标

**Time Display | 时间显示:**
- Use relative time format (e.g., "2h", "1d", "3w") | 使用相对时间格式（如："2小时"、"1天"、"3周"）
- Implement time formatting utility function | 实现时间格式化工具函数

### 6. Fallback Handling | 回退处理

**Missing User Data | 缺失用户数据:**
- Username fallback: "Anonymous User" | 用户名回退："匿名用户"
- Avatar fallback: Default user icon or initials | 头像回退：默认用户图标或姓名首字母
- Handle cases where user might be deleted but work remains | 处理用户已删除但作品仍存在的情况

### 7. Performance Considerations | 性能考虑

**Database | 数据库:**
- LEFT JOIN to handle orphaned works | 使用 LEFT JOIN 处理孤立作品
- Consider indexing on `works.user_uuid` if not already indexed | 考虑为 `works.user_uuid` 添加索引（如果尚未索引）
- Pagination performance with JOIN queries | JOIN 查询的分页性能

**Frontend | 前端:**
- Lazy loading for user avatars | 用户头像的懒加载
- Error handling for broken avatar URLs | 处理损坏头像 URL 的错误
- Maintain existing caching strategy | 维持现有缓存策略

### 8. Testing Checklist | 测试检查清单

- [ ] Gallery API returns user data correctly | Gallery API 正确返回用户数据
- [ ] WorkCard displays user info properly | WorkCard 正确显示用户信息
- [ ] Fallback handling for missing user data | 缺失用户数据的回退处理
- [ ] Avatar image loading and error states | 头像图片加载和错误状态
- [ ] Time formatting displays correctly | 时间格式化正确显示
- [ ] Responsive design on mobile devices | 移动设备上的响应式设计
- [ ] Performance impact assessment | 性能影响评估
- [ ] Existing functionality remains intact | 现有功能保持完整

### 9. Files to Modify | 需要修改的文件

1. **API Layer | API 层:**
   - `/src/app/api/gallery/route.ts` - Add JOIN query | 添加 JOIN 查询

2. **Types | 类型:**
   - `/src/components/blocks/work-card/index.tsx` - Extend Work interface | 扩展 Work 接口

3. **Components | 组件:**
   - `/src/components/blocks/work-card/index.tsx` - Add user info section | 添加用户信息区域

4. **Utilities (if needed) | 工具函数（如需要）:**
   - Create time formatting utility | 创建时间格式化工具
   - Create avatar fallback component | 创建头像回退组件

### 10. Migration Strategy | 迁移策略

**Phase 1 | 第一阶段:** Backend Changes | 后端修改
- Update API to include user data | 更新 API 包含用户数据
- Test API responses | 测试 API 响应

**Phase 2 | 第二阶段:** Frontend Changes | 前端修改
- Update Work interface | 更新 Work 接口
- Modify WorkCard component | 修改 WorkCard 组件
- Add user info display | 添加用户信息显示

**Phase 3 | 第三阶段:** Polish | 完善
- Implement fallbacks | 实现回退机制
- Add loading states | 添加加载状态
- Performance optimization | 性能优化

## Success Criteria | 成功标准

- Gallery cards display user avatar, username, and creation time | 画廊卡片显示用户头像、用户名和创建时间
- Graceful handling of missing user data | 优雅处理缺失的用户数据
- No performance degradation | 无性能下降
- Maintains existing caching and update behavior | 维持现有的缓存和更新行为
- Works across all gallery display modes (preview and full) | 在所有画廊显示模式下工作（预览和完整模式）