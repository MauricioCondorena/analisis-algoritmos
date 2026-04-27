<template>
  <div class="sorts">
    <!-- TÍTULO -->
    <h1 class="titulo">Sorts</h1>

    <!-- LIENZO -->
    <div class="lienzo-sorts" :class="{ scroll: necesitaScroll }">
      <p v-if="valores.length === 0" class="mensaje">
        Genera un arreglo para ver los cuadrados aquí
      </p>

      <div class="contenedor-cuadrados">
        <div
          v-for="(valor, index) in valores"
          :key="index"
          class="cuadrado"
          :style="getStyle(valor)"
        >
          {{ valor }}
        </div>
      </div>
    </div>

    <div class="controles">
      <!-- 🔷 INPUTS -->
      <div class="grupo-inputs">
        <div class="custom-select">
          <div class="select-label" @click="toggleModo">
            <span>{{ modo === "random" ? "Random" : "Manual" }}</span>
            <span class="flecha">▼</span>
          </div>

          <div v-if="abrirModo" class="custom-options">
            <div
              @click.stop="
                modo = 'random';
                abrirModo = false;
              "
            >
              Random
            </div>

            <div
              @click.stop="
                modo = 'manual';
                abrirModo = false;
              "
            >
              Manual
            </div>
          </div>
        </div>

        <template v-if="modo === 'random'">
          <input
            v-model.number="cantidad"
            type="number"
            placeholder="Cantidad"
            class="input"
          />
          <input
            v-model.number="min"
            type="number"
            placeholder="Límite inferior"
            class="input"
          />
          <input
            v-model.number="max"
            type="number"
            placeholder="Límite superior"
            class="input"
          />
        </template>

        <template v-else>
          <input
            v-model="entradaManual"
            type="text"
            placeholder="Ej: 10,20,30"
            class="input"
          />
        </template>
      </div>

      <!-- 🔷 GENERAR / LIMPIAR -->
      <div class="grupo-acciones">
        <button @click="generar" class="btn verde">Generar</button>
        <button @click="limpiar" class="btn rojo">Limpiar</button>

        <!-- 🔥 NUEVO -->
        <button @click="mostrarHelp = true" class="btn help">Help</button>
      </div>

      <!-- 🔷 HERRAMIENTAS -->
      <div class="grupo-tools">
        <button @click="abrirExportar" class="btn verde soft">Exportar</button>
        <button @click="abrirImportar" class="btn amarillo soft">
          Importar
        </button>

        <button @click="toggleOrden" class="btn amarillo">
          {{ orden === "asc" ? "Ascendente" : "Descendente" }}
        </button>

        <button @click="play" class="btn play">▶</button>
      </div>
    </div>

    <div v-if="mostrarSorts" class="panel-sorts-overlay">
      <div class="panel-sorts">
        <button
          type="button"
          @click="setAlgoritmo('selection')"
          :class="['btn-sort', algoritmo === 'selection' ? 'activo' : '']"
        >
          Selection Sort
        </button>

        <button
          type="button"
          @click="setAlgoritmo('insertion')"
          :class="['btn-sort', algoritmo === 'insertion' ? 'activo' : '']"
        >
          Insertion Sort
        </button>

        <button
          type="button"
          @click="setAlgoritmo('merge')"
          :class="['btn-sort', algoritmo === 'merge' ? 'activo' : '']"
        >
          Merge Sort
        </button>

        <button
          type="button"
          @click="setAlgoritmo('shell')"
          :class="['btn-sort', algoritmo === 'shell' ? 'activo' : '']"
        >
          Shell Sort
        </button>

        <button type="button" @click="mostrarSorts = false" class="cerrar">
          ✖
        </button>
      </div>
    </div>

    <div v-if="mostrarStats" class="panel-stats">
      <h3>Stats - {{ nombreAlgoritmo }}</h3>

      <p><strong>Tiempo:</strong> {{ tiempoTotal }}s</p>

      <p><strong>Inicial:</strong></p>
      <p>{{ arregloInicial }}</p>

      <p><strong>Ordenado:</strong></p>
      <p>{{ arregloOrdenado }}</p>

      <p><strong>Registro:</strong></p>

      <div class="log-box" ref="logBox">
        <p v-for="(l, i) in logs" :key="i">{{ l }}</p>
      </div>
      <button @click="reiniciar" class="btn-reiniciar">Reiniciar</button>
    </div>

    <teleport to="body">
      <div v-if="mostrarExportar" class="modal-overlay">
        <div class="modal-custom">
          <h3>Exportar Arreglo</h3>

          <input v-model="nombreArchivo" class="input" />

          <p v-if="mensajeExportar" class="mensaje-error">
            {{ mensajeExportar }}
          </p>

          <div class="opciones">
            <button @click="exportar('json')">JSON</button>
            <button @click="exportar('csv')">CSV</button>
            <button @click="exportar('txt')">TXT</button>
          </div>

          <button class="btn-cerrar" @click="mostrarExportar = false">
            Cerrar
          </button>
        </div>
      </div>
    </teleport>

    <teleport to="body">
      <div v-if="mostrarImportar" class="modal-overlay">
        <div class="modal-custom">
          <h3>Importar Arreglo</h3>

          <input type="file" @change="importarArchivo" />

          <button @click="mostrarImportar = false">Cerrar</button>
        </div>
      </div>
    </teleport>

    <teleport to="body">
      <div v-if="mostrarHelp" class="modal-overlay">
        <div class="modal-custom help-modal">
          <h3>¿Cómo usar Sorts?</h3>

          <ul class="help-list">
            <li>
              <strong>Modo Random:</strong> Genera números automáticamente
            </li>
            <li>
              <strong>Modo Manual:</strong> Ingresa valores separados por comas
            </li>
            <li><strong>Generar:</strong> Crea el arreglo</li>
            <li><strong>Limpiar:</strong> Borra todo</li>
            <li>
              <strong>Exportar:</strong> Guarda el arreglo (JSON, CSV, TXT)
            </li>
            <li><strong>Importar:</strong> Carga un archivo</li>
            <li><strong>Ascendente:</strong> Cambia el orden</li>
            <li><strong>▶ Play:</strong> Ejecuta el algoritmo</li>
            <li><strong>Sorts:</strong> Elige el tipo de ordenamiento</li>
            <li><strong>Stats:</strong> Muestra tiempo, pasos y resultado</li>
          </ul>

          <button class="btn-cerrar" @click="mostrarHelp = false">
            Cerrar
          </button>
        </div>
      </div>
    </teleport>
  </div>
