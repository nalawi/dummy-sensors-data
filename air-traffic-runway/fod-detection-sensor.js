function generateSensorData(sensorId, area = "RUNWAY 09L") {
  // FOD radar + optical cameras sweep the runway continuously between movements;
  // a single bolt or lug nut ingested by a turbofan can cost millions in damage
  const debrisTypes = [
    { kind: "BOLT M8",        sizeCm: 2.5,  weightG: 12,   risk: "HIGH - ENGINE INGESTION" },
    { kind: "WHEEL LUG NUT",  sizeCm: 3.0,  weightG: 28,   risk: "HIGH - ENGINE INGESTION" },
    { kind: "BAGGAGE STRAP",  sizeCm: 45.0, weightG: 90,   risk: "MEDIUM - FLIGHT CONTROL" },
    { kind: "RUBBER SHRED",   sizeCm: 6.0,  weightG: 5,    risk: "LOW - TIRE FOD" },
    { kind: "METAL STRIP",    sizeCm: 15.0, weightG: 34,   risk: "HIGH - TIRE PENETRATION" },
    { kind: "BIRD REMAINS",   sizeCm: 8.0,  weightG: 15,   risk: "MEDIUM - WILDLIFE STRIKE" },
    { kind: "GRAVEL CLUMP",   sizeCm: 4.0,  weightG: 22,   risk: "LOW - SPALLING PAVEMENT" },
    { kind: "PLASTIC CAP",    sizeCm: 5.0,  weightG: 3,    risk: "LOW" }
  ];
  const clutterSources = ["STANDING WATER SHEEN", "PAINT MARKING GLARE", "RUBBER DEPOSITS TDZ"];

  const detections = [];
  const count = Math.random() > 0.55 ? 1 + Math.floor(Math.random() * 3) : 0; // often the sweep is clean
  for (let i = 0; i < count; i++) {
    const d = debrisTypes[Math.floor(Math.random() * debrisTypes.length)];
    const confirmed = Math.random() > 0.25; // radar hits verify against optical camera
    detections.push({
      detection_id: "FOD-" + Math.floor(Math.random() * 9000 + 1000),
      object_type: d.kind,
      confirmed: confirmed,
      confirmation_source: confirmed ? "OPTICAL CAMERA ZOOM" : "RADAR ONLY",
      position_x: parseFloat((Math.random() * 3300 + 300).toFixed(1)),
      position_x_unit: "m from threshold",
      position_y: parseFloat((Math.random() * 44 - 22).toFixed(1)),
      position_y_unit: "m from centerline",
      size: d.sizeCm,
      size_unit: "cm",
      estimated_mass: d.weightG,
      estimated_mass_unit: "g",
      threat_level: d.risk,
      radar_cross_section: parseFloat((Math.random() * 40 + d.sizeCm * 2).toFixed(1)),
      radar_cross_section_unit: "cm2"
    });
  }

  // Highest-threat item drives the removal response
  const highRisk = detections.find((d) => d.confirmed && d.threat_level.startsWith("HIGH"));
  const alert = highRisk
    ? "FOD ALERT - " + highRisk.object_type + " AT " + highRisk.position_x + "m - REMOVAL CREW DISPATCH"
    : detections.length ? "MONITORING - NON-CRITICAL DEBRIS" : "SWEEP CLEAN";

  const sensorObject = {
    sensor_id: sensorId,
    sensor_type: "FOD Detection (X-band radar + optical fusion)",
    monitored_area: area,
    sweep_interval: 30,
    sweep_interval_unit: "s",
    detection_capability: "2.5 cm object at 3000 m",
    false_clutter_filtered: Math.floor(Math.random() * 40),
    clutter_sources: clutterSources,
    detections_count: detections.length,
    confirmed_count: detections.filter((d) => d.confirmed).length,
    detections: detections,
    alert_status: alert,
    removal_crew_dispatched: Boolean(highRisk),
    sensor_status: "NORMAL",
    timestamp: new Date().toISOString()
  };

  return sensorObject
}