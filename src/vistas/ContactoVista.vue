<template>
  <section class="contacto">
    <h2 class="titulo">Contacto / Acerca de</h2>

    <div class="card">

      <!-- FOTO PRINCIPAL -->
      <div class="foto-container">
        <img src="@/assets/Logo_UCB.png" alt="Autor" class="foto" />
      </div>

      <!-- INFO PRINCIPAL -->
      <div class="info">
        <p><b>Proyecto:</b> Análisis de Algoritmos</p>
        <p><b>Universidad:</b> Universidad Católica Boliviana “San Pablo”</p>
      </div>

      <hr class="linea" />

      <!-- DUEÑOS -->
      <div class="duenos">
        <h3>👥 Desarrolladores</h3>
        <ul>
          <li>Pedro Condorena Apaza</li>
          <li>Mauricio Condorena Lazarte</li>
          <li>Alejandro Trujillo Chuquimia</li>
          <li>Nilmar Surci</li>
        </ul>
      </div>

      <hr class="linea" />

      <!-- CONTACTO -->
      <div class="contacto-info">
        <p><b>📧 Contactos:</b> alejandro.trujillo.c@ucb.edu.bo</p>
        <p>pedro.condorena@ucb.edu.bo</p>
        <p>fabian.condorena@ucb.edu.bo</p>
        <p>nilmar.surci@ucb.edu.bo</p>
        <p><b>🚀 Versión:</b> 1.0</p>
      </div>

    </div>
  </section>
</template>

<script>
export default {
  name: "ContactoVista",
};
</script>

<style scoped>
.contacto {
  padding: 20px;
  display: flex;
  justify-content: center;
  background: linear-gradient(135deg, #ff7b00, #ffffff);
  min-height: 100vh;
}

.titulo {
  position: absolute;
  top: 20px;
  font-size: 28px;
  font-weight: 900;
  font-family: 'Segoe UI Rounded', sans-serif;
  color: #0b1220;
}

.card {
  margin-top: 60px;
  background: #ffffff;
  border-radius: 20px;
  padding: 25px;
  max-width: 500px;
  width: 100%;
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.15);
  text-align: center;
  transition: 0.3s;
}

.card:hover {
  transform: translateY(-5px);
}

.linea {
  border: 0;
  height: 1px;
  background: rgba(15, 23, 42, 0.1);
  margin: 20px 0;
}

.info p,
.contacto-info p {
  margin: 8px 0;
  color: #22324d;
  font-size: 15px;
}

/* FOTO */
.foto-container {
  display: flex;
  justify-content: center;
  margin-bottom: 15px;
}

.foto {
  width: 140px;
  height: 140px;
  object-fit: cover;
  border-radius: 50%;
  border: 5px solid #ff7b00;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
}

/* DUEÑOS */
.duenos h3 {
  margin-bottom: 10px;
  color: #ff4500;
  font-family: 'Segoe UI Rounded', sans-serif;
}

.duenos ul {
  list-style: none;
  padding: 0;
}

.duenos li {
  background: #f5f7fa;
  margin: 6px 0;
  padding: 10px;
  border-radius: 10px;
  font-weight: 500;
  transition: 0.3s;
}

.duenos li:hover {
  background: #ffe0cc;
  transform: scale(1.03);
}

/* CONTACTO */
.contacto-info p {
  font-weight: 500;
}

/* RESPONSIVE */
@media (max-width: 600px) {
  .card {
    padding: 20px;
  }

  .titulo {
    font-size: 22px;
  }
}
</style>