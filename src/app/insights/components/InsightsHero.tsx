export default function InsightsHero({ totalRows }: { totalRows?: number }) {
  return (
    <div className="mb-12">
        <h1 className="text-5xl font-black mb-4">ADHD <span className="text-[#a855f7]">Insights</span></h1>
        <p className="text-xl text-[#64748b] max-w-2xl leading-relaxed">
            Explore anonymized patterns and correlations from a research dataset containing {totalRows != null ? totalRows.toLocaleString() : "-"} entries.
        </p>
    </div>
  );
}
