const mqtt = require('mqtt')
const BeaconScanner = require('node-beacon-scanner');
const Scanner = new BeaconScanner();
const moment = require('moment');

const brockerUrl = 'mqtt://192.168.1.25:1883';
const client = mqtt.connect(brockerUrl);
const agentName = "beacon2";

const macAddresses = [
  "ef:c1:ae:82:a6:21",
  "d3:4c:94:3e:bc:8d"
];

Scanner.startScan().then(() => {
	console.log('Started to scan.')  ;
}).catch((error) => {
	console.error(error);
});

Scanner.onadvertisement = (ad) => {
  if (macAddresses.includes(ad.address)) {
    const message = {
      agent: agentName,
      mac: ad.address,
      timestamp: Math.floor(Date.now() / 1000),
      rssi: ad.rssi,
      url: ad.eddystoneUrl.url
    };
    // console.log(message);
    sendUpdate(message);
  }
}

client.on('connect', () => {
  // Inform controllers that garage is connected
  console.log("Beacon/connected");
  const message = { 
    agent: agentName,
    connected:'true'
  }
  client.publish('beacon/connected', JSON.stringify(message));
  
 

    // if (users[ad.address]) {
    //   const user = users[ad.address];
    //   //console.log(`${user.name} is around`);
    //   user.lastTime = moment();
    //   if (user.around == false) {
    //     user.around = true;
    //     console.log(`${user.name} just arrived`);
    //     sendUpdate(user.item, "ON")
    //   }
    // }
  
})

function sendUpdate(message) {
  console.log(`sending state ${message.mac} ${message.timestamp} ${message.rssi} ${message.url}`);
  client.publish('beacon/state', JSON.stringify(message));
}

function handleAppExit(options, err) {
  if (err) {
    console.log(err.stack)
  }

  if (options.cleanup) {
    client.publish('beacon/connected', 'false')
  }

  if (options.exit) {
    process.exit()
  }
}

process.on('exit', handleAppExit.bind(null, {
  cleanup: true
}))
process.on('SIGINT', handleAppExit.bind(null, {
  exit: true
}))
process.on('uncaughtException', handleAppExit.bind(null, {
  exit: true
}))