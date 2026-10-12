/*
  ONE-TIME SETUP
  1. Import giftcityinvesting-sheet-template.xlsx into Google Sheets.
  2. Share > General access > "Anyone with the link" > Viewer.
  3. Copy the Sheet ID from the sheet URL:
     https://docs.google.com/spreadsheets/d/  <<< THIS PART >>>  /edit
  4. Paste it below and push to GitHub. Done.

  Leave sheetId empty to show the built-in sample content (data/fallback.json).
*/
window.GCI_CONFIG = {
  sheetId: "1npP5LiNuwMhw8-_fjCu9Qiia-a-z4y3YV8HVtqTw33s",          // e.g. "1AbCdEfGhIjKlMnOpQrStUvWxYz0123456789"
  cacheMinutes: 5       // how long visitors' browsers keep the sheet data before re-checking
};
