const aux = window.location.href.split('id=');
let ID = null;
if (aux.length >1){
	ID = aux[1];
}else{
	alert("FALTA ID");
}


const COLORS = {
	hum_1: '#039BE5',
	luz_1: '#e4b680',
	CO2_1: 'while',
	temp_1: '#ca2525fb'
};
//To get percentages
const FULL = {
	hum_1: 100,
	luz_1: 1300,
	CO2_1: 20000,
	temp_1: 50
};


client = new Paho.MQTT.Client("test.mosquitto.org", Number(8080), "clientId"+makeid(10));
client.onConnectionLost = onConnectionLost;
client.onMessageArrived = onMessageArrived;
client.connect({onSuccess:onConnect});


function onConnect() {
  console.log("onConnect");
  client.subscribe(ID+'/vivero/config/#');
  client.subscribe(ID+'/vivero/sensor/#');
}

function onConnectionLost(responseObject) {
  if (responseObject.errorCode !== 0) {
    console.log("onConnectionLost:"+responseObject.errorMessage);
  }
}

//$(document).ready(function(){
	document.getElementById('selector-tabla-sensores-moisture').addEventListener('change', (event) => {
		var e = document.getElementById('selector-tabla-sensores-moisture');
		var val = e.options[e.selectedIndex].textContent;
		message = new Paho.MQTT.Message(val);
		message.destinationName = ID+'/vivero/config/moist_matrix';
		message.retained = true;
		client.send(message); 
	});



	var ckek = document.getElementsByClassName('check-dia');
	for (i = 0 ; i < ckek.length ; i++)
	{
		ckek[i].addEventListener('change', (event) => {
			var value = (event.currentTarget.checked) ?"1":"0";
			var topic = event.currentTarget.getAttribute('id');
			message = new Paho.MQTT.Message(value);
			message.destinationName = ID+'/vivero/config/' + topic;
			message.retained = true;
			client.send(message); 
		});
	}
	
	
	inputs = document.getElementsByClassName('emic-config');
	for (i = 0 ; i < inputs.length ; i++)
	{
		inputs[i].addEventListener('change', (event) => {
			var value = (event.currentTarget.value)
			var topic = event.currentTarget.getAttribute('id').replace("-","/");
			message = new Paho.MQTT.Message(value);
			message.destinationName = ID+'/vivero/' + topic;
			message.retained = true;
			client.send(message); 
			
		});
	}
	
	
	
//});
		
	

//function enviarSetTemp1(value,id)
//{
//	console.log("enviar set temp1:" + value/10);
//	document.getElementById('text3b').html("Current Value: " + value/10);
//	message = new Paho.MQTT.MessagesetValue(""+ (value));
//	message.destinationName = 'clientid/vivero/config/setTemp'+ id ;
//	message.retained = true;
//	client.send(message); 
//
//}

function onMessageArrived(message) {
//   console.log("onMessageArrived:" + message.payloadString);
	var payload =  message.payloadString; // message.toString();
	var value = parseFloat(payload);
	var topic = message.destinationName;





//------------------------




//	  // Comprobamos si el navegador soporta las notificaciones
//	  if (!("Notification" in window)) {
//	    alert("Este navegador no soporta las notificaciones del sistema");
//	  }
//	
//	  // Comprobamos si ya nos habían dado permiso
//	  else if (Notification.permission === "granted") {
//	    // Si esta correcto lanzamos la notificación
//	    //var notification = new Notification("Holiwis :D");
//		var notification = new Notification("Gracias majo! "+ topic + ":" + message.toString());
//	  }
//	
//	  // Si no, tendremos que pedir permiso al usuario
//	  else if (Notification.permission !== 'denied') {
//	    Notification.requestPermission(function (permission) {
//	      // Si el usuario acepta, lanzamos la notificación
//	      if (permission === "granted") {
//	        var notification = new Notification("Gracias majo!");
//	      }
//	    });
//	  }
//	

//--------------------------

	var topics = topic.split("/");
    switch (topics[2])
    {
    	case ("sensor"):
			if (document.getElementById("sensor_"+topics[3]))
			{
				document.getElementById("sensor_"+topics[3]).textContent= value;
				document.getElementById("semi_donut-"+topics[3]).style= `--percentage : ${value * 100 / FULL[ topics[3]]}; --fill: ${COLORS[topics[3]]}` ;
				// console.log(topics[3],value * 100 / FULL[ topics[3]] )
				// console.log(value)
			}
		break;
		case "config":
			//client2.subscribe('clientid/vivero/sensor/#');
			switch (topics[3])
			{
				case ("moist_matrix"):
					
					var e = document.getElementById('selector-tabla-sensores-moisture');
					var val = e.options[e.selectedIndex].textContent;
				
					
					if (payload !== val)
					{
						var optio = document.getElementById("selector-tabla-sensores-moisture-"+payload);
						optio.setAttribute('selected','selected');
					}
					
					var val = payload.split("x");
					
					var column = val[0];
					var fila = val[1];
					
					var tbodyRef = document.getElementById('tabla-sensores-moisture');
					document.getElementById('tabla-sensores-moisture').innerHTML = "";
					for (i = 0; i <column ; i++)
					{
						var newRow = tbodyRef.insertRow();
						for( j = 0 ; j < fila ; j++)
						{
							var newCell = newRow.insertCell();
							var newDiv = document.createElement('div'); 
							newDiv.setAttribute("id", "sensor_moist_" + (i+1) +"_"+ (j+1));
							// newDiv.setAttribute("style", "width: auto;display: contents;");
							newDiv.setAttribute("class", "digital_30");
							newDiv.setAttribute("class", "my_cell");

							var newText = document.createTextNode('---');
							newDiv.appendChild(newText);
							newCell.appendChild(newDiv);
							newRow.appendChild(newCell);
						}
						tbodyRef.appendChild(newRow);
					}
					client.subscribe(ID+'/vivero/sensor/#');
				break;

				case "check-dia-lun":
				case "check-dia-mar":
				case "check-dia-mie":
				case "check-dia-jue":
				case "check-dia-vie":
				case "check-dia-sab":
				case "check-dia-dom":
				if (document.getElementById(topics[3]).checked != (payload == "1"))
				{
						document.getElementById(topics[3]).checked = (payload == "1");
				}
				break;
				default:
					if (document.getElementById("config-"+topics[3]) && document.getElementById("config-"+topics[3]).value !== payload )
					{
						document.getElementById("config-"+topics[3]).value= payload;
						if (document.getElementById("slider-"+topics[3]))
							document.getElementById("slider-"+topics[3]).value= payload;
						if (document.getElementById("value-"+topics[3]))
							document.getElementById("value-"+topics[3]).innerHTML= payload;
						// if (document.getElementById("semi_donut-"+topics[3])){
						// 	document.getElementById("semi_donut-"+topics[3]).style= `--percentage : ${payload}; --fill: #039BE5` ;
						// 	console.log(topics[3],payload)
						// }
						
					}
				break;

				
			
			}
		break;
    }
}


