import { unstable_cache } from "next/cache";
import { prisma } from "@/lib/prisma";

/** Homepage spotlight; invalidated when admins change charities via `revalidateTag("charities")`. */
export const getHomeFeaturedCharities = unstable_cache(
  () =>
    prisma.charity.findMany({
      where: { featured: true },
      orderBy: { name: "asc" },
      take: 4,
    }),
  ["home-featured-charities"],
  { revalidate: 90, tags: ["charities"] },
);
