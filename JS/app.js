
// thomas


dayjs.locale("es");

// Parte de la URL de la NASA que nunca cambia.
// Es const porque su valor no debe modificarse.
const URL_BASE = "https://science.nasa.gov/wp-json/wp/v2/apod-basic";

// Guarda la APOD que se está mostrando en este momento.
// - Es let porque cambia cada vez que se carga una nueva.
// - Empieza en null porque al abrir la página todavía no hay nada cargado.
// - La Persona 4 (favoritos) la usa para saber qué APOD guardar.
let apodActual = null;


/* ---------- 2. FUNCIONES TEMPORALES ----------
   Son "andamios" para poder probar esta parte sin esperar a los compañeros.
   Cuando la Persona 2 entregue las versiones reales, BORRAR estas dos
   funciones para no tenerlas duplicadas (JavaScript usaría la última
   que encuentre y causaría errores difíciles de rastrear). */

// Escribe un texto en el <p id="mensaje"> del HTML.
// Se usa para "Cargando…" y para mostrar errores EN PANTALLA (no solo en consola).
// Se usa textContent (y no innerHTML) porque son mensajes de texto simple.
function mostrarMensaje(texto) {
  document.getElementById("mensaje").textContent = texto;
}

// Versión de prueba: solo imprime los datos en la consola del navegador.
// La versión real (Persona 2) los dibujará en la página.
function mostrarApod(apod) {
  console.log(
    apod.title,                                       // título (en inglés)
    dayjs(apod.date).format("D [de] MMMM [de] YYYY"), // fecha en español
    apod.hdurl                                        // URL de la imagen
  );
}




/**
 * construirUrl: decide qué dirección pedirle a la NASA.
 *
 * @param {string} [fechaISO] - Fecha en formato "AAAA-MM-DD" (ej. "2015-07-04").
 *                              Si no se envía, se pide la APOD de hoy.
 * @returns {string} La URL completa lista para el fetch.
 *
 * Ejemplos:
 *   construirUrl()             -> ".../apod-basic?per_page=1"
 *   construirUrl("2015-07-04") -> ".../apod-basic/150704"
 *
 * Existe como función aparte porque el <input type="date"> entrega la fecha
 * como "AAAA-MM-DD", pero la API la necesita como "AAMMDD".
 */
function construirUrl(fechaISO) {
  // Sin fecha (undefined o vacía) -> la APOD de hoy.
  // per_page=1 hace que la API devuelva solo la más reciente.
  if (!fechaISO) {
    return `${URL_BASE}?per_page=1`;
  }

  // Con fecha -> se convierte "2015-07-04" en "150704" y se agrega a la URL.
  return `${URL_BASE}/${dayjs(fechaISO).format("YYMMDD")}`;
}


/**
 * pedirApod: va a internet, trae los datos y devuelve UN objeto APOD limpio.
 *
 * @param {string} [fechaISO] - Fecha "AAAA-MM-DD" o nada para hoy.
 * @returns {Promise<Object>} El objeto APOD (title, date, hdurl, etc.).
 * @throws {Error} Si no hay APOD para esa fecha o la respuesta viene vacía.
 *
 * Es async porque pedir datos por internet toma tiempo; async permite usar
 * await para "esperar" la respuesta sin congelar la página.
 */
