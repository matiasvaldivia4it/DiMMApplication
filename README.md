# Diabetes Management App - Microservices Architecture

Aplicación web móvil completa para el manejo de diabetes con reconocimiento de alimentos mediante IA, cálculo automático de insulina, y análisis de tendencias.

## 🏗️ Arquitectura

La aplicación está construida con arquitectura de microservicios:

- **Frontend**: React 18 + Tailwind CSS (Puerto 3000)
- **API Gateway**: Node.js/Express (Puerto 4000)
- **Auth Service**: Google OAuth + JWT (Puerto 4001)
- **Food Recognition Service**: Google Gemini Vision (Puerto 4002)
- **Meal Tracking Service**: CRUD de comidas (Puerto 4003)
- **User Profile Service**: Gestión de perfiles (Puerto 4004)
- **Notification Service**: Push notifications (Puerto 4005)
- **Analytics Service**: Reportes y estadísticas (Puerto 4006)
- **PostgreSQL**: Base de datos principal
- **Redis**: Cache y queue de notificaciones
- **MinIO**: Almacenamiento de imágenes

## ✨ Funcionalidades Principales

### 🔐 Autenticación
- Login con Google OAuth 2.0
- Tokens JWT con refresh automático
- Sesiones seguras

### 📸 Reconocimiento de Alimentos
- Captura de fotos con cámara del dispositivo
- Análisis automático con Google Gemini Vision
- Identificación de alimentos y carbohidratos
- Almacenamiento de imágenes en MinIO

### 💉 Cálculo de Insulina
- Configuración personalizada de ratio (1:10, 1:15, 1:20, 1:25, 1:30)
- Cálculo automático de dosis sugerida
- Disclaimers médicos en toda la aplicación

### 📊 Tracking de Comidas
- Registro de comidas por categoría (Desayuno, Almuerzo, Media tarde, Cena)
- Glucemia preprandial y postprandial
- Historial completo con imágenes
- Checkbox para confirmar dosis aplicada

### 📈 Analytics
- Gráficos de tendencias de glucemia
- Promedios de carbohidratos e insulina
- Detección automática de patrones
- Exportación a PDF y CSV

### 🔔 Notificaciones
- Recordatorios de comidas no registradas
- Alertas de glucemia postprandial (2h después)
- Push notifications web

## 🚀 Instalación y Despliegue

### Prerrequisitos

- Docker y Docker Compose
- Node.js 18+ (para desarrollo local)
- Credenciales de Google OAuth
- API Key de Google AI (Gemini)

### 1. Clonar el Repositorio

```bash
git clone <repository-url>
cd CalculoHC
```

### 2. Configurar Variables de Entorno

Copia el archivo de ejemplo y configura tus credenciales:

```bash
cp .env.example .env
```

Edita `.env` con tus credenciales:

```env
# Google OAuth (obtener en https://console.cloud.google.com/apis/credentials)
GOOGLE_CLIENT_ID=tu_google_client_id
GOOGLE_CLIENT_SECRET=tu_google_client_secret

# Google AI API (obtener en https://aistudio.google.com/app/apikey)
GOOGLE_AI_API_KEY=tu_google_ai_api_key

# JWT Secret (generar con: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
JWT_SECRET=tu_jwt_secret_minimo_32_caracteres
```

### 3. Iniciar con Docker Compose

```bash
docker-compose up -d
```

Esto iniciará todos los servicios:
- Frontend: http://localhost:3000
- API Gateway: http://localhost:4000
- Servicios backend: puertos 4001-4006
- PostgreSQL: puerto 5432
- Redis: puerto 6379
- MinIO Console: http://localhost:9001

### 4. Verificar el Estado

```bash
# Ver logs de todos los servicios
docker-compose logs -f

# Verificar health checks
curl http://localhost:4001/health  # Auth Service
curl http://localhost:4002/health  # Food Recognition
curl http://localhost:4003/health  # Meal Tracking
curl http://localhost:4004/health  # User Profile
curl http://localhost:4005/health  # Notification
curl http://localhost:4006/health  # Analytics
```

## 📱 Uso de la Aplicación

### Primera Vez

1. Accede a http://localhost:3000
2. Haz clic en "Continuar con Google"
3. Completa el wizard de configuración inicial:
   - Selecciona tu ratio de insulina
   - Define tus rangos de glucemia objetivo
   - Configura horarios de comidas

### Agregar una Comida

1. Toca el botón "+" flotante
2. Captura una foto de tu comida
3. Espera el análisis automático
4. Revisa los carbohidratos identificados
5. Ingresa tu glucemia preprandial
6. Verifica la dosis de insulina sugerida
7. Guarda el registro

### Ver Analytics

1. Toca el ícono 📊 en el dashboard
2. Selecciona el período (7, 14, 30, 60, 90 días)
3. Revisa gráficos y patrones detectados
4. Exporta reportes en PDF si necesitas

