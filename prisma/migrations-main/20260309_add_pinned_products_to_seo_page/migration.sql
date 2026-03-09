-- AlterTable
ALTER TABLE "seo_pages" ADD COLUMN "pinnedProductIds" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[];
