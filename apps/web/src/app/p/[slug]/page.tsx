import { notFound } from "next/navigation";

import { prisma } from "@/lib/prisma";
import { cn } from "@/lib/utils";
import { PortfolioView } from "@/features/portfolio/portfolio-view";
import { PORTFOLIO_THEMES } from "@/features/portfolio/themes";
import { PublicPortfolioBar } from "@/features/portfolio/public-portfolio-bar";
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

function asContact(value: unknown): PortfolioContact {
  if (typeof value !== "object" || value === null) return emptyContact;
  return { ...emptyContact, ...(value as Partial<PortfolioContact>) };
}

export default async function PublicPortfolioPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const record = await prisma.portfolio.findUnique({
    where: { slug },
    include: { user: { select: { name: true } } },
  });

  if (!record) {
    notFound();
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
    name: record.user.name,
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
    contact: asContact(record.contact),
    slug: record.slug,
    updatedAt: record.updatedAt.toISOString(),
  };

  const activeTheme = PORTFOLIO_THEMES[portfolio.theme || "obsidian"] || PORTFOLIO_THEMES.obsidian;

  return (
    <main className={cn("min-h-dvh px-4 py-8 sm:px-6 sm:py-16 transition-colors duration-500", activeTheme.canvasBg)}>
      <PortfolioView portfolio={portfolio} />
      <PublicPortfolioBar portfolio={portfolio} />
    </main>
  );
}
