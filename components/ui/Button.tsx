import * as React from "react";

type ButtonVariant = "primary" | "secondary" | "accent";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
};

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "bg-slate-900 text-white hover:bg-slate-800 border border-slate-900",
  secondary:
    "border border-slate-300 bg-white text-slate-700 hover:bg-slate-50",
  accent:
    "border border-blue-300 bg-blue-50 text-blue-600 hover:bg-blue-100"
};

export function Button({
  variant = "secondary",
  className = "",
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-1 ${variantClasses[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

