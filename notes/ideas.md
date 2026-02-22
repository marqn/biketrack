# Pomysły

    -   miniaturka roweru jak dodane zdjęcie
    -


# Fixy:
    -   
    - 

*** -   PLAN    -   ***

    ✅      Domena mbike.cc
    -       terms and conditions
    -       cloudflare
    -       paddle
    

Problemy techniczne warte naprawy
Obrazy w base64 w bazie danych — to największy problem skalowalności. Przy większej liczbie użytkowników baza mocno spuchnie. Zamiana na Cloudflare R2 (masz już Cloudflare w planie) to oczywisty krok.

Brak error trackingu — Sentry lub podobne. Nie wiesz co się sypie u użytkowników w produkcji.

Brak analityki — Plausible lub Fathom (privacy-friendly, GDPR-ok, bez cookie bannera) zamiast Google Analytics.

UX / UI trendy w 2025-26
View Transitions API — płynne animacje między stronami, Next.js ma eksperymentalne wsparcie. Robi ogromne wrażenie na użytkownikach.

Skeleton loading zamiast spinnerów — bardziej profesjonalny feel, mniejszy layout shift.

Optimistic UI (useOptimistic hook w React 19) — akcje jak dodanie komentarza, polubienie natychmiast reagują, bez czekania na server.

PWA — install prompt, offline strona, push notifications dla przypomnień serwisowych.

Funkcje produktowe
Przypomnienia serwisowe — użytkownik ustawia interwały (np. co 500 km wymień łańcuch), aplikacja wysyła email/powiadomienie. Naturalny fit dla aplikacji rowerowej.

Licznik przebiegu — ręczne logowanie km lub import z Strava API (już masz Strava OAuth). Zbiera dane do przypomnień serwisowych.

Historia serwisowa — timeline napraw i wymian części, eksport do PDF.

Marketplace części — użytkownicy mogą wystawiać używane części na sprzedaż (synergiczne z obecnym systemem parts).

Monetyzacja (masz Paddle w planie)
Naturalny model freemium:

Free: 1-2 rowery, podstawowe funkcje
Premium: nielimitowane rowery, historia serwisowa, przypomnienia, eksport PDF, statystyki
Nowoczesne trendy SPA warte uwagi
Trend	Ocena dla tego projektu
Partial Prerendering (Next.js PPR)	Warto gdy wyjdzie stable — szybszy LCP
React Compiler	Automatyczna memoizacja, zero useMemo/useCallback
Server Actions	Już używasz — dobra droga
AI features	Sugestie serwisowe na podstawie przebiegu — prosty prompt do Claude API
Real-time (WebSockets/SSE)	Feed aktywności, live notyfikacje
Edge Runtime	Cloudflare Workers + R2 — minimalne latency globalne
Moje top 3 priorytety
Cloudflare R2 zamiast base64 (technicznie krytyczne)
Przypomnienia serwisowe (największa wartość dla użytkownika)
Plausible Analytics (potrzebujesz danych do decyzji produktowych)
Które z tych obszarów Cię najbardziej interesują? Mogę zaplanować implementację konkretnego feature'a.