import express from 'express';
import { exportEventsToPDF } from '../datasources/eventData';
import path from 'path';
import { v1 as uuid } from 'uuid';
import fs from 'fs';

const exportRouter = express.Router();

exportRouter.post('/export-events', async (req, res) => {
  const { startDate, endDate, eventType, fieldExists, fieldValue } = req.body;
  const fileName = `event_export_${uuid()}.pdf`;
  const outputDir = path.join(process.cwd(), 'exportpdfs');
  const outputPath = path.join(outputDir, fileName);

  try {
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    
    await exportEventsToPDF({
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      eventType,
      fieldExists,
      fieldValue,
      outputPath
    });

    res.download(outputPath, fileName);
  } catch (err) {
    console.error('Export failed:', err);
    res.status(500).send('Failed to export PDF');
  }
});

export default exportRouter;
