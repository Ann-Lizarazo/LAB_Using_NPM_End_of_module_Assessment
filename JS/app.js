// Thomas

dayjs.locale("es");

// Parte de la URL de la NASA que nunca cambia.
// Es const porque su valor no debe modificarse.
const URL_BASE = "https://science.nasa.gov/wp-json/wp/v2/apod-basic";

// Guarda la APOD que se está mostrando en este momento.
// - Es let porque cambia cada vez que se carga una nueva.
// - Empieza en null porque al abrir la página todavía no hay nada cargado.
// - La Persona 4 (favoritos) la usa para saber qué APOD guardar.
let apodActual = null;

const mensaje = document.getElementById("mensaje");


/* ---------- 2. FUNCIONES TEMPORALES ----------
   Son "andamios" para poder probar esta parte sin esperar a los compañeros.
   Cuando la Persona 2 entregue las versiones reales, BORRAR estas dos
   funciones para no tenerlas duplicadas (JavaScript usaría la última
   que encuentre y causaría errores difíciles de rastrear). */

// Escribe un texto en el <p id="mensaje"> del HTML.
// Se usa para "Cargando…" y para mostrar errores EN PANTALLA (no solo en consola).
// Se usa textContent (y no innerHTML) porque son mensajes de texto simple.
function mostrarMensaje(texto, tipo = "error") {
  mensaje.textContent = texto;
  mensaje.className = `mensaje ${tipo}`;
  mensaje.hidden = !texto; // si el texto está vacío, el mensaje se oculta
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
  mostrarMensaje("Cargando…", "info");

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
    mostrarMensaje(`Error: ${error.message}`, "error");
  }
}

// Mauro - Buscador filtro (texto y fecha)

const PRIMERA_APOD = "1995-06-16";

function validarFecha(fecha) {
    if (!fecha) {
        return "Elige una fecha para buscar.";
    }
    if (dayjs(fecha).isAfter(dayjs(), "day")) {
        return "Esa fecha es futura: la NASA todavía no tiene esa foto.";
    }
    if (dayjs(fecha).isBefore(dayjs(PRIMERA_APOD), "day")) {
        return "La primera APOD es del 16 de junio de 1995. Elige una fecha posterior.";
    }
    return null;
}

// Busca un favorito por su fecha exacta (formato "YYYY-MM-DD")
function buscarPorFecha(fecha) {
    const error = validarFecha(fecha);
    if (error) {
        mostrarMensaje(error, "error");
        return null;
    }

    renderFavoritos(); // vuelve a mostrar la lista completa de favoritos
    return cargarApod(fecha);
}

// Normaliza un texto para compararlo sin importar mayúsculas, acentos ni espacios extra
function normalizarTexto(texto) {
    return (texto || "")
        .trim()
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");
}

// Distancia de Levenshtein entre dos cadenas (cuántos cambios hacen falta
// para pasar de una a la otra). Sirve para medir qué tan "parecidos" son.


// Decodifica entidades HTML (como &#8211;) en un texto
function decodificarHtml(texto) {
    const textarea = document.createElement("textarea");
    textarea.innerHTML = texto || "";
    return textarea.value;
}

function distanciaLevenshtein(a, b) {
    if (a === b) return 0;
    if (!a.length) return b.length;
    if (!b.length) return a.length;

    let anterior = Array.from({ length: b.length + 1 }, (_, i) => i);
    let actual = new Array(b.length + 1);

    for (let i = 1; i <= a.length; i++) {
        actual[0] = i;
        for (let j = 1; j <= b.length; j++) {
            const costo = a[i - 1] === b[j - 1] ? 0 : 1;
            actual[j] = Math.min(
                anterior[j] + 1,        // borrado
                actual[j - 1] + 1,      // inserción
                anterior[j - 1] + costo // sustitución
            );
        }
        [anterior, actual] = [actual, anterior];
    }
    return anterior[b.length];
}

