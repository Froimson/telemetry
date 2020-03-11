'use strict';

const fs = require('fs');
const path = require('path');

const Client = require('azure-iot-device').Client;
const ConnectionString = require('azure-iot-device').ConnectionString;
const Message = require('azure-iot-device').Message;
const MqttProtocol = require('azure-iot-device-mqtt').Mqtt;

var isMessageSendOn = true;
var messageId = 0;
var client, config, messageProcessor;

var connectionString = 'HostName=Eugenius.azure-devices.net;DeviceId=fakeSensor;SharedAccessKey=NL0y9wxXoH0OYYhpc02eOc3UU/ObqC/RzJvPPWFpJrQ=';

var rpiDhtSensor = require('rpi-dht-sensor');

var dht = new rpiDhtSensor.DHT11(4);

function onStart(request, response) {
  console.log('[Device] Trying to invoke method start(' + request.payload || '' + ')');

  isMessageSendOn = true;

  response.send(200, 'Successully start sending message to cloud', function (err) {
    if (err) {
      console.error('[IoT Hub Client] Failed sending a start method response due to:\n\t' + err.message);
    }
  });
}

function onStop(request, response) {
  console.log('[Device] Trying to invoke method stop(' + request.payload || '' + ')');

  response.send(200, 'Successully stop sending message to cloud', function (err) {
    if (err) {
      console.error('[IoT Hub Client] Failed sending a stop method response due to:\n\t' + err.message);
    }
  });
}

function receiveMessageCallback(msg) {
  var message = msg.getData().toString('utf-8');

  client.complete(msg, () => {
    console.log('Received message:\n\t' + message);
  });
}

function sendHubMessage() {
    messageId++;
  
    var readout = dht.read();
    console.log('Temperature: ' + readout.temperature.toFixed(2) + 'C, ' + 'humidity: ' + readout.humidity.toFixed(2) + '%');
  
    var message = new Message(JSON.stringify({ 
        nameId: "Device",
        messageType: "Telemetry", 
        messageId: messageId,
        valueStr: "10" }));
        
    message.contentEncoding = 'utf-8';
    message.contentType = 'application/json';
    //message.properties.add('temperatureAlert', temperatureAlert ? 'true' : 'false');
  
    client.sendEvent(message, (err) => {
      if (err) {
        console.error('[Device] Failed to send message to Azure IoT Hub due to:\n\t' + err.message);
      } else {
        console.log('[Device] Message sent to Azure IoT Hub');
      }
    });

    console.log('Message sent: ' + message.getData());
}


console.log('Initializing application');

// create a client
client = Client.fromConnectionString(connectionString, MqttProtocol);

client.open((err) => {
    if (err) {
      console.error('[IoT Hub Client] Connect error:\n\t' + err.message);
      return;
    }

    // set C2D and device method callback
    client.onDeviceMethod('start', onStart);
    client.onDeviceMethod('stop', onStop);
    client.on('message', receiveMessageCallback);
    setInterval(sendHubMessage, 5000);
});


