#!/usr/bin/env python3
"""
Single source of truth for the sample content.

Run:  python3 tools/build_data.py

It produces
  1. data/fallback.json                       -> used by the website until a Google Sheet is connected
                                                 (and for any tab/key missing from your sheet)
  2. giftcityinvesting-sheet-template.xlsx    -> import into Google Sheets
  3. legal/terms.txt, legal/privacy.txt       -> the same legal text as plain files

Every tab below becomes one tab in your Google Sheet. Tab names and column headers must stay
exactly as they are; you can add/remove ROWS freely.
"""
import json
import os
from openpyxl import Workbook
from openpyxl.styles import Alignment, Font, PatternFill
from openpyxl.utils import get_column_letter

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PH = "https://www.canva.com/design/REPLACE_ME/view"   # placeholder Canva link

# ---------------------------------------------------------------- LEGAL TEXT
TERMS = """Last updated: 14 October 2026

These Terms of Use ("Terms") govern your access to and use of the giftcityinvesting website (the "Website"), operated by Oak Sprouts ("we", "us", "our"). By using the Website you agree to these Terms. If you do not agree, please do not use the Website.

# 1. About this Website
The Website provides general information about GIFT City (the International Financial Services Centre in Gandhinagar, Gujarat), inbound and outbound funds, investment routes, tax considerations, accreditation and related topics. It also lets you view presentations and articles and contact us.

# 2. Not investment, tax or legal advice
- All content is for general information and education only.
- Nothing on the Website is an offer, invitation, solicitation, recommendation or advice to buy, sell or subscribe to any security, fund or product, or to adopt any tax or legal position.
- Tax treatment depends on your individual circumstances and may change. Please consult a qualified investment adviser, chartered accountant or lawyer before you act.
- [Add your regulatory registration details here, for example AMFI ARN, SEBI or IFSCA registration number, if applicable. Delete this line if not applicable.]

# 3. Investment risk
Investments are subject to market risks, including the possible loss of principal. Past performance is not an indicator of future returns. Investments in foreign currency are also subject to exchange-rate risk. Please read all scheme-related and offer documents carefully before investing.

# 4. Eligibility and jurisdiction
The Website is intended for persons who are legally permitted to access it. Certain products may be available only to specific categories of investors (for example accredited investors, residents or non-residents) and may be restricted in some jurisdictions. It is your responsibility to make sure that your use of the Website and any investment complies with the laws that apply to you, including exchange-control and tax rules.

# 5. Accuracy of information
We try to keep the content accurate and current, but we do not guarantee that it is complete, accurate or up to date. Fund details, fees, thresholds, regulations and tax rules may change without notice. Information about third-party funds, asset managers and products belongs to those parties; please refer to their official documents for the final word.

# 6. Third-party content and links
The Website may embed or link to third-party content, including presentations hosted on Canva, documents, videos and the websites of fund houses, regulators and others. We do not control, and are not responsible for, that content, its availability or the privacy practices of those sites. Names and logos of third parties belong to their owners and appear for identification only. No endorsement or affiliation is implied unless we say so.

# 7. Intellectual property
Unless stated otherwise, the content, design, text, graphics and code of the Website belong to Oak Sprouts or its licensors and are protected by applicable intellectual-property laws. You may view the Website and share links to it for personal, non-commercial use. You may not copy, republish, scrape, modify or commercially exploit the content without our written permission.

# 8. Acceptable use
You agree not to:
- use the Website unlawfully, or to commit fraud or misrepresentation;
- try to gain unauthorised access to, disrupt or overload the Website or its systems;
- submit false, misleading or another person's information through our forms;
- use automated tools to extract data from the Website without permission; or
- introduce viruses or other harmful code.

# 9. Enquiries and forms
When you submit a form you confirm that the information is accurate and that we may contact you about your enquiry. Submitting a form does not create an advisory, distribution or other client relationship; any such relationship will arise only under a separate written agreement. How we handle personal data is described in our Privacy Policy.

# 10. Disclaimer of warranties
The Website and its content are provided "as is" and "as available", without warranties of any kind, express or implied, to the extent permitted by law. We do not warrant that the Website will be uninterrupted, secure or error free.

# 11. Limitation of liability
To the fullest extent permitted by law, Oak Sprouts and its partners, directors, employees and agents will not be liable for any indirect, incidental, special or consequential loss, or for any loss of profit, data or investment value, arising from your use of, or reliance on, the Website or its content. Nothing in these Terms excludes liability that cannot be excluded by law.

# 12. Indemnity
You agree to indemnify and hold harmless Oak Sprouts from claims, losses and expenses arising from your breach of these Terms or your misuse of the Website.

# 13. Changes to the Website and these Terms
We may update the Website and these Terms from time to time. The "Last updated" date above shows the latest version. If you keep using the Website after a change, you accept the updated Terms.

# 14. Governing law
These Terms are governed by the laws of India. Subject to applicable law, the courts at [Pune, Maharashtra] have exclusive jurisdiction over any dispute arising from them. [Please confirm the city and forum with your lawyer.]

# 15. Contact us
For any question about these Terms, write to team.oaksprouts@gmail.com or use the Contact page."""

