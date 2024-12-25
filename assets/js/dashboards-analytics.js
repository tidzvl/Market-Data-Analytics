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
  { quarter: "2", year: "2014" },
  { quarter: "4", year: "2024" },
];

("use strict");
(function () {
  function setupWebSocket() {
    var socket = io.connect(ApiHost);
    socket.on("connect", function () {
        console.log("Connected to WebSocket");
    });
    socket.on('update_data', function(data) { 
        console.log(data);
        console.log("change");
        getRevenueAndProfit().then((data) => {
          sessionStorage.setItem("RevenueAndProfit", JSON.stringify(data));
          render_website_analytics("US");
          // renderChartSumOfRegion();
        });
        getWeightAndSub().then((data) => {
          sessionStorage.setItem("was", JSON.stringify(data));
          renderSubcategory("US", "2011", "2");
        });
    });
  }
  setupWebSocket();
  // fetch(ApiHost + "/api/getAllProducts", {
  //   method: "GET",
  //   headers: { "Content-type": "application/json; charset=UTF-8" },
  //   // body: JSON.stringify({ region: "US" }),
  // }).then((response) => {
  //   if (response.ok) {
  //     return response.json();
  //   }
  //   throw new Error("Network response was not ok.");
  // })
  // .then((data) => {
  //   console.log(data);
  // })
  // .catch((error) => {
  //   console.error("There was a problem with the fetch operation:", error);
  // });

  // fetch(ApiHost + "/api/test", {
  //   method: "POST",
  //   headers: { "Content-type": "application/json; charset=UTF-8" },
  //   // body: JSON.stringify({ CountryRegionCode: "1", CountryRegionName: "US" }),
  // })
  //   .then((response) => {
  //     if (response.ok) {
  //       return response.json();
  //     }
  //     throw new Error("Network response was not ok.");
  //   })
  //   .then((data) => {
  //     console.log(data);
  //   })
  //   .catch((error) => {
  //     console.error("There was a problem with the fetch operation:", error);
  //   });

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
  const roundToMillions = (num) => (parseFloat(num) / 1000000).toFixed(2);
  const revenueAndProfit = sessionStorage.getItem("RevenueAndProfit");
  if(!revenueAndProfit || revenueAndProfit){
    getRevenueAndProfit().then((data) => {
      sessionStorage.setItem("RevenueAndProfit", JSON.stringify(data));
      render_website_analytics("US");
      renderChartSumOfRegion();
    });
  }else{
    render_website_analytics("US");
    renderChartSumOfRegion();
  }
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
    console.log(mean_data);
    const quarter = [];
    for (const [key, value] of Object.entries(mean_data)) {
      const key = "Q"+value['Quarter']+"/"+value['Year'];
      quarter.push(key);
      // console.log(key);
    }


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
          categories: quarter,
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
  if (!weightAndSub || weightAndSub) {
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

})();
