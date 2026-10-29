"""Render the accessible topic hierarchy from editable publication and connection data."""
import json
from html import escape as E
from urllib.parse import quote

def render_research_map(root, publications):
    graph = json.loads((root/'research-map.json').read_text())
    by_id = {p['id']:p for p in publications}
    seen=[]; groups=[]
    for t in graph['topics']:
        buttons=[]
        for pid, short in t['papers']:
            seen.append(pid); p=by_id[pid]
            p['map_label']=short; p['map_topic']=t['id']
            p['map_url']=p.get('url') or ('https://scholar.google.com/scholar?q='+quote('"'+p['title']+'"') if p['type']!='Manuscript' else '')
            buttons.append(f'<button type="button" class="paper-node" data-paper="{pid}" aria-pressed="false" aria-label="Explore {E(p["title"])}" title="{E(p["title"])}"><span class="node-name">{E(short)}</span><span class="node-year">{p["year"] or "Ongoing"}</span><span class="node-status" aria-hidden="true"></span></button>')
        groups.append(f'<section class="map-group" data-topic="{t["id"]}" style="--topic:{t["color"]};--tint:{t["tint"]}"><h3><button type="button" class="topic-node" data-topic-select="{t["id"]}" aria-pressed="false" aria-expanded="false"><span class="topic-dot" aria-hidden="true"></span><span>{E(t["title"])}</span><span class="topic-count">{len(t["papers"])}</span><span class="topic-expand" aria-hidden="true">↗</span></button></h3><div class="group-papers">{"".join(buttons)}</div></section>')
    assert len(seen)==len(set(seen))==len(publications), 'Each paper must appear exactly once in the hierarchy'
    for link in graph['links']:
        assert link['source'] in by_id and link['target'] in by_id
        assert link['source'] != link['target'] and link['reason']
    graph['papers']=publications
    data=json.dumps(graph,ensure_ascii=False).replace('</','<\\/')
    return f'''<section id="research" class="section research-section" aria-labelledby="research-map-heading">
<div class="section-head map-section-head"><div><span class="map-eyebrow">01 / EXPLORE THE CONNECTIONS</span><h2 id="research-map-heading">A map of my research.</h2><p class="map-subtitle">Select a topic to expand its hierarchy. Select a paper to trace related work.</p></div><div class="map-toolbar js-only" hidden><button type="button" id="map-motion" aria-pressed="true">Ⅱ Motion on</button><button type="button" id="map-previous" disabled>← Previous</button><button type="button" id="map-reset">Show all</button></div></div>
<div id="paper-map" class="paper-map js-only" hidden>
<div class="map-context"><p id="map-breadcrumb" aria-live="polite">All research topics <span>· 24 works</span></p><div class="map-legend"><span><i class="legend-selected"></i>Selected</span><span><i class="legend-related"></i>Related</span><span><i class="legend-tree"></i>Topic hierarchy</span></div></div>
<div class="map-layout"><div class="map-viewport" id="map-viewport" tabindex="0" aria-label="Interactive research hierarchy; select a topic or paper"><div class="map-canvas" id="map-canvas"><svg id="map-edges" class="map-edges" aria-hidden="true"><g id="hierarchy-edges"></g><g id="topic-edges"></g><g id="flow-edges"></g></svg><div class="map-root-row"><button type="button" class="map-root" id="map-root"><span class="root-mark" aria-hidden="true">mr.</span><span>Research portfolio<small>6 topics · 24 connected works</small></span><span aria-hidden="true">⌄</span></button></div><div class="map-groups" id="map-groups">{''.join(groups)}</div></div></div>
<aside class="map-inspector" aria-label="Research map details"><div id="map-details"></div></aside></div>
<div class="map-bottom"><p><span class="line-key" aria-hidden="true"></span> Connections indicate shared topics or methods, inferred from the CV. They do not indicate citations or confirmed influence.</p><span id="map-status" role="status">Select any paper to begin.</span></div></div>
<noscript><p>Explore all research in the <a href="#all-publications">publication list</a>. Enable JavaScript for the animated topic map.</p></noscript>
<div class="dissertation"><span>Dissertation</span><p>Modeling Ethical Boundary Signals in Human–AI Interaction Using Natural Language Processing.<em>Ph.D. in Computer Science · University of Louisiana at Lafayette</em></p></div>
<script id="research-map-data" type="application/json">{data}</script></section>'''
