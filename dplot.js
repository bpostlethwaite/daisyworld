data = runDaisy(initDaisy())

var graph = new Rickshaw.Graph( {
  element: document.querySelector("#chart"),
  width: 235,
  height: 85,
  renderer: 'area',
  stroke: true,
  series: [ {
    data: data[0],
    color: 'rgba(192,132,255,0.3)',
    stroke: 'rgba(0,0,0,0.15)'
  }, {
    data: data[1],
    color: 'rgba(96,170,255,0.5)',
    stroke: 'rgba(0,0,0,0.15)'
  } ]
} )

graph.renderer.unstack = true
graph.render()
