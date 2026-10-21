function generateSensorData(sensorId, tankHeight = 300.0, material = "liquid") {
  // Simulate a dynamic fill height within the tank (cm)
  const randomLevel = (Math.random() * tankHeight).toFixed(2);
  const level = parseFloat(randomLevel);
  
  // Compute the tank fill percentage from the measured height
  const fillPercentage = parseFloat(((level / tankHeight) * 100).toFixed(1));
  
  // Classify fill status for tank/fuel/waste management scenarios
  const fillStatus = fillPercentage < 20 ? "LOW" : fillPercentage > 90 ? "NEARLY FULL" : "NORMAL";
  
  // Alert when the tank is running low (refill needed) or nearly full (emptying needed)
  const levelAlert = fillPercentage < 20 || fillPercentage > 90;
  
  const sensorObject = {
    sensor_id: sensorId,
    material: material,
    level: level,
    unit: "cm",
    tank_height: tankHeight,
    fill_percentage: fillPercentage,
    fill_status: fillStatus,
    level_alert: levelAlert,
    timestamp: new Date().toISOString()
  };

  return sensorObject
}