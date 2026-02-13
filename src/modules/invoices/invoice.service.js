import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()



export async function createInvoice(data) {
  return prisma.$transaction(async (tx) => {

    let totalBeforeTax = 0
    let totalTax = 0
    let totalAfterTax = 0

    const productsCache = []

    // 0️⃣ VALIDAR EMPRESA
    const company = await tx.company.findFirst({
      where: { active: true }
    })

    if (!company)
      throw new Error("No existe una empresa activa")

    // 0️⃣.5 VALIDAR USUARIO
    const user = await tx.user.findUnique({
      where: { id: data.userId }
    })

    if (!user)
      throw new Error("Usuario no existe")

    // 1️⃣ VALIDAR ITEMS Y CALCULAR
    for (const item of data.items) {

      const product = await tx.product.findUnique({
        where: { id: item.productId }
      })

      if (!product)
        throw new Error(`Producto no existe`)

      // Usar orderItemQuantity si existe, sino quantity
      const quantity = Number(item.orderItemQuantity || item.quantity)

      if (product.type !== "SERVICE") {
        if (product.stock < quantity)
          throw new Error(`Stock insuficiente para ${product.name}`)
      }

      // ✅ Usar valores del payload si vienen, sino recalcular
      const price = Number(item.orderItemPrice || product.price)
      const subtotal = price * quantity
      const itemDesc = Number(item.orderItemDesc ?? 0)
      const iva = Number(item.orderItemIva !== undefined ? item.orderItemIva : subtotal * 0.19)
      const total = Number(item.orderItemFinalAmount || subtotal + iva - itemDesc)

      // ✅ VALIDAR DATOS ENVIADOS vs CALCULADOS
      if (item.orderItemFinalAmount) {
        const expectedTotal = subtotal + iva - itemDesc
        const diff = Math.abs(expectedTotal - total)
        if (diff > 0.01) {
          throw new Error(
            `Item ${item.itemName}: Total incorrecto. Enviaste ${total}, esperado ${expectedTotal.toFixed(2)}`
          )
        }
      }

      totalBeforeTax += subtotal
      totalTax += iva
      totalAfterTax += total

      productsCache.push({
        product,
        quantity: quantity,
        price: price,
        subtotal,
        iva,
        itemDesc,
        total
      })
    }

    // ===============================
    // 🔹 DESCUENTOS Y RETENCIONES
    // ===============================

    const globalDiscount = Number(data.globalDiscount || 0)

    const reteFuentePercent = Number(data.reteFuentePercent || 0)
    const reteIcaPercent = Number(data.reteIcaPercent || 0)

    // Base después de descuento
    const taxableBase = totalBeforeTax - globalDiscount

    // Retenciones (si aplican)
    const reteFuente = taxableBase * (reteFuentePercent / 100)
    const reteIca = taxableBase * (reteIcaPercent / 100)

    const totalRetenciones = reteFuente + reteIca

    // Total final real a pagar
    const grandTotal =
      totalAfterTax - globalDiscount - totalRetenciones

    // ===============================
    // 2️⃣ GENERAR CONSECUTIVO
    // ===============================

    const nextNumber = await getNextInvoiceNumber(tx, data.orderPrefix)

    // ===============================
    // 3️⃣ CREAR FACTURA
    // ===============================

    const invoice = await tx.invoice.create({
      data: {
        companyId: company.id,

        status: data.status || "1",
        dianStatus: "PENDING",

        orderId: nextNumber,
        orderPrefix: data.orderPrefix,

        orderReceiverName: data.orderReceiverName,
        orderReceiverNit: data.orderReceiverNit,
        orderReceiverAddress: data.orderReceiverAddress,
        orderReceiverPhone: data.orderReceiverPhone || "",

        userId: data.userId,
        
        // 🔹 INFORMACIÓN ADICIONAL
        orderDate: data.orderDate ? new Date(data.orderDate) : new Date(),
        note: data.note || null,
        cufe: data.cufe || "",
        orderResolution: data.orderResolution || null,
        paymentForms: data.paymentForms || 0,
        paymentMethods: data.paymentMethods || 0,
        plazoPago: data.plazoPago || "0",
        vencimiento: data.vencimiento || "0",
        orderTaxPer: data.orderTaxPer || "19",
        ciiu: data.ciiu || null,
        autoretencion: data.autoretencion || 0,

        // 🔹 TOTALES
        orderSubtotalBeforeTax: totalBeforeTax,
        orderTotalBeforeTax: taxableBase,
        orderTotalTax: totalTax,

        orderTotalDesc: globalDiscount,

        reteica: data.reteica || reteIca,
        reteiva: data.reteiva || 0,
        retencion: data.retencion || (reteFuente ? "RETEFUENTE" : null),

        orderTotalAfterTax: totalAfterTax,
        orderTotalAmountDue: grandTotal,

        orderAmountPaid: data.orderAmountPaid || grandTotal
      }
    })

    // ===============================
    // 4️⃣ CREAR DETALLE
    // ===============================

    await tx.invoiceDetail.createMany({
      data: productsCache.map(item => ({
        invoiceId: invoice.id,
        orderPrefix: invoice.orderPrefix,
        productId: item.product.id,

        itemCode: item.product.code || "",
        reference: item.product.reference || "",
        itemName: item.product.name,
        descripcion: item.product.description || "",

        orderItemQuantity: item.quantity,
        orderItemPrice: item.price,
        orderItemIva: item.iva,
        orderItemDesc: item.itemDesc,
        orderItemFinalAmount: item.total
      }))
    })

    // ===============================
    // 5️⃣ DESCONTAR STOCK + MOVIMIENTO
    // ===============================

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

    // ===============================
    // 6️⃣ RETORNAR FACTURA COMPLETA
    // ===============================

    const fullInvoice = await tx.invoice.findUnique({
      where: { id: invoice.id },
      include: {
        company: true,
        details: {
          include: {
            product: true
          }
        }
      }
    })

    return fullInvoice
  })
}

