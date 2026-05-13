const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:4000'

export const obtenerConfig = async () => {
  try {
    const res = await fetch(`${API_URL}/api/config`)
    if (!res.ok) throw new Error('Error al obtener config')
    return await res.json()
  } catch {
    return null
  }
}

export const guardarConfig = async (data: any) => {
  try {
    const res = await fetch(`${API_URL}/api/config`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    if (!res.ok) throw new Error('Error al guardar config')
    return await res.json()
  } catch {
    return null
  }
}