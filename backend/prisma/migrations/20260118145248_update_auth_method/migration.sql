/*
  Warnings:

  - Changed the type of `method` on the `auth_identities` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "auth_identities" DROP COLUMN "method",
ADD COLUMN     "method" TEXT NOT NULL;

-- DropEnum
DROP TYPE "AuthMethod";
