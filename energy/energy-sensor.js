function generateSensorData(sensorId, maxLoadKw = 50.0) {
  // Simulate mains voltage around the nominal 230V level (grid tolerance ~ +/- 10%)
  const voltage = parseFloat((207 + Math.random() * 46).toFixed(1));
  
  // Simulate current draw (A) — power flows from the applied load on the circuit
  const loadKw = parseFloat((Math.random() * maxLoadKw).toFixed(2));
  const current = parseFloat(((loadKw * 1000) / voltage).toFixed(2));
  
  // Compute active power (kW) and instantaneous power factor (0.80-1.00, industrial target >= 0.95)
  const powerFactor = parseFloat((0.8 + Math.random() * 0.2).toFixed(2));
  
  // Simulate cumulative energy consumption for this reading interval (kWh)
  const energyKwh = parseFloat((loadKw * (5 / 60)).toFixed(4)); // 5-minute interval
  
  // Classify grid/factory load level against the circuit capacity
  const loadPercentage = parseFloat(((loadKw / maxLoadKw) * 100).toFixed(1));
  const loadStatus = loadPercentage < 40 ? "LIGHT LOAD" : loadPercentage <= 80 ? "NORMAL LOAD" : "PEAK LOAD";
  
  const sensorObject = {
    sensor_id: sensorId,
    voltage: voltage,
    voltage_unit: "V",
    current: current,
    current_unit: "A",
    power: loadKw,
    power_unit: "kW",
    power_factor: powerFactor,
    energy_consumed: energyKwh,
    energy_unit: "kWh",
    load_percentage: loadPercentage,
    load_status: loadStatus,
    timestamp: new Date().toISOString()
  };

  return sensorObject
}