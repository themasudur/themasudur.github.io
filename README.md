# Mohammad Masudur Rahman — academic website

A static academic website prepared from CV_Rahman_MM_2026(1).pdf. Original layout inspired by the research-first organization of https://he-zhang.com/; no source code, photographs, or paper figures were copied from that site.

## Publish on GitHub Pages

1. Create a repository named `YOUR_GITHUB_USERNAME.github.io` in your GitHub account. Replace the placeholder with your actual username. Use a public repository for the usual free GitHub Pages setup.
2. Extract this ZIP. Upload the **contents** to the repository's top level, so `index.html` is at the root. Do not upload the ZIP itself or wrap the files inside an extra folder. Include `.nojekyll` if using Git; this package also works as plain static files when uploaded through the browser.
3. Commit the files to the `main` branch.
4. Open **Settings → Pages → Build and deployment → Source → Deploy from a branch**.
5. Select **main** and **/(root)**, then Save. Wait for the GitHub Pages deployment to complete. GitHub displays the resulting URL in Pages settings.

No Node installation, package manager, API key, external font, or backend is needed. The relative asset paths also work for a project repository at `username.github.io/repository/`.

Official documentation checked October 28, 2026:
- https://docs.github.com/en/pages/getting-started-with-github-pages/creating-a-github-pages-site
- https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site
- https://docs.github.com/en/pages/getting-started-with-github-pages/what-is-github-pages

## Preview

Open `index.html` in a browser after extracting the ZIP. The animated research map, complete content, search, filters, and citation dialogs work without a server. Clipboard copying may fall back to selecting the text when the browser restricts the clipboard on local files.

The separately supplied `Rahman_Website_Preview.html` is a self-contained preview with the same map and an embedded public CV. Use the ZIP contents for GitHub Pages.

## Animated research map

The research section organizes all 24 works into six topic groups. Select a topic to expand it, then select a paper to highlight its related works. The details panel explains each connection and links to the full publication record. Select a related paper to continue exploring; **Previous** retraces your selections and **Show all** restores the overview.

Solid branches show the portfolio → topic → paper hierarchy. Animated curves show 26 editorial thematic relationships based on the CV's titles and descriptions. These are not citation links or verified lines of influence, and the direction of the animation carries no scholarly meaning. Connections are undirected; earlier/later labels indicate publication dates only.

Use **Motion on/off** to pause animation. The map respects the browser's reduced-motion preference, supports Tab/Enter and up/down arrow navigation within a topic, and resets with Escape. On narrow screens the details panel sits above a scrollable graph. The complete bibliography remains available without JavaScript.

For a local server, from this folder run:

```bash
python3 -m http.server 8000
```

Then open `http://localhost:8000`.

## Files

| File | Purpose |
|---|---|
| `index.html` | Ready-to-publish home page |
| `cv.html` | Public web CV with print / save-as-PDF support |
| `styles.css` | Desktop, mobile, accessibility, and print styles |
| `script.js` | Publication filters, citations, and mobile menu |
| `research-map.js` | Animated hierarchy, paper connections, selection history, and details panel |
| `research-map.json` | Six topic groups and editable thematic connections |
| `map_template.py` | Generates the map markup and embedded data |
| `assets/favicon.svg` | Original monogram favicon |
| `publications.json` | Editable bibliography data |
| `publications.bib` | Bibliography generated from the listed CV metadata |
| `build.py` | Optional standard-library Python page generator |
| `CONTENT_REVIEW.md` | Content recommendations, factual caveats, and sources |
| `VALIDATION.md` | Checks performed and remaining limits |
| `.nojekyll` | Disables Jekyll processing when included in the repository |

## Update content

To edit publication records, change `publications.json` and run:

```bash
python3 build.py
```

This regenerates `index.html`, `cv.html`, and `publications.bib`. For biography, education, experience, and teaching changes, update the corresponding content in `build.py`, then run it. For visual changes, edit `styles.css`. Direct edits to generated HTML are possible but will be overwritten by the next build.

New publication entries should follow the existing schema. The supported bibliography research-area values are `human-ai`, `nlp`, and `applied-ml`; these are separate from the map's six finer topic groups. Types are Conference, Workshop, Journal, Book chapter, Preprint, and Manuscript. Do not invent a year or venue for unpublished work. The four featured records are selected explicitly by ID in `build.py`.

To change the map, edit `research-map.json`, then run `python3 build.py`. Each topic's `papers` list contains pairs of publication ID and short display label. Assign every publication to exactly one topic. Each connection has `source`, `target`, and `reason` fields; use existing publication IDs and a specific, defensible thematic explanation. The generator checks topic membership and connection endpoints. When adding or removing publications, also update the displayed totals and date range in `map_template.py` and `research-map.js`.

The JSON and BibTeX files are also public when deployed. Keep all private notes, original CV files, and credentials outside the repository.

## Personalization still available

- Replace the original research-intersection illustration with a professional headshot, or add one beside the biography. Use a supplied photo and meaningful alt text.
- Add a GitHub profile only after confirming the actual username.
- Add repository, dataset, project-page, and open-access manuscript links when available.
- Add a canonical URL and social-preview image after the final domain is known. No guessed username or domain is embedded.
- Refresh the static update date when updating content.

## Public CV

The public CV is a new HTML edition, not the original PDF. It includes professional background and email, and excludes the residential address, personal phone number, and referees' contact information. Use its Print / Save PDF button for a browser-generated PDF. The original uploaded PDF was not modified or included in this package.

## Publication metadata

All 24 itemized CV records are present. Their categories generally follow the CV; the ICDM workshop item is labeled Workshop. Preprints and manuscripts are separated. Missing direct links use an explicitly labeled Scholar “Find paper” search, rather than a fabricated DOI. Some bibliography fields remain incomplete because the CV did not provide them. See CONTENT_REVIEW.md before treating the exported BibTeX as submission-ready.
