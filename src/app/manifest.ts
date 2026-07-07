import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Confession Wall",
    short_name: "Confession Wall",
    description: "A safe space for anonymous confessions",
    start_url: "/",
    display: "standalone",
    background_color: "#0f0f13",
    theme_color: "#6366f1",
    icons: [
      {
        src: "/icon-192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/icon-192.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  };
}
