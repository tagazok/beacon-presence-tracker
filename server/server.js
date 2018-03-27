const mqtt = require("mqtt");

const moment = require("moment");

const brockerUrl = "mqtt://192.168.1.25:1883";
const client = mqtt.connect(brockerUrl);

const EventEmitter = require('events');
const express = require('express');
const cors = require('cors');
var server = express();
server.use(cors());
const Stream = new EventEmitter(); 

// var sse = {};
// server.get("/events", function(req, res) {

//   sse = startSses(res);
// });

server.get('/events', function(request, response){
  response.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive'
  });
  response.write("\n");

  Stream.on("push", function(event, data) {
    response.write("event: " + String(event) + "\n" + "data: " + JSON.stringify(data) + "\n\n");
  });
});

server.listen(9988, function() {
  console.log("listening on %d", 9988);
});

const users = {
  "ef:c1:ae:82:a6:21": {
    mac: "ef:c1:ae:82:a6:21",
    name: "Olivier",
    lastTime: "",
    around: false,
    agents: {},
    distances: {}
  },
  "d3:4c:94:3e:bc:8d": {
    mac: "d3:4c:94:3e:bc:8d",
    name: "Tiffany",
    item: "Beacon_Tiffany",
    lastTime: "",
    around: false,
    agents: {},
    distances: {}
  }
};

const beacons = {
  beacon1: "leavingRoom",
  beacon2: "Bedroom1",
  beacon3: "Bedroom2"
};

client.on("connect", () => {
  console.log("Subscribing...");

  client.subscribe("beacon/connected");
  client.subscribe("beacon/state");
});

client.on("message", (topic, message) => {
  switch (topic) {
    case "beacon/connected":
      message = JSON.parse(message.toString());
      console.log(`${message.agent} ${message.connected}`);
      return message;
    case "beacon/state":
      message = JSON.parse(message.toString());
      console.log(`${message.agent} ${message.mac} ${message.rssi}`);
      handleState(message);
      return message;
  }
});

function handleState(message) {
  
  const user = users[message.mac];
  user.around = true;
  user.lastTime = message.timestamp;
  addDistance(user.mac, message.agent, calculateDistance(message.rssi));
}

function addDistance(user, agent, distance) {
  if (!users[user].distances[agent]) {
    users[user].distances[agent] = [];
  }
  users[user].distances[agent].push(distance);
  if (users[user].distances[agent].length > 10) {
    users[user].distances[agent].shift();
  }
}


function calculateDistance(rssi) {
  
  const txPower = -34 //hard coded power value. Usually ranges between -59 to -65
  
  if (rssi == 0) {
    return -1.0; 
  }
  return Math.pow(10, ((txPower - rssi) - 41) / 20.0);
} 

function getMedian(values) {
  const vals = values.slice().sort((a, b) => a - b);
  const median = (vals[(vals.length - 1) >> 1] + vals[vals.length >> 1]) / 2;
  return median;
}

setInterval(() => { 
  for(let user of Object.values(users)) {
    for(let [agent, values] of Object.entries(user.distances)) {
      // if (!user.agents[agent]) { user.agents[agent] = {} }
      user.agents[agent] = getMedian(values);
    }

    if(Object.keys(user.agents).length === 0 && user.agents.constructor === Object) {
      user.closest_agent = "";
    } else {
      user.closest_agent = Object.keys(user.agents).reduce((a, b) => user.agents[a] < user.agents[b] ? a : b);
    }
    
    Stream.emit("push", "message", user);
  }
}, 2000);