PRIVACY = """Last updated: 14 October 2026

This Privacy Policy explains how Oak Sprouts ("we", "us", "our"), which operates the giftcityinvesting website (the "Website"), collects, uses and protects your personal data. For the purposes of the Digital Personal Data Protection Act, 2023 and the rules made under it (together, the "DPDP law"), we act as the data fiduciary for the personal data collected through the Website.

# 1. What we collect
- Information you give us: your name, email address, phone number, the topic you are interested in, your accreditation route (if you apply) and the message you write in our contact or application forms.
- Technical information: our hosting provider may process your IP address, browser type, device information and the pages you request in server logs, for security and performance.
- Browser storage: to load faster, your browser keeps a saved copy of the Website's content (this is not your personal data) in its local storage. We do not currently use advertising or tracking cookies. If we add analytics or cookies later, we will update this policy.
We do not intentionally collect sensitive information such as PAN, Aadhaar, bank-account or card details through the Website. Please do not send them through our forms. If we need them, we will ask you through a secure channel.

# 2. Why we use your data
- To reply to your enquiry and guide you on funds, routes and accreditation.
- To process an application that you choose to start.
- To send you information you have asked for.
- To keep the Website secure and to prevent misuse.
- To comply with legal, regulatory and accounting obligations.
- To understand what visitors find useful and improve our content.

# 3. Consent
We process your personal data based on your consent, which you give by agreeing to this policy and submitting a form. You can withdraw your consent at any time by writing to us. Withdrawal does not affect processing done before it, and we may need to keep some data where the law requires.

# 4. Who we share it with
- Service providers that help us run the Website and store your enquiries, such as Google (Google Workspace, including Sheets and Apps Script), Cloudflare (hosting and security) and Canva (presentations you choose to view). They process data on our behalf and under their own security commitments.
- Fund houses, asset managers, distributors or advisers, but only when you ask us to introduce you or process an application with them, or where you otherwise consent.
- Courts, regulators and authorities, where the law requires.
We do not sell your personal data.

# 5. Storage, transfers and retention
Our service providers may store data on servers outside India. We keep enquiry data only for as long as needed for the purpose it was collected, to meet legal, regulatory or accounting needs, or until you ask us to delete it, subject to the law. [Add your retention period here, for example 24 months from your last enquiry.]

# 6. Security
We use reasonable safeguards to protect your data, including restricted access to the sheets where enquiries are stored and encrypted (HTTPS) connections. No method of transmission over the internet is completely secure, so we cannot guarantee absolute security.

# 7. Your rights
Under the DPDP law you may:
- ask for a summary of the personal data we hold and how we process it;
- ask us to correct, complete or update your data;
- ask us to erase your data, subject to legal requirements;
- withdraw your consent;
- have your grievance addressed; and
- nominate another person to exercise your rights if you die or become unable to do so.
To use any of these rights, write to the email address in section 11.

# 8. Children
The Website is not meant for people under 18, and we do not knowingly collect personal data of children. If you believe a child has sent us data, please tell us and we will delete it.

# 9. Third-party links and embeds
The Website links to and embeds third-party content (for example Canva presentations and fund-house websites). Those parties have their own privacy practices, which we do not control. Please read their policies.

# 10. Changes to this policy
We may update this policy from time to time. The "Last updated" date above shows the latest version.

# 11. Grievance and contact
For questions, requests or complaints about your personal data, contact our Grievance Officer: [Name of Grievance Officer], Oak Sprouts, 101, Aairah Terrazo,17, Shankar Sheth Road, Pune 411002. Email: team.oaksprouts@gmail.com. Phone: +91 77889 90390. We will respond within a reasonable period and in any case within the time required by law."""

# ---------------------------------------------------------------- SETTINGS
# columns: key | value | notes   (notes are for you; the website ignores them)
Settings = [
    ["site_name", "GIFT City Investing", "Shown in the nav bar, footer and browser tab."],
    ["tagline", "India's gateway to global finance.", "Used in the browser tab title and as the default description."],
    ["footer_description", "Discover GIFT City, inbound and outbound funds, investment routes and tax benefits in one place.", "Paragraph under the logo in the footer."],
    ["announcement", "", "Leave blank for no banner. Any text here shows a banner at the top of every page."],
    ["email", "team.oaksprouts@gmail.com", ""],
    ["phone", "+91 77889 90390", ""],
    ["whatsapp_number", "917788990390", "Digits only, with country code, no + sign."],
    ["address", "101, Aairah Terrazo,17, Shankar Sheth Road,Pune 411002", ""],
    ["copyright", "© 2026 Oak Sprouts. All rights reserved.", ""],
    ["form_endpoint", "", "Paste your Google Apps Script web-app URL here (ends with /exec) so form submissions land in your private Leads sheet. Leave blank to open the visitor's email app instead."],
    ["disclaimer", "Investments are subject to market risks. This website is for information only and is not investment, tax or legal advice. Please consult your advisor before investing.", "Small print in the footer and under tables."],
    ["logo_nav", "", "Logo for the DARK top bar (use a white/light version). Paste a Google Drive share link or any image URL. Blank = built-in mark + site name."],
    ["logo_footer", "", "Logo for the LIGHT footer (use a dark/coloured version). Blank = built-in mark + site name."],
    ["logo_show_name", "no", "When you use a logo image: yes = also show the site name text next to it, no = logo only."],
    ["favicon", "", "Optional. Square PNG (512x512). Easiest and most reliable: replace the file assets/favicon.png in GitHub instead."],
    ["og_image", "", "Optional. Image (1200x630) shown when your link is shared. Blank = assets/og-default.png."],
]

