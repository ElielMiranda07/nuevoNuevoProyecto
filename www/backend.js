// Configuración de Firebase
const firebaseConfig = {
  apiKey: "AIzaSyC-u-ocWR8yo9E-wB1BYYGFkJ2RUIDwhXE",
  authDomain: "nuevonuevoproyecto-2b663.firebaseapp.com",
  projectId: "nuevonuevoproyecto-2b663",
  storageBucket: "nuevonuevoproyecto-2b663.appspot.com",
  messagingSenderId: "20582355687",
  appId: "1:20582355687:web:0593b756191712b9714842",
  measurementId: "G-7VC7BRJFCZ",
};

// Inicializar Firebase
const app = firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// Elementos del DOM
const btnCategorias = document.getElementById("btnCategorias");
const btnSubcategorias = document.getElementById("btnSubcategorias");
const categoriaForm = document.getElementById("categoriaForm");
const subcategoriaForm = document.getElementById("subcategoriaForm");
const categoriaDropdown = document.getElementById("categoriaDropdown");
const btnCargarCategoria = document.getElementById("btnCargarCategoria");
const btnCargarSubcategoria = document.getElementById("btnCargarSubcategoria");

// Mostrar el formulario de categorías
btnCategorias.addEventListener("click", () => {
  categoriaForm.style.display = "block";
  subcategoriaForm.style.display = "none";
});

// Mostrar el formulario de subcategorías y cargar las categorías
btnSubcategorias.addEventListener("click", async () => {
  categoriaForm.style.display = "none";
  subcategoriaForm.style.display = "block";

  // Limpiar dropdown
  categoriaDropdown.innerHTML = `<option value="">Seleccione una categoría</option>`;

  // Obtener las categorías desde Firestore
  const categoriasSnapshot = await db.collection("categorias").get();
  categoriasSnapshot.forEach((doc) => {
    const categoria = doc.data();
    const option = document.createElement("option");
    option.value = doc.id;
    option.textContent = categoria.nombre; // Mostrar el campo "nombre" en el dropdown
    categoriaDropdown.appendChild(option);
  });
});

// Función para cargar una nueva categoría en Firestore
btnCargarCategoria.addEventListener("click", async () => {
  const categoriaID = document.getElementById("categoriaID").value.trim();
  const categoriaNombre = document
    .getElementById("categoriaNombre")
    .value.trim();
  const categoriaIcono = document.getElementById("categoriaIcono").value.trim();

  if (!categoriaID || !categoriaNombre || !categoriaIcono) {
    alert("Por favor, complete todos los campos.");
    return;
  }

  try {
    await db.collection("categorias").doc(categoriaID).set({
      nombre: categoriaNombre,
      icono: categoriaIcono,
      id: categoriaID,
    });

    alert("Categoría agregada con éxito.");

    // Limpiar los inputs
    document.getElementById("categoriaID").value = "";
    document.getElementById("categoriaNombre").value = "";
    document.getElementById("categoriaIcono").value = "";
  } catch (error) {
    console.error("Error al agregar la categoría: ", error);
    alert("Hubo un error al agregar la categoría.");
  }
});

// Función para cargar una nueva subcategoría en Firestore
btnCargarSubcategoria.addEventListener("click", async () => {
  const categoriaSeleccionada = categoriaDropdown.value;
  const subcategoriaNombre = document
    .getElementById("subcategoriaNombre")
    .value.trim();

  if (!categoriaSeleccionada || !subcategoriaNombre) {
    alert("Seleccione una categoría y complete el nombre de la subcategoría.");
    return;
  }

  try {
    await db
      .collection("categorias")
      .doc(categoriaSeleccionada)
      .collection("subcategorias")
      .add({
        nombre: subcategoriaNombre,
      });

    alert("Subcategoría agregada con éxito.");

    // Limpiar el input
    document.getElementById("subcategoriaNombre").value = "";
  } catch (error) {
    console.error("Error al agregar la subcategoría: ", error);
    alert("Hubo un error al agregar la subcategoría.");
  }
});
