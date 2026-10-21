function generateSensorData(sensorId, phase = "auto") {
  // Laser + ultrasonic proximity arrays on the bridge cab keep the rotunda
  // and cab a few centimeters off the fuselage while tracking the door
  // sill: bumpers halt the drive before any skin contact
  const phases = ["PARKED", "EXTENDING", "ALIGNING", "DOCKED"];
  const p = phase === "auto" ? phases[Math.floor(Math.random() * phases.length)] : phase.toUpperCase();

  const fleet = [
    { icao: "A20N", name: "AIRBUS A320NEO",   door_sill: 3.4,  range: [2.8, 4.0] },
    { icao: "B38M", name: "BOEING 737 MAX 8", door_sill: 3.4,  range: [2.8, 4.0] },
    { icao: "E290", name: "EMBRAER E190-E2",  door_sill: 3.2,  range: [2.6, 3.8] },
    { icao: "A359", name: "AIRBUS A350-900",  door_sill: 5.0,  range: [4.4, 5.6] },
    { icao: "B789", name: "BOEING 787-9",     door_sill: 4.9,  range: [4.3, 5.5] },
    { icao: "B77W", name: "BOEING 777-300ER", door_sill: 5.2,  range: [4.6, 5.8] },
    { icao: "A388", name: "AIRBUS A380-800",  door_sill: 5.5,  range: [4.9, 6.1] }
  ];
  const ac = fleet[Math.floor(Math.random() * fleet.length)];

  const doors = ["1L MAIN", "2L FWD SERVICE", "2R CATERING", "3L MID"];
  const door = doors[Math.floor(Math.random() * doors.length)];

  // Cab keeps 5-12 cm stand-off from skin; ultrasonic handles wraps and
  // stringers where a laser spot slips, so both must agree before creep stops
  const standoff = p === "PARKED" ? null : p === "DOCKED" ? parseFloat((5 + Math.random() * 7).toFixed(1)) : parseFloat((20 + Math.random() * 80).toFixed(1));
  const ultrasonic = standoff === null ? null : parseFloat((standoff + (Math.random() * 2 - 1) * 1.5).toFixed(1));

  // Auto-level follows sill height as suspension/ballast shifts during boarding
  const sillDelta = p === "DOCKED" ? parseFloat(((Math.random() * 2 - 1) * 1.2).toFixed(1)) : parseFloat(((Math.random() * 2 - 1) * 8).toFixed(1));
  const leveled = p === "DOCKED" && Math.abs(sillDelta) < 1.0;

  // Rain in the ultrasonic path or direct sun on the laser dot triggers fusion fallback
  const fusionFallback = p !== "PARKED" && Math.random() > 0.93;

  // Contact risk grows when lateral drift > 4 cm near the hull
  const lateral = p === "DOCKED" ? (Math.random() * 2 - 1) * 1.5 : (Math.random() * 2 - 1) * 6;
  const contactRisk = p !== "PARKED" && (Math.abs(lateral) > 4 || (standoff !== null && standoff < 7 && fusionFallback));

  const sensorObject = {
    sensor_id: sensorId,
    sensor_type: "PBB Laser + Ultrasonic Proximity Array (Cab & Rotunda)",
    bridge_id: "PBB-" + Math.floor(Math.random() * 30 + 1),
    bridge_style: Math.random() > 0.5 ? "TELESCOPIC" : "HEAD LINK",
    target_aircraft: ac.icao,
    target_door: door,
    door_sill_height: ac.door_sill,
    door_sill_height_unit: "m (nominal, empty)",
    bridge_phase: p,
    cab_standoff: standoff,
    cab_standoff_unit: "cm (laser, hull normal)",
    ultrasonic_standoff: ultrasonic,
    ultrasonic_standoff_unit: "cm",
    fusion_agreement: standoff === null ? "IDLE" : fusionFallback ? "DEGRADED - ULTRASONIC PRIMARY" : Math.abs(standoff - ultrasonic) < 2 ? "AGREE" : "DIVERGENT",
    lateral_offset: parseFloat(lateral.toFixed(1)),
    lateral_offset_unit: "cm (+forward / -aft of door center)",
    sill_height_delta: sillDelta,
    sill_height_delta_unit: "cm (cab floor vs door sill)",
    auto_level_active: p === "DOCKED" && leveled,
    auto_level_status: p !== "DOCKED" ? "PENDING DOCK" : leveled ? "LEVEL - RAMP SAFE" : "ADJUSTING - DO NOT OPEN DOOR",
    canopy_seal_state: p === "DOCKED" ? (Math.random() > 0.3 ? "DEPLOYED - WEATHER SEAL MADE" : "RETRACTED") : "RETRACTED",
    hull_contact_risk: contactRisk ? "BUMPER PRE-ALERT - CREEP HALTED" : "NONE",
    bumper_strip: {
      type: "DETECTION EDGE, 4-WIRE SAFETY",
      triggered: contactRisk,
      last_test: Math.random() > 0.9 ? "MONTHLY TEST OVERDUE" : "CURRENT"
    },
    drive_speed: p === "EXTENDING" ? parseFloat((3 + Math.random() * 7).toFixed(1)) : p === "ALIGNING" ? parseFloat((0.3 + Math.random() * 1.2).toFixed(1)) : 0,
    drive_speed_unit: "cm/s",
    wheel_rail_debris: Math.random() > 0.95 ? "GRAVEL ON RAIL - SWEEP ADVISED" : "CLEAR",
    timestamp: new Date().toISOString()
  };

  return sensorObject
}