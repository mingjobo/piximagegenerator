#!/usr/bin/env tsx
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as fs from "fs";
import * as path from "path";
import * as crypto from "crypto";
import * as dotenv from "dotenv";

// Load environment variables
dotenv.config({ path: ".env.local" });
dotenv.config({ path: ".env.development" });
dotenv.config();

// Import schema
import { works } from "../src/db/schema";

const EXAMPLE_USER_UUID = "system-example";
const EXAMPLE_DIR = path.join(process.cwd(), "public/imgs/example");
const EXAMPLE_JSON_PATH = path.join(EXAMPLE_DIR, "example.json");

// Storage configuration
interface StorageConfig {
  endpoint: string;
  region: string;
  accessKey: string;
  secretKey: string;
  bucket: string;
  domain?: string;
}

class SimpleStorage {
  private config: StorageConfig;

  constructor() {
    this.config = {
      endpoint: process.env.STORAGE_ENDPOINT || "",
      region: process.env.STORAGE_REGION || "auto",
      accessKey: process.env.STORAGE_ACCESS_KEY || "",
      secretKey: process.env.STORAGE_SECRET_KEY || "",
      bucket: process.env.STORAGE_BUCKET || "",
      domain: process.env.STORAGE_DOMAIN || "",
    };

    // Validate configuration
    if (!this.config.endpoint || !this.config.accessKey || !this.config.secretKey || !this.config.bucket) {
      console.error("❌ Missing S3 configuration. Please check your environment variables:");
      console.error("   Required: STORAGE_ENDPOINT, STORAGE_ACCESS_KEY, STORAGE_SECRET_KEY, STORAGE_BUCKET");
      process.exit(1);
    }
  }

  async uploadFile(body: Buffer, key: string, contentType: string = "application/octet-stream"): Promise<{ url: string }> {
    const url = `${this.config.endpoint}/${this.config.bucket}/${key}`;

    try {
      // Import aws4fetch dynamically
      const { AwsClient } = await import("aws4fetch");

      const client = new AwsClient({
        accessKeyId: this.config.accessKey,
        secretAccessKey: this.config.secretKey,
      });

      const request = new Request(url, {
        method: "PUT",
        headers: {
          "Content-Type": contentType,
          "Content-Disposition": "inline",
          "Content-Length": body.length.toString(),
        },
        body: new Uint8Array(body),
      });

      const response = await client.fetch(request);

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Upload failed: ${response.statusText} - ${errorText}`);
      }

      // Return URL with CDN domain if configured
      const finalUrl = this.config.domain
        ? `${this.config.domain}/${key}`
        : url;

      return { url: finalUrl };
    } catch (error) {
      console.error(`Failed to upload to S3: ${error}`);
      throw error;
    }
  }
}

async function seedExampleWorks() {
  console.log("🚀 Starting to seed example works to S3 and database...");
  console.log("=".repeat(50));

  try {
    // Check database connection
    const databaseUrl = process.env.DATABASE_URL || process.env.POSTGRES_URL;
    if (!databaseUrl) {
      console.error("❌ DATABASE_URL or POSTGRES_URL not found in environment variables");
      process.exit(1);
    }

    // Initialize database
    const client = postgres(databaseUrl, {
      prepare: false,
      max: 1,
    });
    const db = drizzle(client);
    console.log("✅ Database connection initialized");

    // Read example.json
    if (!fs.existsSync(EXAMPLE_JSON_PATH)) {
      console.error(`❌ Example file not found: ${EXAMPLE_JSON_PATH}`);
      process.exit(1);
    }

    const exampleData = JSON.parse(
      fs.readFileSync(EXAMPLE_JSON_PATH, "utf-8")
    );
    console.log(`📄 Found ${Object.keys(exampleData).length} examples in example.json`);

    // Initialize storage
    const storage = new SimpleStorage();
    console.log("✅ S3 storage initialized");

    // Check if examples already exist
    const existingExamples = await db
      .select()
      .from(works);

    const systemExamples = existingExamples.filter((w: any) => w.user_uuid === EXAMPLE_USER_UUID);

    if (systemExamples.length > 0) {
      console.log(`\n⚠️  Found ${systemExamples.length} existing system examples in database.`);
      console.log("   Skipping cleanup to preserve existing data...");
    }

    console.log("\n" + "=".repeat(50));
    console.log("📦 Processing examples...\n");

    // Process each example
    const insertedWorks = [];

    for (const [number, emoji] of Object.entries(exampleData)) {
      console.log(`Processing example ${number}: ${emoji}`);

      // Read image file
      const imagePath = path.join(EXAMPLE_DIR, `${number}.png`);

      if (!fs.existsSync(imagePath)) {
        console.error(`  ❌ Image file not found: ${imagePath}`);
        continue;
      }

      const imageBuffer = fs.readFileSync(imagePath);
      console.log(`  📖 Read image: ${(imageBuffer.length / 1024).toFixed(1)} KB`);

      // Generate unique identifiers
      const workUuid = `example-${number}-${crypto.randomBytes(4).toString('hex')}`;
      const s3Key = `pixels/examples/example_${number}.png`;

      // Upload to S3
      console.log(`  ☁️  Uploading to S3...`);
      let imageUrl: string;

      try {
        const uploadResult = await storage.uploadFile(imageBuffer, s3Key, "image/png");
        imageUrl = uploadResult.url;
        console.log(`  ✅ Uploaded: ${imageUrl}`);
      } catch (uploadError) {
        console.error(`  ❌ Failed to upload: ${uploadError}`);
        continue;
      }

      // Insert into database
      try {
        const [newWork] = await db.insert(works).values({
          uuid: workUuid,
          user_uuid: EXAMPLE_USER_UUID,
          emoji: emoji as string,
          image_url: imageUrl,
          created_at: new Date("2024-01-01T00:00:00Z"),
        }).returning();

        insertedWorks.push(newWork);
        console.log(`  ✅ Saved to database\n`);
      } catch (dbError) {
        console.error(`  ❌ Failed to save to database: ${dbError}\n`);
      }
    }

    // Display summary
    console.log("=".repeat(50));
    console.log(`\n✨ Seeding completed!`);
    console.log(`📊 Successfully seeded ${insertedWorks.length} out of ${Object.keys(exampleData).length} examples\n`);

    if (insertedWorks.length > 0) {
      console.log("📋 Seeded examples:");
      insertedWorks.forEach((work, index) => {
        console.log(`  ${index + 1}. ${work.emoji} -> ${work.image_url}`);
      });
    }

  } catch (error) {
    console.error("\n❌ Error during seeding:", error);
    process.exit(1);
  }
}

// Run the seeding
seedExampleWorks()
  .then(() => {
    console.log("\n👋 Done!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Fatal error:", error);
    process.exit(1);
  });