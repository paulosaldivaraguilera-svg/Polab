import React, { useState } from 'react';
import { Shield, Instagram, Store, GraduationCap, ArrowRight, CheckCircle, AlertTriangle, ChevronLeft, Send, MessageCircle, FileText, Briefcase, Users, Play, Lock, FileCheck, Key, CreditCard, Check, Star } from 'lucide-react';

// --- DATA & LÓGICA DE NEGOCIO ---

const profiles = [
  {
    id: 'influencer',
    title: 'Influencers & Creadores',
    tagline: 'Protección de Marca e Ingresos',
    icon: <Instagram className="w-6 h-6" />,
    color: 'text-rose-600',
    bgIcon: 'bg-rose-100',
    borderColor: 'hover:border-rose-500',
    description: 'Youtubers, instagramers, streamers y creadores de contenido.',
    riskLevel: 'ALTO',
    painPoints: [
      'Fiscalización activa del SII a ingresos digitales (Twitch/YouTube).',
      'Uso no autorizado de imagen por falta de contratos.',
      'Pérdida de IVA crédito fiscal en compra de equipos.'
    ],
    deliverables: [
      { icon: <FileCheck />, text: "Escritura SpA (PDF)" },
      { icon: <CreditCard />, text: "RUT Digital" },
      { icon: <Key />, text: "Clave SII" },
      { icon: <FileText />, text: "Contrato Canjes" }
    ],
    solution: {
      name: 'Pack Creator Pro',
      price: '$250.000',
      note: '+ Costos Notariales',
      features: [
        'Constitución SpA (Giro Publicidad)',
        'Inicio Actividades SII Categorizado',
        'Contrato marco para marcas',
        'Asesoría tributaria internacional',
        'Facturación exenta/afecta habilitada'
      ]
    }
  },
  {
    id: 'pyme',
    title: 'Comercio & Retail',
    tagline: 'Continuidad Operativa',
    icon: <Store className="w-6 h-6" />,
    color: 'text-blue-600',
    bgIcon: 'bg-blue-100',
    borderColor: 'hover:border-blue-500',
    description: 'E-commerce, minimarkets, ropa, cosmética y alimentos.',
    riskLevel: 'CRÍTICO',
    painPoints: [
      'Multas del 300% por venta sin boleta.',
      'Riesgo inminente de clausura por falta de patente.',
      'Responsabilidad civil ante accidentes laborales.'
    ],
    deliverables: [
      { icon: <FileCheck />, text: "Carpeta Legal" },
      { icon: <CreditCard />, text: "e-RUT Nominativo" },
      { icon: <Shield />, text: "Cert. Patente (Trámite)" },
      { icon: <FileText />, text: "Contratos Laborales" }
    ],
    solution: {
      name: 'Pack Comercio Seguro',
      price: '$280.000',
      note: '+ Costos Notariales',
      features: [
        'Empresa "En un día" (SpA/EIRL)',
        'Firma Digital + e-RUT',
        'Tramitación Patente Provisoria',
        'Centralización Boleta Electrónica',
        'Kit contratos laborales'
      ]
    }
  },
  {
    id: 'pro',
    title: 'Profesionales',
    tagline: 'Eficiencia Tributaria',
    icon: <GraduationCap className="w-6 h-6" />,
    color: 'text-emerald-600',
    bgIcon: 'bg-emerald-100',
    borderColor: 'hover:border-emerald-500',
    description: 'Arquitectos, Salud, Diseño, IT y profesiones liberales.',
    riskLevel: 'MEDIO',
    painPoints: [
      'Pago excesivo de IVA (19%) por estructura incorrecta.',
      'Contaminación de patrimonio personal con riesgos laborales.',
      'Responsabilidad ilimitada ante demandas civiles.'
    ],
    deliverables: [
      { icon: <FileCheck />, text: "Estatutos Sociedad" },
      { icon: <CheckCircle />, text: "Resolución Exención" },
      { icon: <Key />, text: "Acceso SII Empresa" },
      { icon: <Briefcase />, text: "Separación Patrimonial" }
    ],
    solution: {
      name: 'Pack Profesional',
      price: '$220.000',
      note: '+ Costos Notariales',
      features: [
        'Sociedad Profesionales (Exenta IVA)',
        'Separación de patrimonios',
        'Inicio Actividades 2da Categoría',
        'Acreditación título ante SII',
        'Gestión Cta. Banco Estado'
      ]
    }
  }
];

