const API_URL = '/api/squadre';
let teams = [];
let allPartite = [];
let activeTeamId = null;
let activeMatchId = null;

window.onload = loadTeams;

async function loadTeams() {
    try {
        const response = await fetch(API_URL);
        teams = await response.json();
        renderTeams();
        if (document.getElementById('tab-classifica').style.display === 'block') {
            renderLeaderboard();
        }
    } catch (error) {
        console.error("Errore nel caricamento:", error);
    }
}

// ─── GESTIONE SQUADRE ───────────────────────────────────────

async function createTeam() {
    const input = document.getElementById('teamName');
    const gironeSelect = document.getElementById('teamGirone');
    const name = input.value.trim();
    if (!name) return;

    const newTeam = {
        nome: name,
        punti: 0,
        girone: parseInt(gironeSelect.value),
        giocatori: []
    };

    await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newTeam)
    });

    input.value = '';
    loadTeams();
}

// NUOVA GESTIONE ELIMINAZIONE SINGOLA
function openDeleteSingleModal(id) {
    activeTeamId = id;
    const team = teams.find(t => t.id === id);
    document.getElementById('deleteSingleName').innerText = team.nome;
    document.getElementById('deleteSingleModal').style.display = 'flex';
}

async function confirmDeleteSingle() {
    await fetch(`${API_URL}/${activeTeamId}`, { method: 'DELETE' });
    closeModal('deleteSingleModal');
    loadTeams();
}

async function confirmDeleteAll() {
    await fetch(`${API_URL}/all`, { method: 'DELETE' });
    closeModal('deleteAllModal');
    loadTeams();
    loadPartite();
    switchTab('squadre'); // Torna alla creazione squadre
    showNotify("🗑️ Reset", "Torneo resettato con successo!", "info");
}

// ─── GESTIONE PUNTI ─────────────────────────────────────────

function openPointsModal(id) {
    activeTeamId = id;
    const team = teams.find(t => t.id === id);
    document.getElementById('pointsInput').value = team.punti;
    document.getElementById('pointsModal').style.display = 'flex';
}

async function confirmPoints() {
    const pts = parseInt(document.getElementById('pointsInput').value) || 0;
    await fetch(`${API_URL}/${activeTeamId}/punti`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(pts)
    });
    closeModal('pointsModal');
    loadTeams();
}

// ─── GESTIONE UTENTI ────────────────────────────────────────

function openPlayerModal(id) {
    activeTeamId = id;
    const team = teams.find(t => t.id === id);
    document.getElementById('playerModalTeamName').innerText = team.nome;
    renderPlayersList();
    document.getElementById('playerModal').style.display = 'flex';
}

async function addPlayer() {
    const input = document.getElementById('playerNameInput');
    const name = input.value.trim();
    if (!name) return;
    const team = teams.find(t => t.id === activeTeamId);

    if (team.giocatori.length >= 2) {
        showNotify("Attenzione", "Massimo 2 giocatori per squadra nel Beer Pong!", "warning");
        return;
    }

    team.giocatori.push({ nome: name });
    await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(team)
    });
    input.value = '';
    renderPlayersList();
    renderTeams();
}

async function removePlayer(index) {
    const team = teams.find(t => t.id === activeTeamId);
    team.giocatori.splice(index, 1);
    await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(team)
    });
    renderPlayersList();
    renderTeams();
}

// ─── RENDERING ──────────────────────────────────────────────

