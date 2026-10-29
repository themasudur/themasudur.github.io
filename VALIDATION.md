# Validation

Original site checked October 28, 2026. Animated-map update checked October 29, 2026.

- Generated 24 bibliography records from the CV; verified unique publication IDs and expected type totals.
- Checked JavaScript syntax with Node and Python generator execution.
- Checked local HTML links, asset references, internal anchors, and absence of private CV contact fields.
- Visually inspected the desktop homepage and public CV.
- Visually inspected the homepage inside a 390px-wide browser frame; measured no horizontal page overflow at its 375px content width.
- Tested opening and closing the mobile navigation and navigating to teaching/service.
- Tested the original bibliography research-area filter: Human–AI interaction returned 4 of 24 works.
- Tested publication search: “federated” returned 2 of 24 works.
- Tested the Preprint filter: 1 of 24 works.
- Tested an unmatched search and its empty state, then reset all filters.
- Tested a citation modal, accurate DIS DOI/metadata display, and copying BibTeX (“Copied.”).
- Confirmed the public CV link and Print / Save PDF control are present.
- Tested the self-contained HTML preview and its embedded CV dialog, including opening and closing.

Animated-map checks:

- Verified six topic groups, exactly one map node per publication, and 26 undirected thematic connections with valid endpoints and explanatory text.
- Checked JavaScript syntax and regenerated the deployment pages and self-contained preview.
- Visually inspected the overview, expanded topic, selected-paper highlights, and animated SVG connections on desktop.
- Tested topic expansion, Smart Reception's four related works, and Ethical Sensemaking's five related works.
- Followed a connection into another topic and used Previous to restore the earlier paper selection.
- Paused motion and confirmed flowing edges stop; restored motion and the full overview.
- Opened a paper's full record and confirmed the bibliography expands and targets the selected publication.
- Tested selection at 375px mobile content width; confirmed paper details and related highlights update, and measured no horizontal page overflow.
- Tested the updated self-contained preview's map and embedded CV.

Limits: no GitHub repository was selected or connected, so no GitHub Pages deployment was performed. Responsive verification used a browser frame, not a physical phone. The print CSS is supplied, but a browser-produced PDF was not independently rendered and inspected. All external publication links were not individually opened; supported direct links came from the CV or cited primary sources, and missing links are labeled Scholar searches. Browser-extension metadata warnings were observed in the test browser; they did not prevent the tested site interactions.
