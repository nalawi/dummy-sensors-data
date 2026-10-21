function generateSensorData(sensorId, threshold = "CHECKED BAG") {
  // 3D time-of-flight cameras build a point-cloud silhouette of each bag passing
  // overhead: oversized bags are rejected before they jam security chutes or ULDs
  const bagTypes = [
    { kind: "CABIN ROLLER",     base: [55, 40, 23], jitter: 6 },
    { kind: "CHECKED ROLLER",   base: [70, 50, 30], jitter: 10 },
    { kind: "LARGE CHECKED",    base: [80, 55, 33], jitter: 12 },
    { kind: "DUFFEL SOFT",      base: [65, 35, 30], jitter: 15 },
    { kind: "GOLF/HARD TRUNK",  base: [120, 35, 30], jitter: 12 },
    { kind: "OVERSIZED FRAGILE", base: [95, 65, 45], jitter: 8 },
    { kind: "BIKE BOX",         base: [140, 85, 35], jitter: 6 },   // wider than EDS tunnel
    { kind: "SURFBOARD BAG",    base: [230, 32, 22], jitter: 8 }    // too long for standard sortation
  ];
  const t = bagTypes[Math.floor(Math.random() * bagTypes.length)];

  const jitter = () => Math.round((Math.random() * 2 - 1) * t.jitter);
  const length = Math.max(20, t.base[0] + jitter());
  const width = Math.max(15, t.base[1] + jitter());
  const height = Math.max(10, t.base[2] + jitter());
  const volume = parseFloat(((length * width * height) / 1000000).toFixed(4));

  // Linear dimension check: the BHS physical envelope (standard EDS tunnel is
  // ~90 x 75 cm) decides hard rejects; the airline 158 cm linear rule only
  // triggers excess-baggage handling, not physical offload
  const linearTotal = length + width + height;
  const holdLimit = threshold === "CHECKED BAG" ? { l: 250, w: 75, h: 65, linear: 350 } : { l: 56, w: 45, h: 25, linear: 118 };
  const oversize =
    length > holdLimit.l || width > holdLimit.w || height > holdLimit.h || linearTotal > holdLimit.linear;
  const excessBaggage = threshold === "CHECKED BAG" && linearTotal > 158;

  // Weight estimate from point-cloud volume + baggage-density model (kg/m3)
  const density = 90 + Math.random() * 160; // typical packed suitcase density
  const estWeight = parseFloat((volume * density).toFixed(1));

  const verdict = oversize ? "REJECT - OFFLOAD TO OVERSIZE COUNTER" : "ACCEPT - ROUTE TO SECURITY";

  const sensorObject = {
    sensor_id: sensorId,
    sensor_type: "3D Time-of-Flight Dimensioning Portal",
    technology: "ToF point cloud + structured light",
    resolution_mm: 2.0,
    capture_height: 120,
    capture_height_unit: "cm over belt",
    measured_bag: {
      bag_type: t.kind,
      length: length,
      length_unit: "cm",
      width: width,
      width_unit: "cm",
      height: height,
      height_unit: "cm",
      linear_dimensions: linearTotal,
      linear_dimensions_unit: "cm (L+W+H)",
      volume: volume,
      volume_unit: "m3",
      estimated_weight: estWeight,
      estimated_weight_unit: "kg (density model)"
    },
    applied_limit: threshold,
    hold_limit: holdLimit,
    verdict: verdict,
    oversized: oversize,
    excess_baggage: excessBaggage,
    airline_linear_limit: 158,
    airline_linear_limit_unit: "cm (L+W+H, fee threshold)",
    point_cloud_captured: Math.random() > 0.02, // rare dropouts when bags gap poorly
    timestamp: new Date().toISOString()
  };

  return sensorObject
}