const chartElements = document.querySelectorAll(".apache-chart");
const EE = [];
for (const chartElement of chartElements) {
  const E = echarts.init(chartElement);
  const options = JSON.parse(chartElement.dataset.options);
  E.setOption(options);
  EE.push(E);
}
window.addEventListener('resize', () => {
  for (const E of EE) {
    E.resize();
  }
})