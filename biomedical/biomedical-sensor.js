function generateSensorData(sensorId, patientState = "resting") {
  // Simulate heart rate (BPM) based on patient state — resting 60-100, active 100-160
  const hrRange = patientState === "resting" ? [60, 100] : [100, 160];
  const heartRate = Math.floor(Math.random() * (hrRange[1] - hrRange[0]) + hrRange[0]);
  
  // Simulate blood oxygen saturation (SpO2 %) — 95-100 is normal, < 90 requires attention
  const spo2 = Math.floor(Math.random() * (100 - 95) + 95);
  
  // Simulate blood pressure (mmHg) — systolic 90-140, diastolic 60-90 is normal
  const systolic = Math.floor(Math.random() * (140 - 90) + 90);
  const diastolic = Math.floor(Math.random() * (systolic - 40 - 60) + 60);
  
  // Assess patient status against clinical monitoring thresholds
  // (an elevated heart rate is expected during activity, not at rest)
  const hrThreshold = patientState === "resting" ? 100 : 160;
  const healthStatus = heartRate > hrThreshold || spo2 < 95 || systolic > 130 || diastolic > 85
    ? "ATTENTION REQUIRED"
    : "NORMAL";
  
  const sensorObject = {
    sensor_id: sensorId,
    patient_state: patientState,
    heart_rate: heartRate,
    heart_rate_unit: "bpm",
    spo2: spo2,
    spo2_unit: "%",
    blood_pressure: `${systolic}/${diastolic}`,
    blood_pressure_unit: "mmHg",
    health_status: healthStatus,
    timestamp: new Date().toISOString()
  };

  return sensorObject
}