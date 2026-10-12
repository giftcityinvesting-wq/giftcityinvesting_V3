#!/usr/bin/env python3
"""
Single source of truth for the sample content.

Run:  python3 tools/build_data.py

It produces
  1. data/fallback.json                       -> used by the website until a Google Sheet is connected
  2. giftcityinvesting-sheet-template.xlsx    -> upload to Google Drive / File > Import in Google Sheets

Every tab below becomes one tab in your Google Sheet. The tab names and column
headers must stay exactly as they are; you can add/remove ROWS freely.
"""
import json
import os
from openpyxl import Workbook
from openpyxl.styles import Alignment, Font, PatternFill
from openpyxl.utils import get_column_letter

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PH = "https://www.canva.com/design/REPLACE_ME/view"   # placeholder Canva link

# ---------------------------------------------------------------- SETTINGS
Settings = [
    ["site_name", "GIFT City Investing"],
    ["tagline", "India's gateway to global finance."],
    ["footer_description", "Discover GIFT City, inbound and outbound funds, investment routes and tax benefits in one place."],
    ["announcement", ""],
    ["email", "team.oaksprouts@gmail.com"],
    ["phone", "+91 77889 90390"],
    ["whatsapp_number", "917788990390"],
    ["address", "101, Aairah Terrazo,17, Shankar Sheth Road,Pune 411002"],
    ["copyright", "© 2026 Oak Sprouts. All rights reserved."],
    ["form_endpoint", ""],
    ["disclaimer", "Investments are subject to market risks. This website is for information only and is not investment, tax or legal advice. Please consult your advisor before investing."],
]

# ----------------------------------------------------------------- CONTENT
# Page headings & paragraphs. Edit the "value" column.
Content = [
    ["hero_eyebrow", "GIFT City · India's International Financial Services Centre"],
    ["hero_title", "Where India meets the world's capital."],
    ["hero_subtitle", "GIFT City is home. One gateway for global investors, funds, banks and businesses to access India, and for Indians to invest around the world."],
    ["hero_cta_primary_label", "Explore GIFT City"],
    ["hero_cta_primary_link", "#/presentations"],
    ["hero_cta_secondary_label", "Talk to us"],
    ["hero_cta_secondary_link", "#/contact"],

    ["about_eyebrow", "What is GIFT City"],
    ["about_title", "A global financial hub, built in India."],
    ["about_text", "GIFT City (Gujarat International Finance Tec-City) hosts India's first International Financial Services Centre. It lets funds, banks, insurers and businesses operate in a globally benchmarked environment, regulated by a single unified regulator, IFSCA.\nWatch the presentation to see how it works, who it is for and why it matters."],
    ["about_button", "Watch the GIFT City presentation"],

    ["benefits_eyebrow", "Benefits"],
    ["benefits_title", "Built for everyone in the ecosystem."],
    ["benefits_subtitle", "Choose who you are to see what GIFT City offers you."],

    ["timeline_eyebrow", "Timeline"],
    ["timeline_title", "The GIFT City journey."],
    ["timeline_subtitle", "From a bold idea to a thriving international financial centre."],

    ["funds_eyebrow", "Our funds"],
    ["funds_title", "Funds, curated for you."],
    ["funds_subtitle", "Inbound and outbound funds available through GIFT City."],

    ["presentations_eyebrow", "Presentations"],
    ["presentations_title", "See the full picture."],
    ["presentations_subtitle", "Short, visual presentations on GIFT City, global investing and each fund."],

    ["cta_title", "Ready to invest through GIFT City?"],
    ["cta_subtitle", "Speak with our team about funds, routes and tax benefits."],
    ["cta_button", "Get in touch"],

    ["inbound_eyebrow", "Inbound funds"],
    ["inbound_title", "Invest in India from GIFT City."],
    ["inbound_subtitle", "Funds that give global investors access to the India growth story, in a simple and regulated structure."],
    ["outbound_eyebrow", "Outbound funds"],
    ["outbound_title", "Invest globally from India."],
    ["outbound_subtitle", "Funds that let Indian investors diversify across global markets through GIFT City."],

    ["accreditation_eyebrow", "Accreditation"],
    ["accreditation_title", "Trusted. Registered. Accredited."],
    ["accreditation_subtitle", "Our registrations, approvals and partnerships."],

    ["insights_eyebrow", "Insights"],
    ["insights_title", "Ideas & updates."],
    ["insights_subtitle", "Blogs, market notes and updates from the GIFT City ecosystem."],

    ["team_eyebrow", "Team"],
    ["team_title", "The people behind giftcityinvesting."],
    ["team_subtitle", "A team of finance and investing professionals."],

    ["contact_eyebrow", "Contact us"],
    ["contact_title", "Let's talk."],
    ["contact_subtitle", "Tell us what you are looking for and we will get back to you shortly."],

    ["terms_text", "Add your Terms of Use here. Each new line becomes a new paragraph."],
    ["privacy_text", "Add your Privacy Policy here. Each new line becomes a new paragraph."],
]

