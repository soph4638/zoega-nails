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
                  className={`inline-flex items-center justify-center rounded-sm bg-accent px-9 py-4 text-xs font-medium uppercase tracking-[0.2em] text-white shadow-sm transition-colors hover:bg-accent-dark ${className}`}
    >
            {children ?? "Book tid"}
          </Link>
  );
}
