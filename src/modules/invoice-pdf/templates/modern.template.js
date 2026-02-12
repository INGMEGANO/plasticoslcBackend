export function modernTemplate(doc, invoice, logo, qrImage) {
  const formatMoney = value =>
    Number(value || 0).toLocaleString('es-CO', {
      minimumFractionDigits: 2
    })

  const formatDate = date =>
    date ? new Date(date).toLocaleDateString('es-CO') : ''

  const pageWidth = doc.page.width

  /* =====================================================
     HEADER OSCURO
  ===================================================== */

  doc.save()
  doc.rect(0, 0, pageWidth, 70).fill('#111827')
  doc.restore()

  doc.fillColor('white')
  doc.fontSize(18)
  doc.text('FACTURA DE VENTA', 40, 25)

  doc.fillColor('black')

  /* =====================================================
     LOGO
  ===================================================== */

  if (logo) {
    doc.image(logo, 40, 75, {
      fit: [100, 70],
    });
  }


  /* =====================================================
     INFO FACTURA
  ===================================================== */

  doc.fontSize(10)

  doc.text(`Prefijo: ${invoice.orderPrefix}`, 380, 90)
  doc.text(`Número: ${invoice.orderId}`, 380, 105)
  doc.text(`Fecha: ${formatDate(invoice.orderDate)}`, 380, 120)
  doc.text(`Vencimiento: ${formatDate(invoice.dueDate)}`, 380, 135)

  /* =====================================================
     BLOQUE CLIENTE
  ===================================================== */

  doc.roundedRect(40, 150, 510, 90, 6).stroke('#d1d5db')

  doc.fontSize(12).text('Datos del Cliente', 50, 160)

  doc.fontSize(10)
  doc.text(`Nombre: ${invoice.orderReceiverName}`, 50, 180)
  doc.text(`NIT: ${invoice.orderReceiverNit}`, 50, 195)
  doc.text(`Dirección: ${invoice.orderReceiverAddress}`, 50, 210)
  doc.text(`Teléfono: ${invoice.orderReceiverPhone}`, 50, 225)

  /* =====================================================
     TABLA
  ===================================================== */

  let y = 270

  doc.save()
  doc.rect(40, y, 510, 25).fill('#f3f4f6')
  doc.restore()

  doc.fontSize(11)
  doc.text('Descripción', 50, y + 7)
  doc.text('Cant', 300, y + 7, { width: 50, align: 'right' })
  doc.text('Precio', 370, y + 7, { width: 70, align: 'right' })
  doc.text('Total', 460, y + 7, { width: 80, align: 'right' })

  y += 35

  invoice.details.forEach(item => {
    const quantity = Number(item.orderItemQuantity || 0)
    const price = Number(item.orderItemPrice || 0)
    const total = Number(
      item.orderItemFinalAmount || quantity * price
    )

    const description =
      item.itemName ||
      item.descripcion ||
      item.product?.name ||
      ''

    doc.fontSize(10)

    doc.text(description, 50, y, { width: 230 })

    doc.text(quantity.toFixed(2), 300, y, {
      width: 50,
      align: 'right'
    })

    doc.text(formatMoney(price), 370, y, {
      width: 70,
      align: 'right'
    })

    doc.text(formatMoney(total), 460, y, {
      width: 80,
      align: 'right'
    })

    y += 22
  })

  doc.moveTo(40, y).lineTo(550, y).stroke('#e5e7eb')

  /* =====================================================
     TOTALES
  ===================================================== */

  y += 20

  doc.roundedRect(330, y, 220, 90, 6).stroke('#d1d5db')

  doc.fontSize(10)
  doc.text(
    `Subtotal: $${formatMoney(invoice.orderTotalBeforeTax)}`,
    340,
    y + 15
  )

  doc.text(
    `IVA: $${formatMoney(invoice.orderTotalTax)}`,
    340,
    y + 35
  )

  doc.fontSize(13)
  doc.text(
    `TOTAL A PAGAR: $${formatMoney(invoice.orderTotalAmountDue)}`,
    340,
    y + 60
  )

  /* =====================================================
     QR + FOOTER
  ===================================================== */

  if (qrImage) {
    doc.image(qrImage, 40, 650, { width: 90 })
  }

  doc.fontSize(8)

  doc.text(
    'Representación gráfica de la factura electrónica.',
    40,
    740
  )

  doc.text(
    'Firmado digitalmente por el sistema ERP',
    350,
    740,
    { align: 'right' }
  )
}
