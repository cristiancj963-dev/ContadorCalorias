/**
 * Motor de estadísticas, comparador de objetivos y análisis nutricional
 */

class CalorieStats {
  constructor(db) {
    this.db = db;
  }

  /**
   * Resumen del día seleccionado
   */
  getDaySummary(dateStr) {
    let logs = this.db.getLogsForDate(dateStr);
    let settings = this.db.getSettings();

    let totals = {
      calories: 0,
      protein: 0,
      fats: 0,
      carbs: 0,
      itemCount: logs.length
    };

    let mealBreakdown = {
      desayuno: { calories: 0, protein: 0, fats: 0, carbs: 0, items: [] },
      almuerzo: { calories: 0, protein: 0, fats: 0, carbs: 0, items: [] },
      comida: { calories: 0, protein: 0, fats: 0, carbs: 0, items: [] },
      merienda: { calories: 0, protein: 0, fats: 0, carbs: 0, items: [] },
      cena: { calories: 0, protein: 0, fats: 0, carbs: 0, items: [] }
    };

    logs.forEach(log => {
      let cal = parseFloat(log.calories) || 0;
      let p = parseFloat(log.protein) || 0;
      let f = parseFloat(log.fats) || 0;
      let c = parseFloat(log.carbs) || 0;

      totals.calories += cal;
      totals.protein += p;
      totals.fats += f;
      totals.carbs += c;

      let meal = (log.mealType || "desayuno").toLowerCase();
      if (mealBreakdown[meal]) {
        mealBreakdown[meal].calories += cal;
        mealBreakdown[meal].protein += p;
        mealBreakdown[meal].fats += f;
        mealBreakdown[meal].carbs += c;
        mealBreakdown[meal].items.push(log);
      }
    });

    // Redondear
    totals.calories = Math.round(totals.calories);
    totals.protein = Math.round(totals.protein * 10) / 10;
    totals.fats = Math.round(totals.fats * 10) / 10;
    totals.carbs = Math.round(totals.carbs * 10) / 10;

    // Calcular estado frente a objetivos
    let targets = {
      calories: {
        target: settings.dailyCalories || 2750,
        min: settings.minCalories || 2750,
        max: settings.maxCalories || 2800,
        current: totals.calories,
        pct: Math.min(Math.round((totals.calories / (settings.dailyCalories || 2750)) * 100), 100),
        status: this.getMacroStatus(totals.calories, settings.minCalories || 2750, settings.maxCalories || 2800),
        diff: totals.calories - (settings.dailyCalories || 2750)
      },
      protein: {
        target: settings.protein || 155,
        min: settings.minProtein || 150,
        max: settings.maxProtein || 160,
        current: totals.protein,
        pct: Math.min(Math.round((totals.protein / (settings.protein || 155)) * 100), 100),
        status: this.getMacroStatus(totals.protein, settings.minProtein || 150, settings.maxProtein || 160),
        diff: Math.round((totals.protein - (settings.protein || 155)) * 10) / 10
      },
      fats: {
        target: settings.fats || 78,
        min: settings.minFats || 75,
        max: settings.maxFats || 80,
        current: totals.fats,
        pct: Math.min(Math.round((totals.fats / (settings.fats || 78)) * 100), 100),
        status: this.getMacroStatus(totals.fats, settings.minFats || 75, settings.maxFats || 80),
        diff: Math.round((totals.fats - (settings.fats || 78)) * 10) / 10
      },
      carbs: {
        target: settings.carbs || 350,
        min: settings.minCarbs || 340,
        max: settings.maxCarbs || 360,
        current: totals.carbs,
        pct: Math.min(Math.round((totals.carbs / (settings.carbs || 350)) * 100), 100),
        status: this.getMacroStatus(totals.carbs, settings.minCarbs || 340, settings.maxCarbs || 360),
        diff: Math.round((totals.carbs - (settings.carbs || 350)) * 10) / 10
      }
    };

    let healthScore = this.calculateHealthScore(totals, targets);

    return {
      date: dateStr,
      totals,
      mealBreakdown,
      targets,
      healthScore
    };
  }

