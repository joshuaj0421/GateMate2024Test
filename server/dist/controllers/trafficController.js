"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const express_1 = require("express");
const traffic_1 = tslib_1.__importDefault(require("../datasources/traffic"));
const models_1 = require("../models");
const emailService_1 = require("../utils/emailService");
const trafficRouter = (0, express_1.Router)();
trafficRouter.get("/gen1", async (req, res) => {
    var _a;
    if (!((_a = req.session) === null || _a === void 0 ? void 0 : _a.user)) {
        res.send({ message: "Not logged in" }).status(401);
    }
    else {
        const email = req.session.user.email;
        const user = await models_1.User.findOne({ email: email });
        if (!user) {
            res.send({ message: "User not found" }).status(404);
        }
        else {
            let numFields = user.fields.length;
            for (let i = 0; i < numFields; i++) {
                const field = user.fields[i];
                const trafficData = await (0, traffic_1.default)(email, field.fieldId);
                // Check each gate's status and send alerts if critical
                field.Gates.forEach(async (gate) => {
                    if (gate.status === "Red") {
                        try {
                            await (0, emailService_1.sendCriticalGateAlert)(email, gate.gateId, gate.status, gate.actualWaterLevel, gate.idealWaterLevel);
                        }
                        catch (error) {
                            console.error(`Failed to send alert for gate ${gate.gateId}:`, error);
                        }
                    }
                });
            }
        }
    }
    res.send({ message: "Traffic generated", status: "200" });
});
exports.default = trafficRouter;
