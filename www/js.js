// Config de Firebase

const firebaseConfig = {
  apiKey: "AIzaSyC-u-ocWR8yo9E-wB1BYYGFkJ2RUIDwhXE",
  authDomain: "nuevonuevoproyecto-2b663.firebaseapp.com",
  projectId: "nuevonuevoproyecto-2b663",
  storageBucket: "nuevonuevoproyecto-2b663.appspot.com",
  messagingSenderId: "20582355687",
  appId: "1:20582355687:web:0593b756191712b9714842",
  measurementId: "G-7VC7BRJFCZ",
};

// Inicializa Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
const auth = firebase.auth();
const storage = firebase.storage();

//Login con Google
// Referencia al contenedor que contiene el botón de "Registrarse"
const btnRegistrarseContainer = document.getElementById("btnRegistrarse");

// Delegación de eventos: escuchar cualquier clic en el contenedor que tiene el botón
btnRegistrarseContainer.addEventListener("click", (event) => {
  const clickedElement = event.target;

  // Verificar si el elemento clicado es el botón de "Registrarse"
  if (clickedElement && clickedElement.id === "loginGoogle") {
    iniciarSesionGoogle();
  }
});

// Función para iniciar sesión con Google
function iniciarSesionGoogle() {
  const provider = new firebase.auth.GoogleAuthProvider();

  auth
    .signInWithPopup(provider)
    .then((result) => {
      // Usuario autenticado correctamente
      const user = result.user;
      console.log("Usuario autenticado:", user);

      // Verificar y crear el usuario en Firestore si es nuevo
      checkAndCreateUser(user);
    })
    .catch((error) => {
      console.error("Error al iniciar sesión:", error);
    });
}

// Verificar si el usuario existe en Firestore y crearlo si no existe
function checkAndCreateUser(user) {
  const userRef = db.collection("usuarios").doc(user.uid);

  // Verificar si el usuario ya está en Firestore
  userRef.get().then((doc) => {
    if (!doc.exists) {
      // El usuario no existe, crearlo en Firestore
      userRef
        .set({
          name: user.displayName,
          email: user.email,
          role: "user", // Rol predeterminado
        })
        .then(() => {
          console.log("Usuario creado exitosamente en Firestore");
          checkUserRole(user); // Después de crear, verificar el rol
        })
        .catch((error) => {
          console.error("Error al crear el usuario en Firestore:", error);
        });
    } else {
      console.log("El usuario ya existe en Firestore");
      checkUserRole(user); // El usuario ya existe, verificar el rol
    }
  });
}

// Verificar el rol del usuario después de autenticarse
function checkUserRole(user) {
  const userRef = db.collection("usuarios").doc(user.uid);

  userRef
    .get()
    .then((doc) => {
      if (doc.exists) {
        const userData = doc.data();
        if (userData.role === "user") {
          // Redirigir a la página de perfil
          window.location.href = "../pages/perfil.html";
        } else {
          // Si no es admin, mostrar mensaje y cerrar sesión
          alert("No tienes permisos para acceder a esta página.");
          auth.signOut();
        }
      } else {
        // Si no existe el documento, cerrar sesión
        alert("Usuario no registrado en la base de datos.");
        auth.signOut();
      }
    })
    .catch((error) => {
      console.error("Error al verificar el rol del usuario:", error);
      alert("Error al verificar el rol del usuario.");
      auth.signOut(); // Cerrar sesión en caso de error
    });
}

// INICIO DE SESIÓN

// Referencias a los botones de iniciar sesión y registrarse
const btnIniciarSesion = document.getElementById("btnIniciarSesion");
const btnRegistrarse = document.getElementById("btnRegistrarse");

