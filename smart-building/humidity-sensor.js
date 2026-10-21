function generateSensorData(sensorId, mode = "auto") {
  // Relative-humidity sensor co-located with the zone temperature probe.
  // RH matters at the extremes: below ~30% static discharge and dry-air
  // complaints; above ~60% sustained, mold risk on cold surfaces (dew point).
  // The controller modulates the AHU humidifier / CHW valve accordingly.
  const zones = ["L1-LOBBY", "L2-OPEN-OFFICE", "L3-CONF-A", "L4-CAFETERIA", "B1-ARCHIVE"];
  const zone = zones[Math.floor(Math.random() * zones.length)];

  // auto is dominated by the 35-55% comfort sweet spot; forced modes for
  // testing the humidifier/dehumidification control logic
  const states = ["COMFORT", "TOO_DRY", "TOO_HUMID", "ALERT_MOLD_RISK"];
  const state = mode === "auto"
    ? (Math.random() > 0.14 ? states[0] : states[1 + Math.floor(Math.random() * 3)])
    : mode.toUpperCase();

  const ranges = {
    COMFORT:         [35, 55],
    TOO_DRY:         [18, 30],
    TOO_HUMID:       [61, 75],
    ALERT_MOLD_RISK: [76, 95]
  };
  const [lo, hi] = ranges[state] || ranges.COMFORT;
  const humidity = parseFloat((lo + Math.random() * (hi - lo)).toFixed(2));

  // Dew point approximated from RH and an assumed 22 C room temp (Magnus formula)
  const roomTemp = 22.0;
  const gamma = Math.log(humidity / 100) + (17.62 * roomTemp) / (243.12 + roomTemp);
  const dewPoint = parseFloat(((243.12 * gamma) / (17.62 - gamma)).toFixed(1));

  const actions = {
    COMFORT:         "NONE",
    TOO_DRY:         "OPEN AHU-2 HUMIDIFIER VALVE TO 40%",
    TOO_HUMID:       "INCREASE CHW FLOW - DEHUMIDIFY MODE",
    ALERT_MOLD_RISK: "FORCE 100% OUTDOOR AIR PURGE + MAINTENANCE TICKET"
  };

  const sensorObject = {
    sensor_id: sensorId,
    sensor_type: "BMS Zone Humidity Sensor - capacitive polymer, ±2% RH",
    zone: zone,
    humidity: humidity,
    humidity_unit: "% RH",
    rh_state: state,
    dew_point: dewPoint,
    dew_point_unit: "C (condensation risk below coldest surface)",
    mold_risk_index: state === "ALERT_MOLD_RISK" ? "HIGH - surface RH >80% for >24h" : state === "TOO_HUMID" ? "ELEVATED" : "LOW",
    bms_action: actions[state] || actions.COMFORT,
    static_discharge_warning: humidity < 30,
    sensor_drift: Math.random() > 0.97 ? "CAPACITOR HYSTERESIS +3% - REPLACE" : "NOMINAL",
    timestamp: new Date().toISOString()
  };

  return sensorObject
}