# ------------------------------------------------------------------- STATS
Stats = [
    ["label", "value", "prefix", "suffix", "order", "visible"],
    ["Years of GIFT City", 10, "", "+", 1, "yes"],
    ["Funds available", 5, "", "", 2, "yes"],
    ["Investment routes", 3, "", "", 3, "yes"],
    ["Investors guided", 500, "", "+", 4, "yes"],
]

# ---------------------------------------------------------------- SOCIALS
Socials = [
    ["name", "url"],
    ["linkedin", "https://www.linkedin.com/"],
    ["x", "https://x.com/"],
    ["instagram", "https://www.instagram.com/"],
    ["facebook", "https://www.facebook.com/"],
    ["youtube", "https://www.youtube.com/"],
    ["discord", ""],
    ["blog", ""],
]

# --------------------------------------------------------------- BENEFITS
Benefits = [
    ["audience", "title", "description", "order", "visible"],
    ["Business", "Attractive tax regime", "Tax incentives for units operating in the IFSC, designed to be competitive globally.", 1, "yes"],
    ["Business", "Single-window clearance", "Set up and operate with a streamlined approval process.", 2, "yes"],
    ["Business", "World-class infrastructure", "Purpose-built district with plug-and-play offices and connectivity.", 3, "yes"],
    ["Investors", "Global access", "Invest across geographies through a regulated international centre.", 1, "yes"],
    ["Investors", "Currency flexibility", "Transact in foreign currency such as USD.", 2, "yes"],
    ["Investors", "Tax efficiency", "Potential tax advantages depending on the route you choose.", 3, "yes"],
    ["Banks", "IFSC Banking Units", "Offer international banking and treasury services from GIFT City.", 1, "yes"],
    ["Banks", "Wider product shelf", "Access foreign currency lending, trade finance and more.", 2, "yes"],
    ["Banks", "Regulatory clarity", "A single regulator brings clarity and speed.", 3, "yes"],
    ["Funds", "Fund structures", "Set up and domicile funds in a globally recognised framework.", 1, "yes"],
    ["Funds", "Global investor base", "Tap into foreign and NRI capital with simpler onboarding.", 2, "yes"],
    ["Funds", "Cost-efficient operations", "Operate close to Indian talent and markets.", 3, "yes"],
    ["Employees", "Global career paths", "Work with international teams in a modern financial district.", 1, "yes"],
    ["Employees", "Growing talent pool", "Roles across funds, banking, fintech, legal and operations.", 2, "yes"],
    ["Employees", "Live-work-play", "A smart city with offices, housing and amenities together.", 3, "yes"],
]

# --------------------------------------------------------------- TIMELINE
Timeline = [
    ["year", "title", "description", "visible"],
    ["2007", "The vision", "GIFT City is conceived as India's answer to global financial hubs.", "yes"],
    ["2015", "First operations", "The first units begin operating as the city takes shape.", "yes"],
    ["2020", "Unified regulator", "IFSCA is established as the single regulator for the IFSC.", "yes"],
    ["2023", "Momentum builds", "Banks, funds, insurers and fintechs scale up their presence.", "yes"],
    ["2026", "Today", "A growing global financial centre. Add your latest milestone here.", "yes"],
]

# ------------------------------------------------------------------ FUNDS
Funds = [
    ["id", "type", "name", "amc", "tagline", "description", "category", "min_investment", "risk", "highlights", "presentation_url", "factsheet_url", "accent", "show_in_carousel", "order", "visible"],
    ["mirae", "inbound", "Mirae Asset", "Mirae Asset", "Access India's growth, from GIFT City.", "Add a short description of this fund here.", "Equity", "Update in sheet", "Update in sheet", "Highlight one|Highlight two|Highlight three", PH, "", "indigo", "yes", 1, "yes"],
    ["nj", "inbound", "NJ", "NJ", "A simple route into Indian markets.", "Add a short description of this fund here.", "Equity", "Update in sheet", "Update in sheet", "Highlight one|Highlight two|Highlight three", PH, "", "teal", "yes", 2, "yes"],
    ["tata", "inbound", "Tata", "Tata", "India's trusted name, now in GIFT City.", "Add a short description of this fund here.", "Equity", "Update in sheet", "Update in sheet", "Highlight one|Highlight two|Highlight three", PH, "", "violet", "yes", 3, "yes"],
    ["marcellus", "outbound", "Marcellus", "Marcellus", "Quality-focused investing for the long term.", "Add a short description of this fund here.", "Global equity", "Update in sheet", "Update in sheet", "Highlight one|Highlight two|Highlight three", PH, "", "amber", "yes", 4, "yes"],
    ["dsp", "outbound", "DSP", "DSP", "Global diversification, made simple.", "Add a short description of this fund here.", "Global equity", "Update in sheet", "Update in sheet", "Highlight one|Highlight two|Highlight three", PH, "", "pink", "yes", 5, "yes"],
]

