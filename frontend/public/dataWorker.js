self.onmessage = function (e) {
  const raw = e.data;
  try {
    const parsed = JSON.parse(raw).map((r) => ({
      engine: r.engine,
      diameter: r.diameter,
      wetMass: r.wetMass,
      dryMass: r.dryMass,
      deltaVVac: r.deltaVVac,
      deltaVAsl: r.deltaVAsl,
      twr: r.twr,
      num_engines: r.numEngines,
      cyl_length: r.cylLength ?? 'N/A',
      cyl_fuselage: r.cylFuselage ?? 'N/A',
      nose_length: r.noseLength ?? 'N/A',
      nose_fuselage: r.noseFuselage ?? 'N/A',
    }));
    self.postMessage({ type: 'success', data: parsed });
  } catch (err) {
    self.postMessage({ type: 'error', error: err.message });
  }
};