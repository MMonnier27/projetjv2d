import kaplay from "https://unpkg.com/kaplay@3001.0.19/dist/kaplay.mjs";

kaplay({
  width:      800,
  height:     450,
  letterbox:  true, 
  background: [20, 20, 30],
  debug:      false,
});

// assets
loadSprite("background", "country-platform-preview.png", {
})
loadSprite("sauterelle",   "sauterelle (6).png", {
  sliceX: 2,
  sliceY: 3,
  anims: {
    "idle": { from: 0, to: 2, loop: true, speed: 14 },
    "run":  { from: 3, to: 5, loop: true, speed: 20 },
  }
});
loadSprite("grenouille", "grenouille.png",{
})
loadSprite("serpent", "serpent.png",{
})
loadSprite("aigle", "aigle.png",{
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

// IA de chasse — le prédateur fonce vers le joueur et accélère
function makePredatorChase(predator, getPlayer, baseSpeed, accel) {
  let elapsed = 0;
  onUpdate(() => {
    elapsed += dt();
    const player = getPlayer();
    if (!player || !player.exists()) return;
    const currentSpeed = baseSpeed + elapsed * accel;
    const dir = player.pos.sub(predator.pos).unit();
    predator.move(dir.scale(currentSpeed));
  });
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
    pos(60, 415), area(), body(),
    scale(1.5), anchor("botleft"),
    "player",

  ]);

  player.play("idle");

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


  onKeyDown("left",  () => { player.move(-SPEED, 0); player.flipX = true; if (player.curAnim() !== "run") player.play("run"); });
  onKeyDown("right", () => { player.move(SPEED,  0); player.flipX = false;  if (player.curAnim() !== "run") player.play("run"); });
  onKeyPress("up", () => { if (player.isGrounded()) player.jump(JUMP_FORCE); });

})

