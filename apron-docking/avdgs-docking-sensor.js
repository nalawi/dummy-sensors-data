function generateSensorData(sensorId, phase = "auto") {
  // A-VDGS sweeps the taxi-in lane with a class-1 3D LiDAR fan plus an IR
  // camera: the LiDAR profile-match identifies the aircraft type, the IR
  // camera OCRs the registration, and the LED display then drives the pilot
  // onto the stop position defined in the gate plan (FIMS feed)
  const phases = ["SEARCH", "ACQUIRING", "DOCKING", "STOPPED"];
  const p = phase === "auto" ? phases[Math.floor(Math.random() * phases.length)] : phase.toUpperCase();

  const fleet = [
    { icao: "A20N", name: "AIRBUS A320NEO",   wingspan: 35.8, length: 37.6, stop_tol: 0.30 },
    { icao: "B38M", name: "BOEING 737 MAX 8", wingspan: 35.9, length: 39.5, stop_tol: 0.30 },
    { icao: "E290", name: "EMBRAER E190-E2",  wingspan: 28.7, length: 36.2, stop_tol: 0.30 },
    { icao: "AT76", name: "ATR 72-600",       wingspan: 27.0, length: 27.2, stop_tol: 0.30 },
    { icao: "A359", name: "AIRBUS A350-900",  wingspan: 64.8, length: 66.8, stop_tol: 0.25 },
    { icao: "B789", name: "BOEING 787-9",     wingspan: 60.1, length: 62.8, stop_tol: 0.25 },
    { icao: "B77W", name: "BOEING 777-300ER", wingspan: 64.8, length: 73.9, stop_tol: 0.25 },
    { icao: "A388", name: "AIRBUS A380-800",  wingspan: 79.8, length: 72.7, stop_tol: 0.20 }
  ];
  const expected = fleet[Math.floor(Math.random() * fleet.length)];
  const mismatch = p === "MISMATCH" || (phase === "auto" && Math.random() > 0.95);
  const target = mismatch ? fleet[Math.floor(Math.random() * fleet.length)] : expected;

  const prefixes = ["PK-", "9V-", "VH-", "JA", "D-A", "N", "B-", "HS-"];
  const registration = prefixes[Math.floor(Math.random() * prefixes.length)] +
    Array.from({ length: 3 }, () => "ABCDEFGHIJKLMNOPQRSTUVWXYZ"[Math.floor(Math.random() * 26)]).join("");

  // Approach kinematics: pilots brake from ~3-4 m/s at 60 m out to zero at
  // the stop bar; a snapshot ties speed to remaining distance
  let distance = null, speed = 0;
  if (p === "ACQUIRING") {
    distance = parseFloat((60 + Math.random() * 40).toFixed(1));
    speed = parseFloat((2.5 + Math.random() * 1.5).toFixed(2));
  } else if (p === "DOCKING") {
    distance = parseFloat((3 + Math.random() * 55).toFixed(1));
    speed = parseFloat(Math.min(3.0, Math.max(0.4, distance / 14)).toFixed(2));
  } else if (p === "STOPPED") {
    distance = parseFloat((Math.random() * 0.25).toFixed(2)); // inside ±tolerance window
  }

  const gseIntrusion = p === "DOCKING" && Math.random() > 0.96; // GSE crept into the scan fan
  const rainMode = Math.random() > 0.94; // heavy rain attenuates the 905 nm returns

  let display;
  if (p === "SEARCH") display = "STAND CLEAR - EXPECT " + expected.icao;
  else if (p === "ACQUIRING") display = "IDENTIFYING TYPE";
  else if (p === "STOPPED") display = "SAFE PARKED";
  else if (mismatch) display = "TYPE MISMATCH - GATE PLAN ERROR";
  else if (gseIntrusion) display = "HOLD - GSE IN SCAN FAN";
  else display = speed > 2.3 ? "SLOW DOWN" : distance > target.stop_tol ? "CONTINUE" : "STOP";

  const az = p === "ACQUIRING" || p === "DOCKING"
    ? parseFloat(((Math.random() * 2 - 1) * (distance > 20 ? 1.6 : 0.5)).toFixed(2))
    : p === "STOPPED" ? parseFloat(((Math.random() * 2 - 1) * 0.2).toFixed(2)) : null;
  const alignStatus = az === null ? "NOT TRACKED"
    : Math.abs(az) < 0.25 ? "ON CENTERLINE"
    : az > 0 ? "DRIFTING RIGHT - CORRECT" : "DRIFTING LEFT - CORRECT";

  const sensorObject = {
    sensor_id: sensorId,
    sensor_type: "A-VDGS (3D LiDAR + IR Camera Docking Guidance)",
    stand_id: "A" + Math.floor(Math.random() * 50 + 1),
    gate_plan_type: expected.icao,
    detected_type: p === "SEARCH" ? null : target.icao,
    detected_name: p === "SEARCH" ? null : target.name,
    type_mismatch_alert: mismatch && p !== "SEARCH",
    registration: p === "SEARCH" ? null : registration,
    registration_ocr_confidence: p === "SEARCH" ? null : parseFloat((0.88 + Math.random() * 0.11).toFixed(2)),
    docking_phase: p,
    distance_to_stop: distance,
    distance_to_stop_unit: "m",
    approach_speed: speed,
    approach_speed_unit: "m/s",
    azimuth_alignment: az,
    azimuth_alignment_unit: "deg (+right / -left of lead-in centerline)",
    alignment_status: alignStatus,
    display_message: display,
    stop_tolerance: target.stop_tol,
    stop_tolerance_unit: "m",
    measured_wingspan: p === "SEARCH" ? null : parseFloat((target.wingspan + (Math.random() * 2 - 1) * 0.3).toFixed(1)),
    measured_wingspan_unit: "m (LiDAR tip-to-tip)",
    measured_length: p === "SEARCH" ? null : parseFloat((target.length + (Math.random() * 2 - 1) * 0.5).toFixed(1)),
    measured_length_unit: "m (nose-to-tail)",
    laser_scanner: {
      wavelength: 905,
      wavelength_unit: "nm",
      laser_class: "1M (eye-safe)",
      scan_rate: Math.round(25 + Math.random() * 25),
      scan_rate_unit: "Hz",
      angular_resolution: Math.round(2 + Math.random() * 6),
      angular_resolution_unit: "mrad"
    },
    ir_camera: {
      band: "LWIR 8-14 um",
      resolution: "1280x1024",
      sun_glare_mitigation: Math.random() > 0.85 ? "AUTO EXPOSURE - LOW SUN ANGLE" : "NONE"
    },
    weather_compensation: rainMode ? "RAIN MODE - RETURN GAIN BOOSTED" : "CLEAR",
    obstructions: gseIntrusion ? "GSE IN SCAN FAN - DOCKING SUSPENDED" : "NONE",
    parking_brake_set: p === "STOPPED" ? Math.random() > 0.2 : false,
    chocks_placed: p === "STOPPED" ? Math.random() > 0.4 : false, // ground crew hand signal to A-VDGS
    timestamp: new Date().toISOString()
  };

  return sensorObject
}