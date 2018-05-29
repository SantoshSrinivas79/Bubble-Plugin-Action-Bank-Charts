function(instance, context) {

var defaultOpacity = 0.75;
  
function ucfirst(val) {
    return val.substr(0, 1).toUpperCase() + val.substr(1);
}
  
instance.data.count = false;
  
function DataFetcher(key, sheetIndex, callback){
  console.log("begun");
  var xhttp = new XMLHttpRequest();
  xhttp.onreadystatechange = function() {
    if (this.readyState == 4 && this.status == 200) {
      var response = this.responseText;
      response = response.split("spreadsheetData(")[1].slice(0, -2);
      response = JSON.parse(response);
      var finalArr=[];
      for(var i=0; i<response.feed.entry.length; i++){
        var tempObj = {};
        for(key in response.feed.entry[i]){
          if(key.indexOf("gsx$")>=0){
            tempObj[ucfirst(key.replace("gsx$",""))]=response.feed.entry[i][key].$t;
          }
        }
        finalArr.push(tempObj);
        console.log(finalArr);
      }
      callback(finalArr);
    }
  };
  xhttp.open("GET", "https://spreadsheets.google.com/feeds/list/"+key+"/"+sheetIndex+"/public/values?alt=json-in-script&callback=spreadsheetData", true);
  xhttp.send();
}

  function cloneSeries(series_id) {
    
    var newSerieName = String("series_"+series_id+"_settings");
    var newSerieValue = String("series_"+series_id+"_data_header");
    var newSerieTitle = String("series_"+series_id+"_data_header");
    var newSerieAxis = String("series_"+series_id+"_axis_to_plot_series_on");
    var newSerieLineColor = String("series_"+series_id+"_line_color");
    var newSerieLineAlpha = String("series_"+series_id+"_line_opacity");
    var newSerieFillColor = String("series_"+series_id+"_fill_color");
    var newSerieFillAlpha = String("series_"+series_id+"_fill_opacity");
    
    if (instance.data[newSerieName] == "Series 1") var newSeries = jQuery.extend({}, series[1]);
      else var newSeries = jQuery.extend({}, series[2]);

    newSeries.valueField = instance.data[newSerieValue];
    newSeries.title = instance.data[newSerieTitle];
    newSeries.valueAxis = instance.data[newSerieAxis];
    newSeries.id = "Series "+series_id;

    if (!(instance.data[newSerieLineColor]=="rgba(0, 0, 0, 0)"||instance.data[newSerieLineColor]==null)) newSeries.lineColor = instance.data[newSerieLineColor];
    if (instance.data[newSerieLineAlpha] == "" || instance.data[newSerieLineAlpha] == null) newSeries.lineAlpha = defaultOpacity;
      else newSeries.lineAlpha = instance.data[newSerieLineAlpha];

    if (!(instance.data[newSerieFillColor]=="rgba(0, 0, 0, 0)"||instance.data[newSerieFillColor]==null)) newSeries.fillColors = instance.data[newSerieFillColor];
    if (instance.data[newSerieFillAlpha] == "" || instance.data[newSerieFillAlpha] == null) newSeries.fillAlphas = defaultOpacity;
      else newSeries.fillAlphas = instance.data[newSerieFillAlpha];

      return newSeries;
    
  }

  
instance.data.test = 0;

var seriesTracker = [], series = [];

//instance.data.chart.dataProvider = AmCharts.parseJSON(data);

  
instance.data.drawPie = function(seriesMap, bubble_data_obj, sheetsu_data_obj) {

  if (instance.data.count == true && instance.data.loading_icon == true) {
  	var element = document.getElementById(instance.data.divName);
	element.parentNode.removeChild(element);
} 

  	chartdiv = $('<div id="'+instance.data.divName+'"></div>');
  	chartdiv.css("width", "100%");
    chartdiv.css("height", "100%");
    instance.canvas.append(chartdiv);
  
  if (instance.data.data_select_data_source == "Google Sheets") {
    	DataFetcher(instance.data.data_source_is_google_spreadsheet_key, instance.data.data_source_is_google_spreadsheet_sheet, pushData);
    
  } else if (instance.data.data_select_data_source == "Sheetsu") {
			
       		pushData(sheetsu_data_obj, null);
  } else pushData(bubble_data_obj, null); 
  instance.publishState("loaded", "yes");
  instance.triggerEvent("chart_loaded", function(err){});

    
  	function pushData(data, tabletop) {
        instance.data.chart = AmCharts.makeChart( instance.data.divName, {
          "type": "serial",
          "addClassNames": true,
          "theme": instance.data.chart_color_overall_theme,
          "autoMargins": true,
          "numberFormatter": {
              "precision" : instance.data.data_decimal_places
            },
          "synchronizeGrid" : true,
          "angle": instance.data.styling_3d_angle,
          "depth3D": instance.data.styling_3d_depth,
          "startEffect": instance.data.styling_animation_type,
        	"startDuration": instance.data.styling_animation_duration,
			"sequencedAnimation": instance.data.styling_animation_sequence,
          
          "balloon": {
              "adjustBorderColor": false,
              "horizontalPadding": 10,
              "verticalPadding": 8,
              "color": "#ffffff"
          },
          "dataProvider": data,
          "dataDateFormat" : "YYYY MM DD",
          "legend": {
              	"enabled": instance.data.legend_enabled,
            	"position": instance.data.legend_position,
            	"rollOverGraphAlpha": instance.data.legend_rollover},
          
          
          "categoryField": instance.data.category_header,
          "listeners": [{
    "event": "clickGraphItem",
    "method": function(e) {
      instance.publishState("click_category", e.item.category);
      instance.publishState("click_value", e.item.values.value);
      instance.triggerEvent("chart_click", function(err){});
    }}],
          "export": {
          "enabled": instance.data.data_export_available
          },
          "rotate": instance.data.chart_rotate
        } );
      
     
    //SETTINGS FOR VALUE AXIS
      var value_axis1 = new AmCharts.ValueAxis();
      value_axis1.id = "Left axis";
      value_axis1.stackType = instance.data.chart_stacking_mode;
	value_axis1.position = "left";
    value_axis1.offset = instance.data.value_axis_distance_offset;
    value_axis1.labelsEnabled = instance.data.value_axis_labels_enabled;
    if (!(instance.data.value_axis_axis_line_color== null||instance.data.value_axis_axis_line_color=="rgba(0, 0, 0, 0)")) value_axis1.axisColor = instance.data.value_axis_axis_line_color;  
    if (!(instance.data.value_axis_labels_color=="rgba(0, 0, 0, 0)" || instance.data.value_axis_labels_color==null)) value_axis1.color = instance.data.value_axis_labels_color;
    if (!(instance.data.value_axis_labels_unit_label== null ||instance.data.value_axis_labels_unit_label=="")) value_axis1.unit = instance.data.value_axis_labels_unit_label;
    value_axis1.unitPosition = instance.data.value_axis_labels_unit_position;
    if (instance.data.value_axis_axis_line_thickness !== null) value_axis1.axisThickness = instance.data.value_axis_axis_line_thickness;
    if (instance.data.value_axis_axis_line_opacity !== "") value_axis1.axisAlpha = instance.data.value_axis_axis_line_opacity;
    if (!(instance.data.value_axis_grid_line_color=="rgba(0, 0, 0, 0)" ||instance.data.value_axis_grid_line_color==null)) value_axis1.gridColor = instance.data.value_axis_grid_line_color;
    if (instance.data.value_axis_grid_line_opacity !=="") value_axis1.gridAlpha = instance.data.value_axis_grid_line_opacity;
    if (instance.data.value_axis_grid_line_thickness !== null) value_axis1.gridThickness = instance.data.value_axis_grid_line_thickness;
    if (instance.data.value_axis_grid_line_dash_length !== null) value_axis1.dashLength = instance.data.value_axis_grid_line_dash_length;
    if (!(instance.data.value_axis_alternate_fill_color=="rgba(0, 0, 0, 0)"||instance.data.value_axis_alternate_fill_color)) value_axis1.fillColor = instance.data.value_axis_alternate_fill_color;
    if (instance.data.value_axis_alternate_fill_opacity !== "") value_axis1.fillAlpha = instance.data.value_axis_alternate_fill_opacity;
    
      
      if (!(instance.data.value_axis_minimum == "" ||instance.data.value_axis_minimum == null)) {
        instance.data.chart.synchronizeGrid = false;
        value_axis1.minimum = instance.data.value_axis_minimum;   
      }
      

      if (!(instance.data.value_axis_maximum == "" ||instance.data.value_axis_maximum == null)) {
        instance.data.chart.synchronizeGrid = false;
        value_axis1.maximum = instance.data.value_axis_maximum;   
      }
    instance.data.chart.addValueAxis(value_axis1);
      
    //SETTINGS FOR SECOND VALUE AXIS
      var value_axis2 = jQuery.extend({}, value_axis1);
      value_axis2.id = "Right axis";
      value_axis2.position = "right";
      if (!(instance.data.value_axis_right_labels_unit_label== null ||instance.data.value_axis_right_labels_unit_label=="")) value_axis2.unit = instance.data.value_axis_right_labels_unit_label;
      else value_axis2.unit = "";
      value_axis2.unitPosition = instance.data.value_axis_right_labels_unit_position;
      if (!(instance.data.value_axis_right_line_color== null||instance.data.value_axis_right_line_color=="rgba(0, 0, 0, 0)")) value_axis2.axisColor = instance.data.value_axis_right_line_color;
      instance.data.chart.addValueAxis(value_axis2);
 
    //SETTINGS FOR CURSOR
    if (instance.data.cursor_enabled) {
    	var chartCursor = new AmCharts.ChartCursor()
  		chartCursor.fullWidth = true;
        chartCursor.cursorAlpha = 0.05;
        chartCursor.valueLineEnabled = true;
        chartCursor.valueLineAlpha = 0.5;
        chartCursor.valueLineBalloonEnabled =true;
        chartCursor.enabled = true;
      	chartCursor.categoryBalloonAlpha = 0;
      
      	/*chartCursor.oneBalloonOnly = true;
    	chartCursor.pan = false;
      	chartCursor.bulletsEnabled = false;
    	chartCursor.valueLineEnabled = true;
    	//chartCursor.valueLineBalloonEnabled = true;
      	//chartCursor.categoryBalloonEnabled = false;
    	if (instance.data.cursor_opacity !=="")chartCursor.cursorAlpha = instance.data.cursor_opacity;
    	if (!(instance.data.cursor_color=="rgba(0, 0, 0, 0)"||instance.data.cursor_color==null))chartCursor.cursorColor = instance.data.cursor_color;
    	if (instance.data.cursor_opacity !=="") chartCursor.valueLineAlpha = instance.data.cursor_opacity;
    	chartCursor.valueZoomable = true;*/
		instance.data.chart.addChartCursor(chartCursor);
    }
    
    //SETTINGS FOR CATEGORY AXIS
    instance.data.chart.categoryAxis.parseDates = instance.data.category_date_formatting_enabled;
    instance.data.chart.categoryAxis.offset = instance.data.category_axis_distance_offset;
    instance.data.chart.categoryAxis.labelsEnabled = instance.data.category_axis_labels_enabled;
    instance.data.chart.categoryAxis.startOnAxis = instance.data.category_axis_startOnZero;
	 if (!(instance.data.category_axis_labels_color=="rgba(0, 0, 0, 0)" || instance.data.category_axis_labels_color==null)) instance.data.chart.categoryAxis.color = instance.data.category_axis_labels_color;

    if (!(instance.data.category_axis_axis_line_color == "rgba(0, 0, 0, 0)" ||instance.data.category_axis_axis_line_color== null)) instance.data.chart.categoryAxis.axisColor = instance.data.category_axis_axis_line_color;
    if (instance.data.category_axis_label_rotation !== null) instance.data.chart.categoryAxis.labelRotation = instance.data.category_axis_label_rotation;
    if (instance.data.category_axis_axis_line_thickness !== null) instance.data.chart.categoryAxis.axisThickness = instance.data.category_axis_axis_line_thickness;
    if (!(instance.data.category_axis_grid_line_color=="rgba(0, 0, 0, 0)" ||instance.data.category_axis_grid_line_color==null)) instance.data.chart.categoryAxis.gridColor = instance.data.category_axis_grid_line_color;
    if (instance.data.category_axis_grid_line_opacity !=="") instance.data.chart.categoryAxis.gridAlpha = instance.data.category_axis_grid_line_opacity;
    if (instance.data.category_axis_axis_line_opacity !== "") instance.data.chart.categoryAxis.axisAlpha = instance.data.category_axis_axis_line_opacity;
    if (instance.data.category_axis_grid_line_thickness !== null) instance.data.chart.categoryAxis.gridThickness = instance.data.category_axis_grid_line_thickness;
    if (instance.data.category_axis_grid_line_dash_length !== null) instance.data.chart.categoryAxis.dashLength = instance.data.category_axis_grid_line_dash_length;
    if (!(instance.data.category_axis_alternate_fill_color == "rgba(0, 0, 0, 0)" ||instance.data.category_axis_alternate_fill_color == null)) instance.data.chart.categoryAxis.fillColor = instance.data.category_axis_alternate_fill_color;
    if (instance.data.category_axis_alternate_fill_opacity !== "") instance.data.chart.categoryAxis.fillAlpha = instance.data.category_axis_alternate_fill_opacity;
    instance.data.chart.categoryAxis.gridPosition = "start";
    instance.data.chart.categoryAxis.position = instance.data.category_axis_position;
      if (instance.data.data_time_rollup=="Month") {
        instance.data.chart.categoryAxis.minPeriod = "MM";
        instance.data.chart.balloonDateFormat = "MMM YYYY";}
      if (instance.data.data_time_rollup=="Year") {
        instance.data.chart.categoryAxis.minPeriod = "YYYY";
        instance.data.chart.balloonDateFormat = "YYYY";}
      if (instance.data.data_time_rollup=="Week") {
        instance.data.chart.categoryAxis.minPeriod = "WW";
        
      }

     // instance.data.chart.categoryAxis.forceShowField = "forceShow";
      
    //SETTINGS FOR SERIES 1
    series[1] = new AmCharts.AmGraph();
    series[1].valueAxis = instance.data.series_1_axis_to_plot_series_on;
    series[1].id = "Series 1";
    series[1].title = instance.data.series_1_data_header;
    series[1].valueField = instance.data.series_1_data_header; 
    
    series[1].type = instance.data.series_1_chart_type;
    if (!(instance.data.series_1_fill_color=="rgba(0, 0, 0, 0)"||instance.data.series_1_fill_color==null)) series[1].fillColors = instance.data.series_1_fill_color;
    
    if (instance.data.series_1_fill_opacity == "" || instance.data.series_1_fill_opacity == null) series[1].fillAlphas = defaultOpacity;
    else series[1].fillAlphas = instance.data.series_1_fill_opacity;
      
    if (!(instance.data.series_1_color_field == null ||instance.data.series_1_color_field == "")) series[1].colorField = instance.data.series_1_color_field;
    if (instance.data.series_1_line_dash_length !== null) series[1].dashLength = instance.data.series_1_line_dash_length;
    if (!(instance.data.series_1_line_color=="rgba(0, 0, 0, 0)"||instance.data.series_1_line_color==null)) series[1].lineColor = instance.data.series_1_line_color;
    if (instance.data.series_1_line_opacity !== "") series[1].lineAlpha = instance.data.series_1_line_opacity;
    if (instance.data.series_1_line_thickness !== null) series[1].lineThickness = instance.data.series_1_line_thickness;
    if (instance.data.series_1_bullet_type !== "") series[1].bullet = instance.data.series_1_bullet_type;
    if (instance.data.series_1_bullet_size !== null) series[1].bulletSize = instance.data.series_1_bullet_size;
    series[1].showBalloon = instance.data.series_1_label_balloon_enabled;
    series[1].balloonText = instance.data.balloon_text;
    //series[1].columnWidth = 0.75;
      //series[1].fixedColumnWidth = 20;
    instance.data.chart.addGraph(series[1]);
      
     //SETTINGS FOR SERIES 2
    if (instance.data.series_2_enabled) {
      series[2] = new AmCharts.AmGraph();
      series[2].valueAxis = instance.data.series_2_axis_to_plot_series_on;
      series[2].id = "Series 2";
      series[2].title = instance.data.series_2_data_header;
      series[2].valueField = instance.data.series_2_data_header;
      series[2].type = instance.data.series_2_chart_type;
      if (!(instance.data.series_2_fill_color=="rgba(0, 0, 0, 0)"||instance.data.series_2_fill_color==null)) series[2].fillColors = instance.data.series_2_fill_color;
      
      if (instance.data.series_2_fill_opacity == "" || instance.data.series_2_fill_opacity == null) series[2].fillAlphas = defaultOpacity;
	  else series[2].fillAlphas = instance.data.series_2_fill_opacity;    
      
      if (!(instance.data.series_2_color_field == null ||instance.data.series_2_color_field == "")) series[2].colorField = instance.data.series_2_color_field;
      if (instance.data.series_2_line_dash_length !== null) series[2].dashLength = instance.data.series_2_line_dash_length;
      if (!(instance.data.series_2_line_color=="rgba(0, 0, 0, 0)"||instance.data.series_2_line_color==null)) series[2].lineColor = instance.data.series_2_line_color;
      if (instance.data.series_2_line_opacity !== "") series[2].lineAlpha = instance.data.series_2_line_opacity;
      if (instance.data.series_2_line_thickness !== null) series[2].lineThickness = instance.data.series_2_line_thickness;
      if (instance.data.series_2_bullet_type !== "") series[2].bullet = instance.data.series_2_bullet_type;
      if (instance.data.series_2_bullet_size !== null) series[2].bulletSize = instance.data.series_2_bullet_size;
      series[2].showBalloon = instance.data.series_2_label_balloon_enabled;
      series[2].balloonText = instance.data.balloon_text;
		//series[2].fixedColumnWidth = 20;
      instance.data.chart.addGraph(series[2]);
    }
         
      
    //CREATE REST OF SERIES
    for (var s=0;s < 6; s++) {
      var ss = s+3;
      if (seriesMap[ss-1]>0) instance.data.chart.addGraph(cloneSeries(ss));
;
    }
    instance.data.chart.validateNow();
     
      //SETTINGS FOR SCROLL BAR
    if (instance.data.scrollbar_enabled) {
    var chartScrollBar = new AmCharts.ChartScrollbar();
    if (instance.data.scrollbar_series != "None") chartScrollBar.graph = instance.data.scrollbar_series;
    chartScrollBar.oppositeAxis = instance.data.scrollbar_position;
    if (instance.data.scrollbar_offset !== null) chartScrollBar.offset=instance.data.scrollbar_offset;
     if (instance.data.scrollbar_height == null||instance.data.scrollbar_height == 0) {
       chartScrollBar.scrollbarHeight = 40;
     } else {
       chartScrollBar.scrollbarHeight = instance.data.scrollbar_height;
     }      
    chartScrollBar.backgroundAlpha = 0.1;
    chartScrollBar.selectedBackgroundAlpha = 0.3;
    //chartScrollBar.selectedBackgroundColor = "#888888";
    chartScrollBar.graphFillAlpha = 0.5;
    chartScrollBar.graphLineAlpha = 0.5;
    chartScrollBar.selectedGraphFillAlpha = 0.8;
    chartScrollBar.selectedGraphLineAlpha = 1;
    //chartScrollBar.color="#AAAAAA";
    instance.data.chart.addChartScrollbar(chartScrollBar);
    instance.data.chart.validateNow();
    }
    
      
    //INTERVAL REFRESH
      if (instance.data.interval_refresh_enabled) {
        setInterval(function(){ 
        if (instance.data.data_select_data_source == "Google Sheets") {
      	var key = instance.data.data_source_is_google_spreadsheet_key;
  
  		Tabletop.init( { key: key,
        	callback: instance.data.updateData,
            simpleSheet: true } )
     } else instance.data.updateData(bubble_data_obj, null);         
        },instance.data.interval);
        
      }

      
instance.data.addBubbleSeries = function(header,data) {
  var currentLength = bubble_data_obj.length;
  for (var i=0;i<currentLength;i++){
    bubble_data_obj[i][header] = data[i];
  }
  return bubble_data_obj;
}
      
instance.data.updateData = function(data, tabletop) {
      instance.data.chart.dataProvider = data;
      instance.data.chart.validateData();
    }

instance.data.sTrack = function() {
  var seriesCount = instance.data.chart.graphs.length;
  for (var c=0;c<seriesCount;c++){
    seriesTracker[c] = instance.data.chart.graphs[c].id;
  }
  return seriesTracker;
}
      
    
      

    //instance.data.chart.validateNow();
    }
}

}