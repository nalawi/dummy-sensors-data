function generateSensorData(sensorId, mode = "auto") {
  // Triaxial geophones buried every 50 m along the fence line listen for
  // Rayleigh surface waves: footfalls are impulsive ~8-20 Hz, digging is a
  // rhythmic shovelful cadence, tunneling is quasi-continuous low-frequency
  // loading, and vehicles couple their engine/harmonics straight into soil
  const event = mode === "auto" ? (Math.random() > 0.9 ? ["FOOTSTEPS", "DIGGING", "TUNNELING", "VEHICLE"][Math.floor(Math.random() * 4)] : "CLEAR") : mode.toUpperCase();
  const active = event !== "CLEAR";

  // Soil coupling: dry sand attenuates fast, wet clay carries far.
  // Detection range is inverted from SNR at the nearest geophone
  const soilTypes = ["DRY SAND (HIGH ATTENUATION)", "WET CLAY (LONG PROPAGATION)", "LOAMY GRAVEL", "COMPACTED BALLAST"];
  const soil = soilTypes[Math.floor(Math.random() * soilTypes.length)];
  const attenFactor = soil.includes("SAND") ? 0.35 : soil.includes("CLAY") ? 1.0 : 0.65;

  const seismic = {
    FOOTSTEPS: { freq: 8 + Math.random() * 12, freq_note: "Hz impulsive body-slam transients", amp: 40 + Math.random() * 60, cadence: "2 STEP CADENCE @ ~2 Hz", range: 30 * attenFactor + 10 },
    DIGGING:   { freq: 12 + Math.random() * 10, freq_note: "Hz rhythmic shovelful impacts", amp: 80 + Math.random() * 90, cadence: "IRREGULAR 0.8-1.5 s CADENCE", range: 45 * attenFactor + 15 },
    TUNNELING: { freq: 3 + Math.random() * 5, freq_note: "Hz quasi-continuous deep loading", amp: 25 + Math.random() * 35, cadence: "SUSTAINED > 10 MIN", range: 90 * attenFactor + 30 },
    VEHICLE:   { freq: 18 + Math.random() * 30, freq_note: "Hz engine firing + wheel harmonics", amp: 200 + Math.random() * 300, cadence: "CONTINUOUS ROLL-ON", range: 350 * attenFactor + 100 },
    CLEAR:     { freq: 0, freq_note: "BACKGROUND (MICROSEISM + WIND COUPLING)", amp: 2 + Math.random() * 3, cadence: null, range: 0 }
  }[event];
  const amp = parseFloat(seismic.amp.toFixed(1)); // nm/s ground velocity

  // Weather noise floor: rain hammering and wind in trees raise the floor
  // and shrink usable range; the sensor adapts its trigger threshold
  const windKt = Math.round(2 + Math.random() * 28);
  const raining = Math.random() > 0.8;
  const noiseFloor = parseFloat((2 + windKt * 0.15 + (raining ? 8 : 0)).toFixed(1));
  const snr = parseFloat((20 * Math.log10(amp / noiseFloor)).toFixed(1));
  const detected = active && snr > 6;

  // Nearest-node geometry: geophone chain spacing 50 m, event triangulated
  const nodeSpacing = 50;
  const nearestNode = Math.floor(Math.random() * 24); // node index along the line
  const offsetAlong = active ? parseFloat((Math.random() * nodeSpacing).toFixed(1)) : null;
  const depthEstimate = event === "TUNNELING" ? parseFloat((1.5 + Math.random() * 5).toFixed(1)) : event === "DIGGING" ? parseFloat((0.3 + Math.random() * 0.9).toFixed(1)) : null;

  const sensorObject = {
    sensor_id: sensorId,
    sensor_type: "Seismic Underground Geophone Array (Triaxial)",
    array_line: "LINE-" + ["A", "B", "C", "D"][Math.floor(Math.random() * 4)],
    node_spacing: nodeSpacing,
    node_spacing_unit: "m between buried triaxial nodes",
    nearest_node: "NODE-" + String(nearestNode).padStart(2, "0"),
    offset_from_node: offsetAlong,
    offset_from_node_unit: "m along line (triangulated from 3-node correlation)",
    soil_type: soil,
    alarm_state: detected ? "ALARM" : active ? "DETECTED-UNCONFIRMED (LOW SNR)" : "CLEAR",
    event_class: active ? event : "NONE",
    signal: {
      peak_ground_velocity: amp,
      peak_ground_velocity_unit: "nm/s (vector sum of triaxial)",
      dominant_frequency: parseFloat(seismic.freq.toFixed(1)),
      dominant_frequency_unit: "Hz",
      frequency_note: seismic.freq_note,
      cadence: seismic.cadence,
      snr: snr,
      snr_unit: "dB vs local noise floor",
      detection_range_estimate: active ? Math.round(seismic.range) : null,
      detection_range_estimate_unit: "m at current soil/weather"
    },
    depth_estimate: depthEstimate,
    depth_estimate_unit: depthEstimate ? "m below grade (surface-to-source inversion)" : null,
    threat_note: event === "TUNNELING" ? "DEEP LOW-FREQ SIGNATURE - SUSTAINED - RULE OUT UTILITY WORK ADJACENT" : event === "DIGGING" ? "SHALLOW EXCAVATION SIGNATURE - CHECK CCTV HANDOFF" : event === "VEHICLE" ? "ROAD COUPLING - VERIFY AGAINST APPROVED MOVEMENTS LIST" : null,
    environment: {
      wind: windKt,
      wind_unit: "kt (tree-root coupling raises floor)",
      rain: raining ? "ACTIVE - RAIN HAMMER CLUTTER" : "NONE",
      noise_floor: noiseFloor,
      noise_floor_unit: "nm/s adaptive",
      nearby_vibration_sources: ["HVAC CHILLER PLANT 400 m", "FUEL FARM PUMPS 900 m", "SVC ROAD TRAFFIC 250 m"][Math.floor(Math.random() * 3)]
    },
    adaptive_threshold: parseFloat((noiseFloor * 3).toFixed(1)),
    adaptive_threshold_unit: "nm/s trigger (3x floor, auto-scaled)",
    node_health: Math.random() > 0.95 ? "NODE-17 IMPEDANCE DRIFT - POSSIBLE GROUND SETTLEMENT" : "ALL NODES NOMINAL",
    timestamp: new Date().toISOString()
  };

  return sensorObject
}