function renderTeams() {
    const lists = {
        1: document.getElementById('list-girone1'),
        2: document.getElementById('list-girone2'),
        3: document.getElementById('list-girone3'),
        4: document.getElementById('list-girone4')
    };
    
    // Pulisci liste e contatori
    Object.keys(lists).forEach(key => {
        if (lists[key]) lists[key].innerHTML = '';
        const countElem = document.getElementById(`count-g${key}`);
        if (countElem) countElem.innerText = '0';
    });

    teams.forEach(t => {
        const div = document.createElement('div');
        div.className = 'team-card d-flex justify-content-between align-items-center shadow-sm p-3 mb-3 bg-white rounded-4 border';
        div.innerHTML = `
            <div>
                <div class="fw-bold text-dark">${t.nome}</div>
                <div class="d-flex align-items-center gap-2">
                    ${t.sconfitte >= 2 ? 
                        '<span class="badge bg-danger rounded-pill" style="font-size: 0.7rem;">ELIMINATA</span>' : 
                        `<span class="badge ${t.giocatori.length === 2 ? 'bg-success' : 'bg-secondary'} rounded-pill" style="font-size: 0.7rem;">
                            ${t.giocatori.length === 2 ? 'COMPLETA' : 'INCOMPLETA'}
                        </span>`
                    }
                    <span class="small text-muted">${t.giocatori.length}/2 Giocatori</span>
                </div>
                <div class="small mt-1">
                    <span class="text-success">V: ${t.vittorie}</span> | 
                    <span class="text-danger">S: ${t.sconfitte}</span> |
                    <span class="text-primary">Cups: ${t.bicchieriFatti}</span>
                </div>
            </div>
            <div class="d-flex gap-2">
                <button class="btn btn-sm btn-light border" onclick="openPlayerModal(${t.id})">👤</button>
                <button class="btn btn-sm btn-warning fw-bold" onclick="openPointsModal(${t.id})">${t.punti} pt</button>
                <button class="btn btn-sm btn-outline-danger border-0" onclick="openDeleteSingleModal(${t.id})">✕</button>
            </div>
        `;
        if (lists[t.girone]) {
            lists[t.girone].appendChild(div);
            const countElem = document.getElementById(`count-g${t.girone}`);
            if (countElem) countElem.innerText = parseInt(countElem.innerText) + 1;
        }
    });
    
    // Gestione visibilità e testo tasto PROSSIMO ROUND
    fetch(`${API_URL}/partite`).then(res => res.json()).then(partite => {
        const btnInitial = document.getElementById('initial-gen-container');
        const btnNext = document.getElementById('btnNextRound');
        const activeTeams = teams.filter(t => t.sconfitte < 2);
        const hasTeams = teams.length >= 2;
        const noMatches = partite.length === 0;
        
        // Tasto iniziale in tab Squadre
        if (hasTeams && noMatches) {
            btnInitial.style.display = 'block';
        } else {
            btnInitial.style.display = 'none';
        }

        // Testo tasto in tab Partite
        if (activeTeams.length === 2) {
            btnNext.innerText = "🏆 GENERA FINALISSIMA";
            btnNext.classList.replace('btn-warning', 'btn-success');
        } else {
            btnNext.innerText = "🚀 PROSSIMO ROUND";
            btnNext.classList.replace('btn-success', 'btn-warning');
        }
    });

    checkForFinal();
    checkForTournamentEnd();
}

async function generateRandomMatches() {
    const matchResponse = await fetch(`${API_URL}/partite`);
    const currentMatches = await matchResponse.json();
    
    if (currentMatches.some(p => p.giocata && p.girone === 99)) { // 99 per la Finalissima
        showNotify("🏆 Torneo Finito", "Il torneo è già concluso!", "success");
        return;
    }

    const incomplete = currentMatches.filter(p => !p.giocata);
    if (currentMatches.length > 0 && incomplete.length > 0) {
        showNotify("⚠️ Round in corso", "Ci sono ancora dei match da giocare!", "warning");
        return;
    }

    const activeTeams = teams.filter(t => t.sconfitte < 2);
    if (activeTeams.length < 2) {
        showNotify("⚠️ Squadre insufficienti", "Servono almeno 2 squadre attive!", "warning");
        return;
    }

    if (activeTeams.length === 2) {
        showNotify("🏆 FINALISSIMA", "È il momento dello scontro finale!", "warning");
        await createBalancedMatches(activeTeams, 99); 
    } else if (activeTeams.length <= 4) {
        showNotify("🔥 SEMIFINALI", "I gironi si uniscono per la fase finale.", "warning");
        await createBalancedMatches(activeTeams, 88); // 88 per le semifinali
    } else {
        // Genera match per ogni girone che ha squadre
        const gironi = [1, 2, 3, 4];
        let matchGenerated = false;
        for (const g of gironi) {
            const teamsInGirone = activeTeams.filter(t => t.girone === g);
            if (teamsInGirone.length >= 2) {
                await createBalancedMatches(teamsInGirone, g);
                matchGenerated = true;
            }
        }
        
        if (!matchGenerated) {
            // Se nessun girone ha almeno 2 squadre ma il totale è > 4, uniamo tutto in un girone unico temporaneo
            showNotify("🔄 Unione Gironi", "Squadre sparse unite per procedere.", "info");
            await createBalancedMatches(activeTeams, 1);
        } else {
            showNotify("✅ Prossimo Round", "Nuove partite generate nei gironi!", "success");
        }
    }
    await loadPartite();
    switchTab('partite');
}

