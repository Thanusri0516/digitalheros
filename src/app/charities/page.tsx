import Link from "next/link";
import { CharitiesDirectory } from "@/components/charities-directory";
import { PageGlassBackdrop } from "@/components/page-glass-backdrop";
import { StickyJumpNav, type StickyJumpItem } from "@/components/sticky-jump-nav";
import { eyebrow, sectionSubtitle } from "@/lib/glass-styles";
import { cn } from "@/lib/cn";
import { prisma } from "@/lib/prisma";
import { PAGE_SIZE, clampPage, parsePositiveInt, totalPages } from "@/lib/pagination";

const CHARITIES_JUMP: StickyJumpItem[] = [
  { href: "/", label: "Home" },
  { href: "/#platform-concept", label: "Platform" },
  { href: "/signup", label: "Subscribe" },
];

type Search = Promise<Record<string, string | string[] | undefined>>;

export default async function CharitiesPage({ searchParams }: { searchParams?: Search }) {
  const sp = searchParams ? await searchParams : {};
  const q = typeof sp.q === "string" ? sp.q.trim() : "";
  const featuredOnly = sp.featured === "1" || sp.featured === "on" || sp.featured === "true";

  const filterParts: object[] = [];
  if (q) {
    filterParts.push({
      OR: [
        { name: { contains: q, mode: "insensitive" as const } },
        { description: { contains: q, mode: "insensitive" as const } },
        { events: { contains: q, mode: "insensitive" as const } },
      ],
    });
  }
  if (featuredOnly) filterParts.push({ featured: true as const });
  const where = filterParts.length ? { AND: filterParts } : {};

  const [dbTotal, total] = await prisma.$transaction([
    prisma.charity.count(),
    prisma.charity.count({ where }),
  ]);
  const tp = totalPages(total, PAGE_SIZE);
  const page = clampPage(parsePositiveInt(sp.page), tp);

  const charities = await prisma.charity.findMany({
    where,
    orderBy: [{ featured: "desc" }, { name: "asc" }],
    skip: (page - 1) * PAGE_SIZE,
    take: PAGE_SIZE,
    select: { id: true, name: true, description: true, events: true, featured: true },
  });

  return (
    <main className="relative mx-auto w-full max-w-7xl flex-1 px-5 py-10 md:px-8">
      <PageGlassBackdrop />
      <div className="relative z-[1]">
        <StickyJumpNav ariaLabel="Site navigation" items={CHARITIES_JUMP} />
        <p className={eyebrow}>Explore</p>
        <h1 className="font-heading mt-3 text-3xl font-medium tracking-[-0.03em] text-zinc-50 md:text-[2.25rem]">
          Partner charities
        </h1>
        <p className={cn(sectionSubtitle, "max-w-2xl")}>
          Subscribers choose where a portion of every payment goes. Browse organizations available for selection after
          you join.
        </p>

        {dbTotal === 0 ? (
          <p className="mt-8 text-sm text-brand-offwhite/50">Charity listings will appear here once published.</p>
        ) : (
          <CharitiesDirectory
            charities={charities}
            page={page}
            totalPages={tp}
            q={q}
            featuredOnly={featuredOnly}
            urlSearchParams={sp}
          />
        )}

        <p className="mt-12 text-center text-sm text-brand-offwhite/45">
          Ready to subscribe?{" "}
          <Link href="/signup" className="font-semibold text-sky-300/95 hover:text-sky-200 hover:underline">
            Create an account
          </Link>
        </p>
      </div>
    </main>
  );
}
