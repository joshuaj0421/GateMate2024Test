"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const express_1 = require("express");
const weatherData_1 = tslib_1.__importDefault(require("../datasources/weatherData"));
const homeRouter = (0, express_1.Router)();
homeRouter.get("/weather", async (req, res) => {
    const area = req.query.input;
    if (area === undefined || typeof area !== "string")
        return res.send("Please enter an area");
    const weatherData = await (0, weatherData_1.default)(area);
    if (weatherData === undefined)
        return res.send("Weather data not available");
    //We are now returning cleaned weather data to the client
    res.send(weatherData.daily);
});
exports.default = homeRouter;