// Verificar el estado de autenticación cuando la página carga
firebase.auth().onAuthStateChanged((user) => {
  if (user) {
    // El usuario está autenticado, eliminar el botón de "Registrarse" y mostrar el perfil
    console.log("Usuario autenticado: ", user.displayName);
    btnIniciarSesion.textContent = "Cerrar sesión";

    // Eliminar el contenido del contenedor del botón de "Registrarse"
    if (btnRegistrarse) {
      btnRegistrarse.innerHTML = ""; // Limpiar el contenido existente

      // Crear el ícono de perfil y el nombre del usuario
      const perfilHTML = `
        <a href="../pages/perfil.html" id="miPerfil" class="d-flex align-items-center">
          <iconify-icon icon="iconamoon:profile-fill"></iconify-icon>
          <span class="ms-2">${user.displayName}</span>
        </a>
      `;

      // Insertar el ícono y nombre del usuario en el contenedor
      btnRegistrarse.innerHTML = perfilHTML;
    }
  } else {
    // No hay usuario autenticado, mostrar el botón de "Registrarse"
    console.log("No hay usuario autenticado.");
    btnIniciarSesion.textContent = "Iniciar sesión";
    mostrarBotonRegistrarse(); // Volver a mostrar el botón de "Registrarse"
  }
});

// Función para iniciar sesión con Google
function iniciarSesion() {
  var provider = new firebase.auth.GoogleAuthProvider();
  firebase
    .auth()
    .signInWithPopup(provider)
    .then((result) => {
      // El usuario se ha autenticado correctamente
      console.log("Sesión iniciada con éxito: ", result.user.displayName);
    })
    .catch((error) => {
      console.error("Error al iniciar sesión: ", error);
    });
}

// Función para cerrar sesión
function cerrarSesion() {
  firebase
    .auth()
    .signOut()
    .then(() => {
      // El usuario ha cerrado sesión
      console.log("Sesión cerrada.");
      mostrarBotonRegistrarse(); // Volver a mostrar el botón de "Registrarse" al cerrar sesión
    })
    .catch((error) => {
      console.error("Error al cerrar sesión: ", error);
    });
}

// Función para mostrar el botón de "Registrarse" nuevamente
function mostrarBotonRegistrarse() {
  if (btnRegistrarse) {
    // Restaurar el botón de "Registrarse"
    btnRegistrarse.innerHTML = `
            <button class="btn btn-primary" id="loginGoogle">
              Registrarse
            </button>
    `;
  }
}

// Manejador de eventos para el botón de inicio/cierre de sesión
btnIniciarSesion.addEventListener("click", () => {
  // Verificar si el usuario ya está autenticado
  const user = firebase.auth().currentUser;
  if (user) {
    cerrarSesion(); // Si el usuario está autenticado, cerrar sesión
  } else {
    iniciarSesion(); // Si no está autenticado, iniciar sesión
  }
});

// Contenedor de Categorias - Carousel

// Referencia al contenedor de categorías
const contenedorCategorias = document.getElementById("contenedorCategorias");

// Función para traer la colección "categorias" y generar el HTML
function cargarCategorias() {
  db.collection("categorias")
    .get()
    .then((querySnapshot) => {
      querySnapshot.forEach((doc) => {
        // Obtener los datos del documento
        const data = doc.data();
        const nombre = data.nombre;
        const icono = data.icono; // Asumiendo que tienes un campo 'icono' en el documento
        const id = doc.id; // Usar el id del documento para acceder a la subcolección

        // Crear la plantilla HTML
        const categoriaHTML = `
          <div class="d-flex flex-column justify-content-center categoria">
            <button class="categoria-boton" data-id="${id}">
              <iconify-icon icon="${icono}"></iconify-icon>
            </button>
            <h6>${nombre}</h6>
          </div>
        `;

        // Insertar la plantilla en el contenedor
        contenedorCategorias.innerHTML += categoriaHTML;
      });

      // Agregar event listeners a los botones de categoría después de que se cargue el HTML
      const botonesCategoria = document.querySelectorAll(".categoria-boton");
      botonesCategoria.forEach((boton) => {
        boton.addEventListener("click", (event) => {
          const categoriaId = event.currentTarget.getAttribute("data-id");
          cargarSubcategorias(categoriaId);
        });
      });
    })
    .catch((error) => {
      console.error("Error al traer las categorías: ", error);
    });
}

