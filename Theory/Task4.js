// Task 4: Manejo de Errores y Respuestas Avanzadas (6 minutos)
// Implementar manejo robusto de errores y diferentes tipos de respuestas.
  
// Códigos de Estado HTTP
const http = require('http');

// Función helper para respuestas JSON
function enviarJSON(response, data, statusCode = 200) {
  response.writeHead(statusCode, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*'
  });
  response.end(JSON.stringify(data, null, 2));
}

// Función helper para respuestas HTML
function enviarHTML(response, html, statusCode = 200) {
  response.writeHead(statusCode, {
    'Content-Type': 'text/html',
    'Access-Control-Allow-Origin': '*'
  });
  response.end(html);
}

const servidor = http.createServer((request, response) => {
  try {
    const { method } = request;
    const parsedUrl = url.parse(request.url, true);
    const { pathname, query } = parsedUrl;

    // Simular diferentes escenarios de error
    if (pathname === '/error') {
      // Error del servidor
      enviarJSON(response, { error: 'Error interno del servidor' }, 500);
      return;
    }

    if (pathname === '/no-encontrado') {
      // Recurso no encontrado
      enviarHTML(response, `
        <h1>404 - No encontrado</h1>
        <p>El recurso solicitado no existe</p>
      `, 404);
      return;
    }

    if (pathname === '/no-autorizado') {
      // No autorizado
      enviarJSON(response, { error: 'Acceso no autorizado' }, 401);
      return;
    }

    // Endpoint funcional
    if (method === 'GET' && pathname === '/saludo') {
      const nombre = query.nombre || 'Visitante';
      enviarJSON(response, {
        mensaje: `¡Hola, ${nombre}!`,
        timestamp: new Date().toISOString(),
        query: query
      });
      return;
    }

    // Endpoint con validación
    if (method === 'POST' && pathname === '/validar') {
      let body = '';

      request.on('data', chunk => {
        body += chunk.toString();
      });

      request.on('end', () => {
        try {
          const data = JSON.parse(body);

          // Validación simple
          if (!data.nombre) {
            enviarJSON(response, { error: 'El campo nombre es requerido' }, 400);
            return;
          }

          if (data.edad && (data.edad < 0 || data.edad > 150)) {
            enviarJSON(response, { error: 'Edad inválida' }, 400);
            return;
          }

          enviarJSON(response, {
            valido: true,
            mensaje: 'Datos válidos',
            datos: data
          });

        } catch (error) {
          enviarJSON(response, { error: 'JSON inválido' }, 400);
        }
      });

      return;
    }

    // Página por defecto
    enviarHTML(response, `
      <h1>Servidor HTTP Node.js</h1>
      <h2>Endpoints de prueba:</h2>
      <ul>
        <li><a href="/saludo">GET /saludo</a></li>
        <li><a href="/saludo?nombre=Ana">GET /saludo?nombre=Ana</a></li>
        <li><a href="/error">GET /error</a></li>
        <li><a href="/no-encontrado">GET /no-encontrado</a></li>
        <li><a href="/no-autorizado">GET /no-autorizado</a></li>
      </ul>
      <h2>Para probar POST:</h2>
      <pre>curl -X POST -H "Content-Type: application/json" -d '{"nombre":"Test","edad":25}' http://localhost:3000/validar</pre>
    `);

  } catch (error) {
    console.error('Error en el servidor:', error);
    enviarJSON(response, { error: 'Error interno del servidor' }, 500);
  }
});

servidor.listen(3000, () => {
  console.log('🚀 Servidor con manejo de errores en http://localhost:3000');
});