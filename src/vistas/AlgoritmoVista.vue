<template>
  <section class="algoritmos">
    <header class="encabezado">
      <h2 class="titulo">ALGORITMOS</h2>
      <p class="intro">
        Aquí encontrarás una explicación clara de qué es un algoritmo, sus
        características, sus formas de representación y un ejemplo sencillo. Al
        final se incluye una fuente académica y un video de apoyo.
      </p>
    </header>

    <!-- 1 -->
    <section class="bloque">
      <h3 class="subtitulo">
        <span class="badge">1</span>
        ¿Qué es un algoritmo?
      </h3>

      <p class="texto">
        Un <strong>algoritmo</strong> es un conjunto
        <strong>ordenado</strong> de pasos o instrucciones
        <strong>precisas</strong> que, al ejecutarse, permiten
        <strong>resolver un problema</strong> o realizar una tarea,
        transformando datos de <strong>entrada</strong> en resultados de
        <strong>salida</strong>.
      </p>

      <p class="nota">
        <strong>Importante:</strong> al escribir algoritmos, los nombres de
        variables deben ser <strong>descriptivos</strong> y elegidos según el
        problema (por ejemplo: <code>precio</code>, <code>total</code>,
        <code>contador</code>, <code>nodoActual</code>). Evita nombres vagos
        como <code>x</code>, <code>a</code> o <code>dato1</code> si no explican
        su propósito.
      </p>
    </section>

    <hr class="separador" />

    <!-- 2 -->
    <section class="bloque">
      <h3 class="subtitulo">
        <span class="badge">2</span>
        Características de un algoritmo
      </h3>

      <ul class="lista">
        <li>
          <strong>Preciso (sin ambigüedad):</strong> cada paso debe entenderse
          de una sola manera, sin depender de interpretaciones.
          <div class="ejemplos">
            <div class="ejemplo ejemplo-mal">
              <span class="tag tag-mal">Incorrecto</span>
              <pre><code>Calcular el resultado.</code></pre>
            </div>
            <div class="ejemplo ejemplo-bien">
              <span class="tag tag-bien">Correcto</span>
              <pre><code>suma = numeroA + numeroB</code></pre>
            </div>
          </div>
        </li>

        <li>
          <strong>Finito:</strong> debe terminar en un número limitado de pasos
          (no puede ejecutarse “para siempre”).
        </li>

        <li>
          <strong>Definido:</strong> si se repite con la misma entrada, debe
          producir la misma salida.
        </li>

        <li>
          <strong>Entrada:</strong> recibe uno o más datos (por ejemplo, dos
          números a sumar).
        </li>

        <li>
          <strong>Salida:</strong> entrega un resultado (por ejemplo, la suma
          calculada).
        </li>
      </ul>
    </section>

    <hr class="separador" />

    <!-- 3 -->
    <section class="bloque">
      <h3 class="subtitulo">
        <span class="badge">3</span>
        Representaciones de un algoritmo
      </h3>

      <ul class="lista">
        <li>
          <strong>Lenguaje natural:</strong> se explica con palabras (paso a
          paso). Es fácil de entender, pero puede volverse ambiguo si no se
          escribe con cuidado.
        </li>
        <li>
          <strong>Pseudocódigo:</strong> es una forma “intermedia” entre el
          lenguaje natural y un lenguaje de programación. Se usa para describir
          la lógica con claridad sin depender de una sintaxis real.
        </li>
        <li>
          <strong>Diagrama de flujo:</strong> representa el algoritmo con
          símbolos (inicio/fin, proceso, decisión, entrada/salida) y flechas que
          muestran el flujo.
        </li>
      </ul>
    </section>

    <hr class="separador" />

    <!-- 4 -->
    <section class="bloque">
      <h3 class="subtitulo">
        <span class="badge">4</span>
        Ejemplo sencillo: sumar dos números
      </h3>

      <div class="dos-col">
        <div>
          <h4 class="mini">Lenguaje natural</h4>
          <ol class="lista-ordenada">
            <li>Leer <strong>numeroA</strong> y <strong>numeroB</strong>.</li>
            <li>
              Calcular <strong>suma</strong> = <strong>numeroA</strong> +
              <strong>numeroB</strong>.
            </li>
            <li>Mostrar <strong>suma</strong>.</li>
          </ol>
        </div>

        <div>
          <h4 class="mini">Pseudocódigo</h4>
          <pre class="codigo"><code>INICIO
  LEER numeroA
  LEER numeroB
  suma &lt;- numeroA + numeroB
  MOSTRAR suma
FIN</code></pre>
        </div>
      </div>

      <p class="tip">
        Tip: este ejemplo te sirve como “caso base” para explicar precisión,
        entrada/salida y definición.
      </p>
    </section>

    <hr class="separador" />

    <!-- Fuente -->
    <section class="bloque">
      <h3 class="subtitulo">
        <span class="badge">📚</span>
        Fuente académica
      </h3>

      <p class="texto">
        Este material se apoya en un texto base de fundamentos de programación:
      </p>

      <div class="fuente">
        <img
          class="portada"
          src="@/assets/Portada.jpg"
          alt="Portada del libro (referencia)"
        />
        <div class="cita">
          <p class="apa">
            Joyanes Aguilar, L. (2019).
            <em
              >Fundamentos de programación, algoritmos, estructura de datos y
              objetos</em
            >
            (5.ª ed.). McGraw-Hill Interamericana de España.
          </p>
          <p class="nota-suave"></p>
        </div>
      </div>
    </section>

    <hr class="separador" />

    <!-- Video -->
    <section class="bloque">
      <h3 class="subtitulo">
        <span class="badge">🎥</span>
        Video de apoyo
      </h3>

      <p class="texto">
        Este video muestra por qué las instrucciones deben ser exactas (idea
        clave al diseñar algoritmos).
      </p>

      <div class="video">
        <iframe
          :src="youtubeEmbed"
          title="Exact Instructions Challenge PB&J (Josh Darnit)"
          frameborder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowfullscreen
        ></iframe>
      </div>

      <p class="tip">
        Tip: si tu profe pide evidencia, escribe una mini conclusión de 3–4
        líneas sobre qué enseña el video (precisión y ausencia de ambigüedad).
      </p>
    </section>
  </section>
</template>

<script>
export default {
  name: "AlgoritmoVista",
  data() {
    return {
      youtubeEmbed: "https://www.youtube.com/embed/FN2RM-CHkuI",
    };
  },
};
</script>
<style scoped src="@/estilos/algoritmoVista.css"></style>
