import { useState } from 'react';
import { Lock, Download, X } from 'lucide-react';
import { jsPDF } from 'jspdf';
import JSZip from 'jszip';

const API_URL = import.meta.env.DEV ? 'http://localhost:5001' : '';

export default function AdminPanel() {
  const [pin, setPin] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (pin === '08071964') {
      setIsAuthenticated(true);
      fetchOrders();
    } else {
      alert('PIN Incorrecto');
    }
  };

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/projects`);
      const data = await response.json();
      setOrders(data);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateMarkdown = (order: any) => {
    const pdfName = `${order.sujeto_principal.nombre.replace(/\s+/g, '_') || 'Personaje'}_Fotos.pdf`;

    return `# Dossier Narrativo para Cómic (8 Páginas)
**Cliente ID:** ${order.cliente_id}
**Email:** ${order.email}
**Código de Pago:** ${order.codigo_pago}
**Estilo Visual:** ${order.estilo_visual}

## 1. El Protagonista
- **Nombre:** ${order.sujeto_principal.nombre || 'No especificado'}
- **Color de Piel:** ${order.sujeto_principal.color_piel || 'No especificado'}
- **Color de Ojos:** ${order.sujeto_principal.color_ojos || 'No especificado'}
- **Estilo de Cabello:** ${order.sujeto_principal.estilo_cabello || 'No especificado'}
- **Apariencia Física:** ${order.sujeto_principal.apariencia_fisica || 'No especificada'}
- **Frase Célebre:** ${order.sujeto_principal.frase_celebre || 'No especificada'}
- **Foto Principal:** ${order.sujeto_principal.foto_referencia ? `Ver documento adjunto: "${pdfName}" (Sección Protagonista)` : 'Ninguna'}
${order.sujeto_principal.foto_descripcion ? `- **Descripción de IA (Referencia Visual):** ${order.sujeto_principal.foto_descripcion.trim()}` : ''}

## 2. Hitos y Capítulos (Línea de Tiempo)

${order.hitos.map((h: any, i: number) => `### Capítulo ${i + 1}: ${h.titulo} (${h.paginas})
- **Contexto / Entorno:** ${h.entorno || 'No especificado'}
- **Detalles y Narrativa:** ${h.descripcion || 'No especificado'}
- **Foto de Referencia:** ${h.foto_referencia ? `Ver documento adjunto: "${pdfName}" (Sección Capítulo ${i + 1})` : 'Ninguna'}
${h.foto_descripcion ? `- **Descripción de IA (Referencia Visual):** ${h.foto_descripcion.trim()}` : ''}
`).join('\n')}

---
**Instrucciones para NotebookLM (Generación de Slide Deck / Prompts):** 

Actúa como un Director de Arte y Guionista experto. Tu objetivo es transformar este dossier en un **Slide Deck Textual / Guion Panel por Panel** para un cómic de 8 páginas. 

Para CADA escena o panel en el guion, debes generar un bloque llamado **[Midjourney Prompt]**. Este prompt debe ser la MEJOR opción para generar imágenes hiper-realistas o consistentes a la persona real. 

