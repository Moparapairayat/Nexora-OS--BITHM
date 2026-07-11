// Lightweight, dependency-free schema parser for the Database Visualizer.
// Supports four input dialects:
//
//   - DBML       (dbdiagram-style)
//   - SQL DDL    (CREATE TABLE ...)
//   - Prisma     (model ... { ... })
//   - Mongoose   (const FooSchema = new Schema({ ... }))
//
// The goal is to parse "good enough" structures for live ERD rendering, not
// to be a fully spec-compliant parser. The output shape is intentionally
// matched to `schema-data.ts` (Table + Relationship) so the canvas component
// can render parsed schemas exactly like the mock data.
//
// Real production parsing can later replace these functions with calls to a
// proper backend parser without changing the page UI.

import type {
  Column,
  ColumnKey,
  ColumnType,
  Relationship,
  RelationshipKind,
  Table,
} from "@/features/database-visualizer/schema-data";

export type SchemaDialect = "dbml" | "sql" | "prisma" | "mongoose";

export type ParseIssue = {
  line: number;
  severity: "error" | "warning" | "info";
  message: string;
};

export type ParseResult = {
  tables: Table[];
  relationships: Relationship[];
  issues: ParseIssue[];
};

// ---------- Helpers ----------

const TYPE_ALIASES: Record<string, ColumnType> = {
  uuid: "UUID",
  string: "VARCHAR",
  varchar: "VARCHAR",
  text: "TEXT",
  longtext: "TEXT",
  int: "INTEGER",
  integer: "INTEGER",
  bigint: "INTEGER",
  smallint: "INTEGER",
  number: "INTEGER",
  float: "INTEGER",
  decimal: "INTEGER",
  boolean: "BOOLEAN",
  bool: "BOOLEAN",
  timestamp: "TIMESTAMP",
  datetime: "TIMESTAMP",
  date: "TIMESTAMP",
  enum: "ENUM",
  objectid: "UUID",
};

function normalizeType(raw: string): { type: ColumnType; size?: number } {
  const cleaned = raw.replace(/[\[\]]/g, "").trim();
  const match = cleaned.match(/^([A-Za-z_]+)(?:\((\d+)(?:,\s*\d+)?\))?/);
  if (!match) return { type: "VARCHAR" };
  const base = match[1].toLowerCase();
  const size = match[2] ? Number(match[2]) : undefined;
  return { type: TYPE_ALIASES[base] ?? "VARCHAR", size };
}

function inferRelationshipKind(
  table: string,
  column: string,
  refTable: string,
  refColumn: string,
  allTables: Map<string, { columns: Column[] }>,
): RelationshipKind {
  // Heuristic:
  //  - A column marked unique pointing at another PK → one-to-one
  //  - A pair of foreign keys living on the same join table → many-to-many
  //  - Otherwise default to one-to-many.
  const fromTable = allTables.get(table);
  if (!fromTable) return "one-to-many";

  const fkCols = fromTable.columns.filter((c) => c.key === "fk");
  if (
    fkCols.length >= 2 &&
    fromTable.columns.every((c) => c.key === "fk" || c.key === "none")
  ) {
    return "many-to-many";
  }

  const col = fromTable.columns.find((c) => c.name === column);
  if (col?.key === "unique") {
    return "one-to-one";
  }

  return "one-to-many";
}

// Auto place tables in a tidy 3-column grid (mirrors the auto-layout used by
// the canvas).
function placeTables(tables: Table[]): Table[] {
  const colX = [40, 480, 920];
  const colYs = [40, 40, 40];
  return tables.map((table, idx) => {
    const colIdx = idx % 3;
    const x = colX[colIdx];
    const y = colYs[colIdx];
    const height = 44 + table.columns.length * 28 + 12;
    colYs[colIdx] += height + 40;
    return { ...table, x, y };
  });
}

function emptyTable(name: string): Table {
  return {
    id: name,
    name,
    description: "",
    rowCount: 0,
    indexes: 0,
    createdAt: new Date().toISOString().slice(0, 19).replace("T", " "),
    updatedAt: new Date().toISOString().slice(0, 19).replace("T", " "),
    columns: [],
    x: 0,
    y: 0,
  };
}

// ---------- DBML parser ----------

