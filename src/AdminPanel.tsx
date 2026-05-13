import { useState, useEffect, useRef } from 'react'
import { obtenerConfig, guardarConfig } from './services/api'

const CARD   = '#141414'
const BORDER = '#2a2a2a'

const FUENTES_OPCIONES = ['Impact', 'Bebas Neue', 'Oswald', 'Barlow Condensed', 'Anton']
const FUENTES_MAP: Record<string, string> = {
  'Impact':           "'Impact', 'Arial Black', sans-serif",
  'Bebas Neue':       "'Bebas Neue', sans-serif",
  'Oswald':           "'Oswald', sans-serif",
  'Barlow Condensed': "'Barlow Condensed', sans-serif",
  'Anton':            "'Anton', sans-serif",
}

const defaultData = {
  slogan:        'NO SOMOS UN GIMNASIO, SOMOS ONE.',
  sobreOne:      'Somos un gimnasio boutique con un enfoque integral y personalizado. Diseñamos planes a medida, combinando entrenamiento, rehabilitación kinesiológica y nutrición, para lograr resultados reales y seguros.',
  sobreOneFrase: 'Aquí te espera un servicio premium y una experiencia de entrenamiento de alto nivel.',
  horarioSemana: 'Lunes a Viernes: 6:30 a 21:00 hrs.',
  horarioSabado: 'Sábados: 10:00 a 13:00 hrs. (solo recuperativos)',
  fuenteTitulos: 'Impact',
  profesores: [
    { nombre: 'Mariana', foto: '' }, { nombre: 'Mario', foto: '' },
    { nombre: 'Nicolás', foto: '' }, { nombre: 'Jorge', foto: '' },
    { nombre: 'Ignacio', foto: '' }, { nombre: 'Seba', foto: '' },
    { nombre: 'Benja', foto: '' },
  ],
  planes: [
    { nombre: 'PLAN PERSONAL', descripcion: 'Sesiones uno a uno con tu Coach', precios: [{ frecuencia: '2 veces x semana', valor: '$230.000' }, { frecuencia: '3 veces x semana', valor: '$260.000' }, { frecuencia: '4 veces x semana', valor: '$290.000' }] },
    { nombre: 'PLAN DÚO', descripcion: 'Entrenan juntos con un mismo Coach. (Valor por persona)', precios: [{ frecuencia: '2 veces x semana', valor: '$295.000' }, { frecuencia: '3 veces x semana', valor: '$340.000' }, { frecuencia: '4 veces x semana', valor: '$380.000' }, { frecuencia: '5 veces x semana', valor: '$430.000' }] },
    { nombre: 'PLAN 3', descripcion: 'Sesiones en grupos de 3 personas con un Coach en común.', precios: [{ frecuencia: '2 veces x semana', valor: '$125.000' }, { frecuencia: '3 veces x semana', valor: '$150.000' }] },
    { nombre: 'PLAN 4', descripcion: 'Sesiones en grupos de 4 personas con un Coach en común.', precios: [{ frecuencia: '2 veces x semana', valor: '$110.000' }, { frecuencia: '3 veces x semana', valor: '$130.000' }] },
    { nombre: 'PLAN 6', descripcion: 'Sesiones en grupos de 6 personas con un Coach en común.', precios: [{ frecuencia: '2 veces x semana', valor: '$85.000' }, { frecuencia: '3 veces x semana', valor: '$95.000' }, { frecuencia: '4 veces x semana', valor: '$110.000' }, { frecuencia: '5 veces x semana', valor: '$125.000' }] },
    { nombre: 'PASE DIARIO', descripcion: 'Permite asistir a una clase personal o grupal, según disponibilidad.', precios: [{ frecuencia: 'Por sesión', valor: '$12.000' }] },
  ],
  reglamento: [
    { titulo: 'HORARIO', items: ['Lunes a Viernes: 6:30 a 21:00 hrs.', 'Sábados: 10:00 a 13:00 hrs.', 'Sábados solo para recuperación de clases canceladas.'] },
    { titulo: 'CONVIVENCIA Y ORDEN', items: ['Mantener un trato adecuado entre alumnos y profesores.', 'Cada persona cuida el espacio y el equipamiento.', 'Uso obligatorio de toalla personal.', 'Toda bebida retirada debe informarse y ser pagada.'] },
    { titulo: 'PLANES Y PAGOS', items: ['Planes de duración mensual con número fijo de sesiones.', 'Mensualidad a más tardar el día 3 de cada mes.', 'Planes personales e intransferibles.', 'No se realizan devoluciones por inasistencia.'] },
    { titulo: 'CLASES', items: ['Cada clase debe agendarse con anticipación.', 'La clase finaliza en el horario estipulado.', 'Cancelaciones con mínimo 3 horas de anticipación.'] },
    { titulo: 'RECUPERACIÓN', items: ['Planes personales: clase cancelada puede reagendarse en el mes.', 'Grupales: recuperación solo si existe cupo disponible.', 'ONE no reorganiza planificación por inasistencias.'] },
    { titulo: 'RESPONSABILIDAD', items: ['ONE no responde por lesiones por uso incorrecto.', 'Cada persona cuida sus pertenencias personales.', 'ONE no responde por pérdidas dentro del recinto.'] },
  ],
}

