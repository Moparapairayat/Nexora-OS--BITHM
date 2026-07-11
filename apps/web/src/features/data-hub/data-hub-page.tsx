"use client";

import {
  ArchiveRestore,
  CheckCircle2,
  Database,
  Download,
  HardDrive,
  Layers3,
  RefreshCw,
  ShieldCheck,
  TableProperties,
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
import { phase6DataLayerStatus } from "@nexora/config";
import type {
  DataHealthState,
  DataMigrationTask,
  DataQualityStatus,
  DataRepositoryBoundary,
} from "@nexora/types";
import type { AppRole, Tone } from "@/lib/mock-data";
import { roleDashboards } from "@/lib/mock-data";

export function DataHubPage({ role }: { role: AppRole }) {
  const data = roleDashboards.admin;
  const totalRecords = phase6DataLayerStatus.snapshot.metrics.reduce(
    (total, metric) => total + metric.value,
    0,
  );
  const warningChecks = phase6DataLayerStatus.qualityChecks.filter(
    (check) => check.status !== "passed",
  ).length;
  const manualTasks = phase6DataLayerStatus.migrationTasks.filter(
    (task) => task.status !== "complete",
  ).length;

  return (
    <AppShell
      role={role}
      title="Data Hub"
      subtitle="Review institution data, resolve quality issues, and prepare exports or migrations."
      nav={data.nav}
      navGroups={data.navGroups}
      accountEmail={data.accountEmail}
    >
      <div className="grid gap-5">
        <PageHeader
          eyebrow="Institution Data"
          title="Review and prepare institution data"
          subtitle="Check record counts, data quality, integrations, and remaining Postgres migration work."
          tone="cyan"
          action={
            <Button type="button" variant="secondary">
              <Download className="h-4 w-4" aria-hidden="true" />
              Export snapshot
            </Button>
          }
        />

        <MetricRail
          items={[
            {
              label: "Source mode",
              value: phase6DataLayerStatus.sourceMode,
              tone: "cyan",
              icon: Database,
            },
            {
              label: "Tracked records",
              value: String(totalRecords),
              tone: "emerald",
              icon: TableProperties,
            },
            {
              label: "Quality warnings",
              value: String(warningChecks),
              tone: warningChecks ? "amber" : "emerald",
              icon: ShieldCheck,
            },
            {
              label: "Manual migrations",
              value: String(manualTasks),
              tone: manualTasks ? "amber" : "emerald",
              icon: ArchiveRestore,
            },
          ]}
        />

        <div className="grid gap-5 xl:grid-cols-[minmax(0,1.15fr)_minmax(360px,0.85fr)]">
          <div className="grid gap-5">
            <SnapshotPanel />
            <RepositoryBoundaryPanel />
            <MigrationPanel />
          </div>

          <div className="grid gap-5">
            <ConnectorPanel />
            <QualityPanel />
            <ExportPanel />
          </div>
        </div>
      </div>
    </AppShell>
  );
}

function SnapshotPanel() {
  return (
    <BentoCard
      title="Institution Snapshot"
      detail="A clear summary of the data currently available in Nexora OS."
      icon={TableProperties}
      tone="emerald"
    >
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {phase6DataLayerStatus.snapshot.metrics.map((metric) => (
          <div
            key={metric.id}
            className="rounded-xl border border-[var(--line)] bg-white/[0.035] p-4 light:bg-white/70"
          >
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
              {metric.label}
            </p>
            <p className="mt-3 font-mono text-3xl font-semibold text-[var(--brand-lime)]">
              {metric.value}
            </p>
            <p className="mt-2 text-xs leading-5 text-slate-500">
              {metric.detail}
            </p>
          </div>
        ))}
      </div>
    </BentoCard>
  );
}

function ConnectorPanel() {
  return (
    <DashboardCard
      title="Data Sources"
      detail="See where the current data comes from and which sources still need Postgres."
      icon={HardDrive}
      tone="cyan"
    >
      <div className="grid gap-3">
        {phase6DataLayerStatus.connectors.map((connector) => (
          <div
            key={connector.id}
            className="rounded-xl border border-[var(--line)] bg-white/[0.035] p-3 light:bg-white/70"
          >
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-semibold text-[var(--foreground)] light:text-slate-950">
                {connector.name}
              </p>
              <Badge tone={toneForHealth(connector.state)}>
                {readableState(connector.state)}
              </Badge>
            </div>
            <p className="mt-2 text-xs leading-5 text-slate-500">
              {connector.detail}
            </p>
          </div>
        ))}
      </div>
    </DashboardCard>
  );
}

function QualityPanel() {
  return (
    <DashboardCard
      title="Data Quality Checks"
      detail="Checks to run before switching to database mode."
      icon={ShieldCheck}
      tone="amber"
    >
      <div className="grid gap-3">
        {phase6DataLayerStatus.qualityChecks.map((check) => (
          <CommandLinkRow
            key={check.id}
            title={check.label}
            detail={`${check.scope} | ${check.detail}`}
            icon={RefreshCw}
            tone={toneForQuality(check.status)}
          />
        ))}
      </div>
    </DashboardCard>
  );
}

function RepositoryBoundaryPanel() {
  return (
    <BentoCard
      title="API Connections"
      detail="API read and write points that can move from memory to Prisma later."
      icon={Layers3}
      tone="violet"
    >
      <DataTable
        columns={["Workflow", "Read Model", "Status"]}
        rows={phase6DataLayerStatus.repositoryBoundaries.map((boundary) => ({
          Workflow: boundary.workflow,
          "Read Model": boundary.readModel,
          Status: <BoundaryStatus boundary={boundary} />,
        }))}
      />
    </BentoCard>
  );
}

function MigrationPanel() {
  return (
    <BentoCard
      title="Migration Tasks"
      detail="Manual steps for moving from memory mode to database mode."
      icon={ArchiveRestore}
      tone="amber"
    >
      <div className="grid gap-3">
        {phase6DataLayerStatus.migrationTasks.map((task) => (
          <MigrationTaskRow key={task.id} task={task} />
        ))}
      </div>
    </BentoCard>
  );
}

function MigrationTaskRow({ task }: { task: DataMigrationTask }) {
  return (
    <div className="rounded-xl border border-[var(--line)] bg-white/[0.035] p-4 light:bg-white/70">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-[var(--foreground)] light:text-slate-950">
            {task.label}
          </p>
          <p className="mt-2 text-xs leading-5 text-slate-500">{task.detail}</p>
        </div>
        <Badge tone={toneForTask(task.status)}>{task.status}</Badge>
      </div>
      {task.command ? (
        <p className="mt-3 rounded-lg border border-[var(--line)] bg-[#050706]/70 px-3 py-2 font-mono text-xs text-[var(--brand-lime)] light:bg-slate-950 light:text-lime-200">
          {task.command}
        </p>
      ) : null}
    </div>
  );
}

function ExportPanel() {
  return (
    <DashboardCard
      title="Export Packets"
      detail="Exports admins can use to review and compare data before migration."
      icon={Download}
      tone="emerald"
    >
      <div className="grid gap-3">
        {phase6DataLayerStatus.exportPackets.map((packet) => (
          <div
            key={packet.id}
            className="rounded-xl border border-[var(--line)] bg-white/[0.035] p-3 light:bg-white/70"
          >
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-semibold text-[var(--foreground)] light:text-slate-950">
                {packet.name}
              </p>
              <Badge tone="emerald">{packet.format}</Badge>
            </div>
            <p className="mt-2 text-xs leading-5 text-slate-500">
              {packet.includes.join(", ")}
            </p>
          </div>
        ))}
      </div>
    </DashboardCard>
  );
}

function BoundaryStatus({ boundary }: { boundary: DataRepositoryBoundary }) {
  return (
    <span className="inline-flex items-center gap-2">
      <CheckCircle2
        className="h-4 w-4 text-[var(--brand-emerald)]"
        aria-hidden="true"
      />
      {readableBoundaryStatus(boundary.status)}
    </span>
  );
}

function toneForHealth(state: DataHealthState): Tone {
  if (state === "ready") {
    return "emerald";
  }

  if (state === "needs-attention") {
    return "amber";
  }

  return "rose";
}

function readableState(state: DataHealthState) {
  if (state === "needs-attention") {
    return "needs attention";
  }

  return state;
}

function readableBoundaryStatus(status: DataRepositoryBoundary["status"]) {
  if (status === "adapter-ready") {
    return "ready to connect";
  }

  return status;
}

function toneForQuality(status: DataQualityStatus): Tone {
  if (status === "passed") {
    return "emerald";
  }

  return status === "warning" ? "amber" : "rose";
}

function toneForTask(status: DataMigrationTask["status"]): Tone {
  if (status === "complete") {
    return "emerald";
  }

  return status === "manual" ? "amber" : "rose";
}
