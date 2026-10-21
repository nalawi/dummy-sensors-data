function generateSensorData(sensorId, minDistance = 2.0, maxDistance = 200.0, technology = "ultrasonic") {
  // Simulate a dynamic distance reading within a realistic range (cm)
  const randomDistance = (Math.random() * (maxDistance - minDistance) + minDistance).toFixed(2);
  const distance = parseFloat(randomDistance);
  
  // Classify proximity for automated parking / assembly line scenarios
  const proximityStatus = distance < 30 ? "TOO CLOSE" : distance < 100 ? "NEAR" : "CLEAR";
  
  const sensorObject = {
    sensor_id: sensorId,
    technology: technology,
    distance: distance,
    unit: "cm",
    proximity_status: proximityStatus,
    timestamp: new Date().toISOString()
  };

  return sensorObject
}