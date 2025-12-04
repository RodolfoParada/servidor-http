// Task 2: Routing Básico (8 minutos)
// El routing permite manejar diferentes URLs y métodos HTTP.

// Routing Simple por URL
const http = require('http');

const servidor = http.createServer((request, response) => {
  const { method, url } = request;
  console.log(`${method} ${url}`);

  // Routing básico
  if (method === 'GET' && url === '/') {
    response.writeHead(200, { 'Content-Type': 'text/html' });
    response.end(`
      <h1>Página Principal</h1>
      <p>Bienvenido al servidor Node.js</p>
      <a href="/acerca">Acerca de</a> | <a href="/contacto">Contacto</a>
    `);
    return;
  }

  if (method === 'GET' && url === '/acerca') {
    response.writeHead(200, { 'Content-Type': 'text/html' });
    response.end(`
      <h1>Acerca de</h1>
      <p>Servidor creado con Node.js puro</p>
      <a href="/">← Volver</a>
    `);
    return;
  }

  if (method === 'GET' && url === '/contacto') {
    response.writeHead(200, { 'Content-Type': 'text/html' });
    response.end(`
      <h1>Contacto</h1>
      <p>Email: info@example.com</p>
      <a href="/">← Volver</a>
    `);
    return;
  }

  // Ruta no encontrada
  response.writeHead(404, { 'Content-Type': 'text/html' });
  response.end(`
    <h1>404 - Página no encontrada</h1>
    <p>La ruta ${url} no existe</p>
    <a href="/">← Volver al inicio</a>
  `);
});

servidor.listen(3000);
// Sistema de Routing Modular
const http = require('http');

// Sistema de routing simple
class Router {
  constructor() {
    this.routes = {};
  }

  // Registrar ruta
  addRoute(method, path, handler) {
    if (!this.routes[method]) {
      this.routes[method] = {};
    }
    this.routes[method][path] = handler;
  }

  // Buscar ruta
  findRoute(method, path) {
    const methodRoutes = this.routes[method];
    if (methodRoutes && methodRoutes[path]) {
      return methodRoutes[path];
    }
    return null;
  }

  // Métodos convenientes
  get(path, handler) {
    this.addRoute('GET', path, handler);
  }

  post(path, handler) {
    this.addRoute('POST', path, handler);
  }

  put(path, handler) {
    this.addRoute('PUT', path, handler);
  }

  delete(path, handler) {
    this.addRoute('DELETE', path, handler);
  }
}

// Crear router
const router = new Router();

// Definir rutas
router.get('/', (request, response) => {
  response.writeHead(200, { 'Content-Type': 'text/html' });
  response.end('<h1>Inicio</h1><a href="/productos">Ver Productos</a>');
});

router.get('/productos', (request, response) => {
  const productos = [
    { id: 1, nombre: 'Laptop', precio: 1000 },
    { id: 2, nombre: 'Mouse', precio: 50 },
    { id: 3, nombre: 'Teclado', precio: 80 }
  ];

  response.writeHead(200, { 'Content-Type': 'application/json' });
  response.end(JSON.stringify(productos));
});

router.get('/productos/1', (request, response) => {
  const producto = { id: 1, nombre: 'Laptop', precio: 1000, descripcion: 'Laptop potente' };
  response.writeHead(200, { 'Content-Type': 'application/json' });
  response.end(JSON.stringify(producto));
});

// Crear servidor con router
servidor = http.createServer((request, response) => {
  const { method, url } = request;

  // Buscar ruta en el router
  const handler = router.findRoute(method, url);

  if (handler) {
    // Ejecutar handler de la ruta
    handler(request, response);
  } else {
    // 404
    response.writeHead(404, { 'Content-Type': 'text/html' });
    response.end('<h1>404 - Ruta no encontrada</h1><a href="/">Inicio</a>');
  }
});

servidor.listen(3000, () => {
  console.log('🚀 Servidor con routing en http://localhost:3000');
});