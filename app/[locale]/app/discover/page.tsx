import { DiscoverClient } from "./DiscoverClient";

export default function DiscoverPage() {
  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Odkrywaj</h1>
          <p className="text-muted-foreground mt-2">
            Przeglądaj rowery innych użytkowników i dziel się opiniami
          </p>
        </div>
        <DiscoverClient />
      </div>
    </div>
  );
}
