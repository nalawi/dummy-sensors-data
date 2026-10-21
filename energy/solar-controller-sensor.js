function generateSensorData(sensorId, sunHour = null) {
  // === SYSTEM CONFIGURATION ===
  // 24 V lead-acid battery bank, MPPT charge controller (100 V max PV input), 1.2 kW array
  const SYS = {
    systemVoltage: 24,
    floatVoltage: 27.6,
    absorptionVoltage: 28.8,
    equalizationVoltage: 29.6,
    lvdVoltage: 22.2,           // Low Voltage Disconnect threshold
    pvMaxInput: 100.0,          // controller absolute PV input limit
    pvVoc: 92.0,                // array open-circuit voltage at 25 C
    pvRatedPower: 1200,         // array rating at STC (W)
    chargeEfficiency: 0.97,
    maxChargeCurrent: 60,       // controller charge current clamp (A)
    tempCoefficient: -0.036     // V per deg C off 25 C (temperature compensation)
  };

  // === DAY/NIGHT DETECTION ===
  // Sine irradiance curve: sunrise 06:00, sunset 18:00, peak at solar noon
  // (sunHour overrides the real clock so night/day datasets can be generated on demand)
  const now = new Date();
  const h = (sunHour !== null ? sunHour : now.getHours()) + now.getMinutes() / 60;
  const sunFraction = h > 6 && h < 18 ? Math.sin((Math.PI * (h - 6)) / 12) : 0;
  const isNight = sunFraction <= 0.02;
  const clouded = !isNight && Math.random() > 0.88; // passing cloud dims the array 30-70%
  const irradiance = isNight ? 0 : sunFraction * (clouded ? 0.3 + Math.random() * 0.4 : 1);
  const dayNightStatus = isNight ? "NIGHT" : "DAY";

  // === 1. SOLAR INPUT (PV ARRAY) ===
  // Cell temperature: ambient + solar heating. Hot panels lose voltage & efficiency.
  const ambient = 28 + Math.random() * 5;
  const pvTemp = parseFloat((ambient + irradiance * 26 + Math.random() * 2 - 1).toFixed(1));
  const thermalDerate = 1 - Math.max(0, pvTemp - 25) * 0.004; // ~0.4%/degC power loss
  const coldSpike = !isNight && Math.random() > 0.985;        // cold-morning Voc spike
  const reversePolarity = Math.random() > 0.992;              // rare wiring fault
  const pvVoltage = isNight
    ? parseFloat((0.2 + Math.random() * 1.1).toFixed(1))      // dark array residual
    : coldSpike
      ? parseFloat((SYS.pvMaxInput + Math.random() * 4).toFixed(1))
      : parseFloat((SYS.pvVoc * (0.78 + 0.06 * sunFraction) * (1 - (pvTemp - 25) * 0.0035)).toFixed(1));

  const pvPowerRaw = isNight || coldSpike || reversePolarity
    ? 0
    : SYS.pvRatedPower * irradiance * thermalDerate;
  const pvCurrent = pvPowerRaw > 0 ? parseFloat((pvPowerRaw / pvVoltage).toFixed(2)) : 0.0;
  const pvPower = parseFloat((pvVoltage * pvCurrent).toFixed(1));
  const mpptTracking = !isNight && !coldSpike && !reversePolarity;

  // Cumulative energy: sine integral of the day's harvest so far
  const dayProgress = isNight ? (h < 6 ? 0 : 1) : (1 - Math.cos((Math.PI * (h - 6)) / 12)) / 2;
  const energyToday = parseFloat((6.1 * dayProgress + Math.random() * 0.08).toFixed(2));
  const energyTotal = parseFloat((4821 + energyToday).toFixed(2));

  // === 2. BATTERY STORAGE ===
  // SoC follows the daily cycle: drained overnight, recharged through the day
  let soc = isNight
    ? (h >= 18 ? 88 - (h - 18) * 3 : 70 - h * 4)
    : 46 + 53 * dayProgress;
  soc = Math.max(8, Math.min(100, Math.round(soc + Math.random() * 4 - 2)));

  const equalizeDay = !isNight && soc > 90 && Math.random() > 0.98;
  let chargeStage;
  if (isNight) chargeStage = "IDLE - NIGHT";
  else if (pvPower < 5) chargeStage = "IDLE - LOW PV";
  else if (equalizeDay) chargeStage = "EQUALIZATION";
  else if (soc > 97) chargeStage = "FLOAT";
  else if (soc > 80) chargeStage = "ABSORPTION";
  else chargeStage = "BULK";

  // Remote NTC reading drives the dynamic charge-limit compensation
  const batteryTemp = parseFloat((ambient + Math.random() * 3 + (chargeStage === "BULK" ? 1.5 : 0.5)).toFixed(1));
  const tempCompensation = parseFloat(((batteryTemp - 25) * SYS.tempCoefficient).toFixed(3));
  const stageSetpoint = chargeStage === "FLOAT" ? SYS.floatVoltage
    : chargeStage === "ABSORPTION" ? SYS.absorptionVoltage
    : chargeStage === "EQUALIZATION" ? SYS.equalizationVoltage
    : chargeStage === "BULK" ? SYS.absorptionVoltage
    : null;
  const chargeSetpoint = stageSetpoint === null ? null : parseFloat((stageSetpoint + tempCompensation).toFixed(2));

  // === 3. LOAD OUTPUT (DC LOAD TERMINALS) ===
  const eveningPeak = isNight && h >= 18 && h < 22; // lighting + night operations
  let loadDemand = 1.2 + Math.random() * 2.5 + (isNight ? 0.6 : 1.2) + (eveningPeak ? 3.5 : 0);
  if (Math.random() > 0.9) loadDemand += 6 + Math.random() * 8; // motor/compressor inrush
  const overcurrent = loadDemand > 25;                          // short-circuit / overload trip
  const lvdActive = isNight && soc < 30 && Math.random() > 0.97; // overnight deep-discharge disconnect
  const loadConnected = !overcurrent && !lvdActive;

  // Battery voltage: open-circuit curve vs SoC, lifted to the stage setpoint while charging
  const ocv = 23.0 + soc * 0.026;
  let batteryVoltage;
  if (chargeStage === "ABSORPTION" || chargeStage === "FLOAT" || chargeStage === "EQUALIZATION") {
    batteryVoltage = chargeSetpoint + Math.random() * 0.1;
  } else if (chargeStage === "BULK") {
    batteryVoltage = Math.min(chargeSetpoint, ocv + 0.9) + Math.random() * 0.15;
  } else {
    batteryVoltage = ocv - (loadConnected ? loadDemand * 0.03 : 0) + Math.random() * 0.12;
  }
  batteryVoltage = parseFloat(Math.max(batteryVoltage, SYS.lvdVoltage - 0.8).toFixed(2));

  const loadCurrent = loadConnected ? parseFloat(loadDemand.toFixed(2)) : 0.0;
  const loadVoltage = loadConnected
    ? parseFloat(Math.max(21.5, batteryVoltage - loadCurrent * 0.04).toFixed(2))
    : parseFloat(batteryVoltage.toFixed(2)); // open terminals read the battery bus
  const loadPower = loadConnected ? parseFloat((loadVoltage * loadCurrent).toFixed(1)) : 0.0;
  const loadEnergyToday = parseFloat((0.9 + h * 0.09 + Math.random() * 0.05).toFixed(2));
  const loadEnergyTotal = parseFloat((812 + loadEnergyToday).toFixed(2));

  // Net battery current: charge inflow minus load draw (positive = charging, negative = discharging)
  const chargeInflow = pvPower > 0 ? (pvPower * SYS.chargeEfficiency) / batteryVoltage : 0;
  const loadDraw = loadConnected ? loadPower / batteryVoltage : 0;
  let batteryCurrent = chargeInflow - loadDraw;
  if (batteryCurrent > SYS.maxChargeCurrent) batteryCurrent = SYS.maxChargeCurrent;
  if (chargeStage === "ABSORPTION" || chargeStage === "FLOAT") batteryCurrent = Math.min(batteryCurrent, 4.5 + Math.random() * 2);
  if (chargeStage === "EQUALIZATION") batteryCurrent = Math.min(batteryCurrent, 12);
  batteryCurrent = parseFloat(Math.max(batteryCurrent, -40).toFixed(2));

  // === 4. CONTROLLER DIAGNOSTICS ===
  // Heatsink temperature drives fan cooling and MPPT thermal derating
  const controllerTemp = parseFloat((ambient + (pvPower / 1000) * 14 + loadCurrent * 0.25 + Math.random() * 3).toFixed(1));
  const coolingFan = controllerTemp > 60;
  const thermalDerating = controllerTemp > 78;

  const FAULTS = [
    { bit: 1,  name: "PV OVERVOLTAGE",              active: coldSpike },
    { bit: 2,  name: "BATTERY OVERVOLTAGE",         active: batteryVoltage > 30.5 },
    { bit: 4,  name: "BATTERY UNDERVOLTAGE - LVD",  active: lvdActive },
    { bit: 8,  name: "LOAD OVERCURRENT / SHORT",    active: overcurrent },
    { bit: 16, name: "REVERSE POLARITY",            active: reversePolarity },
    { bit: 32, name: "THERMAL DERATING",            active: thermalDerating }
  ];
  const faultCode = FAULTS.reduce((code, f) => code + (f.active ? f.bit : 0), 0);
  const faultFlags = FAULTS.filter((f) => f.active).map((f) => f.name);

  const sensorObject = {
    sensor_id: sensorId,
    controller_type: "MPPT",
    system_voltage: SYS.systemVoltage,
    system_voltage_unit: "V",

    // --- 1. Solar input (PV array) ---
    pv_voltage: pvVoltage,
    pv_voltage_unit: "V",
    pv_current: pvCurrent,
    pv_current_unit: "A",
    pv_power: pvPower,
    pv_power_unit: "W",
    pv_irradiance: parseFloat((irradiance * 100).toFixed(1)),
    pv_irradiance_unit: "%",
    pv_temperature: pvTemp,
    pv_temperature_unit: "C",
    mppt_tracking: mpptTracking,
    energy_today: energyToday,
    energy_today_unit: "kWh",
    energy_total: energyTotal,
    energy_total_unit: "kWh",

    // --- 2. Battery storage ---
    battery_voltage: batteryVoltage,
    battery_voltage_unit: "V",
    battery_current: batteryCurrent,
    battery_current_unit: "A",
    battery_current_sign: "+ charging / - discharging",
    battery_temperature: batteryTemp,
    battery_temperature_unit: "C",
    battery_soc: soc,
    battery_soc_unit: "%",
    charge_stage: chargeStage,
    charge_setpoint: chargeSetpoint,
    charge_setpoint_unit: "V",
    temperature_compensation: tempCompensation,
    temperature_compensation_unit: "V",
    lvd_threshold: SYS.lvdVoltage,
    lvd_threshold_unit: "V",

    // --- 3. Load output (DC load terminals) ---
    load_voltage: loadVoltage,
    load_voltage_unit: "V",
    load_current: loadCurrent,
    load_current_unit: "A",
    load_power: loadPower,
    load_power_unit: "W",
    load_connected: loadConnected,
    load_energy_today: loadEnergyToday,
    load_energy_today_unit: "kWh",
    load_energy_total: loadEnergyTotal,
    load_energy_total_unit: "kWh",

    // --- 4. Controller diagnostics & status ---
    controller_temperature: controllerTemp,
    controller_temperature_unit: "C",
    cooling_fan_active: coolingFan,
    thermal_derating: thermalDerating,
    day_night_status: dayNightStatus,
    pv_below_threshold: isNight,
    fault_code: faultCode,
    fault_flags: faultFlags,
    fault_status: faultFlags.length ? "FAULT - " + faultFlags.join(" | ") : "NORMAL",

    timestamp: now.toISOString()
  };

  return sensorObject
}