**REGLAS ESTRICTAS PARA GENERAR EL PROMPT (Obligatorio):**
1. **Idioma:** El prompt de la imagen debe estar ESTRICTAMENTE EN INGLÉS, aunque el guion y los diálogos estén en español.
2. **Fórmula de Consistencia:** NO uses el nombre del personaje en el prompt en inglés (Midjourney no sabe quién es). En su lugar, usa siempe su descripción física literal. Toma el **Color de Piel** (${order.sujeto_principal.color_piel || 'no especificado'}), **Ojos** (${order.sujeto_principal.color_ojos || 'no especificado'}), y **Cabello** (${order.sujeto_principal.estilo_cabello || 'no especificado'}) y combínalo con la "Descripción de IA (Referencia Visual)" para describir al sujeto detalladamente en cada escena.
3. **Estilo Visual:** Agrega la frase descriptiva del estilo "${order.estilo_visual}" para mantener el mismo arte gráfico en todo el cómic.
4. **Formato Portrait (Vertical):** Es imperativo que la imagen salga en formato vertical. Todos los prompts deben terminar EXACTAMENTE con los siguientes parámetros: \`--ar 2:3 --v 6.0 --style raw\`

**Ejemplo de formato esperado por Panel:**
**Panel 1:**
- **Narración:** (Texto en español del cómic)
- **Diálogo:** (Texto en español)
- **[Midjourney Prompt]:** *A photorealistic medium shot of a ${order.sujeto_principal.color_piel || 'person'}, with ${order.sujeto_principal.color_ojos || 'eyes'} and ${order.sujeto_principal.estilo_cabello || 'hair'}, wearing [ropa descrita por la IA], standing in [entorno], ${order.estilo_visual} style, highly detailed, dramatic lighting --ar 2:3 --v 6.0 --style raw*`;
  };

  const downloadPackage = async (order: any) => {
    const baseName = order.sujeto_principal.nombre.replace(/\s+/g, '_') || 'Personaje';
    
    // 1. Descargar MD
    const mdBlob = new Blob([generateMarkdown(order)], { type: 'text/markdown;charset=utf-8' });
    const mdUrl = URL.createObjectURL(mdBlob);
    const mdLink = document.createElement('a');
    mdLink.href = mdUrl;
    mdLink.download = `${baseName}_${order.codigo_pago}.md`;
    mdLink.click();
    URL.revokeObjectURL(mdUrl);

    // 2. Generar y Descargar PDF con Fotos
    const hasPhotos = order.sujeto_principal.foto_referencia || order.hitos.some((h: any) => h.foto_referencia);
    if (!hasPhotos) return;

    const pdf = new jsPDF();
    let pageIndex = 1;
    
    const addImageToPdf = async (url: string, title: string) => {
      return new Promise((resolve) => {
        const img = new Image();
        img.crossOrigin = "Anonymous";
        img.onload = () => {
          try {
            const canvas = document.createElement('canvas');
            const MAX_DIM = 1200;
            let targetWidth = img.width;
            let targetHeight = img.height;
            
            if (targetWidth > MAX_DIM || targetHeight > MAX_DIM) {
              const ratio = Math.min(MAX_DIM / targetWidth, MAX_DIM / targetHeight);
              targetWidth = Math.round(targetWidth * ratio);
              targetHeight = Math.round(targetHeight * ratio);
            }
            
            canvas.width = targetWidth;
            canvas.height = targetHeight;
            const ctx = canvas.getContext('2d');
            if (!ctx) return resolve(false);
            
            ctx.fillStyle = '#FFFFFF';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(img, 0, 0, targetWidth, targetHeight);
            
            const base64Data = canvas.toDataURL('image/jpeg', 0.8);
            
            if (pageIndex > 1) pdf.addPage();
            pdf.setFontSize(16);
            pdf.text(title, 20, 20);
            
            const pageWidth = pdf.internal.pageSize.getWidth() - 40;
            const pageHeight = pdf.internal.pageSize.getHeight() - 40;
            const imgRatio = img.width / img.height;
            
            let finalWidth = pageWidth;
            let finalHeight = finalWidth / imgRatio;
            
            if (finalHeight > pageHeight) {
              finalHeight = pageHeight;
              finalWidth = finalHeight * imgRatio;
            }
            
            pdf.addImage(base64Data, 'JPEG', 20, 30, finalWidth, finalHeight);
            pageIndex++;
            resolve(true);
          } catch (e) {
            console.error('Error rendering image', e);
            resolve(false);
          }
        };
        img.onerror = () => resolve(false);
        img.src = `${API_URL}${url}`;
      });
    };

    if (order.sujeto_principal.foto_referencia) {
      await addImageToPdf(order.sujeto_principal.foto_referencia, `1. El Protagonista: ${order.sujeto_principal.nombre}`);
    }
    
    for (let i = 0; i < order.hitos.length; i++) {
      if (order.hitos[i].foto_referencia) {
        await addImageToPdf(order.hitos[i].foto_referencia, `Capitulo ${i + 1}: ${order.hitos[i].titulo}`);
      }
    }
    
    pdf.save(`${baseName}_Fotos_${order.codigo_pago}.pdf`);
  };

  const downloadRawPhotos = async (order: any) => {
    const urls: string[] = [];
    if (order.sujeto_principal.foto_referencia) urls.push(order.sujeto_principal.foto_referencia);
    order.hitos.forEach((h: any) => {
      if (h.foto_referencia) urls.push(h.foto_referencia);
    });

    if (urls.length === 0) {
      alert("Esta orden no tiene fotos originales.");
      return;
    }

    try {
      const zip = new JSZip();
      
      for (let i = 0; i < urls.length; i++) {
        const response = await fetch(`${API_URL}${urls[i]}`);
        const blob = await response.blob();
        const ext = urls[i].split('.').pop() || 'jpg';
        const filename = `${order.codigo_pago}_RAW_${i + 1}.${ext}`;
        zip.file(filename, blob);
      }
      
      const zipContent = await zip.generateAsync({ type: 'blob' });
      const zipUrl = URL.createObjectURL(zipContent);
      const a = document.createElement('a');
      a.href = zipUrl;
      a.download = `${order.codigo_pago}_FotosRAW.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(zipUrl);
    } catch (err) {
      console.error("Error al descargar fotos", err);
      alert("Hubo un error al generar el archivo ZIP de las fotos.");
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-neutral-950 flex items-center justify-center p-4">
        <form onSubmit={handleLogin} className="bg-neutral-900 border border-neutral-800 p-8 rounded-3xl w-full max-w-sm shadow-2xl">
          <div className="w-16 h-16 bg-purple-500/10 text-purple-400 rounded-full flex items-center justify-center mx-auto mb-6">
            <Lock className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-white text-center mb-6">Acceso Admin</h2>
          <input 
            type="password" 
            value={pin}
            onChange={e => setPin(e.target.value)}
            placeholder="Introduce tu PIN"
            className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 mb-4 text-center tracking-widest text-lg"
          />
          <button type="submit" className="w-full bg-purple-600 hover:bg-purple-500 text-white font-bold py-3 rounded-xl transition-colors">
            Entrar
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-50 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center gap-3">
              <Lock className="text-purple-400" /> Panel de Control Administrativo
            </h1>
            <p className="text-neutral-400 mt-2">Gestiona los pedidos de cómics y descarga los archivos de los clientes.</p>
          </div>
          <button onClick={() => window.location.hash = ''} className="text-neutral-400 hover:text-white flex items-center gap-2">
            <X className="w-5 h-5" /> Salir
          </button>
        </div>

        {loading ? (
          <div className="text-center py-20 text-purple-400">Cargando órdenes...</div>
        ) : (
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden shadow-2xl">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-neutral-950 text-neutral-400 text-sm uppercase tracking-wider">
                  <th className="p-4 font-medium">Código</th>
                  <th className="p-4 font-medium">Cliente / Email</th>
                  <th className="p-4 font-medium">Protagonista</th>
                  <th className="p-4 font-medium">Archivos</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-800">
                {orders.map(order => (
                  <tr key={order._id} className="hover:bg-neutral-800/50 transition-colors">
                    <td className="p-4">
                      <span className="font-mono text-purple-400 font-bold bg-purple-500/10 px-2 py-1 rounded">
                        {order.codigo_pago}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="text-white font-medium">{order.email}</div>
                      <div className="text-xs text-neutral-500">{new Date(order.createdAt || Date.now()).toLocaleDateString()}</div>
                    </td>
                    <td className="p-4">
                      <div className="text-white font-medium">{order.sujeto_principal.nombre}</div>
                      <div className="text-xs text-neutral-400">{order.estilo_visual}</div>
                    </td>
                    <td className="p-4">
                      <div className="flex gap-2">
                        <button 
                          onClick={() => downloadPackage(order)}
                          className="bg-neutral-800 hover:bg-neutral-700 text-white px-3 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors"
                          title="Bajar Guion (MD) y Referencias (PDF)"
                        >
                          <Download className="w-4 h-4" /> Dossier
                        </button>
                        <button 
                          onClick={() => downloadRawPhotos(order)}
                          className="bg-purple-900/50 hover:bg-purple-800/50 text-purple-300 px-3 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors border border-purple-800/30"
                          title="Descargar fotos originales"
                        >
                          <Download className="w-4 h-4" /> Fotos RAW
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {orders.length === 0 && (
                  <tr>
                    <td colSpan={4} className="p-8 text-center text-neutral-500">No hay órdenes pendientes.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
