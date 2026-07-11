-- Admin-managed user lifecycle fields.
CREATE TYPE "UserStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'DELETED');

ALTER TABLE "User"
  ADD COLUMN "status" "UserStatus" NOT NULL DEFAULT 'ACTIVE',
  ADD COLUMN "courseId" TEXT,
  ADD COLUMN "unitId" TEXT,
  ADD COLUMN "deletedAt" TIMESTAMP(3);

CREATE INDEX "User_role_idx" ON "User"("role");
CREATE INDEX "User_status_idx" ON "User"("status");
CREATE INDEX "User_departmentId_idx" ON "User"("departmentId");
CREATE INDEX "User_courseId_idx" ON "User"("courseId");
CREATE INDEX "User_unitId_idx" ON "User"("unitId");

ALTER TABLE "User"
  ADD CONSTRAINT "User_courseId_fkey"
  FOREIGN KEY ("courseId") REFERENCES "Course"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "User"
  ADD CONSTRAINT "User_unitId_fkey"
  FOREIGN KEY ("unitId") REFERENCES "OthmUnit"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;
