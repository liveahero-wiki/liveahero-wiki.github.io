const chartElements = document.querySelectorAll(".apache-chart");
for (const chartElement of chartElements) {
  const E = echarts.init(chartElement);
  const options = JSON.parse(E.dataset.options);
  E.setOption(options);
}