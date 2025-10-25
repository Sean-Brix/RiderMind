-- CreateEnum for StudentType (if not exists)
-- Note: MySQL doesn't have native ENUM type for Prisma enums, they're stored as VARCHAR

-- CreateTable: module_categories
CREATE TABLE IF NOT EXISTS `module_categories` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(255) NOT NULL,
    `description` TEXT NULL,
    `studentType` ENUM('CAR', 'MOTORCYCLE', 'BOTH') NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `isDefault` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `createdBy` INTEGER NULL,
    `updatedBy` INTEGER NULL,

    INDEX `module_categories_isActive_idx`(`isActive`),
    INDEX `module_categories_isDefault_idx`(`isDefault`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable: module_category_modules (junction table)
CREATE TABLE IF NOT EXISTS `module_category_modules` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `categoryId` INTEGER NOT NULL,
    `moduleId` INTEGER NOT NULL,
    `position` INTEGER NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `module_category_modules_categoryId_idx`(`categoryId`),
    INDEX `module_category_modules_moduleId_idx`(`moduleId`),
    INDEX `module_category_modules_position_idx`(`position`),
    UNIQUE INDEX `module_category_modules_categoryId_moduleId_key`(`categoryId`, `moduleId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `module_category_modules` 
ADD CONSTRAINT `module_category_modules_categoryId_fkey` 
FOREIGN KEY (`categoryId`) REFERENCES `module_categories`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `module_category_modules` 
ADD CONSTRAINT `module_category_modules_moduleId_fkey` 
FOREIGN KEY (`moduleId`) REFERENCES `modules`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
