"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const node_cron_1 = tslib_1.__importDefault(require("node-cron"));
const models_1 = require("../models");
const traffic_1 = tslib_1.__importDefault(require("./traffic"));
async function runTrafficGeneration() {
    try {
        const users = await models_1.User.find({});
        for (const user of users) {
            if (user.fields && user.fields.length > 0) {
                for (const field of user.fields) {
                    await (0, traffic_1.default)(user.email, field.fieldId);
                }
            }
        }
    }
    catch (error) {
        console.error('Scheduled traffic generation failed:', error);
    }
}
// Run immediately
runTrafficGeneration();
// Run every 12 hours
node_cron_1.default.schedule('0 */12 * * *', runTrafficGeneration);
