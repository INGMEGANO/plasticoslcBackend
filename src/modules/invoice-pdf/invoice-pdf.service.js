import PDFDocument from 'pdfkit'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { generateQR } from './utils/qr.generator.js'
import { modernTemplate } from './templates/modern.template.js'
import { dianTemplate } from './templates/dian.template.js'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

let logo = null;

try {
  const logoPathEnv = process.env.COMPANY_LOGO_PATH;

  if (logoPathEnv) {
    const fullPath = path.join(process.cwd(), logoPathEnv);

    if (fs.existsSync(fullPath)) {
      logo = fullPath;
    } else {
      console.warn('El archivo del logo no existe en la ruta:', fullPath);
    }
  } else {
    console.warn('No se ha definido la variable de entorno COMPANY_LOGO_PATH.');
  }
} catch (error) {
  console.error('Error al cargar el logo:', error.message);
}

console.log('Ruta del logo:', logo);

export async function generateInvoicePDF(invoiceId, style = 'modern') {
  const invoice = await prisma.invoice.findUnique({
    where: { id: Number(invoiceId) },
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

  const doc = new PDFDocument({
    size: 'LETTER',
    margin: 40
  })

  // Generar QR (URL escalable DIAN)
  const qrData = `https://catalogo-vpfe.dian.gov.co/document/searchqr?documentkey=${invoice.cufe || 'SIN-CUFE'}`
  const qrImage = await generateQR(qrData)

  // Cargar logo
  const logoPath = path.join(
    process.cwd(),
    'uploads',
    'company',
    'logo.png'
    )

  // Seleccionar template
  if (style === 'dian') {
    dianTemplate(doc, invoice, logo, qrImage)
  } else {
    modernTemplate(doc, invoice, logo, qrImage)
  }

  doc.end()

  return doc
}
