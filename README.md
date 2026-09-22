# Mapa de planta → WhatsApp

Aplicación web para asignar nombres/comentarios a las secciones de un mapa de planta
y enviar la imagen final por WhatsApp (Twilio) a un número configurado.

- **Frontend**: Next.js 14 + React 18 + TypeScript (`apps/web`) — dibuja el mapa en SVG,
  permite hacer clic en cada sección azul para agregar nombres, y genera la imagen final
  con Canvas.
- **Backend**: NestJS 10 + TypeScript (`apps/api`) — recibe la imagen generada, la guarda
  y la envía por WhatsApp usando la API de Twilio.

## Estructura

```
apps/
  web/   Next.js (interfaz del mapa)
  api/   NestJS (API + envío por WhatsApp)
```

Solo las secciones **azules** del mapa son editables (nombres/comentarios). Las secciones
rojas, blancas, verdes y naranjas son etiquetas fijas (Tarima, Producción, Baños,
Cafetería, Librería, Recepción, Predicador), igual que en el boceto original.

## Requisitos

- Node.js 18+
- Una cuenta de [Twilio](https://www.twilio.com/whatsapp) con el sandbox de WhatsApp
  activado (o un número de WhatsApp Business aprobado en producción).
- Un túnel público hacia tu API local para pruebas (Twilio necesita descargar la imagen
  desde una URL pública), por ejemplo [ngrok](https://ngrok.com/): `ngrok http 3001`.

## Instalación

```bash
npm install
```

Esto instala las dependencias de `apps/web` y `apps/api` (workspaces de npm).

## Configuración

### Backend (`apps/api/.env`)

Copia `apps/api/.env.example` a `apps/api/.env` y completa:

```
TWILIO_ACCOUNT_SID=...
TWILIO_AUTH_TOKEN=...
TWILIO_WHATSAPP_FROM=whatsapp:+14155238886   # número sandbox o el tuyo aprobado
WHATSAPP_TO_NUMBER=+573043383683              # número destino (ya configurado por defecto)
PUBLIC_BASE_URL=https://xxxx.ngrok-free.app   # URL pública de tu API (ver ngrok arriba)
```

Mientras uses el sandbox de Twilio, el número destino (+573043383683) debe primero
enviar el mensaje de "join <palabra-código>" al número sandbox de Twilio por WhatsApp,
una sola vez, para poder recibir mensajes de prueba.

### Frontend (`apps/web/.env.local`)

Copia `apps/web/.env.local.example` a `apps/web/.env.local`:

```
NEXT_PUBLIC_API_URL=http://localhost:3001
```

## Ejecutar en desarrollo

En dos terminales:

```bash
npm run dev:api   # http://localhost:3001
npm run dev:web   # http://localhost:3000
```

Si vas a probar el envío real por WhatsApp, deja corriendo también `ngrok http 3001`
y usa esa URL como `PUBLIC_BASE_URL`.

## Uso

1. Abre `http://localhost:3000`.
2. Haz clic en cualquier sección azul del mapa para abrir el formulario y agregar
   nombre(s) y comentario(s) (puedes agregar varios por sección).
3. Cuando termines, pulsa **"Finalizar y enviar por WhatsApp"**. Esto genera la imagen
   del mapa con los nombres ya escritos de forma legible y la envía al número
   configurado.
4. También puedes usar **"Descargar imagen"** para guardar el PNG localmente en
   cualquier momento (útil como respaldo o si no tienes Twilio configurado todavía).

El progreso se guarda automáticamente en el navegador (localStorage), así que puedes
recargar la página sin perder lo que llevas escrito.

## Notas sobre el envío por WhatsApp

- Se usa la API de Twilio para WhatsApp. El mensaje se envía con `mediaUrl` apuntando
  a la imagen guardada en `apps/api/public/uploads/`, servida por la propia API — por
  eso Twilio necesita poder alcanzar tu servidor públicamente (`PUBLIC_BASE_URL`).
- Si las variables de Twilio no están configuradas, la app igual genera y muestra la
  imagen (y permite descargarla), pero te avisa que falta la configuración en vez de
  fallar silenciosamente.