  /**
   * Calcula el Health Score / Puntuación Nutricional (estilo Cal AI, de 0 a 10 y 0 a 100)
   * ponderando adherencia calórica (40%), objetivo proteico (35%) y balance de carbos/grasas (25%)
   */
  calculateHealthScore(totals, targets) {
    if (!totals || totals.itemCount === 0 || totals.calories === 0) {
      return {
        score100: 0,
        score10: "—",
        label: "Registra tu primera toma",
        status: "neutral"
      };
    }

    const scoreDimension = (cur, min, max, target) => {
      if (cur >= min && cur <= max) return 1.0;
      if (cur < min) {
        return Math.max(0, cur / (min || target || 1));
      }
      // Si se excede del máximo, penalizar progresivamente según el exceso
      let overPct = (cur - max) / (target || max || 1);
      return Math.max(0, 1 - overPct * 1.4);
    };

    let calScore = scoreDimension(
      targets.calories.current,
      targets.calories.min,
      targets.calories.max,
      targets.calories.target
    );
    let protScore = scoreDimension(
      targets.protein.current,
      targets.protein.min,
      targets.protein.max,
      targets.protein.target
    );
    let carbsScore = scoreDimension(
      targets.carbs.current,
      targets.carbs.min,
      targets.carbs.max,
      targets.carbs.target
    );
    let fatsScore = scoreDimension(
      targets.fats.current,
      targets.fats.min,
      targets.fats.max,
      targets.fats.target
    );

    let raw100 = Math.round((calScore * 40) + (protScore * 35) + (carbsScore * 12.5) + (fatsScore * 12.5));
    let score100 = Math.max(1, Math.min(100, raw100));
    let score10 = (score100 / 10).toFixed(1);

    let label = "En progreso";
    let status = "low";
    if (score100 >= 88) {
      label = "Excelente · Recomposición óptima";
      status = "in_range";
    } else if (score100 >= 70) {
      label = "Buen balance diario";
      status = "in_range";
    } else if (targets.calories.status === "high" || targets.fats.status === "high") {
      label = "Rango superado";
      status = "high";
    }

    return {
      score100,
      score10,
      label,
      status
    };
  }

  /**
   * Obtiene los datos de los 7 días de la semana (Lunes a Domingo) para la tira estilo Cal AI
   */
  getWeekStripData(referenceDateStr, todayStr) {
    let [y, m, d] = referenceDateStr.split("-").map(Number);
    let refDate = new Date(y, m - 1, d);
    // Ajustar para que la semana empiece en Lunes (0 = Lunes ... 6 = Domingo)
    let dayOfWeek = (refDate.getDay() + 6) % 7;
    let monday = new Date(refDate);
    monday.setDate(refDate.getDate() - dayOfWeek);

    const dayLetters = ["L", "M", "X", "J", "V", "S", "D"];
    const dayNames = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];
    let days = [];

    for (let i = 0; i < 7; i++) {
      let cur = new Date(monday);
      cur.setDate(monday.getDate() + i);
      let cy = cur.getFullYear();
      let cm = String(cur.getMonth() + 1).padStart(2, "0");
      let cd = String(cur.getDate()).padStart(2, "0");
      let iso = `${cy}-${cm}-${cd}`;

      let summary = this.getDaySummary(iso);
      let calTarget = summary.targets.calories;
      let hasLogs = summary.totals.itemCount > 0;

      days.push({
        date: iso,
        dayLetter: dayLetters[i],
        dayName: dayNames[i],
        dayNumber: cur.getDate(),
        isToday: iso === todayStr,
        isSelected: iso === referenceDateStr,
        hasLogs,
        calories: calTarget.current,
        targetCalories: calTarget.target,
        pct: hasLogs ? Math.min(Math.round((calTarget.current / (calTarget.target || 2750)) * 100), 100) : 0,
        status: hasLogs ? calTarget.status : "empty"
      });
    }

