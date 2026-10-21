function generateSensorData(sensorId, area = "RUNWAY 09L") {
  // ASDE-X fuses surface radar, multilateration and ADS-B to track every target on the
  // movement area (aircraft, tugs, fuel trucks) even in dense fog when eyes cannot
  const targetTypes = [
    { cls: "AIRCRAFT-HEAVY",    model: "B777-300ER",   maxSpd: 15 },
    { cls: "AIRCRAFT-MEDIUM",   model: "A320neo",      maxSpd: 12 },
    { cls: "AIRCRAFT-REGIONAL", model: "ATR 72-600",   maxSpd: 10 },
    { cls: "VEHICLE-TUG",       model: "pushback tug", maxSpd: 6 },
    { cls: "VEHICLE-FUEL",      model: "fuel truck",   maxSpd: 8 },
    { cls: "VEHICLE-OPS",       model: "follow-me car", maxSpd: 14 }
  ];
  const zones = [area, "TAXIWAY A", "TAXIWAY B", "APRON 3", "HOLDING POINT R1"];

  const targets = [];
  const targetCount = 2 + Math.floor(Math.random() * 5);
  for (let i = 0; i < targetCount; i++) {
    const t = targetTypes[Math.floor(Math.random() * targetTypes.length)];
    const moving = Math.random() > 0.25; // some targets parked or holding
    targets.push({
      track_id: "SMR-" + (1000 + Math.floor(Math.random() * 9000)),
      class: t.cls,
      model: t.model,
      position_x: parseFloat((Math.random() * 3800).toFixed(1)),
      position_x_unit: "m from threshold",
      position_y: parseFloat((Math.random() * 60 - 30).toFixed(1)),
      position_y_unit: "m from centerline",
      speed: moving ? parseFloat((Math.random() * t.maxSpd).toFixed(1)) : 0.0,
      speed_unit: "knots",
      heading: Math.random() > 0.5 ? "085" : "265",
      zone: zones[Math.floor(Math.random() * zones.length)]
    });
  }

  // Runway incursion watch: an unauthorized target inside the active runway zone
  const incursion = Math.random() > 0.96;
  const onRunway = targets.filter((t) => t.zone === area);
  const conflictAlert = incursion && onRunway.length
    ? "RUNWAY INCURSION - " + onRunway[0].class + " INSIDE " + area + " WITHOUT CLEARANCE"
    : "CLEAR";

  const sensorObject = {
    sensor_id: sensorId,
    radar_type: "SMR / ASDE-X",
    monitored_area: area,
    scan_rate: 1.0,
    scan_rate_unit: "Hz",
    position_accuracy: 7.5,
    position_accuracy_unit: "m RMS",
    all_weather_capable: true, // radar keeps tracking in zero-visibility fog
    target_count: targets.length,
    aircraft_count: targets.filter((t) => t.class.startsWith("AIRCRAFT")).length,
    vehicle_count: targets.filter((t) => t.class.startsWith("VEHICLE")).length,
    targets: targets,
    conflict_alert: conflictAlert,
    timestamp: new Date().toISOString()
  };

  return sensorObject
}