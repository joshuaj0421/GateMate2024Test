import { EventData } from '../models';
import PDFDocument from 'pdfkit';
import fs from 'fs';

/**
 * recordEvent inserts a new Event document into MongoDB.
 * 
 * @param eventType e.g. "GATE_OPEN", "GATE_CLOSE", "WEATHER", etc.
 * @param details   an optional object for any extra fields (temp, battery, etc.)
 */
export async function recordEvent(
    eventType: string,
    details: Record<string, unknown> = {}
  ) {
    try {
      const newEvent = new EventData({ eventType, details });
      await newEvent.save();
  
      console.log('Event recorded:', newEvent);
      return newEvent;
    } catch (error) {
      console.error('Failed to record event:', error);
      throw error;
    }
  }

interface ExportOptions {
  startDate: Date;
  endDate: Date;
  eventType?: string;
  fieldExists?: string; // e.g., 'temperature'
  fieldValue?: { field: string; value: unknown };
  outputPath: string; // optional path to save file
}

/**
 * Exports filtered events to a PDF file.
 */
export async function exportEventsToPDF({
  startDate,
  endDate,
  eventType,
  fieldExists,
  fieldValue,
  outputPath
}: ExportOptions) {
  return new Promise<void>(async (resolve, reject) => {
  const query: any = {
    timestamp: { $gte: startDate, $lte: endDate }
  };

  if (eventType) {
    query.eventType = eventType;
  }

  if (fieldExists) {
    query[`details.${fieldExists}`] = { $exists: true };
  }

  if (fieldValue) {
    query[`details.${fieldValue.field}`] = fieldValue.value;
  }

  const events = await EventData.find(query).sort({ timestamp: 1 });
  console.log("here");
  // Start PDF generation
  const doc = new PDFDocument({ margin: 50 });
  const stream = fs.createWriteStream(outputPath);
  doc.pipe(stream);

  // Title
  doc.fontSize(20).text('Event Report', { align: 'center' });
  doc.moveDown();

  // Info
  doc.fontSize(12).text(`Time Range: ${startDate.toDateString()} through ${endDate.toDateString()}`);
  if (eventType) doc.text(`Event Type: ${eventType}`);
  if (fieldExists) doc.text(`Includes Field: "${fieldExists}"`);
  if (fieldValue) doc.text(`Field "${fieldValue.field}" = ${fieldValue.value}`);
  doc.moveDown();

  // Draw events
  for (let i = 0; i < events.length; i++) {
    const event = events[i];
    doc
      .fontSize(12)
      .text(`${event.timestamp.toLocaleDateString()}, ${event.timestamp.toLocaleTimeString()} : ${event.eventType}`, { continued: false });

    const detailKeys = Object.keys(event.details || {});
    if (detailKeys.length > 0) {
      doc.fontSize(10);
      detailKeys.forEach((key) => {
        const value = event.details[key];
        if (`${key.toLowerCase()}` == "date"){
          
        }
        if (typeof value === 'object' && value !== null) {
          doc.text(`   • ${key}:`);
          Object.entries(value).forEach(([subKey, subVal]) => {
            doc.text(`     - ${subKey}: ${subVal}`);
          });
        } else {
          doc.text(`   • ${key}: ${value}`);
        }
      });
    } else {
      doc.fontSize(10).text('   • No details provided');
    }

    doc.moveDown();

     // Line separator between events
    doc.moveDown(0.5).moveTo(50, doc.y).lineTo(550, doc.y).strokeColor('#cccccc').stroke();
    doc.moveDown(1);

  // Page break after every 20 events
  if ((i + 1) % 20 === 0) {
    doc.addPage();
  }
  }

  doc.end();
  stream.on('finish', () => {
      resolve(); // only resolve after it's actually written
    });

    stream.on('error', (err) => {
      reject(err);
    });

  console.log(`PDF exported to ${outputPath}`);
  }
  )}
