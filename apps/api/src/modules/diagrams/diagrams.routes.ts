import { phase3DiagramSample } from "@nexora/config";
import type { DiagramEntity, DiagramOutput } from "@nexora/types";
import { Prisma } from "@prisma/client";
import { Router } from "express";

import { getPrisma } from "../../infrastructure/database/prisma.client.js";
import {
  requireAuth,
  type AuthenticatedRequest,
} from "../../middleware/auth.middleware.js";

export const diagramsRouter = Router();

diagramsRouter.use(requireAuth);

type AuthUser = NonNullable<AuthenticatedRequest["user"]>;
type SourceType = "dbml" | "sql" | "prisma" | "mongoose";

function currentUser(request: AuthenticatedRequest) {
  return request.user;
}

function canReview(user: AuthUser) {
  return (
    user.role === "TEACHER" ||
    user.role === "ADMIN" ||
    user.role === "SUPER_ADMIN"
  );
}

function asInputJson(value: unknown): Prisma.InputJsonValue {
  return value as Prisma.InputJsonValue;
}

function normalizeSourceType(value: unknown): SourceType {
  const sourceType = String(value ?? "sql").toLowerCase();

  return sourceType === "dbml" ||
    sourceType === "prisma" ||
    sourceType === "mongoose" ||
    sourceType === "sql"
    ? sourceType
    : "sql";
}

function fieldReference(table: string, column: string) {
  return `${table}.${column}`;
}

