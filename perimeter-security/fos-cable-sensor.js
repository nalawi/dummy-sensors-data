function generateSensorData(sensorId, mode = "auto") {
  // A single-mode fiber is zip-tied along the fence fabric; a coherent
  // interrogator (C-OTDR) backscatter-maps strain along the whole run, so a
  // hand-hold, bolt-cutter bite or fabric lift shows up as a localized
  // micro-strain signature at a pin-pointable distance along the cable
  const events = ["CLEAR", "CLIMB", "CUT", "LIFT"];
  const event = mode === "auto" ? (Math.random() > 0.93 ? events[1 + Math.floor(Math.random() * 3)] : "CLEAR") : mode.toUpperCase();

  const sectorLength = 250; // one interrogator channel per ~250 m fence run
  const eventDistance = parseFloat((5 + Math.random() * (sectorLength - 20)).toFixed(1));

  // Signature library: climbing = repetitive slow load pulses ~1-2 Hz;
  // cutting = high-frequency metal-on-metal grind; lifting = quasi-static
  // low-frequency pull as fabric is pried off the posts
  const signatures = {
    CLEAR:  { freq: 0, freq_unit: "Hz", strain: 0 },
    CLIMB:  { freq: parseFloat((1.0 + Math.random() * 1.2).toFixed(2)), freq_unit: "Hz (rhythmic load pulses)", strain: 12 + Math.random() * 25 },
    CUT:    { freq: parseFloat((45 + Math.random() * 55).toFixed(1)), freq_unit: "Hz (metal-on-metal grind)", strain: 90 + Math.random() * 120 },
    LIFT:   { freq: parseFloat((0.2 + Math.random() * 0.3).toFixed(2)), freq_unit: "Hz (quasi-static pull)", strain: 60 + Math.random() * 60 }
  };
  const sig = signatures[event];

  // Rain and wind-driven debris are the classic FOS false-alarm sources;
  // the classifier suppresses them via spectral fingerprinting
  const weather = ["CLEAR", "HEAVY RAIN", "WIND 25 KT + DEBRIS IMPACT"][Math.floor(Math.random() * (event === "CLEAR" ? 3 : 1))];
  const suppressed = event === "CLEAR" && weather !== "CLEAR" && Math.random() > 0.5;

  const sensorObject = {
    sensor_id: sensorId,
    sensor_type: "Fiber Optic Sensing (FOS) Fence Cable - C-OTDR Interrogator",
    fence_sector: "PERIMETER-" + Math.floor(Math.random() * 8 + 1),
    cable_length: sectorLength,
    cable_length_unit: "m per channel",
    alarm_state: event === "CLEAR" ? "CLEAR" : "ALARM",
    event_class: event,
    event_location: event === "CLEAR" ? null : {
      distance_along_cable: eventDistance,
      distance_unit: "m (localization accuracy +/-5 m)",
      nearest_post: "POST " + Math.ceil(eventDistance / 10),
      zone_map_ref: sectorLength + "M-CH/" + Math.ceil(eventDistance / 25)
    },
    strain_signature: {
      peak_microstrain: parseFloat(sig.strain.toFixed(1)),
      peak_microstrain_unit: "ue (vs 2000 ue fiber proof-test limit)",
      dominant_frequency: sig.freq,
      dominant_frequency_unit: sig.freq_unit,
      event_duration: event === "CLEAR" ? null : parseFloat((2 + Math.random() * 20).toFixed(1)),
      event_duration_unit: "s"
    },
    classifier_confidence: event === "CLEAR" ? null : parseFloat((0.82 + Math.random() * 0.16).toFixed(2)),
    weather_context: weather,
    false_alarm_suppressed: suppressed,
    patrol_check_note: event === "CLEAR" ? null : "DISPATCH PATROL TO " + "POST " + Math.ceil(eventDistance / 10),
    interrogator: {
      wavelength: 1550,
      wavelength_unit: "nm",
      pulse_rate: Math.round(1 + Math.random() * 2),
      pulse_rate_unit: "kHz sampling of backscatter",
      channel_count: 4,
      channel_count_unit: "fiber channels per rack unit"
    },
    fiber_health: Math.random() > 0.97 ? "ATTENUATION SPIKE AT SPLICE 12 - OTDR CHECK" : "NOMINAL",
    timestamp: new Date().toISOString()
  };

  return sensorObject
}