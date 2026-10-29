
// thomas


dayjs.locale('es');

const url_base = "https://science.nasa.gov/wp-json/wp/v2/apod-basic";

function mostrar(texto){
    document.getElementByid("mensaje").textcontent = texto;
}

function mostrarApod(apod){
  console.log(apod.title, dayjs(apod.date).format("D [de] MMMM [de] YYYY"), apod.hdurl);
}



function consturl(fechaIso){
    if(!fechaIso){
        return `${url_base}?per_page=1`;
}
     return `${URL_BASE}/${dayjs(fechaISO).format("YYMMDD")}`;
}
construirUrl() 
construirUrl("2015-07-04")


async function pedirApod(fechaIso){
    
    const respuesta = await fetch(construirUrl(fechaIso));
    
    if(!respuesta.ok){
        const datos = await respuesta.json();
        const apod = fechaIso ? datos : datos[0];
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

const enlacevideo = document.getElementById("enlace-video");

function mostrarApod(apod) {
    tiulo.textContent = apod.title;
    fechaApod.textContent = dayjs(Apod.date).format("D [de] MMMM [de] YYYY");
    Imagen.src = apod.hdurl;
    imagen.alt = apod.title;
    explicacion.innerHTML = apod.explanation;

    if (apod.media_type === "video") {
        enlaceVideo.href = apod.permalink;
        enlaceVideo.hidden = false;    
    }  else  {
        enlaceVideo.hidden = true; // Si es imagen no se ve 
    } 

    contenedorApod.hidden = false;
    
}

// Asigna las referencias del HTML y activa el botón "Buscar"
function inicializar() {
    inputNombre = document.getElementById("searchName");
    inputFecha = document.getElementById("searchDate");
    botonBuscar = document.getElementById("searchBtn");

    conectarBuscador();
}

inicializar();



