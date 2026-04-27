<template>
  <section class="inicio">
    <div class="tarjeta">
      <img class="logo" src="@/assets/Logo_UCB.png" alt="Logo UCB" />
      <h2 class="titulo">Análisis de Algoritmos</h2>
      <p class="subtitulo">Universidad Católica Boliviana “San Pablo”</p>
    </div>
  </section>
</template>

<script>
export default {
  name: "VistaInicio",
};
</script>

<style scoped>
.inicio {
  min-height: 70vh;
  display: grid;
  place-items: center;
  padding: 30px 0 10px;
}

/* tarjeta elegante */
.tarjeta {
  width: min(780px, 92%);
  padding: 38px 26px;
  border-radius: 22px;
  background: radial-gradient(
      1200px 500px at 50% -20%,
      rgba(245, 180, 0, 0.22),
      transparent 60%
    ),
    linear-gradient(180deg, #0b1220, #0f172a);
  box-shadow: 0 18px 50px rgba(2, 8, 23, 0.35);
  border: 1px solid rgba(255, 255, 255, 0.1);
  text-align: center;
}

/* logo */
.logo {
  width: 140px;
  height: auto;
  margin: 0 auto 18px;
  display: block;
  filter: drop-shadow(0 10px 18px rgba(0, 0, 0, 0.35));
}

/* titulo */
.titulo {
  margin: 0;
  font-size: clamp(28px, 4vw, 46px);
  font-weight: 900;
  letter-spacing: 0.5px;
  color: #ffffff;
}

/* subtitulo */
.subtitulo {
  margin: 10px 0 0;
  color: rgba(255, 255, 255, 0.78);
  font-size: 14px;
}
</style>
