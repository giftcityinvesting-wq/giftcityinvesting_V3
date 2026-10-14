/**
 * GIFT City Investing: lead capture
 * ---------------------------------------------------------------
 * Saves every contact-form and accreditation-form submission as a new row in a "Leads" tab.
 *
 * IMPORTANT: put this in a SEPARATE, PRIVATE Google Sheet (not the public content sheet).
 * Your content sheet is shared as "Anyone with the link", so anything inside it is public.
 *
 * SETUP (about 3 minutes)
 *  1. Create a new Google Sheet, name it "GIFT City Leads". Do NOT share it with anyone.
 *  2. In that sheet: Extensions > Apps Script. Delete the sample code and paste this whole file.
 *  3. Click Deploy > New deployment > the gear icon > Web app.
 *       Execute as:      Me
 *       Who has access:  Anyone
 *     Click Deploy, then Authorize access (choose your Google account > Advanced > Go to project > Allow).
 *  4. Copy the "Web app URL" (it ends with /exec).
 *  5. In your CONTENT sheet, Settings tab, paste that URL as the value of  form_endpoint.
 *  6. Submit the form on your website once to test: a "Leads" tab appears with the new row.
 *
 * If you change this code later: Deploy > Manage deployments > pencil icon > Version: New version > Deploy.
 */

const SHEET_NAME = 'Leads';

// Optional: type an email address here to get an email for every new lead. Leave '' for no emails.
const NOTIFY_EMAIL = '';

const HEADERS = ['Received at', 'Name', 'Email', 'Phone', 'Interested in', 'Route / criteria', 'Message', 'Source', 'Page', 'Consent'];

function doPost(e) {
  const p = (e && e.parameter) || {};
  if (p.website) return reply_({ ok: true });            // spam trap field: ignore silently

  const lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    let sh = ss.getSheetByName(SHEET_NAME);
    if (!sh) sh = ss.insertSheet(SHEET_NAME);
    if (sh.getLastRow() === 0) {
      sh.appendRow(HEADERS);
      sh.setFrozenRows(1);
      sh.getRange(1, 1, 1, HEADERS.length).setFontWeight('bold').setBackground('#1f2a6b').setFontColor('#ffffff');
      sh.getRange(2, 2, sh.getMaxRows() - 1, HEADERS.length - 1).setNumberFormat('@');   // plain text: no formula injection
      sh.getRange(2, 1, sh.getMaxRows() - 1, 1).setNumberFormat('dd mmm yyyy, hh:mm');
      sh.setColumnWidths(1, HEADERS.length, 150);
      sh.setColumnWidth(7, 380);
    }
    const row = [
      new Date(), clean_(p.name), clean_(p.email), clean_(p.phone), clean_(p.interest),
      clean_(p.route), clean_(p.message), clean_(p.source), clean_(p.page), clean_(p.consent)
    ];
    sh.appendRow(row);

    if (NOTIFY_EMAIL) {
      MailApp.sendEmail(
        NOTIFY_EMAIL,
        'New enquiry from the website: ' + (row[1] || 'someone'),
        HEADERS.map(function (h, i) { return h + ': ' + row[i]; }).join('\n')
      );
    }
    return reply_({ ok: true });
  } catch (err) {
    return reply_({ ok: false, error: String(err) });
  } finally {
    lock.releaseLock();
  }
}

// Opening the web-app URL in a browser should show this, so you know it is live.
function doGet() {
  return ContentService.createTextOutput('GIFT City Investing lead endpoint is live.');
}

function clean_(v) {
  v = String(v == null ? '' : v).trim().slice(0, 3000);
  return v.charAt(0) === '=' ? "'" + v : v;              // never let a visitor's text become a formula
}

function reply_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