// Función para cargar las subcategorías de una categoría específica
function cargarSubcategorias(categoriaId) {
  // Referencia a la subcolección de subcategorías dentro del documento de la categoría
  db.collection("categorias")
    .doc(categoriaId)
    .collection("subcategorias")
    .get()
    .then((querySnapshot) => {
      // Limpiar el contenedor de subcategorías antes de agregar nuevas
      const contenedorSubcategorias = document.getElementById(
        "contenedorSubcategorias"
      );
      contenedorSubcategorias.innerHTML = "";

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        const nombreSubcategoria = data.nombre; // Ajustar según los campos de Firestore

        // Crear la plantilla HTML para las subcategorías
        const subcategoriaHTML = `
          <div class="subcategoria-item">
            <p>${nombreSubcategoria}</p>
          </div>
        `;

        // Insertar la subcategoría en el contenedor
        contenedorSubcategorias.innerHTML += subcategoriaHTML;
      });
    })
    .catch((error) => {
      console.error("Error al traer las subcategorías: ", error);
    });
}

// Llamar a la función para cargar las categorías al cargar la página
cargarCategorias();

// Carga de PUBLICACIONES

// Referencias a los elementos del DOM para mostrar publicaciones
const contenedorSubcategorias = document.getElementById(
  "contenedorSubcategorias"
);
const contenedorPublicaciones = document.getElementById(
  "contenedorPublicaciones"
);

// Variables para almacenar el filtro actual
let filtroCategoriaID = null;
let filtroSubcategoriaID = null;

// Función para manejar errores y mostrar mensajes al usuario
function manejarError(error, mensajeUsuario, contenedor) {
  console.error(error);
  if (contenedor) {
    contenedor.innerHTML = `<p>${mensajeUsuario}</p>`;
  } else {
    alert(mensajeUsuario);
  }
}

// Función para cargar las categorías desde Firestore
async function cargarCategorias() {
  try {
    contenedorCategorias.innerHTML = `
      <div class="spinner-border text-primary" role="status">
        <span class="visualmente-hidden">Cargando categorías...</span>
      </div>
    `;

    const querySnapshot = await db.collection("categorias").get();

    contenedorCategorias.innerHTML = ""; // Limpiar el contenedor

    if (querySnapshot.empty) {
      contenedorCategorias.innerHTML = "<p>No hay categorías disponibles.</p>";
      return;
    }

    querySnapshot.forEach((doc) => {
      const categoria = doc.data();
      const categoriaID = doc.id; // Usar el ID del documento
      const nombreCategoria = categoria.nombre;
      const iconoCategoria = categoria.icono || "mdi:folder"; // Icono por defecto si no se especifica

      // Crear un botón para la categoría
      const categoriaHTML = `
        <div class="d-flex flex-column align-items-center m-2">
          <button class="btn btn-outline-primary categoria-boton" data-id="${categoriaID}" title="${nombreCategoria}">
            <iconify-icon icon="${iconoCategoria}" width="36" height="36"></iconify-icon>
          </button>
          <h6 class="text-center mt-2">${nombreCategoria}</h6>
        </div>
      `;

      contenedorCategorias.innerHTML += categoriaHTML;
    });

    // Agregar event listeners a los botones de categoría después de que se cargue el HTML
    const botonesCategoria = document.querySelectorAll(".categoria-boton");
    botonesCategoria.forEach((boton) => {
      boton.addEventListener("click", async (event) => {
        const categoriaId = event.currentTarget.getAttribute("data-id");

        // Actualizar los filtros
        filtroCategoriaID = categoriaId;
        filtroSubcategoriaID = null; // Resetear subcategoría al cambiar de categoría

        // Obtener el código postal desde el input
        const codigoPostal = parseInt(
          document.getElementById("inputCodigoPostal").value.trim(),
          10
        );

        // Mostrar un estado de carga en publicaciones
        contenedorPublicaciones.innerHTML = `
          <div class="spinner-border text-success" role="status">
            <span class="visualmente-hidden">Cargando publicaciones...</span>
          </div>
        `;

        // Cargar subcategorías y publicaciones correspondientes
        await cargarSubcategorias(categoriaId);
        await cargarPublicaciones(categoriaId, null, codigoPostal); // Cargar por categoría y código postal

        // Opcional: Resaltar la categoría seleccionada
        botonesCategoria.forEach((btn) => btn.classList.remove("active"));
        boton.classList.add("active");
      });
    });
  } catch (error) {
    manejarError(error, "Error al cargar categorías.", contenedorCategorias);
  }
}

