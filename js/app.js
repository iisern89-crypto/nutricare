// NutriCare — Navegació per Pantalles Pas a Pas
// Pantalla 1: Valoració a l'Ingrés (1r dia, després ja queda guardada)
// Pantalla 2: Objectius Nutricionals per a cada dia de valoració
// Pantalla 3: Aports Calòrics No Nutricionals (velocitat ml/h × hores o volum 24h)
// Pantalla 4: Valorar Ingesta Oral (± Suplements)
// Pantalla 5: Valorar Nutrició Enteral (NE)
// Pantalla 6: Valorar Nutrició Parenteral (NP)
// Pantalla 7: Monitorització Tolerància GI i Metabòlica (UCR, Balanç N, IRI, analítica setmanal)
// Pantalla 8: Balanç Final del Dia i Nota SAP

(function () {
  const STORAGE_KEY = "nutrihumt_screens_v3";

  function createBlankDay(dayNumber, location, phaseLabel, weightKg, dateStr) {
    return {
      dayNumber,
      date: dateStr || new Date().toISOString().slice(0, 10),
      location: location || "UCI",
      phaseLabel: phaseLabel || `Dia ${dayNumber} ${location}`,
      actualWeightKg: weightKg || 75,
      // Estat de les pantalles d'aquest dia
      currentScreen: 2, // Quan la valoració d'ingrés ja està guardada, cada dia s'obre a la Pantalla 2
      objectivesCompleted: false,
      oralEvaluated: false,
      neEvaluated: false,
      npEvaluated: false,
      // Pantalla 2: Objectius
      energyMethod: "weight",
      kcalPerKgTarget: location === "PLANTA" ? 25 : 20,
      icMeasuredKcal: 1600,
      icPercentTarget: 100,
      proteinPerKgTarget: 1.5,
      lipidsPerKgTarget: 1.0,
      // Aports no nutricionals (UCI)
      sgConcentration: 0.05,
      sgVolumeMl: 0,
      propofolVolumeMl: 0,
      citrateVolumeMl: 0,
      lactuloseUnits: 0,
      clevidipineVolumeMl: 0,
      // Velocitats de perfusió (ml/h) i hores d'infusió al dia
      sgRateMlH: 0,
      sgHours: 24,
      propofolRateMlH: 0,
      propofolHours: 24,
      citrateRateMlH: 0,
      citrateHours: 24,
      clevidipineRateMlH: 0,
      clevidipineHours: 24,
      // Pantalla 3: Via Oral
      oralActive: false,
      oralDietName: location === "PLANTA" ? "DIETA INGRÉS" : "SEMILIQUIDA",
      comstockExpanded: false,
      meals: {
        breakfast: { weight: 0.2, eatenPct: 0.5, obs: "", photoBefore: null, photoAfter: null },
        lunch: { weight: 0.4, eatenPct: 0.5, obs: "", photoBefore: null, photoAfter: null },
        snack: { weight: 0.1, eatenPct: 0.75, obs: "", photoBefore: null, photoAfter: null },
        dinner: { weight: 0.3, eatenPct: 0.5, obs: "", photoBefore: null, photoAfter: null }
      },
      supplements: [],
      // Pantalla 4: Nutrició Enteral
      neActive: false,
      neFormulaId: "osmolite",
      neVolume24hMl: 0,
      freeWaterMl: 0,
      // Pantalla 5: Nutrició Parenteral
      npActive: false,
      npType: "Nutrició parenteral farmàcia",
      npAminovenG: 67.5,
      npGlucoseG: 180.0,
      npSmoflipidG: 30.0,
      npTotalVolumeMl: 1290.0,
      npNa: 80,
      npK: 60,
      npCl: 70,
      npP: 20,
      npCa: 9,
      npVitaminsMl: 5.0,
      npTraceElementsMl: 10.0,
      // Pantalla 7: Monitorització GI i Metabòlica
      monitoringVisited: false,
      giVrgMl: 0,
      giVomiting: "no",
      giConstipationDays: 0,
      giOpioids: false,
      giDiarrheaCount: 0,
      giDistension: "normal",
      labUreaPlasma: null,
      labCreatinine: null,
      urea24hG: null,
      glyMean: null,
      glyMax: null,
      insulin24h: null,
      insulinRate: null,
      insulinBasal: null,
      // Registre dels 7 dies previs (índex 0 = Dia -6 ... índex 5 = Ahir). Avui = camps del dia.
      weeklyGly: Array.from({ length: 6 }, () => ({ glyMean: null, insulin: null })),
      labTg: null,
      labIron: null,
      labFerritin: null,
      labTransferrin: null,
      labTsi: null,
      labVitD: null,
      labThiamine: null,
      labThiamineSupp: "no",
      labPrealbumin: null,
      // Pantalla 8: observacions
      clinicalNotes: ""
    };
  }

  // Afegeix els camps nous als dies desats amb versions anteriors de l'app
  function migrateDay(d) {
    const blank = createBlankDay(d.dayNumber || 1, d.location || "UCI", d.phaseLabel, d.actualWeightKg, d.date);
    Object.keys(blank).forEach((k) => {
      if (d[k] === undefined) d[k] = blank[k];
    });
    if (!Array.isArray(d.weeklyGly) || d.weeklyGly.length !== 6) d.weeklyGly = blank.weeklyGly;
    if (!window.HUMT_DATA.enteralFormulas.some((f) => f.id === d.neFormulaId)) {
      d.neFormulaId = window.HUMT_DATA.enteralFormulas[0].id;
    }
    return d;
  }

  function numOrNull(v) {
    if (v === "" || v === null || v === undefined) return null;
    const n = Number(v);
    return isNaN(n) ? null : n;
  }

  function createNewPatient(name = "Pacient 1 (Ingrés UCI)") {
    const today = new Date().toISOString().slice(0, 10);
    const d1 = createBlankDay(1, "UCI", "Dia 1 UCI - Ingrés", 81.5, today);
    d1.currentScreen = 1; // El primer dia comença obligatòriament a la Pantalla 1 (Valoració a l'Ingrés)
    d1.neFormulaId = "glucerna_1_5";
    return {
      id: "pac-" + Date.now() + "-" + Math.floor(Math.random() * 1000),
      name,
      nhc: "001",
      sex: "F",
      age: 61,
      heightCm: 160,
      admissionWeightKg: 81.5,
      habitualWeightKg: 175.0,
      admissionPhosphateMgDl: 2.8,
      diabetes: true,
      dysphagia: false,
      admissionCompleted: false, // Obligatori confirmar al 1r dia; un cop fet ja queda guardat
      activeDayIndex: 0,
      days: [d1]
    };
  }

  const state = {
    patients: [],
    currentPatientId: null,
    dietSearchQuery: ""
  };

  function loadState() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          parsed.forEach((p) => (p.days || []).forEach(migrateDay));
          state.patients = parsed;
          state.currentPatientId = parsed[0].id;
          return;
        }
      }
    } catch (e) {
      console.warn("Error llegint localStorage:", e);
    }
    state.patients = [createNewPatient("Pacient Exemple Excel (Dona 61a)")];
    state.currentPatientId = state.patients[0].id;
  }

  function saveState() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state.patients));
    } catch (e) {
      console.warn("Error desant a localStorage:", e);
    }
  }

  function getActivePatient() {
    return state.patients.find((p) => p.id === state.currentPatientId) || state.patients[0];
  }

  function getActiveDay(patient) {
    const p = patient || getActivePatient();
    if (!p.days || p.days.length === 0) {
      p.days = [createBlankDay(1, "UCI", "Dia 1 UCI", p.admissionWeightKg || 75)];
      p.activeDayIndex = 0;
    }
    const idx = Math.min(Math.max(0, p.activeDayIndex || 0), p.days.length - 1);
    p.activeDayIndex = idx;
    return p.days[idx];
  }

  function goToScreen(screenNum) {
    const p = getActivePatient();
    const d = getActiveDay(p);

    // Regles d'obligatorietat:
    // 1. Si no s'ha completat la valoració a l'ingrés (1r dia), només es pot estar a la Pantalla 1
    if (!p.admissionCompleted && screenNum > 1) {
      alert("Primer has de guardar la Valoració Nutricional a l'Ingrés (Pantalla 1).");
      d.currentScreen = 1;
      renderAll();
      return;
    }
    // 2. Si no s'han confirmat els objectius del dia actual, no es pot passar a les pantalles 3 a 8
    if (!d.objectivesCompleted && screenNum > 2) {
      alert("Primer has de confirmar els Objectius Nutricionals per a aquest dia de valoració (Pantalla 2).");
      d.currentScreen = 2;
      renderAll();
      return;
    }

    d.currentScreen = screenNum;
    saveState();
    renderAll();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  // =========================================================================
  // MOTOR DE CÀLCUL EXACTE (FÓRMULES DE L'EXCEL HUMT)
  // =========================================================================
  function computeMetrics(patient, day) {
    const heightCm = Number(patient.heightCm) || 0;
    const admissionWeight = Number(patient.admissionWeightKg) || 0;
    const actualWeight = Number(day.actualWeightKg) || admissionWeight;
    const habitualWeight = Number(patient.habitualWeightKg) || admissionWeight;
    const sex = patient.sex || "F";

    const heightM = heightCm / 100;
    const bmi = heightM > 0 ? actualWeight / (heightM * heightM) : 0;

    const baseIdeal = sex === "M" ? 50 : 45.5;
    const idealWeight = heightCm > 0 ? baseIdeal + 0.91 * (heightCm - 152.4) : 0;

    // Variació de pes respecte l'habitual: positiu = pèrdua, negatiu = guany.
    // Si el pes a l'ingrés és SUPERIOR a l'habitual NO hi ha pèrdua de pes (weightLossPct = 0).
    const weightChangeKg = admissionWeight - habitualWeight; // >0 guany, <0 pèrdua
    const rawLossPct = habitualWeight > 0 ? ((habitualWeight - admissionWeight) / habitualWeight) * 100 : 0;
    const weightLossPct = Math.max(0, rawLossPct);
    const weightGainPct = Math.max(0, -rawLossPct);
    const adjustedWeight = idealWeight + 0.25 * (actualWeight - idealWeight);
    const workWeight = bmi > 30 ? adjustedWeight : actualWeight;

    // Objectius del dia
    const energyByWeight = workWeight * (Number(day.kcalPerKgTarget) || 20);
    const energyByIC = (Number(day.icMeasuredKcal) || 0) * ((Number(day.icPercentTarget) || 100) / 100);
    const energyTargetKcal = day.energyMethod === "ic" && energyByIC > 0 ? energyByIC : energyByWeight;
    const proteinTargetG = workWeight * (Number(day.proteinPerKgTarget) || 1.5);
    const lipidsTargetG = workWeight * (Number(day.lipidsPerKgTarget) || 1.0);
    const maxSafeGlucoseG = (4.5 * workWeight * 1440) / 1000;

    // Aports No Nutricionals (UCI)
    const sgConc = Number(day.sgConcentration) || 0.05;
    const sgVol = Number(day.sgVolumeMl) || 0;
    const sgGlucoseG = sgConc * sgVol;
    const sgKcal = sgGlucoseG * 4;

    const propofolVol = Number(day.propofolVolumeMl) || 0;
    const propofolLipidsG = propofolVol * 0.1;
    const propofolKcal = propofolVol * 1.1;

    const citrateVol = Number(day.citrateVolumeMl) || 0;
    const citrateKcal = (citrateVol * 12) / 100;

    const lactuloseUnits = Number(day.lactuloseUnits) || 0;
    const lactuloseGlucoseG = lactuloseUnits * 10;
    const lactuloseKcal = lactuloseGlucoseG * 4;

    const clevidipineVol = Number(day.clevidipineVolumeMl) || 0;
    const clevidipineLipidsG = clevidipineVol * 0.2;
    const clevidipineKcal = (clevidipineVol * 200) / 100;

    const nonNutr = {
      volumeMl: sgVol + propofolVol + citrateVol + clevidipineVol,
      kcal: sgKcal + propofolKcal + citrateKcal + lactuloseKcal + clevidipineKcal,
      proteinG: 0,
      carbsG: sgGlucoseG + lactuloseGlucoseG,
      lipidsG: propofolLipidsG + clevidipineLipidsG,
      fiberG: 0
    };

    // Via Oral (Safata Comstock + Suplements)
    const diet = window.HUMT_DATA.hospitalDiets.find((d) => d.name === day.oralDietName) || window.HUMT_DATA.hospitalDiets[0];
    const mealDefs = [
      { key: "breakfast", label: "Esmorzar (20%)", defaultWeight: 0.2 },
      { key: "lunch", label: "Dinar (40%)", defaultWeight: 0.4 },
      { key: "snack", label: "Berenar (10%)", defaultWeight: 0.1 },
      { key: "dinner", label: "Sopar (30%)", defaultWeight: 0.3 }
    ];

    let globalEatenFraction = 0;
    const mealBreakdown = mealDefs.map((m) => {
      const mData = (day.meals && day.meals[m.key]) || { weight: m.defaultWeight, eatenPct: 0, obs: "" };
      const eatenPct = day.oralActive ? Number(mData.eatenPct ?? 0) : 0;
      const dietFraction = m.defaultWeight * eatenPct;
      globalEatenFraction += dietFraction;
      return {
        key: m.key,
        label: m.label,
        weight: m.defaultWeight,
        eatenPct,
        dietFraction,
        kcal: diet ? diet.kcal * dietFraction : 0,
        proteinG: diet ? diet.protein * dietFraction : 0,
        lipidsG: diet ? diet.lipids * dietFraction : 0,
        carbsG: diet ? diet.carbs * dietFraction : 0,
        fiberG: diet ? diet.fiber * dietFraction : 0,
        photoBefore: mData.photoBefore || null,
        photoAfter: mData.photoAfter || null
      };
    });

    const oralTray = {
      diet,
      active: Boolean(day.oralActive),
      globalEatenPct: globalEatenFraction * 100,
      kcal: diet && day.oralActive ? diet.kcal * globalEatenFraction : 0,
      proteinG: diet && day.oralActive ? diet.protein * globalEatenFraction : 0,
      lipidsG: diet && day.oralActive ? diet.lipids * globalEatenFraction : 0,
      carbsG: diet && day.oralActive ? diet.carbs * globalEatenFraction : 0,
      fiberG: diet && day.oralActive ? diet.fiber * globalEatenFraction : 0,
      meals: mealBreakdown
    };

    // Suplements i Mòduls
    let suppTotals = { volumeMl: 0, kcal: 0, proteinG: 0, carbsG: 0, lipidsG: 0, fiberG: 0, items: [] };
    if (day.oralActive || day.neActive) {
      (day.supplements || []).forEach((s) => {
        const prod = window.HUMT_DATA.supplementsAndModules.find((p) => p.id === s.id);
        const units = Number(s.units) || 0;
        if (prod && units > 0) {
          const it = {
            product: prod,
            units,
            volumeMl: (prod.unitVolumeMl || 0) * units,
            kcal: prod.perUnit.kcal * units,
            proteinG: prod.perUnit.protein * units,
            carbsG: prod.perUnit.carbs * units,
            lipidsG: prod.perUnit.lipids * units,
            fiberG: prod.perUnit.fiber * units
          };
          suppTotals.volumeMl += it.volumeMl;
          suppTotals.kcal += it.kcal;
          suppTotals.proteinG += it.proteinG;
          suppTotals.carbsG += it.carbsG;
          suppTotals.lipidsG += it.lipidsG;
          suppTotals.fiberG += it.fiberG;
          suppTotals.items.push(it);
        }
      });
    }

    // Nutrició Enteral (NE)
    const formula = window.HUMT_DATA.enteralFormulas.find((f) => f.id === day.neFormulaId) || window.HUMT_DATA.enteralFormulas[0];
    const neVol = day.neActive ? Number(day.neVolume24hMl) || 0 : 0;
    const freeWaterVol = day.neActive ? Number(day.freeWaterMl) || 0 : 0;

    const ne = {
      active: Boolean(day.neActive),
      formula,
      formulaVolumeMl: neVol,
      totalVolumeMl: neVol + freeWaterVol,
      kcal: formula ? (formula.per100ml.kcal * neVol) / 100 : 0,
      proteinG: formula ? (formula.per100ml.protein * neVol) / 100 : 0,
      carbsG: formula ? (formula.per100ml.carbs * neVol) / 100 : 0,
      lipidsG: formula ? (formula.per100ml.lipids * neVol) / 100 : 0,
      fiberG: formula ? (formula.per100ml.fiber * neVol) / 100 : 0,
      rateMlHr24: neVol / 24
    };

    // Nutrició Parenteral (NP)
    let np = {
      active: Boolean(day.npActive),
      volumeMl: 0,
      kcal: 0,
      nonProteinKcal: 0,
      proteinG: 0,
      carbsG: 0,
      lipidsG: 0,
      fiberG: 0,
      lipidsToGlucoseRatio: 0,
      nonProtKcalPerGNitrogen: 0
    };
    if (day.npActive) {
      const protG = Number(day.npAminovenG) || 0;
      const glucG = Number(day.npGlucoseG) || 0;
      const lipG = Number(day.npSmoflipidG) || 0;
      const protKcal = protG * 4;
      const glucKcal = glucG * 4;
      const lipKcal = lipG * 9;
      const nonProtKcal = glucKcal + lipKcal;
      const totalKcal = protKcal + nonProtKcal;
      const nG = protG / 6.25;
      np = {
        active: true,
        volumeMl: Number(day.npTotalVolumeMl) || 0,
        kcal: totalKcal,
        nonProteinKcal: nonProtKcal,
        proteinG: protG,
        carbsG: glucG,
        lipidsG: lipG,
        fiberG: 0,
        lipidsToGlucoseRatio: glucKcal > 0 ? lipKcal / glucKcal : 0,
        nonProtKcalPerGNitrogen: nG > 0 ? nonProtKcal / nG : 0
      };
    }

    // Totals
    const totalVolumeMl = nonNutr.volumeMl + suppTotals.volumeMl + ne.totalVolumeMl + np.volumeMl;
    const totalKcal = nonNutr.kcal + oralTray.kcal + suppTotals.kcal + ne.kcal + np.kcal;
    const totalProteinG = nonNutr.proteinG + oralTray.proteinG + suppTotals.proteinG + ne.proteinG + np.proteinG;
    const totalCarbsG = nonNutr.carbsG + oralTray.carbsG + suppTotals.carbsG + ne.carbsG + np.carbsG;
    const totalLipidsG = nonNutr.lipidsG + oralTray.lipidsG + suppTotals.lipidsG + ne.lipidsG + np.lipidsG;
    const totalFiberG = nonNutr.fiberG + oralTray.fiberG + suppTotals.fiberG + ne.fiberG + np.fiberG;

    const kcalPerKg = workWeight > 0 ? totalKcal / workWeight : 0;
    const proteinPerKg = workWeight > 0 ? totalProteinG / workWeight : 0;
    const lipidsPerKg = workWeight > 0 ? totalLipidsG / workWeight : 0;
    const volumePerKg = workWeight > 0 ? totalVolumeMl / workWeight : 0;
    const glucoseOxidationRateMgKgMin = workWeight > 0 ? (totalCarbsG * 1000) / (workWeight * 1440) : 0;

    const kcalAdequacyPct = energyTargetKcal > 0 ? (totalKcal / energyTargetKcal) * 100 : 0;
    const proteinAdequacyPct = proteinTargetG > 0 ? (totalProteinG / proteinTargetG) * 100 : 0;
    const lipidsAdequacyPct = lipidsTargetG > 0 ? (totalLipidsG / lipidsTargetG) * 100 : 0;

    // Balanç Nitrogenat
    const urea24hG = Number(day.urea24hG) || 0;
    const hasUrea24h = numOrNull(day.urea24hG) !== null;
    const nitrogenIntakeG = totalProteinG / 6.25;
    const nitrogenBalance = nitrogenIntakeG - (urea24hG + 4);
    let nitrogenStatus = "Neutre (-4 a +4 g/dia)";
    let nitrogenBadge = "badge-warning";
    if (nitrogenBalance > 4) {
      nitrogenStatus = "Anabòlic (> +4 g/dia)";
      nitrogenBadge = "badge-success";
    } else if (nitrogenBalance < -4) {
      nitrogenStatus = "Catabòlic (< -4 g/dia)";
      nitrogenBadge = "badge-danger";
    }

    // Índex Urea/Creatinina (UCR) i BUN/Cr
    const ureaPl = numOrNull(day.labUreaPlasma);
    const creat = numOrNull(day.labCreatinine);
    let ucr = null;
    if (ureaPl !== null && creat !== null && creat > 0) {
      const ureaMmol = ureaPl / 6.006; // mg/dL -> mmol/L
      const creatUmol = creat * 88.4; // mg/dL -> µmol/L
      const bun = ureaPl / 2.1428;
      ucr = {
        ureaMgDl: ureaPl,
        creatMgDl: creat,
        ratioMgDl: ureaPl / creat,
        ucrSI: (ureaMmol / creatUmol) * 1000, // urea (mmol/L) / creatinina (µmol/L) × 1000
        bun,
        bunCr: bun / creat
      };
    }

    // Control glicèmic i Índex de Resistència a la Insulina (IRI)
    const glyMean = numOrNull(day.glyMean);
    const insulin24h = numOrNull(day.insulin24h);
    const insulinBasal = numOrNull(day.insulinBasal) || 0;
    const insulinRate = numOrNull(day.insulinRate);
    const totalInsulinToday = insulin24h !== null || insulinBasal > 0 ? (insulin24h || 0) + insulinBasal : null;
    let iri = null;
    if (totalInsulinToday !== null) {
      iri = {
        totalInsulin: totalInsulinToday,
        perGCarbs: totalCarbsG > 0 ? totalInsulinToday / totalCarbsG : null, // UI insulina / g HC aportats
        perKg: workWeight > 0 ? totalInsulinToday / workWeight : null, // UI/kg/dia
        rateXGly: insulinRate !== null && glyMean !== null ? (insulinRate * glyMean) / 100 : null // (UI/h × glicèmia mg/dL)/100
      };
    }
    const weekRows = (day.weeklyGly || []).map((r) => ({ glyMean: numOrNull(r.glyMean), insulin: numOrNull(r.insulin) }));
    weekRows.push({ glyMean, insulin: totalInsulinToday });
    const glyVals = weekRows.map((r) => r.glyMean).filter((v) => v !== null);
    const insVals = weekRows.map((r) => r.insulin).filter((v) => v !== null);
    const avg = (arr) => (arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : null);
    // Tendència: mitjana dels 3 primers dies registrats vs 3 últims
    let insulinTrendPct = null;
    if (insVals.length >= 4) {
      const first = avg(insVals.slice(0, 3));
      const last = avg(insVals.slice(-3));
      if (first > 0) insulinTrendPct = ((last - first) / first) * 100;
    }
    const weekly = {
      rows: weekRows,
      glyMean7d: avg(glyVals),
      insulinMean7d: avg(insVals),
      insulinPerKg7d: avg(insVals) !== null && workWeight > 0 ? avg(insVals) / workWeight : null,
      insulinTrendPct,
      daysRecorded: Math.max(glyVals.length, insVals.length)
    };

    const phos = Number(patient.admissionPhosphateMgDl) || 2.8;
    const refeedingRisk = bmi < 18.5 || weightLossPct > 10 || phos < 2.0;

    return {
      anthropometry: {
        heightCm,
        admissionWeight,
        actualWeight,
        habitualWeight,
        bmi,
        idealWeight,
        weightLossPct,
        weightGainPct,
        weightChangeKg,
        adjustedWeight,
        workWeight,
        isObeseAdjusted: bmi > 30
      },
      targets: {
        energyKcal: energyTargetKcal,
        proteinG: proteinTargetG,
        lipidsG: lipidsTargetG,
        maxSafeGlucoseG
      },
      nonNutr,
      oralTray,
      supplements: suppTotals,
      ne,
      np,
      totals: {
        volumeMl: totalVolumeMl,
        kcal: totalKcal,
        proteinG: totalProteinG,
        carbsG: totalCarbsG,
        lipidsG: totalLipidsG,
        fiberG: totalFiberG,
        kcalPerKg,
        proteinPerKg,
        lipidsPerKg,
        volumePerKg,
        glucoseOxidationRateMgKgMin,
        kcalAdequacyPct,
        proteinAdequacyPct,
        lipidsAdequacyPct
      },
      nitrogen: {
        urea24hG,
        hasUrea24h,
        nitrogenIntakeG,
        balance: nitrogenBalance,
        status: nitrogenStatus,
        badgeClass: nitrogenBadge
      },
      ucr,
      iri,
      weekly,
      refeedingRisk,
      phosphateMgDl: phos
    };
  }

  function fmt(num, dec = 1) {
    if (num === null || num === undefined || isNaN(num)) return "0";
    return Number(num).toLocaleString("ca-ES", {
      minimumFractionDigits: dec,
      maximumFractionDigits: dec
    });
  }

  function getAdequacyBadge(pct) {
    if (pct >= 90 && pct <= 110) return `<span class="badge badge-success">${fmt(pct, 0)}% Òptim</span>`;
    if (pct >= 70 && pct < 90) return `<span class="badge badge-warning">${fmt(pct, 0)}% En progrés</span>`;
    if (pct > 110) return `<span class="badge badge-danger">${fmt(pct, 0)}% Excés (>110%)</span>`;
    return `<span class="badge badge-danger">${fmt(pct, 0)}% Dèficit (<70%)</span>`;
  }

  function buildContextBannerHtml(day, m) {
    const remKcal = Math.max(0, m.targets.energyKcal - m.totals.kcal);
    const remProt = Math.max(0, m.targets.proteinG - m.totals.proteinG);
    return `
      <div class="rc-item">
        <span class="rc-label">Objectius Dia ${day.dayNumber} (${day.location})</span>
        <span class="rc-val">${fmt(m.targets.energyKcal, 0)} kcal · ${fmt(m.targets.proteinG, 1)} g Prot · ${fmt(m.targets.lipidsG, 1)} g Líp</span>
      </div>
      <div class="rc-item">
        <span class="rc-label">Aportat fins ara</span>
        <span class="rc-val">${fmt(m.totals.kcal, 0)} kcal (${fmt(m.totals.kcalAdequacyPct, 0)}%) · ${fmt(m.totals.proteinG, 1)} g Prot (${fmt(m.totals.proteinAdequacyPct, 0)}%)</span>
      </div>
      <div class="rc-item">
        <span class="rc-label">Dèficit pendent de cobrir</span>
        <span class="rc-val" style="color:${remKcal > 150 ? "#fde047" : "#86efac"};">
          ${remKcal > 0 || remProt > 0 ? `Falten ${fmt(remKcal, 0)} kcal i ${fmt(remProt, 1)} g Prot` : "✅ 100% Requeriments Coberts"}
        </span>
      </div>
    `;
  }

  // =========================================================================
  // RENDERITZACIÓ GENERAL (NOMÉS 1 PANTALLA VISIBLE A LA VEGADA)
  // =========================================================================
  function renderAll() {
    const patient = getActivePatient();
    const day = getActiveDay(patient);
    const m = computeMetrics(patient, day);

    // Garantim que si és el 1r dia i no ha completat la valoració d'ingrés, estigui a la Pantalla 1
    if (!patient.admissionCompleted) {
      day.currentScreen = 1;
    } else if (!day.currentScreen || day.currentScreen < 1 || day.currentScreen > 8) {
      day.currentScreen = 2;
    } else if (!day.objectivesCompleted && day.currentScreen > 2) {
      day.currentScreen = 2;
    }

    renderTopContextBar(patient, day, m);
    renderScreenStepper(patient, day, m);

    // Mostrar només la pantalla actual (screen-1 .. screen-8)
    for (let i = 1; i <= 8; i++) {
      const el = document.getElementById(`screen-${i}`);
      if (el) el.classList.toggle("active-screen", day.currentScreen === i);
    }

    if (day.currentScreen === 1) renderScreen1Admission(patient, day, m);
    else if (day.currentScreen === 2) renderScreen2Objectives(patient, day, m);
    else if (day.currentScreen === 3) renderScreen3NonNutr(patient, day, m);
    else if (day.currentScreen === 4) renderScreen4Oral(patient, day, m);
    else if (day.currentScreen === 5) renderScreen5NE(patient, day, m);
    else if (day.currentScreen === 6) renderScreen6NP(patient, day, m);
    else if (day.currentScreen === 7) renderScreen7Monitoring(patient, day, m);
    else if (day.currentScreen === 8) renderScreen8Balance(patient, day, m);

    renderModals(patient, day);
  }

  function renderTopContextBar(patient, day, m) {
    const sel = document.getElementById("patient-select");
    if (sel) {
      sel.innerHTML = state.patients
        .map(
          (p) =>
            `<option value="${p.id}" ${p.id === patient.id ? "selected" : ""}>${p.name} (${p.admissionCompleted ? p.days.length + " dies" : "Nou ingrés"})</option>`
        )
        .join("");
    }

    // Píndola de Valoració d'Ingrés Guardada
    const admBanner = document.getElementById("saved-admission-banner");
    if (admBanner) {
      if (patient.admissionCompleted) {
        admBanner.style.display = "block";
        admBanner.innerHTML = `
          <div class="saved-admission-pill">
            <span>✅ <strong>Ingrés guardat:</strong> ${patient.sex === "M" ? "Home" : "Dona"}, ${patient.age}a · ${patient.heightCm} cm · Pes Treball: <strong>${fmt(m.anthropometry.workWeight, 1)} kg</strong> (IMC ${fmt(m.anthropometry.bmi, 1)})</span>
            <button type="button" class="btn btn-sm btn-outline" id="btn-edit-admission-top" style="padding:2px 8px; font-size:11px;">✏️ Editar</button>
          </div>
        `;
        document.getElementById("btn-edit-admission-top")?.addEventListener("click", () => {
          goToScreen(1);
        });
      } else {
        admBanner.style.display = "none";
      }
    }

    const timelineRow = document.getElementById("day-timeline-row");
    if (timelineRow) {
      timelineRow.style.display = patient.admissionCompleted ? "flex" : "none";
    }

    const chipsEl = document.getElementById("day-chips-container");
    if (chipsEl) {
      chipsEl.innerHTML = patient.days
        .map((d, idx) => {
          const isAct = idx === patient.activeDayIndex;
          const locDot = d.location === "UCI" ? "uci" : "planta";
          return `
            <button type="button" class="day-chip ${isAct ? "active" : ""}" data-day-idx="${idx}">
              <span class="loc-dot ${locDot}"></span>
              Dia ${d.dayNumber} · ${d.location} (${d.date || ""})
            </button>
          `;
        })
        .join("");

      chipsEl.querySelectorAll(".day-chip").forEach((btn) => {
        btn.addEventListener("click", () => {
          patient.activeDayIndex = Number(btn.getAttribute("data-day-idx"));
          const targetDay = getActiveDay(patient);
          if (!targetDay.objectivesCompleted) targetDay.currentScreen = 2;
          saveState();
          renderAll();
        });
      });
    }
  }

  function renderScreenStepper(patient, day, m) {
    const bar = document.getElementById("screen-stepper-bar");
    if (!bar) return;

    const s1Done = patient.admissionCompleted;
    const s2Done = s1Done && day.objectivesCompleted;

    const crumbs = [
      {
        num: 1,
        label: "1. Ingrés (1r Dia)",
        sub: s1Done ? `Guardat (${fmt(m.anthropometry.workWeight, 1)} kg)` : "Obligatori",
        unlocked: true,
        done: s1Done
      },
      {
        num: 2,
        label: `2. Objectius Dia ${day.dayNumber}`,
        sub: s2Done ? `${fmt(m.targets.energyKcal, 0)} kcal / ${fmt(m.targets.proteinG, 0)}g P` : "Obligatori",
        unlocked: s1Done,
        done: s2Done
      },
      {
        num: 3,
        label: "3. No Nutricionals",
        sub: m.nonNutr.kcal > 0 ? `${fmt(m.nonNutr.kcal, 0)} kcal` : "ml/h · 0 kcal",
        unlocked: s2Done,
        done: s2Done && (day.nonNutrEvaluated || m.nonNutr.kcal > 0)
      },
      {
        num: 4,
        label: "4. Via Oral",
        sub: day.oralActive ? `SÍ (${fmt(m.oralTray.kcal + m.supplements.kcal, 0)} kcal)` : day.oralEvaluated ? "NO" : "Valorar",
        unlocked: s2Done,
        done: day.oralEvaluated || day.oralActive
      },
      {
        num: 5,
        label: "5. Via Enteral",
        sub: day.neActive ? `SÍ (${fmt(m.ne.kcal, 0)} kcal)` : day.neEvaluated ? "NO" : "Valorar",
        unlocked: s2Done,
        done: day.neEvaluated || day.neActive
      },
      {
        num: 6,
        label: "6. Via Parenteral",
        sub: day.npActive ? `SÍ (${fmt(m.np.kcal, 0)} kcal)` : day.npEvaluated ? "NO" : "Valorar",
        unlocked: s2Done,
        done: day.npEvaluated || day.npActive
      },
      {
        num: 7,
        label: "7. Monitorització",
        sub: "GI · Metabòlica",
        unlocked: s2Done,
        done: Boolean(day.monitoringVisited)
      },
      {
        num: 8,
        label: "8. Balanç i Nota",
        sub: s2Done ? `${fmt(m.totals.kcalAdequacyPct, 0)}% Kcal` : "Resum",
        unlocked: s2Done,
        done: day.currentScreen === 8
      }
    ];

    bar.innerHTML = crumbs
      .map(
        (c) => `
        <div class="step-Crumb ${c.unlocked ? "unlocked" : ""} ${day.currentScreen === c.num ? "current" : ""} ${c.done && day.currentScreen !== c.num ? "done" : ""}" data-screen-nav="${c.num}">
          <div class="crumb-dot">${c.done && day.currentScreen !== c.num ? "✓" : c.num}</div>
          <div>
            <div>${c.label}</div>
            <div style="font-size:10.5px; opacity:0.8;">${c.sub}</div>
          </div>
        </div>
      `
      )
      .join("");

    bar.querySelectorAll(".step-Crumb").forEach((el) => {
      el.addEventListener("click", () => {
        const target = Number(el.getAttribute("data-screen-nav"));
        goToScreen(target);
      });
    });

    // Desplaçament automàtic horitzontal a la pestanya activa en dispositius mòbils
    if (typeof requestAnimationFrame === "function") {
      requestAnimationFrame(() => {
        bar.querySelector(".step-Crumb.current")?.scrollIntoView({
          behavior: "smooth",
          block: "nearest",
          inline: "center"
        });
      });
    }
  }

  // =========================================================================
  // PANTALLA 1: VALORACIÓ NUTRICIONAL A L'INGRÉS
  // =========================================================================
  function renderScreen1Admission(patient, day, m) {
    setVal("inp-patient-name", patient.name);
    setVal("inp-patient-nhc", patient.nhc || "");
    setVal("inp-patient-sex", patient.sex || "");
    setVal("inp-patient-age", patient.age || "");
    setVal("inp-patient-height", patient.heightCm || "");
    setVal("inp-admission-weight", patient.admissionWeightKg || "");
    setVal("inp-habitual-weight", patient.habitualWeightKg || "");
    setVal("inp-phosphate", patient.admissionPhosphateMgDl ?? 2.8);
    setVal("inp-patient-diabetes", patient.diabetes ? "true" : "false");
    setVal("inp-patient-dysphagia", patient.dysphagia ? "true" : "false");

    const anthroBox = document.getElementById("anthro-results-box");
    if (anthroBox) {
      anthroBox.innerHTML = `
        <div class="calc-stat-box highlight">
          <div class="stat-title">PES DE TREBALL CALCULAT</div>
          <div class="stat-num">${fmt(m.anthropometry.workWeight, 2)} kg</div>
          <div class="stat-formula">${m.anthropometry.isObeseAdjusted ? "Usa Pes Ajustat (IMC > 30)" : "Usa Pes Actual (IMC ≤ 30)"}</div>
        </div>
        <div class="calc-stat-box">
          <div class="stat-title">IMC A L'INGRÉS</div>
          <div class="stat-num">${fmt(m.anthropometry.bmi, 2)} kg/m²</div>
          <div class="stat-formula">${m.anthropometry.bmi > 30 ? "Obesitat (>30)" : m.anthropometry.bmi < 18.5 ? "Baix pes (<18.5)" : "18.5 - 30 kg/m²"}</div>
        </div>
        <div class="calc-stat-box">
          <div class="stat-title">PES IDEAL (DEVINE)</div>
          <div class="stat-num">${fmt(m.anthropometry.idealWeight, 2)} kg</div>
          <div class="stat-formula">${patient.sex === "M" ? "50" : "45,5"} + 0,91 × (Talla − 152,4)</div>
        </div>
        <div class="calc-stat-box">
          <div class="stat-title">PES AJUSTAT</div>
          <div class="stat-num">${fmt(m.anthropometry.adjustedWeight, 2)} kg</div>
          <div class="stat-formula">PI + 0,25 × (Actual − PI)</div>
        </div>
        ${(() => {
          const a = m.anthropometry;
          if (a.weightChangeKg < 0) {
            return `
        <div class="calc-stat-box">
          <div class="stat-title">% PÈRDUA DE PES</div>
          <div class="stat-num" style="color:${a.weightLossPct > 10 ? "var(--danger)" : "var(--text)"}">${fmt(a.weightLossPct, 1)}%</div>
          <div class="stat-formula">${fmt(-a.weightChangeKg, 1)} kg perduts respecte l'habitual</div>
        </div>`;
          }
          if (a.weightChangeKg > 0) {
            return `
        <div class="calc-stat-box">
          <div class="stat-title">VARIACIÓ DE PES (GUANY)</div>
          <div class="stat-num" style="color:var(--text);">+${fmt(a.weightGainPct, 1)}%</div>
          <div class="stat-formula">+${fmt(a.weightChangeKg, 1)} kg sobre l'habitual · Sense pèrdua de pes</div>
        </div>`;
          }
          return `
        <div class="calc-stat-box">
          <div class="stat-title">VARIACIÓ DE PES</div>
          <div class="stat-num">0,0%</div>
          <div class="stat-formula">Sense pèrdua de pes</div>
        </div>`;
        })()}
      `;
    }

    const riskBox = document.getElementById("admission-risk-alert");
    if (riskBox) {
      if (m.refeedingRisk) {
        riskBox.innerHTML = `
          <div class="alert-box alert-danger">
            <strong>⚠️ ALERTA PROTOCOL: Risc de Síndrome de Realimentació detectat a l'ingrés</strong><br>
            (${m.anthropometry.bmi < 18.5 ? "IMC < 18.5; " : ""}${m.anthropometry.weightLossPct > 10 ? `Pèrdua ponderal ${fmt(m.anthropometry.weightLossPct, 1)}% > 10%; ` : ""}${m.phosphateMgDl < 2.0 ? `Hipofosfatèmia ${m.phosphateMgDl} mg/dL` : ""})<br>
            Recorda pautar <strong>Tiamina 300 mg IV abans d'iniciar + 100 mg/dia (5 dies)</strong>, monitoritzar ions i iniciar amb aport progressiu (25% → 100% en 4 dies).
          </div>
        `;
      } else {
        riskBox.innerHTML = "";
      }
    }
  }

  // =========================================================================
  // PANTALLA 2: OBJECTIUS NUTRICIONALS DEL DIA
  // =========================================================================
  function renderScreen2Objectives(patient, day, m) {
    document.getElementById("screen-2-title").textContent = `🎯 Objectius Nutricionals · Dia ${day.dayNumber} (${day.location})`;

    setVal("inp-day-location", day.location);
    setVal("inp-day-phase", day.phaseLabel || "");
    setVal("inp-day-date", day.date || "");
    setVal("inp-actual-weight", day.actualWeightKg);
    setVal("inp-energy-method", day.energyMethod || "weight");
    setVal("inp-kcal-kg-target", day.kcalPerKgTarget);
    setVal("inp-ic-kcal", day.icMeasuredKcal);
    setVal("inp-ic-pct", day.icPercentTarget);
    setVal("inp-prot-kg-target", day.proteinPerKgTarget);
    setVal("inp-lip-kg-target", day.lipidsPerKgTarget);

    const isIC = day.energyMethod === "ic";
    document.getElementById("weight-kcal-group").style.display = isIC ? "none" : "flex";
    document.getElementById("ic-kcal-group").style.display = isIC ? "flex" : "none";
    document.getElementById("ic-pct-group").style.display = isIC ? "flex" : "none";

    // Pes de Treball del dia (calculat a partir del Pes del Dia)
    setVal("disp-work-weight-day", fmt(m.anthropometry.workWeight, 1));
    const wwTag = document.getElementById("disp-work-weight-tag");
    if (wwTag) wwTag.textContent = m.anthropometry.isObeseAdjusted ? "kg (Ajustat IMC>30)" : "kg (Actual)";

    const targetsBox = document.getElementById("targets-calculated-summary");
    if (targetsBox) {
      targetsBox.innerHTML = `
        <div class="calc-results-grid">
          <div class="calc-stat-box highlight">
            <div class="stat-title">PES DEL DIA / PES DE TREBALL</div>
            <div class="stat-num">${fmt(m.anthropometry.actualWeight, 1)} / ${fmt(m.anthropometry.workWeight, 1)} kg</div>
            <div class="stat-formula">IMC ${fmt(m.anthropometry.bmi, 1)} · ${m.anthropometry.isObeseAdjusted ? `Pes Ajustat = PI ${fmt(m.anthropometry.idealWeight, 1)} + 0,25 × (Actual − PI)` : "Pes Actual (IMC ≤ 30)"}</div>
          </div>
          <div class="calc-stat-box highlight">
            <div class="stat-title">OBJECTIU ENERGIA DIA ${day.dayNumber}</div>
            <div class="stat-num">${fmt(m.targets.energyKcal, 0)} kcal/dia</div>
            <div class="stat-formula">${isIC ? `${day.icPercentTarget}% de CI (${day.icMeasuredKcal} kcal)` : `${day.kcalPerKgTarget} kcal/kg × ${fmt(m.anthropometry.workWeight, 1)} kg (Pes treball)`}</div>
          </div>
          <div class="calc-stat-box highlight">
            <div class="stat-title">OBJECTIU PROTEÏNES DIA ${day.dayNumber}</div>
            <div class="stat-num">${fmt(m.targets.proteinG, 1)} g/dia</div>
            <div class="stat-formula">${day.proteinPerKgTarget} g/kg × ${fmt(m.anthropometry.workWeight, 1)} kg (${fmt(m.targets.proteinG / 6.25, 1)} g N)</div>
          </div>
          <div class="calc-stat-box">
            <div class="stat-title">OBJECTIU LÍPIDS DIA ${day.dayNumber}</div>
            <div class="stat-num">${fmt(m.targets.lipidsG, 1)} g/dia</div>
            <div class="stat-formula">${day.lipidsPerKgTarget} g/kg (Límit màx ≤ 1,5 g/kg)</div>
          </div>
          <div class="calc-stat-box">
            <div class="stat-title">HIDRATS DE CARBONI</div>
            <div class="stat-num">100 - ${fmt(m.targets.maxSafeGlucoseG, 0)} g</div>
            <div class="stat-formula">Límit màx oxidació: 4-5 mg/kg/min</div>
          </div>
        </div>
      `;
    }
  }

  // =========================================================================
  // PANTALLA 3: APORTS CALÒRICS NO NUTRICIONALS (ml/h × hores ↔ ml/24h)
  // =========================================================================
  const NON_NUTR_DRUGS = [
    { key: "sg", rate: "sgRateMlH", hours: "sgHours", vol: "sgVolumeMl" },
    { key: "propofol", rate: "propofolRateMlH", hours: "propofolHours", vol: "propofolVolumeMl" },
    { key: "citrate", rate: "citrateRateMlH", hours: "citrateHours", vol: "citrateVolumeMl" },
    { key: "clevidipine", rate: "clevidipineRateMlH", hours: "clevidipineHours", vol: "clevidipineVolumeMl" }
  ];

  function renderScreen3NonNutr(patient, day, m) {
    document.getElementById("context-banner-screen-3").innerHTML = buildContextBannerHtml(day, m);

    setVal("inp-sg-conc", String(day.sgConcentration));
    setVal("inp-propofol-conc", String(day.propofolConcentration || 0.1));
    NON_NUTR_DRUGS.forEach((dr) => {
      setVal(`inp-${dr.key}-rate`, day[dr.rate] ? Math.round(day[dr.rate] * 100) / 100 : "");
      setVal(`inp-${dr.key}-hours`, day[dr.hours] || 24);
      setVal(`inp-${dr.key}-vol`, day[dr.vol] ? Math.round(day[dr.vol] * 10) / 10 : "");
    });
    setVal("inp-lactulose-units", day.lactuloseUnits || "");

    const sgVol = Number(day.sgVolumeMl) || 0;
    const sgG = (Number(day.sgConcentration) || 0.05) * sgVol;
    const propVol = Number(day.propofolVolumeMl) || 0;
    const citVol = Number(day.citrateVolumeMl) || 0;
    const clevVol = Number(day.clevidipineVolumeMl) || 0;
    const lacU = Number(day.lactuloseUnits) || 0;
    const setHtml = (id, html) => {
      const el = document.getElementById(id);
      if (el) el.innerHTML = html;
    };
    setHtml("cell-sg-macro", `${fmt(sgG, 1)} g glucosa`);
    setHtml("cell-sg-kcal", `<strong>${fmt(sgG * 4, 0)} kcal</strong>`);
    setHtml("cell-propofol-macro", `${fmt(propVol * 0.1, 1)} g lípids`);
    setHtml("cell-propofol-kcal", `<strong>${fmt(propVol * 1.1, 0)} kcal</strong>`);
    setHtml("cell-citrate-macro", "Citrat");
    setHtml("cell-citrate-kcal", `<strong>${fmt((citVol * 12) / 100, 0)} kcal</strong>`);
    setHtml("cell-clevidipine-macro", `${fmt(clevVol * 0.2, 1)} g lípids`);
    setHtml("cell-clevidipine-kcal", `<strong>${fmt(clevVol * 2, 0)} kcal</strong>`);
    setHtml("cell-lactulose-macro", `${fmt(lacU * 10, 1)} g glucosa`);
    setHtml("cell-lactulose-kcal", `<strong>${fmt(lacU * 40, 0)} kcal</strong>`);
    setHtml("cell-nonnutr-total-vol", `${fmt(m.nonNutr.volumeMl, 0)} ml`);
    setHtml("cell-nonnutr-total-macro", `${fmt(m.nonNutr.carbsG, 1)}g gluc · ${fmt(m.nonNutr.lipidsG, 1)}g líp`);
    setHtml("cell-nonnutr-total-kcal", `${fmt(m.nonNutr.kcal, 0)} kcal`);
  }

  // =========================================================================
  // PANTALLA 4: VALORACIÓ D'INGESTA ORAL (1a VIA)
  // =========================================================================
  function renderScreen4Oral(patient, day, m) {
    document.getElementById("context-banner-screen-4").innerHTML = buildContextBannerHtml(day, m);

    document.getElementById("btn-screen4-oral-yes").classList.toggle("selected-yes", Boolean(day.oralActive));
    document.getElementById("btn-screen4-oral-no").classList.toggle("selected-no", !day.oralActive && day.oralEvaluated);

    const panel = document.getElementById("oral-config-panel");
    panel.style.display = day.oralActive ? "block" : "none";

    if (!day.oralActive) return;

    const dietSelect = document.getElementById("inp-oral-diet");
    if (dietSelect) {
      dietSelect.innerHTML = window.HUMT_DATA.hospitalDiets
        .map(
          (d) =>
            `<option value="${d.name}" ${d.name === day.oralDietName ? "selected" : ""}>${d.name} (${fmt(d.kcal, 0)} kcal · ${fmt(d.protein, 1)}g Prot · ${d.group.split("·")[1].trim()})</option>`
        )
        .join("");
    }

    const d = m.oralTray.diet;
    const bannerEl = document.getElementById("oral-diet-detail-banner");
    if (bannerEl && d) {
      const pct = m.oralTray.globalEatenPct;
      let alertBadge = `<span class="badge badge-danger">🚨 Ingesta safata insuficient (<50%)</span>`;
      if (pct >= 75) alertBadge = `<span class="badge badge-success">✅ Bona ingesta (≥75%)</span>`;
      else if (pct >= 50) alertBadge = `<span class="badge badge-warning">⚠️ Ingesta regular (50-75%)</span>`;

      bannerEl.innerHTML = `
        <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:8px;">
          <div>
            <strong>${d.name}</strong> (100% safata = ${fmt(d.kcal, 0)} kcal, ${fmt(d.protein, 1)}g Prot) ·
            <strong>Ingerit: ${fmt(pct, 0)}%</strong> ${alertBadge}
          </div>
          <div style="font-weight:800; color:var(--primary-dark);">
            Safata: +${fmt(m.oralTray.kcal, 0)} kcal i +${fmt(m.oralTray.proteinG, 1)} g Prot
          </div>
        </div>
        <div style="font-size:12px; color:var(--text-muted); margin-top:4px;"><strong>Menú tipus:</strong> ${d.menu}</div>
      `;
    }

    const wrapper = document.getElementById("comstock-meals-wrapper");
    if (wrapper) wrapper.style.display = day.comstockExpanded ? "block" : "none";

    const mealsContainer = document.getElementById("comstock-meals-container");
    if (mealsContainer && day.comstockExpanded) {
      const levels = [
        { val: 0, label: "0%" },
        { val: 0.25, label: "25%" },
        { val: 0.5, label: "50%" },
        { val: 0.75, label: "75%" },
        { val: 1.0, label: "100%" }
      ];

      mealsContainer.innerHTML = m.oralTray.meals
        .map((meal) => {
          const curPct = day.meals && day.meals[meal.key] ? Number(day.meals[meal.key].eatenPct) : 0;
          return `
            <div class="meal-card">
              <div style="display:flex; justify-content:space-between; font-size:12.5px; font-weight:700;">
                <span>🍽️ ${meal.label}</span>
                <span style="color:var(--primary-dark);">${fmt(meal.kcal, 0)} kcal · ${fmt(meal.proteinG, 1)}g Prot</span>
              </div>
              <div class="comstock-options">
                ${levels
                  .map((lvl) => {
                    const isSel = Math.abs(curPct - lvl.val) < 0.01;
                    const deg = lvl.val * 360;
                    return `
                      <button type="button" class="comstock-btn ${isSel ? "selected" : ""}" data-meal="${meal.key}" data-val="${lvl.val}">
                        <div class="plate-icon" style="background: conic-gradient(var(--primary) 0deg ${deg}deg, #f1f5f9 ${deg}deg 360deg);"></div>
                        <span>${lvl.label}</span>
                      </button>
                    `;
                  })
                  .join("")}
              </div>
              <div class="photo-upload-row">
                <label class="photo-slot">
                  <input type="file" accept="image/*" capture="environment" style="display:none;" class="meal-photo-input" data-meal="${meal.key}" data-side="photoBefore">
                  ${meal.photoBefore ? `<img src="${meal.photoBefore}"><span>📷 Foto Abans</span>` : `<span>📷 + Foto Abans</span>`}
                </label>
                <label class="photo-slot">
                  <input type="file" accept="image/*" capture="environment" style="display:none;" class="meal-photo-input" data-meal="${meal.key}" data-side="photoAfter">
                  ${meal.photoAfter ? `<img src="${meal.photoAfter}"><span>📷 Foto Després</span>` : `<span>📷 + Foto Després</span>`}
                </label>
              </div>
            </div>
          `;
        })
        .join("");

      mealsContainer.querySelectorAll(".comstock-btn").forEach((btn) => {
        btn.addEventListener("click", () => {
          const k = btn.getAttribute("data-meal");
          day.meals[k].eatenPct = Number(btn.getAttribute("data-val"));
          saveState();
          renderAll();
        });
      });

      mealsContainer.querySelectorAll(".meal-photo-input").forEach((inp) => {
        inp.addEventListener("change", (ev) => {
          const file = ev.target.files && ev.target.files[0];
          if (!file) return;
          const k = inp.getAttribute("data-meal");
          const side = inp.getAttribute("data-side");
          const reader = new FileReader();
          reader.onload = (le) => {
            resizeImageDataUrl(le.target.result, 420, (url) => {
              day.meals[k][side] = url;
              saveState();
              renderAll();
            });
          };
          reader.readAsDataURL(file);
        });
      });
    }

    renderSupplementsList(day);
  }

  function renderSupplementsList(day) {
    const container = document.getElementById("supplements-active-list");
    if (!container) return;

    if (!day.supplements || day.supplements.length === 0) {
      container.innerHTML = `<div style="font-size:12.5px; color:var(--text-light);">Cap suplement ni mòdul afegit.</div>`;
      return;
    }

    container.innerHTML = day.supplements
      .map((s, idx) => {
        const prod = window.HUMT_DATA.supplementsAndModules.find((p) => p.id === s.id) || window.HUMT_DATA.supplementsAndModules[0];
        const units = Number(s.units) || 0;
        return `
          <div class="supp-row">
            <select class="form-control supp-select" data-idx="${idx}">
              ${window.HUMT_DATA.supplementsAndModules
                .map((p) => `<option value="${p.id}" ${p.id === s.id ? "selected" : ""}>${p.name} (${p.perUnit.kcal} kcal · ${p.perUnit.protein}g Prot / ${p.unitLabel})</option>`)
                .join("")}
            </select>
            <div class="input-addon">
              <input type="number" step="0.5" min="0" max="20" class="form-control supp-units" data-idx="${idx}" value="${units}">
              <span class="addon-unit">${prod.unitLabel}</span>
            </div>
            <div style="font-size:12.5px; font-weight:700; color:var(--primary-dark);">
              +${fmt(prod.perUnit.kcal * units, 0)} kcal · +${fmt(prod.perUnit.protein * units, 1)}g Prot
            </div>
            <button type="button" class="btn btn-sm btn-danger-outline supp-remove" data-idx="${idx}">✕</button>
          </div>
        `;
      })
      .join("");

    container.querySelectorAll(".supp-select").forEach((sel) => {
      sel.addEventListener("change", () => {
        day.supplements[Number(sel.getAttribute("data-idx"))].id = sel.value;
        saveState();
        renderAll();
      });
    });
    container.querySelectorAll(".supp-units").forEach((inp) => {
      inp.addEventListener("input", () => {
        day.supplements[Number(inp.getAttribute("data-idx"))].units = Number(inp.value) || 0;
        saveState();
        renderAll();
      });
    });
    container.querySelectorAll(".supp-remove").forEach((btn) => {
      btn.addEventListener("click", () => {
        day.supplements.splice(Number(btn.getAttribute("data-idx")), 1);
        saveState();
        renderAll();
      });
    });
  }

  // =========================================================================
  // PANTALLA 4: VALORACIÓ DE NUTRICIÓ ENTERAL (2a VIA)
  // =========================================================================
  function renderScreen5NE(patient, day, m) {
    document.getElementById("context-banner-screen-5").innerHTML = buildContextBannerHtml(day, m);

    document.getElementById("btn-screen5-ne-yes").classList.toggle("selected-yes", Boolean(day.neActive));
    document.getElementById("btn-screen5-ne-no").classList.toggle("selected-no", !day.neActive && day.neEvaluated);

    const panel = document.getElementById("ne-config-panel");
    panel.style.display = day.neActive ? "block" : "none";

    if (!day.neActive) return;

    const neSelect = document.getElementById("inp-ne-formula");
    if (neSelect) {
      neSelect.innerHTML = window.HUMT_DATA.enteralFormulas
        .map(
          (f) =>
            `<option value="${f.id}" ${f.id === day.neFormulaId ? "selected" : ""}>${f.name} — ${f.category} (${f.kcalPerMl} kcal/ml · ${f.per100ml.protein}g Prot/100ml)</option>`
        )
        .join("");
    }
    setVal("inp-ne-vol", day.neVolume24hMl);
    setVal("inp-ne-rate", fmt(day.neVolume24hMl / 24, 1));
    setVal("inp-free-water", day.freeWaterMl);

    const f = m.ne.formula;
    const details = document.getElementById("ne-formula-details");
    if (details && f) {
      details.innerHTML = `
        <div style="display:flex; justify-content:space-between; flex-wrap:wrap; gap:6px;">
          <span><strong>${f.name}</strong> (${f.presentation}) · Osmolaritat: ${f.osmolarity || "-"} mOsm/L · Fibra: ${f.fiberLabel}</span>
          <span class="badge badge-info">${f.indication}</span>
        </div>
        <div style="margin-top:6px; font-weight:800; color:var(--primary-dark);">
          Aport NE amb ${day.neVolume24hMl} ml/24h (${fmt(m.ne.rateMlHr24, 1)} ml/h):
          +${fmt(m.ne.kcal, 0)} kcal · +${fmt(m.ne.proteinG, 1)} g Proteïnes · +${fmt(m.ne.carbsG, 1)} g HC · +${fmt(m.ne.lipidsG, 1)} g Lípids · +${fmt(m.ne.fiberG, 1)} g Fibra
        </div>
      `;
    }
  }

  // =========================================================================
  // PANTALLA 5: VALORACIÓ DE NUTRICIÓ PARENTERAL (3a VIA)
  // =========================================================================
  function renderScreen6NP(patient, day, m) {
    document.getElementById("context-banner-screen-6").innerHTML = buildContextBannerHtml(day, m);

    document.getElementById("btn-screen6-np-yes").classList.toggle("selected-yes", Boolean(day.npActive));
    document.getElementById("btn-screen6-np-no").classList.toggle("selected-no", !day.npActive && day.npEvaluated);

    const panel = document.getElementById("np-config-panel");
    panel.style.display = day.npActive ? "block" : "none";

    if (!day.npActive) return;

    setVal("inp-np-type", day.npType || "Nutrició parenteral farmàcia");
    setVal("inp-np-vol", day.npTotalVolumeMl);
    setVal("inp-np-aminoven", day.npAminovenG);
    setVal("inp-np-glucose", day.npGlucoseG);
    setVal("inp-np-smoflipid", day.npSmoflipidG);
    setVal("inp-np-na", day.npNa ?? 80);
    setVal("inp-np-k", day.npK ?? 60);
    setVal("inp-np-cl", day.npCl ?? 70);
    setVal("inp-np-p", day.npP ?? 20);
    setVal("inp-np-ca", day.npCa ?? 9);
    setVal("inp-np-vit", day.npVitaminsMl ?? 5);
    setVal("inp-np-oligo", day.npTraceElementsMl ?? 10);

    const npSum = document.getElementById("np-calc-summary");
    if (npSum) {
      npSum.innerHTML = `
        Aminoven 15%: <strong>${fmt(day.npAminovenG, 1)} g (${fmt(day.npAminovenG * 4, 0)} kcal)</strong> ·
        Glucosa: <strong>${fmt(day.npGlucoseG, 1)} g (${fmt(day.npGlucoseG * 4, 0)} kcal)</strong> ·
        Smoflipid 20%: <strong>${fmt(day.npSmoflipidG, 1)} g (${fmt(day.npSmoflipidG * 9, 0)} kcal)</strong><br>
        <strong style="color:var(--primary-dark);">TOTAL NP: +${fmt(m.np.kcal, 0)} kcal</strong> |
        Kcal no proteiques: <strong>${fmt(m.np.nonProteinKcal, 0)} kcal</strong> |
        Ràtio Lípids/Glucosa: <strong>${fmt(m.np.lipidsToGlucoseRatio, 3)}</strong> |
        Kcal no prot / g N: <strong>${fmt(m.np.nonProtKcalPerGNitrogen, 0)}</strong>
      `;
    }
  }

  // =========================================================================
  // PANTALLA 7: MONITORITZACIÓ TOLERÀNCIA GI I METABÒLICA
  // =========================================================================
  function getPreviousDay(patient, day) {
    const idx = patient.days.indexOf(day);
    return idx > 0 ? patient.days[idx - 1] : null;
  }

  function buildGiAlerts(day) {
    const out = [];
    const vrg = Number(day.giVrgMl) || 0;
    const constip = Number(day.giConstipationDays) || 0;
    const diar = Number(day.giDiarrheaCount) || 0;
    if (vrg > 500) {
      out.push({ lvl: "danger", txt: `<strong>Retenció gàstrica ${vrg} ml (&gt; 500 ml):</strong> aturar/reduir temporalment la NE, iniciar procinètics (metoclopramida / eritromicina) i revalorar en 6 h. Si persisteix, valorar sonda postpilòrica (SNJ).` });
    } else if (vrg > 250) {
      out.push({ lvl: "warning", txt: `<strong>Retenció gàstrica ${vrg} ml (250-500 ml):</strong> mantenir NE, capçal a 30-45°, valorar procinètics i controls de VRG.` });
    }
    if (day.giVomiting === "vomiting") {
      out.push({ lvl: "danger", txt: "<strong>Vòmits / regurgitació:</strong> reduir velocitat NE, procinètics, comprovar posició de la sonda; valorar SNJ si persisteix." });
    } else if (day.giVomiting === "nausea") {
      out.push({ lvl: "warning", txt: "<strong>Nàusees / plenitud:</strong> no augmentar la velocitat de NE; valorar procinètics." });
    }
    if (constip >= 3) {
      out.push({
        lvl: constip >= 5 ? "danger" : "warning",
        txt: `<strong>Estrenyiment (${constip} dies sense deposició):</strong> iniciar/intensificar laxants (lactulosa, polietilenglicol), assegurar hidratació i valorar fórmula amb fibra.${day.giOpioids ? " En tractament amb opiacis: valorar metilnaltrexona / naloxona oral." : ""}`
      });
    }
    if (diar >= 3) {
      out.push({ lvl: diar >= 5 ? "danger" : "warning", txt: `<strong>Diarrea (${diar} deposicions líquides/24h):</strong> no aturar la NE de forma sistemàtica; descartar <em>C. difficile</em>, revisar fàrmacs (laxants, antibiòtics, sorbitol), valorar fórmula amb fibra soluble o peptídica i reduir velocitat.` });
    }
    if (day.giDistension === "ileus") {
      out.push({ lvl: "danger", txt: "<strong>Sospita d'ili paralític / PIA elevada:</strong> aturar NE o mantenir-la tròfica (10-20 ml/h), mesurar pressió intraabdominal i valorar Nutrició Parenteral si no s'arriba als requeriments." });
    } else if (day.giDistension === "mild") {
      out.push({ lvl: "warning", txt: "<strong>Distensió abdominal lleu-moderada:</strong> no progressar la NE fins a millora; vigilar VRG i PIA." });
    }
    return out;
  }

  function buildLabAlerts(day) {
    const out = [];
    const tg = numOrNull(day.labTg);
    const fer = numOrNull(day.labFerritin);
    const tsi = numOrNull(day.labTsi);
    const iron = numOrNull(day.labIron);
    const vitd = numOrNull(day.labVitD);
    const thi = numOrNull(day.labThiamine);
    const pre = numOrNull(day.labPrealbumin);
    if (tg !== null) {
      if (tg > 1000) out.push({ lvl: "danger", txt: `<strong>Triglicèrids ${tg} mg/dL (&gt; 1000):</strong> suspendre lípids (Smoflipid i propofol si és possible).` });
      else if (tg > 400) out.push({ lvl: "danger", txt: `<strong>Triglicèrids ${tg} mg/dL (&gt; 400):</strong> reduir l'aport de lípids (NP / propofol / clevidipino) i controlar en 48-72 h.` });
      else if (tg > 200) out.push({ lvl: "warning", txt: `<strong>Triglicèrids ${tg} mg/dL:</strong> lleugerament elevats; vigilar aport lipídic.` });
      else out.push({ lvl: "success", txt: `Triglicèrids ${tg} mg/dL: correctes.` });
    }
    if (tsi !== null || fer !== null || iron !== null) {
      const ironDef = tsi !== null && tsi < 20 && fer !== null && fer < 100;
      const functional = tsi !== null && tsi < 20 && fer !== null && fer >= 100;
      if (ironDef) out.push({ lvl: "danger", txt: `<strong>Ferropènia absoluta</strong> (IST ${tsi}% &lt; 20% i Ferritina ${fer} ng/mL &lt; 100): valorar ferro EV.` });
      else if (functional) out.push({ lvl: "warning", txt: `<strong>Possible ferropènia funcional / inflamatòria</strong> (IST ${tsi}% &lt; 20% amb Ferritina ${fer} ng/mL): interpretar amb PCR; si ferritina &lt; 300 valorar ferro EV.` });
      else out.push({ lvl: "info", txt: `Estudi de ferro: Fe ${iron ?? "-"} µg/dL · Ferritina ${fer ?? "-"} ng/mL · Transferrina ${day.labTransferrin ?? "-"} mg/dL · IST ${tsi ?? "-"}%.` });
    }
    if (vitd !== null) {
      if (vitd < 12) out.push({ lvl: "danger", txt: `<strong>Vitamina D ${vitd} ng/mL (dèficit greu &lt; 12):</strong> suplementar segons protocol.` });
      else if (vitd < 20) out.push({ lvl: "warning", txt: `<strong>Vitamina D ${vitd} ng/mL (dèficit &lt; 20):</strong> valorar suplementació.` });
      else if (vitd < 30) out.push({ lvl: "info", txt: `Vitamina D ${vitd} ng/mL (insuficiència 20-30).` });
      else out.push({ lvl: "success", txt: `Vitamina D ${vitd} ng/mL: correcta.` });
    }
    if (thi !== null) {
      if (thi < 70) out.push({ lvl: day.labThiamineSupp === "no" ? "danger" : "warning", txt: `<strong>Tiamina ${thi} nmol/L (baixa):</strong> ${day.labThiamineSupp === "no" ? "iniciar tiamina 100-300 mg/dia EV" : "mantenir suplementació activa"}.` });
      else out.push({ lvl: "success", txt: `Tiamina ${thi} nmol/L: correcta${day.labThiamineSupp !== "no" ? " (amb suplementació)" : ""}.` });
    }
    if (pre !== null) {
      if (pre < 10) out.push({ lvl: "danger", txt: `<strong>Prealbúmina ${pre} mg/dL (&lt; 10):</strong> desnutrició proteica greu (interpretar amb PCR).` });
      else if (pre < 15) out.push({ lvl: "warning", txt: `<strong>Prealbúmina ${pre} mg/dL (10-15):</strong> desnutrició proteica moderada (interpretar amb PCR).` });
    }
    return out;
  }

  function alertsToHtml(list) {
    return list.map((a) => `<div class="alert-box alert-${a.lvl}" style="margin-top:8px;">${a.txt}</div>`).join("");
  }

  function renderScreen7Monitoring(patient, day, m) {
    // Inputs GI
    setVal("inp-gi-vrg", day.giVrgMl || "");
    setVal("inp-gi-vomiting", day.giVomiting || "no");
    setVal("inp-gi-constipation-days", day.giConstipationDays || "");
    setVal("inp-gi-opioids", day.giOpioids ? "true" : "false");
    setVal("inp-gi-diarrhea-count", day.giDiarrheaCount || "");
    setVal("inp-gi-distension", day.giDistension || "normal");
    // Inputs metabòlics
    const v = (x) => (x === null || x === undefined ? "" : x);
    setVal("inp-lab-urea-plasma", v(day.labUreaPlasma));
    setVal("inp-lab-creatinine", v(day.labCreatinine));
    setVal("inp-urea-24h", v(day.urea24hG));
    setVal("inp-gly-mean", v(day.glyMean));
    setVal("inp-gly-max", v(day.glyMax));
    setVal("inp-insulin-24h", v(day.insulin24h));
    setVal("inp-insulin-rate", v(day.insulinRate));
    setVal("inp-insulin-basal", v(day.insulinBasal));
    setVal("inp-lab-tg", v(day.labTg));
    setVal("inp-lab-iron", v(day.labIron));
    setVal("inp-lab-ferritin", v(day.labFerritin));
    setVal("inp-lab-transferrin", v(day.labTransferrin));
    setVal("inp-lab-tsi", v(day.labTsi));
    setVal("inp-lab-vitd", v(day.labVitD));
    setVal("inp-lab-thiamine", v(day.labThiamine));
    setVal("inp-lab-thiamine-supp", day.labThiamineSupp || "no");
    setVal("inp-lab-prealbumin", v(day.labPrealbumin));

    // 1. Alertes GI
    const giEl = document.getElementById("gi-protocol-alerts");
    if (giEl) {
      const gi = buildGiAlerts(day);
      giEl.innerHTML = gi.length
        ? alertsToHtml(gi)
        : `<div class="alert-box alert-success" style="margin-top:8px;">✅ Bona tolerància gastrointestinal: es pot mantenir / progressar l'aport enteral segons objectius.</div>`;
    }

    // 2. UCR i Balanç Nitrogenat
    const ucrEl = document.getElementById("ucr-and-nbal-results");
    if (ucrEl) {
      let html = "";
      if (m.ucr) {
        const prev = getPreviousDay(patient, day);
        const prevM = prev ? computeMetrics(patient, prev) : null;
        let trend = "";
        if (prevM && prevM.ucr) {
          const diff = m.ucr.ucrSI - prevM.ucr.ucrSI;
          trend = ` · ${diff > 0 ? "▲" : diff < 0 ? "▼" : "="} ${fmt(Math.abs(diff), 0)} vs dia ${prev.dayNumber}`;
        }
        html += `
          <div class="calc-stat-box highlight">
            <div class="stat-title">UCR (Urea / Creatinina)</div>
            <div class="stat-num">${fmt(m.ucr.ucrSI, 0)}</div>
            <div class="stat-formula">Urea (mmol/L) / Creat (µmol/L) × 1000${trend}</div>
          </div>
          <div class="calc-stat-box">
            <div class="stat-title">RÀTIO UREA/Cr (mg/dL)</div>
            <div class="stat-num">${fmt(m.ucr.ratioMgDl, 1)}</div>
            <div class="stat-formula">${fmt(m.ucr.ureaMgDl, 0)} / ${fmt(m.ucr.creatMgDl, 2)} mg/dL</div>
          </div>
          <div class="calc-stat-box">
            <div class="stat-title">BUN / Cr</div>
            <div class="stat-num" style="color:${m.ucr.bunCr > 20 ? "var(--danger)" : "var(--text)"}">${fmt(m.ucr.bunCr, 1)}</div>
            <div class="stat-formula">BUN = Urea / 2,14 = ${fmt(m.ucr.bun, 1)} mg/dL ${m.ucr.bunCr > 20 ? "· &gt; 20: catabolisme / prerenal" : ""}</div>
          </div>`;
      } else {
        html += `<div class="calc-stat-box"><div class="stat-title">UCR</div><div class="stat-num">—</div><div class="stat-formula">Introdueix Urea i Creatinina plasmàtiques</div></div>`;
      }
      if (m.nitrogen.hasUrea24h) {
        html += `
          <div class="calc-stat-box highlight">
            <div class="stat-title">BALANÇ NITROGENAT</div>
            <div class="stat-num">${fmt(m.nitrogen.balance, 1)} g N/24h</div>
            <div class="stat-formula">N aportat ${fmt(m.nitrogen.nitrogenIntakeG, 1)} g (${fmt(m.totals.proteinG, 1)} g Prot / 6,25) − (${fmt(m.nitrogen.urea24hG, 1)} + 4)<br><span class="badge ${m.nitrogen.badgeClass}">${m.nitrogen.status}</span></div>
          </div>`;
      } else {
        html += `<div class="calc-stat-box"><div class="stat-title">BALANÇ NITROGENAT</div><div class="stat-num">—</div><div class="stat-formula">Introdueix la urea en orina de 24h</div></div>`;
      }
      ucrEl.innerHTML = html;
    }

    // 3. Taula setmanal de glicèmies i insulina
    const tb = document.getElementById("weekly-glycemia-tbody");
    if (tb) {
      const rows = m.weekly.rows;
      const cellIn = (field, i, val, step) =>
        `<td class="num"><input type="number" class="form-control weekly-gly-input" data-field="${field}" data-idx="${i}" step="${step}" min="0" value="${val === null ? "" : val}" style="width:72px; text-align:right; padding:4px 6px;"></td>`;
      const todayCell = (val, dec) => `<td class="num" style="background:var(--primary-soft); font-weight:800;">${val === null ? "—" : fmt(val, dec)}</td>`;
      tb.innerHTML = `
        <tr>
          <td><strong>Glicèmia mitjana (mg/dL)</strong></td>
          ${rows.slice(0, 6).map((r, i) => cellIn("glyMean", i, r.glyMean, 1)).join("")}
          ${todayCell(rows[6].glyMean, 0)}
          <td class="num"><strong>${m.weekly.glyMean7d === null ? "—" : fmt(m.weekly.glyMean7d, 0)}</strong></td>
        </tr>
        <tr>
          <td><strong>Insulina total (UI/24h)</strong></td>
          ${rows.slice(0, 6).map((r, i) => cellIn("insulin", i, r.insulin, 1)).join("")}
          ${todayCell(rows[6].insulin, 0)}
          <td class="num"><strong>${m.weekly.insulinMean7d === null ? "—" : fmt(m.weekly.insulinMean7d, 1)}</strong></td>
        </tr>
      `;
      tb.querySelectorAll(".weekly-gly-input").forEach((inp) => {
        inp.addEventListener("change", () => {
          const i = Number(inp.getAttribute("data-idx"));
          const f = inp.getAttribute("data-field");
          day.weeklyGly[i][f] = numOrNull(inp.value);
          saveState();
          renderAll();
        });
      });
    }

    // Índex de Resistència a la Insulina
    const iriEl = document.getElementById("insulin-resistance-results");
    if (iriEl) {
      const iri = m.iri;
      const trend = m.weekly.insulinTrendPct;
      let trendTxt = "Calen ≥ 4 dies amb insulina registrada";
      let trendColor = "var(--text)";
      if (trend !== null) {
        if (trend <= -20) {
          trendTxt = `▼ ${fmt(Math.abs(trend), 0)}% · Millora de la sensibilitat (cap a fase anabòlica)`;
          trendColor = "var(--success, #15803d)";
        } else if (trend >= 20) {
          trendTxt = `▲ ${fmt(trend, 0)}% · Augment de la resistència a la insulina`;
          trendColor = "var(--danger)";
        } else trendTxt = `${trend > 0 ? "▲" : "▼"} ${fmt(Math.abs(trend), 0)}% · Requeriments estables`;
      }
      iriEl.innerHTML = `
        <div class="calc-stat-box highlight">
          <div class="stat-title">IRI · UI INSULINA / g HC</div>
          <div class="stat-num">${iri && iri.perGCarbs !== null ? fmt(iri.perGCarbs, 2) : "—"}</div>
          <div class="stat-formula">${iri ? `${fmt(iri.totalInsulin, 0)} UI / ${fmt(m.totals.carbsG, 0)} g HC aportats (totes les vies)` : "Introdueix la insulina d'avui"}</div>
        </div>
        <div class="calc-stat-box">
          <div class="stat-title">INSULINA / kg / DIA</div>
          <div class="stat-num">${iri && iri.perKg !== null ? fmt(iri.perKg, 2) : "—"} UI/kg</div>
          <div class="stat-formula">Mitjana 7d: ${m.weekly.insulinPerKg7d === null ? "—" : fmt(m.weekly.insulinPerKg7d, 2) + " UI/kg/d"}</div>
        </div>
        <div class="calc-stat-box">
          <div class="stat-title">PRODUCTE BIC × GLICÈMIA</div>
          <div class="stat-num">${iri && iri.rateXGly !== null ? fmt(iri.rateXGly, 2) : "—"}</div>
          <div class="stat-formula">(UI/h × Glicèmia mg/dL) / 100</div>
        </div>
        <div class="calc-stat-box">
          <div class="stat-title">TENDÈNCIA 7 DIES (${m.weekly.daysRecorded} dies)</div>
          <div class="stat-num" style="font-size:14px; color:${trendColor};">${trendTxt}</div>
          <div class="stat-formula">Glicèmia mitjana 7d: ${m.weekly.glyMean7d === null ? "—" : fmt(m.weekly.glyMean7d, 0) + " mg/dL"}${numOrNull(day.glyMax) !== null && day.glyMax > 180 ? ` · <span style="color:var(--danger);">Màx avui ${day.glyMax} &gt; 180</span>` : ""}</div>
        </div>
      `;
    }

    // 4. Analítica setmanal
    const labsEl = document.getElementById("weekly-labs-alerts");
    if (labsEl) {
      const labs = buildLabAlerts(day);
      labsEl.innerHTML = labs.length ? alertsToHtml(labs) : `<div style="font-size:12.5px; color:var(--text-light);">Introdueix els paràmetres analítics setmanals per veure'n la interpretació.</div>`;
    }
  }

  // =========================================================================
  // PANTALLA 8: BALANÇ FINAL DEL DIA I NOTA SAP
  // =========================================================================
  function renderScreen8Balance(patient, day, m) {
    document.getElementById("screen-8-title").textContent = `📊 Balanç Final · Dia ${day.dayNumber} (${day.location}) i Nota SAP`;

    const tbody = document.getElementById("global-balance-tbody");
    if (tbody) {
      tbody.innerHTML = `
        <tr>
          <td><strong>Volum (ml)</strong></td>
          <td class="num">${fmt(m.nonNutr.volumeMl, 0)}</td>
          <td class="num">-</td>
          <td class="num">${fmt(m.supplements.volumeMl, 0)}</td>
          <td class="num">${fmt(m.ne.totalVolumeMl, 0)}</td>
          <td class="num">${fmt(m.np.volumeMl, 0)}</td>
          <td class="num"><strong>${fmt(m.totals.volumeMl, 0)} ml</strong></td>
          <td class="num">${fmt(m.totals.volumePerKg, 1)} ml/kg</td>
          <td class="num">25-35 ml/kg</td>
          <td class="num"><span class="badge badge-info">Hidratació</span></td>
        </tr>
        <tr>
          <td><strong>Energia (kcal)</strong></td>
          <td class="num">${fmt(m.nonNutr.kcal, 0)}</td>
          <td class="num">${fmt(m.oralTray.kcal, 0)}</td>
          <td class="num">${fmt(m.supplements.kcal, 0)}</td>
          <td class="num">${fmt(m.ne.kcal, 0)}</td>
          <td class="num">${fmt(m.np.kcal, 0)}</td>
          <td class="num"><strong>${fmt(m.totals.kcal, 0)} kcal</strong></td>
          <td class="num"><strong>${fmt(m.totals.kcalPerKg, 1)} kcal/kg</strong></td>
          <td class="num">${fmt(m.targets.energyKcal, 0)} kcal</td>
          <td class="num">${getAdequacyBadge(m.totals.kcalAdequacyPct)}</td>
        </tr>
        <tr>
          <td><strong>Proteïnes (g)</strong></td>
          <td class="num">0,0</td>
          <td class="num">${fmt(m.oralTray.proteinG, 1)}</td>
          <td class="num">${fmt(m.supplements.proteinG, 1)}</td>
          <td class="num">${fmt(m.ne.proteinG, 1)}</td>
          <td class="num">${fmt(m.np.proteinG, 1)}</td>
          <td class="num"><strong>${fmt(m.totals.proteinG, 1)} g</strong></td>
          <td class="num"><strong>${fmt(m.totals.proteinPerKg, 2)} g/kg</strong></td>
          <td class="num">${fmt(m.targets.proteinG, 1)} g</td>
          <td class="num">${getAdequacyBadge(m.totals.proteinAdequacyPct)}</td>
        </tr>
        <tr>
          <td><strong>Hidrats de Carboni (g)</strong></td>
          <td class="num">${fmt(m.nonNutr.carbsG, 1)}</td>
          <td class="num">${fmt(m.oralTray.carbsG, 1)}</td>
          <td class="num">${fmt(m.supplements.carbsG, 1)}</td>
          <td class="num">${fmt(m.ne.carbsG, 1)}</td>
          <td class="num">${fmt(m.np.carbsG, 1)}</td>
          <td class="num"><strong>${fmt(m.totals.carbsG, 1)} g</strong></td>
          <td class="num"><strong>${fmt(m.totals.glucoseOxidationRateMgKgMin, 2)} mg/kg/min</strong></td>
          <td class="num">≤ 4-5 mg/kg/min</td>
          <td class="num">
            ${
              m.totals.glucoseOxidationRateMgKgMin > 5
                ? '<span class="badge badge-danger">> 5 mg/kg/min Excés!</span>'
                : '<span class="badge badge-success">Correcte</span>'
            }
          </td>
        </tr>
        <tr>
          <td><strong>Lípids (g)</strong></td>
          <td class="num">${fmt(m.nonNutr.lipidsG, 1)}</td>
          <td class="num">${fmt(m.oralTray.lipidsG, 1)}</td>
          <td class="num">${fmt(m.supplements.lipidsG, 1)}</td>
          <td class="num">${fmt(m.ne.lipidsG, 1)}</td>
          <td class="num">${fmt(m.np.lipidsG, 1)}</td>
          <td class="num"><strong>${fmt(m.totals.lipidsG, 1)} g</strong></td>
          <td class="num"><strong>${fmt(m.totals.lipidsPerKg, 2)} g/kg</strong></td>
          <td class="num">${fmt(m.targets.lipidsG, 1)} g</td>
          <td class="num">
            ${
              m.totals.lipidsPerKg > 1.5
                ? '<span class="badge badge-danger">> 1,5 g/kg Excés!</span>'
                : getAdequacyBadge(m.totals.lipidsAdequacyPct)
            }
          </td>
        </tr>
        <tr>
          <td><strong>Fibra (g)</strong></td>
          <td class="num">0,0</td>
          <td class="num">${fmt(m.oralTray.fiberG, 1)}</td>
          <td class="num">${fmt(m.supplements.fiberG, 1)}</td>
          <td class="num">${fmt(m.ne.fiberG, 1)}</td>
          <td class="num">0,0</td>
          <td class="num"><strong>${fmt(m.totals.fiberG, 1)} g</strong></td>
          <td class="num">-</td>
          <td class="num">15-30 g</td>
          <td class="num"><span class="badge badge-info">Fibra</span></td>
        </tr>
      `;
    }

    const alertsBox = document.getElementById("metabolic-alerts-box");
    if (alertsBox) {
      const msgs = [];
      if (m.totals.glucoseOxidationRateMgKgMin > 5.0) {
        msgs.push(`<div class="alert-box alert-danger">🚨 <strong>Sobrecàrrega d'Hidrats de Carboni (${fmt(m.totals.glucoseOxidationRateMgKgMin, 2)} mg/kg/min):</strong> Supera el límit recomanat de 4-5 mg/kg/min.</div>`);
      }
      if (m.totals.lipidsPerKg > 1.5) {
        msgs.push(`<div class="alert-box alert-danger">🚨 <strong>Excés de Lípids (${fmt(m.totals.lipidsPerKg, 2)} g/kg/dia):</strong> Supera el límit de seguretat d'1,5 g/kg/dia.</div>`);
      }
      alertsBox.innerHTML = msgs.join("");
    }

    setVal("inp-clinical-notes", day.clinicalNotes || "");

    const sumBox = document.getElementById("final-metabolic-summary-box");
    if (sumBox) {
      const gi = buildGiAlerts(day);
      const labs = buildLabAlerts(day).filter((a) => a.lvl === "danger" || a.lvl === "warning");
      sumBox.innerHTML = `
        <div style="margin-bottom:6px;"><strong>Pes del dia / Pes de treball:</strong> ${fmt(m.anthropometry.actualWeight, 1)} / ${fmt(m.anthropometry.workWeight, 1)} kg</div>
        <div style="margin-bottom:6px;"><strong>Balanç nitrogenat:</strong> ${m.nitrogen.hasUrea24h ? `${fmt(m.nitrogen.balance, 1)} g/24h <span class="badge ${m.nitrogen.badgeClass}">${m.nitrogen.status}</span>` : "No registrat"}</div>
        <div style="margin-bottom:6px;"><strong>UCR:</strong> ${m.ucr ? `${fmt(m.ucr.ucrSI, 0)} (BUN/Cr ${fmt(m.ucr.bunCr, 1)})` : "No registrat"}</div>
        <div style="margin-bottom:6px;"><strong>Resistència insulina:</strong> ${m.iri ? `${fmt(m.iri.totalInsulin, 0)} UI/24h · ${m.iri.perGCarbs !== null ? fmt(m.iri.perGCarbs, 2) + " UI/g HC" : "-"} · ${m.iri.perKg !== null ? fmt(m.iri.perKg, 2) + " UI/kg" : "-"}` : "No registrat"}${m.weekly.insulinTrendPct !== null ? ` · Tendència 7d ${m.weekly.insulinTrendPct > 0 ? "+" : ""}${fmt(m.weekly.insulinTrendPct, 0)}%` : ""}</div>
        <div style="margin-bottom:6px;"><strong>Tolerància GI:</strong> ${gi.length ? `<span class="badge badge-warning">${gi.length} incidència(es)</span>` : '<span class="badge badge-success">Correcta</span>'}</div>
        <div><strong>Analítica setmanal:</strong> ${labs.length ? `<span class="badge badge-danger">${labs.length} alerta(es)</span>` : "Sense alertes"}</div>
      `;
    }

    const noteEl = document.getElementById("clinical-note-textarea");
    if (noteEl) {
      noteEl.value = buildClinicalNoteText(patient, day, m);
    }
  }

  function buildClinicalNoteText(patient, day, m) {
    const lines = [];
    lines.push(`=== VALORACIÓ I PAUTA NUTRICIONAL (${day.location} - Dia ${day.dayNumber}: ${day.date || "Avui"}) ===`);
    lines.push(`Pacient: ${patient.name} (${patient.sex === "M" ? "Home" : "Dona"}, ${patient.age}a) ${patient.nhc ? "· NHC: " + patient.nhc : ""}`);
    lines.push(
      `Valoració Ingrés: Talla ${patient.heightCm} cm | Pes ingrés: ${fmt(patient.admissionWeightKg, 1)} kg (Habitual: ${fmt(patient.habitualWeightKg, 1)} kg, ${
        m.anthropometry.weightChangeKg < 0
          ? `Pèrdua: ${fmt(m.anthropometry.weightLossPct, 1)}%`
          : m.anthropometry.weightChangeKg > 0
          ? `Guany: +${fmt(m.anthropometry.weightGainPct, 1)}%, sense pèrdua de pes`
          : "sense pèrdua de pes"
      }) | IMC: ${fmt(m.anthropometry.bmi, 1)} kg/m²`
    );
    lines.push(
      `Pes del dia: ${fmt(m.anthropometry.actualWeight, 1)} kg | Pes Ideal: ${fmt(m.anthropometry.idealWeight, 1)} kg | PES DE TREBALL: ${fmt(m.anthropometry.workWeight, 1)} kg ${m.anthropometry.isObeseAdjusted ? "(Pes Ajustat per IMC>30)" : "(Pes Actual)"}`
    );
    lines.push("");
    lines.push(`OBJECTIUS DEL DIA ${day.dayNumber} (${day.location} - ${day.phaseLabel || ""}):`);
    lines.push(
      `- Energia: ${fmt(m.targets.energyKcal, 0)} kcal/dia (${day.energyMethod === "ic" ? `${day.icPercentTarget}% CI` : `${day.kcalPerKgTarget} kcal/kg`}) | Proteïnes: ${fmt(m.targets.proteinG, 1)} g/dia (${day.proteinPerKgTarget} g/kg) | Lípids: ${fmt(m.targets.lipidsG, 1)} g/dia`
    );
    lines.push("");
    lines.push(`VIES D'APORTACIÓ PAUTADES:`);
    if (m.nonNutr.kcal > 0) {
      const parts = [];
      const drugTxt = (name, rate, hours, vol) =>
        Number(vol) > 0 ? `${name} ${Number(rate) > 0 ? `${fmt(rate, 1)} ml/h × ${hours}h = ` : ""}${fmt(vol, 0)} ml` : null;
      parts.push(drugTxt(`SG ${Math.round((day.sgConcentration || 0) * 100)}%`, day.sgRateMlH, day.sgHours, day.sgVolumeMl));
      parts.push(drugTxt("Propofol", day.propofolRateMlH, day.propofolHours, day.propofolVolumeMl));
      parts.push(drugTxt("Citrat 4%", day.citrateRateMlH, day.citrateHours, day.citrateVolumeMl));
      parts.push(drugTxt("Clevidipino", day.clevidipineRateMlH, day.clevidipineHours, day.clevidipineVolumeMl));
      if (Number(day.lactuloseUnits) > 0) parts.push(`Lactulosa ${day.lactuloseUnits} u`);
      lines.push(
        `• Aports no nutricionals (${parts.filter(Boolean).join(", ")}): ${fmt(m.nonNutr.kcal, 0)} kcal (${fmt(m.nonNutr.carbsG, 1)}g gluc, ${fmt(m.nonNutr.lipidsG, 1)}g líp)`
      );
    }
    if (day.oralActive && m.oralTray.diet) {
      lines.push(
        `• Via Oral: Dieta ${m.oralTray.diet.name} (Ingesta Comstock ${fmt(m.oralTray.globalEatenPct, 0)}%) -> ${fmt(m.oralTray.kcal, 0)} kcal i ${fmt(m.oralTray.proteinG, 1)} g Prot`
      );
    }
    if (m.supplements.items.length > 0) {
      const desc = m.supplements.items.map((it) => `${it.units}x ${it.product.name}`).join(" + ");
      lines.push(`• Suplements / Mòduls (${desc}): ${fmt(m.supplements.kcal, 0)} kcal i ${fmt(m.supplements.proteinG, 1)} g Prot`);
    }
    if (day.neActive && m.ne.formula) {
      lines.push(
        `• Nutrició Enteral (${m.ne.formula.name}): ${day.neVolume24hMl} ml/24h (${fmt(m.ne.rateMlHr24, 1)} ml/h) -> ${fmt(m.ne.kcal, 0)} kcal i ${fmt(m.ne.proteinG, 1)} g Prot`
      );
    }
    if (day.npActive) {
      lines.push(
        `• Nutrició Parenteral (${day.npType}): Aminoven ${fmt(day.npAminovenG, 1)}g, Glucosa ${fmt(day.npGlucoseG, 1)}g, Smoflipid ${fmt(day.npSmoflipidG, 1)}g (Vol ${fmt(day.npTotalVolumeMl, 0)} ml) -> ${fmt(m.np.kcal, 0)} kcal i ${fmt(m.np.proteinG, 1)} g Prot`
      );
    }
    lines.push("");
    lines.push(`BALANÇ TOTAL DEL DIA:`);
    lines.push(
      `- Energia Total: ${fmt(m.totals.kcal, 0)} kcal/24h (${fmt(m.totals.kcalPerKg, 1)} kcal/kg) -> ${fmt(m.totals.kcalAdequacyPct, 0)}% de l'objectiu`
    );
    lines.push(
      `- Proteïnes Totals: ${fmt(m.totals.proteinG, 1)} g/24h (${fmt(m.totals.proteinPerKg, 2)} g/kg) -> ${fmt(m.totals.proteinAdequacyPct, 0)}% de l'objectiu`
    );
    lines.push(
      `- Taxa oxidació HC: ${fmt(m.totals.glucoseOxidationRateMgKgMin, 2)} mg/kg/min | Lípids: ${fmt(m.totals.lipidsPerKg, 2)} g/kg`
    );
    lines.push("");
    lines.push(`MONITORITZACIÓ TOLERÀNCIA GI:`);
    const vomTxt = { no: "No", nausea: "Nàusees", vomiting: "Vòmits/regurgitació" }[day.giVomiting] || "No";
    const disTxt = { normal: "Abdomen tou", mild: "Distensió lleu-moderada", ileus: "Sospita d'ili / PIA elevada" }[day.giDistension] || "Abdomen tou";
    lines.push(
      `- VRG màx: ${day.giVrgMl || 0} ml | Nàusees/vòmits: ${vomTxt} | Dies sense deposició: ${day.giConstipationDays || 0}${day.giOpioids ? " (amb opiacis)" : ""} | Deposicions líquides: ${day.giDiarrheaCount || 0}/24h | ${disTxt}`
    );
    lines.push("");
    lines.push(`MONITORITZACIÓ METABÒLICA:`);
    lines.push(
      `- Balanç nitrogenat: ${m.nitrogen.hasUrea24h ? `${fmt(m.nitrogen.balance, 1)} g/24h (${m.nitrogen.status}; urea orina ${fmt(m.nitrogen.urea24hG, 1)} g/24h)` : "no registrat"}`
    );
    if (m.ucr) {
      lines.push(
        `- Urea ${fmt(m.ucr.ureaMgDl, 0)} mg/dL, Creatinina ${fmt(m.ucr.creatMgDl, 2)} mg/dL -> UCR ${fmt(m.ucr.ucrSI, 0)} | Urea/Cr ${fmt(m.ucr.ratioMgDl, 1)} | BUN/Cr ${fmt(m.ucr.bunCr, 1)}`
      );
    }
    if (m.iri || numOrNull(day.glyMean) !== null) {
      lines.push(
        `- Glicèmia mitjana ${day.glyMean ?? "-"} mg/dL (màx ${day.glyMax ?? "-"}) | Insulina ${m.iri ? fmt(m.iri.totalInsulin, 0) : "-"} UI/24h${numOrNull(day.insulinRate) !== null ? ` (BIC ${day.insulinRate} UI/h)` : ""} | IRI: ${m.iri && m.iri.perGCarbs !== null ? fmt(m.iri.perGCarbs, 2) + " UI/g HC" : "-"}, ${m.iri && m.iri.perKg !== null ? fmt(m.iri.perKg, 2) + " UI/kg/d" : "-"}${m.weekly.insulinTrendPct !== null ? ` | Tendència insulina 7d: ${m.weekly.insulinTrendPct > 0 ? "+" : ""}${fmt(m.weekly.insulinTrendPct, 0)}%` : ""}`
      );
    }
    const labParts = [];
    if (numOrNull(day.labTg) !== null) labParts.push(`TG ${day.labTg} mg/dL`);
    if (numOrNull(day.labIron) !== null) labParts.push(`Fe ${day.labIron} µg/dL`);
    if (numOrNull(day.labFerritin) !== null) labParts.push(`Ferritina ${day.labFerritin} ng/mL`);
    if (numOrNull(day.labTransferrin) !== null) labParts.push(`Transferrina ${day.labTransferrin} mg/dL`);
    if (numOrNull(day.labTsi) !== null) labParts.push(`IST ${day.labTsi}%`);
    if (numOrNull(day.labVitD) !== null) labParts.push(`Vit D ${day.labVitD} ng/mL`);
    if (numOrNull(day.labThiamine) !== null) labParts.push(`Tiamina ${day.labThiamine} nmol/L`);
    if (day.labThiamineSupp && day.labThiamineSupp !== "no") labParts.push(`suplementació tiamina ${day.labThiamineSupp}`);
    if (numOrNull(day.labPrealbumin) !== null) labParts.push(`Prealbúmina ${day.labPrealbumin} mg/dL`);
    if (labParts.length) lines.push(`- Analítica setmanal: ${labParts.join(" | ")}`);
    if (day.clinicalNotes) {
      lines.push(`- Observacions: ${day.clinicalNotes}`);
    }
    return lines.join("\n");
  }

  // =========================================================================
  // MODALS DE SUPORT (EVOLUCIÓ I CATÀLEG HUMT)
  // =========================================================================
  function renderModals(patient, day) {
    const evoTbody = document.getElementById("evolution-table-tbody");
    const chartEl = document.getElementById("evolution-svg-chart");
    const list = patient.days.map((d) => ({ day: d, metrics: computeMetrics(patient, d) }));

    if (evoTbody) {
      evoTbody.innerHTML = list
        .map(
          ({ day: d, metrics: dm }) => `
          <tr>
            <td><strong>Dia ${d.dayNumber}</strong> (${d.date || "-"})</td>
            <td><span class="badge ${d.location === "UCI" ? "badge-uci" : "badge-planta"}">${d.location}</span> ${d.phaseLabel || ""}</td>
            <td class="num">${fmt(dm.anthropometry.actualWeight, 1)} / ${fmt(dm.anthropometry.workWeight, 1)} kg</td>
            <td class="num">${fmt(dm.nonNutr.kcal, 0)}</td>
            <td class="num">${fmt(dm.oralTray.kcal + dm.supplements.kcal, 0)}</td>
            <td class="num">${fmt(dm.ne.kcal, 0)}</td>
            <td class="num">${fmt(dm.np.kcal, 0)}</td>
            <td class="num"><strong>${fmt(dm.totals.kcal, 0)} / ${fmt(dm.targets.energyKcal, 0)} kcal</strong> (${fmt(dm.totals.kcalAdequacyPct, 0)}%)</td>
            <td class="num"><strong>${fmt(dm.totals.proteinG, 1)} / ${fmt(dm.targets.proteinG, 1)} g</strong> (${fmt(dm.totals.proteinAdequacyPct, 0)}%)</td>
            <td class="num">${dm.ucr ? `UCR ${fmt(dm.ucr.ucrSI, 0)}` : "-"} / ${dm.nitrogen.hasUrea24h ? `<span class="badge ${dm.nitrogen.badgeClass}">${fmt(dm.nitrogen.balance, 1)} g</span>` : "-"}</td>
          </tr>
        `
        )
        .join("");
    }

    if (chartEl) {
      const w = 720, h = 210, padL = 50, padR = 25, padT = 20, padB = 38;
      const plotW = w - padL - padR, plotH = h - padT - padB;
      const maxK = Math.max(2200, ...list.map((x) => Math.max(x.metrics.totals.kcal, x.metrics.targets.energyKcal) * 1.15));
      const groupW = plotW / Math.max(1, list.length);
      const barW = Math.min(58, groupW * 0.55);
      let bars = "", pts = [];

      list.forEach(({ day: d, metrics: dm }, i) => {
        const cx = padL + i * groupW + groupW / 2;
        const x = cx - barW / 2;
        let curY = padT + plotH;
        [
          { val: dm.nonNutr.kcal, c: "#94a3b8" },
          { val: dm.oralTray.kcal + dm.supplements.kcal, c: "#0284c7" },
          { val: dm.ne.kcal, c: "#0f766e" },
          { val: dm.np.kcal, c: "#6366f1" }
        ].forEach((s) => {
          if (s.val > 0) {
            const bh = (s.val / maxK) * plotH;
            curY -= bh;
            bars += `<rect x="${x}" y="${curY}" width="${barW}" height="${bh}" fill="${s.c}" rx="2"/>`;
          }
        });
        const ty = padT + plotH - (dm.targets.energyKcal / maxK) * plotH;
        pts.push(`${cx},${ty}`);
        bars += `<text x="${cx}" y="${curY - 5}" text-anchor="middle" font-size="11" font-weight="700">${fmt(dm.totals.kcal, 0)} kcal</text>`;
        bars += `<text x="${cx}" y="${padT + plotH + 16}" text-anchor="middle" font-size="11" font-weight="700">Dia ${d.dayNumber} (${d.location})</text>`;
      });

      chartEl.innerHTML = `
        <svg viewBox="0 0 ${w} ${h}" style="width:100%; height:auto; background:#fff; border:1px solid var(--border); border-radius:8px;">
          <line x1="${padL}" y1="${padT}" x2="${padL}" y2="${padT + plotH}" stroke="#cbd5e1"/>
          <line x1="${padL}" y1="${padT + plotH}" x2="${w - padR}" y2="${padT + plotH}" stroke="#cbd5e1"/>
          ${bars}
          ${pts.length > 1 ? `<polyline fill="none" stroke="#dc2626" stroke-width="2" stroke-dasharray="4,4" points="${pts.join(" ")}"/>` : ""}
        </svg>
      `;
    }

    const enteralGrid = document.getElementById("catalog-enteral-grid");
    if (enteralGrid && enteralGrid.innerHTML.trim() === "") {
      const items = [
        ...window.HUMT_DATA.enteralFormulas.map((f) => ({
          title: f.name,
          badge: "Nutrició Enteral",
          sub: `${f.kcalPerMl} kcal/ml · Prot: ${f.per100ml.protein}g/100ml · Fibra: ${f.fiberLabel}`,
          ind: f.indication
        })),
        ...window.HUMT_DATA.supplementsAndModules.map((s) => ({
          title: s.name,
          badge: s.type === "modul" ? "Mòdul" : "Suplement Oral",
          sub: `Per ${s.unitLabel}: ${s.perUnit.kcal} kcal · Prot: ${s.perUnit.protein}g`,
          ind: s.indication
        }))
      ];
      enteralGrid.innerHTML = items
        .map(
          (it) => `
          <div style="border:1px solid var(--border); border-radius:8px; padding:10px; background:var(--surface-alt);">
            <span class="badge badge-info">${it.badge}</span>
            <div style="font-weight:700; margin-top:4px;">${it.title}</div>
            <div style="font-size:12px; color:var(--primary-dark); font-weight:600;">${it.sub}</div>
            <div style="font-size:11.5px; color:var(--text-muted); margin-top:4px;">${it.ind}</div>
          </div>
        `
        )
        .join("");
    }

    const dietsTbody = document.getElementById("catalog-diets-tbody");
    if (dietsTbody) {
      const q = (state.dietSearchQuery || "").toLowerCase().trim();
      const filtered = window.HUMT_DATA.hospitalDiets.filter(
        (d) => !q || d.name.toLowerCase().includes(q) || d.indication.toLowerCase().includes(q) || d.group.toLowerCase().includes(q)
      );
      dietsTbody.innerHTML = filtered
        .map(
          (d) => `
          <tr>
            <td><strong>${d.name}</strong><br><small style="color:var(--text-light);">${d.group}</small></td>
            <td class="num"><strong>${fmt(d.kcal, 0)}</strong></td>
            <td class="num"><strong>${fmt(d.protein, 1)}g</strong></td>
            <td class="num">${fmt(d.lipids, 1)}g</td>
            <td class="num">${fmt(d.carbs, 1)}g</td>
            <td class="num">${fmt(d.fiber, 1)}g</td>
            <td style="font-size:11.5px;"><strong>${d.indication}</strong><br><span style="color:var(--text-muted);">${d.menu}</span></td>
          </tr>
        `
        )
        .join("");
    }

    const protoEl = document.getElementById("protocol-guides-container");
    if (protoEl && protoEl.innerHTML.trim() === "") {
      protoEl.innerHTML = window.HUMT_DATA.protocolGuides
        .map(
          (g) => `
          <div style="border:1px solid var(--border); border-radius:8px; padding:12px; background:var(--surface-alt);">
            <strong style="font-size:13.5px; color:var(--primary-dark);">📋 ${g.title}</strong>
            <div style="margin-top:8px;">
              ${g.items.map((it) => `<div style="margin-bottom:6px; font-size:12px;"><strong>• ${it.label}:</strong> ${it.detail}</div>`).join("")}
            </div>
          </div>
        `
        )
        .join("");
    }
  }

  function createNextDay(targetLocation) {
    const p = getActivePatient();
    const curDay = getActiveDay(p);
    const maxDay = Math.max(...p.days.map((d) => d.dayNumber || 1));
    const nextNum = maxDay + 1;
    const nextD = JSON.parse(JSON.stringify(curDay));

    nextD.dayNumber = nextNum;
    nextD.location = targetLocation;
    nextD.phaseLabel = targetLocation === "PLANTA" ? `Dia ${nextNum} Planta - Seguiment` : `Dia ${nextNum} UCI - Evolució`;
    nextD.date = new Date().toISOString().slice(0, 10);

    // La Valoració a l'Ingrés (Pantalla 1) ja queda guardada del 1r dia!
    // Per tant, el nou dia s'obre directament a la Pantalla 2 (Objectius del Dia).
    nextD.objectivesCompleted = false;
    nextD.nonNutrEvaluated = false;
    nextD.oralEvaluated = false;
    nextD.neEvaluated = false;
    nextD.npEvaluated = false;
    nextD.monitoringVisited = false;
    nextD.currentScreen = 2;

    // Desplaça el registre setmanal de glicèmies/insulina: el dia d'avui passa a ser "Ahir"
    const curTotalIns =
      numOrNull(curDay.insulin24h) !== null || numOrNull(curDay.insulinBasal) !== null
        ? (numOrNull(curDay.insulin24h) || 0) + (numOrNull(curDay.insulinBasal) || 0)
        : null;
    const prevWeek = Array.isArray(curDay.weeklyGly) && curDay.weeklyGly.length === 6 ? curDay.weeklyGly : createBlankDay(1).weeklyGly;
    nextD.weeklyGly = [...prevWeek.slice(1).map((r) => ({ ...r })), { glyMean: numOrNull(curDay.glyMean), insulin: curTotalIns }];
    nextD.glyMean = null;
    nextD.glyMax = null;
    nextD.insulin24h = null;
    // Tolerància GI i paràmetres diaris es reinicien (l'analítica setmanal es manté fins a la propera)
    nextD.giVrgMl = 0;
    nextD.giVomiting = "no";
    nextD.giDiarrheaCount = 0;
    nextD.giDistension = "normal";
    nextD.giConstipationDays = 0;
    nextD.urea24hG = null;
    nextD.clinicalNotes = "";

    if (targetLocation === "PLANTA") {
      nextD.kcalPerKgTarget = 25;
      nextD.proteinPerKgTarget = 1.5;
      nextD.sgVolumeMl = 0;
      nextD.sgRateMlH = 0;
      nextD.propofolVolumeMl = 0;
      nextD.propofolRateMlH = 0;
      nextD.citrateVolumeMl = 0;
      nextD.citrateRateMlH = 0;
      nextD.clevidipineVolumeMl = 0;
      nextD.clevidipineRateMlH = 0;
      nextD.insulinRate = null;
      nextD.npActive = false;
    }

    p.days.push(nextD);
    p.activeDayIndex = p.days.length - 1;
    saveState();
    renderAll();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function resizeImageDataUrl(dataUrl, maxWidth, callback) {
    const img = new Image();
    img.onload = function () {
      const ratio = img.width > maxWidth ? maxWidth / img.width : 1;
      const canvas = document.createElement("canvas");
      canvas.width = Math.round(img.width * ratio);
      canvas.height = Math.round(img.height * ratio);
      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      callback(canvas.toDataURL("image/jpeg", 0.72));
    };
    img.src = dataUrl;
  }

  function setVal(id, val) {
    const el = document.getElementById(id);
    if (!el) return;
    if (document.activeElement === el && (el.tagName === "INPUT" || el.tagName === "TEXTAREA") && el.type !== "checkbox") return;
    el.value = val;
  }

  // =========================================================================
  // VINCULACIÓ D'EVENTS I TRANSICIONS DE PANTALLA
  // =========================================================================
  function bindEvents() {
    document.getElementById("patient-select")?.addEventListener("change", (e) => {
      state.currentPatientId = e.target.value;
      renderAll();
    });

    document.getElementById("btn-new-patient")?.addEventListener("click", () => {
      const name = prompt("Nom o identificador del nou pacient:", `Pacient ${state.patients.length + 1}`);
      if (!name) return;
      const newP = createNewPatient(name);
      state.patients.unshift(newP);
      state.currentPatientId = newP.id;
      saveState();
      renderAll();
    });

    document.getElementById("btn-delete-patient")?.addEventListener("click", () => {
      if (state.patients.length <= 1) {
        alert("Ha de quedar almenys un pacient.");
        return;
      }
      const p = getActivePatient();
      if (!confirm(`Vols eliminar el pacient "${p.name}"?`)) return;
      state.patients = state.patients.filter((x) => x.id !== p.id);
      state.currentPatientId = state.patients[0].id;
      saveState();
      renderAll();
    });

    document.getElementById("btn-add-day-uci")?.addEventListener("click", () => createNextDay("UCI"));
    document.getElementById("btn-add-day-planta")?.addEventListener("click", () => createNextDay("PLANTA"));
    document.getElementById("btn-footer-next-uci")?.addEventListener("click", () => createNextDay("UCI"));
    document.getElementById("btn-footer-next-planta")?.addEventListener("click", () => createNextDay("PLANTA"));

    document.getElementById("btn-delete-day")?.addEventListener("click", () => {
      const p = getActivePatient();
      if (p.days.length <= 1) {
        alert("El pacient ha de tenir almenys el primer dia registrat.");
        return;
      }
      p.days.splice(p.activeDayIndex, 1);
      p.activeDayIndex = Math.max(0, p.activeDayIndex - 1);
      saveState();
      renderAll();
    });

    // Inputs Pantalla 1
    const bindPatientInput = (id, prop, isNum = false) => {
      document.getElementById(id)?.addEventListener("input", (e) => {
        const p = getActivePatient();
        p[prop] = isNum ? Number(e.target.value) : e.target.value;
        if (prop === "admissionWeightKg" && p.days.length === 1) {
          p.days[0].actualWeightKg = Number(e.target.value);
        }
        saveState();
        renderAll();
      });
    };

    bindPatientInput("inp-patient-name", "name", false);
    bindPatientInput("inp-patient-nhc", "nhc", false);
    bindPatientInput("inp-patient-sex", "sex", false);
    bindPatientInput("inp-patient-age", "age", true);
    bindPatientInput("inp-patient-height", "heightCm", true);
    bindPatientInput("inp-admission-weight", "admissionWeightKg", true);
    bindPatientInput("inp-habitual-weight", "habitualWeightKg", true);
    bindPatientInput("inp-phosphate", "admissionPhosphateMgDl", true);

    document.getElementById("inp-patient-diabetes")?.addEventListener("change", (e) => {
      getActivePatient().diabetes = e.target.value === "true";
      saveState();
      renderAll();
    });
    document.getElementById("inp-patient-dysphagia")?.addEventListener("change", (e) => {
      getActivePatient().dysphagia = e.target.value === "true";
      saveState();
      renderAll();
    });

    // TRANSICIÓ PANTALLA 1 -> PANTALLA 2
    document.getElementById("btn-next-from-1")?.addEventListener("click", () => {
      const p = getActivePatient();
      const d = getActiveDay(p);
      const msgEl = document.getElementById("step-1-validation-msg");

      if (!p.name || !p.sex || !(p.age > 0) || !(p.heightCm >= 100) || !(p.admissionWeightKg >= 25) || !(p.habitualWeightKg >= 25)) {
        if (msgEl) {
          msgEl.style.display = "block";
          msgEl.textContent = "⚠️ Completa tots els camps obligatoris de la valoració a l'ingrés (Nom, Sexe, Edat, Talla, Pes actual i Pes habitual).";
        }
        return;
      }
      if (msgEl) msgEl.style.display = "none";

      p.admissionCompleted = true;
      if (p.days.length === 1 && !d.actualWeightKg) {
        d.actualWeightKg = p.admissionWeightKg;
      }
      goToScreen(2);
    });

    // Inputs Pantalla 2
    const bindDayInput = (id, prop, isNum = true) => {
      document.getElementById(id)?.addEventListener("input", (e) => {
        const d = getActiveDay();
        d[prop] = isNum ? Number(e.target.value) : e.target.value;
        saveState();
        renderAll();
      });
    };

    bindDayInput("inp-day-location", "location", false);
    bindDayInput("inp-day-phase", "phaseLabel", false);
    bindDayInput("inp-day-date", "date", false);
    bindDayInput("inp-actual-weight", "actualWeightKg", true);
    bindDayInput("inp-energy-method", "energyMethod", false);
    bindDayInput("inp-kcal-kg-target", "kcalPerKgTarget", true);
    bindDayInput("inp-ic-kcal", "icMeasuredKcal", true);
    bindDayInput("inp-ic-pct", "icPercentTarget", true);
    bindDayInput("inp-prot-kg-target", "proteinPerKgTarget", true);
    bindDayInput("inp-lip-kg-target", "lipidsPerKgTarget", true);

    // PANTALLA 3: APORTS NO NUTRICIONALS (ml/h × hores ↔ volum 24h)
    bindDayInput("inp-sg-conc", "sgConcentration", true);
    bindDayInput("inp-propofol-conc", "propofolConcentration", true);
    bindDayInput("inp-lactulose-units", "lactuloseUnits", true);
    NON_NUTR_DRUGS.forEach((dr) => {
      document.getElementById(`inp-${dr.key}-rate`)?.addEventListener("input", (e) => {
        const d = getActiveDay();
        d[dr.rate] = Number(e.target.value) || 0;
        const h = Number(d[dr.hours]) || 24;
        d[dr.vol] = Math.round(d[dr.rate] * h * 10) / 10;
        saveState();
        renderAll();
      });
      document.getElementById(`inp-${dr.key}-hours`)?.addEventListener("input", (e) => {
        const d = getActiveDay();
        const h = Math.min(24, Math.max(0, Number(e.target.value) || 0));
        d[dr.hours] = h || 24;
        if (Number(d[dr.rate]) > 0) d[dr.vol] = Math.round(d[dr.rate] * d[dr.hours] * 10) / 10;
        saveState();
        renderAll();
      });
      document.getElementById(`inp-${dr.key}-vol`)?.addEventListener("input", (e) => {
        const d = getActiveDay();
        d[dr.vol] = Number(e.target.value) || 0;
        const h = Number(d[dr.hours]) || 24;
        d[dr.rate] = Math.round((d[dr.vol] / h) * 100) / 100;
        saveState();
        renderAll();
      });
    });
    document.getElementById("btn-clear-non-nutr")?.addEventListener("click", () => {
      const d = getActiveDay();
      NON_NUTR_DRUGS.forEach((dr) => {
        d[dr.rate] = 0;
        d[dr.vol] = 0;
        d[dr.hours] = 24;
      });
      d.lactuloseUnits = 0;
      saveState();
      renderAll();
    });

    document.querySelectorAll("[data-preset-phase]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const d = getActiveDay();
        const key = btn.getAttribute("data-preset-phase");
        d.energyMethod = "weight";
        if (key === "refeed_d1") {
          d.location = "UCI";
          d.phaseLabel = `Dia ${d.dayNumber} UCI - Risc Refeeding (25%)`;
          d.kcalPerKgTarget = 10;
          d.proteinPerKgTarget = 1.0;
          d.lipidsPerKgTarget = 0.8;
        } else if (key === "uci_early") {
          d.location = "UCI";
          d.phaseLabel = `Dia ${d.dayNumber} UCI - Fase Aguda Precoç`;
          d.kcalPerKgTarget = 15;
          d.proteinPerKgTarget = 1.2;
          d.lipidsPerKgTarget = 0.8;
        } else if (key === "uci_stable") {
          d.location = "UCI";
          d.phaseLabel = `Dia ${d.dayNumber} UCI - Fase Estabilització`;
          d.kcalPerKgTarget = 20;
          d.proteinPerKgTarget = 1.5;
          d.lipidsPerKgTarget = 1.0;
        } else if (key === "uci_trrc") {
          d.location = "UCI";
          d.phaseLabel = `Dia ${d.dayNumber} UCI - Hipercatabòlic / TRRC`;
          d.kcalPerKgTarget = 25;
          d.proteinPerKgTarget = 1.8;
          d.lipidsPerKgTarget = 1.0;
        } else if (key === "planta_anabolic") {
          d.location = "PLANTA";
          d.phaseLabel = `Dia ${d.dayNumber} Planta - Fase Anabòlica`;
          d.kcalPerKgTarget = 30;
          d.proteinPerKgTarget = 1.8;
          d.lipidsPerKgTarget = 1.2;
        }
        saveState();
        renderAll();
      });
    });

    // TRANSICIONS PANTALLA 2
    document.getElementById("btn-back-to-1")?.addEventListener("click", () => goToScreen(1));
    document.getElementById("btn-next-from-2")?.addEventListener("click", () => {
      const d = getActiveDay();
      if (!(d.kcalPerKgTarget > 0) || !(d.proteinPerKgTarget > 0)) {
        alert("Defineix uns objectius d'energia i proteïnes vàlids per a aquest dia.");
        return;
      }
      d.objectivesCompleted = true;
      goToScreen(3);
    });

    // TRANSICIONS PANTALLA 3 (No nutricionals)
    document.getElementById("btn-back-to-2")?.addEventListener("click", () => goToScreen(2));
    document.getElementById("btn-next-from-3")?.addEventListener("click", () => {
      getActiveDay().nonNutrEvaluated = true;
      goToScreen(4);
    });

    // PANTALLA 4: VIA ORAL (SÍ / NO)
    document.getElementById("btn-screen4-oral-yes")?.addEventListener("click", () => {
      const p = getActivePatient();
      const d = getActiveDay(p);
      d.oralActive = true;
      d.oralEvaluated = true;
      if (p.dysphagia && d.oralDietName === "SEMILIQUIDA") d.oralDietName = "BASAL PASTOSA";
      else if (p.diabetes && d.oralDietName === "SEMILIQUIDA") d.oralDietName = "DIABÈTICA 1500";
      saveState();
      renderAll();
    });

    // Si marca NO a Via Oral -> Tanca Via Oral i obre directament la Pantalla 5 (Nutrició Enteral)!
    document.getElementById("btn-screen4-oral-no")?.addEventListener("click", () => {
      const d = getActiveDay();
      d.oralActive = false;
      d.oralEvaluated = true;
      goToScreen(5);
    });

    document.getElementById("btn-back-to-3")?.addEventListener("click", () => goToScreen(3));
    document.getElementById("btn-next-from-4")?.addEventListener("click", () => {
      getActiveDay().oralEvaluated = true;
      goToScreen(5);
    });
    document.getElementById("btn-skip-to-monitoring-from-4")?.addEventListener("click", () => {
      const d = getActiveDay();
      d.oralEvaluated = true;
      d.neEvaluated = true;
      d.npEvaluated = true;
      goToScreen(7);
    });

    document.getElementById("inp-oral-diet")?.addEventListener("change", (e) => {
      getActiveDay().oralDietName = e.target.value;
      saveState();
      renderAll();
    });

    document.querySelectorAll("[data-quick-tray-pct]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const pct = Number(btn.getAttribute("data-quick-tray-pct"));
        const d = getActiveDay();
        ["breakfast", "lunch", "snack", "dinner"].forEach((k) => {
          if (d.meals[k]) d.meals[k].eatenPct = pct;
        });
        saveState();
        renderAll();
      });
    });

    document.getElementById("btn-toggle-comstock-meals")?.addEventListener("click", () => {
      const d = getActiveDay();
      d.comstockExpanded = !d.comstockExpanded;
      saveState();
      renderAll();
    });

    document.getElementById("btn-add-supplement")?.addEventListener("click", () => {
      const p = getActivePatient();
      const d = getActiveDay(p);
      const defaultId = p.dysphagia ? "fresubin_2kcal_creme" : p.diabetes ? "glucerna_advance_1_6_200" : "ensure_plus_advance_200";
      d.supplements.push({ id: defaultId, units: 1 });
      saveState();
      renderAll();
    });

    document.getElementById("btn-auto-suggest-supp")?.addEventListener("click", () => {
      const p = getActivePatient();
      const d = getActiveDay(p);
      const m = computeMetrics(p, d);
      const defKcal = Math.max(0, m.targets.energyKcal - m.totals.kcal);
      const suppId = p.dysphagia ? "fresubin_2kcal_creme" : p.diabetes ? "glucerna_advance_1_6_200" : "ensure_plus_advance_200";
      if (defKcal >= 180) {
        const units = defKcal >= 500 ? 2 : 1;
        const ex = d.supplements.find((s) => s.id === suppId);
        if (ex) ex.units = units;
        else d.supplements.push({ id: suppId, units });
      }
      const m2 = computeMetrics(p, d);
      const defProt = m2.targets.proteinG - m2.totals.proteinG;
      if (defProt > 3) {
        const scoops = Math.min(8, Math.round(defProt / 2.2));
        const exP = d.supplements.find((s) => s.id === "protifar_scoop");
        if (exP) exP.units = scoops;
        else d.supplements.push({ id: suppId === "protifar_scoop" ? "protifar_scoop" : "protifar_scoop", units: scoops });
      }
      saveState();
      renderAll();
    });

    // PANTALLA 5: NUTRICIÓ ENTERAL (SÍ / NO)
    document.getElementById("btn-screen5-ne-yes")?.addEventListener("click", () => {
      const p = getActivePatient();
      const d = getActiveDay(p);
      d.neActive = true;
      d.neEvaluated = true;
      if (!d.neVolume24hMl || d.neVolume24hMl === 0) {
        if (p.diabetes) d.neFormulaId = "glucerna_1_5";
        d.neVolume24hMl = 1000;
      }
      saveState();
      renderAll();
    });

    // Si marca NO a Nutrició Enteral -> Obre directament la Pantalla 6 (Nutrició Parenteral)!
    document.getElementById("btn-screen5-ne-no")?.addEventListener("click", () => {
      const d = getActiveDay();
      d.neActive = false;
      d.neEvaluated = true;
      goToScreen(6);
    });

    document.getElementById("btn-back-to-4")?.addEventListener("click", () => goToScreen(4));
    document.getElementById("btn-next-from-5")?.addEventListener("click", () => {
      getActiveDay().neEvaluated = true;
      goToScreen(6);
    });
    document.getElementById("btn-skip-to-monitoring-from-5")?.addEventListener("click", () => {
      const d = getActiveDay();
      d.neEvaluated = true;
      d.npEvaluated = true;
      goToScreen(7);
    });

    bindDayInput("inp-ne-formula", "neFormulaId", false);
    bindDayInput("inp-ne-vol", "neVolume24hMl", true);
    bindDayInput("inp-free-water", "freeWaterMl", true);

    document.getElementById("inp-ne-rate")?.addEventListener("input", (e) => {
      const rate = Number(e.target.value) || 0;
      getActiveDay().neVolume24hMl = Math.round(rate * 24);
      saveState();
      renderAll();
    });

    document.getElementById("btn-add-protifar-ne")?.addEventListener("click", () => {
      const d = getActiveDay();
      const ex = d.supplements.find((s) => s.id === "protifar_scoop");
      if (ex) ex.units += 2;
      else d.supplements.push({ id: "protifar_scoop", units: 3 });
      saveState();
      renderAll();
    });

    document.getElementById("btn-auto-ne-card")?.addEventListener("click", () => {
      const p = getActivePatient();
      const d = getActiveDay(p);
      const m = computeMetrics(p, d);
      const f = m.ne.formula;
      if (!f) return;
      const otherKcal = m.nonNutr.kcal + m.oralTray.kcal + m.supplements.kcal + m.np.kcal;
      const neededKcal = Math.max(0, m.targets.energyKcal - otherKcal);
      d.neVolume24hMl = Math.round(((neededKcal / f.per100ml.kcal) * 100) / 25) * 25;

      const mAfter = computeMetrics(p, d);
      const protDef = mAfter.targets.proteinG - mAfter.totals.proteinG;
      if (protDef > 3) {
        const scoops = Math.round(protDef / 2.2);
        const ex = d.supplements.find((s) => s.id === "protifar_scoop");
        if (ex) ex.units += scoops;
        else d.supplements.push({ id: "protifar_scoop", units: scoops });
      }
      saveState();
      renderAll();
    });

    // PANTALLA 6: NUTRICIÓ PARENTERAL (SÍ / NO)
    document.getElementById("btn-screen6-np-yes")?.addEventListener("click", () => {
      const d = getActiveDay();
      d.npActive = true;
      d.npEvaluated = true;
      saveState();
      renderAll();
    });

    // Si marca NO a Nutrició Parenteral -> Obre directament la Pantalla 7 (Monitorització GI i Metabòlica)
    document.getElementById("btn-screen6-np-no")?.addEventListener("click", () => {
      const d = getActiveDay();
      d.npActive = false;
      d.npEvaluated = true;
      goToScreen(7);
    });

    document.getElementById("btn-back-to-5")?.addEventListener("click", () => goToScreen(5));
    document.getElementById("btn-next-from-6")?.addEventListener("click", () => {
      getActiveDay().npEvaluated = true;
      goToScreen(7);
    });

    bindDayInput("inp-np-type", "npType", false);
    bindDayInput("inp-np-vol", "npTotalVolumeMl", true);
    bindDayInput("inp-np-aminoven", "npAminovenG", true);
    bindDayInput("inp-np-glucose", "npGlucoseG", true);
    bindDayInput("inp-np-smoflipid", "npSmoflipidG", true);
    bindDayInput("inp-np-na", "npNa", true);
    bindDayInput("inp-np-k", "npK", true);
    bindDayInput("inp-np-cl", "npCl", true);
    bindDayInput("inp-np-p", "npP", true);
    bindDayInput("inp-np-ca", "npCa", true);
    bindDayInput("inp-np-vit", "npVitaminsMl", true);
    bindDayInput("inp-np-oligo", "npTraceElementsMl", true);

    document.getElementById("btn-auto-np")?.addEventListener("click", () => {
      const p = getActivePatient();
      const d = getActiveDay(p);
      const m = computeMetrics(p, d);
      const otherKcal = m.nonNutr.kcal + m.oralTray.kcal + m.supplements.kcal + m.ne.kcal;
      const otherProt = m.oralTray.proteinG + m.supplements.proteinG + m.ne.proteinG;
      const neededKcal = Math.max(400, m.targets.energyKcal - otherKcal);
      const neededProt = Math.max(25, m.targets.proteinG - otherProt);

      const protG = Math.round(neededProt * 2) / 2;
      const nonProtKcal = Math.max(200, neededKcal - protG * 4);
      d.npAminovenG = protG;
      d.npGlucoseG = Math.round((nonProtKcal * 0.7) / 4 / 5) * 5;
      d.npSmoflipidG = Math.round((nonProtKcal * 0.3) / 9 / 5) * 5;
      d.npTotalVolumeMl = Math.round((protG / 0.15 + d.npGlucoseG / 0.3 + d.npSmoflipidG / 0.2) / 10) * 10;
      saveState();
      renderAll();
    });

    // PANTALLA 7: MONITORITZACIÓ GI I METABÒLICA
    const bindNullableNum = (id, prop) => {
      document.getElementById(id)?.addEventListener("input", (e) => {
        getActiveDay()[prop] = numOrNull(e.target.value);
        saveState();
        renderAll();
      });
    };
    bindDayInput("inp-gi-vrg", "giVrgMl", true);
    bindDayInput("inp-gi-vomiting", "giVomiting", false);
    bindDayInput("inp-gi-constipation-days", "giConstipationDays", true);
    bindDayInput("inp-gi-diarrhea-count", "giDiarrheaCount", true);
    bindDayInput("inp-gi-distension", "giDistension", false);
    document.getElementById("inp-gi-opioids")?.addEventListener("change", (e) => {
      getActiveDay().giOpioids = e.target.value === "true";
      saveState();
      renderAll();
    });
    [
      ["inp-lab-urea-plasma", "labUreaPlasma"],
      ["inp-lab-creatinine", "labCreatinine"],
      ["inp-urea-24h", "urea24hG"],
      ["inp-gly-mean", "glyMean"],
      ["inp-gly-max", "glyMax"],
      ["inp-insulin-24h", "insulin24h"],
      ["inp-insulin-rate", "insulinRate"],
      ["inp-insulin-basal", "insulinBasal"],
      ["inp-lab-tg", "labTg"],
      ["inp-lab-iron", "labIron"],
      ["inp-lab-ferritin", "labFerritin"],
      ["inp-lab-transferrin", "labTransferrin"],
      ["inp-lab-tsi", "labTsi"],
      ["inp-lab-vitd", "labVitD"],
      ["inp-lab-thiamine", "labThiamine"],
      ["inp-lab-prealbumin", "labPrealbumin"]
    ].forEach(([id, prop]) => bindNullableNum(id, prop));
    bindDayInput("inp-lab-thiamine-supp", "labThiamineSupp", false);

    document.getElementById("btn-back-to-6")?.addEventListener("click", () => goToScreen(6));
    document.getElementById("btn-next-from-7")?.addEventListener("click", () => {
      getActiveDay().monitoringVisited = true;
      goToScreen(8);
    });

    // PANTALLA 8: BALANÇ FINAL
    document.getElementById("btn-back-to-7")?.addEventListener("click", () => goToScreen(7));
    bindDayInput("inp-clinical-notes", "clinicalNotes", false);

    document.getElementById("btn-copy-note")?.addEventListener("click", () => {
      const txt = document.getElementById("clinical-note-textarea")?.value || "";
      navigator.clipboard.writeText(txt).then(() => {
        const btn = document.getElementById("btn-copy-note");
        const orig = btn.innerHTML;
        btn.innerHTML = "✅ Nota copiada!";
        setTimeout(() => (btn.innerHTML = orig), 2000);
      });
    });

    // Modals
    document.getElementById("btn-open-evolution-modal")?.addEventListener("click", () => {
      document.getElementById("modal-evolution")?.classList.add("open");
    });
    document.getElementById("btn-close-evolution-modal")?.addEventListener("click", () => {
      document.getElementById("modal-evolution")?.classList.remove("open");
    });
    document.getElementById("btn-open-catalog-modal")?.addEventListener("click", () => {
      document.getElementById("modal-catalog")?.classList.add("open");
    });
    document.getElementById("btn-close-catalog-modal")?.addEventListener("click", () => {
      document.getElementById("modal-catalog")?.classList.remove("open");
    });

    document.getElementById("diet-search-input")?.addEventListener("input", (e) => {
      state.dietSearchQuery = e.target.value;
      renderModals(getActivePatient(), getActiveDay());
    });

    document.getElementById("btn-print-report")?.addEventListener("click", () => window.print());
  }

  document.addEventListener("DOMContentLoaded", () => {
    loadState();
    bindEvents();
    renderAll();
  });
})();
