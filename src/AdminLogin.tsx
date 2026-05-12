import { useState } from 'react'

const B = { fontFamily: "'Inter', sans-serif" }

interface Props { onLogin: () => void }

const AdminLogin = ({ onLogin }: Props) => {
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [error, setError]       = useState('')

  const handleLogin = () => {
    const creds = JSON.parse(localStorage.getItem('one_admin_creds') || 'null') || { email: 'juanjo@one.cl', password: 'juanjo123' }
    if (email === creds.email && password === creds.password) {
      localStorage.setItem('one_admin_logged', 'true')
      onLogin()
    } else {
      setError('Email o contraseña incorrectos')
    }
  }

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '14px 18px', marginBottom: '12px',
    backgroundColor: '#111', border: '1px solid #2a2a2a',
    color: 'white', fontSize: '14px', outline: 'none',
    fontFamily: 'Inter, sans-serif', fontWeight: 300,
    borderRadius: '2px',
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0a0a0a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        input::placeholder { color: #444; }
        .inp-focus:focus { border-color: white !important; }
        .btn-login:hover { background-color: #e0e0e0 !important; }
      `}</style>

      <div style={{ width: '100%', maxWidth: '400px', padding: '40px 32px' }}>

        {/* LOGO */}
        <div style={{ textAlign: 'center', marginBottom: '56px' }}>
          <div style={{
            display: 'inline-block',
            border: '2px solid white',
            padding: '16px 32px',
            marginBottom: '20px',
          }}>
            <span style={{
              fontFamily: 'Impact, Arial Black, sans-serif',
              fontSize: '48px', color: 'white',
              letterSpacing: '4px', display: 'block',
              lineHeight: 1,
            }}>ONE</span>
          </div>
          <p style={{ ...B, fontSize: '10px', letterSpacing: '6px', color: '#555', fontWeight: 500 }}>
            PANEL DE ADMINISTRACIÓN
          </p>
        </div>

        {error && (
          <div style={{ backgroundColor: '#1a0a0a', border: '1px solid #ff6b6b', padding: '12px 16px', marginBottom: '20px', borderRadius: '2px' }}>
            <p style={{ ...B, color: '#ff6b6b', fontSize: '13px', fontWeight: 400 }}>{error}</p>
          </div>
        )}

        <div style={{ marginBottom: '12px' }}>
          <label style={{ ...B, fontSize: '10px', letterSpacing: '3px', color: '#555', display: 'block', marginBottom: '8px', fontWeight: 500 }}>EMAIL</label>
          <input
            type="email" placeholder="juanjo@one.cl" value={email}
            onChange={e => setEmail(e.target.value)}
            className="inp-focus"
            style={inputStyle}
          />
        </div>

        <div style={{ marginBottom: '24px' }}>
          <label style={{ ...B, fontSize: '10px', letterSpacing: '3px', color: '#555', display: 'block', marginBottom: '8px', fontWeight: 500 }}>CONTRASEÑA</label>
          <input
            type="password" placeholder="••••••••" value={password}
            onChange={e => setPassword(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleLogin()}
            className="inp-focus"
            style={inputStyle}
          />
        </div>

        <button onClick={handleLogin} className="btn-login" style={{
        width: '100%', padding: '14px',
        backgroundColor: 'white', border: 'none',
        color: '#000', fontSize: '13px', letterSpacing: '2px',
        cursor: 'pointer', transition: 'background-color 0.2s',
        fontFamily: 'Inter, sans-serif', fontWeight: 600,
        borderRadius: '2px',
      }}>Ingresar</button>

        <p style={{ ...B, fontSize: '11px', color: '#2a2a2a', textAlign: 'center', marginTop: '32px', fontWeight: 300 }}>
          ONE Your Evolution © 2025
        </p>
      </div>
    </div>
  )
}

export default AdminLogin