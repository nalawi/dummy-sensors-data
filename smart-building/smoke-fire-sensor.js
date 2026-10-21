function generateSensorData(sensorId, mode = "auto") {
  // Addressable photoelectric smoke detector with companion thermistor: a
  // pulsing IR LED looks for light scattered by smoke aerosol entering the
  // optical chamber, while the thermistor watches for rapid heat rise
  // (delta-T). Both inputs feed the fire panel's alarm-decision logic, which
  // requires corroboration to reject false alarms from dust or steam.
  const zones = ["L1-LOBBY", "L2-OPEN-OFFICE", "L4-CAFETERIA", "B1-PARKING", "L5-ELECTRICAL-CLOSET"];
  const zone = zones[Math.floor(Math.random() * zones.length)];

  const states = ["NORMAL", "SMOKE_GROWING", "HEAT_SPIKE", "FIRE_CONFIRMED"];
  const state = mode === "auto"
    ? (Math.random() > 0.09 ? "NORMAL" : states[1 + Math.floor(Math.random() * 3)])
    : mode.toUpperCase();

  // Obscuration: %/m light attenuation in the chamber; panel alarm at 3.5%/m
  const obscuration = state === "NORMAL" ? parseFloat((0.3 + Math.random() * 1.4).toFixed(2))
    : state === "FIRE_CONFIRMED" ? parseFloat((6 + Math.random() * 14).toFixed(2))
    : parseFloat((2.0 + Math.random() * 3.5).toFixed(2));

  // Heat: fast-rise events climb tens of degrees within a minute (A1S curve)
  const temperature = state === "HEAT_SPIKE" || state === "FIRE_CONFIRMED"
    ? parseFloat((48 + Math.random() * 40).toFixed(1))
    : parseFloat((19 + Math.random() * 6).toFixed(1));
  const riseRate = state === "HEAT_SPIKE" || state === "FIRE_CONFIRMED"
    ? parseFloat((8 + Math.random() * 30).toFixed(1))
    : parseFloat((Math.random() * 1.5).toFixed(1));

  const confirmed = state === "FIRE_CONFIRMED" || (obscuration > 3.5 && riseRate > 8);
  const sources = ["CAFETERIA TOASTER BURN", "VFD OVERHEAT IN CLOSET", "SMOLDERING CABLE INSULATION", "HOT WORK - WELDING PERMIT ACTIVE"];

  const sensorObject = {
    sensor_id: sensorId,
    sensor_type: "Fire Detection - addressable photoelectric smoke + ROR thermistor",
    zone: zone,
    smoke_obscuration: obscuration,
    smoke_obscuration_unit: "%/m (panel alarm 3.5%/m EN 54-7)",
    temperature: temperature,
    temperature_unit: "C",
    temp_rise_rate: riseRate,
    temp_rise_rate_unit: "C/min (ROR threshold 8 C/min)",
    fire_alarm_state: confirmed ? "ALARM" : obscuration > 2.0 || riseRate > 8 ? "PRE_ALARM" : "NORMAL",
    alarm_confirmed_multisensor: confirmed,
    suspected_source: state === "NORMAL" ? null : sources[Math.floor(Math.random() * sources.length)],
    panel_actions: confirmed
      ? "REPEATER ANNC + RELEASABLE HOLDERS DROPPED + HVAC SHUTOFF + STAIRWELL PRESSURIZATION"
      : obscuration > 2.0
      ? "INVESTIGATE VIA CCTV/STAFF - SILENCEABLE PRE-ALARM"
      : "NONE",
    notification_appliances: confirmed ? "EVAC TONE ZONES " + zone.split("-")[0] : "INACTIVE",
    detector_address: zone + "-D" + Math.floor(Math.random() * 40 + 1),
    loop_protocol: "ESP-protocol loop 2, addressable",
    chamber_health: Math.random() > 0.97 ? "CHAMBER CONTAMINATED >80% - SERVICE UNIT" : "CLEAN",
    last_test_days: Math.floor(Math.random() * 180),
    timestamp: new Date().toISOString()
  };

  return sensorObject
}