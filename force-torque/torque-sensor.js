function generateSensorData(sensorId, nominalTorqueNm = 5.0, tolerancePercent = 10.0, application = "screwdriver") {
  // Simulate torque clustered at the setpoint; ~15% of readings drift beyond the spec band (quality rejects)
  const withinSpec = Math.random() > 0.15;
  const spread = withinSpec ? tolerancePercent * 0.8 : tolerancePercent + Math.random() * 10;
  const torqueNm = parseFloat((nominalTorqueNm * (1 + (Math.random() * 2 - 1) * spread / 100)).toFixed(2));
  
  // Quality tolerance band around the nominal setpoint
  const lowerLimit = parseFloat((nominalTorqueNm * (1 - tolerancePercent / 100)).toFixed(2));
  const upperLimit = parseFloat((nominalTorqueNm * (1 + tolerancePercent / 100)).toFixed(2));
  
  // Simulate rotational speed typical of the application (screwdriver 300, robot joint 60, CNC spindle 8000 RPM)
  const speedRpm = { screwdriver: 300, robot: 60, cnc: 8000 }[application] || 300;
  
  // Derive mechanical power from torque and angular velocity (P = τ x ω, ω = RPM x 2π/60)
  const powerW = parseFloat((torqueNm * speedRpm * 2 * Math.PI / 60).toFixed(1));
  
  // How far the reading sits from the nominal setpoint (%)
  const deviationPercent = parseFloat((((torqueNm - nominalTorqueNm) / nominalTorqueNm) * 100).toFixed(1));
  
  // Quality verdict against the spec band (pass/fail for process control)
  const qualityStatus = torqueNm < lowerLimit ? "UNDER-TORQUE - REJECTED" : torqueNm > upperLimit ? "OVER-TORQUE - REJECTED" : "IN TOLERANCE - PASS";
  
  const sensorObject = {
    sensor_id: sensorId,
    application: application,
    torque: torqueNm,
    torque_unit: "N·m",
    nominal_torque: nominalTorqueNm,
    tolerance_percent: tolerancePercent,
    spec_lower_limit: lowerLimit,
    spec_upper_limit: upperLimit,
    deviation_percent: deviationPercent,
    speed_rpm: speedRpm,
    speed_unit: "RPM",
    power: powerW,
    power_unit: "W",
    quality_status: qualityStatus,
    timestamp: new Date().toISOString()
  };

  return sensorObject
}