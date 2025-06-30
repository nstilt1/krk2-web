self.onmessage = (e) => {
  try {
    const raw = JSON.parse(e.data)
    const mapped = raw.map((r) => ({
      engine:       r.engine,
      diameter:     r.diameter,
      wetMass:      r.wetMass,
      dryMass:      r.dryMass,
      deltaVVac:    r.deltaVVac,
      deltaVAsl:    r.deltaVAsl,
      twr:          r.twr,
      num_engines:  r.numEngines,
      cyl_length:   r.cylLength   ?? 'N/A',
      cyl_fuselage: r.cylFuselage ?? 'N/A',
      nose_length:  r.noseLength  ?? 'N/A',
      nose_fuselage:r.noseFuselage?? 'N/A',
      max_altitude: r.maxAltitude,
      max_velocity: r.maxVelocity,

      // extra fields for the engine
      burnTime:     r.burnTime,
      ullage:       r.ullage ? "True" : "False",
      hpFuel:       r.hpFuel ? "True" : "False",
      tech:         r.tech,
      ignitions:    r.ignitions,
      gimbal:       r.gimbal ? "True" : "False",
      minThrust:    r.minThrust,
      residuals:    r.residuals,
      engineMass:   r.engineMass,
      fuel:         r.fuel,
    }))
    postMessage({ type: 'success', data: mapped })
  } catch (error) {
    postMessage({ type: 'error', error: error.message })
  }
}