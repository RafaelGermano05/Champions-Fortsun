
const SHEET_NAME = 'Classificação'; 
const WEB_APP_URL = 'https://script.google.com/macros/s/AKfycby0Moqf4MNfeWtD-CxxvTQdlumBS3D-xfc_7q9Rn8rpv_5ly9AoKg3ZB5H975mRtCHYvg/exec'; 


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

function updateStandings(data) {
    const standingsContainer = document.getElementById('standings');
    standingsContainer.innerHTML = '';
    
    // ordenando os times por pontos decrescente
    const sortedTeams = [...data].sort((a, b) => b.PTS - a.PTS);
    
    sortedTeams.forEach((team, index) => {
        const position = index + 1;
        const percentage = ((team.PTS / (team.J * 3)) * 100).toFixed(1);
        
        const teamRow = document.createElement('div');
        teamRow.className = 'team-row';
        
        // destaque para os primeiros colocados
        if (position === 1) {
            teamRow.style.background = 'rgba(255, 215, 0, 0.1)';
            teamRow.style.borderLeft = '4px solid var(--gold)';
        } else if (position <= 4) {
            teamRow.style.borderLeft = '4px solid var(--green)';
        } else if (position >= 15) {
            teamRow.style.borderLeft = '4px solid var(--red)';
        }
        
        teamRow.innerHTML = `
            <div class="pos">${position}</div>
            <div class="team">
                <div class="team-logo">${team.Sigla || team.Nome.substring(0, 2)}</div>
                <div class="team-name">${team.Nome}</div>
            </div>
            <div class="stats points">${team.PTS}</div>
            <div class="stats wins">${team.V}</div>
            <div class="stats draws">${team.E}</div>
            <div class="stats losses">${team.D}</div>
            <div class="stats percentage">${percentage}%</div>
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

// função para carregar dados de exemplo (caso a API falhe)
function loadSampleData() {
    const sampleData = [
        { Nome: "Time Aldenir", Sigla: "T1", PTS: 0, J: 30, V: 22, E: 6, D: 2 },
        { Nome: "Time Rozelia", Sigla: "TR", PTS: 0, J: 30, V: 20, E: 8, D: 2 },
        { Nome: "Time Aline", Sigla: "TAL", PTS: 0, J: 30, V: 19, E: 8, D: 3 },
        { Nome: "Time Thiago", Sigla: "TT", PTS: 0, J: 30, V: 17, E: 9, D: 4 },
        { Nome: "Time Kesse", Sigla: "TK", PTS: 0, J: 30, V: 15, E: 10, D: 5 },
        { Nome: "Time Brito", Sigla: "TB", PTS: 0, J: 30, V: 14, E: 8, D: 8 },
        { Nome: "Time Guilherme", Sigla: "TG", PTS: 0, J: 30, V: 13, E: 9, D: 8 },
        { Nome: "Time Anita", Sigla: "TA", PTS: 0, J: 30, V: 12, E: 9, D: 9 },
        { Nome: "Time Lavor", Sigla: "TLA", PTS: 0, J: 30, V: 11, E: 9, D: 10 },
        { Nome: "Time Douglas", Sigla: "TD", PTS: 0, J: 30, V: 10, E: 10, D: 10 },
        { Nome: "Time Serrão", Sigla: "TS", PTS: 0, J: 30, V: 9, E: 11, D: 10 },
        { Nome: "Time Berg", Sigla: "TB", PTS: 0, J: 30, V: 9, E: 8, D: 13 },
        { Nome: "Time Gabriel", Sigla: "TG", PTS: 0, J: 30, V: 8, E: 8, D: 14 },
        { Nome: "Time Linaldo", Sigla: "TL", PTS: 0, J: 30, V: 7, E: 9, D: 14 },
        { Nome: "Time Flaira", Sigla: "TF", PTS: 0, J: 30, V: 6, E: 10, D: 14 },
        { Nome: "Time X", Sigla: "TX", PTS: 25, J: 0, V: 5, E: 10, D: 15 },
        { Nome: "Time Vitoria", Sigla: "TV", PTS: 22, J: 30, V: 5, E: 7, D: 18 },
        { Nome: "Time Sarah", Sigla: "TS", PTS: 20, J: 30, V: 4, E: 8, D: 18 }
    ];
    
    updateStandings(sampleData);
    updateLastUpdated();
}

// função para atualizar o contador regressivo
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

// inicialização
document.addEventListener('DOMContentLoaded', () => {
    fetchData();
    updateCountdown();
    setInterval(updateCountdown, 1000);
    
    // Atualiza os dados a cada 5 minutos (opcional)
    setInterval(fetchData, 5 * 60 * 1000);
});
