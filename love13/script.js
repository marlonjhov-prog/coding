"use strict";

window.addEventListener("load", () => {
    const pulseSpeed = 0.025;
    const body = document.body;
    body.style.background = "#050508";

    const CSIZE = 400;

    const ctx = (() => {
        let d = document.createElement("div");
        d.style.textAlign = "center";
        body.append(d);
        let c = document.createElement("canvas");
        c.width = 2 * CSIZE;
        c.height = 2 * CSIZE;
        d.append(c);
        return c.getContext("2d");
    })();

    ctx.translate(CSIZE, CSIZE);
    ctx.lineCap = "round";

    const resizeCanvas = () => {
        let D = Math.min(window.innerWidth, window.innerHeight) - 40;
        if (D > 0) {
            ctx.canvas.style.width = D + "px";
            ctx.canvas.style.height = D + "px";
        }
    };
    window.addEventListener("resize", resizeCanvas);

    const getRandomInt = (min, max) => Math.floor(Math.random() * (max - min)) + min;

    // Ecuación matemática exacta para forzar forma de corazón centrado
    const inHeartBound = (x, y) => {
        let nx = x / 230;
        let ny = -y / 230 + 0.25;
        let eq = Math.pow(nx * nx + ny * ny - 1, 3) - nx * nx * Math.pow(ny, 3);
        return eq <= 0;
    };

    var Circle = function (x, y, xp, yp, radius, pc) {
        this.x = x;
        this.y = y;
        this.xp = xp;
        this.yp = yp;
        this.radius = radius;
        this.originalRadius = radius;
        this.pc = pc;
        this.c = [];
        this.fullyGrown = false;
        this.pulseDirection = 1;
    };

    Circle.prototype.pulsate = function() {
        this.radius += this.radius * this.pulseDirection * pulseSpeed;
        if (this.radius >= this.originalRadius * 1.35) {
            this.pulseDirection = -1;
        } else if (this.radius <= this.originalRadius) {
            this.pulseDirection = 1;
        }
    };

    Circle.prototype.drawCircle = function(rf) {
        if (this.fullyGrown) {
            this.pulsate();
        }
        // Variación de tonos rojos neón, carmesí y rosas intensos
        let redHue = (345 + (Math.hypot(this.x, this.y) * 0.15)) % 360;
        let lightness = 50 + (this.radius % 15);
        drawHeart(this.x, this.y, this.radius * rf * 1.5, `hsl(${redHue}, 100%, ${lightness}%)`);
    };

    function drawHeart(x, y, size, color) {
        ctx.shadowColor = color;
        ctx.shadowBlur = 14;

        var d = size;
        var k = x - d / 2;
        var l = y - d / 2;

        ctx.beginPath();
        ctx.moveTo(k, l + d / 4);
        ctx.quadraticCurveTo(k, l, k + d / 4, l);
        ctx.quadraticCurveTo(k + d / 2, l, k + d / 2, l + d / 4);
        ctx.quadraticCurveTo(k + d / 2, l, k + d * 3/4, l);
        ctx.quadraticCurveTo(k + d, l, k + d, l + d / 4);
        ctx.quadraticCurveTo(k + d, l + d / 2, k + d * 3/4, l + d * 3/4);
        ctx.lineTo(k + d / 2, l + d);
        ctx.lineTo(k + d / 4, l + d * 3/4);
        ctx.quadraticCurveTo(k, l + d / 2, k, l + d / 4);
        ctx.fillStyle = color;
        ctx.fill();
        ctx.closePath();
        ctx.shadowBlur = 0;
    }

    var Curve = function () {
        this.car = [];
        this.to = 0;
        
        this.addCurveCircle = (cir) => {
            if (cir.pc) {
                this.car.unshift(cir.pc);
                this.addCurveCircle(cir.pc);
            }
        };

        this.setPath = () => {
            this.len = 0;
            this.path = new Path2D();
            this.path.moveTo(0, 80);
            if (this.car.length > 1) {
                this.path.lineTo(this.car[1].xp, this.car[1].yp);
            }
            this.len += this.car[0].radius;
            for (let i = 1; i < this.car.length - 1; i++) {
                this.path.bezierCurveTo(this.car[i].x, this.car[i].y, this.car[i].x, this.car[i].y, this.car[i + 1].xp, this.car[i + 1].yp);
                this.len += 2 * this.car[i].radius;
            }
            if (this.car.length > 0) {
                this.path.lineTo(this.car[this.car.length - 1].x, this.car[this.car.length - 1].y);
                this.len += this.car[this.car.length - 1].radius;
            }
        };

        this.drawCurve = () => {
            let tt = this.to + t;
            ctx.lineWidth = Math.max(1.2, 4.5 - (this.car.length * 0.25));
            ctx.setLineDash([Math.max(1, tt), 4000]);
            ctx.stroke(this.path);

            if (tt > this.len + 20) {
                this.car[this.car.length - 1].fullyGrown = true;
                this.car[this.car.length - 1].drawCircle(0.85);
                return true;
            } else if (tt > this.len) {
                let raf = 0.85 * (tt - this.len) / 20;
                this.car[this.car.length - 1].drawCircle(raf);
                return true;
            } else {
                return true;
            }
        };
    };

    var ca = [];
    var curves = [];

    var cval = (x, y, rad) => {
        if (!inHeartBound(x, y)) return false;
        for (let i = 0; i < ca.length; i++) {
            let rt = rad + ca[i].radius;
            let xd = ca[i].x - x;
            let yd = ca[i].y - y;
            if (Math.abs(xd) > rt || Math.abs(yd) > rt) continue;
            if (Math.hypot(xd, yd) + 0.5 < rt) {
                return false;
            }
        }
        return true;
    };

    var grow = (rad) => {
        if (ca.length === 0) return false;
        let c = ca[getRandomInt(0, ca.length)];
        let a = Math.PI * 2 * Math.random();
        let x = c.x + (c.radius + rad) * Math.cos(a);
        let y = c.y + (c.radius + rad) * Math.sin(a);
        if (cval(x, y, rad)) {
            let xp = c.x + c.radius * Math.cos(a);
            let yp = c.y + c.radius * Math.sin(a);
            let circle = new Circle(x, y, xp, yp, rad, c);
            c.c.push(circle);
            ca.push(circle);
            return true;
        }
        return false;
    };

    var draw = () => {
        ctx.clearRect(-CSIZE, -CSIZE, 2 * CSIZE, 2 * CSIZE);
        for (let i = 0; i < curves.length; i++) {
            curves[i].drawCurve();
        }
    };

    var isRunning = false;
    var startAnimation = () => {
        if (!isRunning) {
            isRunning = true;
            requestAnimationFrame(animate);
        }
    };

    var t = 0;
    var inc = 8; // Velocidad de crecimiento aumentada

    var animate = () => {
        if (!isRunning) return;
        t += inc;
        draw();
        requestAnimationFrame(animate);
    };

    var setCircles = () => {
        // Tronco inicial desde la base
        ca = [new Circle(0, 100, 0, 120, 30, 0)];
        
        // Generar alta cantidad de ramas (4500 iteraciones)
        for (let i = 0; i < 4500; i++) {
            let r = 6;
            if (i < 50) r = 22;
            else if (i < 300) r = 14;
            else if (i < 1200) r = 9;
            grow(r);
        }
        
        curves = [];
        for (let i = 0; i < ca.length; i++) {
            if (ca[i].c.length === 0) {
                var nc = new Curve();
                nc.car = [ca[i]];
                nc.addCurveCircle(ca[i]);
                nc.setPath();
                curves.push(nc);
            }
        }
    };

    resizeCanvas();
    setCircles();
    // Estilo de ramas verde lima neón brillante
    ctx.strokeStyle = "hsla(100, 85%, 55%, 0.85)";
    startAnimation();
});
