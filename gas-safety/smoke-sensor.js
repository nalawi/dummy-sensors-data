function generateSensorData(sensorId, minSmoke = 0.0, maxSmoke = 50.0) {
  // Simulate a dynamic smoke density reading within a realistic range (ppm)
  const randomSmoke = (Math.random() * (maxSmoke - minSmoke) + minSmoke).toFixed(2);
  
  // Trigger alarm when smoke concentration exceeds the detection threshold (e.g., 35 ppm)
  const smokeAlarm = parseFloat(randomSmoke) > 35;
  
  const sensorObject = {
    sensor_id: sensorId,
    smoke_level: parseFloat(randomSmoke),
    unit: "ppm",
    alarm_triggered: smokeAlarm,
    timestamp: new Date().toISOString()
  };

  return sensorObject
}