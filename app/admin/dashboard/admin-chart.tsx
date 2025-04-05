"use client";

type AdminChartProps = {
  data?: number[];
  loading?: boolean;
};

export function AdminChart({ data = [], loading = false }: AdminChartProps) {
  const defaultData = [40, 65, 30, 85, 55, 60, 45, 70, 50];
  const chartData = data.length > 0 ? data : defaultData;

  // Find the maximum value to normalize heights
  const maxValue = Math.max(...chartData, 1);

  if (loading) {
    return (
      <div className="flex h-[300px] w-full items-center justify-center">
        <p>Cargando datos del gráfico...</p>
      </div>
    );
  }

  return (
    <div className="h-[300px] w-full">
      <div className="flex h-full items-end gap-2 pb-6 pt-6">
        {chartData.map((value, i) => {
          // Calculate the height percentage (minimum 5% for visibility)
          const heightPercentage = Math.max((value / maxValue) * 100, 5);

          return (
            <div key={i} className="relative flex flex-1 flex-col items-center">
              <div
                className="w-full rounded-t-sm bg-orange-500 transition-all hover:bg-orange-600"
                style={{ height: `${heightPercentage}%` }}
              ></div>
              <span className="absolute -bottom-6 text-xs text-muted-foreground">
                Zona {i + 1}
              </span>
              <span className="absolute -top-6 text-xs font-medium">
                {value}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
