// Mock schema for the Database Visualizer page. Designed to feel like a real
// academic platform's database: users, roles, courses, assignments,
// submissions, enrollments, labs, lab_submissions, announcements.

export type ColumnType =
  | "UUID"
  | "VARCHAR"
  | "TEXT"
  | "TIMESTAMP"
  | "INTEGER"
  | "ENUM"
  | "BOOLEAN";

export type ColumnKey = "pk" | "fk" | "unique" | "index" | "none";

export type Column = {
  name: string;
  type: ColumnType;
  size?: number;
  key: ColumnKey;
  nullable?: boolean;
  defaultValue?: string;
  references?: { table: string; column: string };
};

export type Table = {
  id: string;
  name: string;
  description: string;
  rowCount: number;
  indexes: number;
  createdAt: string;
  updatedAt: string;
  columns: Column[];
  // Canvas layout (px). Mirrors what a saved auto-layout would produce.
  x: number;
  y: number;
};

export type RelationshipKind = "one-to-one" | "one-to-many" | "many-to-many";

export type Relationship = {
  id: string;
  from: { table: string; column: string };
  to: { table: string; column: string };
  kind: RelationshipKind;
  label?: string;
};

// ---------- Tables ----------

export const tables: Table[] = [
  {
    id: "users",
    name: "users",
    description:
      "Stores all users of the system including students, teachers and admins.",
    rowCount: 1248,
    indexes: 2,
    createdAt: "2024-05-12 10:30:45",
    updatedAt: "2024-06-01 09:15:22",
    x: 40,
    y: 40,
    columns: [
      { name: "id", type: "UUID", key: "pk" },
      { name: "name", type: "VARCHAR", size: 100, key: "none" },
      { name: "email", type: "VARCHAR", size: 150, key: "unique" },
      { name: "password", type: "VARCHAR", size: 255, key: "none" },
      {
        name: "avatar",
        type: "VARCHAR",
        size: 255,
        key: "none",
        nullable: true,
      },
      { name: "status", type: "ENUM", key: "none", defaultValue: "active" },
      { name: "created_at", type: "TIMESTAMP", key: "none" },
      { name: "updated_at", type: "TIMESTAMP", key: "none" },
    ],
  },
  {
    id: "roles",
    name: "roles",
    description: "Role catalog (student, teacher, admin).",
    rowCount: 3,
    indexes: 1,
    createdAt: "2024-05-12 10:30:45",
    updatedAt: "2024-05-12 10:30:45",
    x: 40,
    y: 430,
    columns: [
      { name: "id", type: "UUID", key: "pk" },
      { name: "name", type: "VARCHAR", size: 50, key: "unique" },
      { name: "description", type: "TEXT", key: "none", nullable: true },
    ],
  },
  {
    id: "user_roles",
    name: "user_roles",
    description: "Join table that maps users to roles (many-to-many).",
    rowCount: 3,
    indexes: 2,
    createdAt: "2024-05-12 10:31:02",
    updatedAt: "2024-05-30 18:21:10",
    x: 380,
    y: 240,
    columns: [
      {
        name: "user_id",
        type: "UUID",
        key: "fk",
        references: { table: "users", column: "id" },
      },
      {
        name: "role_id",
        type: "UUID",
        key: "fk",
        references: { table: "roles", column: "id" },
      },
      { name: "assigned_at", type: "TIMESTAMP", key: "none" },
    ],
  },
  {
    id: "courses",
    name: "courses",
    description: "Courses offered by the institution.",
    rowCount: 7,
    indexes: 2,
    createdAt: "2024-05-15 09:10:00",
    updatedAt: "2024-06-02 11:45:00",
    x: 720,
    y: 40,
    columns: [
      { name: "id", type: "UUID", key: "pk" },
      { name: "title", type: "VARCHAR", size: 150, key: "none" },
      { name: "code", type: "VARCHAR", size: 20, key: "unique" },
      { name: "description", type: "TEXT", key: "none", nullable: true },
      { name: "credit", type: "INTEGER", key: "none" },
      { name: "created_at", type: "TIMESTAMP", key: "none" },
    ],
  },
  {
    id: "enrollments",
    name: "enrollments",
    description: "Tracks which user is enrolled in which course.",
    rowCount: 4,
    indexes: 2,
    createdAt: "2024-05-20 14:02:11",
    updatedAt: "2024-06-01 09:15:22",
    x: 380,
    y: 520,
    columns: [
      { name: "id", type: "UUID", key: "pk" },
      {
        name: "user_id",
        type: "UUID",
        key: "fk",
        references: { table: "users", column: "id" },
      },
      {
        name: "course_id",
        type: "UUID",
        key: "fk",
        references: { table: "courses", column: "id" },
      },
      { name: "enrolled_at", type: "TIMESTAMP", key: "none" },
      { name: "status", type: "ENUM", key: "none", defaultValue: "active" },
    ],
  },
  {
    id: "assignments",
    name: "assignments",
    description: "Assignments created for each course.",
    rowCount: 8,
    indexes: 2,
    createdAt: "2024-05-22 09:00:00",
    updatedAt: "2024-06-03 10:11:00",
    x: 1060,
    y: 280,
    columns: [
      { name: "id", type: "UUID", key: "pk" },
      {
        name: "course_id",
        type: "UUID",
        key: "fk",
        references: { table: "courses", column: "id" },
      },
      { name: "title", type: "VARCHAR", size: 150, key: "none" },
      { name: "description", type: "TEXT", key: "none", nullable: true },
      { name: "due_date", type: "TIMESTAMP", key: "none" },
      { name: "total_marks", type: "INTEGER", key: "none" },
    ],
  },
  {
    id: "submissions",
    name: "submissions",
    description: "Student submissions for assignments with marks and feedback.",
    rowCount: 7,
    indexes: 2,
    createdAt: "2024-05-28 16:10:00",
    updatedAt: "2024-06-05 13:20:00",
    x: 1400,
    y: 280,
    columns: [
      { name: "id", type: "UUID", key: "pk" },
      {
        name: "assignment_id",
        type: "UUID",
        key: "fk",
        references: { table: "assignments", column: "id" },
      },
      {
        name: "user_id",
        type: "UUID",
        key: "fk",
        references: { table: "users", column: "id" },
      },
      { name: "submitted_at", type: "TIMESTAMP", key: "none" },
      { name: "marks", type: "INTEGER", key: "none", nullable: true },
      { name: "feedback", type: "TEXT", key: "none", nullable: true },
    ],
  },
  {
    id: "labs",
    name: "labs",
    description: "Lab tasks attached to courses.",
    rowCount: 6,
    indexes: 1,
    createdAt: "2024-05-25 09:30:00",
    updatedAt: "2024-06-02 09:00:00",
    x: 1060,
    y: 620,
    columns: [
      { name: "id", type: "UUID", key: "pk" },
      {
        name: "course_id",
        type: "UUID",
        key: "fk",
        references: { table: "courses", column: "id" },
      },
      { name: "title", type: "VARCHAR", size: 150, key: "none" },
      { name: "type", type: "VARCHAR", size: 50, key: "none" },
      { name: "max_marks", type: "INTEGER", key: "none" },
    ],
  },
  {
    id: "lab_submissions",
    name: "lab_submissions",
    description: "Student submissions for labs with marks.",
    rowCount: 6,
    indexes: 2,
    createdAt: "2024-05-29 11:11:00",
    updatedAt: "2024-06-05 14:00:00",
    x: 1400,
    y: 620,
    columns: [
      { name: "id", type: "UUID", key: "pk" },
      {
        name: "lab_id",
        type: "UUID",
        key: "fk",
        references: { table: "labs", column: "id" },
      },
      {
        name: "user_id",
        type: "UUID",
        key: "fk",
        references: { table: "users", column: "id" },
      },
      { name: "submitted_at", type: "TIMESTAMP", key: "none" },
      { name: "marks", type: "INTEGER", key: "none", nullable: true },
    ],
  },
  {
    id: "announcements",
    name: "announcements",
    description: "Course-level announcements posted by teachers.",
    rowCount: 5,
    indexes: 1,
    createdAt: "2024-05-30 08:00:00",
    updatedAt: "2024-06-04 12:00:00",
    x: 720,
    y: 620,
    columns: [
      { name: "id", type: "UUID", key: "pk" },
      {
        name: "course_id",
        type: "UUID",
        key: "fk",
        references: { table: "courses", column: "id" },
      },
      { name: "title", type: "VARCHAR", size: 150, key: "none" },
      { name: "body", type: "TEXT", key: "none" },
      { name: "posted_at", type: "TIMESTAMP", key: "none" },
    ],
  },
];

