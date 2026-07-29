import Link from "next/link";

type BookButtonProps = {
  className?: string;
  children?: React.ReactNode;
};

// Stor, tydelig CTA-knap der bruges flere steder på siden (forside, galleri osv.)
export default function BookButton({ className = "", children }: BookButtonProps) {
  return (
    <Link
      href="/book"
      className={`inline-flex items-center justify-center rounded-full bg-accent px-8 py-4 text-lg font-medium text-white shadow-sm transition-colors hover:bg-accent-dark ${className}`}
    >
      {children ?? "Book tid"}
    </Link>
  );
}
