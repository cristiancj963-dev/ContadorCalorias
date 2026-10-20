/**
 * Capa de datos y persistencia (LocalStorage + Google Apps Script Sync)
 */

function formatToLocalDateString(rawDate) {
  if (!rawDate) return "";
  let str = String(rawDate).trim();
  if (str.includes("T") || str.includes("Z")) {
    let d = new Date(str);
    if (!isNaN(d.getTime())) {
      let y = d.getFullYear();
      let m = String(d.getMonth() + 1).padStart(2, "0");
      let day = String(d.getDate()).padStart(2, "0");
      return `${y}-${m}-${day}`;
    }
  }
  let match = str.match(/^(\d{4})[/-](\d{1,2})[/-](\d{1,2})/);
  if (match) {
    return `${match[1]}-${match[2].padStart(2, "0")}-${match[3].padStart(2, "0")}`;
  }
  return str;
}

function formatToLocalTimeString(rawTime) {
  if (!rawTime) return "12:00";
  let str = String(rawTime).trim();
  if (str.includes("T") || str.includes("Z") || str.includes("1899")) {
    let d = new Date(str);
    if (!isNaN(d.getTime())) {
      let h = String(d.getHours()).padStart(2, "0");
      let min = String(d.getMinutes()).padStart(2, "0");
      return `${h}:${min}`;
    }
  }
  let match = str.match(/^(\d{1,2}):(\d{2})/);
  if (match) {
    return `${match[1].padStart(2, "0")}:${match[2]}`;
  }
  return str;
}

class CalorieDB {
  constructor() {
    this.STORAGE_KEYS = {
      LOGS: "contador_calorias_logs",
      FOODS: "contador_calorias_foods",
      COMBOS: "contador_calorias_combos",
      SETTINGS: "contador_calorias_settings",
      WEIGHTS: "contador_calorias_weights",
      PENDING_SYNC: "contador_calorias_pending_sync"
    };

    this.init();
  }

  init() {
    // Inicializar configuraciones si no existen
    if (!localStorage.getItem(this.STORAGE_KEYS.SETTINGS)) {
      localStorage.setItem(this.STORAGE_KEYS.SETTINGS, JSON.stringify(window.DEFAULT_SETTINGS || {}));
    }

    // Inicializar alimentos si no existen
    if (!localStorage.getItem(this.STORAGE_KEYS.FOODS)) {
      localStorage.setItem(this.STORAGE_KEYS.FOODS, JSON.stringify(window.DEFAULT_FOODS || []));
    }

    // Inicializar combos si no existen
    if (!localStorage.getItem(this.STORAGE_KEYS.COMBOS)) {
      localStorage.setItem(this.STORAGE_KEYS.COMBOS, JSON.stringify(window.DEFAULT_COMBOS || []));
    }

    // Inicializar registros de comidas si no existen
    if (!localStorage.getItem(this.STORAGE_KEYS.LOGS)) {
      localStorage.setItem(this.STORAGE_KEYS.LOGS, JSON.stringify([]));
    }

    // Inicializar histórico de pesos
    if (!localStorage.getItem(this.STORAGE_KEYS.WEIGHTS)) {
      let initialWeights = [
        { date: "2026-08-10", weight: 68.0 },
        { date: "2026-08-15", weight: 68.5 },
        { date: "2026-08-23", weight: 69.1 },
        { date: "2026-08-30", weight: 69.6 }
      ];
      localStorage.setItem(this.STORAGE_KEYS.WEIGHTS, JSON.stringify(initialWeights));
    }
  }

