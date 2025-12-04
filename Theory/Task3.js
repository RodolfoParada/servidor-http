// Task 3: Query Parameters y URL Parsing (8 minutos)
// Los query parameters permiten pasar datos adicionales en la URL.

// Parsing Básico de URL
const http = require('http');
const url = require('url'); // Módulo built-in para URLs

const servidor = http.createServer((request, response) => {
  // Parsear URL completa
  const parsedUrl = url.parse(request.url, true); // true para parsear query

  console.log('URL completa:', request.url);
  console.log('Pathname:', parsedUrl.pathname);
  console.log('Query:', parsedUrl.query);

  // Ejemplo: /buscar?q=nodejs&limite=10
  if (parsedUrl.pathname === '/buscar') {
    const query = parsedUrl.query;
    const termino = query.q || '';
    const limite = parseInt(query.limite) || 10;

    response.writeHead(200, { 'Content-Type': 'application/json' });
    response.end(JSON.stringify({
      termino,
      limite,
      resultados: [`Resultado 1 para "${termino}"`, `Resultado 2 para "${termino}"`]
    }));
    return;
  }

  response.writeHead(200, { 'Content-Type': 'text/html' });
  response.end('<h1>Servidor con Query Parameters</h1><p>Prueba: /buscar?q=nodejs&limite=5</p>');
});

servidor.listen(3000);
// API REST Simple con Query Parameters
const http = require('http');
const url = require('url');

// Base de datos simulada
let usuarios = [
  { id: 1, nombre: 'Ana', edad: 25, activo: true },
  { id: 2, nombre: 'Carlos', edad: 30, activo: true },
  { id: 3, nombre: 'María', edad: 28, activo: false },
  { id: 4, nombre: 'Pedro', edad: 35, activo: true }
];

servidor = http.createServer((request, response) => {
  const parsedUrl = url.parse(request.url, true);
  const { pathname, query } = parsedUrl;

  // GET /usuarios - Listar usuarios con filtros
  if (request.method === 'GET' && pathname === '/usuarios') {
    let resultados = [...usuarios];

    // Filtros por query parameters
    if (query.activo !== undefined) {
      const activo = query.activo === 'true';
      resultados = resultados.filter(u => u.activo === activo);
    }

    if (query.nombre) {
      resultados = resultados.filter(u =>
        u.nombre.toLowerCase().includes(query.nombre.toLowerCase())
      );
    }

    if (query.edad_min) {
      const edadMin = parseInt(query.edad_min);
      resultados = resultados.filter(u => u.edad >= edadMin);
    }

    if (query.edad_max) {
      const edadMax = parseInt(query.edad_max);
      resultados = resultados.filter(u => u.edad <= edadMax);
    }

    // Paginación
    const pagina = parseInt(query.pagina) || 1;
    const limite = parseInt(query.limite) || 10;
    const inicio = (pagina - 1) * limite;
    const paginados = resultados.slice(inicio, inicio + limite);

    const respuesta = {
      total: resultados.length,
      pagina,
      limite,
      resultados: paginados,
      filtros: query
    };

    response.writeHead(200, { 'Content-Type': 'application/json' });
    response.end(JSON.stringify(respuesta, null, 2));
    return;
  }

  // GET /usuarios/:id - Obtener usuario específico
  if (request.method === 'GET' && pathname.startsWith('/usuarios/')) {
    const id = parseInt(pathname.split('/')[2]);
    const usuario = usuarios.find(u => u.id === id);

    if (usuario) {
      response.writeHead(200, { 'Content-Type': 'application/json' });
      response.end(JSON.stringify(usuario));
    } else {
      response.writeHead(404, { 'Content-Type': 'application/json' });
      response.end(JSON.stringify({ error: 'Usuario no encontrado' }));
    }
    return;
  }

  // Respuesta por defecto
  response.writeHead(200, { 'Content-Type': 'text/html' });
  response.end(`
    <h1>API de Usuarios</h1>
    <h2>Endpoints disponibles:</h2>
    <ul>
      <li><strong>GET /usuarios</strong> - Listar usuarios con filtros</li>
      <li><strong>GET /usuarios/:id</strong> - Obtener usuario específico</li>
    </ul>
    <h2>Ejemplos:</h2>
    <ul>
      <li><a href="/usuarios">/usuarios</a> - Todos los usuarios</li>
      <li><a href="/usuarios?activo=true">/usuarios?activo=true</a> - Solo activos</li>
      <li><a href="/usuarios?nombre=ana">/usuarios?nombre=ana</a> - Buscar por nombre</li>
      <li><a href="/usuarios?edad_min=25&edad_max=35">/usuarios?edad_min=25&edad_max=35</a> - Rango de edad</li>
      <li><a href="/usuarios?pagina=1&limite=2">/usuarios?pagina=1&limite=2</a> - Paginación</li>
    </ul>
  `);
});

servidor.listen(3000, () => {
  console.log('🚀 API REST en http://localhost:3000');
  console.log('📖 Documentación en http://localhost:3000');
});