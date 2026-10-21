function generateSensorData(sensorId, range = 40) {
  // SSR interrogates Mode S transponders; ADS-B broadcasts position, identity and
  // state vectors for every aircraft on approach and in the terminal area
  const airlines = ["GIA", "SIA", "garuda", "UAE", "QTR", "CPA", "JAL"];
  const types = ["B738", "A320", "B77W", "A359", "AT76", "A332", "B789"];
  const flights = [];
  const count = 3 + Math.floor(Math.random() * 6);

  for (let i = 0; i < count; i++) {
    // Mix of arrivals on descent, departures climbing and cruise traffic
    const phase = Math.random() > 0.5 ? "ARRIVAL" : "DEPARTURE";
    const onApproach = phase === "ARRIVAL" && Math.random() > 0.4;
    const altitude = onApproach
      ? Math.round(200 + Math.random() * 4800)                    // final approach gate
      : phase === "ARRIVAL"
        ? Math.round(8000 + Math.random() * 18000)                //STAR descent
        : Math.round(5000 + Math.random() * 30000);               // departure climb
    const climbing = phase === "DEPARTURE" ? 1200 + Math.random() * 1800 : onApproach ? -(300 + Math.random() * 500) : Math.random() * 120 - 60;

    flights.push({
      icao24: Math.random().toString(16).slice(2, 8).toUpperCase(), // Mode S address
      callsign: airlines[Math.floor(Math.random() * airlines.length)].toUpperCase() + Math.floor(Math.random() * 900 + 100),
      aircraft_type: types[Math.floor(Math.random() * types.length)],
      flight_phase: phase,
      altitude: altitude,
      altitude_unit: "ft",
      vertical_rate: parseFloat(climbing.toFixed(0)),
      vertical_rate_unit: "ft/min",
      ground_speed: Math.round(120 + Math.random() * 380),
      ground_speed_unit: "knots",
      indicated_airspeed: Math.round(150 + Math.random() * 220),
      indicated_airspeed_unit: "knots IAS",
      heading: Math.random() > 0.5 ? "085" : "265",
      squawk: Math.floor(Math.random() * 8) + "" + Math.floor(Math.random() * 8) + "" + Math.floor(Math.random() * 8) + "" + Math.floor(Math.random() * 8), // 4-digit octal code (0-7 each digit)
      range: parseFloat((Math.random() * range).toFixed(1)),
      range_unit: "NM",
      bearing: parseFloat((Math.random() * 360).toFixed(0)),
      signal_rssi: parseFloat((-4 - Math.random() * 22).toFixed(1)),
      signal_rssi_unit: "dBFS",
      position_source: Math.random() > 0.1 ? "GPS" : "INERTIAL" // ADS-B integrity flag
    });
  }

  // Emergency squawks: 7500 hijack, 7600 radio failure, 7700 general emergency
  const emergency = flights.find((f) => ["7500", "7600", "7700"].includes(f.squawk));
  const emergencyAlert = emergency
    ? "EMERGENCY SQUAWK " + emergency.squawk + " - " + emergency.callsign
    : "NONE";

  const sensorObject = {
    sensor_id: sensorId,
    receiver_type: "SSR Mode S / ADS-B 1090 MHz",
    update_rate: 1.0,
    update_rate_unit: "Hz",
    coverage_radius: range,
    coverage_radius_unit: "NM",
    aircraft_tracked: flights.length,
    arrivals: flights.filter((f) => f.flight_phase === "ARRIVAL").length,
    departures: flights.filter((f) => f.flight_phase === "DEPARTURE").length,
    flights: flights,
    emergency_alert: emergencyAlert,
    timestamp: new Date().toISOString()
  };

  return sensorObject
}