  // --- LOGS (REGISTROS DIARIOS) ---
  getAllLogs() {
    try {
      let logs = JSON.parse(localStorage.getItem(this.STORAGE_KEYS.LOGS)) || [];
      // Auto-reparar cualquier formato de fecha con zona horaria UTC (ej. 2026-09-01T22:00:00.000Z -> 2026-09-02)
      return logs.map(item => {
        if (item.date && (item.date.includes("T") || item.date.includes("Z"))) {
          item.date = formatToLocalDateString(item.date);
        }
        if (item.time && (item.time.includes("T") || item.time.includes("1899"))) {
          item.time = formatToLocalTimeString(item.time);
        }
        return item;
      });
    } catch (e) {
      console.error("Error reading logs:", e);
      return [];
    }
  }

  getLogsForDate(dateStr) {
    let logs = this.getAllLogs();
    return logs.filter(item => item.date === dateStr);
  }

  addLogs(newEntries) {
    let logs = this.getAllLogs();
    let entries = Array.isArray(newEntries) ? newEntries : [newEntries];
    
    entries.forEach(entry => {
      if (!entry.id) entry.id = "log_" + Date.now() + "_" + Math.random().toString(36).substr(2, 6);
      if (!entry.createdAt) entry.createdAt = new Date().toISOString();
      logs.push(entry);
      this.queueSyncAction({ action: "ADD_LOG", data: entry });
    });

    localStorage.setItem(this.STORAGE_KEYS.LOGS, JSON.stringify(logs));
    return logs;
  }

  updateLog(updatedEntry) {
    let logs = this.getAllLogs();
    let index = logs.findIndex(item => item.id === updatedEntry.id);
    if (index !== -1) {
      logs[index] = { ...logs[index], ...updatedEntry, updatedAt: new Date().toISOString() };
      localStorage.setItem(this.STORAGE_KEYS.LOGS, JSON.stringify(logs));
      this.queueSyncAction({ action: "UPDATE_LOG", data: logs[index] });
    }
    return logs;
  }

  deleteLog(id) {
    let logs = this.getAllLogs();
    let filtered = logs.filter(item => item.id !== id);
    localStorage.setItem(this.STORAGE_KEYS.LOGS, JSON.stringify(filtered));
    this.queueSyncAction({ action: "DELETE_LOG", id: id });
    return filtered;
  }

  deleteMealLogs(dateStr, mealType) {
    let logs = this.getAllLogs();
    let toDelete = logs.filter(item => item.date === dateStr && item.mealType === mealType);
    let filtered = logs.filter(item => !(item.date === dateStr && item.mealType === mealType));
    localStorage.setItem(this.STORAGE_KEYS.LOGS, JSON.stringify(filtered));
    toDelete.forEach(item => this.queueSyncAction({ action: "DELETE_LOG", id: item.id }));
    return filtered;
  }

  // --- ALIMENTOS ---
  getFoods() {
    try {
      let saved = JSON.parse(localStorage.getItem(this.STORAGE_KEYS.FOODS)) || [];
      let defaultList = window.DEFAULT_FOODS || [];
      let map = new Map();
      defaultList.forEach(f => map.set(f.id, { ...f, aliases: [...(f.aliases || [])] }));

      saved.forEach(f => {
        let existing = map.get(f.id);
        if (existing) {
          let savedAliases = [];
          if (Array.isArray(f.aliases)) {
            savedAliases = f.aliases.map(a => String(a || "").trim().toLowerCase()).filter(Boolean);
          } else if (typeof f.aliases === "string") {
            savedAliases = f.aliases.split(/[,;\n]+/).map(a => a.trim().toLowerCase()).filter(Boolean);
          }

          let isBuggedSingleName = savedAliases.length === 1 && savedAliases[0] === (f.name || existing.name || "").toLowerCase();
          let mergedAliases;
          if (isBuggedSingleName || savedAliases.length === 0) {
            mergedAliases = [...(existing.aliases || [])];
          } else {
            mergedAliases = Array.from(new Set([...(existing.aliases || []), ...savedAliases]));
          }

          map.set(f.id, {
            ...existing,
            ...f,
            aliases: mergedAliases
          });
        } else {
          let cleanAliases = [];
          if (Array.isArray(f.aliases)) {
            cleanAliases = f.aliases.map(a => String(a || "").trim().toLowerCase()).filter(Boolean);
          } else if (typeof f.aliases === "string") {
            cleanAliases = f.aliases.split(/[,;\n]+/).map(a => a.trim().toLowerCase()).filter(Boolean);
          }
          map.set(f.id, {
            ...f,
            aliases: cleanAliases.length > 0 ? cleanAliases : [String(f.name || "").toLowerCase()]
          });
        }
      });
      return Array.from(map.values());
    } catch (e) {
      return window.DEFAULT_FOODS || [];
    }
  }

