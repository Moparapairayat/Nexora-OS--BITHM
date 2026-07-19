"use client";

import type { DiagramOutput } from "@nexora/types";
import {
  AlertTriangle,
  Bot,
  CheckCircle2,
  Code2,
  Database,
  Download,
  FileCode2,
  FileText,
  Grid3x3,
  Hand,
  Eye,
  EyeOff,
  ImageDown,
  KeyRound,
  Link2,
  Maximize2,
  Minus,
  MousePointer2,
  Network,
  PanelRight,
  Plus,
  Save,
  Search,
  Share2,
  Sparkles,
  Shuffle,
  Table as TableIcon,
  Upload,
  Wand2,
  Zap,
  type LucideIcon,
} from "lucide-react";
import {
  type PointerEvent as ReactPointerEvent,
  useMemo,
  useRef,
  useState,
} from "react";

import { AppShell } from "@/components/layout/app-shell";
import { highlightLine } from "@/features/database-visualizer/dbml-highlight";
import {
  parseSchema,
  sampleDocuments,
  type ParseIssue,
  type SchemaDialect,
} from "@/features/database-visualizer/schema-parser";
import {
  type Column,
  type Relationship,
  type Table,
} from "@/features/database-visualizer/schema-data";
import { roleDashboards, type AppRole } from "@/data/dashboard.mock";
import { cn } from "@/lib/utils";
import { apiPost } from "@/services/api-client";

const panel =
  "rounded-[22px] border border-white/10 bg-[rgba(18,24,21,0.78)] shadow-[0_24px_70px_rgba(0,0,0,0.34)] light:border-slate-200/80 light:bg-white light:shadow-[0_18px_52px_rgba(33,45,74,0.08)]";
const compactButton =
  "inline-flex h-8 items-center justify-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.055] px-2.5 text-xs font-bold text-slate-200 transition hover:border-[color:var(--border-emerald)] hover:bg-[rgba(50,245,154,0.10)] hover:text-[var(--brand-lime)] light:border-slate-200 light:bg-white light:text-slate-700 light:hover:border-emerald-200 light:hover:bg-emerald-50 light:hover:text-emerald-700";
const compactIconButton =
  "grid h-8 w-8 place-items-center rounded-lg border border-white/10 bg-white/[0.055] text-slate-300 transition hover:border-[color:var(--border-emerald)] hover:bg-[rgba(50,245,154,0.10)] hover:text-[var(--brand-lime)] light:border-slate-200 light:bg-white light:text-slate-600 light:hover:border-emerald-200 light:hover:bg-emerald-50 light:hover:text-emerald-700";

const TABLE_WIDTH = 276;
const TABLE_HEADER_HEIGHT = 54;
const COLUMN_ROW_HEIGHT = 30;
const TABLE_FOOTER = 18;

type Selection =
  | { type: "table"; id: string }
  | { type: "relationship"; id: string };

type ExportFormat = "svg" | "png" | "pdf";
type CanvasTool = "select" | "pan";
type LayoutAlgorithm = 1 | 2 | 3;
type DiagramSaveResponse = {
  diagram: {
    id: string;
    title: string;
    updatedAt?: string;
  };
};
type DiagramExportResponse = {
  export: {
    id: string;
    diagramId: string;
    format: ExportFormat;
    fileName: string;
  };
};

type AiSuggestion = {
  title: string;
  detail: string;
  tone: "emerald" | "amber" | "blue";
};

const dialectMeta: Record<
  SchemaDialect,
  { label: string; extension: string; fileName: string; language: string }
> = {
  dbml: {
    label: "DBML",
    extension: "dbml",
    fileName: "academic_schema.dbml",
    language: "DBML",
  },
  sql: {
    label: "SQL DDL",
    extension: "sql",
    fileName: "academic_schema.sql",
    language: "PostgreSQL DDL",
  },
  prisma: {
    label: "Prisma",
    extension: "prisma",
    fileName: "schema.prisma",
    language: "Prisma Schema",
  },
  mongoose: {
    label: "Mongoose",
    extension: "js",
    fileName: "models.js",
    language: "Mongoose Model",
  },
};

function IconTile({
  icon: Icon,
  tone = "emerald",
}: {
  icon: LucideIcon;
  tone?: "emerald" | "amber" | "blue" | "violet" | "slate";
}) {
  const tones = {
    emerald:
      "bg-[rgba(50,245,154,0.10)] text-[var(--brand-emerald)] light:bg-emerald-50 light:text-emerald-700",
    amber:
      "bg-[rgba(255,180,90,0.12)] text-[#ffd29b] light:bg-amber-50 light:text-amber-700",
    blue: "bg-sky-400/10 text-sky-200 light:bg-sky-50 light:text-sky-700",
    violet:
      "bg-[rgba(217,255,87,0.10)] text-[var(--brand-lime)] light:bg-violet-50 light:text-violet-700",
    slate:
      "bg-white/[0.06] text-slate-300 light:bg-slate-100 light:text-slate-600",
  };

  return (
    <span
      className={cn(
        "grid h-10 w-10 shrink-0 place-items-center rounded-2xl",
        tones[tone],
      )}
    >
      <Icon className="h-4 w-4" aria-hidden="true" />
    </span>
  );
}

function StatPill({
  label,
  value,
  tone = "emerald",
}: {
  label: string;
  value: string | number;
  tone?: "emerald" | "amber" | "blue" | "violet";
}) {
  const tones = {
    emerald:
      "border-[color:var(--border-emerald)] bg-[rgba(50,245,154,0.10)] text-[var(--brand-emerald)] light:border-emerald-100 light:bg-emerald-50 light:text-emerald-700",
    amber:
      "border-amber-300/20 bg-amber-300/10 text-amber-100 light:border-amber-100 light:bg-amber-50 light:text-amber-700",
    blue: "border-sky-300/20 bg-sky-300/10 text-sky-100 light:border-sky-100 light:bg-sky-50 light:text-sky-700",
    violet:
      "border-[color:var(--border-lime)] bg-[rgba(217,255,87,0.10)] text-[var(--brand-lime)] light:border-violet-100 light:bg-violet-50 light:text-violet-700",
  };

  return (
    <div className={cn("rounded-2xl border px-3 py-2", tones[tone])}>
      <div className="font-mono text-lg font-bold leading-none">{value}</div>
      <div className="mt-1 text-[10px] font-bold uppercase tracking-[0.16em]">
        {label}
      </div>
    </div>
  );
}

function formatColumnType(column: Column) {
  return column.size ? `${column.type}(${column.size})` : column.type;
}

function tableHeight(table: Table) {
  return (
    TABLE_HEADER_HEIGHT +
    table.columns.length * COLUMN_ROW_HEIGHT +
    TABLE_FOOTER
  );
}

function relationshipColor(kind: Relationship["kind"]) {
  if (kind === "one-to-one") return "#059669";
  if (kind === "one-to-many") return "#0284c7";
  return "#7c3aed";
}

function relationshipDash(kind: Relationship["kind"]) {
  if (kind === "one-to-one") return undefined;
  if (kind === "one-to-many") return "8 6";
  return "3 6";
}

function columnBadge(column: Column) {
  if (column.key === "pk") {
    return {
      label: "PK",
      icon: KeyRound,
      className: "border-amber-100 bg-amber-50 text-amber-700",
    };
  }
  if (column.key === "fk") {
    return {
      label: "FK",
      icon: Link2,
      className: "border-sky-100 bg-sky-50 text-sky-700",
    };
  }
  if (column.key === "unique") {
    return {
      label: "UQ",
      icon: Zap,
      className: "border-violet-100 bg-violet-50 text-violet-700",
    };
  }
  return null;
}

