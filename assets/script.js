// ============================================================
// AJUSTE AQUI: data/hora oficial da Grande Final.
// Formato: "AAAA-MM-DDTHH:MM:SS" (horário de Brasília)
// ============================================================
const FINAL_DATE = new Date("2026-09-11T18:00:00");

const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function updateFinaleCountdown() {
    const hoursEl = document.getElementById("f-hours");
    const minutesEl = document.getElementById("f-minutes");
    const secondsEl = document.getElementById("f-seconds");
    const daysEl = document.getElementById("f-days");
    const statusEl = document.getElementById("finale-status-text");

    if (!hoursEl || !minutesEl || !secondsEl || !daysEl) {
        return;
    }

    const now = new Date();
    const diff = FINAL_DATE - now;

    if (diff <= 0) {
        daysEl.textContent = "00";
        hoursEl.textContent = "00";
        minutesEl.textContent = "00";
        secondsEl.textContent = "00";
        if (statusEl) {
            statusEl.textContent = "A grande final começou";
        }
        return;
    }

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    daysEl.textContent = String(days).padStart(2, "0");
    hoursEl.textContent = String(hours).padStart(2, "0");
    minutesEl.textContent = String(minutes).padStart(2, "0");
    secondsEl.textContent = String(seconds).padStart(2, "0");
}

// Simula a barra de "apuração" subindo aos poucos enquanto o time
// de dados fecha os números — puramente visual, ajuste os limites
// livremente ou troque por um valor real vindo da planilha.
function animateApuracao() {
    const fill = document.getElementById("finale-progress-fill");
    const percentLabel = document.getElementById("finale-progress-percent");

    if (!fill || !percentLabel) {
        return;
    }

    let current = 4;
    const target = 92;
    const step = () => {
        current = Math.min(target, current + Math.random() * 2.2);
        fill.style.width = `${current}%`;
        percentLabel.textContent = `${Math.round(current)}%`;

        if (current < target) {
            setTimeout(step, prefersReducedMotion ? 0 : 900 + Math.random() * 700);
        }
    };

    step();
}

// Confete leve em canvas — dourado / verde / azul, respeitando
// preferências de movimento reduzido do usuário.
function startConfetti() {
    if (prefersReducedMotion) {
        return;
    }

    const canvas = document.getElementById("confetti-canvas");
    if (!canvas) {
        return;
    }

    const ctx = canvas.getContext("2d");
    const colors = ["#f7c948", "#ffe8a3", "#12b76a", "#0b3d91", "#eef7ff"];
    let particles = [];

    function resize() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }

    function spawnBurst(count) {
        for (let i = 0; i < count; i += 1) {
            particles.push({
                x: Math.random() * canvas.width,
                y: -20 - Math.random() * canvas.height * 0.4,
                size: 4 + Math.random() * 5,
                color: colors[Math.floor(Math.random() * colors.length)],
                speedY: 0.6 + Math.random() * 1.4,
                speedX: (Math.random() - 0.5) * 0.8,
                rotation: Math.random() * 360,
                rotationSpeed: (Math.random() - 0.5) * 4,
            });
        }
    }

    function tick() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        particles.forEach((p) => {
            p.y += p.speedY;
            p.x += p.speedX;
            p.rotation += p.rotationSpeed;

            ctx.save();
            ctx.translate(p.x, p.y);
            ctx.rotate((p.rotation * Math.PI) / 180);
            ctx.fillStyle = p.color;
            ctx.globalAlpha = 0.85;
            ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
            ctx.restore();
        });

        particles = particles.filter((p) => p.y < canvas.height + 30);

        if (particles.length < 70) {
            spawnBurst(2);
        }

        requestAnimationFrame(tick);
    }

    resize();
    window.addEventListener("resize", resize);
    spawnBurst(60);
    tick();
}

document.addEventListener("DOMContentLoaded", () => {
    updateFinaleCountdown();
    setInterval(updateFinaleCountdown, 1000);
    animateApuracao();
    startConfetti();
});
