function generateSensorData(sensorId, resolution = "1920x1080") {
  // Simulate scene lighting conditions that drive camera settings (0 = dark, 1 = bright)
  const lightLevel = Math.random();
  
  // Dim scenes need longer exposure and higher ISO (sensor gain), like real cameras
  const exposureMs = parseFloat((1 + (1 - lightLevel) * 29).toFixed(2)); // 1-30 ms
  const isoOptions = [100, 200, 400, 800, 1600, 3200];
  const isoIndex = Math.min(Math.floor((1 - lightLevel) * isoOptions.length), isoOptions.length - 1);
  const iso = isoOptions[isoIndex];
  
  // Derive the compressed frame size in KB from the pixel count (JPEG ~0.05-0.15 bytes/pixel)
  const [width, height] = resolution.split("x").map(Number);
  const imageSize = parseFloat(((width * height * 3 * (0.05 + Math.random() * 0.1)) / 1024).toFixed(2));
  
  // Higher ISO introduces noise, lowering frame quality (percentage)
  const frameQuality = Math.max(50, Math.round(95 - isoIndex * 5 + (Math.random() * 10 - 5)));
  
  // Simulate detection results for surveillance, automated inspection, or medical analysis
  const objectsDetected = Math.floor(Math.random() * 5);
  
  const sensorObject = {
    sensor_id: sensorId,
    resolution: resolution,
    exposure_time_ms: exposureMs,
    iso: iso,
    image_size: imageSize,
    unit: "KB",
    frame_quality: frameQuality,
    objects_detected: objectsDetected,
    timestamp: new Date().toISOString()
  };

  return sensorObject
}