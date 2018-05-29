function(instance, properties, context) {

var id = properties.series_id2; 
  
    try {
	var seriesArray = instance.data.sTrack();
  }
  catch(err) {
    return;
  }
  
var seriesArray = instance.data.sTrack();
var position = seriesArray.indexOf(id);

if (position<0) return;
  
  
if (properties.show_hide_toggle == "Show") {
  
  instance.data.chart.showGraph(instance.data.chart.graphs[position]);

} else if (properties.show_hide_toggle == "Hide") {
    
  instance.data.chart.hideGraph(instance.data.chart.graphs[position]);
  
}
  


}