/*
  Warnings:

  - You are about to drop the column `avgRating` on the `doctors` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "doctors" DROP COLUMN "avgRating",
ADD COLUMN     "averageRating" DOUBLE PRECISION NOT NULL DEFAULT 0;
