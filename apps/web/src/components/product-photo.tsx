import { cn } from "@eventrack/ui";

export function ProductPhoto({
  name,
  reference,
  color,
  photoUrls,
  activeIndex = 0,
  size = "md",
  className,
}: {
  name: string;
  reference: string;
  color: string;
  photoUrls?: string[];
  activeIndex?: number;
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const sizes = {
    sm: "h-12 w-12 text-xs",
    md: "h-16 w-16 text-sm",
    lg: "h-48 w-full text-base",
  };

  const src = photoUrls?.[activeIndex] ?? photoUrls?.[0];

  if (src) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={src}
        alt={name}
        className={cn(
          "rounded-md object-cover bg-white",
          sizes[size],
          size === "lg" && "aspect-[4/3]",
          className
        )}
      />
    );
  }

  return (
    <div
      className={cn(
        "flex items-center justify-center rounded-md font-semibold text-white",
        sizes[size],
        size === "lg" && "aspect-[4/3]",
        className
      )}
      style={{ backgroundColor: color }}
      title={name}
    >
      {reference}
    </div>
  );
}
