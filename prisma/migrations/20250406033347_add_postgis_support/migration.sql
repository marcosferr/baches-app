-- AlterTable
ALTER TABLE "Report" ADD COLUMN     "location" geometry(Point, 4326) DEFAULT ST_SetSRID(ST_MakePoint(longitude, latitude), 4326);

-- CreateIndex
CREATE INDEX "location_idx" ON "Report" USING GIST ("location");
