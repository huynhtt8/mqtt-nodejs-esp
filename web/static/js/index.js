const ctx = document.getElementById('myChart').getContext('2d');
const chart = new Chart(ctx, {
    type: 'line',
    data: {
        labels: [],
        datasets: [{
            label: "Temperature",
            borderColor: "#28a745",
            data: [],
            fill: false,
            pointStyle: 'circle',
            backgroundColor: '#1cc88a',
            pointRadius: 5,
            pointHoverRadius: 7,
            lineTension: 0,
        },
        {
            label: "Humidity",
            borderColor: "#17a2b8",
            data: [],
            fill: false,
            pointStyle: 'circle',
            backgroundColor: '#5468ca',
            pointRadius: 5,
            pointHoverRadius: 7,
            lineTension: 0,
        },
        {
            label: "Gas Sensor",
            borderColor: "#FE2EC8",
            data: [],
            fill: false,
            pointStyle: 'circle',
            backgroundColor: '#B4045F',
            pointRadius: 5,
            pointHoverRadius: 7,
            lineTension: 0,
        }]
    },
    options: {}
});

const socket = io('http://localhost:3000');
socket.on('htn/sensors', (data) => {
    console.log(data);
    const date = new Date(data.datetime);
    const time = date.getHours() + "H-" + date.getMinutes() + "M-" + date.getSeconds() + "S";
    const temperatureBox = document.getElementById("temperature-box");
    const temperatureBoxContainer = document.getElementById("temperature-box-container");
    temperatureBox.innerText = data.temp;

    const humidityBox = document.getElementById("humidity-box");
    const humidityBoxContainer = document.getElementById("humidity-box-container");
    humidityBox.innerText = data.humi;

    const gasBox = document.getElementById("gas-box");
    const gasBoxContainer = document.getElementById("gas-box-container");
    gasBox.innerText = data.gas;

    if(data.temp < 10 || data.temp > 40) {
        temperatureBoxContainer.style.backgroundColor = "#fc0a02";
    } else if(data.temp < 20 || data.temp > 35) {
        temperatureBoxContainer.style.backgroundColor = "#ffc107";
    } else {
        temperatureBoxContainer.style.backgroundColor = "#28a745";
    }

    if(data.humi < 40 || data.humi > 80) {
        humidityBoxContainer.style.backgroundColor = "#fc0a02";
    } else if(data.humi < 50 || data.humi > 70) {
        humidityBoxContainer.style.backgroundColor = "#ffc107";
    } else {
        humidityBoxContainer.style.backgroundColor = "#17a2b8";
    }

    if(data.gas > 500) {
        gasBoxContainer.style.backgroundColor = "#fc0a02";
    } else {
        gasBoxContainer.style.backgroundColor = "#28a745";
    }

    if (chart.data.labels.length !== 15) { //If we have less than 15 data points in the graph
        chart.data.labels.push(time);  //Add time in x-asix
        chart.data.datasets[0].data.push(data.temp);
        chart.data.datasets[1].data.push(data.humi);
        chart.data.datasets[2].data.push(data.gas);
    } else { //If there are already 15 data points in the graph.
        chart.data.labels.shift(); //Remove first time data
        chart.data.labels.push(time); //Insert latest time data
        chart.data.datasets[0].data.push(data.temp);
        chart.data.datasets[1].data.push(data.humi);
        chart.data.datasets[2].data.push(data.gas);
    }
    chart.update(); //Update the graph.
});

function chargeStatusLedOne() {
    const ledOneStatus = document.getElementById("switch-led-one").checked;
    socket.emit("led1", ledOneStatus ? 1 : 0);
    console.log("Led One switch to ", ledOneStatus ? "On" : "Off");
}

function chargeStatusLedTwo() {
    const ledTwoStatus = document.getElementById("switch-led-two").checked;
    socket.emit("led2", ledTwoStatus ? 1 : 0);
    console.log("Led Two switch to ", ledTwoStatus ? "On" : "Off");
}