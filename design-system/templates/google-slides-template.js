'use strict';

/**
 * google-slides-template.js
 *
 * Creates brand-compliant Google Slides presentations by copying the designer's
 * master template and populating content via the Slides API.
 *
 * Workflow:
 *   1. createPresentation(title)           → copies template, returns {presentationId, url}
 *   2. getPresentation(presentationId)     → returns slide IDs and element IDs
 *   3. replaceText(presentationId, ...)    → fills in placeholder text
 *   4. deleteUnusedSlides(presentationId, keepIndices) → strips unwanted slides
 *
 * Auth setup (one-time):
 *   node design-system/templates/google-slides-template.js --auth
 *
 * See design-system/templates/slide-catalog.md for the full layout reference.
 */

const { google } = require('googleapis');
const fs   = require('fs');
const path = require('path');
const http = require('http');

// ── Paths ──────────────────────────────────────────────────────────────────────

const CREDENTIALS_PATH = path.join(__dirname, '../../gcp-oauth.keys.json');
const TOKEN_PATH       = path.join(__dirname, '../../gcp-token.json');

// ── Template ───────────────────────────────────────────────────────────────────

const TEMPLATE_ID = '1pY6SoMTTG1bzg_99v1-xwzLxVEVZSx-T3X-gMx4tBz0';

// ── Slide layouts ──────────────────────────────────────────────────────────────
// Maps descriptive names → 1-based position in the designer template.
// Increment the number if the template is restructured.
// Full reference: design-system/templates/slide-catalog.md

const SLIDE_LAYOUTS = {
  'cover-dark':              1,
  'cover-light':             2,
  'cover-alt-1':             3,
  'cover-alt-2':             4,
  'cover-alt-3':             5,
  'cover-alt-4':             6,
  'cover-alt-5':             7,
  'cover-alt-6':             8,
  'cover-dark-alt':          9,
  'agenda':                  10,
  'agenda-with-image':       11,
  'chapter-divider-1':       12,
  'chapter-divider-2':       13,
  'chapter-divider-3':       14,
  'chapter-divider-4':       15,
  'chapter-divider-5':       16,
  'headline-only-1':         17,
  'headline-only-2':         18,
  'headline-only-3':         19,
  '4-up-grid-header':        20,
  '4-up-grid-body':          21,
  '4-up-grid-minimal':       22,
  'text-narrative':          23,
  'pull-quote-1':            24,
  'pull-quote-2':            25,
  'pull-quote-blank':        26,
  'kpi-stat':                27,
  'evidence-dark-4img':      28,
  'evidence-light-list':     29,
  'evidence-dark-list':      30,
  'numbered-3-light':        31,
  'evidence-dark-bullets':   32,
  'evidence-dark-bullets-2': 33,
  'checklist-light':         34,
  'numbered-3-with-images':  35,
  'numbered-3-no-images':    36,
  'half-image-right':        37,
  'half-image-left':         38,
  'half-image-callout':      39,
  'table-grid':              40,
  'extended-content':        41,
  'closing-blank':           42,
};

// Content type → default layout name
const CONTENT_TYPE_DEFAULTS = {
  'cover':          'cover-dark',
  'agenda':         'agenda',
  'chapter':        'chapter-divider-1',
  'headline':       'headline-only-1',
  'grid':           '4-up-grid-header',
  'narrative':      'text-narrative',
  'quote':          'pull-quote-1',
  'kpi':            'kpi-stat',
  'evidence':       'evidence-light-list',
  'evidence-dark':  'evidence-dark-list',
  'checklist':      'checklist-light',
  'numbered':       'numbered-3-light',
  'half-image':     'half-image-right',
  'table':          'table-grid',
  'closing':        'closing-blank',
};

// ── OAuth ──────────────────────────────────────────────────────────────────────

const SCOPES = [
  'https://www.googleapis.com/auth/presentations',
  'https://www.googleapis.com/auth/drive',
];

function createOAuthClient() {
  if (!fs.existsSync(CREDENTIALS_PATH)) {
    throw new Error(
      `GCP credentials not found at ${CREDENTIALS_PATH}.\n` +
      'Get OAuth credentials from https://console.cloud.google.com/ and save as gcp-oauth.keys.json.'
    );
  }
  const creds = JSON.parse(fs.readFileSync(CREDENTIALS_PATH)).installed;
  return new google.auth.OAuth2(
    creds.client_id,
    creds.client_secret,
    'http://localhost:3000/oauth2callback'
  );
}

