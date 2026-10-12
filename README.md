# giftcityinvesting

A fast, animated, Apple-style website where **all frequently changing content is controlled from one Google Sheet**.
No build step, no framework: plain HTML/CSS/JS, so it hosts for free on Cloudflare Pages.

## Pages
Home (GIFT City) · Inbound Funds (Funds, Compare, Tax benefits, Investment routes, FAQ) · Outbound Funds (same tabs) · Presentations · Accreditation · Insights · Team · Contact · Terms · Privacy

## 1. Connect your Google Sheet (5 minutes)
1. Open Google Sheets > **File > Import > Upload** `giftcityinvesting-sheet-template.xlsx` > "Create new spreadsheet".
2. **Share > General access > Anyone with the link > Viewer.**
3. Copy the Sheet ID from the URL: `docs.google.com/spreadsheets/d/`**`THIS_PART`**`/edit`
4. Paste it into `config.js` as `sheetId`, commit and push.

From then on, edit the sheet and the site updates within ~5 minutes (visitors' browsers cache for `cacheMinutes`). No redeploy needed.

## What each tab controls
| Tab | Controls |
|---|---|
| Settings | Site name, email, phone, WhatsApp, address, copyright, announcement banner, contact-form endpoint, disclaimer |
| Content | All headings and paragraphs on every page |
| Stats | The counters at the bottom of the home hero |
| Socials | Footer social icons (empty URL = hidden) |
| Benefits | Business / Investors / Banks / Funds / Employees cards |
| Timeline | GIFT City timeline |
| Funds | Every fund, its carousel card, details popup and Canva presentation |
| Compare_Inbound / Compare_Outbound | Comparison tables. Add or rename columns freely |
| Tax, Routes, FAQ | Per-page tabs (`type` = inbound or outbound) |
| Presentations | GIFT City, Why global, Why India (fund decks come from the Funds tab) |
| Accreditation, Insights, Team | Cards on those pages |

Tips: the `visible` column (yes/no) hides a row without deleting it, `order` sorts, and `highlights` uses `|` between items.
Not in the sheet (rarely changes): navigation, footer link columns, layout, colours. These live in `assets/app.js` and `assets/styles.css`.

## Canva presentations
Paste the design's **View** link into the `url` / `presentation_url` column. It opens in a pop-up viewer on the site with an "open in new tab" fallback. Rows still containing `REPLACE_ME` show "Coming soon".

## Contact form
By default it opens the visitor's email app. To receive submissions silently, create a free form at formspree.io (or any endpoint that accepts JSON) and paste its URL into `Settings > form_endpoint`.

## 2. Host on GitHub + Cloudflare Pages
```bash
cd giftcityinvesting
git init && git add . && git commit -m "Initial site"
git branch -M main
git remote add origin https://github.com/YOUR-USER/giftcityinvesting.git
git push -u origin main
```
Cloudflare dashboard > **Workers & Pages > Create > Pages > Connect to Git** > pick the repo.
Build command: *(leave empty)* · Output directory: `/` · Save and Deploy. Then add your custom domain under the project's **Custom domains** tab.

## Test locally
`python3 -m http.server 8000` then open http://localhost:8000 (opening index.html by double-click will not load the data files).

## Regenerating the template
Edit `tools/build_data.py` and run `python3 tools/build_data.py` to rebuild `data/fallback.json` and the xlsx template.
