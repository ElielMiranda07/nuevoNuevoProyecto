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

////////Función para carga de Datos de Firestore////////
function cargarOpciones(coleccion, selectElement) {
  db.collection(coleccion)
    .get()
    .then((querySnapshot) => {
      querySnapshot.forEach((doc) => {
        const option = document.createElement("option");
        option.value = doc.id;
        option.text = doc.data().nombre;
        selectElement.appendChild(option);
      });
    })
    .catch((error) => {
      console.error("Error al cargar ${coleccion}:", error);
    });
}

function mostrarSeccion(seccion) {
  // Ocultar todas las secciones
  const secciones = document.querySelectorAll(".seccion");
  secciones.forEach((section) => {
    section.classList.remove("activa");
    section.style.display = "none";
  });

  // Mostrar la sección seleccionada
  const seccionMostrar = document.getElementById(`seccion-${seccion}`);

  if (seccionMostrar) {
    seccionMostrar.classList.add("activa");
    seccionMostrar.style.display = "block";
  } else {
    console.error(`La sección con ID "seccion-${seccion}" no se encontró.`);
  }

  // Cargar publicaciones activas solo si la sección seleccionada es 'publicacionesActivas'
  if (seccion === "publicacionesActivas") {
    const uid = window.uidUsuario; // Suponiendo que el UID está guardado globalmente
    if (uid) {
      cargarPublicacionesActivas(uid); // Cargar publicaciones solo si el usuario está autenticado
    } else {
      console.error("Usuario no autenticado");
      alert("Debes estar autenticado para ver tus publicaciones activas.");
    }
  }

  if (seccion !== "publicacionesActivas") {
    const seccionPublicacionesActivas = document.getElementById(
      "seccion-publicacionesActivas"
    );

    if (
      seccionPublicacionesActivas &&
      seccionPublicacionesActivas.innerHTML !== ""
    ) {
      // Borrar el contenido del elemento
      seccionPublicacionesActivas.innerHTML = "";
    }
  }
}

// Escuchar el estado de autenticación
document.addEventListener("DOMContentLoaded", function () {
  firebase.auth().onAuthStateChanged((user) => {
    if (user) {
      // Guardar UID globalmente si es necesario
      window.uidUsuario = user.uid;
    } else {
      console.log("No hay ningún usuario autenticado.");
    }
  });
});

//Manejar el contenido de la pagina de perfil

////////Pestaña Información de Perfil - Actualizar////////