  addFood(food) {
    let foods = this.getFoods();
    if (!food.id) food.id = "food_" + Date.now() + "_" + Math.random().toString(36).substr(2, 5);
    foods.push(food);
    localStorage.setItem(this.STORAGE_KEYS.FOODS, JSON.stringify(foods));
    this.queueSyncAction({ action: "SAVE_FOOD", data: food });
    return food;
  }

  updateFood(food) {
    let foods = this.getFoods();
    let index = foods.findIndex(f => f.id === food.id);
    if (index !== -1) {
      foods[index] = { ...foods[index], ...food };
      localStorage.setItem(this.STORAGE_KEYS.FOODS, JSON.stringify(foods));
      this.queueSyncAction({ action: "SAVE_FOOD", data: foods[index] });
    }
    return foods;
  }

  deleteFood(id) {
    let foods = this.getFoods();
    let filtered = foods.filter(f => f.id !== id);
    localStorage.setItem(this.STORAGE_KEYS.FOODS, JSON.stringify(filtered));
    this.queueSyncAction({ action: "DELETE_FOOD", id: id });
    return filtered;
  }

  // --- COMBOS / PLANTILLAS ---
  getCombos() {
    try {
      return JSON.parse(localStorage.getItem(this.STORAGE_KEYS.COMBOS)) || window.DEFAULT_COMBOS || [];
    } catch (e) {
      return window.DEFAULT_COMBOS || [];
    }
  }

  addCombo(combo) {
    let combos = this.getCombos();
    if (!combo.id) combo.id = "combo_" + Date.now();
    combos.push(combo);
    localStorage.setItem(this.STORAGE_KEYS.COMBOS, JSON.stringify(combos));
    this.queueSyncAction({ action: "SAVE_COMBO", data: combo });
    return combo;
  }

  deleteCombo(id) {
    let combos = this.getCombos();
    let filtered = combos.filter(c => c.id !== id);
    localStorage.setItem(this.STORAGE_KEYS.COMBOS, JSON.stringify(filtered));
    this.queueSyncAction({ action: "DELETE_COMBO", id: id });
    return filtered;
  }

  // --- PESOS ---
  getWeights() {
    try {
      return JSON.parse(localStorage.getItem(this.STORAGE_KEYS.WEIGHTS)) || [];
    } catch (e) {
      return [];
    }
  }

  addWeight(dateStr, weight) {
    let weights = this.getWeights();
    let existingIndex = weights.findIndex(w => w.date === dateStr);
    let record = { date: dateStr, weight: parseFloat(weight) };

    if (existingIndex !== -1) {
      weights[existingIndex] = record;
    } else {
      weights.push(record);
    }
    weights.sort((a, b) => new Date(a.date) - new Date(b.date));
    localStorage.setItem(this.STORAGE_KEYS.WEIGHTS, JSON.stringify(weights));

    // Actualizar también en settings
    let settings = this.getSettings();
    settings.currentWeight = parseFloat(weight);
    this.saveSettings(settings);

    this.queueSyncAction({ action: "SAVE_WEIGHT", data: record });
    return weights;
  }

  // --- CONFIGURACIÓN ---
  getSettings() {
    try {
      let saved = JSON.parse(localStorage.getItem(this.STORAGE_KEYS.SETTINGS));
      return { ...window.DEFAULT_SETTINGS, ...saved };
    } catch (e) {
      return window.DEFAULT_SETTINGS || {};
    }
  }

