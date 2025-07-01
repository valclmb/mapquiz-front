import { useScoreHistory } from "@/hooks/queries/useScoreHistory";

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { Area, AreaChart, XAxis } from "recharts";

const chartConfig = {
  desktop: {
    label: "Score",
    color: "var(--chart-3)",
  },
  time: {
    label: "Durée",
    color: "var(--chart-2)",
  },
} satisfies ChartConfig;

type QuizHistoryProps = {
  selectedRegions?: string[];
};

export const QuizHistory = ({ selectedRegions = [] }: QuizHistoryProps) => {
  const { data = [], isLoading } = useScoreHistory();

  // Filtrer les données en fonction des régions sélectionnées
  const filteredData =
    selectedRegions.length > 0
      ? data.filter((item) => {
          // Vérifier si les régions de l'item correspondent exactement aux régions sélectionnées
          // ou si les régions sélectionnées sont un sous-ensemble des régions de l'item
          return (
            selectedRegions.every((region) =>
              item.selectedRegions.includes(region)
            ) && item.selectedRegions.length === selectedRegions.length
          );
        })
      : data; // Si aucune région n'est sélectionnée, afficher toutes les données

  if (isLoading) {
    return <p className="text-sm text-muted-foreground">Chargement...</p>;
  }

  if (filteredData.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        Aucun historique pour cette sélection
      </p>
    );
  }

  return (
    <ChartContainer config={chartConfig} className="h-24 w-full">
      <AreaChart
        data={data}
        margin={{
          left: 15,
          right: 15,
          top: 12,
        }}
      >
        <XAxis
          dataKey="date"
          tickLine={false}
          tickMargin={8}
          axisLine={false}
          interval={0}
        />
        <ChartTooltip
          cursor={false}
          content={<ChartTooltipContent indicator="line" />}
        />
        <Area
          dataKey="score"
          name="Score"
          type="natural"
          fill="var(--color-desktop)"
          fillOpacity={0.4}
          stroke="var(--color-desktop)"
          baseValue={0}
        />
        {/* Ajout d'une nouvelle Area pour le temps */}
        <Area
          dataKey="duration"
          name="Durée (sec)"
          type="natural"
          fill="var(--color-time)"
          fillOpacity={0.4}
          stroke="var(--color-time)"
          baseValue={0}
          yAxisId="time"
        />
      </AreaChart>
    </ChartContainer>
  );
};
