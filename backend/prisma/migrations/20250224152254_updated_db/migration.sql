/*
  Warnings:

  - The `process` column on the `Play` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "Play" DROP COLUMN "process",
ADD COLUMN     "process" JSONB[];
