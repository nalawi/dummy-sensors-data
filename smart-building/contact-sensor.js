function generateSensorData(sensorId, mode = "auto") {
  // Magnetic reed contact on doors, windows and server-cabinet leaves: two
  // hermetic glass switches gate a biased circuit; gap > ~25 mm breaks the
  // circuit and reports OPEN. Tamper is a second magnet pair watching for
  // the sensor itself being peeled off the frame.
  const points = ["MAIN-LOBBY-DOOR", "TERRACE-FIRE-EXIT", "L3-CONF-B-DOOR", "B1-SERVER-RACK-A12", "ROOF-HATCH", "L5-WINDOW-N16"];
  const point = points[Math.floor(Math.random() * points.length)];

  const isCabinet = point.includes("SERVER-RACK");
  const isWindow = point.includes("WINDOW");
  const isFireExit = point.includes("FIRE-EXIT") || point.includes("HATCH");

  const states = ["CLOSED", "OPEN", "OPEN_LONG", "TAMPER"];
  const state = mode === "auto"
    ? (Math.random() > 0.14 ? "CLOSED" : states[1 + Math.floor(Math.random() * 3)])
    : mode.toUpperCase();

  const gapMm = state === "CLOSED" ? parseFloat((0.5 + Math.random() * 3).toFixed(1))
    : state === "TAMPER" ? null
    : parseFloat((28 + Math.random() * 60).toFixed(1));

  const openMinutes = state === "OPEN" ? parseFloat((0.5 + Math.random() * 9).toFixed(1))
    : state === "OPEN_LONG" ? parseFloat((35 + Math.random() * 120).toFixed(1))
    : 0;

  // Access-control context: swipes around the event, for audits
  const lastBadge = state === "CLOSED" || state === "TAMPER" ? null
    : (isCabinet ? "BADGE J.DOE-2231 (APPROVED)" : isFireExit ? "NO BADGE - PUSHBAR" : "BADGE M.SMITH-1104");

  const policies = isFireExit
    ? "FIRE EXIT MUST STAY SEALED - NOTIFY FIRE MARSHAL"
    : isCabinet
    ? "DATA-CABINET OPEN >5 MIN = SOC ESCALATION"
    : isWindow
    ? "WINDOW OPEN TRIGGERS VAV HEATING LOCKOUT"
    : "AFTER-HOURS OPEN PAGES FACILITIES";

  const sensorObject = {
    sensor_id: sensorId,
    sensor_type: "Reed Contact Sensor - hermetic SPST + dual-magnet tamper",
    entry_point: point,
    entry_class: isCabinet ? "IT_CABINET" : isFireExit ? "FIRE_ESCAPE" : isWindow ? "WINDOW" : "DOOR",
    contact_state: state === "TAMPER" ? "UNKNOWN" : state,
    gap: gapMm,
    gap_unit: gapMm === null ? null : "mm (open threshold 25 mm)",
    open_duration: openMinutes,
    open_duration_unit: "min",
    tamper_state: state === "TAMPER" ? "ALARM - UNIT PEELING FROM FRAME" : "SEALED",
    last_access_credential: lastBadge,
    fire_alarm_panel_monitored: isFireExit,
    policy_action: state === "CLOSED" ? "NONE" : policies,
    battery: parseFloat((2.8 + Math.random() * 0.5).toFixed(2)),
    battery_unit: "V (replace below 2.7)",
    supervision_interval: "60s heartbeat, 24h supervision window",
    timestamp: new Date().toISOString()
  };

  return sensorObject
}