interface Props { onLogout: () => void }

const AdminPanel = ({ onLogout }: Props) => {
  const [seccion, setSeccion]           = useState('general')
  const [data, setData]                 = useState(defaultData)
  const [guardado, setGuardado]         = useState(false)
  const [cargando, setCargando]         = useState(true)
  const [nuevaClave, setNuevaClave]     = useState('')
  const [confirmarClave, setConfirmarClave] = useState('')
  const [errorClave, setErrorClave]     = useState('')
  const [exitoClave, setExitoClave]     = useState('')
  const fileRefs = useRef<(HTMLInputElement | null)[]>([])

  useEffect(() => {
    const cargar = async () => {
      setCargando(true)
      const remoto = await obtenerConfig()
      if (remoto && Object.keys(remoto).length > 0) {
        if (remoto.profesores && typeof remoto.profesores[0] === 'string') {
          remoto.profesores = remoto.profesores.map((nombre: string) => ({ nombre, foto: '' }))
        }
        setData({ ...defaultData, ...remoto })
      } else {
        const saved = localStorage.getItem('one_web_data')
        if (saved) {
          try {
            const parsed = JSON.parse(saved)
            if (parsed.profesores && typeof parsed.profesores[0] === 'string') {
              parsed.profesores = parsed.profesores.map((nombre: string) => ({ nombre, foto: '' }))
            }
            setData({ ...defaultData, ...parsed })
          } catch {}
        }
      }
      setCargando(false)
    }
    cargar()
  }, [])

  const guardar = async () => {
    const resultado = await guardarConfig(data)
    localStorage.setItem('one_web_data', JSON.stringify(data))
    if (resultado) {
      setGuardado(true)
      setTimeout(() => setGuardado(false), 3000)
    }
  }

  const cambiarClave = () => {
    setErrorClave(''); setExitoClave('')
    if (nuevaClave.length < 6) { setErrorClave('Mínimo 6 caracteres'); return }
    if (nuevaClave !== confirmarClave) { setErrorClave('Las contraseñas no coinciden'); return }
    const creds = JSON.parse(localStorage.getItem('one_admin_creds') || 'null') || { email: 'juanjo@one.cl', password: 'juanjo123' }
    localStorage.setItem('one_admin_creds', JSON.stringify({ ...creds, password: nuevaClave }))
    setNuevaClave(''); setConfirmarClave('')
    setExitoClave('Contraseña actualizada exitosamente')
  }

  const subirFoto = (i: number, file: File) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const base64 = e.target?.result as string
      const p = [...data.profesores]
      p[i] = { ...p[i], foto: base64 }
      setData({ ...data, profesores: p })
    }
    reader.readAsDataURL(file)
  }

  const actualizarProfesor = (i: number, campo: 'nombre' | 'foto', val: string) => {
    const p = [...data.profesores]; p[i] = { ...p[i], [campo]: val }; setData({ ...data, profesores: p })
  }
  const agregarProfesor  = () => setData({ ...data, profesores: [...data.profesores, { nombre: 'Nuevo Coach', foto: '' }] })
  const eliminarProfesor = (i: number) => setData({ ...data, profesores: data.profesores.filter((_, idx) => idx !== i) })

  const actualizarPlan = (pi: number, campo: string, val: string) => {
    const planes = [...data.planes]; planes[pi] = { ...planes[pi], [campo]: val }; setData({ ...data, planes })
  }
  const actualizarPrecio = (pi: number, ji: number, campo: string, val: string) => {
    const planes = [...data.planes]; const precios = [...planes[pi].precios]
    precios[ji] = { ...precios[ji], [campo]: val }; planes[pi] = { ...planes[pi], precios }; setData({ ...data, planes })
  }
  const agregarPrecio  = (pi: number) => { const pl = [...data.planes]; pl[pi].precios.push({ frecuencia: 'X veces x semana', valor: '$0' }); setData({ ...data, planes: pl }) }
  const eliminarPrecio = (pi: number, ji: number) => { const pl = [...data.planes]; pl[pi].precios = pl[pi].precios.filter((_, i) => i !== ji); setData({ ...data, planes: pl }) }

  const actualizarReglItem = (ri: number, ii: number, val: string) => { const r = [...data.reglamento]; r[ri].items[ii] = val; setData({ ...data, reglamento: r }) }
  const agregarReglItem    = (ri: number) => { const r = [...data.reglamento]; r[ri].items.push('Nueva regla'); setData({ ...data, reglamento: r }) }
  const eliminarReglItem   = (ri: number, ii: number) => { const r = [...data.reglamento]; r[ri].items = r[ri].items.filter((_, i) => i !== ii); setData({ ...data, reglamento: r }) }

  const inp: React.CSSProperties = {
    width: '100%', padding: '10px 14px', marginBottom: '16px',
    backgroundColor: '#0d0d0d', border: `1px solid ${BORDER}`,
    color: 'white', fontSize: '14px', borderRadius: '2px',
    fontFamily: 'Inter, sans-serif', fontWeight: 300, outline: 'none',
  }
  const ta:  React.CSSProperties = { ...inp, minHeight: '80px', resize: 'vertical' }
  const lbl: React.CSSProperties = {
    fontSize: '11px', letterSpacing: '2px', color: '#666',
    display: 'block', marginBottom: '8px',
    fontFamily: 'Inter, sans-serif', fontWeight: 500,
  }
  const secBtn = (s: string): React.CSSProperties => ({
    padding: '12px 20px', border: 'none', cursor: 'pointer', width: '100%',
    textAlign: 'left', fontSize: '12px', letterSpacing: '1px',
    backgroundColor: seccion === s ? '#1a1a1a' : 'transparent',
    color: seccion === s ? 'white' : '#555',
    borderLeft: seccion === s ? '2px solid white' : '2px solid transparent',
    transition: 'all 0.2s',
    fontFamily: 'Inter, sans-serif', fontWeight: seccion === s ? 500 : 300,
  })
  const cardStyle: React.CSSProperties = {
    backgroundColor: CARD, border: `1px solid ${BORDER}`,
    padding: '28px', borderRadius: '2px', marginBottom: '20px',
  }

  const secciones = [
    { id: 'general',    label: 'General' },
    { id: 'tipografia', label: 'Tipografía' },
    { id: 'planes',     label: 'Planes' },
    { id: 'profesores', label: 'Profesores' },
    { id: 'reglamento', label: 'Reglamento' },
    { id: 'horarios',   label: 'Horarios' },
    { id: 'cuenta',     label: 'Mi Cuenta' },
  ]

  if (cargando) return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0a0a0a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontFamily: 'Impact, sans-serif', fontSize: '32px', color: 'white', marginBottom: '16px' }}>ONE</div>
        <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', color: '#444', letterSpacing: '3px' }}>CARGANDO...</p>
      </div>
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0a0a0a', display: 'flex' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&family=Bebas+Neue&family=Oswald:wght@700&family=Barlow+Condensed:wght@900&family=Anton&display=swap');
        * { box-sizing: border-box; }
        input, textarea { transition: border-color 0.2s; }
        input:focus, textarea:focus { border-color: white !important; outline: none; }
        input::placeholder, textarea::placeholder { color: #333; }
        .nav-item:hover { color: #aaa !important; }
        .btn-eliminar:hover { background-color: #3a1a1a !important; }
        .btn-agregar:hover { border-color: white !important; color: white !important; }
        .upload-btn:hover { border-color: white !important; color: white !important; }
      `}</style>

      {/* SIDEBAR */}
      <aside style={{ width: '200px', backgroundColor: '#080808', borderRight: `1px solid ${BORDER}`, flexShrink: 0, display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '28px 24px', borderBottom: `1px solid ${BORDER}` }}>
          <div style={{ fontFamily: 'Impact, Arial Black, sans-serif', fontSize: '28px', color: 'white', letterSpacing: '2px' }}>ONE</div>
          <div style={{ fontFamily: 'Inter, sans-serif', fontSize: '9px', letterSpacing: '3px', color: '#333', marginTop: '6px', fontWeight: 500 }}>ADMIN PANEL</div>
        </div>
        <nav style={{ flex: 1, paddingTop: '16px' }}>
          {secciones.map(s => (
            <button key={s.id} onClick={() => setSeccion(s.id)} className="nav-item" style={secBtn(s.id)}>{s.label}</button>
          ))}
        </nav>
        <div style={{ padding: '20px 24px', borderTop: `1px solid ${BORDER}` }}>
          <button onClick={onLogout} style={{ width: '100%', padding: '10px 14px', border: `1px solid ${BORDER}`, backgroundColor: 'transparent', color: '#555', fontSize: '11px', letterSpacing: '1px', cursor: 'pointer', fontFamily: 'Inter, sans-serif', fontWeight: 400, transition: 'all 0.2s' }}>
            Cerrar sesión
          </button>
        </div>
      </aside>

      {/* MAIN */}
      <main style={{ flex: 1, overflowY: 'auto' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '28px 40px', borderBottom: `1px solid ${BORDER}`, backgroundColor: '#0a0a0a', position: 'sticky', top: 0, zIndex: 10 }}>
          <div>
            <h1 style={{ fontFamily: 'Inter, sans-serif', fontSize: '20px', fontWeight: 600, color: 'white' }}>
              {secciones.find(s => s.id === seccion)?.label}
            </h1>
            <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', color: '#444', marginTop: '4px', fontWeight: 300 }}>
              Los cambios se aplican al guardar
            </p>
          </div>
          <button onClick={guardar} style={{
            padding: '12px 28px',
            backgroundColor: guardado ? 'transparent' : 'white',
            border: guardado ? '1px solid #4caf50' : 'none',
            color: guardado ? '#4caf50' : '#000',
            fontSize: '12px', letterSpacing: '2px',
            cursor: 'pointer', transition: 'all 0.3s',
            fontFamily: 'Inter, sans-serif', fontWeight: 600,
            borderRadius: '2px',
          }}>
            {guardado ? '✓ Guardado' : 'Guardar cambios'}
          </button>
        </div>

        {/* Contenido */}
        <div style={{ padding: '36px 40px' }}>

          {/* GENERAL */}
          {seccion === 'general' && (
            <div style={{ maxWidth: '640px' }}>
              <div style={cardStyle}>
                <h2 style={{ fontFamily: 'Inter, sans-serif', fontSize: '16px', fontWeight: 600, color: 'white', marginBottom: '24px' }}>Textos principales</h2>
                <span style={lbl}>SLOGAN</span>
                <input value={data.slogan} onChange={e => setData({ ...data, slogan: e.target.value })} style={inp} />
                <span style={lbl}>DESCRIPCIÓN — QUIÉNES SOMOS</span>
                <textarea value={data.sobreOne} onChange={e => setData({ ...data, sobreOne: e.target.value })} style={ta} />
                <span style={lbl}>FRASE DESTACADA</span>
                <textarea value={data.sobreOneFrase} onChange={e => setData({ ...data, sobreOneFrase: e.target.value })} style={{ ...ta, marginBottom: 0 }} />
              </div>
            </div>
          )}

          {/* TIPOGRAFÍA */}
          {seccion === 'tipografia' && (
            <div style={{ maxWidth: '640px' }}>
              <div style={cardStyle}>
                <h2 style={{ fontFamily: 'Inter, sans-serif', fontSize: '16px', fontWeight: 600, color: 'white', marginBottom: '8px' }}>Tipografía de títulos</h2>
                <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '13px', color: '#555', marginBottom: '28px', fontWeight: 300 }}>Selecciona la fuente para todos los títulos de la página web.</p>
                <div style={{ display: 'grid', gap: '10px' }}>
                  {FUENTES_OPCIONES.map(f => {
                    const sel = data.fuenteTitulos === f
                    return (
                      <button key={f} onClick={() => setData({ ...data, fuenteTitulos: f })} style={{
                        padding: '18px 24px', backgroundColor: sel ? '#1a1a1a' : 'transparent',
                        border: sel ? '1px solid white' : `1px solid ${BORDER}`,
                        cursor: 'pointer', textAlign: 'left', transition: 'all 0.2s',
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        borderRadius: '2px',
                      }}>
                        <span style={{ fontFamily: FUENTES_MAP[f], fontSize: '26px', color: 'white', fontWeight: 900 }}>ONE YOUR EVOLUTION</span>
                        <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '10px', letterSpacing: '2px', color: sel ? 'white' : '#444', fontWeight: 500 }}>
                          {sel ? '✓ ACTIVA' : f.toUpperCase()}
                        </span>
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>
          )}

          {/* PROFESORES */}
          {seccion === 'profesores' && (
            <div style={{ maxWidth: '680px' }}>
              <div style={cardStyle}>
                <h2 style={{ fontFamily: 'Inter, sans-serif', fontSize: '16px', fontWeight: 600, color: 'white', marginBottom: '8px' }}>Coaches</h2>
                <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '13px', color: '#555', marginBottom: '28px', fontWeight: 300, lineHeight: 1.6 }}>
                  Agrega el nombre y foto de cada coach. Puedes subir una imagen directamente desde tu computador.
                </p>
                {data.profesores.map((prof, i) => (
                  <div key={i} style={{ backgroundColor: '#0d0d0d', border: `1px solid ${BORDER}`, borderRadius: '2px', padding: '20px', marginBottom: '12px' }}>
                    <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                      <div style={{ flexShrink: 0 }}>
                        <div style={{ width: '80px', height: '80px', backgroundColor: '#1a1a1a', border: `1px solid ${BORDER}`, borderRadius: '2px', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '8px' }}>
                          {prof.foto ? (
                            <img src={prof.foto} alt={prof.nombre} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          ) : (
                            <span style={{ fontFamily: 'Impact, sans-serif', fontSize: '28px', color: '#222' }}>
                              {prof.nombre ? prof.nombre.charAt(0).toUpperCase() : '?'}
                            </span>
                          )}
                        </div>
                        <input type="file" accept="image/*"
                          ref={el => { fileRefs.current[i] = el }}
                          style={{ display: 'none' }}
                          onChange={e => { const file = e.target.files?.[0]; if (file) subirFoto(i, file) }}
                        />
                        <button className="upload-btn" onClick={() => fileRefs.current[i]?.click()} style={{ width: '80px', padding: '6px 0', backgroundColor: 'transparent', border: `1px solid ${BORDER}`, color: '#555', fontSize: '10px', letterSpacing: '1px', cursor: 'pointer', fontFamily: 'Inter, sans-serif', fontWeight: 500, transition: 'all 0.2s' }}>
                          {prof.foto ? 'CAMBIAR' : 'SUBIR'}
                        </button>
                        {prof.foto && (
                          <button onClick={() => actualizarProfesor(i, 'foto', '')} style={{ width: '80px', padding: '6px 0', marginTop: '4px', backgroundColor: 'transparent', border: '1px solid #2a1a1a', color: '#ff6b6b', fontSize: '10px', letterSpacing: '1px', cursor: 'pointer', fontFamily: 'Inter, sans-serif', fontWeight: 500, display: 'block' }}>
                            QUITAR
                          </button>
                        )}
                      </div>
                      <div style={{ flex: 1 }}>
                        <span style={lbl}>NOMBRE</span>
                        <input value={prof.nombre} onChange={e => actualizarProfesor(i, 'nombre', e.target.value)} style={{ ...inp, marginBottom: 0 }} />
                      </div>
                      <button className="btn-eliminar" onClick={() => eliminarProfesor(i)} style={{ padding: '8px 12px', backgroundColor: '#1a0a0a', border: '1px solid #ff6b6b', color: '#ff6b6b', cursor: 'pointer', fontSize: '14px', flexShrink: 0, transition: 'background-color 0.2s' }}>✕</button>
                    </div>
                  </div>
                ))}
                <button className="btn-agregar" onClick={agregarProfesor} style={{ width: '100%', padding: '14px', backgroundColor: 'transparent', border: `1px solid ${BORDER}`, color: '#555', fontSize: '12px', letterSpacing: '2px', cursor: 'pointer', marginTop: '8px', transition: 'all 0.2s', fontFamily: 'Inter, sans-serif', fontWeight: 500 }}>
                  + Agregar Coach
                </button>
              </div>
            </div>
          )}

          {/* PLANES */}
          {seccion === 'planes' && (
            <div style={{ maxWidth: '720px' }}>
              {data.planes.map((plan, pi) => (
                <div key={pi} style={cardStyle}>
                  <h2 style={{ fontFamily: 'Inter, sans-serif', fontSize: '16px', fontWeight: 600, color: 'white', marginBottom: '20px' }}>{plan.nombre}</h2>
                  <span style={lbl}>NOMBRE</span>
                  <input value={plan.nombre} onChange={e => actualizarPlan(pi, 'nombre', e.target.value)} style={inp} />
                  <span style={lbl}>DESCRIPCIÓN</span>
                  <input value={plan.descripcion} onChange={e => actualizarPlan(pi, 'descripcion', e.target.value)} style={inp} />
                  <span style={lbl}>PRECIOS</span>
                  {plan.precios.map((p, ji) => (
                    <div key={ji} style={{ display: 'flex', gap: '12px', marginBottom: '10px', alignItems: 'center' }}>
                      <input value={p.frecuencia} onChange={e => actualizarPrecio(pi, ji, 'frecuencia', e.target.value)} style={{ ...inp, flex: 2, marginBottom: 0 }} placeholder="Frecuencia" />
                      <input value={p.valor} onChange={e => actualizarPrecio(pi, ji, 'valor', e.target.value)} style={{ ...inp, flex: 1, marginBottom: 0 }} placeholder="$0" />
                      <button className="btn-eliminar" onClick={() => eliminarPrecio(pi, ji)} style={{ padding: '10px 14px', backgroundColor: '#1a0a0a', border: '1px solid #ff6b6b', color: '#ff6b6b', cursor: 'pointer', fontSize: '14px', flexShrink: 0 }}>✕</button>
                    </div>
                  ))}
                  <button className="btn-agregar" onClick={() => agregarPrecio(pi)} style={{ padding: '8px 20px', backgroundColor: 'transparent', border: `1px solid ${BORDER}`, color: '#555', fontSize: '11px', letterSpacing: '1px', cursor: 'pointer', marginTop: '8px', fontFamily: 'Inter, sans-serif' }}>
                    + Agregar precio
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* REGLAMENTO */}
          {seccion === 'reglamento' && (
            <div style={{ maxWidth: '720px' }}>
              {data.reglamento.map((reg, ri) => (
                <div key={ri} style={cardStyle}>
                  <h2 style={{ fontFamily: 'Inter, sans-serif', fontSize: '16px', fontWeight: 600, color: 'white', marginBottom: '20px' }}>{reg.titulo}</h2>
                  <span style={lbl}>TÍTULO DE SECCIÓN</span>
                  <input value={reg.titulo} onChange={e => { const r = [...data.reglamento]; r[ri] = { ...r[ri], titulo: e.target.value }; setData({ ...data, reglamento: r }) }} style={inp} />
                  <span style={lbl}>REGLAS</span>
                  {reg.items.map((item, ii) => (
                    <div key={ii} style={{ display: 'flex', gap: '12px', marginBottom: '10px', alignItems: 'flex-start' }}>
                      <textarea value={item} onChange={e => actualizarReglItem(ri, ii, e.target.value)} style={{ ...ta, flex: 1, marginBottom: 0, minHeight: '56px' }} />
                      <button className="btn-eliminar" onClick={() => eliminarReglItem(ri, ii)} style={{ padding: '10px 14px', backgroundColor: '#1a0a0a', border: '1px solid #ff6b6b', color: '#ff6b6b', cursor: 'pointer', fontSize: '14px', flexShrink: 0, marginTop: '2px' }}>✕</button>
                    </div>
                  ))}
                  <button className="btn-agregar" onClick={() => agregarReglItem(ri)} style={{ padding: '8px 20px', backgroundColor: 'transparent', border: `1px solid ${BORDER}`, color: '#555', fontSize: '11px', letterSpacing: '1px', cursor: 'pointer', marginTop: '8px', fontFamily: 'Inter, sans-serif' }}>
                    + Agregar regla
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* HORARIOS */}
          {seccion === 'horarios' && (
            <div style={{ maxWidth: '560px' }}>
              <div style={cardStyle}>
                <h2 style={{ fontFamily: 'Inter, sans-serif', fontSize: '16px', fontWeight: 600, color: 'white', marginBottom: '24px' }}>Horarios de atención</h2>
                <span style={lbl}>LUNES A VIERNES</span>
                <input value={data.horarioSemana} onChange={e => setData({ ...data, horarioSemana: e.target.value })} style={inp} />
                <span style={lbl}>SÁBADOS</span>
                <input value={data.horarioSabado} onChange={e => setData({ ...data, horarioSabado: e.target.value })} style={{ ...inp, marginBottom: 0 }} />
              </div>
            </div>
          )}

          {/* CUENTA */}
          {seccion === 'cuenta' && (
            <div style={{ maxWidth: '480px' }}>
              <div style={cardStyle}>
                <h2 style={{ fontFamily: 'Inter, sans-serif', fontSize: '16px', fontWeight: 600, color: 'white', marginBottom: '8px' }}>Cambiar contraseña</h2>
                <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '13px', color: '#555', marginBottom: '24px', fontWeight: 300 }}>Actualiza la contraseña de acceso al panel de administración.</p>
                {errorClave && (
                  <div style={{ backgroundColor: '#1a0a0a', border: '1px solid #ff6b6b', padding: '10px 14px', marginBottom: '16px', borderRadius: '2px' }}>
                    <p style={{ fontFamily: 'Inter, sans-serif', color: '#ff6b6b', fontSize: '13px', fontWeight: 400 }}>{errorClave}</p>
                  </div>
                )}
                {exitoClave && (
                  <div style={{ backgroundColor: '#0a1a0a', border: '1px solid #4caf50', padding: '10px 14px', marginBottom: '16px', borderRadius: '2px' }}>
                    <p style={{ fontFamily: 'Inter, sans-serif', color: '#4caf50', fontSize: '13px', fontWeight: 400 }}>{exitoClave}</p>
                  </div>
                )}
                <span style={lbl}>NUEVA CONTRASEÑA</span>
                <input type="password" value={nuevaClave} onChange={e => setNuevaClave(e.target.value)} placeholder="Mínimo 6 caracteres" style={inp} />
                <span style={lbl}>CONFIRMAR CONTRASEÑA</span>
                <input type="password" value={confirmarClave} onChange={e => setConfirmarClave(e.target.value)} placeholder="Repite la contraseña" style={{ ...inp, marginBottom: '20px' }} />
                <button onClick={cambiarClave} style={{ width: '100%', padding: '14px', backgroundColor: 'white', border: 'none', color: '#000', fontSize: '12px', letterSpacing: '2px', cursor: 'pointer', fontFamily: 'Inter, sans-serif', fontWeight: 600 }}>
                  Actualizar contraseña
                </button>
              </div>
            </div>
          )}

        </div>
      </main>
    </div>
  )
}

export default AdminPanel