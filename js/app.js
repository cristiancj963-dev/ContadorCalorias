/**
 * Controlador principal de la aplicación ContadorCalorias
 */

document.addEventListener("DOMContentLoaded", () => {
  // Inicialización de módulos
  const db = new CalorieDB();
  const parser = new NaturalFoodParser(db.getFoods());
  const stats = new CalorieStats(db);

  // Estado de la aplicación
  const state = {
    currentDate: getTodayString(),
    activeTab: "dashboard",
    selectedMealType: getAutoMealType(),
    parsedItems: [],
    searchQuery: "",
    selectedFoodCategory: "all"
  };

  // Referencias al DOM
  const elements = {
    // Navegación
    navBtns: document.querySelectorAll(".nav-btn"),
    tabContents: document.querySelectorAll(".tab-content"),
    themeToggleBtn: document.getElementById("themeToggleBtn"),

    // Encabezado de fecha
    currentDateDisplay: document.getElementById("currentDateDisplay"),
    prevDayBtn: document.getElementById("prevDayBtn"),
    nextDayBtn: document.getElementById("nextDayBtn"),
    todayBtn: document.getElementById("todayBtn"),
    datePickerInput: document.getElementById("datePickerInput"),
    streakBadge: document.getElementById("streakBadge"),
    syncStatusBadge: document.getElementById("syncStatusBadge"),

    // Entrada Rápida Natural
    quickInputText: document.getElementById("quickInputText"),
    mealTypeSelect: document.getElementById("mealTypeSelect"),
    parseBtn: document.getElementById("parseBtn"),
    clearInputBtn: document.getElementById("clearInputBtn"),
    parsedPreviewContainer: document.getElementById("parsedPreviewContainer"),
    parsedItemsList: document.getElementById("parsedItemsList"),
    previewTotals: document.getElementById("previewTotals"),
    saveParsedMealBtn: document.getElementById("saveParsedMealBtn"),

    // Dashboard Metas, Anillos Cal AI y Tira Semanal
    weekStripContainer: document.getElementById("weekStripContainer"),
    calRemainingLabel: document.getElementById("calRemainingLabel"),
    calRemainingBigText: document.getElementById("calRemainingBigText"),
    calConsumedText: document.getElementById("calConsumedText"),
    calTargetText: document.getElementById("calTargetText"),
    calDiffBadge: document.getElementById("calDiffBadge"),
    calProgressBar: document.getElementById("calProgressBar"),
    calRingCircle: document.getElementById("calRingCircle"),
    calRingPctText: document.getElementById("calRingPctText"),

    // Health Score Cal AI
    healthScoreLabel: document.getElementById("healthScoreLabel"),
    healthScoreValue: document.getElementById("healthScoreValue"),
    healthScoreFill: document.getElementById("healthScoreFill"),
    
    proteinValueText: document.getElementById("proteinValueText"),
    proteinTargetText: document.getElementById("proteinTargetText"),
    proteinStatusBadge: document.getElementById("proteinStatusBadge"),
    proteinProgressBar: document.getElementById("proteinProgressBar"),
    proteinRingCircle: document.getElementById("proteinRingCircle"),

    carbsValueText: document.getElementById("carbsValueText"),
    carbsTargetText: document.getElementById("carbsTargetText"),
    carbsStatusBadge: document.getElementById("carbsStatusBadge"),
    carbsProgressBar: document.getElementById("carbsProgressBar"),
    carbsRingCircle: document.getElementById("carbsRingCircle"),

    fatsValueText: document.getElementById("fatsValueText"),
    fatsTargetText: document.getElementById("fatsTargetText"),
    fatsStatusBadge: document.getElementById("fatsStatusBadge"),
    fatsProgressBar: document.getElementById("fatsProgressBar"),
    fatsRingCircle: document.getElementById("fatsRingCircle"),

    // Tomas del día
    mealSectionsContainer: document.getElementById("mealSectionsContainer"),

    // Modal Alimento
    foodModal: document.getElementById("foodModal"),
    foodForm: document.getElementById("foodForm"),
    foodModalTitle: document.getElementById("foodModalTitle"),
    closeFoodModalBtn: document.getElementById("closeFoodModalBtn"),
    openAddFoodBtn: document.getElementById("openAddFoodBtn"),

    // Modal Entrada Directa / Manual
    directEntryModal: document.getElementById("directEntryModal"),
    directEntryForm: document.getElementById("directEntryForm"),
    closeDirectModalBtn: document.getElementById("closeDirectModalBtn"),
    openDirectEntryBtn: document.getElementById("openDirectEntryBtn"),

    // Modal Peso
    weightModal: document.getElementById("weightModal"),
    weightForm: document.getElementById("weightForm"),
    closeWeightModalBtn: document.getElementById("closeWeightModalBtn"),
    openWeightModalBtn: document.getElementById("openWeightModalBtn"),

    // Pestaña Alimentos
    foodSearchInput: document.getElementById("foodSearchInput"),
    foodCategoryFilter: document.getElementById("foodCategoryFilter"),
    foodTableBody: document.getElementById("foodTableBody"),

    // Pestaña Historial
    historyTableBody: document.getElementById("historyTableBody"),
    historyAveragesContainer: document.getElementById("historyAveragesContainer"),
    weightListContainer: document.getElementById("weightListContainer"),

    // Pestaña Plantillas / Combos
    combosListContainer: document.getElementById("combosListContainer"),

    // Pestaña Ajustes
    settingsForm: document.getElementById("settingsForm"),
    googleScriptUrlInput: document.getElementById("googleScriptUrlInput"),
    syncNowBtn: document.getElementById("syncNowBtn"),
    pullNowBtn: document.getElementById("pullNowBtn"),
    syncStatusMsg: document.getElementById("syncStatusMsg"),
    exportBackupBtn: document.getElementById("exportBackupBtn"),
    importBackupBtn: document.getElementById("importBackupBtn"),
    backupFileInput: document.getElementById("backupFileInput")
  };

  // ==========================================
  // INICIALIZACIÓN
  // ==========================================
  function initApp() {
    // Comprobar si se pasa ?url= en la barra de direcciones (útil para móviles y otros navegadores)
    try {
      let urlParams = new URLSearchParams(window.location.search);
      let paramUrl = urlParams.get("url") || urlParams.get("scriptUrl");
      if (paramUrl && paramUrl.startsWith("http")) {
        let current = db.getSettings();
        current.googleScriptUrl = paramUrl.trim();
        db.saveSettings(current);
      }
    } catch (e) {
      console.warn(e);
    }

    applyTheme(db.getSettings().theme || "dark");
    elements.mealTypeSelect.value = state.selectedMealType;
    populateCategoryFilters();
    bindEvents();
    renderAll();
  }

  function bindEvents() {
    // Navegación de pestañas
    elements.navBtns.forEach(btn => {
      btn.addEventListener("click", () => {
        let tab = btn.dataset.tab;
        switchTab(tab);
      });
    });

    // Cambio de fecha
    elements.prevDayBtn.addEventListener("click", () => changeDate(-1));
    elements.nextDayBtn.addEventListener("click", () => changeDate(1));
    elements.todayBtn.addEventListener("click", () => setDate(getTodayString()));
    elements.datePickerInput.addEventListener("change", (e) => setDate(e.target.value));

    // Tema oscuro / claro
    elements.themeToggleBtn.addEventListener("click", () => {
      let currentTheme = document.documentElement.getAttribute("data-theme") || "dark";
      let newTheme = currentTheme === "dark" ? "light" : "dark";
      applyTheme(newTheme);
      db.saveSettings({ theme: newTheme });
    });

    // Entrada rápida de texto
    elements.quickInputText.addEventListener("input", debounce(handleQuickInputLive, 300));
    elements.quickInputText.addEventListener("keydown", (e) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleQuickInputLive();
      }
    });
    elements.parseBtn.addEventListener("click", handleQuickInputLive);
    elements.clearInputBtn.addEventListener("click", clearQuickInput);
    elements.saveParsedMealBtn.addEventListener("click", saveParsedMeal);

    // Modal Crear/Editar Alimento
    elements.openAddFoodBtn.addEventListener("click", () => openFoodModal());
    elements.closeFoodModalBtn.addEventListener("click", closeFoodModal);
    elements.foodForm.addEventListener("submit", handleFoodFormSubmit);

    // Modal Entrada Directa
    elements.openDirectEntryBtn.addEventListener("click", () => openDirectModal());
    elements.closeDirectModalBtn.addEventListener("click", closeDirectModal);
    elements.directEntryForm.addEventListener("submit", handleDirectFormSubmit);

    // Modal Peso
    elements.openWeightModalBtn.addEventListener("click", () => openWeightModal());
    elements.closeWeightModalBtn.addEventListener("click", closeWeightModal);
    elements.weightForm.addEventListener("submit", handleWeightFormSubmit);

    // Búsqueda y filtros de alimentos
    elements.foodSearchInput.addEventListener("input", (e) => {
      state.searchQuery = e.target.value;
      renderFoodsTable();
    });
    elements.foodCategoryFilter.addEventListener("change", (e) => {
      state.selectedFoodCategory = e.target.value;
      renderFoodsTable();
    });

    // Ajustes
    elements.settingsForm.addEventListener("submit", handleSettingsSubmit);
    if (elements.googleScriptUrlInput) {
      elements.googleScriptUrlInput.addEventListener("input", () => {
        let url = elements.googleScriptUrlInput.value.trim();
        let current = db.getSettings();
        current.googleScriptUrl = url;
        db.saveSettings(current);
        updateSyncBadge();
      });
    }
    elements.syncNowBtn.addEventListener("click", handleSyncNow);
    elements.pullNowBtn.addEventListener("click", handlePullNow);
    elements.exportBackupBtn.addEventListener("click", handleExportBackup);
    elements.importBackupBtn.addEventListener("click", () => elements.backupFileInput.click());
    elements.backupFileInput.addEventListener("change", handleImportBackupFile);
  }

  // ==========================================
  // RENDERIZADO GENERAL
  // ==========================================
  function renderAll() {
    renderDateHeader();
    renderDashboard();
    renderFoodsTable();
    renderCombos();
    renderHistory();
    renderSettings();
    updateSyncBadge();
  }

  function switchTab(tabId) {
    state.activeTab = tabId;
    elements.navBtns.forEach(btn => {
      btn.classList.toggle("active", btn.dataset.tab === tabId);
    });
    elements.tabContents.forEach(tab => {
      tab.classList.toggle("active", tab.id === tabId + "Tab");
    });

    if (tabId === "history") renderHistory();
    if (tabId === "foods") renderFoodsTable();
    if (tabId === "combos") renderCombos();
    if (tabId === "settings") renderSettings();
  }

  // ==========================================
  // GESTIÓN DE FECHAS
  // ==========================================
  function setDate(dateStr) {
    if (!dateStr) return;
    state.currentDate = dateStr;
    renderDateHeader();
    renderDashboard();
  }

  function changeDate(deltaDays) {
    let [y, m, d] = state.currentDate.split("-").map(Number);
    let date = new Date(y, m - 1, d);
    date.setDate(date.getDate() + deltaDays);
    setDate(formatDateISO(date));
  }

  function renderDateHeader() {
    let [y, m, d] = state.currentDate.split("-").map(Number);
    let dateObj = new Date(y, m - 1, d);
    
    let isToday = state.currentDate === getTodayString();
    let isYesterday = state.currentDate === getYesterdayString();

    let prefix = isToday ? "Hoy, " : isYesterday ? "Ayer, " : "";
    let options = { weekday: "long", day: "numeric", month: "long" };
    let formattedText = prefix + dateObj.toLocaleDateString("es-ES", options);
    
    elements.currentDateDisplay.textContent = capitalize(formattedText);
    elements.datePickerInput.value = state.currentDate;
    elements.todayBtn.style.display = isToday ? "none" : "inline-flex";

    // Racha de días
    let streak = stats.getCurrentStreak();
    elements.streakBadge.textContent = `🔥 ${streak} ${streak === 1 ? "día" : "días"} de racha`;
  }

  // ==========================================
  // DASHBOARD, TIRA SEMANAL Y ANILLOS CAL AI
  // ==========================================
  function renderWeekStrip() {
    if (!elements.weekStripContainer) return;
    let todayStr = getTodayString();
    let days = stats.getWeekStripData(state.currentDate, todayStr);
    const miniCircumference = 94.25; // 2 * PI * 15

    elements.weekStripContainer.innerHTML = days.map(day => {
      let offset = miniCircumference - (Math.min(day.pct, 100) / 100) * miniCircumference;
      let statusRingClass = day.hasLogs ? `week-ring-${day.status}` : "week-ring-empty";
      let activeClass = day.isSelected ? "selected" : "";
      let todayClass = day.isToday ? "is-today" : "";
      let tooltip = day.hasLogs
        ? `${day.dayName} ${day.dayNumber}: ${day.calories} / ${day.targetCalories} kcal`
        : `${day.dayName} ${day.dayNumber}: Sin registros`;

      return `
        <button type="button" class="week-day-pill ${activeClass} ${todayClass}" data-date="${day.date}" title="${tooltip}">
          <span class="week-day-letter">${day.dayLetter}</span>
          <div class="week-day-ring-wrap">
            <svg class="week-day-svg" viewBox="0 0 36 36">
              <circle class="week-ring-track" cx="18" cy="18" r="15"></circle>
              <circle class="week-ring-progress ${statusRingClass}" cx="18" cy="18" r="15"
                stroke-dasharray="${miniCircumference}"
                stroke-dashoffset="${offset.toFixed(2)}"></circle>
            </svg>
            <span class="week-day-num">${day.dayNumber}</span>
          </div>
          <span class="week-day-dot ${statusRingClass}"></span>
        </button>
      `;
    }).join("");

    elements.weekStripContainer.querySelectorAll(".week-day-pill").forEach(btn => {
      btn.addEventListener("click", () => {
        setDate(btn.dataset.date);
      });
    });
  }

  function renderDashboard() {
    let summary = stats.getDaySummary(state.currentDate);

    // 1. Tira semanal estilo Cal AI
    renderWeekStrip();

    // 2. Calorías Hero + Anillo Principal
    let cal = summary.targets.calories;
    let remaining = cal.target - cal.current;

    if (elements.calRemainingLabel && elements.calRemainingBigText) {
      if (remaining >= 0) {
        elements.calRemainingLabel.textContent = "Calorías Restantes";
        elements.calRemainingBigText.textContent = `${remaining.toLocaleString("es-ES")}`;
        elements.calRemainingBigText.className = "calai-big-number";
      } else {
        elements.calRemainingLabel.textContent = "Calorías Extra (Superávit)";
        elements.calRemainingBigText.textContent = `+${Math.abs(remaining).toLocaleString("es-ES")}`;
        elements.calRemainingBigText.className = `calai-big-number ${cal.status === "in_range" ? "text-success" : "text-danger"}`;
      }
    }

    elements.calConsumedText.textContent = `${cal.current.toLocaleString("es-ES")} kcal`;
    elements.calTargetText.textContent = `Meta: ${cal.target} kcal (${cal.min}-${cal.max})`;
    
    let rawCalPct = cal.target > 0 ? Math.round((cal.current / cal.target) * 100) : 0;
    let clampedCalPct = Math.min(Math.max(rawCalPct, 0), 100);
    elements.calProgressBar.style.width = `${clampedCalPct}%`;
    elements.calProgressBar.className = `progress-fill ${getStatusClass(cal.status)}`;

    // Actualizar Anillo SVG Principal (r=50 -> circunferencia = 314.16)
    if (elements.calRingCircle) {
      const heroCircumference = 314.16;
      let offset = heroCircumference - (clampedCalPct / 100) * heroCircumference;
      elements.calRingCircle.style.strokeDashoffset = offset.toFixed(2);
      elements.calRingCircle.className.baseVal = `ring-progress ring-cal stroke-${cal.status}`;
    }
    if (elements.calRingPctText) {
      elements.calRingPctText.textContent = `${rawCalPct}%`;
    }

    if (cal.status === "in_range") {
      elements.calDiffBadge.textContent = `En objetivo ✓ (${cal.diff >= 0 ? "+" : ""}${cal.diff} kcal)`;
      elements.calDiffBadge.className = "badge badge-success";
    } else if (cal.status === "low") {
      elements.calDiffBadge.textContent = `Faltan ${Math.abs(cal.diff)} kcal`;
      elements.calDiffBadge.className = "badge badge-warning";
    } else {
      elements.calDiffBadge.textContent = `+${cal.diff} kcal de superávit`;
      elements.calDiffBadge.className = "badge badge-danger";
    }

    // 3. Health Score Diario (Cal AI Score)
    let hs = summary.healthScore || { score100: 0, score10: "—", label: "Registra tu primera toma", status: "neutral" };
    if (elements.healthScoreValue) {
      elements.healthScoreValue.textContent = `${hs.score10} / 10`;
      elements.healthScoreValue.className = `health-score-badge score-${hs.status}`;
    }
    if (elements.healthScoreLabel) {
      elements.healthScoreLabel.textContent = hs.label;
    }
    if (elements.healthScoreFill) {
      elements.healthScoreFill.style.width = `${hs.score100}%`;
      elements.healthScoreFill.className = `health-score-fill ${getStatusClass(hs.status === "neutral" ? "low" : hs.status)}`;
    }

    // 4. Anillos de Macronutrientes (Proteína, Carbohidratos, Grasas)
    renderMacroProgress(
      summary.targets.protein,
      elements.proteinValueText,
      elements.proteinTargetText,
      elements.proteinStatusBadge,
      elements.proteinProgressBar,
      elements.proteinRingCircle,
      "ring-protein",
      "g"
    );

    renderMacroProgress(
      summary.targets.carbs,
      elements.carbsValueText,
      elements.carbsTargetText,
      elements.carbsStatusBadge,
      elements.carbsProgressBar,
      elements.carbsRingCircle,
      "ring-carbs",
      "g"
    );

    renderMacroProgress(
      summary.targets.fats,
      elements.fatsValueText,
      elements.fatsTargetText,
      elements.fatsStatusBadge,
      elements.fatsProgressBar,
      elements.fatsRingCircle,
      "ring-fats",
      "g"
    );

    // 5. Renderizar secciones de comidas (Desayuno, Almuerzo, Comida, Merienda, Cena)
    renderMealSections(summary.mealBreakdown);
  }

  function renderMacroProgress(macroTarget, valEl, targetEl, badgeEl, progressEl, ringEl, ringClass, unit = "g") {
    valEl.textContent = `${macroTarget.current} ${unit}`;
    targetEl.textContent = `Meta: ${macroTarget.target}${unit} (${macroTarget.min}-${macroTarget.max})`;

    let pct = Math.min(Math.max(macroTarget.pct, 0), 100);
    progressEl.style.width = `${pct}%`;
    progressEl.className = `progress-fill ${getStatusClass(macroTarget.status)}`;

    // Actualizar anillo SVG del macro (r=28 -> circunferencia = 175.93)
    if (ringEl) {
      const macroCircumference = 175.93;
      let offset = macroCircumference - (pct / 100) * macroCircumference;
      ringEl.style.strokeDashoffset = offset.toFixed(2);
      ringEl.className.baseVal = `ring-progress-sm ${ringClass} stroke-${macroTarget.status}`;
    }

    if (macroTarget.status === "in_range") {
      badgeEl.textContent = "✓ En rango";
      badgeEl.className = "badge badge-success";
    } else if (macroTarget.status === "low") {
      badgeEl.textContent = `Faltan ${Math.abs(macroTarget.diff)}${unit}`;
      badgeEl.className = "badge badge-warning";
    } else {
      badgeEl.textContent = `+${macroTarget.diff}${unit}`;
      badgeEl.className = "badge badge-danger";
    }
  }

  function getStatusClass(status) {
    if (status === "in_range") return "fill-success";
    if (status === "low") return "fill-warning";
    return "fill-danger";
  }

  // Renderizado de las 5 tomas del día
  function renderMealSections(mealBreakdown) {
    const mealMeta = {
      desayuno: { label: "Desayuno", icon: "☕" },
      almuerzo: { label: "Almuerzo (Media mañana)", icon: "🥪" },
      comida: { label: "Comida", icon: "🍽️" },
      merienda: { label: "Merienda", icon: "🍌" },
      cena: { label: "Cena / Última toma", icon: "🌙" }
    };

    elements.mealSectionsContainer.innerHTML = "";

    Object.keys(mealMeta).forEach(mealKey => {
      let data = mealBreakdown[mealKey] || { calories: 0, protein: 0, fats: 0, carbs: 0, items: [] };
      let meta = mealMeta[mealKey];

      let card = document.createElement("div");
      card.className = "meal-card";
      
      let itemsHtml = "";
      if (data.items.length === 0) {
        itemsHtml = `<div class="empty-meal-msg">Sin alimentos registrados en esta toma</div>`;
      } else {
        itemsHtml = data.items.map(item => `
          <div class="meal-item-row" data-id="${item.id}">
            <div class="item-main-info">
              <span class="item-name">${escapeHtml(item.foodName)}</span>
              <span class="item-qty">${item.quantity} ${escapeHtml(item.unit || "")}</span>
            </div>
            <div class="item-macros-tags">
              <span class="tag tag-cal">${Math.round(item.calories)} kcal</span>
              <span class="tag tag-p">${Math.round(item.protein * 10)/10}P</span>
              <span class="tag tag-c">${Math.round(item.carbs * 10)/10}C</span>
              <span class="tag tag-f">${Math.round(item.fats * 10)/10}G</span>
            </div>
            <div class="item-actions">
              <button class="btn-icon delete-log-btn" title="Eliminar alimento" data-id="${item.id}">🗑️</button>
            </div>
          </div>
        `).join("");
      }

      card.innerHTML = `
        <div class="meal-card-header">
          <div class="meal-title-group">
            <span class="meal-icon">${meta.icon}</span>
            <h3 class="meal-title">${meta.label}</h3>
          </div>
          <div class="meal-header-totals">
            <span class="badge badge-cal">${Math.round(data.calories)} kcal</span>
            <span class="meal-macros-summary">${Math.round(data.protein)}P · ${Math.round(data.carbs)}C · ${Math.round(data.fats)}G</span>
          </div>
        </div>
        <div class="meal-items-container">
          ${itemsHtml}
        </div>
        <div class="meal-card-footer">
          <button class="btn btn-sm btn-outline quick-add-to-meal-btn" data-meal="${mealKey}">
            + Añadir a ${meta.label.split(" ")[0]}
          </button>
          ${data.items.length > 0 ? `
            <button class="btn btn-sm btn-text-danger clear-meal-btn" data-meal="${mealKey}">
              Vaciar toma
            </button>
          ` : ""}
        </div>
      `;

      elements.mealSectionsContainer.appendChild(card);
    });

    // Eventos dentro de las tarjetas de comidas
    elements.mealSectionsContainer.querySelectorAll(".delete-log-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        let id = btn.dataset.id;
        db.deleteLog(id);
        renderDashboard();
        updateSyncBadge();
      });
    });

    elements.mealSectionsContainer.querySelectorAll(".clear-meal-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        let meal = btn.dataset.meal;
        if (confirm(`¿Vaciar todos los registros de ${meal}?`)) {
          db.deleteMealLogs(state.currentDate, meal);
          renderDashboard();
          updateSyncBadge();
        }
      });
    });

    elements.mealSectionsContainer.querySelectorAll(".quick-add-to-meal-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        let meal = btn.dataset.meal;
        elements.mealTypeSelect.value = meal;
        elements.quickInputText.focus();
        elements.quickInputText.scrollIntoView({ behavior: "smooth" });
      });
    });
  }

  // ==========================================
  // PARSER DE ENTRADA RÁPIDA (LENGUAJE NATURAL)
  // ==========================================
  function handleQuickInputLive() {
    let text = elements.quickInputText.value.trim();
    if (!text) {
      elements.parsedPreviewContainer.style.display = "none";
      state.parsedItems = [];
      return;
    }

    // Auto-detectar toma si el usuario escribe frases como "para cenar...", "de cena...", "para comer...", etc.
    let mealMatch = text.match(/^(?:(?:para|de)\s+(?:la\s+)?(?:cenar|desayunar|comer|merendar|el almuerzo|la cena|la comida|cena|comida|desayuno|merienda|almuerzo)|he\s+(?:cenado|comido|desayunado|merendado|tomado))/i);
    if (mealMatch) {
      let matchedText = mealMatch[0].toLowerCase();
      if (matchedText.includes("cena")) {
        elements.mealTypeSelect.value = "cena";
        state.selectedMealType = "cena";
      } else if (matchedText.includes("comi") || matchedText.includes("comer")) {
        elements.mealTypeSelect.value = "comida";
        state.selectedMealType = "comida";
      } else if (matchedText.includes("desayun")) {
        elements.mealTypeSelect.value = "desayuno";
        state.selectedMealType = "desayuno";
      } else if (matchedText.includes("meren")) {
        elements.mealTypeSelect.value = "merienda";
        state.selectedMealType = "merienda";
      } else if (matchedText.includes("almuerz")) {
        elements.mealTypeSelect.value = "almuerzo";
        state.selectedMealType = "almuerzo";
      }
    }

    // Actualizar catálogo en el parser
    parser.setFoods(db.getFoods());
    let result = parser.parseInput(text);
    state.parsedItems = result.items;

    renderParsedPreview(result);
  }

  function renderParsedPreview(result) {
    elements.parsedPreviewContainer.style.display = "block";
    elements.parsedItemsList.innerHTML = "";

    result.items.forEach((item, index) => {
      let chip = document.createElement("div");
      chip.className = `parsed-chip ${item.isMatched ? "matched" : "unmatched"}`;
      
      chip.innerHTML = `
        <div class="chip-content">
          <div class="chip-top">
            <span class="chip-status-dot"></span>
            <input type="text" class="chip-name-input" value="${escapeHtml(item.foodName)}" data-index="${index}" />
            ${!item.isMatched ? `<span class="unmatched-badge" title="No está en la base de datos">Nuevo</span>` : ""}
          </div>
          <div class="chip-inputs-row">
            <div class="qty-field">
              <label>Cant:</label>
              <input type="number" step="0.5" class="chip-qty-input" value="${item.quantity}" data-index="${index}" min="0.1" />
              <input type="text" class="chip-unit-input" value="${escapeHtml(item.unit)}" data-index="${index}" />
            </div>
            <div class="macros-fields">
              <label>Kcal: <input type="number" class="chip-macro-input" value="${item.calories}" data-field="calories" data-index="${index}" /></label>
              <label>P: <input type="number" step="0.1" class="chip-macro-input" value="${item.protein}" data-field="protein" data-index="${index}" /></label>
              <label>C: <input type="number" step="0.1" class="chip-macro-input" value="${item.carbs}" data-field="carbs" data-index="${index}" /></label>
              <label>G: <input type="number" step="0.1" class="chip-macro-input" value="${item.fats}" data-field="fats" data-index="${index}" /></label>
            </div>
          </div>
        </div>
        <div class="chip-actions">
          ${!item.isMatched ? `
            <button class="btn btn-xs btn-primary save-to-db-btn" title="Guardar este alimento en tu catálogo permanente" data-index="${index}">
              + Guardar en BD
            </button>
          ` : ""}
          <button class="btn-icon remove-chip-btn" title="Quitar este alimento" data-index="${index}">✕</button>
        </div>
      `;

      elements.parsedItemsList.appendChild(chip);
    });

    // Totales de la previsualización
    elements.previewTotals.innerHTML = `
      <strong>Total a registrar:</strong> 
      <span class="badge badge-cal">${result.totals.calories} kcal</span>
      <span class="macro-tag">${result.totals.protein}g Proteína</span>
      <span class="macro-tag">${result.totals.carbs}g Carbos</span>
      <span class="macro-tag">${result.totals.fats}g Grasas</span>
    `;

    // Eventos en los chips
    bindParsedChipsEvents();
  }

  function bindParsedChipsEvents() {
    elements.parsedItemsList.querySelectorAll(".chip-qty-input").forEach(input => {
      input.addEventListener("input", (e) => {
        let idx = parseInt(e.target.dataset.index);
        let newQty = parseFloat(e.target.value) || 1;
        let item = state.parsedItems[idx];
        if (item && item.foodId) {
          let food = db.getFoods().find(f => f.id === item.foodId);
          if (food) {
            let macros = parser.calculateMacros(food, newQty, item.unit);
            item.quantity = newQty;
            item.calories = macros.calories;
            item.protein = macros.protein;
            item.fats = macros.fats;
            item.carbs = macros.carbs;
            recalculateParsedTotals();
          }
        }
      });
    });

    elements.parsedItemsList.querySelectorAll(".chip-macro-input").forEach(input => {
      input.addEventListener("input", (e) => {
        let idx = parseInt(e.target.dataset.index);
        let field = e.target.dataset.field;
        let val = parseFloat(e.target.value) || 0;
        if (state.parsedItems[idx]) {
          state.parsedItems[idx][field] = val;
          recalculateParsedTotals();
        }
      });
    });

    elements.parsedItemsList.querySelectorAll(".remove-chip-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        let idx = parseInt(btn.dataset.index);
        state.parsedItems.splice(idx, 1);
        if (state.parsedItems.length === 0) {
          elements.parsedPreviewContainer.style.display = "none";
        } else {
          renderParsedPreview({ items: state.parsedItems, totals: computeTotals(state.parsedItems) });
        }
      });
    });

    elements.parsedItemsList.querySelectorAll(".save-to-db-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        let idx = parseInt(btn.dataset.index);
        let item = state.parsedItems[idx];
        if (item) {
          openFoodModal({
            name: item.foodName,
            defaultUnit: item.unit,
            calories: item.calories / (item.quantity || 1),
            protein: item.protein / (item.quantity || 1),
            fats: item.fats / (item.quantity || 1),
            carbs: item.carbs / (item.quantity || 1)
          });
        }
      });
    });
  }

  function recalculateParsedTotals() {
    let totals = computeTotals(state.parsedItems);
    elements.previewTotals.innerHTML = `
      <strong>Total a registrar:</strong> 
      <span class="badge badge-cal">${totals.calories} kcal</span>
      <span class="macro-tag">${totals.protein}g Proteína</span>
      <span class="macro-tag">${totals.carbs}g Carbos</span>
      <span class="macro-tag">${totals.fats}g Grasas</span>
    `;
  }

  function computeTotals(items) {
    let totals = items.reduce(
      (acc, item) => {
        acc.calories += parseFloat(item.calories) || 0;
        acc.protein += parseFloat(item.protein) || 0;
        acc.fats += parseFloat(item.fats) || 0;
        acc.carbs += parseFloat(item.carbs) || 0;
        return acc;
      },
      { calories: 0, protein: 0, fats: 0, carbs: 0 }
    );
    totals.calories = Math.round(totals.calories);
    totals.protein = Math.round(totals.protein * 10) / 10;
    totals.fats = Math.round(totals.fats * 10) / 10;
    totals.carbs = Math.round(totals.carbs * 10) / 10;
    return totals;
  }

  function clearQuickInput() {
    elements.quickInputText.value = "";
    elements.parsedPreviewContainer.style.display = "none";
    state.parsedItems = [];
  }

  function saveParsedMeal() {
    if (state.parsedItems.length === 0) {
      alert("No hay alimentos válidos para guardar.");
      return;
    }

    let mealType = elements.mealTypeSelect.value;
    let now = new Date();
    let timeStr = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;

    let newLogs = state.parsedItems.map(item => ({
      id: "log_" + Date.now() + "_" + Math.random().toString(36).substr(2, 6),
      date: state.currentDate,
      time: timeStr,
      mealType: mealType,
      foodId: item.foodId,
      foodName: item.foodName,
      quantity: item.quantity,
      unit: item.unit,
      calories: item.calories,
      protein: item.protein,
      fats: item.fats,
      carbs: item.carbs,
      rawText: item.raw
    }));

    db.addLogs(newLogs);
    clearQuickInput();
    renderDashboard();
    updateSyncBadge();

    // Feedback visual
    showToast(`✓ ${newLogs.length} alimentos guardados en ${mealType}`);
  }

  // ==========================================
  // PESTAÑA CATÁLOGO DE ALIMENTOS
  // ==========================================
  function populateCategoryFilters() {
    let foods = db.getFoods();
    let categories = ["all", ...new Set(foods.map(f => f.category || "General"))];
    
    elements.foodCategoryFilter.innerHTML = categories.map(cat => `
      <option value="${cat}">${cat === "all" ? "Todas las categorías" : cat}</option>
    `).join("");

    let modalCatSelect = document.getElementById("foodCategoryInput");
    if (modalCatSelect) {
      modalCatSelect.innerHTML = categories.filter(c => c !== "all").map(cat => `
        <option value="${cat}">${cat}</option>
      `).join("") + `<option value="Personalizado">Personalizado...</option>`;
    }
  }

  function renderFoodsTable() {
    let foods = db.getFoods();
    let query = state.searchQuery.toLowerCase().trim();
    let category = state.selectedFoodCategory;

    let filtered = foods.filter(food => {
      let matchesCat = category === "all" || food.category === category;
      let matchesQuery = !query || 
        food.name.toLowerCase().includes(query) || 
        (food.aliases && food.aliases.some(a => a.toLowerCase().includes(query)));
      return matchesCat && matchesQuery;
    });

    if (filtered.length === 0) {
      elements.foodTableBody.innerHTML = `<tr><td colspan="7" class="text-center">No se encontraron alimentos.</td></tr>`;
      return;
    }

    elements.foodTableBody.innerHTML = filtered.map(food => `
      <tr>
        <td><strong>${escapeHtml(food.name)}</strong></td>
        <td><span class="badge badge-outline">${escapeHtml(food.category || "General")}</span></td>
        <td>1 ${escapeHtml(food.defaultUnit || "ud")} ${food.unitGrams ? `(~${food.unitGrams}g)` : ""}</td>
        <td><strong>${Math.round(food.calories)} kcal</strong></td>
        <td>${food.protein}g</td>
        <td>${food.carbs}g</td>
        <td>${food.fats}g</td>
        <td class="table-actions">
          <button class="btn-icon edit-food-btn" data-id="${food.id}" title="Editar">✏️</button>
          <button class="btn-icon delete-food-btn" data-id="${food.id}" title="Eliminar">🗑️</button>
        </td>
      </tr>
    `).join("");

    elements.foodTableBody.querySelectorAll(".edit-food-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        let food = db.getFoods().find(f => f.id === btn.dataset.id);
        if (food) openFoodModal(food);
      });
    });

    elements.foodTableBody.querySelectorAll(".delete-food-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        if (confirm("¿Eliminar este alimento del catálogo?")) {
          db.deleteFood(btn.dataset.id);
          parser.setFoods(db.getFoods());
          renderFoodsTable();
          populateCategoryFilters();
        }
      });
    });
  }

  // ==========================================
  // MODALES (ALIMENTO, ENTRADA DIRECTA, PESO)
  // ==========================================
  function openFoodModal(foodData = null) {
    elements.foodForm.reset();
    let hiddenId = document.getElementById("foodIdInput");

    if (foodData && foodData.id) {
      elements.foodModalTitle.textContent = "Editar Alimento";
      hiddenId.value = foodData.id;
      document.getElementById("foodNameInput").value = foodData.name || "";
      document.getElementById("foodCategoryInput").value = foodData.category || "Desayuno";
      document.getElementById("foodDefaultUnitInput").value = foodData.defaultUnit || "ración";
      document.getElementById("foodUnitGramsInput").value = foodData.unitGrams || "";
      document.getElementById("foodCaloriesInput").value = foodData.calories || "";
      document.getElementById("foodProteinInput").value = foodData.protein || "";
      document.getElementById("foodCarbsInput").value = foodData.carbs || "";
      document.getElementById("foodFatsInput").value = foodData.fats || "";
      document.getElementById("foodAliasesInput").value = (foodData.aliases || []).join(", ");
    } else if (foodData) {
      // Datos parciales sugeridos por el parser
      elements.foodModalTitle.textContent = "Guardar Nuevo Alimento";
      hiddenId.value = "";
      document.getElementById("foodNameInput").value = foodData.name || "";
      document.getElementById("foodDefaultUnitInput").value = foodData.defaultUnit || "unidad";
      document.getElementById("foodCaloriesInput").value = Math.round(foodData.calories || 0);
      document.getElementById("foodProteinInput").value = Math.round((foodData.protein || 0)*10)/10;
      document.getElementById("foodCarbsInput").value = Math.round((foodData.carbs || 0)*10)/10;
      document.getElementById("foodFatsInput").value = Math.round((foodData.fats || 0)*10)/10;
    } else {
      elements.foodModalTitle.textContent = "Nuevo Alimento";
      hiddenId.value = "";
    }

    elements.foodModal.style.display = "flex";
  }

  function closeFoodModal() {
    elements.foodModal.style.display = "none";
  }

  function handleFoodFormSubmit(e) {
    e.preventDefault();
    let id = document.getElementById("foodIdInput").value;
    let name = document.getElementById("foodNameInput").value.trim();
    let category = document.getElementById("foodCategoryInput").value.trim();
    let defaultUnit = document.getElementById("foodDefaultUnitInput").value.trim() || "unidad";
    let unitGrams = parseFloat(document.getElementById("foodUnitGramsInput").value) || 0;
    let calories = parseFloat(document.getElementById("foodCaloriesInput").value) || 0;
    let protein = parseFloat(document.getElementById("foodProteinInput").value) || 0;
    let carbs = parseFloat(document.getElementById("foodCarbsInput").value) || 0;
    let fats = parseFloat(document.getElementById("foodFatsInput").value) || 0;
    let aliasesRaw = document.getElementById("foodAliasesInput").value;
    let aliases = aliasesRaw.split(",").map(s => s.trim().toLowerCase()).filter(Boolean);

    let foodPayload = {
      name,
      category,
      defaultUnit,
      unitGrams,
      calories,
      protein,
      carbs,
      fats,
      aliases: [name.toLowerCase(), ...aliases]
    };

    if (id) {
      foodPayload.id = id;
      db.updateFood(foodPayload);
    } else {
      db.addFood(foodPayload);
    }

    parser.setFoods(db.getFoods());
    closeFoodModal();
    renderFoodsTable();
    populateCategoryFilters();
    showToast("✓ Alimento guardado en el catálogo");
  }

  // ENTRADA DIRECTA (COMIDAS FUERA / EVENTOS)
  function openDirectModal() {
    elements.directEntryForm.reset();
    document.getElementById("directMealType").value = state.selectedMealType;
    elements.directEntryModal.style.display = "flex";
  }

  function closeDirectModal() {
    elements.directEntryModal.style.display = "none";
  }

  function handleDirectFormSubmit(e) {
    e.preventDefault();
    let desc = document.getElementById("directDescInput").value.trim() || "Comida fuera";
    let meal = document.getElementById("directMealType").value;
    let calories = parseFloat(document.getElementById("directCaloriesInput").value) || 0;
    let protein = parseFloat(document.getElementById("directProteinInput").value) || 0;
    let carbs = parseFloat(document.getElementById("directCarbsInput").value) || 0;
    let fats = parseFloat(document.getElementById("directFatsInput").value) || 0;

    let now = new Date();
    let timeStr = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;

    db.addLogs({
      date: state.currentDate,
      time: timeStr,
      mealType: meal,
      foodId: null,
      foodName: desc,
      quantity: 1,
      unit: "ración",
      calories,
      protein,
      carbs,
      fats
    });

    closeDirectModal();
    renderDashboard();
    updateSyncBadge();
    showToast("✓ Comida directa registrada");
  }

  // PESO CORPORAL
  function openWeightModal() {
    elements.weightForm.reset();
    document.getElementById("weightDateInput").value = state.currentDate;
    document.getElementById("weightValueInput").value = db.getSettings().currentWeight || "";
    elements.weightModal.style.display = "flex";
  }

  function closeWeightModal() {
    elements.weightModal.style.display = "none";
  }

  function handleWeightFormSubmit(e) {
    e.preventDefault();
    let dateStr = document.getElementById("weightDateInput").value;
    let weightVal = parseFloat(document.getElementById("weightValueInput").value);

    if (dateStr && weightVal) {
      db.addWeight(dateStr, weightVal);
      closeWeightModal();
      renderHistory();
      renderSettings();
      updateSyncBadge();
      showToast(`✓ Peso registrado: ${weightVal} kg`);
    }
  }

  // ==========================================
  // PESTAÑA HISTORIAL Y MEDIAS
  // ==========================================
  function renderHistory() {
    let recent = stats.getRecentDaysSummary(14);
    let settings = db.getSettings();

    // Medias
    elements.historyAveragesContainer.innerHTML = `
      <div class="stat-box">
        <span class="stat-label">Días registrados</span>
        <span class="stat-val">${recent.daysRecorded} días</span>
      </div>
      <div class="stat-box">
        <span class="stat-label">Media Calorías</span>
        <span class="stat-val ${recent.averages.calories >= settings.minCalories ? "text-success" : "text-warning"}">
          ~${recent.averages.calories.toLocaleString("es-ES")} kcal
        </span>
      </div>
      <div class="stat-box">
        <span class="stat-label">Media Proteína</span>
        <span class="stat-val">~${recent.averages.protein} g</span>
      </div>
      <div class="stat-box">
        <span class="stat-label">Media Grasas</span>
        <span class="stat-val">~${recent.averages.fats} g</span>
      </div>
      <div class="stat-box">
        <span class="stat-label">Media Carbos</span>
        <span class="stat-val">~${recent.averages.carbs} g</span>
      </div>
    `;

    // Tabla de días
    if (recent.days.length === 0) {
      elements.historyTableBody.innerHTML = `<tr><td colspan="7" class="text-center">Aún no hay registros de días anteriores.</td></tr>`;
    } else {
      elements.historyTableBody.innerHTML = recent.days.map(day => {
        let cal = day.targets.calories;
        let diffStr = (cal.diff >= 0 ? "+" : "") + cal.diff;
        return `
          <tr class="history-row" data-date="${day.date}">
            <td><strong>${day.date}</strong></td>
            <td><strong>${day.totals.calories} kcal</strong></td>
            <td>${day.totals.protein} g</td>
            <td>${day.totals.carbs} g</td>
            <td>${day.totals.fats} g</td>
            <td><span class="badge ${getStatusClass(cal.status)}">${diffStr} kcal</span></td>
            <td>
              <button class="btn btn-xs btn-outline view-day-btn" data-date="${day.date}">Ver Día</button>
            </td>
          </tr>
        `;
      }).join("");

      elements.historyTableBody.querySelectorAll(".view-day-btn").forEach(btn => {
        btn.addEventListener("click", () => {
          setDate(btn.dataset.date);
          switchTab("dashboard");
        });
      });
    }

    // Lista de pesos registrados
    let weights = db.getWeights();
    if (weights.length === 0) {
      elements.weightListContainer.innerHTML = `<p class="text-muted">Sin registros de peso aún.</p>`;
    } else {
      elements.weightListContainer.innerHTML = weights.slice().reverse().map((w, idx) => `
        <div class="weight-item">
          <span class="weight-date">${w.date}</span>
          <span class="weight-val"><strong>${w.weight} kg</strong></span>
        </div>
      `).join("");
    }
  }

  // ==========================================
  // PESTAÑA COMBOS / PLANTILLAS
  // ==========================================
  function renderCombos() {
    let combos = db.getCombos();
    let foods = db.getFoods();

    elements.combosListContainer.innerHTML = combos.map(combo => {
      let itemsDetails = combo.items.map(it => {
        let f = foods.find(food => food.id === it.foodId);
        return f ? `${it.quantity} ${it.unit} ${f.name}` : "";
      }).filter(Boolean).join(", ");

      return `
        <div class="combo-card">
          <div class="combo-header">
            <h4>${escapeHtml(combo.name)}</h4>
            <span class="badge badge-outline">${capitalize(combo.mealType)}</span>
          </div>
          <p class="combo-details">${escapeHtml(itemsDetails)}</p>
          <div class="combo-actions">
            <button class="btn btn-sm btn-primary apply-combo-btn" data-id="${combo.id}">
              + Añadir hoy a ${capitalize(combo.mealType)}
            </button>
            <button class="btn-icon delete-combo-btn" data-id="${combo.id}" title="Eliminar combo">🗑️</button>
          </div>
        </div>
      `;
    }).join("");

    elements.combosListContainer.querySelectorAll(".apply-combo-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        let combo = db.getCombos().find(c => c.id === btn.dataset.id);
        if (combo) {
          applyComboToDay(combo);
        }
      });
    });

    elements.combosListContainer.querySelectorAll(".delete-combo-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        if (confirm("¿Eliminar este combo?")) {
          db.deleteCombo(btn.dataset.id);
          renderCombos();
        }
      });
    });
  }

  function applyComboToDay(combo) {
    let foods = db.getFoods();
    let now = new Date();
    let timeStr = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;

    let newLogs = [];
    combo.items.forEach(it => {
      let food = foods.find(f => f.id === it.foodId);
      if (food) {
        let macros = parser.calculateMacros(food, it.quantity, it.unit);
        newLogs.push({
          date: state.currentDate,
          time: timeStr,
          mealType: combo.mealType,
          foodId: food.id,
          foodName: food.name,
          quantity: it.quantity,
          unit: it.unit,
          calories: macros.calories,
          protein: macros.protein,
          carbs: macros.carbs,
          fats: macros.fats
        });
      }
    });

    db.addLogs(newLogs);
    renderDashboard();
    updateSyncBadge();
    showToast(`✓ Combo "${combo.name}" añadido al día de hoy`);
  }

  // ==========================================
  // PESTAÑA AJUSTES Y SINCRONIZACIÓN GOOGLE
  // ==========================================
  function renderSettings() {
    let settings = db.getSettings();
    document.getElementById("targetCaloriesInput").value = settings.dailyCalories || 2750;
    document.getElementById("minCaloriesInput").value = settings.minCalories || 2750;
    document.getElementById("maxCaloriesInput").value = settings.maxCalories || 2800;

    document.getElementById("targetProteinInput").value = settings.protein || 155;
    document.getElementById("minProteinInput").value = settings.minProtein || 150;
    document.getElementById("maxProteinInput").value = settings.maxProtein || 160;

    document.getElementById("targetCarbsInput").value = settings.carbs || 350;
    document.getElementById("minCarbsInput").value = settings.minCarbs || 340;
    document.getElementById("maxCarbsInput").value = settings.maxCarbs || 360;

    document.getElementById("targetFatsInput").value = settings.fats || 78;
    document.getElementById("minFatsInput").value = settings.minFats || 75;
    document.getElementById("maxFatsInput").value = settings.maxFats || 80;

    document.getElementById("currentWeightInput").value = settings.currentWeight || 69.6;
    document.getElementById("googleScriptUrlInput").value = settings.googleScriptUrl || "";
  }

  function handleSettingsSubmit(e) {
    e.preventDefault();
    let newSettings = {
      dailyCalories: parseFloat(document.getElementById("targetCaloriesInput").value),
      minCalories: parseFloat(document.getElementById("minCaloriesInput").value),
      maxCalories: parseFloat(document.getElementById("maxCaloriesInput").value),

      protein: parseFloat(document.getElementById("targetProteinInput").value),
      minProtein: parseFloat(document.getElementById("minProteinInput").value),
      maxProtein: parseFloat(document.getElementById("maxProteinInput").value),

      carbs: parseFloat(document.getElementById("targetCarbsInput").value),
      minCarbs: parseFloat(document.getElementById("minCarbsInput").value),
      maxCarbs: parseFloat(document.getElementById("maxCarbsInput").value),

      fats: parseFloat(document.getElementById("targetFatsInput").value),
      minFats: parseFloat(document.getElementById("minFatsInput").value),
      maxFats: parseFloat(document.getElementById("maxFatsInput").value),

      currentWeight: parseFloat(document.getElementById("currentWeightInput").value),
      googleScriptUrl: document.getElementById("googleScriptUrlInput").value.trim()
    };

    db.saveSettings(newSettings);
    renderDashboard();
    updateSyncBadge();
    showToast("✓ Metas y ajustes guardados correctamente");
  }

  async function handleSyncNow() {
    let urlVal = elements.googleScriptUrlInput ? elements.googleScriptUrlInput.value.trim() : "";
    if (urlVal) {
      let current = db.getSettings();
      current.googleScriptUrl = urlVal;
      db.saveSettings(current);
      updateSyncBadge();
    }

    elements.syncStatusMsg.innerHTML = `<span class="loading-spinner"></span> Sincronizando con Google Sheets...`;
    let res = await db.syncWithGoogle();
    if (res.success) {
      elements.syncStatusMsg.innerHTML = `<span class="text-success">✓ ${res.message}</span>`;
      updateSyncBadge();
      showToast("✓ Sincronización completada");
    } else {
      elements.syncStatusMsg.innerHTML = `<span class="text-danger">⚠️ ${res.message}</span>`;
    }
  }

  async function handlePullNow() {
    let urlVal = elements.googleScriptUrlInput ? elements.googleScriptUrlInput.value.trim() : "";
    if (urlVal) {
      let current = db.getSettings();
      current.googleScriptUrl = urlVal;
      db.saveSettings(current);
      updateSyncBadge();
    }

    if (confirm("¿Descargar datos desde Google Sheets y sobreescribir los cambios locales?")) {
      elements.syncStatusMsg.innerHTML = `<span class="loading-spinner"></span> Descargando desde Google Sheets...`;
      let res = await db.pullFromGoogle();
      if (res.success) {
        elements.syncStatusMsg.innerHTML = `<span class="text-success">✓ ${res.message}</span>`;
        parser.setFoods(db.getFoods());
        renderAll();
        showToast("✓ Datos actualizados desde Google Sheets");
      } else {
        elements.syncStatusMsg.innerHTML = `<span class="text-danger">⚠️ ${res.message}</span>`;
      }
    }
  }

  function handleExportBackup() {
    let backup = db.exportBackup();
    let dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(backup, null, 2));
    let downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `contador_calorias_backup_${getTodayString()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    showToast("✓ Copia de seguridad exportada");
  }

  function handleImportBackupFile(e) {
    let file = e.target.files[0];
    if (!file) return;
    let reader = new FileReader();
    reader.onload = (event) => {
      try {
        let json = JSON.parse(event.target.result);
        if (confirm("¿Importar esta copia de seguridad? Reemplazará los datos actuales.")) {
          db.importBackup(json);
          parser.setFoods(db.getFoods());
          renderAll();
          showToast("✓ Copia de seguridad restaurada");
        }
      } catch (err) {
        alert("Error al leer el archivo JSON: " + err.message);
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  }

  function updateSyncBadge() {
    let settings = db.getSettings();
    let pending = db.getPendingSync().length;

    if (!settings.googleScriptUrl) {
      elements.syncStatusBadge.textContent = "📁 Solo Local";
      elements.syncStatusBadge.className = "badge badge-neutral";
      elements.syncStatusBadge.title = "Configura la URL de Google Apps Script en Ajustes para sincronizar con Drive.";
    } else if (pending > 0) {
      elements.syncStatusBadge.textContent = `🟡 ${pending} pend. sincronizar`;
      elements.syncStatusBadge.className = "badge badge-warning";
      elements.syncStatusBadge.title = "Hay cambios locales pendientes de sincronizar con Google Sheets.";
    } else {
      elements.syncStatusBadge.textContent = "🟢 Sincronizado";
      elements.syncStatusBadge.className = "badge badge-success";
      elements.syncStatusBadge.title = "Todos los registros sincronizados con Google Sheets.";
    }
  }

  // ==========================================
  // UTILIDADES GENERALES
  // ==========================================
  function applyTheme(theme) {
    document.documentElement.setAttribute("data-theme", theme);
    elements.themeToggleBtn.textContent = theme === "dark" ? "☀️ Modo Claro" : "🌙 Modo Oscuro";
  }

  function getAutoMealType() {
    let h = new Date().getHours();
    if (h >= 5 && h < 11) return "desayuno";
    if (h >= 11 && h < 13) return "almuerzo";
    if (h >= 13 && h < 17) return "comida";
    if (h >= 17 && h < 20) return "merienda";
    return "cena";
  }

  function getTodayString() {
    return formatDateISO(new Date());
  }

  function getYesterdayString() {
    let d = new Date();
    d.setDate(d.getDate() - 1);
    return formatDateISO(d);
  }

  function formatDateISO(dateObj) {
    let y = dateObj.getFullYear();
    let m = String(dateObj.getMonth() + 1).padStart(2, "0");
    let d = String(dateObj.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  }

  function capitalize(str) {
    if (!str) return "";
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  function escapeHtml(str) {
    if (!str) return "";
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function debounce(fn, delay) {
    let timer = null;
    return function (...args) {
      clearTimeout(timer);
      timer = setTimeout(() => fn.apply(this, args), delay);
    };
  }

  function showToast(msg) {
    let toast = document.createElement("div");
    toast.className = "toast-notification";
    toast.textContent = msg;
    document.body.appendChild(toast);
    setTimeout(() => toast.classList.add("show"), 10);
    setTimeout(() => {
      toast.classList.remove("show");
      setTimeout(() => toast.remove(), 300);
    }, 2500);
  }

  // Arrancar la app
  initApp();
});
