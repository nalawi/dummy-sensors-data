function generateSensorData(sensorId, minLux = 0.0, maxLux = 100000.0) {
  // Simulate a dynamic light intensity reading within a realistic range (lux)
  const randomLux = (Math.random() * (maxLux - minLux) + minLux).toFixed(2);
  const lux = parseFloat(randomLux);
  
  // Classify the lighting condition based on ambient light level
  const lightCondition = lux < 10 ? "DARK" : lux < 50 ? "DIM" : lux < 500 ? "INDOOR" : lux < 25000 ? "BRIGHT" : "VERY BRIGHT";
  
  // Recommend actuator brightness — streetlights brighten as ambient light falls (inverse relation)
  const recommendedBrightness = Math.round(Math.max(0, Math.min(100, 100 - (lux / 500) * 100)));
  
  const sensorObject = {
    sensor_id: sensorId,
    light_intensity: lux,
    unit: "lux",
    light_condition: lightCondition,
    recommended_brightness: recommendedBrightness,
    timestamp: new Date().toISOString()
  };

  return sensorObject
}