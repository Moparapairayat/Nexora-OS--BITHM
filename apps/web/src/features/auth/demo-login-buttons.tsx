"use client";

import { useRouter } from "next/navigation";
import { ArrowRight, ShieldCheck } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { apiPost } from "@/services/api-client";
import { cn } from "@/lib/utils";

type DemoRole = "student" | "teacher" | "admin";

const demoLogins: Array<{
  role: DemoRole;
  label: string;
  shortLabel: string;
  email: string;
  password: string;
  route: string;
}> = [
    {
      role: "student",
      label: "Student Demo",
      shortLabel: "Student",
      email: "student@nexora.local",
      password: "password123",
      route: "/student/dashboard",
    },
    {
      role: "teacher",
      label: "Teacher Demo",
      shortLabel: "Teacher",
      email: "teacher@nexora.local",
      password: "password123",
      route: "/teacher/dashboard",
    },
    {
      role: "admin",
      label: "Admin Demo",
      shortLabel: "Admin",
      email: "admin@nexora.local",
      password: "password123",
      route: "/admin/dashboard",
    },
  ];

export function DemoLoginButtons({
  className,
  variant = "compact",
  onDark = false,
}: {
  className?: string;
  variant?: "compact" | "portal";
  onDark?: boolean;
}) {
  const router = useRouter();
  const [loadingRole, setLoadingRole] = useState<DemoRole | null>(null);
  const [error, setError] = useState("");

  async function signInDemo(account: (typeof demoLogins)[number]) {
    setLoadingRole(account.role);
    setError("");

    const response = await apiPost<{
      token: string;
      user: { role: "STUDENT" | "TEACHER" | "ADMIN" | "SUPER_ADMIN" };
    }>("/auth/login", {
      email: account.email,
      password: account.password,
    });

    if (!response?.token) {
      setError(
        "The demo workspace is temporarily unavailable. Please try again shortly.",
      );
      setLoadingRole(null);
      return;
    }

    window.localStorage.setItem("nexora_token", response.token);

    const route =
      response.user.role === "ADMIN" || response.user.role === "SUPER_ADMIN"
        ? "/admin/dashboard"
        : response.user.role === "TEACHER"
          ? "/teacher/dashboard"
          : "/student/dashboard";

    router.push(route);
  }

  return (
    <div
      className={cn(
        "grid",
        variant === "portal" ? "gap-2" : "gap-1.5",
        className,
      )}
    >
      <div
        className={cn(
          "grid grid-cols-3",
          variant === "portal" ? "gap-1.5 sm:gap-2" : "gap-1 sm:gap-1.5",
        )}
      >
        {demoLogins.map((account) => {
          const isLoading = loadingRole === account.role;

          return (
            <Button
              key={account.role}
              type="button"
              variant={variant === "portal" ? "secondary" : "ghost"}
              className={cn(
                "rounded-xl text-[11px] sm:text-xs px-1 sm:px-2 h-8.5 sm:h-9 font-bold transition-all duration-200",
                variant === "portal" &&
                "justify-center sm:justify-between border-[color:var(--border-emerald)] bg-[rgba(50,245,154,0.07)] text-[var(--foreground)] hover:bg-[rgba(50,245,154,0.12)]",
                onDark &&
                "border-white/20 bg-white/10 text-white hover:border-white/30 hover:bg-white/16 light:text-white",
              )}
              disabled={loadingRole !== null}
              aria-busy={isLoading}
              onClick={() => void signInDemo(account)}
            >
              {isLoading ? (
                <span className="mx-auto text-[10px] sm:text-[11px]">Signing in...</span>
              ) : (
                <span className="inline-flex items-center justify-center gap-1 sm:gap-1.5 whitespace-nowrap">
                  <ShieldCheck className="h-3.5 w-3.5 shrink-0 text-emerald-400 light:text-emerald-600" aria-hidden="true" />
                  <span>{account.shortLabel}</span>
                </span>
              )}
              {variant === "portal" && !isLoading ? (
                <ArrowRight className="hidden sm:block h-3.5 w-3.5" aria-hidden="true" />
              ) : null}
            </Button>
          );
        })}
      </div>
      {error ? (
        <p
          role="alert"
          aria-live="assertive"
          className="rounded-xl border border-rose-300/20 bg-rose-500/10 px-3 py-2 text-xs text-rose-100 light:text-rose-700"
        >
          {error}
        </p>
      ) : null}
    </div>
  );
}
