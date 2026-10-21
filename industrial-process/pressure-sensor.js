function generateSensorData(sensorId, minPressure = 50.0, maxPressure = 150.0) {
  // Simulate a dynamic pressure reading within a realistic range (PSI)
  const randomPressure = (Math.random() * (maxPressure - minPressure) + minPressure).toFixed(2);
  const pressure = parseFloat(randomPressure);
  
  // Classify reading against the nominal operating window (leaks cause pressure drops)
  const pressureStatus = pressure < 70 ? "LOW - POSSIBLE LEAK" : pressure > 120 ? "HIGH - OVERPRESSURE" : "NORMAL";
  
  // Trigger alert when pressure falls outside the safe operating range
  const leakAlert = pressure < 70 || pressure > 120;
  
  const sensorObject = {
    sensor_id: sensorId,
    pressure: pressure,
    unit: "PSI",
    pressure_status: pressureStatus,
    leak_alert: leakAlert,
    timestamp: new Date().toISOString()
  };

  return sensorObject
}