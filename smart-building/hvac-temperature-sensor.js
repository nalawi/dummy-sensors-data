function generateSensorData(sensorId, mode = "auto") {
  // Zone temperature probe feeding the Building Management System (BMS):
  // a return-air RTD whose reading couples to solar gain, occupancy and the
  // VAV damper the BAS commands to hold the comfort band (21.0-24.0 C occupied)
  const zones = ["L1-LOBBY", "L2-OPEN-OFFICE", "L3-CONF-A", "L4-CAFETERIA", "L5-IDF-CLOSET"];
  const zone = zones[Math.floor(Math.random() * zones.length)];

  const state = mode === "auto" ? (Math.random() > 0.3 ? "OCCUPIED" : "UNOCCUPIED") : mode.toUpperCase();
  const band = state === "OCCUPIED" ? [21.0, 24.0] : [18.0, 27.0];

  // 92% of occupied readings hold the band; the rest drift out via solar gain,
  // a propped terrace door, or a stuck VAV damper flagged for maintenance
  const inBand = mode === "auto" ? Math.random() > 0.08 : false;
  const drift = inBand ? 0 : (Math.random() > 0.5 ? 1 : -1) * (0.2 + Math.random() * 3.5);
  const temperature = parseFloat((band[0] + Math.random() * (band[1] - band[0]) + drift).toFixed(2));

  // VAV box reacts inversely: cooling at the top of the band, heating at the bottom
  const damper = parseFloat((temperature > 22.5
    ? 30 + (temperature - 22.5) * 18
    : 55 - (22.5 - temperature) * 16).toFixed(0));

  const causes = ["SOLAR GAIN WEST FACADE", "TERRACE DOOR PROPPED", "VAV DAMPER STUCK 15%", "CONF ROOM OVERBOOKED"];
  const deviationCause = inBand ? null : causes[Math.floor(Math.random() * causes.length)];

  const sensorObject = {
    sensor_id: sensorId,
    sensor_type: "BMS Zone Temperature Sensor - RTD Pt1000, return-air mount",
    zone: zone,
    temperature: temperature,
    temperature_unit: "C",
    setpoint: setpointFor(state),
    setpoint_unit: "C (BAS comfort setpoint)",
    comfort_band: state === "OCCUPIED" ? "21.0-24.0" : "18.0-27.0 (night setback)",
    comfort_band_unit: "C deadband",
    hvac_state: damper > 70 ? "COOLING" : damper < 35 ? "HEATING" : "IDLE",
    vav_damper: damper,
    vav_damper_unit: "% open",
    deviation_cause: deviationCause,
    humidity_compensated: true,
    probe_health: Math.random() > 0.98 ? "DRIFT 0.4C vs REFERENCE - RECALIBRATE" : "NOMINAL",
    timestamp: new Date().toISOString()
  };

  function setpointFor(s) { return s === "OCCUPIED" ? 22.5 : 19.5; }

  return sensorObject
}