function parseSqlDdl(source: string): DiagramOutput {
  const entities: DiagramEntity[] = [];
  const relationships: string[] = [];
  const createTableRegex =
    /create\s+table\s+(?:if\s+not\s+exists\s+)?["`]?([a-zA-Z_][\w]*)["`]?\s*\(([\s\S]*?)\);/gi;
  let match: RegExpExecArray | null;

  while ((match = createTableRegex.exec(source)) !== null) {
    const tableName = match[1];
    const fieldBlock = match[2];
    const fieldLines = fieldBlock
      .split(/\n|,(?![^(]*\))/)
      .map((line) => line.trim())
      .filter(Boolean);
    const fields = fieldLines
      .filter((line) => !line.toLowerCase().startsWith("foreign key"))
      .filter((line) => !line.toLowerCase().startsWith("constraint"))
      .map((line) => {
        const [fieldName = "field", type = "text"] = line.split(/\s+/);
        const referencesMatch = line.match(
          /references\s+["`]?([a-zA-Z_][\w]*)["`]?\s*\(([\w]+)\)/i,
        );
        const references = referencesMatch
          ? fieldReference(referencesMatch[1], referencesMatch[2])
          : undefined;

        if (references) {
          relationships.push(`${tableName}.${fieldName} -> ${references}`);
        }

        return {
          name: fieldName.replace(/["`]/g, ""),
          type: type.replace(/["`]/g, ""),
          isPrimaryKey: /primary\s+key/i.test(line),
          isForeignKey: Boolean(references),
          references,
        };
      });

    for (const line of fieldLines) {
      const fkMatch = line.match(
        /foreign\s+key\s*\(([\w]+)\)\s+references\s+["`]?([a-zA-Z_][\w]*)["`]?\s*\(([\w]+)\)/i,
      );
      const pkMatch = line.match(/primary\s+key\s*\(([^)]+)\)/i);

      if (fkMatch) {
        const [, localField, foreignTable, foreignField] = fkMatch;
        relationships.push(
          `${tableName}.${localField} -> ${foreignTable}.${foreignField}`,
        );
        const field = fields.find((item) => item.name === localField);

        if (field) {
          field.isForeignKey = true;
          field.references = fieldReference(foreignTable, foreignField);
        }
      }

      if (pkMatch) {
        for (const column of pkMatch[1].split(",").map((item) => item.trim())) {
          const field = fields.find((item) => item.name === column);
          if (field) field.isPrimaryKey = true;
        }
      }
    }

    entities.push({ name: tableName, fields });
  }

  return entities.length > 0
    ? {
        entities,
        relationships: Array.from(new Set(relationships)),
        code: source,
        sourceType: "sql",
        exportFormats: ["png", "svg", "pdf"],
      }
    : {
        ...phase3DiagramSample,
        sourceType: "sql",
        exportFormats: ["png", "svg", "pdf"],
      };
}

function parseDbml(source: string): DiagramOutput {
  const entities: DiagramEntity[] = [];
  const relationships: string[] = [];
  const tableRegex = /Table\s+["`]?([A-Za-z_][\w]*)["`]?\s*\{([\s\S]*?)\}/gi;
  let match: RegExpExecArray | null;

  while ((match = tableRegex.exec(source)) !== null) {
    const [, tableName, body] = match;
    const fields = body
      .split(/\r?\n/)
      .map((line) => line.replace(/\/\/.*$/, "").trim())
      .filter(Boolean)
      .filter((line) => !line.startsWith("Indexes"))
      .map((line) => {
        const [name = "field", type = "varchar"] = line.split(/\s+/);
        const refMatch = line.match(
          /\[.*?ref:\s*[<>-]*\s*([A-Za-z_][\w]*)\.([A-Za-z_][\w]*)/i,
        );
        const references = refMatch
          ? fieldReference(refMatch[1], refMatch[2])
          : undefined;

        if (references) {
          relationships.push(`${tableName}.${name} -> ${references}`);
        }

        return {
          name,
          type,
          isPrimaryKey: /\bpk\b|primary\s+key/i.test(line),
          isForeignKey: Boolean(references),
          references,
        };
      });

    entities.push({ name: tableName, fields });
  }

  const refRegex =
    /Ref(?:\s+[A-Za-z_][\w]*)?\s*:\s*([A-Za-z_][\w]*)\.([A-Za-z_][\w]*)\s*[-<>]+\s*([A-Za-z_][\w]*)\.([A-Za-z_][\w]*)/gi;
  while ((match = refRegex.exec(source)) !== null) {
    const [, fromTable, fromColumn, toTable, toColumn] = match;
    relationships.push(`${fromTable}.${fromColumn} -> ${toTable}.${toColumn}`);
    const entity = entities.find((item) => item.name === fromTable);
    const field = entity?.fields.find((item) => item.name === fromColumn);

    if (field) {
      field.isForeignKey = true;
      field.references = fieldReference(toTable, toColumn);
    }
  }

  return entities.length > 0
    ? {
        entities,
        relationships: Array.from(new Set(relationships)),
        code: source,
        sourceType: "dbml",
        exportFormats: ["png", "svg", "pdf"],
      }
    : {
        ...phase3DiagramSample,
        sourceType: "dbml",
        exportFormats: ["png", "svg", "pdf"],
      };
}

function parsePrismaSchema(source: string): DiagramOutput {
  const entities: DiagramEntity[] = [];
  const relationships: string[] = [];
  const modelRegex = /model\s+([A-Za-z_]\w*)\s*\{([\s\S]*?)\}/g;
  let match: RegExpExecArray | null;

  while ((match = modelRegex.exec(source)) !== null) {
    const [, modelName, body] = match;
    const fields = body
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean)
      .filter((line) => !line.startsWith("@@"))
      .map((line) => {
        const [fieldName = "field", fieldType = "String"] = line.split(/\s+/);
        const relationMatch = line.match(
          /@relation\([^)]*references:\s*\[([^\]]+)\]/,
        );
        const cleanType = fieldType.replace(/\[\]|\?/g, "");
        const isId = /@id\b/.test(line);
        const isRelation =
          /^[A-Z]/.test(cleanType) &&
          !["String", "Int", "Float", "Boolean", "DateTime", "Json"].includes(
            cleanType,
          );

        if (relationMatch) {
          const referenceField = relationMatch[1].split(",")[0]?.trim() ?? "id";
          relationships.push(
            `${modelName}.${fieldName} -> ${cleanType}.${referenceField}`,
          );
        }

        return {
          name: fieldName,
          type: fieldType,
          isPrimaryKey: isId,
          isForeignKey: Boolean(relationMatch) || isRelation,
          references: relationMatch
            ? fieldReference(
                cleanType,
                relationMatch[1].split(",")[0]?.trim() ?? "id",
              )
            : undefined,
        };
      });

    entities.push({ name: modelName, fields });
  }

  return entities.length > 0
    ? {
        entities,
        relationships: Array.from(new Set(relationships)),
        code: source,
        sourceType: "prisma",
        exportFormats: ["png", "svg", "pdf"],
      }
    : {
        ...phase3DiagramSample,
        sourceType: "prisma",
        exportFormats: ["png", "svg", "pdf"],
      };
}

function parseMongooseSchema(source: string): DiagramOutput {
  const entities: DiagramEntity[] = [];
  const relationships: string[] = [];
  const schemaRegex =
    /(?:const\s+)?([A-Za-z_]\w*)Schema\s*=\s*new\s+Schema\s*\(\s*\{([\s\S]*?)\}\s*\)/g;
  let match: RegExpExecArray | null;

  while ((match = schemaRegex.exec(source)) !== null) {
    const [, schemaName, body] = match;
    const entityName = schemaName.replace(/Schema$/, "");
    const fieldLines = body
      .split("\n")
      .map((line) => line.trim().replace(/,$/, ""))
      .filter(Boolean)
      .filter((line) => line.includes(":"));
    const fields = fieldLines.map((line) => {
      const [rawName = "field", rawValue = "String"] = line.split(/:\s*/);
      const fieldName = rawName.replace(/["']/g, "");
      const refMatch = line.match(/ref:\s*["']([^"']+)["']/);
      const typeMatch = rawValue.match(
        /\b(String|Number|Boolean|Date|ObjectId|Array)\b/,
      );
      const type = typeMatch?.[1] ?? rawValue.replace(/[{},]/g, "").trim();

      if (refMatch) {
        relationships.push(`${entityName}.${fieldName} -> ${refMatch[1]}._id`);
      }

      return {
        name: fieldName,
        type,
        isPrimaryKey: fieldName === "_id",
        isForeignKey: Boolean(refMatch),
        references: refMatch ? fieldReference(refMatch[1], "_id") : undefined,
      };
    });

    entities.push({ name: entityName, fields });
  }

  return entities.length > 0
    ? {
        entities,
        relationships: Array.from(new Set(relationships)),
        code: source,
        sourceType: "mongoose",
        exportFormats: ["png", "svg", "pdf"],
      }
    : {
        ...phase3DiagramSample,
        sourceType: "mongoose",
        exportFormats: ["png", "svg", "pdf"],
      };
}

function parseDatabaseSource(
  source: string,
  sourceType: SourceType,
): DiagramOutput {
  if (sourceType === "dbml") return parseDbml(source);
  if (sourceType === "prisma") return parsePrismaSchema(source);
  if (sourceType === "mongoose") return parseMongooseSchema(source);
  return parseSqlDdl(source);
}

function diagramToSvg(diagram: DiagramOutput) {
  const width = 920;
  const height = Math.max(360, 180 + diagram.entities.length * 150);
  const cards = diagram.entities
    .map((entity, index) => {
      const x = 40 + (index % 2) * 440;
      const y = 50 + Math.floor(index / 2) * 170;
      const fields = entity.fields
        .slice(0, 6)
        .map(
          (field, fieldIndex) =>
            `<text x="${x + 24}" y="${y + 70 + fieldIndex * 20}" fill="#475569" font-size="12">${field.name}: ${field.type}</text>`,
        )
        .join("");

      return `<rect x="${x}" y="${y}" width="360" height="140" rx="18" fill="#ffffff" stroke="#16a34a" stroke-opacity="0.35"/><rect x="${x}" y="${y}" width="360" height="42" rx="18" fill="#047857"/><text x="${x + 24}" y="${y + 28}" fill="#ffffff" font-size="18" font-weight="700">${entity.name}</text>${fields}`;
    })
    .join("");

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}"><rect width="100%" height="100%" fill="#f8fcfa"/><defs><pattern id="grid" width="28" height="28" patternUnits="userSpaceOnUse"><path d="M 28 0 L 0 0 0 28" fill="none" stroke="#dbe7e2" stroke-width="1"/></pattern></defs><rect width="100%" height="100%" fill="url(#grid)" opacity="0.65"/><text x="40" y="28" fill="#064e3b" font-size="16" font-weight="700">Nexora OS ERD Export</text>${cards}</svg>`;
}

async function saveDiagram(input: {
  user: AuthUser;
  title: string;
  source: string;
  sourceType: SourceType;
  diagram: DiagramOutput;
}) {
  return getPrisma().diagram.create({
    data: {
      title: input.title,
      source: input.source,
      format: input.sourceType,
      nodes: asInputJson(input.diagram.entities),
      edges: asInputJson(input.diagram.relationships),
      ownerId: input.user.id,
    },
    include: { exports: { orderBy: { createdAt: "desc" }, take: 6 } },
  });
}

function serializeDiagram(
  record: Prisma.DiagramGetPayload<{ include: { exports: true } }>,
) {
  return {
    id: record.id,
    title: record.title,
    source: record.source,
    sourceType: record.format,
    entities: Array.isArray(record.nodes) ? record.nodes : [],
    relationships: Array.isArray(record.edges) ? record.edges : [],
    exports: record.exports.map((item) => ({
      id: item.id,
      format: item.format,
      fileName: item.fileName,
      createdAt: item.createdAt.toISOString(),
    })),
    createdAt: record.createdAt.toISOString(),
    updatedAt: record.updatedAt.toISOString(),
  };
}

diagramsRouter.get("/", async (request, response) => {
  const user = currentUser(request as AuthenticatedRequest);

  if (!user) {
    response.status(401).json({ error: "Authentication required" });
    return;
  }

  const diagrams = await getPrisma().diagram.findMany({
    where: canReview(user) ? {} : { ownerId: user.id },
    orderBy: { updatedAt: "desc" },
    include: { exports: { orderBy: { createdAt: "desc" }, take: 6 } },
    take: 25,
  });

  response.json({ diagrams: diagrams.map(serializeDiagram) });
});

diagramsRouter.get("/:id", async (request, response) => {
  const user = currentUser(request as AuthenticatedRequest);

  if (!user) {
    response.status(401).json({ error: "Authentication required" });
    return;
  }

  const diagram = await getPrisma().diagram.findFirst({
    where: canReview(user)
      ? { id: String(request.params.id) }
      : { id: String(request.params.id), ownerId: user.id },
    include: { exports: { orderBy: { createdAt: "desc" }, take: 20 } },
  });

  if (!diagram) {
    response.status(404).json({ error: "Diagram not found" });
    return;
  }

  response.json({ diagram: serializeDiagram(diagram) });
});

diagramsRouter.post("/", async (request, response) => {
  const user = currentUser(request as AuthenticatedRequest);

  if (!user) {
    response.status(401).json({ error: "Authentication required" });
    return;
  }

  const source = String(request.body?.source ?? "");
  const sourceType = normalizeSourceType(
    request.body?.sourceType ?? request.body?.format,
  );
  const title = String(request.body?.title ?? "Nexora ERD");
  const requestDiagram = request.body?.diagram as DiagramOutput | undefined;
  const parsed = source ? parseDatabaseSource(source, sourceType) : null;
  const diagram: DiagramOutput =
    requestDiagram?.entities && Array.isArray(requestDiagram.entities)
      ? {
          ...requestDiagram,
          sourceType,
          code: source || requestDiagram.code || "",
          exportFormats: requestDiagram.exportFormats ?? ["png", "svg", "pdf"],
        }
      : (parsed ?? {
          ...phase3DiagramSample,
          sourceType,
          code: source || phase3DiagramSample.code,
          exportFormats: ["png", "svg", "pdf"],
        });
  const saved = await saveDiagram({
    user,
    title,
    source: source || diagram.code,
    sourceType,
    diagram,
  });

  response.status(201).json({ diagram: serializeDiagram(saved) });
});

diagramsRouter.post("/db-code-to-erd", async (request, response) => {
  const user = currentUser(request as AuthenticatedRequest);

  if (!user) {
    response.status(401).json({ error: "Authentication required" });
    return;
  }

  const source = String(request.body?.source ?? "");
  const sourceType = normalizeSourceType(request.body?.sourceType);
  const title = String(
    request.body?.title ?? request.body?.diagramName ?? "Nexora ERD",
  );
  const diagram = parseDatabaseSource(source, sourceType);
  const shouldPersist = request.body?.persist !== false;
  const saved = shouldPersist
    ? await saveDiagram({ user, title, source, sourceType, diagram })
    : null;

  response.status(shouldPersist ? 201 : 200).json({
    diagram: {
      id: saved?.id ?? "erd-preview",
      ...diagram,
      sourcePreview: source.slice(0, 240),
      savedAt: saved?.updatedAt.toISOString(),
    },
  });
});

diagramsRouter.post("/export", async (request, response) => {
  const user = currentUser(request as AuthenticatedRequest);

  if (!user) {
    response.status(401).json({ error: "Authentication required" });
    return;
  }

  const format = String(request.body?.format ?? "svg");
  const resolvedFormat =
    format === "pdf" || format === "png" || format === "svg" ? format : "svg";
  let diagramRecord = request.body?.diagramId
    ? await getPrisma().diagram.findFirst({
        where: canReview(user)
          ? { id: String(request.body.diagramId) }
          : { id: String(request.body.diagramId), ownerId: user.id },
        include: { exports: true },
      })
    : null;
  const requestDiagram = request.body?.diagram as DiagramOutput | undefined;
  const resolvedDiagram: DiagramOutput =
    diagramRecord?.nodes && Array.isArray(diagramRecord.nodes)
      ? {
          entities: diagramRecord.nodes as unknown as DiagramEntity[],
          relationships: Array.isArray(diagramRecord.edges)
            ? (diagramRecord.edges as string[])
            : [],
          code: diagramRecord.source,
          sourceType: normalizeSourceType(diagramRecord.format),
          exportFormats: ["png", "svg", "pdf"],
        }
      : requestDiagram?.entities
        ? requestDiagram
        : phase3DiagramSample;

  if (!diagramRecord) {
    diagramRecord = await saveDiagram({
      user,
      title: String(request.body?.title ?? "Nexora ERD Export"),
      source: resolvedDiagram.code,
      sourceType: normalizeSourceType(resolvedDiagram.sourceType),
      diagram: resolvedDiagram,
    });
  }

  const svg = diagramToSvg(resolvedDiagram);
  const content =
    resolvedFormat === "pdf"
      ? `PDF export adapter placeholder\n\n${svg}`
      : resolvedFormat === "png"
        ? `PNG export adapter placeholder\n\n${svg}`
        : svg;
  const savedExport = await getPrisma().diagramExport.create({
    data: {
      format: resolvedFormat,
      fileName: `nexora-erd.${resolvedFormat}`,
      content,
      diagramId: diagramRecord.id,
    },
  });

  response.status(201).json({
    export: {
      id: savedExport.id,
      diagramId: diagramRecord.id,
      format: savedExport.format,
      fileName: savedExport.fileName,
      content: savedExport.content,
      createdAt: savedExport.createdAt.toISOString(),
    },
  });
});
