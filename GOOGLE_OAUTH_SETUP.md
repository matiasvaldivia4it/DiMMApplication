# Guía de Configuración de Google OAuth 2.0

Esta guía te llevará paso a paso para configurar Google OAuth en tu aplicación de diabetes.

## 📋 Requisitos Previos

- Cuenta de Google
- Acceso a Google Cloud Console
- 10-15 minutos de tiempo

---

## 🚀 Paso 1: Acceder a Google Cloud Console

1. Ve a [Google Cloud Console](https://console.cloud.google.com/)
2. Inicia sesión con tu cuenta de Google

---

## 📦 Paso 2: Crear un Nuevo Proyecto

1. En la parte superior, haz clic en el selector de proyectos
2. Haz clic en **"Nuevo Proyecto"** (New Project)
3. Configura el proyecto:
   - **Nombre del proyecto**: `DiabetesApp` (o el nombre que prefieras)
   - **Organización**: Déjalo en blanco si no tienes una
4. Haz clic en **"Crear"**
5. Espera unos segundos mientras se crea el proyecto
6. Selecciona el proyecto recién creado desde el selector de proyectos

---

## 🔑 Paso 3: Habilitar Google+ API

1. En el menú lateral, ve a **"APIs y servicios"** → **"Biblioteca"**
2. Busca **"Google+ API"**
3. Haz clic en **"Google+ API"**
4. Haz clic en **"Habilitar"** (Enable)

---

## 🎨 Paso 4: Configurar Pantalla de Consentimiento OAuth

1. En el menú lateral, ve a **"APIs y servicios"** → **"Pantalla de consentimiento de OAuth"**
2. Selecciona **"Externo"** (External) como tipo de usuario
3. Haz clic en **"Crear"**

### Configuración de la Pantalla de Consentimiento:

**Información de la aplicación:**
- **Nombre de la aplicación**: `Calculadora de Hidrato de Carbono`
- **Correo electrónico de asistencia al usuario**: Tu correo de Google
- **Logotipo de la aplicación**: (Opcional) Puedes subirlo después

**Información de contacto del desarrollador:**
- **Direcciones de correo electrónico**: Tu correo de Google

4. Haz clic en **"Guardar y continuar"**

**Permisos (Scopes):**
5. Haz clic en **"Agregar o quitar permisos"**
6. Busca y selecciona:
   - ✅ `userinfo.email`
   - ✅ `userinfo.profile`
   - ✅ `openid`
7. Haz clic en **"Actualizar"**
8. Haz clic en **"Guardar y continuar"**

**Usuarios de prueba:**
9. Haz clic en **"Agregar usuarios"**
10. Agrega tu correo electrónico y cualquier otro correo que quieras usar para pruebas
11. Haz clic en **"Agregar"**
12. Haz clic en **"Guardar y continuar"**

**Resumen:**
13. Revisa la información y haz clic en **"Volver al panel"**

---

## 🔐 Paso 5: Crear Credenciales OAuth

1. En el menú lateral, ve a **"APIs y servicios"** → **"Credenciales"**
2. Haz clic en **"+ Crear credenciales"** en la parte superior
3. Selecciona **"ID de cliente de OAuth"**

### Configuración del Cliente OAuth:

**Tipo de aplicación:**
- Selecciona **"Aplicación web"**

**Nombre:**
- Escribe: `DiabetesApp Web Client`

**Orígenes de JavaScript autorizados:**
- Haz clic en **"+ Agregar URI"**
- Agrega: `http://localhost:3000`
- Haz clic en **"+ Agregar URI"** de nuevo
- Agrega: `http://localhost:4000`

**URIs de redireccionamiento autorizados:**
- Haz clic en **"+ Agregar URI"**
- Agrega: `http://localhost:4000/api/auth/google/callback`

4. Haz clic en **"Crear"**

---

## 📋 Paso 6: Copiar las Credenciales

Después de crear el cliente OAuth, verás un modal con:

- **ID de cliente** (Client ID)
- **Secreto del cliente** (Client Secret)

### ⚠️ IMPORTANTE: Guarda estas credenciales de forma segura

1. Copia el **ID de cliente**
2. Copia el **Secreto del cliente**
3. Haz clic en **"Aceptar"**

---

## ⚙️ Paso 7: Configurar tu Aplicación

### Opción A: Usando archivo .env (Recomendado)

1. Abre el archivo `.env` en la raíz de tu proyecto
2. Reemplaza los valores:

```bash
# Google OAuth Configuration
GOOGLE_CLIENT_ID=tu_client_id_aqui
GOOGLE_CLIENT_SECRET=tu_client_secret_aqui

# Ejemplo:
# GOOGLE_CLIENT_ID=123456789-abcdefghijklmnop.apps.googleusercontent.com
# GOOGLE_CLIENT_SECRET=GOCSPX-abcdefghijklmnopqrstuvwxyz
```

### Opción B: Variables de entorno del sistema

En PowerShell:
```powershell
$env:GOOGLE_CLIENT_ID="tu_client_id_aqui"
$env:GOOGLE_CLIENT_SECRET="tu_client_secret_aqui"
```

---

## 🧪 Paso 8: Probar la Configuración

1. **Reinicia los servicios Docker:**
   ```bash
   docker-compose down
   docker-compose up -d
   ```

2. **Accede a la aplicación:**
   - Abre tu navegador en `http://localhost:3000`

3. **Prueba el login:**
   - Haz clic en **"Continuar con Google"**
   - Deberías ver la pantalla de consentimiento de Google
   - Selecciona tu cuenta
   - Acepta los permisos
   - Deberías ser redirigido al dashboard

---

## 🔧 Solución de Problemas

### Error: "redirect_uri_mismatch"

**Causa:** La URI de redirección no coincide con la configurada en Google Cloud.

**Solución:**
1. Ve a Google Cloud Console → Credenciales
2. Edita tu cliente OAuth
3. Verifica que la URI sea exactamente: `http://localhost:4000/api/auth/google/callback`
4. Guarda los cambios

### Error: "Access blocked: This app's request is invalid"

**Causa:** Faltan permisos en la pantalla de consentimiento.

**Solución:**
1. Ve a Pantalla de consentimiento OAuth
2. Verifica que los scopes incluyan: `userinfo.email`, `userinfo.profile`, `openid`
3. Agrega tu correo como usuario de prueba

### Error: "Invalid client"

**Causa:** El Client ID o Client Secret son incorrectos.

**Solución:**
1. Verifica que copiaste correctamente las credenciales
2. Asegúrate de que no haya espacios extra en el archivo `.env`
3. Reinicia los servicios: `docker-compose restart`

---

## 🌐 Configuración para Producción

Cuando despliegues en producción, necesitarás actualizar:

### 1. Agregar dominio de producción

En Google Cloud Console → Credenciales → Editar cliente OAuth:

**Orígenes de JavaScript autorizados:**
- `https://tudominio.com`

**URIs de redireccionamiento autorizados:**
- `https://tudominio.com/api/auth/google/callback`

### 2. Publicar la aplicación

1. Ve a **Pantalla de consentimiento OAuth**
2. Haz clic en **"Publicar aplicación"**
3. Sigue el proceso de verificación de Google (si es necesario)

### 3. Actualizar variables de entorno

En tu servidor de producción:
```bash
GOOGLE_CLIENT_ID=tu_client_id
GOOGLE_CLIENT_SECRET=tu_client_secret
```

---

## 📝 Checklist de Verificación

Antes de continuar, verifica que hayas completado:

- [ ] Creado proyecto en Google Cloud Console
- [ ] Habilitado Google+ API
- [ ] Configurado pantalla de consentimiento OAuth
- [ ] Agregado scopes: `userinfo.email`, `userinfo.profile`, `openid`
- [ ] Agregado usuarios de prueba
- [ ] Creado credenciales OAuth (Aplicación web)
- [ ] Configurado orígenes autorizados: `http://localhost:3000`, `http://localhost:4000`
- [ ] Configurado URI de redirección: `http://localhost:4000/api/auth/google/callback`
- [ ] Copiado Client ID y Client Secret
- [ ] Actualizado archivo `.env`
- [ ] Reiniciado servicios Docker
- [ ] Probado el login

---

## 🎯 Próximos Pasos

Una vez que Google OAuth esté funcionando:

1. **Configura Google AI API** para Gemini Vision
   - Ve a [Google AI Studio](https://aistudio.google.com/app/apikey)
   - Crea una API key
   - Agrégala a `.env` como `GOOGLE_AI_API_KEY`

2. **Genera JWT Secret**
   ```bash
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```
   - Copia el resultado
   - Agrégalo a `.env` como `JWT_SECRET`

3. **Inicia la aplicación**
   ```bash
   docker-compose up -d
   ```

---

## 📞 Recursos Adicionales

- [Documentación oficial de Google OAuth](https://developers.google.com/identity/protocols/oauth2)
- [Google Cloud Console](https://console.cloud.google.com/)
- [Google AI Studio](https://aistudio.google.com/)

---

## 💡 Consejos de Seguridad

1. **Nunca compartas** tu Client Secret públicamente
2. **No subas** el archivo `.env` a Git (ya está en `.gitignore`)
3. **Usa variables de entorno** en producción
4. **Rota las credenciales** periódicamente
5. **Limita los scopes** solo a lo necesario

---

¡Listo! Ahora deberías tener Google OAuth configurado correctamente. 🎉
