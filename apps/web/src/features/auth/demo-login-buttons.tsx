"use client";

import { useRouter } from "next/navigation";
import { ArrowRight, ShieldCheck } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { PenguinLoadingSpinner } from "@/components/ui/loading-spinner";
import { apiPost } from "@/lib/workflow-api";
import { cn } from "@/lib/utils";

type DemoRole = "student" | "teacher" | "admin";

const demoLogins: Array<{
  role: DemoRole;
  label: string;
  email: string;
  password: string;
  route: string;
}> = [
  {
    role: "student",
    label: "Student Demo",
    email: "student@nexora.local",
    password: "password123",
    route: "/student/dashboard",
  },
  {
    role: "teacher",
    label: "Teacher Demo",
    email: "teacher@nexora.local",
    password: "password123",
    route: "/teacher/dashboard",
  },
  {
    role: "admin",
    label: "Admin Demo",
    email: "admin@nexora.local",
    password: "password123",
    route: "/admin/dashboard",
  },
];

export function DemoLoginButtons({
  className,
  variant = "compact",
}: {
  className?: string;
  variant?: "compact" | "portal";
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
        "Demo login is unavailable. Start the API and make sure the demo accounts have been seeded.",
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
          "grid",
          variant === "portal" ? "sm:grid-cols-1" : "sm:grid-cols-3",
          variant === "portal" ? "gap-2" : "gap-1.5",
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
                "rounded-2xl text-xs",
                variant === "portal" ? "h-10" : "h-9",
                variant === "portal" &&
                  "justify-between border-[color:var(--border-emerald)] bg-[rgba(50,245,154,0.07)] text-[var(--foreground)] hover:bg-[rgba(50,245,154,0.12)]",
              )}
              disabled={loadingRole !== null}
              onClick={() => void signInDemo(account)}
            >
              {isLoading ? (
                <span className="mx-auto">
                  <PenguinLoadingSpinner size="sm" showText={false} />
                </span>
              ) : (
                <span className="inline-flex items-center gap-2">
                  <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" />
                  {account.label}
                </span>
              )}
              {variant === "portal" && !isLoading ? (
                <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
              ) : null}
            </Button>
          );
        })}
      </div>
      {error ? (
        <p className="rounded-xl border border-rose-300/20 bg-rose-500/10 px-3 py-2 text-xs text-rose-100 light:text-rose-700">
          {error}
        </p>
      ) : null}
    </div>
  );
}
