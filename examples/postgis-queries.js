/**
 * Examples of how to use PostGIS with Prisma in your application
 * 
 * Note: These examples use raw SQL queries with Prisma's $queryRaw functionality
 * since Prisma doesn't have native support for all PostGIS functions.
 */

const { prisma } = require('../lib/prisma');
const { Prisma } = require('@prisma/client');

/**
 * Find reports within a certain radius of a point
 * This uses ST_DWithin which is more accurate than a bounding box
 */
async function findReportsWithinRadius(latitude, longitude, radiusInMeters) {
  // ST_DWithin finds points within a specified distance
  // ST_SetSRID and ST_MakePoint create a PostGIS point from lat/lng
  // The 4326 is the SRID for WGS84 (standard GPS coordinate system)
  const reports = await prisma.$queryRaw`
    SELECT 
      id, 
      picture, 
      description, 
      severity, 
      status, 
      latitude, 
      longitude, 
      address,
      ST_Distance(
        location, 
        ST_SetSRID(ST_MakePoint(${longitude}, ${latitude}), 4326)
      ) as distance
    FROM "Report"
    WHERE ST_DWithin(
      location,
      ST_SetSRID(ST_MakePoint(${longitude}, ${latitude}), 4326),
      ${radiusInMeters}
    )
    ORDER BY distance
  `;
  
  return reports;
}

/**
 * Find the nearest reports to a given point
 */
async function findNearestReports(latitude, longitude, limit = 10) {
  const reports = await prisma.$queryRaw`
    SELECT 
      id, 
      picture, 
      description, 
      severity, 
      status, 
      latitude, 
      longitude, 
      address,
      ST_Distance(
        location, 
        ST_SetSRID(ST_MakePoint(${longitude}, ${latitude}), 4326)
      ) as distance
    FROM "Report"
    ORDER BY location <-> ST_SetSRID(ST_MakePoint(${longitude}, ${latitude}), 4326)
    LIMIT ${limit}
  `;
  
  return reports;
}

/**
 * Find reports within a bounding box (viewport)
 */
async function findReportsInBoundingBox(north, south, east, west) {
  // Create a bounding box polygon
  const reports = await prisma.$queryRaw`
    SELECT 
      id, 
      picture, 
      description, 
      severity, 
      status, 
      latitude, 
      longitude, 
      address
    FROM "Report"
    WHERE ST_Within(
      location,
      ST_MakeEnvelope(${west}, ${south}, ${east}, ${north}, 4326)
    )
  `;
  
  return reports;
}

/**
 * Calculate the distance between two reports
 */
async function calculateDistanceBetweenReports(reportId1, reportId2) {
  const result = await prisma.$queryRaw`
    SELECT 
      ST_Distance(r1.location, r2.location) as distance_meters
    FROM "Report" r1, "Report" r2
    WHERE r1.id = ${reportId1} AND r2.id = ${reportId2}
  `;
  
  return result[0]?.distance_meters;
}

/**
 * Find reports clustered by proximity
 * This is useful for map visualization with many points
 */
async function clusterReportsByProximity(distanceInMeters = 100) {
  const clusters = await prisma.$queryRaw`
    SELECT 
      ST_AsGeoJSON(ST_Centroid(ST_Collect(location))) as center,
      array_agg(id) as report_ids,
      count(*) as report_count
    FROM "Report"
    GROUP BY ST_ClusterDBSCAN(location, ${distanceInMeters}, 1)
    ORDER BY report_count DESC
  `;
  
  return clusters;
}

/**
 * Update the location field for a report
 */
async function updateReportLocation(reportId, latitude, longitude) {
  await prisma.$executeRaw`
    UPDATE "Report"
    SET 
      latitude = ${latitude},
      longitude = ${longitude},
      location = ST_SetSRID(ST_MakePoint(${longitude}, ${latitude}), 4326)
    WHERE id = ${reportId}
  `;
}

/**
 * Create a new report with location
 * Note: This example shows how to use Prisma's normal create method
 * while letting the database trigger handle the PostGIS location field
 */
async function createReportWithLocation(reportData) {
  const report = await prisma.report.create({
    data: {
      picture: reportData.picture,
      description: reportData.description,
      severity: reportData.severity,
      status: 'SUBMITTED',
      latitude: reportData.latitude,
      longitude: reportData.longitude,
      address: reportData.address,
      author: {
        connect: { id: reportData.authorId }
      }
    }
  });
  
  // The location field will be automatically set by the database default expression
  // ST_SetSRID(ST_MakePoint(longitude, latitude), 4326)
  
  return report;
}

module.exports = {
  findReportsWithinRadius,
  findNearestReports,
  findReportsInBoundingBox,
  calculateDistanceBetweenReports,
  clusterReportsByProximity,
  updateReportLocation,
  createReportWithLocation
};
