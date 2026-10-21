function generateSensorData(sensorId, condition = "normal") {
  // Peak amplitude (dB ref 1 µV at sensor) per condition — a quiet structure sits near background noise
  const amplitudeRange = { normal: [25, 35], friction: [40, 55], crack: [60, 80], leak: [50, 70] }[condition] || [25, 35];
  const amplitudeDb = parseFloat((Math.random() * (amplitudeRange[1] - amplitudeRange[0]) + amplitudeRange[0]).toFixed(1));
  
  // Dominant ultrasonic frequency (kHz) — all monitored activity lies above the 20 kHz hearing limit;
  // friction sits in the low band, gas leaks emit mid-band broadband, crack growth emits high-frequency bursts
  const frequencyRange = { normal: [20, 35], friction: [25, 45], crack: [80, 150], leak: [35, 60] }[condition] || [20, 35];
  const dominantFrequency = parseFloat((Math.random() * (frequencyRange[1] - frequencyRange[0]) + frequencyRange[0]).toFixed(1));
  
  // AE hits (events/min) — crack growth produces dense burst activity; leaks are fewer but continuous
  const hitRange = { normal: [0, 10], friction: [20, 60], crack: [50, 120], leak: [30, 80] }[condition] || [0, 10];
  const hitCount = Math.floor(Math.random() * (hitRange[1] - hitRange[0]) + hitRange[0]);
  
  // RMS level trails the peak for burst signals (cracks), stays close for continuous sources (leaks)
  const rmsLevel = condition === "leak"
    ? parseFloat((amplitudeDb - Math.random() * 5).toFixed(1))
    : parseFloat((amplitudeDb - 10 - Math.random() * 5).toFixed(1));
  
  // Classify the emission source signature
  const emissionType = {
    normal: "BACKGROUND NOISE - STRUCTURE NOMINAL",
    friction: "ELEVATED FRICTION / LUBRICATION WEAR",
    crack: "MICRO-CRACK GROWTH DETECTED",
    leak: "HIGH-PRESSURE GAS LEAK DETECTED"
  }[condition] || "BACKGROUND NOISE - STRUCTURE NOMINAL";
  
  // Alert when emission exceeds the 40 dB detection threshold
  const alert = amplitudeDb > 40;
  
  const sensorObject = {
    sensor_id: sensorId,
    amplitude_db: amplitudeDb,
    rms_level_db: rmsLevel,
    unit: "dB_AE",
    detection_threshold_db: 40,
    dominant_frequency: dominantFrequency,
    frequency_unit: "kHz",
    hit_count: hitCount,
    emission_type: emissionType,
    alert: alert,
    timestamp: new Date().toISOString()
  };

  return sensorObject
}