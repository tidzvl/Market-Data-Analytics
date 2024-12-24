/**
 * Analytics Dashboard
 */

//Main Chart USING
let analyticsBarChart, impressionDonutChart, barChart;

let quarterNyear = [
  { quarter: "2", year: "2011" },
  { quarter: "3", year: "2011" },
  { quarter: "4", year: "2011"},
  { quarter: "1", year: "2012"},
  { quarter: "2", year: "2012" },
  { quarter: "3", year: "2012" },
  { quarter: "4", year: "2012"},
  { quarter: "1", year: "2013"},
  { quarter: "2", year: "2013" },
  { quarter: "3", year: "2013" },
  { quarter: "4", year: "2013"},
  { quarter: "1", year: "2014"},
  { quarter: "2", year: "2014" }
];

("use strict");
(function () {
  console.log(quarterNyear[0])
  fetch(ApiHost + "/api/test", {
    method: "POST",
    headers: { "Content-type": "application/json; charset=UTF-8" },
    // body: JSON.stringify({ CountryRegionCode: "1", CountryRegionName: "US" }),
  })
    .then((response) => {
      if (response.ok) {
        return response.json();
      }
      throw new Error("Network response was not ok.");
    })
    .then((data) => {
      console.log(data);
    })
    .catch((error) => {
      console.error("There was a problem with the fetch operation:", error);
    });

  let cardColor, headingColor, labelColor, legendColor, borderColor, shadeColor;

  if (isDarkStyle) {
    cardColor = config.colors_dark.cardColor;
    headingColor = config.colors_dark.headingColor;
    labelColor = config.colors_dark.textMuted;
    legendColor = config.colors_dark.bodyColor;
    borderColor = config.colors_dark.borderColor;
    shadeColor = "dark";
  } else {
    cardColor = config.colors.cardColor;
    headingColor = config.colors.headingColor;
    labelColor = config.colors.textMuted;
    legendColor = config.colors.bodyColor;
    borderColor = config.colors.borderColor;
    shadeColor = "light";
  }

  // Report Chart
  // --------------------------------------------------------------------

  // Radial bar chart functions
  function radialBarChart(color, value) {
    const radialBarChartOpt = {
      chart: {
        height: 50,
        width: 50,
        type: "radialBar",
      },
      plotOptions: {
        radialBar: {
          hollow: {
            size: "25%",
          },
          dataLabels: {
            show: false,
          },
          track: {
            background: borderColor,
          },
        },
      },
      stroke: {
        lineCap: "round",
      },
      colors: [color],
      grid: {
        padding: {
          top: -8,
          bottom: -10,
          left: -5,
          right: 0,
        },
      },
      series: [value],
      labels: ["Progress"],
    };
    return radialBarChartOpt;
  }

  const ReportchartList = document.querySelectorAll(".chart-report");
  if (ReportchartList) {
    ReportchartList.forEach(function (ReportchartEl) {
      const color = config.colors[ReportchartEl.dataset.color],
        series = ReportchartEl.dataset.series;
      const optionsBundle = radialBarChart(color, series);
      const reportChart = new ApexCharts(ReportchartEl, optionsBundle);
      reportChart.render();
    });
  }

  // Analytics - Bar Chart
  // --------------------------------------------------------------------
  async function getRevenueAndProfit() {
    try {
      const response = await fetch(ApiHost + "/api/getRevenueAndProfit");
      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  }
  const tabs = document.querySelectorAll(".nav-item");
  tabs.forEach((tab) => {
    tab.addEventListener("click", function () {
      const country = this.textContent.trim();
      render_website_analytics(country);
    });
  });
  getRevenueAndProfit().then((data) => {
    sessionStorage.setItem("RevenueAndProfit", JSON.stringify(data));
    render_website_analytics("US");
    renderChartSumOfRegion();
  });
  const roundToMillions = (num) => (parseFloat(num) / 1000000).toFixed(2);
  function render_website_analytics(country_tab) {
    // getRevenueAndProfit().then((data) => {
    const data = JSON.parse(sessionStorage.getItem("RevenueAndProfit"));
    //CLEAN DATA BEGIN
    const mean_data = data[country_tab];
    // const roundToTwoDecimalPlaces = (num) => parseFloat(num).toFixed(2);
    const revenueData = mean_data.map((item) =>
      roundToMillions(item.TotalRevenue)
    );
    const profitData = mean_data.map((item) =>
      roundToMillions(item.TotalProfit)
    );
    const Bikes = mean_data.map((item) => parseInt(item.Bikes, 10));
    const Components = mean_data.map((item) => parseInt(item.Components, 10));
    const Clothing = mean_data.map((item) => parseInt(item.Clothing, 10));
    const Accessories = mean_data.map((item) => parseInt(item.Accessories, 10));
    const sumOfRevenue = mean_data.reduce(
      (sum, item) => sum + parseFloat(item.TotalRevenue),
      0
    );
    const sumOfProfit = mean_data.reduce(
      (sum, item) => sum + parseFloat(item.TotalProfit),
      0
    );
    const totalBikes = Bikes.reduce((sum, value) => sum + value, 0);
    const totalComponents = Components.reduce((sum, value) => sum + value, 0);
    const totalClothing = Clothing.reduce((sum, value) => sum + value, 0);
    const totalAccessories = Accessories.reduce((sum, value) => sum + value, 0);
    const profitmargin = parseFloat((sumOfProfit / sumOfRevenue) * 100).toFixed(
      2
    );
    //CLEAN DATA END
    document.querySelector(".sumofrevenue").innerHTML =
      roundToMillions(sumOfRevenue) + "M";
    document.querySelector(".sumofprofit").innerHTML =
      roundToMillions(sumOfProfit) + "M";
    document.querySelector(".profitmargin").innerHTML = profitmargin + "%";
    // document.querySelector(".chartofmargin").setAttribute('data-series', profitmargin);
    const analyticsBarChartEl = document.querySelector("#analyticsBarChart"),
      analyticsBarChartConfig = {
        chart: {
          height: 250,
          type: "bar",
          toolbar: {
            show: true,
          },
          events: {
            dataPointSelection: function (event, context, opts){
              let where = opts.dataPointIndex;
              let country;
              const navLinks = document.querySelectorAll(".nav-link");
              const selectedLink = Array.from(navLinks).find(
                (link) => link.getAttribute("aria-selected") === "true"
              );
              if (selectedLink) {
                const selectedText = selectedLink.textContent;
                country = selectedText;
              }
              // console.log("you click at ", where, " in ", country);
              const data_quarter = mean_data[where];
              // console.log(typeof(parseInt(data_quarter['Accessories'])));
                impressionDonutChart.updateOptions({ 
                  series: [ 
                    parseInt(data_quarter["Bikes"]), 
                    parseInt(data_quarter["Components"]), 
                    parseInt(data_quarter["Clothing"]), 
                    parseInt(data_quarter["Accessories"]),
                  ], 
                }, true); 
                updateRenderSubCategory(country, quarterNyear[where].year, quarterNyear[where].quarter); 
            }
          }
        },
        plotOptions: {
          bar: {
            horizontal: false,
            columnWidth: "30%",
            borderRadius: 3,
            startingShape: "rounded",
          },
        },
        dataLabels: {
          enabled: false,
        },
        colors: [config.colors.primary, "rgba(253,172,65,1)"],
        series: [
          {
            name: "Revenue",
            data: revenueData,
          },
          {
            name: "Profit",
            data: profitData,
          },
        ],
        grid: {
          borderColor: borderColor,
          padding: {
            bottom: -8,
          },
        },
        xaxis: {
          categories: [
            "Q2/2011",
            "Q3/2011",
            "Q4/2011",
            "Q1/2012",
            "Q2/2012",
            "Q3/2012",
            "Q4/2012",
            "Q1/2013",
            "Q2/2013",
            "Q3/2013",
            "Q4/2013",
            "Q1/2014",
            "Q2/2014",
          ],
          axisBorder: {
            show: false,
          },
          axisTicks: {
            show: false,
          },
          labels: {
            style: {
              colors: labelColor,
            },
          },
        },
        yaxis: {
          min: 0,
          max: Math.max(...revenueData.map(parseFloat)),
          tickAmount: 5,
          labels: {
            style: {
              colors: labelColor,
            },
          },
        },
        legend: {
          show: false,
        },
        tooltip: {
          y: {
            formatter: function (val, context) {
              // let where = context.dataPointIndex;
              // let country;
              // const navLinks = document.querySelectorAll(".nav-link");
              // const selectedLink = Array.from(navLinks).find(
              //   (link) => link.getAttribute("aria-selected") === "true"
              // );
              // if (selectedLink) {
              //   const selectedText = selectedLink.textContent;
              //   country = selectedText;
              // }
              // // console.log("you click at ", where, " in ", country);
              // const data_quarter = mean_data[where];
              // // console.log(typeof(parseInt(data_quarter['Accessories'])));
              //   impressionDonutChart.updateOptions({ 
              //     series: [ 
              //       parseInt(data_quarter["Bikes"]), 
              //       parseInt(data_quarter["Components"]), 
              //       parseInt(data_quarter["Clothing"]), 
              //       parseInt(data_quarter["Accessories"]),
              //     ], 
              //   }, true); 
              //   updateRenderSubCategory(country, quarterNyear[where].year, quarterNyear[where].quarter); 
              return "$ " + val + " millions";
            },
          },
        },
      };
    if (
      typeof analyticsBarChartEl !== undefined &&
      analyticsBarChartEl !== null
    ) {
      if (analyticsBarChart) analyticsBarChart.destroy();
      analyticsBarChart = new ApexCharts(
        analyticsBarChartEl,
        analyticsBarChartConfig
      );
      analyticsBarChart.render();
    }
    // });
    //donut category chart
    const impressionDonutChartEl = document.querySelector(
        "#impressionDonutChart"
      ),
      impressionDonutChartConfig = {
        chart: {
          height: 185,
          fontFamily: "IBM Plex Sans",
          type: "donut",
        },
        dataLabels: {
          enabled: false,
        },
        grid: {
          padding: {
            bottom: -10,
          },
        },
        series: [totalBikes, totalComponents, totalClothing, totalAccessories],
        labels: ["Bikes", "Components", "Clothing", "Accessories"],
        stroke: {
          width: 0,
          lineCap: "round",
        },
        colors: [
          config.colors.success,
          config.colors.primary,
          config.colors.info,
          config.colors.warning,
        ],
        plotOptions: {
          pie: {
            donut: {
              size: "90%",
              labels: {
                show: true,
                name: {
                  fontSize: "0.938rem",
                  offsetY: 20,
                },
                value: {
                  show: true,
                  fontSize: "1.625rem",
                  fontFamily: "Rubik",
                  fontWeight: "500",
                  color: headingColor,
                  offsetY: -20,
                  formatter: function (val) {
                    return val;
                  },
                },
                total: {
                  show: true,
                  label: "Products",
                  color: legendColor,
                  formatter: function (w) {
                    return w.globals.seriesTotals.reduce(function (a, b) {
                      return a + b;
                    }, 0);
                  },
                },
              },
            },
          },
        },
        legend: {
          show: true,
          position: "bottom",
          horizontalAlign: "center",
          labels: {
            colors: legendColor,
            useSeriesColors: false,
          },
          markers: {
            width: 10,
            height: 10,
            offsetX: -3,
          },
        },
      };

    if (
      typeof impressionDonutChartEl !== undefined &&
      impressionDonutChartEl !== null
    ) {
      if (impressionDonutChart) impressionDonutChart.destroy();
      impressionDonutChart = new ApexCharts(
        impressionDonutChartEl,
        impressionDonutChartConfig
      );
      impressionDonutChart.render();
    }
  }

  //Line chart sum of region
  function renderChartSumOfRegion() {
    const yellowColor = "#ffe800";
    // let LineborderColor, gridColor, tickColor;
    // if (isDarkStyle) {
    //   LineborderColor = 'rgb(28, 11, 11)';
    //   gridColor = 'rgba(100, 100, 100, 1)';
    //   tickColor = 'rgba(255, 255, 255, 0.75)'; // x & y axis tick color
    // } else {
    //   LineborderColor = '#f0f0f0';
    //   gridColor = '#f0f0f0';
    //   tickColor = 'rgba(0, 0, 0, 0.75)'; // x & y axis tick color
    // }
    const lineChart = document.querySelector("#lineChart");
    const data = JSON.parse(sessionStorage.getItem("RevenueAndProfit"));
    if (lineChart) {
      const revenueAU = data["AU"].map((item) =>
        roundToMillions(item.TotalRevenue)
      );
      console.log(revenueAU);
      const lineChartVar = new Chart(lineChart, {
        type: "line",
        data: {
          labels: [
            "Q2/2011",
            "Q3/2011",
            "Q4/2011",
            "Q1/2012",
            "Q2/2012",
            "Q3/2012",
            "Q4/2012",
            "Q1/2013",
            "Q2/2013",
            "Q3/2013",
            "Q4/2013",
            "Q1/2014",
            "Q2/2014",
          ],
          datasets: [
            {
              data: revenueAU,
              label: "AU",
              borderColor: config.colors.danger,
              tension: 0.5,
              pointStyle: "circle",
              backgroundColor: config.colors.danger,
              fill: false,
              pointRadius: 1,
              pointHoverRadius: 5,
              pointHoverBorderWidth: 5,
              pointBorderColor: "transparent",
              pointHoverBorderColor: cardColor,
              pointHoverBackgroundColor: config.colors.danger,
            },
            {
              data: data["CA"].map((item) =>
                roundToMillions(item.TotalRevenue)
              ),
              label: "CA",
              borderColor: config.colors.primary,
              tension: 0.5,
              pointStyle: "circle",
              backgroundColor: config.colors.primary,
              fill: false,
              pointRadius: 1,
              pointHoverRadius: 5,
              pointHoverBorderWidth: 5,
              pointBorderColor: "transparent",
              pointHoverBorderColor: cardColor,
              pointHoverBackgroundColor: config.colors.primary,
            },
            {
              data: data["DE"].map((item) =>
                roundToMillions(item.TotalRevenue)
              ),
              label: "DE",
              borderColor: yellowColor,
              tension: 0.5,
              pointStyle: "circle",
              backgroundColor: yellowColor,
              fill: false,
              pointRadius: 1,
              pointHoverRadius: 5,
              pointHoverBorderWidth: 5,
              pointBorderColor: "transparent",
              pointHoverBorderColor: cardColor,
              pointHoverBackgroundColor: yellowColor,
            },
            {
              data: data["FR"].map((item) =>
                roundToMillions(item.TotalRevenue)
              ),
              label: "FR",
              borderColor: "rgb(184, 30, 178)",
              tension: 0.5,
              pointStyle: "circle",
              backgroundColor: "rgb(184, 30, 178)",
              fill: false,
              pointRadius: 1,
              pointHoverRadius: 5,
              pointHoverBorderWidth: 5,
              pointBorderColor: "transparent",
              pointHoverBorderColor: cardColor,
              pointHoverBackgroundColor: "rgb(184, 30, 178)",
            },
            {
              data: data["GB"].map((item) =>
                roundToMillions(item.TotalRevenue)
              ),
              label: "GB",
              borderColor: "rgb(43, 184, 30)",
              tension: 0.5,
              pointStyle: "circle",
              backgroundColor: "rgb(43, 184, 30)",
              fill: false,
              pointRadius: 1,
              pointHoverRadius: 5,
              pointHoverBorderWidth: 5,
              pointBorderColor: "transparent",
              pointHoverBorderColor: cardColor,
              pointHoverBackgroundColor: "rgb(43, 184, 30)",
            },
            {
              data: data["US"].map((item) =>
                roundToMillions(item.TotalRevenue)
              ),
              label: "US",
              borderColor: "rgb(11, 41, 70)",
              tension: 0.5,
              pointStyle: "circle",
              backgroundColor: "rgb(11, 41, 70)",
              fill: false,
              pointRadius: 1,
              pointHoverRadius: 5,
              pointHoverBorderWidth: 5,
              pointBorderColor: "transparent",
              pointHoverBorderColor: cardColor,
              pointHoverBackgroundColor: "rgb(11, 41, 70)",
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            x: {
              grid: {
                color: borderColor,
                drawBorder: false,
                borderColor: borderColor,
              },
              ticks: {
                color: labelColor,
              },
            },
            y: {
              scaleLabel: {
                display: true,
              },
              min: -1,
              max: 10,
              ticks: {
                color: labelColor,
                stepSize: 0.2,
              },
              grid: {
                color: borderColor,
                drawBorder: false,
                borderColor: borderColor,
              },
            },
          },
          plugins: {
            tooltip: {
              // Updated default tooltip UI
              rtl: isRtl,
              backgroundColor: cardColor,
              titleColor: headingColor,
              bodyColor: legendColor,
              borderWidth: 1,
              borderColor: borderColor,
            },
            legend: {
              position: "top",
              align: "start",
              rtl: isRtl,
              labels: {
                usePointStyle: true,
                padding: 35,
                boxWidth: 6,
                boxHeight: 6,
                color: legendColor,
              },
            },
          },
        },
      });
    }
  }

  //END Line chart sum of region

  //BEGIN SUB CATEGORY CALCULATE

  async function getWeightAndSub() {
    try {
      const response = await fetch(ApiHost + "/api/getWeightAndSubcategory");
      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  }

  const weightAndSub = sessionStorage.getItem("was");
  if (!weightAndSub) {
    getWeightAndSub().then((data) => {
      sessionStorage.setItem("was", JSON.stringify(data));
      // console.log(data);
      renderSubcategory("US", "2011", "2");
    });
  } else {
    renderSubcategory("US", "2011", "2");
  }


  function updateRenderSubCategory(country, year, quarter) {
    const data = JSON.parse(sessionStorage.getItem("was"));
    const mean_data = data[country][year][quarter];
    const subCategoryName = [];
    const profit = [];
    const weight = [];
    for (const [key, value] of Object.entries(mean_data)) {
      subCategoryName.push(key);
      profit.push(value.Profit);
      weight.push(value.Weight);
    }

    barChart.updateOptions({
      series: [
        {
          data: profit,
        },
        {
          data: weight,
        },
      ],
      xaxis: {
        categories: subCategoryName,
      }
    }, true)
  }

  function renderSubcategory(country, year, quarter) {
    const data = JSON.parse(sessionStorage.getItem("was"));
    const mean_data = data[country][year][quarter];
    const subCategoryName = [];
    const profit = [];
    const weight = [];
    for (const [key, value] of Object.entries(mean_data)) {
      subCategoryName.push(key);
      profit.push(value.Profit);
      weight.push(value.Weight);
    }


    const barChartEl = document.querySelector("#barChart"),
      barChartConfig = {
        chart: {
          height: 400,
          type: "bar",
          stacked: true,
          parentHeightOffset: 0,
          toolbar: {
            show: false,
          },
        },
        plotOptions: {
          bar: {
            columnWidth: "15%",
            colors: {
              backgroundBarColors: [
                "#f8d3ff",
                "#f8d3ff",
                "#f8d3ff",
                "#f8d3ff",
                "#f8d3ff",
              ],
              backgroundBarRadius: 10,
            },
          },
        },
        dataLabels: {
          enabled: false,
        },
        legend: {
          show: true,
          position: "top",
          horizontalAlign: "start",
          labels: {
            colors: legendColor,
            useSeriesColors: false,
          },
        },
        colors: ["rgba(130,106,249,1)", "rgba(210,176,255,1)"],
        stroke: {
          show: true,
          colors: ["transparent"],
        },
        grid: {
          borderColor: borderColor,
          xaxis: {
            lines: {
              show: true,
            },
          },
        },
        series: [
          {
            name: "Percent of profit",
            data: profit,
          },
          {
            name: "Percent of weigth",
            data: weight,
          },
        ],
        xaxis: {
          categories: subCategoryName,
          axisBorder: {
            show: false,
          },
          axisTicks: {
            show: false,
          },
          labels: {
            style: {
              colors: labelColor,
              fontSize: "13px",
            },
          },
        },
        yaxis: {
          labels: {
            style: {
              colors: labelColor,
              fontSize: "13px",
            },
          },
        },
        fill: {
          opacity: 1,
        },
      };
    if (typeof barChartEl !== undefined && barChartEl !== null) {
      if (barChart) barChart.destroy();
      barChart = new ApexCharts(barChartEl, barChartConfig);
      barChart.render();
    }
  }

  //END SUB CATEGORY

  // Referral - Line Chart
  // --------------------------------------------------------------------
  const referralLineChartEl = document.querySelector("#referralLineChart"),
    referralLineChartConfig = {
      series: [
        {
          data: [0, 150, 25, 100, 15, 149],
        },
      ],
      chart: {
        height: 100,
        parentHeightOffset: 0,
        parentWidthOffset: 0,
        type: "line",
        toolbar: {
          show: false,
        },
      },
      markers: {
        size: 6,
        colors: "transparent",
        strokeColors: "transparent",
        strokeWidth: 4,
        discrete: [
          {
            fillColor: cardColor,
            seriesIndex: 0,
            dataPointIndex: 5,
            strokeColor: config.colors.success,
            strokeWidth: 4,
            size: 6,
            radius: 2,
          },
        ],
        hover: {
          size: 7,
        },
      },
      dataLabels: {
        enabled: false,
      },
      stroke: {
        width: 4,
        curve: "smooth",
      },
      grid: {
        show: false,
        padding: {
          top: -25,
          bottom: -20,
        },
      },
      colors: [config.colors.success],
      xaxis: {
        show: false,
        axisBorder: {
          show: false,
        },
        axisTicks: {
          show: false,
        },
        labels: {
          show: false,
        },
      },
      yaxis: {
        labels: {
          show: false,
        },
      },
    };

  if (
    typeof referralLineChartEl !== undefined &&
    referralLineChartEl !== null
  ) {
    const referralLineChart = new ApexCharts(
      referralLineChartEl,
      referralLineChartConfig
    );
    referralLineChart.render();
  }

  // Conversion - Bar Chart
  // --------------------------------------------------------------------
  const conversionBarChartEl = document.querySelector("#conversionBarchart"),
    conversionBarChartConfig = {
      chart: {
        height: 100,
        stacked: true,
        type: "bar",
        toolbar: {
          show: false,
        },
        sparkline: {
          enabled: true,
        },
      },
      plotOptions: {
        bar: {
          columnWidth: "25%",
          borderRadius: 2,
          startingShape: "rounded",
        },
        distributed: true,
      },
      colors: [config.colors.primary, config.colors.warning],
      series: [
        {
          name: "New Clients",
          data: [
            75, 150, 225, 200, 35, 50, 150, 180, 50, 150, 240, 140, 75, 35, 60,
            120,
          ],
        },
        {
          name: "Retained Clients",
          data: [
            -100, -55, -40, -120, -70, -40, -60, -50, -70, -30, -60, -40, -50,
            -70, -40, -50,
          ],
        },
      ],
      grid: {
        show: false,
        padding: {
          top: 0,
          bottom: -10,
        },
      },
      legend: {
        show: false,
      },
      dataLabels: {
        enabled: false,
      },
      tooltip: {
        x: {
          show: false,
        },
      },
    };

  if (
    typeof conversionBarChartEl !== undefined &&
    conversionBarChartEl !== null
  ) {
    const conversionBarChart = new ApexCharts(
      conversionBarChartEl,
      conversionBarChartConfig
    );
    conversionBarChart.render();
  }

  // Impression - Donut Chart
  // --------------------------------------------------------------------
  // const impressionDonutChartEl = document.querySelector(
  //     "#impressionDonutChart"
  //   ),
  //   impressionDonutChartConfig = {
  //     chart: {
  //       height: 185,
  //       fontFamily: "IBM Plex Sans",
  //       type: "donut",
  //     },
  //     dataLabels: {
  //       enabled: false,
  //     },
  //     grid: {
  //       padding: {
  //         bottom: -10,
  //       },
  //     },
  //     series: [80, 30, 60],
  //     labels: ["Social", "Email", "Search"],
  //     stroke: {
  //       width: 0,
  //       lineCap: "round",
  //     },
  //     colors: [
  //       config.colors.primary,
  //       config.colors.info,
  //       config.colors.warning,
  //     ],
  //     plotOptions: {
  //       pie: {
  //         donut: {
  //           size: "90%",
  //           labels: {
  //             show: true,
  //             name: {
  //               fontSize: "0.938rem",
  //               offsetY: 20,
  //             },
  //             value: {
  //               show: true,
  //               fontSize: "1.625rem",
  //               fontFamily: "Rubik",
  //               fontWeight: "500",
  //               color: headingColor,
  //               offsetY: -20,
  //               formatter: function (val) {
  //                 return val;
  //               },
  //             },
  //             total: {
  //               show: true,
  //               label: "Impression",
  //               color: legendColor,
  //               formatter: function (w) {
  //                 return w.globals.seriesTotals.reduce(function (a, b) {
  //                   return a + b;
  //                 }, 0);
  //               },
  //             },
  //           },
  //         },
  //       },
  //     },
  //     legend: {
  //       show: true,
  //       position: "bottom",
  //       horizontalAlign: "center",
  //       labels: {
  //         colors: legendColor,
  //         useSeriesColors: false,
  //       },
  //       markers: {
  //         width: 10,
  //         height: 10,
  //         offsetX: -3,
  //       },
  //     },
  //   };

  // if (
  //   typeof impressionDonutChartEl !== undefined &&
  //   impressionDonutChartEl !== null
  // ) {
  //   const impressionDonutChart = new ApexCharts(
  //     impressionDonutChartEl,
  //     impressionDonutChartConfig
  //   );
  //   impressionDonutChart.render();
  // }

  // Conversion - Gradient Line Chart
  // --------------------------------------------------------------------
  const conversationChartEl = document.querySelector("#conversationChart"),
    conversationChartConfig = {
      series: [
        {
          data: [50, 100, 0, 60, 20, 30],
        },
      ],
      chart: {
        height: 40,
        type: "line",
        zoom: {
          enabled: false,
        },
        sparkline: {
          enabled: true,
        },
        toolbar: {
          show: false,
        },
      },
      dataLabels: {
        enabled: false,
      },
      tooltip: {
        enabled: false,
      },
      stroke: {
        curve: "smooth",
        width: 3,
      },
      grid: {
        show: false,
        padding: {
          top: 5,
          left: 10,
          right: 10,
          bottom: 5,
        },
      },
      colors: [config.colors.primary],
      fill: {
        type: "gradient",
        gradient: {
          shade: shadeColor,
          type: "horizontal",
          gradientToColors: undefined,
          opacityFrom: 0,
          opacityTo: 0.9,
          stops: [0, 30, 70, 100],
        },
      },
      xaxis: {
        labels: {
          show: false,
        },
        axisBorder: {
          show: false,
        },
        axisTicks: {
          show: false,
        },
      },
      yaxis: {
        labels: {
          show: false,
        },
      },
    };
  if (
    typeof conversationChartEl !== undefined &&
    conversationChartEl !== null
  ) {
    const conversationChart = new ApexCharts(
      conversationChartEl,
      conversationChartConfig
    );
    conversationChart.render();
  }

  // Income - Gradient Line Chart
  // --------------------------------------------------------------------
  const incomeChartEl = document.querySelector("#incomeChart"),
    incomeChartConfig = {
      series: [
        {
          data: [40, 70, 38, 90, 40, 65],
        },
      ],
      chart: {
        height: 40,
        type: "line",
        zoom: {
          enabled: false,
        },
        sparkline: {
          enabled: true,
        },
        toolbar: {
          show: false,
        },
      },
      dataLabels: {
        enabled: false,
      },
      tooltip: {
        enabled: false,
      },
      stroke: {
        curve: "smooth",
        width: 3,
      },
      grid: {
        show: false,
        padding: {
          top: 10,
          left: 10,
          right: 10,
          bottom: 0,
        },
      },
      colors: [config.colors.warning],
      fill: {
        type: "gradient",
        gradient: {
          shade: shadeColor,
          type: "horizontal",
          gradientToColors: undefined,
          opacityFrom: 0,
          opacityTo: 0.9,
          stops: [0, 30, 70, 100],
        },
      },
      xaxis: {
        labels: {
          show: false,
        },
        axisBorder: {
          show: false,
        },
        axisTicks: {
          show: false,
        },
      },
      yaxis: {
        labels: {
          show: false,
        },
      },
    };
  if (typeof incomeChartEl !== undefined && incomeChartEl !== null) {
    const incomeChart = new ApexCharts(incomeChartEl, incomeChartConfig);
    incomeChart.render();
  }

  // Registrations Bar Chart
  // --------------------------------------------------------------------
  const registrationsBarChartEl = document.querySelector(
      "#registrationsBarChart"
    ),
    registrationsBarChartConfig = {
      chart: {
        height: 95,
        width: 155,
        type: "bar",
        toolbar: {
          show: false,
        },
      },
      plotOptions: {
        bar: {
          barHeight: "80%",
          columnWidth: "50%",
          startingShape: "rounded",
          endingShape: "rounded",
          borderRadius: 2,
          distributed: true,
        },
      },
      grid: {
        show: false,
        padding: {
          top: -20,
          bottom: -20,
          left: 0,
          right: 0,
        },
      },
      colors: [
        config.colors_label.warning,
        config.colors_label.warning,
        config.colors_label.warning,
        config.colors_label.warning,
        config.colors.warning,
        config.colors_label.warning,
        config.colors_label.warning,
      ],
      dataLabels: {
        enabled: false,
      },
      series: [
        {
          data: [30, 55, 45, 95, 70, 50, 65],
        },
      ],
      legend: {
        show: false,
      },
      xaxis: {
        categories: ["M", "T", "W", "T", "F", "S", "S"],
        axisBorder: {
          show: false,
        },
        axisTicks: {
          show: false,
        },
        labels: {
          show: false,
        },
      },
      yaxis: {
        labels: {
          show: false,
        },
      },
    };
  if (
    typeof registrationsBarChartEl !== undefined &&
    registrationsBarChartEl !== null
  ) {
    const registrationsBarChart = new ApexCharts(
      registrationsBarChartEl,
      registrationsBarChartConfig
    );
    registrationsBarChart.render();
  }

  // Sales Bar Chart
  // --------------------------------------------------------------------
  const salesBarChartEl = document.querySelector("#salesChart"),
    salesBarChartConfig = {
      chart: {
        height: 120,
        parentHeightOffset: 0,
        type: "bar",
        toolbar: {
          show: false,
        },
      },
      plotOptions: {
        bar: {
          barHeight: "100%",
          columnWidth: "25px",
          startingShape: "rounded",
          endingShape: "rounded",
          borderRadius: 5,
          distributed: true,
          colors: {
            backgroundBarColors: [
              config.colors_label.primary,
              config.colors_label.primary,
              config.colors_label.primary,
              config.colors_label.primary,
            ],
            backgroundBarRadius: 5,
          },
        },
      },
      grid: {
        show: false,
        padding: {
          top: -30,
          left: -12,
          bottom: 10,
        },
      },
      colors: [config.colors.primary],
      dataLabels: {
        enabled: false,
      },
      series: [
        {
          data: [60, 35, 25, 75, 15, 42, 85],
        },
      ],
      legend: {
        show: false,
      },
      xaxis: {
        categories: ["S", "M", "T", "W", "T", "F", "S"],
        axisBorder: {
          show: false,
        },
        axisTicks: {
          show: false,
        },
        labels: {
          style: {
            colors: labelColor,
            fontSize: "13px",
          },
        },
      },
      yaxis: {
        labels: {
          show: false,
        },
      },
      responsive: [
        {
          breakpoint: 1440,
          options: {
            plotOptions: {
              bar: {
                columnWidth: "30%",
              },
            },
          },
        },
        {
          breakpoint: 1200,
          options: {
            plotOptions: {
              bar: {
                columnWidth: "15%",
              },
            },
          },
        },
        {
          breakpoint: 768,
          options: {
            plotOptions: {
              bar: {
                columnWidth: "12%",
              },
            },
          },
        },
        {
          breakpoint: 450,
          options: {
            plotOptions: {
              bar: {
                columnWidth: "19%",
              },
            },
          },
        },
      ],
    };
  if (typeof salesBarChartEl !== undefined && salesBarChartEl !== null) {
    const salesBarChart = new ApexCharts(salesBarChartEl, salesBarChartConfig);
    salesBarChart.render();
  }

  // Growth - Radial Bar Chart
  // --------------------------------------------------------------------
  const growthRadialChartEl = document.querySelector("#growthRadialChart"),
    growthRadialChartConfig = {
      chart: {
        height: 230,
        fontFamily: "IBM Plex Sans",
        type: "radialBar",
        sparkline: {
          show: true,
        },
      },
      grid: {
        show: false,
        padding: {
          top: -25,
        },
      },
      plotOptions: {
        radialBar: {
          size: 100,
          startAngle: -135,
          endAngle: 135,
          offsetY: 10,
          hollow: {
            size: "55%",
          },
          track: {
            strokeWidth: "50%",
            background: cardColor,
          },
          dataLabels: {
            value: {
              offsetY: -15,
              color: headingColor,
              fontFamily: "Rubik",
              fontWeight: 500,
              fontSize: "26px",
            },
            name: {
              fontSize: "15px",
              color: legendColor,
              offsetY: 24,
            },
          },
        },
      },
      colors: [config.colors.danger],
      fill: {
        type: "gradient",
        gradient: {
          shade: "dark",
          type: "horizontal",
          shadeIntensity: 0.5,
          gradientToColors: [config.colors.primary],
          inverseColors: true,
          opacityFrom: 1,
          opacityTo: 1,
          stops: [0, 100],
        },
      },
      stroke: {
        dashArray: 3,
      },
      series: [78],
      labels: ["Mortality"],
    };

  if (
    typeof growthRadialChartEl !== undefined &&
    growthRadialChartEl !== null
  ) {
    const growthRadialChart = new ApexCharts(
      growthRadialChartEl,
      growthRadialChartConfig
    );
    growthRadialChart.render();
  }
})();
