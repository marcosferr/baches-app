"use client"

export function AdminChart() {
  // En un caso real, usaríamos una biblioteca como Chart.js o Recharts
  // Esta es una simulación simple para el propósito de este ejemplo

  return (
    <div className="h-[300px] w-full">
      <div className="flex h-full items-end gap-2 pb-6 pt-6">
        {[40, 65, 30, 85, 55, 60, 45, 70, 50].map((height, i) => (
          <div key={i} className="relative flex flex-1 flex-col items-center">
            <div
              className="w-full rounded-t-sm bg-orange-500 transition-all hover:bg-orange-600"
              style={{ height: `${height}%` }}
            ></div>
            <span className="absolute -bottom-6 text-xs text-muted-foreground">Zona {i + 1}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

