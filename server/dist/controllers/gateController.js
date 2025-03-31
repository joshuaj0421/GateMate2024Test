"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const models_1 = require("../models");
const gateRouter = (0, express_1.Router)();
/*
 * Gate Routes
 */
// Create a new gate for a specific field
gateRouter.post("/create/:fieldId", async (req, res) => {
    var _a;
    try {
        if (!((_a = req.session) === null || _a === void 0 ? void 0 : _a.user))
            return res.status(403).send("User not logged in");
        const user = await models_1.User.findOne({ email: req.session.user.email });
        if (!user)
            return res.status(404).send("User not found");
        const fieldId = Number(req.params.fieldId);
        const field = user.fields.find(field => field.fieldId === fieldId);
        if (!field)
            return res.status(404).send("Field not found");
        const gate = new models_1.Gate(Object.assign(Object.assign({}, req.body), { gateId: field.Gates.length + 1 }));
        field.Gates.push(gate);
        await user.save();
        res.status(201).json(gate);
    }
    catch (err) {
        res.status(500).send(err);
    }
});
// Get all gates for a specific field
gateRouter.get("/find/:fieldId", async (req, res) => {
    var _a;
    try {
        if (!((_a = req.session) === null || _a === void 0 ? void 0 : _a.user))
            return res.send({ message: "User not logged in", status: "403" });
        const user = await models_1.User.findOne({ email: req.session.user.email });
        if (!user)
            return res.send({ message: "User not found", status: "404" });
        const fieldId = Number(req.params.fieldId);
        const field = user.fields.find(field => field.fieldId === fieldId);
        if (!field)
            return res.send({ message: "Field not found", status: "404" });
        res.send({ message: field.Gates, status: "200" });
    }
    catch (err) {
        res.status(500).send(err);
    }
});
gateRouter.put("/status/:fieldId/:gateId", async (req, res) => {
    var _a;
    try {
        if (!((_a = req.session) === null || _a === void 0 ? void 0 : _a.user))
            return res.status(403).send("User not logged in");
        const user = await models_1.User.findOne({ email: req.session.user.email });
        if (!user)
            return res.status(404).send("User not found");
        const fieldId = Number(req.params.fieldId);
        const field = user.fields.find(field => field.fieldId === fieldId);
        if (!field)
            return res.status(404).send("Field not found");
        const gateId = Number(req.params.gateId);
        const gate = field.Gates.find((gate) => gate.gateId === gateId);
        if (!gate)
            return res.status(404).send("Gate not found");
        // Update only status-related properties
        const { status, actualWaterLevel, connectionError, lowBattery } = req.body;
        if (status)
            gate.status = status;
        if (actualWaterLevel !== undefined)
            gate.actualWaterLevel = actualWaterLevel;
        if (connectionError !== undefined)
            gate.connectionError = connectionError;
        if (lowBattery !== undefined)
            gate.lowBattery = lowBattery;
        await user.save();
        res.json(gate);
    }
    catch (err) {
        res.status(500).send(err);
    }
});
// Update a gate by id
gateRouter.put("/:fieldId/:gateId", async (req, res) => {
    var _a;
    try {
        if (!((_a = req.session) === null || _a === void 0 ? void 0 : _a.user))
            return res.status(403).send("User not logged in");
        const user = await models_1.User.findOne({ email: req.session.user.email });
        if (!user)
            return res.status(404).send("User not found");
        const fieldId = Number(req.params.fieldId);
        const field = user.fields.find(field => field.fieldId === fieldId);
        if (!field)
            return res.status(404).send("Field not found");
        const gateId = Number(req.params.gateId);
        const gate = field.Gates.find((gate) => gate.gateId === gateId);
        if (!gate)
            return res.status(404).send("Gate not found");
        Object.assign(gate, req.body);
        await user.save();
        res.json(gate);
    }
    catch (err) {
        res.status(500).send(err);
    }
});
// Delete a gate by id
gateRouter.delete("/:fieldId/:gateId", async (req, res) => {
    var _a;
    try {
        if (!((_a = req.session) === null || _a === void 0 ? void 0 : _a.user))
            return res.send({ message: "User not logged in", status: "403" });
        const user = await models_1.User.findOne({ email: req.session.user.email });
        if (!user)
            return res.send({ message: "User not found", status: "404" });
        const fieldId = Number(req.params.fieldId);
        const field = user.fields.find(field => field.fieldId === fieldId);
        if (!field)
            return res.send({ message: "Field not found", status: "404" });
        const gateId = Number(req.params.gateId);
        const gateIndex = field.Gates.findIndex((gate) => gate.gateId === gateId);
        if (gateIndex === -1)
            return res.send({ message: "Gate not found", status: "404" });
        field.Gates.splice(gateIndex, 1);
        await user.save();
        res.status(204).send();
    }
    catch (err) {
        res.status(500).send(err);
    }
});
exports.default = gateRouter;
