import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const LandingPage = () => {
    const { isAuthenticated } = useAuth();

    return (
        <div className="min-h-screen bg-white">
            {/* Navigation */}
            <nav className="bg-white/80 backdrop-blur-md fixed w-full z-50 border-b border-primary-100">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16">
                        <div className="flex-shrink-0 flex items-center gap-2">
                            <span className="text-2xl">🩺</span>
                            <span className="font-bold text-xl text-primary-900">Diabetes Manager</span>
                        </div>
                        <div className="flex items-center gap-4">
                            {isAuthenticated ? (
                                <Link
                                    to="/dashboard"
                                    className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-full font-medium transition-colors"
                                >
                                    Ir al Dashboard
                                </Link>
                            ) : (
                                <Link
                                    to="/login"
                                    className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-2 rounded-full font-medium transition-colors shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 duration-200"
                                >
                                    Iniciar Sesión
                                </Link>
                            )}
                        </div>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <div className="relative pt-32 pb-20 lg:pt-48 overflow-hidden">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <div className="text-center max-w-3xl mx-auto mb-16">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-50 text-primary-700 text-sm font-medium mb-6 animate-fade-in">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary-500"></span>
                            </span>
                            Sistema Integral de Gestión de Diabetes
                        </div>

                        <h1 className="text-5xl lg:text-7xl font-extrabold text-slate-900 tracking-tight mb-8 leading-tight">
                            Tu salud bajo control <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-blue-500">
                                con Inteligencia Artificial
                            </span>
                        </h1>

                        <p className="text-xl text-slate-600 mb-10 leading-relaxed">
                            Calcula carbohidratos con una foto, gestiona tu insulina con precisión y
                            analiza tus tendencias de glucosa en una sola app diseñada para tu tranquilidad.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                            <Link
                                to="/login"
                                className="w-full sm:w-auto px-8 py-4 bg-primary-600 hover:bg-primary-700 text-white rounded-2xl font-bold text-lg shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 flex items-center justify-center gap-2"
                            >
                                Comenzar Gratis
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6"></path></svg>
                            </Link>
                            <a
                                href="#features"
                                className="w-full sm:w-auto px-8 py-4 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-2xl font-bold text-lg transition-all duration-300"
                            >
                                Ver Características
                            </a>
                        </div>
                    </div>

                    <div className="relative mx-auto max-w-5xl">
                        <div className="absolute -inset-1 bg-gradient-to-r from-primary-400 to-blue-400 rounded-2xl blur opacity-20"></div>
                        <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-slate-100 bg-white">
                            <img
                                src={`${process.env.PUBLIC_URL}/assets/images/hero.png`}
                                alt="App Interface"
                                className="w-full h-auto object-cover"
                            />
                        </div>
                    </div>
                </div>

                {/* Background Elements */}
                <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10">
                    <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary-100 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
                    <div className="absolute top-0 right-1/4 w-96 h-96 bg-blue-100 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
                    <div className="absolute -bottom-32 left-1/3 w-96 h-96 bg-teal-100 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000"></div>
                </div>
            </div>

            {/* Features Grid */}
            <section id="features" className="py-24 bg-slate-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-bold text-slate-900 mb-4">Todo lo que necesitas</h2>
                        <p className="text-lg text-slate-600 max-w-2xl mx-auto">
                            Herramientas avanzadas simplificadas para el día a día.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        <FeatureCard
                            icon="📷"
                            title="Reconocimiento de Alimentos"
                            description="Toma una foto a tu comida y deja que nuestra IA identifique los alimentos y calcule los carbohidratos automáticamente."
                        />
                        <FeatureCard
                            icon="💉"
                            title="Cálculo de Dosis"
                            description="Obtén sugerencias de dosis de insulina basadas en tu ratio personalizado y nivel de glucosa actual."
                        />
                        <FeatureCard
                            icon="📊"
                            title="Registro Inteligente"
                            description="Lleva un control detallado de tus mediciones pre y postprandiales con gráficos fáciles de entender."
                        />
                        <FeatureCard
                            icon="🔔"
                            title="Recordatorios"
                            description="Nunca más olvides una medición o una dosis. El sistema te avisará en el momento justo."
                        />
                        <FeatureCard
                            icon="📈"
                            title="Analytics Avanzado"
                            description="Descubre patrones y tendencias en tu glucemia para tomar mejores decisiones junto a tu médico."
                        />
                        <FeatureCard
                            icon="📤"
                            title="Reportes Médicos"
                            description="Exporta tus datos en PDF o CSV listos para compartir con tu endocrinólogo."
                        />
                    </div>
                </div>
            </section>

            {/* AI Feature Showcase */}
            <section className="py-24 bg-white overflow-hidden">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="lg:grid lg:grid-cols-2 lg:gap-16 items-center">
                        <div className="mb-12 lg:mb-0">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-50 text-teal-700 text-sm font-medium mb-6">
                                <span className="text-lg">✨</span> Tecnología Gemini Vision
                            </div>
                            <h2 className="text-4xl font-bold text-slate-900 mb-6">
                                La forma más fácil de contar carbohidratos
                            </h2>
                            <p className="text-lg text-slate-600 mb-8 leading-relaxed">
                                Olvídate de buscar en bases de datos interminables. Simplemente apunta tu cámara,
                                toma una foto y obtén el conteo nutricional al instante. Nuestra tecnología aprende
                                y mejora con cada uso.
                            </p>

                            <ul className="space-y-4 mb-8">
                                <li className="flex items-center gap-3">
                                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-green-100 flex items-center justify-center text-green-600">✓</div>
                                    <span className="text-slate-700">Identificación precisa de platos complejos</span>
                                </li>
                                <li className="flex items-center gap-3">
                                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-green-100 flex items-center justify-center text-green-600">✓</div>
                                    <span className="text-slate-700">Estimación de porciones y peso</span>
                                </li>
                                <li className="flex items-center gap-3">
                                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-green-100 flex items-center justify-center text-green-600">✓</div>
                                    <span className="text-slate-700">Cálculo instantáneo de carbohidratos netos</span>
                                </li>
                            </ul>
                        </div>
                        <div className="relative">
                            <div className="absolute inset-0 bg-gradient-to-tr from-teal-100 to-blue-100 rounded-3xl transform rotate-3 scale-105"></div>
                            <img
                                src={`${process.env.PUBLIC_URL}/assets/images/food-scan.png`}
                                alt="AI Food Scanning"
                                className="relative rounded-3xl shadow-2xl w-full h-auto transform transition-transform hover:scale-[1.01] duration-500"
                            />
                        </div>
                    </div>
                </div>
            </section>

            {/* Disclaimer Section */}
            <section className="bg-slate-900 text-white py-16">
                <div className="max-w-4xl mx-auto px-4 text-center">
                    <div className="text-4xl mb-6">⚠️</div>
                    <h3 className="text-2xl font-bold mb-4">Descargo de Responsabilidad Médico</h3>
                    <p className="text-slate-300 leading-relaxed mb-8">
                        Esta aplicación es una herramienta de apoyo y <strong>NO reemplaza el consejo médico profesional</strong>.
                        Siempre consulta con tu endocrinólogo antes de realizar ajustes en tu tratamiento o dosis de insulina.
                        En caso de emergencia médica, contacta inmediatamente a los servicios de salud.
                    </p>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-slate-50 py-12 border-t border-slate-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="flex items-center gap-2">
                        <span className="text-2xl">🩺</span>
                        <span className="font-bold text-slate-900">Diabetes Manager</span>
                    </div>
                    <div className="text-slate-500 text-sm">
                        © 2024 Diabetes Manager. Todos los derechos reservados.
                    </div>
                    <div className="flex gap-6">
                        <a href="#" className="text-slate-500 hover:text-primary-600 transition-colors">Privacidad</a>
                        <a href="#" className="text-slate-500 hover:text-primary-600 transition-colors">Términos</a>
                        <a href="#" className="text-slate-500 hover:text-primary-600 transition-colors">Contacto</a>
                    </div>
                </div>
            </footer>
        </div>
    );
};

const FeatureCard = ({ icon, title, description }) => (
    <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow hover:border-primary-100 group">
        <div className="text-4xl mb-4 group-hover:scale-110 transition-transform duration-300 inline-block">{icon}</div>
        <h3 className="text-xl font-bold text-slate-900 mb-3">{title}</h3>
        <p className="text-slate-600 leading-relaxed">{description}</p>
    </div>
);

export default LandingPage;
