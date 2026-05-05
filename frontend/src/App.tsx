import { useState } from 'react';
import { Camera, BookOpen, Sparkles, Image as ImageIcon, ChevronRight, User, History, Palette, CheckCircle2 } from 'lucide-react';

type Step = 1 | 2 | 3 | 4;

const API_URL = import.meta.env.DEV ? 'http://localhost:5001' : '';

export default function App() {
  const [currentStep, setCurrentStep] = useState<Step>(1);
  const [codigoPago, setCodigoPago] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // State for Step 1
  const [protagonista, setProtagonista] = useState({
    nombre: '',
    email: '',
    colorPiel: '',
    colorOjos: '',
    estiloCabello: '',
    apariencia: '',
    frase: '',
    foto: '',
    foto_descripcion: ''
  });

  // State for Step 2
  const [hitos, setHitos] = useState([
    { id: 1, titulo: 'El Origen', paginas: 'Pág 1', entorno: '', descripcion: '', foto: '', foto_descripcion: '' },
    { id: 2, titulo: 'Estudios y Formación', paginas: 'Pág 2', entorno: '', descripcion: '', foto: '', foto_descripcion: '' },
    { id: 3, titulo: 'Pasiones y Talentos', paginas: 'Pág 3', entorno: '', descripcion: '', foto: '', foto_descripcion: '' },
    { id: 4, titulo: 'El Mayor Reto', paginas: 'Pág 4-5', entorno: '', descripcion: '', foto: '', foto_descripcion: '' },
    { id: 5, titulo: 'La Gran Victoria', paginas: 'Pág 6', entorno: '', descripcion: '', foto: '', foto_descripcion: '' },
    { id: 6, titulo: 'La Actualidad', paginas: 'Pág 7-8', entorno: '', descripcion: '', foto: '', foto_descripcion: '' }
  ]);

  // State for Step 3
  const [estiloVisual, setEstiloVisual] = useState('cinematic');

  const handleSubmitOrder = async () => {
    if (!protagonista.email || !protagonista.nombre) {
      alert("Por favor ingresa tu correo electrónico y tu nombre en el Paso 1.");
      return;
    }
    setIsSubmitting(true);
    
    // Generar un código único
    const uniqueCode = 'PAY-' + Math.random().toString(36).substr(2, 6).toUpperCase();
    
    const payload = {
      cliente_id: 'CLI-' + Math.floor(Math.random() * 10000),
      email: protagonista.email,
      codigo_pago: uniqueCode,
      pago_confirmado: false,
      sujeto_principal: {
        nombre: protagonista.nombre,
        color_piel: protagonista.colorPiel || 'No especificado',
        color_ojos: protagonista.colorOjos || 'No especificado',
        estilo_cabello: protagonista.estiloCabello || 'No especificado',
        apariencia_fisica: protagonista.apariencia || 'No especificada',
        frase_celebre: protagonista.frase || '',
        foto_referencia: protagonista.foto || '',
        foto_descripcion: protagonista.foto_descripcion || ''
      },
      hitos: hitos.map(h => ({
        titulo: h.titulo,
        paginas: h.paginas,
        entorno: h.entorno || '',
        descripcion: h.descripcion || '',
        foto_referencia: h.foto || '',
        foto_descripcion: h.foto_descripcion || ''
      })),
      estilo_visual: estiloVisual
    };

    try {
      const response = await fetch(`${API_URL}/api/projects`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (response.ok) {
        setCodigoPago(uniqueCode);
        setCurrentStep(4);
      } else {
        alert("Hubo un error al someter la orden. Inténtalo de nuevo.");
      }
    } catch (error) {
      console.error(error);
      alert("Error de conexión con el servidor.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-50 flex flex-col font-sans selection:bg-purple-500/30">
      <header className="border-b border-neutral-800 bg-neutral-900/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-purple-600 p-2 rounded-xl">
              <BookOpen className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              ComicDossier
            </h1>
          </div>
          <div className="flex items-center gap-2 text-sm text-neutral-400">
            <span>Generador de Historias</span>
            <Sparkles className="w-4 h-4 text-purple-400" />
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-5xl mx-auto w-full px-6 py-12">
        {currentStep !== 4 && (
          <>
            <div className="mb-12">
              <h2 className="text-4xl font-extrabold mb-4">Crea tu Leyenda</h2>
              <p className="text-neutral-400 text-lg max-w-2xl">
                Construye el dossier narrativo de tu protagonista. Capturaremos su esencia,
                sus mayores retos y el tono visual para generar un cómic épico de 8 páginas.
              </p>
            </div>

            <div className="flex items-center gap-4 mb-12">
              <StepIndicator step={1} currentStep={currentStep} icon={<User className="w-5 h-5" />} label="Protagonista" />
              <div className={`flex-1 h-1 rounded-full transition-colors duration-500 ${currentStep >= 2 ? 'bg-purple-600' : 'bg-neutral-800'}`} />
              <StepIndicator step={2} currentStep={currentStep} icon={<History className="w-5 h-5" />} label="Línea de Tiempo" />
              <div className={`flex-1 h-1 rounded-full transition-colors duration-500 ${currentStep >= 3 ? 'bg-purple-600' : 'bg-neutral-800'}`} />
              <StepIndicator step={3} currentStep={currentStep} icon={<Palette className="w-5 h-5" />} label="Atmósfera" />
            </div>
          </>
        )}

        <div className="relative">
          {currentStep === 1 && <Step1 state={protagonista} setState={setProtagonista} onNext={() => setCurrentStep(2)} />}
          {currentStep === 2 && <Step2 state={hitos} setState={setHitos} onNext={() => setCurrentStep(3)} onBack={() => setCurrentStep(1)} />}
          {currentStep === 3 && <Step3 state={estiloVisual} setState={setEstiloVisual} onGenerate={handleSubmitOrder} isSubmitting={isSubmitting} onBack={() => setCurrentStep(2)} />}
          {currentStep === 4 && <Step4 codigoPago={codigoPago} onReset={() => {setCurrentStep(1); setCodigoPago(''); setProtagonista({...protagonista, nombre: '', email: '', foto: ''});}} />}
        </div>
      </main>
    </div>
  );
}

function StepIndicator({ step, currentStep, icon, label }: { step: number, currentStep: number, icon: React.ReactNode, label: string }) {
  const isActive = step === currentStep;
  const isCompleted = step < currentStep;

  return (
    <div className={`flex flex-col items-center gap-2 transition-all duration-300 ${isActive || isCompleted ? 'text-purple-400' : 'text-neutral-600'}`}>
      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-300 ${isActive ? 'bg-purple-600 text-white shadow-[0_0_20px_rgba(147,51,234,0.4)] scale-110' : isCompleted ? 'bg-neutral-800 text-purple-400' : 'bg-neutral-900 border border-neutral-800'}`}>
        {icon}
      </div>
      <span className={`text-sm font-medium ${isActive ? 'text-purple-300' : ''}`}>{label}</span>
    </div>
  );
}

function Step1({ state, setState, onNext }: any) {
  const [uploading, setUploading] = useState(false);

  const handlePhotoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      alert('⚠️ La foto es muy pesada. Por favor, sube una imagen de menos de 2 MB.');
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append('image', file);

    try {
      const response = await fetch(`${API_URL}/api/upload`, {
        method: 'POST',
        body: formData,
      });
      const data = await response.json();
      if (data.url) {
        setState({ ...state, foto: data.url });
        
        // Llamar a IA para analizar
        if (data.filename) {
          try {
            const aiResponse = await fetch(`${API_URL}/api/analyze-image`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ filename: data.filename })
            });
            const aiData = await aiResponse.json();
            if (aiData.description) {
              setState((prev: any) => ({ ...prev, foto_descripcion: aiData.description, foto: data.url }));
            }
          } catch(e) { console.error(e); }
        }
      }
    } catch (error) {
      console.error('Error uploading file:', error);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-8 duration-700">
      <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-8 shadow-2xl">
        <div className="mb-8">
          <h3 className="text-2xl font-bold text-white mb-2">1. El Protagonista</h3>
          <p className="text-neutral-400">Define quién es el héroe de esta historia. ¿Qué lo hace inconfundible?</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-neutral-300">Correo Electrónico *</label>
              <input 
                type="email" 
                value={state.email}
                onChange={e => setState({...state, email: e.target.value})}
                placeholder="Ej. tunombre@email.com" 
                className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all placeholder:text-neutral-600" 
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-neutral-300">Nombre del Protagonista *</label>
              <input 
                type="text" 
                value={state.nombre}
                onChange={e => setState({...state, nombre: e.target.value})}
                placeholder="Ej. Roberto 'El Arquitecto'" 
                className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all placeholder:text-neutral-600" 
              />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-medium text-neutral-300">Color de Piel</label>
                <input 
                  type="text" 
                  value={state.colorPiel}
                  onChange={e => setState({...state, colorPiel: e.target.value})}
                  placeholder="Ej. Trigueña" 
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all placeholder:text-neutral-600 text-sm" 
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-medium text-neutral-300">Color de Ojos</label>
                <input 
                  type="text" 
                  value={state.colorOjos}
                  onChange={e => setState({...state, colorOjos: e.target.value})}
                  placeholder="Ej. Café oscuro" 
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all placeholder:text-neutral-600 text-sm" 
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-medium text-neutral-300">Cabello</label>
                <input 
                  type="text" 
                  value={state.estiloCabello}
                  onChange={e => setState({...state, estiloCabello: e.target.value})}
                  placeholder="Ej. Corto, rizado" 
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all placeholder:text-neutral-600 text-sm" 
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-neutral-300">Rasgo Físico Distintivo</label>
              <textarea 
                value={state.apariencia}
                onChange={e => setState({...state, apariencia: e.target.value})}
                placeholder="Ej. Siempre lleva una gorra de los Cubs y espejuelos..." 
                className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all placeholder:text-neutral-600 h-24 resize-none"
              ></textarea>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-neutral-300">Frase Célebre o Muletilla (Opcional)</label>
              <input 
                type="text" 
                value={state.frase}
                onChange={e => setState({...state, frase: e.target.value})}
                placeholder="Ej. 'Nada es imposible si hay un plan'" 
                className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all placeholder:text-neutral-600" 
              />
            </div>
          </div>

          <div className="space-y-4">
            <label className="text-sm font-medium text-neutral-300">Referencias Visuales</label>
            <label className={`border-2 border-dashed ${state.foto ? 'border-purple-500 bg-purple-500/10' : 'border-neutral-800 bg-neutral-950/50 hover:bg-neutral-800/50 hover:border-purple-500/50'} rounded-2xl h-[250px] flex flex-col items-center justify-center transition-all cursor-pointer group relative overflow-hidden`}>
              <input type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} disabled={uploading} />
              
              {state.foto ? (
                <>
                  <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10">
                    <p className="text-white font-medium">Cambiar Foto</p>
                  </div>
                  <img src={`${API_URL}${state.foto}`} alt="Referencia" className="w-full h-full object-cover" />
                </>
              ) : uploading ? (
                <div className="flex flex-col items-center text-purple-400">
                  <div className="w-8 h-8 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin mb-4"></div>
                  <p className="font-medium text-center">Subiendo y analizando con IA...</p>
                </div>
              ) : (
                <>
                  <div className="bg-neutral-900 p-4 rounded-full mb-4 group-hover:scale-110 transition-transform">
                    <Camera className="w-8 h-8 text-neutral-400 group-hover:text-purple-400" />
                  </div>
                  <p className="text-neutral-300 font-medium">Sube fotos de referencia</p>
                  <p className="text-neutral-500 text-sm mt-1">Arrastra y suelta o haz clic (Max 2 MB)</p>
                </>
              )}
            </label>
          </div>
        </div>

        <div className="mt-10 flex justify-end">
          <button onClick={onNext} className="bg-purple-600 hover:bg-purple-500 text-white px-8 py-3 rounded-xl font-medium flex items-center gap-2 transition-all hover:gap-3 hover:shadow-[0_0_20px_rgba(147,51,234,0.4)]">
            Continuar a la Línea de Tiempo
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}

function Step2({ state, setState, onNext, onBack }: any) {
  const [uploadingIdx, setUploadingIdx] = useState<number | null>(null);

  const updateHito = (index: number, field: string, value: string) => {
    setState((prevHitos: any[]) => {
      const newHitos = [...prevHitos];
      newHitos[index] = { ...newHitos[index], [field]: value };
      return newHitos;
    });
  };

  const handlePhotoUpload = async (index: number, event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      alert('⚠️ La foto es muy pesada. Por favor, sube una imagen de menos de 2 MB.');
      return;
    }

    setUploadingIdx(index);
    const formData = new FormData();
    formData.append('image', file);

    try {
      const response = await fetch(`${API_URL}/api/upload`, {
        method: 'POST',
        body: formData,
      });
      const data = await response.json();
      if (data.url) {
        updateHito(index, 'foto', data.url);
        
        // Llamar a IA para analizar
        if (data.filename) {
          try {
            const aiResponse = await fetch(`${API_URL}/api/analyze-image`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ filename: data.filename })
            });
            const aiData = await aiResponse.json();
            if (aiData.description) {
              updateHito(index, 'foto_descripcion', aiData.description);
            }
          } catch(e) { console.error(e); }
        }
      }
    } catch (error) {
      console.error('Error uploading file:', error);
    } finally {
      setUploadingIdx(null);
    }
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-8 duration-700">
      <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-8 shadow-2xl">
        <div className="mb-8">
          <h3 className="text-2xl font-bold text-white mb-2">2. La Línea de Tiempo</h3>
          <p className="text-neutral-400">Estructura las 8 páginas del cómic con los hitos más importantes de su vida.</p>
        </div>

        <div className="flex flex-col space-y-6 relative before:absolute before:inset-0 before:ml-6 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-purple-500/50 before:to-transparent">
          
          {state.map((hito: any, idx: number) => (
            <div key={hito.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
              <div className="flex items-center justify-center w-12 h-12 rounded-full border-4 border-neutral-900 bg-neutral-800 group-hover:bg-purple-600 transition-colors shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 absolute left-0 md:left-1/2 z-10">
                <span className="font-bold text-neutral-400 group-hover:text-white">{hito.id}</span>
              </div>
              <div className={`w-[calc(100%-4rem)] md:w-[calc(50%-3rem)] p-6 rounded-2xl border border-neutral-800 bg-neutral-950/80 group-hover:border-purple-500/30 transition-colors ml-auto ${idx % 2 === 0 ? 'md:ml-0 md:mr-auto' : 'md:ml-auto md:mr-0'}`}>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-bold text-white group-hover:text-purple-400 transition-colors text-lg">{hito.titulo}</h4>
                  <span className="text-xs font-medium px-2 py-1 bg-neutral-800 text-neutral-400 rounded-md">{hito.paginas}</span>
                </div>
                <input 
                  type="text" 
                  value={hito.entorno}
                  onChange={(e) => updateHito(idx, 'entorno', e.target.value)}
                  placeholder={idx === 3 ? "¿Cuál fue su mayor reto o conflicto?" : "Título/Contexto de esta etapa"} 
                  className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-purple-500 mb-3" 
                />
                <textarea 
                  value={hito.descripcion}
                  onChange={(e) => updateHito(idx, 'descripcion', e.target.value)}
                  placeholder={idx === 3 ? "Aliados (Ej. María, Juan, un equipo)" : "Detalles, anécdotas o entorno..."} 
                  className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-purple-500 h-16 resize-none"
                ></textarea>
                <label 
                  className={`mt-4 border-2 border-dashed ${hito.foto ? 'border-purple-500 bg-purple-500/10' : 'border-neutral-800 bg-neutral-900/50 hover:bg-neutral-800/50 hover:border-purple-500/50'} rounded-xl p-3 flex flex-col items-center justify-center transition-all cursor-pointer group/photo relative overflow-hidden h-24`}
                >
                  <input type="file" accept="image/*" className="hidden" onChange={(e) => handlePhotoUpload(idx, e)} disabled={uploadingIdx === idx} />
                  
                  {uploadingIdx === idx ? (
                    <div className="flex flex-col items-center text-purple-400">
                      <div className="w-5 h-5 border-2 border-purple-500/30 border-t-purple-500 rounded-full animate-spin mb-1"></div>
                      <span className="text-xs font-medium text-center">IA Analizando...</span>
                    </div>
                  ) : hito.foto ? (
                    <>
                      <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center opacity-0 group-hover/photo:opacity-100 transition-opacity z-10">
                        <span className="text-xs text-white font-medium">Cambiar</span>
                      </div>
                      <img src={`${API_URL}${hito.foto}`} alt="Foto etapa" className="w-full h-full object-cover absolute inset-0 opacity-80" />
                      <CheckCircle2 className="w-5 h-5 text-green-400 mb-1 z-0 relative shadow-black drop-shadow-md" />
                      <span className="text-xs text-white font-bold z-0 relative shadow-black drop-shadow-md">Foto Subida</span>
                    </>
                  ) : (
                    <>
                      <Camera className="w-5 h-5 text-neutral-500 group-hover/photo:text-purple-400 mb-1 transition-colors" />
                      <span className="text-xs text-neutral-500 font-medium group-hover/photo:text-purple-300 text-center px-1">Añadir foto (Max 2 MB)</span>
                    </>
                  )}
                </label>
              </div>
            </div>
          ))}

        </div>

        <div className="mt-10 flex justify-between">
          <button onClick={onBack} className="text-neutral-400 hover:text-white px-6 py-3 rounded-xl font-medium transition-colors">
            Volver
          </button>
          <button onClick={onNext} className="bg-purple-600 hover:bg-purple-500 text-white px-8 py-3 rounded-xl font-medium flex items-center gap-2 transition-all hover:gap-3 hover:shadow-[0_0_20px_rgba(147,51,234,0.4)]">
            Definir Atmósfera
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}

function Step3({ state, setState, onGenerate, isSubmitting, onBack }: any) {
  const styles = [
    { id: 'cinematic', name: 'Cinematic', desc: 'Realismo épico e iluminación dramática', bg: 'bg-gradient-to-br from-blue-900 to-black', border: 'border-blue-500', image: '/styles/cinematic.png' },
    { id: 'comic', name: 'Comic Book', desc: 'Estilo clásico con colores vibrantes y tintas', bg: 'bg-gradient-to-br from-red-600 to-yellow-500', border: 'border-yellow-400', image: '/styles/comic.png' },
    { id: 'manga', name: 'Manga', desc: 'Blanco y negro con tramas dinámicas', bg: 'bg-gradient-to-br from-neutral-700 to-neutral-950', border: 'border-white', image: '/styles/manga.png' },
    { id: 'noir', name: 'Noir', desc: 'Contraste alto, sombras duras y misterio', bg: 'bg-gradient-to-br from-zinc-900 to-black', border: 'border-zinc-500', image: '/styles/noir.png' }
  ];

  return (
    <div className="animate-in fade-in slide-in-from-bottom-8 duration-700">
      <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-8 shadow-2xl">
        <div className="mb-8">
          <h3 className="text-2xl font-bold text-white mb-2">3. Tono y Atmósfera</h3>
          <p className="text-neutral-400">Selecciona el estilo visual final que dictará cómo se generarán las imágenes de tu cómic.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          {styles.map((style) => (
            <div 
              key={style.id}
              onClick={() => setState(style.id)}
              className={`relative overflow-hidden rounded-2xl cursor-pointer group transition-all duration-300 ${state === style.id ? `ring-2 ring-offset-4 ring-offset-neutral-900 ring-${style.border.split('-')[1]}-500 scale-105 shadow-xl` : 'hover:scale-105 border border-neutral-800 hover:border-neutral-700'}`}
            >
              <div className={`h-40 ${style.bg} opacity-80 group-hover:opacity-100 transition-opacity flex items-center justify-center relative`}>
                {style.image ? (
                  <img src={style.image} alt={style.name} className="w-full h-full object-cover mix-blend-luminosity hover:mix-blend-normal transition-all duration-500" />
                ) : (
                  <ImageIcon className="w-12 h-12 text-white/50" />
                )}
              </div>
              <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/90 to-transparent p-4 pt-12">
                <h4 className="font-bold text-white mb-1">{style.name}</h4>
                <p className="text-xs text-neutral-300">{style.desc}</p>
              </div>
              {state === style.id && (
                <div className="absolute top-3 right-3 bg-white/20 backdrop-blur-md rounded-full p-1">
                  <div className="w-3 h-3 bg-white rounded-full"></div>
                </div>
              )}
            </div>
          ))}
        </div>



        <div className="mt-10 flex justify-between">
          <button onClick={onBack} className="text-neutral-400 hover:text-white px-6 py-3 rounded-xl font-medium transition-colors">
            Volver
          </button>
          <button onClick={onGenerate} disabled={isSubmitting} className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white px-8 py-3 rounded-xl font-bold flex items-center gap-2 transition-all hover:scale-105 shadow-[0_0_30px_rgba(219,39,119,0.3)] hover:shadow-[0_0_40px_rgba(219,39,119,0.5)] disabled:opacity-50 disabled:hover:scale-100">
            {isSubmitting ? 'Procesando Orden...' : 'Revisar y Someter Orden'}
            <Sparkles className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}

function Step4({ codigoPago, onReset }: { codigoPago: string, onReset: () => void }) {
  return (
    <div className="animate-in fade-in zoom-in-95 duration-500">
      <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-8 shadow-2xl text-center">
        <div className="w-20 h-20 bg-green-500/20 text-green-400 rounded-full flex items-center justify-center mx-auto mb-6 shadow-[0_0_30px_rgba(34,197,94,0.3)]">
          <CheckCircle2 className="w-10 h-10" />
        </div>
        <h2 className="text-3xl font-extrabold text-white mb-4">¡Orden Recibida Exitosamente!</h2>
        <p className="text-neutral-400 max-w-lg mx-auto mb-8">
          Tus datos y fotos han sido enviados de forma segura. Para comenzar la producción de tu cómic, por favor completa el pago vía PayPal.
        </p>

        <div className="bg-neutral-950 border border-purple-500/30 rounded-xl p-8 mb-8 inline-block shadow-[0_0_30px_rgba(147,51,234,0.1)]">
          <h3 className="text-neutral-400 uppercase tracking-widest text-xs font-bold mb-2">Tu Código de Pago Único</h3>
          <p className="text-4xl font-mono font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent selection:bg-purple-900/50">
            {codigoPago}
          </p>
        </div>

        <div className="bg-neutral-800/50 rounded-xl p-6 text-left max-w-xl mx-auto mb-8 border border-neutral-800">
          <h4 className="font-bold text-white mb-4 flex items-center gap-2">
            Instrucciones de Pago:
          </h4>
          <ol className="list-decimal list-inside space-y-3 text-neutral-300">
            <li>Ingresa a tu cuenta de PayPal o dale clic en Pagar.</li>
            <li>Realiza el envío del pago al correo: <strong>pagos@comicmaker.com</strong></li>
            <li>En la sección de <strong>"Agregar una nota"</strong>, es OBLIGATORIO que pegues tu código: <strong className="text-white bg-black/50 px-2 py-1 rounded">{codigoPago}</strong></li>
            <li>Una vez confirmado, nos comunicaremos contigo a tu correo electrónico para enviarte los avances.</li>
          </ol>
        </div>

        <div className="flex justify-center gap-4">
          <button onClick={onReset} className="px-6 py-3 rounded-xl font-medium border border-neutral-700 hover:bg-neutral-800 transition-colors">
            Crear Nueva Historia
          </button>
          <a href="https://paypal.com" target="_blank" rel="noreferrer" className="bg-[#0070ba] hover:bg-[#003087] text-white px-8 py-3 rounded-xl font-bold flex items-center gap-2 transition-colors">
            Ir a PayPal
          </a>
        </div>
      </div>
    </div>
  );
}
