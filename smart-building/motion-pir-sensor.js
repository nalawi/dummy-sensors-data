function generateSensorData(sensorId, mode = "auto") {
  // Passive-infrared (PIR) occupancy detector on the lighting/door loop.
  // A pyroelectric element sees moving thermal contrasts across a faceted
  // Fresnel lens; the MCU qualifies pulses before tripping the relay, so a
  // curtain flutter or HVAC draft should NOT count as occupancy.
  const zones = ["L2-OPEN-OFFICE", "L3-CONF-A", "L4-CORRIDOR", "L1-LOBBY", "B1-STORAGE"];
  const zone = zones[Math.floor(Math.random() * zones.length)];

  const states = ["CLEAR", "MOTION", "WALK_THROUGH", "SUSTAINED_PRESENCE"];
  const state = mode === "auto"
    ? (Math.random() > 0.55 ? states[0] : states[1 + Math.floor(Math.random() * 3)])
    : mode.toUpperCase();

  // Heat-source profile behind the trip: person vs pet-sized nuisance
  const heatProfiles = {
    CLEAR:               { pulses: 0,  irDelta: 0 },
    MOTION:              { pulses: 3 + Math.floor(Math.random() * 3), irDelta: 1.5 + Math.random() * 2.5 },
    WALK_THROUGH:        { pulses: 6 + Math.floor(Math.random() * 4), irDelta: 2.0 + Math.random() * 3.0 },
    SUSTAINED_PRESENCE:  { pulses: 9 + Math.floor(Math.random() * 6), irDelta: 2.5 + Math.random() * 3.5 }
  };
  const profile = heatProfiles[state] || heatProfiles.CLEAR;

  // Confidence blends pulse count and IR contrast; nuisance sources score low
  const confidence = state === "CLEAR" ? null : Math.min(0.99, 0.55 + profile.pulses * 0.03 + profile.irDelta * 0.06).toFixed(2);

  const actuatorTargets = {
    CLEAR:              "RELAY OFF - LIGHTS TO OCC-SENSOR AUTO AFTER HOLD TIME",
    MOTION:             "RELAY ON - LIGHTS 100% FOR 15 MIN HOLD",
    WALK_THROUGH:       "RELAY ON - LIGHTS 100%, SHORTENED 5 MIN HOLD",
    SUSTAINED_PRESENCE: "RELAY ON + DOOR UNLOCK + AUTO-FLUSHER ARMED"
  };

  const nuisances = ["HVAC DIFFUSER DRAFT", "CURTAIN FLUTTER", "DIRECT SUN STRIKE ON LENS", "RADIATOR CONVECTION"];
  const nuisanceCause = state === "MOTION" && Math.random() > 0.85
    ? nuisances[Math.floor(Math.random() * nuisances.length)]
    : null;

  const sensorObject = {
    sensor_id: sensorId,
    sensor_type: "PIR Occupancy Sensor - dual-element pyroelectric, 8m Fresnel cone",
    zone: zone,
    pir_state: state,
    detection_pulses: profile.pulses,
    detection_pulses_unit: "qualified pulses in 2s window",
    ir_contrast: profile.irDelta > 0 ? parseFloat(profile.irDelta.toFixed(1)) : 0,
    ir_contrast_unit: "C above background thermal signature",
    confidence: confidence ? parseFloat(confidence) : null,
    confidence_unit: "0-1 classifier score",
    relay_state: state === "CLEAR" ? "OFF" : "ON",
    actuator_command: actuatorTargets[state] || actuatorTargets.CLEAR,
    nuisance_filter_flag: nuisanceCause,
    walk_test_led: state === "CLEAR" ? "OFF" : "FLASH GREEN",
    lens_health: Math.random() > 0.98 ? "FRESNEL SEGMENT CRACKED - REPLACE DOME" : "NOMINAL",
    timestamp: new Date().toISOString()
  };

  return sensorObject
}