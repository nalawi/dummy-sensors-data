function generateSensorData(sensorId, mode = "auto") {
  // Capacitive/TDR soil moisture probe at 10/30/60 cm: VWC is judged against
  // soil-texture field capacity (FC) and permanent wilting point (WP). Plant
  // available water below the 50%-MAD refill point fires the irrigation
  // scheduler; readings above FC after rain raise a waterlogging flag.
  const crops = [
    { crop: "TOMATO",  rootCm: 60,  fc: 0.30, wp: 0.13 },
    { crop: "WHEAT",   rootCm: 90,  fc: 0.28, wp: 0.11 },
    { crop: "LETTUCE", rootCm: 30,  fc: 0.26, wp: 0.11 },
    { crop: "CITRUS",  rootCm: 120, fc: 0.31, wp: 0.15 },
    { crop: "POTATO",  rootCm: 45,  fc: 0.25, wp: 0.10 }
  ];
  const crop = crops[Math.floor(Math.random() * crops.length)];
  const textures = ["SANDY_LOAM", "LOAM", "SILT_LOAM", "CLAY_LOAM"];
  const texture = textures[Math.floor(Math.random() * textures.length)];

  const states = ["OK_ABOVE_REFILL", "NEAR_REFILL_POINT", "DRY_TRIGGER", "SATURATED"];
  const state = mode === "auto"
    ? (Math.random() > 0.25 ? "OK_ABOVE_REFILL" : states[1 + Math.floor(Math.random() * 3)])
    : mode.toUpperCase();

  const band = (lo, hi) => parseFloat((lo + Math.random() * (hi - lo)).toFixed(1));
  const vwc = state === "DRY_TRIGGER" ? band(9, 12)
    : state === "SATURATED" ? band(37, 42)
    : state === "NEAR_REFILL_POINT" ? band(14, 17)
    : band(19, 29);
  const top = band(Math.max(4, vwc - 4), vwc + 4);   // 10 cm - most variable
  const mid = band(vwc - 1.5, vwc + 1.5);            // 30 cm
  const deep = band(vwc - 1.5, vwc + 1.5);           // 60 cm

  const pawMm = Math.max(0, Math.round(((mid / 100) - crop.wp) * crop.rootCm * 10));
  const refillPoint = parseFloat((crop.wp * 100 + (crop.fc - crop.wp) * 50).toFixed(1)); // MAD 50%

  const sensorObject = {
    sensor_id: sensorId,
    sensor_type: "Soil Moisture Probe - capacitance array at 10/30/60 cm",
    crop: crop.crop,
    soil_texture: texture,
    vwc_top_10cm: top,
    vwc_mid_30cm: mid,
    vwc_deep_60cm: deep,
    vwc_unit: "% volumetric water content",
    field_capacity: parseFloat((crop.fc * 100).toFixed(1)),
    permanent_wilting_point: parseFloat((crop.wp * 100).toFixed(1)),
    refill_point: refillPoint,
    refill_point_unit: "% VWC at management allowed depletion 50%",
    plant_available_water: pawMm,
    plant_available_water_unit: "mm across " + crop.rootCm + " cm root zone",
    moisture_state: state,
    irrigation_action: state === "SATURATED" ? "HOLD - WATERLOGGING RISK, CHECK DRAINAGE"
      : state === "DRY_TRIGGER" ? "IRRIGATE NOW - TARGET " + Math.round((crop.fc * 100 - top) * 0.75) + " mm NET"
      : state === "NEAR_REFILL_POINT" ? "SCHEDULE IRRIGATION WITHIN 24h"
      : "NONE - NEXT READ IN 15 min",
    probe_health: Math.random() > 0.97 ? "AIR GAP AT PRONGS - RE-SEAT SOIL CONTACT" : "NOMINAL",
    timestamp: new Date().toISOString()
  };

  return sensorObject
}