// scene 2 
scene("2", () => {
  const SPEED  = 150;
  const JUMP_FORCE = 600;
  const SINK_TIME = 5;
  const SINK_DIST = 40;
  setGravity(850);
 
  add([
    sprite("background"),
    scale(2.1),
  ])
 
  add([rect(width(), height()), color(15, 45, 15), fixed()]);
  // Sol = eau (danger si on tombe)
  add([rect(width(), 60), pos(0, height() - 60), color(20, 70, 120), opacity(0.8)]);
  // Quelques herbes décoratives
  [[30,385],[120,385],[400,385],[600,385],[750,385]].forEach(([x,y]) => {
    add([rect(4, 20), pos(x, y), color(40, 130, 40)]);
    add([rect(4, 20), pos(x+8, y+5), color(35, 110, 35)]);
  });
 
 
  //niveau
  addPlateforme(0, 415, 800, 35, [140, 100, 50]);
 
  const LEAVES = [
    { x: 30,  y: 340, w: 130 },
    { x: 220, y: 275, w: 120 },
    { x: 400, y: 210, w: 110 },
    { x: 570, y: 270, w: 130 },
    { x: 650, y: 175, w: 140 },
    { x: 100, y: 180, w: 110 },
    { x: 310, y: 140, w: 100 },
  ];
 
  // Les feuilles n'ont PAS de body — collision manuelle pour pouvoir
  // laisser le joueur passer à travers quand elles sont trop affaissées.
  const leaves = LEAVES.map(({ x, y, w }) => ({
    baseY:         y,
    x,
    w,
    sinkProgress:  0,
    sinking:       false,
    recovering:    false,
    recoveryTimer: 0,
    obj: add([
      rect(w, 10),
      pos(x, y),
      color(40, 160, 50),
      z(1),
    ]),
    vein: add([
      rect(w - 10, 3),
      pos(x + 5, y + 3),
      color(30, 130, 40),
      z(2),
    ]),
  }));
 
  // joueur — déclaré AVANT onUpdate pour être accessible dans la boucle
  const player = add([
    sprite("grenouille"),
    pos(60, 370), area(), body(),
    scale(0.2),
    { jumpsLeft: 1, inWater: false },
  ]);
 
  const WATER_Y = height() - 60;
 
  onUpdate(() => {
    leaves.forEach((leaf) => {
      // La feuille devient passante à partir de 90% d'affaissement
      const passthrough = leaf.sinkProgress >= 0.9;
 
      // Collision manuelle : bloque le joueur uniquement si la feuille est active
      const playerBottom = player.pos.y;
      const playerLeft   = player.pos.x;
      const playerRight  = player.pos.x + 18;
      const leafTop      = leaf.obj.pos.y;
 
      const landing =
        !passthrough &&
        player.vel.y >= 0 &&
        playerBottom >= leafTop - 6 &&
        playerBottom <= leafTop + 14 &&
        playerRight  > leaf.x &&
        playerLeft   < leaf.x + leaf.w;
 
      if (landing) {
        player.pos.y = leafTop;
        player.vel.y = 0;
        leaf.sinking = true;
        player.jumpsLeft = 1;
      }
 
      // ── Affaissement progressif ───────────────────────────────────────────
      if (leaf.sinking && !leaf.recovering) {
        leaf.sinkProgress = Math.min(1, leaf.sinkProgress + dt() / SINK_TIME);
        const ny = leaf.baseY + leaf.sinkProgress * SINK_DIST;
        leaf.obj.pos.y  = ny;
        leaf.vein.pos.y = ny + 3;
 
        const r = 40  + Math.floor(leaf.sinkProgress * 150);
        const g = 160 - Math.floor(leaf.sinkProgress * 100);
        const b = 50  - Math.floor(leaf.sinkProgress * 30);
        leaf.obj.color   = rgb(r, g, b);
        leaf.obj.opacity  = 1 - leaf.sinkProgress * 0.7;
        leaf.vein.opacity = leaf.obj.opacity;
 
        if (leaf.sinkProgress >= 1) {
          leaf.sinking       = false;
          leaf.recovering    = true;
          leaf.recoveryTimer = SINK_TIME;
        }
      }
 
      // ── Récupération ─────────────────────────────────────────────────────
      if (leaf.recovering) {
        leaf.recoveryTimer -= dt();
        if (leaf.recoveryTimer <= 0) {
          leaf.sinkProgress = Math.max(0, leaf.sinkProgress - dt() * 0.4);
          const ny = leaf.baseY + leaf.sinkProgress * SINK_DIST;
          leaf.obj.pos.y  = ny;
          leaf.vein.pos.y = ny + 3;
          const r = 40  + Math.floor(leaf.sinkProgress * 150);
          const g = 160 - Math.floor(leaf.sinkProgress * 100);
          const b = 50  - Math.floor(leaf.sinkProgress * 30);
          leaf.obj.color   = rgb(r, g, b);
          leaf.obj.opacity  = 1 - leaf.sinkProgress * 0.7;
          leaf.vein.opacity = leaf.obj.opacity;
 
          if (leaf.sinkProgress <= 0) {
            leaf.recovering   = false;
            leaf.sinking      = false;
            leaf.obj.opacity  = 1;
            leaf.vein.opacity = 1;
          }
        }
      }
    });
 
    // Gestion de l'eau : amortit la chute + permet de ressauter
    player.inWater = player.pos.y >= WATER_Y - 10;
    if (player.inWater) {
      player.vel.y   *= 0.75;
      player.jumpsLeft = 1;
    }
  });
 
 
  const predator = add([
    sprite("serpent"),
    pos(720, height() - 80), area(),
    scale(0.9), anchor("botleft"),
    "predator",
  ]);
 
  let snakeDir = -1;
  onUpdate(() => {
    predator.pos.y = height() - 22;
    predator.move(snakeDir * 60, 0);
    predator.flipX = snakeDir > 0;
    if (predator.pos.x < 10 || predator.pos.x > width() - 60) snakeDir *= -1;
  });
 
  onKeyDown("left",  () => { player.move(-SPEED, 0); player.flipX = true;  });
  onKeyDown("right", () => { player.move(SPEED,  0); player.flipX = false; });
  onKeyPress("up", () => {
    if (player.isGrounded() || player.jumpsLeft > 0 || player.inWater) {
      player.jump(JUMP_FORCE);
      player.jumpsLeft = Math.max(0, player.jumpsLeft - 1);
    }
  });
  player.onGround(() => { player.jumpsLeft = 1; });
 
  player.onCollide("predator", () =>
    flashTransition([160, 90, 20], () => go("snake"))
  );

})

