(function () {
  const root = document.getElementById('ideas-app');
  if (!root) return;

  const state = { items: [], medium: 'all', tags: new Set(), query: '', mode: 'gallery' };

  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, function (m) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m];
    });
  }

  function allTagsOf(item) {
    return [].concat(item.keywords.style, item.keywords.technique, item.keywords.mood);
  }

  function buildTaxonomyStats(items) {
    const groups = { style: new Map(), technique: new Map(), mood: new Map() };
    for (const item of items) {
      for (const g of ['style', 'technique', 'mood']) {
        for (const tag of item.keywords[g]) {
          if (!groups[g].has(tag)) groups[g].set(tag, []);
          groups[g].get(tag).push(item);
        }
      }
    }
    return groups;
  }

  function filteredItems() {
    const q = state.query.trim().toLowerCase();
    return state.items.filter(function (item) {
      if (state.medium !== 'all' && item.mediumKey !== state.medium) return false;
      const tags = allTagsOf(item);
      for (const req of state.tags) {
        if (!tags.includes(req)) return false;
      }
      if (q) {
        const hay = [
          item.plate, item.title, item.subtitle, item.medium, item.principalStyle,
          item.learningFocus
        ].concat(tags, item.palette.map(function (p) { return p.hex + ' ' + p.role; })).join(' ').toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }

  function toggleTag(tag) {
    if (state.tags.has(tag)) state.tags.delete(tag);
    else state.tags.add(tag);
    render();
  }

  function renderControls() {
    const mediums = [['all', '全部媒介']];
    const seen = new Set();
    for (const it of state.items) {
      if (!seen.has(it.mediumKey)) {
        seen.add(it.mediumKey);
        mediums.push([it.mediumKey, it.medium]);
      }
    }
    const mp = document.getElementById('ideas-medium-pills');
    mp.innerHTML = mediums.map(function (pair) {
      return '<button class="ideas-pill-btn" type="button" data-medium="' + escapeHtml(pair[0]) +
        '" aria-pressed="' + (state.medium === pair[0]) + '">' + escapeHtml(pair[1]) + '</button>';
    }).join('');
    mp.querySelectorAll('button').forEach(function (btn) {
      btn.addEventListener('click', function () {
        state.medium = btn.dataset.medium;
        render();
      });
    });

    const stats = buildTaxonomyStats(state.items);
    let totalUnique = 0;
    for (const g of ['style', 'technique', 'mood']) {
      const entries = Array.from(stats[g].entries()).sort(function (a, b) {
        return b[1].length - a[1].length || a[0].localeCompare(b[0], 'zh');
      });
      totalUnique += entries.length;
      document.getElementById('ideas-cnt-' + g).textContent = entries.length;
      const box = document.getElementById('ideas-cloud-' + g);
      box.innerHTML = entries.map(function (entry) {
        const tag = entry[0];
        const list = entry[1];
        return '<button class="ideas-tag-chip" type="button" data-tag="' + escapeHtml(tag) +
          '" aria-pressed="' + state.tags.has(tag) + '">' + escapeHtml(tag) +
          '<span class="cnt">' + list.length + '</span></button>';
      }).join('');
      box.querySelectorAll('button').forEach(function (btn) {
        btn.addEventListener('click', function () { toggleTag(btn.dataset.tag); });
      });
    }

    const totalViews = state.items.reduce(function (acc, it) { return acc + (it.plateCount || 1); }, 0);
    document.getElementById('ideas-stat-plates').innerHTML = String(state.items.length).padStart(2, '0') + '<small>份专题</small>';
    document.getElementById('ideas-stat-views').innerHTML = String(totalViews).padStart(2, '0') + '<small>张标注图</small>';
    document.getElementById('ideas-stat-tags').innerHTML = String(totalUnique).padStart(2, '0') + '<small>个词条</small>';
  }

  function renderGallery(items) {
    const grid = document.getElementById('ideas-gallery-grid');
    const empty = document.getElementById('ideas-empty-state');
    if (!items.length) {
      grid.innerHTML = '';
      empty.classList.add('visible');
      return;
    }
    empty.classList.remove('visible');
    grid.innerHTML = items.map(function (it) {
      const swatches = it.palette.map(function (p) {
        return '<span style="background:' + escapeHtml(p.hex) + '" title="' +
          escapeHtml(p.hex + ' · ' + p.role) + '">' + escapeHtml(p.hex) + '</span>';
      }).join('');
      const tags = [].concat(
        it.keywords.style.slice(0, 3),
        it.keywords.technique.slice(0, 3),
        it.keywords.mood.slice(0, 2)
      ).map(function (t) {
        return '<button class="ideas-mini-tag ' + (state.tags.has(t) ? 'hit' : '') +
          '" type="button" data-tag="' + escapeHtml(t) + '">' + escapeHtml(t) + '</button>';
      }).join('');
      return '<article class="ideas-card">' +
        '<div class="ideas-eyebrow">' +
          '<span><span class="ideas-plate-id">' + escapeHtml(it.plate) + '</span> · ' + escapeHtml(it.medium) + ' · ' + escapeHtml(it.date) + '</span>' +
          '<span class="ideas-view-pill">' + escapeHtml(it.plateCount) + ' 视图</span>' +
        '</div>' +
        '<a class="ideas-media" href="' + escapeHtml(it.reportUrl) + '">' +
          '<svg class="ideas-corner ideas-c-tl" viewBox="0 0 24 24" aria-hidden="true"><path d="M1 21V8L8 1H21M7 15V8h8"/></svg>' +
          '<svg class="ideas-corner ideas-c-tr" viewBox="0 0 24 24" aria-hidden="true"><path d="M1 21V8L8 1H21M7 15V8h8"/></svg>' +
          '<svg class="ideas-corner ideas-c-bl" viewBox="0 0 24 24" aria-hidden="true"><path d="M1 21V8L8 1H21M7 15V8h8"/></svg>' +
          '<svg class="ideas-corner ideas-c-br" viewBox="0 0 24 24" aria-hidden="true"><path d="M1 21V8L8 1H21M7 15V8h8"/></svg>' +
          '<img src="' + escapeHtml(it.cover) + '" alt="' + escapeHtml(it.title) + ' 原图标注预览" loading="lazy">' +
        '</a>' +
        '<div class="ideas-swatches" aria-label="主色板">' + swatches + '</div>' +
        '<div class="ideas-card-body">' +
          '<h3 class="ideas-card-title"><a href="' + escapeHtml(it.reportUrl) + '">' + escapeHtml(it.title) + '</a></h3>' +
          '<p class="ideas-card-sub">' + escapeHtml(it.subtitle) + '</p>' +
          '<p class="ideas-card-focus"><strong>LEARNING FOCUS · 可借鉴法则</strong>' + escapeHtml(it.learningFocus) + '</p>' +
          '<div class="ideas-card-tags">' + tags + '</div>' +
        '</div>' +
        '<div class="ideas-card-source"><b>SOURCE</b>' + escapeHtml(it.sourceSummary || '来源未确认 · 仅作视觉研究参考') + '</div>' +
        '<div class="ideas-card-foot">' +
          '<span>' + escapeHtml(it.mergedNote) + '</span>' +
          '<a class="ideas-open-link" href="' + escapeHtml(it.reportUrl) + '">完整蓝图报告 →</a>' +
        '</div>' +
      '</article>';
    }).join('');

    grid.querySelectorAll('.ideas-mini-tag').forEach(function (btn) {
      btn.addEventListener('click', function () { toggleTag(btn.dataset.tag); });
    });
  }

  function renderTaxonomy(items) {
    const view = document.getElementById('ideas-taxonomy-view');
    const stats = buildTaxonomyStats(items);
    const meta = [
      ['style', 'STYLE · 风格与流派索引'],
      ['technique', 'TECHNIQUE · 视觉技法词典'],
      ['mood', 'MOOD · 情绪氛围索引']
    ];
    view.innerHTML = meta.map(function (pair) {
      const key = pair[0];
      const heading = pair[1];
      const entries = Array.from(stats[key].entries()).sort(function (a, b) {
        return b[1].length - a[1].length || a[0].localeCompare(b[0], 'zh');
      });
      const cards = entries.map(function (entry) {
        const tag = entry[0];
        const list = entry[1];
        const links = list.map(function (it) {
          return '<li><a href="' + escapeHtml(it.reportUrl) + '"><span>' + escapeHtml(it.title) +
            '</span><small>' + escapeHtml(it.plate) + '</small></a></li>';
        }).join('');
        return '<div class="ideas-tax-card"><h4>' + escapeHtml(tag) + '<span>' + list.length +
          ' PLATE(S)</span></h4><ul class="ideas-tax-links">' + links + '</ul></div>';
      }).join('');
      return '<div><h3 class="ideas-tax-group-title">' + heading + ' (' + entries.length +
        ')</h3><div class="ideas-tax-index-grid">' + cards + '</div></div>';
    }).join('');
  }

  function render() {
    renderControls();
    const list = filteredItems();
    const hasFilter = state.medium !== 'all' || state.tags.size > 0 || state.query.trim() !== '';
    document.getElementById('ideas-reset-btn').classList.toggle('visible', hasFilter);
    const tagTxt = state.tags.size ? ' · TAGS: [' + Array.from(state.tags).join(', ') + ']' : '';
    document.getElementById('ideas-result-summary').textContent =
      'SHOWING ' + list.length + ' / ' + state.items.length + ' PLATES' + tagTxt;

    const gEl = document.getElementById('ideas-gallery-grid');
    const tEl = document.getElementById('ideas-taxonomy-view');
    if (state.mode === 'gallery') {
      gEl.classList.remove('hidden');
      tEl.classList.remove('active');
      renderGallery(list);
    } else {
      gEl.classList.add('hidden');
      tEl.classList.add('active');
      document.getElementById('ideas-empty-state').classList.toggle('visible', list.length === 0);
      renderTaxonomy(list);
    }
  }

  document.getElementById('ideas-search-input').addEventListener('input', function (e) {
    state.query = e.target.value;
    render();
  });
  document.getElementById('ideas-reset-btn').addEventListener('click', function () {
    state.medium = 'all';
    state.tags.clear();
    state.query = '';
    document.getElementById('ideas-search-input').value = '';
    render();
  });
  root.querySelectorAll('.ideas-view-btn').forEach(function (btn) {
    btn.addEventListener('click', function () {
      state.mode = btn.dataset.mode;
      root.querySelectorAll('.ideas-view-btn').forEach(function (b) {
        b.setAttribute('aria-pressed', String(b === btn));
      });
      render();
    });
  });

  async function init() {
    const url = root.dataset.catalog || '/ideas/catalog.json';
    try {
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        state.items = data.items || [];
      }
    } catch (err) {
      state.items = [];
    }
    const params = new URLSearchParams(location.search);
    const initialTag = params.get('tag');
    if (initialTag) state.tags.add(initialTag);
    render();
  }

  init();
})();
