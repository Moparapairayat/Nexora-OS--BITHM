"use client";

import {
  KeyRound,
  Pencil,
  Plus,
  RefreshCw,
  Search,
  Trash2,
  UserCheck,
  UserCog,
  UsersRound,
} from "lucide-react";
import type { ComponentType, Dispatch, ReactNode, SetStateAction } from "react";
import { useCallback, useEffect, useMemo, useState } from "react";

import { AppShell } from "@/components/layout/app-shell";
import { DashboardCard, PageHeader } from "@/components/ui/command-primitives";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { PenguinLoadingSpinner } from "@/components/ui/loading-spinner";
import { apiDelete, apiGet, apiPatch, apiPost } from "@/lib/workflow-api";
import { roleDashboards, type AppRole, type Tone } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

type AdminUserRole = "STUDENT" | "TEACHER" | "ADMIN";
type AdminUserStatus = "ACTIVE" | "INACTIVE" | "DELETED";

type OptionRecord = {
  id: string;
  name?: string;
  title?: string;
  code?: string | null;
  departmentId?: string | null;
  courseId?: string | null;
};

type AdminUser = {
  id: string;
  name: string;
  email: string;
  role: AdminUserRole | "SUPER_ADMIN";
  status: AdminUserStatus;
  departmentId: string | null;
  courseId: string | null;
  unitId: string | null;
  batchId: string | null;
  department?: { id: string; name: string; code?: string | null } | null;
  course?: { id: string; title: string; code?: string | null } | null;
  unit?: { id: string; title: string; code?: string | null } | null;
  batch?: { id: string; name: string } | null;
  createdAt: string;
  updatedAt: string;
};

type UserFormState = {
  name: string;
  email: string;
  role: AdminUserRole;
  status: "ACTIVE" | "INACTIVE";
  departmentId: string;
  courseId: string;
  unitId: string;
  batchId: string;
  password: string;
};

const emptyForm: UserFormState = {
  name: "",
  email: "",
  role: "STUDENT",
  status: "ACTIVE",
  departmentId: "",
  courseId: "",
  unitId: "",
  batchId: "",
  password: "",
};

const roleTone: Record<AdminUser["role"], Tone> = {
  STUDENT: "cyan",
  TEACHER: "amber",
  ADMIN: "violet",
  SUPER_ADMIN: "rose",
};

const statusTone: Record<AdminUserStatus, Tone> = {
  ACTIVE: "emerald",
  INACTIVE: "slate",
  DELETED: "rose",
};

const compactInputClass =
  "nexora-focus h-10 w-full rounded-xl border border-[var(--line)] bg-white/[0.04] px-3 text-sm text-[var(--foreground)] outline-none transition placeholder:text-[var(--text-muted)] focus:border-[color:var(--border-emerald)] light:border-slate-200 light:bg-white light:text-slate-950 light:shadow-[0_8px_20px_rgba(33,45,74,0.05)]";

