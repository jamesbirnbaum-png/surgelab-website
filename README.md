# surgelab.co

The marketing website for SurgeLab. Plain HTML, CSS and a small amount of JavaScript. No build step. Netlify publishes whatever is on the `main` branch.

The product itself lives at https://socialtool.surgelab.co and is a separate codebase. Nothing in here touches it.

## What is where

| File | What it is |
|---|---|
| `index.html` | Home page |
| `audit.html` | The free audit page, served at `/audit` |
| `agencies.html` | Agencies page with the "Talk to us" form (a Netlify form named `agency-enquiry`) |
| `privacy-policy.html`, `terms-and-conditions.html` | Legal pages |
| `thanks.html` | Shown after the agencies form is sent |
| `assets/css/site.css` | Every style on the site |
| `assets/js/site.js` | Every animation and the audit hand-off. The site works with it switched off. |
| `assets/img/` | Icons and the social share image |
| `_redirects` | Clean addresses and the `/login` hand-off to the tool. Netlify reads this. |
| `_headers` | Security and caching headers. Netlify reads this. |
| `robots.txt`, `sitemap.xml`, `llms.txt` | For search engines and AI crawlers |
| `DESIGN.md` | The design language. Read it before changing how anything looks. |

## How to change something

1. Make a branch, edit the files, push. Netlify builds a preview link for the pull request.
2. Check the preview on a phone.
3. Merge to `main`. Netlify publishes it within a minute.

## How to roll back

In Netlify, open Deploys, click the last deploy that was good, and press "Publish deploy". The site is back to that version straight away. Then, in GitHub, revert the merge so `main` matches what is live.

## Local preview

Any static file server works. The clean addresses (`/audit`, `/agencies`) depend on `_redirects`, which only Netlify reads, so locally use the `.html` names or a small server that understands the file.