  saveSettings(newSettings) {
    let current = this.getSettings();
    let updated = { ...current, ...newSettings };
    localStorage.setItem(this.STORAGE_KEYS.SETTINGS, JSON.stringify(updated));
    this.queueSyncAction({ action: "SAVE_SETTINGS", data: updated });
    return updated;
  }

  // --- COLA DE SINCRONIZACIÓN GOOGLE WORKSPACE ---
  getPendingSync() {
    try {
      return JSON.parse(localStorage.getItem(this.STORAGE_KEYS.PENDING_SYNC)) || [];
    } catch (e) {
      return [];
    }
  }

  queueSyncAction(actionObj) {
    let queue = this.getPendingSync();
    queue.push({
      ...actionObj,
      timestamp: Date.now()
    });
    localStorage.setItem(this.STORAGE_KEYS.PENDING_SYNC, JSON.stringify(queue));
  }

  clearPendingSync() {
    localStorage.setItem(this.STORAGE_KEYS.PENDING_SYNC, JSON.stringify([]));
  }

  /**
   * Sincronización completa con Google Apps Script (Web App)
   */
  async syncWithGoogle() {
    let settings = this.getSettings();
    let scriptUrl = settings.googleScriptUrl;

    if (!scriptUrl || !scriptUrl.startsWith("http")) {
      return { success: false, message: "URL de Google Apps Script no configurada." };
    }

    try {
      let pending = this.getPendingSync();
      let foodsToSync = this.getFoods().map(f => ({
        ...f,
        aliases: Array.isArray(f.aliases) ? f.aliases.join(", ") : (f.aliases || "")
      }));

      let payload = {
        action: "SYNC_BATCH",
        pendingActions: pending,
        fullState: {
          logs: this.getAllLogs(),
          foods: foodsToSync,
          combos: this.getCombos(),
          settings: this.getSettings(),
          weights: this.getWeights()
        }
      };

      let response = await fetch(scriptUrl, {
        method: "POST",
        headers: {
          "Content-Type": "text/plain;charset=utf-8"
        },
        body: JSON.stringify(payload),
        redirect: "follow"
      });

      let text = await response.text();
      let result;
      try {
        result = JSON.parse(text);
      } catch (e) {
        if (text.includes("Necesitas acceso") || text.includes("accounts.google.com") || text.includes("<!DOCTYPE") || text.includes("<html")) {
          return {
            success: false,
            message: "Permiso denegado por Google. En Apps Script, ve a 'Implementar' > 'Administrar implementaciones' y cambia 'Quién tiene acceso' a 'Cualquier persona' (Anyone)."
          };
        }
        return { success: false, message: "Respuesta no válida del servidor: " + text.slice(0, 80) };
      }

      if (result && result.success) {
        this.clearPendingSync();
        return { success: true, message: "Sincronizado con Google Sheets correctamente." };
      } else {
        return { success: false, message: result.message || "Error al sincronizar con Google Sheets." };
      }
    } catch (err) {
      console.warn("Fallo en sincronización:", err);
      return { success: false, message: "Error de conexión con Google Apps Script: " + err.message };
    }
  }