// Función para cargar las subcategorías de una categoría específica
async function cargarSubcategorias(categoriaId) {
  try {
    contenedorSubcategorias.innerHTML = `
      <div class="spinner-border text-secondary" role="status">
        <span class="visualmente-hidden"></span>
      </div>
    `;

    const querySnapshot = await db
      .collection("categorias")
      .doc(categoriaId)
      .collection("subcategorias")
      .get();

    contenedorSubcategorias.innerHTML = ""; // Limpiar el contenedor

    if (querySnapshot.empty) {
      contenedorSubcategorias.innerHTML =
        "<p>No hay subcategorías disponibles.</p>";
      return;
    }

    querySnapshot.forEach((doc) => {
      const subcategoria = doc.data();
      const subcategoriaID = doc.id;
      const nombreSubcategoria = subcategoria.nombre;

      // Crear un botón para la subcategoría
      const subcategoriaHTML = `
        <button class="btn btn-outline-secondary subcategoria-boton m-1" data-id="${subcategoriaID}">
          ${nombreSubcategoria}
        </button>
      `;

      contenedorSubcategorias.innerHTML += subcategoriaHTML;
    });

    // Agregar event listeners a los botones de subcategoría
    const botonesSubcategoria = document.querySelectorAll(
      ".subcategoria-boton"
    );
    botonesSubcategoria.forEach((boton) => {
      boton.addEventListener("click", async (event) => {
        const subcategoriaId = event.currentTarget.getAttribute("data-id");

        // Actualizar los filtros
        filtroSubcategoriaID = subcategoriaId;

        // Obtener el código postal desde el input
        const codigoPostal = parseInt(
          document.getElementById("inputCodigoPostal").value.trim(),
          10
        );

        // Mostrar un estado de carga en publicaciones
        contenedorPublicaciones.innerHTML = `
          <div class="spinner-border text-success" role="status">
            <span class="visualmente-hidden">Cargando publicaciones...</span>
          </div>
        `;

        // Cargar publicaciones filtradas por categoría, subcategoría y código postal
        await cargarPublicaciones(
          filtroCategoriaID,
          subcategoriaId,
          codigoPostal
        );

        // Opcional: Resaltar la subcategoría seleccionada
        botonesSubcategoria.forEach((btn) => btn.classList.remove("active"));
        boton.classList.add("active");
      });
    });
  } catch (error) {
    manejarError(
      error,
      "Error al cargar subcategorías.",
      contenedorSubcategorias
    );
  }
}

// Función para calcular el promedio de calificaciones donde "mostrar" es true
async function obtenerPromedioCalificaciones(publicacionId) {
  try {
    const calificacionesSnapshot = await db
      .collection("publicaciones")
      .doc(publicacionId)
      .collection("calificaciones")
      .where("mostrar", "==", true) // Filtrar solo las calificaciones donde "mostrar" es true
      .get();

    if (calificacionesSnapshot.empty) {
      return 0; // Sin calificaciones que mostrar
    }

    let suma = 0;
    let contador = 0;

    calificacionesSnapshot.forEach((doc) => {
      const calificacion = doc.data();
      if (calificacion.puntaje) {
        suma += calificacion.puntaje; // Sumar el puntaje de cada calificación
        contador++;
      }
    });

    const promedio = suma / contador; // Calcular el promedio solo con las calificaciones válidas
    return promedio;
  } catch (error) {
    console.error("Error al obtener calificaciones:", error);
    return 0;
  }
}

