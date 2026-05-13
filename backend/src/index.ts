import express from 'express'
import cors from 'cors'
import fs from 'fs'
import path from 'path'

const app  = express()
const PORT = process.env.PORT || 4000
const DATA_FILE = path.join(__dirname, '..', 'data', 'config.json')

app.use(cors())
app.use(express.json({ limit: '10mb' }))

// Asegurar que existe la carpeta data
const dataDir = path.join(__dirname, '..', 'data')
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true })

// GET — obtener configuración
app.get('/api/config', (req, res) => {
  try {
    if (!fs.existsSync(DATA_FILE)) {
      return res.json({})
    }
    const data = fs.readFileSync(DATA_FILE, 'utf-8')
    return res.json(JSON.parse(data))
  } catch {
    return res.status(500).json({ error: 'Error al leer configuración' })
  }
})

// PUT — guardar configuración
app.put('/api/config', (req, res) => {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(req.body, null, 2))
    return res.json({ mensaje: 'Configuración guardada exitosamente' })
  } catch {
    return res.status(500).json({ error: 'Error al guardar configuración' })
  }
})

// Health check
app.get('/api/health', (req, res) => {
  return res.json({ status: 'ok' })
})

app.listen(PORT, () => {
  console.log(`🚀 Servidor web corriendo en http://localhost:${PORT}`)
})