function generateSensorData(sensorId, application = "crane_travel") {
  // Boundary profiles: the guarded edge, safety action, and mechanical travel specs (mm, N)
  const boundaries = {
    crane_travel:  { boundary: "end-of-travel stop", maxTravel: 12, tripForce: 18, responseMs: 8 },
    overhead_door: { boundary: "door bottom limit",  maxTravel: 10, tripForce: 12, responseMs: 10 },
    robotic_arm:   { boundary: "work envelope edge", maxTravel: 8,  tripForce: 15, responseMs: 5 },
    conveyor_end:  { boundary: "jam gate stop",      maxTravel: 14, tripForce: 20, responseMs: 12 },
    elevator_shaft:{ boundary: "final landing stop", maxTravel: 16, tripForce: 25, responseMs: 6 }
  };
  const profile = boundaries[application] || boundaries.crane_travel;
  
  // Heavy-duty safety switches use NC contacts monitored on dual channels (wire-break protected)
  const contactType = "NC";
  
  // Actuation: most samples find the arm clear of the boundary; ~15% hit the trip point
  const actuated = Math.random() > 0.85;
  
  // Circuit health: rare (2%) wiring fault breaks one monitored channel
  const wireFault = Math.random() > 0.98;
  const faultedChannel = wireFault ? (Math.random() > 0.5 ? "A" : "B") : null;
  
  // Both channels follow the NC contact: closed at rest, open when the boundary is hit
  const channelA = faultedChannel === "A" ? false : !actuated;
  const channelB = faultedChannel === "B" ? false : !actuated;
  
  // The monitoring relay flags a fault when one channel opens while the other stays closed
  const circuitStatus = wireFault && channelA !== channelB ? "OPEN CIRCUIT" : "HEALTHY";
  
  // Lever travel: pretravel to the trip point, plus overtravel when the object pushes past it
  const overtravel = actuated ? parseFloat((Math.random() * (profile.maxTravel * 0.6)).toFixed(1)) : 0;
  const leverPosition = actuated ? parseFloat((3.0 + overtravel).toFixed(1)) : 0.0;
  
  // Contact force on the roller lever only while the object presses the boundary
  const actuationForce = actuated
    ? parseFloat((profile.tripForce + overtravel * 2.5).toFixed(1))
    : 0.0;
  
  // NC logic: contact closed at rest, opens when actuated to break the safety circuit
  const contactClosed = channelA && channelB;
  
  // The automated safety stop this switch commands when the boundary is reached
  const safetyAction = !actuated && channelA && channelB
    ? "NONE"
    : !actuated
      ? "SAFETY CIRCUIT FAULT - MAINTENANCE"
      : overtravel > 5.0
        ? "E-STOP TRIGGERED - OVERTRAVEL"
        : "STOP COMMANDED - BOUNDARY REACHED";
  
  // Mechanical response time + lifetime duty vs the heavy-duty cycle rating
  const responseTime = parseFloat((profile.responseMs * (0.8 + Math.random() * 0.4)).toFixed(1));
  const cycleCount = Math.floor(Math.random() * 5_000_000);
  
  const sensorObject = {
    sensor_id: sensorId,
    application: application,
    boundary: profile.boundary,
    contact_type: contactType,
    actuated: actuated,
    actuation_state: actuated ? "ACTUATED" : "CLEAR",
    lever_position: leverPosition,
    lever_unit: "mm",
    overtravel: overtravel,
    overtravel_unit: "mm",
    actuation_force: actuationForce,
    force_unit: "N",
    contact_closed: contactClosed,
    channel_a_closed: channelA,
    channel_b_closed: channelB,
    circuit_status: circuitStatus,
    safety_action: safetyAction,
    response_time: responseTime,
    response_unit: "ms",
    cycle_count: cycleCount,
    rated_cycles: 10_000_000,
    timestamp: new Date().toISOString()
  };

  return sensorObject
}