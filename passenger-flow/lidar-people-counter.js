function generateSensorData(sensorId, scenario = "auto") {
  // Ceiling 3D LiDAR builds a depth-only point cloud: heads are clustered by
  // height (1.2 m cutoff separates adults from trolley tops), never imaged,
  // so the count stays anonymous; flow vectors reveal queueing bottlenecks
  const congestion = scenario === "congested" ? true : scenario === "quiet" ? false : Math.random() > 0.7;

  const zones = [
    "SECURITY LANES ENTRY", "IMMIGRATION QUEUE", "BAGGAGE CLAIM 3",
    "CHECK-IN ROW D", "DEPARTURE CONCOURSE", "GATE HOLDROOM 21",
    "TRANSFER CORRIDOR C", "ESCALATOR LANDING L2"
  ];
  const zone = zones[Math.floor(Math.random() * zones.length)];

  const target = congestion ? 60 + Math.floor(Math.random() * 60) : 4 + Math.floor(Math.random() * 40);
  const heads = [];
  for (let i = 0; i < Math.min(target, 12); i++) { // sample tracks for the frame
    const vx = (Math.random() * 2 - 1) * (congestion ? 0.35 : 1.1);
    const vy = (Math.random() * 2 - 1) * (congestion ? 0.35 : 1.1);
    heads.push({
      track_id: Math.floor(Math.random() * 1e6),
      height_m: parseFloat((1.45 + Math.random() * 0.45).toFixed(2)), // adult head band
      speed: parseFloat(Math.hypot(vx, vy).toFixed(2)),
      speed_unit: "m/s",
      direction: congestion ? "MILLIMETRIC JITTER" : Math.abs(vy) > Math.abs(vx) ? (vy > 0 ? "TOWARD GATES" : "TOWARD EXITS") : (vx > 0 ? "EASTBOUND" : "WESTBOUND")
    });
  }

  // Free-space ratio decides LOS (Level of Service) A-F per IATA GMHB: dense
  // crowds slow walking speed, which is the proxy for queueing pain
  const density = parseFloat((target / 100).toFixed(2)); // persons per m2 approx
  const avgSpeed = congestion ? 0.3 + Math.random() * 0.25 : 0.9 + Math.random() * 0.6;
  const los = congestion ? (target > 100 ? "F - SHUFFLE-ONLY, SPILLBACK RISK" : "E - RESTRICTED FLOW") : target > 25 ? "C - STEADY" : "A - FREE FLOW";
  const queueWait = congestion ? Math.round(8 + Math.random() * 30) : Math.round(Math.random() * 5);

  const sensorObject = {
    sensor_id: sensorId,
    sensor_type: "3D LiDAR People Counter & Flow Tracker (Ceiling)",
    zone: zone,
    mounting_height: parseFloat((4 + Math.random() * 5).toFixed(1)),
    mounting_height_unit: "m AGL",
    field_of_view: "70 x 55 deg",
    point_rate: Math.round(300 + Math.random() * 900),
    point_rate_unit: "k points/s",
    occupancy: {
      count_estimate: target,
      count_estimate_unit: "persons (head-band clustered)",
      density: density,
      density_unit: "persons/m2",
      level_of_service: los,
      level_of_service_scale: "IATA A-F (F = gridlock)"
    },
    flow: {
      average_speed: parseFloat(avgSpeed.toFixed(2)),
      average_speed_unit: "m/s",
      dominant_direction: heads.length ? heads[0].direction : "NONE",
      counter_flow_ratio: parseFloat((Math.random() * 0.15).toFixed(2)),
      counter_flow_ratio_unit: "fraction moving against dominant vector",
      dwellers: congestion ? Math.floor(Math.random() * 10) : Math.floor(Math.random() * 3),
      dwellers_note: "STATIONARY > 90 s (window-gazers, group regroups)"
    },
    queue: {
      detected: zone.includes("QUEUE") || zone.includes("SECURITY") || congestion,
      length_m: congestion ? Math.round(15 + Math.random() * 60) : Math.round(Math.random() * 8),
      length_m_unit: "m (serpentine path length)",
      estimated_wait: queueWait,
      estimated_wait_unit: "min",
      throughput: congestion ? Math.round(2 + Math.random() * 3) : Math.round(8 + Math.random() * 10),
      throughput_unit: "persons/min through service point",
      spillback_alert: congestion && target > 100 ? "QUEUE SPILLING INTO WALKWAY - OPEN LANE 2" : "NONE"
    },
    bottleneck_rank: Math.ceil(Math.random() * 5),
    bottleneck_rank_scale: "1 (worst in terminal) to 5",
    sample_tracks: heads,
    privacy_mode: "DEPTH-ONLY - NO RGB, NO FACE, NO PII, GDPR COMPLIANT",
    sensor_health: Math.random() > 0.95 ? "PARTIAL OCCLUSION - SUSPENSION CRANE OVER FOV" : "NOMINAL",
    timestamp: new Date().toISOString()
  };

  return sensorObject
}