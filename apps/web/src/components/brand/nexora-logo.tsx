import Image from "next/image";

import { cn } from "@/lib/utils";

export const NEXORA_LOGO_SRC = "/brand/nexora-os-logo.png";
export const NEXORA_ICON_SRC = "/brand/nexora-os-icon.png";

const sizeClass = {
  sm: "h-9 w-[132px]",
  md: "h-11 w-[168px]",
  lg: "h-14 w-[210px]",
};

export function NexoraLogo({
  size = "md",
  className,
  imageClassName,
  priority = false,
}: {
  size?: keyof typeof sizeClass;
  className?: string;
  imageClassName?: string;
  priority?: boolean;
}) {
  return (
    <span
      className={cn(
        "relative inline-flex shrink-0 items-center",
        sizeClass[size],
        className,
      )}
    >
      <Image
        src={NEXORA_LOGO_SRC}
        alt="Nexora OS"
        fill
        sizes="(max-width: 768px) 150px, 210px"
        priority={priority}
        className={cn("object-contain object-left", imageClassName)}
      />
    </span>
  );
}

export function NexoraIcon({
  size = 32,
  className,
  priority = false,
}: {
  size?: number;
  className?: string;
  priority?: boolean;
}) {
  return (
    <span
      style={{ width: size, height: size }}
      className={cn(
        "relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-xl",
        className,
      )}
    >
      <Image
        src={NEXORA_ICON_SRC}
        alt="Nexora OS"
        width={size}
        height={size}
        priority={priority}
        className="h-full w-full object-contain"
      />
    </span>
  );
}
