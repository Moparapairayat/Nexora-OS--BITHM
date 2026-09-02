"use client";

import type { DiagramOutput } from "@nexora/types";
import {
  AlertTriangle,
  Bot,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Code2,
  Copy,
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
  Minimize2,
  Minus,
  MousePointer2,
  Network,
  Palette,
  PanelRight,
  Plus,
  Save,
  Search,
  Share2,
  SlidersHorizontal,
  Sparkles,
  Shuffle,
  Table as TableIcon,
  Upload,
  Wand2,
  X,
  Zap,
  type LucideIcon,
} from "lucide-react";
import {
  type PointerEvent as ReactPointerEvent,
  useEffect,
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

function getVisibleColumns(table: Table, isCollapsed?: boolean): Column[] {
  if (!isCollapsed) return table.columns;
  const keyCols = table.columns.filter((col) => col.key !== "none");
  return keyCols.length > 0 ? keyCols : table.columns.slice(0, 1);
}

function tableHeight(table: Table, isCollapsed?: boolean) {
  const visibleCols = getVisibleColumns(table, isCollapsed);
  return (
    TABLE_HEADER_HEIGHT +
    visibleCols.length * COLUMN_ROW_HEIGHT +
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

function getColumnCenterY(
  table: Table,
  columnName: string,
  isCollapsed?: boolean,
): number {
  const visibleCols = getVisibleColumns(table, isCollapsed);
  const colIndex = visibleCols.findIndex((col) => col.name === columnName);
  if (colIndex < 0) {
    return table.y + tableHeight(table, isCollapsed) / 2;
  }
  return (
    table.y +
    TABLE_HEADER_HEIGHT +
    8 +
colIndex * COLUMN_ROW_HEIGHT +
    COLUMN_ROW_HEIGHT / 2
  );
}

export type ExportPreset = "studio" | "blueprint" | "dark" | "clean";

export interface ExportStudioConfig {
  preset: ExportPreset;
  includeHeaderBar: boolean;
  includeMetrics: boolean;
  includeWatermark: boolean;
  includeBackgroundGlow: boolean;
}

export const defaultExportStudioConfig: ExportStudioConfig = {
  preset: "studio",
  includeHeaderBar: true,
  includeMetrics: true,
  includeWatermark: true,
  includeBackgroundGlow: true,
};

let cachedLogoDataUrl: string | null = null;

async function getNexoraLogoDataUrl(): Promise<string> {
  if (cachedLogoDataUrl) return cachedLogoDataUrl;
  try {
    const res = await fetch("/brand/nexora-os-logo.png");
    const blob = await res.blob();
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        cachedLogoDataUrl = reader.result as string;
        resolve(cachedLogoDataUrl);
      };
      reader.readAsDataURL(blob);
    });
  } catch {
    return "/brand/nexora-os-logo.png";
  }
}

