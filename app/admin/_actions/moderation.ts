"use server";

import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { ReportStatus } from "@/lib/generated/prisma";

export async function getReports({
  status = "PENDING",
  page = 1,
  pageSize = 20,
}: {
  status?: string;
  page?: number;
  pageSize?: number;
}) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return { success: false, reports: [], totalCount: 0, totalPages: 0 };
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true },
  });

  if (user?.role !== "ADMIN") {
    return { success: false, reports: [], totalCount: 0, totalPages: 0 };
  }

  const skip = (page - 1) * pageSize;

  const where = { status: status as ReportStatus };

  const [reports, totalCount] = await Promise.all([
    prisma.commentReport.findMany({
      where,
      include: {
        comment: {
          include: {
            user: { select: { name: true, image: true } },
            bike: { select: { brand: true, model: true, slug: true } },
          },
        },
        user: { select: { name: true, image: true } },
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: pageSize,
    }),
    prisma.commentReport.count({ where }),
  ]);

  const serialized = reports.map((r) => ({
    ...r,
    createdAt: r.createdAt.toISOString(),
    comment: {
      ...r.comment,
      createdAt: r.comment.createdAt.toISOString(),
      updatedAt: r.comment.updatedAt.toISOString(),
    },
  }));

  return {
    success: true,
    reports: serialized,
    totalCount,
    totalPages: Math.ceil(totalCount / pageSize),
  };
}

export async function resolveReport(
  reportId: string,
  action: "hide" | "dismiss"
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return { success: false, error: "Nie jesteś zalogowany" };
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true },
  });

  if (user?.role !== "ADMIN") {
    return { success: false, error: "Brak uprawnień" };
  }

  const report = await prisma.commentReport.findUnique({
    where: { id: reportId },
    select: { commentId: true },
  });

  if (!report) {
    return { success: false, error: "Zgłoszenie nie zostało znalezione" };
  }

  if (action === "hide") {
    await prisma.$transaction([
      prisma.bikeComment.update({
        where: { id: report.commentId },
        data: { isHidden: true },
      }),
      prisma.commentReport.updateMany({
        where: { commentId: report.commentId },
        data: { status: "REVIEWED" },
      }),
    ]);
  } else {
    await prisma.commentReport.update({
      where: { id: reportId },
      data: { status: "DISMISSED" },
    });
  }

  return { success: true };
}

export async function getReportStats() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return null;

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true },
  });

  if (user?.role !== "ADMIN") return null;

  const [pending, reviewed, dismissed] = await Promise.all([
    prisma.commentReport.count({ where: { status: "PENDING" } }),
    prisma.commentReport.count({ where: { status: "REVIEWED" } }),
    prisma.commentReport.count({ where: { status: "DISMISSED" } }),
  ]);

  return { pending, reviewed, dismissed };
}
