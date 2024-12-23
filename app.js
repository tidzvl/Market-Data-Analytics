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

const express = require('express');
const app = express();

app.get('/', (req, res) => {
  res.send('Xin chào thế giới!');
});

app.listen(3000, () => {
  console.log('Server đang chạy trên cổng 3000');
});