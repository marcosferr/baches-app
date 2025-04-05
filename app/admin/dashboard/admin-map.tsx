"use client";

type AdminMapProps = {
  reports?: any[];
  loading?: boolean;
};

export function AdminMap({ reports = [], loading = false }: AdminMapProps) {
  // In a real implementation, we would use the actual coordinates from reports
  // to render a proper heat map with a mapping library

  if (loading) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <p>Cargando mapa de calor...</p>
      </div>
    );
  }

  // Create dynamic heat points based on report data if available
  const heatPoints =
    reports.length > 0
      ? createHeatPoints(reports)
      : [
          {
            left: "25%",
            top: "25%",
            size: "h-32 w-32",
            color: "from-red-500/70",
          },
          {
            left: "50%",
            top: "33%",
            size: "h-40 w-40",
            color: "from-orange-500/70",
          },
          {
            left: "66%",
            top: "50%",
            size: "h-24 w-24",
            color: "from-yellow-500/70",
          },
        ];

  return (
    <div className="relative h-full w-full bg-[url('/placeholder.svg?height=600&width=1000')] bg-cover bg-center">
      {/* Render heat points */}
      {heatPoints.map((point, index) => (
        <div
          key={index}
          className={`absolute rounded-full bg-gradient-radial ${point.color} to-transparent blur-md ${point.size}`}
          style={{ left: point.left, top: point.top }}
        ></div>
      ))}

      {/* Display report count */}
      <div className="absolute bottom-4 right-4 rounded bg-white/80 p-2 text-sm font-medium">
        {reports.length} reportes en el mapa
      </div>
    </div>
  );
}

// Helper function to create heat points from report data
function createHeatPoints(reports) {
  const points = [];

  // Group reports by approximate location
  // In a real implementation, you would use a clustering algorithm
  const locations = {};

  reports.forEach((report) => {
    if (!report.latitude || !report.longitude) return;

    // Create a simple grid system for clustering
    const gridKey = `${Math.floor(report.latitude * 10)}-${Math.floor(
      report.longitude * 10
    )}`;

    if (!locations[gridKey]) {
      locations[gridKey] = {
        count: 0,
        lat: report.latitude,
        lng: report.longitude,
        severity: [],
      };
    }

    locations[gridKey].count += 1;
    locations[gridKey].severity.push(report.severity || "MEDIUM");
  });

  // Create heat points from the clusters
  Object.values(locations).forEach((loc: any) => {
    // Convert coordinates to relative positions on the map
    // This is a simplification - in a real app you'd use proper map projection
    const left = `${((loc.lng + 180) / 360) * 100}%`;
    const top = `${((90 - loc.lat) / 180) * 100}%`;

    // Size based on count
    const size =
      loc.count < 3
        ? "h-16 w-16"
        : loc.count < 6
        ? "h-24 w-24"
        : loc.count < 10
        ? "h-32 w-32"
        : "h-40 w-40";

    // Color based on predominant severity
    const sevCount = {
      LOW: loc.severity.filter((s) => s === "LOW").length,
      MEDIUM: loc.severity.filter((s) => s === "MEDIUM").length,
      HIGH: loc.severity.filter((s) => s === "HIGH").length,
    };

    let color;
    if (sevCount.HIGH > sevCount.MEDIUM && sevCount.HIGH > sevCount.LOW) {
      color = "from-red-500/70";
    } else if (sevCount.MEDIUM > sevCount.LOW) {
      color = "from-orange-500/70";
    } else {
      color = "from-yellow-500/70";
    }

    points.push({ left, top, size, color });
  });

  return points.length > 0
    ? points
    : [
        {
          left: "25%",
          top: "25%",
          size: "h-32 w-32",
          color: "from-red-500/70",
        },
        {
          left: "50%",
          top: "33%",
          size: "h-40 w-40",
          color: "from-orange-500/70",
        },
        {
          left: "66%",
          top: "50%",
          size: "h-24 w-24",
          color: "from-yellow-500/70",
        },
      ];
}
