// Calculate the area of a polygon in square meters
export function calculateArea(points: [number, number][]): number {
  if (points.length < 3) {
    return 0;
  }

  // Use the Shoelace formula (Gauss's area formula)
  // For geographic coordinates, we need to convert to meters first
  let area = 0;
  
  for (let i = 0; i < points.length; i++) {
    const j = (i + 1) % points.length;
    const [lat1, lng1] = points[i];
    const [lat2, lng2] = points[j];
    
    // Convert to radians
    const phi1 = (lat1 * Math.PI) / 180;
    const phi2 = (lat2 * Math.PI) / 180;
    const lambda1 = (lng1 * Math.PI) / 180;
    const lambda2 = (lng2 * Math.PI) / 180;
    
    // Earth's radius in meters
    const R = 6371000;
    
    // Calculate the area of the trapezoid
    const x1 = R * Math.cos(phi1) * Math.cos(lambda1);
    const y1 = R * Math.cos(phi1) * Math.sin(lambda1);
    const x2 = R * Math.cos(phi2) * Math.cos(lambda2);
    const y2 = R * Math.cos(phi2) * Math.sin(lambda2);
    
    area += x1 * y2 - x2 * y1;
  }
  
  // Take the absolute value and divide by 2
  return Math.abs(area) / 2;
}
