# Custom JavaScript Dummy Data

A collection of **62 standalone sensor simulators** across **18 domains**, each generating realistic dummy data as plain JavaScript objects. No dependencies, no build step — every file is a single function you can drop into any project, test harness, mock server, or dashboard prototype.

Every simulator follows the same shape as the original [`temperature-sensor.js`](#usage): a `generateSensorData()` function that returns an object with a `sensor_id`, domain-specific readings, `_unit`-suffixed metadata fields, and an ISO-8601 `timestamp`.

## Usage

Each file exposes one function. Load a file and call it with a sensor ID:

```js
// temperature-sensor.js
function generateSensorData(sensorId, minTemp = 18.0, maxTemp = 30.0) {
  const randomTemp = (Math.random() * (maxTemp - minTemp) + minTemp).toFixed(2);

  const sensorObject = {
    sensor_id: sensorId,
    temperature: parseFloat(randomTemp),
    unit: "Celsius",
    timestamp: new Date().toISOString()
  };

  return sensorObject
}
```

```js
const fs = require("fs");

// Evaluate the file, then call the function
(0, eval)(fs.readFileSync("./environmental/temperature-sensor.js", "utf8"));
console.log(generateSensorData("TEMP-A3"));
// { sensor_id: 'TEMP-A3', temperature: 24.37, unit: 'Celsius', timestamp: '2026-10-21T07:41:00.000Z' }

// With overrides
generateSensorData("TEMP-A3", 2.0, 8.0);   // cold-chain fridge range
```

### Calling conventions

All files share the `generateSensorData(sensorId, ...)` signature. The remaining parameters vary by domain (full list per file in the [catalog](#catalog)):

| Style | Example | Behavior |
|---|---|---|
| **Scenario / state keyword** | `mode = "auto"`, `scenario = "auto"`, `weather`, `skyCondition`, `phase`, `field`, `flow`, `condition`, `alarmMode` | Event-driven sensors. `"auto"` randomly picks mostly-nominal states with a realistic chance of events; an explicit keyword forces a scenario (e.g. `"cut"`, `"breach"`, `"climb"`, `"tunneling"`). |
| **Min/max range** | `minTemp`/`maxTemp`, `minHumidity`/`maxHumidity`, `minPressure`/`maxPressure`… | Simple analog sensors — the pair bounds the simulated reading. |
| **Numeric config** | `range = 40` (km), `maxGforce`, `maxLoadKw`, `maxRate`, `capacityKg`, `tankHeight`, `detectionChance`, `sunHour` | Single knobs that scale the simulated output. |
| **Domain config** | `machineType`/`health`, `fluid`/`processTempC`, `application`, `taughtColor`, `technology`, `area = "RUNWAY 09L"`, `threshold = "CHECKED BAG"` | Fixture-style parameters where the configuration itself defines the reading. |

### Output conventions

- **`sensor_id`** — pass-through of the first argument.
- **`timestamp`** — `new Date().toISOString()` at generation time.
- **`*_unit` suffixes** — every numeric field carries its unit as an adjacent sibling key (e.g. `rx_level` / `rx_level_unit: "dBm"`), so consumers never guess.
- **Physics-anchored values** — readings reflect real device behavior: RCS targets in dBsm, bridge loss in dB, guard bands in newtons, AGC settle behavior, false-alarm sources (rain, birds, frost, thermal drift), and health/maintenance notes sprinkled in at realistic failure rates.
- **`null` for not-applicable** — fields that only exist during an event are `null` in the clear state.

## Catalog

Signatures below are exactly as implemented in each file.

### `environmental/` — ambient conditions
| File | Simulates | Signature |
|---|---|---|
| `temperature-sensor.js` | Temperature probe | `(sensorId, minTemp = 18.0, maxTemp = 30.0)` |
| `humidity-sensor.js` | Relative humidity | `(sensorId, minHumidity = 30.0, maxHumidity = 60.0)` |
| `light-sensor.js` | Ambient lux | `(sensorId, minLux = 0.0, maxLux = 100000.0)` |

### `gas-safety/` — air quality & fire
| File | Simulates | Signature |
|---|---|---|
| `gas-air-quality-sensor.js` | CO₂ / gas concentration | `(sensorId, minGas = 350.0, maxGas = 2000.0)` |
| `smoke-sensor.js` | Smoke density | `(sensorId, minSmoke = 0.0, maxSmoke = 50.0)` |

### `industrial-process/` — process industry
| File | Simulates | Signature |
|---|---|---|
| `pressure-sensor.js` | Process pressure | `(sensorId, minPressure = 50.0, maxPressure = 150.0)` |
| `flow-sensor.js` | Pipe flow | `(sensorId, sensorType = "electromagnetic", fluid = "water", pipeDnMm = 100)` |
| `level-sensor.js` | Tank level | `(sensorId, tankHeight = 300.0, material = "liquid")` |

### `water-quality/` — liquid analysis
| File | Simulates | Signature |
|---|---|---|
| `water-quality-sensor.js` | pH / water quality | `(sensorId, minPH = 6.5, maxPH = 8.5)` |
| `turbidity-viscosity-sensor.js` | Turbidity & viscosity | `(sensorId, fluid = "crude_oil", processTempC = 25.0)` |

### `force-torque/` — mechanical load
| File | Simulates | Signature |
|---|---|---|
| `load-cell-sensor.js` | Weight/force | `(sensorId, capacityKg = 500.0, application = "scale")` |
| `torque-sensor.js` | Fastening torque | `(sensorId, nominalTorqueNm = 5.0, tolerancePercent = 10.0, application = "screwdriver")` |

### `inertial/` — motion
| File | Simulates | Signature |
|---|---|---|
| `accelerometer-sensor.js` | Acceleration | `(sensorId, maxGforce = 2.0)` |
| `gyroscope-sensor.js` | Angular rate | `(sensorId, maxRate = 50.0)` |

### `position-encoders/` — position & motion control
| File | Simulates | Signature |
|---|---|---|
| `rotary-encoder-sensor.js` | Shaft position | `(sensorId, resolutionPpr = 3600, application = "packaging")` |
| `limit-switch-sensor.js` | End-of-travel state | `(sensorId, application = "crane_travel")` |

### `presence-detection/` — occupancy
| File | Simulates | Signature |
|---|---|---|
| `proximity-sensor.js` | Object proximity | `(sensorId, minDistance = 2.0, maxDistance = 200.0, technology = "ultrasonic")` |
| `motion-sensor.js` | Motion events | `(sensorId, detectionChance = 0.3)` |

### `optical-vision/` — imaging
| File | Simulates | Signature |
|---|---|---|
| `image-sensor.js` | Camera frame metadata | `(sensorId, resolution = "1920x1080")` |
| `color-contrast-sensor.js` | Color/contrast detection | `(sensorId, application = "sorting", taughtColor = "red")` |

### `machine-monitoring/` — condition monitoring
| File | Simulates | Signature |
|---|---|---|
| `vibration-sensor.js` | Machinery vibration | `(sensorId, machineType = "motor", health = "normal")` |
| `acoustic-emission-sensor.js` | Ultrasonic emissions | `(sensorId, condition = "normal")` |

### `biomedical/` — health
| File | Simulates | Signature |
|---|---|---|
| `biomedical-sensor.js` | Patient vitals | `(sensorId, patientState = "resting")` |

### `energy/` — power & solar
| File | Simulates | Signature |
|---|---|---|
| `energy-sensor.js` | Load/power consumption | `(sensorId, maxLoadKw = 50.0)` |
| `solar-controller-sensor.js` | PV array output | `(sensorId, sunHour = null)` |

### `air-traffic-runway/` — airport airside (7 sensors)
| File | Simulates | Signature |
|---|---|---|
| `runway-surface-sensor.js` | Runway surface condition | `(sensorId, weather = "auto")` |
| `runway-wind-sensor.js` | Wind sock / AWOS | `(sensorId, weather = "auto")` |
| `rvr-transmissometer.js` | Runway visual range | `(sensorId, weather = "auto")` |
| `laser-ceilometer.js` | Cloud base height | `(sensorId, skyCondition = "auto")` |
| `surface-movement-radar.js` | Taxiway surface movement | `(sensorId, area = "RUNWAY 09L")` |
| `adsb-receiver.js` | ADS-B aircraft tracks | `(sensorId, range = 40)` — km reception radius |
| `fod-detection-sensor.js` | Foreign object debris | `(sensorId, area = "RUNWAY 09L")` |

### `terminal-baggage/` — baggage handling (5 sensors)
| File | Simulates | Signature |
|---|---|---|
| `barcode-scanner.js` | Bag tag read events | `(sensorId, flow = "normal")` |
| `rfid-antenna.js` | UHF RFID bag reads | `(sensorId, field = "normal")` |
| `xray-ct-sensor.js` | Checked-bag CT scanner | `(sensorId, alarmMode = "auto")` |
| `loop-photoelectric-sensor.js` | Inductive loop bag presence | `(sensorId, mode = "auto")` |
| `dimensioning-sensor.js` | Bag size/weight dimensioner | `(sensorId, threshold = "CHECKED BAG")` |

### `passenger-flow/` — passenger processing (4 sensors)
| File | Simulates | Signature |
|---|---|---|
| `biometric-egate.js` | Border-control e-gate | `(sensorId, scenario = "auto")` |
| `lidar-people-counter.js` | Queue/flow counting | `(sensorId, scenario = "auto")` |
| `thermal-scanner.js` | Fever screening | `(sensorId, scenario = "auto")` |
| `gcms-trace-detector.js` | Explosives trace detection | `(sensorId, scenario = "auto")` |

### `apron-docking/` — stand & dock guidance (3 sensors)
| File | Simulates | Signature |
|---|---|---|
| `avdgs-docking-sensor.js` | Aircraft docking guidance | `(sensorId, phase = "auto")` |
| `pbb-proximity-sensor.js` | Passenger boarding bridge | `(sensorId, phase = "auto")` |
| `ground-loop-detector.js` | Stand entry loop | `(sensorId, mode = "auto")` |

### `perimeter-security/` — fence & zone intrusion (6 sensors)
| File | Simulates | Signature & forced scenarios |
|---|---|---|
| `fos-cable-sensor.js` | Fiber-optic fence cable (C-OTDR) | `(sensorId, mode = "auto")` — `CLIMB`, `CUT`, `LIFT` |
| `leaky-coax-sensor.js` | Buried RF field cable | `(sensorId, mode = "auto")` — `BREACH` |
| `air-beam-sensor.js` | Active IR beam curtain | `(sensorId, mode = "auto")` — `BREAK` |
| `perimeter-radar.js` | FMCW surveillance radar | `(sensorId, mode = "auto")` — `INTRUDER`, `VEHICLE`, `FLOCK` |
| `seismic-geophone.js` | Buried geophone array | `(sensorId, mode = "auto")` — `FOOTSTEPS`, `DIGGING`, `TUNNELING`, `VEHICLE` |
| `taut-wire-sensor.js` | Taut-wire strain posts | `(sensorId, mode = "auto")` — `CLIMB`, `PARTED`, `PRESSURE` |

### `smart-building/` — intelligent building systems (12 sensors)
| File | Simulates | Signature & forced scenarios |
|---|---|---|
| `hvac-temperature-sensor.js` | Zone HVAC temperature + VAV damper | `(sensorId, mode = "auto")` — `OCCUPIED`, `UNOCCUPIED` |
| `humidity-sensor.js` | RH + mold-risk management | `(sensorId, mode = "auto")` — `TOO_DRY`, `TOO_HUMID`, `ALERT_MOLD_RISK` |
| `air-quality-sensor.js` | CO₂/VOC/PM2.5 IAQ + DCV | `(sensorId, mode = "auto")` — `POOR`, `FORGET_AIR` |
| `light-sensor.js` | Daylight lux + glare/blinds | `(sensorId, mode = "auto")` — `OVERCAST`, `SUNNY`, `GLARE_EVENT` |
| `motion-pir-sensor.js` | PIR occupancy + relay logic | `(sensorId, mode = "auto")` — `MOTION`, `WALK_THROUGH`, `SUSTAINED_PRESENCE` |
| `people-counter-sensor.js` | Thermal-array people counting | `(sensorId, mode = "auto")` — `QUEUE_BUILDING`, `CAPACITY_ALERT`, `EMPTY` |
| `contact-sensor.js` | Reed door/window/cabinet contact | `(sensorId, mode = "auto")` — `OPEN`, `OPEN_LONG`, `TAMPER` |
| `energy-meter-sensor.js` | Branch-circuit kWh metering | `(sensorId, load = "auto")` — `STEADY`, `LUMPY`, `EXPORT` |
| `water-leak-sensor.js` | Leak rope (weep vs flood) | `(sensorId, mode = "auto")` — `WEEP`, `FLOOD`, `WIRE_FAULT` |
| `gas-detector-sensor.js` | Combustible %LEL + CO safety | `(sensorId, mode = "auto")` — `CO_ELEVATED`, `GAS_LEL_RISING`, `ALARM_LIKELY_LEAK` |
| `smoke-fire-sensor.js` | Photoelectric smoke + ROR heat | `(sensorId, mode = "auto")` — `SMOKE_GROWING`, `HEAT_SPIKE`, `FIRE_CONFIRMED` |
| `vibration-pressure-sensor.js` | Pump/fan vibration + duct DP | `(sensorId, mode = "auto")` — `WATCH`, `DEFECT_DEVELOPING`, `ALARM_VIBRATION` |

## Testing

No test framework is required — each file is plain script code. A quick smoke test with node:

```bash
node -e "
const fs = require('fs');
(0, eval)(fs.readFileSync('./environmental/temperature-sensor.js', 'utf8'));
console.log(generateSensorData('TEMP-01'));
"
```

For scenario-style sensors, force an event by passing the keyword:

```bash
node -e "
const fs = require('fs');
(0, eval)(fs.readFileSync('./perimeter-security/fos-cable-sensor.js', 'utf8'));
console.log(generateSensorData('FOS-01', 'cut'));
"
```

## Notes

- **Determinism**: outputs use `Math.random()`, so results differ per call. Seed/mock at a higher layer if you need reproducibility.
- **Purity**: generators are read-only — no globals, I/O, or timers; safe to bundle for browsers.
- **Extending**: to add a new sensor, copy an existing file, keep the `generateSensorData(sensorId, ...)` contract, and preserve the `_unit` suffix convention.