function(instance, context) {

function ucfirst(val) {
    return val.substr(0, 1).toUpperCase() + val.substr(1);
}
  
function DataFetcher(key, sheetIndex, callback){
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
      }
      callback(finalArr);
    }
  };
  xhttp.open("GET", "https://spreadsheets.google.com/feeds/list/"+key+"/"+sheetIndex+"/public/values?alt=json-in-script&callback=spreadsheetData", true);
  xhttp.send();
}


  
  
instance.data.update_runCount = 0;
  var divPie;
  var divName = "graphdiv"+Math.round(Math.random()*1000000) + 1;
    divPie = $('<div id="'+divName+'"></div>');
    divPie.css("width", "100%");
    divPie.css("height", "100%");

    instance.canvas.append(divPie);
  
instance.data.drawPie = function(settings, bubble_data_obj) {
	  
  if (instance.data.data_source_select == "Google Sheets") {
        DataFetcher(instance.data.data_source_is_google_spreadsheet_key, instance.data.data_source_is_google_spreadsheet_sheet, pushData);
      }
        else pushData(bubble_data_obj, null);
        instance.publishState("loaded", "yes");
  		instance.triggerEvent("chart_loaded", function(err){});

  	function pushData(data, tabletop) {
instance.data.chart = AmCharts.makeChart( divName, {
  			"type": "pie",
            "theme": instance.data.colour_theme,
            "dataProvider": data,
            "valueField": instance.data.data_values_header,
            "titleField": instance.data.data_category_header,
        	"depth3D": instance.data.styling_3d_depth,
        	"angle": instance.data.styling_chart_angle,
        	"startEffect": instance.data.styling_animation_type,
        	"startDuration": instance.data.styling_animation_duration,
        	"sequencedAnimation": instance.data.styling_animation_sequence,
        	"labelsEnabled": instance.data.label_outer_toggle,
  			"pullOutRadius": instance.data.styling_pulloutanimation_radius,
  			"innerRadius" : instance.data.styling_donut_radius,
 			"pullOutOnlyOne": true,
  			"numberFormatter": {
              "precision" : instance.data.data_decimal_places
            },
  			"colorField" : instance.data.color_hex_header,
            "legend": {
              	"enabled": instance.data.legend_enabled,
            	"position": instance.data.legend_position,
            	"rollOverGraphAlpha": 0},
        	"labelRadius": instance.data.label_outer_distance,
            "listeners": [{
              "event": "clickSlice",
              "method": function(e) {
                console.log(e);
                instance.publishState("click_category", e.dataItem.title);
                instance.publishState("click_value", e.dataItem.value);
                instance.publishState("click_percent", e.dataItem.percents);
                instance.triggerEvent("chart_click", function(err){});
              }}],
                
             "balloon":{
             "fixedPosition":true,
               "enabled": instance.data.label_balloon_toggle
            },
        	
            "export": {
              "enabled": instance.data.data_export_toggle
            }
         });
      //if (instance.data.styling_donut_radius != null) instance.data.chart.innerRadius = instance.data.styling_donut_radius;
      //if (instance.data.color_hex_header != null) instance.data.chart.colorField = instance.data.color_hex_header;
      //instance.data.chart.colorField = "color";
     
      if (!(instance.data.label_color=="rgba(0, 0, 0, 0)"||instance.data.label_color==null)) {
          //instance.data.chart.color = instance.data.label_color; 
          instance.data.chart.validateNow();
          instance.data.chart.animateAgain();
		}
    }
}


}