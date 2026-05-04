const mongoose = require('mongoose');

const ComicProjectSchema = new mongoose.Schema({
  cliente_id: { 
    type: String, 
    required: true 
  },
  email: { type: String, required: true },
  codigo_pago: { type: String, required: true },
  pago_confirmado: { type: Boolean, default: false },
  sujeto_principal: {
    nombre: { type: String, required: true },
    apariencia_fisica: { type: String, required: true },
    frase_celebre: { type: String }
  },
  estilo_visual: { 
    type: String, 
    enum: ['cinematic', 'comic', 'manga', 'noir'], 
    default: 'cinematic' 
  },
  hitos_narrativos: [{
    capitulo: { type: Number },
    titulo_etapa: { type: String },
    entorno: { type: String },
    descripcion: { type: String },
    foto_referencia: { type: String } // URL of the uploaded image
  }],
  assets: {
    fotos_referencia_generales: [{ type: String }],
    audio_voz: { type: String } // Opcional para ElevenLabs
  },
  estado: { 
    type: String, 
    enum: ['Borrador', 'Listo', 'En Producción'], 
    default: 'Borrador' 
  }
}, { timestamps: true });

module.exports = mongoose.model('ComicProject', ComicProjectSchema);
