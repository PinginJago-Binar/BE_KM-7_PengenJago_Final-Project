/*
  Warnings:

  - Added the required column `notif_type` to the `notifications` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "NotifType" AS ENUM ('Promosi', 'Notifikasi');

-- AlterTable
ALTER TABLE "notifications" ADD COLUMN     "notif_type" "NotifType" NOT NULL;