async function getAuthenticatedClient() {
  const oauth2Client = createOAuthClient();

  if (fs.existsSync(TOKEN_PATH)) {
    const token = JSON.parse(fs.readFileSync(TOKEN_PATH));
    oauth2Client.setCredentials(token);

    // Auto-refresh if the access token is expired (googleapis handles this,
    // but we check to surface a clear message if the refresh token is missing).
    if (!token.refresh_token && !token.access_token) {
      throw new Error(
        `Token at ${TOKEN_PATH} has no access_token or refresh_token.\n` +
        'Delete the file and re-run: node design-system/templates/google-slides-template.js --auth'
      );
    }
    return oauth2Client;
  }

  return runOAuthFlow(oauth2Client);
}

async function runOAuthFlow(oauth2Client) {
  const authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
    prompt: 'consent', // ensures refresh_token is returned
  });

  console.log('\n━━ Google Slides API — first-time authorization ━━━━━━━━━━━━━━━━\n');
  console.log('Open this URL in your browser:\n');
  console.log('  ' + authUrl + '\n');
  console.log('Waiting for authorization on http://localhost:3000/oauth2callback ...\n');

  return new Promise((resolve, reject) => {
    const server = http.createServer(async (req, res) => {
      let parsed;
      try {
        parsed = new URL(req.url, 'http://localhost:3000');
      } catch {
        res.end('Bad request.');
        return;
      }

      const code = parsed.searchParams.get('code');
      if (!code) {
        res.end('No code in request. Please try again.');
        return;
      }

      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end('<h2>Authorization successful.</h2><p>You can close this tab.</p>');
      server.close();

      try {
        const { tokens } = await oauth2Client.getToken(code);
        oauth2Client.setCredentials(tokens);
        fs.writeFileSync(TOKEN_PATH, JSON.stringify(tokens, null, 2));
        console.log(`  ✓ Token saved to ${TOKEN_PATH}\n`);
        resolve(oauth2Client);
      } catch (err) {
        reject(err);
      }
    });

    server.listen(3000, (err) => {
      if (err) reject(err);
    });

    server.on('error', reject);
  });
}

// ── API helpers ────────────────────────────────────────────────────────────────

/**
 * Creates a new presentation by copying the designer's template.
 * @param {string} title - Name to give the new presentation in Google Drive.
 * @returns {{ presentationId: string, url: string }}
 */
async function createPresentation(title) {
  const auth  = await getAuthenticatedClient();
  const drive = google.drive({ version: 'v3', auth });

  const res = await drive.files.copy({
    fileId:      TEMPLATE_ID,
    requestBody: { name: title },
  });

  const presentationId = res.data.id;
  return {
    presentationId,
    url: `https://docs.google.com/presentation/d/${presentationId}/edit`,
  };
}

/**
 * Returns the full presentation object (slide IDs, element IDs, etc.).
 * @param {string} presentationId
 */
async function getPresentation(presentationId) {
  const auth   = await getAuthenticatedClient();
  const slides = google.slides({ version: 'v1', auth });
  const res = await slides.presentations.get({ presentationId });
  return res.data;
}

/**
 * Replaces text occurrences within a specific slide.
 * @param {string} presentationId
 * @param {string} slideObjectId  - objectId of the target slide
 * @param {{ find: string, replaceWith: string }[]} replacements
 */
async function replaceText(presentationId, slideObjectId, replacements) {
  const auth     = await getAuthenticatedClient();
  const slidesApi = google.slides({ version: 'v1', auth });

  const requests = replacements.map(({ find, replaceWith }) => ({
    replaceAllText: {
      containsText: { text: find, matchCase: false },
      replaceText: replaceWith,
      pageObjectIds: [slideObjectId],
    },
  }));

  await slidesApi.presentations.batchUpdate({
    presentationId,
    requestBody: { requests },
  });
}

/**
 * Deletes slides by 0-based index.
 * Processes in descending order so deletions don't shift remaining indices.
 * @param {string} presentationId
 * @param {number[]} indices - 0-based indices to DELETE
 */
async function deleteSlides(presentationId, indices) {
  const auth     = await getAuthenticatedClient();
  const slidesApi = google.slides({ version: 'v1', auth });

  const prs    = await getPresentation(presentationId);
  const sorted = [...indices].sort((a, b) => b - a);

  const requests = sorted.map((idx) => ({
    deleteObject: { objectId: prs.slides[idx].objectId },
  }));

  if (requests.length === 0) return;

  await slidesApi.presentations.batchUpdate({
    presentationId,
    requestBody: { requests },
  });
}

/**
 * Keeps only the specified 0-based slide indices; deletes everything else.
 * @param {string} presentationId
 * @param {number[]} keepIndices - 0-based indices to KEEP
 */
