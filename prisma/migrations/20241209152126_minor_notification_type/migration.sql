/*
  Warnings:

  - The values [Promosi,Notifikasi] on the enum `NotifType` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "NotifType_new" AS ENUM ('promosi', 'notifikasi');
ALTER TABLE "notifications" ALTER COLUMN "notif_type" TYPE "NotifType_new" USING ("notif_type"::text::"NotifType_new");
ALTER TYPE "NotifType" RENAME TO "NotifType_old";
ALTER TYPE "NotifType_new" RENAME TO "NotifType";
DROP TYPE "NotifType_old";
COMMIT;
