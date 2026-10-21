function generateSensorData(sensorId, minPH = 6.5, maxPH = 8.5) {
  // Simulate a dynamic pH reading within the safe range (7 = neutral, < 7 acidic, > 7 alkaline)
  const randomPH = (Math.random() * (maxPH - minPH) + minPH).toFixed(2);
  
  // Simulate electrical conductivity (µS/cm) — indicates dissolved ion concentration
  const randomConductivity = (Math.random() * (800 - 100) + 100).toFixed(2);
  
  // Simulate residual chlorine (mg/L) — disinfectant level in treated water (0.2-4.0 is safe)
  const randomChlorine = (Math.random() * (3.0 - 0.2) + 0.2).toFixed(2);
  
  // Simulate total dissolved solids (ppm) — aggregate ion concentration (WHO: < 500 ideal)
  const randomTDS = Math.floor(Math.random() * (500 - 50) + 50);
  
  // Assess overall water quality against treatment/aquaculture standards
  const ph = parseFloat(randomPH);
  const waterQuality = ph >= 6.5 && ph <= 8.5 && randomTDS < 500 && randomChlorine <= 4.0 ? "SAFE" : "REQUIRES TREATMENT";
  
  const sensorObject = {
    sensor_id: sensorId,
    ph_level: ph,
    electrical_conductivity: parseFloat(randomConductivity),
    conductivity_unit: "µS/cm",
    chlorine_level: parseFloat(randomChlorine),
    chlorine_unit: "mg/L",
    tds: randomTDS,
    tds_unit: "ppm",
    water_quality: waterQuality,
    timestamp: new Date().toISOString()
  };

  return sensorObject
}