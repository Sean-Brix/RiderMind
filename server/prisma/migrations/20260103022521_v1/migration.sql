-- DropForeignKey
ALTER TABLE `student_modules` DROP FOREIGN KEY `student_modules_userId_fkey`;

-- DropIndex
DROP INDEX `student_modules_userId_categoryId_moduleId_key` ON `student_modules`;

-- CreateIndex
CREATE INDEX `student_modules_userId_status_idx` ON `student_modules`(`userId`, `status`);

-- AddForeignKey
-- NOTE: This FK already exists from prior migrations / table creation.
-- Keeping this statement would fail on MySQL because foreign key constraint names must be unique.
