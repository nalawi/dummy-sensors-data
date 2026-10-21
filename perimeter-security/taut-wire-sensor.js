function generateSensorData(sensorId, mode = "auto") {
  // Parallel wires strung at exact tension (typically ~900 N) between
  // strain-post terminations; a load cell + micro-switch at each post
  // anchors the run. Pulling, parting or standing on a wire shifts tension
  // by more than the +/-40 N guard band and trips the post electronics
  const event = mode === "auto" ? (Math.random() > 0.9 ? ["CLIMB", "PARTED", "PRESSURE"][Math.floor(Math.random() * 3)] : "CLEAR") : mode.toUpperCase();
  const alarmed = event !== "CLEAR";

  const nominalTension = 900; // N at 20 C commissioning
  // Temperature swings stretch/shrink the steel; the controller applies a
  // thermal compensation table per wire so guards chase real loads only
  const ambientC = parseFloat((-5 + Math.random() * 45).toFixed(1));
  const thermalDelta = parseFloat(((ambientC - 20) * 0.55).toFixed(1)); // N drift from steel expansion

  // Event physics: climb = localized +200..350 N on top wires with post
  // flex; parted = tension collapses to near zero; pressure (foot on lower
  // wire) = smaller downward deflection
  const wireHit = event === "CLIMB" ? 5 + Math.floor(Math.random() * 2) : event === "PRESSURE" ? 1 + Math.floor(Math.random() * 2) : event === "PARTED" ? 1 + Math.floor(Math.random() * 8) : null;
  const tensionDelta = event === "CLIMB" ? 200 + Math.random() * 150 : event === "PARTED" ? -(nominalTension * 0.85 + Math.random() * 100) : event === "PRESSURE" ? -(60 + Math.random() * 80) : 0;
  const measuredTension = nominalTension + thermalDelta + tensionDelta;

  const postCount = 8; // posts per zone run
  const trippedPost = alarmed ? Math.floor(Math.random() * postCount) + 1 : null;

  // Intruder typically spans 2 posts during a climb; both trip
  const postsTripped = alarmed ? (event === "CLIMB" ? 2 : 1) : 0;

  const sensorObject = {
    sensor_id: sensorId,
    sensor_type: "Taut-Wire Perimeter Sensor (Strain-Post Micro-Switch)",
    zone: "ZONE-" + Math.floor(Math.random() * 10 + 1) + " RUN " + Math.floor(Math.random() * 6 + 1),
    wire_count: 8,
    wire_count_unit: "parallel wires 0.1-0.5 m AGL ladder",
    nominal_tension: nominalTension,
    nominal_tension_unit: "N at 20 C commissioning",
    guard_band: 40,
    guard_band_unit: "N (+/-) before post electronics trip",
    ambient_temp: ambientC,
    ambient_temp_unit: "degC",
    thermal_compensation: {
      applied: true,
      thermal_delta: thermalDelta,
      thermal_delta_unit: "N (steel expansion table, ambient-referenced)",
      note: "WITHOUT COMPENSATION A 30 C SWING = FALSE ALARM STORM"
    },
    alarm_state: alarmed ? "ALARM" : "CLEAR",
    event: {
      class: alarmed ? event : "NONE",
      wires_affected: alarmed ? [wireHit] : [],
      posts_tripped: postsTripped,
      first_post: trippedPost ? "POST-" + String(trippedPost).padStart(2, "0") : null,
      extent_estimate: event === "CLIMB" ? "SPAN OF 2 POSTS (~12 m) - HANDHOLD PULL ON WIRE " + wireHit
        : event === "PARTED" ? "WIRE " + wireHit + " SLACK - CUT OR TERMINATION FAILURE"
        : event === "PRESSURE" ? "DOWNWARD DEFLECTION ON LOWER WIRE - FOOT/DEBRIS LOAD"
        : null
    },
    tension: {
      measured: parseFloat(measuredTension.toFixed(0)),
      measured_unit: "N (load cell, first tripped post)",
      delta_from_nominal: parseFloat(tensionDelta.toFixed(0)),
      delta_from_nominal_unit: "N (mechanical load signature)",
      rate_of_change: alarmed ? parseFloat(((Math.random() * 2 - 1) * 500).toFixed(0)) : parseFloat(((Math.random() * 2 - 1) * 5).toFixed(0)),
      rate_of_change_unit: "N/s (cut event shows sharp negative spike)"
    },
    classifier: {
      verdict: event === "CLIMB" ? "INTRUDER CLIMB - HIGH CONFIDENCE"
        : event === "PARTED" ? "WIRE PARTED - BREACH OR MAINTENANCE - VERIFY VISUAL"
        : event === "PRESSURE" ? "LOW-WIRE LOAD - INTRUDER CRAWL OR FALLEN BRANCH"
        : "CLEAR",
      confidence: alarmed ? parseFloat((0.84 + Math.random() * 0.14).toFixed(2)) : null,
      verify_note: event === "PARTED" ? "DIFFERENTIATE SABOTAGE VS WIRE FATIGUE VIA END-ANCHOR LOAD CELL" : null
    },
    maintenance: {
      last_tension_service_days: Math.floor(Math.random() * 180),
      retension_due: Math.random() > 0.85 ? "RETENSION DUE - WIRE 3 DRIFTED -12 N SINCE LAST PM" : "NONE",
      post_grounding: Math.random() > 0.95 ? "POST-05 EARTH BOND HIGH - LIGHTNING RISK" : "PASS",
      vegetation: ["CLEARED FIRE LANE", "GRASS TOUCHING LOWER WIRES - TRIM", "VINE ON POST-03 - INSPECT"][Math.floor(Math.random() * 3)]
    },
    timestamp: new Date().toISOString()
  };

  return sensorObject
}