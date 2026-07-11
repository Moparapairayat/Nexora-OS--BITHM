import { ModulePage } from "@/features/dashboard/module-page";

export default async function StudentModulePage({
  params,
}: {
  params: Promise<{ module: string[] }>;
}) {
  const { module } = await params;
  return <ModulePage role="student" slug={module} />;
}
