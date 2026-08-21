"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ArrowRight, Building, Eye, EyeOff, Info, Lock, Mail, ShieldCheck, X } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { AnimatePresence, motion } from "framer-motion";
import { z } from "zod";

import { DemoLoginButtons } from "@/features/auth/demo-login-buttons";
import { NexoraLogo } from "@/components/brand/nexora-logo";
import {
  AuthField,
  AuthShell,
  RoleTabs,
  authInputClass,
} from "@/features/auth/auth-shell";
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
  const [authMode, setAuthMode] = useState<"login" | "register">("login");
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
    <AuthShell mode={authMode}>
      {/* Top Brand Favicon Icon & Prominent Pengu Mascot */}
      <div className="relative mb-2 sm:mb-2.5">
        <div className="mx-auto flex items-center justify-center">
          <Image
            src="/brand/nexora-os-icon.png"
            alt="Nexora OS"
            width={44}
            height={44}
            priority
            className="h-10 w-10 sm:h-11 sm:w-11 object-contain transition-transform duration-300 hover:scale-105"
          />
        </div>

        {/* Large Crisp Animated Pengu Mascot Greeting */}
        <motion.div
          animate={{ y: [0, -6, 0], rotate: [-3, 3, -3] }}
          transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -right-2 -top-5 sm:-right-4 sm:-top-7 select-none pointer-events-none z-20"
        >
          <div className="relative">
            <Image
              src="/mascots/nexora-auth-penguin.gif"
              alt="Nexora Pengu Mascot"
              width={90}
              height={90}
              unoptimized
              priority
              className="h-16 w-16 sm:h-20 sm:w-20 object-contain drop-shadow-[0_8px_20px_rgba(0,0,0,0.35)]"
            />
            <span className="absolute -bottom-1 right-0 rounded-full bg-emerald-500 px-2 py-0.5 text-[9px] sm:text-[10px] font-extrabold text-white shadow-md">
              Hi there! 👋
            </span>
          </div>
        </motion.div>
      </div>

      {/* Header */}
      <div className="text-center">
        <h1 className="text-xl lg:text-[22px] font-extrabold tracking-tight text-white light:text-slate-900">
          Welcome Back
        </h1>
        <p className="mt-0.5 sm:mt-1 text-xs text-slate-400 light:text-slate-500">
          Welcome back! Please enter your details.
        </p>
      </div>

      {/* Auth Form */}
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="mt-2 sm:mt-2.5 grid gap-2 sm:gap-2.5"
      >
        <input type="hidden" {...register("role")} />

        {/* Workspace Selector */}
        <div className="grid gap-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 light:text-slate-500">
              Workspace Role
            </span>
          </div>
          <RoleTabs
            value={selectedRole}
            options={roleOptions}
            onChange={selectRole}
          />
        </div>

        {/* Email Field */}
        <AuthField label="Email" error={errors.email?.message}>
          <div className="relative">
            <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 light:text-slate-400" />
            <input
              {...register("email")}
              id="login-email"
              type="email"
              autoComplete="email"
              placeholder="Enter email"
              aria-invalid={Boolean(errors.email)}
              className={`${authInputClass} pl-10 text-xs sm:text-[13px]`}
            />
          </div>
        </AuthField>

        {/* Password Field */}
        <AuthField label="Password" error={errors.password?.message}>
          <div className="relative">
            <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 light:text-slate-400" />
            <input
              {...register("password")}
              id="login-password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              placeholder="••••••••••••"
              aria-invalid={Boolean(errors.password)}
              className={`${authInputClass} pl-10 pr-10 text-xs sm:text-[13px]`}
            />
            <button
              type="button"
              className="nexora-focus absolute right-2 top-1/2 grid h-7 w-7 -translate-y-1/2 place-items-center rounded-lg text-slate-400 transition hover:text-white light:hover:text-slate-800"
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

        {/* Remember me & Forgot password */}
        <div className="flex items-center justify-between text-xs text-slate-400 light:text-slate-600">
          <label className="flex items-center gap-1.5 sm:gap-2 cursor-pointer select-none hover:text-slate-200 light:hover:text-slate-900 transition-colors">
            <input
              {...register("remember")}
              type="checkbox"
              className="h-3.5 w-3.5 rounded border border-white/20 bg-black/40 accent-emerald-500 light:border-slate-300 light:bg-white"
            />
            <span>Remember me</span>
          </label>
          <button
            type="button"
            className="nexora-focus font-medium text-slate-400 hover:text-emerald-400 hover:underline light:text-slate-600 light:hover:text-emerald-600"
            onClick={() => setShowRecoveryHelp(true)}
            aria-expanded={showRecoveryHelp}
          >
            Forgot password?
          </button>
        </div>

        {/* Primary Action Button - Landing Style Centered */}
        <button
          type="submit"
          className="group relative flex h-11 sm:h-12 w-full items-center justify-center gap-2 rounded-full border border-emerald-400/40 bg-[#044b3b] px-5 sm:px-6 text-xs sm:text-sm font-extrabold !text-white shadow-[0_10px_24px_rgba(4,75,59,0.38)] transition-all duration-300 hover:scale-[1.01] hover:bg-[#033b2e] hover:border-emerald-300/60 active:scale-[0.98] disabled:opacity-75 disabled:pointer-events-none cursor-pointer"
          disabled={isSubmitting}
          aria-busy={isSubmitting}
        >
          <span>{isSubmitting ? "Authenticating..." : "Sign In"}</span>
          <span className="flex h-6 w-6 sm:h-6.5 sm:w-6.5 shrink-0 items-center justify-center rounded-full bg-[#ff5500] text-white shadow-[0_4px_10px_rgba(255,85,0,0.4)] transition-transform duration-300 group-hover:scale-105 group-hover:translate-x-0.5">
            <ArrowRight className="h-3.5 w-3.5 stroke-[2.5]" />
          </span>
        </button>

        {/* Contact Admin Help Link */}
        <p className="text-center text-xs text-slate-400 light:text-slate-600">
          Need an account?{" "}
          <button
            type="button"
            onClick={() => setShowRecoveryHelp(true)}
            className="font-bold text-white underline underline-offset-4 hover:text-emerald-400 light:text-slate-900 light:hover:text-emerald-600 transition-colors"
          >
            Contact Admin
          </button>
        </p>

        {/* Social SSO Divider */}
        <div className="relative flex items-center justify-center my-0.5">
          <span className="w-full border-t border-white/10 light:border-slate-200" />
          <span className="absolute bg-[#0d1210] light:bg-white px-2 text-[11px] font-medium text-slate-400 light:text-slate-500">
            or continue with
          </span>
        </div>

        {/* Social SSO Buttons - Bigger Icons & Clearer Typography */}
        <div className="grid grid-cols-3 gap-2">
          <button
            type="button"
            onClick={() => {
              setValue("email", "student@nexora.local");
              setValue("password", "password123");
              selectRole("student");
            }}
            className="nexora-focus inline-flex h-9.5 sm:h-10 items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.05] px-2 text-xs sm:text-[12.5px] font-bold text-slate-200 transition-all hover:bg-white/[0.09] hover:text-white hover:border-white/20 light:border-slate-200 light:bg-slate-50 light:text-slate-700 light:hover:bg-slate-100"
            title="Sign in with Apple"
          >
            <svg className="h-4.5 w-4.5 sm:h-5 sm:w-5 shrink-0 fill-current" viewBox="0 0 24 24">
              <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.85c.57-.7.96-1.68.85-2.65-.84.03-1.85.56-2.44 1.25-.52.6-.98 1.57-.86 2.52.93.07 1.88-.42 2.45-1.12z" />
            </svg>
            <span>Apple</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setValue("email", "teacher@nexora.local");
              setValue("password", "password123");
              selectRole("teacher");
            }}
            className="nexora-focus inline-flex h-9.5 sm:h-10 items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.05] px-2 text-xs sm:text-[12.5px] font-bold text-slate-200 transition-all hover:bg-white/[0.09] hover:text-white hover:border-white/20 light:border-slate-200 light:bg-slate-50 light:text-slate-700 light:hover:bg-slate-100"
            title="Sign in with Google"
          >
            <svg className="h-4.5 w-4.5 sm:h-5 sm:w-5 shrink-0" viewBox="0 0 24 24">
              <path
                fill="#EA4335"
                d="M12 5c1.56 0 2.97.55 4.08 1.45l3.06-3.06C17.29 1.72 14.81 1 12 1 7.54 1 3.73 3.53 1.86 7.23l3.66 2.84C6.4 7.24 8.97 5 12 5z"
              />
              <path
                fill="#4285F4"
                d="M23.49 12.27c0-.79-.07-1.54-.19-2.27H12v4.51h6.47c-.29 1.48-1.14 2.73-2.4 3.58l3.7 2.87c2.16-1.99 3.42-4.93 3.42-8.69z"
              />
              <path
                fill="#FBBC05"
                d="M5.52 14.07c-.25-.74-.39-1.53-.39-2.35 0-.82.14-1.61.39-2.35L1.86 6.53C.68 8.89 0 11.51 0 14.28s.68 5.39 1.86 7.75l3.66-2.84c-.25-.74-.39-1.53-.39-2.35z"
              />
              <path
                fill="#34A853"
                d="M12 23c3.24 0 5.95-1.08 7.93-2.91l-3.7-2.87c-1.08.72-2.45 1.16-4.23 1.16-3.03 0-5.6-2.24-6.48-5.07L1.86 16.15C3.73 19.85 7.54 23 12 23z"
              />
            </svg>
            <span>Google</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setValue("email", "admin@nexora.local");
              setValue("password", "password123");
              selectRole("admin");
            }}
            className="nexora-focus inline-flex h-9.5 sm:h-10 items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.05] px-2 text-xs sm:text-[12.5px] font-bold text-slate-200 transition-all hover:bg-white/[0.09] hover:text-white hover:border-white/20 light:border-slate-200 light:bg-slate-50 light:text-slate-700 light:hover:bg-slate-100"
            title="Sign in with GitHub"
          >
            <svg className="h-4.5 w-4.5 sm:h-5 sm:w-5 shrink-0 fill-current" viewBox="0 0 24 24">
              <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
            </svg>
            <span>GitHub</span>
          </button>
        </div>

        {/* Demo Accounts Quick Login */}
        <div className="pt-1.5 border-t border-white/10 light:border-slate-200 grid gap-1.5">
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 light:text-slate-500">
            Or try instant demo login
          </p>
          <DemoLoginButtons />
        </div>

        {error ? (
          <p
            role="alert"
            aria-live="assertive"
            className="rounded-xl border border-rose-400/30 bg-rose-500/15 px-3 py-2 text-xs font-medium text-rose-200 light:border-rose-300 light:bg-rose-50 light:text-rose-800 flex items-center gap-2 animate-shake"
          >
            <span>⚠️</span>
            {error}
          </p>
        ) : null}
      </form>

      {/* Floating Admin Support Modal - Zero card expansion */}
      <AnimatePresence>
        {showRecoveryHelp ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 p-4 backdrop-blur-sm"
            onClick={() => setShowRecoveryHelp(false)}
          >
            <motion.div
              initial={{ scale: 0.94, opacity: 0, y: 12 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.94, opacity: 0, y: 12 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="relative w-full max-w-[400px] rounded-[24px] border border-white/15 bg-[#0f1512] p-5 sm:p-6 shadow-2xl light:border-slate-200 light:bg-white"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="grid h-9 w-9 place-items-center rounded-xl bg-emerald-500/15 text-emerald-400 light:bg-emerald-50 light:text-emerald-700">
                    <ShieldCheck className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-extrabold text-white light:text-slate-900">
                      BITHM IT Support
                    </h3>
                    <p className="text-[11px] text-slate-400 light:text-slate-500">
                      Account Access & Recovery
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowRecoveryHelp(false)}
                  className="grid h-7 w-7 place-items-center rounded-lg text-slate-400 transition hover:bg-white/10 hover:text-white light:hover:bg-slate-100 light:hover:text-slate-800"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <p className="mt-3 text-xs leading-relaxed text-slate-300 light:text-slate-600">
                Nexora OS accounts are managed by BITHM Academic Administration. If you need new credentials or password recovery, please contact IT Administration.
              </p>

              <div className="mt-3.5 grid gap-2 rounded-xl border border-white/10 bg-white/[0.03] p-3 text-xs text-slate-300 light:border-slate-200 light:bg-slate-50 light:text-slate-700">
                <div className="flex items-center gap-2">
                  <Mail className="h-3.5 w-3.5 text-emerald-400 light:text-emerald-600" />
                  <span className="font-semibold">Email:</span>
                  <a href="mailto:admin@bithm.edu.bd" className="text-emerald-400 hover:underline light:text-emerald-600">admin@bithm.edu.bd</a>
                </div>
                <div className="flex items-center gap-2">
                  <Building className="h-3.5 w-3.5 text-emerald-400 light:text-emerald-600" />
                  <span className="font-semibold">Office:</span>
                  <span>Academic Building, Room 204</span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowRecoveryHelp(false)}
                className="mt-4 w-full rounded-xl bg-[#044b3b] py-2.5 text-xs font-bold text-white shadow-sm transition hover:bg-[#033b2e]"
              >
                Got it, thanks!
              </button>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </AuthShell>
  );
}