function mostrarPerfiil() {
  // Obtener el UID del usuario autenticado
  auth.onAuthStateChanged((user) => {
    if (user) {
      const uid = user.uid;

      // Obtener la referencia al documento del usuario en Firestore
      const userRef = db.collection("usuarios").doc(uid);

      // Cargar los datos del usuario y rellenar el formulario
      userRef
        .get()
        .then((doc) => {
          if (doc.exists) {
            const userData = doc.data();

            // Rellenar los campos del formulario con los datos del usuario
            document.getElementById("perfilEmpresa").value =
              userData.empresa || "";
            document.getElementById("perfilName").value = userData.name || "";
            document.getElementById("perfilMail").value = userData.email || "";
            document.getElementById("perfilNumeroTelefono").value =
              userData.numeroTelefono || "";

            const nombrePerfil = document.getElementById("miPerfil");

            // Crear el ícono de perfil y el nombre del usuario
            const perfilHTML = `
            <a href="../pages/perfil.html" id="miPerfil" class="d-flex align-items-center">
              <iconify-icon icon="iconamoon:profile-fill"></iconify-icon>
              <span class="ms-2">${userData.name}</span>
            </a>
          `;

            // Insertar el ícono y nombre del usuario en el contenedor
            nombrePerfil.innerHTML = perfilHTML;

            // Mostrar la imagen de perfil si existe
            if (userData.imagenURL) {
              document.getElementById("imagenPerfil").src = userData.imagenURL;
            } else {
              // Opcional: Mostrar una imagen por defecto si no hay imagen de perfil
              document.getElementById("imagenPerfil").src =
                "ruta/a/imagen/default.png"; // Reemplaza con tu ruta
            }
          } else {
            console.log("No se encontraron datos para este usuario.");
          }
        })
        .catch((error) => {
          console.error("Error al obtener los datos del usuario:", error);
        });

      // Actualizar los datos del usuario cuando se haga clic en el botón "Actualizar perfil"
      document
        .getElementById("actualizarPerfil")
        .addEventListener("click", (e) => {
          e.preventDefault();

          const user = auth.currentUser;
          if (user) {
            const uid = user.uid;
            const userRef = db.collection("usuarios").doc(uid);

            // Obtener los valores del formulario
            const empresa = document.getElementById("perfilEmpresa").value;
            const name = document.getElementById("perfilName").value;
            const numeroTelefono = document.getElementById(
              "perfilNumeroTelefono"
            ).value;
            const imagenFile = document.getElementById("perfilImagen").files[0];

            // Crear el objeto con los datos a actualizar
            let updatedData = {
              empresa: empresa,
              name: name,
              numeroTelefono: numeroTelefono,
            };

            if (imagenFile) {
              // Crear una referencia en Storage
              const storageRef = storage.ref();
              const imagenRef = storageRef.child(
                `perfiles/${uid}/${Date.now()}_${imagenFile.name}`
              );

              // Subir la imagen
              imagenRef
                .put(imagenFile)
                .then(() => {
                  // Obtener la URL de descarga
                  return imagenRef.getDownloadURL();
                })
                .then((url) => {
                  updatedData.imagenURL = url;

                  // Actualizar los datos en Firestore
                  return userRef.update(updatedData);
                })
                .then(() => {
                  alert("Perfil actualizado exitosamente con la imagen.");
                  // Actualizar la imagen mostrada en el formulario
                  document.getElementById("imagenPerfil").src =
                    updatedData.imagenURL;
                  // Limpiar el input de imagen
                  document.getElementById("perfilImagen").value = "";
                })
                .catch((error) => {
                  console.error("Error al actualizar el perfil:", error);
                  alert("Hubo un error al actualizar el perfil.");
                });
            } else {
              // Si no hay imagen, solo actualizar los demás campos
              userRef
                .update(updatedData)
                .then(() => {
                  alert("Perfil actualizado exitosamente.");
                })
                .catch((error) => {
                  console.error("Error al actualizar el perfil:", error);
                  alert("Hubo un error al actualizar el perfil.");
                });
            }
          } else {
            console.log("No hay usuario autenticado.");
            window.location.href = "login.html";
          }
        });
    } else {
      console.log("No hay usuario autenticado.");
      window.location.href = "login.html";
    }
  });
}

mostrarPerfiil();

////////Pestaña Subir Publicaciones a Firestore////////

// Creación de PUBLICACIONES
const checkboxNombre = document.getElementById("checkboxNombre");
const checkboxEmpresa = document.getElementById("checkboxEmpresa");
const labelNombre = document.getElementById("labelNombre");
const labelEmpresa = document.getElementById("labelEmpresa");
const categoriaSelect = document.getElementById("categoriaSelect");
const subcategoriaSelect = document.getElementById("subcategoriaSelect");
const descripcionTextArea = document.getElementById("descripcion");
const crearPublicacionBtn = document.getElementById("crearPublicacionBtn");
const crearPublicacionForm = document.getElementById("crearPublicacion");

// Función para cargar el perfil del usuario
function cargarPerfil(user) {
  const uid = user.uid;
  const userRef = db.collection("usuarios").doc(uid);

  userRef
    .get()
    .then((doc) => {
      if (doc.exists) {
        const userData = doc.data();

        // Asignar los valores a los labels de los checkboxes
        labelNombre.textContent = userData.name || "Nombre y Apellido";
        labelEmpresa.textContent = userData.empresa || "Empresa";
      } else {
        console.log("No se encontraron datos para este usuario.");
      }
    })
    .catch((error) => {
      console.error("Error al obtener los datos del usuario:", error);
    });
}

// Función para cargar las categorías desde Firestore
function cargarCategorias() {
  cargarOpciones("categorias", categoriaSelect);
}

// Función para cargar las subcategorías
function cargarSubcategorias(categoriaID) {
  if (!categoriaID) {
    subcategoriaSelect.innerHTML =
      '<option value="">Selecciona una subcategoría</option>';
    return;
  }

  db.collection("categorias")
    .doc(categoriaID)
    .collection("subcategorias")
    .get()
    .then((querySnapshot) => {
      subcategoriaSelect.innerHTML =
        '<option value="">Selecciona una subcategoría</option>';

      querySnapshot.forEach((doc) => {
        const subcategoria = doc.data();
        const option = document.createElement("option");
        option.value = doc.id;
        option.textContent = subcategoria.nombre;
        subcategoriaSelect.appendChild(option);
      });
    })
    .catch((error) => {
      console.error("Error al cargar las subcategorías:", error);
    });
}

