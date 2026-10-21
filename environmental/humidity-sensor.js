function generateSensorData(sensorId, minHumidity = 30.0, maxHumidity = 60.0) {
  // Simulate a dynamic humidity reading within a realistic range
  const randomHumidity = (Math.random() * (maxHumidity - minHumidity) + minHumidity).toFixed(2);
  
  const sensorObject = {
    sensor_id: sensorId,
    humidity: parseFloat(randomHumidity),
    unit: "%",
    timestamp: new Date().toISOString()
  };

  return sensorObject
}