# ----------------------------------------------------------------- CONTENT
Content = [
    ["hero_eyebrow", "GIFT City · India's International Financial Services Centre"],
    ["hero_title", "Where India meets the world's capital."],
    ["hero_subtitle", "GIFT City is home. One gateway for global investors, funds, banks and businesses to access India, and for Indians to invest around the world."],
    ["hero_cta_primary_label", "Explore GIFT City"],
    ["hero_cta_primary_link", "/presentations"],
    ["hero_cta_secondary_label", "Talk to us"],
    ["hero_cta_secondary_link", "/contact"],

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

    # ---- accreditation page. Use *word* to make a word italic + coloured.
    ["accreditation_eyebrow", "SEBI Accredited Investor Programme"],
    ["accreditation_title", "Step into *elite* investing, on better terms."],
    ["accreditation_subtitle", "Accreditation opens the door to PMS, AIF and SIF strategies at meaningfully lower entry points — vetted managers, unlisted opportunities, and a certificate that stays valid for years."],
    ["acc_cta_label", "Begin your application"],
    ["acc_seal_text", "Oak Sprouts · Accredited Investor ·"],
    ["acc_seal_center", "Certified Since Enrolment"],
    ["acc_what_eyebrow", "The basics"],
    ["acc_what_title", "What is accreditation"],
    ["acc_what_text", "Accreditation is SEBI's framework for recognising investors who meet defined income or net-worth thresholds, letting them participate in PMS, AIF and SIF products under a lighter-touch, more flexible regime — with meaningfully lower minimum ticket sizes."],
    ["acc_gateway_title", "Your gateway to *elite* opportunities"],
    ["acc_gateway_text", "Once accredited, the same manager-grade strategies that once required ₹50L–₹1Cr become accessible from a fraction of that — so you can build conviction before you scale."],
    ["acc_products_eyebrow", "Strategies open to accredited investors"],
    ["acc_criteria_eyebrow", "Do you qualify"],
    ["acc_criteria_title", "Three routes to accreditation"],
    ["acc_criteria_text", "Individuals, HUFs, family trusts and sole proprietorships qualify by meeting any one of the criteria below."],
    ["acc_steps_eyebrow", "Your path to accreditation"],
    ["acc_steps_title", "The process, in three steps"],
    ["acc_steps_text", "Applications are typically processed within 3 business days of submission."],
    ["acc_final_eyebrow", "Make the winning choice"],
    ["acc_final_title", "Apply today, invest with less tomorrow."],
    ["acc_form_title", "Start your application"],
    ["acc_form_text", "Share your details and our team will guide you to the right eligibility route and prepare your application."],
    ["acc_faq_eyebrow", "Frequently asked questions"],
    ["acc_faq_title", "A few things people ask us"],

    ["insights_eyebrow", "Insights"],
    ["insights_title", "Ideas & updates."],
    ["insights_subtitle", "Blogs, market notes and updates from the GIFT City ecosystem."],

    ["team_eyebrow", "Team"],
    ["team_title", "The people behind giftcityinvesting."],
    ["team_subtitle", "A team of finance and investing professionals."],

    ["contact_eyebrow", "Contact us"],
    ["contact_title", "Let's talk."],
    ["contact_button", "Send message"],
    ["contact_subtitle", "Tell us what you are looking for and we will get back to you shortly."],

    ["terms_text", TERMS],
    ["privacy_text", PRIVACY],
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
    ["id", "type", "name", "amc", "tagline", "description", "category", "min_investment", "risk", "highlights", "presentation_url", "factsheet_url", "accent", "show_in_carousel", "order", "visible", "holdings_title", "holdings_display"],
    ["mirae", "inbound", "Mirae Asset", "Mirae Asset", "Access India's growth, from GIFT City.", "Add a short description of this fund here.", "Equity", "Update in sheet", "Update in sheet", "Highlight one|Highlight two|Highlight three", PH, "", "indigo", "yes", 1, "yes", "", "both"],
    ["nj", "inbound", "NJ", "NJ", "A simple route into Indian markets.", "Add a short description of this fund here.", "Equity", "Update in sheet", "Update in sheet", "Highlight one|Highlight two|Highlight three", PH, "", "teal", "yes", 2, "yes", "", "both"],
    ["tata", "inbound", "Tata", "Tata", "India's trusted name, now in GIFT City.", "Add a short description of this fund here.", "Equity", "Update in sheet", "Update in sheet", "Highlight one|Highlight two|Highlight three", PH, "", "violet", "yes", 3, "yes", "", "both"],
    ["marcellus", "outbound", "Marcellus", "Marcellus", "Quality-focused investing for the long term.", "Add a short description of this fund here.", "Global equity", "Update in sheet", "Update in sheet", "Highlight one|Highlight two|Highlight three", PH, "", "amber", "yes", 4, "yes", "Top 5 holdings", "both"],
    ["dsp", "outbound", "DSP", "DSP", "Global diversification, made simple.", "Add a short description of this fund here.", "Global equity", "Update in sheet", "Update in sheet", "Highlight one|Highlight two|Highlight three", PH, "", "pink", "yes", 5, "yes", "", "both"],
]

