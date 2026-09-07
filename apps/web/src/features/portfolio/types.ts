// Nexora OS — Portfolio data shapes.
// Persisted on the existing Prisma `Portfolio` model: `projects` and
// `certificates` are untyped Json columns, `contact` is Json,
// `headline`/`bio` are plain scalar columns.

export type PortfolioTheme =
  | "obsidian"       // Linear / Vercel dark mode + neon emerald
  | "apple-glass"    // Frosted glass, soft blurred reflections & smooth rounded-3xl
  | "editorial"      // Swiss typography-first serif aesthetic
  | "cyber"          // Developer matrix monospace + tech status pills
  | "minimal-paper"; // Clean monochrome enterprise recruiter style

export type PortfolioLayout = "bento" | "classic" | "ryancv";

export type PortfolioProject = {
  id: string;
  title: string;
  role: string;
  period: string;
  summary: string;
  stack: string[];
  links: { label: string; url: string }[];
  featured?: boolean;
  bentoSize?: "1x1" | "2x1" | "2x2";
};

export type PortfolioEducationItem = {
  id: string;
  degree: string;
  institution: string;
  period: string;
  grade?: string;
};

export type PortfolioContact = {
  email: string;
  location: string;
  github: string;
  linkedin: string;
  website: string;
  availability: string;
};

export type PortfolioStatusPill = {
  text: string;
  available: boolean;
  dotColor?: string;
};

export type PortfolioVerifiedProof = {
  id: string;
  type: "code-lab" | "assignment" | "skill-dna";
  title: string;
  score: string;
  badgeLabel: string;
  verifiedAt: string;
};

export type PortfolioData = {
  name: string;
  headline: string;
  bio: string;
  theme?: PortfolioTheme;
  layout?: PortfolioLayout;
  statusPill?: PortfolioStatusPill;
  avatarUrl?: string | null;
  skills?: string[];
  featuredProjectId?: string | null;
  projects: PortfolioProject[];
  education: PortfolioEducationItem[];
  verifiedProofOfWork?: PortfolioVerifiedProof[];
  contact: PortfolioContact;
};

export type PortfolioRecord = PortfolioData & {
  slug: string | null;
  updatedAt: string | null;
};

export const emptyContact: PortfolioContact = {
  email: "",
  location: "",
  github: "",
  linkedin: "",
  website: "",
  availability: "",
};

export const defaultStatusPill: PortfolioStatusPill = {
  text: "Open to opportunities",
  available: true,
  dotColor: "#10b981",
};

export const defaultSampleSkills: string[] = [
  "TypeScript",
  "React 19",
  "Next.js",
  "Node.js",
  "PostgreSQL",
  "Tailwind CSS",
  "Docker",
  "System Architecture",
];

export const defaultSampleProof: PortfolioVerifiedProof[] = [
  {
    id: "proof-1",
    type: "code-lab",
    title: "Distributed Task Scheduler Lab",
    score: "100/100 Tests Passed",
    badgeLabel: "Verified by Nexora Code Lab",
    verifiedAt: "Aug 2026",
  },
  {
    id: "proof-2",
    type: "assignment",
    title: "Software Engineering & Architecture Report",
    score: "98% Originality • OTHM Distinction",
    badgeLabel: "Verified by Nexora Academic Shield",
    verifiedAt: "Aug 2026",
  },
];

export function emptyPortfolio(name: string, email: string): PortfolioRecord {
  return {
    name,
    headline: "",
    bio: "",
    theme: "obsidian",
    layout: "bento",
    statusPill: defaultStatusPill,
    avatarUrl: null,
    skills: defaultSampleSkills,
    featuredProjectId: null,
    projects: [],
    education: [],
    verifiedProofOfWork: defaultSampleProof,
    contact: { ...emptyContact, email },
    slug: null,
    updatedAt: null,
  };
}
