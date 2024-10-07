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

// Mostrar Información de Perfil - Actualizar

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

// Creacion de PUBLICACIONES

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

        // Opcional: Mostrar una imagen de perfil si la tienes
        // Por ejemplo, si tienes un campo 'imagenURL' en Firestore
        /*
      if (userData.imagenURL) {
        // Podrías agregar una imagen al formulario si lo deseas
        const img = document.createElement('img');
        img.src = userData.imagenURL;
        img.alt = "Imagen de Perfil";
        img.classList.add('img-thumbnail', 'mb-3');
        img.style.maxWidth = "200px";
        img.style.maxHeight = "200px";
        crearPublicacionForm.prepend(img);
      }
      */
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
  db.collection("categorias")
    .get()
    .then((querySnapshot) => {
      querySnapshot.forEach((doc) => {
        const categoria = doc.data();
        const categoriaID = doc.id; // Usar el ID del documento
        const nombreCategoria = categoria.nombre;
        const iconoCategoria = categoria.icono; // Asumiendo que tienes un campo 'icono'

        // Crear una opción con el icono y nombre de la categoría
        const option = document.createElement("option");
        option.value = categoriaID;
        option.textContent = nombreCategoria; // Puedes mejorar esto para incluir iconos
        categoriaSelect.appendChild(option);
      });
    })
    .catch((error) => {
      console.error("Error al cargar las categorías:", error);
    });
}

// Función para cargar las subcategorías basadas en la categoría seleccionada
function cargarSubcategorias(categoriaID) {
  if (!categoriaID) {
    subcategoriaSelect.innerHTML =
      '<option value="">Selecciona una subcategoría</option>';
    return;
  }

  // Referencia a la subcolección 'subcategorias' dentro del documento de la categoría
  db.collection("categorias")
    .doc(categoriaID)
    .collection("subcategorias")
    .get()
    .then((querySnapshot) => {
      // Limpiar el dropdown de subcategorías
      subcategoriaSelect.innerHTML =
        '<option value="">Selecciona una subcategoría</option>';

      querySnapshot.forEach((doc) => {
        const subcategoria = doc.data();
        const subcategoriaID = doc.id;
        const nombreSubcategoria = subcategoria.nombre;

        const option = document.createElement("option");
        option.value = subcategoriaID;
        option.textContent = nombreSubcategoria;
        subcategoriaSelect.appendChild(option);
      });
    })
    .catch((error) => {
      console.error("Error al cargar las subcategorías:", error);
    });
}

// Función para manejar la selección de checkboxes (solo uno seleccionado)
function manejarCheckboxes() {
  checkboxNombre.addEventListener("change", () => {
    if (checkboxNombre.checked) {
      checkboxEmpresa.checked = false;
    } else {
      // Si ninguno está seleccionado, podrías seleccionar uno por defecto
      // checkboxNombre.checked = true;
    }
  });

  checkboxEmpresa.addEventListener("change", () => {
    if (checkboxEmpresa.checked) {
      checkboxNombre.checked = false;
    } else {
      // Si ninguno está seleccionado, podrías seleccionar uno por defecto
      // checkboxEmpresa.checked = true;
    }
  });
}

// Función para crear una nueva publicación en Firestore
function crearPublicacion(e) {
  e.preventDefault();

  const user = auth.currentUser;
  if (!user) {
    alert("Debes estar autenticado para crear una publicación.");
    window.location.href = "login.html";
    return;
  }

  const uid = user.uid;
  const categoriaID = categoriaSelect.value;
  const subcategoriaID = subcategoriaSelect.value;
  const descripcion = descripcionTextArea.value.trim();

  // Validaciones
  if (!categoriaID) {
    alert("Por favor, selecciona una categoría.");
    return;
  }

  if (!subcategoriaID) {
    alert("Por favor, selecciona una subcategoría.");
    return;
  }

  if (!descripcion) {
    alert("Por favor, ingresa una descripción.");
    return;
  }

  // Determinar qué nombre mostrar
  let nombreMostrar = "";
  if (checkboxNombre.checked) {
    nombreMostrar = labelNombre.textContent;
  } else if (checkboxEmpresa.checked) {
    nombreMostrar = labelEmpresa.textContent;
  } else {
    alert("Por favor, selecciona cómo quieres mostrar tu nombre.");
    return;
  }

  // Obtener el número de teléfono del usuario desde Firestore
  const userRef = db.collection("usuarios").doc(uid);
  userRef
    .get()
    .then((doc) => {
      if (doc.exists) {
        const userData = doc.data();
        const numeroTelefono = userData.numeroTelefono || "";

        // Crear el objeto de publicación
        const publicacionData = {
          nombreMostrar: nombreMostrar,
          categoriaID: categoriaID,
          subcategoriaID: subcategoriaID,
          descripcion: descripcion,
          userUID: uid,
          numeroTelefono: numeroTelefono,
          timestamp: firebase.firestore.FieldValue.serverTimestamp(),
        };

        // Agregar la publicación a Firestore
        db.collection("publicaciones")
          .add(publicacionData)
          .then(() => {
            alert("Publicación creada exitosamente.");
            // Limpiar el formulario
            crearPublicacionForm.reset();
            // Opcional: Resetear subcategorías
            subcategoriaSelect.innerHTML =
              '<option value="">Selecciona una subcategoría</option>';
          })
          .catch((error) => {
            console.error("Error al crear la publicación:", error);
            alert("Hubo un error al crear la publicación.");
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

// Inicializar todo cuando el DOM esté listo
document.addEventListener("DOMContentLoaded", () => {
  // Manejar los checkboxes
  manejarCheckboxes();

  // Cargar el perfil del usuario si está autenticado
  auth.onAuthStateChanged((user) => {
    if (user) {
      cargarPerfil(user);
    }
  });

  // Cargar las categorías desde Firestore
  cargarCategorias();

  // Manejar el cambio en la selección de categorías para cargar subcategorías
  categoriaSelect.addEventListener("change", (e) => {
    const categoriaID = e.target.value;
    cargarSubcategorias(categoriaID);
  });

  // Manejar el envío del formulario para crear una publicación
  crearPublicacionForm.addEventListener("submit", crearPublicacion);
});
