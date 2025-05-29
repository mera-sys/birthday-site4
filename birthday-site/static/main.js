let current = 1;

function nextTransition(n) {
    document.getElementById(`transition${n}`).classList.remove('active');
    if (n === 3 && typeof stopBalloonGame === "function") stopBalloonGame();
    if (n < 3) {
        document.getElementById(`transition${n+1}`).classList.add('active');
        // Start balloon game if on game slide
        if (n+1 === 3) setTimeout(startBalloonGame, 100);
    } else {
        document.getElementById('final').classList.add('active');
        startBirthdayCanvas();
    }
}

// Balloon pop game for transition3
let stopBalloonGame = null;
function startBalloonGame() {
    const canvas = document.getElementById('gameCanvas');
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = canvas.offsetHeight;

    const NUM_TO_POP = 10;
    let popped = 0;
    let balloons = [];
    let popExplosions = []; // Store pop effects
    let popProgress = document.getElementById('pop-progress');
    let showBtn = document.getElementById('showSurpriseBtn');
    popProgress.innerText = `Balloons popped: 0 / ${NUM_TO_POP}`;
    showBtn.style.display = "none";

    // Balloon image
    const balloonImg = new Image();
    balloonImg.src = 'static/moving.png';

    // Generate balloons
    function resetBalloons() {
        balloons = [];
        for (let i = 0; i < NUM_TO_POP; i++) {
            balloons.push({
                x: Math.random() * (canvas.width - 140) + 70,
                y: canvas.height + Math.random() * 80,
                r: 48 + Math.random()*24,
                vy: 1 + Math.random()*1.2,
                popped: false,
                popAnim: 0 // 0: not popped, >0: popping anim progress
            });
        }
    }
    resetBalloons();

    // Cool pop animation: confetti particles
    function spawnPopExplosion(x, y, colorSet) {
        let particles = [];
        let colors = colorSet || ["#ffd700","#fffbe8","#ffefba","#bfa14a","#ffb347","#ffe066"];
        let numParticles = 18 + Math.floor(Math.random()*8);
        for (let i = 0; i < numParticles; i++) {
            let ang = 2 * Math.PI * i / numParticles + Math.random() * 0.2;
            let speed = 3 + Math.random()*2.5;
            particles.push({
                x: x, y: y,
                vx: Math.cos(ang) * speed,
                vy: Math.sin(ang) * speed,
                r: 4 + Math.random()*2,
                color: colors[Math.floor(Math.random()*colors.length)],
                alpha: 1,
                gravity: 0.13 + Math.random()*0.1,
                shrink: 0.93 + Math.random()*0.04
            });
        }
        popExplosions.push(particles);
    }

    // Animation
    let running = true;
    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Balloons
        balloons.forEach(b => {
            if (b.popped && b.popAnim < 1) b.popAnim += 0.07;
            if (!b.popped) b.y -= b.vy;
            if (b.y < -b.r*1.2 && !b.popped) {
                b.x = Math.random() * (canvas.width - 140) + 70;
                b.y = canvas.height + 70;
            }
            ctx.save();
            if (b.popped) {
                ctx.globalAlpha = Math.max(0, 1-b.popAnim);
                ctx.translate(b.x, b.y - b.popAnim*60);
                ctx.rotate(b.popAnim*Math.PI*2*0.15);
                ctx.scale(1+0.4*b.popAnim, 1-0.3*b.popAnim);
                ctx.drawImage(balloonImg, -b.r/2, -b.r*0.7, b.r, b.r*1.3);
            } else {
                ctx.globalAlpha = 1;
                ctx.drawImage(balloonImg, b.x - b.r/2, b.y, b.r, b.r*1.3);
            }
            ctx.restore();
        });

        // Draw pop explosions
        for (let k = popExplosions.length - 1; k >= 0; k--) {
            let group = popExplosions[k];
            let alive = false;
            for (let p of group) {
                if (p.alpha > 0.05 && p.r > 0.6) {
                    p.x += p.vx;
                    p.y += p.vy;
                    p.vy += p.gravity;
                    p.r *= p.shrink;
                    p.alpha *= 0.94;
                    ctx.save();
                    ctx.globalAlpha = p.alpha;
                    ctx.beginPath();
                    ctx.arc(p.x, p.y, p.r, 0, Math.PI*2);
                    ctx.fillStyle = p.color;
                    ctx.shadowColor = p.color;
                    ctx.shadowBlur = 10;
                    ctx.fill();
                    ctx.restore();
                    alive = true;
                }
            }
            if (!alive) popExplosions.splice(k, 1);
        }

        if (running) requestAnimationFrame(animate);
    }

    // Click to pop
    function onClick(e) {
        let rect = canvas.getBoundingClientRect();
        let mx = (e.touches ? e.touches[0].clientX : e.clientX) - rect.left;
        let my = (e.touches ? e.touches[0].clientY : e.clientY) - rect.top;
        for (let b of balloons) {
            if (!b.popped) {
                let bx = b.x, by = b.y + b.r*0.65;
                let dx = mx - bx, dy = my - by;
                if ((dx*dx + dy*dy) < (b.r*0.55)*(b.r*0.55)) {
                    b.popped = true;
                    popped++;
                    popProgress.innerText = `Balloons popped: ${popped} / ${NUM_TO_POP}`;
                    // spawn cool pop effect at balloon center
                    spawnPopExplosion(bx, by, ["#ffd700","#fffbe8","#ffe066","#ffb347","#fff7e6","#bfa14a"]);
                    if (popped === NUM_TO_POP) {
                        setTimeout(() => {
                            showBtn.style.display = "";
                        }, 700);
                    }
                    break;
                }
            }
        }
    }
    canvas.addEventListener('click', onClick);
    canvas.addEventListener('touchstart', onClick);

    balloonImg.onload = animate;
    if (balloonImg.complete) animate();

    // Stop function for cleanup
    stopBalloonGame = function () {
        running = false;
        canvas.removeEventListener('click', onClick);
        canvas.removeEventListener('touchstart', onClick);
        stopBalloonGame = null;
    };
}

