import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()


export async function getAccountsReceivable() {

  const invoices = await prisma.invoice.findMany({
    where: {
      status: {
        not: "CANCELLED"
      }
    },
    include: {
      payments: true
    }
  })

  return invoices.map(invoice => {

    const totalPaid = invoice.payments.reduce(
      (sum, p) => sum + Number(p.amount),
      0
    )

    const balance = invoice.orderTotalAmountDue - totalPaid

    return {
      invoiceId: invoice.id,
      customer: invoice.orderReceiverName,
      total: invoice.orderTotalAmountDue,
      paid: totalPaid,
      balance
    }

  }).filter(i => i.balance > 0)

}


export async function getOverdueInvoices() {

  const today = new Date()

  const invoices = await prisma.invoice.findMany({
    where: {
      dueDate: {
        lt: today
      },
      status: {
        not: "CANCELLED"
      }
    },
    include: {
      payments: true
    }
  })

  return invoices
}


export async function getAccountsReceivableByCustomer() {

  const invoices = await prisma.invoice.findMany({
    where: {
      status: { not: "CANCELLED" }
    },
    include: {
      payments: true
    }
  })

  const map = {}

  for (const inv of invoices) {

    const paid = inv.payments.reduce(
      (sum, p) => sum + Number(p.amount),
      0
    )

    const balance = inv.orderTotalAmountDue - paid

    if (balance <= 0) continue

    if (!map[inv.orderReceiverName]) {
      map[inv.orderReceiverName] = 0
    }

    map[inv.orderReceiverName] += balance
  }

  return Object.entries(map).map(([customer, balance]) => ({
    customer,
    balance
  }))

}