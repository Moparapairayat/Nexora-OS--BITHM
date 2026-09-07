/**
 * Nexora OS — Portfolio Builder API
 * GET  /api/portfolio  — fetch the signed-in user's own portfolio (or a fresh draft)
 * PUT  /api/portfolio  — save the signed-in user's portfolio
 */
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth/session";
import type {
  PortfolioContact,
  PortfolioEducationItem,
  PortfolioProject,
  PortfolioRecord,
  PortfolioStatusPill,
  PortfolioTheme,
  PortfolioLayout,
  PortfolioVerifiedProof,
} from "@/features/portfolio/types";
import {
  emptyContact,
  defaultSampleSkills,
  defaultSampleProof,
  defaultStatusPill,
} from "@/features/portfolio/types";

function slugify(name: string): string {
  const base = name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return base || "portfolio";
}

async function uniqueSlug(name: string, ownerUserId: string): Promise<string> {
  const base = slugify(name);
  let candidate = base;
  let attempt = 0;

  while (attempt < 25) {
    const existing = await prisma.portfolio.findUnique({
      where: { slug: candidate },
      select: { userId: true },
    });

    if (!existing || existing.userId === ownerUserId) {
      return candidate;
    }

    attempt += 1;
    candidate = `${base}-${Math.random().toString(36).slice(2, 6)}`;
  }

  return `${base}-${Date.now().toString(36)}`;
}

function asStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is string => typeof item === "string" && item.trim().length > 0);
}

function asProjects(value: unknown): PortfolioProject[] {
  if (!Array.isArray(value)) return [];

  return value
    .filter((item): item is Record<string, unknown> => typeof item === "object" && item !== null)
    .map((item, index) => ({
      id: typeof item.id === "string" ? item.id : `project-${index}`,
      title: typeof item.title === "string" ? item.title : "",
      role: typeof item.role === "string" ? item.role : "",
      period: typeof item.period === "string" ? item.period : "",
      summary: typeof item.summary === "string" ? item.summary : "",
      stack: asStringArray(item.stack),
      links: Array.isArray(item.links)
        ? item.links
            .filter((link): link is Record<string, unknown> => typeof link === "object" && link !== null)
            .map((link) => ({
              label: typeof link.label === "string" ? link.label : "",
              url: typeof link.url === "string" ? link.url : "",
            }))
            .filter((link) => link.label && link.url)
        : [],
      featured: Boolean(item.featured),
      bentoSize: (item.bentoSize === "1x1" || item.bentoSize === "2x1" || item.bentoSize === "2x2")
        ? (item.bentoSize as "1x1" | "2x1" | "2x2")
        : "2x1",
    }))
    .filter((project) => project.title.trim().length > 0);
}

function asEducation(value: unknown): PortfolioEducationItem[] {
  if (!Array.isArray(value)) return [];

  return value
    .filter((item): item is Record<string, unknown> => typeof item === "object" && item !== null)
    .map((item, index) => ({
      id: typeof item.id === "string" ? item.id : `education-${index}`,
      degree: typeof item.degree === "string" ? item.degree : "",
      institution: typeof item.institution === "string" ? item.institution : "",
      period: typeof item.period === "string" ? item.period : "",
      grade: typeof item.grade === "string" ? item.grade : undefined,
    }))
    .filter((item) => item.degree.trim().length > 0 || item.institution.trim().length > 0);
}

function asContact(value: unknown, fallbackEmail: string): PortfolioContact {
  const source = typeof value === "object" && value !== null ? (value as Record<string, unknown>) : {};

  return {
    email: typeof source.email === "string" && source.email.trim() ? source.email : fallbackEmail,
    location: typeof source.location === "string" ? source.location : "",
    github: typeof source.github === "string" ? source.github : "",
    linkedin: typeof source.linkedin === "string" ? source.linkedin : "",
    website: typeof source.website === "string" ? source.website : "",
    availability: typeof source.availability === "string" ? source.availability : "",
  };
}

