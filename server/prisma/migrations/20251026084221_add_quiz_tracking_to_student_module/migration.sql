-- AlterTable
ALTER TABLE `student_modules` ADD COLUMN `currentSlideId` INTEGER NULL,
    ADD COLUMN `lastQuizAttemptId` INTEGER NULL,
    ADD COLUMN `quizAttempts` INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN `quizPassed` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `quizScore` DOUBLE NULL;

-- CreateIndex
CREATE INDEX `student_modules_quizPassed_idx` ON `student_modules`(`quizPassed`);
