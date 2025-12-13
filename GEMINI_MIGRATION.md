# Migración a Google Gemini Vision - Guía de Configuración

## ✅ Cambios Realizados

Se ha migrado el servicio de reconocimiento de alimentos de **Anthropic Claude AI** a **Google Gemini Vision**.

## 🔑 Obtener API Key de Google AI

1. Ve a [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Inicia sesión con tu cuenta de Google
3. Haz clic en "Create API Key"
4. Copia la API key generada

## ⚙️ Configuración

### 1. Actualizar archivo .env

Edita tu archivo `.env` y reemplaza:

```bash
# ANTES (Claude)
ANTHROPIC_API_KEY=tu_anthropic_api_key

# AHORA (Gemini)
GOOGLE_AI_API_KEY=tu_google_ai_api_key_aqui
```

### 2. Reinstalar dependencias

```bash
cd food-recognition-service
npm install
```

### 3. Reiniciar servicios con Docker

```bash
# Detener servicios
docker-compose down

# Reconstruir el servicio de food recognition
docker-compose build food-recognition

# Iniciar todos los servicios
docker-compose up -d
```

## 💰 Ventajas de Google Gemini

### Tier Gratuito
- **15 requests por minuto** gratis
- **1,500 requests por día** gratis
- **1 millón de tokens por mes** gratis

### Comparación con Claude
| Característica | Claude | Gemini Flash |
|----------------|--------|--------------|
| Costo (1M tokens) | $3.00 | **GRATIS** hasta 1M |
| Requests/min gratuitos | 5 | **15** |
| Velocidad | Rápido | **Muy rápido** |
| Precisión alimentos | Excelente | **Excelente** |

## 🧪 Probar el Cambio

### Verificar que funciona:

```bash
# 1. Ver logs del servicio
docker-compose logs -f food-recognition

# 2. Probar el endpoint
curl http://localhost:4002/health

# 3. Desde la aplicación web
# - Ve a http://localhost:3000
# - Agrega una comida
# - Captura una foto
# - Verifica que el análisis funcione
```

## 📝 Archivos Modificados

- ✅ `food-recognition-service/package.json` - Cambiado a @google/generative-ai
- ✅ `food-recognition-service/src/services/gemini.js` - Nuevo servicio Gemini
- ✅ `food-recognition-service/src/routes/analyze.js` - Actualizado import
- ✅ `.env.example` - Nueva variable GOOGLE_AI_API_KEY
- ✅ `docker-compose.yml` - Actualizada variable de entorno
- ✅ `README.md` - Documentación actualizada

## 🔄 Rollback (si es necesario)

Si necesitas volver a Claude:

```bash
git checkout HEAD -- food-recognition-service/
git checkout HEAD -- .env.example
git checkout HEAD -- docker-compose.yml
```

## 🎯 Próximos Pasos

1. Obtén tu API key de Google AI Studio
2. Actualiza tu archivo `.env`
3. Reconstruye el servicio: `docker-compose build food-recognition`
4. Reinicia: `docker-compose up -d`
5. Prueba capturando una foto de comida

## 📊 Modelo Utilizado

- **Modelo**: `gemini-1.5-flash`
- **Características**:
  - Multimodal (texto + imágenes)
  - Optimizado para velocidad
  - Excelente para análisis nutricional
  - Respuestas en formato JSON

## ⚠️ Notas Importantes

- La API key de Google AI es **diferente** a la de Google OAuth
- El tier gratuito es muy generoso para desarrollo y producción pequeña
- Si superas el límite gratuito, los precios son muy competitivos
- Gemini 1.5 Flash es más rápido que Claude para análisis de imágenes