## 🔧 Desarrollo Local

### Backend Services

Cada servicio puede ejecutarse independientemente:

```bash
cd auth-service
npm install
npm run dev
```

### Frontend

```bash
cd frontend
npm install
npm start
```

## 📚 API Documentation

### Auth Service (Puerto 4001)

```
GET  /auth/google              - Iniciar OAuth con Google
GET  /auth/google/callback     - Callback de OAuth
POST /auth/refresh             - Refrescar token
GET  /auth/verify              - Verificar token
GET  /auth/me                  - Obtener usuario actual
```

### Food Recognition (Puerto 4002)

```
POST /analyze                  - Analizar imagen de comida
GET  /history/:userId          - Historial de análisis
```

### Meal Tracking (Puerto 4003)

```
POST   /meals                  - Crear comida
GET    /meals/user/:userId     - Obtener comidas de usuario
GET    /meals/:id              - Obtener comida específica
PUT    /meals/:id              - Actualizar comida
DELETE /meals/:id              - Eliminar comida
```

### User Profile (Puerto 4004)

```
POST /profile/setup            - Configuración inicial
GET  /profile/:userId          - Obtener perfil
PUT  /profile/:userId          - Actualizar perfil
PUT  /profile/:userId/ratio    - Actualizar ratio de insulina
GET  /profile/:userId/ratio/history - Historial de cambios
```

### Notification (Puerto 4005)

```
GET  /notifications/vapid-public-key  - Obtener clave VAPID
POST /notifications/subscribe         - Suscribirse a notificaciones
POST /notifications/send              - Enviar notificación
POST /notifications/schedule-postprandial - Programar recordatorio
GET  /notifications/:userId           - Obtener notificaciones
PUT  /notifications/settings          - Actualizar configuración
```

### Analytics (Puerto 4006)

```
GET /analytics/summary/:userId        - Resumen diario/semanal/mensual
GET /analytics/trends/:userId         - Tendencias de glucemia
GET /analytics/correlations/:userId   - Correlaciones carbs-insulina-glucosa
GET /analytics/patterns/:userId       - Patrones detectados
GET /analytics/export/:userId/pdf     - Exportar a PDF
GET /analytics/export/:userId/csv     - Exportar a CSV
```

## 🗄️ Estructura de Base de Datos

### auth_db
- `users`: Usuarios autenticados

### meals_db
- `meals`: Registros de comidas
- `food_items`: Alimentos identificados

### profiles_db
- `profiles`: Perfiles de usuario
- `meal_schedules`: Horarios de comidas
- `ratio_history`: Historial de cambios de ratio

### analytics_db
- `daily_summaries`: Resúmenes diarios
- `patterns`: Patrones detectados

## 🎨 Diseño Visual

### Código de Colores para Glucemia

- 🔵 **Azul** (<70 mg/dL): Bajo
- 🟢 **Verde** (70-140 mg/dL): Normal
- 🟡 **Amarillo** (140-180 mg/dL): Elevado
- 🔴 **Rojo** (>180 mg/dL): Alto

## ⚠️ Disclaimers de Seguridad

Esta aplicación incluye múltiples disclaimers médicos:

1. **Login**: Advertencia inicial sobre uso como herramienta de apoyo
2. **Setup**: Consultar con médico antes de configurar ratio
3. **Cálculo de Insulina**: Valores sugeridos, no definitivos
4. **Cambios de Ratio**: Confirmación médica requerida

**IMPORTANTE**: Esta aplicación NO reemplaza el consejo médico profesional. Todos los cálculos son estimaciones y deben ser revisados por un médico.

## 🔒 Seguridad

- Autenticación JWT con refresh tokens
- Rate limiting en API Gateway
- CORS configurado
- Sanitización de inputs con Joi
- Health checks en todos los servicios
- Variables de entorno para secrets

## 🛠️ Tecnologías Utilizadas

### Frontend
- React 18
- Tailwind CSS
- React Router
- Axios
- Chart.js

### Backend
- Node.js 18
- Express
- PostgreSQL
- Redis
- MinIO

### IA y APIs
- Google Gemini 1.5 Flash
- Google OAuth 2.0

### DevOps
- Docker
- Docker Compose
- Multi-stage builds
- Health checks

## 📝 Licencia

Este proyecto es una herramienta de apoyo médico. Consulta siempre con profesionales de la salud.

## 🤝 Contribuciones

Para contribuir al proyecto:

1. Fork el repositorio
2. Crea una rama para tu feature
3. Commit tus cambios
4. Push a la rama
5. Abre un Pull Request

## 📧 Soporte

Para reportar problemas o sugerencias, abre un issue en el repositorio.

---

**Desarrollado con ❤️ para ayudar en el manejo de la diabetes**