# ------------------------------------------------------------- HOLDINGS
# fund = the Funds tab id. logo = Google Drive share link or image URL (optional: initials show if blank).
Holdings = [
    ["fund", "name", "logo", "order", "visible"],
    ["marcellus", "Netflix", "", 1, "yes"],
    ["marcellus", "Amazon", "", 2, "yes"],
    ["marcellus", "Apple", "", 3, "yes"],
    ["marcellus", "Meta", "", 4, "yes"],
    ["marcellus", "Nvidia", "", 5, "yes"],
]

# ---------------------------------------------------------- FORM FIELDS
# form = contact or accreditation. type = text, email, tel, number, date, select, textarea.
# options = for select only, separated by |. width = half or full. required = yes/no.
Form_Fields = [
    ["form", "label", "type", "options", "required", "width", "placeholder", "order", "visible"],
    ["contact", "Name", "text", "", "yes", "half", "", 1, "yes"],
    ["contact", "Email", "email", "", "yes", "half", "", 2, "yes"],
    ["contact", "Phone", "tel", "", "no", "half", "", 3, "yes"],
    ["contact", "Interested in", "select", "Inbound funds|Outbound funds|Accreditation|GIFT City setup|Something else", "yes", "half", "", 4, "yes"],
    ["contact", "Message", "textarea", "", "yes", "full", "", 5, "yes"],
    ["accreditation", "Name", "text", "", "yes", "half", "", 1, "yes"],
    ["accreditation", "Email", "email", "", "yes", "half", "", 2, "yes"],
    ["accreditation", "Phone", "tel", "", "no", "half", "", 3, "yes"],
    ["accreditation", "Route / criteria", "select", "Individual or family office|Fund manager or AMC|Bank or financial institution|Corporate or business|Not sure yet", "yes", "half", "Route you may qualify under", 4, "yes"],
    ["accreditation", "Message", "textarea", "", "no", "full", "", 5, "yes"],
]

# ------------------------------------------------ COMPARISON-STYLE TABS (grids)
# First row = column headings. First column = row labels.
# MERGED CELLS: merge cells in Google Sheets as usual. The website shows them merged.
# (A merged cell exports as one value + empty cells, so: keep a cell EMPTY only when it is merged.
#  Type a dash "—" when you want a real empty cell.)
# Header cells containing the word "GIFT" are highlighted automatically.
GRIDS = {
    "Compare_Inbound": dict(
        rows=[
            ["Parameter", "Mirae Asset", "NJ", "Tata"],
            ["Fund type", "—", "—", "—"],
            ["Strategy", "—", "—", "—"],
            ["Minimum investment", "—", "—", "—"],
            ["Fees", "—", "—", "—"],
            ["Common benefit 1", "Merged across all three funds: type a benefit that is the same for every fund.", "", ""],
            ["Common benefit 2", "Merged across all three funds: type another shared benefit.", "", ""],
            ["Returns (add period)", "—", "—", "—"],
            ["Risk level", "—", "—", "—"],
            ["Best suited for", "—", "—", "—"],
        ],
        merges=["B6:D6", "B7:D7"]),
    "Compare_Outbound": dict(
        rows=[
            ["Parameter", "Marcellus", "DSP", "Direct equity"],
            ["Fund type", "—", "—", "Self-directed stock investing"],
            ["Strategy", "—", "—", "You pick and manage each stock"],
            ["Minimum investment", "—", "—", "Depends on the stock and broker"],
            ["Diversification", "—", "—", "Depends on your own portfolio"],
            ["Fees", "—", "—", "Brokerage and other charges"],
            ["Shared fund benefit", "Merged across the two funds: a benefit common to both funds.", "", "Not applicable"],
            ["Effort needed", "Low", "Low", "High"],
            ["Returns (add period)", "—", "—", "—"],
            ["Best suited for", "—", "—", "—"],
        ],
        merges=["B7:C7"]),
    "Tax_Inbound": dict(
        rows=[
            ["Parameter", "Benefits via GIFT City", "Benefits via the traditional route"],
            ["Tax on capital gains", "Add details here.", "Add details here."],
            ["Tax on income / dividends", "Add details here.", "Add details here."],
            ["Withholding / repatriation", "Add details here.", "Add details here."],
            ["Documentation", "Add details here.", "Add details here."],
            ["Overall benefit", "Merged across both columns if it is the same for both routes.", ""],
        ],
        merges=["B6:C6"]),
    "Tax_Outbound": dict(
        rows=[
            ["Parameter", "Benefits via GIFT City", "Benefits via the traditional route"],
            ["Tax on capital gains", "Add details here.", "Add details here."],
            ["Tax on income / dividends", "Add details here.", "Add details here."],
            ["Remittance and reporting", "Add details here.", "Add details here."],
            ["Documentation", "Add details here.", "Add details here."],
        ],
        merges=[]),
    "Routes_Inbound": dict(
        rows=[
            ["Parameter", "Via GIFT City", "Via the traditional route"],
            ["How it works", "Add details here.", "Add details here."],
            ["Who can invest", "Add details here.", "Add details here."],
            ["Currency", "Add details here.", "Add details here."],
            ["Documents needed", "Add details here.", "Add details here."],
            ["Time to start investing", "Add details here.", "Add details here."],
            ["Minimum investment", "Add details here.", "Add details here."],
        ],
        merges=[]),
    "Routes_Outbound": dict(
        rows=[
            ["Parameter", "Via GIFT City", "Via the traditional route"],
            ["How it works", "Add details here.", "Add details here."],
            ["Who can invest", "Add details here.", "Add details here."],
            ["Currency", "Add details here.", "Add details here."],
            ["Documents needed", "Add details here.", "Add details here."],
            ["Limits and rules", "Add details here.", "Add details here."],
            ["Minimum investment", "Add details here.", "Add details here."],
        ],
        merges=[]),
}

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
Presentations = [
    ["category", "title", "description", "url", "order", "visible"],
    ["GIFT City", "GIFT City", "What it is, who it is for and why it matters.", PH, 1, "yes"],
    ["Global", "Why invest globally", "The case for diversifying beyond one market.", PH, 2, "yes"],
    ["India", "Why invest in India", "The India growth story, in a few slides.", PH, 3, "yes"],
]

