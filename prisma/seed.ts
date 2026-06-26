import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  await prisma.preorder.deleteMany()

  const datePart = new Date().toISOString().slice(0, 10).replaceAll('-', '')
  const preorders = [
    { orderNumber: `ORD-${datePart}-000001`, customerName: 'Rahim Uddin', email: 'rahim@example.com', product: 'iPhone 15 Pro', quantity: 2, price: 129999, status: 'active', notes: 'Urgent delivery needed' },
    { orderNumber: `ORD-${datePart}-000002`, customerName: 'Karim Hossain', email: 'karim@example.com', product: 'Samsung Galaxy S24', quantity: 1, price: 89999, status: 'active', notes: null },
    { orderNumber: `ORD-${datePart}-000003`, customerName: 'Fatema Begum', email: 'fatema@example.com', product: 'MacBook Air M3', quantity: 1, price: 149999, status: 'inactive', notes: 'Waiting for stock' },
    { orderNumber: `ORD-${datePart}-000004`, customerName: 'Nasrin Akter', email: 'nasrin@example.com', product: 'iPad Pro 12.9', quantity: 3, price: 99999, status: 'active', notes: null },
    { orderNumber: `ORD-${datePart}-000005`, customerName: 'Jamal Uddin', email: 'jamal@example.com', product: 'Sony WH-1000XM5', quantity: 5, price: 34999, status: 'inactive', notes: 'Bulk order' },
    { orderNumber: `ORD-${datePart}-000006`, customerName: 'Rashed Khan', email: 'rashed@example.com', product: 'Dell XPS 15', quantity: 1, price: 189999, status: 'active', notes: null },
    { orderNumber: `ORD-${datePart}-000007`, customerName: 'Sadia Islam', email: 'sadia@example.com', product: 'Apple Watch Series 9', quantity: 2, price: 49999, status: 'active', notes: 'Gift wrapping required' },
    { orderNumber: `ORD-${datePart}-000008`, customerName: 'Mizanur Rahman', email: 'mizan@example.com', product: 'Canon EOS R50', quantity: 1, price: 79999, status: 'inactive', notes: null },
    { orderNumber: `ORD-${datePart}-000009`, customerName: 'Tasnim Jahan', email: 'tasnim@example.com', product: 'OnePlus 12', quantity: 4, price: 59999, status: 'active', notes: null },
    { orderNumber: `ORD-${datePart}-000010`, customerName: 'Arif Hasan', email: 'arif@example.com', product: 'Logitech MX Master 3', quantity: 10, price: 12999, status: 'active', notes: 'Office purchase' },
    { orderNumber: `ORD-${datePart}-000011`, customerName: 'Sumaiya Khatun', email: 'sumaiya@example.com', product: 'Nintendo Switch OLED', quantity: 2, price: 45999, status: 'inactive', notes: null },
    { orderNumber: `ORD-${datePart}-000012`, customerName: 'Tariq Aziz', email: 'tariq@example.com', product: 'GoPro Hero 12', quantity: 1, price: 39999, status: 'active', notes: null },
  ]

  for (const preorder of preorders) {
    await prisma.preorder.create({ data: preorder })
  }

  console.log(`Seeded ${preorders.length} preorders`)
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
