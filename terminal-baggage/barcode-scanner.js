function generateSensorData(sensorId, flow = "normal") {
  // High-speed laser/array imagers inside the scan tunnel decode IATA barcodes on
  // bags racing down the conveyor; unreadable tags are diverted to manual encode
  const flowFactor = flow === "peak" ? 1.4 : flow === "light" ? 0.6 : 1.0;
  const conveyorSpeed = parseFloat((0.6 + Math.random() * 1.6).toFixed(2)); // m/s belt speed

  const imagerType = Math.random() > 0.5 ? "LASER SCANNER (6-window tunnel)" : "ARRAY IMAGER (omnidirectional)";
  const airlines = ["GA", "SQ", "CX", "EK", "QF", "JL", "BR"];
  const destinations = ["DPS", "SIN", "HKG", "DXB", "SYD", "NRT", "AMS"];

  // The bag currently inside the read window
  const readAttempts = 1 + Math.floor(Math.random() * 4); // decoders retry across tunnel windows
  const decodeSuccess = Math.random() > 0.03; // ~97% first-pass read rate on clean tags
  const bagTag = {
    license_plate: Math.floor(Math.random() * 10000000000).toString().padStart(10, "0"), // IATA 10-digit LPN
    airline_code: airlines[Math.floor(Math.random() * airlines.length)],
    destination: destinations[Math.floor(Math.random() * destinations.length)],
    tag_condition: ["CLEAN", "CLEAN", "CLEAN", "SMUDGED", "WRINKLED", "PARTIALLY TORN"][Math.floor(Math.random() * 6)],
    decoded: decodeSuccess,
    attempts_used: readAttempts,
    read_location: decodeSuccess ? "WINDOW " + (1 + Math.floor(Math.random() * 6)) : "FAILED - ALL WINDOWS",
    divert_required: !decodeSuccess
  };

  // Hourly tunnel statistics
  const bagsThisHour = Math.round((flow === "peak" ? 900 : flow === "light" ? 150 : 450) * flowFactor * (0.8 + Math.random() * 0.4));
  const manualEncodeRate = decodeSuccess ? 0 : 100 / (bagsThisHour || 1);
  const laserDiodeHealth = Array.from({ length: 6 }, () => Math.random() > 0.02);

  const sensorObject = {
    sensor_id: sensorId,
    sensor_type: imagerType,
    scan_tunnel_id: "BHS-T" + Math.floor(Math.random() * 40 + 1),
    conveyor_speed: conveyorSpeed,
    conveyor_speed_unit: "m/s",
    min_code_contrast: parseFloat((25 + Math.random() * 15).toFixed(1)),
    min_code_contrast_unit: "% PCS",
    last_bag_read: bagTag,
    bags_scanned_hour: bagsThisHour,
    bags_scanned_hour_unit: "bags/h",
    read_rate: parseFloat((100 - manualEncodeRate - Math.random() * 1.5).toFixed(2)),
    read_rate_unit: "%",
    misread_guard: Math.random() > 0.98 ? "CHECK DIGIT MISMATCH - BAG HELD" : "NONE",
    laser_diode_status: laserDiodeHealth.every((d) => d) ? "ALL 6 DIODES NOMINAL" : "DIODE " + (laserDiodeHealth.indexOf(false) + 1) + " DEGRADED - REDUNDANT PATH ACTIVE",
    timestamp: new Date().toISOString()
  };

  return sensorObject
}