// Función para manejar la selección de checkboxes
function manejarCheckboxes() {
  checkboxNombre.addEventListener("change", () => {
    if (checkboxNombre.checked) {
      checkboxEmpresa.checked = false;
    }
  });

  checkboxEmpresa.addEventListener("change", () => {
    if (checkboxEmpresa.checked) {
      checkboxNombre.checked = false;
    }
  });
}

// Función para crear una publicación
function crearPublicacion(e) {
  e.preventDefault();

  const user = auth.currentUser;
  if (!user) {
    alert("Debes estar autenticado para crear una publicación.");
    window.location.href = "login.html";
    return;
  }

  // Definir el uid aquí, a partir del usuario autenticado
  const uid = user.uid;

  const categoriaID = categoriaSelect.value;
  const subcategoriaID = subcategoriaSelect.value;
  const descripcion = descripcionTextArea.value.trim();
  const provinciaID = provinciaSelect.value;
  const localidadesSeleccionadas = $("#localidadSelect").val(); // Obtener las localidades seleccionadas con Select2

  // Validaciones
  if (
    !categoriaID ||
    !subcategoriaID ||
    !descripcion ||
    !provinciaID ||
    localidadesSeleccionadas.length === 0
  ) {
    alert("Por favor, completa todos los campos.");
    return;
  }

  // Obtener el número de teléfono y nombreMostrar del usuario desde Firestore
  const userRef = db.collection("usuarios").doc(uid);
  userRef
    .get()
    .then((doc) => {
      if (doc.exists) {
        const userData = doc.data();
        const numeroTelefono = userData.numeroTelefono || "";
        const imagenURL = userData.imagenURL || "";

        // Determinar el valor de nombreMostrar según el checkbox seleccionado
        let nombreMostrar;
        if (checkboxNombre.checked) {
          nombreMostrar = userData.name || "Anónimo"; // Nombre del publicante
        } else if (checkboxEmpresa.checked) {
          nombreMostrar = userData.empresa || "Empresa Desconocida"; // Nombre de la empresa
        } else {
          nombreMostrar = "Anónimo"; // Valor por defecto si ninguno está seleccionado
        }

        // Obtener los códigos postales para las localidades seleccionadas
        const codigosPostalesPromises = localidadesSeleccionadas.map(
          (localidadID) => {
            return db
              .collection("provincias")
              .doc(provinciaID)
              .collection("localidades")
              .doc(localidadID)
              .collection("codigos_postales")
              .get();
          }
        );

        // Esperar todas las promesas de códigos postales
        Promise.all(codigosPostalesPromises)
          .then((snapshots) => {
            const codigosPostales = [];
            snapshots.forEach((snapshot) => {
              if (snapshot.empty) {
                console.log("Snapshot vacío:", snapshot);
              } else {
                snapshot.forEach((doc) => {
                  const data = doc.data();
                  if (data && data.CP) {
                    codigosPostales.push(data.CP); // Agrega el código postal
                  } else {
                    console.error(
                      "No se encontró el código postal en el documento:",
                      doc.id
                    );
                  }
                });
              }
            });

            // Crear el objeto de publicación con todas las localidades y códigos postales
            const publicacionData = {
              nombreMostrar: nombreMostrar,
              categoriaID: categoriaID,
              subcategoriaID: subcategoriaID,
              descripcion: descripcion,
              provinciaID: provinciaID,
              localidades: localidadesSeleccionadas, // Guardar las localidades seleccionadas
              codigosPostales: codigosPostales, // Guardar todos los códigos postales obtenidos
              userUID: uid,
              numeroTelefono: numeroTelefono,
              timestamp: firebase.firestore.FieldValue.serverTimestamp(),
              premium: false,
              imagenURL: imagenURL,
            };

            // Guardar la publicación en Firestore
            db.collection("publicaciones")
              .add(publicacionData)
              .then(() => {
                alert("Publicación creada exitosamente.");
                crearPublicacionForm.reset();
                subcategoriaSelect.innerHTML =
                  '<option value="">Selecciona una subcategoría</option>';
                // Resetear el campo de localidades y Select2
                $("#localidadSelect").val(null).trigger("change");
              })
              .catch((error) => {
                console.error("Error al crear la publicación:", error);
                alert("Hubo un error al crear la publicación.");
              });
          })
          .catch((error) => {
            console.error("Error al obtener los códigos postales:", error);
          });
      } else {
        alert("No se encontraron datos de usuario.");
      }
    })
    .catch((error) => {
      console.error("Error al obtener los datos del usuario:", error);
      alert("Hubo un error al obtener los datos del usuario.");
    });
}

