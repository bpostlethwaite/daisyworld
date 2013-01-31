/*
 *  Daisyworld
 *
 *  A javascript homeostatis engine
 *
 *  2013 Ben Postlethwaite
 *  License MIT
 */
"use strict";


var ar = require('arraytools')()
var aprint = require('printarray')


// aprint(temp, 5, [temp.length, 1])

function growDaisy(spec) {
  var that = {}
  , spec = spec || {}
  , optTemp = spec.optTempB || 295      // Optimal growth temperature
  , growthrate = spec.growthrate || Math.pow(17.5, -2) //Growth rate bracketed between 35 K of T_opt ???
  
  that.pop = spec.pop || 0.1
  that.albedo = spec.albedo || 0.5
  that.deathrate = spec.deathrate || .3 //Death rate (default = 0.3)
  that.birthfnc = spec.birthfnc || birthfnc

  function birthfn (temp) {
    if ( Math.abs(temp - optTemp) < Math.pow(growthrate, -1/2) )
      return 1 - k * (temp - optTemp) * (temp - optTemp)
    else
      return 0.0
  }

  return that

}

/*
 * Refactor out the simulation from the engine.
 * Should pass the engine a simulation to run.
 * In the simulation should be the critters
 * their starting area and any special environmental
 * considerations.
 */

function daisyworldSim(spec) {
  var that = {}
  /*
   * Configurable specs
   */
  that.spec = spec || {}
  that.daisies = spec.daisies ||   // must be an ARRAY of daisies, even if there is one.
      throw new Error('you must pass in at least one daisy to the simulator')
  that.simtime = spec.simtime || 300
  that.lum = spec.lum || lum
  that.initTemp = spec.initTemp || 300 // Initial planetary temperature
  that.lumfunc = spec.lumfunc || lumfunc
  /*
   * Non configurable specs
   */
  that.S = 1368/4 //Solar radiation in W/m2 received by a planet located 1 au from the Sun
  that.sigma = 5.67 * Math.pow(10, -8)// Stefan Boltzman constant J/s/m2/K4
  that.q =  Math.pow(10,9) //Heat transfer coefficient to ensure thermal equilibrium (set so that q < 0.2*SL/sigma)
  that.albedoBarren = 0.5 //Albedo of bare ground

  that.daisies.forEach( function() {
      totalpop = 0
      return function (daisy) {
        totalpop += daisy.pop
        if (totalpop > 1)
          throw new Error('Total population is greater than 1 (100%)!')
      }
    })  
  
  function lumfunc (lum) {
    return lum += 0.01
  }

  return that

}


function daisyEngine(sim) {
/*
 * Setup simulation specifcation
 */
  var barrenGround, globalAlbedo, globalTemp, localTemp
  var that = {}

  function update() {
    barrenGround = 1 - totalDaisies(sim.daisies)
    // The equation below sets albedo as a function of the
    // proportions of daisies coupled with their respective albedos
    globalAlbedo = planetaryAlbedo(sim.daisies)

    // the equation below is the Stefan-Boltzmanns equation
    // S*L*(1-A) = sigma*T^4. In other words the temperature is
    // equal to the solar energy actually being absorbed divided by sigma.
    // Absorption = (1 - current Albedo) ... which in turn is set by the proportions of Daisies.
    globalTemp = Math.pow( (sim.S * sim.lum * (1 - globalAlbedo) / sim.sigma), 1/4) 

    // Calculate local temperatues
    localTemp = daisyTemps(globalAlbedo, sim.daisies)

    // Update populations
    // Is this pass by reference or value... can we see changes to sim.daisies
    // from outside the function????
    sim.daisies = updatePopulation(localTemp, barrenGround, sim.daisies)
    
    // update luminosity
    sim.lum = sim.lumfunc(sim.lum)
  }

  function totalDaisies(daisies) {
    var totalcover = 0.0
    for(var j = 0; j < daisies.length; j++) {
      totalcover += daisies.pop
    } 
    return totalcover
  }

  function planetaryAlbedo(daisies) {
    var albedo = 1
    for(var j = 0; j < daisies.length; j++) {
      albedo += daisies[j].pop * daisies[j].albedo
    }
    return albedo
  }

  function localTemps(globalAlbedo, globalTemp, daisies) {
    /*
     * Calculate the local temperatures
     */
    var temps = []
    for(var j = 0; j < daisies.length; j++) {
      temps[j] = Math.pow( (q * (globalAlbedo - daisies[j].albedo) 
        + Math.pow(globalTemp, 4) ), 1/4)
    }
    return temps
  }

  function updatePopulation(localT, barren, daisies) {
    /*
     * population replicator differential equations:
     * dw/dt= w * (p-w) * Birthrate - w * deathrate.
     */
    for(var j = 0; j < daisies.length; j++) {
      daisies[j].pop += daisies[j].pop * 
        ( barren * daisies[j].birthfunction(localT) - daisies[j].deathrate )
      }
  }

  that.update = update
  return that
}


// FOR PLOTTING
//  , year = spec.year || ar.linspace(0, ntime, ntime )
//   , alphaWstore = spec.alphaWstore || [] //Storage vector for alphaW
//   , alphaBstore = spec.alphaBstore || [] //Storage vector for alphaW
//  alphaWstore[i] = {x : i, y : alphaW}
//    alphaBstore[i] = {x : i, y : alphaB}



