/*
  Warnings:

  - You are about to drop the column `content` on the `GroupMessage` table. All the data in the column will be lost.
  - Added the required column `text` to the `GroupMessage` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "GroupMessage" DROP COLUMN "content",
ADD COLUMN     "text" TEXT NOT NULL;
