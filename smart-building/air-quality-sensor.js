function generateSensorData(sensorId, mode = "auto") {
  // Multi-parameter indoor air quality (IAQ) node: NDIR CO2, metal-oxide VOC,
  // electrochemical formaldehyde and a laser PM2.5 counter, all feeding the
  // demand-controlled-ventilation (DCV) loop that positions the AHU outdoor
  // air damper. CO2 above ~1000 ppm is the classic "stuffy meeting room" alarm.
  const zones = ["L1-LOBBY", "L2-OPEN-OFFICE", "L3-CONF-A", "L4-CAFETERIA", "L5-PHOTOCOPY"];
  const zone = zones[Math.floor(Math.random() * zones.length)];

  // auto: mostly GOOD; FORGET_AIR forces a packed-room CO2 spike for DCV tests
  const states = ["GOOD", "MODERATE", "POOR", "FORGET_AIR"];
  const state = mode === "auto"
    ? (Math.random() > 0.16 ? states[Math.floor(Math.random() * 2)] : states[2 + Math.floor(Math.random() * 2)])
    : mode.toUpperCase();

  // CO2: outdoor baseline ~420 ppm, indoors drifts with occupancy
  const co2Ranges = { GOOD: [420, 650], MODERATE: [651, 1000], POOR: [1001, 1500], FORGET_AIR: [1501, 2800] };
  const co2 = parseFloat(((co2Ranges[state] || co2Ranges.GOOD)[0] + Math.random() * ((co2Ranges[state] || co2Ranges.GOOD)[1] - (co2Ranges[state] || co2Ranges.GOOD)[0])).toFixed(0));

  // VOC index (0-500, sPAQ equivalent): cleaning agents, furniture off-gassing
  const voc = state === "POOR" || state === "FORGET_AIR"
    ? Math.round(250 + Math.random() * 250)
    : Math.round(40 + Math.random() * 180);

  // Formaldehyde: composite furniture / new fit-out; WHO guideline 0.1 mg/m3 (~81 ppb)
  const hcho = state === "FORGET_AIR"
    ? parseFloat((0.09 + Math.random() * 0.12).toFixed(3))
    : parseFloat((0.02 + Math.random() * 0.06).toFixed(3));

  // PM2.5: WHO 24h guideline 15 ug/m3; spikes from laser printers and kitchen extract
  const pm25 = state === "POOR" || state === "FORGET_AIR"
    ? parseFloat((18 + Math.random() * 60).toFixed(1))
    : parseFloat((3 + Math.random() * 12).toFixed(1));

  const oaDamper = Math.min(100, Math.round((co2 - 600) / 12));  // DCV: reset OA above ~600 ppm
  const aech = 2 + (oaDamper / 100) * 6;                          // air changes per hour follow OA

  const sources = ["MEETING FULL - 14/12 SEATS", "LASER PRINTER BURST, L5", "KITCHEN EXTRACT OFF", "NEW CARPET OFF-GASSING"];
  const suspectedSource = state === "GOOD" ? null : sources[Math.floor(Math.random() * sources.length)];

  const sensorObject = {
    sensor_id: sensorId,
    sensor_type: "IAQ Multi-Sensor - NDIR CO2 + MOX VOC + electrochemical HCHO + laser PM2.5",
    zone: zone,
    co2: co2,
    co2_unit: "ppm (outdoor baseline ~420, ASHRAE guidance <1100)",
    voc_index: voc,
    voc_index_unit: "0-500 index (0-150 clean)",
    formaldehyde: hcho,
    formaldehyde_unit: "mg/m3 (WHO 30-min guideline 0.1)",
    pm25: pm25,
    pm25_unit: "ug/m3 (WHO 24h guideline 15)",
    iaq_state: state === "FORGET_AIR" ? "POOR" : state,
    outdoor_air_damper: oaDamper,
    outdoor_air_damper_unit: "% open (DCV demand)",
    air_changes_per_hour: parseFloat(aech.toFixed(1)),
    air_changes_per_hour_unit: "ACH",
    suspected_source: suspectedSource,
    fresh_air_command: co2 > 1000 ? "BOOST OA TO 100% + OCCUPANCY NOTIFICATION" : co2 > 650 ? "RAISE OA TO " + oaDamper + "%" : "HOLD MINIMUM OA",
    sensor_health: Math.random() > 0.98 ? "NDIR SOURCE AGING - ABC CALIBRATION DUE" : "NOMINAL",
    timestamp: new Date().toISOString()
  };

  return sensorObject
}