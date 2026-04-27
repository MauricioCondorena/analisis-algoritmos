<template>
  <section class="asignacion">
    <div class="cabecera">
      <h2 class="titulo">Asignación</h2>
      <p class="subtitulo">
        Esta vista construye una matriz de asignación <b>origen → destino</b> a
        partir del grafo y aplica el proceso paso a paso para resolver por
        minimización o maximización.
      </p>
    </div>

    <div class="acciones">
      <button class="btn btn-sec" @click="$emit('volver')">Volver</button>

      <select v-model="modo" class="select">
        <option value="min">Minimizar</option>
        <option value="max">Maximizar</option>
      </select>

      <button class="btn btn-sec" @click="limpiarGrafo">Limpiar</button>
      <button class="btn btn-sec" @click="exportarJSON">Exportar JSON</button>
      <button class="btn btn-sec" @click="abrirImportacion">
        Importar JSON
      </button>
      <button class="btn btn-sec btn-icono" @click="abrirAyuda" title="Ayuda">
        ?
      </button>
      <button class="btn" @click="copiarResumen">Copiar resumen</button>

      <input
        ref="inputImportar"
        type="file"
        accept="application/json,.json"
        style="display: none"
        @change="importarJSON"
      />
    </div>

    <div class="card configuracion-card">
      <div class="paso-header">
        <span class="badge badge-dark">Editor gráfico</span>
        <h3>Área de construcción del grafo</h3>
      </div>

      <p class="ayuda ayuda-top">
        Doble click en el lienzo para crear un nodo. Luego selecciona un nodo
        <b>ORIGEN</b> y después un nodo <b>DESTINO</b> para crear o editar una
        conexión. También puedes hacer doble click sobre un nodo o una arista
        para editar directamente.
      </p>

      <div class="config-grid config-grid-top">
        <div class="config-item">
          <span class="config-label">Nodos totales</span>
          <span class="config-value">{{ nodosOrdenados.length }}</span>
        </div>

        <div class="config-item">
          <span class="config-label">Conexiones</span>
          <span class="config-value">{{ edgesLista.length }}</span>
        </div>

        <div class="config-item">
          <span class="config-label">Orígenes</span>
          <span class="config-value">{{ filasBase.length }}</span>
        </div>

        <div class="config-item">
          <span class="config-label">Destinos</span>
          <span class="config-value">{{ columnasBase.length }}</span>
        </div>
      </div>
    </div>

    <div class="editor-layout">
      <div class="editor-main">
        <div class="lienzo" ref="networkAsignacion"></div>

        <div
          v-if="filasBase.length === 0 || columnasBase.length === 0"
          class="vacio"
        >
          No se pudo construir una matriz de asignación válida. Asegúrate de
          crear nodos <b>ORIGEN</b>, nodos <b>DESTINO</b> y conexiones válidas
          de <b>ORIGEN → DESTINO</b>.
        </div>
      </div>

      <aside class="editor-side">
        <div
          class="card panel-card"
          :class="{
            'panel-card-node': !!nodoSeleccionado,
            'panel-card-edge': !!aristaSeleccionada,
            'panel-card-empty': !nodoSeleccionado && !aristaSeleccionada,
          }"
        >
          <div class="paso-header">
            <span
              class="badge"
              :class="{
                'badge-node': !!nodoSeleccionado,
                'badge-edge': !!aristaSeleccionada,
                'badge-blue': !nodoSeleccionado && !aristaSeleccionada,
              }"
            >
              {{
                nodoSeleccionado
                  ? "Nodo seleccionado"
                  : aristaSeleccionada
                  ? "Arista seleccionada"
                  : "Editor"
              }}
            </span>
            <h3>
              {{
                nodoSeleccionado
                  ? "Edición de nodo"
                  : aristaSeleccionada
                  ? "Edición de arista"
                  : "Acciones"
              }}
            </h3>
          </div>

          <div v-if="nodoSeleccionado" class="editor-panel">
            <div class="editor-kv">
              <span>Nodo</span>
              <strong>{{ nodoSeleccionado.label }}</strong>
            </div>

            <div class="editor-kv">
              <span>Tipo</span>
              <strong>{{ nodoSeleccionado.tipo?.toUpperCase() }}</strong>
            </div>

            <div class="editor-kv">
              <span>Salientes</span>
              <strong>{{ estadisticasNodo.salientes }}</strong>
            </div>

            <div class="editor-kv">
              <span>Entrantes</span>
              <strong>{{ estadisticasNodo.entrantes }}</strong>
            </div>

            <div class="editor-actions">
              <button class="btn" @click="abrirModalEditarNodoSeleccionado">
                Renombrar nodo
              </button>
              <button class="btn btn-danger" @click="eliminarNodoSeleccionado">
                Eliminar nodo
              </button>
            </div>

            <p class="ayuda ayuda-panel">
              Al eliminar el nodo también se eliminan sus aristas conectadas.
            </p>
          </div>

          <div v-else-if="aristaSeleccionada" class="editor-panel">
            <div class="editor-kv">
              <span>Arista</span>
              <strong>
                {{ aristaSeleccionada.desdeLabel }} →
                {{ aristaSeleccionada.hastaLabel }}
              </strong>
            </div>

            <div class="editor-kv">
              <span>Peso</span>
              <strong>{{ aristaSeleccionada.label }}</strong>
            </div>

            <div class="editor-actions">
              <button class="btn" @click="abrirModalEditarAristaSeleccionada">
                Editar peso
              </button>
              <button
                class="btn btn-danger"
                @click="eliminarAristaSeleccionada"
              >
                Eliminar arista
              </button>
            </div>
          </div>

          <div v-else class="editor-empty">
            <p>
              Selecciona un <b>nodo</b> o una <b>arista</b> para editar o
              eliminar.
            </p>
            <p>
              Usa el botón <b>?</b> para ver la guía completa, qué hace el
              sistema y los extras disponibles.
            </p>
          </div>
        </div>
      </aside>
    </div>

    <div v-if="filasBase.length > 0 && columnasBase.length > 0" class="pasos">
      <div class="card configuracion-card">
        <div class="paso-header">
          <span class="badge badge-dark">Configuración</span>
          <h3>Datos de ejecución</h3>
        </div>

        <div class="config-grid">
          <div class="config-item">
            <span class="config-label">Modo</span>
            <span class="config-value">
              {{ modo === "min" ? "Minimización" : "Maximización" }}
            </span>
          </div>

          <div class="config-item">
            <span class="config-label">Orígenes</span>
            <span class="config-value">{{ filasBase.length }}</span>
          </div>

          <div class="config-item">
            <span class="config-label">Destinos</span>
            <span class="config-value">{{ columnasBase.length }}</span>
          </div>

          <div class="config-item">
            <span class="config-label">Matriz de trabajo</span>
            <span class="config-value">
              {{ tamanoTrabajo }} x {{ tamanoTrabajo }}
            </span>
          </div>
        </div>

        <p v-if="usaDummy" class="ayuda">
          Se añadieron filas o columnas dummy para convertir la matriz a
          cuadrada y poder aplicar el método de asignación.
        </p>
      </div>

      <div class="card paso">
        <div class="paso-header">
          <span class="badge">Paso 1</span>
          <h3>Matriz original A (origen → destino)</h3>
        </div>

        <div class="tabla-wrap">
          <table class="tabla">
            <thead>
              <tr>
                <th></th>
                <th v-for="n in columnasBase" :key="'base-col-' + n.id">
                  {{ n.label }}
                </th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(fila, i) in matrizBase" :key="'base-row-' + i">
                <th>{{ filasBase[i].label }}</th>
                <td v-for="(valor, j) in fila" :key="'base-' + i + '-' + j">
                  {{ formatear(valor) }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div class="card paso" v-if="usaDummy">
        <div class="paso-header">
          <span class="badge badge-blue">Paso 1.1</span>
          <h3>Matriz de trabajo cuadrada</h3>
        </div>

        <div class="tabla-wrap">
          <table class="tabla">
            <thead>
              <tr>
                <th></th>
                <th v-for="col in columnasTrabajo" :key="'work-col-' + col.key">
                  {{ col.label }}
                </th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(fila, i) in matrizTrabajo" :key="'work-row-' + i">
                <th>{{ filasTrabajo[i].label }}</th>
                <td v-for="(valor, j) in fila" :key="'work-' + i + '-' + j">
                  {{ formatear(valor) }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <p class="ayuda">
          Esta es la matriz visual de trabajo. Las celdas sin conexión real se
          muestran como <b>—</b>.
        </p>
      </div>

      <div class="card paso">
        <div class="paso-header">
          <span class="badge">Paso 2</span>
          <h3>Vector alfa (por columnas)</h3>
        </div>

        <div class="vector">
          <span v-for="(valor, i) in resultado.alfa" :key="'alfa-' + i">
            {{ columnasTrabajo[i].label }}:
            <b>{{ formatear(valor) }}</b>
          </span>
        </div>
      </div>

      <div class="card paso">
        <div class="paso-header">
          <span class="badge">Paso 3</span>
          <h3>Matriz A - alfa</h3>
        </div>

        <div class="tabla-wrap">
          <table class="tabla">
            <thead>
              <tr>
                <th></th>
                <th v-for="col in columnasTrabajo" :key="'da-col-' + col.key">
                  {{ col.label }}
                </th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="(fila, i) in resultado.despuesAlfa"
                :key="'da-row-' + i"
              >
                <th>{{ filasTrabajo[i].label }}</th>
                <td v-for="(valor, j) in fila" :key="'da-' + i + '-' + j">
                  {{ formatear(valor) }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div class="card paso">
        <div class="paso-header">
          <span class="badge">Paso 4</span>
          <h3>Vector beta (por filas)</h3>
        </div>

        <div class="vector">
          <span v-for="(valor, i) in resultado.beta" :key="'beta-' + i">
            {{ filasTrabajo[i].label }}:
            <b>{{ formatear(valor) }}</b>
          </span>
        </div>
      </div>

      <div class="card paso">
        <div class="paso-header">
          <span class="badge">Paso 5</span>
          <h3>Matriz (A - alfa) - beta</h3>
        </div>

        <div class="tabla-wrap">
          <table class="tabla">
            <thead>
              <tr>
                <th></th>
                <th v-for="col in columnasTrabajo" :key="'r-col-' + col.key">
                  {{ col.label }}
                </th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="(fila, i) in resultado.reducidaInicial"
                :key="'r-row-' + i"
              >
                <th>{{ filasTrabajo[i].label }}</th>
                <td v-for="(valor, j) in fila" :key="'r-' + i + '-' + j">
                  {{ formatear(valor) }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div class="card paso resultado-card">
        <div class="paso-header">
          <span class="badge badge-green">Paso 6</span>
          <h3>Asignación de ceros</h3>
        </div>

        <div class="tabla-wrap">
          <table class="tabla">
            <thead>
              <tr>
                <th></th>
                <th v-for="col in columnasTrabajo" :key="'f-col-' + col.key">
                  {{ col.label }}
                </th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="(fila, i) in resultado.matrizFinal"
                :key="'f-row-' + i"
              >
                <th>{{ filasTrabajo[i].label }}</th>
                <td
                  v-for="(valor, j) in fila"
                  :key="'f-' + i + '-' + j"
                  :class="claseCeldaFinal(i, j, valor)"
                >
                  {{ formatear(valor) }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="estado-grid">
          <div class="estado-box">
            <span class="estado-label">Asignaciones reales</span>
            <span class="estado-value">
              {{ resultado.asignacionReales.cantidad }} /
              {{ asignacionesObjetivo }}
            </span>
          </div>

          <div class="estado-box">
            <span class="estado-label">Asignación completa</span>
            <span class="estado-value">
              {{ resultado.asignacionReales.completa ? "Sí" : "No" }}
            </span>
          </div>

          <div class="estado-box">
            <span class="estado-label">Iteraciones</span>
            <span class="estado-value">
              {{ resultado.iteraciones.length }}
            </span>
          </div>
        </div>
      </div>

      <div class="card paso resultado-original">
        <div class="paso-header">
          <span class="badge badge-blue">Paso 7</span>
          <h3>Matriz original con asignaciones</h3>
        </div>

        <div class="tabla-wrap">
          <table class="tabla">
            <thead>
              <tr>
                <th></th>
                <th v-for="n in columnasBase" :key="'orig-col-' + n.id">
                  {{ n.label }}
                </th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(fila, i) in matrizBase" :key="'orig-row-' + i">
                <th>{{ filasBase[i].label }}</th>
                <td
                  v-for="(valor, j) in fila"
                  :key="'orig-' + i + '-' + j"
                  :class="claseCeldaOriginalAsignada(i, j)"
                >
                  {{ formatear(valor) }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <p class="ayuda">
          Aquí se resaltan solo las asignaciones reales origen → destino.
        </p>
      </div>

      <div class="card paso resultado-final">
        <div class="paso-header">
          <span class="badge badge-gold">Paso 8</span>
          <h3>Resultado final</h3>
        </div>

        <div
          v-if="resultado.asignacionReales.pares.length === 0"
          class="vacio-mini"
        >
          No se encontró una asignación válida todavía.
        </div>

        <div v-else class="lista-asignacion">
          <p
            v-for="(par, idx) in resultado.asignacionReales.pares"
            :key="'par-' + idx"
          >
            <b>{{ filasBase[par.fila].label }}</b>
            →
            <b>{{ columnasBase[par.columna].label }}</b>
            | Valor original:
            <b>{{ formatear(matrizBase[par.fila][par.columna]) }}</b>
          </p>
        </div>

        <p class="total">
          <b>Total original asignado:</b>
          {{ formatear(resultado.asignacionReales.totalOriginal) }}
        </p>
      </div>
    </div>

    <teleport to="body">
      <div
        v-if="modal.abierto"
        class="modal-backdrop"
        @click.self="cerrarModal"
      >
        <div class="modal-card" role="dialog" aria-modal="true">
          <div class="modal-head">
            <h3 class="modal-title">{{ modal.titulo }}</h3>
            <button class="modal-close" @click="cerrarModal">×</button>
          </div>

          <div
            v-if="modal.tipo === 'crearNodo' || modal.tipo === 'editarNodo'"
            class="modal-body"
          >
            <label class="modal-label">Nombre del nodo</label>
            <input
              ref="inputNombreNodo"
              v-model="modal.nombre"
              class="modal-input"
              type="text"
              placeholder="Ej: A, B, 1, 2"
              maxlength="12"
              @keydown.enter.prevent="confirmarGuardarNodo"
            />

            <template v-if="modal.tipo === 'crearNodo'">
              <label class="modal-label">Tipo de nodo</label>
              <div class="tipo-grid">
                <button
                  type="button"
                  class="tipo-btn"
                  :class="{ activo: modal.tipoNodo === 'origen' }"
                  @click="modal.tipoNodo = 'origen'"
                >
                  ORIGEN
                </button>

                <button
                  type="button"
                  class="tipo-btn"
                  :class="{ activo: modal.tipoNodo === 'destino' }"
                  @click="modal.tipoNodo = 'destino'"
                >
                  DESTINO
                </button>
              </div>

              <p class="modal-help">
                Los nodos origen se usarán como filas y los nodos destino como
                columnas.
              </p>
            </template>

            <p v-else class="modal-help">
              El nombre debe ser único dentro del grafo.
            </p>
          </div>

          <div
            v-else-if="
              modal.tipo === 'crearArista' || modal.tipo === 'editarArista'
            "
            class="modal-body"
          >
            <label class="modal-label">
              Peso de la arista
              <b>{{ modal.desdeLabel }}</b> → <b>{{ modal.hastaLabel }}</b>
            </label>

            <input
              ref="inputPesoArista"
              v-model="modal.peso"
              class="modal-input"
              type="number"
              step="any"
              placeholder="Ej: 1, 2, 5"
              @keydown.enter.prevent="confirmarGuardarArista"
            />

            <p class="modal-help">Ingresa el costo o valor de esa conexión.</p>
          </div>

          <div v-else-if="modal.tipo === 'ayuda'" class="modal-body">
            <div class="ayuda-modal">
              <p><b>Guía</b> &nbsp; <b>Cómo usarlo</b></p>

              <ul class="help-list">
                <li>Doble click en el lienzo para crear nodos.</li>
                <li>Elige el tipo de nodo: <b>ORIGEN</b> o <b>DESTINO</b>.</li>
                <li>
                  Haz click en un origen y luego en un destino para conectar.
                </li>
                <li>Si la conexión ya existe, puedes actualizar su peso.</li>
                <li>
                  Selecciona un nodo o una arista para editar o eliminar desde
                  el panel lateral.
                </li>
              </ul>

              <p><b>Qué hace el sistema</b></p>

              <ul class="help-list">
                <li>Genera matrices y solución automáticamente.</li>
                <li><b>Minimizar</b> → menor costo.</li>
                <li><b>Maximizar</b> → mayor valor.</li>
              </ul>

              <p><b>Extras</b></p>

              <ul class="help-list">
                <li>Exportar / Importar el grafo en JSON.</li>
                <li>Se agregan nodos <b>dummy</b> si falta balance.</li>
              </ul>
            </div>
          </div>

          <div class="modal-actions">
            <button class="btn btn-sec" @click="cerrarModal">
              {{ modal.tipo === "ayuda" ? "Cerrar" : "Cancelar" }}
            </button>

            <button
              v-if="modal.tipo === 'crearNodo' || modal.tipo === 'editarNodo'"
              class="btn"
              @click="confirmarGuardarNodo"
            >
              {{
                modal.tipo === "crearNodo" ? "Guardar nodo" : "Guardar cambios"
              }}
            </button>

            <button
              v-else-if="
                modal.tipo === 'crearArista' || modal.tipo === 'editarArista'
              "
              class="btn"
              @click="confirmarGuardarArista"
            >
              {{
                modal.tipo === "crearArista"
                  ? "Guardar conexión"
                  : "Guardar cambios"
              }}
            </button>
          </div>
        </div>
      </div>
    </teleport>

    <teleport to="body">
      <transition name="fade">
        <div v-if="toast.visible" class="toast">
          {{ toast.mensaje }}
        </div>
      </transition>
    </teleport>
  </section>
</template>

<script>
import { nextTick } from "vue";
import { Network } from "vis-network/standalone";
import { DataSet } from "vis-data/standalone";

const EPS = 1e-9;

export default {
  name: "AsignacionVista",
  emits: ["volver"],

  data() {
    return {
      modo: "min",
      maxIteraciones: 25,

      network: null,
      nodesData: null,
      edgesData: null,

      contadorNodos: 0,
      contadorAristas: 0,
      origenId: null,

      nodoSeleccionadoId: null,
      aristaSeleccionadaId: null,

      modal: {
        abierto: false,
        tipo: "",
        titulo: "",
        nombre: "",
        tipoNodo: "origen",
        peso: "",
        x: 0,
        y: 0,
        from: null,
        to: null,
        editId: null,
        desdeLabel: "",
        hastaLabel: "",
      },

      toast: {
        visible: false,
        mensaje: "",
        timeout: null,
      },
    };
  },

  computed: {
    nodosOrdenados() {
      if (!this.nodesData) return [];
      return [...this.nodesData.get()].sort((a, b) => a.id - b.id);
    },

    edgesLista() {
      if (!this.edgesData) return [];
      return this.edgesData.get();
    },

    nodoSeleccionado() {
      if (!this.nodesData || this.nodoSeleccionadoId == null) return null;
      return this.nodesData.get(this.nodoSeleccionadoId) || null;
    },

    aristaSeleccionada() {
      if (!this.edgesData || this.aristaSeleccionadaId == null) return null;
      const edge = this.edgesData.get(this.aristaSeleccionadaId);
      if (!edge) return null;

      const fromNode = this.nodesData?.get(edge.from);
      const toNode = this.nodesData?.get(edge.to);

      return {
        ...edge,
        desdeLabel: fromNode?.label ?? edge.from,
        hastaLabel: toNode?.label ?? edge.to,
      };
    },

    estadisticasNodo() {
      if (!this.nodoSeleccionado) {
        return { salientes: 0, entrantes: 0 };
      }

      const id = this.nodoSeleccionado.id;
      const salientes = this.edgesLista.filter((e) => e.from === id).length;
      const entrantes = this.edgesLista.filter((e) => e.to === id).length;

      return { salientes, entrantes };
    },

    mapaPesos() {
      const m = new Map();

      for (const e of this.edgesLista) {
        const peso = Number(e.label ?? 1);
        m.set(`${e.from}->${e.to}`, peso);
      }

      return m;
    },

    filasBase() {
      return this.nodosOrdenados.filter((n) => n.tipo === "origen");
    },

    columnasBase() {
      return this.nodosOrdenados.filter((n) => n.tipo === "destino");
    },

    mascaraConexiones() {
      return this.filasBase.map((fila) =>
        this.columnasBase.map((col) =>
          this.mapaPesos.has(`${fila.id}->${col.id}`),
        ),
      );
    },

    matrizBase() {
      return this.filasBase.map((fila) =>
        this.columnasBase.map((col) => {
          const key = `${fila.id}->${col.id}`;
          return this.mapaPesos.has(key) ? this.mapaPesos.get(key) : null;
        }),
      );
    },

    tamanoTrabajo() {
      return Math.max(this.filasBase.length, this.columnasBase.length);
    },

    asignacionesObjetivo() {
      return Math.min(this.filasBase.length, this.columnasBase.length);
    },

    usaDummy() {
      return this.filasBase.length !== this.columnasBase.length;
    },

    filasTrabajo() {
      const filas = this.filasBase.map((n) => ({
        key: `real-row-${n.id}`,
        label: n.label,
        real: true,
        refId: n.id,
      }));

      for (let i = this.filasBase.length; i < this.tamanoTrabajo; i++) {
        filas.push({
          key: `dummy-row-${i}`,
          label: `Dummy F${i - this.filasBase.length + 1}`,
          real: false,
          refId: null,
        });
      }

      return filas;
    },

    columnasTrabajo() {
      const cols = this.columnasBase.map((n) => ({
        key: `real-col-${n.id}`,
        label: n.label,
        real: true,
        refId: n.id,
      }));

      for (let i = this.columnasBase.length; i < this.tamanoTrabajo; i++) {
        cols.push({
          key: `dummy-col-${i}`,
          label: `Dummy C${i - this.columnasBase.length + 1}`,
          real: false,
          refId: null,
        });
      }

      return cols;
    },

    matrizTrabajo() {
      const n = this.tamanoTrabajo;
      const base = this.matrizBase.map((fila) => [...fila]);

      while (base.length < n) {
        base.push(Array(this.columnasBase.length).fill(null));
      }

      return base.map((fila) => {
        const nueva = [...fila];
        while (nueva.length < n) nueva.push(null);
        return nueva;
      });
    },

    matrizResolver() {
      const n = this.tamanoTrabajo;

      const valoresValidos = this.matrizBase
        .flat()
        .filter((v) => v !== null && Number.isFinite(Number(v)))
        .map(Number);

      if (!valoresValidos.length) return [];

      const maxVal = Math.max(...valoresValidos);
      const minVal = Math.min(...valoresValidos);

      const penalizacion =
        this.modo === "min"
          ? maxVal + Math.abs(maxVal) + 1000
          : minVal - Math.abs(minVal) - 1000;

      const base = this.matrizBase.map((fila) =>
        fila.map((valor) => (valor === null ? penalizacion : Number(valor))),
      );

      while (base.length < n) {
        base.push(Array(this.columnasBase.length).fill(0));
      }

      return base.map((fila) => {
        const nueva = [...fila];
        while (nueva.length < n) nueva.push(0);
        return nueva;
      });
    },

    resultado() {
      if (!this.filasBase.length || !this.columnasBase.length) {
        return this.resultadoVacio();
      }

      if (!this.matrizResolver.length) {
        return this.resultadoVacio();
      }

      return this.resolverAsignacion(this.matrizResolver, this.modo);
    },
  },

  mounted() {
    this.nodesData = new DataSet([]);
    this.edgesData = new DataSet([]);

    this.network = new Network(
      this.$refs.networkAsignacion,
      { nodes: this.nodesData, edges: this.edgesData },
      {
        physics: false,
        interaction: {
          dragNodes: true,
          dragView: false,
          zoomView: false,
          hover: true,
        },

        nodes: {
          shape: "box",
          margin: {
            top: 8,
            right: 12,
            bottom: 8,
            left: 12,
          },
          widthConstraint: { minimum: 40 },
          heightConstraint: { minimum: 40 },
          font: {
            color: "#f8fafc",
            size: 15,
            face: "Inter, Segoe UI, Arial, sans-serif",
            align: "center",
            vadjust: 1,
            bold: {
              color: "#f8fafc",
              size: 15,
              face: "Inter, Segoe UI, Arial, sans-serif",
              mod: "bold",
            },
          },
          color: {
            background: "#1e293b",
            border: "#475569",
            highlight: {
              background: "#334155",
              border: "#93c5fd",
            },
            hover: {
              background: "#334155",
              border: "#93c5fd",
            },
          },
          shadow: {
            enabled: true,
            color: "rgba(0, 0, 0, 0.45)",
            size: 12,
            x: 0,
            y: 8,
          },
          chosen: {
            node: (values) => {
              values.shadow = true;
              values.shadowColor = "rgba(245, 180, 0, 0.30)";
              values.shadowSize = 26;
              values.borderWidth = 3;
            },
          },
        },

        edges: {
          arrows: {
            to: {
              enabled: true,
              scaleFactor: 0.85,
            },
          },
          width: 2.2,
          selectionWidth: 4.2,
          hoverWidth: 3.2,
          color: {
            color: "rgba(148, 163, 184, 0.70)",
            highlight: "#f5b400",
            hover: "#ffd24d",
            inherit: false,
            opacity: 1,
          },
          font: {
            color: "#f8fafc",
            size: 24,
            strokeWidth: 4,
            strokeColor: "rgba(15, 23, 42, 0.88)",
            align: "middle",
            face: "Inter, Segoe UI, Arial, sans-serif",
            background: "rgba(15, 23, 42, 0)",
          },
          smooth: {
            enabled: true,
            type: "cubicBezier",
            roundness: 0.28,
          },
          shadow: {
            enabled: true,
            color: "rgba(0, 0, 0, 0.40)",
            size: 8,
            x: 0,
            y: 4,
          },
          chosen: {
            edge: (values) => {
              values.width = 4.2;
              values.color = "#f5b400";
              values.shadow = true;
              values.shadowColor = "rgba(245, 180, 0, 0.35)";
              values.shadowSize = 14;
            },
          },
        },
      },
    );

    this.network.on("click", (params) => {
      if (params.nodes.length) {
        this.seleccionarNodo(params.nodes[0]);
        return;
      }

      if (params.edges.length) {
        this.seleccionarArista(params.edges[0]);
        return;
      }

      this.limpiarSeleccion();
    });

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
      this.abrirModalNodo(params.pointer.canvas.x, params.pointer.canvas.y);
    });
  },

  beforeUnmount() {
    if (this.network) {
      this.network.destroy();
      this.network = null;
    }
    if (this.toast.timeout) {
      clearTimeout(this.toast.timeout);
    }
  },

  methods: {
    seleccionarNodo(nodeId) {
      this.nodoSeleccionadoId = nodeId;
      this.aristaSeleccionadaId = null;
      this.clickNodo(nodeId);
    },

    seleccionarArista(edgeId) {
      this.aristaSeleccionadaId = edgeId;
      this.nodoSeleccionadoId = null;
      this.origenId = null;
    },

    limpiarSeleccion() {
      this.nodoSeleccionadoId = null;
      this.aristaSeleccionadaId = null;
      this.origenId = null;
    },

    abrirModalNodo(x, y) {
      this.modal = {
        abierto: true,
        tipo: "crearNodo",
        titulo: "Crear nodo",
        nombre: "",
        tipoNodo: "origen",
        peso: "",
        x,
        y,
        from: null,
        to: null,
        editId: null,
        desdeLabel: "",
        hastaLabel: "",
      };

      nextTick(() => {
        this.$refs.inputNombreNodo?.focus();
        this.$refs.inputNombreNodo?.select?.();
      });
    },

    abrirModalEditarNodo(nodeId) {
      const nodo = this.nodesData.get(nodeId);
      if (!nodo) return;

      this.modal = {
        abierto: true,
        tipo: "editarNodo",
        titulo: "Renombrar nodo",
        nombre: nodo.label,
        tipoNodo: nodo.tipo,
        peso: "",
        x: Number(nodo.x) || 0,
        y: Number(nodo.y) || 0,
        from: null,
        to: null,
        editId: nodeId,
        desdeLabel: "",
        hastaLabel: "",
      };

      nextTick(() => {
        this.$refs.inputNombreNodo?.focus();
        this.$refs.inputNombreNodo?.select?.();
      });
    },

    abrirModalArista(from, to, desdeLabel, hastaLabel) {
      const existente = this.edgesLista.find(
        (e) => e.from === from && e.to === to,
      );

      this.modal = {
        abierto: true,
        tipo: existente ? "editarArista" : "crearArista",
        titulo: existente ? "Editar conexión" : "Crear conexión",
        nombre: "",
        tipoNodo: "origen",
        peso: existente ? String(existente.label ?? "") : "1",
        x: 0,
        y: 0,
        from,
        to,
        editId: existente ? existente.id : null,
        desdeLabel,
        hastaLabel,
      };

      nextTick(() => {
        this.$refs.inputPesoArista?.focus();
        this.$refs.inputPesoArista?.select?.();
      });
    },

    abrirModalEditarArista(edgeId) {
      const edge = this.edgesData.get(edgeId);
      if (!edge) return;

      const desde = this.nodesData.get(edge.from);
      const hasta = this.nodesData.get(edge.to);

      this.modal = {
        abierto: true,
        tipo: "editarArista",
        titulo: "Editar conexión",
        nombre: "",
        tipoNodo: "origen",
        peso: String(edge.label ?? ""),
        x: 0,
        y: 0,
        from: edge.from,
        to: edge.to,
        editId: edge.id,
        desdeLabel: desde?.label ?? edge.from,
        hastaLabel: hasta?.label ?? edge.to,
      };

      nextTick(() => {
        this.$refs.inputPesoArista?.focus();
        this.$refs.inputPesoArista?.select?.();
      });
    },

    abrirModalEditarNodoSeleccionado() {
      if (!this.nodoSeleccionadoId) return;
      this.abrirModalEditarNodo(this.nodoSeleccionadoId);
    },

    abrirModalEditarAristaSeleccionada() {
      if (!this.aristaSeleccionadaId) return;
      this.abrirModalEditarArista(this.aristaSeleccionadaId);
    },

    abrirAyuda() {
      this.modal = {
        abierto: true,
        tipo: "ayuda",
        titulo: "Ayuda - Asignación",
        nombre: "",
        tipoNodo: "origen",
        peso: "",
        x: 0,
        y: 0,
        from: null,
        to: null,
        editId: null,
        desdeLabel: "",
        hastaLabel: "",
      };
    },

    cerrarModal() {
      this.modal.abierto = false;
    },

    mostrarToast(mensaje) {
      if (this.toast.timeout) {
        clearTimeout(this.toast.timeout);
      }

      this.toast.visible = true;
      this.toast.mensaje = mensaje;

      this.toast.timeout = setTimeout(() => {
        this.toast.visible = false;
        this.toast.mensaje = "";
      }, 2600);
    },

    confirmarGuardarNodo() {
      const nombre = (this.modal.nombre || "").trim();

      if (!nombre) {
        this.mostrarToast("Ingresa un nombre para el nodo.");
        return;
      }

      const duplicado = this.nodosOrdenados.some(
        (n) =>
          String(n.label).toLowerCase() === nombre.toLowerCase() &&
          n.id !== this.modal.editId,
      );

      if (duplicado) {
        this.mostrarToast("Ya existe un nodo con ese nombre.");
        return;
      }

      if (this.modal.tipo === "editarNodo" && this.modal.editId != null) {
        this.nodesData.update({
          id: this.modal.editId,
          label: nombre,
        });

        this.cerrarModal();
        this.mostrarToast("Nodo actualizado correctamente.");
        return;
      }

      const tipo = this.modal.tipoNodo;
      this.contadorNodos += 1;

      this.nodesData.add({
        id: this.contadorNodos,
        label: nombre,
        tipo,
        x: this.modal.x,
        y: this.modal.y,
        fixed: false,
        color:
          tipo === "origen"
            ? {
                background: "#1d4ed8",
                border: "#60a5fa",
                highlight: {
                  background: "#2563eb",
                  border: "#bfdbfe",
                },
                hover: {
                  background: "#2563eb",
                  border: "#bfdbfe",
                },
              }
            : {
                background: "#3f6212",
                border: "#84cc16",
                highlight: {
                  background: "#4d7c0f",
                  border: "#d9f99d",
                },
                hover: {
                  background: "#4d7c0f",
                  border: "#d9f99d",
                },
              },
      });

      this.cerrarModal();
      this.mostrarToast(`Nodo ${nombre} creado como ${tipo.toUpperCase()}.`);
    },

    confirmarGuardarArista() {
      const from = this.modal.from;
      const to = this.modal.to;
      const pesoNumero = Number(this.modal.peso);

      if (!Number.isFinite(pesoNumero)) {
        this.mostrarToast("Ingresa un peso válido.");
        return;
      }

      const existente =
        this.modal.editId != null
          ? this.edgesData.get(this.modal.editId)
          : this.edgesLista.find((e) => e.from === from && e.to === to);

      if (existente) {
        this.edgesData.update({
          id: existente.id,
          from,
          to,
          label: String(pesoNumero),
          directed: true,
          arrows: {
            to: {
              enabled: true,
              scaleFactor: 0.7,
            },
          },
        });
      } else {
        this.contadorAristas += 1;

        this.edgesData.add({
          id: this.contadorAristas,
          from,
          to,
          label: String(pesoNumero),
          directed: true,
          arrows: {
            to: {
              enabled: true,
              scaleFactor: 0.85,
            },
          },
        });
      }

      this.cerrarModal();
      this.mostrarToast("Conexión guardada correctamente.");
    },

    eliminarNodoSeleccionado() {
      if (!this.nodoSeleccionado) return;

      const confirmar = window.confirm(
        `¿Eliminar el nodo "${this.nodoSeleccionado.label}" y sus aristas conectadas?`,
      );
      if (!confirmar) return;

      const id = this.nodoSeleccionado.id;
      const edgesRelacionadas = this.edgesLista
        .filter((e) => e.from === id || e.to === id)
        .map((e) => e.id);

      if (edgesRelacionadas.length) {
        this.edgesData.remove(edgesRelacionadas);
      }

      this.nodesData.remove(id);
      this.limpiarSeleccion();
      this.mostrarToast("Nodo eliminado correctamente.");
    },

    eliminarAristaSeleccionada() {
      if (!this.aristaSeleccionada) return;

      const confirmar = window.confirm(
        `¿Eliminar la arista "${this.aristaSeleccionada.desdeLabel} → ${this.aristaSeleccionada.hastaLabel}"?`,
      );
      if (!confirmar) return;

      this.edgesData.remove(this.aristaSeleccionada.id);
      this.limpiarSeleccion();
      this.mostrarToast("Arista eliminada correctamente.");
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
        this.mostrarToast(
          "No se permite crear una arista del nodo hacia sí mismo.",
        );
        return;
      }

      const nodoFrom = this.nodesData.get(from);
      const nodoTo = this.nodesData.get(to);

      if (!nodoFrom || !nodoTo) return;

      if (nodoFrom.tipo !== "origen" || nodoTo.tipo !== "destino") {
        this.mostrarToast(
          "Solo se permiten conexiones desde ORIGEN hacia DESTINO.",
        );
        return;
      }

      this.abrirModalArista(from, to, nodoFrom.label, nodoTo.label);
    },

    limpiarGrafo() {
      if (this.nodesData) this.nodesData.clear();
      if (this.edgesData) this.edgesData.clear();

      this.contadorNodos = 0;
      this.contadorAristas = 0;
      this.limpiarSeleccion();
      this.cerrarModal();
    },

    abrirImportacion() {
      const el = this.$refs.inputImportar;
      if (!el) {
        this.mostrarToast("No se encontró el input de importación.");
        return;
      }
      el.value = "";
      el.click();
    },

    exportarJSON() {
      try {
        if (this.network) {
          this.network.storePositions();
        }

        let nombre = window.prompt(
          "Nombre del archivo (sin .json):",
          "grafo_asignacion",
        );
        if (nombre === null) return;

        nombre = String(nombre).trim();
        if (!nombre) nombre = "grafo_asignacion";

        const payload = {
          version: 1,
          tipo: "asignacion",
          exportedAt: new Date().toISOString(),
          state: {
            contadorNodos: this.contadorNodos,
            contadorAristas: this.contadorAristas,
            modo: this.modo,
            nodes: this.nodesData
              ? this.nodesData.get().map((n) => ({
                  ...n,
                  id: Number(n.id),
                  x: Number.isFinite(Number(n.x)) ? Number(n.x) : 0,
                  y: Number.isFinite(Number(n.y)) ? Number(n.y) : 0,
                  fixed: false,
                }))
              : [],
            edges: this.edgesData
              ? this.edgesData.get().map((e) => ({
                  ...e,
                  id: Number(e.id),
                  from: Number(e.from),
                  to: Number(e.to),
                  label: String(e.label ?? 1),
                  directed: e.directed !== false,
                  arrows:
                    e.directed !== false
                      ? e.arrows ?? { to: { enabled: true, scaleFactor: 0.7 } }
                      : { to: { enabled: false } },
                }))
              : [],
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
        this.mostrarToast("Grafo exportado correctamente.");
      } catch (e) {
        console.error(e);
        this.mostrarToast("Falló exportar el JSON.");
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
          this.mostrarToast("JSON inválido: falta state.nodes o state.edges.");
          return;
        }

        const nodes = state.nodes.map((n) => ({
          ...n,
          id: Number(n.id),
          x: Number.isFinite(Number(n.x)) ? Number(n.x) : 0,
          y: Number.isFinite(Number(n.y)) ? Number(n.y) : 0,
          fixed: false,
          tipo: n.tipo === "destino" ? "destino" : "origen",
        }));

        const edges = state.edges.map((e) => {
          const directed = e.directed !== false;
          return {
            ...e,
            id: Number(e.id),
            from: Number(e.from),
            to: Number(e.to),
            label: String(e.label ?? 1),
            directed,
            arrows: directed
              ? e.arrows ?? { to: { enabled: true, scaleFactor: 0.7 } }
              : { to: { enabled: false } },
          };
        });

        this.nodesData.clear();
        this.edgesData.clear();

        this.nodesData.add(nodes);
        this.edgesData.add(edges);

        const maxNodeId = nodes.length
          ? Math.max(...nodes.map((n) => Number(n.id)))
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

        if (state.modo === "min" || state.modo === "max") {
          this.modo = state.modo;
        }

        this.limpiarSeleccion();
        this.cerrarModal();

        if (this.network) {
          this.network.setOptions({
            physics: false,
            interaction: {
              dragNodes: true,
              dragView: false,
              zoomView: false,
              hover: true,
            },
          });

          this.$nextTick(() => {
            this.network.redraw();
          });
        }

        this.mostrarToast("Grafo importado correctamente.");
      } catch (e) {
        console.error(e);
        this.mostrarToast(
          "No se pudo importar el JSON. Revisa que sea válido.",
        );
      } finally {
        if (evt?.target) evt.target.value = "";
      }
    },

    resultadoVacio() {
      return {
        alfa: [],
        beta: [],
        despuesAlfa: [],
        reducidaInicial: [],
        matrizFinal: [],
        asignacionTrabajo: {
          cantidad: 0,
          completa: false,
          pares: [],
        },
        asignacionReales: {
          cantidad: 0,
          completa: false,
          pares: [],
          totalOriginal: 0,
        },
        iteraciones: [],
      };
    },

    formatear(valor) {
      if (valor === null || valor === undefined) return "—";

      const n = Number(valor);
      if (!Number.isFinite(n)) return valor;

      return Number.isInteger(n) ? String(n) : String(Number(n.toFixed(4)));
    },

    copiarMatriz(matriz) {
      return matriz.map((fila) => [...fila]);
    },

    restarPorColumnas(matriz, vector, modo) {
      return matriz.map((fila) =>
        fila.map((valor, j) =>
          modo === "max" ? vector[j] - valor : valor - vector[j],
        ),
      );
    },

    restarPorFilas(matriz, vector) {
      return matriz.map((fila, i) => fila.map((valor) => valor - vector[i]));
    },

    calcularExtremosColumnas(matriz, modo) {
      const n = matriz.length;
      const vector = [];

      for (let j = 0; j < n; j++) {
        const col = [];
        for (let i = 0; i < n; i++) col.push(matriz[i][j]);
        vector.push(modo === "max" ? Math.max(...col) : Math.min(...col));
      }

      return vector;
    },

    calcularExtremosFilas(matriz) {
      return matriz.map((fila) => Math.min(...fila));
    },

    esCero(valor) {
      return Math.abs(Number(valor)) <= EPS;
    },

    construirGrafoDeCeros(matriz) {
      return matriz.map((fila) => {
        const cols = [];
        fila.forEach((valor, j) => {
          if (this.esCero(valor)) cols.push(j);
        });
        return cols;
      });
    },

    obtenerMatchingMaximo(matriz) {
      const n = matriz.length;
      const zeros = this.construirGrafoDeCeros(matriz);

      const colToRow = Array(n).fill(-1);
      const rowToCol = Array(n).fill(-1);

      const dfs = (fila, visitadas) => {
        for (const col of zeros[fila]) {
          if (visitadas[col]) continue;
          visitadas[col] = true;

          if (colToRow[col] === -1 || dfs(colToRow[col], visitadas)) {
            colToRow[col] = fila;
            rowToCol[fila] = col;
            return true;
          }
        }
        return false;
      };

      for (let fila = 0; fila < n; fila++) {
        dfs(fila, Array(n).fill(false));
      }

      const pares = [];
      for (let i = 0; i < n; i++) {
        if (rowToCol[i] !== -1) {
          pares.push({ fila: i, columna: rowToCol[i] });
        }
      }

      return {
        rowToCol,
        colToRow,
        pares,
        cantidad: pares.length,
        completa: pares.length === n,
      };
    },

    obtenerCoberturaMinima(matriz, matching) {
      const n = matriz.length;
      const zeros = this.construirGrafoDeCeros(matriz);

      const visitRows = Array(n).fill(false);
      const visitCols = Array(n).fill(false);
      const cola = [];

      for (let i = 0; i < n; i++) {
        if (matching.rowToCol[i] === -1) {
          visitRows[i] = true;
          cola.push(i);
        }
      }

      while (cola.length) {
        const fila = cola.shift();

        for (const col of zeros[fila]) {
          if (matching.rowToCol[fila] === col) continue;

          if (!visitCols[col]) {
            visitCols[col] = true;
            const filaEmparejada = matching.colToRow[col];

            if (filaEmparejada !== -1 && !visitRows[filaEmparejada]) {
              visitRows[filaEmparejada] = true;
              cola.push(filaEmparejada);
            }
          }
        }
      }

      const filasCubiertas = [];
      const columnasCubiertas = [];

      for (let i = 0; i < n; i++) if (!visitRows[i]) filasCubiertas.push(i);
      for (let j = 0; j < n; j++) if (visitCols[j]) columnasCubiertas.push(j);

      let minNoCubierto = null;

      for (let i = 0; i < n; i++) {
        for (let j = 0; j < n; j++) {
          const cubiertaPorFila = filasCubiertas.includes(i);
          const cubiertaPorCol = columnasCubiertas.includes(j);

          if (!cubiertaPorFila && !cubiertaPorCol) {
            const valor = matriz[i][j];
            if (minNoCubierto === null || valor < minNoCubierto) {
              minNoCubierto = valor;
            }
          }
        }
      }

      return {
        filasCubiertas,
        columnasCubiertas,
        minNoCubierto,
      };
    },

    ajustarMatriz(matriz, cobertura) {
      const n = matriz.length;
      const filasCubiertas = new Set(cobertura.filasCubiertas);
      const columnasCubiertas = new Set(cobertura.columnasCubiertas);
      const k = cobertura.minNoCubierto;

      if (k === null) return this.copiarMatriz(matriz);

      const nueva = this.copiarMatriz(matriz);

      for (let i = 0; i < n; i++) {
        for (let j = 0; j < n; j++) {
          const cubiertaFila = filasCubiertas.has(i);
          const cubiertaCol = columnasCubiertas.has(j);

          if (!cubiertaFila && !cubiertaCol) {
            nueva[i][j] = nueva[i][j] - k;
          } else if (cubiertaFila && cubiertaCol) {
            nueva[i][j] = nueva[i][j] + k;
          }
        }
      }

      return nueva;
    },

    construirAsignacionReal(asignacionTrabajo) {
      const pares = asignacionTrabajo.pares.filter(
        (p) =>
          p.fila < this.filasBase.length &&
          p.columna < this.columnasBase.length &&
          this.mascaraConexiones[p.fila]?.[p.columna] === true,
      );

      const totalOriginal = pares.reduce(
        (acc, p) => acc + Number(this.matrizBase[p.fila][p.columna] || 0),
        0,
      );

      return {
        pares,
        cantidad: pares.length,
        completa: pares.length === this.asignacionesObjetivo,
        totalOriginal,
      };
    },

    resolverAsignacion(matrizOriginal, modo) {
      const alfa = this.calcularExtremosColumnas(matrizOriginal, modo);
      const despuesAlfa = this.restarPorColumnas(matrizOriginal, alfa, modo);

      const beta = this.calcularExtremosFilas(despuesAlfa);
      const reducidaInicial = this.restarPorFilas(despuesAlfa, beta);

      let actual = this.copiarMatriz(reducidaInicial);
      let asignacionTrabajo = this.obtenerMatchingMaximo(actual);
      const iteraciones = [];
      let contador = 0;

      while (!asignacionTrabajo.completa && contador < this.maxIteraciones) {
        const cobertura = this.obtenerCoberturaMinima(
          actual,
          asignacionTrabajo,
        );
        if (cobertura.minNoCubierto === null) break;

        actual = this.ajustarMatriz(actual, cobertura);

        iteraciones.push({
          minNoCubierto: cobertura.minNoCubierto,
          filasCubiertas: [...cobertura.filasCubiertas],
          columnasCubiertas: [...cobertura.columnasCubiertas],
          matriz: this.copiarMatriz(actual),
        });

        asignacionTrabajo = this.obtenerMatchingMaximo(actual);
        contador += 1;
      }

      const asignacionReales = this.construirAsignacionReal(asignacionTrabajo);

      return {
        alfa,
        beta,
        despuesAlfa,
        reducidaInicial,
        matrizFinal: actual,
        asignacionTrabajo,
        asignacionReales,
        iteraciones,
      };
    },

    claseCeldaFinal(i, j, valor) {
      const esAsignada = this.resultado.asignacionTrabajo.pares.some(
        (p) => p.fila === i && p.columna === j,
      );

      return {
        cero: this.esCero(valor),
        asignada: esAsignada,
        dummyCelda:
          !this.filasTrabajo[i]?.real || !this.columnasTrabajo[j]?.real,
      };
    },

    claseCeldaOriginalAsignada(i, j) {
      const esAsignada = this.resultado.asignacionReales.pares.some(
        (p) => p.fila === i && p.columna === j,
      );

      return {
        originalAsignada: esAsignada,
      };
    },

    textoResumen() {
      const r = this.resultado;
      const filas = this.filasBase.map((n) => n.label);
      const cols = this.columnasBase.map((n) => n.label);

      let out = "";
      out += `Modo: ${this.modo === "min" ? "Minimizar" : "Maximizar"}\n\n`;

      out += "Matriz original A (origen -> destino)\n";
      out += this.matrizBase
        .map(
          (fila, i) => `${filas[i]}:\t${fila.map(this.formatear).join("\t")}`,
        )
        .join("\n");

      out += "\n\nAlfa\n";
      out += r.alfa.map(this.formatear).join("\t");

      out += "\n\nA - alfa\n";
      out += r.despuesAlfa
        .map(
          (fila, i) =>
            `${this.filasTrabajo[i].label}:\t${fila
              .map(this.formatear)
              .join("\t")}`,
        )
        .join("\n");

      out += "\n\nBeta\n";
      out += r.beta.map(this.formatear).join("\t");

      out += "\n\n(A - alfa) - beta\n";
      out += r.reducidaInicial
        .map(
          (fila, i) =>
            `${this.filasTrabajo[i].label}:\t${fila
              .map(this.formatear)
              .join("\t")}`,
        )
        .join("\n");

      out += "\n\nAsignación final\n";
      r.asignacionReales.pares.forEach((par) => {
        out += `${filas[par.fila]} -> ${
          cols[par.columna]
        } | valor original: ${this.formatear(
          this.matrizBase[par.fila][par.columna],
        )}\n`;
      });

      out += `\nTotal original asignado: ${this.formatear(
        r.asignacionReales.totalOriginal,
      )}\n`;

      return out;
    },

    async copiarResumen() {
      const txt = this.textoResumen();

      try {
        await navigator.clipboard.writeText(txt);
        this.mostrarToast("Resumen copiado al portapapeles ✅");
      } catch {
        window.prompt("Copia el texto manualmente:", txt);
      }
    },
  },
};
</script>

<style scoped src="@/estilos/asignacionVista.css"></style>
