import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function getDashboardInvoices() {
  const now = new Date()

  const invoices = await prisma.invoice.findMany({
    where: {
      status: { not: '1' } // no pagadas
    }
  })

  let overdue = []
  let dueThisMonth = []
  let available = []

  for (const inv of invoices) {
    const plazo = parseInt(inv.plazoPago || '0')
    const dueDate = new Date(inv.orderDate)
    dueDate.setDate(dueDate.getDate() + plazo)

    if (dueDate < now) {
      overdue.push(inv)
    }

    const isSameMonth =
      dueDate.getMonth() === now.getMonth() &&
      dueDate.getFullYear() === now.getFullYear()

    if (isSameMonth) {
      dueThisMonth.push(inv)
    }

    available.push(inv)
  }

  const sum = (list) =>
    list.reduce(
      (acc, i) => acc + Number(i.orderTotalAmountDue || i.orderTotalAfterTax),
      0
    )

  // Promedio de días de pago
  const paidInvoices = await prisma.invoice.findMany({
    where: { status: '1' }
  })

  let avgDays = 0

  if (paidInvoices.length > 0) {
    const totalDays = paidInvoices.reduce((acc, inv) => {
      const plazo = parseInt(inv.plazoPago || '0')
      return acc + plazo
    }, 0)

    avgDays = Math.round(totalDays / paidInvoices.length)
  }

  return {
    overdue: {
      total: sum(overdue),
      count: overdue.length,
      items: overdue
    },
    dueThisMonth: {
      total: sum(dueThisMonth),
      count: dueThisMonth.length,
      items: dueThisMonth
    },
    averagePaymentDays: avgDays,
    availableForPayment: {
      total: sum(available),
      count: available.length,
      items: available
    }
  }
}
