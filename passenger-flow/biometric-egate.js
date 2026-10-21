function generateSensorData(sensorId, scenario = "auto") {
  // E-gate projector floods the face with 940 nm IR (invisible, bypasses
  // ambient light) while an anti-spoof engine checks depth, liveness and
  // albedo against the e-passport NFC chip photo (ICAO 9303 threshold)
  const fail = scenario === "failure" ? true : scenario === "clean" ? false : Math.random() > 0.88;

  const gates = ["E-GATE CLUSTER A", "E-GATE CLUSTER B", "BOARDING LANE 12", "AUTOMATED IMMIGRATION 7"];
  const nationalities = ["IDN", "SGP", "MYS", "AUS", "JPN", "DEU", "GBR", "USA", "IND", "CHN"];

  // Analog of ICAO 9303 Part 9: gate opens at FAR <= 1:10000, rejection
  // threshold tuned per NIST FRVT operating point
  const genuineMatch = !fail;
  const similarity = genuineMatch
    ? parseFloat((0.82 + Math.random() * 0.17).toFixed(3))   // confident match
    : parseFloat((0.38 + Math.random() * 0.28).toFixed(3));  // impostor band
  const matched = similarity >= 0.68;

  const spoofTests = [
    { method: "PRINT ATTACK (PHOTO HOLD)", detected: true },
    { method: "SCREEN REPLAY ATTACK", detected: true },
    { method: "SILICONE MASK", detected: Math.random() > 0.15 },
    { method: "3D RESIN HEAD", detected: Math.random() > 0.3 }
  ];
  const spoofAttempt = fail && Math.random() > 0.6;
  const chosenSpoof = spoofTests[Math.floor(Math.random() * spoofTests.length)];

  const failureReasons = [
    "FACE NOT DETECTED - CAP OVER FACE / STAND CLOSER",
    "AMBIENT IR SATURATION - REMOVE HAT VISOR",
    "GLASSES REFLECTANCE - TILT HEAD DOWN SLIGHTLY",
    "PORTRAIT QUALITY BELOW ICAO 9303 IN CHIP",
    "NFC CHIP READ FAILURE - RE-TAP PASSPORT"
  ];

  const sensorObject = {
    sensor_id: sensorId,
    sensor_type: "Biometric E-Gate (IR Facial Recognition + NFC)",
    gate_location: gates[Math.floor(Math.random() * gates.length)],
    transaction_id: "EG-" + Math.floor(Math.random() * 1e8).toString().padStart(8, "0"),
    passport: {
      issuing_state: nationalities[Math.floor(Math.random() * nationalities.length)],
      chip_type: "ICAO 9303 LDS v2",
      chip_read_ok: fail ? Math.random() > 0.35 : true,
      passive_authentication: fail ? Math.random() > 0.5 : true, // PKI check against CSCA
      active_authentication: Math.random() > 0.7, // supported on newer chips only
      mrz_checksum_valid: fail ? Math.random() > 0.4 : true
    },
    illumination: {
      wavelength: 940,
      wavelength_unit: "nm (covert IR)",
      projector_power: parseFloat((60 + Math.random() * 40).toFixed(0)),
      projector_power_unit: "% duty",
      ambient_visible_light: Math.random() > 0.5 ? "HIGH - IR FLOOD COMPENSATING" : "NOMINAL"
    },
    face_capture: {
      resolution: "1920x1080",
      pose_angle: parseFloat(((Math.random() * 2 - 1) * (fail ? 22 : 8)).toFixed(1)),
      pose_angle_unit: "deg (yaw)",
      interocular_distance_px: Math.round(90 + Math.random() * 90),
      iso_compliant: !fail || Math.random() > 0.5
    },
    liveness_check: {
      depth_map_3d: spoofAttempt ? "FLAT - NO GENUINE DEPTH" : "PASSED",
      micro_motion: spoofAttempt ? "NONE - STATIC IMAGE" : "NATURAL MICRO-MOVEMENT",
      multispectral_albedo: spoofAttempt ? (chosenSpoof.detected ? "FAILED" : "INCONCLUSIVE") : "PASSED",
      presentation_attack: spoofAttempt,
      pad_attack_type: spoofAttempt ? chosenSpoof.method : null,
      pad_defeated: spoofAttempt ? chosenSpoof.detected : false
    },
    face_match: {
      similarity_score: similarity,
      decision_threshold: 0.68,
      matched: matched,
      template_format: "ISO/IEC 19794-5",
      reroll_attempts_used: fail && !spoofAttempt ? Math.floor(Math.random() * 3) + 1 : 0
    },
    gate_decision: spoofAttempt && chosenSpoof.detected ? "REFUSED - FRAUD ALERT LOGGED"
      : spoofAttempt ? "REFUSED - SUSPECTED PRESENTATION ATTACK"
      : matched && !fail ? "OPEN - BORDER CROSSING LOGGED"
      : fail ? "REFERRAL TO MANUAL BOOTH - " + failureReasons[Math.floor(Math.random() * failureReasons.length)]
      : "OPEN",
    border_log_hash: Array.from({ length: 16 }, () => "0123456789ABCDEF"[Math.floor(Math.random() * 16)]).join(""),
    privacy_mode: "BIOMETRIC TEMPLATE HASHED - RAW IMAGE DISCARDED",
    timestamp: new Date().toISOString()
  };

  return sensorObject
}