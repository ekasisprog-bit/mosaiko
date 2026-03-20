'use client';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="es">
      <body style={{ margin: 0, fontFamily: 'system-ui, sans-serif', background: '#efebe0', color: '#422102' }}>
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
          <div style={{ textAlign: 'center', maxWidth: '480px' }}>
            <h1 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '1rem' }}>
              Algo salió mal
            </h1>
            <p style={{ color: '#7a6b5a', marginBottom: '2rem', lineHeight: 1.6 }}>
              Ocurrió un error inesperado. Intenta recargar la página.
            </p>
            <button
              onClick={reset}
              style={{
                background: '#422102',
                color: 'white',
                border: 'none',
                padding: '12px 32px',
                borderRadius: '12px',
                fontSize: '1rem',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Reintentar
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
