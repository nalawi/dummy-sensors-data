function generateSensorData(sensorId, mode = "auto") {
  // Buried TX and RX ported-coax run in parallel ~2 m apart; the TX leaks a
  // volumetric RF bubble above ground and the RX monitors it. A body inside
  // the bubble absorbs/scatters energy -> bridge loss -> alarm with a
  // range-gated position fix along the cable pair
  const event = mode === "auto" ? (Math.random() > 0.92 ? "BREACH" : "CLEAR") : mode.toUpperCase();
  const breach = event === "BREACH";

  const cableLength = 200; // m per zone
  const position = parseFloat((8 + Math.random() * (cableLength - 16)).toFixed(1));
  const lateral = breach ? parseFloat(((Math.random() * 2 - 1) * 1.2).toFixed(2)) : null; // m off cable centerline

  // Carrier 40-80 MHz; soil permittivity sets the bubble height above grade
  const soilMoisture = parseFloat((8 + Math.random() * 14).toFixed(1)); // % VWC
  const fieldHeight = parseFloat((0.4 + soilMoisture * 0.05).toFixed(2)); // wet soil = taller field

  // Signal processing: received level, bridge loss in dB, dwell threshold.
  // Rabbits/dogs under 10 kg are masked by mass discrimination
  const baselineDb = -62 - Math.random() * 4;
  const rxLevel = breach ? baselineDb - 6 - Math.random() * 10 : baselineDb + (Math.random() * 2 - 1);
  const loss = breach ? Math.abs(rxLevel - baselineDb) : Math.abs(rxLevel - baselineDb);
  const targetMass = breach ? parseFloat((25 + Math.random() * 85).toFixed(1)) : null; // kg, from loss curve
  const maskedAnimal = !breach && Math.random() > 0.93; // small animal walked the line

  const crawlAttempt = breach && Math.random() > 0.75; // prone profile = partial loss

  const sensorObject = {
    sensor_id: sensorId,
    sensor_type: "Leaky (Ported) Coaxial Buried RF Field Sensor",
    zone_id: "ZONE-" + Math.floor(Math.random() * 12 + 1),
    cable_pair_spacing: 2,
    cable_pair_spacing_unit: "m (TX/RX parallel run)",
    burial_depth: parseFloat((0.15 + Math.random() * 0.15).toFixed(2)),
    burial_depth_unit: "m below grade",
    carrier_frequency: Math.round(40 + Math.random() * 40),
    carrier_frequency_unit: "MHz",
    alarm_state: breach ? "ALARM" : "CLEAR",
    detection: {
      detected: breach,
      position_along_cable: breach ? position : null,
      position_unit: "m (range-gated +/-3 m)",
      lateral_offset: lateral,
      lateral_offset_unit: "m off centerline (+/-0.5 m)",
      profile_height_estimate: breach ? parseFloat((crawlAttempt ? 0.4 + Math.random() * 0.3 : 1.4 + Math.random() * 0.6).toFixed(2)) : null,
      profile_height_estimate_unit: "m (loss-curve inversion)",
      estimated_mass: targetMass,
      estimated_mass_unit: "kg",
      crawling_profile: crawlAttempt,
      dwell_time: breach ? Math.round(1 + Math.random() * 15) : 0,
      dwell_time_unit: "s in field"
    },
    signal: {
      rx_level: parseFloat(rxLevel.toFixed(1)),
      rx_level_unit: "dBm",
      bridge_loss: parseFloat(loss.toFixed(1)),
      bridge_loss_unit: "dB vs baseline",
      alarm_threshold: 6,
      alarm_threshold_unit: "dB sustained loss",
      baseline_drift: parseFloat(((Math.random() * 2 - 1) * 0.3).toFixed(2)),
      baseline_drift_unit: "dB/day (auto-calibrated)"
    },
    environment: {
      soil_moisture: soilMoisture,
      soil_moisture_unit: "% volumetric water content",
      field_height_above_grade: fieldHeight,
      field_height_unit: "m (wet soil raises the bubble)",
      frozen_ground_alert: soilMoisture < 10 && Math.random() > 0.8 ? "FROST LAYER - SENSITIVITY RECHECK" : "NONE"
    },
    small_animal_mask: {
      active: true,
      masked_events_last_24h: maskedAnimal ? Math.floor(Math.random() * 5) + 1 : Math.floor(Math.random() * 3),
      note: "SUB-10 KG TARGETS SUPPRESSED (RABBITS, FERAL DOGS)"
    },
    cable_health: Math.random() > 0.96 ? "RX SHEATH NICK AT 132 m - WATER INGRESS RISK" : "NOMINAL",
    timestamp: new Date().toISOString()
  };

  return sensorObject
}