function generateSensorData(sensorId, scenario = "auto") {
  // A surface swipe lifts particulate onto a heated desorber (250 C); the
  // GC column separates molecules by retention time and the MS quadrupole
  // fingerprints them by mass-to-charge — trace-level ng detection
  const alarming = scenario === "alarming" ? true : scenario === "clean" ? false : Math.random() > 0.93;

  const stations = ["CHECKPOINT SWIPE DESK 4", "BOARDING GATE 21 SECONDARY", "RANDOM SELECTION LANE", "STAFF ACCESS VESTIBULE"];
  const station = stations[Math.floor(Math.random() * stations.length)];

  // Explosive and narcotics target analytes with typical GC retention + MS ions
  const targets = [
    { name: "TNT", family: "EXPLOSIVE", rt: 8.42, ions: [210, 227, 89], cut: 850 },
    { name: "RDX (C-4)", family: "EXPLOSIVE", rt: 6.91, ions: [129, 46, 102], cut: 700 },
    { name: "PETN (DETONATING CORD)", family: "EXPLOSIVE", rt: 7.85, ions: [46, 240, 99], cut: 700 },
    { name: "TATP (PEROXIDE)", family: "EXPLOSIVE", rt: 4.13, ions: [43, 74, 91], cut: 500 },
    { name: "NITROGLYCERIN", family: "EXPLOSIVE", rt: 7.10, ions: [46, 30, 76], cut: 700 },
    { name: "CANNABIS (CBD/THC)", family: "NARCOTIC", rt: 11.30, ions: [314, 231, 299], cut: 1200 },
    { name: "COCAINE", family: "NARCOTIC", rt: 12.86, ions: [182, 82, 303], cut: 1200 },
    { name: "METHAMPHETAMINE", family: "NARCOTIC", rt: 9.47, ions: [58, 91, 134], cut: 1000 }
  ];
  const hit = targets[Math.floor(Math.random() * targets.length)];

  // Benign carryover that GC still resolves: hand lotion, fuel transfers,
  // firearm-grip residues on law-enforcement crew — flagged but cleared
  const interferents = [
    { name: "MINERAL OIL (HAND LOTION)", rt: 5.02, note: "ALPHABET SOUP OF HYDROCARBONS" },
    { name: "GUN GRIP RESIDUE (NITROCELLULOSE)", rt: 7.02, note: "LOW LEVEL - FIREARM ARMORER CREW" },
    { name: "AVGAS/DIESEL TRANSFER TRACE", rt: 3.88, note: "RAMP CREW PASSING THROUGH" }
  ];
  const interference = !alarming && Math.random() > 0.75
    ? [interferents[Math.floor(Math.random() * interferents.length)]]
    : [];

  const chromatogram = [];
  for (let i = 0; i < 6; i++) {
    const t = parseFloat((2 + Math.random() * 11).toFixed(2));
    chromatogram.push({
      retention_time: t,
      retention_time_unit: "min",
      peak_area: Math.round(Math.random() * 5000),
      peak_area_unit: "counts",
      identified: interference.find((x) => Math.abs(x.rt - t) < 0.5)?.name || null
    });
  }

  const mass = alarming ? Math.round(2 + Math.random() * 90) : Math.round(Math.random() * 8); // nanograms
  const aboveCut = alarming ? mass >= hit.cut / 100 : false; // cut thresholds in ng/100

  const sensorObject = {
    sensor_id: sensorId,
    sensor_type: "GC/MS Explosive & Narcotic Trace Detector (Swipable)",
    station: station,
    method: "THERMAL DESORPTION 250 C -> GC COLUMN -> QUADRUPOLE MS (EI 70 eV)",
    swipe_id: "SW-" + Math.floor(Math.random() * 1e6).toString().padStart(6, "0"),
    swipe_source: alarming ? ["HAND", "LUGGAGE HANDLE", "LAPTOP VENT", "SHOE SOLE"][Math.floor(Math.random() * 4)] : "HAND",
    analysis_time: parseFloat((14 + Math.random() * 8).toFixed(1)),
    analysis_time_unit: "s (fast GC cycle)",
    total_ion_chromatogram: chromatogram,
    detection: {
      alarming: alarming,
      analyte: alarming ? hit.name : interference.length ? interference[0].name : "NONE ABOVE NOISE FLOOR",
      analyte_family: alarming ? hit.family : interference.length ? "BENIGN INTERFERENT" : null,
      retention_time_match: alarming ? hit.rt : interference.length ? interference[0].rt : null,
      retention_time_match_unit: "min (library NIST match > 0.85)",
      quantified_mass: mass,
      quantified_mass_unit: "ng",
      alarm_threshold: alarming ? hit.cut : 700,
      alarm_threshold_unit: "ng (tunable per AVSEC program)",
      library_match_score: alarming ? parseFloat((0.86 + Math.random() * 0.13).toFixed(2)) : interference.length ? parseFloat((0.7 + Math.random() * 0.15).toFixed(2)) : null
    },
    decision: alarming && aboveCut ? "ALARM - PASSENGER + BAGGAGE RESCREEN, PHYSICAL INSPECTION"
      : alarming ? "GRAY ZONE - DUPLICATE SWIPE + HAND-HELD IMS CONFIRMATION"
      : interference.length ? "CLEAR - INTERFERENT IDENTIFIED, NO ACTION"
      : "CLEAR",
    ion_fragment_check: alarming ? hit.ions.join(" / ") + " m/z CONFIRMED" : "NO TARGET IONS",
    carryover_purge: Math.random() > 0.9 ? "EXTENDED BAKE-OUT RUNNING - 30 S DELAY" : "STANDARD",
    desorber_temp: 250,
    desorber_temp_unit: "degC",
    timestamp: new Date().toISOString()
  };

  return sensorObject
}