/**
 * BACKEND GOOGLE APPS SCRIPT PARA CONTADOR DE CALORÍAS
 * 
 * INSTRUCCIONES DE INSTALACIÓN (2 MINUTOS):
 * 1. Abre Google Drive (drive.google.com).
 * 2. Crea una nueva Hoja de cálculo de Google (Google Sheets) y nómbrala "ContadorCalorias_DB".
 * 3. En el menú superior de la hoja, ve a: Extensiones -> Apps Script.
 * 4. Borra todo el código que aparezca y pega este archivo completo.
 * 5. Haz clic en "Implementar" (botón azul arriba a la derecha) -> "Nueva implementación".
 * 6. Selecciona tipo: "Aplicación web".
 * 7. Configura:
 *    - Descripción: "API Contador Calorias"
 *    - Ejecutar como: "Yo (tu correo)"
 *    - Quién tiene acceso: "Cualquier persona" (permite a tu app web enviar datos sin autenticaciones complejas).
 * 8. Haz clic en "Implementar", concede los permisos de tu cuenta de Google.
 * 9. Copia la "URL de la aplicación web" (termina en /exec) y pégala en los Ajustes de la App ContadorCalorias.
 */

function doGet(e) {
  try {
    const action = e.parameter.action || "GET_FULL_DATA";
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    setupSheetsIfMissing(ss);

    if (action === "GET_FULL_DATA") {
      let rawCombos = readSheetObjects(ss.getSheetByName("Combos"));
      let parsedCombos = rawCombos.map(c => {
        let items = c.items;
        if (typeof items === "string" && items.startsWith("[")) {
          try { items = JSON.parse(items); } catch (e) {}
        }
        return { ...c, items: Array.isArray(items) ? items : [] };
      });

      const data = {
        logs: readSheetObjects(ss.getSheetByName("Diario")),
        foods: readSheetObjects(ss.getSheetByName("Alimentos")),
        combos: parsedCombos,
        weights: readSheetObjects(ss.getSheetByName("Pesos")),
        settings: readSettingsSheet(ss.getSheetByName("Configuracion"))
      };

      return ContentService.createTextOutput(JSON.stringify({
        success: true,
        data: data
      })).setMimeType(ContentService.MimeType.JSON);
    }

    return ContentService.createTextOutput(JSON.stringify({
      success: true,
      message: "Servicio activo"
    })).setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      message: err.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

function doPost(e) {
  try {
    const postData = JSON.parse(e.postData.contents);
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    setupSheetsIfMissing(ss);

    if (postData.action === "SYNC_BATCH" && postData.fullState) {
      // Guardar estado completo en las hojas
      writeSheetObjects(ss.getSheetByName("Diario"), [
        "id", "date", "time", "mealType", "foodId", "foodName", "quantity", "unit", "calories", "protein", "fats", "carbs", "createdAt"
      ], postData.fullState.logs || []);

      writeSheetObjects(ss.getSheetByName("Alimentos"), [
        "id", "name", "category", "defaultUnit", "unitGrams", "calories", "protein", "fats", "carbs", "aliases"
      ], (postData.fullState.foods || []).map(f => ({
        ...f,
        aliases: Array.isArray(f.aliases) ? f.aliases.join(", ") : (f.aliases || f.sinonimos || "")
      })));

      writeSheetObjects(ss.getSheetByName("Combos"), [
        "id", "name", "items", "calories", "protein", "fats", "carbs"
      ], (postData.fullState.combos || []).map(c => ({
        ...c,
        items: typeof c.items === "string" ? c.items : JSON.stringify(c.items || [])
      })));

      writeSheetObjects(ss.getSheetByName("Pesos"), [
        "date", "weight"
      ], postData.fullState.weights || []);

      writeSettingsSheet(ss.getSheetByName("Configuracion"), postData.fullState.settings || {});

      return ContentService.createTextOutput(JSON.stringify({
        success: true,
        message: "Datos sincronizados correctamente en Google Sheets",
        timestamp: new Date().toISOString()
      })).setMimeType(ContentService.MimeType.JSON);
    }

    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      message: "Acción no reconocida"
    })).setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      message: err.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

// --- UTILIDADES DE GOOGLE SHEETS ---

function setupSheetsIfMissing(ss) {
  const required = ["Diario", "Alimentos", "Combos", "Pesos", "Configuracion"];
  required.forEach(name => {
    let sheet = ss.getSheetByName(name);
    if (!sheet) {
      sheet = ss.insertSheet(name);
      if (name === "Diario") {
        sheet.appendRow(["ID", "Fecha", "Hora", "Toma", "FoodID", "Alimento", "Cantidad", "Unidad", "Calorias", "Proteina", "Grasas", "Carbohidratos", "CreadoEn"]);
      } else if (name === "Alimentos") {
        sheet.appendRow(["ID", "Nombre", "Categoria", "UnidadBase", "GramosUnidad", "Calorias", "Proteina", "Grasas", "Carbohidratos", "Sinonimos"]);
      } else if (name === "Combos") {
        sheet.appendRow(["ID", "Nombre", "Items", "Calorias", "Proteina", "Grasas", "Carbohidratos"]);
      } else if (name === "Pesos") {
        sheet.appendRow(["Fecha", "Peso"]);
      } else if (name === "Configuracion") {
        sheet.appendRow(["Clave", "Valor"]);
      }
    }
  });
}

function readSheetObjects(sheet) {
  if (!sheet) return [];
  const data = sheet.getDataRange().getValues();
  const displayData = sheet.getDataRange().getDisplayValues();
  if (data.length <= 1) return [];

  const headers = data[0].map(h => String(h).trim().toLowerCase());
  const rows = [];

  for (let i = 1; i < data.length; i++) {
    let row = data[i];
    let displayRow = displayData[i];
    let obj = {};
    headers.forEach((h, idx) => {
      let key = h;
      if (key === "sinonimos" || key === "sinónimos" || key === "palabrasclave" || key === "palabras clave" || key === "palabras_clave") {
        key = "aliases";
      }
      if (row[idx] instanceof Date) {
        obj[key] = displayRow[idx] || row[idx].toISOString();
      } else {
        obj[key] = row[idx];
      }
    });
    rows.push(obj);
  }
  return rows;
}

function writeSheetObjects(sheet, headers, objects) {
  if (!sheet) return;
  sheet.clear();
  sheet.appendRow(headers);

  if (!objects || objects.length === 0) return;

  const rows = objects.map(obj => {
    return headers.map(key => {
      let val = obj[key];
      if (Array.isArray(val)) {
        return val.join(", ");
      }
      return val !== undefined && val !== null ? val : "";
    });
  });

  if (rows.length > 0) {
    sheet.getRange(2, 1, rows.length, headers.length).setValues(rows);
  }
}

function readSettingsSheet(sheet) {
  if (!sheet) return {};
  const data = sheet.getDataRange().getValues();
  const settings = {};
  for (let i = 1; i < data.length; i++) {
    let key = String(data[i][0]).trim();
    let val = data[i][1];
    if (key) {
      settings[key] = isNaN(Number(val)) ? val : Number(val);
    }
  }
  return settings;
}

function writeSettingsSheet(sheet, settings) {
  if (!sheet) return;
  sheet.clear();
  sheet.appendRow(["Clave", "Valor"]);
  const rows = Object.entries(settings).map(([k, v]) => [k, typeof v === "object" ? JSON.stringify(v) : v]);
  if (rows.length > 0) {
    sheet.getRange(2, 1, rows.length, 2).setValues(rows);
  }
}
