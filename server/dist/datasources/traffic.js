"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const models_1 = require("../models");
const emailService_1 = require("../utils/emailService");
async function generateTraffic(email, fieldId) {
    const user = await models_1.User.findOne({ email: email });
    if (!user)
        return { message: "User not found", status: "404" };
    const field = user.fields.find((field) => field.fieldId === fieldId);
    if (!field)
        return { message: "Field not found", status: "404" };
    const numGates = field.Gates.length;
    let idealWaterLevel = 5; // this variable would be water the farmer sets it to be and will be passed in
    let threshold = 2; // this variable would be the maximum allowed change in water level and is set by the farmer and will be passed in
    for (let gateId = 1; gateId <= numGates; gateId++) {
        // TODO: Call up to the database to get the users preferred water level and threshold from the usersId from mongoDB
        const numOfErrors = 2; // Change this variable to however many errors we want to generate e.g right now it is 2 because we have connection error and low battery, if we added another error possibility we would change this to 3
        const chance = 3; // Change this variable to however often we want something to go wrong
        //--------------------------------------------------------------------------------
        //Generate change in water level
        //--------------------------------------------------------------------------------
        const changeWaterLevel = () => {
            const randomAmount = (Math.floor(Math.random() * 15) + 1) * 0.1 * threshold;
            const directionNumber = Math.floor(Math.random() * 3) - 1; // water level: increase +1, decrease -1, or stay the same 0
            return Math.floor(10 * randomAmount * directionNumber) / 10;
        };
        let actualWaterLevel = idealWaterLevel + changeWaterLevel();
        //--------------------------------------------------------------------------------
        // Generate status changes on gates
        //--------------------------------------------------------------------------------
        const randomAlertChance = Math.floor(Math.random() * chance);
        // Choose an error to throw, 0 = no error, 1 = connection error, 2 = low battery
        let randomStatus = randomAlertChance === 0 ? Math.floor(Math.random() * numOfErrors) + 1 : 0;
        let connectionError = randomStatus == 1; // true ? randomStatus == 1 : false;
        let lowBattery = randomStatus == 2; // true ? randomStatus == 2 : false;
        // TODO: Add more errors here
        // Determine status of gate
        //TODO: Move to backend
        const [awl, iwl, t] = [actualWaterLevel, idealWaterLevel, threshold];
        let status = connectionError ? "Red" : (lowBattery || awl > iwl + t || awl < iwl - t) ? "Yellow" : "Green";
        if (status === "Red") {
            try {
                await (0, emailService_1.sendCriticalGateAlert)(email, gateId, status, actualWaterLevel, idealWaterLevel);
            }
            catch (error) {
                console.error('Failed to send email alert:', error);
                // Don't throw the error to prevent breaking the traffic generation
            }
        }
        // Get the gate with the gateId
        const currGate = field.Gates.find((gate) => gate.gateId === gateId);
        if (!currGate)
            return { message: "Gate not found", status: "404" };
        // Update the gate with the new values
        Object.assign(currGate, { actualWaterLevel, connectionError, lowBattery,
            status, idealWaterLevel, threshold });
    }
    await user.save();
    return { message: "Traffic generated", status: "200" };
}
async function getTraffic(userId, fieldId) {
    return await generateTraffic(userId, fieldId);
}
exports.default = getTraffic;