# ------------------------------------------------------------- COMPARISONS
# First column = parameter. Other column headers = names shown on the table.
Compare_Inbound = [
    ["Parameter", "Mirae Asset", "NJ", "Tata"],
    ["Fund type", "—", "—", "—"],
    ["Strategy", "—", "—", "—"],
    ["Minimum investment", "—", "—", "—"],
    ["Currency", "—", "—", "—"],
    ["Fees", "—", "—", "—"],
    ["Returns (add period)", "—", "—", "—"],
    ["Risk level", "—", "—", "—"],
    ["Best suited for", "—", "—", "—"],
]
Compare_Outbound = [
    ["Parameter", "Marcellus", "DSP", "Direct equity"],
    ["Fund type", "—", "—", "Self-directed stock investing"],
    ["Strategy", "—", "—", "You pick and manage each stock"],
    ["Minimum investment", "—", "—", "Depends on the stock and broker"],
    ["Diversification", "—", "—", "Depends on your own portfolio"],
    ["Fees", "—", "—", "Brokerage and other charges"],
    ["Effort needed", "Low", "Low", "High"],
    ["Returns (add period)", "—", "—", "—"],
    ["Best suited for", "—", "—", "—"],
]

# -------------------------------------------------------------------- TAX
Tax = [
    ["type", "title", "description", "order", "visible"],
    ["inbound", "Tax benefit one", "Describe the tax benefit for inbound investors here.", 1, "yes"],
    ["inbound", "Tax benefit two", "Describe the tax benefit for inbound investors here.", 2, "yes"],
    ["inbound", "Tax benefit three", "Describe the tax benefit for inbound investors here.", 3, "yes"],
    ["outbound", "Tax benefit one", "Describe the tax benefit for outbound investors here.", 1, "yes"],
    ["outbound", "Tax benefit two", "Describe the tax benefit for outbound investors here.", 2, "yes"],
    ["outbound", "Tax benefit three", "Describe the tax benefit for outbound investors here.", 3, "yes"],
]

# ----------------------------------------------------------------- ROUTES
Routes = [
    ["type", "step", "title", "description", "visible"],
    ["inbound", 1, "Complete KYC", "Submit your identity and address documents.", "yes"],
    ["inbound", 2, "Choose your fund", "Pick the fund that fits your goals.", "yes"],
    ["inbound", 3, "Fund your account", "Transfer funds through the route that suits you.", "yes"],
    ["inbound", 4, "Invest & track", "Start investing and follow performance online.", "yes"],
    ["outbound", 1, "Complete KYC", "Submit your identity and address documents.", "yes"],
    ["outbound", 2, "Choose your route", "Select the investment route that fits you.", "yes"],
    ["outbound", 3, "Send funds", "Remit funds as per the applicable limits and rules.", "yes"],
    ["outbound", 4, "Invest globally", "Get access to global markets and track your portfolio.", "yes"],
]

# -------------------------------------------------------------------- FAQ
FAQ = [
    ["type", "question", "answer", "order", "visible"],
    ["inbound", "What are inbound funds?", "Add your answer here.", 1, "yes"],
    ["inbound", "Who can invest?", "Add your answer here.", 2, "yes"],
    ["inbound", "What is the minimum investment?", "Add your answer here.", 3, "yes"],
    ["outbound", "What are outbound funds?", "Add your answer here.", 1, "yes"],
    ["outbound", "How are outbound funds different from direct equity?", "Add your answer here.", 2, "yes"],
    ["outbound", "What are the limits for sending money abroad?", "Add your answer here.", 3, "yes"],
]

# ---------------------------------------------------------- PRESENTATIONS
# Fund presentations come from the Funds tab automatically.
Presentations = [
    ["category", "title", "description", "url", "order", "visible"],
    ["GIFT City", "GIFT City", "What it is, who it is for and why it matters.", PH, 1, "yes"],
    ["Global", "Why invest globally", "The case for diversifying beyond one market.", PH, 2, "yes"],
    ["India", "Why invest in India", "The India growth story, in a few slides.", PH, 3, "yes"],
]

# ---------------------------------------------------------- ACCREDITATION
Accreditation = [
    ["title", "issuer", "description", "status", "link", "image", "order", "visible"],
    ["Accreditation one", "Issuing authority", "Describe this registration or accreditation here.", "Active", "", "", 1, "yes"],
    ["Accreditation two", "Issuing authority", "Describe this registration or accreditation here.", "Active", "", "", 2, "yes"],
    ["Accreditation three", "Issuing authority", "Describe this registration or accreditation here.", "Active", "", "", 3, "yes"],
]

