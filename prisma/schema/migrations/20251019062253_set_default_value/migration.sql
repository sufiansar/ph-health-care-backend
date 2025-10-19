-- AlterTable
ALTER TABLE "appointments" ALTER COLUMN "status" SET DEFAULT 'SCHEDULE',
ALTER COLUMN "paymentStatus" SET DEFAULT 'UNPAID';

-- AlterTable
ALTER TABLE "payments" ALTER COLUMN "status" SET DEFAULT 'UNPAID';
