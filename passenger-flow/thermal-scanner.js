function generateSensorData(sensorId, scenario = "auto") {
  // The checkpoint camera reads each face's inner-canthus region (tear duct)
  // at 30 Hz and converts radiance to core-temperature estimate; ambient
  // drift and emissivity mismatch are handled by a blackbody reference plate
  const febrile = scenario === "fever" ? true : scenario === "healthy" ? false : Math.random() > 0.965;

  const ambient = parseFloat((24 + Math.random() * 4).toFixed(1)); // hall HVAC band

  // Elevated screen: inner canthus (over the carotid) reads ~0.8 C above the
  // oral-core proxy; healthy band 35.8-37.2 C, febrile 38.5-39.7 C
  const nPassengers = Math.floor(Math.random() * 8) + 2;
  const readings = [];
  let detections = 0;
  for (let i = 0; i < nPassengers; i++) {
    const isFebrile = febrile ? i < 2 : Math.random() > 0.965;
    const skin = isFebrile ? 38.5 + Math.random() * 1.2 : 35.8 + Math.random() * 1.4;
    const est = skin - 0.8 + (Math.random() * 2 - 1) * 0.25; // canthus->core model
    const exceeded = est >= 37.5;
    if (exceeded) detections++;
    readings.push({
      lane_position: i + 1,
      skin_temp: parseFloat(skin.toFixed(2)),
      skin_temp_unit: "degC (max face ROI)",
      core_estimate: parseFloat(est.toFixed(2)),
      core_estimate_unit: "degC (blackbody-corrected)",
      exceeds_threshold: exceeded,
      mask_worn: Math.random() > 0.6, // masks block cheeks but not canthus
      eyewear_interference: Math.random() > 0.92 // glasses bias the ROI
    });
  }

  const calibrationOk = Math.random() > 0.94; // reference plate drifts if occluded

  const sensorObject = {
    sensor_id: sensorId,
    sensor_type: "Thermal Fever-Screening Array (Multi-Person)",
    checkpoint: ["CUSTOMS ARRIVALS HALL", "TERMINAL ENTRY SCREEN", "TRANSFER CORRIDOR B"][Math.floor(Math.random() * 3)],
    camera: {
      sensor: "VOx MICROBOLOMETER 640x480",
      spectral_band: "8-14 um LWIR",
      thermal_sensitivity: parseFloat((0.03 + Math.random() * 0.02).toFixed(3)),
      thermal_sensitivity_unit: "degC NETD",
      frame_rate: 30,
      frame_rate_unit: "Hz"
    },
    blackbody_reference: {
      setpoint: 35.0,
      setpoint_unit: "degC",
      drift: parseFloat(((calibrationOk ? (Math.random() * 2 - 1) * 0.1 : 0.4 + Math.random() * 0.6)).toFixed(2)),
      drift_unit: "degC",
      calibration_ok: calibrationOk
    },
    ambient_temp: ambient,
    ambient_temp_unit: "degC",
    ambient_compensation: calibrationOk ? "ACTIVE" : "STALE - RE-ZERO REQUIRED",
    passengers_in_frame: nPassengers,
    readings: readings,
    detections: detections,
    screening_threshold: 37.5,
    screening_threshold_unit: "degC core estimate",
    secondary_check_referral: detections > 0 ? "REFERRAL LANE - HANDHELD CONTACT THERMOMETER" : "NONE",
    false_positive_guard: "THREE-SCAN CONFIRMATION + CANOPY WAIT LINE",
    privacy_mode: "NO IMAGE STORAGE - TEMPERATURE MATRIX ONLY",
    timestamp: new Date().toISOString()
  };

  return sensorObject
}