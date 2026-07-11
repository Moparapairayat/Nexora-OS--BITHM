import { ModulePage } from "@/features/dashboard/module-page";

export default async function TeacherModulePage({
  params,
}: {
  params: Promise<{ module: string[] }>;
}) {
  const { module } = await params;
  return <ModulePage role="teacher" slug={module} />;
}
