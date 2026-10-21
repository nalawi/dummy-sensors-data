function generateSensorData(sensorId, sensorType = "electromagnetic", fluid = "water", pipeDnMm = 100) {
  // Fluid properties: density (kg/m³), dynamic viscosity (Pa·s), electrical conductivity
  const fluids = {
    water:      { density: 998,  viscosity: 0.001,   conductive: true },
    wastewater: { density: 1005, viscosity: 0.0012,  conductive: true },
    slurry:     { density: 1500, viscosity: 0.01,    conductive: true },
    oil:        { density: 850,  viscosity: 0.08,    conductive: false },
    gas:        { density: 0.85, viscosity: 0.00002, conductive: false, isGas: true }
  };
  const fluidProps = fluids[fluid] || fluids.water;
  
  // Electromagnetic meters require conductive liquids; non-conductive media needs ultrasonic
  const measurementValid = sensorType === "electromagnetic" ? fluidProps.conductive : true;
  
  // Simulate line velocity — liquids 0.5-5 m/s, gases 5-20 m/s (industrial design range)
  const velocity = fluidProps.isGas
    ? parseFloat((5 + Math.random() * 15).toFixed(2))
    : parseFloat((0.5 + Math.random() * 4.5).toFixed(2));
  
  // Volumetric flow from pipe cross-section (Q = v x A, converted to m³/h)
  const pipeDiameterM = pipeDnMm / 1000;
  const areaM2 = parseFloat((Math.PI * Math.pow(pipeDiameterM / 2, 2)).toFixed(6));
  const volumetricFlow = parseFloat((velocity * areaM2 * 3600).toFixed(2));
  
  // Mass flow via fluid density (mass = volume x ρ, kg/h)
  const massFlow = parseFloat((volumetricFlow * fluidProps.density).toFixed(2));
  
  // Reynolds number classifies the flow regime (Re = ρ x v x d / µ)
  const reynolds = Math.round(fluidProps.density * velocity * pipeDiameterM / fluidProps.viscosity);
  const flowRegime = reynolds < 2300 ? "LAMINAR" : reynolds < 4000 ? "TRANSITIONAL" : "TURBULENT";
  
  // Nominal accuracy per technology (electromagnetic is tighter than ultrasonic)
  const accuracyPercent = sensorType === "electromagnetic" ? 0.5 : 1.0;
  
  // Flow condition classification per media type
  const thresholds = fluidProps.isGas ? [2, 8, 15] : [0.3, 1, 3];
  const flowStatus = velocity < thresholds[0] ? "NO FLOW / STAGNANT" : velocity < thresholds[1] ? "LOW FLOW" : velocity <= thresholds[2] ? "NORMAL FLOW" : "HIGH FLOW";
  
  const sensorObject = {
    sensor_id: sensorId,
    sensor_type: sensorType,
    fluid: fluid,
    measurement_valid: measurementValid,
    velocity: velocity,
    velocity_unit: "m/s",
    pipe_diameter_mm: pipeDnMm,
    cross_section_m2: areaM2,
    volumetric_flow: volumetricFlow,
    volumetric_unit: "m³/h",
    mass_flow: massFlow,
    mass_unit: "kg/h",
    reynolds_number: reynolds,
    flow_regime: flowRegime,
    accuracy_percent: accuracyPercent,
    flow_status: flowStatus,
    timestamp: new Date().toISOString()
  };

  return sensorObject
}