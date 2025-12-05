const http = require('http');
const url = require('url');
const fs = require('fs').promises;
const path = require('path');
// --- BASE DE DATOS ---
let tareas = [
  { id: 1, titulo: "Aprender Node.js", descripcion: "Curso básico", completada: false, prioridad: "alta", fechaCreacion: "2025-01-01" },
  { id: 2, titulo: "Practicar HTTP", descripcion: "Servidor básico", completada: true, prioridad: "media", fechaCreacion: "2025-01-03" }
];
let siguienteId = 3;

// --- API KEYS (solo ejemplo) ---
const API_KEYS = new Set(["12345", "ABCDE"]);

// --- LOGGING ---
function log(mensaje) {
  console.log(`[${new Date().toISOString()}] ${mensaje}`);
}

// --- VALIDACIÓN ---
function validarTarea(obj) {
  const errores = [];

  if (!obj.titulo || typeof obj.titulo !== "string")
    errores.push("Título inválido");

  if (obj.descripcion && typeof obj.descripcion !== "string")
    errores.push("Descripción inválida");

  if (obj.prioridad && !["alta", "media", "baja"].includes(obj.prioridad))
    errores.push("Prioridad inválida");

  if (obj.completada !== undefined && typeof obj.completada !== "boolean")
    errores.push("El campo 'completada' debe ser booleano");

  return errores;
}

// --- HELPERS ---
function obtenerCuerpo(req) {
  return new Promise((res, rej) => {
    let data = "";
    req.on("data", chunk => (data += chunk));
    req.on("end", () => {
      try {
        res(JSON.parse(data || "{}"));
      } catch {
        rej("JSON inválido");
      }
    });
  });
}

function enviarJSON(res, data, status = 200) {
  res.writeHead(status, {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
  });
  res.end(JSON.stringify(data, null, 2));
}

// --- CHECK API KEY ---
function checkAuth(req, res) {
  const key = req.headers["x-api-key"];
  if (!API_KEYS.has(key)) {
    enviarJSON(res, { error: "API Key inválida" }, 401);
    return false;
  }
  return true;
}

