import React from "react";
import { cn } from "../../utils/cn";

const buttonVariants = {
  hero: "bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg hover:shadow-xl",
  "hero-outline": "border-2 border-primary text-primary hover:bg-primary/10",
  ghost: "text-muted-foreground hover:text-foreground hover:bg-secondary",
  default: "bg-primary text-primary-foreground hover:bg-primary/90",
  secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
  destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
  outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
  link: "text-primary underline-offset-4 hover:underline",
  brand:
    "bg-brand text-brand-foreground font-bold shadow-soft hover:brightness-[0.96] hover:shadow-soft-lg [transition:all_.25s_ease]",
  "brand-outline":
    "bg-card text-foreground font-bold border-2 border-border hover:border-foreground/40 hover:bg-secondary/60 [transition:all_.25s_ease]",
  "brand-dark":
    "bg-foreground text-background font-bold shadow-soft hover:opacity-90 [transition:all_.25s_ease]",
  "on-brand":
    "bg-brand-foreground text-brand font-bold shadow-soft hover:opacity-90 [transition:all_.25s_ease]",
};

const buttonSizes = {
  default: "h-10 px-4 py-2",
  sm: "h-9 rounded-md px-3",
  lg: "h-11 rounded-md px-8",
  xl: "h-14 rounded-lg px-10 text-lg",
  icon: "h-10 w-10",
  pill: "h-14 rounded-full px-9 text-base",
  "pill-sm": "h-11 rounded-full px-6 text-sm",
};

export const Button = React.forwardRef(
  ({ className, variant = "default", size = "default", ...props }, ref) => {
    return (
      <button
        className={cn(
          "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
          buttonVariants[variant],
          buttonSizes[size],
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);

Button.displayName = "Button";
