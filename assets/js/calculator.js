/*
/* File: calculator.js
/* Author: TiDz
/* Contact: nguyentinvs123@gmail.com
 * Created on Fri Dec 27 2024
 * Description: 
 * Useage: 
 */

("use strict");

(function () {
  function calculateTotal(data) {
    return Object.values(data).reduce((sum, value) => sum + value, 0);
  }
  const calculate = document.querySelectorAll(".forbus");
  calculate.forEach((calcu) => {
    calcu.addEventListener("click", () => {
      //BEGIN ABOUT
      const region = document.querySelector("#region-bus").value,
        time = document.querySelector("#time-bus").value,
        weight = document.querySelector("#input-weight").value,
        unit = document.querySelector("#unit-org").value;
      let inventory = document.querySelector("#input-inventory").value;
      console.log(region, time, weight, inventory, unit);
      //END ABOUT

      //BEGIN IMPORT DATA

      const bike_data = {};
      const compo_data = {};
      const clothing_data = {};
      const access_data = {};
      document.querySelectorAll(".catebikes").forEach(function (item) {
        bike_data[item.name] = isNaN(parseFloat(item.value))
          ? 0
          : unit == "percent"
          ? parseFloat(item.value) / 100
          : parseFloat(item.value) / weight;
      });
      document.querySelectorAll(".catecompo").forEach(function (item) {
        compo_data[item.name] = isNaN(parseFloat(item.value))
          ? 0
          : unit == "percent"
          ? parseFloat(item.value) / 100
          : parseFloat(item.value) / weight;
      });
      document.querySelectorAll(".cateclo").forEach(function (item) {
        clothing_data[item.name] = isNaN(parseFloat(item.value))
          ? 0
          : unit == "percent"
          ? parseFloat(item.value) / 100
          : parseFloat(item.value) / weight;
      });
      document.querySelectorAll(".cateacces").forEach(function (item) {
        access_data[item.name] = isNaN(parseFloat(item.value))
          ? 0
          : unit == "percent"
          ? parseFloat(item.value) / 100
          : parseFloat(item.value) / weight;
      });
      //END IMPORT DATA

      //BEGIN VALID CHECK
      if (weight == "") {
        Swal.fire({
          title: "Error!",
          text: " Please enter your warehouse capacity!",
          icon: "error",
          customClass: {
            confirmButton: "btn btn-primary",
          },
          buttonsStyling: false,
        });
        return;
      }

      if (unit == "percent") {
        const totalBike = calculateTotal(bike_data);
        const totalCompo = calculateTotal(compo_data);
        const totalClothing = calculateTotal(clothing_data);
        const totalAccess = calculateTotal(access_data);
        const total = totalBike + totalCompo + totalClothing + totalAccess;
        if (total < 0 || total > 1) {
          Swal.fire({
            title: "Error!",
            text: " Your data is out of 100%!",
            icon: "error",
            customClass: {
              confirmButton: "btn btn-primary",
            },
            buttonsStyling: false,
          });
          return;
        }
        if (inventory != "" && parseFloat(inventory) > 0)
          inventory = parseFloat(inventory) / 100;
      }
      if (unit == "kg") {
        const totalBike = calculateTotal(bike_data);
        const totalCompo = calculateTotal(compo_data);
        const totalClothing = calculateTotal(clothing_data);
        const totalAccess = calculateTotal(access_data);
        const total = totalBike + totalCompo + totalClothing + totalAccess;
        console.log(total);
        if (total < 0 || total > 1) {
          Swal.fire({
            title: "Error!",
            text: " Your data is out of 100%!",
            icon: "error",
            customClass: {
              confirmButton: "btn btn-primary",
            },
            buttonsStyling: false,
          });
          return;
        }
        if (inventory != "" && parseFloat(inventory) > 0)
          inventory = parseFloat(inventory) / parseFloat(weight);
      }
      const about = {
        region: region,
        time: time,
        weight: weight,
        inventory: inventory.toString(),
        unit: unit,
      };
      //END VALID CHECK
      const calcu_data = {
        ...about,
        ...bike_data,
        ...compo_data,
        ...clothing_data,
        ...access_data,
      };
      console.log(calcu_data);
      fetch(ApiHost + "/api/calcuFromImport", {
        method: "POST",
        headers: { "Content-type": "application/json; charset=UTF-8" },
        body: JSON.stringify(calcu_data),
      })
        .then((response) => {
          if (response.ok) {
            Swal.fire({
              title: "Good job!",
              text: "Product deli successful!",
              icon: "success",
              customClass: {
                confirmButton: "btn btn-primary",
              },
              buttonsStyling: false,
            });
            return response.json();
          }
          throw new Error("Network response was not ok.");
        })
        .then((data) => {
          document.querySelectorAll(".card-datatable").forEach(item => { item.classList.remove("d-none");});
          data = data["data"];
          const keysToRemove = [
            "region",
            "time",
            "weight",
            "inventory",
            "unit",
          ];
          keysToRemove.forEach((key) => delete data[key]);
          const cleanedData = Object.keys(data).map((key) => ({
            name: key,
            percent: data[key],
          }));
          var dt_basic_table = $(".datatables-basic");
          if (dt_basic_table.length) {
            var dt_basic = dt_basic_table.DataTable({
              data: cleanedData,
              columns: [
                { data: "name" },
                { data: "percent" },
                { data: "" },
                { data: "" },
              ],
              columnDefs: [
                {
                  // For Responsive
                  className: "control",
                  orderable: false,
                  responsivePriority: 2,
                  searchable: false,
                  targets: 0,
                  render: function (data, type, full, meta) {
                    return "";
                  },
                },
                {
                  targets: 1,
                  searchable: false,
                  visible: false,
                },
                {
                  targets: 2,
                  responsivePriority: 4,
                  render: function (data, type, full, meta) {
                    var $subname = full["name"];
                    return $subname;
                  },
                },
                {
                  targets: 3,
                  responsivePriority: 4,
                  render: function (data, type, full, meta) {
                    var $label = full["percent"];
                    return $label;
                  },
                },
                {
                  targets: 4,
                  responsivePriority: 4,
                  render: function (data, type, full, meta) {
                    var $weight = (full["percent"] * weight).toFixed(2);
                    return $weight;
                  },
                },
                {
                  responsivePriority: 1,
                  targets: 4,
                },
                {
                  // Label
                  targets: -2,
                  render: function (data, type, full, meta) {
                    var $label = full["percent"];
                    return $label;
                  },
                },
              ],
              order: [[2, "desc"]],
              dom: '<"card-header"<"head-label text-center"><"dt-action-buttons text-end"B>><"d-flex justify-content-between align-items-center row"<"col-sm-12 col-md-6"l><"col-sm-12 col-md-6"f>>t<"d-flex justify-content-between row"<"col-sm-12 col-md-6"i><"col-sm-12 col-md-6"p>>',
              displayLength: 7,
              lengthMenu: [7, 10, 25, 50, 75, 100],
              buttons: [
                {
                  extend: "collection",
                  className: "btn btn-label-primary dropdown-toggle me-2",
                  text: '<i class="bx bx-show me-1"></i>Export',
                  buttons: [
                    {
                      extend: "print",
                      text: '<i class="bx bx-printer me-1" ></i>Print',
                      className: "dropdown-item",
                      exportOptions: { columns: [3, 4, 5, 6, 7] },
                    },
                    {
                      extend: "csv",
                      text: '<i class="bx bx-file me-1" ></i>Csv',
                      className: "dropdown-item",
                      exportOptions: { columns: [3, 4, 5, 6, 7] },
                    },
                    {
                      extend: "excel",
                      text: "Excel",
                      className: "dropdown-item",
                      exportOptions: { columns: [3, 4, 5, 6, 7] },
                    },
                    {
                      extend: "pdf",
                      text: '<i class="bx bxs-file-pdf me-1"></i>Pdf',
                      className: "dropdown-item",
                      exportOptions: { columns: [3, 4, 5, 6, 7] },
                    },
                    {
                      extend: "copy",
                      text: '<i class="bx bx-copy me-1" ></i>Copy',
                      className: "dropdown-item",
                      exportOptions: { columns: [3, 4, 5, 6, 7] },
                    },
                  ],
                }
              ],
              responsive: {
                details: {
                  display: $.fn.dataTable.Responsive.display.modal({
                    header: function (row) {
                      var data = row.data();
                      return "Details of " + data["name"];
                    },
                  }),
                  type: "column",
                  renderer: function (api, rowIdx, columns) {
                    var data = $.map(columns, function (col, i) {
                      return col.title !== "" // ? Do not show row in modal popup if title is blank (for check box)
                        ? '<tr data-dt-row="' +
                            col.rowIndex +
                            '" data-dt-column="' +
                            col.columnIndex +
                            '">' +
                            "<td>" +
                            col.title +
                            ":" +
                            "</td> " +
                            "<td>" +
                            col.data +
                            "</td>" +
                            "</tr>"
                        : "";
                    }).join("");

                    return data
                      ? $('<table class="table"/><tbody />').append(data)
                      : false;
                  },
                },
              },
            });
            $("div.head-label").html(
              '<h5 class="card-title mb-0">Recommend for you!</h5>'
            );
          }
        })
        .catch((error) => {
          Swal.fire({
            title: "Error!",
            text: " Something went wrong!",
            icon: "error",
            customClass: {
              confirmButton: "btn btn-primary",
            },
            buttonsStyling: false,
          });
          console.error("There was a problem with the fetch operation:", error);
        });
    });
  });
})();