async function deleteUnusedSlides(presentationId, keepIndices) {
  const prs    = await getPresentation(presentationId);
  const total  = prs.slides.length;
  const keepSet = new Set(keepIndices);
  const toDelete = [];

  for (let i = 0; i < total; i++) {
    if (!keepSet.has(i)) toDelete.push(i);
  }

  if (toDelete.length > 0) {
    await deleteSlides(presentationId, toDelete);
  }
}

// ── Duplicate & reorder ─────────────────────────────────────────────────────────

/**
 * Duplicates a slide by its objectId.
 * @param {string} presentationId
 * @param {string} slideObjectId - objectId of the slide to duplicate
 * @returns {string} objectId of the new (duplicated) slide
 */
async function duplicateSlide(presentationId, slideObjectId) {
  const auth     = await getAuthenticatedClient();
  const slidesApi = google.slides({ version: 'v1', auth });

  const res = await slidesApi.presentations.batchUpdate({
    presentationId,
    requestBody: {
      requests: [{ duplicateObject: { objectId: slideObjectId } }],
    },
  });

  // The response contains the mapping from original objectId → new objectId
  const reply = res.data.replies[0].duplicateObject;
  return reply.objectId;
}

/**
 * Moves slides to specific positions.
 * @param {string} presentationId
 * @param {string[]} slideObjectIds - objectIds in the desired final order
 * @param {number} insertionIndex - 0-based index where the first slide should land
 */
async function reorderSlides(presentationId, slideObjectIds, insertionIndex) {
  const auth     = await getAuthenticatedClient();
  const slidesApi = google.slides({ version: 'v1', auth });

  await slidesApi.presentations.batchUpdate({
    presentationId,
    requestBody: {
      requests: [{
        updateSlidesPosition: {
          slideObjectIds,
          insertionIndex,
        },
      }],
    },
  });
}

/**
 * Executes a slide plan: duplicate layouts, write content by element ID, reorder, delete originals.
 *
 * Uses deleteText + insertText (by placeholder element ID) instead of replaceAllText
 * to avoid fragile text matching with invisible characters.
 *
 * @param {string} presentationId - target presentation (already created from template)
 * @param {Array<{ layoutIndex: number, content: Object<string, string> }>} plan
 *   Each entry: { layoutIndex (0-based template slide), content: { TITLE: "...", BODY: "...", SUBTITLE: "..." } }
 * @returns {{ slideIds: string[], errors: string[] }}
 */
async function executeSlidePlan(presentationId, plan) {
  const auth      = await getAuthenticatedClient();
  const slidesApi = google.slides({ version: 'v1', auth });

  // 1. Get current presentation state
  const prs = await getPresentation(presentationId);
  const templateSlideIds = prs.slides.map(s => s.objectId);

  // 2. Duplicate all needed layout slides in one batch
  const dupRequests = plan.map(entry => ({
    duplicateObject: { objectId: templateSlideIds[entry.layoutIndex] },
  }));

  const dupRes = await slidesApi.presentations.batchUpdate({
    presentationId,
    requestBody: { requests: dupRequests },
  });

  const newSlideIds = dupRes.data.replies.map(r => r.duplicateObject.objectId);

  // 3. Read the presentation again to get element IDs of the new slides
  const updatedPrs = await getPresentation(presentationId);

  // 4. Build deleteText + insertText requests by finding placeholder elements
  const writeRequests = [];
  const errors = [];

  for (let i = 0; i < plan.length; i++) {
    const entry = plan[i];
    const slideId = newSlideIds[i];
    const content = entry.content || {};

    // Find this slide in the presentation
    const slide = updatedPrs.slides.find(s => s.objectId === slideId);
    if (!slide) {
      errors.push(`Slide ${i} (${slideId}) not found after duplication`);
      continue;
    }

    // Find placeholder elements by type
    for (const [phType, newText] of Object.entries(content)) {
      if (!newText) continue;

      const element = (slide.pageElements || []).find(el =>
        el.shape?.placeholder?.type === phType
      );

      if (!element) {
        // Try without exact match — some slides use indexed placeholders like SUBTITLE[1]
        const altElement = (slide.pageElements || []).find(el => {
          const pt = el.shape?.placeholder?.type;
          return pt && pt.startsWith(phType);
        });
        if (!altElement) {
          errors.push(`Slide ${i}: no ${phType} placeholder found`);
          continue;
        }
        // Use the alt element
        writeTextInElement(writeRequests, altElement, newText);
        continue;
      }

      writeTextInElement(writeRequests, element, newText);
    }
  }

  // 4b. Clean up leftover template placeholder text (lorem ipsum) in non-placeholder shapes
  for (let i = 0; i < plan.length; i++) {
    const slideId = newSlideIds[i];
    const slide = updatedPrs.slides.find(s => s.objectId === slideId);
    if (!slide) continue;

    for (const el of (slide.pageElements || [])) {
      // Skip placeholder elements (already handled above)
      if (el.shape && el.shape.placeholder) continue;
      // Skip non-text elements
      if (!el.shape || !el.shape.text) continue;

      const text = (el.shape.text.textElements || [])
        .filter(te => te.textRun)
        .map(te => te.textRun.content)
        .join('');

      // Match common latin placeholder patterns
      if (/lorem ipsum|curabitur id|maecenas non|mauris et lorem|vestibulum|ultrices|porttitor|lacinia/i.test(text)) {
        writeRequests.push({
          deleteText: {
            objectId: el.objectId,
            textRange: { type: 'ALL' },
          },
        });
      }
    }
  }

  if (writeRequests.length > 0) {
    await slidesApi.presentations.batchUpdate({
      presentationId,
      requestBody: { requests: writeRequests },
    });
  }

  // 5. Delete all original template slides
  const deleteRequests = templateSlideIds.map(objId => ({
    deleteObject: { objectId: objId },
  }));

  await slidesApi.presentations.batchUpdate({
    presentationId,
    requestBody: { requests: deleteRequests },
  });

  // 6. Reorder: move each new slide to its plan position one at a time.
  const reorderRequests = newSlideIds.map((slideId, i) => ({
    updateSlidesPosition: {
      slideObjectIds: [slideId],
      insertionIndex: i,
    },
  }));

  await slidesApi.presentations.batchUpdate({
    presentationId,
    requestBody: { requests: reorderRequests },
  });

  return { slideIds: newSlideIds, errors };
}