function makeid(length) {
    var result           = '';
    var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for ( var i = 0; i < length; i++ ) {
      result += characters.charAt(Math.floor(Math.random() * 
 charactersLength));
   }
//    console.log("random:",result );
   return result;
}      


var forEach = function (array, callback, scope) {
	for (var i = 0; i < array.length; i++) {
		callback.call(scope, i, array[i]);
	}
};
window.onload = function(){
	var max = 2160;
	forEach(document.querySelectorAll('.progress'), function (index, value) {
	percent = value.getAttribute('data-progress');
		value.querySelector('.fill').setAttribute('style', 'stroke-dashoffset: ' + ((100 - percent) / 100) * max);
		value.querySelector('.value').innerHTML = percent + '%';
	});
}



var interval = 150;
function progressAnimate (value) {
  var btn = document.getElementById("btn");
  btn.disabled = true;
  var progress = document.getElementById('th-animated');
  progress.value = value;
  value++;
  var t = setTimeout("progressAnimate(" + value + ")", interval);
  if (value === 25 || value === 50 || value === 75) {
    interval = 1000;
  } else if (value === 26 || value === 51 || value === 76) {
    interval = 100;
  } else if (value === 100){
    progress.value = 100;
    btn.disabled = false;
    clearTimeout(t);
  }
}



$(document).ready(function() {
	$('.minus').click(function () {
		var input = document.getElementById('config-CO2_1');
		var count = parseInt(input.value) - 1;
		count = count < 1 ? 1 : count;
		input.value = count;

		
		message = new Paho.MQTT.Message(input.value);
		message.destinationName = ID+'/vivero/' + 'config/CO2_1';
		message.retained = true;
		client.send(message); 


	});
	$('.plus').click(function () {
		var input = document.getElementById('config-CO2_1');
		var count = parseInt(input.value) + 1;
		input.value = count;

		message = new Paho.MQTT.Message(input.value);
		message.destinationName = ID+'/vivero/' + 'config/CO2_1';
		message.retained = true;
		client.send(message);
		return false;
	});
});


//Slide input humedad

var slider_hum = document.getElementById("slider-hum1");
var output_hum = document.getElementById("config-hum1");
output_hum.innerHTML = slider_hum.value;
slider_hum.oninput = function() {
	output_hum.value = this.value;
	message = new Paho.MQTT.Message(this.value);
	message.destinationName = ID+'/vivero/' + 'config/hum1';
	message.retained = true;
	client.send(message); 
}

//Slide input temperatura
var slider_temp1 = document.getElementById("slider-temp1");
var output_temp1 = document.getElementById("config-temp1");
output_temp1.innerHTML = slider_temp1.value;
slider_temp1.oninput = function() {
	output_temp1.value = this.value;
	message = new Paho.MQTT.Message(this.value);
	message.destinationName = ID+'/vivero/' + 'config/temp1';
	message.retained = true;
	client.send(message); 
}
