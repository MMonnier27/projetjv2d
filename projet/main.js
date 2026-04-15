import kaplay from "https://unpkg.com/kaplay@3001.0.19/dist/kaplay.mjs";

kaplay({
  width:      800,
  height:     450,
  letterbox:  true, 
  background: [20, 20, 30],
  debug:      true,
});

// assets
loadSprite("insecte",   "sauterelle (1).png", {
sliceY: 2.3,
sliceX: 1.2,

});

// fonction réutilisée
function addPlateforme(x, y, w, h, col) {
  return add([
    rect(w, h), pos(x, y),
    area(), body({ isStatic: true }),
    color(...col), "ground",
  ]);
}

// ── Scène de démarrage ───────────────────────────────────────────────────────
scene("start", () => {
  add([rect(width(), height()), color(15, 30, 15), fixed()]);

  add([
    text("titre", { size: 52 }),
    pos(center()), anchor("center"), color(168, 212, 90),
  ]);

  add([
    text("Tu es la proie.\nÉvite le prédateur... \njusqu'à te faire attraper.", { size: 17 }),
    pos(center().x, center().y + 80), anchor("center"), color(200, 200, 200),
  ]);

  add([
    text("Se faire manger = évoluer  ", { size: 14 }),
    pos(center().x, center().y + 140), anchor("center"), color(150, 200, 150),
  ]);



  add([
    text("ESPACE pour commencer", { size: 16 }),
    pos(center().x, center().y + 215), anchor("center"), color(100, 160, 100),
  ]);

  onKeyPress("space", () => go("1"));
});

// ── Scène de fin ─────────────────────────────────────────────────────────────
scene("end", () => {
  add([rect(width(), height()), color(18, 18, 28), fixed()]);

  add([
    text("La chaîne est brisée.", { size: 42 }),
    pos(center().x, center().y - 60), anchor("center"),
    color(255, 100, 80),
  ]);

  add([
    text("L'humain ne fait pas partie de la chaîne alimentaire.\nIl est extérieur à elle — et il la détruit.", { size: 15 }),
    pos(center().x, center().y + 20), anchor("center"),
    color(200, 180, 160),
  ]);

  add([
    text("🪲  →  🐸  →  🐍  →  🦅  ✕  🧍", { size: 22 }),
    pos(center().x, center().y + 90), anchor("center"),
    color(168, 212, 90),
  ]);

  add([
    text("ESPACE pour rejouer", { size: 15 }),
    pos(center().x, center().y + 150), anchor("center"),
    color(110, 110, 110),
  ]);

  onKeyPress("space", () => go("start"));
});




  // scene 1
scene("1", () => {
  const SPEED      = 150;
  const JUMP_FORCE = 500;
  setGravity(850);

  // niveau 
  addPlateforme(0,   415, 800, 35, [30, 80, 30]);   // sol
  addPlateforme(50,  310, 140, 14, [25, 70, 25]);
  addPlateforme(280, 250, 140, 14, [25, 70, 25]);
  addPlateforme(500, 310, 140, 14, [25, 70, 25]);
  addPlateforme(650, 190, 140, 14, [25, 70, 25]);
  addPlateforme(130, 170, 120, 14, [25, 70, 25]);
  addPlateforme(350, 130, 100, 14, [25, 70, 25]);



  //player
  const player = add([
    sprite("insecte"),
    pos(60, 370), area(), body(),
    scale(1.5), anchor("botleft"),
    "player",
  ]);


  onKeyDown("left",  () => { player.move(-SPEED, 0); player.flipX = true;  });
  onKeyDown("right", () => { player.move(SPEED,  0); player.flipX = false; });
  onKeyPress("space", () => { if (player.isGrounded()) player.jump(JUMP_FORCE); });

})

// ── Lancement ────────────────────────────────────────────────────────────────
go("1");
