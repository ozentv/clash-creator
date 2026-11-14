export default function ClanSkeleton() {
  return (
    <div role="status" aria-label="Chargement du clan" className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-8">
      <div className="skeleton h-36 w-full rounded-2xl" />
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="skeleton h-28 rounded-2xl" />
        ))}
      </div>
      <div className="skeleton h-10 w-2/3" />
      <div className="skeleton h-96 w-full rounded-2xl" />
    </div>
  );
}
