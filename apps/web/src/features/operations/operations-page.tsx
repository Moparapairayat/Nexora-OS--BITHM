"use client";

import {
  Activity,
  ArchiveRestore,
  CheckCircle2,
  CloudUpload,
  HardDrive,
  KeyRound,
  LockKeyhole,
  ServerCog,
  ShieldCheck,
} from "lucide-react";

import { AppShell } from "@/components/layout/app-shell";
import {
  BentoCard,
  CommandLinkRow,
  DashboardCard,
  DataTable,
  MetricRail,
  PageHeader,
} from "@/components/ui/command-primitives";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { phase5ProductionStatus } from "@nexora/config";
import type {
  BackgroundJobStatus,
  DeploymentChecklistItem,
  ProductionServiceState,
} from "@nexora/types";
import type { AppRole, Tone } from "@/lib/mock-data";
import { roleDashboards } from "@/lib/mock-data";

export function OperationsPage({ role }: { role: AppRole }) {
  const data = roleDashboards.admin;
  const healthyServices = phase5ProductionStatus.services.filter(
    (service) => service.state === "healthy",
  ).length;
  const manualChecklistItems =
    phase5ProductionStatus.deploymentChecklist.filter(
      (item) => item.status !== "complete",
    ).length;
  const activeJobs = phase5ProductionStatus.backgroundJobs.filter((job) =>
    ["queued", "running"].includes(job.status),
  ).length;

  return (
    <AppShell
      role={role}
      title="Production Ops"
      subtitle="Check roles, sessions, uploads, background jobs, audit events and deployment readiness."
      nav={data.nav}
      navGroups={data.navGroups}
      accountEmail={data.accountEmail}
    >
      <div className="grid gap-5">
        <PageHeader
          eyebrow="System Readiness"
          title="Keep Nexora OS ready for deployment"
          subtitle="Monitor protected services, security events, storage, background jobs and deployment checks from one admin page."
          tone="emerald"
          action={
            <Button type="button" variant="secondary">
              <ServerCog className="h-4 w-4" aria-hidden="true" />
              Check readiness
            </Button>
          }
        />

        <MetricRail
          items={[
            {
              label: "Healthy services",
              value: `${healthyServices}/${phase5ProductionStatus.services.length}`,
              tone: "emerald",
              icon: CheckCircle2,
            },
            {
              label: "Manual checks",
              value: String(manualChecklistItems),
              tone: manualChecklistItems ? "amber" : "emerald",
              icon: ShieldCheck,
            },
            {
              label: "Active jobs",
              value: String(activeJobs),
              tone: "cyan",
              icon: ArchiveRestore,
            },
            {
              label: "Upload records",
              value: String(phase5ProductionStatus.uploads.length),
              tone: "violet",
              icon: CloudUpload,
            },
          ]}
        />

        <div className="grid gap-5 xl:grid-cols-[minmax(0,1.15fr)_minmax(360px,0.85fr)]">
          <div className="grid gap-5">
            <ServiceStatusGrid />
            <SecurityAndAuditPanel />
            <BackgroundJobsPanel />
          </div>

          <div className="grid gap-5">
            <RbacPanel />
            <UploadPanel />
            <DeploymentChecklistPanel />
          </div>
        </div>
      </div>
    </AppShell>
  );
}

function ServiceStatusGrid() {
  return (
    <div className="grid gap-5 lg:grid-cols-2">
      {phase5ProductionStatus.services.map((service) => (
        <DashboardCard
          key={service.id}
          title={service.name}
          detail={service.detail}
          icon={service.id === "storage" ? HardDrive : ServerCog}
          tone={toneForService(service.state)}
        >
          <div className="flex flex-wrap items-center justify-between gap-3">
            <Badge tone={toneForService(service.state)}>
              {service.state.toUpperCase()}
            </Badge>
            <span className="font-mono text-sm text-slate-400 light:text-slate-600">
              {service.uptime}
            </span>
          </div>
          <p className="mt-4 rounded-xl border border-[var(--line)] bg-white/[0.035] px-3 py-2 text-sm text-slate-400 light:bg-white/70 light:text-slate-600">
            Region: {service.region}
          </p>
        </DashboardCard>
      ))}
    </div>
  );
}

