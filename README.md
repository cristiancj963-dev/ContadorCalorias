# 🥑 ContadorCalorias & Macros

Aplicación web ligera, rápida y moderna para el registro de comidas y seguimiento de macronutrientes orientada a **recomposición corporal**, sin dependencias externas ni necesidad de IA en tiempo de ejecución, con persistencia local y sincronización con **Google Workspace (Google Sheets / Drive)**.

---

## 🚀 Características Principales

1. **✍️ Entrada Rápida en Lenguaje Natural (Sin IA)**:
   - Escribe lo que has comido en una sola frase:
     - `vaso leche desnatada con nesquik, 3 puñados avena, 3 tostadas con queso cottage y miel`
     - `200g patata cocida, filete ternera 150g, rodaja sandia`
     - `pincho tortilla de patata, cortado, 4 lonchas de pavo`
   - El motor de reglas y expresiones regulares extrae cantidades, unidades (`puñados`, `vasos`, `tostadas`, `lonchas`, `g`, `ml`, `raciones`) y cruza los alimentos con la base de datos nutricional al instante.

2. **🥗 Catálogo Nutricional Precargado**:
   - Incluye más de 40 alimentos y recetas reales extraídos de tu histórico de dieta (`registro_dieta.md`) con sus equivalencias de porción casera.
   - Editor para añadir nuevos alimentos personalizados o ajustar sus macros con un solo clic.

3. **🎯 Metas y Macros Personalizables**:
   - Metas iniciales de recomposición corporal:
     - **Calorías**: `2.750 - 2.800 kcal`
     - **Proteínas**: `150 - 160 g` (155g)
     - **Grasas**: `75 - 80 g` (78g)
     - **Carbohidratos**: `340 - 360 g` (350g)
   - Indicadores visuales de estado: 🟢 En rango objetivo (✓), 🟡 Por debajo, 🔴 Excedido.
   - Seguimiento de peso corporal con historial.

4. **⚡ Combos y Plantillas de Comidas**:
   - Registra desayunos, meriendas o comidas habituales con 1 solo clic.

5. **☁️ Sincronización con Google Workspace / Google Drive**:
   - Los datos se guardan en tu propia cuenta de Google Drive en una hoja de Google Sheets.
   - Funcionamiento **Offline-First**: La interfaz responde inmediatamente guardando en `LocalStorage`, y sincroniza en segundo plano cuando tienes conexión.
   - Exportación e importación de copias de seguridad en formato JSON.

---

## 📖 Cómo Ejecutar la Aplicación

Simplemente abre el archivo `index.html` en cualquier navegador web:

```bash
# Opción 1: Abrir directamente en el navegador
xdg-open /home/ristian/escritorio/Aplicaciones/ContadorCalorias/index.html

# Opción 2: O iniciar un servidor local si lo prefieres
cd /home/ristian/escritorio/Aplicaciones/ContadorCalorias
python3 -m http.server 8080
# Y acceder a: http://localhost:8080
```

---

## ☁️ Configuración de Google Drive & Google Sheets (2 Minutos)

Para conectar la app con tu Google Drive y que actúe como base de datos en la nube:

1. Entra en [Google Drive](https://drive.google.com).
2. Crea una nueva **Hoja de cálculo de Google** y nómbrala `ContadorCalorias_DB`.
3. En el menú superior de la hoja, ve a: **Extensiones** ➔ **Apps Script**.
4. Borra el código por defecto y pega el contenido completo del archivo [`google_apps_script.js`](./google_apps_script.js).
5. Haz clic en el botón azul superior **Implementar** ➔ **Nueva implementación**.
6. En tipo de implementación, selecciona el icono de engranaje ➔ **Aplicación web**.
7. Rellena los campos:
   - **Descripción**: `API Contador Calorias`
   - **Ejecutar como**: `Yo (tu cuenta de Google)`
   - **Quién tiene acceso**: `Cualquier persona` *(esto permite que tu app web en local o móvil pueda comunicarse con tu hoja sin pasar por pantallas de inicio de sesión complejas)*.
8. Haz clic en **Implementar**, concede los permisos con tu cuenta de Google.
9. Copia la **URL de la aplicación web** (que termina en `/exec`).
10. Abre la aplicación ContadorCalorias, entra en la pestaña **⚙️ Ajustes & Drive**, pega la URL en la casilla correspondiente y haz clic en **Guardar**.

¡Listo! A partir de ese momento podrás sincronizar con tu Google Sheet cuando quieras con un solo clic.

---

## 📁 Estructura del Proyecto

```
ContadorCalorias/
├── index.html                 # Estructura principal y maquetación SPA
├── styles.css                 # Diseño moderno, modo oscuro/claro, responsive
├── js/
│   ├── app.js                 # Controlador de eventos, renderizado y reactividad
│   ├── parser.js              # Parser de lenguaje natural para descomponer frases
│   ├── foodsData.js           # Base de datos nutricional inicial, porciones y combos
│   ├── db.js                  # Manejo de persistencia LocalStorage + sync Google Apps Script
│   └── stats.js               # Cálculo de métricas, promedios, rachas y comparativa
├── google_apps_script.js       # Backend serverless listo para pegar en Google Apps Script
└── README.md                  # Este documento
```
