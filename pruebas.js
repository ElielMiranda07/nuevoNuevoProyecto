let userEmpresa = "";

let userNombre = "";

let userMail = "";

let userTelefono = "";

let userFotoPerfil;


auth.onAuthStateChanged((user) => {
    if (user) {
        const uid = user.uid;

        const userRef = db.collection("usuarios").doc(uid);

        userRef
            .get()
            .then((doc) => {
                if (doc.exists) {
                    const userData = doc.data();

                    userEmpresa = userData.empresa || "";

                    userNombre = userData.name || "";

                    userMail = userData.mail || "";

                    userTelefono = userData.numeroTelefono || "";

                    if (userData.imagenURL) {
                        userFotoPerfil = userData.imagenURL;
                      } else {
                        userFotoPerfil = "ruta/a/imagen/default.png";
                      }
                    } else {
                      console.log("No se encontraron datos para este usuario.");
                    }
                })
                .catch((error) => {
                    console.error("Error al obtener los datos del usuario:", error);
                  });
            }
    }
);

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

const sectionDinamico = document.getElementById("sectionDinamico");

const informacionPerfil = document.getElementById("informacionPerfil");

informacionPerfil.addEventListener("click", function (event) {
  event.preventDefault();

  sectionDinamico.innerHTML = "";

  sectionDinamico.innerHTML = `
    <article class="articleInfoPerfil">
          <form action="" class="d-flex flex-column col-6" id="infoDePerfil">
            <div class="input-group input-group-sm mb-3">
              <span class="input-group-text" id="inputGroup-sizing-sm"
                >Empresa</span
              >
              <input
                type="text"
                class="form-control"
                aria-label="Sizing example input"
                aria-describedby="inputGroup-sizing-sm"
                id="perfilEmpresa"
                value=""
              />
            </div>
            <div class="input-group input-group-sm mb-3">
              <span class="input-group-text" id="inputGroup-sizing-sm"
                >Nombre y Apellido</span
              >
              <input
                type="text"
                class="form-control"
                aria-label="Sizing example input"
                aria-describedby="inputGroup-sizing-sm"
                id="perfilName"
                value=""
              />
            </div>
            <div class="input-group input-group-sm mb-3">
              <span class="input-group-text" id="inputGroup-sizing-sm"
                >Mail</span
              >
              <input
                type="text"
                class="form-control"
                aria-label="Sizing example input"
                aria-describedby="inputGroup-sizing-sm"
                id="perfilMail"
                value=""
                disabled
              />
            </div>
            <div class="input-group input-group-sm mb-3">
              <span class="input-group-text" id="inputGroup-sizing-sm"
                >Número de Teléfono</span
              >
              <input
                type="text"
                class="form-control"
                aria-label="Sizing example input"
                aria-describedby="inputGroup-sizing-sm"
                id="perfilNumeroTelefono"
                value=""
              />
            </div>

            <!-- Contenedor para mostrar la imagen de perfil actual -->
            <div class="mb-3">
              <span class="input-group-text" id="inputGroup-sizing-sm"
                >Imagen Actual</span
              >
              <img
                src=""
                alt="Imagen de Perfil"
                id="imagenPerfil"
                class="img-thumbnail mt-2"
                style="max-width: 200px; max-height: 200px"
              />
            </div>

            <div class="input-group input-group-sm mb-3">
              <span class="input-group-text" id="inputGroup-sizing-sm"
                >Imagen Nueva</span
              >
              <input
                type="file"
                class="form-control"
                aria-label="Sizing example input"
                aria-describedby="inputGroup-sizing-sm"
                id="perfilImagen"
                accept="image/*"
              />
            </div>
            <button class="btn btn-primary" id="actualizarPerfil">
              Actualizar perfil
            </button>
          </form>
        </article>
    `;

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
                document.getElementById("perfilName").value =
                  userData.name || "";
                document.getElementById("perfilMail").value =
                  userData.email || "";
                document.getElementById("perfilNumeroTelefono").value =
                  userData.numeroTelefono || "";

                // Mostrar la imagen de perfil si existe
                if (userData.imagenURL) {
                  document.getElementById("imagenPerfil").src =
                    userData.imagenURL;
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
                const imagenFile =
                  document.getElementById("perfilImagen").files[0];

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
    }),

});
