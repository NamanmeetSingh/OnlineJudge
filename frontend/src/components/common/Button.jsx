import Link from "next/link";
import clsx from "clsx";

/*
 * Modular Button component.
 * 
 * Props:
 * - children: Button text or elements
 * - href: If provided, renders as a Next.js Link
 * - onClick: Click handler (for button)
 * - variant: 'primary' | 'secondary' | 'outline' | 'danger' (default: 'primary')
 * - className: Additional Tailwind classes
 * - ...props: Other button/link props
 */

export default function Button({
  children,
  href,
  onClick,
  variant = "primary",
  className = "",
  ...props
}) {
  const base =
    "inline-flex items-center px-4 py-2 rounded transition font-medium focus:outline-none";
  const variants = {
    primary: "bg-blue-600 text-white hover:bg-blue-700",
    secondary: "bg-gray-200 text-gray-900 hover:bg-gray-300",
    outline: "border border-blue-600 text-blue-600 hover:bg-blue-50",
    danger: "bg-red-600 text-white hover:bg-red-700",
  };

  const classes = clsx(base, variants[variant], className);

  if (href) {
    return (
      <Link href={href} className={classes} {...props}>
        {children}
      </Link>
    );
  }
  return (
    <button className={classes} onClick={onClick} {...props}>
      {children}
    </button>
  );
}