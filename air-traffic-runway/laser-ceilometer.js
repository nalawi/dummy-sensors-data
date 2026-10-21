function generateSensorData(sensorId, skyCondition = "auto") {
  // Laser ceilometer fires a pulsed 910 nm lidar beam straight up and times the
  // return from cloud bases; aerodrome ceilings drive landing minima and CAT II/III ops
  const conditions = skyCondition === "auto"
    ? ["CLEAR", "SCATTERED", "BROKEN", "OVERCAST"][Math.floor(Math.random() * 4)]
    : skyCondition;
  const isClear = conditions === "CLEAR";

  // Cloud layers stack up with coverage: broken/overcast can stack multiple decks
  const layerCount = isClear ? 0 : conditions === "SCATTERED" ? 1 : 1 + Math.floor(Math.random() * 2);
  const layers = [];
  for (let i = 0; i < layerCount; i++) {
    // Convective decks sit low on humid mornings, stratus can be higher
    const base = 300 + Math.random() * (conditions === "OVERCAST" ? 900 : 2500);
    layers.push({
      layer_number: i + 1,
      cloud_base_height: Math.round(base),
      cloud_base_height_unit: "ft AGL",
      sky_coverage: i === 0 ? conditions : Math.random() > 0.5 ? "BROKEN" : "FEW",
      vertical_visibility: conditions === "OVERCAST" && base < 500 ? Math.round(base) : null
    });
  }

  // Aerodrome ceiling = lowest BROKEN or OVERCAST layer (the flight-visibility decision)
  const ceilingLayer = layers.find((l) => l.sky_coverage === "BROKEN" || l.sky_coverage === "OVERCAST");
  const ceiling = ceilingLayer ? ceilingLayer.cloud_base_height : null;

  // LIDAR performance: backscatter energy and range gate resolution
  const laserPower = parseFloat((4.8 + Math.random() * 0.4).toFixed(2));
  const backscatter = isClear ? parseFloat((Math.random() * 6).toFixed(1)) : parseFloat((30 + Math.random() * 55).toFixed(1));
  const selfTest = Math.random() > 0.03; // occasional window contamination alarm

  const sensorObject = {
    sensor_id: sensorId,
    sensor_type: "Laser Ceilometer (910 nm lidar)",
    reporting_interval: 60,
    reporting_interval_unit: "s",
    vertical_range: 12500,
    vertical_range_unit: "ft",
    range_resolution: 5,
    range_resolution_unit: "m",
    sky_condition: conditions,
    cloud_layers: layerCount,
    layers: layers,
    ceiling_height: ceiling,
    ceiling_height_unit: "ft AGL",
    ceiling_category: ceiling === null
      ? "UNLIMITED - VFR"
      : ceiling >= 3000 ? "CEILING OK - VFR" : ceiling >= 1000 ? "MARGINAL VFR" : ceiling >= 300 ? "IFR - CAT I" : "LOW CEILING - CAT II/III OPS",
    backscatter_amplitude: backscatter,
    backscatter_unit: "relative",
    laser_power: laserPower,
    laser_power_unit: "mW",
    sensor_status: selfTest ? "NORMAL" : "MAINTENANCE - OPTICS CHECK",
    timestamp: new Date().toISOString()
  };

  return sensorObject
}