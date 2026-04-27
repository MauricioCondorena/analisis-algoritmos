<template>
  <section class="grafo">
    <div class="top">
      <h2 class="titulo">Grafo</h2>

      <div class="top-actions">
        <button class="btn-sec" @click="togglePanel">
          {{ panelAbierto ? "Ocultar panel" : "Mostrar panel" }}
        </button>

        <button class="btn-sec" @click="exportarJSON">Exportar JSON</button>
        <button class="btn-sec" @click="triggerImport">Importar JSON</button>

        <button class="btn" @click="limpiar">Limpiar</button>

        <input ref="fileInput" type="file" accept="application/json,.json" style="display: none"
          @change="importarJSON" />
      </div>
    </div>

    <p class="subtitulo">
      Doble click en el lienzo: crear nodo. Click en un nodo y luego en otro:
      crear arista (pregunta SI/NO si es dirigida, luego pide peso). Doble click
      en nodo: renombrar. Doble click en arista: editar peso. Arrastra nodos
      para acomodar. (Zoom y mover lienzo: desactivado)
    </p>

    <div class="barra">
      <span>Nodos: <b>{{ nodeCount }}</b></span>
      <span>Aristas: <b>{{ edgeCount }}</b></span>

      <span v-if="origenId !== null" class="chip">
        Origen seleccionado: <b>{{ labelDeNodo(origenId) }}</b>
        <button class="chip-x" @click="cancelarSeleccion" title="Cancelar">
          ×
        </button>
      </span>

      <span v-if="origenId !== null">
        Aristas en origen: <b>{{ contarAristasNodo(origenId) }}</b>
      </span>
    </div>

    <div class="layout" :class="{
      'layout-sin-panel': !panelAbierto,
      'layout-matriz': panelAbierto && tabPanel === 'matriz',
    }">
      <!-- LIENZO -->
      <div class="lienzo" ref="networkEl"></div>

      <!-- PANEL LATERAL -->
      <aside class="panel" :class="{ 'panel-matriz': tabPanel === 'matriz' }" v-if="panelAbierto">
        <div class="tabs">
          <button class="tab" :class="{ active: tabPanel === 'ayuda' }" @click="tabPanel = 'ayuda'">
            Ayuda
          </button>
          <button class="tab" :class="{ active: tabPanel === 'editor' }" @click="tabPanel = 'editor'">
            Editor
          </button>
          <button class="tab" :class="{ active: tabPanel === 'matriz' }" @click="tabPanel = 'matriz'">
            Matriz
          </button>
        </div>

        <!-- AYUDA -->
        <div v-if="tabPanel === 'ayuda'" class="panel-body">
          <h3 class="panel-title">Cómo usar</h3>
          <ul class="help">
            <li>
              <b>Doble click</b> en el lienzo → crea un nodo (te pide nombre).
            </li>
            <li><b>Click</b> en un nodo → lo marca como <b>origen</b>.</li>
            <li>
              <b>Click</b> en otro nodo → pregunta <b>SI/NO</b> si es dirigida y
              luego pide <b>peso</b>.
            </li>
            <li><b>Doble click</b> en un nodo → renombrar.</li>
            <li><b>Doble click</b> en una arista → editar peso.</li>
            <li><b>Arrastrar nodo</b> → reubicarlo.</li>
            <li><b>Zoom</b> y <b>mover lienzo</b> → desactivado.</li>
          </ul>

          <h3 class="panel-title">Reglas / validaciones</h3>
          <ul class="help">
            <li>
              Nombre nodo: 1–12 caracteres, letras/números/espacios/_- y
              acentos.
            </li>
            <li>No se permiten nombres duplicados.</li>
            <li>
              Peso: <b>entero o decimal</b> (ej: 3, -2, 2.5, 0.25). Acepta coma
              o punto.
            </li>
            <li>No se permiten aristas duplicadas.</li>
            <li>
              <b>No dirigida</b> = UNA conexión A—B sin flecha (no crea B→A),
              pero en la matriz se refleja en ambos lados.
            </li>
          </ul>
        </div>

        <!-- EDITOR -->
        <div v-else-if="tabPanel === 'editor'" class="panel-body">
          <h3 class="panel-title">Editor</h3>

          <div v-if="seleccion.tipo === 'none'" class="empty">
            <p><b>Tip:</b> Selecciona un nodo o una arista para editar.</p>
            <p>O crea un nodo con doble click en el lienzo.</p>
          </div>

          <!-- NODE -->
          <div v-else-if="seleccion.tipo === 'node'" class="card">
            <div class="row">
              <span class="label">Nodo</span>
              <span class="value"><b>{{ seleccion.label }}</b></span>
            </div>

            <div class="row">
              <span class="label">Aristas conectadas</span>
              <span class="value"><b>{{ contarAristasNodo(seleccion.id) }}</b></span>
            </div>

            <div class="row">
              <span class="label">Salientes</span>
              <span class="value"><b>{{ contarSalientes(seleccion.id) }}</b></span>
            </div>

            <div class="row">
              <span class="label">Entrantes</span>
              <span class="value"><b>{{ contarEntrantes(seleccion.id) }}</b></span>
            </div>

            <button class="btn-block" @click="abrirModalRenombrarNodo(seleccion.id)">
              Renombrar nodo
            </button>

            <button class="btn-danger" @click="eliminarNodo(seleccion.id)">
              Eliminar nodo
            </button>

            <p class="mini">
              * Al eliminar el nodo, también se eliminan sus aristas conectadas.
            </p>
          </div>

          <!-- EDGE -->
          <div v-else-if="seleccion.tipo === 'edge'" class="card">
            <div class="row">
              <span class="label">Arista</span>
              <span class="value">
                <b>{{ labelDeNodo(seleccion.from) }}</b>
                <span v-if="seleccion.directed"> → </span>
                <span v-else> — </span>
                <b>{{ labelDeNodo(seleccion.to) }}</b>
              </span>
            </div>

            <div class="row">
              <span class="label">Tipo</span>
              <span class="value">
                <b>{{ seleccion.directed ? "Dirigida" : "No dirigida" }}</b>
              </span>
            </div>

            <div class="row">
              <span class="label">Peso</span>
              <span class="value"><b>{{ seleccion.label }}</b></span>
            </div>

            <button class="btn-block" @click="abrirModalEditarPeso(seleccion.id)">
              Editar peso
            </button>

            <button class="btn-danger" @click="eliminarArista(seleccion.id)">
              Eliminar arista
            </button>
          </div>
        </div>

        <!-- MATRIZ -->
        <div v-else class="panel-body">
          <h3 class="panel-title">Matriz de adyacencia</h3>
          <p class="mini">
            Orden de nodos: según creación (id). Valores: peso si existe arista,
            0 si no existe.
          </p>
          <p class="mini mini-leyenda">
            Abreviaturas: Sum. filas = Sumatoria de filas, Sum. cols. =
            Sumatoria de columnas, N° vals. = Número de valores.
          </p>

          <div v-if="matrizMejorada.nodos.length === 0" class="empty">
            <p>No hay nodos todavía.</p>
          </div>

          <div v-else class="tabla-wrap">
            <table class="tabla">
              <thead>
                <tr>
                  <th></th>
                  <th v-for="n in matrizMejorada.nodos" :key="'col-' + n.id">
                    {{ n.label }}
                  </th>
                  <th>Sum. filas</th>
                  <th>N° vals.</th>
                  <th>Salientes</th>
                </tr>
              </thead>

              <tbody>
                <tr v-for="fila in matrizMejorada.filas" :key="'row-' + fila.id">
                  <th>{{ fila.label }}</th>

                  <td v-for="c in fila.valores" :key="fila.id + '-' + c.key">
                    {{ c.valor }}
                  </td>

                  <td>
                    <b>{{ fila.sumaFila }}</b>
                  </td>
                  <td>{{ fila.cantValores }}</td>
                  <td>
                    <b>{{ fila.aristasFila }}</b>
                  </td>
                </tr>

                <tr class="tabla-footer">
                  <th>Sum. cols.</th>
                  <td v-for="c in matrizMejorada.sumaColumnas" :key="'sumcol-' + c.key">
                    <b>{{ c.valor }}</b>
                  </td>
                  <td></td>
                  <td></td>
                  <td></td>
                </tr>

                <tr class="tabla-footer">
                  <th>N° vals.</th>
                  <td v-for="c in matrizMejorada.cantColumnas" :key="'cntcol-' + c.key">
                    {{ c.valor }}
                  </td>
                  <td></td>
                  <td></td>
                  <td></td>
                </tr>
              </tbody>
            </table>

            <div class="resumen-matriz">
              <div class="resumen-card">
                <h4>Resumen por filas</h4>
                <p v-for="item in resumenFilas" :key="'fila-res-' + item.id">
                  <b>{{ item.label }}</b> → Suma: {{ item.suma }} | Aristas:
                  {{ item.aristas }}
                </p>
              </div>

              <div class="resumen-card">
                <h4>Resumen por columnas</h4>
                <p v-for="item in resumenColumnas" :key="'col-res-' + item.id">
                  <b>{{ item.label }}</b> → Suma: {{ item.suma }} | Aristas:
                  {{ item.aristas }}
                </p>
              </div>

              <div class="resumen-card">
                <h4>Resumen total por nodo</h4>
                <p v-for="item in resumenNodos" :key="'nodo-res-' + item.id">
                  <b>{{ item.label }}</b> → Salientes: {{ item.salientes }} |
                  Entrantes: {{ item.entrantes }} | Conectadas:
                  {{ item.conectadas }}
                </p>
              </div>
            </div>
          </div>

          <button class="btn-block" @click="copiarMatrizComoTexto">
            Copiar matriz (texto)
          </button>
        </div>
      </aside>
    </div>

    <!-- MODAL -->
    <div v-if="modal.abierto" class="modal-backdrop" @click.self="cerrarModal">
      <div class="modal">
        <div class="modal-head">
          <h3 class="modal-title">{{ modal.titulo }}</h3>
          <button class="modal-x" @click="cerrarModal" title="Cerrar">×</button>
        </div>

        <div class="modal-body">
          <label class="modal-label">{{ modal.label }}</label>

          <input class="modal-input" v-model="modal.valor" :placeholder="modal.placeholder"
            @keydown.enter.prevent="confirmarModal" />

          <p class="modal-hint">{{ modal.hint }}</p>
          <p v-if="modal.error" class="modal-error">{{ modal.error }}</p>
        </div>

        <div class="modal-actions">
          <button class="btn-sec" @click="cerrarModal">Cancelar</button>
          <button class="btn" @click="confirmarModal">Guardar</button>
        </div>
      </div>
    </div>
  </section>
