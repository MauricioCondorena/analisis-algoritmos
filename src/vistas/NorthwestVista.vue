<template>


  <div class="asignacion" ref="zonaCaptura">
    <h2 class="titulo">Algoritmo Northwest</h2>

    <!-- BOTONES SUPERIORES -->
    <div class="acciones iteracion-controles">
      <button class="btn-sec" @click="agregarFila">+ Fila</button>
      <button class="btn-sec" @click="agregarColumna">+ Columna</button>
      <button :class="['btn-sec', { activo: modoEliminar === 'fila' }]" @click="toggleEliminar('fila')">
        - Fila
      </button>

      <button :class="['btn-sec', { activo: modoEliminar === 'columna' }]" @click="toggleEliminar('columna')">
        - Columna
      </button>

      <button class="btn-sec" @click="abrirConfirmacion(resetear, '¿Seguro que quieres limpiar todo?')">
        Limpiar
      </button>

      <button class="btn-sec help" @click="mostrarAyuda = true">
        ❓ Help
      </button>
    </div>


    <!-- MATRIZ -->
    <div class="tabla">
      <table>
        <thead>
          <tr>
            <th></th>
            <th v-for="(col, j) in cols" :key="j">
              <input v-model="nombresColumnas[j]" class="input-nombre" />
            </th>
            <th>Oferta</th>
          </tr>
        </thead>

        <tbody>
          <tr v-for="(fila, i) in matriz" :key="i">
            <th>
              <input v-model="nombresFilas[i]" class="input-nombre" />
            </th>

            <td v-for="(val, j) in fila" :key="j" @mouseenter="handleHover(i, j)" @mouseleave="clearHover"
              @click="seleccionarParaEliminar(i, j)" :class="{
                'hover-fila': modoEliminar === 'fila' && hoverFila === i,
                'hover-col': modoEliminar === 'columna' && hoverColumna === j
              }">

              <input type="number" v-model.number="matriz[i][j]" />
            </td>

            <td>
              <input type="number" v-model.number="oferta[i]" />
            </td>
          </tr>

          <tr>
            <th>Demanda</th>
            <td v-for="(val, j) in cols" :key="j">
              <input type="number" v-model.number="demanda[j]" />
            </td>
          </tr>

          <tr class="fila-sumas">
            <th>Σ</th>
            <td :colspan="cols.length">
              Oferta: {{ sumaOferta }} | Demanda: {{ sumaDemanda }}
            </td>
          </tr>

        </tbody>
      </table>
    </div>



    <input type="file" ref="fileInput" @change="importarArchivo" style="display: none" />

    <div class="modo fila-modo">

      <button :class="['btn-modo', 'min', { activo: modo === 'min', inactivo: modo !== 'min' }]" @click="modo = 'min'">
        ⬇ Minimizar
      </button>

      <button :class="['btn-modo', 'max', { activo: modo === 'max', inactivo: modo !== 'max' }]" @click="modo = 'max'">
        ⬆ Maximizar
      </button>

      <button class="btn-modo calcular" @click="resolver">
        ⚡ Calcular
      </button>

    </div>

    <!-- BOTÓN CALCULAR Y TODOS LOS DEMAS DEA -->
    <div class="acciones iteracion-controles">

      <button class="btn-sec" @click="abrirModal('csv')">CSV</button>
      <button class="btn-sec" @click="abrirModal('json')">JSON</button>
      <button class="btn-sec" @click="abrirModal('img')">Imagen</button>
      <button class="btn-sec" @click="$refs.fileInput.click()">
        Importar
      </button>

    </div>

    <!-- <p>{{ archivoNombre }}</p> -->





    <!-- RESULTADOS -->
    <div v-if="resultado" class="resultado-card">

      <div class="resumen">

        <h3>Resultados</h3>

        <p>
          <strong>
            {{ modo === 'min' ? 'Costo Total' : 'Ganancia Total' }}:
          </strong>
          {{ costo }}
        </p>

        <p>
          <strong>Método:</strong>
          {{ modo === 'min'
            ? 'North West Corner (min)'
            : 'Greedy Costo Máximo (max)' }}
        </p>

        <p class="aviso" v-if="modo === 'min'">
          Esta solución puede no ser óptima
        </p>

        <p class="aviso" v-else>
          Solución basada en beneficio máximo (heurística)
        </p>

      </div>

      <h3>Matriz B₀</h3>


      <div class="tabla-wrap">
        <table class="tabla">

          <tr v-for="(fila, i) in B" :key="i">
            <td v-for="(val, j) in fila" :key="j" @mouseenter="handleHover(i, j)" @mouseleave="clearHover"
              @click="seleccionarParaEliminar(i, j)" :class="{
                'hover-fila': modoEliminar === 'fila' && hoverFila === i,
                'hover-col': modoEliminar === 'columna' && hoverColumna === j
              }">


              <span v-if="val > 0">
                {{ val }} <small>({{ matriz[i]?.[j] }})</small>
              </span>

              <span v-else>
                0
              </span>

            </td>
          </tr>
        </table>
      </div>

      <h3>Detalle del costo</h3>
      <p>{{ detalleCosto }} = {{ costo }}</p>




    </div>

    <div v-if="iteraciones.length && iteraciones[iteracionActual]" class="iteraciones-box">

      <h3>Iteraciones del Algoritmo</h3>

      <div class="iteracion-header">

        <span class="badge-iteracion">
          Iteración {{ iteracionActual + 1 }} / {{ iteraciones.length }}
        </span>

        <div class="progreso">
          <div class="barra" :style="{ width: ((iteracionActual + 1) / iteraciones.length * 100) + '%' }"></div>
        </div>

      </div>

      <div class="acciones iteracion-controles">
        <button @click="iteracionActual--" :disabled="iteracionActual === 0">
          ⬅ Anterior
        </button>

        <button @click="iteracionActual++" :disabled="iteracionActual === iteraciones.length - 1">
          Siguiente ➡
        </button>
      </div>

      <!-- TEXTO -->
      <p>
        Asignar {{ iteraciones[iteracionActual].asignado }} unidades de
        {{ nombresFilas[iteraciones[iteracionActual].fila] }} a
        {{ nombresColumnas[iteraciones[iteracionActual].columna] }}
        ({{ modo === 'min' ? 'costo' : 'beneficio' }} unitario:
        {{ iteraciones[iteracionActual].costo }})
      </p>

      <!-- MATRIZ -->
      <div class="tabla-wrap">
        <table class="tabla">

          <thead>
            <tr>
              <th></th>
              <th v-for="(col, j) in nombresColumnas" :key="j">
                {{ col.split(' ')[0] }} <br>
                {{ col.split(' ')[1] }}
              </th>
              <th>Oferta Rest.</th>
            </tr>
          </thead>

          <tbody>
            <!-- filas -->
            <tr v-for="(fila, i) in iteraciones[iteracionActual].matriz" :key="i">
              <th>{{ nombresFilas[i] }}</th>

              <td v-for="(val, j) in fila" :key="j" @mouseenter="handleHover(i, j)" @mouseleave="clearHover"
                @click="seleccionarParaEliminar(i, j)" :class="{
                  'hover-fila': modoEliminar === 'fila' && hoverFila === i,
                  'hover-col': modoEliminar === 'columna' && hoverColumna === j
                }">

                <div class="celda">
                  <span class="asignacion">{{ val }}</span>
                  <span class="costo" v-if="val > 0">
                    ({{ matriz[i]?.[j] }})
                  </span>
                </div>
              </td>

              <td>
                {{ iteraciones[iteracionActual].ofertaRestante[i] }}
              </td>
            </tr>

            <!-- demanda restante -->
            <tr>
              <th>Dem. Rest.</th>
              <td v-for="(val, j) in iteraciones[iteracionActual].demandaRestante" :key="j">
                {{ val }}
              </td>
              <td></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

  </div>

  <transition name="modal-fade">
    <div v-if="mostrarModal" class="modal">
      <div class="modal-contenido">
        <h3>Nombre del archivo</h3>

        <input v-model="nombreArchivo" placeholder="Ingrese el nombre" />

        <div class="acciones iteracion-controles">
          <button class="btn" @click="confirmarDescarga">Descargar</button>
          <button class="btn-sec" @click="mostrarModal = false">Cancelar</button>
        </div>
      </div>
    </div>
  </transition>

  <transition name="modal-fade">
    <div v-if="confirmarVisible" class="modal" @click.self="confirmarVisible = false">
      <div class="modal-confirmacion">

        <h3>⚠️ Confirmación</h3>

        <p>{{ mensajeConfirmacion }}</p>

        <div class="acciones iteracion-controles">
          <button class="btn-confirmar" @click="confirmarAccion">
            ✔ Aceptar
          </button>

          <button class="btn-cancelar" @click="confirmarVisible = false">
            ✖ Cancelar
          </button>
        </div>

      </div>
    </div>
  </transition>

  <transition name="modal-fade">
    <div v-if="errorModalVisible" class="modal" @click.self="errorModalVisible = false">

      <div class="modal-error">

        <h3>❌ Error</h3>

        <p>{{ mensajeError }}</p>

        <div class="acciones iteracion-controles">
          <button class="btn-error" @click="errorModalVisible = false">
            Entendido
          </button>
        </div>

      </div>

    </div>
  </transition>

  
  <transition name="modal-fade">
    <div v-if="mostrarAyuda" class="modal" @click.self="mostrarAyuda = false">

      <div class="modal-contenido ayuda">

        <h3>🧭 ¿Cómo usar esta página?</h3>

        <ol>
          <li>
            <strong>Llena la matriz:</strong><br>
            Ingresa los costos en cada celda.
          </li>

          <li>
            <strong>Completa oferta y demanda:</strong><br>
            Asegúrate que ambas sumas sean iguales.
          </li>

          <li>
            <strong>Agregar / eliminar:</strong><br>
            Usa <b>+ Fila</b> o <b>+ Columna</b>.<br>
            Usa <b>- Fila</b> o <b>- Columna</b> y luego haz clic en la tabla.
          </li>

          <li>
            <strong>Selecciona el modo:</strong><br>
            Minimizar o Maximizar.
          </li>

          <li>
            <strong>Presiona "Calcular":</strong><br>
            Se generará la solución.
          </li>

          <li>
            <strong>Revisa resultados:</strong><br>
            Observa la matriz y las iteraciones.
          </li>
        </ol>

        <p class="aviso">
          💡 Tip: primero activa eliminar y luego haz clic en la tabla.
        </p>

        <div class="acciones iteracion-controles">
          <button class="btn-sec" @click="mostrarAyuda = false">
            Entendido
          </button>
        </div>

      </div>

    </div>
  </transition>

