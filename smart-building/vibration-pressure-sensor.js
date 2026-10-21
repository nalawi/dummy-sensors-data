function generateSensorData(sensorId, mode = "auto") {
  // Predictive-maintenance node for rotating plant and ducts: a piezo
  // accelerometer on pump/fan bearing housings gives velocity RMS and
  // envelope spectrum (bearing defect tones), while a differential-pressure
  // cell watches filter loading and duct static. ISO 10816 zones gate
  // alarms; envelope spikes flag bearing races before they seize.
  const assets = [
    { name: "PUMP-CHW-1",   baseRms: [0.8, 2.2],  duct: null },
    { name: "AHU-2-FAN",    baseRms: [1.2, 3.5],  duct: [220, 420] },
    { name: "PUMP-HHW-2",   baseRms: [0.7, 2.0],  duct: null },
    { name: "EF-3-EXHAUST", baseRms: [1.0, 2.8],  duct: [80, 160] },
    { name: "AHU-3-FAN",    baseRms: [1.1, 3.2],  duct: [180, 380] }
  ];
  const asset = assets[Math.floor(Math.random() * assets.length)];

  const states = ["GOOD", "WATCH", "DEFECT_DEVELOPING", "ALARM_VIBRATION"];
  const state = mode === "auto"
    ? (Math.random() > 0.22 ? "GOOD" : states[1 + Math.floor(Math.random() * 3)])
    : mode.toUpperCase();

  const mult = { GOOD: 1.0, WATCH: 1.6, DEFECT_DEVELOPING: 2.6, ALARM_VIBRATION: 4.2 }[state] || 1.0;
  const rms = parseFloat((asset.baseRms[0] + Math.random() * (asset.baseRms[1] - asset.baseRms[0]) * mult).toFixed(2));

  // ISO 10816/20816 vibration severity zones for small machines
  const isoZone = rms < 2.3 ? "A (new commissioning)" : rms < 4.5 ? "B (unrestricted operation)" : rms < 7.1 ? "C (restricted - plan maintenance)" : "D (damage risk - shutdown)";

  // Envelope band energy: BPFO/BPFI bearing tones appear before broadband rise
  const envelope = state === "GOOD" ? Math.round(2 + Math.random() * 6)
    : state === "WATCH" ? Math.round(8 + Math.random() * 10)
    : Math.round(18 + Math.random() * 40);

  const defectTones = state === "GOOD" ? null
    : ["BPFO outer race", "BPFI inner race", "FTF cage", "BSF ball spin"][Math.floor(Math.random() * 4)] + " @ " + (60 + Math.floor(Math.random() * 220)) + " Hz";

  const ductDp = asset.duct
    ? parseFloat((asset.duct[0] + Math.random() * (asset.duct[1] - asset.duct[0])).toFixed(1))
    : null;
  const filterLoading = ductDp ? Math.min(98, Math.round((ductDp / 5))) : null;

  const sensorObject = {
    sensor_id: sensorId,
    sensor_type: "Vibration & DP Node - IEPE accelerometer + DP cell, 24/7 route",
    asset: asset.name,
    asset_class: asset.duct ? "AIR HANDLER (fan + duct)" : "END-SUCTION PUMP",
    vibration_rms: rms,
    vibration_rms_unit: "mm/s RMS 10-1000 Hz (ISO 10816)",
    iso_zone: isoZone,
    envelope_energy: envelope,
    envelope_energy_unit: "gE 2-6 kHz band (bearing tones)",
    defect_tone: defectTones,
    running_speed: parseFloat((24 + Math.random() * 5).toFixed(1)),
    running_speed_unit: "Hz (1x)",
    duct_static: ductDp,
    duct_static_unit: ductDp ? "Pa differential across filter bank" : null,
    filter_loading: filterLoading,
    filter_loading_unit: filterLoading ? "% (change filters >70%)" : null,
    maintenance_action: state === "GOOD" ? "NONE - NEXT ROUTE IN 30d"
      : state === "WATCH" ? "TREND + RE-MEASURE IN 7d"
      : state === "DEFECT_DEVELOPING" ? "WORK ORDER: GREASE/ALIGN, ORDER BEARING KIT"
      : "SHUTDOWN RECOMMENDED - SCHEDULE IMMEDIATE",
    greasing_due_days: Math.floor(Math.random() * 120),
    sensor_health: Math.random() > 0.97 ? "ACCELERATOR CABLE FRETting - RE-TERMINATE" : "NOMINAL",
    timestamp: new Date().toISOString()
  };

  return sensorObject
}