function generateSensorData(sensorId, mode = "auto") {
  // Ion-selective soil NPK sensor: nitrate-N, P and K in mg/kg mapped to
  // fertility classes; deficits convert to kg/ha of urea (46-0-0), DAP
  // (18-46-0) and MOP (0-0-60) using a topsoil furrow-slice conversion.
  const crops = [
    { crop: "MAIZE",  nTarget: 180, pTarget: 70, kTarget: 150 },
    { crop: "RICE",   nTarget: 120, pTarget: 60, kTarget: 100 },
    { crop: "POTATO", nTarget: 200, pTarget: 90, kTarget: 250 },
    { crop: "COTTON", nTarget: 150, pTarget: 65, kTarget: 120 }
  ];
  const crop = crops[Math.floor(Math.random() * crops.length)];

  const states = ["BALANCED", "N_DEFICIENT", "P_DEFICIENT", "K_DEFICIENT", "N_EXCESS"];
  const state = mode === "auto"
    ? (Math.random() > 0.3 ? "BALANCED" : states[1 + Math.floor(Math.random() * 4)])
    : mode.toUpperCase();

  const nitrateN = state === "N_DEFICIENT" ? Math.round(5 + Math.random() * 10)
    : state === "N_EXCESS" ? Math.round(150 + Math.random() * 80)
    : Math.round(35 + Math.random() * 50);
  const phosphorus = state === "P_DEFICIENT" ? Math.round(3 + Math.random() * 7)
    : Math.round(18 + Math.random() * 40);
  const potassium = state === "K_DEFICIENT" ? Math.round(20 + Math.random() * 40)
    : Math.round(110 + Math.random() * 160);

  const cls = (v, optLo, optHi) => v < optLo ? "LOW" : v > optHi ? "HIGH" : "OPTIMAL";
  const deficit = (have, need) => have < need * 0.5 ? Math.round((need - have) * 2.2) : 0;
  const nNeed = deficit(nitrateN, crop.nTarget);
  const pNeed = deficit(phosphorus, crop.pTarget);
  const kNeed = deficit(potassium, crop.kTarget);

  const rec = [];
  if (nNeed) rec.push("UREA 46-0-0 @ " + Math.round(nNeed / 0.46) + " kg/ha");
  if (pNeed) rec.push("DAP 18-46-0 @ " + Math.round(pNeed / 0.46) + " kg/ha");
  if (kNeed) rec.push("MOP 0-0-60 @ " + Math.round(kNeed / 0.60) + " kg/ha");

  const sensorObject = {
    sensor_id: sensorId,
    sensor_type: "Soil NPK Sensor - ion-selective membrane array, 0-30 cm",
    crop: crop.crop,
    nitrate_n: nitrateN,
    nitrate_n_unit: "mg/kg (NO3-N, 1:2.5 extract)",
    phosphorus: phosphorus,
    phosphorus_unit: "mg/kg (Olsen P)",
    potassium: potassium,
    potassium_unit: "mg/kg (exchangeable K)",
    nitrogen_class: cls(nitrateN, 30, 80),
    phosphorus_class: cls(phosphorus, 15, 40),
    potassium_class: cls(potassium, 100, 250),
    fertility_state: state,
    n_balance: nNeed ? "-" + nNeed + " kg N/ha to target" : "SUFFICIENT",
    p_balance: pNeed ? "-" + pNeed + " kg P2O5/ha to target" : "SUFFICIENT",
    k_balance: kNeed ? "-" + kNeed + " kg K2O/ha to target" : "SUFFICIENT",
    fertilizer_recommendation: rec.length ? rec.join(" + ") : "NONE - SOIL TEST BALANCED, RE-TEST IN 30d",
    leaching_warning: state === "N_EXCESS" ? "NITRATE LEACHING RISK - SPLIT APPLICATIONS" : null,
    probe_health: Math.random() > 0.97 ? "ISE MEMBRANE DRIFT - CALIBRATE" : "NOMINAL",
    timestamp: new Date().toISOString()
  };

  return sensorObject
}
