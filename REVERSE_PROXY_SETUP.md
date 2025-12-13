# Configuración de Proxy Reverso

Esta aplicación está configurada para funcionar detrás de un proxy reverso como **Traefik** o **Nginx Proxy Manager**.

## 📋 Tabla de Contenidos

- [Configuración con Traefik](#configuración-con-traefik)
- [Configuración con Nginx Proxy Manager](#configuración-con-nginx-proxy-manager)
- [Variables de Entorno](#variables-de-entorno)
- [Dominios Requeridos](#dominios-requeridos)
- [Desarrollo Local](#desarrollo-local)

---

## 🚀 Configuración con Nginx Proxy Manager

### 1. Desplegar Nginx Proxy Manager

Hemos creado un archivo `docker-compose.proxy.yml` para facilitar el despliegue de NPM.

1. **Crear la red de proxy** (si no existe):
   ```bash
   docker network create proxy
   ```

2. **Iniciar Nginx Proxy Manager:**
   ```bash
   docker compose -f docker-compose.proxy.yml up -d
   ```

3. **Acceder al Panel de Administración:**
   - URL: `http://localhost:81`
   - Email por defecto: `admin@example.com`
   - Password por defecto: `changeme`

### 2. Actualizar Variables de Entorno

Edita tu `.env`:

```bash
# Dominios
REACT_APP_API_GATEWAY=https://api.yourdomain.com
GOOGLE_CALLBACK_URL=https://api.yourdomain.com/api/auth/google/callback
```

### 3. Iniciar la Aplicación

```bash
docker compose up -d
```

### 1. Instalar Nginx Proxy Manager

```bash
version: '3.8'

services:
  nginx-proxy-manager:
    image: 'jc21/nginx-proxy-manager:latest'
    container_name: nginx-proxy-manager
    ports:
      - '80:80'
      - '443:443'
      - '81:81'  # Admin panel
    volumes:
      - npm-data:/data
      - npm-letsencrypt:/etc/letsencrypt
    networks:
      - proxy

networks:
  proxy:
    external: true

volumes:
  npm-data:
  npm-letsencrypt:
```

### 2. Configurar Proxy Hosts

Accede a Nginx Proxy Manager en `http://tu-servidor:81`

**Credenciales por defecto:**
- Email: `admin@example.com`
- Password: `changeme`

#### Frontend (yourdomain.com)

1. Ir a **Hosts** → **Proxy Hosts** → **Add Proxy Host**
2. Configurar:
   - **Domain Names**: `yourdomain.com`, `www.yourdomain.com`
   - **Scheme**: `http`
   - **Forward Hostname/IP**: `diabetes-frontend` (nombre del contenedor)
   - **Forward Port**: `3000`
   - **Block Common Exploits**: ✅
   - **Websockets Support**: ✅
3. En la pestaña **SSL**:
   - **SSL Certificate**: Request a new SSL Certificate
   - **Force SSL**: ✅
   - **HTTP/2 Support**: ✅
   - **HSTS Enabled**: ✅

#### API Gateway (api.yourdomain.com)

1. **Add Proxy Host**
2. Configurar:
   - **Domain Names**: `api.yourdomain.com`
   - **Scheme**: `http`
   - **Forward Hostname/IP**: `diabetes-api-gateway`
   - **Forward Port**: `4000`
   - **Block Common Exploits**: ✅
   - **Websockets Support**: ✅
3. SSL igual que frontend

#### MinIO Console (minio.yourdomain.com) - Opcional

1. **Add Proxy Host**
2. Configurar:
   - **Domain Names**: `minio.yourdomain.com`
   - **Scheme**: `http`
   - **Forward Hostname/IP**: `diabetes-minio`
   - **Forward Port**: `9001`
3. SSL igual que frontend

### 3. Modificar docker-compose.yml para NPM

Si usas Nginx Proxy Manager, puedes simplificar el `docker-compose.yml` eliminando los labels de Traefik:

```bash
# Usar la versión sin labels de Traefik
cp docker-compose.local.yml docker-compose.yml

# Pero agregar la red proxy
# Editar manualmente para agregar:
networks:
  proxy:
    external: true

# Y en cada servicio que necesite ser accesible:
networks:
  - proxy
  - internal  # o la red por defecto
```

---

## 🌐 Dominios Requeridos

Necesitarás configurar los siguientes registros DNS:

| Tipo | Nombre | Valor |
|------|--------|-------|
| A | `@` | IP de tu servidor |
| A | `www` | IP de tu servidor |
| A | `api` | IP de tu servidor |
| A | `minio` | IP de tu servidor (opcional) |

O usar un wildcard:

| Tipo | Nombre | Valor |
|------|--------|-------|
| A | `*` | IP de tu servidor |

---

## 🔐 Variables de Entorno para Producción

Actualiza tu `.env` con los valores de producción:

```bash
# Dominios de producción
REACT_APP_API_GATEWAY=https://api.tudominio.com
GOOGLE_CALLBACK_URL=https://api.tudominio.com/api/auth/google/callback

# Google OAuth (actualizar en Google Cloud Console)
GOOGLE_CLIENT_ID=tu_client_id_produccion
GOOGLE_CLIENT_SECRET=tu_client_secret_produccion

# Google AI API
GOOGLE_AI_API_KEY=tu_google_ai_api_key

# JWT Secret (generar uno nuevo para producción)
JWT_SECRET=tu_jwt_secret_produccion_muy_largo_y_seguro

# VAPID Keys para notificaciones (generar con web-push)
VAPID_PUBLIC_KEY=tu_vapid_public_key
VAPID_PRIVATE_KEY=tu_vapid_private_key
```

### Generar JWT Secret

```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### Generar VAPID Keys

```bash
npx web-push generate-vapid-keys
```

---

## 💻 Desarrollo Local

Para desarrollo local, usa `docker-compose.local.yml`:

```bash
# Iniciar en modo desarrollo
docker compose -f docker-compose.local.yml up -d

# Ver logs
docker compose -f docker-compose.local.yml logs -f

# Detener
docker compose -f docker-compose.local.yml down
```

Este archivo expone todos los puertos directamente sin proxy reverso.

---

## 🔄 Cambiar entre Local y Producción

### Desarrollo Local

```bash
# Usar archivo local
docker compose -f docker-compose.local.yml up -d

# Variables de entorno
REACT_APP_API_GATEWAY=http://localhost:4000
GOOGLE_CALLBACK_URL=http://localhost:4000/api/auth/google/callback
```

### Producción con Proxy

```bash
# Usar archivo de producción (por defecto)
docker compose up -d

# Variables de entorno
REACT_APP_API_GATEWAY=https://api.tudominio.com
GOOGLE_CALLBACK_URL=https://api.tudominio.com/api/auth/google/callback
```

---

## 🛡️ Seguridad Adicional

### Headers de Seguridad (Traefik)

Los siguientes headers ya están configurados en el `docker-compose.yml`:

- `X-Robots-Tag`: Evita indexación de la API
- `SSL Redirect`: Fuerza HTTPS
- `HSTS`: HTTP Strict Transport Security
- `STS Include Subdomains`: HSTS en subdominios
- `STS Preload`: HSTS preload

### Rate Limiting (Nginx Proxy Manager)

En NPM, puedes agregar rate limiting en **Custom Locations**:

```nginx
location /api/auth {
    limit_req zone=one burst=5 nodelay;
    proxy_pass http://diabetes-api-gateway:4000;
}
```

---

## 📊 Monitoreo

### Ver logs de todos los servicios

```bash
docker compose logs -f
```

### Ver logs de un servicio específico

```bash
docker compose logs -f frontend
docker compose logs -f api-gateway
```

### Ver estado de los servicios

```bash
docker compose ps
```

### Health checks

```bash
# Verificar health checks
docker ps --format "table {{.Names}}\t{{.Status}}"
```

---

## 🆘 Troubleshooting

### Error: "network proxy not found"

```bash
# Crear la red proxy
docker network create proxy
```

### Error: "502 Bad Gateway"

1. Verificar que el servicio esté corriendo:
   ```bash
   docker compose ps
   ```

2. Ver logs del servicio:
   ```bash
   docker compose logs -f <servicio>
   ```

3. Verificar health check:
   ```bash
   docker inspect <contenedor> | grep -A 10 Health
   ```

### Certificados SSL no se generan

1. Verificar que los puertos 80 y 443 estén abiertos
2. Verificar que el dominio apunte a tu servidor
3. Ver logs de Traefik:
   ```bash
   docker logs traefik
   ```

---

## 📝 Checklist de Despliegue

- [ ] Red `proxy` creada
- [ ] Traefik o Nginx Proxy Manager configurado
- [ ] Registros DNS configurados
- [ ] Variables de entorno de producción configuradas
- [ ] Google OAuth actualizado con URLs de producción
- [ ] `docker-compose.yml` actualizado con dominios reales
- [ ] Certificados SSL configurados
- [ ] Servicios iniciados: `docker compose up -d`
- [ ] Health checks verificados
- [ ] Aplicación accesible en `https://tudominio.com`

---

¡Listo! Tu aplicación ahora está configurada para funcionar detrás de un proxy reverso. 🎉
