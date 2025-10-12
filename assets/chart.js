const chartElements = document.querySelectorAll(".apache-chart");
const EE = [];
for (const chartElement of chartElements) {
  try {
    const E = echarts.init(chartElement);
    const options = JSON.parse(chartElement.querySelector("script").innerText);
    E.setOption(options);
    EE.push(E);
  } catch (e) {
    console.error("Failed to initialize chart:", e, chartElement);
  }
}
window.addEventListener('resize', () => {
  for (const E of EE) {
    E.resize();
  }
})