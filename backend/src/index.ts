import express from 'express'
import cors from 'cors'
import { createClient } from '@supabase/supabase-js'

const app  = express()
const PORT = process.env.PORT || 4000

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://cetpegtvkpjipshapjmm.supabase.co'
const SUPABASE_KEY = process.env.SUPABASE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNldHBlZ3R2a3BqaXBzaGFwam1tIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk2NDQwMzksImV4cCI6MjA5NTIyMDAzOX0.bc5o6RBYUBf942tZCoQYXla1XUQE1j8u4FOfvIdBaVk'

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

app.use(cors())
app.use(express.json({ limit: '15mb' }))

// GET — obtener configuración
app.get('/api/config', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('configuracion')
      .select('datos')
      .eq('id', 1)
      .single()

    if (error) {
      console.error('Error al leer:', error)
      return res.json({})
    }

    return res.json(data?.datos || {})
  } catch (err) {
    console.error('Error inesperado:', err)
    return res.status(500).json({ error: 'Error al obtener configuración' })
  }
})

// PUT — guardar configuración
app.put('/api/config', async (req, res) => {
  try {
    const { error } = await supabase
      .from('configuracion')
      .upsert({ id: 1, datos: req.body, updated_at: new Date().toISOString() })

    if (error) {
      console.error('Error al guardar:', error)
      return res.status(500).json({ error: 'Error al guardar configuración' })
    }

    return res.json({ mensaje: 'Configuración guardada exitosamente' })
  } catch (err) {
    console.error('Error inesperado:', err)
    return res.status(500).json({ error: 'Error inesperado' })
  }
})

// Health check
app.get('/api/health', (req, res) => {
  return res.json({ status: 'ok' })
})

app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`)
})