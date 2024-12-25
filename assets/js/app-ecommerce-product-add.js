/*
/* File: app-ecommerce-product-add.js
/* Author: TiDz
/* Contact: nguyentinvs123@gmail.com
 * Created on Wed Dec 25 2024
 * Description: 
 * Useage: 
 */

("use strict");

(function(){
    const submit = document.querySelector(".submit").addEventListener("click", () => {
        const name = document.querySelector("#ecommerce-product-name").value,
            desc = document.querySelector("#ecommerce-product-desc").value,
            weight = document.querySelector("#ecommerce-product-weight").value,
            cost = document.querySelector("#ecommerce-product-cost").value,
            subcategory = document.querySelector("#category-org").value;
            fetch(ApiHost + "/api/addNewProduct", {
                method: "POST",
                headers: { "Content-type": "application/json; charset=UTF-8" },
                body: JSON.stringify({ 
                    "name": name,
                    "desc": desc ? desc : "No description",
                    "weight": parseFloat(weight),
                    "cost": parseFloat(cost),
                    "subcategoryid": parseInt(subcategory)
                }),
            })
            .then((response) => {
                if (response.ok) {
                    Swal.fire({
                        title: 'Good job!',
                        text: 'Product added successful!',
                        icon: 'success',
                        customClass: {
                        confirmButton: 'btn btn-primary'
                        },
                        buttonsStyling: false
                    })
                    return response.json();
                }
                throw new Error("Network response was not ok.");
            })
            .catch((error) => {
                Swal.fire({
                    title: 'Error!',
                    text: ' Something went wrong!',
                    icon: 'error',
                    customClass: {
                      confirmButton: 'btn btn-primary'
                    },
                    buttonsStyling: false
                  })
                console.error("There was a problem with the fetch operation:", error);
            });
    })

    const deli = document.querySelector(".deli").addEventListener("click", () => {
        const id = document.querySelector("#ecommerce-product-id").value,
            region = document.querySelector("#region-org").value,
            sellprice = document.querySelector("#ecommerce-product-line").value,
            newcost = document.querySelector("#ecommerce-product-newcost").value,
            qty = document.querySelector("#ecommerce-product-qty").value;
            fetch(ApiHost + "/api/updateProduct", {
                method: "POST",
                headers: { "Content-type": "application/json; charset=UTF-8" },
                body: JSON.stringify({ 
                    "productid": parseInt(id),
                    "country": region,
                    "qty": parseInt(qty),
                    "sellprice": parseFloat(sellprice),
                    "cost": parseFloat(newcost) ? newcost : null
                }),
            })
            .then((response) => {
                if (response.ok) {
                    Swal.fire({
                        title: 'Good job!',
                        text: 'Product deli successful!',
                        icon: 'success',
                        customClass: {
                        confirmButton: 'btn btn-primary'
                        },
                        buttonsStyling: false
                    })
                    return response.json();
                }
                throw new Error("Network response was not ok.");
            })
            .catch((error) => {
                Swal.fire({
                    title: 'Error!',
                    text: ' Something went wrong!',
                    icon: 'error',
                    customClass: {
                      confirmButton: 'btn btn-primary'
                    },
                    buttonsStyling: false
                  })
                console.error("There was a problem with the fetch operation:", error);
            });
    })
})();;