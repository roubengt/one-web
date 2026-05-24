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

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0a0a0a', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        input::placeholder { color: #444; }
        .inp-login { width: 100%; padding: 14px 18px; margin-bottom: 12px; background: #111; border: 1px solid #2a2a2a; color: white; font-size: 14px; font-family: Inter, sans-serif; font-weight: 300; border-radius: 2px; outline: none; transition: border-color 0.2s; }
        .inp-login:focus { border-color: white; }
        .btn-login { width: 100%; padding: 16px; background: white; border: none; color: #000; font-size: 13px; letter-spacing: 2px; cursor: pointer; font-family: Inter, sans-serif; font-weight: 600; border-radius: 2px; transition: background 0.2s; }
        .btn-login:hover { background: #e0e0e0; }
      `}</style>

      <div style={{ width: '100%', maxWidth: '400px' }}>
        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
          <div style={{ display: 'inline-block', border: '2px solid white', padding: '14px 32px', marginBottom: '20px' }}>
            <span style={{ fontFamily: 'Impact, Arial Black, sans-serif', fontSize: '40px', color: 'white', letterSpacing: '4px' }}>ONE</span>
          </div>
          <p style={{ ...B, fontSize: '10px', letterSpacing: '6px', color: '#555', fontWeight: 500 }}>PANEL DE ADMINISTRACIÓN</p>
        </div>

        {error && (
          <div style={{ backgroundColor: '#1a0a0a', border: '1px solid #ff6b6b', padding: '12px 16px', marginBottom: '20px', borderRadius: '2px' }}>
            <p style={{ ...B, color: '#ff6b6b', fontSize: '13px', fontWeight: 400 }}>{error}</p>
          </div>
        )}

        <div style={{ marginBottom: '12px' }}>
          <label style={{ ...B, fontSize: '10px', letterSpacing: '3px', color: '#555', display: 'block', marginBottom: '8px', fontWeight: 500 }}>EMAIL</label>
          <input type="email" placeholder="juanjo@one.cl" value={email}
            onChange={e => setEmail(e.target.value)}
            className="inp-login" />
        </div>

        <div style={{ marginBottom: '24px' }}>
          <label style={{ ...B, fontSize: '10px', letterSpacing: '3px', color: '#555', display: 'block', marginBottom: '8px', fontWeight: 500 }}>CONTRASEÑA</label>
          <input type="password" placeholder="••••••••" value={password}
            onChange={e => setPassword(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleLogin()}
            className="inp-login" />
        </div>

        <button onClick={handleLogin} className="btn-login">Ingresar</button>

        <p style={{ ...B, fontSize: '11px', color: '#2a2a2a', textAlign: 'center', marginTop: '32px', fontWeight: 300 }}>
          ONE Your Evolution © 2025
        </p>
      </div>
    </div>
  )
}

export default AdminLogin