async function pedirApod(fechaISO) {
  // Envía la petición y espera la respuesta del servidor.
  const respuesta = await fetch(construirUrl(fechaISO));

  // IMPORTANTE: fetch NO lanza error cuando el servidor responde 404.
  // Solo falla si no hay conexión. Por eso se revisa respuesta.ok
  // (false para 404, 500, etc.) y se lanza el error a mano con throw.
  // Este throw salta directo al catch de cargarApod.
  if (!respuesta.ok) {
    throw new Error("No hay APOD para esa fecha");
  }

  // Convierte el texto JSON de la respuesta en objeto/arreglo de JavaScript.
  // También es asíncrono, por eso lleva await.
  const datos = await respuesta.json();

  // La API devuelve DOS formas distintas:
  //  - Para "hoy"  -> un ARREGLO con una APOD adentro: [ {...} ]  -> datos[0]
  //  - Para fecha  -> un OBJETO directamente:           {...}     -> datos
  // Esta línea unifica ambos casos para que el resto del código no se entere.
  const apod = fechaISO ? datos : datos[0];

  // Protección extra: si el arreglo llegó vacío, datos[0] sería undefined
  // y la página se rompería más adelante. Mejor detectarlo aquí.
  if (!apod) {
    throw new Error("La NASA no devolvió ninguna APOD");
  }

  // Entrega el objeto ya listo a quien llamó la función.
  return apod;
}


/**
 * cargarApod: FUNCIÓN PRINCIPAL. Es la que usarán los demás compañeros.
 *
 * @param {string} [fechaISO] - Fecha "AAAA-MM-DD" o nada para hoy.
 *
 * Quién la llama:
 *   - Al abrir la página:      cargarApod()
 *   - Persona 3 (búsqueda):    cargarApod("2024-03-15")
 *   - Persona 4 (favoritos):   cargarApod(favorito.date)
 *
 * Nunca lanza errores hacia afuera: los atrapa con try/catch y los muestra
 * en pantalla, así la página no se rompe.
 */
async function cargarApod(fechaISO) {
  // Cumple el requisito de mostrar "Cargando…" mientras llega la respuesta.
  mostrarMensaje("Cargando…");

  try {
    // Todo lo que pueda fallar va dentro del try.
    const apod = await pedirApod(fechaISO);

    // Se guarda DESPUÉS de que pedirApod tuvo éxito. Si falló, esta línea
    // nunca se ejecuta y apodActual conserva la APOD anterior, que es la que
    // sigue visible. Así lo que se guarda en favoritos coincide con lo que
    // el usuario está viendo.
    apodActual = apod;

    // Le pasa los datos a la función de la Persona 2, que los pinta.
    // Aquí se separa "obtener datos" (tu parte) de "mostrar datos" (la suya).
    mostrarApod(apod);

    // Todo salió bien: limpia el mensaje "Cargando…".
    mostrarMensaje("");
  } catch (error) {
    // Si algo falló (404, sin internet, JSON inválido…) se llega aquí.
    // error.message es el texto que escribimos en los throw, o el que genera
    // el navegador si fue un fallo de red.
    mostrarMensaje(`Error: ${error.message}`);
  }
}

// mauro - buscador filtro (texto y fecha)

// Busca un favorito por su fecha exacta (formato "YYYY-MM-DD")
function buscarPorFecha(fecha) {
    if (!fecha) {
        mostrarMensaje("Debes indicar una fecha para buscar.", "error");
        return null;
    }

    const fechaNormalizada = dayjs(fecha).format("YYYY-MM-DD");
    const resultado = favoritos.find((f) => f.date === fechaNormalizada);

    if (!resultado) {
        mostrarMensaje("No hay ningún favorito con esa fecha.", "error");
        return null;
    }

    mostrarApod(resultado);
    return resultado;
}

// Busca favoritos cuyo título contenga el texto indicado (sin distinguir mayúsculas)
function buscarPorNombre(nombre) {
    if (!nombre) {
        mostrarMensaje("Debes escribir un nombre para buscar.", "error");
        return [];
    }

    const texto = nombre.trim().toLowerCase();
    const resultados = favoritos.filter((f) =>
        f.title && f.title.toLowerCase().includes(texto)
    );

    if (resultados.length === 0) {
        mostrarMensaje("No se encontró ningún favorito con ese nombre.", "error");
        return [];
    }

    mostrarApod(resultados[0]);
    return resultados;
}

// construirUrl("2015-07-04") 
// construirUrl("2016-09-13")  

