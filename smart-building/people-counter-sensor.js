function generateSensorData(sensorId, mode = "auto") {
  // Ceiling-mounted thermal array people counter (8x8 pyroelectric grid or
  // 160x120 thermopile): anonymous head-shaped heat blobs are blob-tracked
  // across an entry line to yield in/out counts and zone dwell times - no
  // cameras, GDPR-friendly by construction.
  const zones = ["L1-LOBBY-ENTRANCE", "L2-OPEN-OFFICE", "L4-CAFETERIA", "L4-GYM", "B1-BIKE-ROOM"];
  const zone = zones[Math.floor(Math.random() * zones.length)];

  const states = ["FLOW", "QUEUE_BUILDING", "CAPACITY_ALERT", "EMPTY"];
  const state = mode === "auto"
    ? (Math.random() > 0.2 ? (Math.random() > 0.3 ? "FLOW" : "EMPTY") : states[Math.floor(Math.random() * 2)])
    : mode.toUpperCase();

  // Capacity and headcount scale with zone type
  const capacity = { "L1-LOBBY-ENTRANCE": 80, "L2-OPEN-OFFICE": 120, "L4-CAFETERIA": 150, "L4-GYM": 40, "B1-BIKE-ROOM": 60 }[zone];
  const occupancy = state === "EMPTY" ? 0
    : state === "CAPACITY_ALERT" ? Math.round(capacity * (0.9 + Math.random() * 0.1))
    : state === "QUEUE_BUILDING" ? Math.round(capacity * (0.6 + Math.random() * 0.25))
    : Math.round(capacity * (0.1 + Math.random() * 0.4));

  // Line crossings: net flow roughly follows occupancy change
  const entriesIn = occupancy === 0 ? 0 : Math.round(occupancy * (0.2 + Math.random() * 0.25));
  const exitsOut = state === "QUEUE_BUILDING" ? Math.round(entriesIn * 0.3) : Math.round(entriesIn * (0.7 + Math.random() * 0.25));

  // Dwell: cafeteria long, corridor short
  const dwellBase = { "L1-LOBBY-ENTRANCE": 2, "L2-OPEN-OFFICE": 45, "L4-CAFETERIA": 28, "L4-GYM": 55, "B1-BIKE-ROOM": 4 }[zone];
  const avgDwell = occupancy === 0 ? 0 : parseFloat((dwellBase * (0.7 + Math.random() * 0.6)).toFixed(1));

  // Blob metrics - the sensor's self-diagnostics on detection quality
  const trackQuality = occupancy === 0 ? null : parseFloat((0.8 + Math.random() * 0.18).toFixed(2));
  // Heat sources that confuse thermal blobbing: hot laptops, sunny floors, HVAC plumes
  const falseSources = ["HOT LAPTOP DOCK CLUSTER", "MORNING SUN STRIP ON FLOOR", "HVAC FLOOR PLUME"];
  const falseCount = occupancy === 0 ? 0 : (Math.random() > 0.85 ? Math.ceil(Math.random() * 3) : 0);

  const sensorObject = {
    sensor_id: sensorId,
    sensor_type: "Thermal People Counter - 160x120 thermopile array, ceiling @3.2m",
    zone: zone,
    occupancy_count: occupancy,
    occupancy_count_unit: "persons (anonymous heat-blob tracks)",
    capacity: capacity,
    capacity_unit: "persons (fire-code limit)",
    utilization: parseFloat((occupancy / capacity * 100).toFixed(1)),
    utilization_unit: "% of capacity",
    entries_in: entriesIn,
    entries_in_unit: "crossings past 15 min",
    exits_out: exitsOut,
    exits_out_unit: "crossings past 15 min",
    avg_dwell_time: avgDwell,
    avg_dwell_time_unit: "min",
    flow_state: state,
    track_quality: trackQuality,
    track_quality_unit: "0-1 blob tracker confidence",
    false_positive_tracks: falseCount > 0 ? falseCount + "x (" + falseSources[Math.floor(Math.random() * falseSources.length)] + ")" : 0,
    privacy_mode: "NO-IMAGE - THERMAL COUNT ONLY",
    hvac_collapse_command: occupancy < capacity * 0.2 ? "SETBACK ZONE VAV TO 40%" : "FULL COMFORT MODE",
    sensor_health: Math.random() > 0.97 ? "ARRAY PIXEL DEAD ROW 4 - RECALIBRATE OFFSET" : "NOMINAL",
    timestamp: new Date().toISOString()
  };

  return sensorObject
}