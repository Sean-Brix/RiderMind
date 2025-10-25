/*
  Warnings:

  - You are about to drop the column `name` on the `user` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `user` DROP COLUMN `name`,
    ADD COLUMN `applicant_signature` VARCHAR(191) NULL,
    ADD COLUMN `application_date` DATETIME(3) NULL,
    ADD COLUMN `birthdate` DATETIME(3) NULL,
    ADD COLUMN `blood_type` VARCHAR(191) NULL,
    ADD COLUMN `cellphone_number` VARCHAR(191) NULL,
    ADD COLUMN `civil_status` VARCHAR(191) NULL,
    ADD COLUMN `email_address` VARCHAR(191) NULL,
    ADD COLUMN `emergency_contact_name` VARCHAR(191) NULL,
    ADD COLUMN `emergency_contact_number` VARCHAR(191) NULL,
    ADD COLUMN `emergency_contact_relationship` VARCHAR(191) NULL,
    ADD COLUMN `eye_color` VARCHAR(191) NULL,
    ADD COLUMN `first_name` VARCHAR(191) NULL,
    ADD COLUMN `height` DOUBLE NULL,
    ADD COLUMN `last_name` VARCHAR(191) NULL,
    ADD COLUMN `middle_name` VARCHAR(191) NULL,
    ADD COLUMN `name_extension` VARCHAR(191) NULL,
    ADD COLUMN `nationality` VARCHAR(191) NULL,
    ADD COLUMN `permanent_address_barangay` VARCHAR(191) NULL,
    ADD COLUMN `permanent_address_city_municipality` VARCHAR(191) NULL,
    ADD COLUMN `permanent_address_house_no` VARCHAR(191) NULL,
    ADD COLUMN `permanent_address_province` VARCHAR(191) NULL,
    ADD COLUMN `permanent_address_street` VARCHAR(191) NULL,
    ADD COLUMN `present_address_barangay` VARCHAR(191) NULL,
    ADD COLUMN `present_address_city_municipality` VARCHAR(191) NULL,
    ADD COLUMN `present_address_house_no` VARCHAR(191) NULL,
    ADD COLUMN `present_address_province` VARCHAR(191) NULL,
    ADD COLUMN `present_address_street` VARCHAR(191) NULL,
    ADD COLUMN `sex` VARCHAR(191) NULL,
    ADD COLUMN `telephone_number` VARCHAR(191) NULL,
    ADD COLUMN `vehicle_categories` VARCHAR(191) NULL,
    ADD COLUMN `weight` DOUBLE NULL;