scene("snake", () => {
  const SPEED_BASE = 240;
  setGravity(900);
 
  // Arrière-plan désert
  add([rect(width(), height()),     color(110, 80, 40), fixed()]);
  add([rect(width(), height() / 2), pos(0, height() / 2), color(80, 55, 25), fixed()]);
 
  // Sol
  addPlateforme(0, 415, 800, 35, [140, 100, 50]);
 
  // Rochers
  const rocks = [
    { x: 60,  y: 330, w: 90,  h: 85 },
    { x: 280, y: 325, w: 100, h: 90 },
    { x: 500, y: 330, w: 90,  h: 85 },
    { x: 660, y: 320, w: 130, h: 95 },
  ];
  rocks.forEach(({ x, y, w, h }) => {
    add([rect(w, h),     pos(x, y),           color(90, 70, 45)]);
    add([rect(w, 6),     pos(x, y),           color(110, 85, 55)]);
    add([rect(w-8, 4),   pos(x+4, y+h-4),     color(60, 45, 25)]);
  });
 
  // Cactus
  [[190, 370], [450, 375], [600, 368]].forEach(([x, y]) => {
    add([rect(8, 35), pos(x, y),      color(50, 120, 50)]);
    add([rect(20, 8), pos(x-6, y+10), color(50, 120, 50)]);
  });
 
  // Joueur — Serpent
  const player = add([
    sprite("serpent"),
    pos(60, 400), area(), body(),
    scale(1), anchor("botleft"),
    "player",
  ]);
 
  // Prédateur — Aigle (cercle + piqué)
  const predator = add([
  sprite("aigle"),
  pos(400, 60), area(),
  scale(0.8),
  anchor("center"),
  "predator",
]);
 
  let eagleState  = "circle";
  let circleAngle = 0;
  let circleTimer = 3;
  let diveTarget  = vec2(0, 0);
  let diveSpeed   = 0;
  const CX = 400, CY = 90, CR = 130;
 
  onUpdate(() => {
    if (eagleState === "circle") {
      circleAngle += dt() * 1.5;
      predator.pos.x = CX + Math.cos(circleAngle) * CR;
      predator.pos.y = CY + Math.sin(circleAngle) * 40;
      circleTimer -= dt();
      if (circleTimer <= 0) {
        eagleState  = "dive";
        diveTarget  = vec2(player.pos.x, player.pos.y);
        diveSpeed   = 350;
        circleTimer = 3 + Math.random() * 2;
      }
    }
    if (eagleState === "dive") {
      const dir = diveTarget.sub(predator.pos).unit();
      predator.move(dir.scale(diveSpeed));
      diveSpeed = Math.min(diveSpeed + 200 * dt(), 500);
      if (predator.pos.dist(diveTarget) < 20 || predator.pos.y > height() - 30) {
        eagleState  = "circle";
        circleAngle = Math.atan2(predator.pos.y - CY, predator.pos.x - CX);
      }
    }
    // Sous un rocher → annule le piqué
    const safe = rocks.some(r =>
      player.pos.x + 10 >= r.x && player.pos.x <= r.x + r.w
    );
    if (safe && eagleState === "dive" && predator.pos.y > 300) {
      eagleState = "circle"; circleTimer = 2;
    }
  });
 
  // Contrôles — horizontal uniquement
  let speedBoost = 0;
  onKeyDown("left", () => {
    speedBoost = Math.min(speedBoost + dt() * 400, 100);
    player.move(-(SPEED_BASE + speedBoost), 0);
    player.flipX = true;
  });
  onKeyDown("right", () => {
    speedBoost = Math.min(speedBoost + dt() * 400, 100);
    player.move((SPEED_BASE + speedBoost), 0);
    player.flipX = false;
  });
  onKeyRelease("left",  () => { speedBoost = 0; });
  onKeyRelease("right", () => { speedBoost = 0; });
 
  onUpdate(() => {
    player.pos.x = clamp(player.pos.x, 0, width() - 50);
  });
 
  player.onCollide("predator", () =>
    flashTransition([210, 160, 40], () => go("eagle"))
  );
 
  player.onUpdate(() => {
    if (player.pos.y > height() + 60) player.pos = vec2(60, 400);
  });
});

