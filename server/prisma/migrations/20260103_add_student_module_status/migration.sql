-- AlterTable
ALTER TABLE `student_modules` ADD COLUMN `status` ENUM('ONGOING', 'COMPLETED') NOT NULL DEFAULT 'ONGOING';

-- CreateIndex
CREATE INDEX `student_modules_status_idx` ON `student_modules`(`status`);
