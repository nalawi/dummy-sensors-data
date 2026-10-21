function generateSensorData(sensorId, minGas = 350.0, maxGas = 2000.0) {
  // Simulate a dynamic gas concentration reading within a realistic range (e.g., CO2 in ppm)
  const randomGas = (Math.random() * (maxGas - minGas) + minGas).toFixed(2);
  
  // Simulate an air quality index reading (0-150: Good to Unhealthy for Sensitive Groups)
  const randomAQI = Math.floor(Math.random() * 151);
  
  const sensorObject = {
    sensor_id: sensorId,
    gas_concentration: parseFloat(randomGas),
    unit: "ppm",
    air_quality_index: randomAQI,
    timestamp: new Date().toISOString()
  };

  return sensorObject
}