<template>
  <section class="matriz">
    <h2 class="titulo">JHONSON</h2>

    <div class="acciones">
      <button class="btn-sec" @click="$emit('volver')">Volver al grafo</button>

      <button class="btn" @click="resolverJohnson">
        Calcular
      </button>

      <button class="btn-sec" @click="limpiarGrafo">Limpiar</button>

      <button class="btn-sec" @click="exportarJSON">Exportar JSON</button>

      <button class="btn-sec" @click="triggerImport">Importar JSON</button>

      <button class="btn btn-sec" @click="abrirAyuda">Ayuda</button>

      <input
        ref="fileInput"
        type="file"
        accept="application/json,.json"
        style="display: none"
        @change="importarJSON"
      />

      <select v-model="modo" class="select-modo">
        <option value="min">Minimizar</option>
        <option value="max">Maximizar</option>
      </select>
    </div>

    <div class="editor-layout">
      <div class="editor-main">
        <div class="lienzo" ref="networkEl"></div>
      </div>

      <aside class="editor-side">
        <div
          class="editor-card"
          :class="{
            'editor-card-node': seleccionado?.tipo === 'nodo',
            'editor-card-edge': seleccionado?.tipo === 'arista',
          }"
        >
          <div class="editor-head">
            <span
              class="editor-badge"
              :class="{
                'editor-badge-node': seleccionado?.tipo === 'nodo',
                'editor-badge-edge': seleccionado?.tipo === 'arista',
              }"
            >
              {{
                seleccionado?.tipo === "nodo"
                  ? "Nodo seleccionado"
                  : seleccionado?.tipo === "arista"
                  ? "Arista seleccionada"
                  : "Editor"
              }}
            </span>

            <h3 class="editor-title">
              {{
                seleccionado?.tipo === "nodo"
                  ? "Editar nodo"
                  : seleccionado?.tipo === "arista"
                  ? "Editar arista"
                  : "Acciones"
              }}
            </h3>
          </div>

          <div v-if="seleccionado?.tipo === 'nodo'" class="editor-body">
            <div class="editor-item">
              <span>Nombre</span>
              <strong>{{
                nodoSeleccionado?.labelBase || nodoSeleccionado?.label
              }}</strong>
            </div>

            <div class="editor-item">
              <span>ID</span>
              <strong>{{ nodoSeleccionado?.id }}</strong>
            </div>

            <div class="editor-actions">
              <button class="btn" @click="abrirModalEditarNodoSeleccionado">
                Renombrar nodo
              </button>

              <button class="btn-danger" @click="eliminarNodoSeleccionado">
                Eliminar nodo
              </button>
            </div>
          </div>

          <div v-else-if="seleccionado?.tipo === 'arista'" class="editor-body">
            <div class="editor-item">
              <span>Desde</span>
              <strong>{{ aristaSeleccionada?.fromLabel }}</strong>
            </div>

            <div class="editor-item">
              <span>Hacia</span>
              <strong>{{ aristaSeleccionada?.toLabel }}</strong>
            </div>

            <div class="editor-item">
              <span>Peso</span>
              <strong>{{ aristaSeleccionada?.label }}</strong>
            </div>

            <div class="editor-actions">
              <button class="btn" @click="abrirModalEditarAristaSeleccionada">
                Editar peso
              </button>

              <button class="btn-danger" @click="eliminarAristaSeleccionada">
                Eliminar arista
              </button>
            </div>
          </div>

          <div v-else class="editor-empty">
            <p>
              Selecciona un <b>nodo</b> o una <b>arista</b> para editar o
              eliminar.
            </p>
            <p>Doble click en el lienzo para crear nodos.</p>
            <p>Haz click en un nodo y luego en otro para crear una arista.</p>
            <p>
              Doble click sobre un nodo o una arista para editar directamente.
            </p>
          </div>
        </div>
      </aside>
    </div>

    <div v-if="resultado.length" class="resultado-card">
      <h3>Camino crítico</h3>
      <div class="camino">
        <span v-for="(n, i) in resultado" :key="i">
          <b>{{ n }}</b>
          <span v-if="i < resultado.length - 1"> → </span>
        </span>
      </div>

      <h3>Holguras</h3>
      <ul>
        <li v-for="h in holguras" :key="h.id">
          <b>{{ h.label }}</b> → Holgura: {{ h.holgura }}
        </li>
      </ul>
    </div>

    <div v-if="modal.abierto" class="modal-backdrop" @click.self="cerrarModal">
      <div class="modal">
        <div class="modal-head">
          <h3 class="modal-title">{{ modal.titulo }}</h3>
          <button class="modal-x" @click="cerrarModal">×</button>
        </div>

        <div class="modal-body">
          <div v-if="modal.tipo === 'ayuda'" class="ayuda-modal">
            <p><b>Cómo usar la vista</b></p>

            <ul class="help-list">
              <li>Doble click en el lienzo para crear un nodo.</li>
              <li>
                Haz click en un nodo y luego en otro para crear una arista.
              </li>
              <li>Doble click en un nodo: editar nombre.</li>
              <li>Doble click en una arista: editar peso.</li>
              <li>
                También puedes seleccionar nodo/arista y usar el panel lateral.
              </li>
            </ul>

            <p><b>Qué hace el sistema</b></p>

            <ul class="help-list">
              <li>Genera nodos y su respectiva solución automáticamente.</li>
              <li><b>Minimizar</b> → menor valor.</li>
              <li><b>Maximizar</b> → mayor valor.</li>
            </ul>

            <p><b>Extras</b></p>

            <ul class="help-list">
              <li>Exportar / Importar el grafo en JSON.</li>
              <li>Puedes editar y eliminar nodos y aristas.</li>
            </ul>
          </div>

          <div v-else>
            <label class="modal-label">{{ modal.label }}</label>

            <input
              class="modal-input"
              v-model="modal.valor"
              :placeholder="modal.placeholder"
              @keydown.enter.prevent="confirmarModal"
            />

            <p class="modal-hint">{{ modal.hint }}</p>
            <p v-if="modal.error" class="modal-error">{{ modal.error }}</p>
          </div>
        </div>

        <div class="modal-actions">
          <button class="btn-sec" @click="cerrarModal">
            {{ modal.tipo === "ayuda" ? "Cerrar" : "Cancelar" }}
          </button>

          <button
            v-if="modal.tipo !== 'ayuda'"
            class="btn"
            @click="confirmarModal"
          >
            Guardar
          </button>
        </div>
      </div>
    </div>
  </section>
