# Configuración de GitHub Actions y Docker Hub

Esta guía explica cómo configurar tu repositorio de GitHub para construir automáticamente tus imágenes Docker y subirlas a Docker Hub cada vez que hagas un `push` a la rama `main`.

## 📋 Requisitos Previos

1.  Una cuenta en [Docker Hub](https://hub.docker.com/).
2.  Tu repositorio subido a GitHub.

## 🔐 Paso 1: Configurar Secretos en GitHub

Para que GitHub Actions pueda acceder a tu cuenta de Docker Hub de forma segura, necesitas configurar "Secrets". **Nunca escribas tu contraseña directamente en el código.**

1.  Ve a tu repositorio en **GitHub**.
2.  Haz clic en **Settings** (Configuración) > **Secrets and variables** > **Actions**.
3.  Haz clic en el botón **New repository secret**.
4.  Agrega los siguientes secretos:

    | Nombre del Secreto | Valor | Descripción |
    | :--- | :--- | :--- |
    | `DOCKER_USERNAME` | `matiasvaldivia4it` (ejemplo) | Tu nombre de usuario de Docker Hub. |
    | `DOCKER_PASSWORD` | `tu_token_de_acceso` | Tu contraseña de Docker Hub o, preferiblemente, un **Access Token**. |

### 💡 Consejo: Usar un Docker Hub Access Token (Recomendado)

En lugar de tu contraseña real, es mejor usar un Token de Acceso:
1.  Ve a [Docker Hub Account Settings](https://hub.docker.com/settings/security).
2.  Ve a la pestaña **Security**.
3.  Haz clic en **New Access Token**.
4.  Dale un nombre (ej. "GitHub Actions").
5.  Copia el token generado y úsalo como el valor de `DOCKER_PASSWORD` en GitHub.

## 🚀 Paso 2: Ejecutar el Workflow

Una vez configurados los secretos, el workflow se ejecutará automáticamente la próxima vez que hagas un push a `main`.

1.  Haz un cambio en tu código (o un commit vacío).
2.  Haz push a `main`:
    ```bash
    git push origin main
    ```
3.  Ve a la pestaña **Actions** en tu repositorio de GitHub para ver el progreso.

## 📦 ¿Qué hace este Workflow?

El archivo `.github/workflows/docker-publish.yml` que he creado realiza lo siguiente:

1.  **Matriz de Servicios**: Ejecuta trabajos en paralelo para tus 8 servicios (`frontend`, `auth-service`, etc.).
2.  **Buildx**: Configura Docker Buildx para builds eficientes con caché.
3.  **Login**: Se autentica en Docker Hub usando tus secretos.
4.  **Build & Push**:
    *   Construye la imagen Docker de cada servicio.
    *   Le asigna el tag `latest` y un tag con el hash del commit (`sha-xyz123`).
    *   Sube las imágenes a tu cuenta de Docker Hub (ej. `tu_usuario/diabetes-frontend:latest`).
    *   Utiliza caché de GitHub Actions para acelerar builds futuros.

## 🛠️ Uso de las Imágenes en Producción

Una vez que tus imágenes estén en Docker Hub, puedes actualizar tu `docker-compose.yml` en tu servidor de producción para usar estas imágenes pre-construidas en lugar de construir localmente.

Ejemplo de cambio en `docker-compose.yml`:

```yaml
  # ANTES (Build local)
  # frontend:
  #   build: ./frontend

  # DESPUÉS (Usar imagen de Docker Hub)
  frontend:
    image: tu_usuario/diabetes-frontend:latest
    pull_policy: always
```

Esto hace que tus despliegues sean mucho más rápidos y reproducibles.