  /**
   * Cargar datos desde Google Sheets a LocalStorage
   */
  async pullFromGoogle() {
    let settings = this.getSettings();
    let scriptUrl = settings.googleScriptUrl;

    if (!scriptUrl || !scriptUrl.startsWith("http")) {
      return { success: false, message: "URL de Google Apps Script no configurada." };
    }

    try {
      let response = await fetch(`${scriptUrl}?action=GET_FULL_DATA`, { redirect: "follow" });
      let text = await response.text();
      let result;
      try {
        result = JSON.parse(text);
      } catch (e) {
        if (text.includes("Necesitas acceso") || text.includes("accounts.google.com") || text.includes("<!DOCTYPE") || text.includes("<html")) {
          return {
            success: false,
            message: "Permiso denegado por Google. En Apps Script, ve a 'Implementar' > 'Administrar implementaciones' y cambia 'Quién tiene acceso' a 'Cualquier persona' (Anyone)."
          };
        }
        return { success: false, message: "Respuesta no válida del servidor: " + text.slice(0, 80) };
      }

      if (result && result.success && result.data) {
        if (result.data.logs && Array.isArray(result.data.logs)) {
          let normalizedLogs = result.data.logs.map(log => ({
            id: log.id || "log_" + Date.now() + "_" + Math.random().toString(36).substr(2, 5),
            date: formatToLocalDateString(log.date || log.fecha),
            time: formatToLocalTimeString(log.time || log.hora),
            mealType: String(log.mealType || log.mealtype || log.toma || "desayuno").toLowerCase().trim(),
            foodId: log.foodId || log.foodid || null,
            foodName: String(log.foodName || log.foodname || log.alimento || "Comida").trim(),
            quantity: parseFloat(log.quantity || log.cantidad || 1),
            unit: String(log.unit || log.unidad || "ración").trim(),
            calories: parseFloat(log.calories || log.calorias || 0),
            protein: parseFloat(log.protein || log.proteina || 0),
            fats: parseFloat(log.fats || log.grasas || 0),
            carbs: parseFloat(log.carbs || log.carbohidratos || 0),
            createdAt: log.createdAt || log.createdat || log.creadoen || new Date().toISOString()
          })).filter(l => l.date && l.calories !== undefined);

          // Fusión bidireccional segura: combina Google Sheets con registros locales sin borrar nada
          let localLogs = this.getAllLogs();
          let logsMap = new Map();
          normalizedLogs.forEach(l => logsMap.set(l.id, l));
          localLogs.forEach(l => logsMap.set(l.id, l));
          let mergedLogs = Array.from(logsMap.values());
          localStorage.setItem(this.STORAGE_KEYS.LOGS, JSON.stringify(mergedLogs));
        }

        if (result.data.foods && Array.isArray(result.data.foods)) {
          let defaultList = window.DEFAULT_FOODS || [];
          let defaultMap = new Map();
          defaultList.forEach(df => defaultMap.set(df.id, df));

          let normalizedFoods = result.data.foods.map(f => {
            let defaultFood = defaultMap.get(f.id);
            let rawAliases = f.aliases !== undefined ? f.aliases : (f.sinonimos || f["sinónimos"] || f.palabrasclave || "");
            let aliasList = [];
            if (Array.isArray(rawAliases)) {
              aliasList = rawAliases.map(s => String(s || "").trim().toLowerCase()).filter(Boolean);
            } else if (typeof rawAliases === "string" && rawAliases.trim()) {
              aliasList = rawAliases.split(/[,;\n]+/).map(s => s.trim().toLowerCase()).filter(Boolean);
            }

            // Si la columna en Sheets viene vacía o es solo el nombre completo del alimento (antiguo bug),
            // recuperar y preservar los sinónimos del catálogo predeterminado
            if (aliasList.length === 0 || (aliasList.length === 1 && aliasList[0] === String(f.name || "").toLowerCase())) {
              if (defaultFood && defaultFood.aliases) {
                aliasList = Array.from(new Set([...defaultFood.aliases, ...aliasList]));
              }
            }

            return {
              id: f.id || "food_" + Date.now(),
              name: String(f.name || f.nombre || "").trim(),
              category: String(f.category || f.categoria || "General").trim(),
              defaultUnit: String(f.defaultUnit || f.defaultunit || f.unidadbase || "ración").trim(),
              unitGrams: parseFloat(f.unitGrams || f.unitgrams || f.gramosunidad || 0),
              calories: parseFloat(f.calories || f.calorias || 0),
              protein: parseFloat(f.protein || f.proteina || 0),
              fats: parseFloat(f.fats || f.grasas || 0),
              carbs: parseFloat(f.carbs || f.carbohidratos || 0),
              aliases: aliasList.length > 0 ? aliasList : [String(f.name || "").toLowerCase()]
            };
          }).filter(f => f.name);

          // Fusión bidireccional segura de alimentos
          let localFoods = this.getFoods();
          let foodsMap = new Map();
          normalizedFoods.forEach(f => foodsMap.set(f.id, f));
          localFoods.forEach(f => {
            let existing = foodsMap.get(f.id);
            if (existing) {
              let mergedAliases = Array.from(new Set([...(existing.aliases || []), ...(f.aliases || [])])).filter(Boolean);
              foodsMap.set(f.id, { ...existing, ...f, aliases: mergedAliases });
            } else {
              foodsMap.set(f.id, f);
            }
          });
          let mergedFoods = Array.from(foodsMap.values());
          if (mergedFoods.length > 0) {
            localStorage.setItem(this.STORAGE_KEYS.FOODS, JSON.stringify(mergedFoods));
          }
        }

        if (result.data.combos && Array.isArray(result.data.combos) && result.data.combos.length > 0) {
          localStorage.setItem(this.STORAGE_KEYS.COMBOS, JSON.stringify(result.data.combos));
        }

        if (result.data.weights && Array.isArray(result.data.weights)) {
          let normalizedWeights = result.data.weights.map(w => ({
            date: formatToLocalDateString(w.date || w.fecha),
            weight: parseFloat(w.weight || w.peso || 0)
          })).filter(w => w.date && w.weight > 0);

          let localWeights = this.getWeights();
          let weightsMap = new Map();
          normalizedWeights.forEach(w => weightsMap.set(w.date, w));
          localWeights.forEach(w => weightsMap.set(w.date, w));
          let mergedWeights = Array.from(weightsMap.values());
          localStorage.setItem(this.STORAGE_KEYS.WEIGHTS, JSON.stringify(mergedWeights));
        }

        if (result.data.settings) {
          let merged = { ...this.getSettings(), ...result.data.settings };
          localStorage.setItem(this.STORAGE_KEYS.SETTINGS, JSON.stringify(merged));
        }
        this.clearPendingSync();
        return { success: true, message: "Datos descargados y sincronizados desde Google Sheets." };
      } else {
        return { success: false, message: result.message || "No se recibieron datos válidos." };
      }
    } catch (err) {
      return { success: false, message: "Error al descargar desde Google Sheets: " + err.message };
    }
  }