</template>

<script>
import { Network } from "vis-network/standalone";
import { DataSet } from "vis-data/standalone";

export default {
  name: "GrafoVista",

  props: {
    initialNodes: { type: Array, default: () => [] },
    initialEdges: { type: Array, default: () => [] },
  },

  emits: ["snapshot", "irMatriz"],

  data() {
    return {
      network: null,
      nodes: null,
      edges: null,

      contadorNodos: 0,
      contadorAristas: 0,
      origenId: null,

      panelAbierto: true,
      tabPanel: "ayuda",

      seleccion: {
        tipo: "none",
        id: null,
        label: "",
        from: null,
        to: null,
        directed: true,
      },

      modal: {
        abierto: false,
        tipo: "",
        titulo: "",
        label: "",
        placeholder: "",
        hint: "",
        valor: "",
        error: "",
        payload: null,
      },

      lastCanvasClickAt: 0,
      lastCanvasClickPos: null,

      pendienteArista: null,
    };
  },

  computed: {
    nodeCount() {
      return this.nodes ? this.nodes.length : 0;
    },

    edgeCount() {
      return this.edges ? this.edges.length : 0;
    },

    matrizMejorada() {
      if (!this.nodes) {
        return {
          nodos: [],
          filas: [],
          sumaColumnas: [],
          cantColumnas: [],
        };
      }

      const nodos = this.nodes.get().sort((a, b) => a.id - b.id);
      const n = nodos.length;

      const map = new Map();
      if (this.edges) {
        this.edges.get().forEach((e) => {
          const peso = e.label != null ? e.label : "1";
          const dirigida = e.directed !== false;

          map.set(`${e.from}->${e.to}`, peso);

          if (!dirigida) {
            map.set(`${e.to}->${e.from}`, peso);
          }
        });
      }

      const filas = nodos.map((rowNode) => {
        const valores = nodos.map((colNode) => {
          const key = `${rowNode.id}->${colNode.id}`;
          const v = map.get(key) != null ? map.get(key) : "0";
          return { key, valor: v };
        });

        const sumaFila = valores.reduce(
          (acc, c) => acc + Number(c.valor || 0),
          0,
        );

        const aristasFila = valores.reduce(
          (acc, c) => acc + (Number(c.valor) !== 0 ? 1 : 0),
          0,
        );

        return {
          id: rowNode.id,
          label: rowNode.label,
          valores,
          sumaFila: String(sumaFila),
          cantValores: n,
          aristasFila,
        };
      });

      const sumaColumnas = nodos.map((colNode) => {
        const suma = nodos.reduce((acc, rowNode) => {
          const key = `${rowNode.id}->${colNode.id}`;
          const v = map.get(key) != null ? map.get(key) : "0";
          return acc + Number(v || 0);
        }, 0);

        return { key: colNode.id, valor: String(suma) };
      });

      const cantColumnas = nodos.map((colNode) => {
        return { key: colNode.id, valor: n };
      });

      return { nodos, filas, sumaColumnas, cantColumnas };
    },

    resumenFilas() {
      return this.matrizMejorada.filas.map((fila) => ({
        id: fila.id,
        label: fila.label,
        suma: fila.sumaFila,
        aristas: fila.aristasFila,
      }));
    },

    resumenColumnas() {
      const m = this.matrizMejorada;
      const nodos = m.nodos;
      const filas = m.filas;

      return nodos.map((nodo, colIndex) => {
        let suma = 0;
        let aristas = 0;

        filas.forEach((fila) => {
          const valor = Number(fila.valores[colIndex]?.valor || 0);
          suma += valor;
          if (valor !== 0) aristas += 1;
        });

        return {
          id: nodo.id,
          label: nodo.label,
          suma: String(suma),
          aristas,
        };
      });
    },

    resumenNodos() {
      return this.matrizMejorada.nodos.map((nodo, i) => {
        const salientes = this.resumenFilas[i]?.aristas || 0;
        const entrantes = this.resumenColumnas[i]?.aristas || 0;
        const conectadas = this.contarAristasNodo(nodo.id);

        return {
          id: nodo.id,
          label: nodo.label,
          salientes,
          entrantes,
          conectadas,
        };
      });
    },
  },

  mounted() {
    this.nodes = new DataSet([]);
    this.edges = new DataSet([]);

    if (this.initialNodes.length) {
      this.nodes.add(this.initialNodes.map((n) => ({ ...n, fixed: false })));
      this.contadorNodos = Math.max(...this.initialNodes.map((n) => n.id));
      this.emitSnapshot();
    }

    if (this.initialEdges.length) {
      this.edges.add(
        this.initialEdges.map((e) => ({
          ...e,
          directed: e.directed !== false,
          arrows:
            e.directed === false
              ? { to: { enabled: false } }
              : e.arrows ?? { to: { enabled: true, scaleFactor: 0.55 } },
        })),
      );
      this.contadorAristas = Math.max(...this.initialEdges.map((e) => e.id));
      this.emitSnapshot();
    }

    const options = {
      physics: false,
      autoResize: true,
      interaction: {
        hover: true,
        multiselect: false,
        dragView: false,
        zoomView: false,
        zoomSpeed: 0,
        navigationButtons: false,
        dragNodes: true,
      },
      nodes: {
        shape: "circle",
        size: 28,
        color: {
          background: "#0b1220",
          border: "#0b1220",
          highlight: { background: "#0b1220", border: "#f5b400" },
        },
        borderWidth: 3,
        font: { color: "#ffffff", size: 18, face: "Arial", bold: true },
      },
      edges: {
        width: 2,
        color: "#0b1220",
        arrows: { to: { enabled: true, scaleFactor: 0.55 } },
        smooth: { enabled: true, type: "dynamic", roundness: 0.35 },
        font: {
          align: "middle",
          size: 16,
          color: "#0b1220",
          background: "rgba(255,255,255,0.95)",
          strokeWidth: 0,
        },
      },

    };

    this.network = new Network(
      this.$refs.networkEl,
      { nodes: this.nodes, edges: this.edges },
      options,
    );

    this.$refs.networkEl.addEventListener("wheel", (e) => e.preventDefault(), {
      passive: false,
    });

    this.network.on("doubleClick", (params) => {
      if (params.edges && params.edges.length > 0) {
        this.abrirModalEditarPeso(params.edges[0]);
        return;
      }
      if (params.nodes && params.nodes.length > 0) {
        this.abrirModalRenombrarNodo(params.nodes[0]);
        return;
      }

      const pos =
        params.pointer && params.pointer.canvas ? params.pointer.canvas : null;
      if (pos) this.abrirModalCrearNodo(pos.x, pos.y);
    });

    this.network.on("click", (params) => {
      if (params.nodes && params.nodes.length > 0) {
        const nodeId = params.nodes[0];
        this.clickNodo(nodeId);
        this.tabPanel = "editor";
        return;
      }

      if (params.edges && params.edges.length > 0) {
        const edgeId = params.edges[0];
        this.seleccionarArista(edgeId);
        this.tabPanel = "editor";
        return;
      }

      this.seleccion = {
        tipo: "none",
        id: null,
        label: "",
        from: null,
        to: null,
        directed: true,
      };
      this.detectarDobleClickEnLienzo(params);
    });

    this.network.on("dragEnd", () => {
      this.emitSnapshot();
    });

    window.addEventListener("resize", this.ajustarVistaRed);
    this.$nextTick(() => {
      this.ajustarVistaRed();
    });

    const camino = JSON.parse(localStorage.getItem("johnson_resultado") || "[]");

    if (camino.length > 0) {
      this.$nextTick(() => {
        this.pintarCaminoJohnson(camino);
      });
    }
  },

  beforeUnmount() {
    window.removeEventListener("resize", this.ajustarVistaRed);
    if (this.network) this.network.destroy();
  },

  methods: {
    togglePanel() {
      this.panelAbierto = !this.panelAbierto;

      this.$nextTick(() => {
        this.ajustarVistaRed();
      });
    },

    ajustarVistaRed() {
      if (!this.network) return;
      this.network.redraw();
    },

    emitSnapshot() {
      this.$emit("snapshot", {
        nodes: this.nodes.get(),
        edges: this.edges.get(),
      });
    },

    detectarDobleClickEnLienzo(params) {
      if (params.nodes && params.nodes.length) return;
      if (params.edges && params.edges.length) return;

      const now = Date.now();
      const pos =
        params.pointer && params.pointer.canvas ? params.pointer.canvas : null;
      if (!pos) return;

      const MAX_MS = 450;
      const MAX_DIST = 18;

      if (
        this.lastCanvasClickAt &&
        now - this.lastCanvasClickAt <= MAX_MS &&
        this.lastCanvasClickPos
      ) {
        const dx = pos.x - this.lastCanvasClickPos.x;
        const dy = pos.y - this.lastCanvasClickPos.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist <= MAX_DIST) {
          this.lastCanvasClickAt = 0;
          this.lastCanvasClickPos = null;
          this.abrirModalCrearNodo(pos.x, pos.y);
          return;
        }
      }

      this.lastCanvasClickAt = now;
      this.lastCanvasClickPos = { x: pos.x, y: pos.y };
    },

    labelDeNodo(id) {
      const n = this.nodes ? this.nodes.get(id) : null;
      return n && n.label ? n.label : `N${id}`;
    },

    async pintarCaminoJohnson(camino) {
      if (!this.nodes || !this.edges) return;

      // RESET
      this.nodes.update(
        this.nodes.get().map(n => ({
          id: n.id,
          color: {
            background: "#0b1220",
            border: "#0b1220"
          }
        }))
      );

      this.edges.update(
        this.edges.get().map(e => ({
          id: e.id,
          color: { color: "#0b1220" },
          width: 2
        }))
      );

      // ANIMACIÓN
      for (let i = 0; i < camino.length; i++) {
        const actual = camino[i];

        // nodo
        const nodo = this.nodes.get().find(n => n.label === actual);
        if (nodo) {
          this.nodes.update({
            id: nodo.id,
            color: {
              background: "#f5b400",
              border: "#f5b400"
            }
          });
        }

        // arista
        if (i < camino.length - 1) {
          const siguiente = camino[i + 1];

          const edge = this.edges.get().find(e =>
            this.labelDeNodo(e.from) === actual &&
            this.labelDeNodo(e.to) === siguiente
          );

          if (edge) {
            this.edges.update({
              id: edge.id,
              color: { color: "#f5b400" },
              width: 4
            });
          }
        }

        await new Promise(res => setTimeout(res, 600));
      }
    },

    normalizarNumero(str) {
      return String(str == null ? "" : str)
        .trim()
        .replace(",", ".");
    },

    esNumeroValido(str) {
      const s = this.normalizarNumero(str);
      return /^-?\d+(\.\d+)?$/.test(s) && Number.isFinite(Number(s));
    },

    validarNombreNodo(nombre) {
      const n = String(nombre == null ? "" : nombre).trim();
      if (n.length < 1) return "El nombre no puede estar vacío.";
      if (n.length > 12) return "Máximo 12 caracteres.";
      if (!/^[A-Za-zÁÉÍÓÚáéíóúÑñ0-9 _-]+$/.test(n)) {
        return "Solo letras/números/espacios y _ - (se permiten acentos).";
      }
      const ya = this.nodes.get().some((x) => x.label === n);
      if (ya) return "Ya existe un nodo con ese nombre.";
      return "";
    },

    seleccionarNodo(id) {
      const n = this.nodes.get(id);
      if (!n) return;
      this.seleccion = {
        tipo: "node",
        id,
        label: n.label,
        from: null,
        to: null,
        directed: true,
      };
    },

    seleccionarArista(edgeId) {
      const e = this.edges.get(edgeId);
      if (!e) return;
      this.seleccion = {
        tipo: "edge",
        id: edgeId,
        label: e.label != null ? e.label : "1",
        from: e.from,
        to: e.to,
        directed: e.directed !== false,
      };
    },

    cancelarSeleccion() {
      this.origenId = null;
      this.clearHighlight();
    },

    abrirModalCrearNodo(x, y) {
      this.tabPanel = "editor";
      this.panelAbierto = true;

      this.modal = {
        abierto: true,
        tipo: "crearNodo",
        titulo: "Crear nodo",
        label: "Nombre del nodo",
        placeholder: "Ej: A, B, Casa, Nodo1",
        hint: "Reglas: 1–12 caracteres, sin duplicados.",
        valor: "",
        error: "",
        payload: { x, y },
      };
    },

    abrirModalRenombrarNodo(nodeId) {
      const n = this.nodes.get(nodeId);
      if (!n) return;

      this.tabPanel = "editor";
      this.panelAbierto = true;

      this.modal = {
        abierto: true,
        tipo: "renombrarNodo",
        titulo: "Renombrar nodo",
        label: "Nuevo nombre",
        placeholder: "Ej: A, B, Casa, Nodo1",
        hint: "Reglas: 1–12 caracteres, sin duplicados.",
        valor: n.label || "",
        error: "",
        payload: { nodeId },
      };
    },

    abrirModalCrearAristaPeso(from, to) {
      this.tabPanel = "editor";
      this.panelAbierto = true;

      const simb = this.pendienteArista?.directed ? "→" : "—";

      this.modal = {
        abierto: true,
        tipo: "crearArista",
        titulo: "Crear arista",
        label: `Peso (${this.labelDeNodo(from)} ${simb} ${this.labelDeNodo(
          to,
        )})`,
        placeholder: "Ej: 1, 2.5, -3",
        hint: "Acepta entero o decimal. Puedes usar coma o punto.",
        valor: "1",
        error: "",
        payload: { from, to },
      };
    },

    abrirModalEditarPeso(edgeId) {
      const e = this.edges.get(edgeId);
      if (!e) return;

      this.tabPanel = "editor";
      this.panelAbierto = true;

      this.modal = {
        abierto: true,
        tipo: "editarPeso",
        titulo: "Editar peso",
        label: `Peso (${this.labelDeNodo(e.from)} ${e.directed === false ? "—" : "→"
          } ${this.labelDeNodo(e.to)})`,
        placeholder: "Ej: 1, 2.5, -3",
        hint: "Acepta entero o decimal. Puedes usar coma o punto.",
        valor: e.label != null ? e.label : "1",
        error: "",
        payload: { edgeId },
      };
    },

    cerrarModal() {
      this.modal.abierto = false;
      this.modal.error = "";
    },

    confirmarModal() {
      const tipo = this.modal.tipo;

      if (tipo === "crearNodo") {
        const nombre = String(
          this.modal.valor == null ? "" : this.modal.valor,
        ).trim();
        const error = this.validarNombreNodo(nombre);
        if (error) {
          this.modal.error = error;
          return;
        }

        const p = this.modal.payload || { x: 0, y: 0 };
        this.contadorNodos += 1;
        const id = this.contadorNodos;

        this.nodes.add({ id, label: nombre, x: p.x, y: p.y, fixed: false });
        this.emitSnapshot();
        this.$nextTick(() => this.ajustarVistaRed());
        this.cerrarModal();
        return;
      }

      if (tipo === "renombrarNodo") {
        const nodeId = this.modal.payload ? this.modal.payload.nodeId : null;
        const actual = nodeId != null ? this.nodes.get(nodeId) : null;
        if (!actual) {
          this.cerrarModal();
          return;
        }

        const nuevo = String(
          this.modal.valor == null ? "" : this.modal.valor,
        ).trim();
        if (nuevo === actual.label) {
          this.cerrarModal();
          return;
        }

        const error = this.validarNombreNodo(nuevo);
        if (error) {
          this.modal.error = error;
          return;
        }

        this.nodes.update({ id: nodeId, label: nuevo });

        if (this.seleccion.tipo === "node" && this.seleccion.id === nodeId) {
          this.seleccion.label = nuevo;
        }

        this.emitSnapshot();
        this.cerrarModal();
        return;
      }

      if (tipo === "crearArista") {
        const from = this.modal.payload ? this.modal.payload.from : null;
        const to = this.modal.payload ? this.modal.payload.to : null;
        if (from == null || to == null) {
          this.cerrarModal();
          return;
        }

        const cfg = this.pendienteArista;
        if (!cfg || cfg.from !== from || cfg.to !== to) {
          this.modal.error =
            "Se perdió la selección de arista. Intenta de nuevo.";
          return;
        }

        const val = this.normalizarNumero(this.modal.valor);
        if (!this.esNumeroValido(val)) {
          this.modal.error =
            "Peso inválido. Usa entero o decimal (ej: 3, 2.5, -1).";
          return;
        }

        const peso = String(Number(val));
        const esDirigida = cfg.directed === true;

        const existeAB = this.edges
          .get()
          .some((e) => e.from === from && e.to === to);
        const existeBA = this.edges
          .get()
          .some((e) => e.from === to && e.to === from);

        if (esDirigida) {
          if (existeAB) {
            this.modal.error = `Ya existe la arista ${this.labelDeNodo(
              from,
            )} → ${this.labelDeNodo(to)}.`;
            return;
          }
        } else {
          if (existeAB || existeBA) {
            this.modal.error = `Ya existe la conexión ${this.labelDeNodo(
              from,
            )} — ${this.labelDeNodo(to)}.`;
            return;
          }
        }

        this.contadorAristas += 1;
        const edgeId = this.contadorAristas;

        const yaExisteInversa = this.edges
          .get()
          .some((e) => e.from === to && e.to === from);
        const esLazo = from === to;

        let smoothCfg = { enabled: true, type: "dynamic", roundness: 0.25 };
        if (esLazo) {
          smoothCfg = { enabled: true, type: "self", roundness: 0.6 };
        } else if (esDirigida && yaExisteInversa) {
          const min = Math.min(from, to);
          smoothCfg =
            from === min
              ? { enabled: true, type: "curvedCW", roundness: 0.35 }
              : { enabled: true, type: "curvedCCW", roundness: 0.35 };
        }

        this.edges.add({
          id: edgeId,
          from,
          to,
          label: peso,
          smooth: smoothCfg,
          directed: esDirigida,
          arrows: esDirigida
            ? { to: { enabled: true, scaleFactor: 0.55 } }
            : { to: { enabled: false } },
        });

        this.pendienteArista = null;
        this.emitSnapshot();
        this.seleccionarArista(edgeId);
        this.tabPanel = "editor";
        this.$nextTick(() => this.ajustarVistaRed());
        this.cerrarModal();
        return;
      }

      if (tipo === "editarPeso") {
        const edgeId = this.modal.payload ? this.modal.payload.edgeId : null;
        const e = edgeId != null ? this.edges.get(edgeId) : null;
        if (!e) {
          this.cerrarModal();
          return;
        }

        const val = this.normalizarNumero(this.modal.valor);
        if (!this.esNumeroValido(val)) {
          this.modal.error =
            "Peso inválido. Usa entero o decimal (ej: 3, 2.5, -1).";
          return;
        }

        const peso = String(Number(val));
        this.edges.update({ id: edgeId, label: peso });

        if (this.seleccion.tipo === "edge" && this.seleccion.id === edgeId) {
          this.seleccion.label = peso;
        }

        this.emitSnapshot();
        this.cerrarModal();
      }
    },

    clickNodo(destinoId) {
      if (this.origenId === null) {
        this.origenId = destinoId;
        this.highlightOrigen(destinoId);
        this.seleccionarNodo(destinoId);
        return;
      }

      const from = this.origenId;
      const to = destinoId;

      this.origenId = null;
      this.clearHighlight();

      const pregunta = `¿La arista ${this.labelDeNodo(
        from,
      )} con ${this.labelDeNodo(to)} será dirigida? (SI/NO)`;
      let resp = window.prompt(pregunta, "SI");
      if (resp == null) {
        this.pendienteArista = null;
        return;
      }

      resp = String(resp).trim().toUpperCase();

      const esSi =
        resp === "SI" || resp === "S" || resp === "YES" || resp === "Y";
      const esNo = resp === "NO" || resp === "N";

      if (!esSi && !esNo) {
        window.alert("Respuesta inválida. Escribe SI o NO.");
        this.pendienteArista = null;
        return;
      }

      this.pendienteArista = { from, to, directed: esSi };
      this.abrirModalCrearAristaPeso(from, to);
    },

    highlightOrigen(id) {
      this.nodes.update({
        id,
        color: { background: "#0b1220", border: "#f5b400" },
      });
    },

    clearHighlight() {
      const all = this.nodes.get().map((n) => ({
        id: n.id,
        color: { background: "#0b1220", border: "#0b1220" },
      }));
      this.nodes.update(all);
    },

    eliminarNodo(nodeId) {
      const conectadas = this.edges
        .get()
        .filter((e) => e.from === nodeId || e.to === nodeId);
      this.edges.remove(conectadas.map((e) => e.id));
      this.nodes.remove(nodeId);

      if (this.origenId === nodeId) this.origenId = null;

      if (this.seleccion.tipo === "node" && this.seleccion.id === nodeId) {
        this.seleccion = {
          tipo: "none",
          id: null,
          label: "",
          from: null,
          to: null,
          directed: true,
        };
      }

      this.clearHighlight();
      this.emitSnapshot();
      this.$nextTick(() => this.ajustarVistaRed());
    },

    eliminarArista(edgeId) {
      this.edges.remove(edgeId);

      if (this.seleccion.tipo === "edge" && this.seleccion.id === edgeId) {
        this.seleccion = {
          tipo: "none",
          id: null,
          label: "",
          from: null,
          to: null,
          directed: true,
        };
      }

      this.emitSnapshot();
      this.$nextTick(() => this.ajustarVistaRed());
    },

    copiarMatrizComoTexto() {
      const m = this.matrizMejorada;
      const nodos = m.nodos;
      if (!nodos.length) return;

      let out =
        "    " +
        nodos.map((n) => n.label).join("  ") +
        "  |  SumFila  NumVals  AristasSal\n";

      m.filas.forEach((fila) => {
        out +=
          fila.label +
          "  " +
          fila.valores.map((c) => c.valor).join("  ") +
          "  |  " +
          fila.sumaFila +
          "  " +
          fila.cantValores +
          "  " +
          fila.aristasFila +
          "\n";
      });

      out += "SumCol " + m.sumaColumnas.map((c) => c.valor).join("  ") + "\n";
      out += "NumVal " + m.cantColumnas.map((c) => c.valor).join("  ") + "\n";

      out += "\nResumen por filas\n";
      this.resumenFilas.forEach((item) => {
        out += `${item.label} -> Suma: ${item.suma} | Aristas: ${item.aristas}\n`;
      });

      out += "\nResumen por columnas\n";
      this.resumenColumnas.forEach((item) => {
        out += `${item.label} -> Suma: ${item.suma} | Aristas: ${item.aristas}\n`;
      });

      out += "\nResumen total por nodo\n";
      this.resumenNodos.forEach((item) => {
        out += `${item.label} -> Salientes: ${item.salientes} | Entrantes: ${item.entrantes} | Conectadas: ${item.conectadas}\n`;
      });

      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(out);
      }
    },

    limpiar() {
      this.origenId = null;
      this.contadorNodos = 0;
      this.contadorAristas = 0;
      this.pendienteArista = null;

      this.seleccion = {
        tipo: "none",
        id: null,
        label: "",
        from: null,
        to: null,
        directed: true,
      };

      this.nodes.clear();
      this.edges.clear();
      this.clearHighlight();
      this.emitSnapshot();
      this.$nextTick(() => this.ajustarVistaRed());
      localStorage.removeItem("johnson_resultado");
    },

    triggerImport() {
      const el = this.$refs.fileInput;
      if (!el) {
        window.alert("No se encontró el input file (ref='fileInput').");
        return;
      }
      el.value = "";
      el.click();
    },

    exportarJSON() {
      try {
        let nombre = window.prompt(
          "Nombre del archivo (sin .json):",
          "mi_grafo",
        );
        if (nombre === null) return;
        nombre = String(nombre).trim();
        if (!nombre) nombre = "mi_grafo";

        const payload = {
          version: 1,
          exportedAt: new Date().toISOString(),
          state: {
            contadorNodos: this.contadorNodos,
            contadorAristas: this.contadorAristas,
            nodes: this.nodes ? this.nodes.get() : [],
            edges: this.edges ? this.edges.get() : [],
          },
        };

        const jsonStr = JSON.stringify(payload, null, 2);
        const blob = new Blob([jsonStr], { type: "application/json" });
        const url = URL.createObjectURL(blob);

        const a = document.createElement("a");
        a.href = url;
        a.download = `${nombre}.json`;
        document.body.appendChild(a);
        a.click();
        a.remove();

        URL.revokeObjectURL(url);
      } catch (e) {
        console.error(e);
        window.alert("Falló Exportar JSON. Revisa consola.");
      }
    },

    async importarJSON(evt) {
      try {
        const file = evt?.target?.files?.[0];
        if (!file) return;

        const text = await file.text();
        const data = JSON.parse(text);

        const state = data?.state;
        if (
          !state ||
          !Array.isArray(state.nodes) ||
          !Array.isArray(state.edges)
        ) {
          window.alert("JSON inválido: falta state.nodes o state.edges.");
          return;
        }

        const edges = state.edges.map((e) => {
          const directed = e.directed !== false;
          return {
            ...e,
            id: Number(e.id),
            from: Number(e.from),
            to: Number(e.to),
            directed,
            arrows: directed
              ? e.arrows ?? { to: { enabled: true, scaleFactor: 0.55 } }
              : { to: { enabled: false } },
          };
        });

        this.nodes.clear();
        this.edges.clear();

        this.nodes.add(
          state.nodes.map((n) => ({
            ...n,
            id: Number(n.id),
            fixed: false,
          })),
        );
        this.edges.add(edges);

        const maxNodeId = state.nodes.length
          ? Math.max(...state.nodes.map((n) => Number(n.id)))
          : 0;
        const maxEdgeId = edges.length
          ? Math.max(...edges.map((e) => Number(e.id)))
          : 0;

        this.contadorNodos = Math.max(
          Number(state.contadorNodos) || 0,
          maxNodeId,
        );
        this.contadorAristas = Math.max(
          Number(state.contadorAristas) || 0,
          maxEdgeId,
        );

        this.origenId = null;
        this.pendienteArista = null;
        this.clearHighlight();

        this.seleccion = {
          tipo: "none",
          id: null,
          label: "",
          from: null,
          to: null,
          directed: true,
        };

        if (this.network) {
          this.network.fit({ animation: { duration: 250 } });
        }

        this.emitSnapshot();
      } catch (e) {
        console.error(e);
        window.alert("No se pudo importar el JSON. Revisa que sea válido.");
      } finally {
        if (evt?.target) evt.target.value = "";
      }
    },

    contarAristasNodo(nodeId) {
      if (!this.edges || nodeId == null) return 0;
      const id = String(nodeId);

      return this.edges.get().reduce((acc, e) => {
        const from = String(e.from);
        const to = String(e.to);
        return from === id || to === id ? acc + 1 : acc;
      }, 0);
    },

    contarSalientes(nodeId) {
      if (!this.edges || nodeId == null) return 0;
      const id = String(nodeId);

      return this.edges.get().reduce((acc, e) => {
        return String(e.from) === id ? acc + 1 : acc;
      }, 0);
    },

    contarEntrantes(nodeId) {
      if (!this.edges || nodeId == null) return 0;
      const id = String(nodeId);

      return this.edges.get().reduce((acc, e) => {
        return String(e.to) === id ? acc + 1 : acc;
      }, 0);
    },
  },
};
</script>

<style scoped src="@/estilos/grafoVista.css"></style>