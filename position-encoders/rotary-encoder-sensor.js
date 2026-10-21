function generateSensorData(sensorId, resolutionPpr = 3600, application = "packaging") {
  // Nominal shaft speed per application (packaging line 120 RPM, robot joint 1800 RPM, spindle 6000 RPM)
  const nominalRpm = { packaging: 120, robot: 1800, spindle: 6000 }[application] || 120;
  
  // Direction: CW dominant with occasional CCW (reverse jogging / return strokes)
  const direction = Math.random() > 0.2 ? "CW" : "CCW";
  
  // Servo-regulated speed with small regulation jitter (±2%)
  const speedRpm = parseFloat((nominalRpm * (1 + (Math.random() * 2 - 1) * 0.02)).toFixed(1));
  
  // Angular velocity derived from speed (deg/s = RPM x 6), signed by direction
  const sign = direction === "CW" ? 1 : -1;
  const angularVelocity = parseFloat((sign * speedRpm * 6).toFixed(1));
  
  // Shaft position: cumulative revolutions since startup + fractional angle within the current rev
  const revolutions = Math.floor(Math.random() * 10000);
  const angleDeg = parseFloat((Math.random() * 360).toFixed(2));
  
  // Cumulative quadrature count (4x decoding of A/B channels)
  const countPosition = revolutions * resolutionPpr * 4 + Math.floor((angleDeg / 360) * resolutionPpr * 4);
  
  // Index pulse: the Z channel fires once per revolution as the home reference
  const indexPulse = Math.random() > 0.5;
  
  // Synchronization following error vs the commanded position (closed-loop motion control);
  // healthy servos hold tight sync ~85% of the time, with occasional lag and rare faults
  const faultRoll = Math.random();
  const syncDeviation = faultRoll > 0.95
    ? parseFloat((1.0 + Math.random()).toFixed(2))
    : faultRoll > 0.85
      ? parseFloat((0.5 + Math.random() * 0.5).toFixed(2))
      : parseFloat((Math.random() * 0.5).toFixed(2));
  const syncStatus = syncDeviation < 0.5 ? "IN SYNC" : syncDeviation < 1.0 ? "MINOR LAG" : "POSITION ERROR";
  
  const sensorObject = {
    sensor_id: sensorId,
    application: application,
    resolution_ppr: resolutionPpr,
    counts_per_revolution: resolutionPpr * 4,
    angle: angleDeg,
    angle_unit: "degrees",
    revolutions: revolutions,
    count_position: countPosition,
    speed: speedRpm,
    speed_unit: "RPM",
    angular_velocity: angularVelocity,
    velocity_unit: "°/s",
    direction: direction,
    index_pulse_detected: indexPulse,
    sync_deviation: syncDeviation,
    sync_unit: "degrees",
    sync_status: syncStatus,
    timestamp: new Date().toISOString()
  };

  return sensorObject
}