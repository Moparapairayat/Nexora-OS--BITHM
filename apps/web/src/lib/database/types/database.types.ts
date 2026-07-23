/**
 * Nexora OS — Database & Repository Type Definitions
 */

import { UserRole, UserStatus, AssignmentStatus, LabReportStatus } from "@prisma/client";

export interface UserCreateInput {
  email: string;
  name: string;
  passwordHash: string;
  role?: UserRole;
  status?: UserStatus;
  departmentId?: string;
  courseId?: string;
  unitId?: string;
  batchId?: string;
}

export interface UserUpdateInput {
  name?: string;
  email?: string;
  role?: UserRole;
  status?: UserStatus;
}

export interface DatabaseHealthStatus {
  connected: boolean;
  provider: string;
  latencyMs: number;
  error?: string;
  timestamp: string;
}
