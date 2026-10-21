function generateSensorData(sensorId, machineType = "motor", health = "normal") {
  // Healthy machines oscillate near their baseline (mm/s RMS); degradation amplifies deviation
  const baseline = { pump: 1.5, motor: 1.0, turbine: 2.5 }[machineType] || 1.5;
  const severity = { normal: 1.0, warning: 3.0, critical: 6.0 }[health] || 1.0;
  const vibrationRms = parseFloat((baseline * severity * (0.8 + Math.random() * 0.4)).toFixed(2));
  
  // Dominant frequency: healthy machines peak at rotation speed (RPM/60 = 1x);
  // bearing defects appear as harmonics at 2-6x rotation speed
  const operatingSpeed = { pump: 2900, motor: 1450, turbine: 3600 }[machineType] || 1450;
  const rotationHz = parseFloat((operatingSpeed / 60).toFixed(1));
  const dominantFrequency = health === "critical"
    ? parseFloat((rotationHz * (2 + Math.random() * 4)).toFixed(1))
    : parseFloat((rotationHz * (0.9 + Math.random() * 0.2)).toFixed(1));
  
  // How far the reading sits above the machine's healthy baseline (%)
  const baselineDeviation = parseFloat((((vibrationRms - baseline) / baseline) * 100).toFixed(1));
  
  // Classify severity per ISO 10816 vibration zones for rotating machinery
  const isoZone = vibrationRms < 2.8 ? "A - GOOD" : vibrationRms < 4.5 ? "B - ACCEPTABLE" : vibrationRms < 7.1 ? "C - UNSATISFACTORY" : "D - UNACCEPTABLE";
  
  // Fault diagnosis from the vibration + frequency signature (predictive maintenance)
  let diagnosis = "BASELINE NORMAL";
  if (vibrationRms > baseline * 2 && dominantFrequency > rotationHz * 2) {
    diagnosis = "POSSIBLE BEARING FAULT";
  } else if (vibrationRms > baseline * 2) {
    diagnosis = "POSSIBLE MISALIGNMENT / IMBALANCE";
  } else if (vibrationRms > baseline * 1.5) {
    diagnosis = "DRIFT DETECTED - SCHEDULE INSPECTION";
  }
  
  const sensorObject = {
    sensor_id: sensorId,
    machine_type: machineType,
    vibration_rms: vibrationRms,
    unit: "mm/s",
    dominant_frequency: dominantFrequency,
    frequency_unit: "Hz",
    operating_speed_rpm: operatingSpeed,
    baseline_deviation: baselineDeviation,
    iso_zone: isoZone,
    diagnosis: diagnosis,
    timestamp: new Date().toISOString()
  };

  return sensorObject
}