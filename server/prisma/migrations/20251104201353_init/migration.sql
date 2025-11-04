-- CreateTable
CREATE TABLE `User` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `email` VARCHAR(191) NOT NULL,
    `passwordHash` VARCHAR(191) NOT NULL,
    `role` ENUM('USER', 'ADMIN') NOT NULL DEFAULT 'USER',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `last_name` VARCHAR(191) NULL,
    `first_name` VARCHAR(191) NULL,
    `middle_name` VARCHAR(191) NULL,
    `name_extension` VARCHAR(191) NULL,
    `birthdate` DATETIME(3) NULL,
    `sex` VARCHAR(191) NULL,
    `nationality` ENUM('Filipino', 'American', 'Chinese', 'Japanese', 'Korean', 'Other') NULL,
    `civil_status` ENUM('Single', 'Married', 'Widowed', 'Divorced', 'Separated') NULL,
    `weight` DOUBLE NULL,
    `height` DOUBLE NULL,
    `blood_type` VARCHAR(191) NULL,
    `eye_color` VARCHAR(191) NULL,
    `address_house_no` VARCHAR(191) NULL,
    `address_street` VARCHAR(191) NULL,
    `address_barangay` VARCHAR(191) NULL,
    `address_city_municipality` VARCHAR(191) NULL,
    `address_province` VARCHAR(191) NULL,
    `telephone_number` VARCHAR(191) NULL,
    `cellphone_number` VARCHAR(191) NULL,
    `email_address` VARCHAR(191) NULL,
    `emergency_contact_name` VARCHAR(191) NULL,
    `emergency_contact_relationship` VARCHAR(191) NULL,
    `emergency_contact_number` VARCHAR(191) NULL,
    `student_type` ENUM('A', 'A1', 'B', 'B1', 'B2', 'C', 'D', 'BE', 'CE') NULL,

    UNIQUE INDEX `User_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `modules` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `title` VARCHAR(255) NOT NULL,
    `description` TEXT NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT false,
    `position` INTEGER NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `createdBy` INTEGER NULL,
    `updatedBy` INTEGER NULL,

    INDEX `modules_position_idx`(`position`),
    INDEX `modules_isActive_idx`(`isActive`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `module_categories` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(255) NOT NULL,
    `description` TEXT NULL,
    `vehicleType` ENUM('MOTORCYCLE', 'CAR') NOT NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `isDefault` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `createdBy` INTEGER NULL,
    `updatedBy` INTEGER NULL,

    INDEX `module_categories_isActive_idx`(`isActive`),
    INDEX `module_categories_isDefault_idx`(`isDefault`),
    INDEX `module_categories_vehicleType_idx`(`vehicleType`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `module_category_modules` (
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

-- CreateTable
CREATE TABLE `student_modules` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `userId` INTEGER NOT NULL,
    `categoryId` INTEGER NOT NULL,
    `moduleId` INTEGER NOT NULL,
    `position` INTEGER NOT NULL DEFAULT 0,
    `skillLevel` ENUM('Beginner', 'Intermediate', 'Expert') NOT NULL DEFAULT 'Beginner',
    `progress` DOUBLE NOT NULL DEFAULT 0,
    `currentSlideId` INTEGER NULL,
    `isCompleted` BOOLEAN NOT NULL DEFAULT false,
    `quizScore` DOUBLE NULL,
    `quizAttempts` INTEGER NOT NULL DEFAULT 0,
    `quizPassed` BOOLEAN NOT NULL DEFAULT false,
    `lastQuizAttemptId` INTEGER NULL,
    `startedAt` DATETIME(3) NULL,
    `completedAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `student_modules_userId_idx`(`userId`),
    INDEX `student_modules_categoryId_idx`(`categoryId`),
    INDEX `student_modules_moduleId_idx`(`moduleId`),
    INDEX `student_modules_position_idx`(`position`),
    INDEX `student_modules_isCompleted_idx`(`isCompleted`),
    INDEX `student_modules_quizPassed_idx`(`quizPassed`),
    INDEX `student_modules_skillLevel_idx`(`skillLevel`),
    UNIQUE INDEX `student_modules_userId_categoryId_moduleId_key`(`userId`, `categoryId`, `moduleId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `module_objectives` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `moduleId` INTEGER NOT NULL,
    `objective` VARCHAR(500) NOT NULL,
    `position` INTEGER NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `module_objectives_moduleId_idx`(`moduleId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `module_slides` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `moduleId` INTEGER NOT NULL,
    `type` ENUM('text', 'image', 'video') NOT NULL,
    `title` VARCHAR(255) NOT NULL,
    `content` TEXT NOT NULL,
    `description` VARCHAR(500) NULL,
    `position` INTEGER NOT NULL DEFAULT 0,
    `skillLevel` ENUM('Beginner', 'Intermediate', 'Expert') NOT NULL DEFAULT 'Beginner',
    `imageData` LONGBLOB NULL,
    `imageMime` VARCHAR(50) NULL,
    `videoPath` VARCHAR(500) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `module_slides_moduleId_idx`(`moduleId`),
    INDEX `module_slides_position_idx`(`position`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `quizzes` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `moduleId` INTEGER NULL,
    `title` VARCHAR(255) NOT NULL,
    `description` TEXT NULL,
    `instructions` TEXT NULL,
    `passingScore` INTEGER NOT NULL DEFAULT 70,
    `timeLimit` INTEGER NULL,
    `shuffleQuestions` BOOLEAN NOT NULL DEFAULT false,
    `showResults` BOOLEAN NOT NULL DEFAULT true,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `position` INTEGER NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `createdBy` INTEGER NULL,
    `updatedBy` INTEGER NULL,

    INDEX `quizzes_moduleId_idx`(`moduleId`),
    INDEX `quizzes_isActive_idx`(`isActive`),
    INDEX `quizzes_position_idx`(`position`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `quiz_questions` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `quizId` INTEGER NOT NULL,
    `type` ENUM('MULTIPLE_CHOICE', 'TRUE_FALSE', 'IDENTIFICATION', 'ESSAY', 'MULTIPLE_ANSWER', 'MATCHING', 'FILL_BLANK') NOT NULL,
    `question` TEXT NOT NULL,
    `description` TEXT NULL,
    `points` INTEGER NOT NULL DEFAULT 1,
    `position` INTEGER NOT NULL DEFAULT 0,
    `isRequired` BOOLEAN NOT NULL DEFAULT true,
    `imageData` LONGBLOB NULL,
    `imageMime` VARCHAR(50) NULL,
    `videoPath` VARCHAR(500) NULL,
    `caseSensitive` BOOLEAN NOT NULL DEFAULT false,
    `shuffleOptions` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `quiz_questions_quizId_idx`(`quizId`),
    INDEX `quiz_questions_position_idx`(`position`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `quiz_question_options` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `questionId` INTEGER NOT NULL,
    `optionText` TEXT NOT NULL,
    `isCorrect` BOOLEAN NOT NULL DEFAULT false,
    `position` INTEGER NOT NULL DEFAULT 0,
    `imageData` LONGBLOB NULL,
    `imageMime` VARCHAR(50) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `quiz_question_options_questionId_idx`(`questionId`),
    INDEX `quiz_question_options_position_idx`(`position`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `quiz_attempts` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `quizId` INTEGER NOT NULL,
    `userId` INTEGER NOT NULL,
    `startedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `submittedAt` DATETIME(3) NULL,
    `score` DOUBLE NULL,
    `passed` BOOLEAN NOT NULL DEFAULT false,
    `timeSpent` INTEGER NULL,

    INDEX `quiz_attempts_quizId_idx`(`quizId`),
    INDEX `quiz_attempts_userId_idx`(`userId`),
    INDEX `quiz_attempts_submittedAt_idx`(`submittedAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `quiz_answers` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `attemptId` INTEGER NOT NULL,
    `questionId` INTEGER NOT NULL,
    `selectedOptionId` INTEGER NULL,
    `answerText` TEXT NULL,
    `isCorrect` BOOLEAN NOT NULL DEFAULT false,
    `pointsEarned` DOUBLE NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `quiz_answers_attemptId_idx`(`attemptId`),
    INDEX `quiz_answers_questionId_idx`(`questionId`),
    UNIQUE INDEX `quiz_answers_attemptId_questionId_key`(`attemptId`, `questionId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `faqs` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `question` TEXT NOT NULL,
    `answer` TEXT NOT NULL,
    `category` ENUM('General', 'System', 'Module', 'Quiz') NOT NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `faqs_category_idx`(`category`),
    INDEX `faqs_isActive_idx`(`isActive`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `module_category_modules` ADD CONSTRAINT `module_category_modules_categoryId_fkey` FOREIGN KEY (`categoryId`) REFERENCES `module_categories`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `module_category_modules` ADD CONSTRAINT `module_category_modules_moduleId_fkey` FOREIGN KEY (`moduleId`) REFERENCES `modules`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `student_modules` ADD CONSTRAINT `student_modules_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `student_modules` ADD CONSTRAINT `student_modules_categoryId_fkey` FOREIGN KEY (`categoryId`) REFERENCES `module_categories`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `student_modules` ADD CONSTRAINT `student_modules_moduleId_fkey` FOREIGN KEY (`moduleId`) REFERENCES `modules`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `module_objectives` ADD CONSTRAINT `module_objectives_moduleId_fkey` FOREIGN KEY (`moduleId`) REFERENCES `modules`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `module_slides` ADD CONSTRAINT `module_slides_moduleId_fkey` FOREIGN KEY (`moduleId`) REFERENCES `modules`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `quizzes` ADD CONSTRAINT `quizzes_moduleId_fkey` FOREIGN KEY (`moduleId`) REFERENCES `modules`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `quiz_questions` ADD CONSTRAINT `quiz_questions_quizId_fkey` FOREIGN KEY (`quizId`) REFERENCES `quizzes`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `quiz_question_options` ADD CONSTRAINT `quiz_question_options_questionId_fkey` FOREIGN KEY (`questionId`) REFERENCES `quiz_questions`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `quiz_attempts` ADD CONSTRAINT `quiz_attempts_quizId_fkey` FOREIGN KEY (`quizId`) REFERENCES `quizzes`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `quiz_attempts` ADD CONSTRAINT `quiz_attempts_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `quiz_answers` ADD CONSTRAINT `quiz_answers_attemptId_fkey` FOREIGN KEY (`attemptId`) REFERENCES `quiz_attempts`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `quiz_answers` ADD CONSTRAINT `quiz_answers_questionId_fkey` FOREIGN KEY (`questionId`) REFERENCES `quiz_questions`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `quiz_answers` ADD CONSTRAINT `quiz_answers_selectedOptionId_fkey` FOREIGN KEY (`selectedOptionId`) REFERENCES `quiz_question_options`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
