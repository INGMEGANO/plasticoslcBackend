import { generateInvoicePDF } from './invoice-pdf.service.js'

export async function downloadInvoicePDF(req, res) {
  try {
    const { id } = req.params
    const { style } = req.query

    const pdfStream = await generateInvoicePDF(id, style)

    res.setHeader('Content-Type', 'application/pdf')
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=invoice-${id}.pdf`
    )

    pdfStream.pipe(res)
  } catch (error) {
    res.status(400).json({
      ok: false,
      message: error.message
    })
  }
}
