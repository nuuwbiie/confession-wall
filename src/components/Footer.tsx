import Link from "next/link";

export default function Footer() {
  return (
    <footer className="w-full py-12 bg-surface border-t border-outline-variant/30 mt-12">
      <div className="flex flex-col items-center gap-4 max-w-container-max-width mx-auto px-margin-mobile md:px-margin-desktop">
        <span className="font-headline-md text-headline-md text-primary">
          Confession Wall
        </span>
        <div className="flex gap-6">
          <Link
            href="#"
            className="text-on-surface-variant hover:text-primary transition-colors font-label-sm text-label-sm"
          >
            Privacy
          </Link>
          <Link
            href="#"
            className="text-on-surface-variant hover:text-primary transition-colors font-label-sm text-label-sm"
          >
            Terms
          </Link>
          <Link
            href="#"
            className="text-on-surface-variant hover:text-primary transition-colors font-label-sm text-label-sm"
          >
            Support
          </Link>
        </div>
        <p className="text-secondary font-body-md text-body-md opacity-80 mt-2">
          © {new Date().getFullYear()} Confession Wall - A digital exhale for your
          emotions.
        </p>
      </div>
    </footer>
  );
}