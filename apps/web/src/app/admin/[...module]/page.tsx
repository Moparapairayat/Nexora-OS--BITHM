import { ModulePage } from "@/features/dashboard/module-page";

export default async function AdminModulePage({
  params,
}: {
  params: Promise<{ module: string[] }>;
}) {
  const { module } = await params;
  return <ModulePage role="admin" slug={module} />;
}
