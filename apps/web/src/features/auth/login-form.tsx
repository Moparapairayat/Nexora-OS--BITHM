"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { DemoLoginButtons } from "@/features/auth/demo-login-buttons";
import {
  AuthBrand,
  AuthField,
  AuthShell,
  RoleTabs,
  authInputClass,
} from "@/features/auth/auth-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { apiPost } from "@/lib/workflow-api";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  role: z.enum(["student", "teacher", "admin"]),
});

type LoginValues = z.infer<typeof schema>;
type LoginRole = LoginValues["role"];

const roleOptions: Array<{ value: LoginRole; label: string }> = [
  { value: "student", label: "Student" },
  { value: "teacher", label: "Teacher" },
  { value: "admin", label: "Admin" },
];

export function LoginForm() {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<LoginValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      email: "",
      password: "",
      role: "student",
    },
  });

  const [selectedRole, setSelectedRole] = useState<LoginRole>("student");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  function selectRole(role: LoginRole) {
    setSelectedRole(role);
    setValue("role", role, { shouldValidate: true });
  }

  async function onSubmit(values: LoginValues) {
    setIsSubmitting(true);
    setError("");

    const response = await apiPost<{
      token: string;
      user: { role: "STUDENT" | "TEACHER" | "ADMIN" | "SUPER_ADMIN" };
    }>("/auth/login", {
      email: values.email,
      password: values.password,
    });

    if (!response?.token) {
      setError("We couldn't sign you in. Check your email and password.");
      setIsSubmitting(false);
      return;
    }

    window.localStorage.setItem("nexora_token", response.token);

    const role =
      response.user.role === "ADMIN" || response.user.role === "SUPER_ADMIN"
        ? "admin"
        : response.user.role === "TEACHER"
          ? "teacher"
          : "student";

    router.push(`/${role}/dashboard`);
  }

  return (
    <AuthShell mode="login">
      <AuthBrand />

      <div className="mt-2 sm:mt-4 md:mt-5">
        <Badge tone="emerald">BITHM Portal</Badge>
        <h1 className="mt-2 sm:mt-3 text-balance text-lg sm:text-xl md:text-[1.75rem] font-bold leading-tight tracking-tight text-[var(--foreground)] light:text-slate-900">
          Sign in to Nexora OS
        </h1>
        <p className="mt-1 sm:mt-2 text-xs sm:text-sm leading-5 sm:leading-6 text-[var(--muted)] light:text-slate-600">
          Sign in to continue your academic work.
        </p>
      </div>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="mt-2 sm:mt-4 md:mt-5 grid gap-2 sm:gap-3 md:gap-3.5"
      >
        <input type="hidden" {...register("role")} />

        <div className="grid gap-2 sm:gap-2.5">
          <p className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] light:text-slate-600">
            Sign in as
          </p>
          <RoleTabs
            value={selectedRole}
            options={roleOptions}
            onChange={selectRole}
          />
        </div>

        <AuthField label="Email" error={errors.email?.message}>
          <input
            {...register("email")}
            autoComplete="email"
            className={authInputClass}
          />
        </AuthField>

        <AuthField label="Password" error={errors.password?.message}>
          <input
            {...register("password")}
            type="password"
            autoComplete="current-password"
            className={authInputClass}
          />
        </AuthField>

        <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between text-[11px] sm:text-xs text-[var(--muted)] light:text-slate-600">
          <label className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity">
            <input
              type="checkbox"
              className="h-4 w-4 rounded border border-[var(--line)] bg-black/30 accent-[#32f59a] hover:bg-black/50 transition-colors light:border-slate-300 light:bg-slate-100 light:accent-emerald-600 light:hover:bg-slate-200"
            />
            <span className="font-medium">Remember me</span>
          </label>
          <a
            href="#forgot-password"
            className="nexora-focus rounded-md transition-all duration-200 hover:text-[#32f59a] hover:underline light:hover:text-emerald-600 font-medium"
          >
            Forgot password?
          </a>
        </div>

        <Button
          type="submit"
          className="auth-primary-action h-10 w-full rounded-xl text-xs sm:h-11 sm:rounded-2xl sm:text-sm"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Signing in..." : "Sign In"}
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </Button>

        <div className="pt-1 sm:pt-2 border-t border-[var(--line)] light:border-slate-200 grid gap-1.5 sm:gap-2">
          <p className="text-[9px] sm:text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] light:text-slate-600">
            Try a demo account
          </p>
          <DemoLoginButtons />
        </div>

        {error ? (
          <p className="rounded-lg sm:rounded-xl border border-rose-300/30 bg-rose-500/15 px-4 py-3 text-xs font-medium text-rose-100 light:border-rose-300 light:bg-rose-50 light:text-rose-800 flex items-center gap-2 animate-shake">
            <span>⚠️</span>
            {error}
          </p>
        ) : null}

        <div className="-mt-2 sm:-mt-2 md:-mt-2.5 text-center text-[9px] sm:text-xs md:text-sm font-semibold text-[var(--muted)] light:text-slate-700 light:font-bold">
          Access is managed by your institution admin.
        </div>
      </form>
    </AuthShell>
  );
}
