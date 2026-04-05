import { Migration } from "@mikro-orm/migrations"

export class Migration20260407120000 extends Migration {
  override async up(): Promise<void> {
    // Rename attribute_preset → attribute_template (if it exists)
    this.addSql(`
      DO $$ BEGIN
        IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'attribute_preset')
           AND NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'attribute_template')
        THEN
          ALTER TABLE "attribute_preset" RENAME TO "attribute_template";
          ALTER INDEX IF EXISTS "attribute_preset_pkey" RENAME TO "attribute_template_pkey";
          ALTER INDEX IF EXISTS "IDX_attribute_preset_deleted_at" RENAME TO "IDX_attribute_template_deleted_at";
        END IF;
      END $$;
    `)

    // Ensure table exists for fresh installs
    this.addSql(`
      CREATE TABLE IF NOT EXISTS "attribute_template" (
        "id" text NOT NULL,
        "key" text NOT NULL,
        "label" text NOT NULL,
        "type" text NOT NULL DEFAULT 'text',
        "unit" text NULL,
        "description" text NULL,
        "created_at" timestamptz NOT NULL DEFAULT now(),
        "updated_at" timestamptz NOT NULL DEFAULT now(),
        "deleted_at" timestamptz NULL,
        CONSTRAINT "attribute_template_pkey" PRIMARY KEY ("id")
      );
    `)

    this.addSql(`
      CREATE INDEX IF NOT EXISTS "IDX_attribute_template_deleted_at"
        ON "attribute_template" ("deleted_at")
        WHERE "deleted_at" IS NOT NULL;
    `)

    // Add is_global flag + make category_id nullable
    this.addSql(`ALTER TABLE "category_custom_attribute" ALTER COLUMN "category_id" DROP NOT NULL;`)
    this.addSql(`
      ALTER TABLE "category_custom_attribute"
        ADD COLUMN IF NOT EXISTS "is_global" boolean NOT NULL DEFAULT false;
    `)
    this.addSql(`
      CREATE INDEX IF NOT EXISTS "IDX_category_custom_attribute_is_global"
        ON "category_custom_attribute" ("is_global")
        WHERE "deleted_at" IS NULL AND "is_global" = true;
    `)
  }

  override async down(): Promise<void> {
    this.addSql(`DROP INDEX IF EXISTS "IDX_category_custom_attribute_is_global";`)
    this.addSql(`ALTER TABLE "category_custom_attribute" DROP COLUMN IF EXISTS "is_global";`)
    this.addSql(`ALTER TABLE "category_custom_attribute" ALTER COLUMN "category_id" SET NOT NULL;`)
  }
}
