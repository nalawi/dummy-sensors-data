function generateSensorData(sensorId, mode = "auto") {
  // Soil pH electrode: 5.5-7.0 suits most crops. Below ~5.5 aluminium and
  // manganese solubilize (root-tip toxicity, P fixation); above ~7.5 Fe/Zn/Mn
  // lock out. Acid soils get ag-lime, alkaline soils elemental sulphur.
  const states = ["OPTIMAL", "TOO_ACIDIC", "TOO_ALKALINE"];
  const state = mode === "auto"
    ? (Math.random() > 0.3 ? "OPTIMAL" : states[1 + Math.floor(Math.random() * 2)])
    : mode.toUpperCase();

  const ph = state === "TOO_ACIDIC" ? parseFloat((4.0 + Math.random() * 1.4).toFixed(1))
    : state === "TOO_ALKALINE" ? parseFloat((7.6 + Math.random() * 1.2).toFixed(1))
    : parseFloat((5.6 + Math.random() * 1.3).toFixed(1));

  const acidityClass = ph < 4.5 ? "EXTREMELY_ACID" : ph < 5.0 ? "VERY_STRONGLY_ACID" : ph < 5.5 ? "STRONGLY_ACID" : ph < 6.0 ? "MODERATELY_ACID" : ph < 6.6 ? "NEAR_NEUTRAL" : ph < 7.3 ? "NEUTRAL" : ph < 7.8 ? "SLIGHTLY_ALKALINE" : ph < 8.4 ? "MODERATELY_ALKALINE" : "STRONGLY_ALKALINE";
  const limeT = state === "TOO_ACIDIC" ? Math.min(12, Math.round((6.5 - ph) * 4 * 10) / 10) : 0;
  const sulfurKg = state === "TOO_ALKALINE" ? Math.min(800, Math.round((ph - 6.5) * 300)) : 0;
  const lockouts = state === "TOO_ACIDIC" ? ["P (Fe/Al fixation)", "Mo", "Ca", "Mg"]
    : state === "TOO_ALKALINE" ? ["Fe", "Zn", "Mn", "P (Ca fixation)"] : [];

  const sensorObject = {
    sensor_id: sensorId,
    sensor_type: "Soil pH Sensor - glass electrode, in-situ with moisture compensation",
    ph: ph,
    ph_unit: "pH (1:2.5 soil-water suspension)",
    reaction_class: acidityClass,
    ph_state: state,
    optimal_band: "5.5 - 7.0 for most crops",
    nutrient_lockouts: lockouts.length ? lockouts : null,
    amendment: state === "TOO_ACIDIC" ? "AG-LIME CaCO3 @ " + limeT + " t/ha - RE-TEST IN 6 MONTHS"
      : state === "TOO_ALKALINE" ? "ELEMENTAL SULPHUR @ " + sulfurKg + " kg/ha OR ACIDIFY FERTIGATION"
      : "NONE",
    amendment_unit: state === "TOO_ACIDIC" ? "t/ha agricultural lime" : state === "TOO_ALKALINE" ? "kg/ha elemental S" : null,
    buffer_ph: parseFloat((ph + (Math.random() * 0.6 - 0.2)).toFixed(1)),
    buffer_ph_unit: "pH (SMP buffer - reserve acidity)",
    probe_health: Math.random() > 0.97 ? "REFERENCE JUNCTION CLOGGED - CLEAN + KCl SOAK" : "NOMINAL",
    timestamp: new Date().toISOString()
  };

  return sensorObject
}
