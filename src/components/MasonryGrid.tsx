import type { ReactNode } from "react";

export default function MasonryGrid({ children }: { children: ReactNode }) {
  return <div className="masonry-grid">{children}</div>;
}