// Función para cargar localidades cuando se selecciona una provincia
function cargarLocalidades(provinciaID) {
  const localidadSelect = document.getElementById("localidadSelect");

  // Limpiar el select antes de cargar nuevas opciones
  localidadSelect.innerHTML = ""; // Vacía las opciones actuales

  // Traer las localidades de Firestore basadas en la provincia seleccionada
  db.collection("provincias")
    .doc(provinciaID)
    .collection("localidades")
    .get()
    .then((querySnapshot) => {
      // Agregar un placeholder al select
      const optionPlaceholder = document.createElement("option");
      optionPlaceholder.value = "";
      optionPlaceholder.textContent = "Selecciona una o más localidades";
      localidadSelect.appendChild(optionPlaceholder);

      // Llenar el select con las localidades traídas de Firestore
      querySnapshot.forEach((doc) => {
        const option = document.createElement("option");
        option.value = doc.id; // ID de la localidad
        option.textContent = doc.data().nombre; // Nombre de la localidad
        localidadSelect.appendChild(option);
      });

      // Inicializar o recargar Select2 sobre el select dinámico
      $("#localidadSelect").select2({
        placeholder: "Selecciona una o más localidades",
        width: "resolve",
      });
    })
    .catch((error) => {
      console.error("Error al cargar localidades:", error);
    });
}

// Evento para capturar la selección de la provincia
document
  .getElementById("provinciaSelect")
  .addEventListener("change", function () {
    const provinciaID = this.value;

    if (provinciaID) {
      // Llamar a la función que carga las localidades con el ID de la provincia seleccionada
      cargarLocalidades(provinciaID);
    } else {
      // Si no hay provincia seleccionada, limpiar el select de localidades
      $("#localidadSelect").empty().trigger("change");
    }
  });

// Inicializar cuando el DOM esté listo
document.addEventListener("DOMContentLoaded", () => {
  manejarCheckboxes();

  auth.onAuthStateChanged((user) => {
    if (user) {
      cargarPerfil(user);
    }
  });

  cargarCategorias();

  categoriaSelect.addEventListener("change", (e) => {
    const categoriaID = e.target.value;
    cargarSubcategorias(categoriaID);
  });

  crearPublicacionForm.addEventListener("submit", crearPublicacion);
});

// Función para cargar provincias
function cargarProvincias() {
  const provinciaSelect = document.getElementById("provinciaSelect");

  db.collection("provincias")
    .get()
    .then((querySnapshot) => {
      querySnapshot.forEach((doc) => {
        const option = document.createElement("option");
        option.value = doc.id; // El ID de la provincia
        option.text = doc.data().nombre; // El nombre de la provincia
        provinciaSelect.appendChild(option);
      });
    })
    .catch((error) => {
      console.error("Error al cargar provincias:", error);
    });
}

document.addEventListener("DOMContentLoaded", cargarProvincias);

const provinciaSelect = document.getElementById("provinciaSelect");
const localidadSelect = document.getElementById("localidadSelect");

provinciaSelect.addEventListener("change", function () {
  const provinciaID = this.value;

  // Limpiar el select de localidades
  localidadSelect.innerHTML =
    '<option value="">Selecciona una localidad</option>';

  if (provinciaID) {
    db.collection("provincias")
      .doc(provinciaID)
      .collection("localidades")
      .get()
      .then((querySnapshot) => {
        querySnapshot.forEach((doc) => {
          const option = document.createElement("option");
          option.value = doc.id; // El ID de la localidad
          option.text = doc.data().nombre; // El nombre de la localidad
          localidadSelect.appendChild(option);
        });
      })
      .catch((error) => {
        console.error("Error al cargar localidades:", error);
      });
  }
});

////////Carga de Publicaciones del Usuario////////

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

