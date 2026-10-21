function generateSensorData(sensorId, mode = "auto") {
  // Leak detection rope / spot probe under AHU drain pans, riser junctions and
  // raised-floor plenums: two gold-plated sensing electrodes bridge through
  // water and trip a resistance threshold; a second, lower pair of electrodes
  // discriminates a thin film (weep) from full pooling (flood).
  const locations = ["AHU-2 DRAIN PAN", "B1-RISE JUNCTION P3", "SERVER-ROOM PLENUM Z4", "L4-COFFEE STATION", "PUMP-ROOM SKID"];
  const location = locations[Math.floor(Math.random() * locations.length)];

  const states = ["DRY", "WEEP", "FLOOD", "WIRE_FAULT"];
  const state = mode === "auto"
    ? (Math.random() > 0.1 ? "DRY" : states[1 + Math.floor(Math.random() * 3)])
    : mode.toUpperCase();

  // Conductivity reading maps to state: dry kOhm-scale, wet drops fast
  const resistance = state === "DRY" ? Math.round(1800 + Math.random() * 4000)
    : state === "WEEP" ? Math.round(40 + Math.random() * 180)
    : state === "WIRE_FAULT" ? null
    : Math.round(1 + Math.random() * 20);

  const wetLength = state === "WEEP" || state === "FLOOD"
    ? parseFloat((0.5 + Math.random() * 5).toFixed(1))
    : 0;

  // Escalation ladder: weep pages after 30 min, flood pages immediately and
  // closes the motorized valve on the feeding riser
  const actions = {
    DRY: "NONE",
    WEEP: "PAGE FACILITIES - MONITOR FOR 30 MIN ESCALATION",
    FLOOD: "IMMEDIATE PAGE + CLOSE RISER VALVE V-14",
    WIRE_FAULT: "SUPERVISION LOSS - CHECK ROPE CONNECTORS"
  };

  const sensorObject = {
    sensor_id: sensorId,
    sensor_type: "Water Leak Sensor - 4-electrode addressable rope + spot probe",
    location: location,
    leak_state: state,
    wet_resistance: resistance,
    wet_resistance_unit: resistance === null ? null : "ohm (dry >1.5k, weep <200, flood <20)",
    wet_length: wetLength,
    wet_length_unit: wetLength === 0 ? null : "m of wetted rope",
    rope_coverage: "12 m run, addresses every 3 m",
    pipe_context: location.includes("RISE") ? "RISER P3 (CHW/CDHW)" : location.includes("AHU") ? "AHU-2 CONDENSATE" : "LOCAL BRANCH",
    response_action: actions[state] || actions.DRY,
    valve_isolated: state === "FLOOD",
    ambient_humidity: parseFloat((40 + Math.random() * 30).toFixed(1)),
    ambient_humidity_unit: "% RH (drying-rate context)",
    estimated_origin: state === "FLOOD" ? ["DRAIN PAN OVERFLOW", "PIPE JOINT WEEP -> BURST", "ROOF PENETRATION"] [Math.floor(Math.random() * 3)] : null,
    last_self_test: Math.random() > 0.95 ? "FAILED - ELECTRODE CORROSION, REPLACE SEGMENT 2" : "PASSED",
    timestamp: new Date().toISOString()
  };

  return sensorObject
}