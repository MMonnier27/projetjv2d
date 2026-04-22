import kaplay from "https://unpkg.com/kaplay@3001.0.19/dist/kaplay.mjs";

kaplay({
  width:      800,
  height:     450,
  letterbox:  true, 
  background: [20, 20, 30],
  debug:      true,
});

// assets
loadSprite("background", "country-platform-preview.png", {
})
loadSprite("sauterelle",   "sauterelle (1).png", {
sliceY: 2.3,
sliceX: 1.15,
anims:{
  "idle":{from:0, to:2, loop:true},
}
});
loadSprite("grenouille", "grenouille.png",{
})
loadSprite("serpent", "serpent.png",{
})

// fonction réutilisée
function addPlateforme(x, y, w, h, col) {
  return add([
    rect(w, h), pos(x, y),
    area(), body({ isStatic: true }),
    color(...col), "ground",
  ]);
}

function flashTransition(couleur, cb) {
  const overlay = add([
    rect(width(), height()),
    color(...couleur),
    opacity(0), fixed(), z(100),
  ]);
  tween(0, 1, 0.25, (v) => (overlay.opacity = v));
  wait(0.5, cb);
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
    text("espace pour commencer", { size: 16 }),
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
    text("c'est la fin", { size: 22 }),
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

  add([
    sprite("background"),
    pos(0, 0),
    scale(2.1),
    fixed(),
  ])
  

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
    sprite("sauterelle"),
    pos(60, 370), area(), body(),
    scale(1.5), anchor("botleft"),
    "player",

  ]);

  // prédateur
    const predator = add([
    sprite("grenouille"),
    pos(700, 390), area(),
    scale(0.2), anchor("botleft"),
    "predator",
  ]);

  //déplacement grenouille
  onUpdate(() => {
    predator.pos.y = height() - 45;
    const dx = player.pos.x - predator.pos.x;
    predator.move(dx > 0 ? 45 : -45, 0);
    predator.flipX = dx < 0;
  });

  // tirer la langue de la grenouille
   let tongueCooldown = 2;
  const TONGUE_RANGE = 250;  // portée max de la langue

  onUpdate(() => {
    tongueCooldown -= dt();
    if (tongueCooldown <= 0) {
      tongueCooldown = 2 + Math.random() * 1; // entre 2 et 3s
      const dist = player.pos.dist(predator.pos);

      if (dist < TONGUE_RANGE) {
        // Direction vers le joueur
        const dir = player.pos.sub(predator.pos).unit();

        const tongue = add([
          rect(20, 5),
          pos(predator.pos.x + (predator.flipX ? -10 : 20), predator.pos.y - 12),
          area(),
          color(220, 60, 80),
          rotate(Math.atan2(dir.y, dir.x) * (180 / Math.PI)),
          "tongue",
        ]);

          let traveled = 0;
        tongue.onUpdate(() => {
          const step = 280 * dt();
          tongue.move(dir.x * 280, dir.y * 280);
          traveled += step;
          if (traveled > TONGUE_RANGE || !tongue.exists()) destroy(tongue);
        });

        wait(0.8, () => { if (tongue.exists()) destroy(tongue); });
      }
    }
  });

  player.onCollide("tongue", () =>
    flashTransition([80, 200, 80], () => go("2"))
  );

  player.onCollide("predator", () =>
    flashTransition([80, 200, 80], () => go("2"))
  );


  onKeyDown("left",  () => { player.move(-SPEED, 0); player.flipX = true;  });
  onKeyDown("right", () => { player.move(SPEED,  0); player.flipX = false; });
  onKeyPress("up", () => { if (player.isGrounded()) player.jump(JUMP_FORCE); });

})

// scene 2 
scene("2", () => {
  const SPEED  = 150;
  const JUMP_FORCE = 600;
  setGravity(850);

  add([
    sprite("background"),
    scale(2.1),
  ])

  //niveau
  addPlateforme(0, 425, 100, 28, [25, 60, 25]); // sol
  addPlateforme(100, 430, 750, 24, [39, 118, 245]); // eau
  addPlateforme(750, 425, 50, 28, [25, 60, 25]); // sol
  addPlateforme(220,  280, 140, 14, [25, 70, 25]);
  addPlateforme(550,  190, 140, 14, [25, 70, 25]);
  addPlateforme(10,  150, 140, 14, [25, 70, 25]);
  addPlateforme(330,  90, 140, 14, [25, 70, 25]);
  addPlateforme(620,  340, 140, 14, [25, 70, 25]);
 

  // joueur
  const player = add([
    sprite("grenouille"),
    pos(60, 370), area(), body(),
    scale(0.2)
  ])


  onKeyDown("left",  () => { player.move(-SPEED, 0); player.flipX = true;  });
  onKeyDown("right", () => { player.move(SPEED,  0); player.flipX = false; });
  onKeyPress("up", () => { if (player.isGrounded()) player.jump(JUMP_FORCE); });

})
// ── Lancement ────────────────────────────────────────────────────────────────
go("start");
