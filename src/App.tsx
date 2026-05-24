import { useState, useEffect, useRef } from 'react'
import AdminLogin from './AdminLogin'
import AdminPanel from './AdminPanel'

const BG    = '#0a0a0a'
const BG2   = '#0d0d0d'
const CARD  = '#141414'
const BORDER = '#2a2a2a'

const FUENTES: Record<string, string> = {
  'Impact':            "'Impact', 'Arial Black', sans-serif",
  'Bebas Neue':        "'Bebas Neue', sans-serif",
  'Oswald':            "'Oswald', sans-serif",
  'Barlow Condensed':  "'Barlow Condensed', sans-serif",
  'Anton':             "'Anton', sans-serif",
}

const defaultData = {
  slogan:         'NO SOMOS UN GIMNASIO, SOMOS ONE.',
  sobreOne:       'Somos un gimnasio boutique con un enfoque integral y personalizado. Diseñamos planes a medida, combinando entrenamiento, rehabilitación kinesiológica y nutrición, para lograr resultados reales y seguros.',
  sobreOneFrase:  'Aquí te espera un servicio premium y una experiencia de entrenamiento de alto nivel.',
  horarioSemana:  'Lunes a Viernes: 6:30 a 21:00 hrs.',
  horarioSabado:  'Sábados: 10:00 a 13:00 hrs. (solo recuperativos)',
  fuenteTitulos:  'Impact',
  videoUrl:       '',
  videoBase64:    '',
  profesores:     [] as { nombre: string; foto: string; descripcion: string }[],
  planes: [
    { nombre: 'PLAN PERSONAL', descripcion: 'Sesiones uno a uno con tu Coach', precios: [{ frecuencia: '2 veces x semana', valor: '$230.000' }, { frecuencia: '3 veces x semana', valor: '$260.000' }, { frecuencia: '4 veces x semana', valor: '$290.000' }] },
    { nombre: 'PLAN DÚO', descripcion: 'Entrenan juntos con un mismo Coach. (Valor por persona)', precios: [{ frecuencia: '2 veces x semana', valor: '$295.000' }, { frecuencia: '3 veces x semana', valor: '$340.000' }, { frecuencia: '4 veces x semana', valor: '$380.000' }, { frecuencia: '5 veces x semana', valor: '$430.000' }] },
    { nombre: 'PLAN 3', descripcion: 'Sesiones en grupos de 3 personas con un Coach en común.', precios: [{ frecuencia: '2 veces x semana', valor: '$125.000' }, { frecuencia: '3 veces x semana', valor: '$150.000' }] },
    { nombre: 'PLAN 4', descripcion: 'Sesiones en grupos de 4 personas con un Coach en común.', precios: [{ frecuencia: '2 veces x semana', valor: '$110.000' }, { frecuencia: '3 veces x semana', valor: '$130.000' }] },
    { nombre: 'PLAN 6', descripcion: 'Sesiones en grupos de 6 personas con un Coach en común.', precios: [{ frecuencia: '2 veces x semana', valor: '$85.000' }, { frecuencia: '3 veces x semana', valor: '$95.000' }, { frecuencia: '4 veces x semana', valor: '$110.000' }, { frecuencia: '5 veces x semana', valor: '$125.000' }] },
    { nombre: 'PASE DIARIO', descripcion: 'Permite asistir a una clase personal o grupal, según disponibilidad.', precios: [{ frecuencia: 'Por sesión', valor: '$12.000' }] },
  ],
  reglamento: [
    { titulo: 'HORARIO', items: ['Lunes a Viernes: 6:30 a 21:00 hrs.', 'Sábados: 10:00 a 13:00 hrs. (solo recuperativos)', 'Los sábados funcionan exclusivamente para recuperación de clases previamente canceladas.'] },
    { titulo: 'CONVIVENCIA Y ORDEN', items: ['Mantener un trato adecuado entre alumnos, profesores y equipo.', 'Cada persona es responsable de cuidar el espacio y el equipamiento.', 'Es obligatorio el uso de toalla personal.', 'Toda bebida retirada debe informarse y ser pagada.'] },
    { titulo: 'PLANES Y PAGOS', items: ['Todos los planes tienen duración de un mes con número fijo de sesiones.', 'La mensualidad debe cancelarse a más tardar el día 3 de cada mes.', 'Los planes son personales e intransferibles.', 'No se realizan devoluciones por inasistencia o abandono.'] },
    { titulo: 'CLASES', items: ['Cada clase debe agendarse con profesores o administración.', 'La clase finaliza en el horario estipulado independiente de la hora de llegada.', 'Las clases deben cancelarse con mínimo 3 horas de anticipación.'] },
    { titulo: 'RECUPERACIÓN', items: ['En planes personales: una clase cancelada puede reagendarse dentro del mismo mes.', 'En clases grupales: puede recuperarse solo si existe cupo disponible.', 'ONE no está obligado a reorganizar su planificación por inasistencias.'] },
    { titulo: 'RESPONSABILIDAD', items: ['ONE no se hace responsable por lesiones derivadas del uso incorrecto.', 'Cada persona es responsable de sus pertenencias personales.', 'ONE no responde por pérdidas u olvidos dentro del recinto.'] },
  ],
}