async function createBalancedMatches(squadre, gironeNum) {
    if (gironeNum === 99 && squadre.length === 2) {
        const partita = {
            squadra1: { id: squadre[0].id },
            squadra2: { id: squadre[1].id },
            bicchieriSquadra1: 0,
            bicchieriSquadra2: 0,
            girone: 99,
            giocata: false
        };
        await fetch(`${API_URL}/partite/nuova`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(partita)
        });
        return;
    }

    const groups = {};
    squadre.forEach(s => {
        const key = `${s.vittorie}-${s.sconfitte}`;
        if (!groups[key]) groups[key] = [];
        groups[key].push(s);
    });

    for (const key in groups) {
        let shuffled = groups[key].sort(() => 0.5 - Math.random());
        for (let i = 0; i < shuffled.length - 1; i += 2) {
            const partita = {
                squadra1: { id: shuffled[i].id },
                squadra2: { id: shuffled[i+1].id },
                bicchieriSquadra1: 0,
                bicchieriSquadra2: 0,
                girone: gironeNum,
                giocata: false
            };
            await fetch(`${API_URL}/partite/nuova`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(partita)
            });
        }
    }
}

function showNotify(title, message, type = 'info') {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = `toast-custom d-flex align-items-center gap-2 mb-2`;
    const icons = { success: '✅', error: '❌', info: 'ℹ️', warning: '⚠️' };
    const icon = icons[type] || '🔔';
    toast.innerHTML = `<span class="h5 m-0">${icon}</span><span class="fw-bold">${message || title}</span>`;
    container.appendChild(toast);
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(20px)';
        setTimeout(() => toast.remove(), 300);
    }, 2000);
}

function checkForTournamentEnd() {
    const activeTeams = teams.filter(t => t.sconfitte < 2);
    const completed = [...allPartite].filter(p => p.giocata).sort((a, b) => a.id - b.id);
    const lastMatch = completed[completed.length - 1];
    
    const isFinalPlayed = lastMatch && lastMatch.girone === 99;
    const isOneLeft = teams.length >= 2 && activeTeams.length === 1;

    if (isOneLeft || isFinalPlayed) {
        let champion = isFinalPlayed 
            ? (lastMatch.bicchieriSquadra1 > lastMatch.bicchieriSquadra2 ? lastMatch.squadra1 : lastMatch.squadra2)
            : activeTeams[0];
        
        document.getElementById('mainTabs').style.display = 'none';
        switchTab('classifica');
        window.scrollTo({ top: 0, behavior: 'smooth' });
        
        if (!document.getElementById('winner-banner')) {
            const banner = document.createElement('div');
            banner.id = 'winner-banner';
            banner.className = 'p-5 mb-5 rounded-5 text-center bg-warning shadow-lg border-warning border-5';
            banner.style.borderStyle = 'double';
            banner.innerHTML = `
                <div class="display-1 mb-3">🏆</div>
                <h2 class="display-4 fw-bold text-dark m-0">CAMPIONI!</h2>
                <div class="h2 fw-bold text-danger mb-4">${champion.nome}</div>
                <p class="text-dark opacity-75 mb-4">Il torneo è concluso con la grande finale.</p>
                <button class="btn btn-dark btn-lg px-5 py-3 rounded-pill fw-bold" onclick="openDeleteAllModal()">🔄 RESET PER NUOVO TORNEO</button>
            `;
            document.getElementById('tab-classifica').prepend(banner);
        }
        renderLeaderboard();
    } else {
        document.getElementById('mainTabs').style.display = 'flex';
        const banner = document.getElementById('winner-banner');
        if (banner) banner.remove();
    }
}


function checkForFinal() {
    // La finale ora viene gestita dinamicamente da generateRandomMatches
    // ma possiamo mostrare un avviso se mancano 2 squadre totali
    const activeTeams = teams.filter(t => t.sconfitte < 2);
    
    if (activeTeams.length === 2) {
        document.getElementById('final-section').style.display = 'block';
        document.getElementById('final-match-display').innerHTML = `
            <div class="h4 fw-bold text-dark">${activeTeams[0].nome}</div>
            <div class="h2 text-warning">VS</div>
            <div class="h4 fw-bold text-dark">${activeTeams[1].nome}</div>
        `;
    } else {
        document.getElementById('final-section').style.display = 'none';
    }
}

