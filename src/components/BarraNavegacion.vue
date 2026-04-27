<template>
  <nav class="menu">
    <button
      :class="{ activo: pestana === 'inicio' }"
      @click="$emit('cambiar', 'inicio')"
    >
      Inicio
    </button>

    <button
      :class="{ activo: pestana === 'algoritmo' }"
      @click="$emit('cambiar', 'algoritmo')"
    >
      Algoritmo
    </button>

    <button
      :class="{ activo: pestana === 'grafo' }"
      @click="$emit('cambiar', 'grafo')"
    >
      Grafo
    </button>

    <div class="dropdown">
      <button
        class="dropdown-btn"
        :class="{ activo: esActivo }"
        @click="toggleDropdown"
      >
        {{ algoritmoActualLabel }}
        <span class="flecha">▼</span>
      </button>

      <div v-if="dropdownAbierto" class="dropdown-menu">
        <div @click="seleccionarAlgoritmo('johnson')">Johnson</div>
        <div @click="seleccionarAlgoritmo('asignacion')">Asignación</div>
        <div @click="seleccionarAlgoritmo('northwest')">Northwest</div>
        <div @click="seleccionarAlgoritmo('sorts')">Sorts</div>
      </div>
    </div>

    <button
      :class="{ activo: pestana === 'contacto' }"
      @click="$emit('cambiar', 'contacto')"
    >
      Contacto
    </button>
  </nav>
</template>

<script>
export default {
  name: "BarraNavegacion",
  props: {
    pestana: String,
    algoritmo: String,
  },
  data() {
    return {
      dropdownAbierto: false,
      algoritmoActual: "johnson",
    };
  },
  computed: {
    algoritmoActualLabel() {
      const mapa = {
        johnson: "Johnson",
        asignacion: "Asignación",
        northwest: "Northwest",
        sorts: "Sorts",
      };
      return mapa[this.algoritmoActual] || "Algoritmos";
    },
    esActivo() {
      return ["johnson", "asignacion", "northwest", "sorts"].includes(
        this.pestana,
      );
    },
  },
  watch: {
    algoritmo: {
      immediate: true,
      handler(nuevo) {
        if (nuevo) {
          this.algoritmoActual = nuevo;
        }
      },
    },
  },
  methods: {
    toggleDropdown() {
      this.dropdownAbierto = !this.dropdownAbierto;
    },

    seleccionarAlgoritmo(tipo) {
      this.algoritmoActual = tipo;
      this.dropdownAbierto = false;
      this.$emit("cambiar", tipo);
    },
  },
};
</script>

<style scoped src="@/estilos/barraNavegacion.css"></style>