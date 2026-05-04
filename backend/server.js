const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { GoogleGenAI } = require('@google/genai');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

// Configuración de Multer para subir imágenes localmente
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const dataDir = path.join(__dirname, 'data');
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    const uploadDir = path.join(dataDir, 'uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

// Middlewares
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'data', 'uploads')));

// DB File helper
const DB_FILE = path.join(__dirname, 'data', 'db.json');
const getProjects = () => {
  if (!fs.existsSync(DB_FILE)) return [];
  const data = fs.readFileSync(DB_FILE, 'utf-8');
  return data ? JSON.parse(data) : [];
};
const saveProject = (project) => {
  const projects = getProjects();
  project._id = Date.now().toString();
  project.createdAt = new Date().toISOString();
  projects.push(project);
  fs.writeFileSync(DB_FILE, JSON.stringify(projects, null, 2));
  return project;
};

// Rutas de la API

// 1. Crear un nuevo proyecto
app.post('/api/projects', (req, res) => {
  try {
    const savedProject = saveProject(req.body);
    res.status(201).json(savedProject);
  } catch (error) {
    console.error('Error al guardar proyecto:', error);
    res.status(500).json({ error: 'Error al crear el proyecto' });
  }
});

// 2. Subir una imagen
app.post('/api/upload', upload.single('image'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No se subió ningún archivo' });
    }
    const imageUrl = `/uploads/${req.file.filename}`;
    res.status(200).json({ url: imageUrl, filename: req.file.filename });
  } catch (error) {
    res.status(500).json({ error: 'Error al procesar la imagen' });
  }
});

// 2.5 Analizar imagen con IA
app.post('/api/analyze-image', async (req, res) => {
  try {
    const { filename } = req.body;
    if (!filename) return res.status(400).json({ error: 'Falta el nombre del archivo' });
    
    if (!process.env.GEMINI_API_KEY) {
      return res.status(200).json({ description: '(IA no configurada: Agrega GEMINI_API_KEY al archivo .env del backend para activar las descripciones automáticas)' });
    }

    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    const filePath = path.join(__dirname, 'data', 'uploads', filename);
    
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'Archivo no encontrado' });
    }

    const ext = path.extname(filename).toLowerCase();
    let mimeType = 'image/jpeg';
    if (ext === '.png') mimeType = 'image/png';
    else if (ext === '.webp') mimeType = 'image/webp';
    else if (ext === '.heic') mimeType = 'image/heic';

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [
        {
          role: 'user',
          parts: [
            { text: "Describe a la persona o el entorno principal de esta foto en detalle físico (color de piel, cabello, ropa, etc.) para crear un prompt de dibujo." },
            {
              inlineData: {
                data: fs.readFileSync(filePath).toString("base64"),
                mimeType: mimeType
              }
            }
          ]
        }
      ]
    });

    res.status(200).json({ description: response.text });
  } catch (error) {
    console.error('Error en AI:', error);
    res.status(500).json({ description: '(Error al analizar con IA)' });
  }
});

// 3. Obtener todos los proyectos
app.get('/api/projects', (req, res) => {
  try {
    const projects = getProjects().sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    res.status(200).json(projects);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener proyectos' });
  }
});
// 4. Servir el Frontend (React)
const frontendDistPath = path.join(__dirname, '../frontend/dist');
app.use(express.static(frontendDistPath));

app.get(/^(.*)$/, (req, res) => {
  res.sendFile(path.join(frontendDistPath, 'index.html'));
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor Backend corriendo en http://localhost:${PORT}`);
});
