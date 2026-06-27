import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  await prisma.status.deleteMany();
  await prisma.preorder.deleteMany();

  // Create status records
  const activeStatus = await prisma.status.create({
    data: { name: "active" },
  });

  const inactiveStatus = await prisma.status.create({
    data: { name: "inactive" },
  });

  const datePart = new Date().toISOString().slice(0, 10).replaceAll("-", "");
  const seedRows = [
    {
      name: "Multi variant 3",
      products: 1,
      preorderWhen: "out-of-stock",
      startsAt: "2025-12-15T20:24:00",
      endsAt: null,
      statusId: inactiveStatus.id,
    },
    {
      name: "Multi variant 2",
      products: 1,
      preorderWhen: "regardless-of-stock",
      startsAt: "2025-12-15T20:24:00",
      endsAt: "2025-12-15T20:27:00",
      statusId: activeStatus.id,
    },
    {
      name: "Multi variants 1",
      products: 1,
      preorderWhen: "regardless-of-stock",
      startsAt: "2025-12-15T20:24:00",
      endsAt: null,
      statusId: activeStatus.id,
    },
    {
      name: "Partial payment",
      products: 1,
      preorderWhen: "regardless-of-stock",
      startsAt: "2025-08-17T16:56:00",
      endsAt: null,
      statusId: activeStatus.id,
    },
    {
      name: "Shipping not sure",
      products: 1,
      preorderWhen: "regardless-of-stock",
      startsAt: "2025-08-17T16:56:00",
      endsAt: null,
      statusId: activeStatus.id,
    },
    {
      name: "Full payment",
      products: 1,
      preorderWhen: "regardless-of-stock",
      startsAt: "2025-08-17T16:56:00",
      endsAt: null,
      statusId: activeStatus.id,
    },
    {
      name: "Coming soon",
      products: 1,
      preorderWhen: "regardless-of-stock",
      startsAt: "2025-12-11T04:42:00",
      endsAt: null,
      statusId: activeStatus.id,
    },
    {
      name: "With ends",
      products: 1,
      preorderWhen: "regardless-of-stock",
      startsAt: "2025-08-14T03:59:00",
      endsAt: null,
      statusId: activeStatus.id,
    },
  ];

  const preorders = seedRows.map((row, index) => ({
    orderNumber: `ORD-${datePart}-${String(index + 1).padStart(6, "0")}`,
    name: row.name,
    products: row.products,
    statusId: row.statusId,
    preorderWhen: row.preorderWhen,
    startsAt: new Date(row.startsAt),
    endsAt: row.endsAt ? new Date(row.endsAt) : null,
    notes: null,
  }));

  for (const preorder of preorders) {
    await prisma.preorder.create({ data: preorder });
  }

  console.log(`Seeded ${preorders.length} preorders`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
