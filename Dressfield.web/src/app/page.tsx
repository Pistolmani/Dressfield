export default function HomePage() {
  return (
    <main className="flex-1 flex items-center justify-center">
      <div className="text-center space-y-6 px-4">
        <h1 className="text-4xl font-bold font-[family-name:var(--font-inter)] tracking-tight">
          <span className="text-accent">●</span>DRESS
          <span className="font-normal">Field</span>
        </h1>
        <p className="text-lg text-muted-foreground font-[family-name:var(--font-georgian)] max-w-md mx-auto">
          ქართული ნაქარგების ონლაინ მაღაზია
        </p>
        <button className="bg-accent text-accent-foreground px-8 py-3 rounded-lg font-medium hover:bg-accent-hover transition-colors">
          პროდუქციის ნახვა
        </button>
      </div>
    </main>
  );
}
