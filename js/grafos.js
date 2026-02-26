const canvas = document.getElementById("canvasGrafo");
const ctx = canvas.getContext("2d");

/* ------------------ VARIABLES ------------------ */

let vertices = [];
let edges = [];
let selectedVertex = null;
let vertexCounter = 0;
let draggingVertex = null;

/* ------------------ CLASES ------------------ */

class Vertex {
  constructor(x, y) {
    this.id = vertexCounter++;
    this.x = x;
    this.y = y;
    this.radius = 30;
  }
}

class Edge {
  constructor(from, to, weight, directed) {
    this.from = from;
    this.to = to;
    this.weight = weight;
    this.directed = directed;
  }
}

/* ------------------ DIBUJO ------------------ */

function drawVertex(vertex) {
  ctx.beginPath();
  ctx.arc(vertex.x, vertex.y, vertex.radius, 0, Math.PI * 2);
  ctx.fillStyle = "#1C4C7C";
  ctx.fill();
  ctx.strokeStyle = "black";
  ctx.stroke();

  ctx.fillStyle = "white";
  ctx.font = "16px Arial";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(vertex.id, vertex.x, vertex.y);
}

function drawEdge(edge) {
  if (edge.from === edge.to) {
    const radius = edge.from.radius;
    const loopRadius = 40;

    ctx.beginPath();

    const centerX = edge.from.x;
    const centerY = edge.from.y - radius - 20;

    const startAngle = Math.PI * 0.3;
    const endAngle = Math.PI * 2.7;

    ctx.arc(centerX, centerY, loopRadius, startAngle, endAngle);
    ctx.strokeStyle = "#4DA3FF";
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.fillStyle = "#00E0FF";
    ctx.font = "16px Arial";
    ctx.fillText(edge.weight, centerX, centerY - loopRadius - 10);

    if (edge.directed) {
      const arrowX = centerX + loopRadius * Math.cos(endAngle);
      const arrowY = centerY + loopRadius * Math.sin(endAngle);

      const angle = endAngle;

      ctx.beginPath();
      ctx.moveTo(arrowX, arrowY);
      ctx.lineTo(
        arrowX - 15 * Math.cos(angle - Math.PI / 6),
        arrowY - 15 * Math.sin(angle - Math.PI / 6),
      );
      ctx.lineTo(
        arrowX - 15 * Math.cos(angle + Math.PI / 6),
        arrowY - 15 * Math.sin(angle + Math.PI / 6),
      );
      ctx.closePath();
      ctx.fill();
    }

    return;
  }

  const dx = edge.to.x - edge.from.x;
  const dy = edge.to.y - edge.from.y;
  const angle = Math.atan2(dy, dx);

  let twinEdge = edges.find(
    (e) => e !== edge && e.from === edge.to && e.to === edge.from,
  );

  const startOffsetX = Math.cos(angle) * edge.from.radius;
  const startOffsetY = Math.sin(angle) * edge.from.radius;

  const endOffsetX = Math.cos(angle) * edge.to.radius;
  const endOffsetY = Math.sin(angle) * edge.to.radius;

  let startX = edge.from.x + startOffsetX;
  let startY = edge.from.y + startOffsetY;

  let endX = edge.to.x - endOffsetX;
  let endY = edge.to.y - endOffsetY;

  if (twinEdge) {
    const separation = 15;
    const perpX = -Math.sin(angle) * separation;
    const perpY = Math.cos(angle) * separation;

    startX += perpX;
    startY += perpY;
    endX += perpX;
    endY += perpY;
  }

  ctx.beginPath();
  ctx.moveTo(startX, startY);
  ctx.lineTo(endX, endY);
  ctx.strokeStyle = "#4DA3FF";
  ctx.lineWidth = 2;
  ctx.stroke();

  if (edge.directed) {
    const headLength = 20;
    const tipX = endX;
    const tipY = endY;

    ctx.beginPath();
    ctx.moveTo(tipX, tipY);
    ctx.lineTo(
      tipX - headLength * Math.cos(angle - Math.PI / 6),
      tipY - headLength * Math.sin(angle - Math.PI / 6),
    );
    ctx.lineTo(
      tipX - headLength * Math.cos(angle + Math.PI / 6),
      tipY - headLength * Math.sin(angle + Math.PI / 6),
    );
    ctx.closePath();
    ctx.fillStyle = "#66CCFF";
    ctx.fill();
  }

  const midX = (startX + endX) / 2;
  const midY = (startY + endY) / 2;
  ctx.fillStyle = "#00E0FF";
  ctx.font = "16px Arial";
  ctx.fillText(edge.weight, midX, midY);
}

