"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { addComment } from "@/app/app/actions/comments/add-comment";
import { Lightbulb, MessageSquare, HelpCircle } from "lucide-react";

const COMMENT_TYPES = [
  { value: "GENERAL", label: "Komentarz", icon: MessageSquare },
  { value: "SUGGESTION", label: "Sugestia", icon: Lightbulb },
  { value: "QUESTION", label: "Pytanie", icon: HelpCircle },
] as const;

interface CommentFormProps {
  // Dla głównego formularza (BikeCommentSection kontroluje submit)
  onSubmit?: (
    content: string,
    type: "GENERAL" | "SUGGESTION" | "QUESTION"
  ) => Promise<{ success: boolean; error?: string }>;
  // Dla odpowiedzi (CommentCard — submit wewnętrzny)
  bikeId?: string;
  parentId?: string;
  onCommentAdded: () => void;
  onCancel?: () => void;
  compact?: boolean;
}

export function CommentForm({
  onSubmit,
  bikeId,
  parentId,
  onCommentAdded,
  onCancel,
  compact = false,
}: CommentFormProps) {
  const [content, setContent] = useState("");
  const [type, setType] = useState<"GENERAL" | "SUGGESTION" | "QUESTION">("GENERAL");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!content.trim()) return;

    setIsSubmitting(true);
    setError(null);

    let result: { success: boolean; error?: string };

    if (onSubmit) {
      // Główny formularz — rodzic zarządza transition + useOptimistic
      result = await onSubmit(content.trim(), type);
    } else {
      // Formularz odpowiedzi — bezpośredni call
      result = await addComment({
        bikeId: bikeId!,
        content: content.trim(),
        type,
        parentId,
      });
    }

    setIsSubmitting(false);

    if (result.success) {
      setContent("");
      setType("GENERAL");
      onCommentAdded();
    } else {
      setError(result.error ?? "Wystąpił błąd");
    }
  };

  return (
    <div className={`space-y-3 ${compact ? "" : "pb-4 border-b"}`}>
      {/* Selektor typu (tylko dla komentarzy głównych) */}
      {!parentId && (
        <div className="flex gap-2">
          {COMMENT_TYPES.map((t) => {
            const Icon = t.icon;
            return (
              <button
                key={t.value}
                onClick={() => setType(t.value)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                  type === t.value
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                }`}
              >
                <Icon className="h-3 w-3" />
                {t.label}
              </button>
            );
          })}
        </div>
      )}

      <Textarea
        placeholder={
          parentId
            ? "Napisz odpowiedź..."
            : type === "SUGGESTION"
            ? "Zaproponuj ulepszenie..."
            : type === "QUESTION"
            ? "Zadaj pytanie..."
            : "Napisz komentarz..."
        }
        value={content}
        onChange={(e) => setContent(e.target.value)}
        rows={compact ? 2 : 3}
        maxLength={2000}
        disabled={isSubmitting}
      />

      {error && <p className="text-sm text-destructive">{error}</p>}

      <div className="flex items-center justify-between">
        <span className="text-xs text-muted-foreground">{content.length}/2000</span>
        <div className="flex gap-2">
          {onCancel && (
            <Button variant="ghost" size="sm" onClick={onCancel} disabled={isSubmitting}>
              Anuluj
            </Button>
          )}
          <Button
            size="sm"
            onClick={handleSubmit}
            disabled={!content.trim() || isSubmitting}
          >
            {isSubmitting ? "Wysyłanie..." : parentId ? "Odpowiedz" : "Dodaj"}
          </Button>
        </div>
      </div>
    </div>
  );
}