# ------------------------------------------------------ ACCREDITATION PAGE
# section = stat | benefit | product | criteria | step | faq
#   stat     title = label, value = number text e.g. 30%+ or 2 Yrs
#   benefit  title, description, value = a small icon character (optional)
#   product  title = strategy name, value = tag shown on the card (SIF / PMS / AIF)
#   criteria title = small label, value = big figure, description = note under it
#   step     title, description
#   faq      title = question, description = answer
Accreditation_Page = [
    ["section", "title", "value", "description", "order", "visible"],
    ["stat", "Average reduction in ticket size", "30%+", "", 1, "yes"],
    ["stat", "Certificate validity", "2 Yrs", "", 2, "yes"],
    ["stat", "Business days", "3", "", 3, "yes"],

    ["benefit", "Start small", "↑", "Enter SIF, PMS and AIF strategies at lower minimums, then scale allocation as conviction grows.", 1, "yes"],
    ["benefit", "Diversify freely", "◇", "Spread capital across multiple strategies and managers instead of concentrating in one product.", 2, "yes"],
    ["benefit", "Unbiased advice", "✓", "Get portfolio guidance built around your accreditation status, not a single product.", 3, "yes"],

    ["product", "SIF – Quant", "SIF", "", 1, "yes"],
    ["product", "HSBC - RedHex", "SIF", "", 2, "yes"],
    ["product", "Franklin Templeton - Sapphire", "SIF", "", 3, "yes"],
    ["product", "Edelweiss MF - Altiva Hybrid", "SIF", "", 4, "yes"],

    ["criteria", "Income criteria", "≥ ₹2 Cr", "Annual income, individually assessed", 1, "yes"],
    ["criteria", "Net worth criteria", "≥ ₹7.5 Cr", "With at least ₹3.75 Cr held in financial assets", 2, "yes"],
    ["criteria", "Combined criteria", "₹1 Cr + ₹5 Cr", "Annual income > ₹1 Cr and net worth > ₹5 Cr", 3, "yes"],

    ["step", "Share your details", "", "Tell us a little about yourself so we can guide you towards the right eligibility route and prepare your application.", 1, "yes"],
    ["step", "Submit your documents", "", "Upload soft copies of the documents required for the criteria you're qualifying under. We'll confirm the exact checklist upfront.", 2, "yes"],
    ["step", "Pay & activate", "", "Pay the certification fee for a 2-year accreditation certificate. Most applications are approved within 3 business days.", 3, "yes"],

    ["faq", "What is the Accredited Investor framework?", "", "It is SEBI's framework for recognising investors who meet defined income or net-worth thresholds, so they can take part in PMS, AIF and SIF products under a more flexible regime with lower minimum ticket sizes. (Draft answer: please review.)", 1, "yes"],
    ["faq", "Who can become accredited?", "", "Individuals, HUFs, family trusts and sole proprietorships that meet any one of the criteria shown above: income, net worth, or the combined criteria. (Draft answer: please review.)", 2, "yes"],
    ["faq", "How long does it take, and how long is the certificate valid?", "", "Applications are typically processed within 3 business days, and the accreditation certificate is valid for 2 years. (Draft answer: please review.)", 3, "yes"],
    ["faq", "Which documents will I need?", "", "The documents depend on the criteria you qualify under. We confirm the exact checklist before you upload anything. (Draft answer: please review.)", 4, "yes"],
]

