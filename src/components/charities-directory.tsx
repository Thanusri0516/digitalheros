import Link from "next/link";
import { PaginationBar } from "@/components/pagination-bar";
import { bentoCard, bentoCardTitle } from "@/lib/glass-styles";

export type CharityListItem = {
  id: string;
  name: string;
  description: string;
  events: string | null;
  featured: boolean;
};

type Props = {
  charities: CharityListItem[];
  page: number;
  totalPages: number;
  q: string;
  featuredOnly: boolean;
  urlSearchParams: Record<string, string | string[] | undefined>;
};

/** Charity listing: server-side filters + pagination via GET */
export function CharitiesDirectory({ charities, page, totalPages: tp, q, featuredOnly, urlSearchParams }: Props) {
  return (
    <div className="mt-8 space-y-6">
      <form method="GET" action="/charities" className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end">
        <div className="min-w-[min(100%,280px)] flex-1">
          <label htmlFor="charity-search" className="mb-1.5 block text-xs text-brand-offwhite/45">
            Search
          </label>
          <input
            id="charity-search"
            name="q"
            type="search"
            defaultValue={q}
            placeholder="Name, description, events…"
            className="w-full rounded-xl border border-white/[0.1] bg-white/[0.04] px-3 py-2.5 text-sm text-brand-offwhite placeholder:text-brand-offwhite/35"
          />
        </div>
        <label className="flex cursor-pointer items-center gap-2 text-sm text-brand-offwhite/75">
          <input
            type="checkbox"
            name="featured"
            value="1"
            defaultChecked={featuredOnly}
            className="rounded border-white/20"
          />
          Featured only
        </label>
        <button
          type="submit"
          className="rounded-lg border border-white/[0.12] bg-white/[0.06] px-4 py-2.5 text-sm font-medium text-zinc-200 hover:bg-white/[0.09]"
        >
          Apply
        </button>
      </form>

      <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {charities.map((c) => (
          <li key={c.id} className={bentoCard}>
            {c.featured ? (
              <span className="mb-3 inline-flex rounded-md border border-white/[0.1] bg-white/[0.05] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-zinc-400">
                Featured
              </span>
            ) : null}
            <h2 className={bentoCardTitle}>{c.name}</h2>
            <p className="mt-2 text-sm leading-relaxed text-brand-offwhite/65">{c.description}</p>
            {c.events ? <p className="mt-3 text-xs text-brand-offwhite/45">{c.events}</p> : null}
            <Link
              href={`/charities/${c.id}`}
              className="mt-4 inline-flex text-sm font-medium text-zinc-400 underline-offset-4 transition-colors hover:text-zinc-100"
            >
              View profile →
            </Link>
          </li>
        ))}
      </ul>

      {!charities.length ? (
        <p className="text-sm text-brand-offwhite/50">No charities match your filters.</p>
      ) : null}

      <PaginationBar
        pathname="/charities"
        searchParams={urlSearchParams}
        paramName="page"
        page={page}
        totalPages={tp}
      />
    </div>
  );
}
