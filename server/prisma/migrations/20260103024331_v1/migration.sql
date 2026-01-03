-- AddForeignKey
ALTER TABLE `student_modules` ADD CONSTRAINT `student_modules_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
