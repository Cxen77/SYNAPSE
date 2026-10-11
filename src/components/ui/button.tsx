import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-semibold cursor-pointer transition-all active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 disabled:cursor-not-allowed [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground shadow hover:bg-primary/90",
        destructive: "bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90",
        outline:
          "border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground",
        secondary: "bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
        soft: "bg-surface-glass text-foreground shadow-sm backdrop-blur-md hover:bg-surface-glass/80",
        select: "relative h-28 flex-col rounded-lg border border-border bg-card text-foreground shadow-none hover:border-primary/50",
        selectActive: "relative h-28 flex-col rounded-lg border-2 border-primary bg-primary-soft text-primary shadow-none",
        skill: "h-14 justify-between rounded-lg border border-border bg-card px-4 text-foreground shadow-none hover:border-primary/50",
        skillActive: "h-14 justify-between rounded-lg border-2 border-primary bg-primary-soft px-4 text-primary shadow-none",
        chip: "h-9 rounded-full border border-border bg-card px-4 text-muted-foreground shadow-none",
        chipActive: "h-9 rounded-full bg-foreground px-4 text-background shadow-none",
        segment: "h-10 flex-1 rounded-md bg-transparent text-muted-foreground shadow-none",
        segmentActive: "h-10 flex-1 rounded-md bg-card text-foreground shadow-sm",
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 rounded-md px-3 text-xs",
        lg: "h-10 rounded-md px-8",
        icon: "h-9 w-9",
        xl: "h-13 rounded-lg px-6 text-base",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />
    );
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
