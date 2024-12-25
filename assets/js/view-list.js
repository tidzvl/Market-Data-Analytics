/**
 * Page User List
 */

"use strict";

// Datatable (jquery)
$(function () {
  let borderColor, bodyBg, headingColor;

  if (isDarkStyle) {
    borderColor = config.colors_dark.borderColor;
    bodyBg = config.colors_dark.bodyBg;
    headingColor = config.colors_dark.headingColor;
  } else {
    borderColor = config.colors.borderColor;
    bodyBg = config.colors.bodyBg;
    headingColor = config.colors.headingColor;
  }

  // Variable declaration for table
  var dt_user_table = $(".datatables-users"),
    select2 = $(".select2"),
    userView = "app-user-view-account.html",
    statusObj = {
      1: { title: "Pending", class: "bg-label-warning" },
      2: { title: "Active", class: "bg-label-success" },
      3: { title: "Inactive", class: "bg-label-secondary" },
    };

  if (select2.length) {
    var $this = select2;
    $this.wrap('<div class="position-relative"></div>').select2({
      placeholder: "Select Country",
      dropdownParent: $this.parent(),
    });
  }


  async function getAllProduct() {
    try {
      const response = await fetch(ApiHost + "/api/getAllProducts");
      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  }
  const allProduct = sessionStorage.getItem("allProduct");
  if (!allProduct) {
    getAllProduct().then((data) => {
      sessionStorage.setItem("allProduct", JSON.stringify(data));
      renderDataTable(data, "US");
    });
  } else {
    renderDataTable(JSON.parse(allProduct), "US");
  }
  function renderDataTable(data, country) {
    // console.log(data[country]);
    // Users datatable
    if (dt_user_table.length) {
      var dt_user = dt_user_table.DataTable({
        // ajax: assetsPath + 'json/user-list.json', // JSON file to add data
        data: data[country],
        columns: [
          // columns according to JSON
          { data: "" },
          { data: "ProductID" },
          { data: "CountryRegionCode" },
          { data: "TotalQtySold" },
          { data: "TotalLine" },
          { data: "StandardCost" },
          { data: "TotalProfit" },
          { data: "SubcategoryName" },
          { data: "CategoryName" },
          { data: "action" },
        ],
        columnDefs: [
          {
            // For Responsive
            className: "control",
            searchable: false,
            orderable: false,
            responsivePriority: 2,
            targets: 0,
            render: function (data, type, full, meta) {
              return "";
            },
          },
          {
            // productID
            targets: 1,
            responsivePriority: 4,
            render: function (data, type, full, meta) {
              var $product_id = full["ProductID"];
              var $row_output =
                '<div class="d-flex justify-content-start align-items-center user-name">' +
                '<div class="d-flex flex-column">' +
                '<span class="fw-medium">#' +
                $product_id +
                "</span>" +
                "</div>" +
                "</div>";
              return $row_output;
            },
          },
          {
            // countryRegionCode
            targets: 2,
            render: function (data, type, full, meta) {
              var $country = full["CountryRegionCode"];
              return '<span class="fw-medium">' + $country + "</span>";
            },
          },
          {
            // QTY sold
            targets: 3,
            render: function (data, type, full, meta) {
              var $qty = full["TotalQtySold"];
              return '<span class="fw-medium">' + $qty + "</span>";
            },
          },
          {
            // total line
            targets: 4,
            render: function (data, type, full, meta) {
              var $totalLine = full["TotalLine"];
              $totalLine = parseFloat($totalLine).toFixed(2);
              return "<span>$" + $totalLine + "</span>";
            },
          },
          {
            targets: 5,
            render: function (data, type, full, meta) {
              var $StandardCost = full["StandardCost"];
              $StandardCost = parseFloat($StandardCost).toFixed(2);
              return '<span class="fw-medium">$' + $StandardCost + "</span>";
            },
          },
          {
            targets: 6,
            render: function (data, type, full, meta) {
              var $TotalProfit = full["TotalProfit"];
              $TotalProfit = parseFloat($TotalProfit).toFixed(2);
              return "<span>$" + $TotalProfit + "</span>";
            },
          },
          {
            // Actions
            targets: -1,
            title: "Actions",
            searchable: false,
            orderable: false,
            render: function (data, type, full, meta) {
              return (
                '<div class="d-inline-block text-nowrap">' +
                '<button class="btn btn-sm btn-icon"><i class="bx bx-edit"></i></button>' +
                '<button class="btn btn-sm btn-icon delete-record"><i class="bx bx-trash"></i></button>' +
                '<button class="btn btn-sm btn-icon dropdown-toggle hide-arrow" data-bs-toggle="dropdown"><i class="bx bx-dots-vertical-rounded me-2"></i></button>' +
                '<div class="dropdown-menu dropdown-menu-end m-0">' +
                '<a href="' +
                userView +
                '" class="dropdown-item">View</a>' +
                '<a href="javascript:;" class="dropdown-item">Suspend</a>' +
                "</div>" +
                "</div>"
              );
            },
          },
        ],
        order: [[1, "desc"]],
        dom:
          '<"row mx-2"' +
          '<"col-md-2"<"me-3"l>>' +
          '<"col-md-10"<"dt-action-buttons text-xl-end text-lg-start text-md-end text-start d-flex align-items-center justify-content-end flex-md-row flex-column mb-3 mb-md-0"fB>>' +
          ">t" +
          '<"row mx-2"' +
          '<"col-sm-12 col-md-6"i>' +
          '<"col-sm-12 col-md-6"p>' +
          ">",
        language: {
          sLengthMenu: "_MENU_",
          search: "",
          searchPlaceholder: "Search..",
        },
        // Buttons with Dropdown
        buttons: [
          {
            extend: "collection",
            className: "btn btn-label-secondary dropdown-toggle mx-3",
            text: '<i class="bx bx-export me-1"></i>Export',
            buttons: [
              {
                extend: "print",
                text: '<i class="bx bx-printer me-2" ></i>Print',
                className: "dropdown-item",
                exportOptions: {
                  columns: [1, 2, 3, 4, 5],
                  // prevent avatar to be print
                  format: {
                    body: function (inner, coldex, rowdex) {
                      if (inner.length <= 0) return inner;
                      var el = $.parseHTML(inner);
                      var result = "";
                      $.each(el, function (index, item) {
                        if (
                          item.classList !== undefined &&
                          item.classList.contains("user-name")
                        ) {
                          result =
                            result + item.lastChild.firstChild.textContent;
                        } else if (item.innerText === undefined) {
                          result = result + item.textContent;
                        } else result = result + item.innerText;
                      });
                      return result;
                    },
                  },
                },
                customize: function (win) {
                  //customize print view for dark
                  $(win.document.body)
                    .css("color", headingColor)
                    .css("border-color", borderColor)
                    .css("background-color", bodyBg);
                  $(win.document.body)
                    .find("table")
                    .addClass("compact")
                    .css("color", "inherit")
                    .css("border-color", "inherit")
                    .css("background-color", "inherit");
                },
              },
              {
                extend: "csv",
                text: '<i class="bx bx-file me-2" ></i>Csv',
                className: "dropdown-item",
                exportOptions: {
                  columns: [1, 2, 3, 4, 5],
                  // prevent avatar to be display
                  format: {
                    body: function (inner, coldex, rowdex) {
                      if (inner.length <= 0) return inner;
                      var el = $.parseHTML(inner);
                      var result = "";
                      $.each(el, function (index, item) {
                        if (
                          item.classList !== undefined &&
                          item.classList.contains("user-name")
                        ) {
                          result =
                            result + item.lastChild.firstChild.textContent;
                        } else if (item.innerText === undefined) {
                          result = result + item.textContent;
                        } else result = result + item.innerText;
                      });
                      return result;
                    },
                  },
                },
              },
              {
                extend: "excel",
                text: '<i class="bx bxs-file-export me-2"></i>Excel',
                className: "dropdown-item",
                exportOptions: {
                  columns: [1, 2, 3, 4, 5],
                  // prevent avatar to be display
                  format: {
                    body: function (inner, coldex, rowdex) {
                      if (inner.length <= 0) return inner;
                      var el = $.parseHTML(inner);
                      var result = "";
                      $.each(el, function (index, item) {
                        if (
                          item.classList !== undefined &&
                          item.classList.contains("user-name")
                        ) {
                          result =
                            result + item.lastChild.firstChild.textContent;
                        } else if (item.innerText === undefined) {
                          result = result + item.textContent;
                        } else result = result + item.innerText;
                      });
                      return result;
                    },
                  },
                },
              },
              {
                extend: "pdf",
                text: '<i class="bx bxs-file-pdf me-2"></i>Pdf',
                className: "dropdown-item",
                exportOptions: {
                  columns: [1, 2, 3, 4, 5],
                  // prevent avatar to be display
                  format: {
                    body: function (inner, coldex, rowdex) {
                      if (inner.length <= 0) return inner;
                      var el = $.parseHTML(inner);
                      var result = "";
                      $.each(el, function (index, item) {
                        if (
                          item.classList !== undefined &&
                          item.classList.contains("user-name")
                        ) {
                          result =
                            result + item.lastChild.firstChild.textContent;
                        } else if (item.innerText === undefined) {
                          result = result + item.textContent;
                        } else result = result + item.innerText;
                      });
                      return result;
                    },
                  },
                },
              },
              {
                extend: "copy",
                text: '<i class="bx bx-copy me-2" ></i>Copy',
                className: "dropdown-item",
                exportOptions: {
                  columns: [1, 2, 3, 4, 5],
                  // prevent avatar to be display
                  format: {
                    body: function (inner, coldex, rowdex) {
                      if (inner.length <= 0) return inner;
                      var el = $.parseHTML(inner);
                      var result = "";
                      $.each(el, function (index, item) {
                        if (
                          item.classList !== undefined &&
                          item.classList.contains("user-name")
                        ) {
                          result =
                            result + item.lastChild.firstChild.textContent;
                        } else if (item.innerText === undefined) {
                          result = result + item.textContent;
                        } else result = result + item.innerText;
                      });
                      return result;
                    },
                  },
                },
              },
            ],
          },
          {
            text: '<i class="bx bx-plus me-0 me-lg-2"></i><span class="d-none d-lg-inline-block">Add New Product</span>',
            className: "add-new btn btn-primary ms-n1",
            attr: {
              "data-bs-toggle": "offcanvas",
              "data-bs-target": "#offcanvasAddUser",
            },
          },
        ],
        // For responsive popup
        responsive: {
          details: {
            display: $.fn.dataTable.Responsive.display.modal({
              header: function (row) {
                var data = row.data();
                return "Details of " + data["full_name"];
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
        initComplete: function () {
          // Adding role filter once table initialized
          this.api()
            .columns(2)
            .every(function () {
              var column = this;
              var select = $(
                '<select id="region" class="form-select text-capitalize"><option value=""> Select Region </option></select>'
              )
                .appendTo(".region")
                .on("change", function () {
                  var val = $.fn.dataTable.util.escapeRegex($(this).val());
                  column.search(val ? "^" + val + "$" : "", true, false).draw();
                });
              var additionalOptions = ["AU", "CA", "DE", "FR", "GB"];

              additionalOptions.forEach(function (option) {
                select.append(
                  '<option value="' + option + '">' + option + "</option>"
                );
              });

              column
                .data()
                .unique()
                .sort()
                .each(function (d, j) {
                  select.append('<option value="' + d + '">' + d + "</option>");
                });
            });
          // Adding plan filter once table initialized
          this.api()
            .columns(7)
            .every(function () {
              var column = this;
              var select = $(
                '<select id="subcategory" class="form-select text-capitalize"><option value=""> Select Sub Category </option></select>'
              )
                .appendTo(".subcategory")
                .on("change", function () {
                  var val = $.fn.dataTable.util.escapeRegex($(this).val());
                  column.search(val ? "^" + val + "$" : "", true, false).draw();
                });

              column
                .data()
                .unique()
                .sort()
                .each(function (d, j) {
                  select.append('<option value="' + d + '">' + d + "</option>");
                });
            });
          this.api()
            .columns(8)
            .every(function () {
              var column = this;
              var select = $(
                '<select id="category" class="form-select text-capitalize"><option value=""> Select Category </option></select>'
              )
                .appendTo(".category")
                .on("change", function () {
                  var val = $.fn.dataTable.util.escapeRegex($(this).val());
                  column.search(val ? "^" + val + "$" : "", true, false).draw();
                });

              column
                .data()
                .unique()
                .sort()
                .each(function (d, j) {
                  select.append('<option value="' + d + '">' + d + "</option>");
                });
            });
        },
      });
    }
    $("#region").on("change", function () {
      var selectedCountry = $(this).val();
      if (selectedCountry != " Select Region ")
        dt_user.clear().rows.add(data[selectedCountry]).draw();
    });
    // Delete Record
    $(".datatables-users tbody").on("click", ".delete-record", function () {
      //   dt_user.row($(this).parents("tr")).remove().draw();
      const index = dt_user.row($(this).parents("tr"))[0][0];
      let region = document.getElementById("region").value;
      if (!region) region = "US";
      // console.log(data[region][index]['ProductID']);
      const removeID = data[region][index]["ProductID"];
      Swal.fire({
        title: "Are you sure?",
        text: "You won't be able to revert this!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Yes, delete it!",
        customClass: {
          confirmButton: "btn btn-primary me-1",
          cancelButton: "btn btn-label-secondary",
        },
        buttonsStyling: false,
      }).then(function (result) {
        if (result.value) {
          Swal.fire({
            icon: "success",
            title: "Deleted!",
            text: "Your data has been deleted.",
            customClass: {
              confirmButton: "btn btn-success",
            },
          });
          fetch(ApiHost + "/api/deleteProduct", {
            method: "POST",
            headers: { "Content-type": "application/json; charset=UTF-8" },
            body: JSON.stringify({ productid: removeID }),
          }).catch((error) => {
            console.error(
              "There was a problem with the fetch operation:",
              error
            );
          });
        }
      });
    });

    // Filter form control to default size
    // ? setTimeout used for multilingual table initialization
    setTimeout(() => {
      $(".dataTables_filter .form-control").removeClass("form-control-sm");
      $(".dataTables_length .form-select").removeClass("form-select-sm");
    }, 300);
    
    function setupWebSocket() {
        var socket = io.connect(ApiHost);
        socket.on("connect", function () {
            console.log("Connected to WebSocket");
        });
        socket.on('update_data', function(data) { 
            console.log(data);
            console.log("change");
            getAllProduct().then((data) => {
                sessionStorage.setItem("allProduct", JSON.stringify(data));
                dt_user.clear().rows.add(data["US"]).draw();
            });
        });
    }
    setupWebSocket();
    }
});

(function () {})();