export async function GET(req: NextRequest) {
  const sessionUser = await getSessionUser(req);

  if (!sessionUser) {
    return NextResponse.json({ success: false, message: "Authentication required." }, { status: 401 });
  }

  const record = await prisma.portfolio.findUnique({ where: { userId: sessionUser.id } });

  if (!record) {
    const draft: PortfolioRecord = {
      name: sessionUser.name,
      headline: "",
      bio: "",
      theme: "obsidian",
      layout: "bento",
      statusPill: defaultStatusPill,
      skills: defaultSampleSkills,
      featuredProjectId: null,
      projects: [],
      education: [],
      verifiedProofOfWork: defaultSampleProof,
      contact: { ...emptyContact, email: sessionUser.email },
      slug: null,
      updatedAt: null,
    };

    return NextResponse.json({ success: true, portfolio: draft, exists: false });
  }

  const rawContact = (record.contact ?? {}) as Record<string, unknown>;
  const rawCertificates = record.certificates as Record<string, unknown> | unknown[] | null;

  let educationList: PortfolioEducationItem[] = [];
  let proofList: PortfolioVerifiedProof[] = defaultSampleProof;

  if (Array.isArray(rawCertificates)) {
    educationList = asEducation(rawCertificates);
  } else if (rawCertificates && typeof rawCertificates === "object") {
    educationList = asEducation(rawCertificates.education);
    if (Array.isArray(rawCertificates.verifiedProofOfWork)) {
      proofList = rawCertificates.verifiedProofOfWork as PortfolioVerifiedProof[];
    }
  }

  const portfolio: PortfolioRecord = {
    name: sessionUser.name,
    headline: record.headline,
    bio: record.bio ?? "",
    theme: (rawContact.theme as PortfolioTheme) || "obsidian",
    layout: (rawContact.layout as PortfolioLayout) || "bento",
    statusPill: (rawContact.statusPill as PortfolioStatusPill) || defaultStatusPill,
    skills: Array.isArray(rawContact.skills) ? (rawContact.skills as string[]) : defaultSampleSkills,
    featuredProjectId: typeof rawContact.featuredProjectId === "string" ? rawContact.featuredProjectId : null,
    projects: asProjects(record.projects),
    education: educationList,
    verifiedProofOfWork: proofList,
    contact: asContact(record.contact, sessionUser.email),
    slug: record.slug,
    updatedAt: record.updatedAt.toISOString(),
  };

  return NextResponse.json({ success: true, portfolio, exists: true });
}

export async function PUT(req: NextRequest) {
  const sessionUser = await getSessionUser(req);

  if (!sessionUser) {
    return NextResponse.json({ success: false, message: "Authentication required." }, { status: 401 });
  }

  let body: Record<string, unknown>;

  try {
    body = (await req.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ success: false, message: "Invalid request body." }, { status: 400 });
  }

  const headline = typeof body.headline === "string" ? body.headline.slice(0, 200) : "";
  const bio = typeof body.bio === "string" ? body.bio.slice(0, 2000) : "";
  const theme = (body.theme as PortfolioTheme) || "obsidian";
  const layout = (body.layout as PortfolioLayout) || "bento";
  const statusPill = (body.statusPill as PortfolioStatusPill) || defaultStatusPill;
  const skills = Array.isArray(body.skills) ? body.skills : defaultSampleSkills;
  const featuredProjectId = typeof body.featuredProjectId === "string" ? body.featuredProjectId : null;
  const projects = asProjects(body.projects);
  const education = asEducation(body.education);
  const verifiedProofOfWork = Array.isArray(body.verifiedProofOfWork)
    ? body.verifiedProofOfWork
    : defaultSampleProof;

  // Stored cleanly inside Prisma Json columns without requiring database migration
  const contactWithMeta = {
    ...asContact(body.contact, sessionUser.email),
    theme,
    layout,
    statusPill,
    skills,
    featuredProjectId,
  };

  const certificatesPayload = {
    education,
    verifiedProofOfWork,
  };

  const existing = await prisma.portfolio.findUnique({
    where: { userId: sessionUser.id },
    select: { slug: true },
  });

  const slug = existing?.slug ?? (await uniqueSlug(sessionUser.name, sessionUser.id));

  const saved = await prisma.portfolio.upsert({
    where: { userId: sessionUser.id },
    update: {
      headline,
      bio,
      projects,
      certificates: certificatesPayload,
      contact: contactWithMeta,
    },
    create: {
      userId: sessionUser.id,
      slug,
      headline,
      bio,
      projects,
      certificates: certificatesPayload,
      contact: contactWithMeta,
    },
  });

  const portfolio: PortfolioRecord = {
    name: sessionUser.name,
    headline: saved.headline,
    bio: saved.bio ?? "",
    theme,
    layout,
    statusPill,
    skills,
    featuredProjectId,
    projects: asProjects(saved.projects),
    education,
    verifiedProofOfWork,
    contact: asContact(saved.contact, sessionUser.email),
    slug: saved.slug,
    updatedAt: saved.updatedAt.toISOString(),
  };

  return NextResponse.json({ success: true, portfolio });
}
