const SHEET_NAME = "Classificação";
const WEB_APP_URL = "https://script.google.com/macros/s/AKfycby0Moqf4MNfeWtD-CxxvTQdlumBS3D-xfc_7q9Rn8rpv_5ly9AoKg3ZB5H975mRtCHYvg/exec";

const TEAM_LOGOS = {
    "CE 01": "assets/logos/CE 01.svg",
    "CE 02": "assets/logos/CE 02.jpg",
    "PI 03": "assets/logos/PI 03.jpg",
    "ALPHA": "assets/logos/ALPHA.jpg",
    "BRAVO": "assets/logos/BRAVO.jpg",
    "CE 08": "assets/logos/CE 08.png",
    "CE 07": "assets/logos/CE 07.jpg",
    "CE 09": "assets/logos/CE 09.jpg",
    "CE 10": "assets/logos/CE 10.jpg",
    "CE 11": "assets/logos/CE 11.webp",
    "CE 12": "assets/logos/CE 12.png",
    "CE 13": "assets/logos/CE 13.jpg",
    "PI 02": "assets/logos/PI 02.png",
    "PI 04": "assets/logos/PI 04.jpg",
    "MA 03": "assets/logos/MA 03.webp",
    "MA 04": "assets/logos/MA 04.webp",
    "MA 05": "assets/logos/MA 05.png",
    "CE 05": "assets/logos/CE 05.png"
};

const FALLBACK_TEAMS = [
    { Nome: "CE 01", Sigla: "CE 01", PTS: 42, J: 18, V: 13, E: 3, D: 2 },
    { Nome: "ALPHA", Sigla: "ALPHA", PTS: 39, J: 18, V: 12, E: 3, D: 3 },
    { Nome: "BRAVO", Sigla: "BRAVO", PTS: 36, J: 18, V: 11, E: 3, D: 4 },
    { Nome: "CE 08", Sigla: "CE 08", PTS: 31, J: 18, V: 9, E: 4, D: 5 },
    { Nome: "PI 03", Sigla: "PI 03", PTS: 28, J: 18, V: 8, E: 4, D: 6 }
];

const STANDINGS_REFRESH_INTERVAL = 5 * 60 * 1000;

async function fetchData() {
    try {
        showLoadingRows();

        const response = await fetch(WEB_APP_URL, { cache: "no-store" });

        if (!response.ok) {
            throw new Error("Erro ao buscar dados");
        }

        const payload = await response.json();
        const rows = Array.isArray(payload) ? payload : payload.data || payload.rows || [];

        if (!Array.isArray(rows) || rows.length === 0) {
            throw new Error("Nenhum dado encontrado na planilha");
        }

        updateStandings(rows);
        updateLastUpdated("online");
        showStatus("");
    } catch (error) {
        console.error("Erro:", error);
        updateStandings(FALLBACK_TEAMS);
        updateLastUpdated("offline");
        showStatus("Google Sheets indisponível agora. Exibindo dados temporários.", "warning");
    }
}

function normalizeTeam(team) {
    return {
        Nome: String(team.Nome || team.Time || team.name || "Time sem nome").trim(),
        Sigla: String(team.Sigla || team.sigla || team.Nome || "").trim(),
        PTS: toNumber(team.PTS),
        V: toNumber(team.V),
        E: toNumber(team.E),
        D: toNumber(team.D),
        J: toNumber(team.J)
    };
}

function toNumber(value) {
    const number = Number(String(value ?? 0).replace(",", "."));
    return Number.isFinite(number) ? number : 0;
}

function getTeamLogo(teamName, sigla) {
    if (TEAM_LOGOS[teamName]) {
        return TEAM_LOGOS[teamName];
    }

    const cleanSigla = String(sigla || "")
        .replace(/^.*[\\/]/, "")
        .replace(/\.(svg|png|jpg|jpeg|webp)$/i, "")
        .trim();

    return TEAM_LOGOS[cleanSigla] || "assets/logos/default.png";
}

function updateStandings(data) {
    const standingsContainer = document.getElementById("standings");

    if (!standingsContainer) {
        return;
    }

    const sortedTeams = data
        .map(normalizeTeam)
        .sort((a, b) => b.PTS - a.PTS || b.V - a.V || a.D - b.D || b.J - a.J || a.Nome.localeCompare(b.Nome, "pt-BR"));

    standingsContainer.innerHTML = "";
    updatePodium(sortedTeams.slice(0, 3));

    sortedTeams.forEach((team, index) => {
        const position = index + 1;
        const possiblePoints = team.J > 0 ? team.J * 3 : 0;
        const performance = possiblePoints > 0 ? Math.min(100, Math.round((team.PTS / possiblePoints) * 100)) : 0;
        const logoUrl = getTeamLogo(team.Nome, team.Sigla);
        const safeName = escapeHtml(team.Nome);
        const initials = getInitials(team.Nome);

        const teamRow = document.createElement("div");
        teamRow.className = getRowClass(position);
        teamRow.style.setProperty("--row-index", index);

        teamRow.innerHTML = `
            <div class="pos"><span class="position-number">${position}</span></div>
            <div class="team">
                <div class="team-logo">
                    <img src="${logoUrl}" alt="${safeName}" data-fallback="${initials}">
                </div>
                <div class="team-info">
                    <div class="team-title">
                        <span class="team-name">${safeName}</span>
                        ${getZoneBadge(position)}
                    </div>
                    <div class="team-progress" style="--performance: ${performance}%"><span></span></div>
                    <div class="team-meta">${performance}% de aproveitamento</div>
                </div>
            </div>
            <div class="stats points">${team.PTS}</div>
            <div class="stats wins">${team.V}</div>
            <div class="stats draws">${team.E}</div>
            <div class="stats losses">${team.D}</div>
            <div class="stats percentage">${team.J}</div>
        `;

        bindLogoFallback(teamRow);
        standingsContainer.appendChild(teamRow);
    });
}