export default function App() {
  const [selectedProfile, setSelectedProfile] = useState(null);
  const [step, setStep] = useState('home'); 
  const [formData, setFormData] = useState({ name: '', phone: '', email: '' });
  const [showSuccess, setShowSuccess] = useState(false);

  const handleProfileSelect = (profile) => {
    setSelectedProfile(profile);
    setStep('detail');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBack = () => {
    setStep('home');
    setSelectedProfile(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setShowSuccess(true);
    // TODO: Enviar datos a API/WhatsApp
    console.log('Lead capturado:', { ...formData, profile: selectedProfile?.id });
    setTimeout(() => {
      setStep('home');
      setShowSuccess(false);
      setFormData({ name: '', phone: '', email: '' });
      setSelectedProfile(null);
    }, 4000);
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 selection:bg-blue-100 selection:text-blue-900">
      
      {/* NAVBAR PROFESSIONAL */}
      <nav className="fixed w-full bg-white/95 backdrop-blur-sm z-50 border-b border-slate-200 shadow-sm">
        <div className="max-w-6xl mx-auto px-6 h-20 flex justify-between items-center">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => handleBack()}>
            <div className="bg-blue-900 text-white p-2.5 rounded-lg shadow-md">
              <Shield size={22} fill="currentColor" />
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-xl tracking-tight text-slate-900 leading-none">Comenzar</span>
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest leading-none mt-1">Infraestructura Legal</span>
            </div>
          </div>
          <div className="hidden md:flex gap-6 text-sm font-medium text-slate-600">
            <span className="cursor-pointer hover:text-blue-900 transition">Cómo funciona</span>
            <span className="cursor-pointer hover:text-blue-900 transition">Precios</span>
            <span className="cursor-pointer hover:text-blue-900 transition flex items-center gap-2">
              <MessageCircle size={16} /> Soporte
            </span>
          </div>
        </div>
      </nav>

      <main className="pt-20">
        
        {/* VISTA 1: HOME */}
        {step === 'home' && (
          <div className="animate-in fade-in duration-500">
            
            {/* HERO SECTION - Deep Blue Corporate */}
            <div className="bg-slate-900 relative overflow-hidden">
              {/* Background Decoration */}
              <div className="absolute top-0 right-0 w-2/3 h-full bg-gradient-to-bl from-blue-900/40 to-transparent opacity-50"></div>
              <div className="absolute bottom-0 left-0 w-1/3 h-full bg-gradient-to-tr from-blue-900/20 to-transparent opacity-30"></div>
              
              <div className="max-w-6xl mx-auto px-6 py-24 md:py-32 relative z-10">
                <div className="flex flex-col md:flex-row items-center gap-12">
                  <div className="flex-1 text-center md:text-left">
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-900/50 border border-blue-700/50 text-xs font-bold text-blue-200 uppercase tracking-wider mb-8">
                      <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                      LegalTech Certificada
                    </div>
                    <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 leading-[1.1] tracking-tight">
                      Formaliza tu empresa <br/>
                      <span className="text-blue-400">sin burocracia.</span>
                    </h1>
                    <p className="text-xl text-slate-300 max-w-xl mb-10 font-light leading-relaxed">
                      Infraestructura legal completa para emprendedores. 
                      Entregamos tu RUT, escritura y cuentas listas para operar.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
                      <button onClick={() => document.getElementById('planes').scrollIntoView({behavior: 'smooth'})} className="px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg shadow-lg shadow-blue-900/50 transition-all transform hover:-translate-y-1">
                        Ver Planes Disponibles
                      </button>
                      <button className="px-8 py-4 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-lg border border-slate-700 transition-all">
                        Hablar con Abogado
                      </button>
                    </div>
                  </div>
                  
                  {/* Hero Stats/Visual */}
                  <div className="flex-1 w-full max-w-md hidden md:block">
                    <div className="bg-slate-800/50 backdrop-blur-md rounded-2xl p-6 border border-slate-700 shadow-2xl">
                       <div className="space-y-4">
                          <div className="flex items-center justify-between p-4 bg-slate-900/80 rounded-xl border border-slate-700">
                             <div className="flex items-center gap-3">
                                <div className="p-2 bg-green-500/20 rounded-lg text-green-400"><CheckCircle size={20} /></div>
                                <div>
                                   <div className="text-sm font-bold text-white">Constitución SpA</div>
                                   <div className="text-xs text-slate-400">Trámite finalizado</div>
                                </div>
                             </div>
                             <div className="text-green-400 text-xs font-bold">LISTO</div>
                          </div>
                          <div className="flex items-center justify-between p-4 bg-slate-900/80 rounded-xl border border-slate-700">
                             <div className="flex items-center gap-3">
                                <div className="p-2 bg-green-500/20 rounded-lg text-green-400"><CreditCard size={20} /></div>
                                <div>
                                   <div className="text-sm font-bold text-white">RUT Electrónico</div>
                                   <div className="text-xs text-slate-400">Emitido por SII</div>
                                </div>
                             </div>
                             <div className="text-green-400 text-xs font-bold">LISTO</div>
                          </div>
                          <div className="flex items-center justify-between p-4 bg-slate-900/80 rounded-xl border border-slate-700 opacity-50">
                             <div className="flex items-center gap-3">
                                <div className="p-2 bg-slate-700 rounded-lg text-slate-400"><Briefcase size={20} /></div>
                                <div>
                                   <div className="text-sm font-bold text-white">Cuenta Empresa</div>
                                   <div className="text-xs text-slate-400">En proceso...</div>
                                </div>
                             </div>
                             <div className="text-slate-400 text-xs font-bold">PENDIENTE</div>
                          </div>
                       </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* TRUST BAR */}
            <div className="bg-white border-b border-slate-200 py-10">
               <div className="max-w-6xl mx-auto px-6 grid md:grid-cols-4 gap-8 text-center md:text-left">
                  <div className="flex items-center justify-center md:justify-start gap-3">
                     <Shield className="text-blue-900 w-8 h-8" />
                     <div className="text-sm font-bold text-slate-700 leading-tight">Garantía Legal<br/>de Cumplimiento</div>
                  </div>
                  <div className="flex items-center justify-center md:justify-start gap-3">
                     <Users className="text-blue-900 w-8 h-8" />
                     <div className="text-sm font-bold text-slate-700 leading-tight">Abogados<br/>Certificados</div>
                  </div>
                  <div className="flex items-center justify-center md:justify-start gap-3">
                     <Lock className="text-blue-900 w-8 h-8" />
                     <div className="text-sm font-bold text-slate-700 leading-tight">Datos 100%<br/>Encriptados</div>
                  </div>
                  <div className="flex items-center justify-center md:justify-start gap-3">
                     <CheckCircle className="text-blue-900 w-8 h-8" />
                     <div className="text-sm font-bold text-slate-700 leading-tight">Sin Letra<br/>Chica</div>
                  </div>
               </div>
            </div>

            {/* PRICING / PERFILES */}
            <div id="planes" className="max-w-6xl mx-auto px-6 py-20">
               <div className="text-center max-w-2xl mx-auto mb-16">
                  <h2 className="text-3xl font-bold text-slate-900 mb-4">Selecciona tu Rubro</h2>
                  <p className="text-slate-500 text-lg">Hemos paquetizado los servicios legales necesarios para cada industria.</p>
               </div>

               <div className="grid md:grid-cols-3 gap-8">
                  {profiles.map((profile) => (
                    <div 
                      key={profile.id}
                      onClick={() => handleProfileSelect(profile)}
                      className={`bg-white rounded-2xl p-8 border border-slate-200 shadow-sm hover:shadow-2xl transition-all duration-300 cursor-pointer group hover:-translate-y-1 relative overflow-hidden ${profile.borderColor}`}
                    >
                      <div className="absolute top-0 left-0 w-full h-1 bg-slate-100 group-hover:bg-blue-600 transition-colors"></div>
                      
                      <div className={`w-14 h-14 rounded-xl ${profile.bgIcon} ${profile.color} flex items-center justify-center mb-6`}>
                        {profile.icon}
                      </div>
                      
                      <h3 className="text-xl font-bold text-slate-900 mb-2">{profile.title}</h3>
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">{profile.tagline}</p>
                      
                      <p className="text-slate-600 mb-8 leading-relaxed text-sm h-16">
                        {profile.description}
                      </p>
                      
                      <div className="flex items-center justify-between pt-6 border-t border-slate-100">
                         <span className="font-bold text-slate-900 text-lg">{profile.solution.price}</span>
                         <div className="bg-slate-50 p-2 rounded-full text-slate-400 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                            <ArrowRight size={20} />
                         </div>
                      </div>
                    </div>
                  ))}
               </div>
            </div>

          </div>
        )}

        {/* VISTA 2: DETALLE (CHECKOUT STYLE) */}
        {step === 'detail' && selectedProfile && (
          <div className="min-h-screen bg-slate-50 animate-in slide-in-from-right duration-300">
            
            {/* Header Sticky */}
            <div className="bg-white border-b border-slate-200 sticky top-20 z-40 shadow-sm">
              <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
                <button 
                  onClick={handleBack}
                  className="flex items-center text-sm font-bold text-slate-500 hover:text-blue-900 transition-colors"
                >
                  <ChevronLeft className="w-5 h-5 mr-1" /> Volver a planes
                </button>
                <div className="text-sm text-slate-400 hidden sm:block">Estás viendo: <span className="text-slate-900 font-bold">{selectedProfile.solution.name}</span></div>
              </div>
            </div>

            <div className="max-w-6xl mx-auto px-6 py-12">
              <div className="grid lg:grid-cols-12 gap-10">
                
                {/* LEFT: INFORMATION */}
                <div className="lg:col-span-7 space-y-10">
                  
                  {/* Title Block */}
                  <div>
                     <h1 className="text-4xl font-extrabold text-slate-900 mb-4">{selectedProfile.solution.name}</h1>
                     <p className="text-lg text-slate-600 leading-relaxed">{selectedProfile.description}</p>
                  </div>

                  {/* Risk Alert Block */}
                  <div className="bg-white border-l-4 border-red-500 rounded-r-xl p-6 shadow-sm">
                     <div className="flex items-center gap-3 mb-4">
                        <AlertTriangle className="text-red-500" />
                        <h3 className="font-bold text-slate-900">Riesgos de no formalizar</h3>
                        <span className="ml-auto bg-red-100 text-red-700 text-xs font-bold px-2 py-1 rounded uppercase">{selectedProfile.riskLevel}</span>
                     </div>
                     <div className="space-y-3">
                        {selectedProfile.painPoints.map((point, i) => (
                           <div key={i} className="flex gap-3 text-sm text-slate-700">
                              <span className="text-red-400 font-bold">•</span>
                              {point}
                           </div>
                        ))}
                     </div>
                  </div>

                  {/* Deliverables Grid */}
                  <div>
                     <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
                        <Briefcase size={20} className="text-blue-600" /> Entregables del Servicio
                     </h3>
                     <div className="grid sm:grid-cols-2 gap-4">
                        {selectedProfile.deliverables.map((item, i) => (
                           <div key={i} className="bg-white border border-slate-200 p-4 rounded-xl flex items-center gap-4 shadow-sm hover:border-blue-400 transition-colors">
                              <div className={`p-2 rounded-lg ${selectedProfile.bgIcon} ${selectedProfile.color}`}>
                                 {React.cloneElement(item.icon, { size: 20 })}
                              </div>
                              <span className="font-bold text-slate-700 text-sm">{item.text}</span>
                           </div>
                        ))}
                     </div>
                  </div>

                  {/* Full Features List */}
                  <div className="pt-6 border-t border-slate-200">
                     <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">Detalle Técnico</h3>
                     <ul className="space-y-4">
                        {selectedProfile.solution.features.map((feature, i) => (
                           <li key={i} className="flex items-start gap-3 text-slate-700">
                              <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
                              <span>{feature}</span>
                           </li>
                        ))}
                     </ul>
                  </div>

                </div>

                {/* RIGHT: ACTION CARD */}
                <div className="lg:col-span-5">
                   <div className="sticky top-40 bg-white rounded-2xl shadow-xl border border-slate-200 p-8">
                      <div className="text-center border-b border-slate-100 pb-6 mb-6">
                         <div className="text-5xl font-extrabold text-slate-900 tracking-tight mb-2">{selectedProfile.solution.price}</div>
                         <div className="text-sm font-medium text-slate-500 bg-slate-100 inline-block px-3 py-1 rounded-full">{selectedProfile.solution.note}</div>
                      </div>

                      {showSuccess ? (
                         <div className="text-center py-8 animate-in zoom-in">
                            <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                               <CheckCircle size={32} />
                            </div>
                            <h3 className="font-bold text-slate-900 text-xl mb-2">¡Solicitud Enviada!</h3>
                            <p className="text-slate-500 mb-6">Un abogado te contactará en breve.</p>
                            <button onClick={() => {setStep('home'); setShowSuccess(false)}} className="text-blue-600 font-bold hover:underline">
                               Volver al inicio
                            </button>
                         </div>
                      ) : (
                         <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                               <label className="block text-xs font-bold text-slate-500 uppercase mb-1 ml-1">Nombre Completo</label>
                               <input 
                                 type="text" required
                                 className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 outline-none focus:ring-2 focus:ring-blue-600 transition-all font-medium text-slate-900"
                                 value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})}
                               />
                            </div>
                            <div>
                               <label className="block text-xs font-bold text-slate-500 uppercase mb-1 ml-1">WhatsApp</label>
                               <input 
                                 type="tel" required
                                 className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 outline-none focus:ring-2 focus:ring-blue-600 transition-all font-medium text-slate-900"
                                 value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})}
                               />
                            </div>
                            <div>
                               <label className="block text-xs font-bold text-slate-500 uppercase mb-1 ml-1">Email</label>
                               <input 
                                 type="email" required
                                 className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 outline-none focus:ring-2 focus:ring-blue-600 transition-all font-medium text-slate-900"
                                 value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})}
                               />
                            </div>

                            <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-lg shadow-lg shadow-blue-600/20 transition-all mt-4 flex items-center justify-center gap-2">
                               Comenzar Trámite <ArrowRight size={20} />
                            </button>
                            
                            <div className="flex items-center justify-center gap-2 text-xs text-slate-400 mt-4">
                               <Lock size={12} /> Tus datos están seguros
                            </div>
                         </form>
                      )}
                   </div>
                   
                   {/* Support Box */}
                   <div className="mt-6 bg-slate-100 rounded-xl p-4 flex items-center gap-4">
                      <div className="bg-white p-2 rounded-full text-slate-400">
                         <MessageCircle size={20} />
                      </div>
                      <div className="text-sm">
                         <div className="font-bold text-slate-700">¿Tienes dudas?</div>
                         <div className="text-slate-500">Habla con un humano antes de pagar.</div>
                      </div>
                   </div>
                </div>

              </div>
            </div>
          </div>
        )}

      </main>

      {/* Footer Corporate */}
      <footer className="bg-slate-900 text-slate-400 py-12 border-t border-slate-800">
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
           <div className="flex items-center gap-2">
              <Shield className="text-slate-600" size={20} />
              <span className="font-bold text-slate-200 tracking-tight">Comenzar SpA</span>
           </div>
           <div className="text-sm">© 2024 Infraestructura Legal. Santiago, Chile.</div>
        </div>
      </footer>

    </div>
  );
}