function renderLeaderboard() {
    const container = document.getElementById('leaderboard-list');
    const sorted = [...teams].sort((a, b) => b.punti - a.punti || (b.vittorie - a.vittorie));
    
    let html = `
        <div class="table-responsive">
            <table class="table table-hover align-middle">
                <thead class="table-light">
                    <tr>
                        <th>Pos</th>
                        <th>Squadra</th>
                        <th class="text-center">V</th>
                        <th class="text-center">S</th>
                        <th class="text-center">Cup+</th>
                        <th class="text-center">Cup-</th>
                        <th class="text-center">PT</th>
                    </tr>
                </thead>
                <tbody>
    `;

    html += sorted.map((t, i) => `
        <tr>
            <td><b class="text-primary">#${i + 1}</b></td>
            <td>
                <div class="fw-bold text-dark">${t.nome}</div>
                <div class="small text-muted">${t.giocatori.map(p => p.nome).join(', ')}</div>
            </td>
            <td class="text-center">${t.vittorie || 0}</td>
            <td class="text-center">${t.sconfitte || 0}</td>
            <td class="text-center text-success">${t.bicchieriFatti || 0}</td>
            <td class="text-center text-danger">${t.bicchieriSubiti || 0}</td>
            <td class="text-center"><span class="badge bg-primary rounded-pill">${t.punti}</span></td>
        </tr>
    `).join('');

    html += `</tbody></table></div>`;
    
    container.innerHTML = sorted.length > 0 ? html : '<p class="text-center text-muted">Nessun dato</p>';
}

// ─── UTILS ──────────────────────────────────────────────────

function switchTab(tab) {
    document.querySelectorAll('.tab-content').forEach(c => c.style.display = 'none');
    document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
    document.getElementById(`tab-${tab}`).style.display = 'block';
    if (event) event.currentTarget.classList.add('active');
    
    if (tab === 'classifica') renderLeaderboard();
    if (tab === 'partite') {
        loadPartite();
        populateTeamSelects();
    }
}

async function loadPartite() {
    const response = await fetch(`${API_URL}/partite`);
    allPartite = await response.json();
    renderPartite(allPartite);
}

function renderPartite(partite) {
    const upcomingContainer = document.getElementById('upcoming-list');
    const historyContainer = document.getElementById('match-list');
    
    const completed = partite.filter(p => p.giocata);
    const upcoming = partite.filter(p => !p.giocata);
    
    document.getElementById('match-count').innerText = `${completed.length} match conclusi`;
    document.getElementById('upcoming-count').innerText = `${upcoming.length} da giocare`;
    
    // Render Storico
    historyContainer.innerHTML = completed.reverse().map(p => `
        <div class="col-md-6">
            <div class="p-3 border rounded-4 bg-white shadow-sm d-flex justify-content-between align-items-center">
                <div class="text-center" style="flex: 1;">
                    <div class="fw-bold text-dark">${p.squadra1.nome}</div>
                    <div class="badge bg-light text-muted border">
                        ${p.girone === 99 ? '🏆 Finalissima' : (p.girone === 88 ? '🔥 Semifinale' : 'Girone ' + p.girone)}
                    </div>
                </div>
                <div class="mx-2 d-flex align-items-center">
                    <div class="h3 fw-bold m-0 px-3 py-2 bg-dark text-white rounded-3">${p.bicchieriSquadra1}</div>
                    <div class="mx-2 text-muted fw-bold">-</div>
                    <div class="h3 fw-bold m-0 px-3 py-2 bg-dark text-white rounded-3">${p.bicchieriSquadra2}</div>
                </div>
                <div class="text-center" style="flex: 1;">
                    <div class="fw-bold text-dark">${p.squadra2.nome}</div>
                    <div class="badge bg-light text-muted border">
                        ${p.girone === 99 ? '🏆 Finalissima' : (p.girone === 88 ? '🔥 Semifinale' : 'Girone ' + p.girone)}
                    </div>
                </div>
            </div>
        </div>
    `).join('') || '<div class="col-12"><p class="text-center text-muted">Nessun match concluso</p></div>';

    // Render Prossime
    let upcomingHtml = `
        <div class="table-responsive bg-white rounded-5 shadow-sm p-2">
            <table class="table table-hover align-middle mb-0">
                <thead class="table-light">
                    <tr>
                        <th>Fase</th>
                        <th class="text-center">Scontro Diretto</th>
                        <th class="text-end">Azione</th>
                    </tr>
                </thead>
                <tbody>
    `;

    upcomingHtml += upcoming.map(p => `
        <tr>
            <td>
                <span class="badge bg-light text-muted border">
                    ${p.girone === 99 ? '🏆 Finalissima' : (p.girone === 88 ? '🔥 Semifinale' : 'Girone ' + p.girone)}
                </span>
            </td>
            <td class="text-center">
                <div class="d-flex justify-content-center align-items-center gap-3">
                    <span class="fw-bold">${p.squadra1.nome}</span>
                    <span class="text-warning small fw-bold">VS</span>
                    <span class="fw-bold">${p.squadra2.nome}</span>
                </div>
            </td>
            <td class="text-end">
                <button class="btn btn-sm btn-dark px-3 rounded-pill" onclick="prepareMatchResult('${p.squadra1.id}', '${p.squadra2.id}', ${p.id})">
                    🎯 Registra
                </button>
            </td>
        </tr>
    `).join('');

    upcomingHtml += `</tbody></table></div>`;
    
    upcomingContainer.innerHTML = upcoming.length > 0 ? upcomingHtml : '<div class="col-12"><p class="text-center text-muted">Tutte le partite sono state giocate!</p></div>';
}