export function AdminUsersPage({ role }: { role: AppRole }) {
  const data = roleDashboards[role];
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [departments, setDepartments] = useState<OptionRecord[]>([]);
  const [courses, setCourses] = useState<OptionRecord[]>([]);
  const [units, setUnits] = useState<OptionRecord[]>([]);
  const [batches, setBatches] = useState<OptionRecord[]>([]);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [form, setForm] = useState<UserFormState>(emptyForm);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");

  const usersPath = useMemo(() => {
    const params = new URLSearchParams();

    if (search.trim()) {
      params.set("search", search.trim());
    }

    if (roleFilter) {
      params.set("role", roleFilter);
    }

    if (statusFilter) {
      params.set("status", statusFilter);
    }

    const suffix = params.toString() ? `?${params.toString()}` : "";

    return `/admin/users${suffix}`;
  }, [roleFilter, search, statusFilter]);

  const loadUsers = useCallback(async () => {
    setLoading(true);
    const response = await apiGet<{ users: AdminUser[] }>(usersPath);

    setUsers(response?.users ?? []);
    setLoading(false);
  }, [usersPath]);

  useEffect(() => {
    let active = true;

    void Promise.all([
      apiGet<{ departments: OptionRecord[] }>("/admin/departments"),
      apiGet<{ courses: OptionRecord[] }>("/admin/courses"),
      apiGet<{ units: OptionRecord[] }>("/admin/units"),
      apiGet<{ batches: OptionRecord[] }>("/admin/batches"),
    ]).then(([departmentData, courseData, unitData, batchData]) => {
      if (!active) {
        return;
      }

      setDepartments(departmentData?.departments ?? []);
      setCourses(courseData?.courses ?? []);
      setUnits(unitData?.units ?? []);
      setBatches(batchData?.batches ?? []);
    });

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    let active = true;
    const timer = window.setTimeout(() => {
      setLoading(true);
      void apiGet<{ users: AdminUser[] }>(usersPath).then((response) => {
        if (!active) {
          return;
        }

        setUsers(response?.users ?? []);
        setLoading(false);
      });
    }, 180);

    return () => {
      active = false;
      window.clearTimeout(timer);
    };
  }, [usersPath]);

  const stats = useMemo(() => {
    const active = users.filter((user) => user.status === "ACTIVE").length;
    const inactive = users.filter((user) => user.status === "INACTIVE").length;
    const admins = users.filter(
      (user) => user.role === "ADMIN" || user.role === "SUPER_ADMIN",
    ).length;

    return { active, inactive, admins, total: users.length };
  }, [users]);

  function resetForm(roleValue: AdminUserRole = "STUDENT") {
    setEditingUserId(null);
    setForm({ ...emptyForm, role: roleValue });
    setError("");
    setNotice("");
  }

  function editUser(user: AdminUser) {
    setEditingUserId(user.id);
    setForm({
      name: user.name,
      email: user.email,
      role:
        user.role === "SUPER_ADMIN" ? "ADMIN" : (user.role as AdminUserRole),
      status: user.status === "DELETED" ? "INACTIVE" : user.status,
      departmentId: user.departmentId ?? "",
      courseId: user.courseId ?? "",
      unitId: user.unitId ?? "",
      batchId: user.batchId ?? "",
      password: "",
    });
    setNotice("");
    setError("");
  }

  async function saveUser() {
    setSaving(true);
    setError("");
    setNotice("");

    const payload = {
      name: form.name,
      email: form.email,
      role: form.role,
      status: form.status,
      departmentId: form.departmentId || null,
      courseId: form.courseId || null,
      unitId: form.unitId || null,
      batchId: form.batchId || null,
      password: form.password || undefined,
    };

    const response = editingUserId
      ? await apiPatch<{ user: AdminUser }>(`/admin/users/${editingUserId}`, {
          name: payload.name,
          email: payload.email,
          departmentId: payload.departmentId,
          courseId: payload.courseId,
          unitId: payload.unitId,
          batchId: payload.batchId,
        })
      : await apiPost<{
          user: AdminUser;
          temporaryPassword?: string;
          temporaryPasswordGenerated?: boolean;
        }>("/admin/users", payload);

    if (!response?.user) {
      setError(
        "User save failed. Check admin access, duplicate email or selected course/unit.",
      );
      setSaving(false);
      return;
    }

    const successMessage =
      !editingUserId &&
      "temporaryPassword" in response &&
      response.temporaryPassword
        ? `Temporary password for ${response.user.email}: ${response.temporaryPassword}`
        : editingUserId
          ? "User details updated."
          : "User created.";

    resetForm();
    setNotice(successMessage);
    await loadUsers();
    setSaving(false);
  }

  async function updateRole(user: AdminUser, nextRole: AdminUserRole) {
    setError("");
    const response = await apiPatch<{ user: AdminUser }>(
      `/admin/users/${user.id}/role`,
      { role: nextRole },
    );

    if (!response?.user) {
      setError(
        "Role update failed. The system prevents removing the last admin.",
      );
      return;
    }

    setUsers((current) =>
      current.map((item) =>
        item.id === response.user.id ? response.user : item,
      ),
    );
  }

  async function updateStatus(
    user: AdminUser,
    nextStatus: "ACTIVE" | "INACTIVE",
  ) {
    setError("");
    const response = await apiPatch<{ user: AdminUser }>(
      `/admin/users/${user.id}/status`,
      { status: nextStatus },
    );

    if (!response?.user) {
      setError(
        "Status update failed. You cannot deactivate the last active admin.",
      );
      return;
    }

    setUsers((current) =>
      current.map((item) =>
        item.id === response.user.id ? response.user : item,
      ),
    );
  }

  async function resetPassword(user: AdminUser) {
    setError("");
    const response = await apiPost<{
      user: AdminUser;
      temporaryPassword?: string;
    }>(`/admin/users/${user.id}/reset-password`, {});

    if (!response?.user || !response.temporaryPassword) {
      setError("Password reset failed.");
      return;
    }

    setNotice(
      `New temporary password for ${response.user.email}: ${response.temporaryPassword}`,
    );
  }

  async function deleteUser(user: AdminUser) {
    const confirmed = window.confirm(
      `Deactivate and soft delete ${user.name}? This keeps historical records intact.`,
    );

    if (!confirmed) {
      return;
    }

    setError("");
    const ok = await apiDelete(`/admin/users/${user.id}`);

    if (!ok) {
      setError(
        "Delete failed. You cannot delete yourself or the last active admin.",
      );
      return;
    }

    setNotice(`${user.name} was soft deleted.`);
    await loadUsers();
  }

  return (
    <AppShell
      role={role}
      title="Users"
      subtitle="Manage student, teacher, and administrator accounts."
      nav={data.nav}
      navGroups={data.navGroups}
      accountEmail={data.accountEmail}
    >
      <div className="grid gap-5">
        <PageHeader
          eyebrow="Admin User Management"
          title="Manage user accounts"
          subtitle="Create accounts, assign roles, reset passwords, and control access."
          tone="violet"
          action={
            <div className="flex flex-wrap gap-2">
              <Button type="button" onClick={() => resetForm("STUDENT")}>
                <Plus className="h-4 w-4" aria-hidden="true" />
                Add Student
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={() => resetForm("TEACHER")}
              >
                Add Teacher
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={() => resetForm("ADMIN")}
              >
                Add Admin
              </Button>
            </div>
          }
        />

        <div className="grid gap-4 md:grid-cols-4">
          <DashboardCard title="Total users" icon={UsersRound} tone="violet">
            <p className="font-mono text-3xl font-semibold text-[var(--brand-lime)] light:text-emerald-700">
              {stats.total}
            </p>
          </DashboardCard>
          <DashboardCard title="Active" icon={UserCheck} tone="emerald">
            <p className="font-mono text-3xl font-semibold text-[var(--brand-emerald)] light:text-emerald-700">
              {stats.active}
            </p>
          </DashboardCard>
          <DashboardCard title="Inactive" icon={RefreshCw} tone="slate">
            <p className="font-mono text-3xl font-semibold text-slate-300 light:text-slate-700">
              {stats.inactive}
            </p>
          </DashboardCard>
          <DashboardCard title="Admins" icon={UserCog} tone="amber">
            <p className="font-mono text-3xl font-semibold text-[#ffd29b] light:text-amber-700">
              {stats.admins}
            </p>
          </DashboardCard>
        </div>

        {(notice || error) && (
          <div
            className={cn(
              "rounded-2xl border px-4 py-3 text-sm font-medium",
              notice &&
                "border-[color:var(--border-emerald)] bg-[rgba(50,245,154,0.08)] text-[var(--brand-emerald)] light:border-emerald-100 light:bg-emerald-50 light:text-emerald-800",
              error &&
                "border-rose-300/25 bg-rose-400/10 text-rose-200 light:border-rose-200 light:bg-rose-50 light:text-rose-700",
            )}
          >
            {error || notice}
          </div>
        )}

            <div className="grid gap-5 lg:grid-cols-[minmax(280px,420px)_minmax(0,1fr)]">
          <UserFormPanel
            form={form}
            setForm={setForm}
            departments={departments}
            courses={courses}
            units={units}
            batches={batches}
            editingUserId={editingUserId}
            saving={saving}
            onSave={saveUser}
            onCancel={() => resetForm()}
          />

          <Card className="min-w-0">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h2 className="text-lg font-semibold text-[var(--foreground)] light:text-slate-950">
                  User list
                </h2>
                <p className="mt-1 text-sm text-[var(--muted)] light:text-slate-600">
                  Search, filter and manage database-backed user records.
                </p>
              </div>
              <Button
                type="button"
                variant="secondary"
                onClick={() => void loadUsers()}
              >
                <RefreshCw className="h-4 w-4" aria-hidden="true" />
                Refresh
              </Button>
            </div>

            <div className="mt-4 grid gap-3 lg:grid-cols-[minmax(220px,1fr)_160px_160px]">
              <label className="relative">
                <Search
                  className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500"
                  aria-hidden="true"
                />
                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  className={cn(compactInputClass, "pl-9")}
                  placeholder="Search users"
                />
              </label>
              <select
                value={roleFilter}
                onChange={(event) => setRoleFilter(event.target.value)}
                className={compactInputClass}
              >
                <option value="">All roles</option>
                <option value="STUDENT">Students</option>
                <option value="TEACHER">Teachers</option>
                <option value="ADMIN">Admins</option>
              </select>
              <select
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value)}
                className={compactInputClass}
              >
                <option value="">Active + inactive</option>
                <option value="ACTIVE">Active</option>
                <option value="INACTIVE">Inactive</option>
                <option value="DELETED">Deleted</option>
              </select>
            </div>

            <div className="mt-5 max-w-full overflow-x-auto rounded-[18px] border border-[var(--line)] shadow-[inset_0_1px_0_rgba(245,247,242,0.05)] light:border-slate-200/70 light:bg-white/40 [scrollbar-width:thin]">
              <table className="min-w-[980px] w-full border-separate border-spacing-y-2">
                <thead>
                  <tr className="text-left text-xs uppercase tracking-[0.16em] text-[var(--text-muted)]">
                    <th className="px-3 py-2">User</th>
                    <th className="px-3 py-2">Role</th>
                    <th className="px-3 py-2">Status</th>
                    <th className="px-3 py-2">Academic mapping</th>
                    <th className="px-3 py-2 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td
                        className="px-3 py-12 text-sm text-[var(--muted)]"
                        colSpan={5}
                      >
                        <div className="flex justify-center">
                          <PenguinLoadingSpinner
                            size="md"
                            showText={true}
                            text="Loading users"
                          />
                        </div>
                      </td>
                    </tr>
                  ) : null}

                  {!loading && users.length === 0 ? (
                    <tr>
                      <td
                        className="px-3 py-6 text-sm text-[var(--muted)]"
                        colSpan={5}
                      >
                        No users found for the current filters.
                      </td>
                    </tr>
                  ) : null}

                  {users.map((user) => (
                    <tr
                      key={user.id}
                      className="rounded-2xl border border-[var(--line)] bg-white/[0.04] text-sm light:border-slate-200 light:bg-white light:shadow-[0_10px_24px_rgba(33,45,74,0.05)]"
                    >
                      <td className="rounded-l-2xl px-3 py-3">
                        <p className="font-semibold text-[var(--foreground)] light:text-slate-950">
                          {user.name}
                        </p>
                        <p className="mt-1 text-xs text-[var(--muted)] light:text-slate-600">
                          {user.email}
                        </p>
                      </td>
                      <td className="px-3 py-3">
                        <div className="flex flex-col gap-2">
                          <Badge tone={roleTone[user.role]}>{user.role}</Badge>
                          {user.role === "SUPER_ADMIN" ? (
                            <span className="text-xs text-[var(--muted)]">
                              Locked role
                            </span>
                          ) : (
                            <select
                              value={user.role}
                              onChange={(event) =>
                                void updateRole(
                                  user,
                                  event.target.value as AdminUserRole,
                                )
                              }
                              className="h-9 rounded-xl border border-[var(--line)] bg-transparent px-2 text-xs light:border-slate-200 light:bg-white"
                            >
                              <option value="STUDENT">Student</option>
                              <option value="TEACHER">Teacher</option>
                              <option value="ADMIN">Admin</option>
                            </select>
                          )}
                        </div>
                      </td>
                      <td className="px-3 py-3">
                        <div className="flex flex-col gap-2">
                          <Badge tone={statusTone[user.status]}>
                            {user.status}
                          </Badge>
                          {user.status !== "DELETED" ? (
                            <Button
                              type="button"
                              variant="ghost"
                              className="h-8 justify-start px-2 text-xs"
                              onClick={() =>
                                void updateStatus(
                                  user,
                                  user.status === "ACTIVE"
                                    ? "INACTIVE"
                                    : "ACTIVE",
                                )
                              }
                            >
                              {user.status === "ACTIVE"
                                ? "Deactivate"
                                : "Activate"}
                            </Button>
                          ) : null}
                        </div>
                      </td>
                      <td className="px-3 py-3 text-xs leading-5 text-[var(--muted)] light:text-slate-600">
                        <p>{user.department?.name ?? "No department"}</p>
                        <p>{user.course?.title ?? "No course"}</p>
                        <p>
                          {user.unit?.code ??
                            user.batch?.name ??
                            "No unit/batch"}
                        </p>
                      </td>
                      <td className="rounded-r-2xl px-3 py-3">
                        <div className="flex justify-end gap-2">
                          <IconAction
                            label="Edit"
                            onClick={() => editUser(user)}
                            icon={Pencil}
                          />
                          <IconAction
                            label="Reset password"
                            onClick={() => void resetPassword(user)}
                            icon={KeyRound}
                          />
                          <IconAction
                            label="Delete"
                            onClick={() => void deleteUser(user)}
                            icon={Trash2}
                            danger
                          />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      </div>
    </AppShell>
  );
}

function UserFormPanel({
  form,
  setForm,
  departments,
  courses,
  units,
  batches,
  editingUserId,
  saving,
  onSave,
  onCancel,
}: {
  form: UserFormState;
  setForm: Dispatch<SetStateAction<UserFormState>>;
  departments: OptionRecord[];
  courses: OptionRecord[];
  units: OptionRecord[];
  batches: OptionRecord[];
  editingUserId: string | null;
  saving: boolean;
  onSave: () => void;
  onCancel: () => void;
}) {
  const courseOptions = courses.filter(
    (course) => !form.departmentId || course.departmentId === form.departmentId,
  );
  const unitOptions = units.filter(
    (unit) => !form.courseId || unit.courseId === form.courseId,
  );
  const batchOptions = batches.filter(
    (batch) => !form.courseId || batch.courseId === form.courseId,
  );

  function updateField<K extends keyof UserFormState>(
    key: K,
    value: UserFormState[K],
  ) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  return (
    <Card>
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-[var(--foreground)] light:text-slate-950">
            {editingUserId ? "Edit user details" : "Create user"}
          </h2>
          <p className="mt-1 text-sm leading-6 text-[var(--muted)] light:text-slate-600">
            Public signup is disabled. Admins create accounts here.
          </p>
        </div>
        {editingUserId ? (
          <Badge tone="amber">Editing</Badge>
        ) : (
          <Badge tone="emerald">Admin only</Badge>
        )}
      </div>

      <div className="mt-5 grid gap-3">
        <Field label="Full name">
          <input
            value={form.name}
            onChange={(event) => updateField("name", event.target.value)}
            className={compactInputClass}
            placeholder="Student or staff name"
          />
        </Field>
        <Field label="Email">
          <input
            value={form.email}
            onChange={(event) => updateField("email", event.target.value)}
            className={compactInputClass}
            placeholder="name@nexora.local"
            type="email"
          />
        </Field>

        {!editingUserId ? (
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1 2xl:grid-cols-2">
            <Field label="Role">
              <select
                value={form.role}
                onChange={(event) =>
                  updateField("role", event.target.value as AdminUserRole)
                }
                className={compactInputClass}
              >
                <option value="STUDENT">Student</option>
                <option value="TEACHER">Teacher</option>
                <option value="ADMIN">Admin</option>
              </select>
            </Field>
            <Field label="Status">
              <select
                value={form.status}
                onChange={(event) =>
                  updateField(
                    "status",
                    event.target.value as "ACTIVE" | "INACTIVE",
                  )
                }
                className={compactInputClass}
              >
                <option value="ACTIVE">Active</option>
                <option value="INACTIVE">Inactive</option>
              </select>
            </Field>
          </div>
        ) : null}

        <Field label="Department">
          <select
            value={form.departmentId}
            onChange={(event) => {
              updateField("departmentId", event.target.value);
              updateField("courseId", "");
              updateField("unitId", "");
              updateField("batchId", "");
            }}
            className={compactInputClass}
          >
            <option value="">No department</option>
            {departments.map((department) => (
              <option key={department.id} value={department.id}>
                {department.name}
                {department.code ? ` (${department.code})` : ""}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Course / Unit">
          <select
            value={form.courseId}
            onChange={(event) => {
              updateField("courseId", event.target.value);
              updateField("unitId", "");
              updateField("batchId", "");
            }}
            className={compactInputClass}
          >
            <option value="">No course</option>
            {courseOptions.map((course) => (
              <option key={course.id} value={course.id}>
                {course.title}
                {course.code ? ` (${course.code})` : ""}
              </option>
            ))}
          </select>
        </Field>

        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1 2xl:grid-cols-2">
          <Field label="OTHM Unit">
            <select
              value={form.unitId}
              onChange={(event) => updateField("unitId", event.target.value)}
              className={compactInputClass}
            >
              <option value="">No unit</option>
              {unitOptions.map((unit) => (
                <option key={unit.id} value={unit.id}>
                  {unit.code ? `${unit.code} - ` : ""}
                  {unit.title}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Batch">
            <select
              value={form.batchId}
              onChange={(event) => updateField("batchId", event.target.value)}
              className={compactInputClass}
            >
              <option value="">No batch</option>
              {batchOptions.map((batch) => (
                <option key={batch.id} value={batch.id}>
                  {batch.name}
                </option>
              ))}
            </select>
          </Field>
        </div>

        {!editingUserId ? (
          <Field label="Temporary password">
            <input
              value={form.password}
              onChange={(event) => updateField("password", event.target.value)}
              className={compactInputClass}
              placeholder="Leave blank to generate"
              type="password"
              minLength={8}
            />
          </Field>
        ) : null}
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        <Button
          type="button"
          disabled={saving || !form.name || !form.email}
          onClick={onSave}
        >
          {saving
            ? "Saving..."
            : editingUserId
              ? "Save changes"
              : "Create user"}
        </Button>
        <Button type="button" variant="secondary" onClick={onCancel}>
          Clear
        </Button>
      </div>
    </Card>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="grid gap-1.5 text-sm font-semibold text-[var(--foreground)] light:text-slate-800">
      {label}
      {children}
    </label>
  );
}

function IconAction({
  label,
  icon: Icon,
  onClick,
  danger = false,
}: {
  label: string;
  icon: ComponentType<{ className?: string; "aria-hidden"?: boolean }>;
  onClick: () => void;
  danger?: boolean;
}) {
  return (
    <button
      type="button"
      className={cn(
        "nexora-focus grid h-9 w-9 place-items-center rounded-xl border border-[var(--line)] text-slate-300 transition hover:border-[color:var(--border-emerald)] hover:text-[var(--brand-lime)] light:border-slate-200 light:bg-white light:text-slate-600 light:hover:border-emerald-200 light:hover:text-emerald-700",
        danger &&
          "hover:border-rose-300/50 hover:text-rose-200 light:hover:border-rose-200 light:hover:text-rose-700",
      )}
      aria-label={label}
      title={label}
      onClick={onClick}
    >
      <Icon className="h-4 w-4" aria-hidden />
    </button>
  );
}
