function generateSensorData(sensorId, mode = "auto") {
  // Compact FMCW unit sweeps 24 GHz across the cleared zone; doppler and
  // range-Doppler maps classify crawlers, walkers, vehicles and flocking
  // birds out to km-scale, immune to darkness, fog and fence-line clutter
  const event = mode === "auto" ? (Math.random() > 0.9 ? ["INTRUDER", "VEHICLE", "FLOCK"][Math.floor(Math.random() * 3)] : "CLEAR") : mode.toUpperCase();
  const active = event !== "CLEAR";

  // Track set: radar maintains multiple simultaneous tracks with kinematics
  const trackCount = active ? (event === "FLOCK" ? 3 + Math.floor(Math.random() * 6) : 1 + Math.floor(Math.random() * 2)) : 0;
  const tracks = [];
  for (let i = 0; i < trackCount; i++) {
    const isVehicle = event === "VEHICLE";
    const isBird = event === "FLOCK";
    const range = parseFloat((0.1 + Math.random() * 1.9).toFixed(2)); // km
    const speedKmh = isVehicle ? 15 + Math.random() * 45 : isBird ? 25 + Math.random() * 30 : 1.5 + Math.random() * 5.5;
    const bearing = parseFloat((Math.random() * 90 - 45).toFixed(1)); // deg off boresight
    const rcs = isVehicle ? 10 + Math.random() * 30 : isBird ? -25 + Math.random() * 12 : -14 + Math.random() * 10; // dBsm
    tracks.push({
      track_id: "TRK-" + Math.floor(Math.random() * 1e4),
      range: range,
      range_unit: "km",
      bearing: bearing,
      bearing_unit: "deg off boresight",
      speed: parseFloat(speedKmh.toFixed(1)),
      speed_unit: "km/h",
      heading: parseFloat((Math.random() * 360).toFixed(0)),
      heading_unit: "deg true (motion vector)",
      rcs: parseFloat(rcs.toFixed(1)),
      rcs_unit: "dBsm (human ~ -14, vehicle ~ +15, bird ~ -20)",
      classification: isVehicle ? "GROUND VEHICLE" : isBird ? "BIRD (BIOLOGICAL)" : event === "INTRUDER" ? (Math.random() > 0.75 ? "CRAWLER (PRONE PROFILE)" : "WALKING HUMAN") : "UNCERTAIN",
      inbound: Math.random() > 0.5,
      eta_to_fence: parseFloat(((range / Math.max(speedKmh, 1)) * 60).toFixed(1)),
      eta_to_fence_unit: "min at current vector"
    });
  }

  // Clutter map: static returns (fence posts, signs, haystacks) are
  // learned at commissioning and doppler-filtered out
  const rainClutter = Math.random() > 0.85; // rain returns as volumetric clutter
  const gateThreshold = rainClutter ? -18 : -22; // dBsm; auto-raised in rain

  const sensorObject = {
    sensor_id: sensorId,
    sensor_type: "FMCW Ground-Based Perimeter Surveillance Radar",
    coverage: {
      range_max: 2.0,
      range_max_unit: "km (human @ -14 dBsm); 4.5 km vehicle-class",
      azimuth: 90,
      azimuth_unit: "deg sector (mechanical slew to other sectors)",
      elevation: 8,
      elevation_unit: "deg (low-grazing fan for crawl coverage)",
      update_rate: 20,
      update_rate_unit: "Hz sector scan"
    },
    rf: {
      band: "K-BAND 24.05-24.25 GHz (ISM/license-free)",
      waveform: "FMCW SAWTOOTH CHIRP",
      tx_power: 18,
      tx_power_unit: "dBm (+ EIRP via 30 dBi panel)",
      prf_beam_steering: "NONE (fixed fan, freq-scanned elevation)"
    },
    alarm_state: event !== "CLEAR" && event !== "FLOCK" ? "ALARM" : event === "FLOCK" ? "ADVISORY" : "CLEAR",
    track_count: trackCount,
    tracks: tracks,
    alarm_classification: event === "FLOCK" ? "IGNORED - BIOLOGICAL MASS DISTRIBUTION" : event === "CLEAR" ? "NONE" : event,
    response_note: event === "VEHICLE" ? "RAM-GATE PROTOCOL ARMED - BOLLARDS STANDBY" : event === "INTRUDER" ? "CCTV HANDOFF + PATROL DISPATCH" : event === "FLOCK" ? "BIRD-STRIKE HAZARD LOGGED FOR WILDLIFE OPS" : null,
    processing: {
      clutter_map: "LEARNED STATIC MAP ACTIVE (POSTS, SIGNS, GRASS BUNDLES)",
      mtd_filter: "DOPPLER FAST-TIME (REJECTS < 0.5 m/s FOLIAGE MOTION)",
      detection_threshold: gateThreshold,
      detection_threshold_unit: "dBsm auto-gate (raised for rain clutter)",
      rain_clutter_active: rainClutter
    },
    health: {
      receiver_noise_floor: parseFloat((-94 + Math.random() * 4).toFixed(1)),
      receiver_noise_floor_unit: "dBm (spec -90)",
      radome: Math.random() > 0.93 ? "WATER FILM ON RADOME - GRACEFUL DEGRADE" : "DRY",
      tx_monitor: "LOOPBACK SELF-TEST PASS",
      timestamp_drift_us: Math.round((Math.random() * 2 - 1) * 500)
    },
    timestamp: new Date().toISOString()
  };

  return sensorObject
}