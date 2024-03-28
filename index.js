const express =  require ("express");
const app = express();
const joi = require("joi");


const {readFile, writeFile} = require("./src/files");

const fs = require("fs"); 

const bodyParser = require("body-parser");
app.use(bodyParser.json());

const PDFDocument = require('pdfkit');
const Joi = require("joi");

app.use(express.json());

//index
app.get("/deportes", (req, res) => {
    //leer archivo 
    const deportes = readFile("./deportes.json")
    res.send(deportes)
}
);

//show
app.get("/deportes/:id", (req, res) => {
    const deportes = readFile("./deportes.json")
    const deporte = deportes.find((deporte) => deporte.id === parseInt(req.params.id));
    if (!deporte) {
        res.status(404).send("el deporte existe");
        return;
    }
    res.send(deporte);
});


//store  
//validar que los datos sean correctos
const deporteSchema = joi.object({
    id: Joi.number().integer().required(),
    code: Joi.string().min(3).max(20).required(),   
    name: Joi.string().min(3).max(50).required(),
    descripcion: Joi.string().min(10).max(200).required(),
    'numero canchas': Joi.number().integer().min(0).max(100).required(),
    'cantidad equipos': Joi.number().integer().min(0).max(50).required(),
  })

// Ruta para agregar una nuevo deporte
app.post("/deportes", (req, res) => {
    const nuevoDeporte = req.body;

    // Validar los datos recibidos
    const { error } = deporteSchema.validate(nuevoDeporte);
    if (error) {
        res.status(400).send(error.details[0].message);
        return;
    }

    // Leer deportes existentes desde el archivo
    const deportes = readFile("./deportes.json");

    // Agregar la nueva planta a la lista de plantas
    deportes.push(nuevoDeporte);

    // Escribir la lista actualizada de deportes
    writeFile("./deportes.json", deportes);

    res.send("deporte agregado correctamente");
});


//Update
// Ruta para actualizar un deporte
app.put("/deportes/:id", (req, res) => {
    const deportes = readFile("./deportes.json");
    const deporteIndex = deportes.findIndex(deporte => deporte.id === parseInt(req.params.id));

    // Verificar si deporte existe 
    if (deporteIndex === -1) {
        res.status(404).send("deporte no existe");
        return;
    }

    // Validar los datos recibidos
    const { error } = deporteSchema.validate(req.body);
    if (error) {
        res.status(400).send(error.details[0].message);
        return;
    }

    // Actualizar  deporte 
   deportes[deporteIndex] = req.body;

    // Escribir la lista actualizada de deportes
    writeFile("./deportes.json", deportes);

    res.send("deporte actualizado correctamente");
});

// Destroy
// Ruta para eliminar un deporte 
app.delete("/deportes/:id", (req, res) => {
    const deportes = readFile("./deportes.json");
    const deportesFiltradas = deportes.filter(deporte => deporte.id !== parseInt(req.params.id));

    // Verificar si el dpeorte  existe
    if (deportes.length === deportesFiltradas.length) {
        res.status(404).send("del deporte no existe");
        return;
    }

    // Escribir la lista actualizada de deportes
    writeFile("./deportes.json",deportesFiltradas);

    res.send("deporte eliminado correctamente");
});



// Define la ruta para generar el PDF
app.get('/pdf', (req, res) => {
    // Leer el archivo JSON
    const deportes = JSON.parse(fs.readFileSync('./deportes.json'));
    
    // Crear un nuevo documento PDF
    const doc = new PDFDocument();
    
    // Escribir los datos de los deportes en el PDF
    deportes.forEach(deporte => {
        doc.text(`ID: ${deporte.id}`);
        doc.text(`Código: ${deporte.code}`);
        doc.text(`Nombre: ${deporte.name}`);
        doc.text(`Descripción: ${deporte.descripcion}`);
        doc.text(`Número de canchas: ${deporte['numero canchas']}`);
        doc.text(`Cantidad de equipos: ${deporte['cantidad equipos']}`);
        doc.moveDown(); // Moverse hacia abajo para la siguiente entrada
        doc.moveDown(); // Dar espacio adicional entre cada entrada
    });
    
    // Finalizar y cerrar el documento PDF
    doc.end();
    
    // Configurar los encabezados de respuesta para indicar que se envía un archivo PDF
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=deportes.pdf');
    
    // Pipe (enviar) el contenido del PDF al cliente (navegador)
    doc.pipe(res);
});


//Levantar el servidor para escuchar por el puerto 3000
app.listen (3000, () => {
    console.log ("listening on port 3000");
})