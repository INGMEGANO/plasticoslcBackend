import { getDashboardInvoices,getMonthlySalesChart  } from './dashboard.service.js'

export const invoiceDashboard = async (req, res) => {
  try {
    const data = await getDashboardInvoices()

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

export const monthlySalesChart = async (req, res) => {
  try {
    const data = await getMonthlySalesChart()

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