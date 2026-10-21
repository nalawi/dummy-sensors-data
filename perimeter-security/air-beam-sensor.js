function generateSensorData(sensorId, mode = "auto") {
  // Paired towers fire a modulated pulsed IR curtain (4 beams stacked) at
  // ~880 nm across a cleared fire-lane; the receiver AGC tracks slow losses
  // (fog, window grime) but a beam BLOCKED faster than the slew limit trips
  const event = mode === "auto" ? (Math.random() > 0.9 ? "BREAK" : "CLEAR") : mode.toUpperCase();
  const broken = event === "BREAK";

  const spanM = Math.round(60 + Math.random() * 140); // tower-to-tower
  const beamCount = 4; // stacked curtain
  const brokenBeam = 1 + Math.floor(Math.random() * beamCount);
  const breakHeight = parseFloat((0.25 + brokenBeam * 0.5).toFixed(2)); // ~0.5 m spacing

  // Clear-air margin budget: link loss vs alignment + fog attenuation.
  // Fog kills IR fast (Mie scattering at lambda/2-scale droplets)
  const fogDensity = parseFloat((Math.random() * 0.8).toFixed(2)); // g/m3
  const fogAttenuation = parseFloat((fogDensity * 6).toFixed(1)); // dB/km-ish penalty
  const alignmentMargin = parseFloat((12 + Math.random() * 8).toFixed(1)); // dB above alarm floor

  // Birds roost on towers and cross the curtain; classifier filters <2 s
  // interruptions. Tower sway in gusts wobbles margin slowly (AGC follows)
  const birdEvent = !broken && Math.random() > 0.9;
  const gust = Math.round(5 + Math.random() * 30); // kt
  const alignmentDrift = parseFloat(((Math.random() * 2 - 1) * 0.4).toFixed(2)); // mrad
  const windowContamination = Math.random() > 0.9 ? "DIRTY OPTICS - CLEAN AT NEXT PM" : "CLEAN";

  const interrupted = broken || birdEvent;
  const interruptDuration = birdEvent ? parseFloat((0.3 + Math.random() * 1.2).toFixed(1)) : broken ? parseFloat((2 + Math.random() * 25).toFixed(1)) : 0;
  const classifiedAs = broken ? (interruptDuration < 3 ? "BREAK (SHORT - VERIFY)" : "BREAK") : birdEvent ? "IGNORED (BIRD PROFILE)" : "CLEAR";

  const sensorObject = {
    sensor_id: sensorId,
    sensor_type: "Active Infrared (AIR) Photo-Electric Beam Curtain",
    sector: "SECTOR-" + Math.floor(Math.random() * 10 + 1) + " TOWER PAIR " + Math.floor(Math.random() * 20 + 1),
    span: spanM,
    span_unit: "m tower-to-tower (rated to 200 m)",
    beam: {
      wavelength: 880,
      wavelength_unit: "nm IR (invisible)",
      modulation: "PULSE-CODED 1.2 kHz (rejects sunlight / flares / strobes)",
      beam_count: beamCount,
      beam_count_unit: "stacked @ 0.5 m spacing (curtain)",
      beam_pattern: "DUAL-FREQUENCY SYNC TX->RX (anti-defeat: cannot blind with matching LED)"
    },
    alarm_state: broken ? "ALARM" : "CLEAR",
    event: {
      beams_interrupted: broken ? [brokenBeam] : birdEvent ? [1 + Math.floor(Math.random() * beamCount)] : [],
      break_height: interrupted ? breakHeight : null,
      break_height_unit: "m AGL",
      interrupt_duration: interrupted ? interruptDuration : null,
      interrupt_duration_unit: "s",
      classification: classifiedAs,
      response_note: broken ? "PTZ CAMERA SLAVED TO TOWER PAIR BEARING" : null
    },
    link_budget: {
      rx_margin: parseFloat((alignmentMargin - fogAttenuation * (spanM / 1000)).toFixed(1)),
      rx_margin_unit: "dB above alarm floor",
      alarm_floor: -8,
      alarm_floor_unit: "dBm at receiver",
      agc_tracking: "SLOW-SETTLE (follows fog/rain; cannot follow a human)",
      fog_attenuation: fogAttenuation,
      fog_attenuation_unit: "dB across span at current density"
    },
    environment: {
      fog_density: fogDensity,
      fog_density_unit: "g/m3",
      visibility: parseFloat((Math.max(0.05, 12 - fogDensity * 13)).toFixed(2)),
      visibility_unit: "km (runway-visual-range style estimate)",
      gust: gust,
      gust_unit: "kt (tower sway source)",
      rain_rate: Math.random() > 0.8 ? "MODERATE - AGC COMPENSATING" : "NONE"
    },
    health: {
      alignment_drift: alignmentDrift,
      alignment_drift_unit: "mrad (re-peep at 1.5 mrad)",
      optics: windowContamination,
      heater: Math.random() > 0.85 ? "DEFOG HEATER ON (CONDENSATION)" : "OFF",
      self_test: Math.random() > 0.97 ? "TX LAMP DEGRADED - SPARE IN RACK" : "PASS"
    },
    timestamp: new Date().toISOString()
  };

  return sensorObject
}