function redraw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  edges.forEach(drawEdge);
  vertices.forEach(drawVertex);
}

/* ------------------ RESIZE CORRECTO ------------------ */
function resizeCanvas() {
  const rect = canvas.getBoundingClientRect();
  canvas.width = rect.width;
  canvas.height = rect.height;
  redraw();
}

resizeCanvas();
window.addEventListener("resize", resizeCanvas);
/* ------------------ EVENTOS ------------------ */

// Crear vértice
canvas.addEventListener("dblclick", function (e) {
  const rect = canvas.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;

  for (let vertex of vertices) {
    let dx = x - vertex.x;
    let dy = y - vertex.y;
    if (Math.sqrt(dx * dx + dy * dy) <= vertex.radius) return;
  }

  vertices.push(new Vertex(x, y));
  redraw();
});

// Conectar
canvas.addEventListener("click", function (e) {
  if (draggingVertex) return;

  const rect = canvas.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;

  for (let vertex of vertices) {
    let dx = x - vertex.x;
    let dy = y - vertex.y;
    let distance = Math.sqrt(dx * dx + dy * dy);

    if (distance <= vertex.radius) {
      if (!selectedVertex) {
        selectedVertex = vertex;
      } else {
        let respuesta = prompt("¿Es dirigido? (si/no)");
        let directed = respuesta && respuesta.toLowerCase() === "si";

        let weight = prompt("Ingrese el peso:");

        if (weight !== null) {
          edges.push(new Edge(selectedVertex, vertex, weight, directed));
        }

        selectedVertex = null;
        redraw();
      }
      break;
    }
  }
});

// Arrastrar
canvas.addEventListener("mousedown", function (e) {
  const rect = canvas.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;

  for (let vertex of vertices) {
    let dx = x - vertex.x;
    let dy = y - vertex.y;

    if (Math.sqrt(dx * dx + dy * dy) <= vertex.radius) {
      draggingVertex = vertex;
      break;
    }
  }
});

canvas.addEventListener("mousemove", function (e) {
  if (draggingVertex) {
    const rect = canvas.getBoundingClientRect();
    draggingVertex.x = e.clientX - rect.left;
    draggingVertex.y = e.clientY - rect.top;
    redraw();
  }
});

canvas.addEventListener("mouseup", function () {
  draggingVertex = null;
});

/* ================= MATRIZ ================= */

function generarMatrizAdyacencia() {
  const n = vertices.length;
  let matriz = Array.from({ length: n }, () => Array(n).fill(0));

  edges.forEach((edge) => {
    const i = edge.from.id;
    const j = edge.to.id;
    const peso = Number(edge.weight) || 1;

    matriz[i][j] = peso;
    if (!edge.directed) matriz[j][i] = peso;
  });

  return matriz;
}

function mostrarMatriz() {
  const container = document.getElementById("matrizContainer");

  if (vertices.length === 0) {
    container.innerHTML = "<p style='opacity:0.6'>No hay vértices aún</p>";
    return;
  }

  const matriz = generarMatrizAdyacencia();

  let html = "<table><tr><th></th>";
  vertices.forEach((v) => (html += `<th>${v.id}</th>`));
  html += "</tr>";

  matriz.forEach((fila, i) => {
    html += `<tr><th>${i}</th>`;
    fila.forEach((valor) => (html += `<td>${valor}</td>`));
    html += "</tr>";
  });

  html += "</table>";
  container.innerHTML = html;
}

document.getElementById("btnMatriz").addEventListener("click", mostrarMatriz);

/* ================= HELP ================= */

const modalHelp = document.getElementById("modalHelp");
const btnHelp = document.getElementById("btnHelp");
const cerrarHelp = document.getElementById("cerrarHelp");

btnHelp.addEventListener("click", () => modalHelp.classList.remove("oculto"));
cerrarHelp.addEventListener("click", () => modalHelp.classList.add("oculto"));
window.addEventListener("click", (e) => {
  if (e.target === modalHelp) modalHelp.classList.add("oculto");
});
/* ================= LIMPIAR GRAFO ================= */

function limpiarGrafo() {
  // Vaciar estructuras
  vertices = [];
  edges = [];
  selectedVertex = null;
  draggingVertex = null;
  vertexCounter = 0;

  // Limpiar canvas
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Limpiar matriz
  const container = document.getElementById("matrizContainer");
  container.innerHTML = "<p style='opacity:0.6'>La matriz aparecerá aquí</p>";
}

// Evento botón
document.getElementById("btnLimpiar").addEventListener("click", limpiarGrafo);
