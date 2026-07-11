import type { ReactNode } from "react";

import type { SchemaDialect } from "@/features/database-visualizer/schema-parser";

// Dependency-free highlighter for DBML / SQL / Prisma / Mongoose. Designed
// for Nexora's light academic IDE surface.

type Kind =
  | "keyword"
  | "type"
  | "string"
  | "number"
  | "comment"
  | "attr"
  | "ident"
  | "punct"
  | "operator"
  | "plain";

const COLOR: Record<Kind, string> = {
  keyword: "text-[#6CF6B3] light:text-[#008F5A]",
  type: "text-[#7DD3FC] light:text-[#1A7CFF]",
  string: "text-[#FFB45A] light:text-[#B45309]",
  number: "text-[#D9FF57] light:text-[#7C3AED]",
  comment: "text-[#6E7A72] italic light:text-[#94A3B8]",
  attr: "text-[#D9FF57] light:text-[#7C4DFF]",
  ident: "text-[#F5F7F2] light:text-[#0B1B33]",
  punct: "text-[#A7B3AA] light:text-[#475569]",
  operator: "text-[#32F59A] light:text-[#008F5A]",
  plain: "text-[#F5F7F2] light:text-[#0B1B33]",
};

const SQL_KEYWORDS = new Set([
  "create",
  "table",
  "primary",
  "key",
  "foreign",
  "references",
  "not",
  "null",
  "unique",
  "default",
  "constraint",
  "if",
  "exists",
  "index",
  "on",
  "alter",
  "add",
  "drop",
  "check",
  "cascade",
  "auto_increment",
]);

const SQL_TYPES = new Set([
  "uuid",
  "varchar",
  "text",
  "integer",
  "int",
  "bigint",
  "smallint",
  "boolean",
  "bool",
  "timestamp",
  "datetime",
  "date",
  "enum",
  "float",
  "decimal",
  "char",
  "json",
]);

const DBML_KEYWORDS = new Set([
  "table",
  "ref",
  "enum",
  "project",
  "indexes",
  "note",
  "tablegroup",
]);

const DBML_ATTRS = new Set([
  "pk",
  "primary key",
  "unique",
  "not null",
  "null",
  "default",
  "ref",
  "increment",
]);

const DBML_TYPES = SQL_TYPES;

const PRISMA_KEYWORDS = new Set([
  "model",
  "enum",
  "generator",
  "datasource",
  "type",
]);

const PRISMA_TYPES = new Set([
  "String",
  "Int",
  "BigInt",
  "Float",
  "Decimal",
  "Boolean",
  "DateTime",
  "Json",
  "Bytes",
]);

const MONGOOSE_KEYWORDS = new Set([
  "const",
  "let",
  "var",
  "new",
  "function",
  "return",
  "module",
  "exports",
  "require",
  "import",
  "from",
  "export",
  "default",
]);

const MONGOOSE_TYPES = new Set([
  "String",
  "Number",
  "Boolean",
  "Date",
  "Buffer",
  "Mixed",
  "ObjectId",
  "Array",
  "Map",
  "Schema",
  "mongoose",
]);

function push(out: ReactNode[], text: string, kind: Kind, key: number) {
  if (!text) return;
  out.push(
    <span key={`${kind}-${key}-${text.length}`} className={COLOR[kind]}>
      {text}
    </span>,
  );
}

function tokenize(
  line: string,
  keywords: Set<string>,
  types: Set<string>,
  options: {
    commentPrefix: string;
    attrs?: Set<string>;
    prismaAttrs?: boolean;
  },
): ReactNode {
  if (!line) return <span>&nbsp;</span>;

  const out: ReactNode[] = [];

  // Comment to end of line.
  const commentIdx = line.indexOf(options.commentPrefix);
  let code = line;
  let trailing = "";
  if (commentIdx >= 0) {
    code = line.slice(0, commentIdx);
    trailing = line.slice(commentIdx);
  }

  const regex =
    /("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'|`(?:[^`\\]|\\.)*`)|(\b\d+(?:\.\d+)?\b)|(@[A-Za-z_][A-Za-z0-9_]*)|([A-Za-z_][A-Za-z0-9_]*)|(\s+)|([(){}[\],.:;])|([=+\-*/%<>!|&^~?])/g;

  let match: RegExpExecArray | null;
  let last = 0;
  let key = 0;

  while ((match = regex.exec(code)) !== null) {
    if (match.index > last) {
      push(out, code.slice(last, match.index), "plain", key++);
    }
    const [tok, str, num, attr, ident, ws, punct, op] = match;

    if (str !== undefined) push(out, str, "string", key++);
    else if (num !== undefined) push(out, num, "number", key++);
    else if (attr !== undefined && options.prismaAttrs) {
      push(out, attr, "attr", key++);
    } else if (ident !== undefined) {
      const lower = ident.toLowerCase();
      if (keywords.has(lower) || keywords.has(ident)) {
        push(out, ident, "keyword", key++);
      } else if (types.has(ident) || types.has(lower)) {
        push(out, ident, "type", key++);
      } else if (options.attrs?.has(lower)) {
        push(out, ident, "attr", key++);
      } else {
        push(out, ident, "ident", key++);
      }
    } else if (ws !== undefined) push(out, ws, "plain", key++);
    else if (punct !== undefined) push(out, punct, "punct", key++);
    else if (op !== undefined) push(out, op, "operator", key++);
    else push(out, tok, "plain", key++);

    last = match.index + tok.length;
  }
  if (last < code.length) push(out, code.slice(last), "plain", key++);

  if (trailing) push(out, trailing, "comment", key++);

  return <>{out}</>;
}

export function highlightLine(line: string, dialect: SchemaDialect): ReactNode {
  switch (dialect) {
    case "sql":
      return tokenize(line, SQL_KEYWORDS, SQL_TYPES, {
        commentPrefix: "--",
      });
    case "dbml":
      return tokenize(line, DBML_KEYWORDS, DBML_TYPES, {
        commentPrefix: "//",
        attrs: DBML_ATTRS,
      });
    case "prisma":
      return tokenize(line, PRISMA_KEYWORDS, PRISMA_TYPES, {
        commentPrefix: "//",
        prismaAttrs: true,
      });
    case "mongoose":
      return tokenize(line, MONGOOSE_KEYWORDS, MONGOOSE_TYPES, {
        commentPrefix: "//",
      });
    default:
      return <span className={COLOR.plain}>{line}</span>;
  }
}
