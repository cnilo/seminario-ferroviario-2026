# Formulario Seminario Innovaciones Ferroviarias 2026
## React + Vite — Metro de Santiago

---

## Instalación y uso local

```bash
# 1. Instalar dependencias
npm install

# 2. Servidor de desarrollo
npm run dev

# 3. Build para producción
npm run build
```

---

## Configuración antes de usar

### 1. URL de Power Automate
En `src/components/InscripcionForm.jsx`, línea ~10:
```js
const FLOW_URL = 'https://TU-URL-DE-POWER-AUTOMATE-AQUI'
```
Reemplaza con la URL que genera el trigger "Cuando se recibe una solicitud HTTP" de Power Automate.

### 2. Plantilla de propuesta
Coloca el archivo de plantilla (.pptx) en la carpeta `public/`:
```
public/plantilla-propuesta-seminario-2026.pptx
```
Si cambia el nombre, actualízalo en `src/components/DownloadGate.jsx`:
```js
const TEMPLATE_URL  = '/plantilla-propuesta-seminario-2026.pptx'
const TEMPLATE_NAME = 'Plantilla-Propuesta-Seminario-Ferroviario-2026.pptx'
```

---

## Flujo de la aplicación

```
Pantalla 1 (DownloadGate)
  → Usuario descarga la plantilla .pptx
  → Botón "Ir al formulario" se desbloquea
  → Transición animada

Pantalla 2 (InscripcionForm)
  → Sección 1: Datos de la empresa (5 campos)
  → Sección 2: Categoría de la propuesta (6 opciones radio)
  → Sección 3: Detalle + carga del archivo completado
  → Sección 4: Participación anterior (con campo condicional)
  → Submit → POST JSON a Power Automate → Pantalla de éxito
```

---

## Campos enviados a Power Automate (JSON)

```json
{
  "Title":      "Nombre de la empresa",
  "Pais":       "Chile",
  "Contacto":   "Nombre del contacto",
  "Correo":     "correo@empresa.com",
  "Telefono":   "+56 9 ...",
  "Area":       "Sistemas Ferroviarios",
  "Titulo":     "Título de la propuesta",
  "Resumen":    "Texto del resumen ejecutivo",
  "Participo":  "Sí / No",
  "Calidad":    "Asistente / Expositor / Ambas / N/A",
  "Archivo":    "nombre-del-archivo.pdf",
  "FechaEnvio": "2026-04-15T14:30:00.000Z"
}
```

> **Nota sobre el archivo:** El formulario envía el nombre del archivo pero no el binario al flujo JSON.
> Si necesitas recibir el archivo en SharePoint, configura el flujo de Power Automate para que también
> cree un ítem en una biblioteca de documentos, o usa una segunda llamada de API.

---

## Deploy

El resultado del `npm run build` genera una carpeta `dist/` lista para subir a cualquier hosting estático:
- Azure Static Web Apps
- GitHub Pages  
- Netlify / Vercel
- Servidor propio (Apache/Nginx)
