import { Prisma, PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const main = async () => {
  await prisma.preorder.deleteMany();
  await prisma.status.deleteMany();

  // Preorders reference status records by id, so recreate the canonical statuses first.
  const activeStatus = await prisma.status.create({
    data: { id: "active-id", name: "active" },
  });

  const inactiveStatus = await prisma.status.create({
    data: { id: "inactive-id", name: "inactive" },
  });

  const datePart = new Date().toISOString().slice(0, 10).replaceAll("-", "");

  // Seed rows mirror the target preorders table screenshot: name, products, timing, and status.
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

  // orderNumber is still generated for API compatibility, but it is not displayed in the table.
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
    await prisma.preorder.create({
      data: preorder as unknown as Prisma.PreorderUncheckedCreateInput,
    });
  }

  console.log(`Seeded ${preorders.length} preorders`);
};

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
