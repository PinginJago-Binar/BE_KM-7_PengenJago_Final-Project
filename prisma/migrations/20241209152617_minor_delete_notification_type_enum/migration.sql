/*
  Warnings:

  - Changed the type of `notif_type` on the `notifications` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "notifications" DROP COLUMN "notif_type",
ADD COLUMN     "notif_type" TEXT NOT NULL;

-- DropEnum
DROP TYPE "NotifType";
