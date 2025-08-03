// importFirestore.js

const admin = require("firebase-admin");
const fs = require("fs");
const path = require("path");

// Ruta al archivo JSON limpio
const inputPath = path.join(__dirname, "transformedDataFinalFinal.json"); // Asegúrate de que este nombre coincida
// Ruta al archivo de claves de servicio de Firebase
const serviceAccountPath = path.join(
  __dirname,
  "nuevonuevoproyecto-2b663-firebase-adminsdk-1azmo-1d720337c7.json"
); // Asegúrate de que este nombre coincida

// Inicializar Firebase Admin SDK
admin.initializeApp({
  credential: admin.credential.cert(serviceAccountPath),
});

const db = admin.firestore();

// Leer y parsear el archivo JSON
let data = {};
try {
  const rawData = fs.readFileSync(inputPath, "utf-8");
  data = JSON.parse(rawData);
} catch (error) {
  console.error("Error al leer o parsear el archivo JSON:", error);
  process.exit(1);
}

// Función para importar los datos a Firestore
async function importData() {
  const batchSize = 500; // Firestore permite hasta 500 operaciones por batch
  let batch = db.batch();
  let count = 0;

  for (const provincia of data.provincias) {
    // Crear documento para la provincia
    const provinciaRef = db.collection("provincias").doc(provincia.nombre); // Usar el nombre como ID si es único
    batch.set(provinciaRef, { nombre: provincia.nombre });
    count++;

    for (const localidad of provincia.localidades) {
      // Crear documento para la localidad dentro de la provincia
      const localidadRef = provinciaRef
        .collection("localidades")
        .doc(localidad.nombre); // Usar el nombre como ID si es único
      batch.set(localidadRef, { nombre: localidad.nombre });
      count++;

      for (const cp of localidad.codigos_postales) {
        // Crear documento para el código postal dentro de la localidad
        const cpRef = localidadRef
          .collection("codigos_postales")
          .doc(cp.toString()); // Usar el CP como ID
        batch.set(cpRef, { CP: cp });
        count++;

        // Si alcanzamos el tamaño del batch, realizar commit
        if (count === batchSize) {
          await batch.commit();
          console.log(`Commit realizado con ${batchSize} operaciones.`);
          // Resetear el batch y el contador
          batch = db.batch();
          count = 0;
        }
      }
    }
  }

  // Commit de cualquier operación restante
  if (count > 0) {
    await batch.commit();
    console.log(`Commit final realizado con ${count} operaciones.`);
  }

  console.log("Importación a Firestore completada.");
}

// Ejecutar la función de importación
importData().catch((error) => {
  console.error("Error durante la importación a Firestore:", error);
});
