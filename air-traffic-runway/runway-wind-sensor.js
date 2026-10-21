function generateSensorData(sensorId, weather = "auto") {
  // Anemometer + wind vane on the runway edge: the tower reads wind velocity and
  // gusts in ATIS broadcasts, and crosswind limits gate every landing clearance
  const stormy = weather === "auto" ? Math.random() > 0.85 : weather === "storm";

  // Prevailing wind rotates through the day; gusts ride on top of the mean
  const prevailingDir = Math.floor(Math.random() * 360);
  const direction = weather === "calm" ? null : prevailingDir;
  const meanSpeed = stormy ? 18 + Math.random() * 22 : weather === "calm" ? Math.random() * 3 : 2 + Math.random() * 12;
  const gust = meanSpeed + (stormy ? 8 + Math.random() * 14 : Math.random() * 4);
  const gustFactor = gust / meanSpeed;

  // Runway 09L/27R heading 085/265: compute crosswind & headwind components
  const runwayHeading = 85;
  const angleDiff = direction !== null ? ((direction - runwayHeading) * Math.PI) / 180 : null;
  const crosswind = direction !== null ? Math.abs(Math.sin(angleDiff) * meanSpeed) : 0;
  const headwind = direction !== null ? Math.cos(angleDiff) * meanSpeed : 0;

  // Wind shear alert: sudden vector change between sensor pairs along the corridor
  const shearDetected = stormy && Math.random() > 0.5;
  const shearLoss = shearDetected ? Math.round(15 + Math.random() * 20) : 0; // airspeed loss on approach

  // Crosswind limits by aircraft category (demonstrated crosswind, knots)
  const crosswindStatus = crosswind >= 35 ? "EXCEEDS LIMITS - RUNWAY CHANGE ADVISED"
    : crosswind >= 25 ? "STRONG CROSSWIND - B738 LIMIT APPROACHING"
    : crosswind >= 15 ? "MODERATE CROSSWIND"
    : "WITHIN LIMITS";
  // Tailwind component above 10 kt is a no-go for most transport category jets
  const tailwindLimit = headwind < -10 ? "TAILWIND EXCEEDS 10 KT LIMIT"
    : headwind < -5 ? "LIGHT TAILWIND COMPONENT" : "NONE";

  const sensorObject = {
    sensor_id: sensorId,
    sensor_type: "Ultrasonic Anemometer + Wind Vane",
    location: "RUNWAY 09L MIDFIELD",
    wind_direction: direction,
    wind_direction_unit: "deg",
    wind_direction_cardinal: direction !== null ? ["N","NNE","NE","ENE","E","ESE","SE","SSE","S","SSW","SW","WSW","W","WNW","NW","NNW"][Math.round(direction / 22.5) % 16] : "CALM",
    wind_speed: parseFloat(meanSpeed.toFixed(1)),
    wind_speed_unit: "knots",
    gust_speed: parseFloat(gust.toFixed(1)),
    gust_speed_unit: "knots",
    gust_factor: parseFloat(gustFactor.toFixed(2)),
    crosswind_component: parseFloat(crosswind.toFixed(1)),
    crosswind_component_unit: "knots",
    headwind_component: parseFloat(headwind.toFixed(1)),
    headwind_component_unit: "knots (negative = tailwind)",
    crosswind_status: crosswindStatus,
    tailwind_status: tailwindLimit,
    wind_shear_alert: shearDetected ? "WIND SHEAR ALERT - " + shearLoss + " KT AIRSPEED LOSS ON APPROACH" : "NONE",
    shear_airspeed_loss: shearLoss,
    shear_airspeed_loss_unit: "knots",
    atis_report: direction !== null
      ? Math.floor(direction / 10).toString().padStart(2, "0") + " deg / " + Math.round(meanSpeed) + "KT" + (stormy ? "G" + Math.round(gust) : "") + (shearDetected ? " WS RWY09L" : "")
      : "00000KT",
    sensor_status: stormy && Math.random() > 0.95 ? "DEGRADED - HEATER CYCLING" : "NORMAL",
    timestamp: new Date().toISOString()
  };

  return sensorObject
}