// Final animation
const balloonImg = new Image();
balloonImg.src = 'static/moving.png';

function startBirthdayCanvas() {
    const canvas = document.getElementById('birthdayCanvas');
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = canvas.offsetHeight;

    // Balloons data (positions and speed)
    let balloons = [];
    for (let i = 0; i < 10; i++) {
        balloons.push({
            x: Math.random() * (canvas.width - 100) + 50,
            y: canvas.height + Math.random() * 140,
            speed: 1 + Math.random() * 1.3,
            size: 60 + Math.random()*35
        });
    }

    // Fireworks
    let fireworks = [];
    function launchFirework() {
        const centerX = Math.random() * canvas.width * 0.6 + canvas.width * 0.2;
        const baseY = canvas.height * 0.40 + Math.random() * canvas.height * 0.15;
        const colors = ["#FFD700", "#FFFAE5", "#F2D885", "#fff", "#bfa14a"];
        let count = 32 + Math.floor(Math.random()*16);
        let fw = [];
        for (let i = 0; i < count; i++) {
            const angle = 2 * Math.PI * i / count;
            const speed = 2.5 + Math.random() * 2;
            fw.push({
                x: centerX,
                y: baseY,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                alpha: 1,
                color: colors[Math.floor(Math.random() * colors.length)],
                r: 2.6 + Math.random()*2.2
            });
        }
        fireworks.push(fw);
    }

    setInterval(launchFirework, 1200);

    function draw3DCakeLikeImage9(t) {
        const cx = canvas.width / 2;
        const baseY = canvas.height * 0.72;
        const cakeR = 150;
        const cakeH = 110;

        // Cake plate (gold)
        ctx.save();
        ctx.beginPath();
        ctx.ellipse(cx, baseY + 36, cakeR * 1.12, 16, 0, 0, Math.PI * 2);
        var plateGrad = ctx.createRadialGradient(cx, baseY + 36, 12, cx, baseY + 36, cakeR * 1.12);
        plateGrad.addColorStop(0, "#fff8e1");
        plateGrad.addColorStop(0.5, "#bfa14a");
        plateGrad.addColorStop(1, "#7c5c12");
        ctx.fillStyle = plateGrad;
        ctx.shadowColor = "#bfa14a";
        ctx.shadowBlur = 22;
        ctx.fill();
        ctx.restore();

        // Cake body (cylinder, white)
        ctx.save();
        ctx.beginPath();
        ctx.ellipse(cx, baseY, cakeR, 20, 0, 0, Math.PI * 2); // bottom ellipse
        ctx.moveTo(cx - cakeR, baseY);
        ctx.lineTo(cx - cakeR, baseY - cakeH);
        ctx.ellipse(cx, baseY - cakeH, cakeR, 20, 0, Math.PI, 0, true); // top ellipse
        ctx.lineTo(cx + cakeR, baseY);
        ctx.closePath();
        let cakeGrad = ctx.createLinearGradient(cx, baseY - cakeH, cx, baseY);
        cakeGrad.addColorStop(0, "#fffbe8");
        cakeGrad.addColorStop(0.5, "#fff7ec");
        cakeGrad.addColorStop(1, "#edd8ad");
        ctx.fillStyle = cakeGrad;
        ctx.fill();

        // Cake top ellipse
        ctx.beginPath();
        ctx.ellipse(cx, baseY - cakeH, cakeR, 20, 0, 0, Math.PI * 2);
        ctx.fillStyle = "#fffbe8";
        ctx.fill();
        ctx.restore();

        // Gold drip (wavy, 3D effect)
        ctx.save();
        ctx.beginPath();
        ctx.moveTo(cx - cakeR + 8, baseY - cakeH + 18);
        for (let i = 0; i <= 24; i++) {
            let ang = i / 24 * Math.PI * 2;
            let x = cx + Math.cos(ang) * (cakeR - 7);
            let y = baseY - cakeH + 18 + Math.abs(Math.sin(ang * 2 + t/17)) * 13 + (Math.random() - 0.5) * 2.2;
            ctx.lineTo(x, y);
        }
        ctx.lineTo(cx + cakeR - 8, baseY + 5);
        ctx.ellipse(cx, baseY, cakeR - 8, 19, 0, 0, Math.PI * 2, true);
        ctx.closePath();
        let dripGrad = ctx.createLinearGradient(cx, baseY - cakeH + 14, cx, baseY + 8);
        dripGrad.addColorStop(0, "#ffd700");
        dripGrad.addColorStop(0.45, "#bfa14a");
        dripGrad.addColorStop(1, "#fffbe0");
        ctx.globalAlpha = 0.92;
        ctx.fillStyle = dripGrad;
        ctx.fill();
        ctx.globalAlpha = 1;
        ctx.restore();

        // Gold spheres around the base
        for (let i = 0; i < 14; i++) {
            let ang = Math.PI * 0.18 * i + 0.4 * Math.sin(t/10 + i);
            let x = cx + Math.cos(ang) * (cakeR - 24);
            let y = baseY + 12 + Math.sin(ang) * 7;
            ctx.save();
            ctx.beginPath();
            ctx.arc(x, y, 12 + Math.sin(t/20 + i) * 1.5, 0, Math.PI * 2);
            let grad = ctx.createRadialGradient(x - 4, y - 4, 3, x, y, 13);
            grad.addColorStop(0, "#fff8dc");
            grad.addColorStop(0.7, "#f2d885");
            grad.addColorStop(1, "#bfa14a");
            ctx.fillStyle = grad;
            ctx.shadowColor = "#bfa14a";
            ctx.shadowBlur = 7;
            ctx.globalAlpha = 0.89;
            ctx.fill();
            ctx.restore();
        }

        // Gold spheres and bows on top
        for (let i = 0; i < 6; i++) {
            let ang = Math.PI * 2 * i / 6;
            let x = cx + Math.cos(ang) * 55;
            let y = baseY - cakeH - 8 + Math.sin(ang) * 13;
            ctx.save();
            ctx.beginPath();
            ctx.arc(x, y, 9, 0, Math.PI * 2);
            let grad = ctx.createRadialGradient(x - 3, y - 3, 2, x, y, 9);
            grad.addColorStop(0, "#fff8dc");
            grad.addColorStop(0.7, "#f2d885");
            grad.addColorStop(1, "#bfa14a");
            ctx.fillStyle = grad;
            ctx.shadowColor = "#bfa14a";
            ctx.shadowBlur = 6;
            ctx.globalAlpha = 0.96;
            ctx.fill();
            ctx.restore();

            // AI "bow" (simple loop)
            ctx.save();
            ctx.beginPath();
            ctx.ellipse(x + 8, y - 15, 8, 4, -Math.PI/6 + Math.sin(t/20 + i)*0.1, 0, Math.PI*2);
            ctx.strokeStyle = "#bfa14a";
            ctx.lineWidth = 2.2;
            ctx.globalAlpha = 0.75;
            ctx.stroke();
            ctx.restore();
        }

        // Gold Balloons (drawn in AI style)
        let balloonY = baseY - cakeH - 90;
        let balloonR = 45;
        for (let i = 0; i < 8; i++) {
            let bx = cx + Math.cos(Math.PI*2*i/8 + 0.5*Math.sin(t/30))*80 + (Math.sin(t/60+i)*12);
            let by = balloonY + Math.sin(Math.PI*2*i/8 + t/60)*16;
            // Stick
            ctx.save();
            ctx.beginPath();
            ctx.moveTo(bx, by+balloonR-8);
            ctx.lineTo(cx, baseY - cakeH + 12);
            ctx.strokeStyle = "#bfa14a";
            ctx.lineWidth = 2;
            ctx.globalAlpha = 0.7;
            ctx.stroke();
            ctx.restore();

            // Balloon body (3D gold)
            ctx.save();
            ctx.beginPath();
            ctx.ellipse(bx, by, balloonR, balloonR*1.21, Math.PI/16*Math.sin(t/120 + i), 0, Math.PI*2);
            let grad = ctx.createRadialGradient(bx-balloonR/3, by-balloonR/3, 8, bx, by, balloonR*1.2);
            grad.addColorStop(0, "#fffefa");
            grad.addColorStop(0.2, "#fff1b8");
            grad.addColorStop(0.4, "#ffe066");
            grad.addColorStop(0.75, "#bfa14a");
            grad.addColorStop(1, "#7c5c12");
            ctx.fillStyle = grad;
            ctx.shadowColor = "#bfa14a";
            ctx.shadowBlur = 18;
            ctx.globalAlpha = 0.97;
            ctx.fill();
            ctx.restore();

            // Balloon reflection
            ctx.save();
            ctx.beginPath();
            ctx.ellipse(bx-balloonR/6, by-balloonR/7, balloonR/7, balloonR/3, Math.PI/6, 0, Math.PI*2);
            ctx.fillStyle = "rgba(255,255,255,0.23)";
            ctx.fill();
            ctx.restore();
        }

        // Cake text "Happy Birthday"
        ctx.save();
        ctx.font = "bold 2.6rem 'Playfair Display', serif";
        ctx.textAlign = "center";
        ctx.fillStyle = "#2d2312";
        ctx.shadowColor = "#fffbe8";
        ctx.shadowBlur = 2;
        ctx.fillText("Happy", cx, baseY - cakeH + 38);
        ctx.fillText("Birthday", cx, baseY - cakeH + 70);
        ctx.restore();
    }

    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Balloons float up (background effect)
        balloons.forEach(b => {
            b.y -= b.speed;
            if (b.y < -b.size * 1.3) {
                b.y = canvas.height + 60;
                b.x = Math.random() * (canvas.width - 100) + 50;
            }
            ctx.save();
            ctx.globalAlpha = 0.88;
            ctx.drawImage(balloonImg, b.x - b.size/2, b.y, b.size, b.size*1.18);
            ctx.restore();
        });

        // Cake (AI 3D)
        draw3DCakeLikeImage9(performance.now()/20);

        // Fireworks
        for (let i = fireworks.length-1; i >= 0; i--) {
            let fw = fireworks[i];
            let alive = false;
            for (let j = 0; j < fw.length; j++) {
                let p = fw[j];
                if (p.alpha > 0) {
                    p.x += p.vx;
                    p.y += p.vy;
                    p.vy += 0.03;
                    p.alpha -= 0.012 + Math.random() * 0.01;
                    ctx.save();
                    ctx.globalAlpha = Math.max(p.alpha, 0);
                    ctx.beginPath();
                    ctx.arc(p.x, p.y, p.r, 0, Math.PI*2);
                    ctx.fillStyle = p.color;
                    ctx.shadowColor = p.color;
                    ctx.shadowBlur = 20;
                    ctx.fill();
                    ctx.restore();
                    alive = true;
                }
            }
            if (!alive) fireworks.splice(i, 1);
        }

        requestAnimationFrame(animate);
    }

    if (balloonImg.complete) animate();
    else balloonImg.onload = animate;
}

// Modal logic for Mark Glenn's message
document.addEventListener("DOMContentLoaded", function() {
    // Only enable when 'final' slide is present
    const icon = document.getElementById('left-message-icon');
    const modal = document.getElementById('message-modal');
    const closeBtn = document.getElementById('close-message-modal');
    if (icon && modal && closeBtn) {
        icon.onclick = () => {
            modal.classList.add('active');
        };
        closeBtn.onclick = () => {
            modal.classList.remove('active');
        };
        modal.onclick = (e) => {
            if (e.target === modal) modal.classList.remove('active');
        };
    }
});