function generateSensorData(sensorId, application = "sorting", taughtColor = "red") {
  // Packaging color library: taught RGB reflectance per SKU color and its routing bin
  const palette = {
    red:    { r: 185, g: 45,  b: 50,  bin: "BIN-A" },
    green:  { r: 50,  g: 165, b: 65,  bin: "BIN-B" },
    blue:   { r: 45,  g: 65,  b: 195, bin: "BIN-C" },
    yellow: { r: 225, g: 205, b: 45,  bin: "BIN-D" },
    white:  { r: 235, g: 235, b: 230, bin: "BIN-E" }
  };
  const reference = palette[taughtColor] || palette.red;
  
  // Specialized light frequencies per application (emitter wavelength sets)
  const emitters = {
    sorting:        "RGB LED bank (625/530/470 nm)",
    mark_detection: "660 nm red laser spot",
    orientation:    "RGB LED bank (625/530/470 nm)"
  };
  
  // Photodiode noise (±10 counts) clamped to the 8-bit range
  const noise = () => Math.round(Math.random() * 20 - 10);
  const clamp = (v) => Math.max(0, Math.min(255, v));
  
  // ~20% of scans see no product under the light spot
  const productPresent = Math.random() > 0.2;
  
  // Passing products match the taught SKU ~85% of the time; the rest are other SKUs
  const scannedColor = productPresent
    ? (Math.random() > 0.15 ? taughtColor : Object.keys(palette)[Math.floor(Math.random() * Object.keys(palette).length)])
    : null;
  const target = scannedColor ? palette[scannedColor] : null;
  
  const r = target ? clamp(target.r + noise()) : Math.round(20 + Math.random() * 25);
  const g = target ? clamp(target.g + noise()) : Math.round(20 + Math.random() * 25);
  const b = target ? clamp(target.b + noise()) : Math.round(20 + Math.random() * 25);
  
  // Delta-E vs the taught reference (RGB euclidean distance) — the color-match metric
  const deltaE = parseFloat(Math.sqrt((r - reference.r) ** 2 + (g - reference.g) ** 2 + (b - reference.b) ** 2).toFixed(1));
  
  // Match verdict vs taught tolerance; unmatched SKUs divert to the reject lane
  const tolerance = 30.0;
  const colorMatched = productPresent && deltaE <= tolerance;
  
  // Registration mark: dark mark on light film, read for contrast and position offset
  const markPresent = application === "mark_detection" && Math.random() > 0.15;
  const markContrast = markPresent ? parseFloat((45 + Math.random() * 45).toFixed(1)) : parseFloat((Math.random() * 15).toFixed(1));
  const markDetected = markContrast >= 40.0;
  const markOffset = markPresent ? parseFloat((Math.random() * 6 - 3).toFixed(2)) : null;
  
  // Orientation tab: colored corner tab snapped to a quadrant heading; ~5% arrive skewed
  const orientationApp = application === "orientation";
  const skewRoll = Math.random();
  const jitter = orientationApp ? (skewRoll > 0.95 ? Math.random() * 20 - 10 : Math.random() * 6 - 3) : null;
  const tabAngle = orientationApp ? Math.floor(Math.random() * 4) * 90 + jitter : null;
  const snapped = tabAngle !== null ? Math.round(tabAngle / 90) * 90 : null;
  const orientationValid = tabAngle !== null ? Math.abs(tabAngle - snapped) <= 5 : null;
  
  // Routing decision per application mode
  const sortDecision = !productPresent
    ? "NO PRODUCT - HOLD"
    : application === "mark_detection"
      ? (markDetected ? "MARK FOUND - ADVANCE" : "MARK MISSING - FLAG")
      : application === "orientation"
        ? (orientationValid ? "ORIENTATION OK - PASS" : "SKEWED - REORIENT")
        : colorMatched ? reference.bin : "REJECT LANE";
  
  const scanRate = application === "mark_detection" ? 5000 : 2000;
  
  const sensorObject = {
    sensor_id: sensorId,
    application: application,
    emitter: emitters[application] || emitters.sorting,
    product_detected: productPresent,
    red_channel: r,
    green_channel: g,
    blue_channel: b,
    channel_unit: "8-bit counts",
    taught_color: taughtColor,
    delta_e: productPresent ? deltaE : null,
    delta_e_tolerance: tolerance,
    color_matched: colorMatched,
    sort_decision: sortDecision,
    scan_rate: scanRate,
    scan_rate_unit: "Hz",
    timestamp: new Date().toISOString()
  };
  
  if (application === "mark_detection") {
    sensorObject.mark_present = markPresent;
    sensorObject.mark_contrast = markContrast;
    sensorObject.contrast_unit = "percent";
    sensorObject.mark_detected = markDetected;
    sensorObject.mark_offset = markOffset;
    sensorObject.offset_unit = "mm";
  }
  
  if (orientationApp) {
    sensorObject.tab_angle = parseFloat(tabAngle.toFixed(1));
    sensorObject.orientation = ((snapped % 360) + 360) % 360 + " deg";
    sensorObject.orientation_valid = orientationValid;
    sensorObject.orientation_status = orientationValid ? "ORIENTATION OK" : "SKEWED - REORIENT";
  }

  return sensorObject
}