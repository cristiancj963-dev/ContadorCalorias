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

    return {
      date: dateStr,
      totals,
      mealBreakdown,
      targets
    };
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
}

if (typeof window !== "undefined") {
  window.CalorieStats = CalorieStats;
}
