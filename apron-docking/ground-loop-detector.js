function generateSensorData(sensorId, mode = "auto") {
  // Buried inductive loops under the apron confirm a metallic airframe is
  // parked over a service point before fuel pits and 400 Hz GPU reels unlock;
  // they also double as gate-occupancy input to the apron management system
  const fault = mode === "fault";
  const occupied = fault ? false : mode === "occupied" ? true : Math.random() > 0.35;
  const detuned = occupied ? -(4.5 + Math.random() * 5.5) : -(0.1 + Math.random() * 0.4);

  // Service points embedded in the apron slab beneath each loop
  const servicePoints = [
    { type: "FUEL PIT (JET A-1)", highpoint: "2 IN. FUEL COUNTER", unlocked: occupied },
    { type: "FUEL PIT (SAF/SUSTAINABLE FUEL)", highpoint: "SAF BLEND DISPENSER", unlocked: occupied && Math.random() > 0.7 },
    { type: "400 HZ GROUND POWER REEL", highpoint: "GPU CABLE RETRACT", unlocked: occupied && Math.random() > 0.25 },
    { type: "POTABLE WATER CABINET", highpoint: "UV-TREATED WATER SUPPLY", unlocked: occupied && Math.random() > 0.4 },
    { type: "PRE-CONDITIONED AIR (PCA) DUCT", highpoint: "PCA 4-IN. RISER", unlocked: occupied && Math.random() > 0.3 }
  ];

  // Vehicle detection: tugs and catering trucks crossing an idle loop look
  // like short detune blips - filtered by dwell-time thresholds
  const vehicleBlip = !occupied && Math.random() > 0.8;
  const dwell = occupied ? Math.round(35 + Math.random() * 200) : vehicleBlip ? Math.round(2 + Math.random() * 6) : 0;

  const loopFaults = [
    "COIL OPEN CIRCUIT - MEGGER READING REQUIRED",
    "LEAD-IN CABLE CRACKED - INTERMITTENT DETUNE",
    "SENSED FREQUENCY DRIFTING - OSCILLATOR RETUNE"
  ];

  const sensorObject = {
    sensor_id: sensorId,
    sensor_type: "Apron Ground Loop Detector (Inductive)",
    service_point: "STAND " + Math.floor(Math.random() * 50 + 1) + " CENTER",
    loop_state: fault ? "FAULT" : occupied ? "OCCUPIED" : "CLEAR",
    aircraft_present: occupied,
    loop_oscillation: {
      base_frequency: parseFloat((31 + Math.random() * 4).toFixed(2)),
      base_frequency_unit: "kHz",
      detune_delta: parseFloat(detuned.toFixed(2)),
      detune_delta_unit: "% (large negative = big metal mass)"
    },
    dwell_time: dwell,
    dwell_time_unit: "s",
    classified_as: fault ? "LOOP FAULT"
      : occupied ? "AIRCRAFT PARKED"
      : vehicleBlip ? "VEHICLE TRANSIT (FILTERED)"
      : "NO DETECTION",
    vehicle_blip_filtered: vehicleBlip,
    interlocked_services: servicePoints.map((s) => ({
      service: s.type,
      high_point: s.highpoint,
      unlocked: fault ? false : s.unlocked,
      reason: fault ? "LOOP FAULT - SERVICES LOCKED OUT"
        : s.unlocked ? "AIRCRAFT OVERLAY CONFIRMED"
        : "LOCKED - NO AIRCRAFT OVERLAY"
    })),
    safety_interlock_active: fault || !occupied, // pits stay locked with no metal above
    adjacency_check: {
      lead_in_clear: Math.random() > 0.9 ? "VEHICLE QUEUED ON CENTERLINE" : "CLEAR",
      adjacent_stand_occupied: Math.random() > 0.5
    },
    fault_detail: fault ? loopFaults[Math.floor(Math.random() * loopFaults.length)] : null,
    timestamp: new Date().toISOString()
  };

  return sensorObject
}