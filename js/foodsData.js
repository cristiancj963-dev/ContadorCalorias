/**
 * Base de datos nutricional precargada con los alimentos reales del usuario
 * Extraída de su histórico de registro (registro_dieta.md).
 * Cada alimento contiene valores por porción estándar y por 100g/unidad.
 */
const DEFAULT_FOODS = [
  // --- DESAYUNOS Y LÁCTEOS ---
  {
    id: "leche_desnatada_vaso",
    name: "Leche desnatada (1 vaso)",
    aliases: ["leche desnatada", "vaso leche desnatada", "vaso de leche desnatada", "leche desnatada vaso", "leche desnatada 250ml"],
    category: "Lácteos",
    defaultUnit: "vaso",
    unitGrams: 250,
    calories: 85,
    protein: 8.5,
    fats: 0.5,
    carbs: 12.5,
    allowedUnits: ["vaso", "vasos", "ml", "g", "taza", "tazas"]
  },
  {
    id: "leche_semidesnatada_vaso",
    name: "Leche semidesnatada (1 vaso)",
    aliases: ["leche semidesnatada", "vaso leche semidesnatada", "leche semi", "vaso leche semi"],
    category: "Lácteos",
    defaultUnit: "vaso",
    unitGrams: 250,
    calories: 115,
    protein: 8.5,
    fats: 4.0,
    carbs: 12.0,
    allowedUnits: ["vaso", "vasos", "ml", "g", "taza", "tazas"]
  },
  {
    id: "nesquik_racion",
    name: "Nesquik (1 ración/cucharada)",
    aliases: ["nesquik", "cucharada nesquik", "cacao nesquik"],
    category: "Desayuno",
    defaultUnit: "cucharada",
    unitGrams: 15,
    calories: 55,
    protein: 0.5,
    fats: 0.5,
    carbs: 12.0,
    allowedUnits: ["cucharada", "cucharadas", "racion", "raciones", "g", "gr"]
  },
  {
    id: "leche_desnatada_nesquik",
    name: "Leche desnatada con Nesquik (1 vaso)",
    aliases: [
      "leche desnatada con nesquik", "leche con nesquik", "vaso leche desnatada con nesquik",
      "vaso de leche desnatada con nesquik", "vaso leche con nesquik", "leche desnatada nesquik"
    ],
    category: "Desayuno",
    defaultUnit: "vaso",
    unitGrams: 265,
    calories: 140,
    protein: 9.0,
    fats: 1.0,
    carbs: 24.5,
    allowedUnits: ["vaso", "vasos", "taza", "tazas"]
  },
  {
    id: "cereales_avena_punado",
    name: "Cereales de avena Hacendado/Lidl (1 puñado)",
    aliases: [
      "cereales de avena", "cereales avena", "avena hacendado", "cereales avena mercadona",
      "cereales avena lidl", "puñado avena", "puñados avena", "avena"
    ],
    category: "Cereales",
    defaultUnit: "puñado",
    unitGrams: 30,
    calories: 110,
    protein: 4.0,
    fats: 2.1,
    carbs: 18.0,
    allowedUnits: ["puñado", "puñados", "g", "gr", "gramos", "bol", "taza"]
  },
  {
    id: "cereales_estrella_punado",
    name: "Cereales de estrella / Crunchy (1 puñado)",
    aliases: [
      "cereales de estrella", "cereales estrella", "cereales crunchy",
      "puñado cereales estrella", "puñados cereales estrella", "estrellitas"
    ],
    category: "Cereales",
    defaultUnit: "puñado",
    unitGrams: 25,
    calories: 95,
    protein: 2.0,
    fats: 0.5,
    carbs: 20.0,
    allowedUnits: ["puñado", "puñados", "g", "gr", "gramos", "bol"]
  },
  {
    id: "queso_cottage_racion",
    name: "Queso cottage (ración ~30g)",
    aliases: ["queso cottage", "cottage", "queso cottage mercadona", "tarrina cottage"],
    category: "Lácteos",
    defaultUnit: "racion",
    unitGrams: 30,
    calories: 28,
    protein: 3.6,
    fats: 1.2,
    carbs: 0.8,
    allowedUnits: ["racion", "raciones", "cucharada", "cucharadas", "g", "gr", "gramos"]
  },
  {
    id: "queso_fresco_batido",
    name: "Queso fresco batido 0% (100g)",
    aliases: ["queso fresco batido", "queso batido 0%", "queso batido"],
    category: "Lácteos",
    defaultUnit: "g",
    unitGrams: 100,
    calories: 50,
    protein: 8.0,
    fats: 0.1,
    carbs: 3.5,
    allowedUnits: ["g", "gr", "gramos", "tarrina", "cucharada", "cucharadas"]
  },
  {
    id: "queso_light_loncha",
    name: "Queso light (1 loncha)",
    aliases: ["queso light", "loncha queso light", "loncha de queso light", "queso bajo en grasa"],
    category: "Lácteos",
    defaultUnit: "loncha",
    unitGrams: 20,
    calories: 50,
    protein: 5.0,
    fats: 3.0,
    carbs: 0.5,
    allowedUnits: ["loncha", "lonchas", "g", "gr", "rebanada"]
  },
  {
    id: "queso_fresco_porcion",
    name: "Queso fresco Hacendado (porción 50g)",
    aliases: ["queso fresco", "queso fresco hacendado", "queso de burgos"],
    category: "Lácteos",
    defaultUnit: "porcion",
    unitGrams: 50,
    calories: 75,
    protein: 6.0,
    fats: 4.5,
    carbs: 2.0,
    allowedUnits: ["porcion", "porciones", "trozo", "g", "gr", "loncha", "lonchas"]
  },
  {
    id: "yogur_griego",
    name: "Yogur griego natural (1 ud 125g)",
    aliases: ["yogur griego", "yogur griego natural", "griego"],
    category: "Lácteos",
    defaultUnit: "unidad",
    unitGrams: 125,
    calories: 125,
    protein: 5.0,
    fats: 9.0,
    carbs: 5.0,
    allowedUnits: ["unidad", "unidades", "ud", "uds", "tarrina", "g", "gr"]
  },
  {
    id: "kefir_vaso",
    name: "Kéfir natural (1 vaso 200ml)",
    aliases: ["kefir", "kefir natural", "vaso kefir"],
    category: "Lácteos",
    defaultUnit: "vaso",
    unitGrams: 200,
    calories: 110,
    protein: 7.0,
    fats: 5.0,
    carbs: 9.0,
    allowedUnits: ["vaso", "vasos", "ml", "g", "gr"]
  },
  {
    id: "miel_cucharada",
    name: "Miel (1 cucharada)",
    aliases: ["miel", "cucharada miel", "cucharada de miel", "chorro miel", "chorro de miel"],
    category: "Complementos",
    defaultUnit: "cucharada",
    unitGrams: 15,
    calories: 45,
    protein: 0.1,
    fats: 0.0,
    carbs: 12.0,
    allowedUnits: ["cucharada", "cucharadas", "chorro", "g", "gr", "gramos"]
  },
  {
    id: "mermelada_cucharada",
    name: "Mermelada fresa/melocotón (1 cucharada)",
    aliases: ["mermelada", "mermelada de fresa", "mermelada melocoton", "mermelada casera"],
    category: "Complementos",
    defaultUnit: "cucharada",
    unitGrams: 20,
    calories: 45,
    protein: 0.1,
    fats: 0.0,
    carbs: 11.0,
    allowedUnits: ["cucharada", "cucharadas", "g", "gr"]
  },
  {
    id: "mantequilla_porcion",
    name: "Mantequilla (porción 10g)",
    aliases: ["mantequilla", "mantequilla con mermelada"],
    category: "Complementos",
    defaultUnit: "porcion",
    unitGrams: 10,
    calories: 75,
    protein: 0.1,
    fats: 8.2,
    carbs: 0.1,
    allowedUnits: ["porcion", "porciones", "g", "gr", "cucharada"]
  },

  // --- PANES Y TOSTADAS ---
  {
    id: "pan_blanco_gramos",
    name: "Pan blanco (por gramos)",
    aliases: ["pan blanco", "pan", "chusco de pan", "chusco pan"],
    category: "Panes",
    defaultUnit: "g",
    unitGrams: 1,
    calories: 2.68,
    protein: 0.08,
    fats: 0.015,
    carbs: 0.54,
    allowedUnits: ["g", "gr", "gramos", "rebanada", "rebanadas", "trozo", "chusco"]
  },
  {
    id: "pan_molde_integral",
    name: "Pan de molde integral (1 rebanada)",
    aliases: ["pan de molde integral", "pan molde integral", "pan de molde", "pan integral"],
    category: "Panes",
    defaultUnit: "rebanada",
    unitGrams: 28,
    calories: 70,
    protein: 2.8,
    fats: 0.9,
    carbs: 12.0,
    allowedUnits: ["rebanada", "rebanadas", "loncha", "lonchas", "sandwich", "sandwiches", "g", "gr"]
  },
  {
    id: "pan_tostado_rebanada",
    name: "Pan tostado / Tostada (1 rebanada)",
    aliases: ["pan tostado", "tostada", "tostadas", "rebanada pan tostado"],
    category: "Panes",
    defaultUnit: "tostada",
    unitGrams: 15,
    calories: 60,
    protein: 1.8,
    fats: 0.6,
    carbs: 11.0,
    allowedUnits: ["tostada", "tostadas", "rebanada", "rebanadas", "g", "gr"]
  },
  {
    id: "tostada_cottage_miel",
    name: "Tostada con queso cottage y miel",
    aliases: ["tostada con queso cottage y miel", "tostada queso cottage miel", "tostada cottage miel", "tostadas con queso cottage y miel"],
    category: "Desayuno",
    defaultUnit: "tostada",
    unitGrams: 65,
    calories: 130,
    protein: 6.0,
    fats: 1.5,
    carbs: 23.0,
    allowedUnits: ["tostada", "tostadas", "unidad", "unidades"]
  },
  {
    id: "tostada_cottage_pavo",
    name: "Tostada con queso cottage y pavo",
    aliases: ["tostada con queso cottage y jamon de pavo", "tostada cottage pavo", "tostadas con queso cottage y pavo"],
    category: "Desayuno",
    defaultUnit: "tostada",
    unitGrams: 60,
    calories: 105,
    protein: 9.0,
    fats: 2.0,
    carbs: 12.0,
    allowedUnits: ["tostada", "tostadas", "unidad", "unidades"]
  },
  {
    id: "tostada_cottage_mermelada",
    name: "Tostada con queso cottage y mermelada",
    aliases: ["tostada con queso cottage y mermelada", "tostada cottage mermelada", "tostadas queso cottage mermelada"],
    category: "Desayuno",
    defaultUnit: "tostada",
    unitGrams: 65,
    calories: 130,
    protein: 5.5,
    fats: 1.5,
    carbs: 23.0,
    allowedUnits: ["tostada", "tostadas", "unidad", "unidades"]
  },
  {
    id: "pan_burger_bajo_grasa",
    name: "Pan de burger bajo en grasa",
    aliases: ["pan bajo en grasa", "pan de burger bajo en grasa", "pan burger", "pan de burger"],
    category: "Panes",
    defaultUnit: "unidad",
    unitGrams: 60,
    calories: 140,
    protein: 5.0,
    fats: 1.5,
    carbs: 26.0,
    allowedUnits: ["unidad", "unidades", "pan"]
  },

  // --- EMBUTIDOS Y PROTEÍNAS MAGRAS ---
  {
    id: "pavo_campofrio_loncha",
    name: "Jamón de pavo bajo en grasa Campofrío (1 loncha)",
    aliases: [
      "pavo bajo en grasa", "jamon de pavo", "pavo campofrio", "pavo",
      "lonchas de pavo", "lonchas de jamon de pavo", "pavo braseado", "loncha de pavo"
    ],
    category: "Carnes/Embutidos",
    defaultUnit: "loncha",
    unitGrams: 15,
    calories: 15,
    protein: 3.0,
    fats: 0.3,
    carbs: 0.3,
    allowedUnits: ["loncha", "lonchas", "g", "gr", "gramos"]
  },
  {
    id: "jamon_serrano_loncha",
    name: "Jamón serrano (1 loncha)",
    aliases: ["jamon serrano", "jamón serrano", "loncha jamon serrano", "lonchas jamon serrano", "jamon"],
    category: "Carnes/Embutidos",
    defaultUnit: "loncha",
    unitGrams: 15,
    calories: 35,
    protein: 4.5,
    fats: 1.8,
    carbs: 0.2,
    allowedUnits: ["loncha", "lonchas", "g", "gr"]
  },
  {
    id: "lomo_embuchado_loncha",
    name: "Lomo embuchado / lonchas de lomo (1 loncha)",
    aliases: ["lomo sin grasa", "lonchas de lomo", "lomo embuchado", "lonchas lomo"],
    category: "Carnes/Embutidos",
    defaultUnit: "loncha",
    unitGrams: 10,
    calories: 20,
    protein: 3.8,
    fats: 0.6,
    carbs: 0.1,
    allowedUnits: ["loncha", "lonchas", "g", "gr"]
  },
  {
    id: "chorizo_iberico_loncha",
    name: "Chorizo ibérico (1 loncha)",
    aliases: ["chorizo", "chorizo iberico", "lonchas de chorizo", "lonchas chorizo"],
    category: "Carnes/Embutidos",
    defaultUnit: "loncha",
    unitGrams: 10,
    calories: 42,
    protein: 2.2,
    fats: 3.6,
    carbs: 0.2,
    allowedUnits: ["loncha", "lonchas", "g", "gr"]
  },
  {
    id: "longaniza_pieza",
    name: "Longaniza (1 pieza ~70g)",
    aliases: ["longaniza", "pieza de longaniza"],
    category: "Carnes/Embutidos",
    defaultUnit: "unidad",
    unitGrams: 70,
    calories: 230,
    protein: 13.0,
    fats: 19.0,
    carbs: 1.0,
    allowedUnits: ["unidad", "unidades", "pieza", "piezas", "g", "gr"]
  },
  {
    id: "salchicha_pavo_pollo",
    name: "Salchicha de pavo/pollo (1 ud)",
    aliases: ["salchichas de pavo", "salchicha de pavo", "salchichas de pollo", "salchicha de pollo", "salchichas"],
    category: "Carnes/Embutidos",
    defaultUnit: "unidad",
    unitGrams: 35,
    calories: 55,
    protein: 5.5,
    fats: 3.5,
    carbs: 0.5,
    allowedUnits: ["unidad", "unidades", "ud", "uds", "salchicha", "salchichas"]
  },

  // --- HUEVOS Y PREPARACIONES ---
  {
    id: "huevo_entero",
    name: "Huevo entero (plancha / duro)",
    aliases: ["huevo", "huevo a la plancha", "huevo duro", "huevos", "huevo frito poco aceite"],
    category: "Huevos",
    defaultUnit: "unidad",
    unitGrams: 55,
    calories: 75,
    protein: 6.5,
    fats: 5.2,
    carbs: 0.5,
    allowedUnits: ["unidad", "unidades", "huevo", "huevos"]
  },
  {
    id: "huevo_frito",
    name: "Huevo frito (1 ud con aceite)",
    aliases: ["huevo frito", "huevos fritos", "par de huevos fritos"],
    category: "Huevos",
    defaultUnit: "unidad",
    unitGrams: 60,
    calories: 95,
    protein: 6.5,
    fats: 7.5,
    carbs: 0.5,
    allowedUnits: ["unidad", "unidades", "huevo", "huevos"]
  },
  {
    id: "clara_huevo",
    name: "Clara de huevo / Chorro de claras",
    aliases: ["clara de huevo", "claras de huevo", "chorro de claras", "chorro de claras de huevo", "claras"],
    category: "Huevos",
    defaultUnit: "unidad",
    unitGrams: 35,
    calories: 18,
    protein: 3.8,
    fats: 0.1,
    carbs: 0.2,
    allowedUnits: ["unidad", "unidades", "clara", "claras", "chorro", "chorros", "g", "gr", "ml"]
  },
  {
    id: "tortilla_francesa_2h",
    name: "Tortilla francesa (2 huevos)",
    aliases: ["tortilla francesa", "tortilla francesa 2 huevos", "tortilla francesa de 2 huevos"],
    category: "Huevos",
    defaultUnit: "unidad",
    unitGrams: 120,
    calories: 160,
    protein: 13.0,
    fats: 11.0,
    carbs: 1.0,
    allowedUnits: ["unidad", "unidades", "racion"]
  },
  {
    id: "pincho_tortilla_patata",
    name: "Pincho de tortilla de patata",
    aliases: ["pincho de tortilla", "pincho de tortilla de patata", "tortilla de patata", "tortilla patata"],
    category: "Platos",
    defaultUnit: "unidad",
    unitGrams: 150,
    calories: 230,
    protein: 8.0,
    fats: 12.0,
    carbs: 22.0,
    allowedUnits: ["unidad", "unidades", "pincho", "pinchos", "porcion", "trozo"]
  },

  // --- CARNES Y AVES ---
  {
    id: "pechuga_pollo_plancha",
    name: "Pechuga de pollo a la plancha (100g)",
    aliases: [
      "pechuga de pollo", "pechuga pollo", "filete pechuga de pollo", "filete pechuga pollo",
      "pollo a la plancha", "pechuga de pollo a la plancha", "pechugas a la plancha"
    ],
    category: "Carnes",
    defaultUnit: "g",
    unitGrams: 100,
    calories: 120,
    protein: 26.0,
    fats: 1.5,
    carbs: 0.0,
    allowedUnits: ["g", "gr", "gramos", "filete", "filetes", "pechuga", "pechugas"]
  },
  {
    id: "contramuslo_pollo",
    name: "Contramuslo de pollo (1 ud ~120g con piel)",
    aliases: [
      "contramuslo", "contramuslos", "contramuslo de pollo", "contramuslos de pollo",
      "contramuslo pollo", "contramuslos pollo"
    ],
    category: "Carnes",
    defaultUnit: "unidad",
    unitGrams: 120,
    calories: 210,
    protein: 24.0,
    fats: 12.5,
    carbs: 0.0,
    allowedUnits: ["unidad", "unidades", "contramuslo", "contramuslos", "g", "gr"]
  },
  {
    id: "hamburguesa_pollo_pavo",
    name: "Hamburguesa de pollo o pavo (1 ud ~100g)",
    aliases: ["hamburguesa de pollo", "hamburguesa pollo", "hamburguesa de pavo", "hamburguesa pavo", "burger de pollo", "burger de pavo", "burger pollo"],
    category: "Carnes",
    defaultUnit: "unidad",
    unitGrams: 100,
    calories: 135,
    protein: 20.0,
    fats: 5.5,
    carbs: 1.5,
    allowedUnits: ["unidad", "unidades", "burger", "burgers", "hamburguesa", "hamburguesas"]
  },
  {
    id: "filete_ternera",
    name: "Filete de ternera / Solomillo (100g)",
    aliases: ["filete de ternera", "filete ternera", "ternera", "solomillo de ternera", "solomillo ternera"],
    category: "Carnes",
    defaultUnit: "g",
    unitGrams: 100,
    calories: 130,
    protein: 24.0,
    fats: 3.8,
    carbs: 0.0,
    allowedUnits: ["g", "gr", "gramos", "filete", "filetes"]
  },
  {
    id: "albondigas_salsa",
    name: "Albóndigas con salsa jardinera (1 ud mediana)",
    aliases: ["albondiga", "albondigas", "albondigas con salsa", "albondigas salsa jardinera", "albóndigas"],
    category: "Platos",
    defaultUnit: "unidad",
    unitGrams: 40,
    calories: 75,
    protein: 5.0,
    fats: 4.5,
    carbs: 3.5,
    allowedUnits: ["unidad", "unidades", "albondiga", "albondigas"]
  },
  {
    id: "chuleta_ternasco",
    name: "Chuleta de ternasco / cordero (1 ud)",
    aliases: ["chuleta de ternasco", "chuletas de ternasco", "ternasco", "chuleta de cordero"],
    category: "Carnes",
    defaultUnit: "unidad",
    unitGrams: 70,
    calories: 180,
    protein: 13.0,
    fats: 14.0,
    carbs: 0.0,
    allowedUnits: ["unidad", "unidades", "chuleta", "chuletas"]
  },

  // --- PESCADOS Y MARISCOS ---
  {
    id: "bacalao_plancha",
    name: "Bacalao a la plancha (100g)",
    aliases: ["bacalao", "trozo bacalao", "trozos de bacalao", "trozo de bacalao", "filete de bacalao"],
    category: "Pescados",
    defaultUnit: "g",
    unitGrams: 100,
    calories: 85,
    protein: 18.0,
    fats: 0.7,
    carbs: 0.0,
    allowedUnits: ["g", "gr", "gramos", "trozo", "trozos", "filete", "filetes", "porcion"]
  },
  {
    id: "salmon_plancha",
    name: "Salmón a la plancha (100g)",
    aliases: ["salmon", "salmón", "filete de salmon", "trozo de salmon"],
    category: "Pescados",
    defaultUnit: "g",
    unitGrams: 100,
    calories: 200,
    protein: 20.0,
    fats: 13.0,
    carbs: 0.0,
    allowedUnits: ["g", "gr", "gramos", "filete", "filetes", "trozo"]
  },
  {
    id: "trucha_rodaballo",
    name: "Trucha / Rodaballo (1 filete ~150g)",
    aliases: ["trucha", "filete de trucha", "rodaballo", "filete de rodaballo"],
    category: "Pescados",
    defaultUnit: "filete",
    unitGrams: 150,
    calories: 170,
    protein: 28.0,
    fats: 6.0,
    carbs: 0.0,
    allowedUnits: ["filete", "filetes", "g", "gr", "unidad"]
  },
  {
    id: "atun_lata",
    name: "Atún en lata al natural (1 lata 55g)",
    aliases: ["atun", "atún", "lata de atun", "lata atun", "atun al natural"],
    category: "Pescados",
    defaultUnit: "lata",
    unitGrams: 55,
    calories: 55,
    protein: 13.0,
    fats: 0.5,
    carbs: 0.0,
    allowedUnits: ["lata", "latas", "unidad", "g", "gr"]
  },
  {
    id: "sardinas_aceite",
    name: "Sardinas en aceite (1 lata escurrida 65g)",
    aliases: ["sardinas", "sardinas en aceite", "lata de sardinas", "lata sardinas"],
    category: "Pescados",
    defaultUnit: "lata",
    unitGrams: 65,
    calories: 140,
    protein: 15.0,
    fats: 9.0,
    carbs: 0.0,
    allowedUnits: ["lata", "latas", "unidad", "g", "gr"]
  },
  {
    id: "palitos_cangrejo",
    name: "Palitos de cangrejo / Surimi (1 ud ~15g)",
    aliases: ["palitos de cangrejo", "palitos cangrejo", "surimi"],
    category: "Pescados",
    defaultUnit: "unidad",
    unitGrams: 15,
    calories: 15,
    protein: 1.5,
    fats: 0.2,
    carbs: 2.0,
    allowedUnits: ["unidad", "unidades", "palito", "palitos", "g", "gr", "racion"]
  },

  // --- GUARNICIONES, LEGUMBRES Y ARROZ ---
  {
    id: "patata_cocida",
    name: "Patata cocida (1 mediana ~200g)",
    aliases: ["patata cocida", "patatas cocidas", "patata", "patatas", "media patata cocida"],
    category: "Guarnición",
    defaultUnit: "unidad",
    unitGrams: 200,
    calories: 160,
    protein: 4.0,
    fats: 0.2,
    carbs: 36.0,
    allowedUnits: ["unidad", "unidades", "patata", "patatas", "porcion", "raciones", "racion", "g", "gr"]
  },
  {
    id: "arroz_blanco_cocido",
    name: "Arroz blanco cocido (ración ~150g)",
    aliases: ["arroz blanco", "arroz", "arroz cocido", "plato arroz blanco"],
    category: "Guarnición",
    defaultUnit: "racion",
    unitGrams: 150,
    calories: 195,
    protein: 4.0,
    fats: 0.5,
    carbs: 42.0,
    allowedUnits: ["racion", "raciones", "plato", "g", "gr"]
  },
  {
    id: "pasta_macarrones_cocidos",
    name: "Pasta / Macarrones cocidos (plato ~200g)",
    aliases: ["pasta", "macarrones", "plato de pasta", "ensalada de pasta", "pasta con tomate"],
    category: "Platos",
    defaultUnit: "plato",
    unitGrams: 200,
    calories: 280,
    protein: 10.0,
    fats: 1.6,
    carbs: 56.0,
    allowedUnits: ["plato", "platos", "racion", "raciones", "g", "gr"]
  },
  {
    id: "fideos_chinos_espaguetis",
    name: "Espaguetis chinos / Fideos orientales (plato ~200g cocido)",
    aliases: [
      "espaguetis chinos", "espaguetis chinos finos", "fideos chinos", "fideos chinos finos",
      "tallarines chinos", "pasta china", "noodles", "fideos de arroz"
    ],
    category: "Platos",
    defaultUnit: "plato",
    unitGrams: 200,
    calories: 270,
    protein: 6.0,
    fats: 1.5,
    carbs: 58.0,
    allowedUnits: ["plato", "platos", "racion", "raciones", "g", "gr"]
  },
  {
    id: "lentejas_plato",
    name: "Lentejas con verduras (1 plato ~250g)",
    aliases: ["lentejas", "plato de lentejas", "lentejas con chorizo", "media racion de lentejas"],
    category: "Legumbres",
    defaultUnit: "plato",
    unitGrams: 250,
    calories: 230,
    protein: 14.0,
    fats: 3.0,
    carbs: 36.0,
    allowedUnits: ["plato", "platos", "racion", "raciones", "media racion"]
  },
  {
    id: "garbanzos_plato",
    name: "Garbanzos cocidos (1 plato ~200g)",
    aliases: ["garbanzos", "plato de garbanzos", "garbanzos con arroz"],
    category: "Legumbres",
    defaultUnit: "plato",
    unitGrams: 200,
    calories: 240,
    protein: 13.0,
    fats: 4.0,
    carbs: 38.0,
    allowedUnits: ["plato", "platos", "racion", "raciones"]
  },
  {
    id: "alubias_blancas_plato",
    name: "Alubias / Judías blancas (1 plato ~200g)",
    aliases: ["alubias blancas", "judias blancas", "alubias", "judías blancas"],
    category: "Legumbres",
    defaultUnit: "plato",
    unitGrams: 200,
    calories: 220,
    protein: 14.0,
    fats: 1.5,
    carbs: 38.0,
    allowedUnits: ["plato", "platos", "racion", "raciones"]
  },
  {
    id: "acelgas_patatas",
    name: "Acelgas con patatas (1 plato)",
    aliases: ["acelgas con patatas", "acelgas con patata", "acelgas", "plato de acelgas"],
    category: "Verduras",
    defaultUnit: "plato",
    unitGrams: 250,
    calories: 140,
    protein: 4.0,
    fats: 1.0,
    carbs: 28.0,
    allowedUnits: ["plato", "platos", "racion", "raciones"]
  },
  {
    id: "ensalada_pepino_cebolla",
    name: "Ensalada de pepino y cebolla (con AOVE)",
    aliases: ["ensalada de pepino y cebolla", "ensalada pepino cebolla", "ensalada de pepino", "media ensalada de pepino y cebolla"],
    category: "Verduras",
    defaultUnit: "racion",
    unitGrams: 150,
    calories: 95,
    protein: 1.5,
    fats: 7.0,
    carbs: 6.0,
    allowedUnits: ["racion", "raciones", "plato", "ensalada", "media ensalada"]
  },
  {
    id: "burrito_pollo_avena",
    name: "Burrito / Taco de pollo fitness (1 ud)",
    aliases: ["burrito", "burrito de pollo", "burrito pollo", "taco", "tacos", "burritos"],
    category: "Platos",
    defaultUnit: "unidad",
    unitGrams: 200,
    calories: 310,
    protein: 26.0,
    fats: 8.0,
    carbs: 32.0,
    allowedUnits: ["unidad", "unidades", "burrito", "burritos", "taco", "tacos"]
  },

  // --- FRUTAS Y SNACKS ---
  {
    id: "sandia_rodaja",
    name: "Sandía (1 rodaja ~300g)",
    aliases: ["sandia", "sandía", "rodaja de sandia", "rodajas de sandia", "trozo de sandia", "trozo sandia"],
    category: "Frutas",
    defaultUnit: "rodaja",
    unitGrams: 300,
    calories: 90,
    protein: 1.8,
    fats: 0.5,
    carbs: 21.0,
    allowedUnits: ["rodaja", "rodajas", "trozo", "trozos", "g", "gr", "gramos"]
  },
  {
    id: "platano_unidad",
    name: "Plátano (1 unidad ~100g)",
    aliases: ["platano", "plátano", "1 platano"],
    category: "Frutas",
    defaultUnit: "unidad",
    unitGrams: 100,
    calories: 90,
    protein: 1.1,
    fats: 0.3,
    carbs: 22.0,
    allowedUnits: ["unidad", "unidades", "platano", "platanos", "g", "gr"]
  },
  {
    id: "melocoton_unidad",
    name: "Melocotón (1 unidad ~150g)",
    aliases: ["melocoton", "melocotón"],
    category: "Frutas",
    defaultUnit: "unidad",
    unitGrams: 150,
    calories: 60,
    protein: 1.2,
    fats: 0.3,
    carbs: 14.0,
    allowedUnits: ["unidad", "unidades"]
  },
  {
    id: "higos_unidad",
    name: "Higos frescos (1 ud ~40g)",
    aliases: ["higo", "higos", "higos frescos"],
    category: "Frutas",
    defaultUnit: "unidad",
    unitGrams: 40,
    calories: 30,
    protein: 0.3,
    fats: 0.1,
    carbs: 7.5,
    allowedUnits: ["unidad", "unidades", "higo", "higos"]
  },
  {
    id: "horchata_vaso",
    name: "Horchata de chufa (1 vaso 250ml)",
    aliases: ["horchata", "vaso de horchata", "vaso horchata", "medio vaso de horchata"],
    category: "Bebidas",
    defaultUnit: "vaso",
    unitGrams: 250,
    calories: 175,
    protein: 1.5,
    fats: 6.0,
    carbs: 29.0,
    allowedUnits: ["vaso", "vasos", "ml", "medio vaso"]
  },
  {
    id: "cafe_cortado",
    name: "Café cortado",
    aliases: ["cortado", "cafe cortado", "café cortado"],
    category: "Bebidas",
    defaultUnit: "taza",
    unitGrams: 60,
    calories: 30,
    protein: 1.5,
    fats: 1.0,
    carbs: 3.5,
    allowedUnits: ["taza", "tazas", "cortado", "cortados", "unidad"]
  },
  {
    id: "coca_cola_lata",
    name: "Coca-Cola (1 lata 330ml)",
    aliases: ["coca cola", "coca-cola", "coca cola lata", "lata coca cola"],
    category: "Bebidas",
    defaultUnit: "lata",
    unitGrams: 330,
    calories: 140,
    protein: 0.0,
    fats: 0.0,
    carbs: 35.0,
    allowedUnits: ["lata", "latas", "ml", "unidad"]
  },
  {
    id: "gilda_anchoa",
    name: "Gilda de anchoa y piparra",
    aliases: ["gilda", "gildas", "gilda de anchoa"],
    category: "Aperitivos",
    defaultUnit: "unidad",
    unitGrams: 20,
    calories: 35,
    protein: 1.5,
    fats: 2.8,
    carbs: 0.5,
    allowedUnits: ["unidad", "unidades", "gilda", "gildas"]
  },
  {
    id: "guindillas_piparras",
    name: "Guindillas / Piparras (ración ~30g)",
    aliases: ["guindilla", "guindillas", "piparra", "piparras"],
    category: "Aperitivos",
    defaultUnit: "racion",
    unitGrams: 30,
    calories: 15,
    protein: 0.6,
    fats: 0.2,
    carbs: 2.5,
    allowedUnits: ["racion", "raciones", "unidad", "unidades", "g", "gr"]
  },
  {
    id: "sushi_pieza",
    name: "Sushi variado (1 pieza)",
    aliases: ["sushi", "pieza de sushi", "piezas de sushi", "nigiri", "maki"],
    category: "Platos",
    defaultUnit: "pieza",
    unitGrams: 30,
    calories: 45,
    protein: 2.5,
    fats: 0.8,
    carbs: 7.0,
    allowedUnits: ["pieza", "piezas", "unidad", "unidades"]
  },
  {
    id: "natillas_unidad",
    name: "Natillas (1 ud ~125g)",
    aliases: ["natilla", "natillas", "natillas de chocolate"],
    category: "Postres",
    defaultUnit: "unidad",
    unitGrams: 125,
    calories: 140,
    protein: 3.5,
    fats: 3.5,
    carbs: 24.0,
    allowedUnits: ["unidad", "unidades", "tarrina"]
  },
  {
    id: "flan_huevo",
    name: "Flan de huevo (1 ud ~100g)",
    aliases: ["flan", "flan de huevo"],
    category: "Postres",
    defaultUnit: "unidad",
    unitGrams: 100,
    calories: 130,
    protein: 4.0,
    fats: 3.5,
    carbs: 21.0,
    allowedUnits: ["unidad", "unidades"]
  }
];

