// This script updates the location field for all reports that don't have it set
// Run with: node scripts/update-report-locations.js

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function updateReportLocations() {
  try {
    console.log('Checking for reports with missing location field...');
    
    // Find reports with null location field
    const reportsWithoutLocation = await prisma.$queryRaw`
      SELECT id, latitude, longitude 
      FROM "Report" 
      WHERE location IS NULL
    `;
    
    console.log(`Found ${reportsWithoutLocation.length} reports with missing location field`);
    
    if (reportsWithoutLocation.length === 0) {
      console.log('All reports have location field set. No updates needed.');
      return;
    }
    
    // Update each report's location field
    for (const report of reportsWithoutLocation) {
      console.log(`Updating location for report ${report.id}`);
      
      await prisma.$executeRaw`
        UPDATE "Report"
        SET location = ST_SetSRID(ST_MakePoint(${report.longitude}, ${report.latitude}), 4326)
        WHERE id = ${report.id}
      `;
    }
    
    console.log('Finished updating report locations');
    
  } catch (error) {
    console.error('Error updating report locations:', error);
  } finally {
    await prisma.$disconnect();
  }
}

updateReportLocations();