export async function updateInvoice(id, data) {
  return prisma.$transaction(async (tx) => {

    // 1️⃣ BUSCAR FACTURA EXISTENTE
    const existing = await tx.invoice.findUnique({
      where: { id },
      include: { details: true }
    })

    if (!existing)
      throw new Error("Factura no existe")

    if (existing.dianStatus === "APPROVED")
      throw new Error("No se puede modificar una factura aprobada por DIAN")

    // 1️⃣.5 VALIDAR USUARIO (si viene en los datos)
    if (data.userId) {
      const userCheck = await tx.user.findUnique({
        where: { id: data.userId }
      })

      if (!userCheck)
        throw new Error("Usuario no existe")
    }

    // =====================================
    // 2️⃣ DEVOLVER STOCK ANTERIOR
    // =====================================

    for (const detail of existing.details) {

      const product = await tx.product.findUnique({
        where: { id: detail.productId }
      })

      if (product && product.type !== "SERVICE") {
        await tx.product.update({
          where: { id: product.id },
          data: {
            stock: { increment: detail.orderItemQuantity }
          }
        })
      }
    }

    // =====================================
    // 3️⃣ BORRAR DETALLES ANTERIORES
    // =====================================

    await tx.invoiceDetail.deleteMany({
      where: { invoiceId: id }
    })

    // =====================================
    // 4️⃣ RECALCULAR TODO
    // =====================================

    let totalBeforeTax = 0
    let totalTax = 0
    let totalAfterTax = 0

    const productsCache = []

    for (const item of data.items) {

      const product = await tx.product.findUnique({
        where: { id: item.productId }
      })

      if (!product)
        throw new Error("Producto no existe")

      // Usar orderItemQuantity si existe, sino quantity
      const quantity = Number(item.orderItemQuantity || item.quantity)

      if (product.type !== "SERVICE") {
        if (product.stock < quantity)
          throw new Error(`Stock insuficiente para ${product.name}`)
      }

      // ✅ Usar valores del payload si vienen, sino recalcular
      const price = Number(item.orderItemPrice || product.price)
      const subtotal = price * quantity
      const itemDesc = Number(item.orderItemDesc ?? 0)
      const iva = Number(item.orderItemIva !== undefined ? item.orderItemIva : subtotal * 0.19)
      const total = Number(item.orderItemFinalAmount || subtotal + iva - itemDesc)

      // ✅ VALIDAR DATOS ENVIADOS vs CALCULADOS
      if (item.orderItemFinalAmount) {
        const expectedTotal = subtotal + iva - itemDesc
        const diff = Math.abs(expectedTotal - total)
        if (diff > 0.01) {
          throw new Error(
            `Item ${item.itemName}: Total incorrecto. Enviaste ${total}, esperado ${expectedTotal.toFixed(2)}`
          )
        }
      }

      totalBeforeTax += subtotal
      totalTax += iva
      totalAfterTax += total

      productsCache.push({
        product,
        quantity: quantity,
        price: price,
        subtotal,
        iva,
        itemDesc,
        total
      })
    }

    // 🔹 DESCUENTOS Y RETENCIONES
    const globalDiscount = Number(data.globalDiscount || 0)
    const reteFuentePercent = Number(data.reteFuentePercent || 0)
    const reteIcaPercent = Number(data.reteIcaPercent || 0)

    const taxableBase = totalBeforeTax - globalDiscount

    const reteFuente = taxableBase * (reteFuentePercent / 100)
    const reteIca = taxableBase * (reteIcaPercent / 100)

    const totalRetenciones = reteFuente + reteIca

    const grandTotal =
      totalAfterTax - globalDiscount - totalRetenciones

    // =====================================
    // 5️⃣ ACTUALIZAR CABECERA
    // =====================================

    const updatedInvoice = await tx.invoice.update({
      where: { id },
      data: {

        orderReceiverName: data.orderReceiverName,
        orderReceiverNit: data.orderReceiverNit,
        orderReceiverAddress: data.orderReceiverAddress,
        orderReceiverPhone: data.orderReceiverPhone || "",

        orderSubtotalBeforeTax: totalBeforeTax,
        orderTotalBeforeTax: taxableBase,
        orderTotalTax: totalTax,

        orderTotalDesc: globalDiscount,

        reteica: data.reteica || reteIca,
        reteiva: data.reteiva || 0,
        retencion: data.retencion || (reteFuente ? "RETEFUENTE" : null),

        orderTotalAfterTax: totalAfterTax,
        orderTotalAmountDue: grandTotal,

        orderAmountPaid: data.orderAmountPaid || grandTotal,

        // 🔹 INFORMACIÓN ADICIONAL
        orderDate: data.orderDate ? new Date(data.orderDate) : undefined,
        note: data.note !== undefined ? data.note : undefined,
        cufe: data.cufe !== undefined ? data.cufe : undefined,
        orderResolution: data.orderResolution !== undefined ? data.orderResolution : undefined,
        paymentForms: data.paymentForms !== undefined ? data.paymentForms : undefined,
        paymentMethods: data.paymentMethods !== undefined ? data.paymentMethods : undefined,
        plazoPago: data.plazoPago !== undefined ? data.plazoPago : undefined,
        vencimiento: data.vencimiento !== undefined ? data.vencimiento : undefined,
        orderTaxPer: data.orderTaxPer !== undefined ? data.orderTaxPer : undefined,
        ciiu: data.ciiu !== undefined ? data.ciiu : undefined,
        autoretencion: data.autoretencion !== undefined ? data.autoretencion : undefined,

        updatedAt: new Date()
      }
    })

    // =====================================
    // 6️⃣ CREAR NUEVOS DETALLES
    // =====================================

    await tx.invoiceDetail.createMany({
      data: productsCache.map(item => ({
        invoiceId: id,
        orderPrefix: existing.orderPrefix,
        productId: item.product.id,

        itemCode: item.product.code || "",
        reference: item.product.reference || "",
        itemName: item.product.name,
        descripcion: item.product.description || "",

        orderItemQuantity: item.quantity,
        orderItemPrice: item.price,
        orderItemIva: item.iva,
        orderItemDesc: item.itemDesc,
        orderItemFinalAmount: item.total
      }))
    })

    // =====================================
    // 7️⃣ DESCONTAR STOCK NUEVO
    // =====================================

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
            reference: "INVOICE-UPDATE",
            referenceId: id
          }
        })
      }
    }

    // =====================================
    // 8️⃣ RETORNAR COMPLETA
    // =====================================

    return await tx.invoice.findUnique({
      where: { id },
      include: {
        company: true,
        details: {
          include: { product: true }
        }
      }
    })
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
      orderBy: { id: 'desc' },
      include: {
        details: {
          include: {
            product: true
          }
        }
      }
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
      details: {
        include: {
          product: true
        }
      }
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
      details: {
        include: {
          product: true
        }
      }
    }
  })

  if (!invoice) {
    throw new Error('Factura no encontrada')
  }

  return invoice
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

    // 🔹 Devolver stock
    for (const item of invoice.details) {
      if (!item.productId) continue

      if (item.product?.type !== "SERVICE") {
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