</template>

<script>
import html2canvas from "html2canvas";

export default {



  data() {
    return {

      modoEliminar: null, // "fila" | "columna" | null
      hoverFila: null,
      hoverColumna: null,

      confirmarVisible: false,
      accionPendiente: null,
      mensajeConfirmacion: "",


      iteraciones: [],
      iteracionActual: 0,
      mostrarAyuda: false,
      modo: "min", // "min" | "max"

      nombreArchivo: "",
      archivoNombre: "Sin archivo",

      mostrarModal: false,
      tipoExportacion: "", // csv | json | imagen


      matriz: [
        [0, 0, 0, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0]
      ],
      oferta: [0, 0, 0],
      demanda: [0, 0, 0, 0],

      nombresFilas: ["Origen 1", "Origen 2", "Origen 3"],
      nombresColumnas: ["Destino 1", "Destino 2", "Destino 3", "Destino 4"],

      error: "",
      resultado: false,

      B: [],
      costo: 0,

      delta: [],
      minDelta: 0,
      maxDelta: 0,

      C: [],
      Z: [],
      detalleCosto: "",
      pasos: [],

      R1: [],
      R2: [],
      theta: 0,
      celdaEntrante: null,
      ciclo: [],

      costoR2: 0,
      mensajeFinal: "",

      errorModalVisible: false,
      mensajeError: ""
    };
  },

  computed: {
    cols() {
      return this.matriz[0];
    },
    sumaOferta() {
      return this.oferta.reduce((a, b) => a + (b || 0), 0);
    },
    sumaDemanda() {
      return this.demanda.reduce((a, b) => a + (b || 0), 0);
    }
  },



  methods: {
    agregarFila() {
      this.matriz.push(Array(this.cols.length).fill(0));
      this.oferta.push(0);
      this.nombresFilas.push(`Origen ${this.nombresFilas.length + 1}`);
    },

    agregarColumna() {
      this.matriz.forEach(f => f.push(0));
      this.demanda.push(0);
      this.nombresColumnas.push(`Destino ${this.nombresColumnas.length + 1}`);
    },

    quitarFila() {
      if (this.matriz.length > 1) {
        this.matriz.pop();
        this.oferta.pop();
      }
    },

    quitarColumna() {
      if (this.cols.length > 1) {
        this.matriz.forEach(f => f.pop());
        this.demanda.pop();
      }
    },

    resetear() {
      this.matriz = [
        [0, 0, 0, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0]
      ];

      this.oferta = [0, 0, 0];
      this.demanda = [0, 0, 0, 0];

      this.nombresFilas = ["Origen 1", "Origen 2", "Origen 3"];
      this.nombresColumnas = ["Destino 1", "Destino 2", "Destino 3", "Destino 4"];

      this.resultado = false;

      // 🔥 limpiar errores correctamente
      this.errorModalVisible = false;
      this.mensajeError = "";

      this.B = [];
      this.delta = [];
      this.C = [];
      this.Z = [];
      this.R1 = [];
      this.R2 = [];
      this.theta = 0;
      this.costo = 0;
      this.costoR2 = 0;
      this.detalleCosto = "";
      this.pasos = [];

      this.iteraciones = [];
      this.iteracionActual = 0;

      this.mensajeFinal = "";
    },

    resolver() {
      this.errorModalVisible = false;
      this.mensajeError = "";
      this.resultado = false;

      if (!this.validarDatos()) return;

      if (this.modo === "min") {
        this.resolverMin();
      } else {
        this.resolverMax();
      }

      this.resultado = true;
      this.iteracionActual = 0;
    },

    generarDetalleCosto(B, costos) {
      let detalles = [];

      for (let i = 0; i < B.length; i++) {
        for (let j = 0; j < B[0].length; j++) {
          if (B[i][j] > 0) {
            detalles.push(`${B[i][j]} × ${costos[i][j]}`);
          }
        }
      }

      return detalles.join(" + ");
    },

    calcularZ(costos, U, V) {
      let m = costos.length;
      let n = costos[0].length;

      let Z = Array.from({ length: m }, () => Array(n).fill(0));

      for (let i = 0; i < m; i++) {
        for (let j = 0; j < n; j++) {
          Z[i][j] = (U[i] ?? 0) + (V[j] ?? 0);
        }
      }

      return Z;
    },

    northwest(oferta, demanda) {
      let i = 0, j = 0;
      let m = oferta.length;
      let n = demanda.length;

      let B = Array.from({ length: m }, () => Array(n).fill(0));

      this.pasos = [];
      this.iteraciones = []; // 🔥 reiniciar

      while (i < m && j < n) {
        let x = Math.min(oferta[i], demanda[j]);

        // asignar
        B[i][j] = x;

        // guardar paso
        this.pasos.push({
          fila: i,
          columna: j,
          asignado: x,
          costo: this.matriz[i][j],
          ofertaRestante: oferta[i] - x,
          demandaRestante: demanda[j] - x
        });

        // 🔥 GUARDAR ITERACIÓN COMPLETA
        this.iteraciones.push({
          matriz: B.map(f => [...f]), // copia profunda
          fila: i,
          columna: j,
          asignado: x,
          costo: this.matriz[i][j],
          ofertaRestante: [...oferta],
          demandaRestante: [...demanda]
        });

        // actualizar oferta/demanda
        oferta[i] -= x;
        demanda[j] -= x;

        if (oferta[i] === 0) i++;
        else j++;
      }

      return B;
    },

    costoTotal(B, costos) {
      let total = 0;
      for (let i = 0; i < B.length; i++) {
        for (let j = 0; j < B[0].length; j++) {
          total += B[i][j] * costos[i][j];
        }
      }
      return total;
    },

    calcularUV(B, costos) {
      let m = B.length;
      let n = B[0].length;

      let U = Array(m).fill(null);
      let V = Array(n).fill(null);

      U[0] = 0;

      let cambiado = true;

      while (cambiado) {
        cambiado = false;

        for (let i = 0; i < m; i++) {
          for (let j = 0; j < n; j++) {
            if (B[i][j] > 0) {
              if (U[i] !== null && V[j] === null) {
                V[j] = costos[i][j] - U[i];
                cambiado = true;
              } else if (V[j] !== null && U[i] === null) {
                U[i] = costos[i][j] - V[j];
                cambiado = true;
              }
            }
          }
        }
      }

      return { U, V };
    },

    calcularDelta(costos, U, V) {
      let m = costos.length;
      let n = costos[0].length;

      let delta = Array.from({ length: m }, () => Array(n).fill(null));

      for (let i = 0; i < m; i++) {
        for (let j = 0; j < n; j++) {
          if (this.B[i][j] === 0) {
            delta[i][j] = costos[i][j] - (U[i] + V[j]);
          } else {
            delta[i][j] = null; // ignorar celdas básicas
          }
        }
      }

      return delta;
    },

    obtenerCeldaEntrante() {
      let min = Infinity;
      let pos = null;

      for (let i = 0; i < this.delta.length; i++) {
        for (let j = 0; j < this.delta[0].length; j++) {
          let val = this.delta[i][j];

          if (val !== null && val < min) {
            min = val;
            pos = { i, j };
          }
        }
      }

      return pos;
    },

    crearR1() {
      this.R1 = this.B.map(fila => fila.map(val => val));

      let { i, j } = this.celdaEntrante;

      this.R1[i][j] = "θ"; // celda inicial
    },


    crearCicloRectangular() {
      let { i, j } = this.celdaEntrante;

      // buscar otra columna en la misma fila
      for (let j2 = 0; j2 < this.B[0].length; j2++) {
        if (j2 !== j && this.B[i][j2] > 0) {

          // buscar otra fila en esa columna
          for (let i2 = 0; i2 < this.B.length; i2++) {
            if (i2 !== i && this.B[i2][j] > 0 && this.B[i2][j2] > 0) {

              // ciclo encontrado (rectángulo)
              this.ciclo = [
                { i: i, j: j },       // θ
                { i: i2, j: j },      // +
                { i: i2, j: j2 },     // -
                { i: i, j: j2 }       // +
              ];

              return true;
            }
          }
        }
      }

      return false; // no hay ciclo
    },

    aplicarThetas() {
      this.ciclo.forEach((pos, index) => {
        let val = this.B[pos.i][pos.j];

        if (index === 0) {
          this.R1[pos.i][pos.j] = "+θ";
        } else {
          this.R1[pos.i][pos.j] =
            index % 2 === 1
              ? `${val} - θ`
              : `${val} + θ`;
        }
      });
    },

    calcularTheta() {
      let valores = [];

      // patrón: + - + -
      this.ciclo.forEach((pos, index) => {
        if (index % 2 === 1) { // posiciones impares → -θ
          valores.push(this.B[pos.i][pos.j]);
        }
      });

      this.theta = Math.min(...valores);
    },


    crearR2() {
      this.R2 = this.B.map(fila => fila.map(val => val));

      let [e, a, b, c] = this.ciclo;

      // patrón correcto alternado
      this.R2[e.i][e.j] += this.theta; // +
      this.R2[a.i][a.j] -= this.theta; // -
      this.R2[b.i][b.j] += this.theta; // +
      this.R2[c.i][c.j] -= this.theta; // -

      // limpiar negativos
      for (let i = 0; i < this.R2.length; i++) {
        for (let j = 0; j < this.R2[0].length; j++) {
          if (this.R2[i][j] < 0) this.R2[i][j] = 0;
        }
      }
    },

    calcularCostoR2() {
      this.costoR2 = this.costoTotal(this.R2, this.matriz);
    },

    detectarFin() {
      // Si no hay suficientes posiciones para alternar +θ -θ
      if (!this.ciclo || this.ciclo.length < 2) {
        this.mensajeFinal = "No se puede iterar más: existe θ independiente. Solución final encontrada.";
        return true;
      }

      return false;


    },

    exportarCSV() {
      if (!this.nombreArchivo || this.nombreArchivo.trim() === "") {
        alert("Por favor ingresa un nombre de archivo");
        return;
      }

      let nombre = this.nombreArchivo
        .trim()
        .replace(/[\\/:*?"<>|]/g, "_");

      let csv = "";

      csv += ["", ...this.nombresColumnas, "Oferta"].join(",") + "\n";

      this.matriz.forEach((fila, i) => {
        csv += [
          this.nombresFilas[i],
          ...fila,
          this.oferta[i]
        ].join(",") + "\n";
      });

      csv += ["Demanda", ...this.demanda].join(",") + "\n";

      let blob = new Blob([csv], { type: "text/csv" });
      let url = URL.createObjectURL(blob);

      let a = document.createElement("a");
      a.href = url;
      a.download = nombre + ".csv";
      a.click(); // 🔥 FALTABA ESTO xd
    },

    exportarJSON() {
      let data = {
        matriz: this.matriz,
        oferta: this.oferta,
        demanda: this.demanda,
        nombresFilas: this.nombresFilas,
        nombresColumnas: this.nombresColumnas
      };

      let blob = new Blob([JSON.stringify(data, null, 2)], {
        type: "application/json"
      });

      let url = URL.createObjectURL(blob);

      let a = document.createElement("a");
      a.href = url;
      a.download = this.nombreArchivo + ".json";
      if (!this.nombreArchivo || this.nombreArchivo.trim() === "") {
        alert("Por favor ingresa un nombre de archivo");
        return;
      }
      let nombre = this.nombreArchivo
        .trim()
        .replace(/[\\/:*?"<>|]/g, "_");

      a.download = nombre + ".json";
      a.click();
    },

    importarArchivo(event) {
      let file = event.target.files[0];
      if (!file) return;

      this.archivoNombre = file.name;

      let reader = new FileReader();

      reader.onload = e => {
        const contenido = e.target.result;

        try {

          // 🟢 JSON
          if (file.name.endsWith(".json")) {
            let data = JSON.parse(contenido);

            this.matriz = data.matriz.map(f => [...f]);
            this.oferta = [...data.oferta];
            this.demanda = [...data.demanda];
            this.nombresFilas = [...data.nombresFilas];
            this.nombresColumnas = [...data.nombresColumnas];
          }

          // 🟡 CSV
          else if (file.name.endsWith(".csv")) {

            const filas = contenido
              .split("\n")
              .map(f => f.trim())
              .filter(f => f !== "")
              .map(f => f.split(","));

            const header = filas[0];
            const body = filas.slice(1);

            let matriz = [];
            let oferta = [];
            let demanda = [];
            let nombresFilas = [];
            let nombresColumnas = header.slice(1, -1);

            body.forEach((fila) => {
              if (fila[0] === "Demanda") {
                demanda = fila.slice(1).map(Number);
              } else {
                nombresFilas.push(fila[0]);
                matriz.push(fila.slice(1, -1).map(Number));
                oferta.push(Number(fila[fila.length - 1]));
              }
            });

            this.matriz = matriz.map(f => [...f]);
            this.oferta = [...oferta];
            this.demanda = [...demanda];
            this.nombresFilas = [...nombresFilas];
            this.nombresColumnas = [...nombresColumnas];
          }

          else {
            this.mostrarError("Formato de archivo no soportado");
          }

        } catch (error) {
          console.error(error);
          this.mostrarError("Error al importar archivo");
        }
      };

      reader.readAsText(file);

      // 🔥 reset UI
      this.resultado = false;
      this.iteraciones = [];
      this.iteracionActual = 0;

      // 🔥 permitir reimportar mismo archivo
      this.$refs.fileInput.value = null;
    },

    exportarImagen() {
      const elemento = this.$refs.zonaCaptura;

      html2canvas(elemento, {
        useCORS: true,
        scale: 2
      }).then(canvas => {
        let link = document.createElement("a");
        link.download = this.nombreArchivo + ".png";


        link.href = canvas.toDataURL("image/png");
        link.click();
      }).catch(err => {
        console.error("Error al generar imagen:", err);
      });
    },

    abrirModal(tipo) {
      this.tipoExportacion = tipo;
      this.mostrarModal = true;
    },

    confirmarDescarga() {
      if (!this.nombreArchivo || this.nombreArchivo.trim() === "") {
        alert("Ingresa un nombre válido");
        return;
      }

      this.mostrarModal = false;

      if (this.tipoExportacion === "csv") this.exportarCSV();
      if (this.tipoExportacion === "json") this.exportarJSON();
      if (this.tipoExportacion === "img") this.exportarImagen();
    },
    actualizarNombres() {
      this.nombresFilas = this.nombresFilas.map((_, i) => `Origen ${i + 1}`);
      this.nombresColumnas = this.nombresColumnas.map((_, j) => `Destino ${j + 1}`);
    },

    resolverMin() {
      this.B = this.northwest([...this.oferta], [...this.demanda]);

      this.costo = this.costoTotal(this.B, this.matriz);

      this.detalleCosto = this.generarDetalleCosto(this.B, this.matriz);

      // 🚫 NO MODI por ahora
    },

    maximoCosto(oferta, demanda) {
      let m = oferta.length;
      let n = demanda.length;

      let B = Array.from({ length: m }, () => Array(n).fill(0));
      let costos = this.matriz.map(f => [...f]);

      this.pasos = [];


      let continuar = true;


      this.iteraciones = [];
      while (continuar) {
        let max = -Infinity;
        let pos = null;

        // buscar mayor costo disponible
        for (let i = 0; i < m; i++) {
          for (let j = 0; j < n; j++) {
            if (oferta[i] > 0 && demanda[j] > 0) {
              if (costos[i][j] > max) {
                max = costos[i][j];
                pos = { i, j };
              }
            }
          }
        }

        if (!pos) {
          continuar = false;
          break; // 🔥 IMPORTANTE
        }

        let { i, j } = pos;

        let x = Math.min(oferta[i], demanda[j]);

        B[i][j] = x;

        this.pasos.push({
          fila: i,
          columna: j,
          asignado: x,
          costo: costos[i][j]
        });


        // SOLO UNA VEZ
        oferta[i] -= x;
        demanda[j] -= x;

        this.iteraciones.push({
          matriz: B.map(f => [...f]),
          fila: i,
          columna: j,
          asignado: x,
          costo: costos[i][j],
          ofertaRestante: [...oferta],
          demandaRestante: [...demanda]
        });
      }

      return B;
    },

    resolverMax() {
      this.B = this.maximoCosto([...this.oferta], [...this.demanda]);

      this.costo = this.costoTotal(this.B, this.matriz);
    },

    abrirConfirmacion(accion, mensaje) {
      this.accionPendiente = accion;
      this.mensajeConfirmacion = mensaje;
      this.confirmarVisible = true;
    },

    confirmarAccion() {
      if (this.accionPendiente) {
        this.accionPendiente();
      }
      this.confirmarVisible = false;
    },

    validarDatos() {
      const sumaOferta = this.oferta.reduce((a, b) => a + (b || 0), 0);
      const sumaDemanda = this.demanda.reduce((a, b) => a + (b || 0), 0);

      if (sumaOferta !== sumaDemanda) {

        const diferencia = Math.abs(sumaOferta - sumaDemanda);

        // 🟡 Caso 1: falta demanda → agregar columna
        if (sumaOferta > sumaDemanda) {

          // agregar nueva columna a la matriz
          this.matriz.forEach(fila => fila.push(0));

          this.demanda.push(diferencia);
          this.nombresColumnas.push("Destino Ficticio");

          this.mostrarError(
            `Oferta (${sumaOferta}) mayor que demanda (${sumaDemanda}). 
Se agregó una columna ficticia con demanda = ${diferencia}`
          );
        }

        // 🔵 Caso 2: falta oferta → agregar fila
        else {

          const nuevaFila = Array(this.matriz[0].length).fill(0);
          this.matriz.push(nuevaFila);

          this.oferta.push(diferencia);
          this.nombresFilas.push("Origen Ficticio");

          this.mostrarError(
            `Demanda (${sumaDemanda}) mayor que oferta (${sumaOferta}). 
Se agregó una fila ficticia con oferta = ${diferencia}`
          );
        }

        // 🔥 NO bloquear, continuar
      }

      for (let i = 0; i < this.matriz.length; i++) {
        for (let j = 0; j < this.matriz[0].length; j++) {
          if (this.matriz[i][j] < 0) {
            this.mostrarError("No se permiten costos negativos");
            return false;
          }
        }
      }

      if (this.oferta.some(v => v <= 0)) {
        this.mostrarError("La oferta debe ser mayor a 0");
        return false;
      }

      if (this.demanda.some(v => v <= 0)) {
        this.mostrarError("La demanda debe ser mayor a 0");
        return false;
      }

      if (!this.matriz.length || !this.matriz[0].length) {
        this.mostrarError("La matriz no puede estar vacía");
        return false;
      }

      for (let i = 0; i < this.matriz.length; i++) {
        for (let j = 0; j < this.matriz[0].length; j++) {
          if (this.matriz[i][j] === null || this.matriz[i][j] === "") {
            this.mostrarError("Todos los costos deben estar llenos");
            return false;
          }
        }
      }

      return true;
    },

    mostrarError(mensaje) {
      this.mensajeError = mensaje;
      this.errorModalVisible = true;
    },

    handleHover(i, j) {
      if (this.modoEliminar === "fila") {
        this.hoverFila = i;
      } else if (this.modoEliminar === "columna") {
        this.hoverColumna = j;
      }
    },

    clearHover() {
      this.hoverFila = null;
      this.hoverColumna = null;
    },

    seleccionarParaEliminar(i, j) {
      if (!this.modoEliminar) return;

      if (this.modoEliminar === "fila") {
        const nombre = this.nombresFilas[i];

        this.abrirConfirmacion(() => {
          this.eliminarFilaIndex(i);
        }, `¿Eliminar la fila "${nombre}"?`);
      }

      if (this.modoEliminar === "columna") {
        const nombre = this.nombresColumnas[j];

        this.abrirConfirmacion(() => {
          this.eliminarColumnaIndex(j);
        }, `¿Eliminar la columna "${nombre}"?`);
      }

      this.modoEliminar = null;
    },

    toggleEliminar(tipo) {
      // si ya está activo → desactivar
      if (this.modoEliminar === tipo) {
        this.modoEliminar = null;
      } else {
        this.modoEliminar = tipo;
      }

      // limpiar selección visual
      this.hoverFila = null;
      this.hoverColumna = null;
    },

    eliminarFilaIndex(i) {
      if (this.matriz.length <= 1) {
        this.mostrarError("Debe existir al menos una fila");
        return;
      }
      this.resultado = false;
      this.iteraciones = [];
      this.iteracionActual = 0;

      this.matriz.splice(i, 1);
      this.oferta.splice(i, 1);
      this.nombresFilas.splice(i, 1);
    },

    eliminarColumnaIndex(j) {
      if (this.matriz[0].length <= 1) {
        this.mostrarError("Debe existir al menos una columna");
        return;
      }
      this.resultado = false;
      this.iteraciones = [];
      this.iteracionActual = 0;

      this.matriz.forEach(f => f.splice(j, 1));
      this.demanda.splice(j, 1);
      this.nombresColumnas.splice(j, 1);
    }

  }
};
</script>

<style src="../estilos/northwestVista.css"></style>