# --------------------------------------------------------------- INSIGHTS
Insights = [
    ["date", "title", "category", "summary", "link", "image", "featured", "visible"],
    ["2026-10-01", "Welcome to giftcityinvesting", "Update", "Replace this with your first blog post summary. Add the blog link in the link column.", "", "", "yes", "yes"],
    ["2026-09-15", "Inbound vs outbound funds explained", "Education", "A quick guide to the two ways of investing through GIFT City.", "", "", "no", "yes"],
    ["2026-09-01", "Why GIFT City matters", "Market", "A short note on why global capital is looking at GIFT City.", "", "", "no", "yes"],
]

# ------------------------------------------------------------------- TEAM
Team = [
    ["name", "role", "bio", "photo", "linkedin", "order", "visible"],
    ["Team member one", "Founder", "Add a short bio here.", "", "", 1, "yes"],
    ["Team member two", "Investment advisor", "Add a short bio here.", "", "", 2, "yes"],
    ["Team member three", "Operations", "Add a short bio here.", "", "", 3, "yes"],
]

# ----------------------------------------------------------------- README
README = [
    ["How to use this sheet"],
    [""],
    ["1. Every tab is one part of the website. Do NOT rename tabs or column headers."],
    ["2. Add, edit or delete ROWS freely. Changes appear on the website within a few minutes."],
    ["3. 'visible' column: type yes/no to show or hide a row without deleting it."],
    ["4. 'order' column: smaller numbers come first."],
    ["5. Settings and Content tabs have two columns: key (do not change) and value (edit this)."],
    ["6. Compare_Inbound / Compare_Outbound: first column is the row label, other column headers are the names shown on the table. Add or remove columns as needed."],
    ["7. Canva links: paste the 'View' link of your design. In Canva use Share > More > Embed if the viewer does not load."],
    ["8. In a list such as highlights, separate items with a | character."],
    ["9. Images: paste a public image URL (Drive images need 'Anyone with the link')."],
    ["10. Finally: Share > General access > 'Anyone with the link' > Viewer. Copy the Sheet ID from the URL into config.js."],
]

SHEETS = {
    "Settings": (["key", "value"], Settings),
    "Content": (["key", "value"], Content),
    "Stats": (Stats[0], Stats[1:]),
    "Socials": (Socials[0], Socials[1:]),
    "Benefits": (Benefits[0], Benefits[1:]),
    "Timeline": (Timeline[0], Timeline[1:]),
    "Funds": (Funds[0], Funds[1:]),
    "Compare_Inbound": (Compare_Inbound[0], Compare_Inbound[1:]),
    "Compare_Outbound": (Compare_Outbound[0], Compare_Outbound[1:]),
    "Tax": (Tax[0], Tax[1:]),
    "Routes": (Routes[0], Routes[1:]),
    "FAQ": (FAQ[0], FAQ[1:]),
    "Presentations": (Presentations[0], Presentations[1:]),
    "Accreditation": (Accreditation[0], Accreditation[1:]),
    "Insights": (Insights[0], Insights[1:]),
    "Team": (Team[0], Team[1:]),
}


def to_json():
    out = {}
    for name, (head, rows) in SHEETS.items():
        out[name] = [dict(zip(head, r)) for r in rows]
    return out


def to_xlsx(path):
    wb = Workbook()
    ws = wb.active
    ws.title = "READ ME"
    for r in README:
        ws.append(r)
    ws["A1"].font = Font(bold=True, size=14)
    ws.column_dimensions["A"].width = 120

    head_fill = PatternFill("solid", fgColor="1F2A6B")
    for name, (head, rows) in SHEETS.items():
        ws = wb.create_sheet(name)
        ws.append(head)
        for r in rows:
            ws.append(r)
        for c in range(1, len(head) + 1):
            cell = ws.cell(row=1, column=c)
            cell.font = Font(bold=True, color="FFFFFF")
            cell.fill = head_fill
            width = 18
            if head[c - 1] in ("description", "answer", "summary", "bio", "value", "about_text"):
                width = 60
            ws.column_dimensions[get_column_letter(c)].width = width
        for row in ws.iter_rows(min_row=2):
            for cell in row:
                cell.alignment = Alignment(wrap_text=True, vertical="top")
        ws.freeze_panes = "A2"
    wb.save(path)


if __name__ == "__main__":
    os.makedirs(os.path.join(ROOT, "data"), exist_ok=True)
    with open(os.path.join(ROOT, "data", "fallback.json"), "w", encoding="utf-8") as f:
        json.dump(to_json(), f, ensure_ascii=False, indent=1)
    to_xlsx(os.path.join(ROOT, "giftcityinvesting-sheet-template.xlsx"))
    print("OK: data/fallback.json + giftcityinvesting-sheet-template.xlsx")