# --------------------------------------------------------------- INSIGHTS
# content supports simple formatting: "# Heading", "## Sub-heading", "- bullet", "1. numbered",
# "> quote", "**bold**", "*italic*", "[link text](https://...)", "![caption](image link)", "---" line.
# Press Alt+Enter (Windows) / Option+Enter (Mac) inside a cell for a new line.
Insights = [
    ["date", "title", "slug", "category", "summary", "content", "image", "author", "tags", "link", "featured", "visible"],
    ["2026-09-01", "When the Rupee Falls, Is Your Portfolio Ready?", "", "Global Investing",
     "Persistent INR depreciation can erode global purchasing power, making currency diversification and USD-denominated investments increasingly relevant for long-term wealth preservation.",
     """A weaker rupee quietly reduces what your savings can buy abroad: overseas education, travel, healthcare and global investments.

# Why currency matters
When the rupee weakens against the US dollar, the same rupee amount buys fewer dollars. Over long periods this can erode global purchasing power, even while the rupee value of a portfolio is rising.

# What investors can consider
- Hold a portion of wealth in USD-denominated investments.
- Match future foreign-currency expenses with assets in that currency.
- Review global exposure at least once a year.

> This is sample text. Replace it with your full article. The formatting guide is in the READ ME tab of the sheet.

*Investments are subject to market risks. This article is for information only and is not investment advice.*""",
     "", "Oak Sprouts", "INR depreciation, global investing, USD investing", "", "yes", "yes"],
    ["2026-09-01", "Accredited Investor: The Gateway to New Investment Opportunities", "", "Accredited Wealth",
     "Accreditation can expand access to AIFs, PMS and angel investing opportunities while opening a broader investment universe for sophisticated investors.",
     """Accreditation can widen the set of investments open to you, often at lower minimum ticket sizes.

# What changes after accreditation
- Access to PMS, AIF and SIF strategies at lower entry points.
- A broader universe of vetted managers and unlisted opportunities.
- A certificate that stays valid for years.

Read more about the process on our [accreditation page](/accreditation).

*This is sample text. Replace it with your full article.*""",
     "", "Oak Sprouts", "accredited investor, AIF, PMS, SIF", "", "no", "yes"],
    ["2026-08-22", "The biggest risk in your portfolio may not be what you own.\nIt may be what you cannot own.", "ai-global-opportunity-gap", "Investing Insights",
     "AI is creating trillions in global value outside India. **GIFT City** opens access to global equities, technology giants, and US-dollar assets, helping Indian investors bridge the global opportunity gap.",
     """Many of the world's largest technology companies are not listed in India. For an investor who holds only Indian stocks, that is a gap in the portfolio.

# Bridging the gap
**GIFT City** gives Indian investors a regulated route to global equities and US-dollar assets.

- Exposure to global technology leaders.
- Diversification across markets and currencies.
- A structure designed for international investing.

*This is sample text. Replace it with your full article.*""",
     "", "Oak Sprouts", "global equities, GIFT City, technology stocks", "", "no", "yes"],
]

# ------------------------------------------------------------------- TEAM
Team = [
    ["name", "role", "bio", "photo", "linkedin", "order", "visible"],
    ["Team member one", "Founder", "Add a short bio here.", "", "", 1, "yes"],
    ["Team member two", "Investment advisor", "Add a short bio here.", "", "", 2, "yes"],
    ["Team member three", "Operations", "Add a short bio here.", "", "", 3, "yes"],
]

# --------------------------------------------------------------- HASHTAGS
# Invisible on the page. They are written into the site's hidden search tags (meta keywords and
# structured data). Type with or without the # sign.
Hashtags = [
    ["hashtag", "visible"],
    *[[h, "yes"] for h in [
        "GIFT City", "giftcity", "giftcityinvesting", "GIFT IFSC", "IFSC", "IFSCA",
        "GIFT City funds", "GIFT City investing", "GIFT City tax benefits", "invest in GIFT City",
        "inbound funds", "outbound funds", "global investing", "invest globally from India",
        "international investing from India", "USD investing", "NRI investing", "offshore funds India",
        "accredited investor", "SEBI accredited investor", "AIF", "PMS", "SIF",
        "India growth story", "diversify globally",
    ]],
]

# -------------------------------------------------------------------- SEO
SEO = [
    ["page", "title", "description"],
    ["home", "GIFT City Investing | India's Gateway to Global Finance",
     "Explore GIFT City: inbound and outbound funds, investment routes, tax benefits, accreditation and insights for investors, funds, banks and businesses."],
    ["inbound", "Inbound Funds in GIFT City | Invest in India from GIFT City",
     "Compare inbound funds in GIFT City, their tax benefits, investment routes and FAQs. Access the India growth story through a regulated structure."],
    ["outbound", "Outbound Funds in GIFT City | Invest Globally from India",
     "Compare outbound funds in GIFT City with direct equity. See tax benefits, investment routes and FAQs for investing globally from India."],
    ["presentations", "GIFT City & Fund Presentations | GIFT City Investing",
     "Watch short presentations on GIFT City, why invest globally, why invest in India and each fund."],
    ["accreditation", "SEBI Accredited Investor Programme | GIFT City Investing",
     "Check if you qualify as an accredited investor and apply. Access PMS, AIF and SIF strategies at lower minimums."],
    ["insights", "Insights & Blogs on GIFT City and Global Investing | GIFT City Investing",
     "Blogs, market notes and updates on GIFT City, global investing, accredited investing and Indian markets."],
    ["team", "Our Team | GIFT City Investing", "Meet the finance and investing professionals behind GIFT City Investing."],
    ["contact", "Contact Us | GIFT City Investing", "Talk to our team about funds, investment routes, tax benefits and accreditation."],
]

