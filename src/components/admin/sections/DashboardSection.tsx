import { useQuery } from "@tanstack/react-query";
import { adminAction } from "@/lib/admin.functions";
import { LayoutDashboard, Megaphone, Video } from "lucide-react";

interface DashboardSectionProps {
  password?: string;
}

export default function DashboardSection({ password }: DashboardSectionProps) {
  const { data: metrics, isLoading } = useQuery({
    queryKey: ["admin-metrics", password],
    queryFn: async () => {
      const result = await adminAction({
        data: {
          password: password || "",
          payload: { action: "get-metrics" }
        }
      });
      return result.data;
    },
    enabled: !!password,
  });

  const cards = [
    { label: "Ferramentas Ativas", value: metrics?.totalTools ?? 0, icon: LayoutDashboard, color: "text-blue-500" },
    { label: "Avisos Ativos", value: metrics?.activeAnnouncements ?? 0, icon: Megaphone, color: "text-orange-500" },
    { label: "Vídeos em Fila", value: metrics?.pendingVideoJobs ?? 0, icon: Video, color: "text-purple-500" },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        <p className="text-muted-foreground">Visão geral do SOS01.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {cards.map((card) => (
          <div key={card.label} className="bg-card border border-border rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <card.icon className={card.color} size={24} />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">{card.label}</p>
              <p className="text-3xl font-bold">
                {isLoading ? "..." : card.value}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
