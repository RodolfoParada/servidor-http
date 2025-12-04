// Task 1: Creación de Servidor HTTP Básico (8 minutos)
// Node.js incluye el módulo http para crear servidores web sin frameworks adicionales.

// Servidor HTTP Mínimo
const http = require('http');

// Crear servidor
const servidor = http.createServer((request, response) => {
  // Esta función se ejecuta por cada petición
  console.log(`📨 Petición recibida: ${request.method} ${request.url}`);

  // Enviar respuesta básica
  response.writeHead(200, { 'Content-Type': 'text/plain' });
  response.end('¡Hola desde Node.js!');
});

// Iniciar servidor
const PUERTO = 3000;
servidor.listen(PUERTO, () => {
  console.log(`🚀 Servidor ejecutándose en http://localhost:${PUERTO}`);
});

// // Para detener el servidor: servidor.close()
// Estructura de Request y Response
const http = require('http');

 servidor = http.createServer((request, response) => {
  // Objeto REQUEST (petición del cliente)
  console.log('=== INFORMACIÓN DE LA PETICIÓN ===');
  console.log('Método HTTP:', request.method);        // GET, POST, PUT, DELETE
  console.log('URL:', request.url);                    // /ruta?parametro=valor
  console.log('HTTP Version:', request.httpVersion);   // 1.1
  console.log('Headers:', request.headers);            // Objeto con headers

  // Objeto RESPONSE (respuesta al cliente)
  response.writeHead(200, {
    'Content-Type': 'text/plain',
    'X-Powered-By': 'Node.js',
    'Access-Control-Allow-Origin': '*'  // CORS básico
  });

  response.write('Esta es una respuesta\n');
  response.write('en múltiples partes\n');
  response.end('¡Fin de la respuesta!');
});

servidor.listen(3000);
// Manejo de Diferentes Tipos de Contenido

const http = require('http');

servidor = http.createServer((request, response) => {
  // Respuesta HTML
  if (request.url === '/html') {
    response.writeHead(200, { 'Content-Type': 'text/html' });
    response.end(`
      <!DOCTYPE html>
      <html>
        <head><title>Respuesta HTML</title></head>
        <body>
          <h1>¡Hola desde Node.js!</h1>
          <p>Esta es una respuesta HTML.</p>
        </body>
      </html>
    `);
    return;
  }

  // Respuesta JSON
  if (request.url === '/json') {
    response.writeHead(200, { 'Content-Type': 'application/json' });
    const datos = {
      mensaje: 'Respuesta JSON desde Node.js',
      timestamp: new Date().toISOString(),
      metodo: request.method,
      url: request.url
    };
    response.end(JSON.stringify(datos, null, 2));
    return;
  }

  // Respuesta por defecto
  response.writeHead(200, { 'Content-Type': 'text/plain' });
  response.end('Servidor básico de Node.js');
});

servidor.listen(3000, () => {
  console.log('🚀 Servidor en http://localhost:3000');
  console.log('📄 Prueba: http://localhost:3000/html');
  console.log('🔧 Prueba: http://localhost:3000/json');
});