function SecurityAndAuditPanel() {
  return (
    <BentoCard
      title="Security Audit Trail"
      detail="Sign-ins and protected actions are logged for admin review."
      icon={LockKeyhole}
      tone="amber"
    >
      <DataTable
        columns={["Actor", "Action", "Target", "Severity"]}
        rows={phase5ProductionStatus.auditEvents.map((event) => ({
          Actor: event.actor,
          Action: event.action,
          Target: event.target,
          Severity: event.severity,
        }))}
      />
    </BentoCard>
  );
}

function BackgroundJobsPanel() {
  return (
    <BentoCard
      title="Background Jobs"
      detail="Track report exports, notifications and backups."
      icon={Activity}
      tone="cyan"
    >
      <div className="grid gap-3">
        {phase5ProductionStatus.backgroundJobs.map((job) => (
          <CommandLinkRow
            key={job.id}
            title={job.name}
            detail={`${job.queue} queue | ${job.status} | attempts ${job.attempts}`}
            icon={ArchiveRestore}
            tone={toneForJob(job.status)}
          />
        ))}
      </div>
    </BentoCard>
  );
}

function RbacPanel() {
  return (
    <DashboardCard
      title="Role and Session Rules"
      detail="Each role has clear permissions and session time limits."
      icon={KeyRound}
      tone="emerald"
    >
      <div className="grid gap-4">
        {phase5ProductionStatus.permissionPolicies.map((policy) => (
          <div
            key={policy.role}
            className="rounded-xl border border-[var(--line)] bg-white/[0.035] p-4 light:bg-white/70"
          >
            <div className="flex items-center justify-between gap-3">
              <Badge tone={policy.role === "ADMIN" ? "violet" : "emerald"}>
                {policy.role}
              </Badge>
              <span className="font-mono text-xs text-slate-500">
                {policy.sessionTtlHours}h TTL
              </span>
            </div>
            <p className="mt-3 text-sm leading-6 text-slate-400 light:text-slate-600">
              {policy.protectedAreas.join(", ")}
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {policy.permissions.slice(0, 4).map((permission) => (
                <Badge key={permission} tone="slate">
                  {readablePermission(permission)}
                </Badge>
              ))}
            </div>
          </div>
        ))}
      </div>
    </DashboardCard>
  );
}

function UploadPanel() {
  return (
    <DashboardCard
      title="Upload Storage"
      detail="Uploads are tracked separately so local storage can later move to S3 or MinIO."
      icon={CloudUpload}
      tone="violet"
    >
      <DataTable
        columns={["File", "Purpose", "Status"]}
        rows={phase5ProductionStatus.uploads.map((upload) => ({
          File: upload.fileName,
          Purpose: upload.purpose,
          Status: upload.status,
        }))}
      />
    </DashboardCard>
  );
}

function DeploymentChecklistPanel() {
  return (
    <DashboardCard
      title="Deployment Checklist"
      detail="The main manual step is adding the right secrets for the deployment environment."
      icon={ShieldCheck}
      tone="amber"
    >
      <div className="grid gap-3">
        {phase5ProductionStatus.deploymentChecklist.map((item) => (
          <ChecklistItem key={item.id} item={item} />
        ))}
      </div>
    </DashboardCard>
  );
}

function ChecklistItem({ item }: { item: DeploymentChecklistItem }) {
  return (
    <div className="rounded-xl border border-[var(--line)] bg-white/[0.035] p-3 light:bg-white/70">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-semibold text-[var(--foreground)] light:text-slate-950">
          {item.label}
        </p>
        <Badge tone={toneForChecklist(item.status)}>{item.status}</Badge>
      </div>
      <p className="mt-2 text-xs leading-5 text-slate-500">{item.detail}</p>
    </div>
  );
}

function toneForService(state: ProductionServiceState): Tone {
  if (state === "healthy") {
    return "emerald";
  }

  if (state === "degraded") {
    return "amber";
  }

  return "rose";
}

function toneForJob(status: BackgroundJobStatus): Tone {
  if (status === "completed") {
    return "emerald";
  }

  if (status === "failed") {
    return "rose";
  }

  return status === "running" ? "cyan" : "amber";
}

function toneForChecklist(status: DeploymentChecklistItem["status"]): Tone {
  if (status === "complete") {
    return "emerald";
  }

  return status === "manual" ? "amber" : "rose";
}

function readablePermission(permission: string) {
  return permission
    .replace(/^[^:]+:/, "")
    .replace(/-/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}
