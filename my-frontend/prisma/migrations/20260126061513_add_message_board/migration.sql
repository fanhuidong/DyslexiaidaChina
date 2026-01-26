-- AlterTable
ALTER TABLE `notification` ADD COLUMN `relatedId` VARCHAR(191) NULL,
    ADD COLUMN `type` VARCHAR(191) NULL;

-- CreateTable
CREATE TABLE `MessageBoardPost` (
    `id` VARCHAR(191) NOT NULL,
    `content` TEXT NOT NULL,
    `isDeleted` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `authorId` VARCHAR(191) NOT NULL,

    INDEX `MessageBoardPost_authorId_idx`(`authorId`),
    INDEX `MessageBoardPost_createdAt_idx`(`createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `MessageBoardReply` (
    `id` VARCHAR(191) NOT NULL,
    `content` TEXT NOT NULL,
    `isDeleted` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `authorId` VARCHAR(191) NOT NULL,
    `postId` VARCHAR(191) NOT NULL,
    `parentId` VARCHAR(191) NULL,

    INDEX `MessageBoardReply_postId_idx`(`postId`),
    INDEX `MessageBoardReply_authorId_idx`(`authorId`),
    INDEX `MessageBoardReply_parentId_idx`(`parentId`),
    INDEX `MessageBoardReply_createdAt_idx`(`createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE INDEX `Notification_userId_isRead_idx` ON `Notification`(`userId`, `isRead`);

-- AddForeignKey
ALTER TABLE `MessageBoardPost` ADD CONSTRAINT `MessageBoardPost_authorId_fkey` FOREIGN KEY (`authorId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `MessageBoardReply` ADD CONSTRAINT `MessageBoardReply_authorId_fkey` FOREIGN KEY (`authorId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `MessageBoardReply` ADD CONSTRAINT `MessageBoardReply_postId_fkey` FOREIGN KEY (`postId`) REFERENCES `MessageBoardPost`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `MessageBoardReply` ADD CONSTRAINT `MessageBoardReply_parentId_fkey` FOREIGN KEY (`parentId`) REFERENCES `MessageBoardReply`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