// Función para eliminar la publicación
async function eliminarPublicacion(id) {
  try {
    const confirmacion = confirm(
      "¿Estás seguro de que quieres eliminar esta publicación?"
    );
    if (!confirmacion) return;

    await db.collection("publicaciones").doc(id).delete();
    alert("Publicación eliminada con éxito.");

    // Recargar las publicaciones activas
    cargarPublicacionesActivas(window.uidUsuario);
  } catch (error) {
    console.error("Error al eliminar la publicación:", error);
    alert(
      "Hubo un error al intentar eliminar la publicación. Inténtalo de nuevo."
    );
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

// Función para cargar y mostrar las publicaciones activas del usuario autenticado
async function cargarPublicacionesActivas(uid) {
  try {
    if (!uid) {
      console.error("El UID del usuario no está definido.");
      return;
    }

    // Construir la consulta para obtener solo las publicaciones activas del usuario
    let publicacionesRef = db
      .collection("publicaciones")
      .where("userUID", "==", uid); // Filtrar por UID del usuario

    // Realizar la consulta y ordenar por timestamp descendente
    const querySnapshot = await publicacionesRef
      .orderBy("timestamp", "desc")
      .get();

    const contenedorPublicaciones = document.getElementById(
      "seccion-publicacionesActivas"
    );
    contenedorPublicaciones.innerHTML = ""; // Limpiar el contenedor

    if (querySnapshot.empty) {
      contenedorPublicaciones.innerHTML =
        "<p>No tienes publicaciones activas.</p>";
      return;
    }

    // Procesar las publicaciones...
    const publicacionesPromises = querySnapshot.docs.map(async (doc) => {
      const publicacion = doc.data();
      const descripcion = publicacion.descripcion || "Sin descripción.";
      const imagenURL = publicacion.imagenURL || "";
      const nombreMostrar = publicacion.nombreMostrar || "Anónimo";
      const numeroTelefono = publicacion.numeroTelefono || "No disponible";
      const timestamp = publicacion.timestamp
        ? publicacion.timestamp.toDate().toLocaleString()
        : "Sin fecha";

      // Obtener el promedio de calificaciones
      const promedioCalificaciones = await obtenerPromedioCalificaciones(
        doc.id
      );
      const estrellasHTML = generarEstrellas(promedioCalificaciones);

      // Crear el HTML de la publicación
      const publicacionHTML = `
  <div class="col-md-4 mb-4">
    <div class="card h-100" data-id="${doc.id}" style="cursor: pointer;">
      <img src="${imagenURL}" class="card-img-top" alt="Imagen de la publicación">
      <div class="card-body">
        <h5 class="card-title">${nombreMostrar}</h5>
        <p class="card-text">${descripcion}</p>
        <p class="card-text"><small class="text-muted">Teléfono: ${numeroTelefono}</small></p>
        <p class="card-text"><small class="text-muted">Publicado el: ${timestamp}</small></p>
        <div class="calificaciones">
          ${estrellasHTML} (${promedioCalificaciones.toFixed(1)})
        </div>
        <!-- Botón de eliminar publicación -->
        <button class="btn btn-danger btn-sm eliminar-publicacion" data-id="${
          doc.id
        }">Eliminar</button>
      </div>
    </div>
  </div>
`;

      return publicacionHTML;
    });

    const publicacionesHTML = await Promise.all(publicacionesPromises);
    contenedorPublicaciones.innerHTML = publicacionesHTML.join("");

    // Agregar eventos de click a las tarjetas para abrir el modal
    document.querySelectorAll(".card").forEach((card) => {
      card.addEventListener("click", () => {
        const id = card.getAttribute("data-id");
        mostrarModalPublicacion(id);
      });
    });
    // Agregar eventos de click a los botones de eliminar
    document.querySelectorAll(".eliminar-publicacion").forEach((button) => {
      button.addEventListener("click", async (event) => {
        event.stopPropagation(); // Evitar que el click en el botón también abra el modal
        const id = button.getAttribute("data-id");
        eliminarPublicacion(id);
      });
    });
  } catch (error) {
    console.error("Error al cargar tus publicaciones activas:", error);
    const contenedorPublicaciones = document.getElementById("sectionDinamico");
    contenedorPublicaciones.innerHTML =
      "<p>Error al cargar las publicaciones. Intenta de nuevo más tarde.</p>";
  }
}

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
