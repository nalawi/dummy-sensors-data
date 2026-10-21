function generateSensorData(sensorId, weather = "auto") {
  // RVR transmissometers project a calibrated light beam between runway-side units;
  // the extinction coefficient converts to the visibility pilots use for landing minima
  const obscurants = weather === "auto"
    ? ["CLEAR", "HAZE", "FOG", "DENSE FOG", "HEAVY RAIN", "DUST"][Math.floor(Math.random() * 6)]
    : weather;
  const isClear = obscurants === "CLEAR";

  // Extinction coefficient (per km): clear air ~0.02, dense fog can exceed 20
  const extinction = isClear
    ? parseFloat((0.01 + Math.random() * 0.05).toFixed(3))
    : obscurants === "FOG"
      ? parseFloat((4 + Math.random() * 8).toFixed(3))
      : obscurants === "DENSE FOG"
        ? parseFloat((20 + Math.random() * 30).toFixed(3))
        : parseFloat((1 + Math.random() * 7).toFixed(3));

  // Koschmieder relation: MOR = 3.0 / extinction (extinction in 1/km -> MOR in km, shown in m)
  // Reported MOR saturates at 10 km - beyond that systems publish "> 10 km"
  const mor = Math.min(10000, Math.round((3.0 / extinction) * 1000));

  // RVR is the runway-specific value: longer than MOR due to runway light intensity
  const rvr = Math.round(Math.min(6000, mor * (isClear ? 8 : 1.6) + Math.random() * 50));

  // LVP: Low Visibility Procedures trigger when RVR drops below 550 m
  const minima = rvr >= 2000 ? "ABOVE CAT I MINIMA" : rvr >= 550 ? "CAT I" : rvr >= 300 ? "CAT II" : rvr >= 175 ? "CAT IIIA" : "CAT IIIB";
  const lvpActive = rvr < 550;

  const sensorObject = {
    sensor_id: sensorId,
    sensor_type: "RVR Transmissometer / Forward Scatter",
    runway_reference: "RUNWAY 09L TDZ", // touchdown zone positioning
    obscurant: obscurants,
    extinction_coefficient: extinction,
    extinction_coefficient_unit: "1/km",
    mor: mor,
    mor_unit: "m",
    rvr: rvr,
    rvr_unit: "m",
    rvr_trend: Math.random() > 0.5 ? "IMPROVING" : Math.random() > 0.05 ? "DECREASING" : "STABLE",
    background_luminance: parseFloat((isClear ? 500 + Math.random() * 8000 : Math.random() * 120).toFixed(0)),
    background_luminance_unit: "cd/m2",
    icao_minima_category: minima,
    low_visibility_procedures: lvpActive,
    light_intensity_setting: lvpActive ? Math.min(100, Math.round(20 + (600 - rvr) / 4.2)) : Math.round(Math.random() * 10 + 2),
    light_intensity_setting_unit: "%",
    sensor_status: "NORMAL",
    timestamp: new Date().toISOString()
  };

  return sensorObject
}