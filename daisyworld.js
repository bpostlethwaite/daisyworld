/*
 *  Daisyworld
 *
 *  A javascript homeostatis engine
 *
 *  2013 Ben Postlethwaite
 *  License MIT
 */
var ar = require('arraytools')()
var aprint = require('printarray')


// aprint(temp, 5, [temp.length, 1])

function growDaisy(spec)
  var that
  , spec = spec || {}
  , optTemp = spec.optTempB || 295      // Optimal growth temperature
  , growthrate = spec.growthrate || Math.pow(17.5, -2) //Growth rate bracketed between 35 K of T_opt ???
  
  that.albedo = spec.albedo || 0.5
  that.gamma = spec.gamma || .3 //Death rate (default = 0.3)
  that.birthfnc = spec.birthfnc || birthfnc

  function birthfn (temp) {
    if ( Math.abs(temp - optTemp) < Math.pow(growthrate, -1/2) )
      return 1 - k * (temp - optTemp) * (temp - optTemp)
    else
      return 0.0
}
function runDaisy(spec) {
/*
 * Setup simulation specifcation
 */
 var spec = spec || {}
   , albedoG = spec.albedoG || 0.5 //Albedo of bare ground
   , S = spec.S || 1368/4 //Solar radiation in W/m2 received by a planet located 1 au from the Sun
   , q = spec.q || Math.pow(10,9) //Heat transfer coefficient to ensure thermal equilibrium (set so that q < 0.2*SL/sigma)
   , sigma = spec.sigma || 5.67 * Math.pow(10, -8)// Stefan Boltzman constant J/s/m2/K4
   , T = spec.T || 250 //Initial temperature of daisy world in K (default : 300)
   , L = spec.L || 2.4 //Luminosity (L is set to 2.0 where the black and white have two distinct cycles)
   , ntime = spec.ntime || 300 //Number of timesteps in main loop (default = 100)
   , alphaW = spec.alphaW || 0.01 //Fraction of land covered by white daisies
   , alphaB = spec.alphaB || 0.01 //Fraction of land covered by black daisies
//  , year = spec.year || ar.linspace(0, ntime, ntime )
//   , alphaWstore = spec.alphaWstore || [] //Storage vector for alphaW
//   , alphaBstore = spec.alphaBstore || [] //Storage vector for alphaW


  for (var i = 0; i < ntime; i++) {
    var alphaG = 1 - alphaB - alphaW //Fraction of land that is bare ground
    // The equation below set the main albedo as a function of the
     // proportions of daisies coupled with their respective albedos
      , A = alphaW * albedoW + alphaB * albedoB + albedoG * alphaG //mean planetary albedo

    // the equation below is the Stefan-Boltzmanns equation
    // S*L*(1-A) = sigma*T^4. In other words the temperature times sigma is
    // = to the solar energy actually being absorbed. It depends on the
    // current Albedo, which in turn is set by the proportions of Daisies.

      , T = Math.pow( (S * L * (1 - A) / sigma), 1/4) //compute mean planetary temperature in radiative equilibrium

    // These next sets of equations create the temperature contribution from
    // each type of daisy and the bare planet. ie. Local temperatures.
      , tempW = Math.pow( (q*(A - albedoW) + Math.pow(T,4) ), 1/4) //compute temperature of patch of white daisies
      , tempB = Math.pow( (q*(A - albedoB) + Math.pow(T,4) ), 1/4) //compute temperature of patch of black daisies
      , tempG = Math.pow( (q*(A - albedoG) + Math.pow(T,4) ), 1/4) //compute temperature of bare ground

    // The equations below set the proportions of daisies. These are based
    // on population replicator differential equations we have all seen in
    // our textbooks. ie. dw/dt=w*(p-w)*Birthrate-w*deathrate. In the code
    // form each change is iterated, so no differential equation is being
    // solved at once. so white daisies = white daisies + white daisies *
    // (proportion of land left*birthfunction(using local white daisy
    // temperature) - death rate)
    alphaW = alphaW + alphaW * (alphaG * betafn(tempW, optTempW, kw) - gamma)
    alphaB = alphaB + alphaB * (alphaG * betafn(tempB, optTempB, kb) - gamma)
    L += 0.01

    alphaWstore[i] = {x : i, y : alphaW}
    alphaBstore[i] = {x : i, y : alphaB}

  }


  


  return [alphaWstore, alphaBstore]
}
