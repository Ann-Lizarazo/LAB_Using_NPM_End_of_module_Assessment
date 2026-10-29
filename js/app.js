
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


// construirUrl("2015-07-04") 
// construirUrl("2016-09-13") 






















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

const enlace-video

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