function generateSuggestions(
  tables: Table[],
  relationships: Relationship[],
  issues: ParseIssue[],
): AiSuggestion[] {
  const noPrimaryKeys = tables.filter(
    (table) => !table.columns.some((column) => column.key === "pk"),
  );
  const highFkTables = tables.filter(
    (table) =>
      table.columns.filter((column) => column.key === "fk").length >= 2,
  );

  const suggestions: AiSuggestion[] = [
    {
      title: "Schema map generated",
      detail: `${tables.length} tables and ${relationships.length} relationships are ready for review.`,
      tone: "emerald",
    },
  ];

  if (noPrimaryKeys.length > 0) {
    suggestions.push({
      title: "Primary key check",
      detail: `${noPrimaryKeys.length} table${noPrimaryKeys.length === 1 ? "" : "s"} should define a primary key before production migration.`,
      tone: "amber",
    });
  }

  if (highFkTables.length > 0) {
    suggestions.push({
      title: "Relationship density",
      detail: `${highFkTables[0].name} looks like a join/workflow table. Add indexes for its foreign keys.`,
      tone: "blue",
    });
  }

  if (issues.some((issue) => issue.severity === "error")) {
    suggestions.push({
      title: "Parser attention needed",
      detail:
        "Resolve parser errors before exporting the diagram for documentation.",
      tone: "amber",
    });
  }

  return suggestions;
}

function formatSourceCode(source: string, dialect: SchemaDialect) {
  const lines = source
    .split("\n")
    .map((line) => line.replace(/\s+$/g, ""))
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

  if (dialect === "sql") {
    return lines.replace(/,\s*/g, ",\n  ").replace(/\(\n\s*/g, "(\n  ");
  }

  return lines;
}

function downloadBlob(fileName: string, type: string, content: string | Blob) {
  const blob =
    content instanceof Blob ? content : new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = fileName;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

function escapeXml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function buildExportSvg(tables: Table[], relationships: Relationship[]) {
  const width = Math.max(
    1200,
    ...tables.map((table) => table.x + TABLE_WIDTH + 80),
  );
  const height = Math.max(
    760,
    ...tables.map((table) => table.y + tableHeight(table) + 80),
  );
  const tableMap = new Map(tables.map((table) => [table.id, table]));

  const lines = relationships
    .map((relationship) => {
      const from = tableMap.get(relationship.from.table);
      const to = tableMap.get(relationship.to.table);
      if (!from || !to) return "";
      const fromCenter = {
        x: from.x + TABLE_WIDTH / 2,
        y: from.y + tableHeight(from) / 2,
      };
      const toCenter = {
        x: to.x + TABLE_WIDTH / 2,
        y: to.y + tableHeight(to) / 2,
      };
      const leftToRight = fromCenter.x <= toCenter.x;
      const x1 = leftToRight ? from.x + TABLE_WIDTH : from.x;
      const x2 = leftToRight ? to.x : to.x + TABLE_WIDTH;
      const y1 = fromCenter.y;
      const y2 = toCenter.y;
      const mid = (x1 + x2) / 2;
      return `<path d="M ${x1} ${y1} C ${mid} ${y1}, ${mid} ${y2}, ${x2} ${y2}" fill="none" stroke="${relationshipColor(
        relationship.kind,
      )}" stroke-width="3" stroke-dasharray="${relationshipDash(relationship.kind) ?? ""}" stroke-linecap="round"/>`;
    })
    .join("");

  const cards = tables
    .map((table) => {
      const height = tableHeight(table);
      const columns = table.columns
        .map((column, index) => {
          const y =
            table.y + TABLE_HEADER_HEIGHT + index * COLUMN_ROW_HEIGHT + 20;
          return `<text x="${table.x + 18}" y="${y}" fill="#334155" font-size="12" font-family="ui-monospace, monospace">${escapeXml(
            column.name,
          )}</text><text x="${table.x + TABLE_WIDTH - 18}" y="${y}" fill="#64748b" font-size="11" text-anchor="end" font-family="ui-monospace, monospace">${escapeXml(
            formatColumnType(column),
          )}</text>`;
        })
        .join("");

      return `<g><rect x="${table.x}" y="${table.y}" width="${TABLE_WIDTH}" height="${height}" rx="18" fill="#ffffff" stroke="#dbe7e2"/><rect x="${table.x}" y="${table.y}" width="${TABLE_WIDTH}" height="48" rx="18" fill="#ecfdf5"/><text x="${table.x + 18}" y="${table.y + 31}" fill="#064e3b" font-size="15" font-weight="700" font-family="Inter, Arial">${escapeXml(
        table.name,
      )}</text>${columns}</g>`;
    })
    .join("");

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}"><rect width="100%" height="100%" fill="#f8fcfa"/><defs><pattern id="grid" width="28" height="28" patternUnits="userSpaceOnUse"><path d="M 28 0 L 0 0 0 28" fill="none" stroke="#dbe7e2" stroke-width="1"/></pattern></defs><rect width="100%" height="100%" fill="url(#grid)" opacity="0.65"/><text x="36" y="42" fill="#064e3b" font-size="20" font-weight="800" font-family="Inter, Arial">Nexora OS Database Visualizer</text>${lines}${cards}</svg>`;
}

function toDiagramOutput(
  tables: Table[],
  relationships: Relationship[],
  source: string,
  dialect: SchemaDialect,
): DiagramOutput {
  return {
    entities: tables.map((table) => ({
      name: table.name,
      fields: table.columns.map((column) => ({
        name: column.name,
        type: formatColumnType(column),
        isPrimaryKey: column.key === "pk",
        isForeignKey: column.key === "fk",
        references: column.references
          ? `${column.references.table}.${column.references.column}`
          : undefined,
      })),
    })),
    relationships: relationships.map(
      (relationship) =>
        `${relationship.from.table}.${relationship.from.column} -> ${relationship.to.table}.${relationship.to.column}`,
    ),
    code: source,
    sourceType: dialect,
    exportFormats: ["png", "svg", "pdf"],
  };
}

async function exportDiagram(
  format: ExportFormat,
  tables: Table[],
  relationships: Relationship[],
  diagramName: string,
) {
  const svg = buildExportSvg(tables, relationships);
  const safeName =
    diagramName
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-") || "nexora-erd";

  if (format === "svg") {
    downloadBlob(`${safeName}.svg`, "image/svg+xml", svg);
    return;
  }

  if (format === "png") {
    const image = new Image();
    const url = URL.createObjectURL(new Blob([svg], { type: "image/svg+xml" }));
    await new Promise<void>((resolve, reject) => {
      image.onload = () => resolve();
      image.onerror = () =>
        reject(new Error("Could not render diagram export."));
      image.src = url;
    });
    const canvas = document.createElement("canvas");
    canvas.width = image.width * 2;
    canvas.height = image.height * 2;
    const context = canvas.getContext("2d");
    if (!context) throw new Error("Canvas export is not available.");
    context.fillStyle = "#f8fcfa";
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.scale(2, 2);
    context.drawImage(image, 0, 0);
    URL.revokeObjectURL(url);
    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, "image/png"),
    );
    if (blob) downloadBlob(`${safeName}.png`, "image/png", blob);
    return;
  }

  const printWindow = window.open("", "_blank", "width=1200,height=820");
  if (!printWindow) return;
  printWindow.document.write(
    `<!doctype html><html><head><title>${escapeXml(
      diagramName,
    )}</title><style>body{margin:0;background:#f8fcfa;font-family:Inter,Arial,sans-serif}.wrap{padding:24px}svg{max-width:100%;height:auto}@media print{.wrap{padding:0}}</style></head><body><div class="wrap">${svg}</div><script>window.onload=()=>window.print();</script></body></html>`,
  );
  printWindow.document.close();
}

function EditorTabs({
  dialect,
  onDialectChange,
}: {
  dialect: SchemaDialect;
  onDialectChange: (dialect: SchemaDialect) => void;
}) {
  const dialects: SchemaDialect[] = ["dbml", "sql", "prisma", "mongoose"];

  return (
    <div className="flex flex-wrap items-center gap-1 rounded-lg border border-white/10 bg-white/[0.045] p-1 light:border-emerald-100 light:bg-emerald-50/70">
      {dialects.map((item) => {
        const active = item === dialect;
        return (
          <button
            key={item}
            type="button"
            onClick={() => onDialectChange(item)}
            className={cn(
              "inline-flex h-7 items-center gap-1.5 rounded-md px-2 text-[11px] font-bold transition",
              active
                ? "bg-[rgba(50,245,154,0.12)] text-[var(--brand-lime)] shadow-[0_0_18px_rgba(50,245,154,0.12)] light:bg-white light:text-emerald-700 light:shadow-[0_8px_20px_rgba(33,45,74,0.08)]"
                : "text-slate-400 hover:bg-white/[0.07] hover:text-white light:text-slate-500 light:hover:bg-white/80 light:hover:text-slate-900",
            )}
            aria-pressed={active}
          >
            <FileCode2 className="h-3.5 w-3.5" aria-hidden="true" />
            {dialectMeta[item].label}
          </button>
        );
      })}
    </div>
  );
}