// Función para generar estrellas basadas en el promedio
function generarEstrellas(promedio) {
  const estrellas = [];
  const entero = Math.floor(promedio); // Parte entera del promedio
  const decimal = promedio - entero; // Parte decimal del promedio

  for (let i = 1; i <= 5; i++) {
    if (i <= entero) {
      estrellas.push('<div class="star star-filled">&#9733;</div>'); // Estrella llena
    } else if (i === entero + 1 && decimal > 0) {
      // Estrella parcialmente llena
      const porcentaje = decimal * 100; // Convertir a porcentaje
      estrellas.push(`
        <div class="star">
          <div class="star-inner" style="width: ${porcentaje}%;">&#9733;</div>
          <div class="star star-empty">&#9734;</div>
        </div>
      `);
    } else {
      estrellas.push('<div class="star star-empty">&#9734;</div>'); // Estrella vacía
    }
  }

  return estrellas.join("");
}

const codigoPostal = parseInt(
  document.getElementById("inputCodigoPostal").value.trim(),
  10
);

async function obtenerTotalPublicaciones(
  categoriaId,
  subcategoriaId,
  codigoPostal
) {
  let publicacionesRef = db
    .collection("publicaciones")
    .where("categoriaID", "==", categoriaId);

  // Filtrar por subcategoría si está presente
  if (subcategoriaId) {
    publicacionesRef = publicacionesRef.where(
      "subcategoriaID",
      "==",
      subcategoriaId
    );
  }

  // Filtrar por código postal si está presente
  if (codigoPostal) {
    publicacionesRef = publicacionesRef.where(
      "codigosPostales",
      "array-contains-any",
      [codigoPostal]
    );
  }

  // Obtener el total de publicaciones que coinciden con el filtro
  const totalQuerySnapshot = await publicacionesRef.get();
  return totalQuerySnapshot.size; // Devuelve el número total de publicaciones
}

// Variable global para el ID de la publicación actual
let idPublicacionActual = null;

// Función para cargar y mostrar las publicaciones filtradas con calificaciones
let lastVisible = null; // Último documento visible para la paginación
let currentPage = 1; // Página actual
const pageSize = 3; // Número de publicaciones por página

