const sheetURL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vR17mlRLVD8e0TUAJ8xbW5poiby1Rsy5gcn_y7Madkx60AbzF1iAIrp2o_4aBDO0V3xvEIFHP2hBqKJ/pub?output=csv';
let rawData = [], currentCat = 'all', page = 1, perPage = 6, filtered = [];

// --- LOGO TIMELINE ENGINE ---
function initLogoAnimation() {
    const tl = anime.timeline({
        loop: true,
        direction: 'alternate',
        easing: 'easeInOutQuad'
    });

    tl
    .add({
        targets: '.logo-frame',
        strokeDashoffset: [anime.setDashoffset, 0],
        duration: 2000,
        easing: 'easeInOutQuart'
    })
    .add({
        targets: '.text-real',
        opacity: [0, 1],
        scale: [0.5, 1],
        filter: ["blur(10px)", "blur(0px)"],
        duration: 1000,
        delay: anime.stagger(300),
        easing: 'easeOutElastic(1, .6)'
    }, '-=1200')
    .add({
        targets: '#masterLogo',
        scale: [1, 1.03, 1],
        duration: 3000
    });
}

// --- DATA & RENDER ---
async function init() {
    setupTheme();
    try {
        const r = await fetch(sheetURL);
        const csv = await r.text();
        rawData = csv.split('\n').slice(1).map(row => {
            const c = row.split(',');
            return c.length < 4 ? null : { title: c[0].trim(), desc: c[1].trim(), cat: c[2].trim(), file: c[3].trim() };
        }).filter(i => i !== null);
        updateFiltered(); render(); runGlobalAnims(); initLogoAnimation(); initDrag();
    } catch (e) { console.error(e); }
}

function updateFiltered() {
    filtered = currentCat === 'all' ? [...rawData].sort(() => Math.random() - 0.5) : rawData.filter(i => i.cat === currentCat);
}

function render() {
    const container = document.getElementById("portfolioContainer");
    container.innerHTML = "";
    const show = filtered.slice((page - 1) * perPage, page * perPage);
    
    show.forEach(item => {
        const card = document.createElement("div");
        card.className = "card";
        card.innerHTML = `<div class="card-image"><img src="images/${item.cat}/${item.file}"></div><div class="card-body"><h3>${item.title}</h3><p>${item.desc}</p></div>`;
        card.onclick = () => openModal(`images/${item.cat}/${item.file}`);
        container.appendChild(card);
    });

    anime({ targets: '.card', translateY: [30, 0], opacity: [0, 1], delay: anime.stagger(100), duration: 800, easing: 'easeOutExpo' });
    updatePaginationUI();
}

function openModal(src) {
    const m = document.getElementById("modal");
    document.getElementById("modal-img").src = src;
    m.classList.add("active");
    gsap.set("#modal-img", {x:0, y:0, scale:0.8});
    anime({ targets: '#modal-img', scale: 1, duration: 800, easing: 'easeOutElastic(1, .6)'});
}

// --- HELPERS ---
function setupTheme() {
    const toggle = document.getElementById('themeToggle');
    const apply = (t) => {
        document.body.setAttribute('data-theme', t);
        document.getElementById('themeIcon').textContent = t === 'dark' ? '☀️' : '🌙';
        localStorage.setItem('theme', t);
    };
    apply(localStorage.getItem('theme') || 'light');
    toggle.onclick = () => apply(document.body.getAttribute('data-theme') === 'dark' ? 'light' : 'dark');
}

function changeCategory(c, e) {
    currentCat = c; page = 1;
    document.querySelectorAll('.controls button').forEach(b => b.classList.remove('active'));
    e.target.classList.add('active');
    updateFiltered(); render();
}

function changePage(s) { page += s; render(); }

function updatePaginationUI() {
    const total = Math.ceil(filtered.length / perPage) || 1;
    document.getElementById("pageInfo").textContent = `${page} / ${total}`;
    document.getElementById("prevBtn").disabled = page === 1;
    document.getElementById("nextBtn").disabled = page === total;
}

function initDrag() {
    gsap.registerPlugin(Draggable);
    Draggable.create("#draggableDesc", { type: "x,y", edgeResistance: 0.6, onRelease: function() { gsap.to(this.target, {x: 0, y: 0, duration: 1, ease: "elastic.out(1, 0.3)"}); } });
    Draggable.create("#modal-img", { type: "x,y", bounds: "#modal" });
}

window.onload = init;