// ---------- Relationships ----------

export const relationships: Relationship[] = [
  {
    id: "r1",
    from: { table: "users", column: "id" },
    to: { table: "user_roles", column: "user_id" },
    kind: "many-to-many",
    label: "users ↔ roles",
  },
  {
    id: "r2",
    from: { table: "roles", column: "id" },
    to: { table: "user_roles", column: "role_id" },
    kind: "many-to-many",
  },
  {
    id: "r3",
    from: { table: "users", column: "id" },
    to: { table: "enrollments", column: "user_id" },
    kind: "one-to-many",
  },
  {
    id: "r4",
    from: { table: "courses", column: "id" },
    to: { table: "enrollments", column: "course_id" },
    kind: "one-to-many",
  },
  {
    id: "r5",
    from: { table: "courses", column: "id" },
    to: { table: "assignments", column: "course_id" },
    kind: "one-to-many",
  },
  {
    id: "r6",
    from: { table: "assignments", column: "id" },
    to: { table: "submissions", column: "assignment_id" },
    kind: "one-to-many",
  },
  {
    id: "r7",
    from: { table: "users", column: "id" },
    to: { table: "submissions", column: "user_id" },
    kind: "one-to-many",
  },
  {
    id: "r8",
    from: { table: "courses", column: "id" },
    to: { table: "labs", column: "course_id" },
    kind: "one-to-many",
  },
  {
    id: "r9",
    from: { table: "labs", column: "id" },
    to: { table: "lab_submissions", column: "lab_id" },
    kind: "one-to-many",
  },
  {
    id: "r10",
    from: { table: "users", column: "id" },
    to: { table: "lab_submissions", column: "user_id" },
    kind: "one-to-many",
  },
  {
    id: "r11",
    from: { table: "courses", column: "id" },
    to: { table: "announcements", column: "course_id" },
    kind: "one-to-many",
  },
];

export type TableId = (typeof tables)[number]["id"];
