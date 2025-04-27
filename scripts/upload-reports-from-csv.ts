import { PrismaClient, Status } from "@prisma/client";
import { parse } from "csv-parse";
import * as fs from "fs";
import * as path from "path";

const prisma = new PrismaClient();

interface ReportCSVRow {
  lat: string;
  lng: string;
  imagen_base64: string;
}

async function uploadReportsFromCSV(csvPath: string, authorId: string) {
  const records: ReportCSVRow[] = [];

  // Parse CSV file
  const parser = fs.createReadStream(path.resolve(csvPath)).pipe(
    parse({
      columns: true,
      skip_empty_lines: true,
    })
  );

  for await (const record of parser) {
    records.push(record);
  }

  console.log(`Found ${records.length} records to process`);

  // Process records
  let successCount = 0;
  let errorCount = 0;

  for (const record of records) {
    try {
      const latitude = parseFloat(record.lat);
      const longitude = parseFloat(record.lng);

      if (isNaN(latitude) || isNaN(longitude)) {
        throw new Error(`Invalid coordinates: ${record.lat}, ${record.lng}`);
      }

      // Create report
      const report = await prisma.report.create({
        data: {
          picture: record.imagen_base64,
          description: `Reporte en ubicación ${latitude}, ${longitude}`,
          severity: "MEDIUM",
          status: "SUBMITTED" as Status,
          latitude,
          longitude,
          address: `Lat: ${latitude}, Lng: ${longitude}`,
          authorId,
        },
      });

      // Create initial timeline entry
      await prisma.reportTimeline.create({
        data: {
          reportId: report.id,
          newStatus: "SUBMITTED",
          changedById: authorId,
          notes: "Initial status entry (created by import script)",
        },
      });

      successCount++;
      console.log(`Successfully created report ${report.id}`);
    } catch (error) {
      errorCount++;
      console.error(`Error processing record:`, record, error);
    }
  }

  console.log(`
Upload completed:
- Total records: ${records.length}
- Successful: ${successCount}
- Failed: ${errorCount}
  `);
}

// Main execution
async function main() {
  const csvPath = process.argv[2];
  const authorId = process.argv[3];

  if (!csvPath || !authorId) {
    console.error(
      "Usage: ts-node upload-reports-from-csv.ts <csv-path> <author-id>"
    );
    process.exit(1);
  }

  try {
    await uploadReportsFromCSV(csvPath, authorId);
  } catch (error) {
    console.error("Fatal error:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