// Función del botón "Buscar": decide si busca por fecha o por nombre
// según lo que tenga cada input (si hay fecha, se prioriza la fecha)
function buscar() {
    const fecha = inputFecha.value.trim();
    const nombre = inputNombre.value.trim();

    if (!fecha && !nombre) {
        mostrarMensaje("Escribe un nombre o elige una fecha para buscar.", "error");
        return null;
    }

    if (fecha) {
        return buscarPorFecha(fecha);
    }

    return buscarPorNombre(nombre);
}

// Conecta el botón "Buscar" y la tecla Enter en los dos inputs
function conectarBuscador() {
    botonBuscar.addEventListener("click", buscar);

    [inputNombre, inputFecha].forEach((campo) => {
        campo.addEventListener("keydown", (evento) => {
            if (evento.key === "Enter") {
                evento.preventDefault();
                buscar();
            }
        });
    });
}

// Referencias a los elementos del HTML (definidas después, en inicializar())
let inputNombre;
let inputFecha;
let botonBuscar;  






















// Kevin Duvan

const seccionFavoritos = "mis_favoritos"

let favoritos = cargarFavoritos();

function cargarFavoritos () {
    const conseguir = localStorage.getItem(seccionFavoritos);
    return conseguir ? JSON.parse(conseguir) : [];

    
}

function guardarFavoritos() {

    localStorage.setItem(seccionFavoritos, JSON.stringify(favoritos));
}

function agregarFavoritos (apod) {

    if (!apod) {
        mostrarMensaje ("Error", "error");
        return false;
    
    }
    
    const yaExiste = favoritos.some((f) => f.date === apod.date);
        if (yaExiste) {
            mostrarMensaje("Esa APOD ya está en favoritos.", "error");
            return false;
        }
        
    favoritos.push({date: apod.date, title: apod.title})
    
    guardarFavoritos();
    renderFavoritos();

    mostrarMensaje("guardada en favoritos", "guardado correctamente");
    return true;
}




















// Lizarazo Ana
// Elementos del HTML que usa mostrarApod

const titulo = document.getElementById("titulo");
const fechaApod = document.getElementById("fecha-apod");
const imagen = document.getElementById("imagen");
const explicacion = document.getElementById("explicacion");
const enlaceVideo = document.getElementById("enlace-video");
const contenedorApod = document.getElementById("apod");

// Muestra una APOD en la página
// Coloca el título, la fecha en español, la imagen y la explicación
// Si la APOD es un video, muestra el enlace "Ver el video en NASA"
// (en videos, hdurl trae la imagen de vista previa)
// Si es una imagen, oculta ese enlace

function mostrarApod(apod) {
    
  titulo.textContent = apod.title;
  fechaApod.textContent = dayjs(apod.date).format("D [de] MMMM [de] YYYY");
  imagen.src = apod.hdurl;
  imagen.alt = apod.title;
  explicacion.innerHTML = apod.explanation; // innerHTML porque viene con HTML

    
  if (apod.media_type === "video") {
    enlaceVideo.href = apod.permalink;
    enlaceVideo.hidden = false;
  } else {
    enlaceVideo.hidden = true; // si es imagen, el enlace no se ve
  }

  contenedorApod.hidden = false;
}


// Prepara la página al abrirla:
// Asigna las referencias del HTML y limita el calendario hasta hoy
// Activa el botón "Buscar"⭐ y el de "Ver Foto de Hoy"
// Dibuja los favoritos guardados (para que sobrevivan al recargar)
// Carga la APOD de hoy


function inicializar() {
  inputNombre = document.getElementById("searchName");
  inputFecha = document.getElementById("searchDate");
  botonBuscar = document.getElementById("searchBtn");
  inputFecha.max = dayjs().format("YYYY-MM-DD");

    
  conectarBuscador();
  document.getElementById("btn-favorito")
    .addEventListener("click", () => agregarFavoritos(apodActual));
  document.getElementById("todayBtn")
    .addEventListener("click", () => cargarApod());
  renderFavoritos();
  cargarApod();
}

inicializar();




