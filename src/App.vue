<template>
  <div class="pagina">
    <header>
      <h1 class="titulo">Análisis de Algoritmos</h1>

      <BarraNavegacion :pestana="pestana" :algoritmo="algoritmo" @cambiar="cambiarVista" />
    </header>

    <main class="cuerpo">
      <div class="contenedor">
        <Home v-if="pestana === 'inicio'" />

        <AlgoritmoVista v-else-if="pestana === 'algoritmo'" />

        <GrafoVista v-else-if="pestana === 'grafo'" :initialNodes="graphNodes" :initialEdges="graphEdges"
          @irMatriz="pestana = 'matriz'" @snapshot="actualizarSnapshot" />

        <MatrizVista v-else-if="pestana === 'matriz'" :nodes="graphNodes" :edges="graphEdges"
          @volver="pestana = 'grafo'" />

        <JohnsonVista v-else-if="pestana === 'johnson'" :nodes="graphNodes" :edges="graphEdges"
          @volver="pestana = 'grafo'" />

        <AsignacionVista v-else-if="pestana === 'asignacion'" :nodes="graphNodes" :edges="graphEdges"
          @volver="pestana = 'grafo'" />

        <!-- ✅ NUEVA VISTA NORTHWEST -->
        <NorthwestVista v-else-if="pestana === 'northwest'" :nodes="graphNodes" :edges="graphEdges"
          @volver="pestana = 'grafo'" />

        <SortVista v-else-if="pestana === 'sorts'" :nodes="graphNodes" :edges="graphEdges"
          @volver="pestana = 'grafo'" />
          
        <ContactoVista v-else-if="pestana === 'contacto'" />

        <Home v-else />
      </div>
    </main>

    <PiePagina />
  </div>
</template>

<script>
import Home from "./vistas/Home.vue";
import BarraNavegacion from "./components/BarraNavegacion.vue";
import PiePagina from "./components/PiePagina.vue";
import AlgoritmoVista from "./vistas/AlgoritmoVista.vue";
import GrafoVista from "./vistas/GrafoVista.vue";
import MatrizVista from "./vistas/MatrizVista.vue";
import ContactoVista from "./vistas/ContactoVista.vue";
import JohnsonVista from "./vistas/JohnsonVista.vue";
import AsignacionVista from "./vistas/AsignacionVista.vue";

/* ✅ IMPORT NUEVO */
import NorthwestVista from "./vistas/NorthwestVista.vue";

import SortVista from "./vistas/SortVista.vue";


export default {
  name: "AplicacionPrincipal",

  components: {
    Home,
    BarraNavegacion,
    PiePagina,
    AlgoritmoVista,
    GrafoVista,
    MatrizVista,
    ContactoVista,
    JohnsonVista,
    AsignacionVista,
    NorthwestVista, // ✅ REGISTRADO
    SortVista,
  },

  data() {
    return {
      pestana: localStorage.getItem("pestana_actual") || "inicio",
      algoritmo: localStorage.getItem("algoritmo") || "johnson",
      graphNodes: [],
      graphEdges: [],
    };
  },

  watch: {
    pestana(nueva) {
      localStorage.setItem("pestana_actual", nueva);
    },

    algoritmo(nuevo) {
      localStorage.setItem("algoritmo", nuevo);
    },
  },

  methods: {
    cambiarVista(vista) {
      this.pestana = vista;

      /* ✅ AGREGAMOS NORTHWEST */
      if (
        vista === "johnson" ||
        vista === "asignacion" ||
        vista === "northwest"||
        vista === "sorts"
      ) {
        this.algoritmo = vista;
      }
    },

    actualizarSnapshot(payload) {
      this.graphNodes = payload.nodes ?? [];
      this.graphEdges = payload.edges ?? [];

      localStorage.setItem(
        "grafo_snapshot",
        JSON.stringify({
          nodes: this.graphNodes,
          edges: this.graphEdges,
        }),
      );
    },
  },

  mounted() {
    const raw = localStorage.getItem("grafo_snapshot");

    if (raw) {
      try {
        const snap = JSON.parse(raw);
        this.graphNodes = snap.nodes ?? [];
        this.graphEdges = snap.edges ?? [];
      } catch (e) {
        localStorage.removeItem("grafo_snapshot");
      }
    }
  },
};
</script>

<style>
html,
body {
  height: 100%;
}

body {
  margin: 0;
  font-family: system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif;
  background: linear-gradient(180deg, #0f172a, #111827);
  color: #0f172a;
}

.pagina {
  max-width: 980px;
  margin: 0 auto;
  padding: 34px 18px 20px;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.cuerpo {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.titulo {
  text-align: center;
  margin: 0;
  font-size: 42px;
  font-weight: 800;
  letter-spacing: 0.5px;
  color: #ffffff;
}

.contenedor {
  margin-top: 10px;
  flex: 1;
  min-height: 440px;
  background: #ffffff;
  border-radius: 16px;
  padding: 22px;
  box-sizing: border-box;
  box-shadow: 0 12px 30px rgba(15, 23, 42, 0.1);
  border: 1px solid rgba(15, 23, 42, 0.08);
}
</style>