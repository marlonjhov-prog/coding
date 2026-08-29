"use strict";

window.addEventListener("load", () => {
    const pulseSpeed = 0.025;
    const body = document.body;
    body.style.background = "#050508";

    const TP = 2 * Math.PI;
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

    const getRandomInt = (min, max, low) => {
        if (low) return Math.floor(Math.random() * Math.random() * (max - min)) + min;
        else return Math.floor(Math.random() * (max - min)) + min;
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
        if (this.radius >= this.originalRadius * 1.4) {
            this.pulseDirection = -1;
        } else if (this.radius <= this.originalRadius) {
            this.pulseDirection = 1;
        }
    };

    Circle.prototype.drawCircle = function(rf) {
        if (this.fullyGrown) {
            this.pulsate();
        }
        // Paleta Neón: combina rojos, púrpuras y rosas brillantes
        let heartHue = (hue + this.radius * 8) % 360;
        drawHeart(this.x, this.y, this.radius * rf * 1.6, `hsl(${heartHue}, 100%, 60%)`);
    };

    function drawHeart(x, y, size, color) {
        ctx.shadowColor = color;
        ctx.shadowBlur = 18; // Resplandor neón intensificado

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
        ctx.shadowBlur = 0; // Limpia sombra para no ralentizar el trazo de ramas
    }

    var Curve = function () {
        this.car = [];
        this.to = 0; // SOLUCIÓN: Inicia de inmediato sin esperar retrasos
        
        this.addCurveCircle = (cir) => {
            if (cir.pc) {
                this.car.unshift(cir.pc);
                this.addCurveCircle(cir.pc);
            }
        };

        this.setPath = () => {
            this.len = 0;
            this.path = new Path2D();
            this.path.moveTo(0, 0);
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
            
            // Grosor orgánico: Las ramas principales son más gruesas
            ctx.lineWidth = Math.max(1.5, 6 - (this.car.length * 0.4));
            ctx.setLineDash([Math.max(1, tt), 4000]);
            ctx.stroke(this.path);

            if (tt > this.len + 30) {
                this.car[this.car.length - 1].fullyGrown = true;
                this.car[this.car.length - 1].drawCircle(0.85);
                return true;
            } else if (tt > this.len) {
                let raf = 0.85 * (tt - this.len) / 30;
                this.car[this.car.length - 1].drawCircle(raf);
                return true;
            } else {
                return true;
            }
        };
    };

    var ca = [];
    var curves = [];
    var eg = Math.random() < 0.3;

    var cval = (x, y, rad) => {
        if (Math.pow(x * x + y * y, 0.5) > CSIZE - rad) return false;
        for (let i = 0; i < ca.length; i++) {
            let rt = rad + ca[i].radius;
            let xd = ca[i].x - x;
            let yd = ca[i].y - y;
            if (Math.abs(xd) > rt || Math.abs(yd) > rt) continue;
            if (Math.pow(xd * xd + yd * yd, 0.5) + 1 < rt) {
                return false;
            }
        }
        return true;
    };

    var grow = (rad) => {
        if (ca.length === 0) return false;
        let c = eg
            ? ca[ca.length - 1 - getRandomInt(0, ca.length, true)]
            : ca[getRandomInt(0, ca.length)];
        let a = TP * Math.random();
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
    var inc = 5; // Mayor velocidad de crecimiento inicial

    var animate = () => {
        if (!isRunning) return;
        t += inc;
        draw();
        requestAnimationFrame(animate);
    };

    var hue = getRandomInt(0, 360);

    var setCircles = () => {
        eg = Math.random() < 0.3;
        ca = [new Circle(0, 0, 0, 0, 45, 0, 0)];
        
        for (let i = 0; i < 700; i++) {
            let r = 12;
            if (i < 20) r = 36;
            else if (i < 80) r = 26;
            else if (i < 250) r = 18;
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
    // Estilo verde esmeralda luminoso para las ramas
    ctx.strokeStyle = "#80e644";
    startAnimation();
});
