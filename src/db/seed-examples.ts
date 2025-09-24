import { db } from "@/db";
import { works } from "@/db/schema";
import { eq } from "drizzle-orm";
import { newStorage } from "@/lib/storage";
import { getUuid } from "@/lib/hash";
import * as fs from "fs";
import * as path from "path";

const EXAMPLE_USER_UUID = "system-example";
const EXAMPLE_DIR = path.join(process.cwd(), "public/imgs/example");
const EXAMPLE_JSON_PATH = path.join(EXAMPLE_DIR, "example.json");

async function seedExampleWorks() {
  console.log("🚀 Starting to seed example works to S3 and database...");

  try {
    // 1. Read example.json
    const exampleData = JSON.parse(
      fs.readFileSync(EXAMPLE_JSON_PATH, "utf-8")
    );
    console.log(`📄 Found ${Object.keys(exampleData).length} examples`);

    // 2. Initialize storage
    const storage = newStorage();

    // 3. Check if examples already exist in database
    const database = db();
    const existingExamples = await database
      .select()
      .from(works)
      .where(eq(works.user_uuid, EXAMPLE_USER_UUID));

    if (existingExamples.length > 0) {
      console.log(`⚠️  Found ${existingExamples.length} existing examples in database.`);
      const answer = await confirm("Do you want to delete existing examples and re-seed? (y/n): ");

      if (answer) {
        console.log("🗑️  Deleting existing examples...");
        await database
          .delete(works)
          .where(eq(works.user_uuid, EXAMPLE_USER_UUID));
        console.log("✅ Existing examples deleted");
      } else {
        console.log("❌ Seeding cancelled");
        return;
      }
    }

    // 4. Process each example
    const insertedWorks = [];

    for (const [number, emoji] of Object.entries(exampleData)) {
      console.log(`\n📦 Processing example ${number}: ${emoji}`);

      // Read image file
      const imagePath = path.join(EXAMPLE_DIR, `${number}.png`);

      if (!fs.existsSync(imagePath)) {
        console.error(`❌ Image file not found: ${imagePath}`);
        continue;
      }

      const imageBuffer = fs.readFileSync(imagePath);
      console.log(`  📖 Read image file: ${number}.png (${(imageBuffer.length / 1024).toFixed(2)} KB)`);

      // Generate unique key for S3
      const workUuid = `example-${number}`;
      const s3Key = `pixels/examples/example_${number}.png`;

      // Upload to S3
      console.log(`  ☁️  Uploading to S3: ${s3Key}`);
      try {
        const uploadResult = await storage.uploadFile({
          body: imageBuffer,
          key: s3Key,
          contentType: "image/png",
          disposition: "inline",
        });

        console.log(`  ✅ Uploaded successfully: ${uploadResult.url}`);

        // Insert into database
        const [newWork] = await database.insert(works).values({
          uuid: workUuid,
          user_uuid: EXAMPLE_USER_UUID,
          emoji: emoji as string,
          image_url: uploadResult.url,
          created_at: new Date("2024-01-01T00:00:00Z"), // Fixed date for examples
        }).returning();

        insertedWorks.push(newWork);
        console.log(`  ✅ Saved to database with UUID: ${newWork.uuid}`);

      } catch (uploadError) {
        console.error(`  ❌ Failed to upload ${number}.png:`, uploadError);
      }
    }

    console.log("\n" + "=".repeat(50));
    console.log(`✨ Seeding completed!`);
    console.log(`📊 Successfully seeded ${insertedWorks.length} example works`);
    console.log("=".repeat(50));

    // Display summary
    console.log("\n📋 Summary of seeded examples:");
    insertedWorks.forEach((work, index) => {
      console.log(`  ${index + 1}. ${work.emoji} -> ${work.image_url}`);
    });

  } catch (error) {
    console.error("❌ Error during seeding:", error);
    process.exit(1);
  }
}

// Helper function to prompt for confirmation
async function confirm(message: string): Promise<boolean> {
  const readline = require("readline").createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    readline.question(message, (answer: string) => {
      readline.close();
      resolve(answer.toLowerCase() === "y");
    });
  });
}

// Run if this file is executed directly
if (require.main === module) {
  seedExampleWorks()
    .then(() => {
      console.log("\n👋 Goodbye!");
      process.exit(0);
    })
    .catch((error) => {
      console.error("Fatal error:", error);
      process.exit(1);
    });
}

export { seedExampleWorks };