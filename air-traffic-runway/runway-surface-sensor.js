function generateSensorData(sensorId, weather = "auto") {
  // Sensors embedded in the concrete pavement track slab temperature, moisture film
  // and freeze point: winter ops teams decide de-icing/anti-icing from these readings
  const winter = weather === "auto" ? Math.random() > 0.7 : weather === "winter";
  const freezing = winter ? Math.random() > 0.45 : false;

  // Pavement slab lags the air by hours and swings wider on clear days
  const airTemp = winter ? -8 + Math.random() * 10 : 24 + Math.random() * 8;
  const surfaceTemp = parseFloat((airTemp + (winter ? Math.random() * 2 - 1 : 6 + Math.random() * 10)).toFixed(1));
  const dewPoint = winter ? airTemp - 2 - Math.random() * 3 : airTemp - 6 - Math.random() * 6;
  const frostRisk = surfaceTemp <= 0 || surfaceTemp <= dewPoint + 0.5;

  // Moisture state of the pavement film
  const moistureState = freezing ? ["DRY", "WET", "FROST", "ICE", "SLUSH"][Math.floor(Math.random() * 4) + 1]
    : surfaceTemp > dewPoint + 2 ? "DRY" : Math.random() > 0.4 ? "WET" : "DAMP";

  // Freezing point of the film drops with de-icing chemical concentration (KAc/urea)
  const deIceConc = freezing && moistureState !== "DRY"
    ? parseFloat((Math.random() * 28).toFixed(1))
    : moistureState !== "DRY" && Math.random() > 0.6 ? parseFloat((Math.random() * 6).toFixed(1)) : 0.0;
  const freezePoint = deIceConc > 0 ? parseFloat((Math.max(-20, -0.75 * deIceConc) + (Math.random() * 1.4 - 0.7)).toFixed(1)) : parseFloat(Math.min(0.5, surfaceTemp + 0.2).toFixed(1));

  // Ice no-frost protection verdict: can film freeze at current slab temperature?
  const iceProtected = moistureState !== "DRY" && freezePoint < surfaceTemp;
  const iceWarning = !iceProtected && moistureState !== "DRY" && freezePoint <= 0;

  // Runway condition code (ICAO GRF: 6 dry ... 0 contaminated)
  const grfCode = moistureState === "DRY" ? 6 : moistureState === "DAMP" ? 5 : moistureState === "WET" ? (iceProtected ? 5 : 3) : moistureState === "FROST" ? 4 : 1;

  const sensorObject = {
    sensor_id: sensorId,
    sensor_type: "Runway Surface Condition Sensor (embedded)",
    location: "RUNWAY 09L TDZ CENTERLINE",
    air_temperature: parseFloat(airTemp.toFixed(1)),
    air_temperature_unit: "C",
    surface_temperature: surfaceTemp,
    surface_temperature_unit: "C",
    dew_point: parseFloat(dewPoint.toFixed(1)),
    dew_point_unit: "C",
    moisture_state: moistureState,
    surface_freeze_point: freezePoint,
    surface_freeze_point_unit: "C",
    de_icing_agent_concentration: deIceConc,
    de_icing_agent_concentration_unit: "% weight (KAc/urea)",
    chemical_type: deIceConc > 10 ? "POTASSIUM ACETATE" : deIceConc > 0 ? "UREA DILUTE" : "NONE",
    ice_protection: iceProtected ? "ACTIVE - CHEMICAL HOLDING" : iceWarning ? "LOST - REDEICE REQUIRED" : "NOT NEEDED",
    frost_risk: frostRisk,
    runway_condition_code: grfCode,
    runway_condition_report: { 0: "ICE/CONTAMINATED", 1: "ICE/SLUSH", 2: "ICE PATCHES", 3: "WET ICE RISK", 4: "FROST", 5: "DAMP", 6: "DRY" }[grfCode],
    sensor_status: "NORMAL",
    timestamp: new Date().toISOString()
  };

  return sensorObject
}