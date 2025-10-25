/*
  Warnings:

  - You are about to drop the column `applicant_signature` on the `user` table. All the data in the column will be lost.
  - You are about to drop the column `application_date` on the `user` table. All the data in the column will be lost.
  - You are about to drop the column `permanent_address_barangay` on the `user` table. All the data in the column will be lost.
  - You are about to drop the column `permanent_address_city_municipality` on the `user` table. All the data in the column will be lost.
  - You are about to drop the column `permanent_address_house_no` on the `user` table. All the data in the column will be lost.
  - You are about to drop the column `permanent_address_province` on the `user` table. All the data in the column will be lost.
  - You are about to drop the column `permanent_address_street` on the `user` table. All the data in the column will be lost.
  - You are about to drop the column `present_address_barangay` on the `user` table. All the data in the column will be lost.
  - You are about to drop the column `present_address_city_municipality` on the `user` table. All the data in the column will be lost.
  - You are about to drop the column `present_address_house_no` on the `user` table. All the data in the column will be lost.
  - You are about to drop the column `present_address_province` on the `user` table. All the data in the column will be lost.
  - You are about to drop the column `present_address_street` on the `user` table. All the data in the column will be lost.
  - You are about to alter the column `civil_status` on the `user` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Enum(EnumId(2))`.
  - You are about to alter the column `nationality` on the `user` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Enum(EnumId(1))`.

*/
-- AlterTable
ALTER TABLE `user` DROP COLUMN `applicant_signature`,
    DROP COLUMN `application_date`,
    DROP COLUMN `permanent_address_barangay`,
    DROP COLUMN `permanent_address_city_municipality`,
    DROP COLUMN `permanent_address_house_no`,
    DROP COLUMN `permanent_address_province`,
    DROP COLUMN `permanent_address_street`,
    DROP COLUMN `present_address_barangay`,
    DROP COLUMN `present_address_city_municipality`,
    DROP COLUMN `present_address_house_no`,
    DROP COLUMN `present_address_province`,
    DROP COLUMN `present_address_street`,
    ADD COLUMN `address_barangay` VARCHAR(191) NULL,
    ADD COLUMN `address_city_municipality` VARCHAR(191) NULL,
    ADD COLUMN `address_house_no` VARCHAR(191) NULL,
    ADD COLUMN `address_province` VARCHAR(191) NULL,
    ADD COLUMN `address_street` VARCHAR(191) NULL,
    MODIFY `civil_status` ENUM('Single', 'Married', 'Widowed', 'Divorced', 'Separated') NULL,
    MODIFY `nationality` ENUM('Filipino', 'American', 'Chinese', 'Japanese', 'Korean', 'Other') NULL;
