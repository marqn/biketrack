import { DiscoverClient } from "./DiscoverClient";

export default function DiscoverPage() {
  return (
    <div className="container mx-auto px-4 py-8 pt-4">
      <div className="space-y-6 lg:px-24">
        <div className="text-center">
          <h1 className="text-3xl font-bold">Odkrywaj</h1>
          <p className="text-muted-foreground mt-1">
            Przeglądaj rowery innych użytkowników i dziel się opiniami
          </p>
        </div>
        <DiscoverClient />
      </div>
    </div>
  );
}
