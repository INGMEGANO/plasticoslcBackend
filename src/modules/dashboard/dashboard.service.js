import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function getDashboardInvoices() {
  const now = new Date()

  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0)

  const [
    overdueAgg,
    overdueList,
    dueMonthAgg,
    dueMonthList,
    availableAgg,
    availableList,
    paidInvoices,
    monthlySales,
    monthlyCollected,
    totalInvoices,
    totalPaid,
    topDebtors
  ] = await Promise.all([

    // 🔴 VENCIDAS
    prisma.invoice.aggregate({
      _sum: { orderTotalAmountDue: true },
      _count: true,
      where: {
        status: 'PENDING',
        dueDate: { lt: now }
      }
    }),

    prisma.invoice.findMany({
      where: {
        status: 'PENDING',
        dueDate: { lt: now }
      },
      orderBy: { dueDate: 'asc' },
      take: 10
    }),

    // 🟡 VENCEN ESTE MES
    prisma.invoice.aggregate({
      _sum: { orderTotalAmountDue: true },
      _count: true,
      where: {
        status: 'PENDING',
        dueDate: {
          gte: startOfMonth,
          lte: endOfMonth
        }
      }
    }),

    prisma.invoice.findMany({
      where: {
        status: 'PENDING',
        dueDate: {
          gte: startOfMonth,
          lte: endOfMonth
        }
      },
      orderBy: { dueDate: 'asc' },
      take: 10
    }),

    // 🟢 DISPONIBLES
    prisma.invoice.aggregate({
      _sum: { orderTotalAmountDue: true },
      _count: true,
      where: { status: 'PENDING' }
    }),

    prisma.invoice.findMany({
      where: { status: 'PENDING' },
      orderBy: { dueDate: 'asc' },
      take: 10
    }),

    // ⏱ PROMEDIO PAGO
    prisma.invoice.findMany({
      where: {
        status: 'PAID',
        paidAt: { not: null }
      },
      select: {
        orderDate: true,
        paidAt: true
      }
    }),

    // 📊 VENTAS DEL MES
    prisma.invoice.aggregate({
      _sum: { orderTotalAfterTax: true },
      where: {
        orderDate: {
          gte: startOfMonth,
          lte: endOfMonth
        }
      }
    }),

    // 💰 COBRADO DEL MES
    prisma.invoice.aggregate({
      _sum: { orderTotalAfterTax: true },
      where: {
        status: 'PAID',
        paidAt: {
          gte: startOfMonth,
          lte: endOfMonth
        }
      }
    }),

    // 📈 TOTAL FACTURAS
    prisma.invoice.count(),

    prisma.invoice.count({
      where: { status: 'PAID' }
    }),

    // 🚨 TOP 5 CLIENTES CON MÁS DEUDA
    prisma.invoice.groupBy({
      by: ['orderReceiverName'],
      _sum: {
        orderTotalAmountDue: true
      },
      where: {
        status: 'PENDING'
      },
      orderBy: {
        _sum: {
          orderTotalAmountDue: 'desc'
        }
      },
      take: 5
    })
  ])

  // ⏱ Promedio real de pago
  let avgDays = 0

  if (paidInvoices.length > 0) {
    const totalDays = paidInvoices.reduce((acc, inv) => {
      const diff =
        (new Date(inv.paidAt) - new Date(inv.orderDate)) /
        (1000 * 60 * 60 * 24)
      return acc + diff
    }, 0)

    avgDays = Math.round(totalDays / paidInvoices.length)
  }

  const paidPercentage =
    totalInvoices > 0
      ? Math.round((totalPaid / totalInvoices) * 100)
      : 0

  return {
    overdue: {
      total: Number(overdueAgg._sum.orderTotalAmountDue || 0),
      count: overdueAgg._count,
      items: overdueList
    },
    dueThisMonth: {
      total: Number(dueMonthAgg._sum.orderTotalAmountDue || 0),
      count: dueMonthAgg._count,
      items: dueMonthList
    },
    availableForPayment: {
      total: Number(availableAgg._sum.orderTotalAmountDue || 0),
      count: availableAgg._count,
      items: availableList
    },
    averagePaymentDays: avgDays,

    monthlySales: Number(monthlySales._sum.orderTotalAfterTax || 0),
    monthlyCollected: Number(monthlyCollected._sum.orderTotalAfterTax || 0),

    paidPercentage,

    topDebtors
  }
}

export async function getMonthlySalesChart() {
  const prisma = new PrismaClient()
  const now = new Date()

  const months = []

  // Generamos los últimos 12 meses
  for (let i = 11; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1)

    const start = new Date(date.getFullYear(), date.getMonth(), 1)
    const end = new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59)

    months.push({
      label: start.toLocaleString('default', { month: 'short' }) + ' ' + start.getFullYear(),
      start,
      end
    })
  }

  const results = []

  for (const month of months) {
    const [sales, collected] = await Promise.all([
      prisma.invoice.aggregate({
        _sum: { orderTotalAfterTax: true },
        where: {
          orderDate: {
            gte: month.start,
            lte: month.end
          }
        }
      }),

      prisma.invoice.aggregate({
        _sum: { orderTotalAfterTax: true },
        where: {
          status: 'PAID',
          paidAt: {
            gte: month.start,
            lte: month.end
          }
        }
      })
    ])

    results.push({
      month: month.label,
      sales: Number(sales._sum.orderTotalAfterTax || 0),
      collected: Number(collected._sum.orderTotalAfterTax || 0)
    })
  }

  return results
}
