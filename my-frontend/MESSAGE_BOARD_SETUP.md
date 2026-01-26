# 留言板功能设置指南

## 概述

留言板功能已经实现，包含以下特性：
- 三种角色：管理员、普通用户、未登录游客
- 游客只能查看，点击评论/回复时提示登录
- 登录用户可以发帖、回复、删除自己的评论
- 管理员可以删除任何人的留言和评论
- 内容过滤功能（敏感词过滤）
- 通知系统（回复通知、通知铃铛、小红点）

## 数据库迁移

首先需要运行数据库迁移来创建留言板相关的数据表。

### 1. 生成迁移文件

```bash
cd my-frontend
npx prisma migrate dev --name add_message_board
```

### 2. 如果遇到问题，可以手动运行 SQL

如果自动迁移失败，可以手动执行以下 SQL（在 MySQL 中）：

```sql
-- 添加 Notification 表的字段
ALTER TABLE `Notification` 
  ADD COLUMN `type` VARCHAR(191) NULL,
  ADD COLUMN `relatedId` VARCHAR(191) NULL,
  ADD INDEX `Notification_userId_isRead_idx` (`userId`, `isRead`);

-- 创建 MessageBoardPost 表
CREATE TABLE `MessageBoardPost` (
  `id` VARCHAR(191) NOT NULL,
  `content` TEXT NOT NULL,
  `isDeleted` BOOLEAN NOT NULL DEFAULT false,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL,
  `authorId` VARCHAR(191) NOT NULL,
  PRIMARY KEY (`id`),
  INDEX `MessageBoardPost_authorId_idx` (`authorId`),
  INDEX `MessageBoardPost_createdAt_idx` (`createdAt`),
  CONSTRAINT `MessageBoardPost_authorId_fkey` FOREIGN KEY (`authorId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- 创建 MessageBoardReply 表
CREATE TABLE `MessageBoardReply` (
  `id` VARCHAR(191) NOT NULL,
  `content` TEXT NOT NULL,
  `isDeleted` BOOLEAN NOT NULL DEFAULT false,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL,
  `authorId` VARCHAR(191) NOT NULL,
  `postId` VARCHAR(191) NOT NULL,
  `parentId` VARCHAR(191) NULL,
  PRIMARY KEY (`id`),
  INDEX `MessageBoardReply_postId_idx` (`postId`),
  INDEX `MessageBoardReply_authorId_idx` (`authorId`),
  INDEX `MessageBoardReply_parentId_idx` (`parentId`),
  INDEX `MessageBoardReply_createdAt_idx` (`createdAt`),
  CONSTRAINT `MessageBoardReply_authorId_fkey` FOREIGN KEY (`authorId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `MessageBoardReply_postId_fkey` FOREIGN KEY (`postId`) REFERENCES `MessageBoardPost`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `MessageBoardReply_parentId_fkey` FOREIGN KEY (`parentId`) REFERENCES `MessageBoardReply`(`id`) ON DELETE SET NULL ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- 更新 User 表，添加关联关系（如果还没有）
-- 注意：这些关系在 Prisma 中会自动处理，但如果手动创建表，需要确保外键正确
```

### 3. 生成 Prisma Client

```bash
npx prisma generate
```

## 功能说明

### 1. 留言板页面

访问路径：`/message-board`

- 游客：只能查看留言和回复，点击"评论/回复"按钮会弹出登录提示
- 登录用户：可以发布留言、回复、删除自己的留言/回复
- 管理员：可以删除任何人的留言和回复

### 2. 通知系统

- 通知铃铛显示在 Header 右上角（登录用户可见）
- 当有人回复你的留言或评论时，会收到通知
- 通知列表显示："[用户名] 回复了你的留言/评论：[内容截取...]"
- 点击通知可以跳转到对应的留言

### 3. 内容过滤

敏感词过滤功能已实现，默认包含一些常见敏感词。可以在 `src/lib/content-filter.ts` 中自定义敏感词列表。

### 4. API 端点

- `GET /api/message-board` - 获取留言列表
- `POST /api/message-board` - 创建留言
- `DELETE /api/message-board/[postId]` - 删除留言
- `POST /api/message-board/[postId]/reply` - 回复留言
- `DELETE /api/message-board/reply/[replyId]` - 删除回复
- `GET /api/notifications` - 获取通知列表
- `PUT /api/notifications/[id]/read` - 标记通知为已读
- `PUT /api/notifications/read-all` - 标记所有通知为已读

## 测试

1. 以游客身份访问 `/message-board`，尝试点击"评论/回复"按钮，应该弹出登录提示
2. 登录后，可以发布留言和回复
3. 回复其他人的留言，被回复的用户应该收到通知
4. 管理员可以删除任何留言和回复

## 注意事项

1. 确保数据库连接正常
2. 确保已运行数据库迁移
3. 通知系统每30秒自动刷新未读数量
4. 内容长度限制：最少2个字符，最多5000个字符