    return days;
  }

  /**
   * Determina si un valor está por debajo ('low'), en objetivo ('in_range') o por encima ('high')
   */
  getMacroStatus(current, min, max) {
    if (current < min) return "low";
    if (current > max) return "high";
    return "in_range";
  }

  /**
   * Resumen de los últimos N días
   */
  getRecentDaysSummary(daysCount = 7) {
    let allLogs = this.db.getAllLogs();
    let dates = [...new Set(allLogs.map(l => l.date))].sort().reverse();
    let selectedDates = dates.slice(0, daysCount);

    let list = selectedDates.map(d => this.getDaySummary(d));
    
    if (list.length === 0) return { days: [], averages: { calories: 0, protein: 0, fats: 0, carbs: 0 } };

    let avg = list.reduce(
      (acc, day) => {
        acc.calories += day.totals.calories;
        acc.protein += day.totals.protein;
        acc.fats += day.totals.fats;
        acc.carbs += day.totals.carbs;
        return acc;
      },
      { calories: 0, protein: 0, fats: 0, carbs: 0 }
    );

    avg.calories = Math.round(avg.calories / list.length);
    avg.protein = Math.round((avg.protein / list.length) * 10) / 10;
    avg.fats = Math.round((avg.fats / list.length) * 10) / 10;
    avg.carbs = Math.round((avg.carbs / list.length) * 10) / 10;

    return {
      days: list,
      averages: avg,
      daysRecorded: list.length
    };
  }

  /**
   * Días consecutivos registrados
   */
  getCurrentStreak() {
    let allLogs = this.db.getAllLogs();
    if (allLogs.length === 0) return 0;

    let uniqueDates = [...new Set(allLogs.map(l => l.date))].sort().reverse();
    let streak = 0;
    let today = new Date();
    let curDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());

    for (let dStr of uniqueDates) {
      let [year, month, day] = dStr.split("-").map(Number);
      let targetDate = new Date(year, month - 1, day);
      let diffDays = Math.floor((curDate - targetDate) / (1000 * 60 * 60 * 24));

      if (diffDays === streak || diffDays === streak + 1) {
        streak++;
        curDate = targetDate;
      } else {
        break;
      }
    }

    return streak;
  }

  /**
   * Obtiene los alimentos más frecuentes o sugeridos para una toma concreta (1-Tap Quick Add)
   */
  getFrequentFoodsForMeal(mealType = "desayuno", limit = 8) {
    let allLogs = this.db.getAllLogs();
    let foods = this.db.getFoods();
    let foodMap = new Map(foods.map(f => [f.id, f]));
    let freqMap = new Map();

    allLogs.forEach(log => {
      let key = log.foodId || (log.foodName || "").toLowerCase().trim();
      if (!key) return;
      let isSameMeal = (log.mealType || "").toLowerCase() === mealType.toLowerCase();
      let weight = isSameMeal ? 3 : 1; // Priorizar lo que el usuario suele tomar en esa misma comida

      if (!freqMap.has(key)) {
        let catalogFood = log.foodId ? foodMap.get(log.foodId) : null;
        freqMap.set(key, {
          foodId: log.foodId || (catalogFood ? catalogFood.id : null),
          name: catalogFood ? catalogFood.name : log.foodName,
          quantity: log.quantity || 1,
          unit: log.unit || (catalogFood ? catalogFood.defaultUnit : "ración"),
          calories: Math.round(log.calories || (catalogFood ? catalogFood.calories : 0)),
          score: weight
        });
      } else {
        let entry = freqMap.get(key);
        entry.score += weight;
      }
    });

    let sorted = Array.from(freqMap.values()).sort((a, b) => b.score - a.score);
    let results = sorted.slice(0, limit);
    let usedNames = new Set(results.map(r => (r.name || "").toLowerCase()));

    // Completar con alimentos del catálogo afines a esa toma si aún no hay suficientes registros
    if (results.length < limit) {
      const mealCategoryHints = {
        desayuno: ["desayuno", "lácteos", "frutas"],
        almuerzo: ["snacks", "desayuno", "frutas", "proteínas"],
        comida: ["platos", "proteínas", "carbohidratos"],
        merienda: ["snacks", "desayuno", "frutas", "lácteos"],
        cena: ["proteínas", "platos", "verduras", "carbohidratos"]
      };
      let hints = mealCategoryHints[mealType.toLowerCase()] || [];

      let candidates = foods.filter(f => !usedNames.has(f.name.toLowerCase()));
      candidates.sort((a, b) => {
        let catA = (a.category || "").toLowerCase();
        let catB = (b.category || "").toLowerCase();
        let matchA = hints.some(h => catA.includes(h)) ? 1 : 0;
        let matchB = hints.some(h => catB.includes(h)) ? 1 : 0;
        return matchB - matchA;
      });

      for (let f of candidates) {
        if (results.length >= limit) break;
        results.push({
          foodId: f.id,
          name: f.name,
          quantity: 1,
          unit: f.defaultUnit || "ración",
          calories: Math.round(f.calories || 0),
          score: 0
        });
      }
    }

    return results;
  }
}

if (typeof window !== "undefined") {
  window.CalorieStats = CalorieStats;
}
