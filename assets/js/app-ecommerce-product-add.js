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
        console.log("asdsad");
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
})();;