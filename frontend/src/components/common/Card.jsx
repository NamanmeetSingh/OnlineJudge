import clsx from "clsx";

export function Card({ children, className, ...props }) {
  return (
    <div
      className={clsx(
        "bg-white shadow-lg rounded-lg border border-gray-200 p-6",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