function DatabaseCodeEditor({
  value,
  dialect,
  onChange,
}: {
  value: string;
  dialect: SchemaDialect;
  onChange: (value: string) => void;
}) {
  const lines = value.split("\n");
  const [scroll, setScroll] = useState({ top: 0, left: 0 });

  return (
    <div className="relative h-[560px] min-h-0 flex-1 overflow-hidden bg-[#0d1110] font-mono text-[13px] leading-6 shadow-inner light:bg-[#fbfefd] lg:h-full">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-y-0 left-0 z-10 w-14 border-r border-white/10 bg-[#090d0b] text-right text-[12px] text-slate-500 light:border-slate-200 light:bg-slate-50 light:text-slate-400"
      >
        <div
          className="px-3 py-4"
          style={{ transform: `translateY(-${scroll.top}px)` }}
        >
          {lines.map((_, index) => (
            <div key={`ln-${index}`}>{index + 1}</div>
          ))}
        </div>
      </div>

      <pre
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 left-14 min-w-max whitespace-pre px-4 py-4"
        style={{
          transform: `translate(${-scroll.left}px, ${-scroll.top}px)`,
        }}
      >
        {lines.map((line, index) => (
          <div key={`hl-${index}`} className="h-6">
            {highlightLine(line, dialect)}
          </div>
        ))}
      </pre>

      <textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        onScroll={(event) =>
          setScroll({
            top: event.currentTarget.scrollTop,
            left: event.currentTarget.scrollLeft,
          })
        }
        spellCheck={false}
        wrap="off"
        aria-label="Database schema code editor"
        className="absolute inset-0 left-14 w-[calc(100%-3.5rem)] resize-none overflow-auto border-0 bg-transparent px-4 py-4 font-mono text-[13px] leading-6 text-transparent caret-[var(--brand-lime)] outline-none selection:bg-emerald-400/30 light:caret-emerald-600 light:selection:bg-emerald-200/70"
      />
    </div>
  );
}

function ParserIssuesPanel({ issues }: { issues: ParseIssue[] }) {
  const errors = issues.filter((issue) => issue.severity === "error").length;

  return (
    <div className="border-t border-white/10 bg-[rgba(18,24,21,0.88)] px-3 py-2 light:border-slate-200 light:bg-white">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          {errors ? (
            <AlertTriangle
              className="h-4 w-4 text-amber-300 light:text-amber-600"
              aria-hidden="true"
            />
          ) : (
            <CheckCircle2
              className="h-4 w-4 text-[var(--brand-emerald)] light:text-emerald-600"
              aria-hidden="true"
            />
          )}
          <div>
            <h3 className="text-xs font-bold text-white light:text-slate-900">
              Live diagnostics
            </h3>
            <p className="text-[11px] text-slate-500">
              Schema updates automatically while typing.
            </p>
          </div>
        </div>
        <span
          className={cn(
            "rounded-md px-2 py-1 text-[11px] font-bold",
            errors
              ? "bg-amber-300/10 text-amber-100 light:bg-amber-50 light:text-amber-700"
              : "bg-[rgba(50,245,154,0.10)] text-[var(--brand-emerald)] light:bg-emerald-50 light:text-emerald-700",
          )}
        >
          {issues.length || 0} issue{issues.length === 1 ? "" : "s"}
        </span>
      </div>

      <div className="mt-2 grid gap-2">
        {issues.length === 0 ? (
          <div className="rounded-lg border border-[color:var(--border-emerald)] bg-[rgba(50,245,154,0.08)] px-3 py-2 text-xs font-medium text-[var(--brand-emerald)] light:border-emerald-100 light:bg-emerald-50 light:text-emerald-700">
            Schema parsed successfully. Diagram preview is live.
          </div>
        ) : (
          issues.slice(0, 2).map((issue, index) => (
            <div
              key={`${issue.message}-${index}`}
              className="rounded-lg border border-amber-300/20 bg-amber-300/10 px-3 py-2 light:border-amber-100 light:bg-amber-50"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-amber-100 light:text-amber-700">
                  {issue.severity}
                </span>
                <span className="font-mono text-[11px] text-amber-200 light:text-amber-700">
                  line {issue.line || "-"}
                </span>
              </div>
              <p className="mt-1 text-xs leading-5 text-amber-100 light:text-amber-800">
                {issue.message}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function RelationshipPath({
  relationship,
  from,
  to,
  selected,
  highlightRelationships,
  onSelect,
}: {
  relationship: Relationship;
  from: Table;
  to: Table;
  selected: boolean;
  highlightRelationships: boolean;
  onSelect: () => void;
}) {
  const fromCenter = {
    x: from.x + TABLE_WIDTH / 2,
    y: from.y + tableHeight(from) / 2,
  };
  const toCenter = {
    x: to.x + TABLE_WIDTH / 2,
    y: to.y + tableHeight(to) / 2,
  };
  const leftToRight = fromCenter.x <= toCenter.x;
  const x1 = leftToRight ? from.x + TABLE_WIDTH : from.x;
  const x2 = leftToRight ? to.x : to.x + TABLE_WIDTH;
  const y1 = fromCenter.y;
  const y2 = toCenter.y;
  const mid = (x1 + x2) / 2;
  const color = relationshipColor(relationship.kind);
  const strokeColor = highlightRelationships || selected ? color : "#94A3B8";
  const relationshipOpacity = selected
    ? 1
    : highlightRelationships
      ? 0.74
      : 0.22;

  return (
    <g>
      <path
        d={`M ${x1} ${y1} C ${mid} ${y1}, ${mid} ${y2}, ${x2} ${y2}`}
        fill="none"
        stroke="transparent"
        strokeWidth="18"
        className="cursor-pointer"
        onClick={onSelect}
      />
      <path
        d={`M ${x1} ${y1} C ${mid} ${y1}, ${mid} ${y2}, ${x2} ${y2}`}
        fill="none"
        stroke={strokeColor}
        strokeWidth={selected ? 3.6 : highlightRelationships ? 2.4 : 1.8}
        strokeDasharray={relationshipDash(relationship.kind)}
        strokeLinecap="round"
        opacity={relationshipOpacity}
      />
      <circle
        cx={x1}
        cy={y1}
        r={selected ? 5 : 3.5}
        fill={strokeColor}
        opacity={relationshipOpacity}
      />
      <circle
        cx={x2}
        cy={y2}
        r={selected ? 5 : 3.5}
        fill="#ffffff"
        stroke={strokeColor}
        strokeWidth="2"
        opacity={relationshipOpacity}
      />
    </g>
  );
}

function TableNode({
  table,
  selected,
  zoom,
  stageRef,
  onSelect,
  onMove,
}: {
  table: Table;
  selected: boolean;
  zoom: number;
  stageRef: React.RefObject<HTMLDivElement | null>;
  onSelect: () => void;
  onMove: (id: string, next: { x: number; y: number }) => void;
}) {
  const dragOffset = useRef({ x: 0, y: 0 });

  function handlePointerDown(event: ReactPointerEvent<HTMLDivElement>) {
    const stage = stageRef.current;
    if (!stage) return;
    const rect = stage.getBoundingClientRect();
    dragOffset.current = {
      x: (event.clientX - rect.left) / (zoom / 100) - table.x,
      y: (event.clientY - rect.top) / (zoom / 100) - table.y,
    };
    event.currentTarget.setPointerCapture(event.pointerId);
    onSelect();
  }

  function handlePointerMove(event: ReactPointerEvent<HTMLDivElement>) {
    if (!event.currentTarget.hasPointerCapture(event.pointerId)) return;
    const stage = stageRef.current;
    if (!stage) return;
    const rect = stage.getBoundingClientRect();
    const nextX =
      (event.clientX - rect.left) / (zoom / 100) - dragOffset.current.x;
    const nextY =
      (event.clientY - rect.top) / (zoom / 100) - dragOffset.current.y;
    onMove(table.id, {
      x: Math.max(24, Math.round(nextX)),
      y: Math.max(24, Math.round(nextY)),
    });
  }

  function handlePointerUp(event: ReactPointerEvent<HTMLDivElement>) {
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  }

  return (
    <div
      role="button"
      tabIndex={0}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") onSelect();
      }}
      className={cn(
        "absolute cursor-grab overflow-hidden rounded-lg border bg-white text-left shadow-[0_12px_28px_rgba(15,23,42,0.14)] transition active:cursor-grabbing",
        selected
          ? "border-emerald-500 ring-4 ring-emerald-200/70"
          : "border-slate-300 hover:border-emerald-300",
      )}
      style={{
        left: table.x,
        top: table.y,
        width: TABLE_WIDTH,
        minHeight: tableHeight(table),
      }}
    >
      <div className="flex items-center justify-between gap-3 bg-[#0f5132] px-3 py-2 text-white">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <TableIcon
              className="h-3.5 w-3.5 text-[#D9FF57]"
              aria-hidden="true"
            />
            <h3 className="truncate font-mono text-sm font-bold text-white">
              {table.name}
            </h3>
          </div>
          <p className="mt-0.5 text-[10px] font-medium text-emerald-100">
            {table.columns.length} columns
          </p>
        </div>
        <MousePointer2
          className="h-3.5 w-3.5 text-emerald-100"
          aria-hidden="true"
        />
      </div>

      <div className="px-2 py-2">
        {table.columns.map((column) => {
          const badge = columnBadge(column);
          const BadgeIcon = badge?.icon;
          return (
            <div
              key={`${table.id}-${column.name}`}
              className="grid h-[30px] grid-cols-[minmax(0,1fr)_auto] items-center gap-3 rounded-md px-2 text-[12px] hover:bg-emerald-50/60"
            >
              <div className="flex min-w-0 items-center gap-2">
                {badge && BadgeIcon ? (
                  <span
                    className={cn(
                      "inline-flex h-5 items-center gap-1 rounded-md border px-1.5 text-[10px] font-bold",
                      badge.className,
                    )}
                  >
                    <BadgeIcon className="h-3 w-3" aria-hidden="true" />
                    {badge.label}
                  </span>
                ) : (
                  <span className="h-1.5 w-1.5 rounded-full bg-slate-300" />
                )}
                <span className="truncate font-mono font-semibold text-slate-700">
                  {column.name}
                </span>
              </div>
              <span className="font-mono text-[11px] font-medium text-slate-400">
                {formatColumnType(column)}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function ERDCanvas({
  tables,
  relationships,
  selection,
  zoom,
  tool,
  showGrid,
  highlightRelationships,
  layoutAlgorithm,
  onZoom,
  onToolChange,
  onShowGridChange,
  onHighlightRelationshipsChange,
  onLayoutAlgorithmChange,
  onSelect,
  onMove,
  onAutoLayout,
}: {
  tables: Table[];
  relationships: Relationship[];
  selection: Selection | null;
  zoom: number;
  tool: CanvasTool;
  showGrid: boolean;
  highlightRelationships: boolean;
  layoutAlgorithm: LayoutAlgorithm;
  onZoom: (zoom: number) => void;
  onToolChange: (tool: CanvasTool) => void;
  onShowGridChange: (showGrid: boolean) => void;
  onHighlightRelationshipsChange: (enabled: boolean) => void;
  onLayoutAlgorithmChange: (algorithm: LayoutAlgorithm) => void;
  onSelect: (selection: Selection) => void;
  onMove: (id: string, next: { x: number; y: number }) => void;
  onAutoLayout: () => void;
}) {
  const stageRef = useRef<HTMLDivElement | null>(null);
  const scrollAreaRef = useRef<HTMLDivElement | null>(null);
  const panState = useRef({
    active: false,
    startX: 0,
    startY: 0,
    scrollLeft: 0,
    scrollTop: 0,
  });
  const tableMap = useMemo(
    () => new Map(tables.map((table) => [table.id, table])),
    [tables],
  );
  const stageWidth = Math.max(
    1320,
    ...tables.map((table) => table.x + TABLE_WIDTH + 90),
  );
  const stageHeight = Math.max(
    820,
    ...tables.map((table) => table.y + tableHeight(table) + 90),
  );
  const selectedRelationshipIndex =
    selection?.type === "relationship"
      ? relationships.findIndex(
          (relationship) => relationship.id === selection.id,
        )
      : -1;

  function handlePanPointerDown(event: ReactPointerEvent<HTMLDivElement>) {
    if (tool !== "pan") return;
    const area = scrollAreaRef.current;
    if (!area) return;
    panState.current = {
      active: true,
      startX: event.clientX,
      startY: event.clientY,
      scrollLeft: area.scrollLeft,
      scrollTop: area.scrollTop,
    };
    event.currentTarget.setPointerCapture(event.pointerId);
  }

  function handlePanPointerMove(event: ReactPointerEvent<HTMLDivElement>) {
    if (tool !== "pan" || !panState.current.active) return;
    const area = scrollAreaRef.current;
    if (!area) return;
    area.scrollLeft =
      panState.current.scrollLeft - (event.clientX - panState.current.startX);
    area.scrollTop =
      panState.current.scrollTop - (event.clientY - panState.current.startY);
  }

  function handlePanPointerUp(event: ReactPointerEvent<HTMLDivElement>) {
    panState.current.active = false;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  }

  function handleNextRelationship() {
    if (relationships.length === 0) return;
    const nextIndex =
      selectedRelationshipIndex >= 0
        ? (selectedRelationshipIndex + 1) % relationships.length
        : 0;
    onSelect({ type: "relationship", id: relationships[nextIndex].id });
  }

  function handleCycleLayoutAlgorithm() {
    const next = ((layoutAlgorithm % 3) + 1) as LayoutAlgorithm;
    onLayoutAlgorithmChange(next);
  }

  return (
    <section className="relative flex h-full min-h-[560px] flex-col overflow-hidden bg-[#070b09] light:bg-white lg:min-h-0">
      <div className="absolute right-4 top-4 z-20 flex items-center gap-2 rounded-xl border border-white/10 bg-[rgba(18,24,21,0.86)] px-3 py-2 shadow-[0_20px_48px_rgba(0,0,0,0.34)] backdrop-blur light:border-slate-200 light:bg-white/90 light:shadow-[0_12px_32px_rgba(15,23,42,0.10)]">
        <Network className="h-4 w-4 text-emerald-700" aria-hidden="true" />
        <span className="text-xs font-bold text-slate-200 light:text-slate-700">
          Live ERD
        </span>
        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.8)]" />
      </div>

      <div className="absolute bottom-4 left-4 z-20 flex items-center gap-1.5 rounded-xl border border-white/10 bg-[rgba(18,24,21,0.90)] p-1.5 shadow-[0_24px_54px_rgba(0,0,0,0.38)] backdrop-blur light:border-slate-200 light:bg-white/95 light:shadow-[0_14px_34px_rgba(15,23,42,0.14)]">
        <button
          type="button"
          onClick={() => onZoom(Math.max(50, zoom - 10))}
          className={compactIconButton}
          aria-label="Zoom out"
          title="Zoom out"
        >
          <Minus className="h-4 w-4" aria-hidden="true" />
        </button>
        <span className="min-w-14 px-2 text-center font-mono text-xs font-bold text-slate-200 light:text-slate-700">
          {zoom}%
        </span>
        <button
          type="button"
          onClick={() => onZoom(Math.min(170, zoom + 10))}
          className={compactIconButton}
          aria-label="Zoom in"
          title="Zoom in"
        >
          <Plus className="h-4 w-4" aria-hidden="true" />
        </button>
        <button
          type="button"
          onClick={() => onZoom(100)}
          className={compactIconButton}
          aria-label="Fit view"
          title="Fit view"
        >
          <Maximize2 className="h-4 w-4" aria-hidden="true" />
        </button>
        <span
          className="mx-1 h-6 w-px bg-white/10 light:bg-slate-200"
          aria-hidden="true"
        />
        <button
          type="button"
          onClick={() => onToolChange("select")}
          className={cn(
            compactIconButton,
            tool === "select" &&
              "border-[color:var(--border-emerald)] bg-[rgba(50,245,154,0.10)] text-[var(--brand-lime)] light:border-emerald-200 light:bg-emerald-50 light:text-emerald-700",
          )}
          aria-label="Select mode"
          title="Select and move tables"
        >
          <MousePointer2 className="h-4 w-4" aria-hidden="true" />
        </button>
        <button
          type="button"
          onClick={() => onToolChange("pan")}
          className={cn(
            compactIconButton,
            tool === "pan" &&
              "border-[color:var(--border-emerald)] bg-[rgba(50,245,154,0.10)] text-[var(--brand-lime)] light:border-emerald-200 light:bg-emerald-50 light:text-emerald-700",
          )}
          aria-label="Pan mode"
          title="Pan canvas"
        >
          <Hand className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>

      <div className="absolute bottom-4 left-1/2 z-20 flex -translate-x-1/2 items-center gap-1.5 rounded-xl border border-white/10 bg-[rgba(18,24,21,0.90)] p-1.5 shadow-[0_24px_54px_rgba(0,0,0,0.38)] backdrop-blur light:border-slate-200 light:bg-white/95 light:shadow-[0_14px_34px_rgba(15,23,42,0.14)]">
        <button
          type="button"
          onClick={() =>
            onHighlightRelationshipsChange(!highlightRelationships)
          }
          className={cn(
            compactIconButton,
            highlightRelationships &&
              "border-[color:var(--border-emerald)] bg-[rgba(50,245,154,0.10)] text-[var(--brand-lime)] light:border-emerald-200 light:bg-emerald-50 light:text-emerald-700",
          )}
          aria-label={
            highlightRelationships
              ? "Turn relationship highlight off"
              : "Turn relationship highlight on"
          }
          title={
            highlightRelationships
              ? "Highlight relationships: on"
              : "Highlight relationships: off"
          }
        >
          {highlightRelationships ? (
            <Eye className="h-4 w-4" aria-hidden="true" />
          ) : (
            <EyeOff className="h-4 w-4" aria-hidden="true" />
          )}
        </button>
        <button
          type="button"
          onClick={handleCycleLayoutAlgorithm}
          className={compactButton}
          title={`Choose auto arrange algorithm - ${layoutAlgorithm}`}
        >
          <Shuffle className="h-4 w-4" aria-hidden="true" />
          Algo {layoutAlgorithm}
        </button>
        <button type="button" onClick={onAutoLayout} className={compactButton}>
          <Grid3x3 className="h-4 w-4" aria-hidden="true" />
          Arrange
        </button>
        <button
          type="button"
          onClick={() => onShowGridChange(!showGrid)}
          className={cn(
            compactIconButton,
            showGrid &&
              "border-[color:var(--border-emerald)] bg-[rgba(50,245,154,0.10)] text-[var(--brand-lime)] light:border-emerald-200 light:bg-emerald-50 light:text-emerald-700",
          )}
          aria-label={showGrid ? "Hide grid" : "Show grid"}
          title={showGrid ? "Grid: on" : "Grid: off"}
        >
          <Grid3x3 className="h-4 w-4" aria-hidden="true" />
        </button>
        <button
          type="button"
          onClick={handleNextRelationship}
          className={compactIconButton}
          aria-label="Find next relationship"
          title="Find next relationship"
        >
          <Search className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>

      <div
        ref={scrollAreaRef}
        className={cn(
          "relative flex-1 overflow-auto bg-[#070b09] light:bg-[#fbfcfb]",
          tool === "pan"
            ? "cursor-grab active:cursor-grabbing"
            : "cursor-default",
        )}
        onPointerDown={handlePanPointerDown}
        onPointerMove={handlePanPointerMove}
        onPointerUp={handlePanPointerUp}
        onPointerCancel={handlePanPointerUp}
      >
        {showGrid ? (
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 opacity-85"
            style={{
              backgroundImage:
                "radial-gradient(circle, rgba(108,246,179,0.22) 1.1px, transparent 1.2px)",
              backgroundSize: "14px 14px",
            }}
          />
        ) : null}
        <div className="relative min-h-full min-w-full p-10">
          <div
            ref={stageRef}
            className={cn("relative", tool === "pan" && "pointer-events-none")}
            style={{
              width: stageWidth,
              height: stageHeight,
              transform: `scale(${zoom / 100})`,
              transformOrigin: "top left",
            }}
          >
            <svg
              className="absolute inset-0"
              width={stageWidth}
              height={stageHeight}
              viewBox={`0 0 ${stageWidth} ${stageHeight}`}
              aria-label="Database relationships"
            >
              {relationships.map((relationship) => {
                const from = tableMap.get(relationship.from.table);
                const to = tableMap.get(relationship.to.table);
                if (!from || !to) return null;
                return (
                  <RelationshipPath
                    key={relationship.id}
                    relationship={relationship}
                    from={from}
                    to={to}
                    selected={
                      selection?.type === "relationship" &&
                      selection.id === relationship.id
                    }
                    highlightRelationships={highlightRelationships}
                    onSelect={() =>
                      onSelect({ type: "relationship", id: relationship.id })
                    }
                  />
                );
              })}
            </svg>

            {tables.map((table) => (
              <TableNode
                key={table.id}
                table={table}
                selected={
                  selection?.type === "table" && selection.id === table.id
                }
                zoom={zoom}
                stageRef={stageRef}
                onSelect={() => onSelect({ type: "table", id: table.id })}
                onMove={onMove}
              />
            ))}

            {tables.length === 0 ? (
              <div className="absolute left-4 right-4 top-6 w-auto max-w-[420px] rounded-[24px] border border-dashed border-white/15 bg-[rgba(18,24,21,0.9)] p-4 text-center shadow-[0_24px_70px_rgba(0,0,0,0.34)] sm:left-10 sm:right-auto sm:top-10 sm:w-[calc(100%-5rem)] sm:p-6 light:border-slate-300 light:bg-white/90 light:shadow-[0_18px_42px_rgba(33,45,74,0.08)]">
                <IconTile icon={AlertTriangle} tone="amber" />
                <h3 className="mt-4 text-lg font-bold text-white light:text-slate-950">
                  No diagram generated yet
                </h3>
                <p className="mt-2 text-sm leading-6 text-slate-500">
                  Add supported DBML, SQL DDL, Prisma or Mongoose schema code in
                  the editor and the ERD will update live.
                </p>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}

function DetailsPanel({
  tables,
  relationships,
  selection,
  issues,
  suggestions,
}: {
  tables: Table[];
  relationships: Relationship[];
  selection: Selection | null;
  issues: ParseIssue[];
  suggestions: AiSuggestion[];
}) {
  const selectedTable =
    selection?.type === "table"
      ? tables.find((table) => table.id === selection.id)
      : null;
  const selectedRelationship =
    selection?.type === "relationship"
      ? relationships.find((relationship) => relationship.id === selection.id)
      : null;

  return (
    <section className={cn(panel, "overflow-hidden")}>
      <header className="flex items-center justify-between gap-3 border-b border-white/10 px-4 py-3 light:border-slate-200">
        <div className="flex items-center gap-3">
          <IconTile icon={PanelRight} tone="blue" />
          <div>
            <h2 className="text-sm font-bold text-white light:text-slate-950">
              Inspector
            </h2>
            <p className="text-xs text-slate-500">
              Table details, relationship context and AI review.
            </p>
          </div>
        </div>
        <span className="rounded-full bg-white/[0.06] px-2.5 py-1 text-xs font-bold text-slate-300 light:bg-slate-100 light:text-slate-600">
          {issues.length} validations
        </span>
      </header>

      <div className="grid gap-4 p-4 lg:grid-cols-[minmax(0,1fr)_minmax(260px,360px)]">
        <div className="rounded-[18px] border border-white/10 bg-white/[0.035] p-4 light:border-slate-200 light:bg-[#fbfefd]">
          {selectedTable ? (
            <>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-emerald-700">
                    Selected table
                  </p>
                  <h3 className="mt-1 font-mono text-xl font-bold text-white light:text-slate-950">
                    {selectedTable.name}
                  </h3>
                  <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-500">
                    {selectedTable.description ||
                      "Parsed from the active editor document."}
                  </p>
                </div>
                <div className="flex gap-2">
                  <StatPill
                    label="Columns"
                    value={selectedTable.columns.length}
                  />
                  <StatPill
                    label="Indexes"
                    value={selectedTable.indexes || 0}
                    tone="blue"
                  />
                </div>
              </div>

              <div className="mt-4 overflow-hidden rounded-2xl border border-white/10 bg-[#0d1110] light:border-slate-200 light:bg-white">
                <div className="grid grid-cols-[minmax(0,1fr)_120px_90px] border-b border-white/10 bg-white/[0.04] px-3 py-2 text-[11px] font-bold uppercase tracking-[0.14em] text-slate-400 light:border-slate-200 light:bg-slate-50 light:text-slate-500">
                  <span>Column</span>
                  <span>Type</span>
                  <span>Key</span>
                </div>
                {selectedTable.columns.map((column) => (
                  <div
                    key={`${selectedTable.id}-detail-${column.name}`}
                    className="grid grid-cols-[minmax(0,1fr)_120px_90px] items-center gap-2 border-b border-white/10 px-3 py-2 text-sm last:border-b-0 light:border-slate-100"
                  >
                    <div className="min-w-0">
                      <p className="truncate font-mono font-semibold text-slate-200 light:text-slate-800">
                        {column.name}
                      </p>
                      {column.references ? (
                        <p className="mt-0.5 text-xs text-slate-500">
                          references {column.references.table}.
                          {column.references.column}
                        </p>
                      ) : null}
                    </div>
                    <span className="font-mono text-xs font-semibold text-slate-500">
                      {formatColumnType(column)}
                    </span>
                    <span className="text-xs font-bold uppercase text-slate-500">
                      {column.key === "none" ? "-" : column.key}
                    </span>
                  </div>
                ))}
              </div>
            </>
          ) : selectedRelationship ? (
            <>
              <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-sky-700">
                Selected relationship
              </p>
              <h3 className="mt-1 text-xl font-bold text-white light:text-slate-950">
                {selectedRelationship.from.table}.
                {selectedRelationship.from.column}
                <span className="px-2 text-slate-400">to</span>
                {selectedRelationship.to.table}.{selectedRelationship.to.column}
              </h3>
              <div className="mt-4 grid gap-3 sm:grid-cols-3">
                <StatPill
                  label="Type"
                  value={selectedRelationship.kind.replace(/-/g, " ")}
                  tone="blue"
                />
                <StatPill
                  label="From"
                  value={selectedRelationship.from.table}
                />
                <StatPill
                  label="To"
                  value={selectedRelationship.to.table}
                  tone="violet"
                />
              </div>
              <p className="mt-4 rounded-2xl border border-sky-300/20 bg-sky-300/10 px-4 py-3 text-sm leading-6 text-sky-100 light:border-sky-100 light:bg-sky-50 light:text-sky-800">
                Add an index on the foreign-key side if this relationship is
                used in assignment, lab or reporting queries.
              </p>
            </>
          ) : (
            <div className="py-8 text-center">
              <IconTile icon={MousePointer2} tone="slate" />
              <h3 className="mt-4 text-lg font-bold text-white light:text-slate-950">
                Select a table or relationship
              </h3>
              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
                Click a table card or relationship line in the canvas to inspect
                columns, keys and validation context.
              </p>
            </div>
          )}
        </div>

        <div className="grid gap-3">
          <div className="rounded-[18px] border border-white/10 bg-white/[0.035] p-4 light:border-slate-200 light:bg-white">
            <div className="flex items-center gap-2">
              <IconTile icon={Bot} tone="violet" />
              <div>
                <h3 className="text-sm font-bold text-white light:text-slate-950">
                  AI suggestions
                </h3>
                <p className="text-xs text-slate-500">
                  Mock adapter-ready review.
                </p>
              </div>
            </div>
            <div className="mt-3 grid gap-2">
              {suggestions.map((suggestion) => (
                <div
                  key={suggestion.title}
                  className={cn(
                    "rounded-2xl border px-3 py-2",
                    suggestion.tone === "emerald" &&
                      "border-[color:var(--border-emerald)] bg-[rgba(50,245,154,0.10)] text-[var(--brand-emerald)] light:border-emerald-100 light:bg-emerald-50 light:text-emerald-800",
                    suggestion.tone === "amber" &&
                      "border-amber-300/20 bg-amber-300/10 text-amber-100 light:border-amber-100 light:bg-amber-50 light:text-amber-800",
                    suggestion.tone === "blue" &&
                      "border-sky-300/20 bg-sky-300/10 text-sky-100 light:border-sky-100 light:bg-sky-50 light:text-sky-800",
                  )}
                >
                  <p className="text-xs font-bold">{suggestion.title}</p>
                  <p className="mt-1 text-xs leading-5">{suggestion.detail}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[18px] border border-white/10 bg-white/[0.035] p-4 light:border-slate-200 light:bg-white">
            <h3 className="text-sm font-bold text-white light:text-slate-950">
              Validation issues
            </h3>
            <div className="mt-3 grid gap-2">
              {issues.length === 0 ? (
                <p className="rounded-2xl bg-[rgba(50,245,154,0.10)] px-3 py-2 text-xs font-semibold text-[var(--brand-emerald)] light:bg-emerald-50 light:text-emerald-700">
                  No blocking validation issues.
                </p>
              ) : (
                issues.slice(0, 3).map((issue, index) => (
                  <p
                    key={`${issue.message}-${index}`}
                    className="rounded-2xl bg-amber-300/10 px-3 py-2 text-xs leading-5 text-amber-100 light:bg-amber-50 light:text-amber-800"
                  >
                    {issue.message}
                  </p>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function TopToolbar({
  diagramName,
  onDiagramNameChange,
  stats,
  onSave,
  onImport,
  onExport,
  onAutoLayout,
  onAiAssist,
  onShare,
}: {
  diagramName: string;
  onDiagramNameChange: (value: string) => void;
  stats: {
    tables: number;
    relationships: number;
    primaryKeys: number;
    foreignKeys: number;
  };
  onSave: () => void | Promise<void>;
  onImport: () => void;
  onExport: (format: ExportFormat) => void | Promise<void>;
  onAutoLayout: () => void;
  onAiAssist: () => void;
  onShare: () => void;
}) {
  const toolbarButton =
    "inline-flex h-8 items-center justify-center gap-1.5 rounded-md border border-white/10 bg-white/[0.055] px-2.5 text-xs font-bold text-slate-200 transition hover:border-[color:var(--border-emerald)] hover:bg-[rgba(50,245,154,0.10)] hover:text-[var(--brand-lime)] light:border-slate-200 light:bg-white light:text-slate-700 light:hover:border-emerald-200 light:hover:bg-emerald-50 light:hover:text-emerald-700";
  const toolbarIconButton =
    "grid h-8 w-8 place-items-center rounded-md border border-white/10 bg-white/[0.055] text-slate-300 transition hover:border-[color:var(--border-emerald)] hover:bg-[rgba(50,245,154,0.10)] hover:text-[var(--brand-lime)] light:border-slate-200 light:bg-white light:text-slate-600 light:hover:border-emerald-200 light:hover:bg-emerald-50 light:hover:text-emerald-700";

  return (
    <section className="overflow-hidden rounded-t-[18px] border border-white/10 bg-[rgba(18,24,21,0.88)] shadow-[0_24px_70px_rgba(0,0,0,0.34)] light:border-slate-200 light:bg-white light:shadow-[0_16px_40px_rgba(33,45,74,0.08)]">
      <div className="flex flex-col gap-2 border-t border-[color:var(--border-emerald)] p-2 light:border-emerald-200 xl:flex-row xl:items-center xl:justify-between">
        <div className="flex min-w-0 flex-1 items-center gap-2">
          <span className="grid h-8 w-8 shrink-0 place-items-center rounded-md bg-[linear-gradient(135deg,#d9ff57,#32f59a)] text-[#07100b] shadow-[0_0_24px_rgba(50,245,154,0.22)] light:bg-none light:bg-emerald-600 light:text-white light:shadow-[0_10px_22px_rgba(7,154,86,0.20)]">
            <Database className="h-4 w-4" aria-hidden="true" />
          </span>
          <span className="hidden h-8 items-center rounded-md border border-[color:var(--border-emerald)] bg-[rgba(50,245,154,0.08)] px-2.5 text-xs font-bold text-[var(--brand-lime)] light:border-emerald-100 light:bg-emerald-50 light:text-emerald-700 sm:inline-flex">
            Nexora OS
          </span>
          <div className="min-w-[180px] flex-1">
            <input
              value={diagramName}
              onChange={(event) => onDiagramNameChange(event.target.value)}
              aria-label="Diagram name"
              className="h-8 w-full rounded-md border border-white/10 bg-[#0d1110] px-3 text-sm font-bold text-white outline-none placeholder:text-slate-600 hover:border-[color:var(--border-emerald)] focus:border-[color:var(--border-lime)] focus:bg-[#090d0b] light:border-slate-200 light:bg-slate-50 light:text-slate-950 light:placeholder:text-slate-300 light:hover:border-emerald-200 light:focus:border-emerald-300 light:focus:bg-white"
            />
          </div>
          <div className="hidden items-center gap-1.5 xl:flex">
            <MiniMetric label="T" value={stats.tables} title="Tables" />
            <MiniMetric
              label="R"
              value={stats.relationships}
              title="Relationships"
            />
            <MiniMetric
              label="PK"
              value={stats.primaryKeys}
              title="Primary keys"
            />
            <MiniMetric
              label="FK"
              value={stats.foreignKeys}
              title="Foreign keys"
            />
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          <button type="button" onClick={onAiAssist} className={toolbarButton}>
            <Sparkles className="h-4 w-4" aria-hidden="true" />
            AI
          </button>
          <span className="inline-flex h-8 items-center gap-1.5 rounded-md border border-[color:var(--border-emerald)] bg-[rgba(50,245,154,0.10)] px-2.5 text-xs font-bold text-[var(--brand-emerald)] light:border-emerald-100 light:bg-emerald-50 light:text-emerald-700">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.65)]" />
            Live
          </span>
          <button type="button" onClick={onSave} className={toolbarButton}>
            <Save className="h-4 w-4" aria-hidden="true" />
            Save
          </button>
          <button type="button" onClick={onShare} className={toolbarButton}>
            <Share2 className="h-4 w-4" aria-hidden="true" />
            Share
          </button>
          <button type="button" onClick={onImport} className={toolbarButton}>
            <Upload className="h-4 w-4" aria-hidden="true" />
            Import
          </button>
          <span
            className="mx-0.5 h-6 w-px bg-white/10 light:bg-slate-200"
            aria-hidden="true"
          />
          <button
            type="button"
            onClick={() => onExport("svg")}
            className={toolbarIconButton}
            aria-label="Export SVG"
            title="Export SVG"
          >
            <Download className="h-4 w-4" aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={() => onExport("png")}
            className={toolbarIconButton}
            aria-label="Export PNG"
            title="Export PNG"
          >
            <ImageDown className="h-4 w-4" aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={() => onExport("pdf")}
            className={toolbarIconButton}
            aria-label="Export PDF"
            title="Export PDF"
          >
            <FileText className="h-4 w-4" aria-hidden="true" />
          </button>
          <span
            className="mx-0.5 h-6 w-px bg-white/10 light:bg-slate-200"
            aria-hidden="true"
          />
          <button
            type="button"
            onClick={onAutoLayout}
            className={toolbarButton}
          >
            <Grid3x3 className="h-4 w-4" aria-hidden="true" />
            Layout
          </button>
        </div>
      </div>
    </section>
  );
}

function MiniMetric({
  label,
  value,
  title,
}: {
  label: string;
  value: number;
  title: string;
}) {
  return (
    <span
      title={title}
      className="inline-flex h-7 items-center gap-1 rounded-md border border-white/10 bg-white/[0.055] px-2 font-mono text-[11px] font-bold text-slate-300 light:border-slate-200 light:bg-slate-50 light:text-slate-600"
    >
      <span className="text-slate-500 light:text-slate-400">{label}</span>
      <span className="text-[var(--brand-lime)] light:text-emerald-700">
        {value}
      </span>
    </span>
  );
}

export function DatabaseVisualizerPage({ role }: { role: AppRole }) {
  const data = roleDashboards[role];
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [dialect, setDialect] = useState<SchemaDialect>("dbml");
  const [source, setSource] = useState(sampleDocuments.dbml);
  const [diagramName, setDiagramName] = useState(
    "Nexora academic workflow ERD",
  );
  const [zoom, setZoom] = useState(92);
  const [canvasTool, setCanvasTool] = useState<CanvasTool>("select");
  const [showGrid, setShowGrid] = useState(true);
  const [highlightRelationships, setHighlightRelationships] = useState(true);
  const [layoutAlgorithm, setLayoutAlgorithm] = useState<LayoutAlgorithm>(2);
  const [positionOverrides, setPositionOverrides] = useState<
    Record<string, { x: number; y: number }>
  >({});
  const [selection, setSelection] = useState<Selection | null>(null);
  const [status, setStatus] = useState("Live parser ready");
  const [manualSuggestions, setManualSuggestions] = useState<
    AiSuggestion[] | null
  >(null);
  const [savedDiagramId, setSavedDiagramId] = useState<string | null>(null);

  const parseResult = useMemo(
    () => parseSchema(source, dialect),
    [source, dialect],
  );
  const tables = useMemo(
    () =>
      parseResult.tables.map((table) => ({
        ...table,
        ...(positionOverrides[table.id] ?? {}),
      })),
    [parseResult.tables, positionOverrides],
  );
  const relationships = parseResult.relationships;
  const activeSelection = useMemo<Selection | null>(() => {
    if (
      selection?.type === "table" &&
      tables.some((table) => table.id === selection.id)
    ) {
      return selection;
    }
    if (
      selection?.type === "relationship" &&
      relationships.some((relationship) => relationship.id === selection.id)
    ) {
      return selection;
    }
    return tables[0] ? { type: "table", id: tables[0].id } : null;
  }, [relationships, selection, tables]);

  const aiSuggestions =
    manualSuggestions ??
    generateSuggestions(tables, relationships, parseResult.issues);

  const primaryKeys = tables.reduce(
    (count, table) =>
      count + table.columns.filter((column) => column.key === "pk").length,
    0,
  );
  const foreignKeys = tables.reduce(
    (count, table) =>
      count + table.columns.filter((column) => column.key === "fk").length,
    0,
  );

  function handleDialectChange(nextDialect: SchemaDialect) {
    setDialect(nextDialect);
    setSource(sampleDocuments[nextDialect]);
    setPositionOverrides({});
    setSelection(null);
    setManualSuggestions(null);
    setStatus(`${dialectMeta[nextDialect].label} sample loaded`);
  }

  function handleAutoLayout(algorithm: LayoutAlgorithm = layoutAlgorithm) {
    const sortedTables = [...tables];
    if (algorithm === 2) {
      sortedTables.sort((a, b) => {
        const aLinks = relationships.filter(
          (relationship) =>
            relationship.from.table === a.id || relationship.to.table === a.id,
        ).length;
        const bLinks = relationships.filter(
          (relationship) =>
            relationship.from.table === b.id || relationship.to.table === b.id,
        ).length;
        return bLinks - aLinks;
      });
    }
    if (algorithm === 3) {
      sortedTables.sort((a, b) => a.name.localeCompare(b.name));
    }

    const colX =
      algorithm === 1
        ? [32, 392, 752, 1112]
        : algorithm === 2
          ? [56, 500, 944]
          : [40, 356, 672, 988];
    const colYs: number[] = colX.map(() => (algorithm === 2 ? 76 : 32));
    const nextPositions: Record<string, { x: number; y: number }> = {};
    sortedTables.forEach((table, index) => {
      const col =
        algorithm === 2
          ? colYs.indexOf(Math.min(...colYs))
          : index % colX.length;
      nextPositions[table.id] = { x: colX[col], y: colYs[col] };
      colYs[col] += tableHeight(table) + (algorithm === 3 ? 28 : 42);
    });
    setPositionOverrides(nextPositions);
    setStatus(`Auto layout ${algorithm} applied`);
  }

  function handleLayoutAlgorithmChange(nextAlgorithm: LayoutAlgorithm) {
    setLayoutAlgorithm(nextAlgorithm);
    handleAutoLayout(nextAlgorithm);
  }

  function handleMoveTable(id: string, next: { x: number; y: number }) {
    setPositionOverrides((current) => ({ ...current, [id]: next }));
  }

  function handleAiExplain() {
    setManualSuggestions(
      generateSuggestions(tables, relationships, parseResult.issues),
    );
    setStatus("AI schema explanation prepared");
  }

  function handleFormatCode() {
    setSource((current) => formatSourceCode(current, dialect));
    setStatus("Code formatted");
  }

  async function handleSave() {
    setStatus("Saving to database...");
    const diagram = toDiagramOutput(tables, relationships, source, dialect);
    const response = await apiPost<DiagramSaveResponse>("/diagrams", {
      title: diagramName,
      source,
      sourceType: dialect,
      diagram,
    });

    if (response?.diagram?.id) {
      setSavedDiagramId(response.diagram.id);
      setStatus("Diagram saved to database");
      return;
    }

    localStorage.setItem(
      "nexora.databaseVisualizer.draft",
      JSON.stringify({
        dialect,
        source,
        diagramName,
        tables,
        relationships,
        savedAt: new Date().toISOString(),
      }),
    );
    setStatus("Database unavailable. Draft cached locally");
  }

  function handleImportFile(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setSource(String(reader.result ?? ""));
      setDiagramName(file.name.replace(/\.[^.]+$/, "") || diagramName);
      setPositionOverrides({});
      setSelection(null);
      setManualSuggestions(null);
      const extension = file.name.split(".").pop()?.toLowerCase();
      if (extension === "sql") setDialect("sql");
      if (extension === "prisma") setDialect("prisma");
      if (extension === "js" || extension === "ts") setDialect("mongoose");
      if (extension === "dbml") setDialect("dbml");
      setStatus(`${file.name} imported`);
    };
    reader.readAsText(file);
    event.target.value = "";
  }

  async function handleExport(format: ExportFormat) {
    await exportDiagram(format, tables, relationships, diagramName);
    const response = await apiPost<DiagramExportResponse>("/diagrams/export", {
      diagramId: savedDiagramId ?? undefined,
      title: diagramName,
      format,
      diagram: toDiagramOutput(tables, relationships, source, dialect),
    });

    if (response?.export?.diagramId) {
      setSavedDiagramId(response.export.diagramId);
      setStatus(`${format.toUpperCase()} export saved to database`);
      return;
    }

    setStatus(`${format.toUpperCase()} export prepared locally`);
  }

  async function handleShare() {
    const payload = `${window.location.origin}/${role}/database-visualizer`;
    await navigator.clipboard?.writeText(payload);
    setStatus("Share link copied");
  }

  return (
    <AppShell
      role={role}
      title="Database Visualizer"
      subtitle="Write a schema, inspect the relationships, and export the diagram."
      nav={data.nav}
      navGroups={data.navGroups}
      accountEmail={data.accountEmail}
      contentClassName="max-w-none pt-0"
    >
      <input
        ref={fileInputRef}
        type="file"
        accept=".dbml,.sql,.prisma,.js,.ts,.txt"
        className="hidden"
        onChange={handleImportFile}
      />

      <div className="grid gap-0 text-white light:text-slate-950">
        <TopToolbar
          diagramName={diagramName}
          onDiagramNameChange={setDiagramName}
          stats={{
            tables: tables.length,
            relationships: relationships.length,
            primaryKeys,
            foreignKeys,
          }}
          onSave={handleSave}
          onImport={() => fileInputRef.current?.click()}
          onExport={handleExport}
          onAutoLayout={handleAutoLayout}
          onAiAssist={handleAiExplain}
          onShare={handleShare}
        />

        <section className="grid overflow-hidden rounded-b-[18px] border-x border-b border-white/10 bg-[rgba(18,24,21,0.78)] shadow-[0_24px_70px_rgba(0,0,0,0.34)] light:border-slate-200 light:bg-white light:shadow-[0_18px_50px_rgba(15,23,42,0.10)] lg:h-[calc(100dvh-142px)] lg:min-h-[560px] lg:grid-cols-[clamp(280px,28vw,460px)_minmax(0,1fr)] 2xl:min-h-[720px]">
          <div className="flex min-h-0 flex-col overflow-hidden border-r border-white/10 bg-[#0d1110] light:border-slate-200 light:bg-white">
            <header className="flex shrink-0 flex-col gap-2 border-b border-white/10 bg-[#121715] p-2.5 light:border-slate-200 light:bg-[#fbfefd]">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="grid h-8 w-8 place-items-center rounded-md bg-[rgba(50,245,154,0.10)] text-[var(--brand-emerald)] light:bg-emerald-50 light:text-emerald-700">
                    <Code2 className="h-4 w-4" aria-hidden="true" />
                  </span>
                  <div>
                    <h2 className="text-sm font-bold text-white light:text-slate-950">
                      Code Editor
                    </h2>
                    <p className="text-xs text-slate-500">
                      {dialectMeta[dialect].language} active file
                    </p>
                  </div>
                </div>
                <span className="rounded-md border border-[color:var(--border-emerald)] bg-[rgba(50,245,154,0.10)] px-2 py-1 text-[11px] font-bold text-[var(--brand-emerald)] light:border-emerald-100 light:bg-emerald-50 light:text-emerald-700">
                  {status}
                </span>
              </div>

              <EditorTabs
                dialect={dialect}
                onDialectChange={handleDialectChange}
              />

              <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-white/10 bg-[#0d1110] p-1.5 light:border-slate-200 light:bg-white">
                <div className="flex min-w-0 items-center gap-2 px-2">
                  <span className="h-2 w-2 rounded-full bg-rose-400" />
                  <span className="h-2 w-2 rounded-full bg-amber-400" />
                  <span className="h-2 w-2 rounded-full bg-emerald-500" />
                  <span className="ml-1 truncate font-mono text-[11px] font-bold text-slate-400 light:text-slate-600">
                    {dialectMeta[dialect].fileName}
                  </span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  <span className="inline-flex h-8 items-center gap-1.5 rounded-md border border-[color:var(--border-emerald)] bg-[rgba(50,245,154,0.10)] px-2.5 text-xs font-bold text-[var(--brand-emerald)] light:border-emerald-100 light:bg-emerald-50 light:text-emerald-700">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.65)]" />
                    Live auto
                  </span>
                  <button
                    type="button"
                    onClick={handleAiExplain}
                    className={compactButton}
                  >
                    <Bot className="h-4 w-4" aria-hidden="true" />
                    Explain
                  </button>
                  <button
                    type="button"
                    onClick={handleFormatCode}
                    className={compactButton}
                  >
                    <Wand2 className="h-4 w-4" aria-hidden="true" />
                    Format
                  </button>
                </div>
              </div>
            </header>

            <div className="flex min-h-0 flex-1 flex-col">
              <DatabaseCodeEditor
                value={source}
                dialect={dialect}
                onChange={(nextSource) => {
                  setSource(nextSource);
                  setManualSuggestions(null);
                  setStatus("Live updated");
                }}
              />
              <ParserIssuesPanel issues={parseResult.issues} />
            </div>
          </div>
          <div className="min-h-0 min-w-0">
            <ERDCanvas
              tables={tables}
              relationships={relationships}
              selection={activeSelection}
              zoom={zoom}
              tool={canvasTool}
              showGrid={showGrid}
              highlightRelationships={highlightRelationships}
              layoutAlgorithm={layoutAlgorithm}
              onZoom={setZoom}
              onToolChange={setCanvasTool}
              onShowGridChange={setShowGrid}
              onHighlightRelationshipsChange={setHighlightRelationships}
              onLayoutAlgorithmChange={handleLayoutAlgorithmChange}
              onSelect={setSelection}
              onMove={handleMoveTable}
              onAutoLayout={handleAutoLayout}
            />
          </div>
        </section>
        <div className="mt-3">
          <DetailsPanel
            tables={tables}
            relationships={relationships}
            selection={activeSelection}
            issues={parseResult.issues}
            suggestions={aiSuggestions}
          />
        </div>
      </div>
    </AppShell>
  );
}
