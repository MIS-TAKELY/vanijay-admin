-- CreateTable
CREATE TABLE "landing_page_category_cards" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "icon" TEXT NOT NULL,
    "count" TEXT,
    "color" TEXT NOT NULL,
    "darkColor" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "landing_page_category_cards_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "landing_page_category_swipers" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "landing_page_category_swipers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "landing_page_product_grids" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "topDealAbout" TEXT NOT NULL,
    "productIds" TEXT[],
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "landing_page_product_grids_pkey" PRIMARY KEY ("id")
);
