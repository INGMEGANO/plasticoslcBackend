import * as service from "./accountsReceivable.service.js"

export const getAccountsReceivable = async (req, res) => {

  try {

    const data = await service.getAccountsReceivable()

    res.json({
      ok: true,
      data
    })

  } catch (error) {

    res.status(500).json({
      ok: false,
      message: error.message
    })

  }

}

export const getOverdueInvoices = async (req, res) => {

  try {

    const invoices = await service.getOverdueInvoices()

    res.json({
      ok: true,
      data: invoices
    })

  } catch (error) {

    res.status(500).json({
      ok: false,
      message: error.message
    })

  }

}

export const accountsReceivableByCustomer = async (req, res) => {

  try {

    const data = await service.getAccountsReceivableByCustomer()

    res.json({
      ok: true,
      data
    })

  } catch (error) {

    res.status(500).json({
      ok: false,
      message: error.message
    })

  }

}