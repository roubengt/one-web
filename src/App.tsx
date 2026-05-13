import { useState, useEffect } from 'react'
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
          remoto.profesores = remoto.profesores.map((nombre: string) => ({ nombre, foto: '' }))
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
          parsed.profesores = parsed.profesores.map((nombre: string) => ({ nombre, foto: '' }))
        }
        setWebData({ ...defaultData, ...parsed })
      } catch {}
    }
  }
  cargar()
}, [])

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50)
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

  const fuenteActual = FUENTES[webData.fuenteTitulos] || FUENTES['Impact']
  const T = { fontFamily: fuenteActual, fontWeight: 900 as const }
  const B = { fontFamily: "'Inter', sans-serif", fontWeight: 300 as const }

  const outline = (size: string, stroke = '2px white'): React.CSSProperties => ({
    ...T, fontSize: size,
    color: 'transparent',
    WebkitTextStroke: stroke,
    lineHeight: 0.9 as unknown as string,
  })

  const fotoDefault = (i: number) => {
    const ids = [
      '1571019613454-1cb2f99b2d8b', '1534367899742-44dd18ab6e9b',
      '1583454110551-21f2fa2afe61', '1568702846914-96b305d2aaeb',
      '1540497077202-7c8a3999166f', '1517836357463-d25dfeac3438',
      '1521804906086-f16ce6e7eb7a',
    ]
    return `https://images.unsplash.com/photo-${ids[Math.min(i, ids.length - 1)]}?w=400&q=80`
  }

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
        .plan-card:hover { border-color: #fff !important; transform: translateY(-4px); }
        .prof-card:hover { border-color: #fff !important; }
        .nav-btn:hover { color: white !important; border-bottom-color: white !important; }
        .btn-hover:hover { background-color: #fff !important; color: #000 !important; }
        @media (max-width: 900px) { .desktop-nav { display: none !important; } }
        @keyframes bounce { 0%,100%{transform:translateX(-50%) translateY(0)} 50%{transform:translateX(-50%) translateY(-10px)} }
      `}</style>

      {/* NAVBAR */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1000,
        backgroundColor: scrolled ? 'rgba(10,10,10,0.97)' : 'transparent',
        borderBottom: scrolled ? `1px solid ${BORDER}` : 'none',
        transition: 'all 0.3s', padding: '0 48px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        height: '72px',
      }}>
        <button onClick={() => scrollTo('inicio')} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '2px' }}>
            <span style={{ ...T, fontSize: '30px', color: 'white', letterSpacing: '1px' }}>ONE</span>
            <span style={{ ...B, fontSize: '9px', letterSpacing: '5px', color: '#444', marginLeft: '10px' }}>YOUR EVOLUTION</span>
          </div>
        </button>

        <div className="desktop-nav" style={{ display: 'flex', gap: '36px' }}>
          {navLinks.map(link => (
            <button key={link.id} onClick={() => scrollTo(link.id)} className="nav-btn" style={{
              background: 'none', border: 'none', cursor: 'pointer',
              ...B, fontSize: '11px', letterSpacing: '3px', fontWeight: 500,
              color: seccionActiva === link.id ? 'white' : '#555',
              borderBottom: seccionActiva === link.id ? '1px solid white' : '1px solid transparent',
              paddingBottom: '4px', transition: 'all 0.2s',
            }}>{link.label}</button>
          ))}
        </div>

        <button onClick={() => setMenuAbierto(!menuAbierto)} style={{
          background: 'none', border: 'none', cursor: 'pointer',
          display: 'flex', flexDirection: 'column', gap: '5px', padding: '4px',
        }}>
          {[0, 1, 2].map(i => (
            <span key={i} style={{
              display: 'block', width: '26px', height: '2px', backgroundColor: 'white',
              transition: 'all 0.3s', opacity: menuAbierto && i === 1 ? 0 : 1,
            }} />
          ))}
        </button>
      </nav>

      {/* SIDEBAR */}
      <div style={{
        position: 'fixed', top: 0, right: menuAbierto ? 0 : '-100%',
        width: '300px', height: '100vh', backgroundColor: '#060606',
        borderLeft: `1px solid ${BORDER}`, zIndex: 999,
        transition: 'right 0.4s ease',
        display: 'flex', flexDirection: 'column', justifyContent: 'center',
        padding: '48px',
      }}>
        <p style={{ ...B, fontSize: '9px', letterSpacing: '4px', color: '#333', marginBottom: '40px' }}>MENÚ</p>
        {navLinks.map(link => (
          <button key={link.id} onClick={() => scrollTo(link.id)} style={{
            background: 'none', border: 'none', cursor: 'pointer',
            ...T, fontSize: '26px',
            color: seccionActiva === link.id ? 'white' : '#2a2a2a',
            textAlign: 'left', padding: '8px 0', lineHeight: 1.1, transition: 'color 0.2s',
          }}>{link.label}</button>
        ))}
        <div style={{ marginTop: '48px', display: 'flex', gap: '24px' }}>
          {[
            { href: 'https://www.facebook.com/oneevolution.cl/', label: 'FB' },
            { href: 'https://www.instagram.com/oneevolution.cl', label: 'IG' },
            { href: 'https://wa.me/56956723743', label: 'WA' },
          ].map(r => (
            <a key={r.href} href={r.href} target="_blank" rel="noreferrer"
              style={{ ...B, color: '#333', fontSize: '11px', letterSpacing: '2px', fontWeight: 500, textDecoration: 'none' }}
            >{r.label}</a>
          ))}
        </div>
      </div>
      {menuAbierto && (
        <div onClick={() => setMenuAbierto(false)} style={{
          position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.85)',
          zIndex: 998, backdropFilter: 'blur(4px)',
        }} />
      )}

      {/* INICIO */}
      <section id="inicio" style={{ height: '100vh', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
        <img src="https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=1920&q=80" alt="ONE"
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', filter: 'brightness(0.18)' }} />
        <div style={{ position: 'relative', zIndex: 1, textAlign: 'center', padding: '0 24px' }}>
          <p style={{ ...B, fontSize: '11px', letterSpacing: '8px', color: '#555', marginBottom: '24px' }}>BIENVENIDO A</p>
          <h1 style={{ ...outline('clamp(100px, 18vw, 220px)'), letterSpacing: '4px', margin: 0 }}>ONE</h1>
          <p style={{ ...B, fontSize: '11px', letterSpacing: '10px', color: '#333', marginTop: '20px' }}>YOUR EVOLUTION</p>
          <p style={{ ...B, fontSize: 'clamp(12px, 1.4vw, 16px)', color: '#666', marginTop: '40px', letterSpacing: '3px' }}>{webData.slogan}</p>
          <button onClick={() => scrollTo('nosotros')} className="btn-hover" style={{
            marginTop: '52px', background: 'none', border: '1px solid white',
            color: 'white', padding: '16px 44px', fontSize: '11px', letterSpacing: '4px',
            cursor: 'pointer', transition: 'all 0.3s', ...B, fontWeight: 500,
          }}>DESCUBRE MÁS</button>
        </div>
        <div style={{ position: 'absolute', bottom: '36px', left: '50%', animation: 'bounce 2s infinite' }}>
          <span style={{ color: '#333', fontSize: '18px' }}>↓</span>
        </div>
      </section>

      {/* NOSOTROS */}
      <section id="nosotros" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center' }}>
        <div style={{ display: 'flex', width: '100%', flexWrap: 'wrap' }}>
          <div style={{ flex: '1 1 50%', minHeight: '60vh', position: 'relative', minWidth: '280px' }}>
            <img src="https://images.unsplash.com/photo-1571902943202-507ec2618e8f?w=900&q=80" alt="Sobre ONE"
              style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'brightness(0.25)' }} />
            <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <h2 style={{ ...outline('clamp(60px, 10vw, 130px)', '2px rgba(255,255,255,0.25)'), textAlign: 'center' }}>SOBRE<br />ONE</h2>
            </div>
          </div>
          <div style={{ flex: '1 1 50%', minWidth: '280px', backgroundColor: BG2, display: 'flex', alignItems: 'center', padding: 'clamp(40px, 6vw, 80px)' }}>
            <div>
              <p style={{ ...B, fontSize: '10px', letterSpacing: '6px', color: '#444', marginBottom: '32px', fontWeight: 500 }}>QUIÉNES SOMOS</p>
              <p style={{ ...B, fontSize: 'clamp(14px, 1.6vw, 19px)', lineHeight: 1.9, color: '#ccc', marginBottom: '24px' }}>{webData.sobreOne}</p>
              <p style={{ ...B, fontSize: 'clamp(13px, 1.3vw, 16px)', lineHeight: 2, color: '#777' }}>{webData.sobreOneFrase}</p>
              <div style={{ marginTop: '52px', display: 'flex', gap: '48px', flexWrap: 'wrap' }}>
                {[
                  { n: String(webData.profesores.length), l: 'COACHES' },
                  { n: String(webData.planes.length), l: 'PLANES' },
                  { n: '100%', l: 'PERSONALIZADO' },
                ].map(s => (
                  <div key={s.l}>
                    <div style={{ ...T, fontSize: '52px', color: 'white' }}>{s.n}</div>
                    <div style={{ ...B, fontSize: '9px', letterSpacing: '3px', color: '#333', fontWeight: 500 }}>{s.l}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* PLANES */}
      <section id="planes" style={{ padding: 'clamp(60px, 8vw, 120px) clamp(20px, 5vw, 80px)', backgroundColor: BG }}>
        <div style={{ textAlign: 'center', marginBottom: '80px' }}>
          <p style={{ ...B, fontSize: '10px', letterSpacing: '6px', color: '#444', marginBottom: '20px', fontWeight: 500 }}>AJUSTADOS A TU MEDIDA</p>
          <h2 style={{ ...outline('clamp(60px, 12vw, 140px)') }}>PLANES</h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2px', maxWidth: '1200px', margin: '0 auto' }}>
          {webData.planes.map((plan, i) => (
            <div key={i} className="plan-card" style={{
              backgroundColor: i % 2 === 0 ? CARD : '#111',
              border: `1px solid ${BORDER}`, padding: '40px 32px',
              transition: 'all 0.3s',
            }}>
              <h3 style={{ ...T, fontSize: '36px', color: 'white', marginBottom: '10px', letterSpacing: '1px' }}>{plan.nombre}</h3>
              <p style={{ ...B, fontSize: '14px', color: '#777', marginBottom: '32px', lineHeight: 1.7, fontWeight: 400 }}>{plan.descripcion}</p>
              <div style={{ borderTop: `1px solid #1a1a1a`, paddingTop: '24px' }}>
                {plan.precios.map((p, j) => (
                  <div key={j} style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    padding: '14px 0',
                    borderBottom: j < plan.precios.length - 1 ? `1px solid #1a1a1a` : 'none',
                  }}>
                    <span style={{ ...B, fontSize: '13px', color: '#aaa', letterSpacing: '1px', fontWeight: 400 }}>{p.frecuencia}</span>
                    <span style={{ ...T, fontSize: '28px', color: 'white', letterSpacing: '-1px' }}>{p.valor}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
        <div style={{ textAlign: 'center', marginTop: '64px' }}>
          <a href="https://wa.me/56956723743" target="_blank" rel="noreferrer" className="btn-hover"
            style={{ display: 'inline-block', backgroundColor: 'transparent', border: '1px solid white', color: 'white', padding: '18px 52px', fontSize: '11px', letterSpacing: '4px', textDecoration: 'none', transition: 'all 0.3s', ...B, fontWeight: 500 }}>
            QUIERO SER PARTE DE ONE
          </a>
        </div>
      </section>

      {/* PROFESORES */}
      <section id="profesores" style={{ padding: 'clamp(60px, 8vw, 120px) clamp(20px, 5vw, 80px)', backgroundColor: BG2 }}>
        <div style={{ textAlign: 'center', marginBottom: '80px' }}>
          <p style={{ ...B, fontSize: '10px', letterSpacing: '6px', color: '#444', marginBottom: '20px', fontWeight: 500 }}>NUESTRO EQUIPO</p>
          <h2 style={{ ...outline('clamp(60px, 12vw, 140px)') }}>COACHES</h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '16px', maxWidth: '1100px', margin: '0 auto' }}>
          {webData.profesores.map((prof, i) => (
            <div key={i} className="prof-card" style={{ textAlign: 'center', border: `1px solid ${BORDER}`, transition: 'border-color 0.3s', borderRadius: '2px', overflow: 'hidden' }}>
              <div style={{ aspectRatio: '1', overflow: 'hidden', backgroundColor: '#0d0d0d' }}>
                <img
                  src={prof.foto || fotoDefault(i)}
                  alt={prof.nombre}
                  style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'grayscale(100%) brightness(0.65)', transition: 'filter 0.4s' }}
                  onMouseEnter={e => (e.currentTarget as HTMLImageElement).style.filter = 'grayscale(0%) brightness(0.85)'}
                  onMouseLeave={e => (e.currentTarget as HTMLImageElement).style.filter = 'grayscale(100%) brightness(0.65)'}
                />
              </div>
              <div style={{ padding: '16px 12px', backgroundColor: CARD }}>
                <h3 style={{ ...T, fontSize: '20px', color: 'white', margin: '0 0 4px', letterSpacing: '1px' }}>{prof.nombre}</h3>
                <p style={{ ...B, fontSize: '9px', letterSpacing: '3px', color: '#333', margin: 0, fontWeight: 500 }}>COACH PERSONAL</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* REGLAMENTO */}
      <section id="reglamento" style={{ padding: 'clamp(60px, 8vw, 120px) clamp(20px, 5vw, 80px)', backgroundColor: BG }}>
        <div style={{ textAlign: 'center', marginBottom: '80px' }}>
          <p style={{ ...B, fontSize: '10px', letterSpacing: '6px', color: '#444', marginBottom: '20px', fontWeight: 500 }}>NORMAS DE CONVIVENCIA</p>
          <h2 style={{ ...outline('clamp(46px, 10vw, 120px)') }}>REGLAMENTO<br />INTERNO</h2>
          <p style={{ ...B, fontSize: '14px', color: '#444', marginTop: '32px', lineHeight: 1.9, maxWidth: '560px', margin: '32px auto 0', fontWeight: 400 }}>
            En ONE buscamos organizarnos mejor y cuidar tu espacio, el que con mucho profesionalismo compartimos en comunidad.
          </p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2px', maxWidth: '1200px', margin: '0 auto' }}>
          {webData.reglamento.map((reg, i) => (
            <div key={i} style={{ backgroundColor: i % 2 === 0 ? CARD : '#111', padding: '40px 36px', borderTop: `1px solid ${BORDER}` }}>
              <h3 style={{ ...T, fontSize: '22px', color: 'white', marginBottom: '28px', letterSpacing: '1px' }}>{reg.titulo}</h3>
              <ul style={{ margin: 0, padding: 0, listStyle: 'none' }}>
                {reg.items.map((item, j) => (
                  <li key={j} style={{
                    ...B, fontSize: '13px', color: '#666', lineHeight: 1.9, fontWeight: 400,
                    paddingBottom: '12px', marginBottom: '12px',
                    borderBottom: j < reg.items.length - 1 ? `1px solid #1a1a1a` : 'none',
                    paddingLeft: '16px', position: 'relative',
                  }}>
                    <span style={{ position: 'absolute', left: 0, color: '#333' }}>—</span>{item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* CONTACTO */}
      <section id="contacto" style={{ minHeight: '80vh', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
        <img src="https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=1920&q=80" alt="Contacto"
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', filter: 'brightness(0.1)' }} />
        <div style={{ position: 'relative', zIndex: 1, textAlign: 'center', padding: '60px 24px' }}>
          <p style={{ ...B, fontSize: '10px', letterSpacing: '6px', color: '#444', marginBottom: '24px', fontWeight: 500 }}>ÚNETE A LA COMUNIDAD</p>
          <h2 style={{ ...outline('clamp(60px, 14vw, 160px)'), margin: '0 0 52px' }}>SÍGUENOS</h2>
          <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '64px' }}>
            {[
              { href: 'https://www.facebook.com/oneevolution.cl/', label: 'FACEBOOK' },
              { href: 'https://www.instagram.com/oneevolution.cl', label: 'INSTAGRAM' },
              { href: 'https://wa.me/56956723743', label: 'WHATSAPP' },
            ].map(r => (
              <a key={r.href} href={r.href} target="_blank" rel="noreferrer"
                style={{ display: 'inline-block', border: `1px solid #2a2a2a`, color: 'white', padding: '14px 32px', fontSize: '11px', letterSpacing: '4px', textDecoration: 'none', transition: 'all 0.3s', backgroundColor: 'rgba(0,0,0,0.6)', ...B, fontWeight: 500 }}
                onMouseEnter={e => { const el = e.currentTarget as HTMLAnchorElement; el.style.borderColor = 'white'; el.style.backgroundColor = 'white'; el.style.color = '#000' }}
                onMouseLeave={e => { const el = e.currentTarget as HTMLAnchorElement; el.style.borderColor = '#2a2a2a'; el.style.backgroundColor = 'rgba(0,0,0,0.6)'; el.style.color = 'white' }}
              >{r.label}</a>
            ))}
          </div>
          <div style={{ borderTop: `1px solid ${BORDER}`, paddingTop: '48px' }}>
            <p style={{ ...B, fontSize: '14px', color: '#444', lineHeight: 2.6, fontWeight: 400 }}>
              Alto Las Rastras, Talca<br />+56 9 5672 3743<br />contacto@oneevolution.cl
            </p>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ backgroundColor: '#000', borderTop: `1px solid #0d0d0d`, padding: '32px 48px', textAlign: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '2px', justifyContent: 'center', marginBottom: '12px' }}>
          <span style={{ ...T, fontSize: '20px', color: 'white' }}>ONE</span>
          <span style={{ ...B, fontSize: '8px', letterSpacing: '4px', color: '#1a1a1a', marginLeft: '8px' }}>YOUR EVOLUTION</span>
        </div>
        <p style={{ ...B, fontSize: '11px', color: '#1a1a1a', fontWeight: 400 }}>
          © 2025 ONE Evolution. Todos los derechos reservados. | www.oneevolution.cl
        </p>
      </footer>
    </div>
  )
}

export default App