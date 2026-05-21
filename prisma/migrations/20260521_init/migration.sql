-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('USER', 'ADMIN');

-- CreateEnum
CREATE TYPE "PuzzleCondition" AS ENUM ('NEW', 'LIKE_NEW', 'GOOD', 'FAIR');

-- CreateEnum
CREATE TYPE "PuzzleType" AS ENUM ('CLASSIC', 'THREE_D', 'FLOOR', 'EDUCATIONAL');

-- CreateEnum
CREATE TYPE "OrderStatus" AS ENUM ('PENDING', 'CONFIRMED', 'SHIPPED', 'DELIVERED', 'RETURNED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "DeliveryMethod" AS ENUM ('NOVA_POSHTA', 'UKRPOSHTA', 'SELF_PICKUP_WAREHOUSE', 'SELF_PICKUP_SELLER');

-- CreateEnum
CREATE TYPE "TrackingAction" AS ENUM ('RENTED', 'RETURNED', 'MOVED', 'INVENTORIED');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" "UserRole" NOT NULL DEFAULT 'USER',
    "phone" TEXT,
    "deliveryRegion" TEXT,
    "deliveryCity" TEXT,
    "deliveryNovaPoshtaWarehouse" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Category" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "nameEn" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Category_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Puzzle" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "titleEn" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "descriptionEn" TEXT NOT NULL,
    "pieceCount" INTEGER NOT NULL,
    "condition" "PuzzleCondition" NOT NULL,
    "type" "PuzzleType" NOT NULL,
    "rentalPricePerDay" DECIMAL(10,2) NOT NULL,
    "depositAmount" DECIMAL(10,2) NOT NULL,
    "isAvailable" BOOLEAN NOT NULL DEFAULT true,
    "isVisible" BOOLEAN NOT NULL DEFAULT true,
    "rentalCount" INTEGER NOT NULL DEFAULT 0,
    "categoryId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Puzzle_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PuzzleImage" (
    "id" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "alt" TEXT NOT NULL,
    "altEn" TEXT NOT NULL,
    "puzzleId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PuzzleImage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Order" (
    "id" TEXT NOT NULL,
    "status" "OrderStatus" NOT NULL DEFAULT 'PENDING',
    "deliveryMethod" "DeliveryMethod" NOT NULL,
    "trackingNumber" TEXT,
    "adminNotes" TEXT,
    "totalAmount" DECIMAL(10,2) NOT NULL,
    "depositAmount" DECIMAL(10,2) NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Order_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OrderItem" (
    "id" TEXT NOT NULL,
    "rentalDays" INTEGER NOT NULL,
    "pricePerDay" DECIMAL(10,2) NOT NULL,
    "depositAmount" DECIMAL(10,2) NOT NULL,
    "orderId" TEXT NOT NULL,
    "puzzleId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OrderItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PuzzleTracking" (
    "id" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "action" "TrackingAction" NOT NULL,
    "note" TEXT,
    "puzzleId" TEXT NOT NULL,
    "heldByUserId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PuzzleTracking_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ActivityLog" (
    "id" TEXT NOT NULL,
    "actorId" TEXT,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "details" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ActivityLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_role_idx" ON "User"("role");

-- CreateIndex
CREATE UNIQUE INDEX "Category_slug_key" ON "Category"("slug");

-- CreateIndex
CREATE INDEX "Puzzle_categoryId_idx" ON "Puzzle"("categoryId");

-- CreateIndex
CREATE INDEX "Puzzle_isVisible_isAvailable_idx" ON "Puzzle"("isVisible", "isAvailable");

-- CreateIndex
CREATE INDEX "Puzzle_type_idx" ON "Puzzle"("type");

-- CreateIndex
CREATE INDEX "PuzzleImage_puzzleId_order_idx" ON "PuzzleImage"("puzzleId", "order");

-- CreateIndex
CREATE INDEX "Order_userId_idx" ON "Order"("userId");

-- CreateIndex
CREATE INDEX "Order_status_idx" ON "Order"("status");

-- CreateIndex
CREATE INDEX "Order_createdAt_idx" ON "Order"("createdAt");

-- CreateIndex
CREATE INDEX "OrderItem_orderId_idx" ON "OrderItem"("orderId");

-- CreateIndex
CREATE INDEX "OrderItem_puzzleId_idx" ON "OrderItem"("puzzleId");

-- CreateIndex
CREATE INDEX "PuzzleTracking_puzzleId_idx" ON "PuzzleTracking"("puzzleId");

-- CreateIndex
CREATE INDEX "PuzzleTracking_heldByUserId_idx" ON "PuzzleTracking"("heldByUserId");

-- CreateIndex
CREATE INDEX "PuzzleTracking_action_idx" ON "PuzzleTracking"("action");

-- CreateIndex
CREATE INDEX "ActivityLog_entityType_entityId_idx" ON "ActivityLog"("entityType", "entityId");

-- CreateIndex
CREATE INDEX "ActivityLog_actorId_idx" ON "ActivityLog"("actorId");

-- CreateIndex
CREATE INDEX "ActivityLog_createdAt_idx" ON "ActivityLog"("createdAt");

-- AddForeignKey
ALTER TABLE "Puzzle" ADD CONSTRAINT "Puzzle_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PuzzleImage" ADD CONSTRAINT "PuzzleImage_puzzleId_fkey" FOREIGN KEY ("puzzleId") REFERENCES "Puzzle"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderItem" ADD CONSTRAINT "OrderItem_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderItem" ADD CONSTRAINT "OrderItem_puzzleId_fkey" FOREIGN KEY ("puzzleId") REFERENCES "Puzzle"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PuzzleTracking" ADD CONSTRAINT "PuzzleTracking_puzzleId_fkey" FOREIGN KEY ("puzzleId") REFERENCES "Puzzle"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PuzzleTracking" ADD CONSTRAINT "PuzzleTracking_heldByUserId_fkey" FOREIGN KEY ("heldByUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

