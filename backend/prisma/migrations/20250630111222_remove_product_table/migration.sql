/*
  Warnings:

  - You are about to drop the `product` table. If the table is not empty, all the data it contains will be lost.

*/
-- AlterTable
ALTER TABLE `products` ADD COLUMN `categoryId` INTEGER NULL;

-- DropTable
DROP TABLE `product`;
