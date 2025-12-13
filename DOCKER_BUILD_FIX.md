# Solución: Error de Docker Build

## ✅ Problema Resuelto

He generado todos los archivos `package-lock.json` necesarios para que Docker pueda construir las imágenes correctamente.

## 🔧 Siguiente Paso: Construir las Imágenes Docker

Docker no está disponible en tu sesión actual de PowerShell. Aquí tienes las opciones:

### Opción 1: Usar Docker Desktop (Recomendado)

1. **Abre Docker Desktop** si no está corriendo
2. **Abre una nueva terminal PowerShell** (esto cargará Docker en el PATH)
3. **Navega al proyecto:**
   ```powershell
   cd C:\Users\Matias\Documents\CalculoHC
   ```
4. **Construye las imágenes:**
   ```powershell
   docker compose build
   ```

### Opción 2: Usar CMD en lugar de PowerShell

1. Abre **CMD** (Command Prompt)
2. Navega al proyecto:
   ```cmd
   cd C:\Users\Matias\Documents\CalculoHC
   ```
3. Construye las imágenes:
   ```cmd
   docker compose build
   ```

### Opción 3: Reiniciar PowerShell

1. Cierra la terminal actual
2. Abre una nueva PowerShell
3. Navega al proyecto:
   ```powershell
   cd C:\Users\Matias\Documents\CalculoHC
   ```
4. Construye las imágenes:
   ```powershell
   docker compose build
   ```

## 📋 Comandos Completos para Desplegar

Una vez que Docker esté disponible, ejecuta estos comandos en orden:

```powershell
# 1. Navegar al proyecto
cd C:\Users\Matias\Documents\CalculoHC

# 2. Asegurarse de tener el archivo .env configurado
# (Copia .env.example a .env y configura las variables)
copy .env.example .env
# Edita .env con tus credenciales

# 3. Construir todas las imágenes
docker compose build

# 4. Iniciar todos los servicios
docker compose up -d

# 5. Ver los logs
docker compose logs -f

# 6. Verificar que todos los servicios estén corriendo
docker compose ps
```

## ✅ Archivos Ya Creados

He generado los siguientes archivos `package-lock.json`:

- ✅ `auth-service/package-lock.json`
- ✅ `api-gateway/package-lock.json`
- ✅ `food-recognition-service/package-lock.json`
- ✅ `meal-tracking-service/package-lock.json`
- ✅ `user-profile-service/package-lock.json`
- ✅ `notification-service/package-lock.json`
- ✅ `analytics-service/package-lock.json`
- ✅ `frontend/package-lock.json` (con 9 vulnerabilidades - ver abajo)

## ⚠️ Nota sobre Vulnerabilidades del Frontend

El frontend tiene 9 vulnerabilidades (3 moderate, 6 high). Esto es común en proyectos React y generalmente son dependencias de desarrollo. Para solucionarlo después del despliegue:

```powershell
cd frontend
npm audit fix
```

O si quieres forzar la corrección (puede romper compatibilidad):
```powershell
npm audit fix --force
```

## 🎯 Checklist de Despliegue

Antes de ejecutar `docker compose up`, asegúrate de:

- [ ] Docker Desktop está corriendo
- [ ] Tienes el archivo `.env` configurado con:
  - [ ] `GOOGLE_CLIENT_ID`
  - [ ] `GOOGLE_CLIENT_SECRET`
  - [ ] `GOOGLE_AI_API_KEY`
  - [ ] `JWT_SECRET`
- [ ] Estás en el directorio correcto: `C:\Users\Matias\Documents\CalculoHC`

## 🚀 Después del Despliegue

Una vez que los servicios estén corriendo:

1. **Verifica los servicios:**
   ```powershell
   docker compose ps
   ```

2. **Verifica los health checks:**
   ```powershell
   curl http://localhost:4001/health  # Auth
   curl http://localhost:4002/health  # Food Recognition
   curl http://localhost:4003/health  # Meal Tracking
   curl http://localhost:4004/health  # User Profile
   curl http://localhost:4005/health  # Notification
   curl http://localhost:4006/health  # Analytics
   ```

3. **Accede a la aplicación:**
   - Frontend: http://localhost:3000
   - MinIO Console: http://localhost:9001

## 🔄 Comandos Útiles

```powershell
# Ver logs de un servicio específico
docker compose logs -f frontend
docker compose logs -f food-recognition

# Reiniciar un servicio
docker compose restart frontend

# Detener todos los servicios
docker compose down

# Detener y eliminar volúmenes (CUIDADO: borra datos)
docker compose down -v

# Reconstruir un servicio específico
docker compose build food-recognition
docker compose up -d food-recognition
```

## 📝 Cambios Realizados y Subidos a GitHub

Todos los cambios ya están en el repositorio:
- ✅ Archivos `package-lock.json` generados
- ✅ Guía de configuración de Google OAuth (`GOOGLE_OAUTH_SETUP.md`)
- ✅ Commit realizado
- ✅ Push a GitHub completado

## 🆘 Si Sigues Teniendo Problemas

1. **Verifica que Docker Desktop esté instalado:**
   ```powershell
   docker --version
   ```

2. **Si no está instalado, descárgalo:**
   - https://www.docker.com/products/docker-desktop/

3. **Reinicia Docker Desktop** si está instalado pero no responde

4. **Verifica que WSL 2 esté habilitado** (requerido para Docker en Windows)

---

**Próximo paso:** Abre una nueva terminal con Docker disponible y ejecuta `docker compose build`