  // --- EXPORTAR / IMPORTAR JSON BACKUP ---
  exportBackup() {
    return {
      version: "1.0",
      exportedAt: new Date().toISOString(),
      logs: this.getAllLogs(),
      foods: this.getFoods(),
      combos: this.getCombos(),
      weights: this.getWeights(),
      settings: this.getSettings()
    };
  }

  importBackup(backupData) {
    if (!backupData || typeof backupData !== "object") {
      throw new Error("Formato de copia de seguridad no válido");
    }
    if (backupData.logs) localStorage.setItem(this.STORAGE_KEYS.LOGS, JSON.stringify(backupData.logs));
    if (backupData.foods) localStorage.setItem(this.STORAGE_KEYS.FOODS, JSON.stringify(backupData.foods));
    if (backupData.combos) localStorage.setItem(this.STORAGE_KEYS.COMBOS, JSON.stringify(backupData.combos));
    if (backupData.weights) localStorage.setItem(this.STORAGE_KEYS.WEIGHTS, JSON.stringify(backupData.weights));
    if (backupData.settings) localStorage.setItem(this.STORAGE_KEYS.SETTINGS, JSON.stringify(backupData.settings));
    return true;
  }
}

if (typeof window !== "undefined") {
  window.CalorieDB = CalorieDB;
}
