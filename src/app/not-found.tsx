export default function GlobalNotFound() {
  return (
    <html lang="es">
      <body style={{ margin: 0, fontFamily: 'system-ui, sans-serif', background: '#efebe0', color: '#422102' }}>
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
          <div style={{ textAlign: 'center', maxWidth: '480px' }}>
            <p style={{ fontSize: '5rem', fontWeight: 800, color: '#7b3f1e', marginBottom: '0.5rem', lineHeight: 1 }}>
              404
            </p>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 700, marginBottom: '1rem' }}>
              Página no encontrada
            </h1>
            <p style={{ color: '#7a6b5a', marginBottom: '2rem', lineHeight: 1.6 }}>
              La página que buscas no existe o fue movida.
            </p>
            <a
              href="/"
              style={{
                display: 'inline-block',
                background: '#422102',
                color: 'white',
                textDecoration: 'none',
                padding: '12px 32px',
                borderRadius: '12px',
                fontSize: '1rem',
                fontWeight: 600,
              }}
            >
              Volver al inicio
            </a>
          </div>
        </div>
      </body>
    </html>
  );
}
