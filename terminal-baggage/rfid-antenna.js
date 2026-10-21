function generateSensorData(sensorId, field = "normal") {
  // UHF RFID portals interrogate Gen2 tags on smart bag tags as they pass into
  // sorter chutes: no line-of-sight needed, so reads succeed even inside tubs
  const boosting = field === "high" ? 30 : field === "low" ? 10 : 15 + Math.random() * 10;
  const tagCount = Math.floor(Math.random() * 4) + 1; // bags per tub/portal event

  const airlines = ["GA", "SQ", "CX", "EK", "QF", "JL", "BR", "MH"];
  const stations = [
    "CHECK-IN INDUCT",
    "SECURITY SCREEN ENTRY",
    "SORTER MATRIX J1",
    "SORTER MATRIX J2",
    "PIER 2 MAKE-UP",
    "PIER 5 MAKE-UP",
    "EARLY BAG STORAGE",
    "TRANSFER TRUCK DOCK"
  ];

  const tags = [];
  for (let i = 0; i < tagCount; i++) {
    // Gen2 anti-collision: dense-reader mode arbitrates slots; strong tags reply first
    const rssi = parseFloat((-30 - Math.random() * 30).toFixed(1)); // dBm backscatter
    const read = rssi > -58 && Math.random() > 0.04; // missed reads happen on detuned tags
    tags.push({
      epc: Array.from({ length: 24 }, () => "0123456789ABCDEF"[Math.floor(Math.random() * 16)]).join(""),
      tid: "E280" + Array.from({ length: 12 }, () => "0123456789ABCDEF"[Math.floor(Math.random() * 16)]).join(""),
      airline_code: airlines[Math.floor(Math.random() * airlines.length)],
      license_plate: Math.floor(Math.random() * 10000000000).toString().padStart(10, "0"),
      rssi: rssi,
      rssi_unit: "dBm",
      phase_angle: Math.round(Math.random() * 180),
      phase_angle_unit: "deg",
      read_count: read ? 1 + Math.floor(Math.random() * 5) : 0,
      read_success: read,
      battery_assisted: Math.random() > 0.85 // BAP tags for hard-to-read metal cases
    });
  }

  const reads = tags.filter((t) => t.read_success).length;
  const station = stations[Math.floor(Math.random() * stations.length)];

  const sensorObject = {
    sensor_id: sensorId,
    sensor_type: "UHF RFID Portal Antenna (EPC Gen2 v2)",
    location: station,
    frequency_channel: 902.75 + Math.floor(Math.random() * 50) * 0.5,
    frequency_channel_unit: "MHz (FHSS)",
    transmit_power: parseFloat(boosting.toFixed(1)),
    transmit_power_unit: "dBm",
    antennas_per_portal: 4,
    dense_reader_mode: true,
    tags_interrogated: tagCount,
    tag_reads: reads,
    read_rate: parseFloat(((reads / tagCount) * 100).toFixed(1)),
    read_rate_unit: "%",
    tags: tags,
    missed_tag_action: reads < tagCount ? "QUEUED FOR RE-READ AT NEXT PORTAL" : "NONE",
    adjacent_portal_interference: Math.random() > 0.9 ? "MITIGATED - FREQUENCY HOP" : "NONE",
    timestamp: new Date().toISOString()
  };

  return sensorObject
}