import { PrismaClient, Status } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting to populate report timeline data...');

  // Get all reports
  const reports = await prisma.report.findMany({
    include: {
      author: true,
      timeline: true,
    },
  });

  console.log(`Found ${reports.length} reports`);

  // For each report that doesn't have timeline entries, create an initial entry
  for (const report of reports) {
    if (report.timeline.length === 0) {
      console.log(`Creating timeline entry for report ${report.id} with status ${report.status}`);
      
      await prisma.reportTimeline.create({
        data: {
          reportId: report.id,
          newStatus: report.status,
          changedById: report.authorId,
          notes: 'Initial status entry (created by migration script)',
          createdAt: report.createdAt, // Use the report's creation date
        },
      });
    } else {
      console.log(`Report ${report.id} already has ${report.timeline.length} timeline entries`);
    }
  }

  console.log('Finished populating report timeline data');
}

main()
  .catch((e) => {
    console.error('Error populating report timeline data:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
