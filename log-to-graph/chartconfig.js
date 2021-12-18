function addData(chart, label, data, dataset) {
    chart.data.labels.push(label);
    charts.data.datasets[dataset].data.push(data);
    chart.update();
}

function addDataset(){
  
}

function removeData(chart) {
    chart.data.labels.pop();
    chart.data.datasets.forEach((dataset) => {
        dataset.data.pop();
    });
    chart.update();
}
 
const total_labels = [
  ''
];

const total_data = {
  labels: total_labels,
  datasets: [{
    label: 'Players connected',
    backgroundColor: 'rgb(100, 204, 255)',
    borderColor: 'rgb(99, 184, 226)',
    data: [0],
  }]
};

const total_config = {
  type: 'line',
  data: total_data,
  options: {}
};

var totalChart = new Chart(
    document.getElementById('totalConnected'),
    total_config
);

const player_labels = [];

const player_data = {
  labels: player_labels,
  datasets: [{
    label: 'Mutual Connections',
    backgroundColor: 'rgb(100, 204, 255)',
    borderColor: 'rgb(99, 184, 226)',
    data: [],
  }]
};

const player_config = {
  type: 'bar',
  data: player_data,
  options: {}
};

var playerChart = new Chart(
    document.getElementById('playerChart'),
    player_config
);