</template>

<script>
export default {
  name: "SortVista",

  data() {
    return {
      valores: [],
      //20, 40, 60, 80, 100
      modo: "random",

      cantidad: null,
      min: null,
      max: null,

      entradaManual: "",
      orden: "asc",
      algoritmo: "selection",
      mostrarSorts: false,

      tiempoInicio: 0,
      tiempoFin: 0,
      tiempoTotal: 0,

      arregloInicial: [],
      arregloOrdenado: [],

      mostrarStats: false,
      logs: [],
      mostrarExportar: false,
      mostrarImportar: false,
      nombreArchivo: "arreglo",
      mensajeExportar: "",
      abrirModo: false,
      intervaloTiempo: null,
      mostrarHelp: false,
    };
  },

  computed: {
    nombreAlgoritmo() {
      const map = {
        selection: "Selection Sort",
        insertion: "Insertion Sort",
        merge: "Merge Sort",
        shell: "Shell Sort",
      };
      return map[this.algoritmo];
    },

    necesitaScroll() {
      if (this.valores.length === 0) return false;

      const maxValor = Math.max(...this.valores);

      const tamañoMin = 20;
      const tamañoMax = 140;

      let anchoTotal = 0;

      this.valores.forEach((valor) => {
        const escala = Math.sqrt(valor) / Math.sqrt(maxValor);
        const tamaño = tamañoMin + escala * (tamañoMax - tamañoMin);

        anchoTotal += tamaño + 20; // gap
      });

      return anchoTotal > 800; // 🔥 ancho del lienzo aprox
    },
  },

  methods: {
    getStyle(valor) {
      const maxValor = Math.max(...this.valores);

      const tamañoMin = 20;
      const tamañoMax = 140;

      // 🔥 ESCALA NO LINEAL (CLAVE)
      const escala = Math.sqrt(valor) / Math.sqrt(maxValor);

      const tamaño = tamañoMin + escala * (tamañoMax - tamañoMin);

      return {
        width: tamaño + "px",
        height: tamaño + "px",
        fontSize: tamaño * 0.35 + "px",
      };
    },
    generar() {
      if (this.modo === "random") {
        this.generarRandom();
      } else {
        this.generarManual();
      }
    },

    generarRandom() {
      if (!this.cantidad || this.cantidad <= 0) return;
      if (this.min == null || this.max == null) return;

      this.valores = [];

      for (let i = 0; i < this.cantidad; i++) {
        const num =
          Math.floor(Math.random() * (this.max - this.min + 1)) + this.min;

        this.valores.push(num);
      }
    },

    generarManual() {
      if (!this.entradaManual) return;

      this.valores = this.entradaManual
        .split(",")
        .map((v) => parseInt(v.trim()))
        .filter((v) => !isNaN(v));
    },

    limpiar() {
      this.valores = [];
      this.entradaManual = "";
    },

    toggleOrden() {
      this.orden = this.orden === "asc" ? "desc" : "asc";
    },

    play() {
      if (this.valores.length === 0) return;

      this.mostrarSorts = true;
    },

    async setAlgoritmo(tipo) {
      this.algoritmo = tipo;

      this.mostrarSorts = false;

      // 🔥 RESET LIMPIO (AQUÍ ESTÁ LA CLAVE)
      this.logs = [];
      this.tiempoTotal = 0;
      this.arregloOrdenado = [];

      // 🔥 guardar estado actual como inicial
      this.arregloInicial = [...this.valores];

      // 🔥 iniciar tiempo
      this.tiempoInicio = performance.now();

      // 🔥 INICIAR CRONÓMETRO EN VIVO
      this.intervaloTiempo = setInterval(() => {
        const ahora = performance.now();
        this.tiempoTotal = ((ahora - this.tiempoInicio) / 1000).toFixed(3);
      }, 50); // cada 50ms se actualiza

      // 🔥 mostrar stats desde el inicio
      this.mostrarStats = true;

      await this.ejecutarSort();

      clearInterval(this.intervaloTiempo);
      this.intervaloTiempo = null;

      // 🔥 finalizar tiempo
      this.tiempoFin = performance.now();
      this.tiempoTotal = ((this.tiempoFin - this.tiempoInicio) / 1000).toFixed(
        3,
      );

      // 🔥 guardar resultado final
      this.arregloOrdenado = [...this.valores];
    },

    async ejecutarSort() {
      let copia = [...this.valores];

      if (this.algoritmo === "selection") {
        await this.selectionSort(copia);
      }

      if (this.algoritmo === "insertion") {
        await this.insertionSort(copia);
      }

      if (this.algoritmo === "merge") {
        await this.mergeSort(copia);
      }

      if (this.algoritmo === "shell") {
        await this.shellSort(copia);
      }
    },

    async selectionSort(arr) {
      let n = arr.length;

      this.log("Iniciando Selection Sort");

      for (let i = 0; i < n; i++) {
        let min = i;

        this.log(`Buscando en posición ${i}`);

        for (let j = i + 1; j < n; j++) {
          this.log(`Comparando ${arr[j]} con ${arr[min]}`);

          if (this.orden === "asc" ? arr[j] < arr[min] : arr[j] > arr[min]) {
            min = j;
            this.log(`Nuevo mínimo: ${arr[min]}`);
          }
        }

        if (min !== i) {
          [arr[i], arr[min]] = [arr[min], arr[i]];
          this.valores = [...arr];

          this.log(`Intercambio ${arr[min]} ↔ ${arr[i]}`);

          await this.sleep(200);
        }
      }

      this.log("Finalizado");
    },

    async insertionSort(arr) {
      this.log("Iniciando Insertion Sort");

      for (let i = 1; i < arr.length; i++) {
        let key = arr[i];
        let j = i - 1;

        this.log(`Insertando ${key}`);

        while (j >= 0 && (this.orden === "asc" ? arr[j] > key : arr[j] < key)) {
          this.log(`Moviendo ${arr[j]} a la derecha`);

          arr[j + 1] = arr[j];
          this.valores = [...arr];

          await this.sleep(200);
          j--;
        }

        arr[j + 1] = key;
        this.valores = [...arr];

        this.log(`Insertado en posición ${j + 1}`);

        await this.sleep(300);
      }

      this.log("Finalizado");
    },

    async mergeSort(arr) {
      this.log("Iniciando Merge Sort");
      await this.mergeSortHelper(arr, 0, arr.length - 1);
      this.log("Finalizado");
    },

    async mergeSortHelper(arr, left, right) {
      if (left >= right) return;

      let mid = Math.floor((left + right) / 2);

      await this.mergeSortHelper(arr, left, mid);
      await this.mergeSortHelper(arr, mid + 1, right);

      await this.merge(arr, left, mid, right);
    },

    async merge(arr, left, mid, right) {
      this.log(`Mezclando de ${left} a ${right}`);
      let leftArr = arr.slice(left, mid + 1);
      let rightArr = arr.slice(mid + 1, right + 1);

      let i = 0;
      let j = 0;
      let k = left;

      while (i < leftArr.length && j < rightArr.length) {
        this.log(`Comparando ${leftArr[i]} vs ${rightArr[j]}`);
        let condicion =
          this.orden === "asc"
            ? leftArr[i] <= rightArr[j]
            : leftArr[i] >= rightArr[j];

        if (condicion) {
          arr[k] = leftArr[i];
          i++;
        } else {
          arr[k] = rightArr[j];
          j++;
        }

        this.valores = [...arr];
        await this.sleep(200);

        k++;
      }

      while (i < leftArr.length) {
        arr[k] = leftArr[i];
        i++;

        this.valores = [...arr];
        await this.sleep(200);

        k++;
      }

      while (j < rightArr.length) {
        arr[k] = rightArr[j];
        j++;

        this.valores = [...arr];
        await this.sleep(200);

        k++;
      }
      this.log("Merge completado");
    },

    async shellSort(arr) {
      this.log("Iniciando Shell Sort");

      let n = arr.length;
      let gap = Math.floor(n / 2);

      while (gap > 0) {
        this.log(`Gap actual: ${gap}`);

        for (let i = gap; i < n; i++) {
          let temp = arr[i];
          let j = i;

          while (
            j >= gap &&
            (this.orden === "asc" ? arr[j - gap] > temp : arr[j - gap] < temp)
          ) {
            this.log(`Moviendo ${arr[j - gap]}`);

            arr[j] = arr[j - gap];
            this.valores = [...arr];

            await this.sleep(200);
            j -= gap;
          }

          arr[j] = temp;
          this.valores = [...arr];

          await this.sleep(200);
        }

        gap = Math.floor(gap / 2);
      }
    },

    sleep(ms) {
      return new Promise((resolve) => setTimeout(resolve, ms));
    },

    reiniciar() {
      this.valores = [...this.arregloInicial];

      this.arregloOrdenado = [];

      this.tiempoTotal = 0;
    },

    log(mensaje) {
      const tiempo = ((performance.now() - this.tiempoInicio) / 1000).toFixed(
        3,
      );

      this.logs.push(`[${tiempo}s] ${mensaje}`);

      this.$nextTick(() => {
        const box = this.$refs.logBox;
        if (box) {
          box.scrollTop = box.scrollHeight;
        }
      });
    },

    abrirExportar() {
      this.mostrarExportar = true;
    },

    abrirImportar() {
      this.mostrarImportar = true;
    },

    exportar(tipo) {
      if (!this.valores || this.valores.length === 0) {
        this.mensajeExportar = "No hay arreglo para exportar";

        setTimeout(() => {
          this.mensajeExportar = "";
        }, 2000);

        return;
      }
      const data = this.valores;
      let contenido = "";

      if (tipo === "json") {
        contenido = JSON.stringify(data, null, 2);
      }

      if (tipo === "csv") {
        contenido = data.join(",");
      }

      if (tipo === "txt") {
        contenido = data.join(" ");
      }

      const blob = new Blob([contenido], { type: "text/plain" });

      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = `${this.nombreArchivo}.${tipo}`;
      link.click();

      this.mostrarExportar = false;
    },

    importarArchivo(event) {
      const file = event.target.files[0];
      if (!file) return;

      const reader = new FileReader();

      reader.onload = (e) => {
        let contenido = e.target.result;

        let numeros = contenido
          .split(/[\s,]+/)
          .map((n) => parseInt(n))
          .filter((n) => !isNaN(n));

        this.valores = numeros;

        this.mostrarImportar = false;
      };

      reader.readAsText(file);
    },

    toggleModo() {
      this.abrirModo = !this.abrirModo;
    },
  },
};
</script>

<style scoped src="@/estilos/sortVista.css"></style>
