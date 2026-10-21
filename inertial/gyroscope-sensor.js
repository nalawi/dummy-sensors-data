function generateSensorData(sensorId, maxRate = 50.0) {
  // Simulate angular velocity around each axis within +/- maxRate (°/s)
  // Lower maxRate values mimic stable devices (smartphones), higher values mimic drones/navigation
  const randomAxis = () => parseFloat((Math.random() * (maxRate * 2) - maxRate).toFixed(2));
  
  const sensorObject = {
    sensor_id: sensorId,
    angular_velocity: {
      x: randomAxis(),
      y: randomAxis(),
      z: randomAxis()
    },
    unit: "°/s",
    timestamp: new Date().toISOString()
  };

  return sensorObject
}