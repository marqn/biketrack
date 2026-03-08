import { Suspense } from "react";
import { VerifyEmailContent } from "./_components/VerifyEmailContent";

export default function VerifyEmailPage() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <Suspense fallback={<p className="text-muted-foreground">Ładowanie...</p>}>
        <VerifyEmailContent />
      </Suspense>
    </div>
  );
}
