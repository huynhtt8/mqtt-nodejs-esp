const mysql = require('mysql');
const mqtt = require('mqtt')
const client = mqtt.connect({ host: 'localhost', port: 1883 });
const express = require('express');
const app = require('express')();
const server = require('http').Server(app);
const io = require('socket.io')(server);

server.listen(3000);
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});
app.use("/static", express.static(__dirname + '/static'));

const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'root',
  database: 'homework_thcs'
});

connection.connect(function(err) {
  if (err) throw err;
  console.log("Connected to Database!");
});

function publish(topic, msg, options) {
  console.log("publishing to", topic, " : ", msg);
  if (client.connected === true) {
    client.publish(topic, msg.toString(), options);
  }
}

client.on('connect', function () {
  client.subscribe('htn/sensors', function (err) {
    if (err) {
      console.log('Cant connect to topic htn/sensors')
    }
  })
})

const sql = "INSERT INTO `sensors` (temp, humi, datetime) VALUES (?, ?, ?)";

client.on('message', function (topic, message) {
  if (topic === 'htn/sensors') {
    const payload = JSON.parse(message);
    const temp = payload['temp'];
    const humi = payload['humi'];
    const datetime = new Date();
    io.sockets.emit('htn/sensors', {"temp": temp, "humi": humi, "datetime": datetime});

    const values = [
        temp,
        humi,
        datetime
    ];
    connection.query(sql, values, function (err, result) {
      if (err) throw err;
      console.log(payload, "added to database");
    });
  }
});

io.on('connection', (socket) => {
  socket.on('led1', (data) => {
      console.log("Led One switch to", data === 1 ? "On" : "Off");
      publish('htn/led1', data, options);
  });

  socket.on('led2', (data) => {
    console.log("Led Two switch to", data === 1 ? "On" : "Off");
    publish('htn/led2', data, options);
  });
});

const options = {
  retain: true,
  qos: 1
};