scene("eagle", () => {
  setGravity(0);

  // ── Décor ciel ────────────────────────────────────────────────────────────
  add([rect(width(), height()), color(85, 145, 225), fixed()]);
  [[60,60,130,35],[280,40,110,30],[500,80,140,35],
   [680,30,100,30],[180,200,120,30],[420,180,130,30]].forEach(
    ([x,y,w,h]) => add([rect(w,h), pos(x,y), color(240,240,255), opacity(0.75)])
  );
  add([rect(width(), 55), pos(0, height()-55), color(110, 85, 50)]);

  // Câbles électriques (traces humaines)
  add([rect(width(), 2), pos(0, 280), color(40,40,40), opacity(0.5)]);
  add([rect(width(), 2), pos(0, 350), color(40,40,40), opacity(0.5)]);
  [80,220,380,540,680].forEach(x => {
    add([rect(6,30), pos(x, 252), color(50,50,50), opacity(0.5)]);
    add([rect(6,30), pos(x, 322), color(50,50,50), opacity(0.5)]);
  });

  // ── Aigle — vole librement en cinématique ─────────────────────────────────
  const eagle = add([
    sprite("aigle"),
    pos(60, 200),
    scale(0.8),
    anchor("center"),
  ]);

  // Trajectoire de vol libre : courbe sinusoïdale paisible
  let t = 0;
  let phase = "fly";       // "fly" → "shot" → "fall" → "end"
  let fallVel = 0;
  let shotTimer = 0;

  // ── Texte cinématique ─────────────────────────────────────────────────────
  const caption = add([
    text("", { size: 16, width: 600 }),
    pos(center().x, height() - 50),
    anchor("center"),
    color(255, 255, 255),
    opacity(0),
    fixed(), z(10),
  ]);

  function showCaption(txt, duration, cb) {
    caption.text = txt;
    tween(0, 1, 0.5, (v) => (caption.opacity = v));
    wait(duration - 0.5, () => {
      tween(1, 0, 0.5, (v) => (caption.opacity = v));
      if (cb) wait(0.5, cb);
    });
  }

  // ── Humain — apparaît plus tard ───────────────────────────────────────────
  const human = add([
    rect(22, 38),
    pos(750, height() - 90),
    color(230, 190, 150),
    opacity(0),
  ]);

  // Flash de tir
  const muzzle = add([
    rect(width(), height()),
    color(255, 255, 200),
    opacity(0),
    fixed(), z(50),
  ]);

  // ── Séquence cinématique ──────────────────────────────────────────────────
  // Acte 1 : vol libre — sentiment de liberté (3s)
  showCaption("Tu es au sommet. Le ciel t'appartient.", 3, () => {

    // Acte 2 : l'humain apparaît (2s)
    tween(0, 1, 1, (v) => (human.opacity = v));
    showCaption("Mais quelque chose bouge en bas...", 2.5, () => {

      // Acte 3 : coup de feu — flash brutal
      phase = "shot";
      tween(0, 0.8, 0.08, (v) => (muzzle.opacity = v), easings.linear);
      tween(0.8, 0, 0.15, (v) => (muzzle.opacity = v), easings.linear);

      showCaption("💥", 0.5, () => {

        // Acte 4 : l'aigle tombe
        phase = "fall";
        showCaption("L'humain ne fait pas partie de la chaîne.\nIl est extérieur à elle — et il la brise.", 4, () => {

          // Acte 5 : fondu au noir → écran de fin
          const blackout = add([
            rect(width(), height()),
            color(0, 0, 0),
            opacity(0),
            fixed(), z(90),
          ]);
          tween(0, 1, 1.5, (v) => (blackout.opacity = v));
          wait(1.5, () => go("end"));
        });
      });
    });
  });

  // ── Boucle de mise à jour cinématique ────────────────────────────────────
  onUpdate(() => {
    t += dt();

    if (phase === "fly") {
      // Vol paisible en S
      eagle.pos.x = 60  + t * 60;
      eagle.pos.y = 180 + Math.sin(t * 1.2) * 50;
      // Reboucle sur l'écran
      if (eagle.pos.x > width() + 40) eagle.pos.x = -40;
    }

    if (phase === "shot") {
      // L'aigle s'arrête net — secousse
      eagle.pos.x += Math.sin(t * 80) * 3;
      eagle.pos.y += Math.sin(t * 80) * 3;
      shotTimer += dt();
      if (shotTimer > 0.3) phase = "fall";
    }

    if (phase === "fall") {
      // Chute avec rotation — l'aigle tombe
      fallVel += dt() * 300;
      eagle.pos.y += fallVel * dt();
      eagle.angle  = Math.min(eagle.angle + dt() * 120, 110); // tourne sur lui-même
      eagle.color   = rgb(180, 100, 30);
    }
  });
});

// ── Lancement ────────────────────────────────────────────────────────────────
go("1");