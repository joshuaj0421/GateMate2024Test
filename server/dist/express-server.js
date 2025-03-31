"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const express_1 = tslib_1.__importDefault(require("express"));
const weatherController_1 = tslib_1.__importDefault(require("./controllers/weatherController"));
const gateController_1 = tslib_1.__importDefault(require("./controllers/gateController"));
const dotenv_1 = tslib_1.__importDefault(require("dotenv"));
dotenv_1.default.config();
const express_session_1 = tslib_1.__importDefault(require("express-session"));
const userController_1 = tslib_1.__importDefault(require("./controllers/userController"));
const db_1 = require("./datasources/db");
const fieldController_1 = tslib_1.__importDefault(require("./controllers/fieldController"));
const trafficController_1 = tslib_1.__importDefault(require("./controllers/trafficController"));
require("./datasources/scheduler");
const PORT = 4001; // hardcoded ∵ hardcoded in client
const app = (0, express_1.default)();
//Connecting to the database once and reusing the connection
(0, db_1.connect)();
// Middleware goes here -- IF it does not go above routes it will not work ;)
app.use((0, express_session_1.default)({
    secret: process.env.session_secret || "",
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 7 * 24 * 60 * 60 * 1000 },
}));
app.use(express_1.default.json());
app.use("/api/v1/home", weatherController_1.default);
app.use("/api/v1/user", userController_1.default);
app.use("/api/v1/gate", gateController_1.default);
app.use("/api/v1/field", fieldController_1.default);
app.use("/api/v1/traffic", trafficController_1.default);
// Start the server
app.listen(PORT, () => console.log(`Server is running on http://localhost:${PORT}`));
