export function dianTemplate(doc, invoice, logo, qrImage) {
  const formatMoney = (value) =>
    Number(value || 0).toLocaleString("es-CO", {
      minimumFractionDigits: 2,
    });

  const formatDate = (date) =>
    date ? new Date(date).toLocaleDateString("es-CO") : "";

  /* =====================================
     HEADER SIMPLE FORMAL
  ===================================== */

  if (logo) {
    doc.image(logo, 40, 15, {
      fit: [100, 75],
    });
  }

  doc.fontSize(14).text("FACTURA ELECTRÓNICA DE VENTA", 200, 50);

  doc
    .fontSize(9)
    .text(`Prefijo: ${invoice.orderPrefix}`, 400, 40)
    .text(`Número: ${invoice.orderId}`, 400, 55)
    .text(`Fecha: ${formatDate(invoice.orderDate)}`, 400, 70);

  /* =====================================
     DATOS CLIENTE
  ===================================== */

  doc.moveTo(40, 100).lineTo(550, 100).stroke();

  doc.fontSize(10);
  doc.text(`Cliente: ${invoice.orderReceiverName}`, 40, 110);
  doc.text(`NIT: ${invoice.orderReceiverNit}`, 40, 125);
  doc.text(`Dirección: ${invoice.orderReceiverAddress}`, 40, 140);
  doc.text(`Teléfono: ${invoice.orderReceiverPhone}`, 40, 155);

  /* =====================================
     TABLA
  ===================================== */

  let y = 180;

  doc.moveTo(40, y).lineTo(550, y).stroke();

  y += 10;

  doc.fontSize(10);
  doc.text("Descripción", 40, y);
  doc.text("Cant", 300, y, { width: 50, align: "right" });
  doc.text("Precio", 370, y, { width: 70, align: "right" });
  doc.text("Total", 460, y, { width: 80, align: "right" });

  y += 15;
  doc.moveTo(40, y).lineTo(550, y).stroke();
  y += 10;

  invoice.details.forEach((item) => {
    const quantity = Number(item.orderItemQuantity || 0);
    const price = Number(item.orderItemPrice || 0);
    const total = Number(item.orderItemFinalAmount || quantity * price);

    const description =
      item.itemName || item.descripcion || item.product?.name || "";

    doc.text(description, 40, y);
    doc.text(quantity.toFixed(2), 300, y, { width: 50, align: "right" });
    doc.text(formatMoney(price), 370, y, { width: 70, align: "right" });
    doc.text(formatMoney(total), 460, y, { width: 80, align: "right" });

    y += 20;
  });

  doc.moveTo(40, y).lineTo(550, y).stroke();

  /* =====================================
     TOTALES
  ===================================== */

  y += 20;

  doc.text(`Subtotal: $${formatMoney(invoice.orderTotalBeforeTax)}`, 350, y);

  y += 15;

  doc.text(`IVA: $${formatMoney(invoice.orderTotalTax)}`, 350, y);

  y += 15;

  doc
    .fontSize(12)
    .text(`TOTAL: $${formatMoney(invoice.orderTotalAmountDue)}`, 350, y);

  /* =====================================
     QR + CUFE
  ===================================== */

  if (qrImage) {
    doc.image(qrImage, 40, 650, { width: 80 });
  }

  doc.fontSize(8);
  doc.text(`CUFE: ${invoice.cufe || ""}`, 40, 730);
}
