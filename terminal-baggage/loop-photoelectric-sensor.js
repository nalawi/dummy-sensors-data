function generateSensorData(sensorId, mode = "auto") {
  // Inductive loops and through-beam photoelectric eyes track bag presence and
  // spacing at conveyor intersections; the PLC uses gaps to decide gate throws
  const jam = mode === "auto" ? Math.random() > 0.93 : mode === "jam";
  const beltSpeed = parseFloat((0.8 + Math.random() * 1.4).toFixed(2));
  const gapCm = parseFloat((25 + Math.random() * 55).toFixed(1)); // bag spacing on belt

  const loopStates = {
    OCCUPIED: "BAG ON LOOP - METAL MASS PRESENT",
    CLEAR: "NO BAG - LOOP READY FOR NEXT TRIGGER"
  };

  // Photoeye pair: emitter/detector across the belt; blocked = bag present
  const photoeyeBlocked = Math.random() > 0.3;
  const loopTriggered = !photoeyeBlocked ? Math.random() > 0.05 : true; // loop catches metal frames even when the beam misses soft bags

  // Intersection routing decision
  const destinations = ["SORTER MATRIX", "PIER 2 MAKE-UP", "PIER 5 MAKE-UP", "EARLY BAG STORAGE", "TRANSFER INDUCT"];
  const targetLane = destinations[Math.floor(Math.random() * destinations.length)];

  const pileupRisk =
    gapCm < 30 ? "HIGH - HOLD GATE CLOSED, BACKPRESSURE BUILDING"
    : gapCm < 45 ? "MODERATE - SPEED MATCH ON MERGE"
    : "LOW - NORMAL SPACING";

  const sensorObject = {
    sensor_id: sensorId,
    sensor_type: "Inductive Loop + Photoelectric Bag-Presence Pair",
    intersection_id: "BHS-X" + Math.floor(Math.random() * 60 + 1),
    belt_speed: beltSpeed,
    belt_speed_unit: "m/s",
    inductive_loop: {
      state: loopTriggered ? "OCCUPIED" : "CLEAR",
      detail: loopTriggered ? loopStates.OCCUPIED : loopStates.CLEAR,
      oscillation_freq: parseFloat((40 + Math.random() * 10).toFixed(1)),
      oscillation_freq_unit: "kHz",
      detune_delta: parseFloat((loopTriggered ? -(2 + Math.random() * 4) : -(0.05 + Math.random() * 0.3)).toFixed(2)),
      detune_delta_unit: "% frequency shift"
    },
    photoelectric_eye: {
      blocked: photoeyeBlocked,
      beam_type: "THROUGH-BEAM IR 850 nm",
      alignment_deviation: parseFloat((Math.random() * 0.8).toFixed(2)),
      alignment_deviation_unit: "deg",
      lens_condition: Math.random() > 0.97 ? "DUST BUILDUP - CLEAN SCHEDULED" : "CLEAR"
    },
    bag_gap: gapCm,
    bag_gap_unit: "cm (front bumper to rear bumper)",
    bags_per_minute: beltBPM(beltSpeed, gapCm),
    bags_per_minute_unit: "bags/min",
    merge_gate_command: jam ? "GATE LOCKED - UPSTREAM JAM CLEARANCE" : "THROW TO " + targetLane,
    routing_target: targetLane,
    pileup_risk: pileupRisk,
    jam_detected: jam,
    jam_clearance_time: jam ? Math.round(20 + Math.random() * 100) : null,
    jam_clearance_time_unit: "s (recirculation loop flush)",
    recirculation_counter: Math.floor(Math.random() * 40), // laps a bag has taken when no lane is ready
    timestamp: new Date().toISOString()
  };

  return sensorObject
}

function beltBPM(speedMs, gapCm) {
  // Throughput = belt speed / bag spacing, converted to bags per minute
  return parseFloat(((speedMs / (gapCm / 100)) * 60).toFixed(1));
}