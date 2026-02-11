import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function createInvoice(data) {
  return prisma.$transaction(async (tx) => {

  let totalBeforeTax = 0
  let totalTax = 0
  let totalAfterTax = 0

  const productsCache = []

  // 1️⃣ VALIDAR Y CALCULAR
  for (const item of data.items) {

    const product = await tx.product.findUnique({
      where: { id: item.productId }
    })

    if (!product)
      throw new Error(`Producto no existe`)

    if (product.type !== "SERVICE") {
      if (product.stock < item.quantity)
        throw new Error(`Stock insuficiente para ${product.name}`)
    }

    const subtotal = Number(product.price) * Number(item.quantity)
    const iva = subtotal * 0.19
    const total = subtotal + iva

    totalBeforeTax += subtotal
    totalTax += iva
    totalAfterTax += total

    productsCache.push({
      product,
      quantity: item.quantity,
      iva,
      total
    })
  }

  // 2️⃣ GENERAR CONSECUTIVO
  const nextNumber = await getNextInvoiceNumber(tx, data.orderPrefix)

  // 3️⃣ CREAR FACTURA
  const invoice = await tx.invoice.create({
    data: {
        status: "1",
        dianStatus: "PENDING",
        orderId: nextNumber,
        orderPrefix: data.orderPrefix,

        orderReceiverName: data.orderReceiverName,
        orderReceiverNit: data.orderReceiverNit,
        orderReceiverAddress: data.orderReceiverAddress,
        orderReceiverPhone: data.orderReceiverPhone || "",

        userId: data.userId,

        orderSubtotalBeforeTax: totalBeforeTax,
        orderTotalBeforeTax: totalBeforeTax,
        orderTotalTax: totalTax,
        orderTotalAfterTax: totalAfterTax,
        orderAmountPaid: totalAfterTax
    }
    })


  // 4️⃣ PROCESAR MOVIMIENTOS Y STOCK
  for (const item of productsCache) {

    if (item.product.type !== "SERVICE") {

      await tx.product.update({
        where: { id: item.product.id },
        data: {
          stock: { decrement: item.quantity }
        }
      })

      await tx.inventoryMovement.create({
        data: {
          productId: item.product.id,
          type: "SALE",
          quantity: item.quantity,
          reference: "INVOICE",
          referenceId: invoice.id
        }
      })
    }
  }

  return invoice
})

}


export async function getInvoices(query) {
  const page = Number(query.page) || 1
  const limit = Number(query.limit) || 10
  const skip = (page - 1) * limit

  const where = {}

  if (query.status) {
    where.status = query.status
  }

  if (query.orderReceiverNit) {
    where.orderReceiverNit = {
      contains: query.orderReceiverNit,
      mode: 'insensitive'
    }
  }

  if (query.orderPrefix) {
    where.orderPrefix = query.orderPrefix
  }

  const [data, total] = await prisma.$transaction([
    prisma.invoice.findMany({
      where,
      skip,
      take: limit,
      orderBy: { id: 'desc' }
    }),
    prisma.invoice.count({ where })
  ])

  return {
    data,
    total,
    page,
    lastPage: Math.ceil(total / limit)
  }
}

export async function getInvoiceById(id) {
  const invoice = await prisma.invoice.findUnique({
    where: { id: Number(id) },
    include: {
      details: true
    }
  })

  if (!invoice) {
    throw new Error('Factura no encontrada')
  }

  return invoice
}

export async function getInvoiceByNumber(prefix, orderId) {
  const invoice = await prisma.invoice.findFirst({
    where: {
      orderPrefix: prefix,
      orderId: Number(orderId)
    },
    include: {
      details: true
    }
  })

  if (!invoice) {
    throw new Error('Factura no encontrada')
  }

  return invoice
}


export async function cancelInvoice(prefix, number) {
  return prisma.$transaction(async (tx) => {

    const invoice = await tx.invoice.findFirst({
      where: {
        orderPrefix: prefix,
        orderId: Number(number)
      },
      include: { details: true }
    })

    if (!invoice) {
      throw new Error('Factura no encontrada')
    }

    // 🔴 Si ya fue validada por DIAN
    if (invoice.dianStatus === "ACCEPTED") {
      throw new Error(
        "Factura validada por DIAN. Debe generar Nota Crédito."
      )
    }

    // 🔴 Si ya está anulada
    if (invoice.dianStatus === "VOIDED") {
      throw new Error("La factura ya está anulada")
    }

    if (item.product.type !== "SERVICE") {
        // 🔹 Devolver stock
        for (const item of invoice.details) {
        if (!item.productId) continue

        await tx.product.update({
            where: { id: item.productId },
            data: {
            stock: {
                increment: Number(item.orderItemQuantity)
            }
            }
        })
        }
    }

    // 🔹 Marcar como anulada
    await tx.invoice.update({
      where: { id: invoice.id },
      data: {
        status: "0",
        dianStatus: "VOIDED"
      }
    })

    return { message: "Factura anulada correctamente" }
  })
}

async function getNextInvoiceNumber(tx, prefix) {

  const resolution = await tx.resolution.findUnique({
    where: { prefix }
  })

  if (!resolution)
    throw new Error(`No existe resolución para prefijo ${prefix}`)

  if (!resolution.active)
    throw new Error(`La resolución ${prefix} está inactiva`)

  const nextNumber = resolution.currentNumber + 1

  if (nextNumber > resolution.toNumber)
    throw new Error(`Se agotó el rango autorizado para ${prefix}`)

  // actualizar consecutivo
  await tx.resolution.update({
    where: { prefix },
    data: {
      currentNumber: nextNumber
    }
  })

  return nextNumber
}
