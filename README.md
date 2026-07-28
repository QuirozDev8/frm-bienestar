# Gama de colores para la web
Códigos de color
Negro - #11101d
Blanco - #ffffff
Azul - #0001f3
Rojo - #df2a25
Amarillo - #e1ff00


# categorizacion 
Depresión:
5-6 depresión leve
7-10 depresión moderada
11-13 depresión severa
14 o más, depresión extremadamente severa.
Ansiedad:
4 ansiedad leve
5-7 ansiedad moderada
8-9 ansiedad severa
10 o más, ansiedad extremadamente severa.
Estrés:
8-9 estrés leve
10-12 estrés moderado
13-16 estrés severo
17 o más, estrés extremadamente severo.

## Webhook de n8n

El formulario envía sus respuestas mediante una petición `POST` en formato
JSON. Copia `.env.example` como `.env` y reemplaza la URL de ejemplo:

```env
VITE_N8N_WEBHOOK_URL=https://tu-instancia-n8n.com/webhook/ruta-del-formulario
```

Después de modificar la variable, reinicia el servidor de desarrollo.

## Token del formulario

El enlace de acceso puede incluir el identificador como parámetro:

```text
http://localhost:5173/formulario?token=token-prueba-001
```

La aplicación conserva el token durante el diligenciamiento, lo elimina de la
URL visible y lo adjunta al JSON enviado al webhook.

Para probar el formulario localmente sin agregar el parámetro a la URL, define
un token de prueba en `.env`:

```env
VITE_FORM_TEST_TOKEN=test-token-local
```

Vite solo utiliza esta alternativa en modo desarrollo. En producción, el
formulario requiere un token válido recibido en el enlace.