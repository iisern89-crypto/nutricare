// Base de dades clínica oficial HUMT (extreta de Càlcul nutrició_.xlsx, Guia Nutricions Enterals HUMT i Manual de Dietes Hospitalàries HUMT)

window.HUMT_DATA = {
  // 1. Fórmules Enterals (Les 8 fórmules de l'Excel Càlcul nutrició_.xlsx - sense Fresubin HP Energy, Glucerna 1.2 ni Nepro LP)
  enteralFormulas: [
    {
      id: "osmolite",
      category: "FÒRMULA NORMOCALÒRICA NORMOPROTEICA",
      name: "Osmolite® 500ml",
      presentation: "Flascó 500 ml",
      volumeBottle: 500,
      kcalPerMl: 1.0,
      per100ml: {
        kcal: 100,
        protein: 4.0,
        nitrogen: 0.64,
        carbs: 13.56,
        sugars: 0.6,
        lipids: 3.36,
        fiber: 0,
        na_mEq: 3.83,
        k_mEq: 3.8
      },
      fiberLabel: "NO",
      osmolarity: 319,
      route: "Oral i sonda",
      indication: "Dieta enteral estàndard normocalòrica i normoproteica sense fibra.",
      tags: ["estàndard", "normocalòrica", "normoproteica", "sense fibra"]
    },
    {
      id: "promote",
      category: "FÓRMULA HIPERPROTEICA NORMOCALÒRICA",
      name: "Promote® 500ml",
      presentation: "Flascó 500 ml",
      volumeBottle: 500,
      kcalPerMl: 1.0,
      per100ml: {
        kcal: 100,
        protein: 6.26,
        nitrogen: 1.0016,
        carbs: 13.0,
        sugars: 1.286,
        lipids: 4.92,
        fiber: 0,
        na_mEq: 4.0,
        k_mEq: 5.14
      },
      fiberLabel: "NO",
      osmolarity: 269,
      route: "Oral i sonda",
      indication: "Pacients amb requeriments proteics augmentats sense necessitat d'alt aport calòric.",
      tags: ["hiperproteica", "normocalòrica", "sense fibra", "uci"]
    },
    {
      id: "jevity_rth",
      category: "FÓRMULA NORMOCALÒRICA NORMOPROTEICA AMB FIBRA",
      name: "Jevity RTH® 500ml",
      presentation: "Flascó 500 ml",
      volumeBottle: 500,
      kcalPerMl: 1.07,
      per100ml: {
        kcal: 107,
        protein: 4.0,
        nitrogen: 0.64,
        carbs: 14.05,
        sugars: 0,
        lipids: 3.46,
        fiber: 1.76,
        na_mEq: 4.04,
        k_mEq: 4.04
      },
      fiberLabel: "SÍ (1,76 g/100ml)",
      osmolarity: 249,
      route: "Principalment per sonda",
      indication: "Nutrició enteral de mitjana-llarga duració en pacients amb alteració del ritme gastrointestinal.",
      tags: ["estàndard", "normocalòrica", "normoproteica", "amb fibra"]
    },
    {
      id: "ensure_plus_advance_rth",
      category: "FÒRMULA HIPERCALÒRICA HIPERPROTEICA AMB FIBRA I CaHMB (b-hidroxi-b-metilbutirato de calcio)",
      name: "Ensure Plus Advance RTH® 500ml",
      presentation: "Flascó 500 ml",
      volumeBottle: 500,
      kcalPerMl: 1.5,
      per100ml: {
        kcal: 150,
        protein: 8.0,
        nitrogen: 1.28,
        carbs: 17.7,
        sugars: 1.31,
        lipids: 4.84,
        fiber: 1.4,
        na_mEq: 4.1,
        k_mEq: 6.0
      },
      fiberLabel: "SÍ (1,4 g/100ml)",
      osmolarity: 432,
      route: "Principalment per sonda",
      indication: "Pacients crítics o amb desnutrició/sarcopènia amb requeriments energètics i proteics elevats o restricció hídrica (amb CaHMB).",
      tags: ["hipercalòrica", "hiperproteica", "amb fibra", "CaHMB", "uci"]
    },
    {
      id: "nutrison_low_sodium",
      category: "FÒRMULA NORMOPROTEICA NORMOCALÒRICA BAIXA EN SODI",
      name: "Nutrison Low Sodium® 1000ml",
      presentation: "Bossa 1000 ml",
      volumeBottle: 1000,
      kcalPerMl: 1.0,
      per100ml: {
        kcal: 100,
        protein: 4.0,
        nitrogen: 0.64,
        carbs: 12.3,
        sugars: 0.64,
        lipids: 3.9,
        fiber: 0,
        na_mEq: 1.08,
        k_mEq: 3.84
      },
      fiberLabel: "NO",
      osmolarity: 205,
      route: "Principalment per sonda",
      indication: "Pacients amb restricció de sodi o amb alteracions cardíaques i/o renals.",
      tags: ["baixa en sodi", "normocalòrica", "normoproteica", "cardíac", "renal"]
    },
    {
      id: "glucerna_1_5",
      category: "FÒRMULA HIPERCALÒRICA HIPERPROTEICA BAIXA EN HIDRATS",
      name: "Glucerna 1.5® 500ml",
      presentation: "Flascó 500 ml",
      volumeBottle: 500,
      kcalPerMl: 1.5,
      per100ml: {
        kcal: 150,
        protein: 7.5,
        nitrogen: 1.2,
        carbs: 17.7,
        sugars: 0,
        lipids: 7.5,
        fiber: 1.5,
        na_mEq: 4.0,
        k_mEq: 5.1
      },
      fiberLabel: "SÍ (1,5 g/100ml)",
      osmolarity: 671,
      route: "Oral i sonda",
      indication: "Pacients crítics o hospitalitzats amb diabetis o hiperglucèmia d'estrès i requeriments augmentats.",
      tags: ["diabètica", "hipercalòrica", "hiperproteica", "amb fibra", "uci"]
    },
    {
      id: "nutricomp_hepa",
      category: "FÒRMULA HIPERCALÒRICA NORMOPROTEICA PER INSUFICIÈNCIA HEPÀTICA",
      name: "Nutricomp Hepa® 500ml",
      presentation: "Bossa 500 ml (Sabor Xocolata)",
      volumeBottle: 500,
      kcalPerMl: 1.3,
      per100ml: {
        kcal: 130,
        protein: 4.0,
        nitrogen: 0.64,
        carbs: 15.5,
        sugars: 0,
        lipids: 5.8,
        fiber: 0.56,
        na_mEq: 3.96,
        k_mEq: 4.0
      },
      fiberLabel: "SÍ (0,56 g/100ml)",
      osmolarity: 395,
      route: "Oral i sonda (Ús UCI)",
      indication: "Pacients amb reagudització de malaltia hepàtica / encefalopatia hepàtica (rica en AA ramificats).",
      tags: ["hepàtica", "hipercalòrica", "normoproteica", "uci"]
    },
    {
      id: "elemental_028",
      category: "FÒRMULA ELEMENTL HIPOCALÒRICA HIPOPROTEICA",
      name: "Elemental 028® 250ml",
      presentation: "Flascó 250 ml (Sabor Taronja)",
      volumeBottle: 250,
      kcalPerMl: 0.86,
      per100ml: {
        kcal: 86,
        protein: 2.52,
        nitrogen: 0.4,
        carbs: 11.08,
        sugars: 4.68,
        lipids: 3.52,
        fiber: 0,
        na_mEq: 2.72,
        k_mEq: 2.4
      },
      fiberLabel: "NO",
      osmolarity: 243,
      route: "Oral / Sonda",
      indication: "Pacients amb problemes greus de malabsorció o malaltia inflamatòria intestinal.",
      tags: ["elemental", "malabsorció", "digestiu"]
    }
  ],

  // 2. Suplements Nutricionals Orals i Mòduls
  supplementsAndModules: [
    {
      id: "ensure_plus_advance_200",
      type: "suplement",
      category: "SUPLEMENT HIPERPROTEIC I HIPERCALÒRIC AMB CaHMB",
      name: "Ensure Plus Advance® 200ml",
      unitLabel: "flascó (200 ml)",
      unitVolumeMl: 200,
      perUnit: {
        kcal: 300,
        protein: 20.0,
        nitrogen: 3.2,
        carbs: 36.3,
        lipids: 10.56,
        fiber: 3.8
      },
      per100: {
        kcal: 150,
        protein: 10.0,
        nitrogen: 1.6,
        carbs: 18.15,
        lipids: 5.28,
        fiber: 1.9
      },
      osmolarity: 672,
      indication: "Suplement hiperproteic i hipercalòric amb CaHMB i Vitamina D per a pacients amb desnutrició, sarcopènia o recuperació post-UCI.",
      tags: ["hiperproteic", "hipercalòric", "CaHMB", "planta"]
    },
    {
      id: "glucerna_advance_1_6_200",
      type: "suplement",
      category: "SUPLEMENT NUTRICIONAL HIPERPROTEIC I HIPERCALÒRIC AMB FIBRA I Ca HMB PER PACIENT DIABÈTIC",
      name: "Glucerna Advance 1.6® 200ml",
      unitLabel: "flascó (200 ml)",
      unitVolumeMl: 200,
      perUnit: {
        kcal: 320,
        protein: 16.6,
        nitrogen: 2.6,
        carbs: 25.5,
        lipids: 16.5,
        fiber: 3.8
      },
      per100: {
        kcal: 160,
        protein: 8.3,
        nitrogen: 1.3,
        carbs: 12.75,
        lipids: 8.25,
        fiber: 1.9
      },
      osmolarity: 704,
      indication: "Suplement hiperproteic i hipercalòric amb fibra i CaHMB específic per a pacients diabètics o amb hiperglucèmia.",
      tags: ["diabètic", "hiperproteic", "hipercalòric", "CaHMB"]
    },
    {
      id: "vital_peptido_1_5_200",
      type: "suplement",
      category: "SUPLEMENT HIPERPROTEIC I HIPERCALÒRIC AMB ALT CONTINGUT DE PROTEINES HIDROLITZADES",
      name: "Vital Peptido 1.5® 200ml",
      unitLabel: "flascó (200 ml)",
      unitVolumeMl: 200,
      perUnit: {
        kcal: 300,
        protein: 13.6,
        nitrogen: 2.18,
        carbs: 36.8,
        lipids: 11.0,
        fiber: 0
      },
      per100: {
        kcal: 150,
        protein: 6.8,
        nitrogen: 1.09,
        carbs: 18.4,
        lipids: 5.5,
        fiber: 0
      },
      osmolarity: 487,
      indication: "Suplement peptídic (proteïnes hidrolitzades i MCT) per a pacients amb malabsorció, intolerància GI o post-UCI.",
      tags: ["peptídic", "malabsorció", "hiperproteic", "sense fibra"]
    },
    {
      id: "atempero_200",
      type: "suplement",
      category: "SUPLEMENT HIPERPROTEIC HIPERCALÒRIC AMB FIBRA I ENRIQUIDA AMB INMUNONUTRIENTS",
      name: "Atémpero® 200ml",
      unitLabel: "flascó (200 ml)",
      unitVolumeMl: 200,
      perUnit: {
        kcal: 300,
        protein: 16.6,
        nitrogen: 2.65,
        carbs: 34.6,
        lipids: 3.4,
        fiber: 10.0
      },
      per100: {
        kcal: 150,
        protein: 8.3,
        nitrogen: 1.325,
        carbs: 17.3,
        lipids: 1.7,
        fiber: 5.0
      },
      osmolarity: 366,
      indication: "Suplement hiperproteic i hipercalòric amb fibra i immunonutrients per a pacients quirúrgics, oncològics o hipercatabòlics.",
      tags: ["immunonutrició", "hiperproteic", "amb fibra"]
    },
    {
      id: "fresubin_2kcal_creme",
      type: "suplement",
      category: "SUPLEMENT NUTRICIONAL HIPERPROTEIC I HIPERCALÒRIC DE TEXTURA CREMOSA",
      name: "Fresubin 2 Kcal creme® 125g",
      unitLabel: "terrina (125 g)",
      unitVolumeMl: 100,
      perUnit: {
        kcal: 250,
        protein: 12.5,
        nitrogen: 1.9,
        carbs: 28.0,
        lipids: 9.75,
        fiber: 0
      },
      per100: {
        kcal: 200,
        protein: 10.0,
        nitrogen: 1.52,
        carbs: 22.4,
        lipids: 7.8,
        fiber: 0
      },
      osmolarity: null,
      indication: "Pacients no diabètics amb dèficits proteics i calòrics que presenten DISFÀGIA (textura cremosa tipus púding).",
      tags: ["disfàgia", "cremós", "hiperproteic", "hipercalòric"]
    },
    {
      id: "fresubin_protein_energy_200",
      type: "suplement",
      category: "SUPLEMENT NUTRICIONAL HIPERPROTEIC I HIPERCALÒRIC",
      name: "Fresubin protein energy® 200ml",
      unitLabel: "flascó (200 ml)",
      unitVolumeMl: 200,
      perUnit: {
        kcal: 300,
        protein: 20.0,
        nitrogen: 3.2,
        carbs: 24.2,
        lipids: 13.4,
        fiber: 1.0
      },
      per100: {
        kcal: 150,
        protein: 10.0,
        nitrogen: 1.6,
        carbs: 12.1,
        lipids: 6.7,
        fiber: 0.5
      },
      osmolarity: 380,
      indication: "Suplement oral en pacients amb dèficits proteics importants (Vainilla, xocolata, maduixa).",
      tags: ["hiperproteic", "hipercalòric"]
    },
    {
      id: "diben_200",
      type: "suplement",
      category: "SUPLEMENT HIPERPROTEIC I HIPERCALÒRIC AMB FIBRA PER PACIENT DIABÈTIC",
      name: "Diben® 200ml",
      unitLabel: "flascó (200 ml)",
      unitVolumeMl: 200,
      perUnit: {
        kcal: 300,
        protein: 15.0,
        nitrogen: 2.4,
        carbs: 26.0,
        lipids: 14.0,
        fiber: 4.0
      },
      per100: {
        kcal: 150,
        protein: 7.5,
        nitrogen: 1.2,
        carbs: 13.0,
        lipids: 7.0,
        fiber: 2.0
      },
      osmolarity: 350,
      indication: "Suplement nutricional oral en pacients diabètics amb dèficits proteics i energètics.",
      tags: ["diabètic", "hiperproteic", "amb fibra"]
    },
    {
      id: "protifar_scoop",
      type: "modul",
      category: "MÒDUL DE PROTEÏNES EN POLS (proteïna llet de vaca)",
      name: "Protifar® (cullerada / cacito 2,5 g)",
      unitLabel: "cacito (2,5 g)",
      unitVolumeMl: 0,
      perUnit: {
        kcal: 9.2,
        protein: 2.2,
        nitrogen: 0.352,
        carbs: 0.04,
        lipids: 0.05,
        fiber: 0
      },
      per100: {
        kcal: 380,
        protein: 89.0,
        nitrogen: 14.24,
        carbs: 1.5,
        lipids: 2.0,
        fiber: 0
      },
      osmolarity: null,
      indication: "Mòdul de proteïnes en pols (oral o sonda) per incrementar l'aport proteic sense augmentar el volum.",
      tags: ["mòdul", "proteïnes", "pols"]
    },
    {
      id: "aceite_mct_10ml",
      type: "modul",
      category: "MÒDUL DE LÍPIDS DE TCM",
      name: "Aceite MCT® (dosi 10 ml)",
      unitLabel: "dosi 10 ml",
      unitVolumeMl: 10,
      perUnit: {
        kcal: 85.0,
        protein: 0,
        nitrogen: 0,
        carbs: 0,
        lipids: 9.5,
        fiber: 0
      },
      per100: {
        kcal: 850,
        protein: 0,
        nitrogen: 0,
        carbs: 0,
        lipids: 95.0,
        fiber: 0
      },
      osmolarity: null,
      indication: "Mòdul lipídic altament energètic (100% MCT) per malabsorció severa, quilotòrax o increment calòric per sonda/oral.",
      tags: ["mòdul", "lípids", "MCT"]
    },
    {
      id: "vitajoule_10g",
      type: "modul",
      category: "MÒDUL DE CARBOHIDRATS EN POLS (dextrinomaltosa)",
      name: "Vitajoule® (dosi 10 g)",
      unitLabel: "dosi 10 g (2 cullerades)",
      unitVolumeMl: 0,
      perUnit: {
        kcal: 38.0,
        protein: 0,
        nitrogen: 0,
        carbs: 9.5,
        lipids: 0,
        fiber: 0
      },
      per100: {
        kcal: 380,
        protein: 0,
        nitrogen: 0,
        carbs: 95.0,
        lipids: 0,
        fiber: 0
      },
      osmolarity: null,
      indication: "Mòdul de carbohidrats en pols (dextrinomaltosa) en requeriments energètics augmentats. Precaució en diabètics.",
      tags: ["mòdul", "carbohidrats", "pols"]
    }
  ],

  // 3. Les 61 Dietes Hospitalàries HUMT
  hospitalDiets: [
    { name: "BASAL", group: "Grup 1 · Dietes Generals", kcal: 1960.0, protein: 87.0, lipids: 77.0, carbs: 217.0, fiber: 30.0, na_mg: 1262, k_mg: 4877, indication: "Pacients que pel seu estat no precisin d'una dieta terapèutica.", menu: "Esmorzar: 200cc llet semi + sucre + 40g pa + margarina i melmelada. Dinar/Sopar: 200g verdura + patata/arròs/pasta/llegum + 120g carn o 130g peix o 2 ous + fruita/làctic + 40g pa." },
    { name: "BASAL SENSE SAL (HIPOSÓDICA)", group: "Grup 1 · Dietes Generals", kcal: 1910.0, protein: 83.0, lipids: 62.0, carbs: 240.0, fiber: 30.0, na_mg: 627, k_mg: 4936, indication: "Hipertensió arterial, insuficiència cardíaca, edemes o patologies que requereixin restricció de sodi.", menu: "Igual que la dieta basal però elaborada sense sal afegida, amb pa sense sal i excloent formatges curats, embotits i conserves." },
    { name: "HIPERPROTEICA HIPERCALÒRICA", group: "Grup 1 · Dietes Generals", kcal: 2450.0, protein: 155.4, lipids: 110.0, carbs: 202.0, fiber: 39.4, na_mg: 1993, k_mg: 4288, indication: "Pacients amb desnutrició o risc de desnutrició i fase de recuperació post-UCI amb deglució conservada.", menu: "Esmorzar: Llet + pa + formatge/pernil cuit + iogurt. Dinar: Verdura amb 175g patata/120g arròs + 200g carn/210g peix + fruita + iogurt + pa. Sopar: Verdura + 120g carn/peix + fruita + iogurt + pa." },
    { name: "DIETA INGRÉS", group: "Grup 1 · Dietes Generals", kcal: 1426.0, protein: 77.6, lipids: 58.6, carbs: 146.8, fiber: 21.0, na_mg: 1252, k_mg: 2858, indication: "Dieta polivalent de fàcil digestió (baixa en greixos, sodi, fibra i sense sucres simples) a l'ingrés o transició.", menu: "Esmorzar: Llet semi + 40g pa de motlle + 40g formatge fresc. Dinar/Sopar: 250g puré patata/pastanaga o sopa + 120g carn/peix bullit + poma al forn/compota/iogurt desnatat." },
    { name: "MATERNAL", group: "Grup 1 · Dietes Generals", kcal: 1733.0, protein: 84.11, lipids: 63.0, carbs: 206.2, fiber: 13.6, na_mg: 1205, k_mg: 2831, indication: "Post-part, lactància materna o intervenció ginecològica (aportació extra de líquids).", menu: "Dieta equilibrada amb suplement de 200cc de suc o infusió a cada àpat." },
    { name: "DIETA OVOLACTOVEGETARIANA", group: "Grup 1 · Dietes Generals", kcal: 1607.0, protein: 56.06, lipids: 74.6, carbs: 178.0, fiber: 25.5, na_mg: 1422, k_mg: 2567, indication: "Pacients que no consumeixen ni carn ni peix.", menu: "Esmorzar amb pa integral. Dinar i sopar amb verdura, llegums/pasta/arròs, 2 ous + vegetals, fruita o làctic." },
    { name: "BASAL SENSE CARN NI PORC", group: "Grup 1 · Dietes Generals", kcal: 1660.0, protein: 82.6, lipids: 72.6, carbs: 169.0, fiber: 24.5, na_mg: 1368, k_mg: 3093, indication: "Pacients que per motius culturals/religiosos o personals no mengen carn ni derivats del porc.", menu: "Segons plats basats en peix (130g) o ous (2 u) amb guarnició vegetal." },
    { name: "LIQUIDA", group: "Grup 2 · Dietes Progressives", kcal: 300.0, protein: 10.0, lipids: 5.0, carbs: 50.0, fiber: 0.0, na_mg: 114, k_mg: 628, indication: "1a fase del postoperatori i inici d'alimentació oral post-dejú prolongat o post-nutrició artificial (màx 24h).", menu: "Esmorzar: 200cc suc de préssec. Dinar: 300cc brou. Sopar: 300cc brou." },
    { name: "LIQUIDA ASTRINGENT", group: "Grup 2 · Dietes Progressives", kcal: 48.0, protein: 3.0, lipids: 1.8, carbs: 4.8, fiber: 0.0, na_mg: 1090, k_mg: 90, indication: "Valorar tolerància oral inicial en cas de diarrees agudes.", menu: "Esmorzar, Dinar i Sopar: 200cc d'aigua d'arròs per presa." },
    { name: "SEMILIQUIDA", group: "Grup 2 · Dietes Progressives", kcal: 664.0, protein: 24.0, lipids: 1.0, carbs: 142.0, fiber: 6.0, na_mg: 215, k_mg: 1185, indication: "2a fase de progressió oral (posterior a líquida i anterior a tova). No cobreix requeriments (>24h requereix suplementació).", menu: "Esmorzar: 200cc llet semi + sucre + 15g torrades. Dinar i Sopar: 40g pasta en sopa + 150g poma al forn." },
    { name: "TOVA POST-OPERATORI", group: "Grup 2 · Dietes Progressives", kcal: 1071.0, protein: 100.0, lipids: 14.0, carbs: 126.0, fiber: 12.0, na_mg: 510, k_mg: 2583, indication: "3a fase de progressió oral, anterior a la dieta terapèutica o basal.", menu: "Esmorzar: Llet semi + 15g torrades + 40g formatge fresc. Dinar: Sopa + 250g pollastre bullit + poma al forn. Sopar: Sopa + 130g peix bullit + poma al forn." },
    { name: "DIABÈTICA 1000", group: "Grup 3 · Endocrinologia", kcal: 999.0, protein: 81.0, lipids: 25.8, carbs: 110.0, fiber: 24.4, na_mg: 815, k_mg: 3946, indication: "Pacients amb diabetis i sobrepès/obesitat (11 racions d'HC en 5 ingestes).", menu: "5 ingestes (Esmorzar, Dinar, Berenar, Sopar, Ressopó) sense sucres simples, controlat en HC." },
    { name: "DIABÈTICA 1500", group: "Grup 3 · Endocrinologia", kcal: 1472.0, protein: 92.3, lipids: 44.0, carbs: 178.0, fiber: 25.7, na_mg: 1396, k_mg: 4214, indication: "Pacients amb diabetis mellitus (18 racions d'HC repartides en 5 ingestes).", menu: "5 ingestes: Esmorzar (llet, 40g pa, pernil/formatge), Dinar/Sopar (verdura + 100g patata/30g pasta + 150g carn/130g peix + fruita + 40g pa), Berenar (iogurt), Ressopó (llet)." },
    { name: "DIABÈTICA 2200", group: "Grup 3 · Endocrinologia", kcal: 2122.0, protein: 110.0, lipids: 61.0, carbs: 273.0, fiber: 30.0, na_mg: 1407, k_mg: 5639, indication: "Pacients amb diabetis i requeriments energètics elevats (27 racions d'HC en 5 ingestes).", menu: "5 ingestes amb major aportació de farinacis (80g pa esmorzar, 200g patata o 60g pasta/arròs a dinar i sopar)." },
    { name: "DIABÈTICA CETOSIS (PGA I HIPOLIPÍDICA)", group: "Grup 3 · Endocrinologia", kcal: 1472.0, protein: 92.3, lipids: 44.0, carbs: 178.0, fiber: 25.7, na_mg: 1396, k_mg: 4214, indication: "Resolució de cetoacidosi diabètica per controlar índex glucèmic i ajustar insulina.", menu: "5 ingestes baixes en greix i de fàcil digestió sense sucres simples." },
    { name: "HIPOCALORICA 1200", group: "Grup 3 · Endocrinologia", kcal: 1286.0, protein: 79.0, lipids: 39.0, carbs: 145.0, fiber: 30.0, na_mg: 1062, k_mg: 3430, indication: "Pacients amb obesitat que requereixen restricció calòrica.", menu: "3 àpats amb verdura/amanida, carn magra/peix, fruita i 40g pa per àpat." },
    { name: "HIPOLIPIDICA", group: "Grup 3 · Endocrinologia", kcal: 1850.0, protein: 80.0, lipids: 60.0, carbs: 249.0, fiber: 30.0, na_mg: 1062, k_mg: 3400, indication: "Hipercolesterolèmies i dislipèmies en general (baixa en greixos saturats).", menu: "Làctics desnatats/semi, carns magres, peix, clares d'ou, verdura, fruita i oli d'oliva." },
    { name: "POBRE EN PURINES", group: "Grup 3 · Endocrinologia", kcal: 1887.0, protein: 68.0, lipids: 70.0, carbs: 242.0, fiber: 14.0, na_mg: 911, k_mg: 3352, indication: "Hiperuricèmia i gota.", menu: "Baix contingut en purines (exclou marisc, peix blau, vísceres i extractes de carn)." },
    { name: "QUILOTÒRAX", group: "Grup 3 · Endocrinologia", kcal: 1440.46, protein: 85.97, lipids: 13.5, carbs: 243.76, fiber: 23.17, na_mg: 597, k_mg: 3099, indication: "Presència de líquid limfàtic a la cavitat pleural (quilotòrax). Dieta estrictament exempta de greixos LCT (pot suplementar-se amb Oli MCT).", menu: "Esmorzar: Suc + torrades + melmelada. Dinar/Sopar: Pasta/arròs/patata/puré sense oli + carn blanca/peix blanc a la planxa sense oli + fruita + torrades." },
    { name: "ASTRINGENT", group: "Grup 4 · Digestiu", kcal: 1340.0, protein: 94.57, lipids: 56.65, carbs: 112.59, fiber: 9.88, na_mg: 730, k_mg: 2124, indication: "Enteropaties diarreiques agudes (pobra en fibra insoluble i sense lactosa).", menu: "Esmorzar: Infusió + torrades + pernil cuit. Dinar/Sopar: 60g arròs bullit/sèmola + carn blanca/peix blanc planxa + poma al forn/compota." },
    { name: "PROTECCIÓ BILIAR", group: "Grup 4 · Digestiu", kcal: 1900.0, protein: 89.0, lipids: 54.0, carbs: 271.0, fiber: 18.2, na_mg: 1104, k_mg: 3920, indication: "Colecistolitiasi, colecistitis, hepatitis, pancreatectomies i pancreatitis en fase de remissió.", menu: "Restricció de greixos i exempta de flatulents; es pot complementar amb oli MCT en cru." },
    { name: "HIPOPROTEICA", group: "Grup 4 · Digestiu", kcal: 1748.0, protein: 64.0, lipids: 61.0, carbs: 243.0, fiber: 16.0, na_mg: 891, k_mg: 3251, indication: "Hepatopaties cròniques amb encefalopatia que requereixen aportació proteica moderada (~60 g/dia).", menu: "Racions reduïdes de carn/peix (60g per àpat) amb normal aportació d'hidrats de carboni." },
    { name: "PROTECCIÓ GÀSTRICA", group: "Grup 4 · Digestiu", kcal: 1706.0, protein: 78.0, lipids: 72.0, carbs: 182.0, fiber: 20.0, na_mg: 469, k_mg: 3734, indication: "Gastritis, hèrnia de hiatus, ulcus gàstric.", menu: "Aliments de fàcil digestió exempts d'irritants de la mucosa gàstrica (sense cafè, cítrics, fregits ni flatulents)." },
    { name: "SEMILÍQUIDA PROTECCIÓ INTESTINAL", group: "Grup 4 · Digestiu", kcal: 664.0, protein: 24.0, lipids: 1.0, carbs: 142.0, fiber: 6.0, na_mg: 215, k_mg: 1185, indication: "2a fase del postoperatori intestinal (sense lactosa i baixa en fibra).", menu: "Esmorzar: Llet sense lactosa + 15g torrades. Dinar/Sopar: 40g pasta en sopa + 100g compota de poma." },
    { name: "TOVA PROTECCIÓ INTESTINAL", group: "Grup 4 · Digestiu", kcal: 1071.0, protein: 100.0, lipids: 14.0, carbs: 126.0, fiber: 6.0, na_mg: 510, k_mg: 2583, indication: "3a fase postoperatori cirurgia intestinal, reseccions de budell, ostomies (sense lactosa).", menu: "Esmorzar: Llet sense lactosa + torrades + pernil cuit. Dinar/Sopar: Sopa + pollastre/peix bullit + poma forn/compota." },
    { name: "PROTECCIÓ INTESTINAL", group: "Grup 4 · Digestiu", kcal: 1500.0, protein: 92.0, lipids: 67.0, carbs: 160.0, fiber: 12.0, na_mg: 420, k_mg: 2301, indication: "Malaltia inflamatòria intestinal (Crohn, Colitis ulcerosa), enteritis cròniques, ostomies amb diarrea.", menu: "Normocalòrica, baixa en residu i sense lactosa (arròs amb pastanaga/sèmola + pollastre/peix/vedella + poma forn)." },
    { name: "RICA EN ALBÚMINA", group: "Grup 4 · Digestiu", kcal: 1952.0, protein: 118.0, lipids: 99.0, carbs: 145.0, fiber: 15.0, na_mg: 809, k_mg: 3616, indication: "Hepatopaties cròniques amb hipoalbuminèmia i ascitis/edemes (hiposòdica i hiperproteica 1.5-2 g/kg).", menu: "Inclou aliments sense sal i suplementació amb clara d'ou dur a dinar i sopar." },
    { name: "RICA EN FIBRA", group: "Grup 4 · Digestiu", kcal: 1832.0, protein: 91.0, lipids: 80.0, carbs: 185.0, fiber: 34.0, na_mg: 1154, k_mg: 4214, indication: "Pacients amb restrenyiment (rica en fibra insoluble + 1.5-2L aigua/dia).", menu: "Pa integral, verdura i amanides, llegums i fruita natural amb pell." },
    { name: "GASTRECTOMIA LIQUIDA", group: "Grup 5 · Cirurgia", kcal: 768.6, protein: 54.0, lipids: 20.4, carbs: 92.0, fiber: 0.0, na_mg: 274, k_mg: 1044, indication: "1a fase postoperatori de resecció gàstrica total o subtotal (5 àpats de poc volum).", menu: "5 preses de 200cc (llet desnatada a esmorzar/berenar/ressopó; brou a dinar/sopar)." },
    { name: "GASTRECTOMIA SEMILIQUIDA", group: "Grup 5 · Cirurgia", kcal: 747.6, protein: 33.7, lipids: 3.43, carbs: 145.4, fiber: 13.0, na_mg: 334, k_mg: 1426, indication: "2a fase postoperatori de resecció gàstrica (5 àpats de poc volum).", menu: "Esmorzar: Llet desn + torrades. Dinar/Sopar: Sopa + poma al forn. Berenar/Ressopó: Iogurt desnatat." },
    { name: "GASTRECTOMIA TOVA", group: "Grup 5 · Cirurgia", kcal: 1571.7, protein: 87.8, lipids: 60.5, carbs: 168.9, fiber: 14.2, na_mg: 780, k_mg: 2328, indication: "3a fase postoperatori de resecció gàstrica (5 ingestes).", menu: "Incorpora 250g pollastre bullit al dinar i 130g peix bullit al sopar en 5 preses." },
    { name: "GASTRECTОМІА", group: "Grup 5 · Cirurgia", kcal: 1570.0, protein: 91.14, lipids: 54.5, carbs: 178.7, fiber: 19.13, na_mg: 1118, k_mg: 4277, indication: "Dieta definitiva post-gastrectomia total o subtotal (prevenció de síndrome de dumping; líquids fora dels àpats).", menu: "5 ingestes de poc volum, baixes en sucres simples (puré patata/pastanaga, pollastre/peix planxa, iogurts desnatats)." },
    { name: "BARIATRICA LIQUIDA", group: "Grup 5 · Cirurgia", kcal: 358.0, protein: 16.67, lipids: 3.78, carbs: 64.31, fiber: 2.0, na_mg: 1659, k_mg: 1394, indication: "1a fase post-cirurgia bariàtrica (Sleeve o Bypass).", menu: "5 ingestes de petit volum (100cc llet desnatada amb edulcorant; 200cc brou + gelatina sense sucre)." },
    { name: "BARIATRICA PASTOSA", group: "Grup 5 · Cirurgia", kcal: 745.4, protein: 56.87, lipids: 8.92, carbs: 109.23, fiber: 14.42, na_mg: 510, k_mg: 2563, indication: "2a fase post-cirurgia bariàtrica.", menu: "5 ingestes triturades (triturat de carn/peix i verdura 200g + compota 100cc + iogurts desnatats)." },
    { name: "LIQUIDA FREDA", group: "Grup 5 · Cirurgia", kcal: 594.0, protein: 13.8, lipids: 14.5, carbs: 102.0, fiber: 0.8, na_mg: 193, k_mg: 1206, indication: "Inici de tolerància oral en cirurgia maxil·lo-ORL (24h).", menu: "Suc de fruites i llet freda." },
    { name: "CIRURGIA RÀPIDA", group: "Grup 5 · Cirurgia", kcal: 322.0, protein: 14.5, lipids: 6.0, carbs: 52.7, fiber: 1.6, na_mg: 826, k_mg: 548, indication: "Inici de tolerància oral en cirurgia ràpida de genoll (1 àpat).", menu: "Entrepà de pernil país + 200cc suc + iogurt." },
    { name: "CIRURGIA RÀPIDA DE FÈMUR", group: "Grup 5 · Cirurgia", kcal: 387.0, protein: 89.0, lipids: 0.43, carbs: 6.0, fiber: 0.0, na_mg: 442, k_mg: 243, indication: "Inici de tolerància oral en cirurgia de fèmur i/o risc de disfàgia (1 àpat).", menu: "Iogurt desnatat + gelatina + 50cc aigua amb gas." },
    { name: "HAVA", group: "Grup 5 · Cirurgia", kcal: 1000.7, protein: 35.0, lipids: 31.5, carbs: 144.2, fiber: 1.8, na_mg: 611, k_mg: 2242, indication: "Intervenció d'amígdales o cordals (aliments líquids i pastosos freds no àcids).", menu: "Llet freda, suc de préssec/poma, gelatina i iogurt natural." },
    { name: "INSUFICIÈNCIA RENAL CRÒNICA", group: "Grup 6 · Nefrologia", kcal: 1629.0, protein: 46.0, lipids: 53.0, carbs: 234.0, fiber: 11.0, na_mg: 191, k_mg: 1359, indication: "Insuficiència renal aguda o crònica en prediàlisi / conservador (restringida en sodi, potassi i proteïnes ~50g/d).", menu: "Pa sense sal, verdures amb doble cocció i remull previ, 60g carn/peix per àpat." },
    { name: "INSUFICIÈNCIA RENAL DIÀLISI", group: "Grup 6 · Nefrologia", kcal: 1825.0, protein: 75.0, lipids: 59.0, carbs: 240.0, fiber: 10.0, na_mg: 371, k_mg: 1832, indication: "Pacients amb insuficiència renal en hemodiàlisi o TRRC (restringida en sodi, potassi i líquids ~500cc/d, amb major aport proteic).", menu: "Esmorzar amb iogurt (menys líquid que la llet), pa sense sal, verdures de doble cocció i 120-130g carn/peix per àpat." },
    { name: "BASAL FÀCIL MASTICACIÓ", group: "Grup 8 · Textura Modificada / Disfàgia", kcal: 1892.0, protein: 88.0, lipids: 70.0, carbs: 224.0, fiber: 12.0, na_mg: 1556, k_mg: 3363, indication: "Pacients amb dificultats mecàniques de masticació sense disfàgia orofaríngia.", menu: "Pa de motlle, carns toves i sucoses (mandonguilles, croquetes, cuixa de pollastre), peix, fruita tova o compota." },
    { name: "BASAL MAXILO-ORL", group: "Grup 8 · Textura Modificada / Disfàgia", kcal: 1826.0, protein: 84.0, lipids: 69.0, carbs: 214.0, fiber: 9.0, na_mg: 1154, k_mg: 3265, indication: "Post-intervenció maxil·lar i otorrino (aliments tous i pastosos, sense àcids ni torrades).", menu: "Sopes, purés, carns toves, peix, truita francesa, pa de motlle, compotes i flams." },
    { name: "BASAL PASTOSA", group: "Grup 8 · Textura Modificada / Disfàgia", kcal: 1848.0, protein: 76.0, lipids: 71.0, carbs: 210.0, fiber: 26.0, na_mg: 843, k_mg: 6020, indication: "Dificultats de deglució (Disfàgia): AVC, neurocrític, politraumatitzat, post-extubació o traqueostomia. Sense líquids ni dobles textures.", menu: "Esmorzar: 250cc papilla cereals + iogurt + 150cc gelatina. Dinar/Sopar: 250g puré verdura/patata + 250g triturat de carn/peix/ous + 150g compota/iogurt + 150cc gelatina." },
    { name: "BASAL TRITURADA", group: "Grup 8 · Textura Modificada / Disfàgia", kcal: 1850.0, protein: 73.0, lipids: 81.0, carbs: 206.0, fiber: 17.0, na_mg: 1156, k_mg: 3717, indication: "Problemes mecànics severs de masticació (manca de peces dentàries) però sense disfàgia a líquids.", menu: "Papilla de cereals, sopa de pasta, triturat de carn/peix amb verdures i compota/iogurt." },
    { name: "BASAL MIXTA", group: "Grup 8 · Textura Modificada / Disfàgia", kcal: 1800.0, protein: 86.0, lipids: 70.0, carbs: 188.0, fiber: 28.0, na_mg: 3318, k_mg: 3721, indication: "Problemes de masticació sense disfàgia (primers plats sencers tous i segons plats triturats).", menu: "Verdura amb patata/arròs/pasta + segon plat de carn/peix triturat + pa de motlle." },
    { name: "BASAL LOGOPEDA", group: "Grup 8 · Textura Modificada / Disfàgia", kcal: 1800.0, protein: 86.0, lipids: 70.0, carbs: 188.0, fiber: 28.0, na_mg: 3318, k_mg: 3721, indication: "Pacients neurològics (ictus, post-UCI) valorats per Logopèdia amb disfàgia (textura intermèdia sense líquids finits ni dobles textures; inclou aigua amb gas).", menu: "Esmorzar: Iogurt + pa de viena + formatge/pernil. Dinar/Sopar: Verdura amb patata o puré + carn tova/peix sense espines/ous + fruita tova/compota + aigua amb gas/gelatina." },
    { name: "BASAL TRITURADA ESMORZAR FAC MAS", group: "Grup 8 · Textura Modificada / Disfàgia", kcal: 1884.9, protein: 91.5, lipids: 79.3, carbs: 201.15, fiber: 12.17, na_mg: 574, k_mg: 2451, indication: "Dieta triturada a dinar i sopar però amb esmorzar de fàcil masticació (llet amb pa de motlle).", menu: "Esmorzar: Llet + pa de motlle + margarina/melmelada. Dinar/Sopar: Sopa + triturat de carn/peix + compota/iogurt." },
    { name: "PASTOSA FREDA", group: "Grup 8 · Textura Modificada / Disfàgia", kcal: 542.0, protein: 89.35, lipids: 3.5, carbs: 38.34, fiber: 2.6, na_mg: 142, k_mg: 420, indication: "Inici de dieta per valorar tolerància a la deglució en pacients amb disfàgia a líquids.", menu: "Esmorzar, Dinar i Sopar: 125g iogurt natural + 100g compota + 150cc gelatina (evita líquids i dobles textures)." },
    { name: "CATECOLAMINES", group: "Grup 9 · Proves i Tractaments", kcal: 1622.0, protein: 70.0, lipids: 70.0, carbs: 172.0, fiber: 7.0, na_mg: 994, k_mg: 2252, indication: "3 dies abans de determinació de catecolamines en orina.", menu: "Exclou vainilla, plàtan, cafè, te, xocolata, fruita seca i brioixeria." },
    { name: "IMAO", group: "Grup 9 · Proves i Tractaments", kcal: 2026.0, protein: 81.0, lipids: 38.0, carbs: 245.0, fiber: 12.0, na_mg: 1103, k_mg: 3558, indication: "Pacients en tractament amb antidepressius IMAO (exempta de tiramina).", menu: "Exclou formatges curats, fermentats, embotits fumats, conserves, xocolata." },
    { name: "NEUTROPEΝΙΑ", group: "Grup 9 · Proves i Tractaments", kcal: 1960.0, protein: 87.0, lipids: 77.0, carbs: 217.0, fiber: 30.0, na_mg: 1262, k_mg: 4877, indication: "Pacients immunodeprimits / hematològics en aïllament (baixa càrrega bacteriana).", menu: "Coccions completes (>65ºC), sense aliments crus, envàs individual pasteuritzat i aigua embotellada." },
    { name: "DIETA LITOTRICIA", group: "Grup 9 · Proves i Tractaments", kcal: 1540.0, protein: 80.0, lipids: 49.0, carbs: 193.0, fiber: 10.0, na_mg: 310, k_mg: 2115, indication: "2 dies abans de litotrícia (sense residus).", menu: "Infusions, torrades, arròs/sèmola, carn blanca/peix blanc planxa i compota." },
    { name: "PREPARACIÓ DE PROVES", group: "Grup 9 · Proves i Tractaments", kcal: 1691.0, protein: 85.6, lipids: 74.8, carbs: 168.8, fiber: 9.11, na_mg: 822, k_mg: 3051, indication: "3 dies abans de colonoscòpia o proves digestives (pobra en fibra).", menu: "Llet desnatada, torrades, puré patata/arròs, carn/peix planxa, iogurt/compota." },
    { name: "PREPARACIÓ HIFU I POST HIFU", group: "Grup 9 · Proves i Tractaments", kcal: 1233.0, protein: 72.0, lipids: 39.3, carbs: 145.6, fiber: 17.8, na_mg: 591, k_mg: 1858, indication: "1 setmana abans i en iniciar sòlids post-HIFU.", menu: "Sense làctics, sense gluten, sense verdura ni carn vermella." },
    { name: "POST HIFU LIQUIDA", group: "Grup 9 · Proves i Tractaments", kcal: 747.0, protein: 42.5, lipids: 24.5, carbs: 87.0, fiber: 6.7, na_mg: 21, k_mg: 716, indication: "3 primers dies post-HIFU.", menu: "Suc taronja natural colat, infusió, brou i aigua d'arròs." },
    { name: "PREPARACIÓ PROVES PET", group: "Grup 9 · Proves i Tractaments", kcal: 1152.0, protein: 135.85, lipids: 67.61, carbs: 0.27, fiber: 0.0, na_mg: 772, k_mg: 2180, indication: "3 dies abans d'exploració PET (exempta d'hidrats de carboni, hiperproteica).", menu: "Infusions sense sucre, pernil cuit, carn blanca i peix blanc a la planxa sense guarnició." },
    { name: "SENSE GLUTEN", group: "Grup 10 · Al·lèrgies i Intoleràncies", kcal: 1843.5, protein: 76.3, lipids: 76.3, carbs: 212.8, fiber: 16.4, na_mg: 333, k_mg: 2992, indication: "Malaltia celíaca o intolerància al gluten.", menu: "Pa i pasta sense gluten, protocol estricte sense contaminació creuada." },
    { name: "AL-LÈRGIA AL MARISC", group: "Grup 10 · Al·lèrgies i Intoleràncies", kcal: 1660.0, protein: 82.6, lipids: 70.0, carbs: 169.0, fiber: 24.0, na_mg: 1367, k_mg: 3093, indication: "Al·lèrgia al marisc.", menu: "Dieta basal exempta de marisc i derivats/traces." },
    { name: "AL-LERGIA A LES AUS", group: "Grup 10 · Al·lèrgies i Intoleràncies", kcal: 1610.0, protein: 56.0, lipids: 74.6, carbs: 178.0, fiber: 25.5, na_mg: 1420, k_mg: 2567, indication: "Al·lèrgia a les aus.", menu: "Dieta basal exempta de pollastre, gall dindi i altres aus." },
    { name: "INTOLERANCIA A LA LACTOSA", group: "Grup 10 · Al·lèrgies i Intoleràncies", kcal: 1654.0, protein: 73.0, lipids: 50.0, carbs: 227.0, fiber: 18.7, na_mg: 1012, k_mg: 3029, indication: "Intolerància a la lactosa.", menu: "Llet i derivats sense lactosa, evitant productes processats amb lactosa." },
    { name: "INTOLERANCIA A LA FRUCTOSA", group: "Grup 10 · Al·lèrgies i Intoleràncies", kcal: 1524.0, protein: 73.0, lipids: 52.4, carbs: 188.0, fiber: 14.3, na_mg: 1666, k_mg: 2776, indication: "Intolerància a la fructosa i/o sorbitol.", menu: "Exempta de fruites riques en fructosa, mel, melmelades amb fructosa i sucs comercials." }
  ],

  // 4. Protocol Clínic HUMT
  protocolGuides: [
    {
      id: "fases_uci",
      title: "Fases Metabòliques i Requeriments en UCI → Planta",
      items: [
        { label: "Fase Aguda Precoç (Dies 1-2 UCI)", detail: "Catabolisme intens. Objectiu progressiu: 15-20 kcal/kg/dia i 1.0-1.3 g proteïna/kg/dia. Comptabilitzar SEMPRE aports no nutricionals (Propofol, SG, Citrat)." },
        { label: "Fase d'Estabilització / Post-aguda (Dies 3-7 UCI)", detail: "Objectiu: 20-25 kcal/kg/dia i 1.3-1.5 g proteïna/kg/dia (fins a 1.8 g/kg en TRRC o politrauma). Calorimetria indirecta com a gold standard." },
        { label: "Fase Anabòlica / Recuperació i Seguiment a Planta", detail: "Resolució de la fase catabòlica. Objectiu: 25-30 kcal/kg/dia i 1.5-2.0 g proteïna/kg/dia per recuperar massa muscular." },
        { label: "Pes de Treball (Obesitat IMC > 30)", detail: "Si IMC ≤ 30 kg/m²: usar Pes Actual. Si IMC > 30 kg/m²: usar Pes Ajustat = Pes Ideal + 0.25 × (Pes Actual - Pes Ideal)." }
      ]
    },
    {
      id: "refeeding",
      title: "Síndrome de Realimentació (Refeeding Syndrome)",
      items: [
        { label: "Cribratge a l'ingrés", detail: "Monitoritzar Fosfat, Potassi i Magnesi a l'ingrés. Risc elevat si IMC < 18.5, pèrdua ponderal > 10% en 3-6 mesos, dejú > 5-7 dies o abús d'alcohol." },
        { label: "Profilaxi amb Tiamina i Ions", detail: "Si risc de refeeding: administrar Tiamina 300 mg IV abans d'iniciar nutrició + 100 mg/dia durant 5 dies. Suplementar fosfat, K i Mg segons nivells." },
        { label: "Pauta d'Aport Calòric Progressiu", detail: "Iniciar al 25% dels requeriments energètics (REE) el Dia 1 i incrementar progressivament fins al 100% al 4t dia (25% → 50% → 75% → 100%)." }
      ]
    },
    {
      id: "glicemia",
      title: "Control de Glicèmies i Límits Metabòlics",
      items: [
        { label: "Objectiu Glucèmic", detail: "Objectius iguals en pacient diabètic i no diabètic. Iniciar perfusió contínua (BIC) d'insulina si 2 determinacions > 160 mg/dL. Valorar associar insulina lenta basal." },
        { label: "Fiabilitat de la mostra", detail: "La glicèmia capil·lar NO és fiable en pacients en xoc, amb vasopressors o edematosos: utilitzar mostra vascular (arterial/venosa)." },
        { label: "Límits d'oxidació de Macronutrients", detail: "Glucosa màxima: 4-5 mg/kg/min. Lípids màxims: ≤ 1.5 g/kg/dia (monitoritzar triglicèrids < 400 mg/dL)." }
      ]
    },
    {
      id: "complicacions_gi",
      title: "Maneig de Complicacions Gastrointestinals (UCI)",
      items: [
        { label: "Gastroparesia (Alt residu gàstric)", detail: "Associar procinètics: Eritromicina + Metoclopramida (Primperan®) amb data de finalització pautada. Si persisteix intolerància, valorar sonda nasojejunal (SNJ) o NP complementària." },
        { label: "Restrenyiment", detail: "Absència de deposició en 3 dies (o 5 dies si NE incompleta). Assegurar aportació d'aigua lliure amb Movicol®. Valorar Prucaloprida. Si secundari a opiacis: Metilnaltrexona o Naloxegol. Fer tacte rectal abans d'enema." },
        { label: "Diarrea associada a NE", detail: "Descartar C. difficile i medicació hiperosmolar. Valorar fórmules amb fibra soluble (Jevity RTH®) o peptídiques (Vital Peptido®)." }
      ]
    }
  ]
};
