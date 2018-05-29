function(instance, context) {

  	instance.data.count = 0;  
  
    // CREATE CANVAS AREA FOR CHART
    var divName = "graphdiv"+Math.round(Math.random()*1000000) + 1;
    instance.data.canvas = divName;
    var chartdiv;
    chartdiv = $('<canvas id="'+divName+'"></canvas>');
    chartdiv.css("width", "100%");
    chartdiv.css("height", "100%");
    instance.canvas.append(chartdiv);
  
 
    instance.data.resetCanvas = function(){
	  var element = document.getElementById(divName);
	  element.parentNode.removeChild(element);      
      chartdiv = $('<canvas id="'+divName+'"></canvas>');
      chartdiv.css("width", "100%");
      chartdiv.css("height", "100%");
      instance.canvas.append(chartdiv);
	};

  
}