async function cargarPublicaciones(
  categoriaId,
  subcategoriaId,
  codigoPostal,
  isNextPage = false
) {
  try {
    const totalResultados = await obtenerTotalPublicaciones(
      categoriaId,
      subcategoriaId,
      codigoPostal
    ); // Obtener el total de publicaciones

    let publicacionesRef = db
      .collection("publicaciones")
      .where("categoriaID", "==", categoriaId);

    if (subcategoriaId) {
      publicacionesRef = publicacionesRef.where(
        "subcategoriaID",
        "==",
        subcategoriaId
      );
    }

    if (codigoPostal) {
      publicacionesRef = publicacionesRef.where(
        "codigosPostales",
        "array-contains-any",
        [codigoPostal]
      );
    }

    publicacionesRef = publicacionesRef.orderBy("timestamp", "desc");

    if (isNextPage && lastVisible) {
      publicacionesRef = publicacionesRef.startAfter(lastVisible);
      currentPage++;
    }

    publicacionesRef = publicacionesRef.limit(pageSize);

    const querySnapshot = await publicacionesRef.get();

    const contenedorPublicaciones = document.getElementById(
      "contenedorPublicaciones"
    );
    if (!isNextPage) {
      contenedorPublicaciones.innerHTML = "";
    }

    if (querySnapshot.empty) {
      if (!isNextPage) {
        contenedorPublicaciones.innerHTML =
          "<p>No se encontraron publicaciones.</p>";
      }
      return;
    }

    lastVisible = querySnapshot.docs[querySnapshot.docs.length - 1];

    const publicacionesPromises = querySnapshot.docs.map(async (doc) => {
      const publicacion = doc.data();
      const descripcion = publicacion.descripcion || "Sin descripción.";
      const imagenURL = publicacion.imagenURL || "";
      const nombreMostrar = publicacion.nombreMostrar || "Anónimo";
      const numeroTelefono = publicacion.numeroTelefono || "No disponible";
      const timestamp = publicacion.timestamp
        ? publicacion.timestamp.toDate().toLocaleString()
        : "Sin fecha";
      let telefonoWhatsapp = numeroTelefono.replace(/\D/g, "");

      const promedioCalificaciones = await obtenerPromedioCalificaciones(
        doc.id
      );
      const estrellasHTML = generarEstrellas(promedioCalificaciones);

      const publicacionHTML = `
        <div class="col-md-4 mb-4">
          <div class="card h-100" data-id="${doc.id}" style="cursor: pointer;">
            <div class="card-body">
              <img src="${imagenURL}" class="card-img-top" alt="Imagen de la publicación">
              <h5 class="card-title">${nombreMostrar}</h5>
              <p class="card-text">${descripcion}</p>
              <p class="card-text"><small class="text-muted">Teléfono: ${numeroTelefono}</small>
              <div><a href="https://wa.me/549${telefonoWhatsapp}?text=Hola, vengo de nuevoNuevoProyecto" target="blank">
              <iconify-icon icon="logos:whatsapp-icon" width="40" height="40"></iconify-icon></a></div></p>
              <p class="card-text"><small class="text-muted">Publicado el: ${timestamp}</small></p>
              <div class="calificaciones">
                ${estrellasHTML} (${promedioCalificaciones.toFixed(1)})
              </div>
            </div>
          </div>
        </div>
      `;
      return publicacionHTML;
    });

    const publicacionesHTML = await Promise.all(publicacionesPromises);
    contenedorPublicaciones.innerHTML += publicacionesHTML.join("");

    document.querySelectorAll(".card").forEach((card) => {
      card.addEventListener("click", () => {
        const id = card.getAttribute("data-id");
        mostrarModalPublicacion(id);
      });
    });

    mostrarBotonesDePaginacion(totalResultados); // Pasar el total de publicaciones a la función de paginación
  } catch (error) {
    manejarError(
      error,
      "Error al cargar publicaciones.",
      contenedorPublicaciones
    );
  }
}

function mostrarBotonesDePaginacion(totalResultados) {
  const nextButton = document.getElementById("botonSiguiente");
  const prevButton = document.getElementById("botonAnterior");

  // Verifica si los botones existen antes de intentar acceder a sus propiedades
  if (nextButton) {
    // Mostrar el botón "Siguiente" si hay más resultados que mostrar
    if (lastVisible && totalResultados > currentPage * pageSize) {
      nextButton.style.display = "block";
    } else {
      nextButton.style.display = "none";
    }
  }

  if (prevButton) {
    // Mostrar el botón "Anterior" si no estamos en la primera página
    if (currentPage > 1) {
      prevButton.style.display = "block";
    } else {
      prevButton.style.display = "none";
    }
  }
}

// Función para mostrar el modal con los datos de la publicación
async function mostrarModalPublicacion(id) {
  try {
    const doc = await db.collection("publicaciones").doc(id).get();
    if (doc.exists) {
      const publicacion = doc.data();

      // Asignar el ID de la publicación actual
      idPublicacionActual = id;

      // Rellenar el modal con los datos
      document.getElementById("modalPublicacionLabel").textContent =
        publicacion.nombreMostrar || "Anónimo";
      document.getElementById("modalDescripcion").textContent =
        publicacion.descripcion || "Sin descripción.";
      document.getElementById("modalTelefono").textContent =
        publicacion.numeroTelefono || "No disponible";
      document.getElementById("modalFecha").textContent = publicacion.timestamp
        ? publicacion.timestamp.toDate().toLocaleString()
        : "Sin fecha";

      // Obtener y mostrar calificaciones
      const promedioCalificaciones = await obtenerPromedioCalificaciones(id);
      document.getElementById("modalCalificaciones").innerHTML =
        generarEstrellas(promedioCalificaciones) +
        ` (${promedioCalificaciones.toFixed(1)})`;

      const imagenModal = document.getElementById("modalImagen");
      if (publicacion.imagenURL) {
        imagenModal.src = publicacion.imagenURL;
        imagenModal.style.display = "block";
      } else {
        imagenModal.style.display = "none";
      }

      // Actualizar sección de calificación según autenticación
      verificarAutenticacion();

      // Mostrar el modal
      const modal = new bootstrap.Modal(
        document.getElementById("modalPublicacion")
      );
      modal.show();

      // Configurar el evento de clic para mostrar el modal con las calificaciones listadas
      configurarClickCalificaciones();
    } else {
      console.error("No existe la publicación con ID:", id);
    }
  } catch (error) {
    console.error("Error al mostrar la publicación en el modal:", error);
  }
}

