import { db } from "@/db/drizzle/db";
import { aircraftModels, InsertAircraftModel } from "@/db/drizzle/schema/aircraftModels";
import * as fs from 'fs/promises';
import "dotenv/config";
import { sql } from "drizzle-orm";
import { normalizeModelName } from "@/app/api/scorecard/upload/route";

// This script imports aircraft models from a TSV file into the database.
async function importAircraftModels() {
  const filePath = process.argv[2];
  if (!filePath) {
    console.error("Please provide the path to the TSV file.");
    process.exit(1);
  }
  const file = await fs.readFile(filePath, 'utf8');
  const data = await file.split('\n').map(line => line.split('\t'));
  const headers = [
    'fullModelName',
    'models',
    'isFixedWing',
    'isSingleEngine',
    'isMultiEngine',
    'isTurbine',
    'isMilitary',
    'isHelicopter',
  ];
  const rows = data.slice(1).map(row => {
    const obj: any = {};
    headers.forEach((header, index) => {
      let rowVal: any = row[index]?.trim();
      if (rowVal === 'YES') {
        rowVal = true;
      } else if (rowVal === 'NO') {
        rowVal = false;
      } else if (rowVal === '') {
        rowVal = null;
      } else if (index === 1) {
        rowVal = rowVal.split(',').map((alias: string) => normalizeModelName(alias)).filter((alias: string) => alias.length > 0);
      }
      obj[header] = rowVal;
    });
    return obj;
  });
  const aircraftModelsData: InsertAircraftModel[] = rows.map((row: any) => {
    let aliases: string[] | null = row.models.slice(1);
    if (aliases?.length === 0) {
      aliases = null;
    }
    let insertModel: InsertAircraftModel = {
      model: row.models[0] ?? null,
      aliases: aliases?.join(',') ?? null,
      isFixedWing: row.isFixedWing,
      isHelicopter: row.isHelicopter,
      isSingleEngine: row.isSingleEngine,
      isTurbine: row.isTurbine,
      isMilitary: row.isMilitary,
    };
    return insertModel;
  });
  try {
    await db.delete(aircraftModels).where(sql`TRUE`);
    for (const aircraftModel of aircraftModelsData) {
      console.log(aircraftModel);
      await db.insert(aircraftModels).values(aircraftModel);
    }
    console.log("Aircraft models imported successfully.");
  } catch (error) {
    console.error("Error importing aircraft models:", error);
  }
}

importAircraftModels()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Import failed:", error);
    process.exit(1);
  });
