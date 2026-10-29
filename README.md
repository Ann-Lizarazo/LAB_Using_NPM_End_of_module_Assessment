# LAB-_Using_NPM_End_of_module_Assessment

Proyecto de fin de módulo: **APOD (Astronomy Picture of the Day)** — una página web que consume la API de la NASA para mostrar la imagen astronómica del día, con buscador de favoritos.

## Descripción

La aplicación permite:

- Consultar la **imagen astronómica del día** desde la API de la NASA (`science.nasa.gov`).
- **Buscar por fecha** y ver la imagen correspondiente a ese día.
- Guardar imágenes en **favoritos** (almacenados en `localStorage`) y buscar entre ellos **por nombre o por fecha**.

## Tecnologías

| Tecnología | Uso |
|---|---|
| HTML | Estructura de la página |
| CSS | Estilos y diseño |
| JavaScript (ES6+) | Lógica de la aplicación |
| npm | Gestor de dependencias |
| [day.js](https://day.js.org/) | Manejo y formato de fechas |
| API de la NASA | Fuente de datos (APOD) |

## Instalación

```bash
# Clonar el repositorio
git clone https://github.com/usuario/LAB-_Using_NPM_End_of_module_Assessment.git

# Entrar a la carpeta del proyecto
cd LAB-_Using_NPM_End_of_module_Assessment

# Instalar dependencias
npm install
```

## Uso

Abre `index.html` en el navegador (o sirve la carpeta con un servidor estático):

```bash
npx serve .
```

1. Al abrir la página se muestra automáticamente la **imagen astronómica del día**.
2. Usa el **buscador de fecha** para ver la imagen de un día concreto.
3. Guarda imágenes en **favoritos** y búscalas después **por nombre o fecha**.

## Estructura del proyecto

```
.
├── index.html      # Estructura de la página
├── styles.css      # Estilos
├── app.js          # Lógica principal (API, favoritos, buscadores)
├── package.json    # Dependencias y scripts
└── README.md
```

## Equipo

| Integrante | Contribución |
|---|---|
| **Thomas Espinosa** | Consumo de la API y renderizado de la imagen del día  |
| **Mauro Infante** | Buscadores  (por nombre y por fecha) |
| **Kevin Garzon** | Sistema de favoritos con `localStorage` |
| **Ana Lizarazo** | Vista previa video






