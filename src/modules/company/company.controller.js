import {
  createCompany,
  getCompanies,
  getCompanyById,
  updateCompany,
  deleteCompany,
  activateCompany
} from "./company.service.js"

// Crear
export const create = async (req, res) => {
  try {
    const company = await createCompany(req.body)

    res.json({
      ok: true,
      data: company
    })
  } catch (error) {
    res.status(400).json({
      ok: false,
      message: error.message
    })
  }
}

// Listar
export const list = async (req, res) => {
  const companies = await getCompanies()

  res.json({
    ok: true,
    data: companies
  })
}

// Obtener por ID
export const getById = async (req, res) => {
  try {
    const company = await getCompanyById(req.params.id)

    if (!company)
      return res.status(404).json({ message: "Empresa no encontrada" })

    res.json({
      ok: true,
      data: company
    })
  } catch (error) {
    res.status(400).json({
      ok: false,
      message: error.message
    })
  }
}

// Actualizar
export const update = async (req, res) => {
  try {
    const company = await updateCompany(req.params.id, req.body)

    res.json({
      ok: true,
      data: company
    })
  } catch (error) {
    res.status(400).json({
      ok: false,
      message: error.message
    })
  }
}

// Desactivar
export const remove = async (req, res) => {
  try {
    await deleteCompany(req.params.id)

    res.json({
      ok: true,
      message: "Empresa desactivada"
    })
  } catch (error) {
    res.status(400).json({
      ok: false,
      message: error.message
    })
  }
}


export const activate = async (req, res) => {
  try {
    await activateCompany(req.params.id)

    res.json({
      ok: true,
      message: "Empresa activada"
    })
  } catch (error) {
    res.status(400).json({
      ok: false,
      message: error.message
    })
  }
}

export const uploadLogo = async (req, res) => {
  try {
    const file = req.file

    if (!file) {
      return res.status(400).json({
        ok: false,
        message: "No se envió ningún archivo"
      })
    }

    const logoUrl = `/uploads/company/${file.filename}`

    const company = await updateCompany(req.params.id, {
      logo: logoUrl
    })

    res.json({
      ok: true,
      data: company
    })
  } catch (error) {
    res.status(400).json({
      ok: false,
      message: error.message
    })
  }
}
