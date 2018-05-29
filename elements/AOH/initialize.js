function(instance, context) {


  instance.data.chartCanvasName = "chartCanvas"+Math.round(Math.random()*1000000) + 1;
  instance.data.loaderDivName = "loaderDiv"+Math.round(Math.random()*1000000) + 1;
  instance.data.status = "dataLoading";
  instance.data.chartVisible = false;
  instance.data.count = 0;
  
 
    instance.data.resetCanvas = function(){
	  var element = document.getElementById(instance.data.chartCanvasName);
	  element.parentNode.removeChild(element);      
      var chartdiv = $('<canvas id="'+instance.data.chartCanvasName+'"></canvas>');
      chartdiv.css("width", "100%");
      chartdiv.css("height", "100%");
      instance.canvas.append(chartdiv);
	};

  

}