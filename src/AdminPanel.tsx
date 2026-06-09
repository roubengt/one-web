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
  videoUrl:      '',
  videoBase64:   '',
  terminosPdf:   '' as string,
  profesores:    [] as { nombre: string; foto: string; descripcion: string }[],
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
  const [seccion, setSeccion]             = useState('general')
  const [data, setData]                   = useState(defaultData)
  const [guardado, setGuardado]           = useState(false)
  const [cargando, setCargando]           = useState(true)
  const [sidebarAbierto, setSidebarAbierto] = useState(false)
  const [nuevaClave, setNuevaClave]       = useState('')
  const [confirmarClave, setConfirmarClave] = useState('')
  const [errorClave, setErrorClave]       = useState('')
  const [exitoClave, setExitoClave]       = useState('')
  const [subiendoVideo, setSubiendoVideo] = useState(false)
  const fileRefs = useRef<(HTMLInputElement | null)[]>([])
  const videoRef = useRef<HTMLInputElement | null>(null)
  const terminosRef = useRef<HTMLInputElement | null>(null)

  useEffect(() => {
    const cargar = async () => {
      setCargando(true)
      const remoto = await obtenerConfig()
      if (remoto && Object.keys(remoto).length > 0) {
        if (remoto.profesores && typeof remoto.profesores[0] === 'string') {
          remoto.profesores = remoto.profesores.map((nombre: string) => ({ nombre, foto: '', descripcion: '' }))
        }
        if (remoto.profesores) {
          remoto.profesores = remoto.profesores.map((p: any) => ({
            nombre: p.nombre || '',
            foto: p.foto || '',
            descripcion: p.descripcion || '',
          }))
        }
        setData({ ...defaultData, ...remoto })
      } else {
        const saved = localStorage.getItem('one_web_data')
        if (saved) {
          try {
            const parsed = JSON.parse(saved)
            if (parsed.profesores && typeof parsed.profesores[0] === 'string') {
              parsed.profesores = parsed.profesores.map((nombre: string) => ({ nombre, foto: '', descripcion: '' }))
            }
            if (parsed.profesores) {
              parsed.profesores = parsed.profesores.map((p: any) => ({
                nombre: p.nombre || '',
                foto: p.foto || '',
                descripcion: p.descripcion || '',
              }))
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

  const cambiarSeccion = (s: string) => { setSeccion(s); setSidebarAbierto(false) }

  const subirVideoPC = (file: File) => {
    if (file.size > 50 * 1024 * 1024) { alert('El video es muy grande. Máximo 50MB.'); return }
    setSubiendoVideo(true)
    const reader = new FileReader()
    reader.onload = (e) => { setData({ ...data, videoBase64: e.target?.result as string, videoUrl: '' }); setSubiendoVideo(false) }
    reader.readAsDataURL(file)
  }

  const subirTerminosPdf = (file: File) => {
    if (file.size > 10 * 1024 * 1024) { alert('El archivo es muy grande. Máximo 10MB.'); return }
    const reader = new FileReader()
    reader.onload = (e) => { setData({ ...data, terminosPdf: e.target?.result as string }) }
    reader.readAsDataURL(file)
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
      const p = [...data.profesores]; p[i] = { ...p[i], foto: e.target?.result as string }; setData({ ...data, profesores: p })
    }
    reader.readAsDataURL(file)
  }

  const actualizarProfesor = (i: number, campo: 'nombre' | 'foto' | 'descripcion', val: string) => {
    const p = [...data.profesores]; p[i] = { ...p[i], [campo]: val }; setData({ ...data, profesores: p })
  }
  const agregarProfesor  = () => setData({ ...data, profesores: [...data.profesores, { nombre: '', foto: '', descripcion: '' }] })
  const eliminarProfesor = (i: number) => { if (!window.confirm('¿Eliminar este coach?')) return; setData({ ...data, profesores: data.profesores.filter((_, idx) => idx !== i) }) }

  const actualizarPlan = (pi: number, campo: string, val: string) => {
    const planes = [...data.planes]; planes[pi] = { ...planes[pi], [campo]: val }; setData({ ...data, planes })
  }
  const actualizarPrecio = (pi: number, ji: number, campo: string, val: string) => {
    const planes = [...data.planes]; const precios = [...planes[pi].precios]
    precios[ji] = { ...precios[ji], [campo]: val }; planes[pi] = { ...planes[pi], precios }; setData({ ...data, planes })
  }
  const agregarPrecio  = (pi: number) => { const pl = [...data.planes]; pl[pi].precios.push({ frecuencia: 'X veces x semana', valor: '$0' }); setData({ ...data, planes: pl }) }
  const eliminarPrecio = (pi: number, ji: number) => { const pl = [...data.planes]; pl[pi].precios = pl[pi].precios.filter((_, i) => i !== ji); setData({ ...data, planes: pl }) }
  const agregarPlan    = () => setData({ ...data, planes: [...data.planes, { nombre: 'NUEVO PLAN', descripcion: 'Descripción del plan', precios: [{ frecuencia: '2 veces x semana', valor: '$0' }] }] })
  const eliminarPlan   = (pi: number) => { if (!window.confirm('¿Eliminar este plan?')) return; setData({ ...data, planes: data.planes.filter((_, i) => i !== pi) }) }

  const actualizarReglItem = (ri: number, ii: number, val: string) => { const r = [...data.reglamento]; r[ri].items[ii] = val; setData({ ...data, reglamento: r }) }
  const agregarReglItem    = (ri: number) => { const r = [...data.reglamento]; r[ri].items.push('Nueva regla'); setData({ ...data, reglamento: r }) }
  const eliminarReglItem   = (ri: number, ii: number) => { const r = [...data.reglamento]; r[ri].items = r[ri].items.filter((_, i) => i !== ii); setData({ ...data, reglamento: r }) }

  const secciones = [
    { id: 'general',    label: 'General',                  icon: '⚙️' },
    { id: 'tipografia', label: 'Tipografía',               icon: '🔤' },
    { id: 'planes',     label: 'Planes',                   icon: '📋' },
    { id: 'profesores', label: 'Profesores',               icon: '👤' },
    { id: 'reglamento', label: 'Reglamento',               icon: '📄' },
    { id: 'horarios',   label: 'Horarios',                 icon: '🕐' },
    { id: 'terminos',   label: 'Términos y Condiciones',   icon: '📃' },
    { id: 'cuenta',     label: 'Mi Cuenta',                icon: '🔑' },
  ]

  const inp: React.CSSProperties = { width: '100%', padding: '10px 14px', marginBottom: '16px', backgroundColor: '#0d0d0d', border: `1px solid ${BORDER}`, color: 'white', fontSize: '14px', borderRadius: '2px', fontFamily: 'Inter, sans-serif', fontWeight: 300, outline: 'none' }
  const ta:  React.CSSProperties = { ...inp, minHeight: '80px', resize: 'vertical' }
  const lbl: React.CSSProperties = { fontSize: '11px', letterSpacing: '2px', color: '#666', display: 'block', marginBottom: '8px', fontFamily: 'Inter, sans-serif', fontWeight: 500 }
  const cardStyle: React.CSSProperties = { backgroundColor: CARD, border: `1px solid ${BORDER}`, padding: '20px', borderRadius: '2px', marginBottom: '16px' }

  if (cargando) return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0a0a0a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontFamily: 'Impact, sans-serif', fontSize: '32px', color: 'white', marginBottom: '16px' }}>ONE</div>
        <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', color: '#444', letterSpacing: '3px' }}>CARGANDO...</p>
      </div>
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0a0a0a' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&family=Bebas+Neue&family=Oswald:wght@700&family=Barlow+Condensed:wght@900&family=Anton&display=swap');
        * { box-sizing: border-box; }
        input, textarea { transition: border-color 0.2s; }
        input:focus, textarea:focus { border-color: white !important; outline: none; }
        input::placeholder, textarea::placeholder { color: #333; }
        .nav-item { display: flex; align-items: center; gap: 10px; padding: 12px 20px; border: none; cursor: pointer; width: 100%; text-align: left; font-size: 13px; font-family: Inter, sans-serif; font-weight: 400; transition: all 0.2s; background: transparent; color: #555; border-left: 2px solid transparent; }
        .nav-item.active { background: #1a1a1a; color: white; border-left-color: white; font-weight: 500; }
        .nav-item:hover { color: #aaa; }
        .btn-eliminar { padding: 8px 12px; background: #1a0a0a; border: 1px solid #ff6b6b; color: #ff6b6b; cursor: pointer; font-size: 14px; flex-shrink: 0; transition: background 0.2s; border-radius: 2px; }
        .btn-eliminar:hover { background: #3a1a1a; }
        .btn-agregar { background: transparent; border: 1px solid #2a2a2a; color: #555; cursor: pointer; font-family: Inter, sans-serif; transition: all 0.2s; border-radius: 2px; }
        .btn-agregar:hover { border-color: white; color: white; }
        .upload-btn { background: transparent; border: 1px solid #2a2a2a; color: #555; cursor: pointer; font-family: Inter, sans-serif; font-size: 10px; letter-spacing: 1px; font-weight: 500; transition: all 0.2s; text-align: center; }
        .upload-btn:hover { border-color: white; color: white; }
        .mobile-nav { display: none; position: fixed; top: 0; left: 0; right: 0; z-index: 100; background: #080808; border-bottom: 1px solid #2a2a2a; height: 56px; align-items: center; padding: 0 16px; justify-content: space-between; }
        .sidebar-overlay { display: none; position: fixed; inset: 0; background: rgba(0,0,0,0.8); z-index: 200; }
        .sidebar-mobile { position: fixed; top: 0; left: -280px; width: 280px; height: 100vh; background: #080808; border-right: 1px solid #2a2a2a; z-index: 300; transition: left 0.3s ease; display: flex; flex-direction: column; }
        .sidebar-mobile.open { left: 0; }
        .desktop-sidebar { width: 220px; background: #080808; border-right: 1px solid #2a2a2a; flex-shrink: 0; display: flex; flex-direction: column; position: sticky; top: 0; height: 100vh; overflow-y: auto; }
        .admin-layout { display: flex; min-height: 100vh; }
        .main-padding { padding: 28px 40px; }
        .header-bar { display: flex; justify-content: space-between; align-items: center; padding: 20px 40px; border-bottom: 1px solid #2a2a2a; background: #0a0a0a; position: sticky; top: 0; z-index: 10; gap: 16px; }
        @media (max-width: 768px) {
          .mobile-nav { display: flex; }
          .desktop-sidebar { display: none; }
          .admin-layout { display: block; padding-top: 56px; }
          .main-padding { padding: 16px 12px; }
          .header-bar { padding: 14px 16px; flex-wrap: wrap; gap: 10px; top: 56px; }
          .sidebar-overlay.open { display: block; }
        }
      `}</style>

      {/* MOBILE NAV */}
      <div className="mobile-nav">
        <button onClick={() => setSidebarAbierto(true)} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: '4px', padding: '4px' }}>
          {[0,1,2].map(i => <span key={i} style={{ display: 'block', width: '22px', height: '2px', backgroundColor: 'white' }} />)}
        </button>
        <span style={{ fontFamily: 'Impact, sans-serif', fontSize: '22px', color: 'white', letterSpacing: '2px' }}>ONE</span>
        <button onClick={guardar} style={{ padding: '8px 16px', backgroundColor: guardado ? 'transparent' : 'white', border: guardado ? '1px solid #4caf50' : 'none', color: guardado ? '#4caf50' : '#000', fontSize: '11px', cursor: 'pointer', fontFamily: 'Inter, sans-serif', fontWeight: 600, borderRadius: '2px' }}>
          {guardado ? '✓' : 'Guardar'}
        </button>
      </div>

      <div className={`sidebar-overlay ${sidebarAbierto ? 'open' : ''}`} onClick={() => setSidebarAbierto(false)} />

      <div className={`sidebar-mobile ${sidebarAbierto ? 'open' : ''}`}>
        <div style={{ padding: '20px', borderBottom: `1px solid ${BORDER}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontFamily: 'Impact, sans-serif', fontSize: '24px', color: 'white', letterSpacing: '2px' }}>ONE</div>
            <div style={{ fontFamily: 'Inter, sans-serif', fontSize: '9px', letterSpacing: '3px', color: '#333', marginTop: '4px' }}>ADMIN PANEL</div>
          </div>
          <button onClick={() => setSidebarAbierto(false)} style={{ background: 'none', border: 'none', color: '#555', fontSize: '20px', cursor: 'pointer' }}>✕</button>
        </div>
        <nav style={{ flex: 1, paddingTop: '8px', overflowY: 'auto' }}>
          {secciones.map(s => (
            <button key={s.id} onClick={() => cambiarSeccion(s.id)} className={`nav-item ${seccion === s.id ? 'active' : ''}`}>
              <span>{s.icon}</span><span>{s.label}</span>
            </button>
          ))}
        </nav>
        <div style={{ padding: '16px 20px', borderTop: `1px solid ${BORDER}` }}>
          <button onClick={onLogout} style={{ width: '100%', padding: '10px', border: `1px solid ${BORDER}`, background: 'transparent', color: '#555', fontSize: '12px', cursor: 'pointer', fontFamily: 'Inter, sans-serif', borderRadius: '2px' }}>Cerrar sesión</button>
        </div>
      </div>

      <div className="admin-layout">
        <aside className="desktop-sidebar">
          <div style={{ padding: '28px 24px', borderBottom: `1px solid ${BORDER}` }}>
            <div style={{ fontFamily: 'Impact, sans-serif', fontSize: '28px', color: 'white', letterSpacing: '2px' }}>ONE</div>
            <div style={{ fontFamily: 'Inter, sans-serif', fontSize: '9px', letterSpacing: '3px', color: '#333', marginTop: '6px', fontWeight: 500 }}>ADMIN PANEL</div>
          </div>
          <nav style={{ flex: 1, paddingTop: '8px' }}>
            {secciones.map(s => (
              <button key={s.id} onClick={() => cambiarSeccion(s.id)} className={`nav-item ${seccion === s.id ? 'active' : ''}`}>
                {s.label}
              </button>
            ))}
          </nav>
          <div style={{ padding: '20px 24px', borderTop: `1px solid ${BORDER}` }}>
            <button onClick={onLogout} style={{ width: '100%', padding: '10px', border: `1px solid ${BORDER}`, background: 'transparent', color: '#555', fontSize: '11px', cursor: 'pointer', fontFamily: 'Inter, sans-serif', borderRadius: '2px' }}>Cerrar sesión</button>
          </div>
        </aside>

        <main style={{ flex: 1, overflowY: 'auto' }}>
          <div className="header-bar">
            <div>
              <h1 style={{ fontFamily: 'Inter, sans-serif', fontSize: '20px', fontWeight: 600, color: 'white' }}>
                {secciones.find(s => s.id === seccion)?.label}
              </h1>
              <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', color: '#444', marginTop: '4px', fontWeight: 300 }}>Los cambios se aplican al guardar</p>
            </div>
            <button onClick={guardar} style={{ padding: '12px 24px', backgroundColor: guardado ? 'transparent' : 'white', border: guardado ? '1px solid #4caf50' : 'none', color: guardado ? '#4caf50' : '#000', fontSize: '12px', letterSpacing: '1px', cursor: 'pointer', fontFamily: 'Inter, sans-serif', fontWeight: 600, borderRadius: '2px', whiteSpace: 'nowrap', flexShrink: 0 }}>
              {guardado ? '✓ Guardado' : 'Guardar cambios'}
            </button>
          </div>

          <div className="main-padding">

            {/* GENERAL */}
            {seccion === 'general' && (
              <div style={{ maxWidth: '640px' }}>
                <div style={cardStyle}>
                  <h2 style={{ fontFamily: 'Inter, sans-serif', fontSize: '15px', fontWeight: 600, color: 'white', marginBottom: '20px' }}>Textos principales</h2>
                  <span style={lbl}>SLOGAN</span>
                  <input value={data.slogan} onChange={e => setData({ ...data, slogan: e.target.value })} style={inp} />
                  <span style={lbl}>DESCRIPCIÓN — QUIÉNES SOMOS</span>
                  <textarea value={data.sobreOne} onChange={e => setData({ ...data, sobreOne: e.target.value })} style={ta} />
                  <span style={lbl}>FRASE DESTACADA</span>
                  <textarea value={data.sobreOneFrase} onChange={e => setData({ ...data, sobreOneFrase: e.target.value })} style={{ ...ta, marginBottom: 0 }} />
                </div>
                <div style={cardStyle}>
                  <h2 style={{ fontFamily: 'Inter, sans-serif', fontSize: '15px', fontWeight: 600, color: 'white', marginBottom: '8px' }}>Video de inicio</h2>
                  <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '13px', color: '#555', marginBottom: '20px', fontWeight: 300, lineHeight: 1.6 }}>El video reemplaza la imagen de fondo en la sección de inicio.</p>
                  {(data.videoBase64 || data.videoUrl) && (
                    <div style={{ backgroundColor: '#0d0d0d', border: `1px solid ${BORDER}`, borderRadius: '2px', padding: '14px', marginBottom: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
                      <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '13px', color: 'white', fontWeight: 500 }}>
                        {data.videoBase64 ? '✓ Video subido desde PC' : '✓ Video de Google Drive'}
                      </p>
                      <button onClick={() => setData({ ...data, videoBase64: '', videoUrl: '' })} style={{ padding: '6px 12px', backgroundColor: '#1a0a0a', border: '1px solid #ff6b6b', color: '#ff6b6b', cursor: 'pointer', fontSize: '11px', fontFamily: 'Inter, sans-serif', borderRadius: '2px' }}>Quitar</button>
                    </div>
                  )}
                  <div style={{ backgroundColor: '#0d0d0d', border: `1px solid ${BORDER}`, borderRadius: '2px', padding: '16px', marginBottom: '12px' }}>
                    <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '11px', color: '#aaa', fontWeight: 500, marginBottom: '4px', letterSpacing: '1px' }}>OPCIÓN 1 — SUBIR DESDE EL COMPUTADOR</p>
                    <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '11px', color: '#555', marginBottom: '14px', fontWeight: 300 }}>Máximo 50MB. Formatos: MP4, MOV, WEBM.</p>
                    <input type="file" accept="video/*" ref={videoRef} style={{ display: 'none' }} onChange={e => { const f = e.target.files?.[0]; if (f) subirVideoPC(f) }} />
                    <button className="upload-btn" onClick={() => videoRef.current?.click()} disabled={subiendoVideo} style={{ padding: '10px 20px', fontSize: '11px', letterSpacing: '1px', width: '100%' }}>
                      {subiendoVideo ? 'PROCESANDO...' : '↑ SELECCIONAR VIDEO'}
                    </button>
                  </div>
                  <div style={{ backgroundColor: '#0d0d0d', border: `1px solid ${BORDER}`, borderRadius: '2px', padding: '16px' }}>
                    <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '11px', color: '#aaa', fontWeight: 500, marginBottom: '4px', letterSpacing: '1px' }}>OPCIÓN 2 — URL DE GOOGLE DRIVE</p>
                    <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '11px', color: '#555', marginBottom: '14px', fontWeight: 300 }}>
                      Formato: https://drive.google.com/file/d/<strong style={{ color: '#888' }}>ID</strong>/preview
                    </p>
                    <input value={data.videoUrl || ''} onChange={e => setData({ ...data, videoUrl: e.target.value, videoBase64: '' })}
                      placeholder="https://drive.google.com/file/d/TU_ID/preview" style={{ ...inp, marginBottom: 0 }} />
                  </div>
                </div>
              </div>
            )}

            {/* TIPOGRAFÍA */}
            {seccion === 'tipografia' && (
              <div style={{ maxWidth: '640px' }}>
                <div style={cardStyle}>
                  <h2 style={{ fontFamily: 'Inter, sans-serif', fontSize: '15px', fontWeight: 600, color: 'white', marginBottom: '8px' }}>Tipografía de títulos</h2>
                  <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '13px', color: '#555', marginBottom: '24px', fontWeight: 300 }}>Selecciona la fuente para todos los títulos de la página web.</p>
                  <div style={{ display: 'grid', gap: '10px' }}>
                    {FUENTES_OPCIONES.map(f => {
                      const sel = data.fuenteTitulos === f
                      return (
                        <button key={f} onClick={() => setData({ ...data, fuenteTitulos: f })} style={{ padding: '16px 20px', backgroundColor: sel ? '#1a1a1a' : 'transparent', border: sel ? '1px solid white' : `1px solid ${BORDER}`, cursor: 'pointer', textAlign: 'left', transition: 'all 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderRadius: '2px', gap: '12px', flexWrap: 'wrap' }}>
                          <span style={{ fontFamily: FUENTES_MAP[f], fontSize: 'clamp(16px, 4vw, 24px)', color: 'white', fontWeight: 900 }}>ONE YOUR EVOLUTION</span>
                          <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '10px', letterSpacing: '2px', color: sel ? 'white' : '#444', fontWeight: 500, flexShrink: 0 }}>{sel ? '✓ ACTIVA' : f.toUpperCase()}</span>
                        </button>
                      )
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* PROFESORES */}
            {seccion === 'profesores' && (
              <div style={{ maxWidth: '700px' }}>
                <div style={cardStyle}>
                  <h2 style={{ fontFamily: 'Inter, sans-serif', fontSize: '15px', fontWeight: 600, color: 'white', marginBottom: '8px' }}>Coaches</h2>
                  <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '13px', color: '#555', marginBottom: '20px', fontWeight: 300, lineHeight: 1.6 }}>
                    Agrega los coaches del gimnasio con su foto, nombre y descripción.
                  </p>
                  {data.profesores.length === 0 && (
                    <div style={{ backgroundColor: '#0d0d0d', border: `1px solid ${BORDER}`, borderRadius: '2px', padding: '24px', textAlign: 'center', marginBottom: '16px' }}>
                      <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '13px', color: '#444', fontWeight: 300 }}>No hay coaches agregados aún.</p>
                      <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', color: '#333', marginTop: '4px', fontWeight: 300 }}>Haz clic en "+ Agregar Coach" para comenzar.</p>
                    </div>
                  )}
                  {data.profesores.map((prof, i) => (
                    <div key={i} style={{ backgroundColor: '#0d0d0d', border: `1px solid ${BORDER}`, borderRadius: '2px', padding: '16px', marginBottom: '12px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                        <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '13px', color: '#aaa', fontWeight: 500 }}>{prof.nombre || 'Nuevo Coach'}</p>
                        <button className="btn-eliminar" onClick={() => eliminarProfesor(i)}>✕ Eliminar</button>
                      </div>
                      <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start', marginBottom: '12px', flexWrap: 'wrap' }}>
                        <div style={{ flexShrink: 0 }}>
                          <div style={{ width: '100px', height: '100px', backgroundColor: '#1a1a1a', border: `1px solid ${BORDER}`, borderRadius: '4px', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '8px' }}>
                            {prof.foto
                              ? <img src={prof.foto} alt={prof.nombre} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                              : <span style={{ fontFamily: 'Impact, sans-serif', fontSize: '36px', color: '#222' }}>{prof.nombre ? prof.nombre.charAt(0).toUpperCase() : '?'}</span>
                            }
                          </div>
                          <input type="file" accept="image/*" ref={el => { fileRefs.current[i] = el }} style={{ display: 'none' }} onChange={e => { const f = e.target.files?.[0]; if (f) subirFoto(i, f) }} />
                          <button className="upload-btn" onClick={() => fileRefs.current[i]?.click()} style={{ width: '100px', padding: '6px 0', display: 'block' }}>
                            {prof.foto ? 'CAMBIAR' : 'SUBIR FOTO'}
                          </button>
                          {prof.foto && (
                            <button onClick={() => actualizarProfesor(i, 'foto', '')} style={{ width: '100px', padding: '5px 0', marginTop: '4px', background: 'transparent', border: '1px solid #2a1a1a', color: '#ff6b6b', fontSize: '10px', cursor: 'pointer', fontFamily: 'Inter, sans-serif', display: 'block', textAlign: 'center', borderRadius: '2px' }}>QUITAR FOTO</button>
                          )}
                        </div>
                        <div style={{ flex: 1, minWidth: '160px' }}>
                          <span style={lbl}>NOMBRE</span>
                          <input value={prof.nombre} onChange={e => actualizarProfesor(i, 'nombre', e.target.value)} placeholder="Nombre del coach" style={{ ...inp, marginBottom: 0 }} />
                        </div>
                      </div>
                      <span style={lbl}>DESCRIPCIÓN</span>
                      <textarea value={prof.descripcion} onChange={e => actualizarProfesor(i, 'descripcion', e.target.value)}
                        placeholder="Ej: Especialista en entrenamiento de fuerza con 5 años de experiencia..."
                        style={{ ...ta, marginBottom: 0, minHeight: '72px' }} />
                    </div>
                  ))}
                  <button className="btn-agregar" onClick={agregarProfesor} style={{ width: '100%', padding: '14px', fontSize: '12px', letterSpacing: '2px', marginTop: '8px', border: '1px solid white', color: 'white' }}>
                    + Agregar Coach
                  </button>
                </div>
              </div>
            )}

            {/* PLANES */}
            {seccion === 'planes' && (
              <div style={{ maxWidth: '720px' }}>
                <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '13px', color: '#555', marginBottom: '20px', fontWeight: 300 }}>Puedes editar, agregar o eliminar planes. Recuerda guardar los cambios.</p>
                {data.planes.map((plan, pi) => (
                  <div key={pi} style={cardStyle}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', gap: '12px', flexWrap: 'wrap' }}>
                      <h2 style={{ fontFamily: 'Inter, sans-serif', fontSize: '15px', fontWeight: 600, color: 'white' }}>{plan.nombre}</h2>
                      <button onClick={() => eliminarPlan(pi)} style={{ padding: '6px 12px', backgroundColor: '#1a0a0a', border: '1px solid #ff6b6b', color: '#ff6b6b', cursor: 'pointer', fontSize: '11px', fontFamily: 'Inter, sans-serif', borderRadius: '2px', whiteSpace: 'nowrap' }}>Eliminar plan</button>
                    </div>
                    <span style={lbl}>NOMBRE</span>
                    <input value={plan.nombre} onChange={e => actualizarPlan(pi, 'nombre', e.target.value)} style={inp} />
                    <span style={lbl}>DESCRIPCIÓN</span>
                    <input value={plan.descripcion} onChange={e => actualizarPlan(pi, 'descripcion', e.target.value)} style={inp} />
                    <span style={lbl}>PRECIOS</span>
                    {plan.precios.map((p, ji) => (
                      <div key={ji} style={{ display: 'flex', gap: '8px', marginBottom: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                        <input value={p.frecuencia} onChange={e => actualizarPrecio(pi, ji, 'frecuencia', e.target.value)} style={{ ...inp, flex: '2 1 120px', marginBottom: 0, minWidth: 0 }} placeholder="Frecuencia" />
                        <input value={p.valor} onChange={e => actualizarPrecio(pi, ji, 'valor', e.target.value)} style={{ ...inp, flex: '1 1 80px', marginBottom: 0, minWidth: 0 }} placeholder="$0" />
                        <button className="btn-eliminar" onClick={() => eliminarPrecio(pi, ji)}>✕</button>
                      </div>
                    ))}
                    <button className="btn-agregar" onClick={() => agregarPrecio(pi)} style={{ padding: '8px 16px', fontSize: '11px', letterSpacing: '1px', marginTop: '8px' }}>+ Agregar precio</button>
                  </div>
                ))}
                <button className="btn-agregar" onClick={agregarPlan} style={{ width: '100%', padding: '14px', fontSize: '12px', letterSpacing: '2px', marginTop: '4px', border: '1px solid white', color: 'white' }}>+ Agregar nuevo plan</button>
              </div>
            )}

            {/* REGLAMENTO */}
            {seccion === 'reglamento' && (
              <div style={{ maxWidth: '720px' }}>
                {data.reglamento.map((reg, ri) => (
                  <div key={ri} style={cardStyle}>
                    <h2 style={{ fontFamily: 'Inter, sans-serif', fontSize: '15px', fontWeight: 600, color: 'white', marginBottom: '16px' }}>{reg.titulo}</h2>
                    <span style={lbl}>TÍTULO DE SECCIÓN</span>
                    <input value={reg.titulo} onChange={e => { const r = [...data.reglamento]; r[ri] = { ...r[ri], titulo: e.target.value }; setData({ ...data, reglamento: r }) }} style={inp} />
                    <span style={lbl}>REGLAS</span>
                    {reg.items.map((item, ii) => (
                      <div key={ii} style={{ display: 'flex', gap: '8px', marginBottom: '8px', alignItems: 'flex-start' }}>
                        <textarea value={item} onChange={e => actualizarReglItem(ri, ii, e.target.value)} style={{ ...ta, flex: 1, marginBottom: 0, minHeight: '56px' }} />
                        <button className="btn-eliminar" onClick={() => eliminarReglItem(ri, ii)} style={{ marginTop: '2px' }}>✕</button>
                      </div>
                    ))}
                    <button className="btn-agregar" onClick={() => agregarReglItem(ri)} style={{ padding: '8px 16px', fontSize: '11px', letterSpacing: '1px', marginTop: '8px' }}>+ Agregar regla</button>
                  </div>
                ))}
              </div>
            )}

            {/* HORARIOS */}
            {seccion === 'horarios' && (
              <div style={{ maxWidth: '560px' }}>
                <div style={cardStyle}>
                  <h2 style={{ fontFamily: 'Inter, sans-serif', fontSize: '15px', fontWeight: 600, color: 'white', marginBottom: '20px' }}>Horarios de atención</h2>
                  <span style={lbl}>LUNES A VIERNES</span>
                  <input value={data.horarioSemana} onChange={e => setData({ ...data, horarioSemana: e.target.value })} style={inp} />
                  <span style={lbl}>SÁBADOS</span>
                  <input value={data.horarioSabado} onChange={e => setData({ ...data, horarioSabado: e.target.value })} style={{ ...inp, marginBottom: 0 }} />
                </div>
              </div>
            )}

            {/* TÉRMINOS Y CONDICIONES */}
            {seccion === 'terminos' && (
              <div style={{ maxWidth: '560px' }}>
                <div style={cardStyle}>
                  <h2 style={{ fontFamily: 'Inter, sans-serif', fontSize: '15px', fontWeight: 600, color: 'white', marginBottom: '8px' }}>Términos y Condiciones</h2>
                  <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '13px', color: '#555', marginBottom: '20px', fontWeight: 300, lineHeight: 1.6 }}>
                    Sube el documento PDF con los términos y condiciones del gimnasio. Este archivo se mostrará a los visitantes cuando hagan clic en el enlace del footer.
                  </p>
                  {data.terminosPdf ? (
                    <div style={{ backgroundColor: '#0a1a0a', border: '1px solid #4caf50', borderRadius: '2px', padding: '16px', marginBottom: '16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <span style={{ fontSize: '20px' }}>📄</span>
                          <div>
                            <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '13px', color: '#4caf50', fontWeight: 600 }}>PDF cargado correctamente</p>
                            <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '11px', color: '#555', marginTop: '2px', fontWeight: 300 }}>El documento está disponible en el sitio web</p>
                          </div>
                        </div>
                        <button onClick={() => setData({ ...data, terminosPdf: '' })}
                          style={{ padding: '6px 14px', backgroundColor: '#1a0a0a', border: '1px solid #ff6b6b', color: '#ff6b6b', cursor: 'pointer', fontSize: '11px', fontFamily: 'Inter, sans-serif', borderRadius: '2px', whiteSpace: 'nowrap' }}>
                          Quitar PDF
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div style={{ backgroundColor: '#0d0d0d', border: `1px solid ${BORDER}`, borderRadius: '2px', padding: '16px', marginBottom: '16px' }}>
                      <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '11px', color: '#555', marginBottom: '4px', fontWeight: 300 }}>No hay ningún PDF cargado aún.</p>
                      <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '11px', color: '#333', fontWeight: 300 }}>Sube un archivo para que aparezca en el sitio web.</p>
                    </div>
                  )}
                  <input type="file" accept="application/pdf" ref={terminosRef} style={{ display: 'none' }}
                    onChange={e => { const f = e.target.files?.[0]; if (f) subirTerminosPdf(f) }} />
                  <button className="upload-btn" onClick={() => terminosRef.current?.click()}
                    style={{ width: '100%', padding: '14px', fontSize: '11px', letterSpacing: '2px', border: `1px solid ${BORDER}` }}>
                    {data.terminosPdf ? '↑ REEMPLAZAR PDF' : '↑ SUBIR PDF'}
                  </button>
                  <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '10px', color: '#333', marginTop: '12px', fontWeight: 300, textAlign: 'center' }}>
                    Formato: PDF · Máximo 10MB
                  </p>
                </div>
              </div>
            )}

            {/* CUENTA */}
            {seccion === 'cuenta' && (
              <div style={{ maxWidth: '480px' }}>
                <div style={cardStyle}>
                  <h2 style={{ fontFamily: 'Inter, sans-serif', fontSize: '15px', fontWeight: 600, color: 'white', marginBottom: '8px' }}>Cambiar contraseña</h2>
                  <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '13px', color: '#555', marginBottom: '20px', fontWeight: 300 }}>Actualiza la contraseña de acceso al panel de administración.</p>
                  {errorClave && <div style={{ backgroundColor: '#1a0a0a', border: '1px solid #ff6b6b', padding: '10px 14px', marginBottom: '16px', borderRadius: '2px' }}><p style={{ fontFamily: 'Inter, sans-serif', color: '#ff6b6b', fontSize: '13px' }}>{errorClave}</p></div>}
                  {exitoClave && <div style={{ backgroundColor: '#0a1a0a', border: '1px solid #4caf50', padding: '10px 14px', marginBottom: '16px', borderRadius: '2px' }}><p style={{ fontFamily: 'Inter, sans-serif', color: '#4caf50', fontSize: '13px' }}>{exitoClave}</p></div>}
                  <span style={lbl}>NUEVA CONTRASEÑA</span>
                  <input type="password" value={nuevaClave} onChange={e => setNuevaClave(e.target.value)} placeholder="Mínimo 6 caracteres" style={inp} />
                  <span style={lbl}>CONFIRMAR CONTRASEÑA</span>
                  <input type="password" value={confirmarClave} onChange={e => setConfirmarClave(e.target.value)} placeholder="Repite la contraseña" style={{ ...inp, marginBottom: '20px' }} />
                  <button onClick={cambiarClave} style={{ width: '100%', padding: '14px', backgroundColor: 'white', border: 'none', color: '#000', fontSize: '12px', letterSpacing: '2px', cursor: 'pointer', fontFamily: 'Inter, sans-serif', fontWeight: 600, borderRadius: '2px' }}>Actualizar contraseña</button>
                </div>
              </div>
            )}

          </div>
        </main>
      </div>
    </div>
  )
}

export default AdminPanel