const App = () => {
  const [vista, setVista]               = useState<'web' | 'login' | 'admin'>('web')
  const [webData, setWebData]           = useState(defaultData)
  const [menuAbierto, setMenuAbierto]   = useState(false)
  const [seccionActiva, setSeccionActiva] = useState('inicio')
  const [scrolled, setScrolled]         = useState(false)
  const [seccionVisible, setSeccionVisible] = useState<Record<string, boolean>>({})
  const [wspHover, setWspHover]         = useState(false)
  const observerRef = useRef<IntersectionObserver | null>(null)

  useEffect(() => {
    if (window.location.pathname === '/admin') {
      const logged = localStorage.getItem('one_admin_logged') === 'true'
      setVista(logged ? 'admin' : 'login')
    }
    const cargar = async () => {
      try {
        const res    = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:4000'}/api/config`)
        const remoto = await res.json()
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
          setWebData({ ...defaultData, ...remoto })
          return
        }
      } catch {}
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
          setWebData({ ...defaultData, ...parsed })
        } catch {}
      }
    }
    cargar()
  }, [])

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 80)
      const secciones = ['inicio', 'nosotros', 'planes', 'profesores', 'reglamento', 'contacto']
      for (const id of secciones) {
        const el = document.getElementById(id)
        if (el) {
          const rect = el.getBoundingClientRect()
          if (rect.top <= 100 && rect.bottom >= 100) { setSeccionActiva(id); break }
        }
      }
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    if (observerRef.current) observerRef.current.disconnect()
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          setSeccionVisible(prev => ({ ...prev, [entry.target.id]: entry.isIntersecting }))
        })
      },
      { threshold: 0.1 }
    )
    const secciones = ['inicio', 'nosotros', 'planes', 'profesores', 'reglamento', 'contacto']
    secciones.forEach(id => {
      const el = document.getElementById(id)
      if (el) observerRef.current?.observe(el)
    })
    return () => observerRef.current?.disconnect()
  }, [])

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
    setMenuAbierto(false)
  }

  if (vista === 'login') return <AdminLogin onLogin={() => setVista('admin')} />
  if (vista === 'admin') return <AdminPanel onLogout={() => { localStorage.removeItem('one_admin_logged'); setVista('login') }} />

  const navLinks = [
    { id: 'inicio',      label: 'INICIO' },
    { id: 'nosotros',    label: 'QUIÉNES SOMOS' },
    { id: 'planes',      label: 'PLANES' },
    { id: 'profesores',  label: 'PROFESORES' },
    { id: 'reglamento',  label: 'REGLAMENTO' },
    { id: 'contacto',    label: 'CONTACTO' },
  ]

  const fuenteActual = FUENTES[(webData as any).fuenteTitulos] || FUENTES['Impact']
  const T = { fontFamily: fuenteActual, fontWeight: 900 as const }
  const B = { fontFamily: "'Inter', sans-serif", fontWeight: 300 as const }

  const outline = (size: string, stroke = '2px white'): React.CSSProperties => ({
    ...T, fontSize: size, color: 'transparent',
    WebkitTextStroke: stroke, lineHeight: 0.9 as unknown as string,
  })

  const fadeIn = (id: string, delay = 0): React.CSSProperties => ({
    opacity: seccionVisible[id] ? 1 : 0,
    transform: seccionVisible[id] ? 'translateY(0)' : 'translateY(40px)',
    transition: `opacity 0.8s ease ${delay}s, transform 0.8s ease ${delay}s`,
  })

  const videoSrc = (webData as any).videoBase64 || (webData as any).videoUrl || ''

  return (
    <div style={{ backgroundColor: BG, color: 'white', overflowX: 'hidden' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500&family=Bebas+Neue&family=Oswald:wght@700&family=Barlow+Condensed:wght@900&family=Anton&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        html { scroll-behavior: smooth; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: #0a0a0a; }
        ::-webkit-scrollbar-thumb { background: #fff; }
        .plan-card { transition: all 0.3s; }
        .plan-card:hover { border-color: #fff !important; transform: translateY(-6px) !important; box-shadow: 0 20px 40px rgba(0,0,0,0.5); }
        .prof-card { transition: all 0.3s; cursor: default; }
        .prof-card:hover { border-color: #fff !important; transform: translateY(-4px); }
        .prof-card:hover .prof-img { filter: grayscale(0%) brightness(0.9) !important; }
        .nav-btn { transition: all 0.2s; }
        .nav-btn:hover { color: white !important; border-bottom-color: white !important; }
        .btn-hover { transition: all 0.3s; }
        .btn-hover:hover { background-color: #fff !important; color: #000 !important; }
        .red-social-btn { transition: all 0.3s; display:inline-flex; align-items:center; gap:8px; }
        .red-social-btn:hover { border-color: white !important; background-color: white !important; color: #000 !important; }
        .red-social-btn:hover svg { fill: #000 !important; }
        .sidebar-social { color: #aaa; transition: color 0.2s; display: flex; align-items: center; }
        .sidebar-social:hover { color: white !important; }
        .menu-btn:hover { opacity: 0.7; }
        @media (max-width: 900px) { .desktop-nav { display: none !important; } }
        @keyframes bounce { 0%,100%{transform:translateX(-50%) translateY(0)} 50%{transform:translateX(-50%) translateY(-12px)} }
        @keyframes wsp-pulse { 0%,100%{box-shadow:0 0 0 0 rgba(37,211,102,0.4)} 70%{box-shadow:0 0 0 10px rgba(37,211,102,0)} }
      `}</style>

      {/* NAVBAR */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1000,
        backgroundColor: scrolled ? 'rgba(10,10,10,0.95)' : 'rgba(0,0,0,0.3)',
        backdropFilter: 'blur(12px)',
        borderBottom: scrolled ? `1px solid ${BORDER}` : 'none',
        transition: 'all 0.4s ease', padding: '0 32px',
        display: 'grid', gridTemplateColumns: '1fr auto 1fr',
        alignItems: 'center', height: '72px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <button className="menu-btn" onClick={() => setMenuAbierto(!menuAbierto)} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: '5px', padding: '4px', transition: 'opacity 0.2s' }}>
            {[0, 1, 2].map(i => (
              <span key={i} style={{ display: 'block', width: '26px', height: '2px', backgroundColor: 'white', transition: 'all 0.3s ease', opacity: menuAbierto && i === 1 ? 0 : 1, transform: menuAbierto ? i === 0 ? 'rotate(45deg) translate(5px, 5px)' : i === 2 ? 'rotate(-45deg) translate(5px, -5px)' : 'none' : 'none' }} />
            ))}
          </button>
        </div>

        <button onClick={() => scrollTo('inicio')} style={{ background: 'none', border: 'none', cursor: 'pointer', justifySelf: 'center' }}>
          <div style={{ border: '2px solid white', padding: '6px 18px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ ...T, fontSize: '22px', color: 'white', letterSpacing: '4px' }}>ONE</span>
          </div>
        </button>

        <div className="desktop-nav" style={{ display: 'flex', gap: '24px', justifyContent: 'flex-end' }}>
          {navLinks.slice(1).map(link => (
            <button key={link.id} onClick={() => scrollTo(link.id)} className="nav-btn" style={{ background: 'none', border: 'none', cursor: 'pointer', ...B, fontSize: '10px', letterSpacing: '2px', fontWeight: 500, color: seccionActiva === link.id ? 'white' : '#aaa', borderBottom: seccionActiva === link.id ? '1px solid white' : '1px solid transparent', paddingBottom: '4px' }}>{link.label}</button>
          ))}
        </div>
      </nav>

      {/* SIDEBAR */}
      <div style={{ position: 'fixed', top: 0, left: menuAbierto ? 0 : '-100%', width: '300px', height: '100vh', backgroundColor: '#060606', borderRight: `1px solid ${BORDER}`, zIndex: 999, transition: 'left 0.4s cubic-bezier(0.4, 0, 0.2, 1)', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '48px' }}>
        <p style={{ ...B, fontSize: '9px', letterSpacing: '4px', color: '#666', marginBottom: '40px' }}>MENÚ</p>
        {navLinks.map((link, i) => (
          <button key={link.id} onClick={() => scrollTo(link.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', ...T, fontSize: '26px', color: seccionActiva === link.id ? 'white' : '#444', textAlign: 'left', padding: '8px 0', lineHeight: 1.1, transition: `color 0.2s, transform 0.3s ease ${i * 0.05}s, opacity 0.3s ease ${i * 0.05}s`, transform: menuAbierto ? 'translateX(0)' : 'translateX(-20px)', opacity: menuAbierto ? 1 : 0 }}
            onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.color = 'white'}
            onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.color = seccionActiva === link.id ? 'white' : '#444'}
          >{link.label}</button>
        ))}

        {/* REDES SOCIALES CON ICONOS */}
        <div style={{ marginTop: '48px', display: 'flex', gap: '20px', alignItems: 'center' }}>

          {/* Facebook */}
          <a href="https://www.facebook.com/oneevolution.cl/" target="_blank" rel="noreferrer" className="sidebar-social"
            onMouseEnter={e => (e.currentTarget as HTMLAnchorElement).style.color = 'white'}
            onMouseLeave={e => (e.currentTarget as HTMLAnchorElement).style.color = '#aaa'}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
            </svg>
          </a>

          {/* Instagram */}
          <a href="https://www.instagram.com/oneevolution.cl" target="_blank" rel="noreferrer" className="sidebar-social"
            onMouseEnter={e => (e.currentTarget as HTMLAnchorElement).style.color = 'white'}
            onMouseLeave={e => (e.currentTarget as HTMLAnchorElement).style.color = '#aaa'}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
            </svg>
          </a>

          {/* WhatsApp */}
          <a href="https://wa.me/56956723743" target="_blank" rel="noreferrer" className="sidebar-social"
            onMouseEnter={e => (e.currentTarget as HTMLAnchorElement).style.color = 'white'}
            onMouseLeave={e => (e.currentTarget as HTMLAnchorElement).style.color = '#aaa'}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
            </svg>
          </a>

        </div>
      </div>
      {menuAbierto && <div onClick={() => setMenuAbierto(false)} style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.85)', zIndex: 998, backdropFilter: 'blur(4px)' }} />}

      {/* BOTÓN WHATSAPP FLOTANTE */}
      <div style={{ position: 'fixed', bottom: '32px', left: '28px', zIndex: 900 }}>
        {wspHover && (
          <div style={{ position: 'absolute', bottom: '64px', left: 0, backgroundColor: 'white', color: '#000', padding: '12px 16px', borderRadius: '8px', fontSize: '13px', fontFamily: 'Inter, sans-serif', fontWeight: 400, whiteSpace: 'nowrap', boxShadow: '0 4px 20px rgba(0,0,0,0.3)', lineHeight: 1.5 }}>
            <strong style={{ display: 'block', marginBottom: '2px', fontWeight: 600 }}>¿Tienes alguna duda?</strong>
            Comunícate con nosotros
            <div style={{ position: 'absolute', bottom: '-8px', left: '20px', width: 0, height: 0, borderLeft: '8px solid transparent', borderRight: '8px solid transparent', borderTop: '8px solid white' }} />
          </div>
        )}
        <a href="https://wa.me/56956723743" target="_blank" rel="noreferrer"
          onMouseEnter={() => setWspHover(true)} onMouseLeave={() => setWspHover(false)}
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '52px', height: '52px', borderRadius: '50%', backgroundColor: '#25d366', textDecoration: 'none', animation: 'wsp-pulse 2s infinite', transition: 'transform 0.2s', transform: wspHover ? 'scale(1.1)' : 'scale(1)' }}>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="white">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
          </svg>
        </a>
      </div>

      {/* INICIO */}
      <section id="inicio" style={{ height: '100vh', position: 'relative', overflow: 'hidden', backgroundColor: '#000' }}>
        {videoSrc ? (
          videoSrc.startsWith('data:') ? (
            <video autoPlay muted loop playsInline style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}>
              <source src={videoSrc} />
            </video>
          ) : (
            <iframe src={videoSrc} style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '177.78vh', height: '100vh', minWidth: '100%', minHeight: '56.25vw', border: 'none', pointerEvents: 'none' }} allow="autoplay; fullscreen" title="ONE Your Evolution" />
          )
        ) : (
          <img src="https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=1920&q=80" alt="ONE" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', filter: 'brightness(0.25)' }} />
        )}
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(0,0,0,0.2) 0%, rgba(0,0,0,0.1) 50%, rgba(0,0,0,0.5) 100%)', zIndex: 1 }} />
        <div style={{ position: 'absolute', bottom: '36px', left: '50%', animation: 'bounce 2s infinite', zIndex: 2 }}>
          <span style={{ color: '#fff', fontSize: '18px', opacity: 0.6 }}>↓</span>
        </div>
      </section>

      {/* NOSOTROS */}
      <section id="nosotros" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center' }}>
        <div style={{ display: 'flex', width: '100%', flexWrap: 'wrap' }}>
          <div style={{ flex: '1 1 50%', minHeight: '60vh', position: 'relative', minWidth: '280px', overflow: 'hidden' }}>
            <img src="https://images.unsplash.com/photo-1571902943202-507ec2618e8f?w=900&q=80" alt="Sobre ONE" style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'brightness(0.25)', transition: 'transform 0.8s ease', transform: seccionVisible['nosotros'] ? 'scale(1)' : 'scale(1.08)' }} />
            <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <h2 style={{ ...outline('clamp(60px, 10vw, 130px)', '2px rgba(255,255,255,0.2)'), textAlign: 'center', ...fadeIn('nosotros', 0.2) }}>SOBRE<br />ONE</h2>
            </div>
          </div>
          <div style={{ flex: '1 1 50%', minWidth: '280px', backgroundColor: BG2, display: 'flex', alignItems: 'center', padding: 'clamp(40px, 6vw, 80px)' }}>
            <div style={{ ...fadeIn('nosotros', 0.3) }}>
              <p style={{ ...B, fontSize: '10px', letterSpacing: '6px', color: '#bbb', marginBottom: '32px', fontWeight: 500 }}>QUIÉNES SOMOS</p>
              <p style={{ ...B, fontSize: 'clamp(14px, 1.6vw, 19px)', lineHeight: 1.9, color: '#e0e0e0', marginBottom: '24px' }}>{webData.sobreOne}</p>
              <p style={{ ...B, fontSize: 'clamp(13px, 1.3vw, 16px)', lineHeight: 2, color: '#bbb' }}>{webData.sobreOneFrase}</p>
              <div style={{ marginTop: '52px', display: 'flex', gap: '48px', flexWrap: 'wrap' }}>
                {[
                  { n: webData.profesores.length > 0 ? String(webData.profesores.length) : '—', l: 'COACHES' },
                  { n: String(webData.planes.length), l: 'PLANES' },
                  { n: '100%', l: 'PERSONALIZADO' },
                ].map(s => (
                  <div key={s.l}>
                    <div style={{ ...T, fontSize: '52px', color: 'white' }}>{s.n}</div>
                    <div style={{ ...B, fontSize: '9px', letterSpacing: '3px', color: '#888', fontWeight: 500 }}>{s.l}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* PLANES */}
      <section id="planes" style={{ padding: 'clamp(60px, 8vw, 120px) clamp(20px, 5vw, 80px)', backgroundColor: BG }}>
        <div style={{ textAlign: 'center', marginBottom: '80px', ...fadeIn('planes') }}>
          <p style={{ ...B, fontSize: '10px', letterSpacing: '6px', color: '#bbb', marginBottom: '20px', fontWeight: 500 }}>AJUSTADOS A TU MEDIDA</p>
          <h2 style={{ ...outline('clamp(60px, 12vw, 140px)') }}>PLANES</h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2px', maxWidth: '1200px', margin: '0 auto' }}>
          {webData.planes.map((plan, i) => (
            <div key={i} className="plan-card" style={{ backgroundColor: i % 2 === 0 ? CARD : '#111', border: `1px solid ${BORDER}`, padding: '40px 32px', opacity: seccionVisible['planes'] ? 1 : 0, transform: seccionVisible['planes'] ? 'translateY(0)' : 'translateY(40px)', transition: `opacity 0.6s ease ${i * 0.1}s, transform 0.6s ease ${i * 0.1}s, border-color 0.3s, box-shadow 0.3s` }}>
              <h3 style={{ ...T, fontSize: '36px', color: 'white', marginBottom: '10px' }}>{plan.nombre}</h3>
              <p style={{ ...B, fontSize: '14px', color: '#ccc', marginBottom: '32px', lineHeight: 1.7, fontWeight: 400 }}>{plan.descripcion}</p>
              <div style={{ borderTop: `1px solid #1a1a1a`, paddingTop: '24px' }}>
                {plan.precios.map((p, j) => (
                  <div key={j} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 0', borderBottom: j < plan.precios.length - 1 ? `1px solid #1a1a1a` : 'none' }}>
                    <span style={{ ...B, fontSize: '13px', color: '#ccc', letterSpacing: '1px', fontWeight: 400 }}>{p.frecuencia}</span>
                    <span style={{ ...T, fontSize: '28px', color: 'white', letterSpacing: '-1px' }}>{p.valor}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
        <div style={{ textAlign: 'center', marginTop: '64px', ...fadeIn('planes', 0.4) }}>
          <a href="https://wa.me/56956723743" target="_blank" rel="noreferrer" className="btn-hover" style={{ display: 'inline-block', backgroundColor: 'transparent', border: '1px solid white', color: 'white', padding: '18px 52px', fontSize: '11px', letterSpacing: '4px', textDecoration: 'none', ...B, fontWeight: 500 }}>
            QUIERO SER PARTE DE ONE
          </a>
        </div>
      </section>

      {/* PROFESORES */}
      <section id="profesores" style={{ padding: 'clamp(60px, 8vw, 120px) clamp(20px, 5vw, 80px)', backgroundColor: BG2 }}>
        <div style={{ textAlign: 'center', marginBottom: '80px', ...fadeIn('profesores') }}>
          <p style={{ ...B, fontSize: '10px', letterSpacing: '6px', color: '#bbb', marginBottom: '20px', fontWeight: 500 }}>NUESTRO EQUIPO</p>
          <h2 style={{ ...outline('clamp(60px, 12vw, 140px)') }}>COACHES</h2>
        </div>
        {webData.profesores.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 20px', ...fadeIn('profesores', 0.2) }}>
            <p style={{ ...B, fontSize: '15px', color: '#444', fontWeight: 300 }}>Próximamente conocerás a nuestro equipo de coaches.</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '24px', maxWidth: '1100px', margin: '0 auto' }}>
            {webData.profesores.map((prof, i) => (
              <div key={i} className="prof-card" style={{ border: `1px solid ${BORDER}`, borderRadius: '2px', overflow: 'hidden', backgroundColor: CARD, opacity: seccionVisible['profesores'] ? 1 : 0, transform: seccionVisible['profesores'] ? 'translateY(0)' : 'translateY(40px)', transition: `opacity 0.6s ease ${i * 0.1}s, transform 0.6s ease ${i * 0.1}s, border-color 0.3s` }}>
                <div style={{ width: '100%', aspectRatio: '4/3', overflow: 'hidden', backgroundColor: '#0d0d0d' }}>
                  {prof.foto ? (
                    <img src={prof.foto} alt={prof.nombre} className="prof-img" style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'grayscale(80%) brightness(0.75)', transition: 'filter 0.4s ease' }} />
                  ) : (
                    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#111' }}>
                      <span style={{ ...T, fontSize: '64px', color: '#222' }}>{prof.nombre.charAt(0).toUpperCase()}</span>
                    </div>
                  )}
                </div>
                <div style={{ padding: '20px' }}>
                  <h3 style={{ ...T, fontSize: '22px', color: 'white', marginBottom: '4px', letterSpacing: '1px' }}>{prof.nombre}</h3>
                  <p style={{ ...B, fontSize: '9px', letterSpacing: '3px', color: '#555', marginBottom: prof.descripcion ? '12px' : '0', fontWeight: 500 }}>COACH PERSONAL</p>
                  {prof.descripcion && (
                    <p style={{ ...B, fontSize: '13px', color: '#aaa', lineHeight: 1.7, fontWeight: 300, borderTop: `1px solid ${BORDER}`, paddingTop: '12px', marginTop: '4px' }}>{prof.descripcion}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* REGLAMENTO */}
      <section id="reglamento" style={{ padding: 'clamp(60px, 8vw, 120px) clamp(20px, 5vw, 80px)', backgroundColor: BG }}>
        <div style={{ textAlign: 'center', marginBottom: '80px', ...fadeIn('reglamento') }}>
          <p style={{ ...B, fontSize: '10px', letterSpacing: '6px', color: '#bbb', marginBottom: '20px', fontWeight: 500 }}>NORMAS DE CONVIVENCIA</p>
          <h2 style={{ ...outline('clamp(46px, 10vw, 120px)') }}>REGLAMENTO<br />INTERNO</h2>
          <p style={{ ...B, fontSize: '14px', color: '#bbb', marginTop: '32px', lineHeight: 1.9, maxWidth: '560px', margin: '32px auto 0', fontWeight: 400 }}>
            En ONE buscamos organizarnos mejor y cuidar tu espacio, el que con mucho profesionalismo compartimos en comunidad.
          </p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2px', maxWidth: '1200px', margin: '0 auto' }}>
          {webData.reglamento.map((reg, i) => (
            <div key={i} style={{ backgroundColor: i % 2 === 0 ? CARD : '#111', padding: '40px 36px', borderTop: `1px solid ${BORDER}`, opacity: seccionVisible['reglamento'] ? 1 : 0, transform: seccionVisible['reglamento'] ? 'translateY(0)' : 'translateY(30px)', transition: `opacity 0.6s ease ${i * 0.1}s, transform 0.6s ease ${i * 0.1}s` }}>
              <h3 style={{ ...T, fontSize: '22px', color: 'white', marginBottom: '28px', letterSpacing: '1px' }}>{reg.titulo}</h3>
              <ul style={{ margin: 0, padding: 0, listStyle: 'none' }}>
                {reg.items.map((item, j) => (
                  <li key={j} style={{ ...B, fontSize: '13px', color: '#ccc', lineHeight: 1.9, fontWeight: 400, paddingBottom: '12px', marginBottom: '12px', borderBottom: j < reg.items.length - 1 ? `1px solid #1a1a1a` : 'none', paddingLeft: '16px', position: 'relative' }}>
                    <span style={{ position: 'absolute', left: 0, color: '#888' }}>—</span>{item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* CONTACTO */}
      <section id="contacto" style={{ minHeight: '80vh', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
        <img src="https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=1920&q=80" alt="Contacto" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', filter: 'brightness(0.1)' }} />
        <div style={{ position: 'relative', zIndex: 1, textAlign: 'center', padding: '60px 24px' }}>
          <p style={{ ...B, fontSize: '10px', letterSpacing: '6px', color: '#bbb', marginBottom: '24px', fontWeight: 500, ...fadeIn('contacto') }}>ÚNETE A LA COMUNIDAD</p>
          <h2 style={{ ...outline('clamp(60px, 14vw, 160px)'), margin: '0 0 52px', ...fadeIn('contacto', 0.2) }}>SÍGUENOS</h2>
          <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '64px', ...fadeIn('contacto', 0.3) }}>
            {[
              { href: 'https://www.facebook.com/oneevolution.cl/', label: 'FACEBOOK', path: 'M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z' },
              { href: 'https://www.instagram.com/oneevolution.cl', label: 'INSTAGRAM', path: 'M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z' },
              { href: 'https://wa.me/56956723743', label: 'WHATSAPP', path: 'M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z' },
            ].map(r => (
              <a key={r.href} href={r.href} target="_blank" rel="noreferrer" className="red-social-btn"
                style={{ border: `1px solid ${BORDER}`, color: 'white', padding: '14px 28px', fontSize: '11px', letterSpacing: '3px', textDecoration: 'none', backgroundColor: 'rgba(0,0,0,0.6)', ...B, fontWeight: 500 }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="white" style={{ flexShrink: 0 }}><path d={r.path} /></svg>
                {r.label}
              </a>
            ))}
          </div>
          <div style={{ borderTop: `1px solid ${BORDER}`, paddingTop: '48px', ...fadeIn('contacto', 0.4) }}>
            <p style={{ ...B, fontSize: '14px', color: '#ccc', lineHeight: 2.6, fontWeight: 400 }}>
              Alto Las Rastras, Talca<br />+56 9 5672 3743<br />contacto@oneevolution.cl
            </p>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ backgroundColor: '#000', borderTop: `1px solid #0d0d0d`, padding: '32px 48px', textAlign: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '2px', justifyContent: 'center', marginBottom: '12px' }}>
          <span style={{ ...T, fontSize: '20px', color: 'white' }}>ONE</span>
          <span style={{ ...B, fontSize: '8px', letterSpacing: '4px', color: '#555', marginLeft: '8px' }}>YOUR EVOLUTION</span>
        </div>
        <p style={{ ...B, fontSize: '11px', color: '#555', fontWeight: 400 }}>
          © 2025 ONE Evolution. Todos los derechos reservados. | www.oneevolution.cl
        </p>
      </footer>
    </div>
  )
}

export default App