// Plantillas / Combos favoritos del usuario
const DEFAULT_COMBOS = [
  {
    id: "combo_desayuno_habitual",
    name: "Desayuno habitual Avena + Nesquik",
    mealType: "desayuno",
    items: [
      { foodId: "leche_desnatada_nesquik", quantity: 1, unit: "vaso" },
      { foodId: "cereales_avena_punado", quantity: 3, unit: "puñado" },
      { foodId: "tostada_cottage_miel", quantity: 2, unit: "tostada" }
    ]
  },
  {
    id: "combo_desayuno_estrellas",
    name: "Desayuno Cereales Estrella + Claras",
    mealType: "desayuno",
    items: [
      { foodId: "leche_desnatada_nesquik", quantity: 1, unit: "vaso" },
      { foodId: "cereales_estrella_punado", quantity: 3, unit: "puñado" },
      { foodId: "clara_huevo", quantity: 2, unit: "unidad" },
      { foodId: "tostada_cottage_pavo", quantity: 2, unit: "tostada" }
    ]
  },
  {
    id: "combo_merienda_proteica",
    name: "Merienda Pavo + Plátano + Horchata",
    mealType: "merienda",
    items: [
      { foodId: "platano_unidad", quantity: 1, unit: "unidad" },
      { foodId: "pavo_campofrio_loncha", quantity: 4, unit: "loncha" },
      { foodId: "horchata_vaso", quantity: 1, unit: "vaso" }
    ]
  }
];

// Metas predeterminadas (recomposición corporal del usuario)
const DEFAULT_SETTINGS = {
  dailyCalories: 2750,
  minCalories: 2750,
  maxCalories: 2800,
  protein: 155,
  minProtein: 150,
  maxProtein: 160,
  fats: 78,
  minFats: 75,
  maxFats: 80,
  carbs: 350,
  minCarbs: 340,
  maxCarbs: 360,
  currentWeight: 69.6,
  googleScriptUrl: "",
  theme: "dark"
};

// Exportar globalmente si está en navegador
if (typeof window !== "undefined") {
  window.DEFAULT_FOODS = DEFAULT_FOODS;
  window.DEFAULT_COMBOS = DEFAULT_COMBOS;
  window.DEFAULT_SETTINGS = DEFAULT_SETTINGS;
}
