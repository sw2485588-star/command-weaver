import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { COMMANDS, CATEGORIES, OS_TAGS, TAG_LIST, PARAM_KEYS, type Command } from "@/lib/commands";
import { Check, Copy, Search, Terminal } from "lucide-react";

export const Route = createFileRoute("/")({
  component: Index,
  head: () => ({
    meta: [
      { title: "BlueMatrix — Command Library" },
      { name: "description", content: "Autofill command library and template arsenal for offensive security operators." },
      { property: "og:title", content: "BlueMatrix — Command Library" },
      { property: "og:description", content: "Autofill command library and template arsenal for offensive security operators." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
});

function fillTemplate(tpl: string, params: Record<string, string>) {
  return tpl.replace(/\{\{(\w+)\}\}/g, (_, k) => {
    const v = params[k];
    return v && v.length > 0 ? v : `{{${k}}}`;
  });
}

function CommandCard({ cmd, params }: { cmd: Command; params: Record<string, string> }) {
  const [copied, setCopied] = useState(false);
  const filled = fillTemplate(cmd.template, params);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(filled);
      setCopied(true);
      setTimeout(() => setCopied(false), 1400);
    } catch {}
  };

  return (
    <div className="panel rounded-lg p-4 transition-all hover:border-primary/60 hover:shadow-[0_0_30px_-12px_oklch(0.65_0.22_255/0.6)]">
      <div className="mb-2 flex flex-wrap items-center gap-2">
        <Terminal className="h-3.5 w-3.5 text-primary" />
        <h3 className="text-sm font-semibold text-foreground glow-text">{cmd.title}</h3>
        <div className="ml-auto flex flex-wrap gap-1">
          {cmd.categories.map((c) => (
            <span key={c} className="rounded border border-primary/30 bg-primary/10 px-1.5 py-0.5 text-[10px] uppercase tracking-wider text-primary">
              {c}
            </span>
          ))}
        </div>
      </div>

      <button
        onClick={copy}
        title="Click to copy"
        className="group relative flex w-full items-start gap-3 rounded-md border border-border/80 bg-black/50 p-3 text-left transition-colors hover:border-primary/70 hover:bg-black/70"
      >
        <code className="flex-1 whitespace-pre-wrap break-all font-mono text-[13px] leading-relaxed text-primary/90">
          <span className="mr-2 select-none text-muted-foreground">$</span>
          {filled.split(/(\{\{\w+\}\})/g).map((part, i) =>
            /^\{\{\w+\}\}$/.test(part) ? (
              <span key={i} className="rounded bg-destructive/20 px-1 text-destructive-foreground/90 outline outline-1 outline-destructive/40">
                {part}
              </span>
            ) : (
              <span key={i}>{part}</span>
            )
          )}
        </code>
        <span className="flex-shrink-0 rounded-md border border-primary/40 bg-primary/10 p-2 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
          {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
        </span>
      </button>

      <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{cmd.description}</p>
    </div>
  );
}

function FilterChip({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={
        "rounded-md border px-2.5 py-1 text-xs transition-all " +
        (active
          ? "border-primary bg-primary/20 text-primary shadow-[0_0_12px_-2px_oklch(0.65_0.22_255/0.7)]"
          : "border-border bg-black/30 text-muted-foreground hover:border-primary/50 hover:text-foreground")
      }
    >
      {label}
    </button>
  );
}

function Index() {
  const [params, setParams] = useState<Record<string, string>>({});
  const [search, setSearch] = useState("");
  const [activeCats, setActiveCats] = useState<Set<string>>(new Set());
  const [activeOs, setActiveOs] = useState<Set<string>>(new Set());
  const [activeTags, setActiveTags] = useState<Set<string>>(new Set());

  const toggle = (set: Set<string>, updater: (s: Set<string>) => void, v: string) => {
    const next = new Set(set);
    if (next.has(v)) next.delete(v);
    else next.add(v);
    updater(next);
  };

  const filtered = useMemo(() => {
    return COMMANDS.filter((c) => {
      if (activeCats.size && !c.categories.some((x) => activeCats.has(x))) return false;
      if (activeOs.size && !c.os.some((x) => activeOs.has(x))) return false;
      if (activeTags.size && !c.tags.some((x) => activeTags.has(x))) return false;
      if (search) {
        const q = search.toLowerCase();
        const hay = (c.title + " " + c.template + " " + c.description).toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [params, search, activeCats, activeOs, activeTags]);

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="border-b border-border/60 bg-black/40 backdrop-blur-md">
        <div className="mx-auto flex max-w-[1600px] items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="grid h-9 w-9 place-items-center rounded-md border border-primary/50 bg-primary/10 text-primary shadow-[0_0_20px_-4px_oklch(0.65_0.22_255/0.8)]">
              <Terminal className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-wider text-foreground glow-text">BLUE//MATRIX</h1>
              <p className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground">Command Arsenal</p>
            </div>
          </div>
          <div className="hidden items-center gap-4 text-[11px] uppercase tracking-widest text-muted-foreground md:flex">
            <span>{COMMANDS.length} templates loaded</span>
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary shadow-[0_0_8px_oklch(0.65_0.22_255)]" />
            <span className="text-primary">online</span>
          </div>
        </div>

        {/* Params bar */}
        <div className="border-t border-border/40 bg-black/30">
          <div className="mx-auto max-w-[1600px] px-6 py-3">
            <div className="mb-2 flex items-center gap-2 text-[10px] uppercase tracking-[0.25em] text-primary/80">
              <span>&gt;</span>
              <span>Parameters — autofill across all commands</span>
            </div>
            <div className="grid grid-cols-2 gap-2 md:grid-cols-3 lg:grid-cols-5 xl:grid-cols-9">
              {PARAM_KEYS.map((k) => (
                <label key={k} className="group flex flex-col gap-1">
                  <span className="text-[9px] font-semibold uppercase tracking-widest text-muted-foreground group-focus-within:text-primary">
                    {k}
                  </span>
                  <input
                    value={params[k] ?? ""}
                    onChange={(e) => setParams({ ...params, [k]: e.target.value })}
                    placeholder={placeholderFor(k)}
                    className="rounded border border-border bg-black/60 px-2 py-1.5 font-mono text-xs text-primary placeholder:text-muted-foreground/50 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/60"
                  />
                </label>
              ))}
            </div>
          </div>
        </div>
      </header>

      {/* Body */}
      <main className="mx-auto grid max-w-[1600px] grid-cols-1 gap-6 px-6 py-6 lg:grid-cols-3">
        {/* Filters */}
        <aside className="panel h-fit rounded-lg p-4 lg:sticky lg:top-6">
          <div className="mb-4">
            <div className="mb-2 flex items-center gap-2 text-[10px] uppercase tracking-[0.25em] text-primary/80">
              <Search className="h-3 w-3" />
              <span>Search</span>
            </div>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="filter commands..."
              className="w-full rounded border border-border bg-black/60 px-3 py-2 font-mono text-xs text-foreground placeholder:text-muted-foreground/50 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/60"
            />
          </div>

          <FilterGroup title="Category">
            {CATEGORIES.map((c) => (
              <FilterChip key={c} label={c} active={activeCats.has(c)} onClick={() => toggle(activeCats, setActiveCats, c)} />
            ))}
          </FilterGroup>

          <FilterGroup title="Platform">
            {OS_TAGS.map((o) => (
              <FilterChip key={o} label={o} active={activeOs.has(o)} onClick={() => toggle(activeOs, setActiveOs, o)} />
            ))}
          </FilterGroup>

          <FilterGroup title="Tag">
            {TAG_LIST.map((t) => (
              <FilterChip key={t} label={t} active={activeTags.has(t)} onClick={() => toggle(activeTags, setActiveTags, t)} />
            ))}
          </FilterGroup>

          {(activeCats.size || activeOs.size || activeTags.size) > 0 && (
            <button
              onClick={() => {
                setActiveCats(new Set());
                setActiveOs(new Set());
                setActiveTags(new Set());
              }}
              className="mt-4 w-full rounded border border-destructive/40 bg-destructive/10 px-3 py-1.5 text-[11px] uppercase tracking-widest text-destructive-foreground/90 hover:bg-destructive/20"
            >
              Clear filters
            </button>
          )}
        </aside>

        {/* Results */}
        <section className="lg:col-span-2">
          <div className="mb-3 flex items-baseline justify-between px-1 text-[11px] uppercase tracking-[0.25em] text-muted-foreground">
            <span>Results</span>
            <span className="text-primary">{filtered.length} / {COMMANDS.length}</span>
          </div>
          <div className="max-h-[calc(100vh-260px)] space-y-3 overflow-y-auto pr-2">
            {filtered.length === 0 ? (
              <div className="panel rounded-lg p-8 text-center text-sm text-muted-foreground">
                No commands match the current filters.
              </div>
            ) : (
              filtered.map((c) => <CommandCard key={c.id} cmd={c} params={params} />)
            )}
          </div>
        </section>
      </main>
    </div>
  );
}

function FilterGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-4">
      <div className="mb-2 text-[10px] uppercase tracking-[0.25em] text-primary/80">{title}</div>
      <div className="flex flex-wrap gap-1.5">{children}</div>
    </div>
  );
}

function placeholderFor(k: string): string {
  switch (k) {
    case "TARGET_IP": return "10.10.10.1";
    case "TARGET_HOST": return "target.local";
    case "DOMAIN": return "corp.local";
    case "USERNAME": return "user";
    case "PASSWORD": return "••••••";
    case "LHOST": return "10.10.14.2";
    case "LPORT": return "4444";
    case "WORDLIST": return "/path/wordlist.txt";
    case "INTERFACE": return "tun0";
    default: return "";
  }
}