function getRowClass(position) {
    const classes = ["team-row"];

    if (position === 1) {
        classes.push("is-leader", "is-podium");
    } else if (position <= 3) {
        classes.push("is-podium");
    } else if (position >= 15) {
        classes.push("is-danger");
    }

    return classes.join(" ");
}

function getZoneBadge(position) {
    if (position === 1) {
        return '<span class="team-badge">Líder</span>';
    }

    if (position <= 3) {
        return '<span class="team-badge team-badge--green">Pódio</span>';
    }

    if (position >= 15) {
        return '<span class="team-badge team-badge--red">Reação</span>';
    }

    return "";
}

function updatePodium(topTeams) {
    const standingsContainer = document.querySelector(".standings-container");

    if (!standingsContainer) {
        return;
    }

    let podium = document.querySelector(".podium-panel");

    if (!topTeams.length) {
        podium?.remove();
        return;
    }

    if (!podium) {
        podium = document.createElement("section");
        podium.className = "podium-panel";
        podium.setAttribute("aria-label", "Pódio da campanha");
        standingsContainer.parentNode.insertBefore(podium, standingsContainer);
    }

    podium.innerHTML = `
        <div class="podium-heading">
            <span class="eyebrow">Copa do Mundo Comercial</span>
            <h2>Zona TOP 3</h2>
        </div>
        <div class="podium-grid">
            ${topTeams.map((team, index) => renderPodiumCard(team, index + 1)).join("")}
        </div>
    `;

    podium.querySelectorAll(".podium-card").forEach(bindLogoFallback);
}

function renderPodiumCard(team, position) {
    const logoUrl = getTeamLogo(team.Nome, team.Sigla);
    const safeName = escapeHtml(team.Nome);
    const initials = getInitials(team.Nome);

    return `
        <article class="podium-card rank-${position}">
            <div class="podium-rank">${position}º colocado</div>
            <div class="podium-team">
                <div class="team-logo">
                    <img src="${logoUrl}" alt="${safeName}" data-fallback="${initials}">
                </div>
                <div>
                    <div class="podium-name">${safeName}</div>
                    <div class="podium-points">${team.PTS} pontos</div>
                </div>
            </div>
        </article>
    `;
}

function bindLogoFallback(scope) {
    scope.querySelectorAll("img[data-fallback]").forEach((image) => {
        image.addEventListener("error", () => {
            const fallback = image.dataset.fallback || "SC";
            image.parentElement.innerHTML = `<span class="default-logo">${fallback}</span>`;
        }, { once: true });
    });
}

function getInitials(name) {
    return String(name || "SC")
        .split(/\s+/)
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0])
        .join("")
        .toUpperCase();
}

function escapeHtml(value) {
    return String(value ?? "").replace(/[&<>"']/g, (char) => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#039;"
    }[char]));
}

function showLoadingRows() {
    const standingsContainer = document.getElementById("standings");

    if (!standingsContainer || standingsContainer.children.length > 0) {
        return;
    }

    standingsContainer.innerHTML = Array.from({ length: 6 }, () => `
        <div class="loading-row">
            <div class="skeleton"></div>
            <div class="skeleton"></div>
            <div class="skeleton"></div>
            <div class="skeleton"></div>
            <div class="skeleton"></div>
            <div class="skeleton"></div>
            <div class="skeleton"></div>
        </div>
    `).join("");
}

function showStatus(message, type = "info") {
    let status = document.querySelector(".system-message");
    const countdown = document.querySelector(".countdown");

    if (!message) {
        status?.remove();
        return;
    }

    if (!status && countdown) {
        status = document.createElement("div");
        status.className = "system-message";
        countdown.insertAdjacentElement("afterend", status);
    }

    if (status) {
        status.dataset.type = type;
        status.textContent = message;
    }
}

function updateLastUpdated(mode = "online") {
    const updateDate = document.getElementById("update-date");

    if (!updateDate) {
        return;
    }

    const now = new Date();
    const options = {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit"
    };

    const suffix = mode === "offline" ? " - modo temporário" : "";
    updateDate.textContent = `${now.toLocaleDateString("pt-BR", options)}${suffix}`;
}

function updateCountdown() {
    const hoursElement = document.getElementById("hours");
    const minutesElement = document.getElementById("minutes");
    const secondsElement = document.getElementById("seconds");

    if (!hoursElement || !minutesElement || !secondsElement) {
        return;
    }

    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(now.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);

    const diff = Math.max(0, tomorrow - now);
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    hoursElement.textContent = String(hours).padStart(2, "0");
    minutesElement.textContent = String(minutes).padStart(2, "0");
    secondsElement.textContent = String(seconds).padStart(2, "0");
}

document.addEventListener("DOMContentLoaded", () => {
    fetchData();
    updateCountdown();
    setInterval(updateCountdown, 1000);
    setInterval(fetchData, STANDINGS_REFRESH_INTERVAL);
});
