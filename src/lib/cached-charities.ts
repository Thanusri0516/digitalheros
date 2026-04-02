import { unstable_cache } from "next/cache";
import { prisma } from "@/lib/prisma";

/** Homepage spotlight; invalidated when admins change charities via `revalidateTag("charities")`. */
export const getHomeFeaturedCharities = unstable_cache(
  async () => {
    try {
      return await prisma.charity.findMany({
        where: { featured: true },
        orderBy: { name: "asc" },
        take: 4,
      });
    } catch (e) {
      console.error("[featured-charities] DB query failed:", e);
      return [];
    }
  },
  ["home-featured-charities"],
  { revalidate: 90, tags: ["charities"] },
);
