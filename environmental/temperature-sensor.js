function generateSensorData(sensorId, minTemp = 18.0, maxTemp = 30.0) {
  // Simulate a dynamic temperature reading within a realistic range
  const randomTemp = (Math.random() * (maxTemp - minTemp) + minTemp).toFixed(2);
  
  const sensorObject = {
    sensor_id: sensorId,
    temperature: parseFloat(randomTemp),
    unit: "Celsius",
    timestamp: new Date().toISOString()
  };

  return sensorObject
}