/**
 * Builds deleteText + insertText requests to overwrite an element's text content.
 */
function writeTextInElement(requests, element, newText) {
  const objectId = element.objectId;

  // Check if the element has existing text to delete
  const textElements = element.shape?.text?.textElements || [];
  const hasText = textElements.some(te => te.textRun?.content?.trim());

  if (hasText) {
    // Delete all existing text (range covers entire content)
    requests.push({
      deleteText: {
        objectId,
        textRange: { type: 'ALL' },
      },
    });
  }

  // Insert new text at index 0
  requests.push({
    insertText: {
      objectId,
      insertionIndex: 0,
      text: newText,
    },
  });
}

// ── Layout helpers ─────────────────────────────────────────────────────────────

/**
 * Returns the 0-based slide index for a named layout.
 * @param {string} layoutName - key from SLIDE_LAYOUTS
 * @returns {number} 0-based index
 */
function getSlideIndex(layoutName) {
  const oneBased = SLIDE_LAYOUTS[layoutName];
  if (oneBased === undefined) {
    throw new Error(
      `Unknown layout: '${layoutName}'. Valid names: ${Object.keys(SLIDE_LAYOUTS).join(', ')}`
    );
  }
  return oneBased - 1;
}

/**
 * Returns the recommended layout name for a content type.
 * @param {string} contentType - key from CONTENT_TYPE_DEFAULTS
 * @returns {string} layout name
 */
function getSlideLayout(contentType) {
  const layout = CONTENT_TYPE_DEFAULTS[contentType];
  if (!layout) {
    throw new Error(
      `Unknown content type: '${contentType}'. Valid types: ${Object.keys(CONTENT_TYPE_DEFAULTS).join(', ')}`
    );
  }
  return layout;
}

// ── Exports ────────────────────────────────────────────────────────────────────

module.exports = {
  TEMPLATE_ID,
  SLIDE_LAYOUTS,
  CREDENTIALS_PATH,
  TOKEN_PATH,
  getSlideIndex,
  getSlideLayout,
  createPresentation,
  getPresentation,
  replaceText,
  duplicateSlide,
  reorderSlides,
  executeSlidePlan,
  deleteSlides,
  deleteUnusedSlides,
};

// ── CLI entry point (auth setup) ───────────────────────────────────────────────

if (require.main === module) {
  if (process.argv[2] === '--auth') {
    getAuthenticatedClient()
      .then(() => console.log('Auth complete. You can now run the smoke test.'))
      .catch((err) => { console.error(err.message); process.exit(1); });
  } else {
    console.log('Usage: node google-slides-template.js --auth');
    console.log('  Sets up OAuth credentials for the Google Slides API.');
    console.log(`  Credentials:  ${CREDENTIALS_PATH}`);
    console.log(`  Token stored: ${TOKEN_PATH}`);
    console.log(`  Template ID:  ${TEMPLATE_ID}`);
  }
}
