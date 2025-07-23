const SHEET_NAME = 'Classificação'; 
const WEB_APP_URL = 'https://script.google.com/macros/s/AKfycby0Moqf4MNfeWtD-CxxvTQdlumBS3D-xfc_7q9Rn8rpv_5ly9AoKg3ZB5H975mRtCHYvg/exec'; 

// Mapeamento dos escudos dos times
const TEAM_LOGOS = {
    'FOR 01': 'assets/logos/hubs__1080_x_1080_px___1_-removebg-preview.png',
    'FOR 02': 'assets/logos/hubs__1080_x_1080_px___2_-removebg-preview.png',
    'FOR 03': 'assets/logos/hubs__1080_x_1080_px___3_-removebg-preview.png',
    'FOR 04': 'assets/logos/hubs__1080_x_1080_px___4_-removebg-preview.png',
    'FOR 05': 'assets/logos/hubs__1080_x_1080_px___5_-removebg-preview.png',
    'FOR 06': 'assets/logos/hubs__1080_x_1080_px___6_-removebg-preview.png',
    'FOR 07': 'assets/logos/hubs__1080_x_1080_px___7_-removebg-preview.png',
    'CRATEÚS': 'assets/logos/hubs__1080_x_1080_px___12_-removebg-preview.png',
    'IGUATÚ': 'assets/logos/hubs__1080_x_1080_px___10_-removebg-preview.png',
    'JDN': 'assets/logos/hubs__1080_x_1080_px___8_-removebg-preview.png',
    'PHB': 'assets/logos/hubs__1080_x_1080_px___17_-removebg-preview.png',
    'QUIXADÁ': 'assets/logos/hubs__1080_x_1080_px___11_-removebg-preview.png',
    'SERRA GRANDE': 'assets/logos/hubs__1080_x_1080_px___13_-removebg-preview.png',
    'SOBRAL': 'assets/logos/hubs__1080_x_1080_px___9_-removebg-preview.png',
    'CENTRAL MAPI': 'assets/logos/hubs__1080_x_1080_px___16_-removebg-preview.png',
    'THE 01': 'assets/logos/hubs__1080_x_1080_px___14_-removebg-preview.png',
    'THE 02': 'assets/logos/hubs__1080_x_1080_px___15_-removebg-preview.png',
    'IMPERATRIZ': 'assets/logos/hubs__1080_x_1080_px___18_-removebg-preview.png',
};

async function fetchData() {
    try {
        const response = await fetch(WEB_APP_URL);
        
        if (!response.ok) {
            throw new Error('Erro ao buscar dados');
        }
        
        const data = await response.json();
        updateStandings(data);
        updateLastUpdated();
    } catch (error) {
        console.error('Erro:', error);
        loadSampleData();
    }
}

function getTeamLogo(teamName, sigla) {
    // Primeiro tenta pelo nome completo do time
    if (TEAM_LOGOS[teamName]) {
        return TEAM_LOGOS[teamName];
    }
    
    // Se não encontrar, tenta pela sigla
    const cleanSigla = sigla.replace(/^.*[\\\/]/, '').replace('.svg', '').trim();
    if (TEAM_LOGOS[cleanSigla]) {
        return TEAM_LOGOS[cleanSigla];
    }
    
    // Se não encontrar nenhum, retorna o logo padrão
    return 'assets/logos/default.png';
}

function updateStandings(data) {
    const standingsContainer = document.getElementById('standings');
    standingsContainer.innerHTML = '';
    
    // Ordenando os times por pontos decrescente
    const sortedTeams = [...data].sort((a, b) => b.PTS - a.PTS);
    
    sortedTeams.forEach((team, index) => {
        const position = index + 1;
        const percentage = ((team.PTS / (team.J * 3)) * 100).toFixed(1);
        const logoUrl = getTeamLogo(team.Nome, team.Sigla);
        
        const teamRow = document.createElement('div');
        teamRow.className = 'team-row';
        
        // Destaque para os 3 primeiros colocados, aqueles que ganharão a campanha da viagem
        if (position === 1) {
            teamRow.style.background = 'rgba(255, 215, 0, 0.1)';
            teamRow.style.borderLeft = '4px solid var(--gold)';
        } else if (position <= 3) {
            teamRow.style.borderLeft = '4px solid var(--green)';
        } else if (position >= 15) {
            teamRow.style.borderLeft = '4px solid var(--red)';
        }
        
        teamRow.innerHTML = `
            <div class="pos">${position}</div>
            <div class="team">
                <div class="team-logo">
                    ${logoUrl ? 
                        `<img src="${logoUrl}" alt="${team.Nome}" onerror="this.parentElement.innerHTML='<span class=\'default-logo\'>${team.Nome.substring(0, 2)}</span>';">` : 
                        `<span class="default-logo">${team.Nome.substring(0, 2)}</span>`
                    }
                </div>
                <div class="team-name">${team.Nome}</div>
            </div>
            <div class="stats points">${team.PTS}</div>
            <div class="stats wins">${team.V}</div>
            <div class="stats draws">${team.E}</div>
            <div class="stats losses">${team.D}</div>
            <div class="stats percentage">${team.J}</div>
        `;
        
        standingsContainer.appendChild(teamRow);
    });
}

function updateLastUpdated() {
    const now = new Date();
    const options = { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' };
    const formattedDate = now.toLocaleDateString('pt-BR', options);
    document.getElementById('update-date').textContent = formattedDate;
}

// função para carregar dados de exemplo caso a API falhe
function loadSampleData() {
    // const sampleData = [
    //     { Nome: "Time Aldenir", Sigla: "T1", PTS: 0, J: 30, V: 22, E: 6, D: 2 },
    //     { Nome: "Time Rozelia", Sigla: "TR", PTS: 0, J: 30, V: 20, E: 8, D: 2 },
    //     { Nome: "Time Aline", Sigla: "TAL", PTS: 0, J: 30, V: 19, E: 8, D: 3 },
    // ];
    
    updateStandings(sampleData);
    updateLastUpdated();
}

function updateCountdown() {
    const now = new Date();
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    
    const diff = tomorrow - now;
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);
    
    document.getElementById('hours').textContent = hours.toString().padStart(2, '0');
    document.getElementById('minutes').textContent = minutes.toString().padStart(2, '0');
    document.getElementById('seconds').textContent = seconds.toString().padStart(2, '0');
}

// Inicialização
document.addEventListener('DOMContentLoaded', () => {
    fetchData();
    updateCountdown();
    setInterval(updateCountdown, 1000);
    setInterval(fetchData, 5 * 60 * 1000);
});
