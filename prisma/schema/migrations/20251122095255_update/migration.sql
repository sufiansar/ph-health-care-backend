/*
  Warnings:

  - A unique constraint covering the columns `[id]` on the table `patients` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "patients_id_key" ON "patients"("id");
