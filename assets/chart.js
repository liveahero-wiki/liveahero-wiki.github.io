const chartElements = document.querySelectorAll(".apache-chart");
const EE = [];
for (const chartElement of chartElements) {
  try {
    const options = JSON.parse(chartElement.querySelector("script").innerHTML);
    const title = chartElement.parentElement.querySelector("figcaption")?.textContent;
    const subtext = chartElement.dataset.subtext;
    if (title) {
      options.title = {
        text: title,
        left: 'center'
      };
      if (subtext) {
        options.title.subtext = subtext;
      }
    }
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