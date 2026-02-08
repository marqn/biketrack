"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Flag, Eye, EyeOff, X } from "lucide-react";
import { getReports, resolveReport, getReportStats } from "../_actions/moderation";

const REASON_LABELS: Record<string, string> = {
  SPAM: "Spam",
  OFFENSIVE: "Obraźliwy",
  IRRELEVANT: "Nieistotny",
  OTHER: "Inny",
};

type Report = Awaited<ReturnType<typeof getReports>>["reports"][number];

export default function ModerationPage() {
  const [activeTab, setActiveTab] = useState("PENDING");
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<{ pending: number; reviewed: number; dismissed: number } | null>(null);

  const loadReports = async (status: string) => {
    setLoading(true);
    const result = await getReports({ status });
    if (result.success) {
      setReports(result.reports);
    }
    setLoading(false);
  };

  const loadStats = async () => {
    const s = await getReportStats();
    setStats(s);
  };

  useEffect(() => {
    loadReports(activeTab);
    loadStats();
  }, [activeTab]);

  const handleResolve = async (reportId: string, action: "hide" | "dismiss") => {
    const result = await resolveReport(reportId, action);
    if (result.success) {
      loadReports(activeTab);
      loadStats();
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Moderacja komentarzy</h1>
        <p className="text-muted-foreground mt-1">
          Zarządzaj zgłoszeniami komentarzy
        </p>
      </div>

      {/* Statystyki */}
      {stats && (
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-card rounded-lg border p-4 text-center">
            <p className="text-2xl font-bold text-yellow-500">{stats.pending}</p>
            <p className="text-sm text-muted-foreground">Oczekujące</p>
          </div>
          <div className="bg-card rounded-lg border p-4 text-center">
            <p className="text-2xl font-bold text-green-500">{stats.reviewed}</p>
            <p className="text-sm text-muted-foreground">Rozpatrzone</p>
          </div>
          <div className="bg-card rounded-lg border p-4 text-center">
            <p className="text-2xl font-bold text-muted-foreground">{stats.dismissed}</p>
            <p className="text-sm text-muted-foreground">Odrzucone</p>
          </div>
        </div>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="PENDING">
            Oczekujące {stats?.pending ? `(${stats.pending})` : ""}
          </TabsTrigger>
          <TabsTrigger value="REVIEWED">Rozpatrzone</TabsTrigger>
          <TabsTrigger value="DISMISSED">Odrzucone</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-4">
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">
              Ładowanie...
            </div>
          ) : reports.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Brak zgłoszeń
            </div>
          ) : (
            <div className="space-y-4">
              {reports.map((report) => (
                <div
                  key={report.id}
                  className="bg-card rounded-lg border p-4"
                >
                  {/* Nagłówek zgłoszenia */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Flag className="h-4 w-4 text-destructive" />
                      <Badge variant="outline">
                        {REASON_LABELS[report.reason] || report.reason}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {new Date(report.createdAt).toLocaleDateString("pl-PL")}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>Zgłosił:</span>
                      <Avatar className="h-5 w-5">
                        <AvatarImage src={report.user.image ?? undefined} />
                        <AvatarFallback className="text-[10px]">
                          {report.user.name?.charAt(0) ?? "?"}
                        </AvatarFallback>
                      </Avatar>
                      <span>{report.user.name}</span>
                    </div>
                  </div>

                  {report.details && (
                    <p className="text-sm text-muted-foreground mb-3 italic">
                      &quot;{report.details}&quot;
                    </p>
                  )}

                  {/* Treść komentarza */}
                  <div className="bg-muted/50 rounded-lg p-3 mb-3">
                    <div className="flex items-center gap-2 mb-1">
                      <Avatar className="h-6 w-6">
                        <AvatarImage src={report.comment.user.image ?? undefined} />
                        <AvatarFallback className="text-xs">
                          {report.comment.user.name?.charAt(0) ?? "?"}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm font-medium">
                        {report.comment.user.name}
                      </span>
                      {report.comment.bike && (
                        <span className="text-xs text-muted-foreground">
                          na rowerze{" "}
                          {report.comment.bike.brand} {report.comment.bike.model}
                        </span>
                      )}
                    </div>
                    <p className="text-sm whitespace-pre-wrap">
                      {report.comment.content}
                    </p>
                  </div>

                  {/* Akcje */}
                  {activeTab === "PENDING" && (
                    <div className="flex gap-2">
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleResolve(report.id, "hide")}
                      >
                        <EyeOff className="h-3 w-3 mr-1" />
                        Ukryj komentarz
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleResolve(report.id, "dismiss")}
                      >
                        <X className="h-3 w-3 mr-1" />
                        Odrzuć zgłoszenie
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
