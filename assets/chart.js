const chartElements = document.querySelectorAll(".apache-chart");
const EE = [];
for (const chartElement of chartElements) {
  try {
    const options = JSON.parse(chartElement.querySelector("script").innerText);
    const E = echarts.init(chartElement);
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