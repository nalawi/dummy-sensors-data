function generateSensorData(sensorId, capacityKg = 500.0, application = "scale") {
  // Simulate applied load within the cell capacity (industrial weighing scenario)
  const randomLoad = (Math.random() * capacityKg).toFixed(2);
  const loadKg = parseFloat(randomLoad);
  
  // Derive the applied force from the mass (F = m x g)
  const forceN = parseFloat((loadKg * 9.81).toFixed(2));
  
  // Simulate strain gauge microstrain proportional to the applied stress (typical full-scale ~1000 µε)
  const microstrain = parseFloat(((loadKg / capacityKg) * 1000).toFixed(1));
  
  // Convert microstrain to mechanical stress via Hooke's law (steel modulus E ≈ 200 GPa = 200,000 MPa)
  const stressMPa = parseFloat((microstrain * 0.2).toFixed(2)); // σ[MPa] = ε[µε] x 10^-6 x 200,000
  
  // Classify the load condition for overload protection and monitoring
  const loadPercentage = parseFloat(((loadKg / capacityKg) * 100).toFixed(1));
  const loadStatus = loadPercentage > 100 ? "OVERLOAD" : loadPercentage > 90 ? "NEAR CAPACITY" : loadPercentage < 5 ? "NO LOAD" : "WITHIN RATING";
  
  const sensorObject = {
    sensor_id: sensorId,
    application: application,
    mass: loadKg,
    mass_unit: "kg",
    force: forceN,
    force_unit: "N",
    microstrain: microstrain,
    strain_unit: "µε",
    stress: stressMPa,
    stress_unit: "MPa",
    capacity: capacityKg,
    load_percentage: loadPercentage,
    load_status: loadStatus,
    timestamp: new Date().toISOString()
  };

  return sensorObject
}