// Función para verificar el estado de autenticación del usuario
function verificarAutenticacion() {
  const user = firebase.auth().currentUser;
  if (user) {
    // Usuario autenticado, mostrar el formulario
    document.getElementById("formularioCalificacion").style.display = "block";
    document.getElementById("mensajeAutenticacion").style.display = "none";
  } else {
    // Usuario no autenticado, mostrar mensaje
    document.getElementById("formularioCalificacion").style.display = "none";
    document.getElementById("mensajeAutenticacion").style.display = "block";
  }
}

async function guardarCalificacion() {
  const descripcion = document
    .getElementById("descripcionCalificacion")
    .value.trim();
  const puntaje = parseInt(
    document.getElementById("puntajeCalificacion").value,
    10
  );

  // Verificar que los campos no estén vacíos y el puntaje sea válido
  if (!descripcion || isNaN(puntaje) || puntaje < 1 || puntaje > 5) {
    alert(
      "Por favor, complete todos los campos y asegúrese de que el puntaje esté entre 1 y 5."
    );
    return;
  }

  // Obtener el usuario actual
  const user = firebase.auth().currentUser;

  if (!user) {
    alert("Debe autenticarse para poder calificar.");
    return;
  }

  // Determinar el valor del campo 'mostrar' en función del puntaje
  const mostrar = puntaje >= 3; // Será true si el puntaje es 3, 4 o 5, y false si es 1 o 2

  // Crear el objeto de calificación con el campo 'mostrar'
  const calificacion = {
    IDUsuario: user.uid,
    descripcion: descripcion,
    puntaje: puntaje,
    mostrar: mostrar, // Agregar el campo 'mostrar'
    timestamp: firebase.firestore.FieldValue.serverTimestamp(),
  };

  try {
    // Guardar la calificación en la subcolección "calificaciones" de la publicación
    await db
      .collection("publicaciones")
      .doc(idPublicacionActual)
      .collection("calificaciones")
      .add(calificacion);

    alert("Calificación enviada con éxito.");

    // Limpiar el formulario
    document.getElementById("descripcionCalificacion").value = "";
    document.getElementById("puntajeCalificacion").value = "";

    // Actualizar las calificaciones en el modal
    const nuevoPromedio = await obtenerPromedioCalificaciones(
      idPublicacionActual
    );
    document.getElementById("modalCalificaciones").innerHTML =
      generarEstrellas(nuevoPromedio) + ` (${nuevoPromedio.toFixed(1)})`;
  } catch (error) {
    console.error("Error al enviar la calificación: ", error);
    alert("Error al enviar la calificación.");
  }
}

// Asociar la función de guardar calificación al botón de envío
document
  .getElementById("btnEnviarCalificacion")
  .addEventListener("click", guardarCalificacion);

// Evento DOMContentLoaded para inicializar todo cuando el DOM esté listo
document.addEventListener("DOMContentLoaded", () => {
  cargarCategorias(); // Asegúrate de que esta función está definida correctamente
});