// --- SERVIDOR ---
const server = http.createServer(async (req, res) => {
  const parsed = url.parse(req.url, true);
  const { pathname, query } = parsed;
  const method = req.method;

  // Logging general
  log(`${method} ${pathname}`);

  // Página principal
  if (method === "GET" && pathname === "/") {
    res.writeHead(200, { "Content-Type": "text/html" });
    return res.end(INTERFAZ_HTML);
  }

  // Autenticación requerida para todo /api
  if (pathname.startsWith("/api") && !checkAuth(req, res)) return;

  // --- LISTAR TAREAS ---
  if (method === "GET" && pathname === "/api/tareas") {
    let resultado = [...tareas];

    if (query.completada !== undefined) {
      resultado = resultado.filter(t => t.completada === (query.completada === "true"));
    }

    if (query.prioridad) {
      resultado = resultado.filter(t => t.prioridad === query.prioridad);
    }

    if (query.q) {
      const q = query.q.toLowerCase();
      resultado = resultado.filter(t =>
        t.titulo.toLowerCase().includes(q) ||
        t.descripcion.toLowerCase().includes(q)
      );
    }

    return enviarJSON(res, { total: resultado.length, tareas: resultado });
  }

  // --- OBTENER TAREA ---
  if (method === "GET" && pathname.startsWith("/api/tareas/")) {
    const id = parseInt(pathname.split("/")[3]);
    const tarea = tareas.find(t => t.id === id);
    if (!tarea) return enviarJSON(res, { error: "No encontrada" }, 404);
    return enviarJSON(res, tarea);
  }

  // --- CREAR ---
  if (method === "POST" && pathname === "/api/tareas") {
    try {
      const body = await obtenerCuerpo(req);
      const errores = validarTarea(body);
      if (errores.length) return enviarJSON(res, { errores }, 400);

      const nueva = {
        id: siguienteId++,
        titulo: body.titulo,
        descripcion: body.descripcion || "",
        prioridad: body.prioridad || "media",
        completada: false,
        fechaCreacion: new Date().toISOString().split("T")[0]
      };

      tareas.push(nueva);
      log(`Tarea creada: ${nueva.id}`);
      return enviarJSON(res, nueva, 201);

    } catch (e) {
      return enviarJSON(res, { error: e }, 400);
    }
  }

  // --- ACTUALIZAR ---
  if (method === "PUT" && pathname.startsWith("/api/tareas/")) {
    const id = parseInt(pathname.split("/")[3]);
    const idx = tareas.findIndex(t => t.id === id);
    if (idx === -1) return enviarJSON(res, { error: "No encontrada" }, 404);

    try {
      const body = await obtenerCuerpo(req);
      const errores = validarTarea({ ...tareas[idx], ...body });
      if (errores.length) return enviarJSON(res, { errores }, 400);

      tareas[idx] = { ...tareas[idx], ...body };
      log(`Tarea actualizada: ${id}`);
      return enviarJSON(res, tareas[idx]);

    } catch {
      return enviarJSON(res, { error: "JSON inválido" }, 400);
    }
  }

  // --- ELIMINAR ---
  if (method === "DELETE" && pathname.startsWith("/api/tareas/")) {
    const id = parseInt(pathname.split("/")[3]);
    const idx = tareas.findIndex(t => t.id === id);
    if (idx === -1) return enviarJSON(res, { error: "No encontrada" }, 404);

    const eliminada = tareas.splice(idx, 1)[0];
    log(`Tarea eliminada: ${id}`);
    return enviarJSON(res, { eliminada });
  }

  // --- ESTADÍSTICAS ---
  if (method === "GET" && pathname === "/api/estadisticas") {
    const porPrioridad = tareas.reduce((acc, t) => {
      acc[t.prioridad] = (acc[t.prioridad] || 0) + 1;
      return acc;
    }, {});

    const completadasPorFecha = tareas
      .filter(t => t.completada)
      .reduce((acc, t) => {
        acc[t.fechaCreacion] = (acc[t.fechaCreacion] || 0) + 1;
        return acc;
      }, {});

    return enviarJSON(res, { porPrioridad, completadasPorFecha });
  }

  enviarJSON(res, { error: "Ruta no encontrada" }, 404);
});

// --- INTERFAZ WEB ---
const INTERFAZ_HTML = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <title>Gestión de Tareas</title>
  <style>
    body { font-family: Arial; padding: 20px; max-width: 600px; margin: auto; }
    input, button { padding: 8px; margin: 5px 0; width: 100%; }
    .tarea { background: #eee; padding: 10px; margin: 5px 0; border-radius: 5px; }
  </style>
</head>
<body>
  <h1>Gestión de Tareas (API + UI)</h1>

  <input id="titulo" placeholder="Título" />
  <input id="descripcion" placeholder="Descripción" />
  <select id="prioridad">
    <option value="alta">Alta</option>
    <option value="media">Media</option>
    <option value="baja">Baja</option>
  </select>
  <button onclick="crear()">Crear tarea</button>

  <h2>Tareas</h2>
  <div id="lista"></div>

  <script>
    const KEY = "12345";

    async function cargar() {
      const res = await fetch("/api/tareas", { headers: { "x-api-key": KEY } });
      const data = await res.json();
      const cont = document.getElementById("lista");
      cont.innerHTML = "";
      data.tareas.forEach(t => {
        cont.innerHTML += \`
          <div class="tarea">
            <strong>\${t.titulo}</strong> (\${t.prioridad})<br>
            \${t.descripcion}<br>
            Completada: \${t.completada}
          </div>
        \`;
      });
    }

    async function crear() {
      await fetch("/api/tareas", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": KEY
        },
        body: JSON.stringify({
          titulo: document.getElementById("titulo").value,
          descripcion: document.getElementById("descripcion").value,
          prioridad: document.getElementById("prioridad").value
        })
      });
      cargar();
    }

    cargar();
  </script>
</body>
</html>
`;

server.listen(3000, () => console.log("Servidor iniciado en http://localhost:3000"));