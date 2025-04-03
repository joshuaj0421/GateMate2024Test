import { Router } from "express";
import getTraffic from "../datasources/traffic";
import { User } from "../models";
import { sendCriticalGateAlert } from "../utils/emailService";

const trafficRouter = Router();

trafficRouter.get("/gen1", async (req, res) => {
  if (!req.session?.user) {
    res.send({ message: "Not logged in" }).status(401);
  } else {
    const email = req.session.user.email;
    const user = await User.findOne({ email: email });

    if (!user) {
      res.send({ message: "User not found" }).status(404);
    } else {
      let numFields = user.fields.length;

      for (let i = 0; i < numFields; i++) {
        const field = user.fields[i];
        const trafficData = await getTraffic(email, field.fieldId);
        
        // Check each gate's status and send alerts if critical
        field.Gates.forEach(async (gate) => {
          if (gate.status === "Red") {
            // try {
            //   await sendCriticalGateAlert(
            //     email,
            //     gate.gateId,
            //     gate.status,
            //     gate.actualWaterLevel,
            //     gate.idealWaterLevel
            //   );
            // } catch (error) {
            //   console.error(`Failed to send alert for gate ${gate.gateId}:`, error);
            // }
          }
        });
      }
    }
  }
  res.send({ message: "Traffic generated", status: "200" });
});

export default trafficRouter;