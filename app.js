/*
/* File: app.js
/* Author: TiDz
/* Contact: nguyentinvs123@gmail.com
 * Created on Mon Dec 23 2024
 *
 * Description: 
 *
 * The MIT License (MIT)
 * Copyright (c) 2024 TiDz
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software
 * and associated documentation files (the "Software"), to deal in the Software without restriction,
 * including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense,
 * and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so,
 * subject to the following conditions: unconditional.
 *
 * Useage: 
 */

const express = require("express");
const path = require("path");
const axios = require('axios');
const app = express();

app.use(express.static(path.join(__dirname, "public")));
app.use("/assets", express.static(path.join(__dirname, "assets")));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public/", "index.html"));
});

// app.get("/api/data", async (req, res) => {
//   try {
//     const response = await axios.get("http://127.0.0.1:5000/api/addCountry");
//     res.json(response.data);
//   } catch (error) {
//     console.error("Error calling Python API:", error);
//     res.status(500).send("Error calling Python API");
//   }
// });

const PORT = process.env.PORT || 80;
app.listen(PORT, () => {
  console.log(`Server đang chạy tại http://localhost:${PORT}`);
});
