function generateSensorData(sensorId, weather = "auto") {
  // Workplane light sensor (photocell + lux) driving two actuators in the
  // daylight-harvesting loop: motorized roller shades on the facade and 0-10V
  // dimming of the LED fixtures. The controller holds ~500 lux at the desk.
  const facades = ["N-ATRIUM", "S-GLAZED", "E-CORE", "W-FACADE", "ROOF-ATRIUM"];
  const facade = facades[Math.floor(Math.random() * facades.length)];

  // West facades get brutal late-afternoon sun; atria get daylight from above
  const conditions = ["OVERCAST", "PART_CLOUD", "SUNNY", "GLARE_EVENT"];
  const condition = weather === "auto"
    ? (Math.random() > 0.18 ? conditions[Math.floor(Math.random() * 3)] : conditions[3])
    : weather.toUpperCase();

  const luxRanges = {
    OVERCAST:   [150, 600],
    PART_CLOUD: [400, 1500],
    SUNNY:      [1500, 8000],
    GLARE_EVENT: [10000, 40000]
  };
  const [lo, hi] = luxRanges[condition] || luxRanges.OVERCAST;
  const lux = parseFloat((lo + Math.random() * (hi - lo)).toFixed(1));

  // Dimming is inverse: full electric light in gloom, near-zero on sunny days
  const target = 500; // photopic target at workplane
  const dimLevel = Math.max(0, Math.min(100, Math.round((1 - lux / (target * 4)) * 100)));
  const shadePosition = lux > 2000
    ? Math.min(100, Math.round((lux - 2000) / 120))   // deploy shade as sun grows
    : 0;

  const sensorObject = {
    sensor_id: sensorId,
    sensor_type: "Daylight Harvesting Sensor - photopic photocell + cosine corrector",
    facade: facade,
    illuminance: lux,
    illuminance_unit: "lux (workplane target 500)",
    sky_condition: condition,
    electric_dim_level: dimLevel,
    electric_dim_level_unit: "% output (0-10V DALI loop)",
    shade_position: shadePosition,
    shade_position_unit: "% deployed (roller shades)",
    daylight_factor: parseFloat((lux / 12000 * 100).toFixed(1)),
    daylight_factor_unit: "% of exterior illuminance",
    glare_probability: lux > 5000 ? "HIGH - auto shade deploy" : lux > 2000 ? "MODERATE" : "LOW",
    energy_saved: dimLevel > 0,
    energy_saved_note: dimLevel > 0 ? "FIXTURES DIMMED " + dimLevel + "% - DAYLIGHT HARVEST ACTIVE" : null,
    circadian_alert: condition === "OVERCAST" && lux < 300 ? "LOW MELANOPIC EXPOSURE - SUGGEST CCT 5000K BOOST" : null,
    photocell_health: Math.random() > 0.98 ? "SIGNAL DRIFT - CLEAN DIFFUSER" : "NOMINAL",
    timestamp: new Date().toISOString()
  };

  return sensorObject
}