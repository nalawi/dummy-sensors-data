function generateSensorData(sensorId, detectionChance = 0.3) {
  // Simulate whether motion is detected (PIR sensors trigger occasionally in typical spaces)
  const motionDetected = Math.random() < detectionChance;
  
  // Simulate the infrared signal strength — strong when body heat is sensed, low when idle
  const randomSignal = motionDetected
    ? (Math.random() * (800 - 200) + 200).toFixed(2)  // body heat detected: 200-800 µV
    : (Math.random() * (150 - 20) + 20).toFixed(2);   // ambient background: 20-150 µV
  
  const sensorObject = {
    sensor_id: sensorId,
    motion_detected: motionDetected,
    infrared_signal: parseFloat(randomSignal),
    unit: "µV",
    timestamp: new Date().toISOString()
  };

  return sensorObject
}