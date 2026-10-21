function generateSensorData(sensorId, maxGforce = 2.0) {
  // Simulate acceleration along each axis within +/- maxGforce (g)
  // When idle, readings hover near 0 (flat) or ~1 g on one axis (gravity/orientation)
  const randomAxis = () => parseFloat((Math.random() * (maxGforce * 2) - maxGforce).toFixed(2));
  
  // Compute total acceleration magnitude and classify activity intensity
  const axes = { x: randomAxis(), y: randomAxis(), z: randomAxis() };
  const totalGforce = Math.sqrt(axes.x ** 2 + axes.y ** 2 + axes.z ** 2);
  const activity = totalGforce < 0.5 ? "IDLE" : totalGforce < 1.5 ? "MODERATE" : "HIGH";
  
  const sensorObject = {
    sensor_id: sensorId,
    acceleration: axes,
    unit: "g",
    total_gforce: parseFloat(totalGforce.toFixed(2)),
    activity_level: activity,
    timestamp: new Date().toISOString()
  };

  return sensorObject
}