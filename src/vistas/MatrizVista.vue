<template>
  <section class="matriz">
    <h2 class="titulo">Matriz de adyacencia</h2>

    <p class="subtitulo">
      Orden de nodos: según creación (id). Valores: peso si existe arista, 0 si
      no.
    </p>

    <div class="acciones">
      <button class="btn btn-sec" @click="$emit('volver')">
        Volver al grafo
      </button>
      <button class="btn" @click="copiarTexto">Copiar matriz (texto)</button>
    </div>

    <div v-if="nodosOrdenados.length === 0" class="vacio">
      No hay nodos todavía. Vuelve al grafo y crea algunos.
    </div>

    <div v-else class="tabla-wrap">
      <table class="tabla">
        <thead>
          <tr>
            <th></th>
            <th v-for="n in nodosOrdenados" :key="'col-' + n.id">
              {{ n.label }}
            </th>
          </tr>
        </thead>

        <tbody>
          <tr v-for="fila in nodosOrdenados" :key="'row-' + fila.id">
            <th>{{ fila.label }}</th>
            <td
              v-for="col in nodosOrdenados"
              :key="'cell-' + fila.id + '-' + col.id"
            >
              {{ valor(fila.id, col.id) }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </section>
</template>

<script>
export default {
  name: "MatrizVista",
  emits: ["volver"],

  props: {
    // recibimos nodos/aristas desde App
    nodes: { type: Array, required: true },
    edges: { type: Array, required: true },
  },

  computed: {
    nodosOrdenados() {
      return [...this.nodes].sort((a, b) => a.id - b.id);
    },

    mapaPesos() {
      // key: "from->to" => peso
      const m = new Map();
      for (const e of this.edges) {
        m.set(`${e.from}->${e.to}`, e.label ?? "1");
      }
      return m;
    },
  },

  methods: {
    valor(from, to) {
      return this.mapaPesos.get(`${from}->${to}`) ?? "0";
    },

    textoMatriz() {
      const N = this.nodosOrdenados;
      const header = [" "].concat(N.map((n) => n.label)).join("\t");

      const rows = N.map((r) => {
        const vals = N.map((c) => this.valor(r.id, c.id));
        return [r.label].concat(vals).join("\t");
      });

      return [header].concat(rows).join("\n");
    },

    async copiarTexto() {
      const txt = this.textoMatriz();
      try {
        await navigator.clipboard.writeText(txt);
        alert("Matriz copiada al portapapeles ✅");
      } catch {
        // fallback
        prompt("Copia el texto manualmente:", txt);
      }
    },
  },
};
</script>

<style scoped>
.matriz {
  padding: 10px 0 0;
}

.titulo {
  margin: 0;
  font-size: 28px;
  font-weight: 900;
  color: #0b1220;
  letter-spacing: 1px;
  text-transform: uppercase;
}

.subtitulo {
  margin: 8px 0 12px;
  color: #44506a;
  font-size: 14px;
  line-height: 1.4;
}

.acciones {
  display: flex;
  gap: 10px;
  margin: 10px 0 14px;
}

.btn {
  background: #f5b400;
  border: none;
  border-radius: 10px;
  padding: 8px 12px;
  font-weight: 800;
  cursor: pointer;
}

.btn-sec {
  background: #111827;
  color: #ffffff;
}

.vacio {
  background: #ffffff;
  border-radius: 16px;
  padding: 16px;
  border: 1px solid rgba(15, 23, 42, 0.08);
  color: #22324d;
}

.tabla-wrap {
  background: #ffffff;
  border-radius: 16px;
  padding: 12px;
  border: 1px solid rgba(15, 23, 42, 0.08);
  overflow: auto;
}

.tabla {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  min-width: 520px;
}

.tabla th,
.tabla td {
  padding: 10px 12px;
  border-bottom: 1px solid rgba(15, 23, 42, 0.08);
  text-align: center;
}

.tabla thead th {
  position: sticky;
  top: 0;
  background: #ffffff;
  z-index: 1;
  font-weight: 900;
}

.tabla tbody th {
  text-align: left;
  font-weight: 900;
}
</style>
