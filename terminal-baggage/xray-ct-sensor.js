function generateSensorData(sensorId, alarmMode = "auto") {
  // Multi-view X-ray + CT around the belt resolves material density (Z-effective);
  // the CT slice stack reconstructs 3D so screeners can rotate suspicious items
  const normalAtten = 0.8 + Math.random() * 2.5;   // routine organic/metal mix
  const alarming = alarmMode === "auto" ? Math.random() > 0.94 : alarmMode === "threat";

  // CT effective-Z classes: organic ~7, mixed ~10, metal ~26
  const materialMix = [
    { class: "ORGANIC", z: 6 + Math.random() * 2, frac: 0.3 + Math.random() * 0.3 },
    { class: "MIXED/INORGANIC", z: 9 + Math.random() * 3, frac: 0.2 + Math.random() * 0.3 },
    { class: "METAL", z: 22 + Math.random() * 8, frac: Math.random() * 0.2 }
  ];
  const threats = [
    { item: "LIQUID EXPLOSIVE PRECURSOR", z: 7.1, note: "VE-EXCLUSION BOTTLE" },
    { item: "DETONATOR / BLASTING CAP", z: 24.5, note: "DENSE METAL CYLINDER" },
    { item: "BULK POWDER EXPLOSIVE", z: 11.8, note: "UNUSUAL DENSITY BLOB" },
    { item: "CONTRABAND NARCOTICS", z: 6.8, note: "ORGANIC SLAB IN FALSE COMPARTMENT" },
    { item: "LOOSE LITHIUM CELLS", z: 17.0, note: "BATTERY STACK SIGNATURE" }
  ];
  const threat = threats[Math.floor(Math.random() * threats.length)];

  // TIP: Image-resolution targets inserted periodically to certify operator/screen rates
  const tipInserted = Math.random() > 0.92;

  const sensorObject = {
    sensor_id: sensorId,
    sensor_type: "Multi-View X-ray + Computed Tomography (EDS)",
    tunnel_id: "EDS-" + Math.floor(Math.random() * 12 + 1),
    beam_energy: 160,
    beam_energy_unit: "kVp",
    views: 4,
    views_unit: "projection angles (T/B/L/R)",
    conveyor_throughput: parseFloat((0.25 + Math.random() * 0.15).toFixed(2)),
    conveyor_throughput_unit: "m/s",
    bags_per_hour: Math.round(300 + Math.random() * 300),
    bags_per_hour_unit: "bags/h",
    penetration: parseFloat((28 + Math.random() * 10).toFixed(0)),
    penetration_unit: "mm steel equivalent",
    wire_resolution: Math.random() > 0.5 ? "AWG 38" : "AWG 40",
    material_discrimination: materialMix.map((m) => ({ material_class: m.class, effective_z: parseFloat(m.z.toFixed(1)), fraction: parseFloat(m.frac.toFixed(2)) })),
    ct_slices_reconstructed: alarming ? 64 : Math.random() > 0.6 ? 16 : 0,
    ct_slices_unit: "axial slices",
    screen_result: alarming
      ? "ALARM - " + threat.item + " (" + threat.note + ", Z~" + threat.z.toFixed(1) + ")"
      : "CLEAR",
    alarmed: alarming,
    operator_attention_required: alarming || tipInserted,
    tip_trial_inserted: tipInserted,
    tip_trial_correct_response: tipInserted ? Math.random() > 0.1 : null, // certification rate
    radiation_dose_per_bag: parseFloat((0.2 + Math.random() * 0.4).toFixed(3)),
    radiation_dose_per_bag_unit: "uSv",
    cabinet_leakage: "< 0.5 uSv/h at 5 cm",
    timestamp: new Date().toISOString()
  };

  return sensorObject
}