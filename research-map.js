/* Interactive topic hierarchy. All relations are editorial thematic associations. */
(() => {
  'use strict';
  const dataEl = document.getElementById('research-map-data');
  const map = document.getElementById('paper-map');
  if (!dataEl || !map) return;
  const data = JSON.parse(dataEl.textContent);
  const papers = new Map(data.papers.map(p => [p.id, p]));
  const topics = new Map(data.topics.map(t => [t.id, t]));
  const canvas = document.getElementById('map-canvas');
  const groups = [...map.querySelectorAll('.map-group')];
  const nodes = new Map([...map.querySelectorAll('[data-paper]')].map(el => [el.dataset.paper,el]));
  const topicButtons = new Map([...map.querySelectorAll('[data-topic-select]')].map(el => [el.dataset.topicSelect,el]));
  const svg = document.getElementById('map-edges');
  const viewport = document.getElementById('map-viewport');
  const details = document.getElementById('map-details');
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  const motionButton = document.getElementById('map-motion');
  const previousButton = document.getElementById('map-previous');
  const breadcrumb = document.getElementById('map-breadcrumb');
  const status = document.getElementById('map-status');
  const historyStack=[];
  let state={topic:null,paper:null};
  let motion=!reduced.matches;
  let frame=0, until=0;
  let activeAnimations=[];
  const SVGNS='http://www.w3.org/2000/svg';
  const paths = new Map();
  const escape = value => String(value).replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
  const connectionsFor = id => data.links.filter(l=>l.source===id || l.target===id);
  const otherId = (link,id) => link.source===id ? link.target : link.source;
  const dateLabel = p => p.year || 'Ongoing manuscript';
  function temporalRelation(a,b) {
    if (!a.year || !b.year) return 'Related · undated';
    if (a.year===b.year) return 'Related · same year';
    return a.year < b.year ? 'Earlier related work' : 'Later related work';
  }
  function pathFor(key,d,color,cls,layer) {
    let p=paths.get(key);
    if (!p) {
      p=document.createElementNS(SVGNS,'path');
      p.setAttribute('fill','none');
      document.getElementById(layer).appendChild(p);
      paths.set(key,p);
    }
    p.setAttribute('d',d); p.setAttribute('stroke',color); p.setAttribute('class',cls);
    p.dataset.live='1';
  }
  function draw() {
    const bounds=canvas.getBoundingClientRect();
    if (!bounds.width) return;
    svg.setAttribute('viewBox',`0 0 ${bounds.width} ${canvas.offsetHeight}`);
    svg.setAttribute('width',bounds.width);svg.setAttribute('height',canvas.offsetHeight);
    const point=(el,side='left')=>{
      const r=el.getBoundingClientRect();
      return {x:(side==='left'?r.left:side==='right'?r.right:r.left+r.width/2)-bounds.left,
        y:(side==='top'?r.top:side==='bottom'?r.bottom:r.top+r.height/2)-bounds.top};
    };
    paths.forEach(p=>p.dataset.live='0');
    const root=point(document.getElementById('map-root'),'bottom');
    groups.forEach(group=>{
      const topic=topics.get(group.dataset.topic);
      const header=topicButtons.get(topic.id);
      const top=point(header,'top');
      const head=point(header,'left');
      const rootCurve=`M ${root.x} ${root.y} C ${root.x} ${root.y+28}, ${top.x} ${top.y-28}, ${top.x} ${top.y}`;
      pathFor('root-'+topic.id,rootCurve,topic.color,'tree-edge root-edge'+(state.topic===topic.id?' is-emphasized':''),'hierarchy-edges');
      topic.papers.forEach(([id])=>{
        const n=point(nodes.get(id));
        const start={x:head.x+13,y:head.y+14};
        const rail=n.x-10;
        const curve=`M ${start.x} ${start.y} L ${rail} ${start.y} L ${rail} ${n.y-8} Q ${rail} ${n.y}, ${n.x} ${n.y}`;
        pathFor('branch-'+id,curve,topic.color,'tree-edge'+(state.paper===id?' is-emphasized':''),'hierarchy-edges');
      });
    });
    data.links.forEach((link,index)=>{
      const pa=papers.get(link.source), pb=papers.get(link.target);
      const isDirect=state.paper && (link.source===state.paper||link.target===state.paper);
      const isTopic=!state.paper && state.topic && (pa.map_topic===state.topic||pb.map_topic===state.topic);
      // Overview shows the cross-topic links; focus exposes the selected network.
      const crossTopic=pa.map_topic!==pb.map_topic;
      if (!isDirect && !isTopic && !crossTopic) return;
      const elA=nodes.get(link.source),elB=nodes.get(link.target);
      const ar=elA.getBoundingClientRect(),br=elB.getBoundingClientRect();
      let a,b,d;
      if (Math.abs(ar.left-br.left)<40) {
        a=point(elA,'right');b=point(elB,'right');
        const bend=Math.min(bounds.width-4,Math.max(a.x,b.x)+14+(index%3)*5);
        d=`M ${a.x} ${a.y} C ${bend} ${a.y}, ${bend} ${b.y}, ${b.x} ${b.y}`;
      } else {
        const leftToRight=ar.left<br.left;
        a=point(elA,leftToRight?'right':'left');b=point(elB,leftToRight?'left':'right');
        const direction=leftToRight?1:-1;
        const bend=Math.max(24,Math.min(90,Math.abs(b.x-a.x)*.4));
        d=`M ${a.x} ${a.y} C ${a.x+direction*bend} ${a.y}, ${b.x-direction*bend} ${b.y}, ${b.x} ${b.y}`;
      }
      const color=isDirect?'#915346':isTopic?topics.get(state.topic).color:'#84948b';
      const cls='relation-edge'+(isDirect?' direct':isTopic?' focused':' background');
      pathFor('relation-'+index,d,color,cls,'topic-edges');
      if(isDirect || isTopic || !state.topic) pathFor('flow-'+index,d,color,'flow-edge'+(isDirect?' direct':''),'flow-edges');
    });
    paths.forEach((p,key)=>{if(p.dataset.live==='0'){p.remove();paths.delete(key);}});
  }
  function drawThroughAnimation() {
    cancelAnimationFrame(frame);
    until=performance.now()+(motion?650:0);
    const tick=()=>{draw(); if(performance.now()<until)frame=requestAnimationFrame(tick);};
    frame=requestAnimationFrame(tick);
  }
  function relatedButton(id,reason,relation) {
    const p=papers.get(id);
    return `<button type="button" class="related-paper" data-map-pick="${escape(id)}"><span class="related-kicker">${escape(relation||dateLabel(p))}</span><strong>${escape(p.map_label)}</strong>${reason?`<span>${escape(reason)}</span>`:''}<i aria-hidden="true">↗</i></button>`;
  }
  function showDetails() {
    if (state.paper) {
      const p=papers.get(state.paper), topic=topics.get(p.map_topic),related=connectionsFor(p.id);
      details.innerHTML=`<p class="inspector-kicker">SELECTED PAPER <span>${escape(dateLabel(p))}</span></p><span class="inspector-type">${escape(p.type)}</span><h3>${escape(p.title)}</h3><p class="inspector-authors">${escape(p.authors)}</p><p class="inspector-venue">${escape(p.venue)}</p>${p.summary?`<p class="inspector-summary">${escape(p.summary)}</p>`:''}<div class="inspector-actions">${p.map_url?`<a href="${escape(p.map_url)}" target="_blank" rel="noopener noreferrer">${escape(p.link_label||'Find paper')} ↗</a>`:''}<button type="button" data-map-record="${escape(p.id)}">Full record ↓</button></div><div class="inspector-related"><h4>${related.length} thematic connections</h4>${related.map(l=>relatedButton(otherId(l,p.id),l.reason,temporalRelation(papers.get(otherId(l,p.id)),p))).join('')}</div>`;
      details.parentElement.style.setProperty('--selected-topic',topic.color);
      breadcrumb.innerHTML=`${escape(topic.title)} <span>/ ${escape(p.map_label)}</span>`;
      status.textContent=`${p.map_label} selected · ${related.length} related works highlighted.`;
    } else if(state.topic) {
      const topic=topics.get(state.topic);
      details.innerHTML=`<p class="inspector-kicker">EXPANDED TOPIC <span>${topic.papers.length} WORKS</span></p><h3>${escape(topic.title)}</h3><p class="inspector-summary">${escape(topic.description)}</p><div class="inspector-note">Select a paper to reveal connections within and across topics.</div><div class="inspector-related"><h4>Works in this topic</h4>${topic.papers.map(([id])=>relatedButton(id)).join('')}</div>`;
      details.parentElement.style.setProperty('--selected-topic',topic.color);
      breadcrumb.innerHTML=`${escape(topic.title)} <span>· ${topic.papers.length} works</span>`;
      status.textContent=`${topic.title} expanded. All 24 papers remain available.`;
    } else {
      details.innerHTML=`<p class="inspector-kicker">RESEARCH EXPLORER <span>2014–2026</span></p><div class="inspector-symbol" aria-hidden="true"><span></span><span></span><span></span><i></i></div><h3>Follow an idea.<br>Find the connections.</h3><p class="inspector-summary">Explore 24 works across six connected research topics.</p><ol class="map-instructions"><li><strong>Select a topic</strong><span>Expand and bring its papers into focus.</span></li><li><strong>Select a paper</strong><span>Highlight related work and see why it connects.</span></li><li><strong>Follow a connection</strong><span>Move between papers, or open the full record.</span></li></ol><p class="inspector-footnote">Solid branches organize topics. Flowing curves connect related papers.</p>`;
      details.parentElement.style.setProperty('--selected-topic','#8a382f');
      breadcrumb.innerHTML='All research topics <span>· 24 works</span>';
      status.textContent='Select any paper to begin.';
    }
  }
  function update(next,remember=true) {
    if(state.topic===next.topic && state.paper===next.paper)return;
    if(remember)historyStack.push({...state});
    // Capture current animated geometry so rapid selections remain continuous.
    const before=new Map(groups.map(el=>[el,el.getBoundingClientRect()]));
    activeAnimations.forEach(a=>a.cancel());activeAnimations=[];
    state={...next};
    const related=new Set(state.paper?connectionsFor(state.paper).map(l=>otherId(l,state.paper)):[]);
    groups.forEach((group,i)=>{
      const active=group.dataset.topic===state.topic;
      group.classList.toggle('is-active-topic',active);
      group.style.order=active?'-1':String(i);
      topicButtons.get(group.dataset.topic).setAttribute('aria-pressed',String(active));
      topicButtons.get(group.dataset.topic).setAttribute('aria-expanded',String(active));
    });
    nodes.forEach((node,id)=>{
      const selected=id===state.paper;
      const connected=related.has(id);
      node.classList.toggle('is-selected',selected);
      node.classList.toggle('is-related',connected);
      node.classList.toggle('is-muted',Boolean(state.paper&&!selected&&!connected));
      node.setAttribute('aria-pressed',String(selected));
      node.querySelector('.node-status').textContent=selected?'Selected':connected?'Related':'';
    });
    map.classList.toggle('has-selection',Boolean(state.paper));
    map.classList.toggle('has-topic',Boolean(state.topic));
    showDetails();
    previousButton.disabled=historyStack.length===0;
    if(motion)groups.forEach(group=>{
      const a=before.get(group),b=group.getBoundingClientRect();
      const dx=a.left-b.left,dy=a.top-b.top;
      if(Math.abs(dx)+Math.abs(dy)>.5)activeAnimations.push(group.animate([{transform:`translate(${dx}px,${dy}px)`},{transform:'translate(0,0)'}],{duration:560,easing:'cubic-bezier(.22,.75,.23,1)'}));
    });
    drawThroughAnimation();
  }
  function pickPaper(id) { const p=papers.get(id); if(p)update({topic:p.map_topic,paper:id}); }
  topicButtons.forEach((button,id)=>button.addEventListener('click',()=>{
    update(state.topic===id&&!state.paper?{topic:null,paper:null}:{topic:id,paper:null});
    if(viewport.scrollTop>0)viewport.scrollTo({top:0,behavior:motion?'smooth':'instant'});
  }));
  nodes.forEach((button,id)=>button.addEventListener('click',()=>{
    pickPaper(id);
    if(viewport.scrollTop>0)viewport.scrollTo({top:0,behavior:motion?'smooth':'instant'});
  }));
  details.addEventListener('click',event=>{
    const pick=event.target.closest('[data-map-pick]');
    if(pick){pickPaper(pick.dataset.mapPick);viewport.scrollTo({top:0,behavior:motion?'smooth':'instant'});return;}
    const record=event.target.closest('[data-map-record]');
    if(record){
      const archive=document.getElementById('all-publications');archive.open=true;
      document.getElementById('pub-search').value='';document.getElementById('area-filter').value='all';document.getElementById('type-filter').value='all';
      document.getElementById('pub-search').dispatchEvent(new Event('input'));
      const row=document.getElementById('pub-'+record.dataset.mapRecord);
      row.setAttribute('tabindex','-1');row.scrollIntoView({behavior:motion?'smooth':'instant',block:'start'});row.focus({preventScroll:true});
      history.replaceState(null,'','#pub-'+record.dataset.mapRecord);
    }
  });
  function reset(){update({topic:null,paper:null});viewport.scrollTo({top:0,behavior:motion?'smooth':'instant'});}
  document.getElementById('map-reset').addEventListener('click',reset);
  document.getElementById('map-root').addEventListener('click',reset);
  previousButton.addEventListener('click',()=>{if(historyStack.length)update(historyStack.pop(),false);previousButton.disabled=historyStack.length===0;});
  function setMotion(value){
    motion=value;map.classList.toggle('motion-paused',!motion);
    motionButton.setAttribute('aria-pressed',String(motion));motionButton.textContent=motion?'Ⅱ Motion on':'▶ Motion off';
    if(!motion){activeAnimations.forEach(a=>a.cancel());activeAnimations=[];cancelAnimationFrame(frame);draw();}
  }
  motionButton.addEventListener('click',()=>setMotion(!motion));
  reduced.addEventListener('change',event=>setMotion(!event.matches));
  map.addEventListener('keydown',event=>{
    if(event.key==='Escape'){reset();document.getElementById('map-reset').focus();}
    const button=event.target.closest('[data-paper]');
    if(button&&['ArrowDown','ArrowUp'].includes(event.key)){
      const siblings=[...button.parentElement.querySelectorAll('[data-paper]')];
      const step=event.key==='ArrowDown'?1:-1;const index=(siblings.indexOf(button)+step+siblings.length)%siblings.length;
      event.preventDefault();siblings[index].focus();
    }
  });
  const resize=new ResizeObserver(()=>drawThroughAnimation());resize.observe(canvas);
  showDetails();setMotion(motion);drawThroughAnimation();
})();