// Busca una APOD por su nombre/título usando la API de la NASA (no los favoritos).
// Pide al endpoint de búsqueda de WordPress los resultados, filtra los que son APOD,
// extrae su fecha del título y carga la más parecida.
async function buscarPorNombre(nombre) {
    if (!nombre) {
        mostrarMensaje("Debes escribir un nombre para buscar.", "error");
        return [];
    }

    const texto = normalizarTexto(nombre);
    mostrarMensaje("Cargando…", "info");

    try {
        const url = "https://science.nasa.gov/wp-json/wp/v2/search?search="
            + encodeURIComponent(nombre) + "&per_page=100";
        const respuesta = await fetch(url);
        if (!respuesta.ok) {
            throw new Error("No se pudo buscar en la NASA");
        }
        const datos = await respuesta.json();

        const meses = {
            january: 1, february: 2, march: 3, april: 4, may: 5, june: 6,
            july: 7, august: 8, september: 9, october: 10, november: 11, december: 12
        };

        const candidatos = [];
        for (const item of datos) {
            const titulo = decodificarHtml(item.title || "");
            const coincidencia = titulo.match(/^APOD:\s*(\d{4})\s+(\w+)\s+(\d{1,2})/i);
            if (!coincidencia) continue;

            const anio = coincidencia[1];
            const mesNombre = coincidencia[2].toLowerCase();
            const dia = coincidencia[3].padStart(2, "0");
            const mes = meses[mesNombre];
            if (!mes) continue;

            const fecha = `${anio}-${String(mes).padStart(2, "0")}-${dia}`;
            const tituloLimpio = titulo
                .replace(/^APOD:\s*\d{4}\s+\w+\s+\d{1,2}\s*[\u2013\u2014-]\s*/i, "")
                .trim();

            candidatos.push({ title: tituloLimpio || titulo, date: fecha });
        }

        if (candidatos.length === 0) {
            mostrarMensaje("No se encontró ninguna foto de la NASA con ese nombre.", "error");
            return [];
        }

        // Elige el candidato cuyo título sea más parecido al texto buscado
        let mejor = candidatos[0];
        let mejorDistancia = Infinity;
        for (const c of candidatos) {
            const d = distanciaLevenshtein(texto, normalizarTexto(c.title));
            if (d < mejorDistancia) {
                mejorDistancia = d;
                mejor = c;
            }
        }

        renderFavoritos();
        await cargarApod(mejor.date);
        mostrarMensaje(`Mostrando la foto más parecida: "${mejor.title}".`, "info");
        return [mejor];
    } catch (error) {
        mostrarMensaje(`Error: ${error.message}`, "error");
        return [];
    }
}

// Función del botón "Buscar": decide si busca por fecha o por nombre
// según lo que tenga cada input (si hay fecha, se prioriza la fecha)
function buscar() {
    const fecha = inputFecha.value.trim();
    const nombre = inputNombre.value.trim();

    if (!fecha && !nombre) {
        mostrarMensaje("Elige una fecha (o escribe el nombre de un favorito) para buscar.", "error");
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

const listaFavoritos = document.getElementById("lista-favoritos");
const favoritosVacio = document.getElementById("favoritos-vacio");

let favoritos = cargarFavoritos();

function cargarFavoritos () {
    try {
        const conseguir = localStorage.getItem(seccionFavoritos);
        return conseguir ? JSON.parse(conseguir) : [];
    } catch (error) {
        return [];
    }
}

function guardarFavoritos() {

    localStorage.setItem(seccionFavoritos, JSON.stringify(favoritos));
}

function agregarFavoritos (apod) {

    if (!apod) {
        mostrarMensaje ("Todavía no hay una APOD cargada para guardar.", "error");
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

    mostrarMensaje("APOD guardada en favoritos.", "exito");
    return true;
}

function eliminarFavorito(fecha) {
    favoritos = favoritos.filter((f) => f.date !== fecha);
    guardarFavoritos();
    renderFavoritos();
}

// A
// Dibuja la lista de favoritos; al hacer clic en uno se carga esa APOD.
// Sin argumento dibuja todos; con un arreglo, dibuja solo esos.
function renderFavoritos(lista = favoritos) {
    listaFavoritos.innerHTML = "";
    favoritosVacio.hidden = favoritos.length > 0;

    lista.forEach((fav) => {
        const item = document.createElement("li");

        const abrir = document.createElement("button");
        abrir.type = "button";
        abrir.className = "favorito-abrir";
        abrir.textContent = `${dayjs(fav.date).format("D MMM YYYY")} · ${fav.title}`;
        abrir.addEventListener("click", () => cargarApod(fav.date));

        const eliminar = document.createElement("button");
        eliminar.type = "button";
        eliminar.className = "favorito-eliminar";
        eliminar.textContent = "Eliminar";
        eliminar.addEventListener("click", () => eliminarFavorito(fav.date));

        item.append(abrir, eliminar);
        listaFavoritos.appendChild(item);
    });
}


// Ana
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

  if (apod.hdurl) {
    imagen.src = apod.hdurl;
    imagen.hidden = false;
  } else {
    imagen.removeAttribute("src");
    imagen.hidden = true;
  }
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
    .addEventListener("click", () => {
      renderFavoritos();
      cargarApod();
    });
  renderFavoritos();
  cargarApod();
}

inicializar();




