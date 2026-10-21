function generateSensorData(sensorId, mode = "auto") {
  // Soil EC probe (saturation-extract equivalent, dS/m): USDA salinity
  // classes gate osmotic stress on roots; remediation is a leaching fraction
  // that pushes accumulated salts below the crop salt-tolerance threshold.
  const crops = [
    { crop: "BEAN", threshold: 1.0, tolerance: "SALT_SENSITIVE" },
    { crop: "TOMATO", threshold: 2.5, tolerance: "MODERATELY_SENSITIVE" },
    { crop: "BARLEY", threshold: 8.0, tolerance: "SALT_TOLERANT" },
    { crop: "DATE_PALM", threshold: 12.0, tolerance: "VERY_TOLERANT" }
  ];
  const crop = crops[Math.floor(Math.random() * crops.length)];

  const states = ["NON_SALINE", "SLIGHTLY_SALINE", "MODERATELY_SALINE", "SEVERELY_SALINE", "EXTREMELY_SALINE"];
  const state = mode === "auto"
    ? (Math.random() > 0.35 ? "NON_SALINE" : states[1 + Math.floor(Math.random() * 4)])
    : mode.toUpperCase();

  const band = (lo, hi) => parseFloat((lo + Math.random() * (hi - lo)).toFixed(2));
  const ec = state === "NON_SALINE" ? band(0.2, 1.8)
    : state === "SLIGHTLY_SALINE" ? band(2.0, 3.9)
    : state === "MODERATELY_SALINE" ? band(4.0, 7.9)
    : state === "SEVERELY_SALINE" ? band(8.0, 15.9)
    : band(16.0, 28.0);

  const salinityClass = ec < 2 ? "NON_SALINE" : ec < 4 ? "SLIGHTLY_SALINE" : ec < 8 ? "MODERATELY_SALINE" : ec < 16 ? "SEVERELY_SALINE" : "EXTREMELY_SALINE";
  const yieldLoss = Math.max(0, Math.round((ec - crop.threshold) * 9));
  const leachFraction = ec > crop.threshold ? Math.min(0.45, parseFloat(((ec - crop.threshold) / ec).toFixed(2))) : 0;
  const sar = ec > 4 ? Math.round(4 + Math.random() * 18) : Math.round(Math.random() * 6);

  const sensorObject = {
    sensor_id: sensorId,
    sensor_type: "Soil EC Sensor - four-electrode Wenner array, ECe equivalent",
    crop: crop.crop,
    crop_salt_tolerance: crop.tolerance + " (threshold " + crop.threshold + " dS/m)",
    soil_ec: ec,
    soil_ec_unit: "dS/m saturation extract",
    salinity_class: salinityClass + " (USDA)",
    expected_yield_loss: yieldLoss,
    expected_yield_loss_unit: "% vs non-saline potential",
    sodium_adsorption_ratio: sar,
    sodium_adsorption_ratio_unit: "SAR (sodic risk above 13)",
    sodic_flag: sar > 13,
    leaching_fraction_target: leachFraction,
    leaching_fraction_unit: "fraction of each irrigation applied for salt control",
    remediation: leachFraction > 0 ? "APPLY " + Math.round(leachFraction * 100) + "% EXTRA IRRIGATION" + (sar > 13 ? " + GYPSUM FOR SAR" : "") : "NONE - SALINITY WITHIN TOLERANCE",
    soil_temp: parseFloat((14 + Math.random() * 18).toFixed(1)),
    soil_temp_unit: "C (EC reading temperature compensated)",
    probe_health: Math.random() > 0.97 ? "ELECTRODE CONTACT RESISTANCE HIGH - RE-CALIBRATE" : "NOMINAL",
    timestamp: new Date().toISOString()
  };

  return sensorObject
}
