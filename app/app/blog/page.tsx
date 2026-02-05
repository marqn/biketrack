import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Newspaper } from "lucide-react";

interface BlogPost {
  id: string;
  version: string;
  date: string;
  title: string;
  content: React.ReactNode;
  tags: string[];
}

const posts: BlogPost[] = [
  {
    id: "1",
    version: "1.0.1",
    date: "2026-02-05",
    title: "Pierwsze aktualności — co nowego i co planujemy",
    tags: ["nowości", "plany"],
    content: (
      <>
        <p>
          Cześć! Witaj w sekcji aktualności. Tutaj będę informować Cię o
          wszystkich zmianach w serwisie, nowych funkcjach i planach na
          przyszłość.
        </p>
        <p>
          <strong>Co nowego w ver. 1.0.1:</strong>
        </p>
        <ul className="list-disc pl-5 space-y-1">
          <li>Dodano sekcję <strong>Aktualności</strong> — właśnie ją czytasz!</li>
          <li>Dodano system importu rowerów i części</li>
          <li>Dodano obsługę rowerów elektrycznych (e-bike)</li>
          <li>Dodano akcesoria które można zdjąć z roweru</li>
          <li>Poprawiono błąd zapisu dodatkowych części</li>
        </ul>
        <p>
          <strong>Plany na najbliższy czas:</strong>
        </p>
        <ul className="list-disc pl-5 space-y-1">
          <li>Rozbudowa katalogu produktów i recenzji</li>
          <li>Powiadomienia o zbliżających się wymianach części</li>
          <li>Statystyki i wykresy przebiegu roweru</li>
          <li>Obsługa wielu rowerów na jednym koncie</li>
        </ul>
        <p>
          Jeśli masz pomysły lub uwagi — daj znać! Serwis rozwija się dzięki
          Waszym sugestiom.
        </p>
      </>
    ),
  },
];

export default function BlogPage() {
  return (
    <div className="space-y-6 lg:px-24">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-primary rounded-full mb-4">
          <Newspaper className="w-8 h-8 text-primary-foreground" />
        </div>
        <h1 className="text-3xl font-bold mb-2">Aktualności</h1>
        <p className="text-muted-foreground">
          Co nowego w serwisie i dokąd zmierzamy
        </p>
      </div>

      <Accordion type="single" collapsible defaultValue="1">
        {posts.map((post) => (
          <AccordionItem key={post.id} value={post.id}>
            <AccordionTrigger className="text-base px-2">
              <div className="flex flex-col items-start gap-1 mr-4">
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge variant="outline">{post.version}</Badge>
                  <span className="font-semibold">{post.title}</span>
                </div>
                <span className="text-xs text-muted-foreground">
                  {new Date(post.date).toLocaleDateString("pl-PL", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-2 text-sm leading-relaxed">
              {post.content}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
}
