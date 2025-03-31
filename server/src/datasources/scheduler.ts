import cron from 'node-cron';
import { User } from '../models';
import generateTraffic from './traffic';

async function runTrafficGeneration() {
  try {
    const users = await User.find({});
    for (const user of users) {
      if (user.fields && user.fields.length > 0) {
        for (const field of user.fields) {
          await generateTraffic(user.email, field.fieldId);
        }
      }
    }
  } catch (error) {
    console.error('Scheduled traffic generation failed:', error);
  }
}

// Run immediately
runTrafficGeneration();

// Run every 12 hours
cron.schedule('0 */12 * * *', runTrafficGeneration);