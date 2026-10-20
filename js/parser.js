/**
 * Parser de lenguaje natural para registro de comidas sin IA.
 * Procesa entradas como:
 * "3 puñados cereales avena, vaso leche desnatada con nesquik, 3 tostadas con queso cottage y miel"
 * "200g patata cocida, filete de ternera 150g, 1 rodaja de sandia"
 */

class NaturalFoodParser {
  constructor(foodsList = []) {
    this.foods = foodsList;
    this.unitMultipliers = {
      "medio": 0.5,
      "media": 0.5,
      "un": 1,
      "una": 1,
      "dos": 2,
      "tres": 3,
      "cuatro": 4,
      "cinco": 5,
      "seis": 6,
      "par": 2,
      "1/2": 0.5,
      "1/4": 0.25,
      "3/4": 0.75
    };
  }

  setFoods(foodsList) {
    this.foods = foodsList;
  }

  // Quitar tildes y caracteres especiales para búsqueda
  normalize(str) {
    return (str || "")
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^\w\s\d.,/%+-]/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  }

  // Lematizador simple en español para singularizar plurales comunes
  singularize(word) {
    if (!word || word.length <= 3) return word;
    if (word.endsWith("ces")) return word.slice(0, -3) + "z";
    if (word.endsWith("es") && !word.endsWith("les") && !word.endsWith("nes") && !word.endsWith("res")) {
      return word.slice(0, -1);
    }
    if (word.endsWith("es")) {
      return word.slice(0, -2);
    }
    if (word.endsWith("s")) {
      return word.slice(0, -1);
    }
    return word;
  }

  /**
   * Divide un texto en fragmentos de alimentos individuales
   */
  splitIntoItems(rawText) {
    if (!rawText) return [];

    // Limpiar saludos o frases introductorias conversacionales (ej: "para cenar he comido...")
    let text = rawText
      .replace(/^(?:(?:para|de)\s+(?:la\s+)?(?:cenar|desayunar|comer|merendar|el almuerzo|la cena|la comida|cena|comida|desayuno|merienda|almuerzo)\s*(?:he comido|he tomado|comi|tome)?|he\s+(?:cenado|comido|desayunado|merendado|tomado))\s*(?::|,|-)?\s*/i, "")
      .replace(/\r\n/g, "\n");

    // Dividir por saltos de línea, punto y coma, o comas
    let parts = text.split(/[\n;,\+]/);

    let items = [];
    for (let part of parts) {
      part = part.trim();
      if (!part) continue;

      // Si la parte contiene " y " separar solo si NO es "y medio" o "y media" y parece conectar dos alimentos
      if (/\s+y\s+(?!(?:medio|media|un cuarto)\b)(?=\d|un|una|dos|tres|cuatro|cinco|vaso|tostada|plato|rodaja|filete|pincho|lata|cafe|cortado|par\b)/i.test(part)) {
        let subparts = part.split(/\s+y\s+(?!(?:medio|media|un cuarto)\b)(?=\d|un|una|dos|tres|cuatro|cinco|vaso|tostada|plato|rodaja|filete|pincho|lata|cafe|cortado|par\b)/i);
        items.push(...subparts.map(s => s.trim()).filter(Boolean));
      } else {
        items.push(part);
      }
    }

    return items;
  }

  /**
   * Extrae cantidad, unidad y término de búsqueda de un fragmento
   */
  extractQuantityAndTerm(rawChunk) {
    let chunk = rawChunk.trim();

    let quantity = 1;
    let detectedUnit = "";
    let parenContent = "";

    // Extraer posible aclaración entre paréntesis e.g. "(espaguetis chinos finos de estos)"
    let parenMatch = chunk.match(/\((.*?)\)/);
    if (parenMatch) {
      parenContent = parenMatch[1].trim();
    }

    // Caso 1: Gramos o mililitros pegados o sueltos (ej: 30gr, 150g, 250ml, 30 gramos)
    let gramsMatch = chunk.match(/(\d+(?:[.,]\d+)?)\s*(g|gr|gramos|ml|mililitros)\b/i);
    if (gramsMatch) {
      quantity = parseFloat(gramsMatch[1].replace(',', '.'));
      detectedUnit = gramsMatch[2].toLowerCase();
      chunk = chunk.replace(gramsMatch[0], ' ').replace(/\bde\b/gi, ' ').trim();
    } else {
      // Caso 2: Patrones de 'y medio / y media' con unidad (ej: 'plato y medio', '1 plato y medio', 'racion y media', '2 vasos y medio')
      let yMedioUnitRegex = /(?:^|\s+)(?:(\d+(?:[.,]\d+)?|un|una|dos|tres|cuatro|cinco)\s+)?(puñados?|vasos?|lonchas?|tostadas?|rebanadas?|piezas?|latas?|platos?|cucharadas?|claras?|huevos?|trozos?|rodajas?|raciones?|racion|filetes?)\s+y\s+medi[oa]\b/i;
      let ymMatch = chunk.match(yMedioUnitRegex);

      if (ymMatch) {
        let baseStr = (ymMatch[1] || '1').toLowerCase();
        let base = this.unitMultipliers[baseStr] !== undefined ? this.unitMultipliers[baseStr] : (parseFloat(baseStr.replace(',', '.')) || 1);
        quantity = base + 0.5;
        detectedUnit = ymMatch[2].toLowerCase();
        chunk = chunk.replace(ymMatch[0], ' ').replace(/\bde\b/gi, ' ').trim();
      } else {
        // Caso 3: Cantidad numérica (decimal o entera) con unidad en cualquier parte (ej: '1.5 platos', '1,5 raciones', '2 huevos fritos', '0.5 vasos')
        let numUnitRegex = /(?:^|\s+)(\d+(?:[.,]\d+)?|medio|media|un|una|dos|tres|cuatro|cinco|seis|par)\s+(?:de\s+)?(puñados?|vasos?|lonchas?|tostadas?|rebanadas?|piezas?|latas?|platos?|cucharadas?|claras?|huevos?|trozos?|rodajas?|tazas?|pinchos?|burgers?|raciones?|racion|filetes?|chorro)\b/i;
        let nuMatch = chunk.match(numUnitRegex);

        if (nuMatch) {
          let qStr = nuMatch[1].toLowerCase();
          quantity = this.unitMultipliers[qStr] !== undefined ? this.unitMultipliers[qStr] : (parseFloat(qStr.replace(',', '.')) || 1);
          detectedUnit = nuMatch[2].toLowerCase();
          chunk = chunk.replace(nuMatch[0], ' ').trim();
        } else {
          // Caso 4: Cantidad al inicio sin unidad explícita (ej: '2 contramuslos', '1.5 platanos')
          let prefixMatch = chunk.match(/^(\d+(?:[.,]\d+)?|\d+\/\d+|medio|media|un|una|dos|tres|cuatro|cinco|seis|par)\s+(?:de\s+)?(.*)$/i);
          if (prefixMatch) {
            let qStr = prefixMatch[1].toLowerCase();
            if (this.unitMultipliers[qStr] !== undefined) {
              quantity = this.unitMultipliers[qStr];
            } else if (qStr.includes('/')) {
              let [num, den] = qStr.split('/');
              quantity = (parseFloat(num) || 1) / (parseFloat(den) || 1);
            } else {
              quantity = parseFloat(qStr.replace(',', '.')) || 1;
            }
            chunk = prefixMatch[2].trim();
          }
        }
      }
    }

    // Limpiar restos de conectores
    let cleanTerm = chunk.replace(/\s+/g, ' ').replace(/^(de|del|con)\s+/i, '').trim();
    // Si cleanTerm quedó vacío pero se detectó una unidad que es un alimento (ej: "2 huevos", "3 tostadas"), usarla como término
    let termToSearch = cleanTerm || detectedUnit || rawChunk;

    return {
      raw: rawChunk,
      quantity,
      unit: detectedUnit,
      searchTerm: termToSearch,
      parenContent
    };
  }

  /**
   * Busca el mejor alimento que coincida con el término
   */
  findBestMatch(searchTerm, unit = "", parenContent = "") {
    if (!searchTerm && !parenContent) return null;
    let candidateTerms = [];

    // Priorizar contenido entre paréntesis si existe (ej: "espaguetis chinos finos")
    if (parenContent) {
      let normParen = this.normalize(parenContent);
      candidateTerms.push(normParen);
      let singParen = this.singularize(normParen);
      if (singParen !== normParen) candidateTerms.push(singParen);
    }

    if (searchTerm) {
      let normTerm = this.normalize(searchTerm);
      let singTerm = this.singularize(normTerm);

      if (unit && unit !== normTerm) {
        let normUnit = this.normalize(unit);
        candidateTerms.push(this.normalize(`${normUnit} ${normTerm}`));
        candidateTerms.push(this.normalize(`${normUnit} de ${normTerm}`));
      }

      candidateTerms.push(normTerm);
      if (singTerm !== normTerm) {
        candidateTerms.push(singTerm);
      }
    }

    // 1. Coincidencia exacta de alias, nombre o nombre sin aclaraciones entre paréntesis
    for (let term of candidateTerms) {
      for (let food of this.foods) {
        let normName = this.normalize(food.name);
        let cleanName = this.normalize(food.name.replace(/\(.*?\)/g, "").trim());
        if (normName === term || cleanName === term) {
          return { food, score: 1.0, matchType: "exact" };
        }

        if (food.aliases) {
          for (let alias of food.aliases) {
            let normAlias = this.normalize(alias);
            if (normAlias === term || this.singularize(normAlias) === term) {
              return { food, score: 1.0, matchType: "exact_alias" };
            }
          }
        }
      }
    }

    // 2. Coincidencia por palabra completa (prioridad sobre subcadenas arbitrarias)
    for (let term of candidateTerms) {
      for (let food of this.foods) {
        let cleanName = this.normalize(food.name.replace(/\(.*?\)/g, "").trim());
        let aliases = [cleanName, ...(food.aliases || []).map(a => this.normalize(a))];
        for (let alias of aliases) {
          let termWordRegex = new RegExp(`\\b${term}\\b`, 'i');
          if (termWordRegex.test(alias)) {
            let score = term.length / alias.length;
            if (score >= 0.4) {
              return { food, score: Math.min(0.95, score + 0.3), matchType: "whole_word" };
            }
          }
        }
      }
    }

    // 3. Coincidencia por contención / subcadenas (preferir alias más largos y específicos)
    let bestCandidate = null;
    let highestScore = 0;
    let longestMatchLen = 0;

    for (let term of candidateTerms) {
      for (let food of this.foods) {
        let normName = this.normalize(food.name);
        let cleanName = this.normalize(food.name.replace(/\(.*?\)/g, "").trim());
        let aliases = [cleanName, normName, ...(food.aliases || []).map(a => this.normalize(a))];

        for (let alias of aliases) {
          if (term.includes(alias)) {
            let score = alias.length / term.length;
            if (score > highestScore || (score === highestScore && alias.length > longestMatchLen)) {
              highestScore = score;
              longestMatchLen = alias.length;
              bestCandidate = food;
            }
          } else if (alias.includes(term)) {
            let score = term.length / alias.length;
            if (score > highestScore || (score === highestScore && alias.length > longestMatchLen)) {
              highestScore = score;
              longestMatchLen = alias.length;
              bestCandidate = food;
            }
          }
        }
      }
    }

    // 4. Coincidencia por palabras clave compartidas
    if (!bestCandidate) {
      for (let term of candidateTerms) {
        let termWords = term.split(/\s+/).filter(w => w.length > 2 && w !== "con" && w !== "del" && w !== "para");
        
        for (let food of this.foods) {
          let allTerms = [this.normalize(food.name), ...(food.aliases || []).map(a => this.normalize(a))].join(" ");
          let matches = 0;
          for (let word of termWords) {
            if (allTerms.includes(word)) {
              matches++;
            }
          }
          if (termWords.length > 0) {
            let score = matches / termWords.length;
            if (score >= 0.5 && score > highestScore) {
              highestScore = score;
              bestCandidate = food;
            }
          }
        }
      }
    }

    if (bestCandidate && highestScore >= 0.35) {
      return { food: bestCandidate, score: highestScore, matchType: "partial" };
    }

    return null;
  }

  /**
   * Calcula los macros del alimento según la cantidad y unidad
   */
  calculateMacros(food, quantity, unit) {
    let factor = quantity;
    let normUnit = (unit || "").toLowerCase();

    // Caso de gramos / ml:
    if (normUnit === "g" || normUnit === "gr" || normUnit === "gramos" || normUnit === "ml") {
      if (food.unitGrams && food.unitGrams > 0) {
        factor = quantity / food.unitGrams;
      } else {
        factor = quantity / 100;
      }
    } else if (quantity === 1 && (normUnit.includes("medio") || normUnit.includes("media"))) {
      factor = 0.5;
    }

    return {
      calories: Math.round(food.calories * factor * 10) / 10,
      protein: Math.round(food.protein * factor * 10) / 10,
      fats: Math.round(food.fats * factor * 10) / 10,
      carbs: Math.round(food.carbs * factor * 10) / 10,
      factor: factor
    };
  }

  /**
   * Procesa un texto completo ingresado por el usuario y devuelve la lista de items
   */
  parseInput(rawText) {
    let chunks = this.splitIntoItems(rawText);
    let parsedItems = [];

    for (let chunk of chunks) {
      let { raw, quantity, unit, searchTerm, parenContent } = this.extractQuantityAndTerm(chunk);
      let match = this.findBestMatch(searchTerm, unit, parenContent);

      if (match) {
        let food = match.food;
        let macros = this.calculateMacros(food, quantity, unit);
        parsedItems.push({
          id: "item_" + Math.random().toString(36).substr(2, 9),
          raw: raw,
          foodId: food.id,
          foodName: food.name,
          quantity: quantity,
          unit: unit || food.defaultUnit || "unidad",
          calories: macros.calories,
          protein: macros.protein,
          fats: macros.fats,
          carbs: macros.carbs,
          isMatched: true,
          matchConfidence: match.score
        });
      } else {
        parsedItems.push({
          id: "item_" + Math.random().toString(36).substr(2, 9),
          raw: raw,
          foodId: null,
          foodName: raw,
          quantity: quantity,
          unit: unit || "unidad",
          calories: 0,
          protein: 0,
          fats: 0,
          carbs: 0,
          isMatched: false,
          matchConfidence: 0
        });
      }
    }

    // Totales agregados
    let totals = parsedItems.reduce(
      (acc, item) => {
        acc.calories += item.calories;
        acc.protein += item.protein;
        acc.fats += item.fats;
        acc.carbs += item.carbs;
        return acc;
      },
      { calories: 0, protein: 0, fats: 0, carbs: 0 }
    );

    totals.calories = Math.round(totals.calories);
    totals.protein = Math.round(totals.protein * 10) / 10;
    totals.fats = Math.round(totals.fats * 10) / 10;
    totals.carbs = Math.round(totals.carbs * 10) / 10;

    return {
      items: parsedItems,
      totals: totals,
      hasUnmatched: parsedItems.some(item => !item.isMatched)
    };
  }
}

// Exportar globalmente
if (typeof window !== "undefined") {
  window.NaturalFoodParser = NaturalFoodParser;
}
