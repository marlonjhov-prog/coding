"use strict";

const lyricsData = [
    { text: "I have loved you since we were 18", delay: 0.3, speed: 80 },
    { text: "Long before we both thought the same thing", delay: 6.9, speed: 70 },
    { text: "To be loved and to be in love", delay: 11.0, speed: 70 },
    { text: "And all I could do is say that these arms were made for holding you oh oh oh whoa", delay: 14.0, speed: 70 },
    { text: "I wanna love like you made me feel", delay: 20.8, speed: 90 },
    { text: "When we were 18", delay: 24.8, speed: 100 }
];

const container = document.getElementById("lyrics-container");

function animateText(text, speed, element) {
    let index = 0;
    
    const cursor = document.createElement("span");
    cursor.className = "cursor";
    element.appendChild(cursor);

    function typeChar() {
        if (index < text.length) {
            cursor.before(text.charAt(index));
            index++;
            setTimeout(typeChar, speed);
        } else {
            cursor.remove();
        }
    }
    typeChar();
}

function startKaraoke() {
    lyricsData.forEach((item) => {
        setTimeout(() => {
            const lineElement = document.createElement("div");
            lineElement.className = "line";
            container.appendChild(lineElement);
            animateText(item.text, item.speed, lineElement);
        }, item.delay * 1000);
    });
}

window.addEventListener("load", startKaraoke);
