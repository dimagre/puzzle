import { PrismaClient, Prisma } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  // Clean existing data so the seed is idempotent for local dev.
  await prisma.activityLog.deleteMany();
  await prisma.puzzleTracking.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.puzzleImage.deleteMany();
  await prisma.puzzle.deleteMany();
  await prisma.category.deleteMany();
  await prisma.user.deleteMany();

  const adminPassword = await bcrypt.hash("admin12345", 10);
  const userPassword = await bcrypt.hash("user12345", 10);

  const admin = await prisma.user.create({
    data: {
      email: "admin@puzzleshare.ua",
      passwordHash: adminPassword,
      name: "Олена Адміністратор",
      role: "ADMIN",
      phone: "+380501112233",
      deliveryRegion: "Київська область",
      deliveryCity: "Київ",
      deliveryNovaPoshtaWarehouse: "Відділення №1",
    },
  });

  const user = await prisma.user.create({
    data: {
      email: "user@puzzleshare.ua",
      passwordHash: userPassword,
      name: "Андрій Коваленко",
      role: "USER",
      phone: "+380672223344",
      deliveryRegion: "Львівська область",
      deliveryCity: "Львів",
      deliveryNovaPoshtaWarehouse: "Відділення №12",
    },
  });

  const [catLandscapes, catArt, catKids, catCities] = await Promise.all([
    prisma.category.create({
      data: { name: "Пейзажі", nameEn: "Landscapes", slug: "landscapes" },
    }),
    prisma.category.create({
      data: { name: "Мистецтво", nameEn: "Art", slug: "art" },
    }),
    prisma.category.create({
      data: { name: "Дитячі", nameEn: "Kids", slug: "kids" },
    }),
    prisma.category.create({
      data: { name: "Міста", nameEn: "Cities", slug: "cities" },
    }),
  ]);

  const puzzles = await Promise.all([
    prisma.puzzle.create({
      data: {
        title: "Карпатські гори на світанку",
        titleEn: "Carpathian Mountains at Dawn",
        description:
          "Мальовнича панорама Карпат у золотому ранковому світлі. Ідеально для любителів природи.",
        descriptionEn:
          "Picturesque panorama of the Carpathians bathed in golden morning light. Perfect for nature lovers.",
        pieceCount: 1000,
        condition: "NEW",
        type: "CLASSIC",
        rentalPricePerDay: new Prisma.Decimal("25.00"),
        depositAmount: new Prisma.Decimal("400.00"),
        categoryId: catLandscapes.id,
        images: {
          create: [
            {
              url: "https://images.example.com/puzzles/carpathians-1.jpg",
              order: 0,
              alt: "Карпатські гори на світанку — головне фото",
              altEn: "Carpathian Mountains at Dawn — main photo",
            },
            {
              url: "https://images.example.com/puzzles/carpathians-2.jpg",
              order: 1,
              alt: "Деталь пазла Карпати",
              altEn: "Carpathians puzzle detail",
            },
          ],
        },
      },
    }),
    prisma.puzzle.create({
      data: {
        title: "Соняшники Ван Гога",
        titleEn: "Van Gogh's Sunflowers",
        description:
          "Класичний шедевр Вінсента Ван Гога у форматі пазла на 1500 елементів.",
        descriptionEn:
          "Vincent van Gogh's classic masterpiece as a 1500-piece puzzle.",
        pieceCount: 1500,
        condition: "LIKE_NEW",
        type: "CLASSIC",
        rentalPricePerDay: new Prisma.Decimal("30.00"),
        depositAmount: new Prisma.Decimal("500.00"),
        categoryId: catArt.id,
        images: {
          create: [
            {
              url: "https://images.example.com/puzzles/sunflowers-1.jpg",
              order: 0,
              alt: "Соняшники Ван Гога — пазл",
              altEn: "Van Gogh Sunflowers puzzle",
            },
          ],
        },
      },
    }),
    prisma.puzzle.create({
      data: {
        title: "Веселий зоопарк",
        titleEn: "Happy Zoo",
        description:
          "Яскравий пазл для дітей від 4 років. Великі деталі, безпечний матеріал.",
        descriptionEn:
          "Bright puzzle for kids aged 4+. Large pieces, safe materials.",
        pieceCount: 60,
        condition: "GOOD",
        type: "EDUCATIONAL",
        rentalPricePerDay: new Prisma.Decimal("15.00"),
        depositAmount: new Prisma.Decimal("200.00"),
        categoryId: catKids.id,
        images: {
          create: [
            {
              url: "https://images.example.com/puzzles/zoo-1.jpg",
              order: 0,
              alt: "Веселий зоопарк — дитячий пазл",
              altEn: "Happy Zoo — kids puzzle",
            },
          ],
        },
      },
    }),
    prisma.puzzle.create({
      data: {
        title: "Львів вночі",
        titleEn: "Lviv at Night",
        description:
          "Атмосферний нічний Львів з вуличками Старого міста. Деталізоване зображення.",
        descriptionEn:
          "Atmospheric Lviv at night with Old Town streets. Highly detailed image.",
        pieceCount: 2000,
        condition: "GOOD",
        type: "CLASSIC",
        rentalPricePerDay: new Prisma.Decimal("35.00"),
        depositAmount: new Prisma.Decimal("600.00"),
        categoryId: catCities.id,
        rentalCount: 3,
        images: {
          create: [
            {
              url: "https://images.example.com/puzzles/lviv-1.jpg",
              order: 0,
              alt: "Львів вночі — пазл",
              altEn: "Lviv at Night puzzle",
            },
            {
              url: "https://images.example.com/puzzles/lviv-2.jpg",
              order: 1,
              alt: "Львів вночі — деталь",
              altEn: "Lviv at Night detail",
            },
          ],
        },
      },
    }),
    prisma.puzzle.create({
      data: {
        title: "Ейфелева вежа 3D",
        titleEn: "Eiffel Tower 3D",
        description:
          "Об'ємний пазл-конструктор Ейфелевої вежі. Готова модель — справжня прикраса.",
        descriptionEn:
          "Three-dimensional puzzle of the Eiffel Tower. The finished model is a real decoration.",
        pieceCount: 216,
        condition: "NEW",
        type: "THREE_D",
        rentalPricePerDay: new Prisma.Decimal("40.00"),
        depositAmount: new Prisma.Decimal("700.00"),
        categoryId: catCities.id,
        images: {
          create: [
            {
              url: "https://images.example.com/puzzles/eiffel-1.jpg",
              order: 0,
              alt: "Ейфелева вежа 3D — пазл",
              altEn: "Eiffel Tower 3D puzzle",
            },
          ],
        },
      },
    }),
    prisma.puzzle.create({
      data: {
        title: "Підводний світ",
        titleEn: "Underwater World",
        description:
          "Великий килимовий пазл для гри на підлозі. Барвисті риби та коралові рифи.",
        descriptionEn:
          "Large floor puzzle for playing on the ground. Colorful fish and coral reefs.",
        pieceCount: 48,
        condition: "FAIR",
        type: "FLOOR",
        rentalPricePerDay: new Prisma.Decimal("20.00"),
        depositAmount: new Prisma.Decimal("300.00"),
        categoryId: catKids.id,
        rentalCount: 5,
        isAvailable: false,
        images: {
          create: [
            {
              url: "https://images.example.com/puzzles/underwater-1.jpg",
              order: 0,
              alt: "Підводний світ — підлоговий пазл",
              altEn: "Underwater World floor puzzle",
            },
          ],
        },
      },
    }),
  ]);

  const [carpathians, sunflowers, , lviv, , underwater] = puzzles;

  await prisma.order.create({
    data: {
      userId: user.id,
      status: "DELIVERED",
      deliveryMethod: "NOVA_POSHTA",
      trackingNumber: "20450012345678",
      totalAmount: new Prisma.Decimal("210.00"),
      depositAmount: new Prisma.Decimal("900.00"),
      adminNotes: "Доставлено вчасно, відгук позитивний.",
      items: {
        create: [
          {
            puzzleId: carpathians.id,
            rentalDays: 7,
            pricePerDay: new Prisma.Decimal("25.00"),
            depositAmount: new Prisma.Decimal("400.00"),
          },
          {
            puzzleId: lviv.id,
            rentalDays: 1,
            pricePerDay: new Prisma.Decimal("35.00"),
            depositAmount: new Prisma.Decimal("500.00"),
          },
        ],
      },
    },
  });

  await prisma.order.create({
    data: {
      userId: user.id,
      status: "PENDING",
      deliveryMethod: "SELF_PICKUP_WAREHOUSE",
      totalAmount: new Prisma.Decimal("90.00"),
      depositAmount: new Prisma.Decimal("500.00"),
      items: {
        create: [
          {
            puzzleId: sunflowers.id,
            rentalDays: 3,
            pricePerDay: new Prisma.Decimal("30.00"),
            depositAmount: new Prisma.Decimal("500.00"),
          },
        ],
      },
    },
  });

  await prisma.puzzleTracking.createMany({
    data: [
      {
        puzzleId: lviv.id,
        location: "Склад Київ",
        action: "INVENTORIED",
        note: "Перевірено комплектність.",
      },
      {
        puzzleId: lviv.id,
        location: "Львів, відділення НП №12",
        action: "RENTED",
        heldByUserId: user.id,
        note: "Видано на 7 днів.",
      },
      {
        puzzleId: underwater.id,
        location: "Склад Київ",
        action: "RETURNED",
        note: "Незначні потертості коробки.",
      },
    ],
  });

  await prisma.activityLog.createMany({
    data: [
      {
        actorId: admin.id,
        entityType: "Puzzle",
        entityId: carpathians.id,
        action: "puzzle.created",
        details: { source: "seed" },
      },
      {
        actorId: user.id,
        entityType: "Order",
        entityId: lviv.id,
        action: "order.created",
        details: { itemCount: 2 },
      },
    ],
  });

  console.log("Seed complete.");
  console.log(`  admin: admin@puzzleshare.ua / admin12345`);
  console.log(`  user:  user@puzzleshare.ua / user12345`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
