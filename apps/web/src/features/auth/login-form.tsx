"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { ArrowRight, Eye, EyeOff, Info } from "lucide-react";
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
import { apiPost } from "@/services/api-client";

const schema = z.object({
  email: z.string().email("Enter a valid email address."),
  password: z.string().min(8, "Password must be at least 8 characters."),
  role: z.enum(["student", "teacher", "admin"]),
  remember: z.boolean(),
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
    setFocus,
    formState: { errors },
  } = useForm<LoginValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      email: "",
      password: "",
      role: "student",
      remember: true,
    },
  });

  const [selectedRole, setSelectedRole] = useState<LoginRole>("student");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showRecoveryHelp, setShowRecoveryHelp] = useState(false);

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
      setFocus("email");
      return;
    }

    const role =
      response.user.role === "ADMIN" || response.user.role === "SUPER_ADMIN"
        ? "admin"
        : response.user.role === "TEACHER"
          ? "teacher"
          : "student";

    if (role !== values.role) {
      setError(
        `This account belongs to the ${role} workspace. Select ${role} and try again.`,
      );
      setIsSubmitting(false);
      return;
    }

    const preferredStorage = values.remember
      ? window.localStorage
      : window.sessionStorage;
    const otherStorage = values.remember
      ? window.sessionStorage
      : window.localStorage;
    otherStorage.removeItem("nexora_token");
    preferredStorage.setItem("nexora_token", response.token);

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
            id="login-email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            aria-invalid={Boolean(errors.email)}
            className={authInputClass}
          />
        </AuthField>

        <AuthField label="Password" error={errors.password?.message}>
          <div className="relative">
            <input
              {...register("password")}
              id="login-password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              placeholder="Enter your password"
              aria-invalid={Boolean(errors.password)}
              className={`${authInputClass} pr-11`}
            />
            <button
              type="button"
              className="nexora-focus absolute right-2 top-1/2 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-lg text-[var(--muted)] transition hover:bg-white/10 hover:text-[var(--foreground)] light:hover:bg-emerald-50 light:hover:text-emerald-700"
              onClick={() => setShowPassword((current) => !current)}
              aria-label={showPassword ? "Hide password" : "Show password"}
              title={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Eye className="h-4 w-4" aria-hidden="true" />
              )}
            </button>
          </div>
        </AuthField>

        <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between text-[11px] sm:text-xs text-[var(--muted)] light:text-slate-600">
          <label className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity">
            <input
              {...register("remember")}
              type="checkbox"
              className="h-4 w-4 rounded border border-[var(--line)] bg-black/30 accent-[var(--theme-accent-primary)] hover:bg-black/50 transition-colors light:border-slate-300 light:bg-slate-100 light:accent-[var(--theme-accent-primary)] light:hover:bg-slate-200"
            />
            <span className="font-medium">Remember me</span>
          </label>
          <button
            type="button"
            className="nexora-focus rounded-md transition-all duration-200 hover:text-[var(--theme-accent-primary)] hover:underline light:hover:text-emerald-600 font-medium"
            onClick={() => setShowRecoveryHelp((current) => !current)}
            aria-expanded={showRecoveryHelp}
          >
            Forgot password?
          </button>
        </div>

        {showRecoveryHelp ? (
          <div className="flex gap-2 rounded-xl border border-[rgba(var(--theme-accent-primary-rgb-raw),0.25)] bg-[rgba(var(--theme-accent-primary-rgb-raw),0.07)] px-3 py-2.5 text-xs leading-5 text-[var(--muted)] light:border-[rgba(var(--theme-accent-primary-rgb-raw),0.3)] light:bg-[rgba(var(--theme-accent-primary-rgb-raw),0.08)] light:text-emerald-900">
            <Info className="mt-0.5 h-4 w-4 shrink-0 text-[var(--theme-accent-primary)]" />
            <p>
              Passwords are managed by BITHM. Contact your department admin to
              reset your access.
            </p>
          </div>
        ) : null}

        <Button
          type="submit"
          className="auth-primary-action h-11 sm:h-12 w-full rounded-xl sm:rounded-2xl text-sm font-bold"
          disabled={isSubmitting}
          aria-busy={isSubmitting}
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
          <p
            role="alert"
            aria-live="assertive"
            className="rounded-lg sm:rounded-xl border border-rose-300/30 bg-rose-500/15 px-4 py-3 text-xs font-medium text-rose-100 light:border-rose-300 light:bg-rose-50 light:text-rose-800 flex items-center gap-2 animate-shake"
          >
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