</template>

<script>
import { Network } from "vis-network/standalone";
import { DataSet } from "vis-data/standalone";

export default {
  name: "JohnsonVista",

  data() {
    return {
      resultado: [],
      holguras: [],
      network: null,
      nodesData: null,
      edgesData: null,
      modo: "max",

      contadorNodos: 0,
      contadorAristas: 0,

      origenId: null,

      seleccionado: null,

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
    };
  },

  computed: {
    nodoSeleccionado() {
      if (!this.seleccionado || this.seleccionado.tipo !== "nodo") return null;
      const nodo = this.nodesData?.get(this.seleccionado.id);
      if (!nodo) return null;

      const labelBase = String(nodo.label || "").split("\n")[0];

      return {
        ...nodo,
        labelBase,
      };
    },

    aristaSeleccionada() {
      if (!this.seleccionado || this.seleccionado.tipo !== "arista") {
        return null;
      }

      const arista = this.edgesData?.get(this.seleccionado.id);
      if (!arista) return null;

      const fromNode = this.nodesData?.get(arista.from);
      const toNode = this.nodesData?.get(arista.to);

      return {
        ...arista,
        fromLabel: fromNode
          ? String(fromNode.label).split("\n")[0]
          : arista.from,
        toLabel: toNode ? String(toNode.label).split("\n")[0] : arista.to,
      };
    },
  },

  mounted() {
    this.nodesData = new DataSet([]);
    this.edgesData = new DataSet([]);

    this.network = new Network(
      this.$refs.networkEl,
      { nodes: this.nodesData, edges: this.edgesData },
      {
        physics: false,
        interaction: {
          dragNodes: true,
          dragView: false,
          zoomView: false,
        },

        nodes: {
          shape: "box",
          margin: 16,
          borderWidth: 1.5,
          color: {
            background: "#1e293b",
            border: "#475569",
          },
          font: {
            color: "#e2e8f0",
            size: 16,
            align: "center",
            multi: true,
          },
          shadow: {
            enabled: true,
            color: "rgba(0,0,0,0.6)",
            size: 15,
            x: 0,
            y: 6,
          },
        },

        edges: {
          arrows: {
            to: {
              enabled: true,
              scaleFactor: 0.7,
            },
          },
          width: 2,
          color: {
            color: "#334155",
            highlight: "#f97316",
            hover: "#f97316",
            inherit: false,
          },
          smooth: {
            enabled: true,
            type: "cubicBezier",
            roundness: 0.45,
          },
          shadow: {
            enabled: true,
            color: "rgba(0,0,0,0.5)",
            size: 6,
          },
        },
      },
    );

    this.network.on("doubleClick", (params) => {
      if (params.nodes.length) {
        this.abrirModalEditarNodo(params.nodes[0]);
        return;
      }

      if (params.edges.length) {
        this.abrirModalEditarArista(params.edges[0]);
        return;
      }

      if (!params.pointer) return;

      this.abrirModalCrearNodo(
        params.pointer.canvas.x,
        params.pointer.canvas.y,
      );
    });

    this.network.on("click", (params) => {
      if (params.nodes.length) {
        const nodeId = params.nodes[0];
        this.seleccionado = { tipo: "nodo", id: nodeId };
        this.clickNodo(nodeId);
        return;
      }

      if (params.edges.length) {
        const edgeId = params.edges[0];
        this.seleccionado = { tipo: "arista", id: edgeId };
        this.origenId = null;
        return;
      }

      this.seleccionado = null;
    });
  },

  methods: {
    abrirModalCrearNodo(x, y) {
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

    abrirModalEditarNodo(nodeId) {
      const nodo = this.nodesData.get(nodeId);
      if (!nodo) return;

      this.modal = {
        abierto: true,
        tipo: "editarNodo",
        titulo: "Editar nodo",
        label: "Nuevo nombre del nodo",
        placeholder: "Ej: A, B, Casa, Nodo1",
        hint: "Reglas: 1–12 caracteres, sin duplicados.",
        valor: String(nodo.label || "").split("\n")[0],
        error: "",
        payload: { id: nodeId },
      };
    },

    abrirModalCrearAristaPeso(from, to) {
      this.modal = {
        abierto: true,
        tipo: "crearArista",
        titulo: "Crear arista",
        label: `Peso (${from} → ${to})`,
        placeholder: "Ej: 1, 2.5, -3",
        hint: "Acepta entero o decimal.",
        valor: "1",
        error: "",
        payload: { from, to },
      };
    },

    abrirModalEditarArista(edgeId) {
      const edge = this.edgesData.get(edgeId);
      if (!edge) return;

      const fromLabel =
        this.nodesData.get(edge.from)?.label?.split("\n")[0] || edge.from;
      const toLabel =
        this.nodesData.get(edge.to)?.label?.split("\n")[0] || edge.to;

      this.modal = {
        abierto: true,
        tipo: "editarArista",
        titulo: "Editar arista",
        label: `Peso (${fromLabel} → ${toLabel})`,
        placeholder: "Ej: 1, 2.5, -3",
        hint: "Acepta entero o decimal.",
        valor: String(edge.label || ""),
        error: "",
        payload: { id: edgeId },
      };
    },

    abrirModalEditarNodoSeleccionado() {
      if (!this.nodoSeleccionado) return;
      this.abrirModalEditarNodo(this.nodoSeleccionado.id);
    },

    abrirModalEditarAristaSeleccionada() {
      if (!this.aristaSeleccionada) return;
      this.abrirModalEditarArista(this.aristaSeleccionada.id);
    },

    triggerImport() {
      const el = this.$refs.fileInput;
      if (!el) {
        alert("No se encontró el input file.");
        return;
      }
      el.value = "";
      el.click();
    },

    exportarJSON() {
      try {
        let nombre = prompt("Nombre del archivo:", "johnson_grafo");
        if (nombre === null) return;

        nombre = nombre.trim() || "johnson_grafo";

        const payload = {
          version: 1,
          exportedAt: new Date().toISOString(),
          state: {
            contadorNodos: this.contadorNodos,
            contadorAristas: this.contadorAristas,
            nodes: this.nodesData.get(),
            edges: this.edgesData.get(),
          },
        };

        const jsonStr = JSON.stringify(payload, null, 2);
        const blob = new Blob([jsonStr], { type: "application/json" });
        const url = URL.createObjectURL(blob);

        const a = document.createElement("a");
        a.href = url;
        a.download = `${nombre}.json`;
        a.click();

        URL.revokeObjectURL(url);
      } catch (e) {
        console.error(e);
        alert("Error al exportar JSON");
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
          alert("JSON inválido");
          return;
        }

        this.nodesData.clear();
        this.edgesData.clear();
        this.resultado = [];
        this.holguras = [];
        this.seleccionado = null;
        this.origenId = null;

        this.nodesData.add(
          state.nodes.map((n) => ({
            ...n,
            id: Number(n.id),
          })),
        );

        this.edgesData.add(
          state.edges.map((e) => ({
            ...e,
            id: Number(e.id),
            from: Number(e.from),
            to: Number(e.to),
            arrows: {
              to: { enabled: true, scaleFactor: 0.7 },
            },
          })),
        );

        const maxNode = state.nodes.length
          ? Math.max(...state.nodes.map((n) => Number(n.id)))
          : 0;

        const maxEdge = state.edges.length
          ? Math.max(...state.edges.map((e) => Number(e.id)))
          : 0;

        this.contadorNodos = Math.max(state.contadorNodos || 0, maxNode);
        this.contadorAristas = Math.max(state.contadorAristas || 0, maxEdge);

        this.network.fit({ animation: { duration: 300 } });
      } catch (e) {
        console.error(e);
        alert("Error al importar JSON");
      } finally {
        if (evt?.target) evt.target.value = "";
      }
    },

    abrirAyuda() {
      this.modal = {
        abierto: true,
        tipo: "ayuda",
        titulo: "Ayuda Johnson",
        label: "",
        placeholder: "",
        hint: "",
        valor: "",
        error: "",
        payload: null,
      };
    },

    cerrarModal() {
      this.modal.abierto = false;
      this.modal.error = "";
    },

    clickNodo(destinoId) {
      if (this.origenId === null) {
        this.origenId = destinoId;
        return;
      }

      const from = this.origenId;
      const to = destinoId;

      this.origenId = null;

      if (from === to) {
        alert("No se puede crear una arista hacia el mismo nodo.");
        return;
      }

      const pregunta = `¿La arista será dirigida? (SI/NO)`;
      let resp = window.prompt(pregunta, "SI");

      if (resp == null) return;

      resp = String(resp).trim().toUpperCase();

      const esSi = resp === "SI" || resp === "S";
      const esNo = resp === "NO" || resp === "N";

      if (!esSi && !esNo) {
        alert("Respuesta inválida");
        return;
      }

      this.abrirModalCrearAristaPeso(from, to);
    },

    confirmarModal() {
      if (this.modal.tipo === "crearNodo") {
        const nombre = this.modal.valor.trim();
        if (!nombre) return;

        const duplicado = this.nodesData
          .get()
          .some(
            (n) =>
              String(n.label).split("\n")[0].toLowerCase() ===
              nombre.toLowerCase(),
          );

        if (duplicado) {
          this.modal.error = "Ya existe un nodo con ese nombre.";
          return;
        }

        this.contadorNodos++;

        this.nodesData.add({
          id: this.contadorNodos,
          label: nombre,
          x: this.modal.payload.x,
          y: this.modal.payload.y,
        });

        this.cerrarModal();
      }

      if (this.modal.tipo === "editarNodo") {
        const nombre = this.modal.valor.trim();
        if (!nombre) return;

        const duplicado = this.nodesData
          .get()
          .some(
            (n) =>
              n.id !== this.modal.payload.id &&
              String(n.label).split("\n")[0].toLowerCase() ===
                nombre.toLowerCase(),
          );

        if (duplicado) {
          this.modal.error = "Ya existe un nodo con ese nombre.";
          return;
        }

        const nodo = this.nodesData.get(this.modal.payload.id);
        if (!nodo) return;

        const partes = String(nodo.label).split("\n");
        partes[0] = nombre;

        this.nodesData.update({
          id: nodo.id,
          label: partes.join("\n"),
        });

        this.cerrarModal();
      }

      if (this.modal.tipo === "crearArista") {
        const peso = this.modal.valor;
        if (!peso) return;

        this.contadorAristas++;

        this.edgesData.add({
          id: this.contadorAristas,
          from: this.modal.payload.from,
          to: this.modal.payload.to,
          label: String(peso),
          arrows: {
            to: {
              enabled: true,
              scaleFactor: 0.7,
            },
          },
        });

        this.cerrarModal();
      }

      if (this.modal.tipo === "editarArista") {
        const peso = this.modal.valor;
        if (peso === "" || peso === null) return;

        this.edgesData.update({
          id: this.modal.payload.id,
          label: String(peso),
        });

        this.cerrarModal();
      }
    },

    eliminarNodoSeleccionado() {
      if (!this.nodoSeleccionado) return;

      const ok = window.confirm(
        `¿Eliminar el nodo "${this.nodoSeleccionado.labelBase}" y sus aristas conectadas?`,
      );
      if (!ok) return;

      const id = this.nodoSeleccionado.id;

      const relacionadas = this.edgesData
        .get()
        .filter((e) => e.from === id || e.to === id);

      if (relacionadas.length) {
        this.edgesData.remove(relacionadas.map((e) => e.id));
      }

      if (this.origenId === id) {
        this.origenId = null;
      }

      this.nodesData.remove(id);
      this.seleccionado = null;
    },

    eliminarAristaSeleccionada() {
      if (!this.aristaSeleccionada) return;

      const ok = window.confirm(
        `¿Eliminar la arista "${this.aristaSeleccionada.fromLabel} → ${this.aristaSeleccionada.toLabel}"?`,
      );
      if (!ok) return;

      this.edgesData.remove(this.aristaSeleccionada.id);
      this.seleccionado = null;
    },

    resolverJohnson() {
      const nodos = this.nodesData.get();
      const aristas = this.edgesData.get();

      if (!nodos.length) return;

      const adj = {};
      nodos.forEach((n) => (adj[n.id] = []));

      aristas.forEach((e) => {
        adj[e.from].push({
          to: e.to,
          peso: Number(e.label || 0),
        });
      });

      const inDegree = {};
      nodos.forEach((n) => (inDegree[n.id] = 0));
      aristas.forEach((e) => inDegree[e.to]++);

      const inDegreeOriginal = { ...inDegree };

      const cola = [];
      nodos.forEach((n) => {
        if (inDegree[n.id] === 0) cola.push(n.id);
      });

      const orden = [];

      while (cola.length) {
        const actual = cola.shift();
        orden.push(actual);

        adj[actual].forEach((ar) => {
          inDegree[ar.to]--;
          if (inDegree[ar.to] === 0) cola.push(ar.to);
        });
      }

      const dist = {};
      const prev = {};

      nodos.forEach((n) => {
        dist[n.id] = this.modo === "max" ? -Infinity : Infinity;
        prev[n.id] = null;
      });

      orden.forEach((id) => {
        if (inDegreeOriginal[id] === 0) {
          dist[id] = 0;
        } else {
          dist[id] = this.modo === "max" ? -Infinity : Infinity;
        }
      });

      orden.forEach((id) => {
        adj[id].forEach((ar) => {
          if (dist[id] === Infinity || dist[id] === -Infinity) return;

          const nuevo = dist[id] + ar.peso;

          if (this.modo === "max") {
            if (nuevo > dist[ar.to]) {
              dist[ar.to] = nuevo;
              prev[ar.to] = id;
            }
          } else {
            if (nuevo < dist[ar.to]) {
              dist[ar.to] = nuevo;
              prev[ar.to] = id;
            }
          }
        });
      });

      let extremo = null;

      nodos.forEach((n) => {
        if (adj[n.id].length === 0) {
          if (
            extremo === null ||
            (this.modo === "max"
              ? dist[n.id] > dist[extremo]
              : dist[n.id] < dist[extremo])
          ) {
            extremo = n.id;
          }
        }
      });

      if (extremo === null) return;

      const camino = [];
      let actual = extremo;

      while (actual !== null) {
        const nodo = nodos.find((n) => n.id === actual);
        camino.unshift(nodo.label.split("\n")[0]);
        actual = prev[actual];
      }

      this.resultado = camino;

      const LT_real = {};

      nodos.forEach((n) => {
        if (n.id === extremo) {
          LT_real[n.id] = dist[extremo];
        } else {
          LT_real[n.id] = Infinity;
        }
      });

      [...orden].reverse().forEach((id) => {
        adj[id].forEach((ar) => {
          LT_real[id] = LT_real[ar.to] - ar.peso;
        });
      });

      const LT = {};

      nodos.forEach((n) => {
        if (n.id === extremo) {
          LT[n.id] = dist[extremo];
        } else {
          LT[n.id] = Infinity;
        }
      });

      [...orden].reverse().forEach((id) => {
        adj[id].forEach((ar) => {
          const nodoFrom = nodos.find((n) => n.id === id);
          const nodoTo = nodos.find((n) => n.id === ar.to);

          const fromLabel = nodoFrom.label.split("\n")[0];
          const toLabel = nodoTo.label.split("\n")[0];

          const enCamino =
            this.resultado.includes(fromLabel) &&
            this.resultado.includes(toLabel) &&
            this.resultado.indexOf(toLabel) ===
              this.resultado.indexOf(fromLabel) + 1;

          if (enCamino) {
            LT[id] = LT[ar.to] - ar.peso;
          }
        });
      });

      this.holguras = [];

      aristas.forEach((e) => {
        const peso = Number(e.label || 0);

        const h = LT[e.to] - dist[e.from] - peso;

        this.holguras.push({
          id: e.id,
          label: `${this.nodesData.get(e.from).label.split("\n")[0]} → ${
            this.nodesData.get(e.to).label.split("\n")[0]
          }`,
          from: e.from,
          to: e.to,
          holgura: h,
        });
      });

      nodos.forEach((n) => {
        const nombre = n.label.split("\n")[0];
        const esCritico = this.resultado.includes(nombre);

        let ltMostrar;
        let hNodo;

        if (esCritico) {
          ltMostrar = LT[n.id];
          hNodo = LT[n.id] - dist[n.id];
        } else {
          ltMostrar = LT_real[n.id];
          hNodo = LT_real[n.id] - dist[n.id];
        }

        this.nodesData.update({
          id: n.id,
          label: `${nombre}\n${dist[n.id]} | ${ltMostrar}\nH: ${hNodo}`,
          font: { align: "center" },
        });
      });

      this.animarCamino();
    },

    limpiarGrafo() {
      this.nodesData.clear();
      this.edgesData.clear();
      this.resultado = [];
      this.holguras = [];
      this.contadorNodos = 0;
      this.contadorAristas = 0;
      this.seleccionado = null;
      this.origenId = null;
    },

    async animarCamino() {
      const camino = this.resultado;

      const COLOR_BASE = "#334155";
      const COLOR_ACTIVO = "#f97316";
      const COLOR_GLOW = "#fb923c";

      const edgesActivas = new Set();

      this.nodesData.forEach((n) => {
        this.nodesData.update({
          id: n.id,
          color: {
            background: "#1e293b",
            border: "#475569",
          },
          shadow: false,
        });
      });

      this.edgesData.forEach((e) => {
        this.edgesData.update({
          id: e.id,
          color: {
            color: COLOR_BASE,
            inherit: false,
          },
          width: 2,
          dashes: false,
          shadow: false,
        });
      });

      this.network.redraw();

      for (let i = 0; i < camino.length; i++) {
        const actual = camino[i];

        const nodo = this.nodesData
          .get()
          .find((n) => n.label.startsWith(actual));

        if (nodo) {
          this.nodesData.update({
            id: nodo.id,
            color: {
              background: "#7c2d12",
              border: COLOR_ACTIVO,
            },
            shadow: {
              enabled: true,
              color: COLOR_GLOW,
              size: 40,
            },
          });
        }

        if (i < camino.length - 1) {
          const siguiente = camino[i + 1];

          const arista = this.edgesData
            .get()
            .find(
              (e) =>
                this.nodesData.get(e.from).label.startsWith(actual) &&
                this.nodesData.get(e.to).label.startsWith(siguiente),
            );

          if (arista) {
            edgesActivas.add(arista.id);

            let frame = 0;

            const anim = setInterval(() => {
              frame++;

              edgesActivas.forEach((id) => {
                this.edgesData.update({
                  id,
                  color: {
                    color: COLOR_ACTIVO,
                    inherit: false,
                  },
                  width: 5 + Math.sin(frame * 0.4) * 2,
                  dashes: [4, 12],
                  shadow: {
                    enabled: true,
                    color: COLOR_GLOW,
                    size: 20 + Math.sin(frame * 0.4) * 5,
                  },
                });
              });

              this.network.redraw();

              if (frame > 30) clearInterval(anim);
            }, 40);
          }
        }

        await new Promise((res) => setTimeout(res, 700));
      }

      edgesActivas.forEach((id) => {
        this.edgesData.update({
          id,
          dashes: false,
          width: 6,
          shadow: {
            enabled: true,
            color: COLOR_GLOW,
            size: 15,
          },
        });
      });

      this.network.redraw();
    },
  },
};
</script>

<style src="@/estilos/johnsonVista.css"></style>
<style scoped src="@/estilos/grafoVista.css"></style>
