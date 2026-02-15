import { notFound } from "next/navigation";
import { getUser, getUserBikes, getUserComments } from "../../_actions/users";
import { UserDetailTabs } from "./UserDetailTabs";

export default async function UserDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [user, bikes, comments] = await Promise.all([
    getUser(id),
    getUserBikes(id),
    getUserComments(id),
  ]);

  if (!user) {
    notFound();
  }

  return (
    <div className="max-w-4xl space-y-6">
      <UserDetailTabs user={user} bikes={bikes} comments={comments} />
    </div>
  );
}
