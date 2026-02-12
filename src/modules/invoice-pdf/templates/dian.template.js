export function dianTemplate(doc, invoice, logo, qrImage) {
  const formatMoney = (value) =>
    Number(value || 0).toLocaleString("es-CO", {
      minimumFractionDigits: 2,
    });

  const formatDate = (date) =>
    date ? new Date(date).toLocaleDateString("es-CO") : "";

  const pageWidth = doc.page.width;

  /* =====================================
     HEADER FORMAL DIAN
  ===================================== */

  let yStart = 20;

  // Logo izquierda
  if (logo) {
    doc.image(logo, 40, yStart, {
      fit: [110, 80],
    });
  }

  // Título centrado real
  doc
    .fontSize(16)
    .font("Helvetica-Bold")
    .text("FACTURA ELECTRÓNICA DE VENTA", 0, yStart + 20, {
      align: "center",
    });

  doc.font("Helvetica").fontSize(10);

  // Bloque datos factura derecha
  doc
    .text(`Prefijo: ${invoice.orderPrefix || ""}`, pageWidth - 150, yStart + 10)
    .text(`Número: ${invoice.orderId || ""}`, pageWidth - 150, yStart + 25)
    .text(`Fecha: ${formatDate(invoice.orderDate)}`, pageWidth - 150, yStart + 40)
    .text(`Vence: ${formatDate(invoice.dueDate)}`, pageWidth - 150, yStart + 55);

  /* =====================================
     SEPARADOR
  ===================================== */

  doc.moveTo(40, 110).lineTo(pageWidth - 40, 110).stroke();

  /* =====================================
     DATOS CLIENTE
  ===================================== */

  let y = 120;

  doc.font("Helvetica-Bold").fontSize(11).text("DATOS DEL CLIENTE", 40, y);

  y += 15;

  doc.font("Helvetica").fontSize(10);

  doc.text(`Cliente: ${invoice.orderReceiverName || ""}`, 40, y);
  y += 15;
  doc.text(`NIT: ${invoice.orderReceiverNit || ""}`, 40, y);
  y += 15;
  doc.text(`Dirección: ${invoice.orderReceiverAddress || ""}`, 40, y);
  y += 15;
  doc.text(`Teléfono: ${invoice.orderReceiverPhone || ""}`, 40, y);

  /* =====================================
     TABLA
  ===================================== */

  y += 25;

  doc.moveTo(40, y).lineTo(pageWidth - 40, y).stroke();
  y += 8;

  doc.font("Helvetica-Bold").fontSize(10);

  doc.text("Descripción", 40, y);
  doc.text("Cant", 300, y, { width: 50, align: "right" });
  doc.text("Precio", 370, y, { width: 70, align: "right" });
  doc.text("Total", 460, y, { width: 80, align: "right" });

  y += 15;
  doc.moveTo(40, y).lineTo(pageWidth - 40, y).stroke();
  y += 10;

  doc.font("Helvetica").fontSize(10);

  invoice.details.forEach((item) => {
    const quantity = Number(item.orderItemQuantity || 0);
    const price = Number(item.orderItemPrice || 0);
    const total = Number(item.orderItemFinalAmount || quantity * price);

    const description =
      item.itemName || item.descripcion || item.product?.name || "";

    doc.text(description, 40, y, { width: 240 });

    doc.text(quantity.toFixed(2), 300, y, {
      width: 50,
      align: "right",
    });

    doc.text(formatMoney(price), 370, y, {
      width: 70,
      align: "right",
    });

    doc.text(formatMoney(total), 460, y, {
      width: 80,
      align: "right",
    });

    y += 18;
  });

  doc.moveTo(40, y).lineTo(pageWidth - 40, y).stroke();

  /* =====================================
     TOTALES
  ===================================== */

  y += 20;

  doc.font("Helvetica-Bold").fontSize(11);

  doc.text(
    `Subtotal: $${formatMoney(invoice.orderTotalBeforeTax)}`,
    pageWidth - 220,
    y
  );

  y += 15;

  doc.text(
    `IVA: $${formatMoney(invoice.orderTotalTax)}`,
    pageWidth - 220,
    y
  );

  y += 18;

  doc.fontSize(13);

  doc.text(
    `TOTAL A PAGAR: $${formatMoney(invoice.orderTotalAmountDue)}`,
    pageWidth - 220,
    y
  );

  /* =====================================
     QR + CUFE
  ===================================== */

  if (qrImage) {
    doc.image(qrImage, 40, 650, { width: 90 });
  }

  doc.fontSize(8).font("Helvetica");

  doc.text(
    `CUFE: ${invoice.cufe || "SIN CUFE"}`,
    40,
    730,
    { width: pageWidth - 80 }
  );
}
