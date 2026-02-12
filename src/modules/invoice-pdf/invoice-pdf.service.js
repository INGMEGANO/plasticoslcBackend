import PDFDocument from 'pdfkit'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { generateQR } from './utils/qr.generator.js'
import { modernTemplate } from './templates/modern.template.js'
import { dianTemplate } from './templates/dian.template.js'
import { PrismaClient } from '@prisma/client'

import { PassThrough } from 'stream'

const prisma = new PrismaClient()

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)



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
  // Cargar logo de forma segura
  const logoPath = path.join(
    process.cwd(),
    'uploads',
    'company',
    'logo.png'
  )

const logo = fs.existsSync(logoPath) ? logoPath : null


  // Seleccionar template
  if (style === 'dian') {
    dianTemplate(doc, invoice, logo, qrImage)
  } else {
    modernTemplate(doc, invoice, logo, qrImage)
  }

  doc.end()

  return doc
}


export async function generateInvoicePDFBuffer(invoiceId, style = 'modern') {
  const invoice = await prisma.invoice.findUnique({
    where: { id: Number(invoiceId) },
    include: {
      details: {
        include: { product: true }
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

  const qrData = `https://catalogo-vpfe.dian.gov.co/document/searchqr?documentkey=${invoice.cufe || 'SIN-CUFE'}`
  const qrImage = await generateQR(qrData)

  const logoPath = path.join(
    process.cwd(),
    'uploads',
    'company',
    'logo.png'
  )

  const logo = fs.existsSync(logoPath) ? logoPath : null

  if (style === 'dian') {
    dianTemplate(doc, invoice, logo, qrImage)
  } else {
    modernTemplate(doc, invoice, logo, qrImage)
  }

  const stream = new PassThrough()
  const chunks = []

  doc.pipe(stream)

  stream.on('data', chunk => chunks.push(chunk))

  return new Promise((resolve, reject) => {
    stream.on('end', () => {
      resolve(Buffer.concat(chunks))
    })

    stream.on('error', reject)

    doc.end()
  })
}