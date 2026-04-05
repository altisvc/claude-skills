'use strict';
/**
 * Maps every text element on the Cartesia net-net slide (slide 5)
 * to understand which shapes hold which content.
 */
const { google } = require('googleapis');
const fs = require('fs');
const path = require('path');

const creds = JSON.parse(fs.readFileSync(path.join(__dirname, '../../gcp-oauth.keys.json'))).installed;
const oauth2 = new google.auth.OAuth2(creds.client_id, creds.client_secret, 'http://localhost:3000/oauth2callback');
oauth2.setCredentials(JSON.parse(fs.readFileSync(path.join(__dirname, '../../gcp-token.json'))));
const slides = google.slides({ version: 'v1', auth: oauth2 });

const CARTESIA_ID = '1vOK07eRj1V2ho8qY4LgpJ2-EoKU6NCef9xwN41S5dIU';

slides.presentations.get({ presentationId: CARTESIA_ID }).then(res => {
  const slide = res.data.slides[5]; // Net net slide
  console.log('Slide objectId:', slide.objectId);
  console.log('Elements:', slide.pageElements.length);
  console.log('');

  for (const el of slide.pageElements) {
    const type = el.image ? 'IMAGE' :
                 el.line ? 'LINE' :
                 el.table ? 'TABLE' :
                 el.shape ? 'SHAPE' : 'OTHER';

    const ph = el.shape && el.shape.placeholder ? el.shape.placeholder.type : null;

    let text = '';
    if (el.shape && el.shape.text) {
      text = el.shape.text.textElements
        .filter(te => te.textRun)
        .map(te => te.textRun.content)
        .join('')
        .replace(/\n/g, '\\n')
        .trim();
    }

    // Get position info
    const pos = el.transform ? {
      x: Math.round((el.transform.translateX || 0) / 914400 * 100) / 100,
      y: Math.round((el.transform.translateY || 0) / 914400 * 100) / 100,
    } : {};

    const size = el.size ? {
      w: Math.round((el.size.width.magnitude || 0) / 914400 * 100) / 100,
      h: Math.round((el.size.height.magnitude || 0) / 914400 * 100) / 100,
    } : {};

    console.log(`[${type}${ph ? ':' + ph : ''}] id=${el.objectId}`);
    console.log(`  pos: x=${pos.x}" y=${pos.y}" | size: ${size.w}" x ${size.h}"`);
    if (text) console.log(`  text: "${text.substring(0, 120)}"`);
    console.log('');
  }
}).catch(e => console.error(e.message));
