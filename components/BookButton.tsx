import Link from "next/link";

type BookButtonProps = {
  className?: string;
  children?: React.ReactNode;
  href?: string;
};

// Stor, tydelig sort CTA-knap der bruges flere steder på siden
export default function BookButton({ className = "", children, href = "/book" }: BookButtonProps) {
  return (
    <Link
      href={href}
      className={`inline-flex items-center justify-center gap-3 rounded-full bg-ink px-8 py-4 text-[12px] font-semibold uppercase tracking-[0.22em] text-white shadow-sm transition-all hover:bg-accent-dark active:scale-[0.98] ${className}`}
    >
      {children ?? "Book your appointment"}
    </Link>
  );
}
