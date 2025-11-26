-- AlterTable
ALTER TABLE `registration_requests` ADD COLUMN `orNumber` VARCHAR(191) NULL,
    ADD COLUMN `paymentReceiptUrl` VARCHAR(191) NULL;
