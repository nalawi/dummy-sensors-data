function generateSensorData(sensorId, load = "auto") {
  // Branch-circuit energy meter on CTs / Rogowski coils feeding the electrical
  // panel: samples V & I waveform pairs to give true RMS power, energy and
  // power factor per feeder, so the BMS can attribute kWh to floors, chase
  // harmonics and catch failing power supplies.
  const feeders = ["AHU-2-CHILLER", "L2-OFFICE-RING", "L4-CAFETERIA", "B1-EV-CHARGERS", "ROOF-PV-INVERTER"];
  const feeder = feeders[Math.floor(Math.random() * feeders.length)];

  // Distinct load personalities: chiller steady-heavy, EV lumpy, PV exporting
  const profiles = {
    "AHU-2-CHILLER":      { amps: [55, 120], pf: [0.88, 0.95], flow: "STEADY" },
    "L2-OFFICE-RING":     { amps: [8, 45],   pf: [0.92, 0.99], flow: "STEADY" },
    "L4-CAFETERIA":       { amps: [15, 90],  pf: [0.85, 0.95], flow: "LUMPY" },
    "B1-EV-CHARGERS":     { amps: [10, 160], pf: [0.97, 0.99], flow: "LUMPY" },
    "ROOF-PV-INVERTER":   { amps: [-40, 25], pf: [0.98, 1.0],  flow: "EXPORT" }
  };
  const p = profiles[feeder];
  const mode = load === "auto" ? p.flow : load.toUpperCase();

  const [loA, hiA] = p.amps;
  const amps = parseFloat((loA + Math.random() * (hiA - loA)).toFixed(1));
  const volts = parseFloat((229 + Math.random() * 4).toFixed(1));   // 230V nominal L-N
  const pf = parseFloat((p.pf[0] + Math.random() * (p.pf[1] - p.pf[0])).toFixed(3));
  const kw = parseFloat((volts * amps * pf / 1000 * 3).toFixed(2));  // 3-phase estimate
  const thd = mode === "LUMPY" ? parseFloat((8 + Math.random() * 12).toFixed(1)) : parseFloat((2 + Math.random() * 4).toFixed(1));

  const alarms = [];
  if (amps > (feeder === "B1-EV-CHARGERS" ? 150 : 110)) alarms.push("OVERCURRENT >80% BREAKER");
  if (pf < 0.88) alarms.push("POWER FACTOR PENALTY - CAP BANK SWITCH-IN");
  if (thd > 12) alarms.push("THD HIGH - CHECK VFD FILTERS");

  const sensorObject = {
    sensor_id: sensorId,
    sensor_type: "Energy Meter - 3x Rogowski coil + shunt V sampling, class 0.5S",
    feeder: feeder,
    metering_standard: "IEC 62053-22",
    voltage: volts,
    voltage_unit: "V RMS L-N",
    current: amps,
    current_unit: "A RMS per phase",
    power_factor: pf,
    active_power: kw,
    active_power_unit: "kW (3-phase)",
    energy_today: parseFloat((Math.random() * 450).toFixed(1)),
    energy_today_unit: "kWh since midnight",
    current_thd: thd,
    current_thd_unit: "% harmonic distortion",
    flow_direction: mode === "EXPORT" ? "EXPORT (PV net to grid)" : "IMPORT",
    alarm_flags: alarms.length ? alarms : "NONE",
    breaker_rating: feeder === "B1-EV-CHARGERS" ? 200 : 125,
    breaker_rating_unit: "A trip curve C",
    coil_health: Math.random() > 0.97 ? "CT-B LEAD SUSPECT - VERIFY WITH CLAMP METER" : "NOMINAL",
    timestamp: new Date().toISOString()
  };

  return sensorObject
}