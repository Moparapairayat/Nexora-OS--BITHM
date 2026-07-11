"use client";

import Image from "next/image";

export function PenguinLoadingSpinner({
  size = "md",
  showText = true,
  text = "Loading",
}: {
  size?: "sm" | "md" | "lg" | "xl" | "2xl";
  showText?: boolean;
  text?: string;
} = {}) {
  const sizeMap = {
    sm: { width: 32, height: 32 },
    md: { width: 48, height: 48 },
    lg: { width: 64, height: 64 },
    xl: { width: 128, height: 128 },
    "2xl": { width: 160, height: 160 },
  };

  const { width, height } = sizeMap[size];

  return (
    <div className="flex flex-col items-center justify-center gap-3">
      <Image
        src="/mascots/pengu-loading.gif"
        alt="Loading"
        width={width}
        height={height}
        unoptimized
        priority
      />
      {showText && (
        <p
          className={`${
            size === "2xl"
              ? "text-2xl font-semibold"
              : size === "xl"
                ? "text-lg"
                : "text-sm"
          } text-slate-500`}
        >
          {text}
        </p>
      )}
    </div>
  );
}