# ----------------------------------------------------------------- README
README = [
    ["How to use this sheet"],
    [""],
    ["1. Every tab is one part of the website. Do NOT rename tabs or column headers."],
    ["2. Add, edit or delete ROWS freely. Changes appear on the website within a few minutes."],
    ["3. 'visible' column: type yes/no to show or hide a row without deleting it."],
    ["4. 'order' column: smaller numbers come first."],
    ["5. Settings and Content tabs: edit the 'value' column. To hide something, blank the value; do not delete the row."],
    ["6. Compare_*, Tax_* and Routes_* tabs: first row = column headings, first column = row labels. Add or remove rows and columns freely. MERGE CELLS as you like and the website merges them too. A merged cell exports as value + empty cells, so leave a cell empty only when it is merged; type a dash for a real empty cell."],
    ["7. Canva links: paste the 'View' link of your design."],
    ["8. In a list such as highlights, separate items with a | character."],
    ["9. Images: paste a Google Drive share link (Share > Anyone with the link > Viewer) or any public image URL. Both work."],
    ["10. Blog posts: Insights tab. 'content' is the full article. Use Alt+Enter (Option+Enter on Mac) for new lines. Formatting: # Heading, - bullet, > quote, **bold**, [text](link), ![caption](image link)."],
    ["11. Hashtags tab: invisible search tags. SEO tab: the title and description Google shows for each page."],
    ["12. Make the whole sheet Plain text (select all, Format > Number > Plain text) so numbers and text never get mixed up."],
    ["13. NEVER store private data in this sheet: it is public by design. Form submissions go to a separate private sheet (see README.md)."],
    ["14. Finally: Share > General access > 'Anyone with the link' > Viewer. Copy the Sheet ID from the URL into config.js."],
]

# object-style tabs
SHEETS = {
    "Settings": (["key", "value", "notes"], Settings),
    "Content": (["key", "value"], Content),
    "Stats": (Stats[0], Stats[1:]),
    "Socials": (Socials[0], Socials[1:]),
    "Benefits": (Benefits[0], Benefits[1:]),
    "Timeline": (Timeline[0], Timeline[1:]),
    "Funds": (Funds[0], Funds[1:]),
    "Holdings": (Holdings[0], Holdings[1:]),
    "Form_Fields": (Form_Fields[0], Form_Fields[1:]),
    "FAQ": (FAQ[0], FAQ[1:]),
    "Presentations": (Presentations[0], Presentations[1:]),
    "Accreditation_Page": (Accreditation_Page[0], Accreditation_Page[1:]),
    "Insights": (Insights[0], Insights[1:]),
    "Team": (Team[0], Team[1:]),
    "Hashtags": (Hashtags[0], Hashtags[1:]),
    "SEO": (SEO[0], SEO[1:]),
}
# order of tabs in the workbook
TAB_ORDER = ["Settings", "Content", "Stats", "Socials", "Benefits", "Timeline", "Funds", "Holdings",
             "Compare_Inbound", "Compare_Outbound", "Tax_Inbound", "Tax_Outbound",
             "Routes_Inbound", "Routes_Outbound", "FAQ", "Presentations", "Accreditation_Page",
             "Insights", "Team", "Form_Fields", "Hashtags", "SEO"]


def to_json():
    out = {}
    for name, (head, rows) in SHEETS.items():
        out[name] = [dict(zip(head, r)) for r in rows]
    for name, g in GRIDS.items():
        out[name] = g["rows"]          # raw grid, merged cells stay empty
    return out


def add_tab(wb, name, head, body, merges=(), grid=False):
    head_fill = PatternFill("solid", fgColor="1F2A6B")
    wide = ("description", "answer", "summary", "bio", "value", "notes", "content", "question")
    ws = wb.create_sheet(name)
    ws.append(head)
    for r in body:
        ws.append(r)
    ncol = len(head)
    for c in range(1, ncol + 1):
        cell = ws.cell(row=1, column=c)
        cell.font = Font(bold=True, color="FFFFFF")
        cell.fill = head_fill
        cell.alignment = Alignment(vertical="center", wrap_text=True)
        width = 70 if str(head[c - 1]) in wide else 22
        if grid:
            width = 34 if c > 1 else 26
        ws.column_dimensions[get_column_letter(c)].width = width
    for row in ws.iter_rows(min_row=2, max_row=300, max_col=ncol):
        for cell in row:
            cell.number_format = "@"
            cell.alignment = Alignment(wrap_text=True, vertical="top")
    for rng in merges:
        ws.merge_cells(rng)
        ws[rng.split(":")[0]].alignment = Alignment(wrap_text=True, vertical="center", horizontal="center")
    ws.freeze_panes = "A2"
    return ws


def to_xlsx(path):
    """FULL template (new sheet from scratch)."""
    wb = Workbook()
    ws = wb.active
    ws.title = "READ ME"
    for r in README:
        ws.append(r)
        ws.cell(row=ws.max_row, column=1).alignment = Alignment(wrap_text=True, vertical="top")
    ws["A1"].font = Font(bold=True, size=14)
    ws.column_dimensions["A"].width = 130
    for name in TAB_ORDER:
        if name in GRIDS:
            rows = GRIDS[name]["rows"]
            add_tab(wb, name, rows[0], rows[1:], GRIDS[name]["merges"], grid=True)
        else:
            head, body = SHEETS[name]
            add_tab(wb, name, head, body)
    wb.save(path)


