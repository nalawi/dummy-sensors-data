function generateSensorData(sensorId, fluid = "crude_oil", processTempC = 25.0) {
  // Recipe targets: nominal viscosity (cP), density (g/cm³), max allowed turbidity (NTU), viscosity temp coefficient
  const recipes = {
    crude_oil:    { viscosity: 120,  density: 0.88, maxTurbidity: 800, tempCoeff: 0.020 },
    refined_oil:  { viscosity: 45,   density: 0.85, maxTurbidity: 50,  tempCoeff: 0.015 },
    polymer:      { viscosity: 2500, density: 1.12, maxTurbidity: 200, tempCoeff: 0.030 },
    solvent:      { viscosity: 0.6,  density: 0.79, maxTurbidity: 5,   tempCoeff: 0.005 },
    chemical_mix: { viscosity: 180,  density: 1.05, maxTurbidity: 100, tempCoeff: 0.020 }
  };
  const recipe = recipes[fluid] || recipes.crude_oil;
  
  // Viscosity falls as temperature rises (exponential model around the 25°C reference)
  const expectedViscosity = recipe.viscosity * Math.exp(-recipe.tempCoeff * (processTempC - 25.0));
  
  // Batch-to-batch scatter around the temperature-adjusted target; ~10% of batches drift out of band
  const offSpecBatch = Math.random() > 0.9;
  const scatter = offSpecBatch ? 12 + Math.random() * 13 : Math.random() * 5;
  const viscosityCp = parseFloat((expectedViscosity * (1 + (Math.random() * 2 - 1) * scatter / 100)).toFixed(2));
  
  // Density thins slightly with temperature (~0.0007 g/cm³ per °C) plus batch variation
  const densityGcm3 = parseFloat((recipe.density - 0.0007 * (processTempC - 25.0) + (Math.random() * 0.03 - 0.015)).toFixed(3));
  
  // Kinematic viscosity from density (cSt = cP / specific gravity)
  const kinematicCst = parseFloat((viscosityCp / densityGcm3).toFixed(2));
  
  // Simulate turbidity — most batches sit well under the recipe ceiling; ~10% drift over it
  const overSpec = Math.random() > 0.9;
  const turbidity = overSpec
    ? parseFloat((recipe.maxTurbidity * (1.05 + Math.random() * 0.5)).toFixed(1))
    : parseFloat((recipe.maxTurbidity * Math.random() * 0.7).toFixed(1));
  
  // How far viscosity sits from the temperature-adjusted recipe target (%) — the consistency metric
  const viscosityDeviation = parseFloat((((viscosityCp - expectedViscosity) / expectedViscosity) * 100).toFixed(1));
  
  // Recipe consistency verdict for process control
  const viscosityInSpec = Math.abs(viscosityDeviation) <= 10;
  const clarityInSpec = turbidity <= recipe.maxTurbidity;
  const recipeStatus = viscosityInSpec && clarityInSpec
    ? "RECIPE IN SPEC"
    : !viscosityInSpec && !clarityInSpec
      ? "OUT OF SPEC - VISCOSITY & CLARITY"
      : !viscosityInSpec
        ? "OUT OF SPEC - VISCOSITY"
        : "OUT OF SPEC - CLARITY";
  
  const sensorObject = {
    sensor_id: sensorId,
    fluid: fluid,
    process_temperature: processTempC,
    temperature_unit: "°C",
    turbidity: turbidity,
    turbidity_unit: "NTU",
    turbidity_limit: recipe.maxTurbidity,
    dynamic_viscosity: viscosityCp,
    viscosity_unit: "cP",
    kinematic_viscosity: kinematicCst,
    kinematic_unit: "cSt",
    density: densityGcm3,
    density_unit: "g/cm³",
    viscosity_deviation_percent: viscosityDeviation,
    recipe_status: recipeStatus,
    timestamp: new Date().toISOString()
  };

  return sensorObject
}