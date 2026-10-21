function generateSensorData(sensorId, mode = "auto") {
  // Building life-safety gas node: pellistor (catalytic bead) for combustible
  // natural gas plus electrochemical cell for carbon monoxide. Mounted near
  // the kitchen gas train and the loading-dock ramp where delivery trucks idle.
  // % LEL is the combustible scale (100% = lower explosive limit); CO uses ppm
  // against occupational short-term limits.
  const locations = ["L4-KITCHEN GAS TRAIN", "B1-LOADING DOCK", "B1-BOILER ROOM", "L1-DOCK RAMP", "L5-MECHANICAL"];
  const location = locations[Math.floor(Math.random() * locations.length)];

  const states = ["NORMAL", "CO_ELEVATED", "GAS_LEL_RISING", "ALARM_LIKELY_LEAK"];
  const state = mode === "auto"
    ? (Math.random() > 0.12 ? "NORMAL" : states[1 + Math.floor(Math.random() * 3)])
    : mode.toUpperCase();

  const ranges = {
    NORMAL:            { lel: [0, 3],     co: [0, 9] },
    CO_ELEVATED:       { lel: [0, 2],     co: [25, 70] },
    GAS_LEL_RISING:    { lel: [8, 18],    co: [0, 12] },
    ALARM_LIKELY_LEAK: { lel: [22, 40],   co: [0, 15] }
  };
  const r = ranges[state] || ranges.NORMAL;
  const lel = parseFloat((r.lel[0] + Math.random() * (r.lel[1] - r.lel[0])).toFixed(1));
  const co = parseFloat((r.co[0] + Math.random() * (r.co[1] - r.co[0])).toFixed(0));

  // Ventilation interlocks: kitchen hood boost at 10% LEL, solenoid gas-shut
  // off at 20% LEL (EN 50194), smoke-control mode on CO > 50 ppm
  const gasShutoff = lel >= 20;
  const hoodBoost = lel >= 10 && !gasShutoff;
  const smokeControl = co >= 50;

  const sources = {
    CO_ELEVATED: ["FORKLIFT IDLING AT DOCK", "BOILER FLUE SPILLAGE", "DELIVERY TRUCK QUEUE"],
    GAS_LEL_RISING: ["PILOT FLAME OUTAGE", "FLEX HOSE WEEP", "VALVE PACKING LEAK"],
    ALARM_LIKELY_LEAK: ["SUPPLY PIPE RUPTURE - EMERGENCY SHUTOFF", "UNATTENDED RANGE VALVE"]
  };

  const sensorObject = {
    sensor_id: sensorId,
    sensor_type: "Gas Safety Node - pellistor CH4 (%LEL) + electrochemical CO",
    location: location,
    gas_alarm_state: state === "ALARM_LIKELY_LEAK" ? "ALARM" : state === "NORMAL" ? "NORMAL" : "PRE_ALARM",
    combustible_lel: lel,
    combustible_lel_unit: "% LEL methane (alarm 20%, shutoff 20% EN 50194)",
    co_level: co,
    co_level_unit: "ppm CO (STEL 100 ppm, alarm 50 ppm)",
    gas_shutoff_triggered: gasShutoff,
    kitchen_hood_boost: hoodBoost,
    smoke_control_mode: smokeControl,
    suspected_source: state === "NORMAL" ? null : sources[state][Math.floor(Math.random() * sources[state].length)],
    evacuation_advisory: state === "ALARM_LIKELY_LEAK" ? "EVACUATE ZONE + CALL GAS EMERGENCY LINE" : null,
    ventilation_command: smokeControl ? "SMOKE-CONTROL MODE - 100% EXHAUST" : lel >= 8 ? "PURGE 10 ACH" : "NORMAL",
    cell_health: Math.random() > 0.96 ? "PELLISTOR POISONING SUSPECTED - BUMP TEST DUE" : "NOMINAL",
    last_bump_test_days: Math.floor(Math.random() * 40),
    timestamp: new Date().toISOString()
  };

  return sensorObject
}