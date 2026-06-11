import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding Eventrack demo data...");

  const org = await prisma.organization.upsert({
    where: { slug: "demo-traiteur" },
    update: {},
    create: {
      name: "Traiteur Démo Eventrack",
      slug: "demo-traiteur",
      plan: "trial",
      subscriptionStatus: "active",
    },
  });

  const zones = ["A1", "A2", "A3", "B1", "B2", "B3", "C1", "C2", "C3", "D1", "D2", "D3"];
  for (let i = 0; i < zones.length; i++) {
    const code = zones[i]!;
    await prisma.warehouseZone.upsert({
      where: { organizationId_code: { organizationId: org.id, code } },
      update: {},
      create: {
        organizationId: org.id,
        code,
        label: `Zone ${code}`,
        gridRow: Math.floor(i / 3),
        gridCol: i % 3,
        sortOrder: i,
      },
    });
  }

  const products = [
    { reference: "241", name: "Réhausse petite", category: "decoration", stockTotal: 24, zone: "D2", shelf: "4", bin: "12" },
    { reference: "242", name: "Réhausse grande", category: "decoration", stockTotal: 16, zone: "D2", shelf: "4", bin: "11" },
    { reference: "284", name: "Cache pot", category: "decoration", stockTotal: 40, zone: "D2", shelf: "3", bin: "5" },
    { reference: "301", name: "Vase noir", category: "decoration", stockTotal: 30, zone: "D1", shelf: "2", bin: "8" },
    { reference: "112", name: "Nappe blanche 180", category: "linen", stockTotal: 200, zone: "C1", shelf: "1", bin: "1" },
    { reference: "113", name: "Serviette de table", category: "linen", stockTotal: 500, zone: "C1", shelf: "2", bin: "3" },
    { reference: "501", name: "Assiette Goutte", category: "cutlery", stockTotal: 400, zone: "B2", shelf: "5", bin: "2" },
    { reference: "502", name: "Fourchette Goutte", category: "cutlery", stockTotal: 400, zone: "B2", shelf: "5", bin: "3" },
  ];

  const createdProducts = [];
  for (const p of products) {
    const product = await prisma.product.upsert({
      where: { organizationId_reference: { organizationId: org.id, reference: p.reference } },
      update: {},
      create: {
        organizationId: org.id,
        reference: p.reference,
        name: p.name,
        category: p.category,
        stockTotal: p.stockTotal,
        stockAvailable: p.stockTotal,
        qrCodeData: `EVTR-${p.reference}`,
      },
    });

    await prisma.productLocation.upsert({
      where: { id: `${product.id}-loc` },
      update: {},
      create: {
        id: `${product.id}-loc`,
        productId: product.id,
        zone: p.zone,
        shelf: p.shelf,
        bin: p.bin,
        quantity: p.stockTotal,
      },
    });

    createdProducts.push(product);
  }

  const trucks = await Promise.all([
    prisma.truck.upsert({
      where: { id: "seed-truck-1" },
      update: {},
      create: {
        id: "seed-truck-1",
        organizationId: org.id,
        name: "Camion 1",
        licensePlate: "AB-123-CD",
        capacity: "12 m³",
        status: "available",
      },
    }),
    prisma.truck.upsert({
      where: { id: "seed-truck-2" },
      update: {},
      create: {
        id: "seed-truck-2",
        organizationId: org.id,
        name: "Camion 2",
        licensePlate: "EF-456-GH",
        capacity: "18 m³",
        status: "on_route",
        currentLocation: "Château Sénéjac",
      },
    }),
  ]);

  const eventDate = new Date("2026-06-11");
  const event = await prisma.event.upsert({
    where: { id: "seed-event-1" },
    update: {},
    create: {
      id: "seed-event-1",
      organizationId: org.id,
      name: "Château Sénéjac - Dîner assis",
      clientName: "Château Sénéjac",
      date: eventDate,
      startTime: "19:00",
      address: "Château Sénéjac, 33390 Blaye",
      guestsAdults: 116,
      guestsChildren: 2,
      eventType: "Dîner assis",
      truckId: trucks[1]!.id,
      status: "to_prepare",
      comments: "Linge propre et repassé demandé. Prévoir installation avant 16h.",
    },
  });

  const orderLines = [
    { section: "decoration_buffet", ref: "284", qty: 6 },
    { section: "decoration_buffet", ref: "301", qty: 12 },
    { section: "table_linen", ref: "112", qty: 14 },
    { section: "table_linen", ref: "113", qty: 130 },
    { section: "cutlery_goutte", ref: "501", qty: 130 },
    { section: "cutlery_goutte", ref: "502", qty: 130 },
  ];

  for (let i = 0; i < orderLines.length; i++) {
    const line = orderLines[i]!;
    const product = createdProducts.find((p) => p.reference === line.ref);
    if (!product) continue;

    await prisma.orderLine.upsert({
      where: { id: `seed-line-${i}` },
      update: {},
      create: {
        id: `seed-line-${i}`,
        eventId: event.id,
        section: line.section,
        productId: product.id,
        designation: product.name,
        quantityRequested: line.qty,
        quantityAvailableAtOrder: product.stockAvailable,
        locationSnapshot: "D2 - Étagère 3",
        sortOrder: i,
      },
    });
  }

  console.log(`✅ Organization: ${org.name} (${org.slug})`);
  console.log(`✅ Products: ${createdProducts.length}`);
  console.log(`✅ Trucks: ${trucks.length}`);
  console.log(`✅ Event: ${event.name}`);
  console.log("ℹ️  Run auth seed after creating demo users via the app.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