function parseDbml(input: string): ParseResult {
  const tables: Table[] = [];
  const relationships: Relationship[] = [];
  const issues: ParseIssue[] = [];
  const tableMap = new Map<string, Table>();

  const lines = input.split("\n");
  let current: Table | null = null;
  let inTable = false;

  lines.forEach((rawLine, lineIdx) => {
    const line = rawLine.trim();
    const ln = lineIdx + 1;

    if (!line || line.startsWith("//")) return;

    // Table T { ... }
    const tableStart = line.match(/^Table\s+([A-Za-z_][A-Za-z0-9_]*)\s*\{?/);
    if (tableStart && !inTable) {
      current = emptyTable(tableStart[1]);
      inTable = true;
      return;
    }

    // End of table block
    if (inTable && line === "}") {
      if (current) {
        tableMap.set(current.name, current);
        tables.push(current);
      }
      current = null;
      inTable = false;
      return;
    }

    // Standalone Ref: users.id < posts.user_id
    const refLine = line.match(
      /^Ref(?:\s+\w+)?:\s*([A-Za-z_][A-Za-z0-9_]*)\.([A-Za-z_][A-Za-z0-9_]*)\s*([-<>])\s*([A-Za-z_][A-Za-z0-9_]*)\.([A-Za-z_][A-Za-z0-9_]*)/,
    );
    if (refLine) {
      const [, t1, c1, op, t2, c2] = refLine;
      const kind: RelationshipKind =
        op === "-" ? "one-to-one" : op === "<" ? "one-to-many" : "one-to-many";
      relationships.push({
        id: `ref-${relationships.length + 1}`,
        from: { table: t1, column: c1 },
        to: { table: t2, column: c2 },
        kind,
      });
      return;
    }

    if (!inTable || !current) return;

    // Column line: name type [pk, ref: > other.id, unique, not null, default: x]
    const colMatch = line.match(
      /^([A-Za-z_][A-Za-z0-9_]*)\s+([A-Za-z_]+(?:\(\d+(?:,\s*\d+)?\))?)\s*(?:\[(.*)\])?$/,
    );
    if (!colMatch) {
      issues.push({
        line: ln,
        severity: "warning",
        message: `Could not parse DBML line: "${rawLine.trim()}"`,
      });
      return;
    }
    const [, name, rawType, opts] = colMatch;
    const { type, size } = normalizeType(rawType);
    let key: ColumnKey = "none";
    let nullable: boolean | undefined;
    let defaultValue: string | undefined;
    let references: Column["references"] | undefined;

    if (opts) {
      const parts = opts.split(",").map((p) => p.trim());
      for (const part of parts) {
        const lower = part.toLowerCase();
        if (lower === "pk" || lower === "primary key") key = "pk";
        else if (lower === "unique") key = key === "pk" ? "pk" : "unique";
        else if (lower === "not null") nullable = false;
        else if (lower === "null") nullable = true;
        else if (lower.startsWith("default:")) {
          defaultValue = part.split(":")[1]?.trim();
        } else if (lower.startsWith("ref:")) {
          const refMatch = part.match(
            /ref:\s*[-<>]\s*([A-Za-z_][A-Za-z0-9_]*)\.([A-Za-z_][A-Za-z0-9_]*)/,
          );
          if (refMatch) {
            key = key === "pk" ? "pk" : "fk";
            references = { table: refMatch[1], column: refMatch[2] };
          }
        }
      }
    }

    current.columns.push({
      name,
      type,
      size,
      key,
      nullable,
      defaultValue,
      references,
    });
  });

  const unfinishedTable = current as Table | null;
  if (inTable && unfinishedTable) {
    issues.push({
      line: lines.length,
      severity: "error",
      message: `Table "${unfinishedTable.name}" is missing a closing "}".`,
    });
  }

  // Promote inline `ref:` markers to relationships.
  for (const table of tables) {
    for (const col of table.columns) {
      if (col.references) {
        relationships.push({
          id: `inline-${table.name}-${col.name}`,
          from: { table: col.references.table, column: col.references.column },
          to: { table: table.name, column: col.name },
          kind: inferRelationshipKind(
            table.name,
            col.name,
            col.references.table,
            col.references.column,
            new Map(tables.map((t) => [t.name, { columns: t.columns }])),
          ),
        });
      }
    }
  }

  return { tables: placeTables(tables), relationships, issues };
}

// ---------- SQL DDL parser ----------

function parseSql(input: string): ParseResult {
  const tables: Table[] = [];
  const relationships: Relationship[] = [];
  const issues: ParseIssue[] = [];

  // Strip block comments and split into statements.
  const stripped = input
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/--.*$/gm, "");

  const stmtRegex =
    /CREATE\s+TABLE\s+(?:IF\s+NOT\s+EXISTS\s+)?[`"]?([A-Za-z_][A-Za-z0-9_]*)[`"]?\s*\(([\s\S]*?)\)\s*;/gi;
  let match: RegExpExecArray | null;
  while ((match = stmtRegex.exec(stripped)) !== null) {
    const [, tableName, body] = match;
    const table = emptyTable(tableName);

    // Split body by commas not inside parens.
    const parts: string[] = [];
    let depth = 0;
    let buf = "";
    for (const ch of body) {
      if (ch === "(") depth++;
      else if (ch === ")") depth--;
      if (ch === "," && depth === 0) {
        parts.push(buf);
        buf = "";
        continue;
      }
      buf += ch;
    }
    if (buf.trim()) parts.push(buf);

    let pkColumnNames: string[] = [];

    for (const rawPart of parts) {
      const part = rawPart.trim();
      if (!part) continue;
      const lower = part.toLowerCase();

      // PRIMARY KEY (col1, col2)
      const pkMatch = part.match(/^PRIMARY\s+KEY\s*\(([^)]+)\)/i);
      if (pkMatch) {
        pkColumnNames = pkMatch[1]
          .split(",")
          .map((s) => s.replace(/[`"\s]/g, ""));
        continue;
      }

      // FOREIGN KEY (col) REFERENCES other(col2)
      const fkMatch = part.match(
        /^FOREIGN\s+KEY\s*\(([^)]+)\)\s+REFERENCES\s+[`"]?([A-Za-z_][A-Za-z0-9_]*)[`"]?\s*\(([^)]+)\)/i,
      );
      if (fkMatch) {
        const localCol = fkMatch[1].replace(/[`"\s]/g, "");
        const refTable = fkMatch[2];
        const refCol = fkMatch[3].replace(/[`"\s]/g, "");
        const col = table.columns.find((c) => c.name === localCol);
        if (col) {
          col.key = col.key === "pk" ? "pk" : "fk";
          col.references = { table: refTable, column: refCol };
        }
        relationships.push({
          id: `sql-fk-${tableName}-${localCol}`,
          from: { table: refTable, column: refCol },
          to: { table: tableName, column: localCol },
          kind: "one-to-many",
        });
        continue;
      }

      // CONSTRAINT ... FOREIGN KEY (...)
      if (lower.startsWith("constraint")) {
        const cfkMatch = part.match(
          /FOREIGN\s+KEY\s*\(([^)]+)\)\s+REFERENCES\s+[`"]?([A-Za-z_][A-Za-z0-9_]*)[`"]?\s*\(([^)]+)\)/i,
        );
        if (cfkMatch) {
          const localCol = cfkMatch[1].replace(/[`"\s]/g, "");
          const refTable = cfkMatch[2];
          const refCol = cfkMatch[3].replace(/[`"\s]/g, "");
          const col = table.columns.find((c) => c.name === localCol);
          if (col) {
            col.key = col.key === "pk" ? "pk" : "fk";
            col.references = { table: refTable, column: refCol };
          }
          relationships.push({
            id: `sql-fk-${tableName}-${localCol}`,
            from: { table: refTable, column: refCol },
            to: { table: tableName, column: localCol },
            kind: "one-to-many",
          });
        }
        continue;
      }

      // Regular column: name TYPE [constraints...]
      const colMatch = part.match(
        /^[`"]?([A-Za-z_][A-Za-z0-9_]*)[`"]?\s+([A-Za-z_]+(?:\(\d+(?:,\s*\d+)?\))?)([\s\S]*)$/,
      );
      if (!colMatch) {
        issues.push({
          line: 0,
          severity: "warning",
          message: `Could not parse SQL column: "${part}"`,
        });
        continue;
      }
      const [, name, rawType, rest] = colMatch;
      const { type, size } = normalizeType(rawType);
      const restLower = rest.toLowerCase();

      let key: ColumnKey = "none";
      if (/\bprimary\s+key\b/.test(restLower)) key = "pk";
      else if (/\bunique\b/.test(restLower)) key = "unique";

      const nullable = /\bnot\s+null\b/.test(restLower)
        ? false
        : /\bnull\b/.test(restLower)
          ? true
          : undefined;

      const defaultMatch = rest.match(/DEFAULT\s+([^,\s]+)/i);
      const defaultValue = defaultMatch ? defaultMatch[1] : undefined;

      // Inline REFERENCES other(col)
      const inlineRef = rest.match(
        /REFERENCES\s+[`"]?([A-Za-z_][A-Za-z0-9_]*)[`"]?\s*\(([^)]+)\)/i,
      );
      let references: Column["references"] | undefined;
      if (inlineRef) {
        references = {
          table: inlineRef[1],
          column: inlineRef[2].replace(/[`"\s]/g, ""),
        };
        key = key === "pk" ? "pk" : "fk";
        relationships.push({
          id: `sql-inline-${tableName}-${name}`,
          from: { table: references.table, column: references.column },
          to: { table: tableName, column: name },
          kind: "one-to-many",
        });
      }

      table.columns.push({
        name,
        type,
        size,
        key,
        nullable,
        defaultValue,
        references,
      });
    }

    // Apply PRIMARY KEY (a, b) constraint discovered after columns.
    for (const pkName of pkColumnNames) {
      const col = table.columns.find((c) => c.name === pkName);
      if (col) col.key = "pk";
    }

    tables.push(table);
  }

  if (tables.length === 0) {
    issues.push({
      line: 1,
      severity: "info",
      message: "No CREATE TABLE statements found.",
    });
  }

  return { tables: placeTables(tables), relationships, issues };
}

// ---------- Prisma parser ----------

function parsePrisma(input: string): ParseResult {
  const tables: Table[] = [];
  const relationships: Relationship[] = [];
  const issues: ParseIssue[] = [];

  const modelRegex = /model\s+([A-Za-z_][A-Za-z0-9_]*)\s*\{([\s\S]*?)\}/g;
  let match: RegExpExecArray | null;
  while ((match = modelRegex.exec(input)) !== null) {
    const [, modelName, body] = match;
    const table = emptyTable(modelName);

    const bodyLines = body.split("\n");
    for (const rawLine of bodyLines) {
      const line = rawLine.trim();
      if (!line || line.startsWith("//") || line.startsWith("@@")) continue;

      // name Type[?]  @attr
      const colMatch = line.match(
        /^([A-Za-z_][A-Za-z0-9_]*)\s+([A-Za-z_]+)(\??)(\[\])?(.*)$/,
      );
      if (!colMatch) continue;
      const [, name, rawType, optional, list, rest] = colMatch;

      // Skip Prisma relation virtual fields (PascalCase referencing model).
      const isVirtualRelation =
        /^[A-Z]/.test(rawType) &&
        !/^Int$|^String$|^DateTime$|^Boolean$|^Float$|^Decimal$|^Json$|^Bytes$/.test(
          rawType,
        );
      if (list || (isVirtualRelation && !/@relation/.test(rest))) {
        // Many-to-many or list relation. Skip but record relationship later
        // when the foreign side has @relation.
        continue;
      }
      if (isVirtualRelation && /@relation/.test(rest)) {
        // Extract fields and references.
        const relMatch = rest.match(
          /@relation\(([^)]*)fields:\s*\[([^\]]+)\]\s*,\s*references:\s*\[([^\]]+)\]/,
        );
        if (relMatch) {
          const fields = relMatch[2].split(",").map((s) => s.trim());
          const refs = relMatch[3].split(",").map((s) => s.trim());
          fields.forEach((field, idx) => {
            relationships.push({
              id: `prisma-${modelName}-${field}`,
              from: { table: rawType.toLowerCase(), column: refs[idx] },
              to: { table: modelName.toLowerCase(), column: field },
              kind: "one-to-many",
            });
            const fk = table.columns.find((c) => c.name === field);
            if (fk) {
              fk.key = fk.key === "pk" ? "pk" : "fk";
              fk.references = {
                table: rawType.toLowerCase(),
                column: refs[idx],
              };
            }
          });
        }
        continue;
      }

      const { type, size } = normalizeType(rawType);

      let key: ColumnKey = "none";
      if (/@id\b/.test(rest)) key = "pk";
      else if (/@unique\b/.test(rest)) key = "unique";

      const nullable = optional === "?";
      const defaultMatch = rest.match(/@default\(([^)]+)\)/);
      const defaultValue = defaultMatch ? defaultMatch[1] : undefined;

      table.columns.push({
        name,
        type,
        size,
        key,
        nullable,
        defaultValue,
      });
    }

    if (table.columns.length === 0) {
      issues.push({
        line: 0,
        severity: "warning",
        message: `Prisma model "${modelName}" has no scalar columns.`,
      });
    }

    table.id = modelName.toLowerCase();
    table.name = modelName.toLowerCase();
    tables.push(table);
  }

  // Normalize relationship table names to match table ids (lower-case).
  for (const rel of relationships) {
    rel.from.table = rel.from.table.toLowerCase();
    rel.to.table = rel.to.table.toLowerCase();
  }

  return { tables: placeTables(tables), relationships, issues };
}

// ---------- Mongoose parser ----------

function parseMongoose(input: string): ParseResult {
  const tables: Table[] = [];
  const relationships: Relationship[] = [];
  const issues: ParseIssue[] = [];

  // const FooSchema = new Schema({ ... });  OR
  // const FooSchema = mongoose.Schema({ ... });
  const schemaRegex =
    /const\s+([A-Za-z_][A-Za-z0-9_]*)Schema\s*=\s*(?:new\s+)?(?:mongoose\.)?Schema\s*\(\s*\{([\s\S]*?)\}\s*[,)]/g;

  let match: RegExpExecArray | null;
  while ((match = schemaRegex.exec(input)) !== null) {
    const [, name, body] = match;
    const tableName = name.toLowerCase();
    const table = emptyTable(tableName);

    // Always add an implicit _id PK.
    table.columns.push({ name: "_id", type: "UUID", key: "pk" });

    // Field lines like:  name: { type: String, required: true, unique: true },
    //                    age: Number,
    //                    user: { type: ObjectId, ref: "User" },
    const fieldRegex =
      /([A-Za-z_][A-Za-z0-9_]*)\s*:\s*(\{[^{}]*\}|[A-Za-z_]+)\s*,?/g;
    let fm: RegExpExecArray | null;
    while ((fm = fieldRegex.exec(body)) !== null) {
      const [, fieldName, def] = fm;
      let rawType = "String";
      let key: ColumnKey = "none";
      let nullable: boolean | undefined;
      let references: Column["references"] | undefined;

      if (def.startsWith("{")) {
        const typeMatch = def.match(/type\s*:\s*([A-Za-z_]+)/);
        if (typeMatch) rawType = typeMatch[1];
        if (/required\s*:\s*true/.test(def)) nullable = false;
        if (/unique\s*:\s*true/.test(def)) key = "unique";
        const refMatch = def.match(
          /ref\s*:\s*["']([A-Za-z_][A-Za-z0-9_]*)["']/,
        );
        if (refMatch) {
          const refTable = refMatch[1].toLowerCase();
          references = { table: refTable, column: "_id" };
          key = "fk";
          relationships.push({
            id: `mongo-${tableName}-${fieldName}`,
            from: { table: refTable, column: "_id" },
            to: { table: tableName, column: fieldName },
            kind: "one-to-many",
          });
        }
      } else {
        rawType = def;
      }

      const { type, size } = normalizeType(rawType);
      table.columns.push({
        name: fieldName,
        type,
        size,
        key,
        nullable,
        references,
      });
    }

    if (table.columns.length === 1) {
      issues.push({
        line: 0,
        severity: "warning",
        message: `Mongoose schema "${name}" has no user-defined fields.`,
      });
    }

    tables.push(table);
  }

  return { tables: placeTables(tables), relationships, issues };
}

// ---------- Public API ----------

export function parseSchema(
  input: string,
  dialect: SchemaDialect,
): ParseResult {
  try {
    if (dialect === "dbml") return parseDbml(input);
    if (dialect === "sql") return parseSql(input);
    if (dialect === "prisma") return parsePrisma(input);
    return parseMongoose(input);
  } catch (error) {
    return {
      tables: [],
      relationships: [],
      issues: [
        {
          line: 1,
          severity: "error",
          message: `Parser crashed: ${(error as Error).message}`,
        },
      ],
    };
  }
}

// ---------- Sample documents ----------

export const sampleDocuments: Record<SchemaDialect, string> = {
  dbml: `// Nexora OS — Academic schema (DBML)

Table users {
  id uuid [pk]
  name varchar(100) [not null]
  email varchar(150) [unique, not null]
  password varchar(255) [not null]
  status enum [default: active]
  created_at timestamp
}

Table roles {
  id uuid [pk]
  name varchar(50) [unique]
  description text
}

Table user_roles {
  user_id uuid [ref: > users.id]
  role_id uuid [ref: > roles.id]
  assigned_at timestamp
}

Table courses {
  id uuid [pk]
  title varchar(150)
  code varchar(20) [unique]
  credit integer
  created_at timestamp
}

Table enrollments {
  id uuid [pk]
  user_id uuid [ref: > users.id]
  course_id uuid [ref: > courses.id]
  enrolled_at timestamp
  status enum [default: active]
}

Table assignments {
  id uuid [pk]
  course_id uuid [ref: > courses.id]
  title varchar(150)
  due_date timestamp
  total_marks integer
}

Table submissions {
  id uuid [pk]
  assignment_id uuid [ref: > assignments.id]
  user_id uuid [ref: > users.id]
  submitted_at timestamp
  marks integer
}
`,
  sql: `-- Nexora OS — Academic schema (SQL DDL)

CREATE TABLE users (
  id UUID PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(150) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  status VARCHAR(20) DEFAULT 'active',
  created_at TIMESTAMP NOT NULL
);

CREATE TABLE roles (
  id UUID PRIMARY KEY,
  name VARCHAR(50) UNIQUE,
  description TEXT
);

CREATE TABLE user_roles (
  user_id UUID REFERENCES users(id),
  role_id UUID REFERENCES roles(id),
  assigned_at TIMESTAMP
);

CREATE TABLE courses (
  id UUID PRIMARY KEY,
  title VARCHAR(150) NOT NULL,
  code VARCHAR(20) UNIQUE,
  credit INTEGER
);

CREATE TABLE enrollments (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  course_id UUID REFERENCES courses(id),
  enrolled_at TIMESTAMP,
  status VARCHAR(20) DEFAULT 'active'
);

CREATE TABLE assignments (
  id UUID PRIMARY KEY,
  course_id UUID REFERENCES courses(id),
  title VARCHAR(150),
  due_date TIMESTAMP,
  total_marks INTEGER
);

CREATE TABLE submissions (
  id UUID PRIMARY KEY,
  assignment_id UUID REFERENCES assignments(id),
  user_id UUID REFERENCES users(id),
  submitted_at TIMESTAMP,
  marks INTEGER
);
`,
  prisma: `// Nexora OS — Academic schema (Prisma)

model User {
  id        String   @id @default(uuid())
  name      String
  email     String   @unique
  password  String
  status    String   @default("active")
  createdAt DateTime @default(now())
}

model Role {
  id          String @id @default(uuid())
  name        String @unique
  description String?
}

model Course {
  id      String @id @default(uuid())
  title   String
  code    String @unique
  credit  Int
}

model Enrollment {
  id         String   @id @default(uuid())
  userId     String
  courseId   String
  enrolledAt DateTime
  status     String   @default("active")
  user       User     @relation(fields: [userId], references: [id])
  course     Course   @relation(fields: [courseId], references: [id])
}

model Assignment {
  id          String   @id @default(uuid())
  courseId    String
  title       String
  dueDate     DateTime
  totalMarks  Int
  course      Course   @relation(fields: [courseId], references: [id])
}
`,
  mongoose: `// Nexora OS — Academic schema (Mongoose)

const UserSchema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  status: { type: String }
}, { timestamps: true });

const RoleSchema = new Schema({
  name: { type: String, required: true, unique: true },
  description: String
});

const CourseSchema = new Schema({
  title: { type: String, required: true },
  code: { type: String, unique: true },
  credit: Number
});

const EnrollmentSchema = new Schema({
  user: { type: ObjectId, ref: "User" },
  course: { type: ObjectId, ref: "Course" },
  enrolledAt: Date,
  status: String
});

const AssignmentSchema = new Schema({
  course: { type: ObjectId, ref: "Course" },
  title: String,
  dueDate: Date,
  totalMarks: Number
});
`,
};