function buildExportSvg(
  tables: Table[],
  relationships: Relationship[],
  themeMode: "dark" | "blueprint" | "light" = "light",
  collapsedTableIds: Set<string> = new Set(),
  diagramName: string = "Nexora ERD",
  logoSrc: string = "/brand/nexora-os-logo.png",
  config: ExportStudioConfig = defaultExportStudioConfig,
  dialect: SchemaDialect = "dbml",
) {
  const minX = tables.length > 0 ? Math.min(...tables.map((t) => t.x)) : 0;
  const minY = tables.length > 0 ? Math.min(...tables.map((t) => t.y)) : 0;

  const offsetX = Math.max(60, 60 - minX);
  const offsetY = config.includeHeaderBar ? Math.max(115, 115 - minY) : Math.max(60, 60 - minY);

  const maxX =
    tables.length > 0
      ? Math.max(...tables.map((t) => t.x + offsetX + TABLE_WIDTH))
      : 1200;
  const maxY =
    tables.length > 0
      ? Math.max(
          ...tables.map(
            (t) => t.y + offsetY + tableHeight(t, collapsedTableIds.has(t.id)),
          ),
        )
      : 800;

  const width = Math.max(720, maxX + 60);
  const height = Math.max(480, maxY + 60);

  const tableMap = new Map(tables.map((table) => [table.id, table]));

  const effectivePreset = config.preset;

  let bgColor = "#070b09";
  let gridPatternSvg = "";
  let glowSvg = "";

  if (effectivePreset === "blueprint") {
    bgColor = "#060d1e";
    gridPatternSvg = `<defs><pattern id="grid" width="24" height="24" patternUnits="userSpaceOnUse"><path d="M 24 0 L 0 0 0 24" fill="none" stroke="rgba(56, 189, 248, 0.18)" stroke-width="1"/></pattern></defs><rect width="100%" height="100%" fill="url(#grid)"/>`;
    if (config.includeBackgroundGlow) {
      glowSvg = `<defs><radialGradient id="blueprintGlow" cx="50%" cy="45%" r="65%"><stop offset="0%" stop-color="rgba(56, 189, 248, 0.26)"/><stop offset="100%" stop-color="rgba(0, 0, 0, 0)"/></radialGradient></defs><rect width="100%" height="100%" fill="url(#blueprintGlow)"/>`;
    }
  } else if (effectivePreset === "clean") {
    bgColor = "#ffffff";
    gridPatternSvg = `<defs><pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse"><circle cx="2" cy="2" r="1.5" fill="#cbd5e1"/></pattern></defs><rect width="100%" height="100%" fill="url(#grid)"/>`;
    if (config.includeBackgroundGlow) {
      glowSvg = `<defs><radialGradient id="cleanGlow" cx="50%" cy="40%" r="65%"><stop offset="0%" stop-color="rgba(16, 185, 129, 0.12)"/><stop offset="100%" stop-color="rgba(255, 255, 255, 0)"/></radialGradient></defs><rect width="100%" height="100%" fill="url(#cleanGlow)"/>`;
    }
  } else if (effectivePreset === "dark") {
    bgColor = "#090d0b";
    gridPatternSvg = `<defs><pattern id="grid" width="14" height="14" patternUnits="userSpaceOnUse"><circle cx="1.1" cy="1.1" r="1.1" fill="rgba(108,246,179,0.18)"/></pattern></defs><rect width="100%" height="100%" fill="url(#grid)"/>`;
  } else {
    // Studio preset (Ray.so style)
    bgColor = "#070b09";
    gridPatternSvg = `<defs><pattern id="grid" width="16" height="16" patternUnits="userSpaceOnUse"><circle cx="1.1" cy="1.1" r="1.1" fill="rgba(50,245,154,0.22)"/></pattern></defs><rect width="100%" height="100%" fill="url(#grid)"/>`;
    if (config.includeBackgroundGlow) {
      glowSvg = `<defs><radialGradient id="studioGlow" cx="50%" cy="40%" r="65%"><stop offset="0%" stop-color="rgba(50, 245, 154, 0.25)"/><stop offset="50%" stop-color="rgba(217, 255, 87, 0.12)"/><stop offset="100%" stop-color="rgba(0, 0, 0, 0)"/></radialGradient></defs><rect width="100%" height="100%" fill="url(#studioGlow)"/>`;
    }
  }

  let headerBarSvg = "";
  if (config.includeHeaderBar) {
    const titleWidthEstimate = Math.min(diagramName.length * 8.5, 340);
    const dialectBadgeX = 84 + titleWidthEstimate + 12;
    const totalPKs = tables.reduce((acc, t) => acc + t.columns.filter((c) => c.key === "pk").length, 0);

    headerBarSvg = `<g transform="translate(44, 30)">
      <rect width="${width - 88}" height="48" rx="14" fill="rgba(15, 23, 20, 0.92)" stroke="rgba(255, 255, 255, 0.12)" stroke-width="1.2" filter="drop-shadow(0 8px 24px rgba(0,0,0,0.35))"/>
      <circle cx="24" cy="24" r="5.5" fill="#ff5f56"/>
      <circle cx="40" cy="24" r="5.5" fill="#ffbd2e"/>
      <circle cx="56" cy="24" r="5.5" fill="#27c93f"/>
      <text x="84" y="29" fill="#ffffff" font-size="14" font-weight="700" font-family="Inter, Arial">${escapeXml(diagramName)}</text>
      <rect x="${dialectBadgeX}" y="14" width="${dialect.length * 8 + 20}" height="20" rx="5" fill="rgba(50,245,154,0.15)" stroke="rgba(50,245,154,0.3)" stroke-width="1"/>
      <text x="${dialectBadgeX + 10}" y="28" fill="#32f59a" font-size="10" font-weight="800" font-family="ui-monospace, monospace">${dialect.toUpperCase()}</text>
      ${
        config.includeMetrics
          ? `<text x="${width - 110}" y="29" fill="#94a3b8" font-size="11" font-weight="600" text-anchor="end" font-family="Inter, Arial">${tables.length} Tables • ${relationships.length} Relations • ${totalPKs} PK</text>`
          : ""
      }
    </g>`;
  }

  let watermarkSvg = "";
  let centerWatermarkSvg = "";
  let tiledWatermarkSvg = "";

  if (config.includeWatermark) {
    watermarkSvg = `<g transform="translate(${width - 240}, ${height - 54})" opacity="0.92"><image href="${logoSrc}" x="0" y="0" width="150" height="32" preserveAspectRatio="xMinYMid meet"/><rect x="160" y="6" width="1" height="20" fill="rgba(255,255,255,0.22)"/><text x="172" y="20" fill="#32f59a" font-size="11" font-weight="800" font-family="Inter, Arial" letter-spacing="0.6">ERD</text></g>`;
    centerWatermarkSvg = `<g transform="translate(${width / 2 - 160}, ${height / 2 - 40})" opacity="0.15"><image href="${logoSrc}" x="0" y="0" width="320" height="80" preserveAspectRatio="xMidYMid meet"/></g>`;
    const tileTextFill = effectivePreset === "clean" ? "rgba(15,23,42,0.06)" : "rgba(255,255,255,0.06)";
    tiledWatermarkSvg = `<defs><pattern id="tiledWatermark" width="320" height="220" patternUnits="userSpaceOnUse" patternTransform="rotate(-20)"><text x="40" y="110" fill="${tileTextFill}" font-size="16" font-weight="900" font-family="Inter, Arial" letter-spacing="3">NEXORA OS</text></pattern></defs><rect width="100%" height="100%" fill="url(#tiledWatermark)"/>`;
  }

  const linesSvg = relationships
    .map((relationship) => {
      const from = tableMap.get(relationship.from.table);
      const to = tableMap.get(relationship.to.table);
      if (!from || !to) return "";

      const fromCollapsed = collapsedTableIds.has(from.id);
      const toCollapsed = collapsedTableIds.has(to.id);

      const fromX = from.x + offsetX;
      const fromY = from.y + offsetY;
      const toX = to.x + offsetX;
      const toY = to.y + offsetY;

      const leftToRight = fromX + TABLE_WIDTH / 2 <= toX + TABLE_WIDTH / 2;
      const x1 = leftToRight ? fromX + TABLE_WIDTH : fromX;
      const x2 = leftToRight ? toX : toX + TABLE_WIDTH;
      const y1 = getColumnCenterY(
        { ...from, y: fromY },
        relationship.from.column,
        fromCollapsed,
      );
      const y2 = getColumnCenterY(
        { ...to, y: toY },
        relationship.to.column,
        toCollapsed,
      );
      const mid = (x1 + x2) / 2;
      const color = relationshipColor(relationship.kind);
      const dash = relationshipDash(relationship.kind) ?? "";

      return `<g><path d="M ${x1} ${y1} C ${mid} ${y1}, ${mid} ${y2}, ${x2} ${y2}" fill="none" stroke="${color}" stroke-width="2.6" ${dash ? `stroke-dasharray="${dash}"` : ""} stroke-linecap="round" opacity="0.85"/><circle cx="${x1}" cy="${y1}" r="4" fill="${color}"/><circle cx="${x2}" cy="${y2}" r="4" fill="#ffffff" stroke="${color}" stroke-width="2"/></g>`;
    })
    .join("");

  const cardsSvg = tables
    .map((table) => {
      const isCollapsed = collapsedTableIds.has(table.id);
      const cardHeight = tableHeight(table, isCollapsed);
      const visibleCols = getVisibleColumns(table, isCollapsed);

      const tableX = table.x + offsetX;
      const tableY = table.y + offsetY;

      const columnsSvg = visibleCols
        .map((column, index) => {
          const y =
            tableY +
            TABLE_HEADER_HEIGHT +
            8 +
            index * COLUMN_ROW_HEIGHT +
            COLUMN_ROW_HEIGHT / 2 +
            4;
          const badge = columnBadge(column);

          let badgeSvg = "";
          let textIndent = 12;

          if (badge) {
            let bgFill = "#ecfdf5";
            let textFill = "#047857";
            let borderStroke = "#a7f3d0";

            if (column.key === "pk") {
              bgFill = "#d1fae5";
              textFill = "#047857";
              borderStroke = "#6ee7b7";
            } else if (column.key === "fk") {
              bgFill = "#e0f2fe";
              textFill = "#0369a1";
              borderStroke = "#7dd3fc";
            } else if (column.key === "unique") {
              bgFill = "#f3e8ff";
              textFill = "#6b21a8";
              borderStroke = "#c084fc";
            }

            badgeSvg = `<rect x="${tableX + 10}" y="${y - 13}" width="34" height="17" rx="4" fill="${bgFill}" stroke="${borderStroke}" stroke-width="1"/><text x="${tableX + 27}" y="${y - 1}" fill="${textFill}" font-size="9" font-weight="700" text-anchor="middle" font-family="Inter, sans-serif">${badge.label}</text>`;
            textIndent = 50;
          }

          return `<g><rect x="${tableX + 4}" y="${y - 17}" width="${TABLE_WIDTH - 8}" height="28" rx="4" fill="transparent"/><line x1="${tableX + 8}" y1="${y + 10}" x2="${tableX + TABLE_WIDTH - 8}" y2="${y + 10}" stroke="#f1f5f9" stroke-width="0.8"/>${badgeSvg}<text x="${tableX + textIndent}" y="${y}" fill="#334155" font-size="12" font-weight="600" font-family="ui-monospace, monospace">${escapeXml(column.name)}</text><text x="${tableX + TABLE_WIDTH - 12}" y="${y}" fill="#94a3b8" font-size="11" font-weight="500" text-anchor="end" font-family="ui-monospace, monospace">${escapeXml(formatColumnType(column))}</text></g>`;
        })
        .join("");

      const clipId = `card-clip-${table.id}`;

      return `<g class="table-card">
        <defs>
          <clipPath id="${clipId}">
            <rect x="${tableX}" y="${tableY}" width="${TABLE_WIDTH}" height="${cardHeight}" rx="10"/>
          </clipPath>
        </defs>
        <rect x="${tableX}" y="${tableY}" width="${TABLE_WIDTH}" height="${cardHeight}" rx="10" fill="#ffffff" stroke="#cbd5e1" stroke-width="1.2" filter="drop-shadow(0 8px 16px rgba(15,23,42,0.12))"/>
        <g clip-path="url(#${clipId})">
          <rect x="${tableX}" y="${tableY}" width="${TABLE_WIDTH}" height="44" fill="#0f5132"/>
          <g transform="translate(${tableX + 12}, ${tableY + 13})">
            <rect width="18" height="18" rx="4" fill="rgba(217,255,87,0.22)" stroke="rgba(217,255,87,0.4)" stroke-width="0.8"/>
            <rect x="4" y="4" width="10" height="10" rx="1.5" fill="none" stroke="#d9ff57" stroke-width="1.2"/>
            <line x1="4" y1="8.5" x2="14" y2="8.5" stroke="#d9ff57" stroke-width="1.1"/>
            <line x1="9" y1="4" x2="9" y2="14" stroke="#d9ff57" stroke-width="1.1"/>
          </g>
          <text x="${tableX + 36}" y="${tableY + 27}" fill="#ffffff" font-size="14" font-weight="700" font-family="ui-monospace, monospace">${escapeXml(table.name)}</text>
          ${config.includeWatermark ? `<g transform="translate(${tableX + TABLE_WIDTH - 118}, ${tableY + 14})"><rect width="48" height="16" rx="4" fill="rgba(217,255,87,0.16)" stroke="rgba(217,255,87,0.3)" stroke-width="0.8"/><text x="24" y="11" fill="#d9ff57" font-size="8" font-weight="800" text-anchor="middle" font-family="Inter, sans-serif" letter-spacing="0.4">NEXORA</text></g>` : ""}
          <text x="${tableX + TABLE_WIDTH - 12}" y="${tableY + 26}" fill="#d1fae5" font-size="10" font-weight="600" text-anchor="end" font-family="Inter, sans-serif">${isCollapsed ? `${visibleCols.length}/${table.columns.length} keys` : `${table.columns.length} cols`}</text>
        </g>
        ${columnsSvg}
      </g>`;
    })
    .join("");

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}"><rect width="100%" height="100%" fill="${bgColor}"/>${gridPatternSvg}${glowSvg}${tiledWatermarkSvg}${centerWatermarkSvg}${headerBarSvg}${linesSvg}${cardsSvg}${watermarkSvg}</svg>`;
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
  themeMode: "dark" | "blueprint" | "light" = "dark",
  collapsedTableIds: Set<string> = new Set(),
  config: ExportStudioConfig = defaultExportStudioConfig,
  dialect: SchemaDialect = "dbml",
) {
  const logoSrc = await getNexoraLogoDataUrl();
  const svg = buildExportSvg(
    tables,
    relationships,
    themeMode,
    collapsedTableIds,
    diagramName,
    logoSrc,
    config,
    dialect,
  );
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
    context.fillStyle = themeMode === "blueprint" ? "#060d1e" : themeMode === "dark" ? "#070b09" : "#fbfcfb";
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

  const iframe = document.createElement("iframe");
  iframe.style.position = "fixed";
  iframe.style.right = "0";
  iframe.style.bottom = "0";
  iframe.style.width = "0";
  iframe.style.height = "0";
  iframe.style.border = "0";
  iframe.style.opacity = "0";
  document.body.appendChild(iframe);

  const doc = iframe.contentWindow?.document;
  if (!doc) {
    document.body.removeChild(iframe);
    return;
  }

  doc.open();
  doc.write(
    `<!doctype html><html><head><title>${escapeXml(
      diagramName,
    )} - ERD Export</title><style>@page{size:auto;margin:12mm}body{margin:0;background:#ffffff;font-family:Inter,Arial,sans-serif}.wrap{padding:16px;text-align:center}.title{font-size:18px;font-weight:700;color:#0f5132;margin-bottom:16px;border-bottom:2px solid #ecfdf5;padding-bottom:10px}svg{max-width:100%;height:auto;display:block;margin:0 auto}</style></head><body><div class="wrap"><div class="title">${escapeXml(
      diagramName,
    )}</div>${svg}</div></body></html>`,
  );
  doc.close();

  iframe.contentWindow?.focus();
  setTimeout(() => {
    iframe.contentWindow?.print();
    setTimeout(() => {
      if (document.body.contains(iframe)) {
        document.body.removeChild(iframe);
      }
    }, 1000);
  }, 250);
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
  const [activeLine, setActiveLine] = useState(0);

  function handleCursorMove(textarea: HTMLTextAreaElement) {
    const textBefore = value.substring(0, textarea.selectionStart);
    const lineIndex = textBefore.split("\n").length - 1;
    setActiveLine(lineIndex);
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === "Tab") {
      event.preventDefault();
      const textarea = event.currentTarget;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;

      const nextValue =
        value.substring(0, start) + "  " + value.substring(end);
      onChange(nextValue);

      setTimeout(() => {
        textarea.selectionStart = textarea.selectionEnd = start + 2;
      }, 0);
    }
  }

  return (
    <div className="relative h-[560px] min-h-0 flex-1 overflow-hidden bg-[#0d1110] font-mono text-[13px] leading-6 tracking-normal shadow-inner light:bg-[#fbfefd] lg:h-full">
      {/* Line Numbers Gutter */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-y-0 left-0 z-10 w-14 border-r border-white/10 bg-[#090d0b] text-right font-mono text-[12px] text-slate-500 light:border-slate-200 light:bg-slate-50 light:text-slate-400"
      >
        <div
          className="px-3 py-4"
          style={{ transform: `translateY(-${scroll.top}px)` }}
        >
          {lines.map((_, index) => (
            <div
              key={`ln-${index}`}
              className={cn(
                "h-6",
                index === activeLine
                  ? "font-bold text-[var(--brand-lime)] light:text-emerald-700"
                  : "text-slate-500 light:text-slate-400",
              )}
            >
              {index + 1}
            </div>
          ))}
        </div>
      </div>

      {/* Syntax Highlight Overlay */}
      <pre
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 left-14 min-w-max whitespace-pre font-mono text-[13px] leading-6 tracking-normal py-4"
        style={{
          transform: `translate(${-scroll.left}px, ${-scroll.top}px)`,
        }}
      >
        {lines.map((line, index) => (
          <div
            key={`hl-${index}`}
            className={cn(
              "h-6 px-4 transition-colors",
              index === activeLine
                ? "bg-white/[0.045] light:bg-emerald-500/10"
                : "bg-transparent",
            )}
          >
            {highlightLine(line, dialect)}
          </div>
        ))}
      </pre>

      {/* Textarea Code Input */}
      <textarea
        value={value}
        onChange={(event) => {
          onChange(event.target.value);
          handleCursorMove(event.target);
        }}
        onKeyUp={(event) => handleCursorMove(event.currentTarget)}
        onClick={(event) => handleCursorMove(event.currentTarget)}
        onKeyDown={handleKeyDown}
        onScroll={(event) =>
          setScroll({
            top: event.currentTarget.scrollTop,
            left: event.currentTarget.scrollLeft,
          })
        }
        spellCheck={false}
        wrap="off"
        aria-label="Database schema code editor"
        className="absolute inset-0 left-14 w-[calc(100%-3.5rem)] resize-none overflow-auto border-0 bg-transparent px-4 py-4 font-mono text-[13px] leading-6 tracking-normal text-transparent caret-[var(--brand-lime)] outline-none selection:bg-emerald-400/30 light:caret-emerald-600 light:selection:bg-emerald-200/70"
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
  fromCollapsed,
  toCollapsed,
  selected,
  isHovered,
  isHighlighted,
  highlightRelationships,
  onSelect,
  onHover,
  onLeave,
}: {
  relationship: Relationship;
  from: Table;
  to: Table;
  fromCollapsed?: boolean;
  toCollapsed?: boolean;
  selected: boolean;
  isHovered: boolean;
  isHighlighted: boolean;
  highlightRelationships: boolean;
  onSelect: () => void;
  onHover: () => void;
  onLeave: () => void;
}) {
  const leftToRight = from.x + TABLE_WIDTH / 2 <= to.x + TABLE_WIDTH / 2;
  const x1 = leftToRight ? from.x + TABLE_WIDTH : from.x;
  const x2 = leftToRight ? to.x : to.x + TABLE_WIDTH;
  const y1 = getColumnCenterY(from, relationship.from.column, fromCollapsed);
  const y2 = getColumnCenterY(to, relationship.to.column, toCollapsed);
  const mid = (x1 + x2) / 2;
  const color = relationshipColor(relationship.kind);
  const strokeColor =
    isHovered || isHighlighted || selected
      ? color
      : highlightRelationships
        ? color
        : "#94A3B8";
  const relationshipWidth =
    isHovered || selected
      ? 4.2
      : isHighlighted
        ? 3.4
        : highlightRelationships
          ? 2.4
          : 1.8;
  const relationshipOpacity =
    isHovered || isHighlighted || selected
      ? 1
      : highlightRelationships
        ? 0.74
        : 0.22;

  return (
    <g
      onMouseEnter={onHover}
      onMouseLeave={onLeave}
      className="cursor-pointer transition-all duration-200"
    >
      <path
        d={`M ${x1} ${y1} C ${mid} ${y1}, ${mid} ${y2}, ${x2} ${y2}`}
        fill="none"
        stroke="transparent"
        strokeWidth="24"
        className="cursor-pointer"
        onClick={onSelect}
      />
      <path
        d={`M ${x1} ${y1} C ${mid} ${y1}, ${mid} ${y2}, ${x2} ${y2}`}
        fill="none"
        stroke={strokeColor}
        strokeWidth={relationshipWidth}
        strokeDasharray={relationshipDash(relationship.kind)}
        strokeLinecap="round"
        opacity={relationshipOpacity}
        style={{
          filter:
            isHovered || isHighlighted
              ? `drop-shadow(0 0 6px ${color})`
              : undefined,
        }}
      />
      <circle
        cx={x1}
        cy={y1}
        r={isHovered || selected ? 6 : 4}
        fill={strokeColor}
        opacity={relationshipOpacity}
      />
      <circle
        cx={x2}
        cy={y2}
        r={isHovered || selected ? 6 : 4}
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
  isHovered,
  isHighlighted,
  isSearchMatch,
  hasActiveSearch,
  isCollapsed,
  onToggleCollapse,
  zoom,
  stageRef,
  onSelect,
  onMove,
  onHover,
  onLeave,
}: {
  table: Table;
  selected: boolean;
  isHovered?: boolean;
  isHighlighted?: boolean;
  isSearchMatch?: boolean;
  hasActiveSearch?: boolean;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
  zoom: number;
  stageRef: React.RefObject<HTMLDivElement | null>;
  onSelect: () => void;
  onMove: (id: string, next: { x: number; y: number }) => void;
  onHover?: () => void;
  onLeave?: () => void;
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

  const columnsToRender = getVisibleColumns(table, isCollapsed);

  return (
    <div
      role="button"
      tabIndex={0}
      onMouseEnter={onHover}
      onMouseLeave={onLeave}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") onSelect();
      }}
      className={cn(
        "absolute cursor-grab overflow-hidden rounded-lg border bg-white text-left transition-[box-shadow,border-color,opacity,transform] duration-150 active:cursor-grabbing",
        isHovered || isHighlighted
          ? "border-emerald-500 ring-4 ring-emerald-400 shadow-[0_0_30px_rgba(50,245,154,0.5)] z-20 scale-[1.02]"
          : selected
            ? "border-emerald-500 ring-4 ring-emerald-200/70 z-10"
            : isSearchMatch
              ? "border-emerald-500 ring-4 ring-emerald-400/80 shadow-[0_0_24px_rgba(50,245,154,0.4)]"
              : "border-slate-300 hover:border-emerald-300",
        hasActiveSearch && !isSearchMatch && !selected && "opacity-40 grayscale-[20%]",
      )}
      style={{
        left: table.x,
        top: table.y,
        width: TABLE_WIDTH,
        minHeight: tableHeight(table, isCollapsed),
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
            {isCollapsed
              ? `${columnsToRender.length}/${table.columns.length} keys`
              : `${table.columns.length} columns`}
          </p>
        </div>
        <div className="flex items-center gap-1">
          {onToggleCollapse ? (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onToggleCollapse();
              }}
              className="rounded p-0.5 text-emerald-100 hover:bg-white/20"
              title={isCollapsed ? "Expand table columns" : "Collapse non-key columns"}
              aria-label={isCollapsed ? "Expand columns" : "Collapse columns"}
            >
              {isCollapsed ? (
                <ChevronRight className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </button>
          ) : null}
          <MousePointer2
            className="h-3.5 w-3.5 text-emerald-100"
            aria-hidden="true"
          />
        </div>
      </div>

      <div className="px-2 py-2">
        {columnsToRender.map((column) => {
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
  themeMode = "light",
  collapsedTableIds = new Set(),
  onZoom,
  onToolChange,
  onShowGridChange,
  onHighlightRelationshipsChange,
  onLayoutAlgorithmChange,
  onThemeModeChange,
  onToggleTableCollapse,
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
  themeMode?: "dark" | "blueprint" | "light";
  collapsedTableIds?: Set<string>;
  onZoom: (zoom: number) => void;
  onToolChange: (tool: CanvasTool) => void;
  onShowGridChange: (showGrid: boolean) => void;
  onHighlightRelationshipsChange: (enabled: boolean) => void;
  onLayoutAlgorithmChange: (algorithm: LayoutAlgorithm) => void;
  onThemeModeChange?: (theme: "dark" | "blueprint" | "light") => void;
  onToggleTableCollapse?: (tableId: string) => void;
  onSelect: (selection: Selection | null) => void;
  onMove: (id: string, next: { x: number; y: number }) => void;
  onAutoLayout: () => void;
}) {
  const stageRef = useRef<HTMLDivElement | null>(null);
  const scrollAreaRef = useRef<HTMLDivElement | null>(null);
  const [isSpacePressed, setIsSpacePressed] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [hoveredTableId, setHoveredTableId] = useState<string | null>(null);
  const [hoveredRelationshipId, setHoveredRelationshipId] = useState<string | null>(null);

  const activeHoverTableId = hoveredTableId;
  const activeHoverRelationship = relationships.find(
    (r) => r.id === hoveredRelationshipId,
  );

  const highlightedTableIds = useMemo(() => {
    const set = new Set<string>();
    if (activeHoverTableId) {
      set.add(activeHoverTableId);
      relationships.forEach((r) => {
        if (r.from.table === activeHoverTableId) set.add(r.to.table);
        if (r.to.table === activeHoverTableId) set.add(r.from.table);
      });
    } else if (activeHoverRelationship) {
      set.add(activeHoverRelationship.from.table);
      set.add(activeHoverRelationship.to.table);
    }
    return set;
  }, [activeHoverTableId, activeHoverRelationship, relationships]);

  const highlightedRelationshipIds = useMemo(() => {
    const set = new Set<string>();
    if (hoveredRelationshipId) {
      set.add(hoveredRelationshipId);
    }
    if (activeHoverTableId) {
      relationships.forEach((r) => {
        if (
          r.from.table === activeHoverTableId ||
          r.to.table === activeHoverTableId
        ) {
          set.add(r.id);
        }
      });
    }
    return set;
  }, [hoveredRelationshipId, activeHoverTableId, relationships]);

  function cycleThemeMode() {
    if (!onThemeModeChange) return;
    const next = themeMode === "dark" ? "blueprint" : themeMode === "blueprint" ? "light" : "dark";
    onThemeModeChange(next);
  }

  const panState = useRef({
    active: false,
    startX: 0,
    startY: 0,
    scrollLeft: 0,
    scrollTop: 0,
  });

  const activeTool = isSpacePressed ? "pan" : tool;

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

  const searchResults = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return [];

    const results: Array<{
      type: "table" | "column";
      table: Table;
      columnName?: string;
    }> = [];

    tables.forEach((table) => {
      if (table.name.toLowerCase().includes(query)) {
        results.push({ type: "table", table });
      }
      table.columns.forEach((col) => {
        if (col.name.toLowerCase().includes(query)) {
          results.push({ type: "column", table, columnName: col.name });
        }
      });
    });

    return results.slice(0, 8);
  }, [tables, searchQuery]);

  function handleFocusTable(targetTable: Table) {
    onSelect({ type: "table", id: targetTable.id });
    setIsSearchOpen(false);

    const area = scrollAreaRef.current;
    if (!area) return;

    const scale = zoom / 100;
    const targetX = targetTable.x * scale - area.clientWidth / 2 + (TABLE_WIDTH * scale) / 2;
    const targetY = targetTable.y * scale - area.clientHeight / 2 + (tableHeight(targetTable) * scale) / 2;

    area.scrollTo({
      left: Math.max(0, targetX),
      top: Math.max(0, targetY),
      behavior: "smooth",
    });
  }

  // Listen for Spacebar key to enable pan mode temporarily
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.code === "Space" && !event.repeat) {
        const target = event.target as HTMLElement | null;
        if (
          target &&
          (target.tagName === "INPUT" ||
            target.tagName === "TEXTAREA" ||
            target.isContentEditable)
        ) {
          return;
        }
        setIsSpacePressed(true);
      }
    }
    function handleKeyUp(event: KeyboardEvent) {
      if (event.code === "Space") {
        setIsSpacePressed(false);
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, []);

  // Listen for non-passive Mouse Wheel / Trackpad Pinch zoom
  useEffect(() => {
    const area = scrollAreaRef.current;
    if (!area) return;

    function handleWheel(event: WheelEvent) {
      if (event.ctrlKey || event.metaKey || event.altKey) {
        event.preventDefault();
        const delta = event.deltaY < 0 ? 8 : -8;
        onZoom(Math.min(180, Math.max(40, zoom + delta)));
      }
    }

    area.addEventListener("wheel", handleWheel, { passive: false });
    return () => {
      area.removeEventListener("wheel", handleWheel);
    };
  }, [zoom, onZoom]);

  function handlePanPointerDown(event: ReactPointerEvent<HTMLDivElement>) {
    const isMiddleClick = event.button === 1;
    if (activeTool !== "pan" && !isMiddleClick) return;
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
    if (!panState.current.active) return;
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

  function handleStageClick(event: React.MouseEvent<HTMLDivElement>) {
    if (event.target === stageRef.current || event.target === scrollAreaRef.current) {
      onSelect(null);
    }
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
          onClick={() => onZoom(Math.max(40, zoom - 10))}
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
          onClick={() => onZoom(Math.min(180, zoom + 10))}
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
          aria-label="Reset zoom (100%)"
          title="Reset zoom to 100%"
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
            activeTool === "select" &&
              "border-[color:var(--border-emerald)] bg-[rgba(50,245,154,0.10)] text-[var(--brand-lime)] light:border-emerald-200 light:bg-emerald-50 light:text-emerald-700",
          )}
          aria-label="Select mode"
          title="Select mode (default)"
        >
          <MousePointer2 className="h-4 w-4" aria-hidden="true" />
        </button>
        <button
          type="button"
          onClick={() => onToolChange("pan")}
          className={cn(
            compactIconButton,
            activeTool === "pan" &&
              "border-[color:var(--border-emerald)] bg-[rgba(50,245,154,0.10)] text-[var(--brand-lime)] light:border-emerald-200 light:bg-emerald-50 light:text-emerald-700",
          )}
          aria-label="Pan mode"
          title="Pan canvas (or hold Spacebar)"
        >
          <Hand className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>

      <div className="absolute bottom-3 sm:bottom-4 left-1/2 z-20 flex -translate-x-1/2 items-center gap-1 sm:gap-1.5 max-w-[95vw] sm:max-w-none flex-wrap justify-center rounded-xl border border-white/10 bg-[rgba(18,24,21,0.90)] p-1 sm:p-1.5 shadow-[0_24px_54px_rgba(0,0,0,0.38)] backdrop-blur light:border-slate-200 light:bg-white/95 light:shadow-[0_14px_34px_rgba(15,23,42,0.14)]">
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
          onClick={cycleThemeMode}
          className={cn(
            compactButton,
            themeMode === "blueprint" && "border-sky-400/80 bg-sky-500/20 text-sky-300 font-bold",
          )}
          title={`Switch Theme (Current: ${themeMode})`}
        >
          <Palette className="h-4 w-4" aria-hidden="true" />
          {themeMode === "blueprint" ? "Blueprint" : themeMode === "dark" ? "Dark Glass" : "Light Studio"}
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
          "relative flex-1 overflow-auto transition-colors duration-300",
          themeMode === "blueprint"
            ? "bg-[#060d1e]"
            : themeMode === "dark"
              ? "bg-[#070b09]"
              : "bg-[#fbfcfb]",
          activeTool === "pan"
            ? "cursor-grab active:cursor-grabbing"
            : "cursor-default",
        )}
        onClick={handleStageClick}
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
                themeMode === "blueprint"
                  ? "linear-gradient(to right, rgba(56, 189, 248, 0.18) 1px, transparent 1px), linear-gradient(to bottom, rgba(56, 189, 248, 0.18) 1px, transparent 1px)"
                  : "radial-gradient(circle, rgba(108,246,179,0.22) 1.1px, transparent 1.2px)",
              backgroundSize: themeMode === "blueprint" ? "24px 24px" : "14px 14px",
            }}
          />
        ) : null}
        <div className="relative min-h-full min-w-full p-10">
          <div
            ref={stageRef}
            className={cn("relative", activeTool === "pan" && "pointer-events-none")}
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
                    fromCollapsed={collapsedTableIds.has(from.id)}
                    toCollapsed={collapsedTableIds.has(to.id)}
                    selected={
                      selection?.type === "relationship" &&
                      selection.id === relationship.id
                    }
                    isHovered={hoveredRelationshipId === relationship.id}
                    isHighlighted={highlightedRelationshipIds.has(relationship.id)}
                    highlightRelationships={highlightRelationships}
                    onSelect={() =>
                      onSelect({ type: "relationship", id: relationship.id })
                    }
                    onHover={() => setHoveredRelationshipId(relationship.id)}
                    onLeave={() => setHoveredRelationshipId(null)}
                  />
                );
              })}
            </svg>

            {tables.map((table) => {
              const query = searchQuery.trim().toLowerCase();
              const isMatch =
                !!query &&
                (table.name.toLowerCase().includes(query) ||
                  table.columns.some((col) =>
                    col.name.toLowerCase().includes(query),
                  ));
              return (
                <TableNode
                  key={table.id}
                  table={table}
                  selected={
                    selection?.type === "table" && selection.id === table.id
                  }
                  isHovered={hoveredTableId === table.id}
                  isHighlighted={highlightedTableIds.has(table.id)}
                  isSearchMatch={isMatch}
                  hasActiveSearch={!!query}
                  isCollapsed={collapsedTableIds.has(table.id)}
                  onToggleCollapse={() => onToggleTableCollapse?.(table.id)}
                  zoom={zoom}
                  stageRef={stageRef}
                  onSelect={() => onSelect({ type: "table", id: table.id })}
                  onMove={onMove}
                  onHover={() => setHoveredTableId(table.id)}
                  onLeave={() => setHoveredTableId(null)}
                />
              );
            })}

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
  onAddAuditFields,
  onGenerateMockData,
  onClose,
}: {
  tables: Table[];
  relationships: Relationship[];
  selection: Selection | null;
  issues: ParseIssue[];
  suggestions: AiSuggestion[];
  onAddAuditFields?: () => void;
  onGenerateMockData?: () => void;
  onClose?: () => void;
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
    <aside className="flex h-full min-h-0 flex-col overflow-hidden border-l border-white/10 bg-[#0d1110] light:border-slate-200 light:bg-white">
      <header className="flex shrink-0 items-center justify-between gap-3 border-b border-white/10 bg-[#121715] px-4 py-3 light:border-slate-200 light:bg-[#fbfefd]">
        <div className="flex items-center gap-2.5">
          <IconTile icon={PanelRight} tone="blue" />
          <div>
            <h2 className="text-sm font-bold text-white light:text-slate-950">
              Inspector
            </h2>
            <p className="text-xs text-slate-500">
              Table & relationship details
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="rounded-full bg-white/[0.06] px-2.5 py-0.5 text-[11px] font-bold text-slate-300 light:bg-slate-100 light:text-slate-600">
            {issues.length} validations
          </span>
          {onClose ? (
            <button
              type="button"
              onClick={onClose}
              className="grid h-7 w-7 place-items-center rounded-lg border border-white/10 text-slate-400 transition hover:bg-white/10 hover:text-white light:border-slate-200 light:text-slate-500 light:hover:bg-slate-100"
              aria-label="Close Inspector"
              title="Close Inspector"
            >
              <X className="h-3.5 w-3.5" aria-hidden="true" />
            </button>
          ) : null}
        </div>
      </header>

      <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto p-4">
        {/* Selected Entity Card */}
        <div className="rounded-[18px] border border-white/10 bg-white/[0.035] p-4 light:border-slate-200 light:bg-[#fbfefd]">
          {selectedTable ? (
            <>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-emerald-500 light:text-emerald-700">
                    Selected table
                  </p>
                  <h3 className="mt-1 truncate font-mono text-lg font-bold text-white light:text-slate-950">
                    {selectedTable.name}
                  </h3>
                  <p className="mt-1 text-xs leading-5 text-slate-500">
                    {selectedTable.description ||
                      "Parsed from active editor document."}
                  </p>
                </div>
                <div className="flex shrink-0 gap-1.5">
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

              <div className="mt-4 overflow-hidden rounded-xl border border-white/10 bg-[#0d1110] light:border-slate-200 light:bg-white">
                <div className="grid grid-cols-[minmax(0,1fr)_85px_55px] border-b border-white/10 bg-white/[0.04] px-3 py-2 text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400 light:border-slate-200 light:bg-slate-50 light:text-slate-500">
                  <span>Column</span>
                  <span>Type</span>
                  <span>Key</span>
                </div>
                <div className="max-h-[220px] overflow-y-auto">
                  {selectedTable.columns.map((column) => (
                    <div
                      key={`${selectedTable.id}-detail-${column.name}`}
                      className="grid grid-cols-[minmax(0,1fr)_85px_55px] items-center gap-2 border-b border-white/10 px-3 py-2 text-xs last:border-b-0 light:border-slate-100"
                    >
                      <div className="min-w-0">
                        <p className="truncate font-mono font-semibold text-slate-200 light:text-slate-800">
                          {column.name}
                        </p>
                        {column.references ? (
                          <p className="mt-0.5 truncate text-[10px] text-slate-500">
                            refs {column.references.table}.{column.references.column}
                          </p>
                        ) : null}
                      </div>
                      <span className="truncate font-mono text-[11px] font-medium text-slate-400">
                        {formatColumnType(column)}
                      </span>
                      <span className="text-[10px] font-bold uppercase text-slate-400">
                        {column.key === "none" ? "-" : column.key}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </>
          ) : selectedRelationship ? (
            <>
              <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-sky-500 light:text-sky-700">
                Selected relationship
              </p>
              <h3 className="mt-1 font-mono text-base font-bold text-white light:text-slate-950">
                {selectedRelationship.from.table}.
                {selectedRelationship.from.column}
                <span className="px-1 text-xs text-slate-400">to</span>
                {selectedRelationship.to.table}.{selectedRelationship.to.column}
              </h3>
              <div className="mt-3 grid grid-cols-3 gap-2">
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
              <p className="mt-3 rounded-xl border border-sky-300/20 bg-sky-300/10 px-3 py-2.5 text-xs leading-5 text-sky-100 light:border-sky-100 light:bg-sky-50 light:text-sky-800">
                Add an index on the foreign-key side if this relationship is
                used in queries.
              </p>
            </>
          ) : (
            <div className="py-6 text-center">
              <IconTile icon={MousePointer2} tone="slate" />
              <h3 className="mt-3 text-sm font-bold text-white light:text-slate-950">
                Select a table or line
              </h3>
              <p className="mt-1 text-xs leading-5 text-slate-500">
                Click a table card or relationship line in the canvas to inspect
                its fields and properties.
              </p>
            </div>
          )}
        </div>

        {/* Actionable AI Tools Card */}
        <div className="rounded-[18px] border border-white/10 bg-white/[0.035] p-4 light:border-slate-200 light:bg-white">
          <div className="flex items-center gap-2">
            <IconTile icon={Bot} tone="violet" />
            <div>
              <h3 className="text-sm font-bold text-white light:text-slate-950">
                Actionable AI Tools
              </h3>
              <p className="text-xs text-slate-500">
                One-click schema refactoring
              </p>
            </div>
          </div>

          <div className="mt-3 grid gap-2">
            {onAddAuditFields ? (
              <button
                type="button"
                onClick={onAddAuditFields}
                className="flex w-full items-center justify-between gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-left text-xs font-bold text-emerald-300 transition hover:bg-emerald-500/20 light:border-emerald-200 light:bg-emerald-50 light:text-emerald-800"
              >
                <span className="flex items-center gap-2">
                  <Zap className="h-4 w-4 text-[var(--brand-lime)] light:text-emerald-700" />
                  Add Audit Timestamps
                </span>
                <span className="rounded bg-emerald-400/20 px-1.5 py-0.5 text-[10px]">1-Click</span>
              </button>
            ) : null}

            {onGenerateMockData ? (
              <button
                type="button"
                onClick={onGenerateMockData}
                className="flex w-full items-center justify-between gap-2 rounded-xl border border-sky-500/30 bg-sky-500/10 px-3 py-2 text-left text-xs font-bold text-sky-300 transition hover:bg-sky-500/20 light:border-sky-200 light:bg-sky-50 light:text-sky-800"
              >
                <span className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-sky-400 light:text-sky-700" />
                  Generate Mock Data
                </span>
                <span className="rounded bg-sky-400/20 px-1.5 py-0.5 text-[10px]">SQL/JSON</span>
              </button>
            ) : null}

            {suggestions.map((suggestion) => (
              <div
                key={suggestion.title}
                className={cn(
                  "rounded-xl border px-3 py-2 text-xs",
                  suggestion.tone === "emerald" &&
                    "border-[color:var(--border-emerald)] bg-[rgba(50,245,154,0.10)] text-[var(--brand-emerald)] light:border-emerald-100 light:bg-emerald-50 light:text-emerald-800",
                  suggestion.tone === "amber" &&
                    "border-amber-300/20 bg-amber-300/10 text-amber-100 light:border-amber-100 light:bg-amber-50 light:text-amber-800",
                  suggestion.tone === "blue" &&
                    "border-sky-300/20 bg-sky-300/10 text-sky-100 light:border-sky-100 light:bg-sky-50 light:text-sky-800",
                )}
              >
                <p className="font-bold">{suggestion.title}</p>
                <p className="mt-0.5 text-[11px] leading-4 opacity-90">{suggestion.detail}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Validation Issues Card */}
        <div className="rounded-[18px] border border-white/10 bg-white/[0.035] p-4 light:border-slate-200 light:bg-white">
          <h3 className="text-sm font-bold text-white light:text-slate-950">
            Validation Issues
          </h3>
          <div className="mt-2 grid gap-2">
            {issues.length === 0 ? (
              <p className="rounded-xl bg-[rgba(50,245,154,0.10)] px-3 py-2 text-xs font-semibold text-[var(--brand-emerald)] light:bg-emerald-50 light:text-emerald-700">
                No blocking validation issues.
              </p>
            ) : (
              issues.slice(0, 3).map((issue, index) => (
                <p
                  key={`${issue.message}-${index}`}
                  className="rounded-xl bg-amber-300/10 px-3 py-2 text-xs leading-4 text-amber-100 light:bg-amber-50 light:text-amber-800"
                >
                  {issue.message}
                </p>
              ))
            )}
          </div>
        </div>
      </div>
    </aside>
  );
}

function TopToolbar({
  diagramName,
  onDiagramNameChange,
  stats,
  showInspector,
  isFullscreen,
  onToggleInspector,
  onToggleFullscreen,
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
  showInspector: boolean;
  isFullscreen: boolean;
  onToggleInspector: () => void;
  onToggleFullscreen: () => void;
  onSave: () => void | Promise<void>;
  onImport: () => void;
  onExport: (format: ExportFormat) => void | Promise<void>;
  onAutoLayout: () => void;
  onAiAssist: () => void;
  onShare: () => void;
}) {
  const toolbarButton =
    "inline-flex h-8 items-center justify-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.055] px-3 text-xs font-bold text-slate-200 transition hover:border-[color:var(--border-emerald)] hover:bg-[rgba(50,245,154,0.12)] hover:text-[var(--brand-lime)] light:border-slate-200 light:bg-white light:text-slate-700 light:hover:border-emerald-200 light:hover:bg-emerald-50 light:hover:text-emerald-700";

  return (
    <section className="overflow-hidden rounded-t-[18px] border border-white/10 bg-[#0d1410] shadow-[0_24px_70px_rgba(0,0,0,0.34)] light:border-slate-200 light:bg-white light:shadow-[0_16px_40px_rgba(33,45,74,0.08)]">
      <div className="flex flex-col gap-2 border-t border-[color:var(--border-emerald)] p-2 light:border-emerald-200 lg:flex-row lg:items-center lg:justify-between">
        {/* Left Section: Workspace + Title + Metrics (dbdiagram style) */}
        <div className="flex min-w-0 flex-1 items-center gap-2">
          <div className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-2.5 py-1 text-xs font-bold text-slate-200 light:border-slate-200 light:bg-slate-100 light:text-slate-800">
            <span className="grid h-5 w-5 place-items-center rounded bg-[linear-gradient(135deg,#d9ff57,#32f59a)] text-[#07100b]">
              <Database className="h-3 w-3" aria-hidden="true" />
            </span>
            <span>Nexora OS</span>
          </div>

          <span className="text-slate-500 font-bold">/</span>

          <div className="min-w-[160px] max-w-[320px] flex-1">
            <input
              value={diagramName}
              onChange={(event) => onDiagramNameChange(event.target.value)}
              aria-label="Diagram name"
              placeholder="Untitled Diagram"
              className="h-8 w-full rounded-lg border border-white/10 bg-[#070b09] px-3 text-xs font-bold text-white outline-none placeholder:text-slate-600 hover:border-[color:var(--border-emerald)] focus:border-[color:var(--border-lime)] focus:bg-[#050806] light:border-slate-200 light:bg-slate-50 light:text-slate-950 light:placeholder:text-slate-300 light:hover:border-emerald-200 light:focus:border-emerald-300 light:focus:bg-white"
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
          </div>
        </div>

        {/* Right Section: Action Buttons (dbdiagram style: AI, Save, Share, Import, Export) */}
        <div className="flex flex-wrap items-center gap-1.5">
          <button type="button" onClick={onAiAssist} className={toolbarButton} title="AI Assistant">
            <Sparkles className="h-3.5 w-3.5 text-emerald-400" aria-hidden="true" />
            AI
          </button>

          <button type="button" onClick={onSave} className={toolbarButton} title="Save Diagram">
            <Save className="h-3.5 w-3.5" aria-hidden="true" />
            Save
          </button>

          <button type="button" onClick={onShare} className={toolbarButton} title="Share Link">
            <Share2 className="h-3.5 w-3.5" aria-hidden="true" />
            Share
          </button>

          <button type="button" onClick={onImport} className={toolbarButton} title="Import Schema File">
            <Upload className="h-3.5 w-3.5" aria-hidden="true" />
            Import
          </button>

          <button
            type="button"
            onClick={() => onExport("png")}
            className="inline-flex h-8 items-center justify-center gap-1.5 rounded-lg bg-[linear-gradient(135deg,#d9ff57,#32f59a)] px-3 text-xs font-bold text-[#07100b] shadow-[0_0_20px_rgba(50,245,154,0.25)] transition hover:opacity-90"
            title="Open Export Studio (PNG, SVG, PDF)"
          >
            <Download className="h-3.5 w-3.5" aria-hidden="true" />
            Export
          </button>

          <span
            className="mx-1 h-6 w-px bg-white/10 light:bg-slate-200"
            aria-hidden="true"
          />

          <button
            type="button"
            onClick={onToggleFullscreen}
            className={cn(
              toolbarButton,
              isFullscreen &&
                "border-[color:var(--border-emerald)] bg-[rgba(50,245,154,0.15)] text-[var(--brand-lime)] font-bold light:border-emerald-200 light:bg-emerald-50 light:text-emerald-700",
            )}
            title={isFullscreen ? "Exit Fullscreen (Esc)" : "Enter Fullscreen Mode"}
          >
            {isFullscreen ? (
              <Minimize2 className="h-3.5 w-3.5" aria-hidden="true" />
            ) : (
              <Maximize2 className="h-3.5 w-3.5" aria-hidden="true" />
            )}
          </button>

          <button
            type="button"
            onClick={onToggleInspector}
            className={cn(
              toolbarButton,
              showInspector &&
                "border-[color:var(--border-emerald)] bg-[rgba(50,245,154,0.10)] text-[var(--brand-lime)] light:border-emerald-200 light:bg-emerald-50 light:text-emerald-700",
            )}
            title="Toggle Inspector Sidebar"
          >
            <PanelRight className="h-3.5 w-3.5" aria-hidden="true" />
          </button>
        </div>
      </div>
    </section>
  );
}

function ExportStudioModal({
  isOpen,
  tables,
  relationships,
  diagramName,
  dialect,
  themeMode,
  collapsedTableIds,
  onClose,
  onExport,
}: {
  isOpen: boolean;
  tables: Table[];
  relationships: Relationship[];
  diagramName: string;
  dialect: SchemaDialect;
  themeMode: "dark" | "blueprint" | "light";
  collapsedTableIds: Set<string>;
  onClose: () => void;
  onExport: (format: ExportFormat, config: ExportStudioConfig) => void | Promise<void>;
}) {
  const [config, setConfig] = useState<ExportStudioConfig>(() => ({
    ...defaultExportStudioConfig,
    preset: themeMode === "blueprint" ? "blueprint" : themeMode === "light" ? "clean" : "studio",
  }));
  const [logoSrc, setLogoSrc] = useState<string>("/brand/nexora-os-logo.png");
  const [isExporting, setIsExporting] = useState<string | null>(null);
  const [previewMode, setPreviewMode] = useState<"fit" | "full">("fit");

  useEffect(() => {
    getNexoraLogoDataUrl().then(setLogoSrc);
  }, []);

  // Reset the preset to match the current theme every time the dialog opens.
  // Adjusted directly during render (the transition from closed to open)
  // rather than a useEffect, since it's derived purely from the `isOpen` prop.
  const [wasOpen, setWasOpen] = useState(isOpen);
  if (isOpen !== wasOpen) {
    setWasOpen(isOpen);
    if (isOpen) {
      const activePreset: ExportPreset =
        themeMode === "blueprint" ? "blueprint" : themeMode === "light" ? "clean" : "studio";
      setConfig((prev) => ({ ...prev, preset: activePreset }));
    }
  }

  if (!isOpen) return null;

  const svgPreview = buildExportSvg(
    tables,
    relationships,
    config.preset === "blueprint" ? "blueprint" : config.preset === "clean" ? "light" : "dark",
    collapsedTableIds,
    diagramName,
    logoSrc,
    config,
    dialect,
  );

  async function handleDownload(format: ExportFormat) {
    setIsExporting(format);
    try {
      await onExport(format, config);
    } finally {
      setIsExporting(null);
    }
  }

  const presetOptions: { id: ExportPreset; label: string; desc: string; badge: string }[] = [
    { id: "studio", label: "Studio Glass", desc: "MacOS window frame with subtle ambient backlight", badge: "Default" },
    { id: "blueprint", label: "Cyber Blueprint", desc: "Cyan architectural grid pattern", badge: "Cyan Grid" },
    { id: "dark", label: "Enterprise Dark", desc: "Onyx background with emerald accents", badge: "Dark Glass" },
    { id: "clean", label: "Minimal Paper", desc: "Crisp document canvas with soft drop shadows", badge: "Light Canvas" },
  ];

  return (
    <div className="fixed inset-0 z-[100] grid place-items-center bg-black/80 p-4 backdrop-blur-md animate-in fade-in duration-200">
      <div className="flex h-[92vh] max-h-[920px] w-[94vw] max-w-6xl xl:max-w-7xl flex-col overflow-hidden rounded-2xl border border-white/15 bg-[#0a0f0d] text-white shadow-[0_32px_90px_rgba(0,0,0,0.6)]">
        {/* Modal Header */}
        <header className="flex items-center justify-between border-b border-white/10 bg-[#101713] px-6 py-4">
          <div className="flex items-center gap-3">
            <span className="grid h-9 w-9 place-items-center rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-400">
              <SlidersHorizontal className="h-5 w-5" aria-hidden="true" />
            </span>
            <div>
              <h2 className="text-base font-bold text-white">Export Studio</h2>
              <p className="text-xs text-slate-400">Configure canvas presets, layout elements, and download formats</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="grid h-8 w-8 place-items-center rounded-lg border border-white/10 bg-white/5 text-slate-400 transition hover:bg-white/10 hover:text-white"
          >
            ✕
          </button>
        </header>

        {/* Modal Body */}
        <div className="grid flex-1 min-h-0 grid-cols-1 overflow-y-auto lg:grid-cols-[300px_minmax(0,1fr)]">
          {/* Controls Sidebar */}
          <div className="flex flex-col gap-5 border-r border-white/10 bg-[#0d1410] p-5">
            {/* Preset Selector */}
            <div>
              <label className="mb-2.5 block text-xs font-bold uppercase tracking-wider text-slate-400">
                Canvas Preset
              </label>
              <div className="grid gap-2">
                {presetOptions.map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setConfig((prev) => ({ ...prev, preset: opt.id }))}
                    className={cn(
                      "flex flex-col items-start gap-1 rounded-xl border p-3 text-left transition",
                      config.preset === opt.id
                        ? "border-[color:var(--border-emerald)] bg-[rgba(50,245,154,0.12)] text-white shadow-[0_0_20px_rgba(50,245,154,0.15)]"
                        : "border-white/10 bg-white/[0.03] text-slate-300 hover:border-white/20 hover:bg-white/[0.06]",
                    )}
                  >
                    <div className="flex w-full items-center justify-between">
                      <span className="text-xs font-bold">{opt.label}</span>
                      <span className="rounded bg-white/10 px-1.5 py-0.5 text-[9px] font-semibold text-slate-300">
                        {opt.badge}
                      </span>
                    </div>
                    <span className="text-[11px] text-slate-400 leading-tight">{opt.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Branding Toggles */}
            <div className="border-t border-white/10 pt-4">
              <label className="mb-2.5 block text-xs font-bold uppercase tracking-wider text-slate-400">
                Layout Elements
              </label>
              <div className="grid gap-2 text-xs">
                <label className="flex items-center justify-between rounded-lg border border-white/10 bg-white/[0.03] p-2.5 hover:bg-white/[0.06]">
                  <span className="font-medium text-slate-300">MacOS Window Frame</span>
                  <input
                    type="checkbox"
                    checked={config.includeHeaderBar}
                    onChange={(e) => setConfig((prev) => ({ ...prev, includeHeaderBar: e.target.checked }))}
                    className="h-4 w-4 rounded accent-emerald-500"
                  />
                </label>

                <label className="flex items-center justify-between rounded-lg border border-white/10 bg-white/[0.03] p-2.5 hover:bg-white/[0.06]">
                  <span className="font-medium text-slate-300">Schema Metrics Badge</span>
                  <input
                    type="checkbox"
                    checked={config.includeMetrics}
                    onChange={(e) => setConfig((prev) => ({ ...prev, includeMetrics: e.target.checked }))}
                    className="h-4 w-4 rounded accent-emerald-500"
                  />
                </label>

                <label className="flex items-center justify-between rounded-lg border border-white/10 bg-white/[0.03] p-2.5 hover:bg-white/[0.06]">
                  <span className="font-medium text-slate-300">Official Nexora Watermark</span>
                  <input
                    type="checkbox"
                    checked={config.includeWatermark}
                    onChange={(e) => setConfig((prev) => ({ ...prev, includeWatermark: e.target.checked }))}
                    className="h-4 w-4 rounded accent-emerald-500"
                  />
                </label>

                <label className="flex items-center justify-between rounded-lg border border-white/10 bg-white/[0.03] p-2.5 hover:bg-white/[0.06]">
                  <span className="font-medium text-slate-300">Ambient Background Glow</span>
                  <input
                    type="checkbox"
                    checked={config.includeBackgroundGlow}
                    onChange={(e) => setConfig((prev) => ({ ...prev, includeBackgroundGlow: e.target.checked }))}
                    className="h-4 w-4 rounded accent-emerald-500"
                  />
                </label>
              </div>
            </div>
          </div>

          {/* Live Preview Container */}
          <div className="flex flex-col p-5 bg-[#060a08] min-h-0">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Live Preview</span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setPreviewMode((prev) => (prev === "fit" ? "full" : "fit"))}
                  className="rounded border border-white/15 bg-white/5 px-2.5 py-1 text-[11px] font-semibold text-slate-300 transition hover:bg-white/10 hover:text-white"
                >
                  {previewMode === "fit" ? "🔍 Zoom 100%" : "📐 Fit to Screen"}
                </button>
                <span className="text-[11px] font-semibold text-emerald-400">1:1 Real-time Rendering</span>
              </div>
            </div>
            <div
              className={cn(
                "flex-1 min-h-[460px] h-full overflow-auto rounded-xl border border-white/10 bg-[#040705] p-0 shadow-inner transition-all",
                previewMode === "fit"
                  ? "flex items-center justify-center [&>svg]:w-full [&>svg]:h-full [&>svg]:max-h-[660px] [&>svg]:object-contain"
                  : "[&>svg]:w-auto [&>svg]:h-auto",
              )}
              dangerouslySetInnerHTML={{ __html: svgPreview }}
            />
          </div>
        </div>

        {/* Modal Footer Actions */}
        <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-white/10 bg-[#101713] px-6 py-4">
          <span className="text-xs font-semibold text-slate-400">
            Select format to trigger high-res download
          </span>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              disabled={isExporting !== null}
              onClick={() => handleDownload("png")}
              className="inline-flex h-9 items-center justify-center gap-2 rounded-xl bg-[linear-gradient(135deg,#d9ff57,#32f59a)] px-4 text-xs font-bold text-[#07100b] shadow-[0_0_24px_rgba(50,245,154,0.3)] transition hover:opacity-90 disabled:opacity-50"
            >
              <ImageDown className="h-4 w-4" aria-hidden="true" />
              {isExporting === "png" ? "Rendering PNG..." : "Download 2x PNG"}
            </button>
            <button
              type="button"
              disabled={isExporting !== null}
              onClick={() => handleDownload("svg")}
              className="inline-flex h-9 items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/10 px-4 text-xs font-bold text-white transition hover:bg-white/20 disabled:opacity-50"
            >
              <Download className="h-4 w-4" aria-hidden="true" />
              {isExporting === "svg" ? "Exporting SVG..." : "Download Vector SVG"}
            </button>
            <button
              type="button"
              disabled={isExporting !== null}
              onClick={() => handleDownload("pdf")}
              className="inline-flex h-9 items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/10 px-4 text-xs font-bold text-white transition hover:bg-white/20 disabled:opacity-50"
            >
              <FileText className="h-4 w-4" aria-hidden="true" />
              {isExporting === "pdf" ? "Preparing PDF..." : "Export PDF"}
            </button>
          </div>
        </footer>
      </div>
    </div>
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
  const [themeMode, setThemeMode] = useState<"dark" | "blueprint" | "light">("light");
  const [collapsedTableIds, setCollapsedTableIds] = useState<Set<string>>(new Set());

  function toggleTableCollapse(tableId: string) {
    setCollapsedTableIds((prev) => {
      const next = new Set(prev);
      if (next.has(tableId)) {
        next.delete(tableId);
      } else {
        next.add(tableId);
      }
      return next;
    });
  }
  const [showInspector, setShowInspector] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(true);
  const [layoutAlgorithm, setLayoutAlgorithm] = useState<LayoutAlgorithm>(2);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape" && isFullscreen) {
        setIsFullscreen(false);
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isFullscreen]);
  const [positionOverrides, setPositionOverrides] = useState<
    Record<string, { x: number; y: number }>
  >({});
  const [selection, setSelection] = useState<Selection | null>(null);
  const [status, setStatus] = useState("Live parser ready");
  const [manualSuggestions, setManualSuggestions] = useState<
    AiSuggestion[] | null
  >(null);
  const [savedDiagramId, setSavedDiagramId] = useState<string | null>(null);
  const [mockDataModalContent, setMockDataModalContent] = useState<{ sql: string; json: string } | null>(null);
  const [copiedType, setCopiedType] = useState<string | null>(null);

  function handleAddAuditFields() {
    let nextSource = source;

    if (dialect === "dbml") {
      nextSource = source.replace(/Table\s+([a-zA-Z0-9_]+)\s*\{([^}]*)\}/gi, (match, tableName, content) => {
        if (content.includes("created_at")) return match;
        return `Table ${tableName} {${content}\n  created_at timestamp [default: \`now()\`]\n  updated_at timestamp [default: \`now()\`]\n}`;
      });
    } else if (dialect === "sql") {
      nextSource = source.replace(/CREATE\s+TABLE\s+([^\(]+)\(([^;]+)\);/gi, (match, tableName, content) => {
        if (content.includes("created_at")) return match;
        return `CREATE TABLE ${tableName}(\n${content.trim()},\n  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,\n  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP\n);`;
      });
    } else if (dialect === "prisma") {
      nextSource = source.replace(/model\s+([a-zA-Z0-9_]+)\s*\{([^}]*)\}/gi, (match, modelName, content) => {
        if (content.includes("createdAt")) return match;
        return `model ${modelName} {${content}\n  createdAt DateTime @default(now())\n  updatedAt DateTime @updatedAt\n}`;
      });
    } else {
      nextSource = source.replace(/new\s+Schema\(\{([^}+]+)\}\)/gi, (match, content) => {
        if (content.includes("timestamps")) return match;
        return `new Schema({${content}}, { timestamps: true })`;
      });
    }

    setSource(nextSource);
    setStatus("⚡ Audit timestamps added to schema");
  }

  function handleGenerateMockData() {
    if (tables.length === 0) return;

    let sql = "";
    const jsonObj: Record<string, Array<Record<string, unknown>>> = {};

    tables.forEach((table) => {
      const rows: Array<Record<string, unknown>> = [];
      const colNames = table.columns.map((col) => col.name);

      for (let i = 1; i <= 3; i++) {
        const row: Record<string, unknown> = {};
        colNames.forEach((colName) => {
          const lower = colName.toLowerCase();
          if (lower.includes("id") && i === 1) row[colName] = i;
          else if (lower.includes("email")) row[colName] = `user${i}@example.com`;
          else if (lower.includes("name")) row[colName] = `Sample ${table.name} ${i}`;
          else if (lower.includes("price") || lower.includes("amount")) row[colName] = 29.99 * i;
          else if (lower.includes("status")) row[colName] = i % 2 === 0 ? "active" : "pending";
          else if (lower.includes("created") || lower.includes("updated")) row[colName] = new Date().toISOString();
          else row[colName] = `${table.name}_val_${i}`;
        });
        rows.push(row);
      }

      jsonObj[table.name] = rows;

      sql += `-- Mock Data for ${table.name}\n`;
      rows.forEach((row) => {
        const vals = Object.values(row).map((v) => (typeof v === "number" ? v : `'${v}'`));
        sql += `INSERT INTO ${table.name} (${colNames.join(", ")}) VALUES (${vals.join(", ")});\n`;
      });
      sql += "\n";
    });

    setMockDataModalContent({
      sql: sql.trim(),
      json: JSON.stringify(jsonObj, null, 2),
    });
  }

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

  const [isExportStudioOpen, setIsExportStudioOpen] = useState(false);

  async function handleExport(format: ExportFormat) {
    setIsExportStudioOpen(true);
  }

  async function handleExportWithConfig(
    format: ExportFormat,
    config: ExportStudioConfig = defaultExportStudioConfig,
  ) {
    await exportDiagram(
      format,
      tables,
      relationships,
      diagramName,
      themeMode,
      collapsedTableIds,
      config,
      dialect,
    );
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

      <div
        className={cn(
          "grid gap-0 text-white light:text-slate-950 transition-all duration-300",
          isFullscreen
            ? "fixed inset-0 z-50 flex flex-col h-screen w-screen bg-[#070b09] p-2 overflow-hidden"
            : "",
        )}
      >
        <TopToolbar
          diagramName={diagramName}
          onDiagramNameChange={setDiagramName}
          stats={{
            tables: tables.length,
            relationships: relationships.length,
            primaryKeys,
            foreignKeys,
          }}
          showInspector={showInspector}
          isFullscreen={isFullscreen}
          onToggleInspector={() => setShowInspector((prev) => !prev)}
          onToggleFullscreen={() => setIsFullscreen((prev) => !prev)}
          onSave={handleSave}
          onImport={() => fileInputRef.current?.click()}
          onExport={handleExport}
          onAutoLayout={handleAutoLayout}
          onAiAssist={handleAiExplain}
          onShare={handleShare}
        />

        <section
          className={cn(
            "grid overflow-hidden rounded-b-[18px] border-x border-b border-white/10 bg-[rgba(18,24,21,0.78)] shadow-[0_24px_70px_rgba(0,0,0,0.34)] light:border-slate-200 light:bg-white light:shadow-[0_18px_50px_rgba(15,23,42,0.10)]",
            isFullscreen
              ? "flex-1 min-h-0 h-full"
              : "lg:h-[calc(100dvh-142px)] lg:min-h-[560px] 2xl:min-h-[720px]",
            showInspector
              ? "lg:grid-cols-[clamp(230px,20vw,340px)_minmax(0,1fr)_clamp(250px,21vw,350px)]"
              : "lg:grid-cols-[clamp(260px,25vw,420px)_minmax(0,1fr)]",
          )}
        >
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
              themeMode={themeMode}
              collapsedTableIds={collapsedTableIds}
              onZoom={setZoom}
              onToolChange={setCanvasTool}
              onShowGridChange={setShowGrid}
              onHighlightRelationshipsChange={setHighlightRelationships}
              onLayoutAlgorithmChange={handleLayoutAlgorithmChange}
              onThemeModeChange={setThemeMode}
              onToggleTableCollapse={toggleTableCollapse}
              onSelect={setSelection}
              onMove={handleMoveTable}
              onAutoLayout={handleAutoLayout}
            />
          </div>

          {showInspector ? (
            <div className="min-h-0">
              <DetailsPanel
                tables={tables}
                relationships={relationships}
                selection={activeSelection}
                issues={parseResult.issues}
                suggestions={aiSuggestions}
                onAddAuditFields={handleAddAuditFields}
                onGenerateMockData={handleGenerateMockData}
                onClose={() => setShowInspector(false)}
              />
            </div>
          ) : null}
        </section>
      </div>

      {/* Mock Data Modal */}
      {mockDataModalContent ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <div className="flex max-h-[85vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#0d1110] shadow-2xl light:border-slate-200 light:bg-white">
            <div className="flex items-center justify-between border-b border-white/10 px-5 py-4 light:border-slate-200">
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-[var(--brand-lime)] light:text-emerald-700" />
                <h3 className="font-bold text-white light:text-slate-900">Generated Mock Data</h3>
              </div>
              <button
                type="button"
                onClick={() => setMockDataModalContent(null)}
                className="text-slate-400 hover:text-white light:hover:text-slate-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-5">
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold uppercase text-emerald-400">SQL INSERTs</span>
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(mockDataModalContent.sql);
                      setCopiedType("sql");
                      setTimeout(() => setCopiedType(null), 2000);
                    }}
                    className="flex items-center gap-1 rounded bg-white/10 px-2.5 py-1 text-xs font-semibold text-slate-200 hover:bg-white/20 light:bg-slate-100 light:text-slate-700"
                  >
                    {copiedType === "sql" ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                    {copiedType === "sql" ? "Copied!" : "Copy SQL"}
                  </button>
                </div>
                <pre className="max-h-48 overflow-auto rounded-xl bg-black/60 p-3 font-mono text-xs text-slate-300 light:bg-slate-900 light:text-slate-200">
                  {mockDataModalContent.sql}
                </pre>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold uppercase text-sky-400">JSON Dataset</span>
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(mockDataModalContent.json);
                      setCopiedType("json");
                      setTimeout(() => setCopiedType(null), 2000);
                    }}
                    className="flex items-center gap-1 rounded bg-white/10 px-2.5 py-1 text-xs font-semibold text-slate-200 hover:bg-white/20 light:bg-slate-100 light:text-slate-700"
                  >
                    {copiedType === "json" ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                    {copiedType === "json" ? "Copied!" : "Copy JSON"}
                  </button>
                </div>
                <pre className="max-h-48 overflow-auto rounded-xl bg-black/60 p-3 font-mono text-xs text-slate-300 light:bg-slate-900 light:text-slate-200">
                  {mockDataModalContent.json}
                </pre>
              </div>
            </div>

            <div className="border-t border-white/10 px-5 py-3 text-right light:border-slate-200">
              <button
                type="button"
                onClick={() => setMockDataModalContent(null)}
                className="rounded-lg bg-emerald-500 px-4 py-1.5 text-xs font-bold text-black hover:bg-emerald-400"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      ) : null}

      <ExportStudioModal
        isOpen={isExportStudioOpen}
        tables={tables}
        relationships={relationships}
        diagramName={diagramName}
        dialect={dialect}
        themeMode={themeMode}
        collapsedTableIds={collapsedTableIds}
        onClose={() => setIsExportStudioOpen(false)}
        onExport={handleExportWithConfig}
      />
    </AppShell>
  );
}

