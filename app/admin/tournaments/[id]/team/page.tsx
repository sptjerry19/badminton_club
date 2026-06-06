import { redirect } from "next/navigation";

export default function AdminTournamentTeamPage({
  params,
}: {
  params: { id: string };
}) {
  redirect(`/admin/tournaments/${params.id}?tab=teams`);
}
