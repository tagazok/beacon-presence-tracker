const mqtt = require('mqtt')

const moment = require('moment');

const brockerUrl = 'mqtt://192.168.1.25:1883';
const client = mqtt.connect(brockerUrl);

const users = {
	"ef:c1:ae:82:a6:21": {
		"mac": "ef:c1:ae:82:a6:21",
		"name": "Olivier",
		"item": "Beacon_Olivier",
		"lastTime": "",
		"around": false
	},
	"d3:4c:94:3e:bc:8d": {
		"mac": "d3:4c:94:3e:bc:8d",
		"name": "Tiffany",
		"item": "Beacon_Tiffany",
		"lastTime": "",
		"around": false
	}
}

const beacons = {
  beacon1: "leavingRoom",
  beacon2: "Bedroom1",
  beacon3: "Bedroom1"
};

client.on('connect', () => {
  console.log("Subscribing...");

  client.subscribe('beacon/connected');
  client.subscribe('beacon/state');
})

client.on('message', (topic, message) => {
  switch (topic) {
    case 'beacon/connected':
      message = JSON.parse(message.toString());
      console.log(`${message.agent} ${message.connected}`);
      return message;
    case 'beacon/state':
      message = JSON.parse(message.toString());
      console.log(`${message.agent} ${message.mac} ${message.rssi}`);
      return message;
  }

  // if (topic.match("beacon/state")) {
  //   console.log("Beacon state updated");
  //   console.log(message);
  // } else if (topic.match("beacon/connected")) {
  //   console.log("Beacon connected");
  //   console.log("message");
  //}
});