function prepareMatchResult(s1Id, s2Id, matchId) {
    document.getElementById('matchTeam1').value = s1Id;
    document.getElementById('matchTeam2').value = s2Id;
    activeMatchId = matchId;
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function adjustScore(id, delta) {
    const input = document.getElementById(id);
    let val = parseInt(input.value) || 0;
    val = val + delta;
    if (val < 0) val = 0;
    if (val > 10) val = 10;
    input.value = val;
}

function populateTeamSelects() {
    const s1 = document.getElementById('matchTeam1');
    const s2 = document.getElementById('matchTeam2');
    const options = teams.map(t => `<option value="${t.id}">${t.nome} (Girone ${t.girone})</option>`).join('');
    s1.innerHTML = options;
    s2.innerHTML = options;
    
    if (teams.length >= 2) {
        s1.value = teams[0].id;
        s2.value = teams[1].id;
    }
}

async function saveMatch() {
    const s1Id = document.getElementById('matchTeam1').value;
    const s2Id = document.getElementById('matchTeam2').value;
    const b1 = parseInt(document.getElementById('matchScore1').value) || 0;
    const b2 = parseInt(document.getElementById('matchScore2').value) || 0;

    if (!s1Id || !s2Id || s1Id === s2Id) {
        showNotify("⚠️ Errore", "Scegli due squadre diverse!", "error");
        return;
    }

    if (b1 > 10 || b2 > 10) {
        showNotify("⚠️ Errore", "Il limite massimo di bicchieri è 10!", "warning");
        return;
    }

    const team1 = teams.find(t => t.id == s1Id);

    const activeTeams = teams.filter(t => t.sconfitte < 2);
    let finalGirone = team1.girone;
    if (activeTeams.length === 2) finalGirone = 4; // Forza girone finale se sono rimasti in 2

    const partita = {
        id: activeMatchId,
        squadra1: { id: s1Id },
        squadra2: { id: s2Id },
        bicchieriSquadra1: b1,
        bicchieriSquadra2: b2,
        girone: finalGirone,
        giocata: true
    };

    await fetch(`${API_URL}/partite`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(partita)
    });

    document.getElementById('matchScore1').value = '0';
    document.getElementById('matchScore2').value = '0';
    activeMatchId = null;
    await loadPartite();
    await loadTeams(); 
    showNotify("🎯 Registrato", "Risultato salvato correttamente!", "success");
}

function openDeleteAllModal() { document.getElementById('deleteAllModal').style.display = 'flex'; }
function closeModal(id) { document.getElementById(id).style.display = 'none'; }
function renderPlayersList() {
    const team = teams.find(t => t.id === activeTeamId);
    const container = document.getElementById('playerList');
    container.innerHTML = team.giocatori.map((p, i) => `
        <div class="list-group-item d-flex justify-content-between align-items-center border-0 border-bottom">
            <span class="fw-semibold">${p.nome}</span>
            <button class="btn btn-sm text-danger" onclick="removePlayer(${i})">🗑️</button>
        </div>`).join('') || '<div class="p-3 text-center text-muted">Senza giocatori</div>';
}