// Función para cargar y mostrar las calificaciones individuales en el modalListaCalificaciones
async function cargarCalificacionesIndividuales(publicacionId) {
  try {
    const listaCalificaciones = document.getElementById("listaCalificaciones");

    // Limpiar el contenedor antes de agregar nuevas calificaciones
    listaCalificaciones.innerHTML = "";

    const calificacionesSnapshot = await db
      .collection("publicaciones")
      .doc(publicacionId)
      .collection("calificaciones")
      .where("mostrar", "==", true)
      .orderBy("timestamp", "desc")
      .get();

    if (calificacionesSnapshot.empty) {
      listaCalificaciones.innerHTML = "<p>No hay calificaciones aún.</p>";
      return;
    }

    // Crear una lista de calificaciones
    calificacionesSnapshot.forEach(async (doc) => {
      const calificacion = doc.data();
      const descripcion = calificacion.descripcion || "Sin descripción.";
      const puntaje = calificacion.puntaje || 0;
      const timestamp = calificacion.timestamp
        ? calificacion.timestamp.toDate().toLocaleString()
        : "Sin fecha";
      const userId = calificacion.IDUsuario;

      // Obtener el nombre del usuario desde Firestore
      let nombreUsuario = "Anónimo";
      try {
        const usuarioDoc = await db.collection("usuarios").doc(userId).get();
        if (usuarioDoc.exists) {
          const usuarioData = usuarioDoc.data();
          nombreUsuario = usuarioData.name || "Anónimo";
        }
      } catch (error) {
        console.error("Error al obtener el usuario desde Firestore:", error);
      }

      // Generar estrellas para el puntaje
      const estrellasHTML = generarEstrellas(puntaje);

      // Crear el HTML para la calificación
      const calificacionHTML = `
        <div class="card mb-3">
          <div class="card-body">
            <h5 class="card-title">${nombreUsuario}</h5>
            <h6 class="card-subtitle mb-2 text-muted">${estrellasHTML} (${puntaje})</h6>
            <p class="card-text">${descripcion}</p>
            <p class="card-text"><small class="text-muted">Publicado el: ${timestamp}</small></p>
          </div>
        </div>
      `;

      listaCalificaciones.innerHTML += calificacionHTML;
    });
  } catch (error) {
    console.error("Error al cargar calificaciones individuales:", error);
    const listaCalificaciones = document.getElementById("listaCalificaciones");
    listaCalificaciones.innerHTML = "<p>Error al cargar calificaciones.</p>";
  }
}

// Función para manejar el clic en el contenedor de calificaciones dentro del modal de la publicación
function configurarClickCalificaciones() {
  const contenedorCalificaciones = document.getElementById(
    "modalCalificaciones"
  );
  contenedorCalificaciones.addEventListener("click", () => {
    if (idPublicacionActual) {
      cargarCalificacionesIndividuales(idPublicacionActual);
      const modalListaCalificaciones = new bootstrap.Modal(
        document.getElementById("modalListaCalificaciones")
      );
      modalListaCalificaciones.show();
    }
  });
}

// Detectar el cierre del modal de calificaciones
const modalListaCalificaciones = document.getElementById(
  "modalListaCalificaciones"
);
modalListaCalificaciones.addEventListener("hidden.bs.modal", function () {
  const listaCalificaciones = document.getElementById("listaCalificaciones");
  listaCalificaciones.innerHTML = ""; // Limpiar el contenido del modal
});

// Función para configurar el click en las calificaciones (evitar duplicación)
function configurarClickCalificaciones() {
  const contenedorCalificaciones = document.getElementById(
    "modalCalificaciones"
  );

  // Eliminar posibles listeners anteriores
  contenedorCalificaciones.removeEventListener(
    "click",
    handleCalificacionesClick
  );

  // Añadir el listener una vez
  contenedorCalificaciones.addEventListener("click", handleCalificacionesClick);
}

// Función manejadora para el evento
function handleCalificacionesClick() {
  if (idPublicacionActual) {
    cargarCalificacionesIndividuales(idPublicacionActual);
    const modalListaCalificaciones = new bootstrap.Modal(
      document.getElementById("modalListaCalificaciones")
    );
    modalListaCalificaciones.show();
  }
}