# ---------------------------------------------------------------- UPDATE PACK
# For a sheet that already exists: only the NEW tabs + the rows/columns to add to existing tabs.
NEW_TABS = ["Tax_Inbound", "Tax_Outbound", "Routes_Inbound", "Routes_Outbound",
            "Accreditation_Page", "Hashtags", "SEO"]
UPDATE_README = [
    ["UPDATE PACK: what to do with this file (about 10 minutes)"],
    [""],
    ["You already have a live sheet, so this file contains ONLY what is new or changed. Do not replace your sheet."],
    [""],
    ["STEP 1. In your LIVE Google Sheet: File > Import > Upload > choose this file > Import location: 'Insert new sheet(s)' > Import data."],
    ["   This adds 9 tabs: Tax_Inbound, Tax_Outbound, Routes_Inbound, Routes_Outbound, Accreditation_Page, Hashtags, SEO, ADD_to_Content, ADD_to_Settings."],
    [""],
    ["STEP 2. Content tab: open the new ADD_to_Content tab. For every row there, find the same key in your Content tab. If it exists, replace its value (these 5 exist already: accreditation_eyebrow, accreditation_title, accreditation_subtitle, terms_text, privacy_text). If it does not exist, paste the whole row at the bottom of your Content tab."],
    ["   Tip for the long terms_text / privacy_text: click the cell in ADD_to_Content, Ctrl+C, then click the target cell in Content and Ctrl+V. (Do not paste from a text editor into a cell without double-clicking the cell first, or Sheets splits the lines into rows.)"],
    [""],
    ["STEP 3. Settings tab: copy the 5 rows from ADD_to_Settings (logo_nav, logo_footer, logo_show_name, favicon, og_image) to the bottom of your Settings tab. Also set form_endpoint once you have the Apps Script URL (see README.md)."],
    [""],
    ["STEP 4. Insights tab (your blogs): add 4 new column headings at the end of the heading row, spelled exactly:  slug   content   author   tags"],
    ["   content = the full article (this is what opens when someone clicks a card). slug / author / tags are optional. Your existing rows keep working."],
    [""],
    ["STEP 5. Clean up: delete the two ADD_to_ tabs. Your old tabs Tax, Routes and Accreditation are no longer used by the website; you can delete them."],
    [""],
    ["STEP 6. Select every tab you edited > Format > Number > Plain text (so numbers and text never get mixed up when the website reads them)."],
    [""],
    ["NOTES"],
    ["- Compare_Inbound / Compare_Outbound need no change. Merge cells there freely: the website now shows merges."],
    ["- Tax_* and Routes_* work like the Compare tabs: first row = headings, first column = row labels. A heading containing the word GIFT is highlighted."],
    ["- Images (team photo, blog image, logos): paste the Google Drive share link. Set the file to 'Anyone with the link: Viewer'."],
    ["- Blog formatting inside 'content': # Heading, - bullet, > quote, **bold**, [text](link), ![caption](image link). Alt+Enter (Option+Enter on Mac) for a new line in a cell."],
]


def to_update_xlsx(path):
    wb = Workbook()
    ws = wb.active
    ws.title = "READ ME - UPDATE"
    for r in UPDATE_README:
        ws.append(r)
        ws.cell(row=ws.max_row, column=1).alignment = Alignment(wrap_text=True, vertical="top")
    ws["A1"].font = Font(bold=True, size=14)
    ws.column_dimensions["A"].width = 150
    changed = [r for r in Content if r[0].startswith("acc") or r[0] in ("terms_text", "privacy_text")]
    add_tab(wb, "ADD_to_Content", ["key", "value"], changed)
    add_tab(wb, "ADD_to_Settings", ["key", "value", "notes"], [r for r in Settings if r[0] in
            ("logo_nav", "logo_footer", "logo_show_name", "favicon", "og_image")])
    for name in NEW_TABS:
        if name in GRIDS:
            rows = GRIDS[name]["rows"]
            add_tab(wb, name, rows[0], rows[1:], GRIDS[name]["merges"], grid=True)
        else:
            head, body = SHEETS[name]
            add_tab(wb, name, head, body)
    wb.save(path)


if __name__ == "__main__":
    os.makedirs(os.path.join(ROOT, "data"), exist_ok=True)
    os.makedirs(os.path.join(ROOT, "legal"), exist_ok=True)
    with open(os.path.join(ROOT, "data", "fallback.json"), "w", encoding="utf-8") as f:
        json.dump(to_json(), f, ensure_ascii=False, indent=1)
    to_xlsx(os.path.join(ROOT, "giftcityinvesting-sheet-template.xlsx"))
    to_update_xlsx(os.path.join(ROOT, "giftcityinvesting-sheet-UPDATE.xlsx"))
    with open(os.path.join(ROOT, "legal", "terms.txt"), "w", encoding="utf-8") as f:
        f.write(TERMS + "\n")
    with open(os.path.join(ROOT, "legal", "privacy.txt"), "w", encoding="utf-8") as f:
        f.write(PRIVACY + "\n")
    print("OK: data/fallback.json, template xlsx, legal/*.txt")
