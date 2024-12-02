let angle = 0;
let fontSize = 48;
let growing = true;
let colors = [];
let glowAmount = 0;
let glowIncreasing = true;
let fireworks = [];
let launchSound;
let explosionSound;
let started = false;

function preload() {
  soundFormats('mp3');
  launchSound = loadSound('assets/launch.mp3');
  explosionSound = loadSound('assets/explosion.mp3');
}

// 煙火粒子類
class Particle {
  constructor(x, y, color, isFirework, isSpiral = false) {
    this.pos = createVector(x, y);
    this.isFirework = isFirework;
    this.isSpiral = isSpiral;
    this.color = color;
    this.lifespan = 255;
    this.spiralAngle = 0;
    
    if (this.isFirework) {
      this.vel = createVector(0, random(-10, -8));
    } else if (this.isSpiral) {
      const angle = random(TWO_PI);
      const mag = random(2, 5);
      this.vel = createVector(cos(angle) * mag, sin(angle) * mag);
    } else {
      const angle = random(TWO_PI);
      const mag = random(1, 4);
      this.vel = createVector(cos(angle) * mag, sin(angle) * mag);
    }
    this.acc = createVector(0, 0);
  }

  update() {
    if (!this.isFirework) {
      if (this.isSpiral) {
        // 旋轉效果
        this.spiralAngle += 0.1;
        let spiralRadius = 2;
        this.vel.x += cos(this.spiralAngle) * spiralRadius;
        this.vel.y += sin(this.spiralAngle) * spiralRadius;
        this.vel.mult(0.95);
      }
      this.vel.mult(0.85);
      this.lifespan -= 6;
    }
    this.vel.add(createVector(0, 0.15));
    this.pos.add(this.vel);
  }

  done() {
    return this.lifespan <= 0;
  }

  show() {
    if (!this.isFirework) {
      strokeWeight(this.isSpiral ? 3 : 2);
      stroke(red(this.color), green(this.color), blue(this.color), this.lifespan);
    } else {
      strokeWeight(4);
      stroke(this.color);
    }
    point(this.pos.x, this.pos.y);
  }
}

// 煙火類
class Firework {
  constructor(x) {
    const fireworkColor = random(colors);
    this.firework = new Particle(x, height, fireworkColor, true);
    this.exploded = false;
    this.particles = [];
    this.isSpiral = random() < 0.3; // 30% 機率是旋轉煙火
  }

  done() {
    return this.exploded && this.particles.length === 0;
  }

  update() {
    if (!this.exploded) {
      this.firework.update();
      if (this.firework.vel.y >= 0) {
        this.exploded = true;
        this.explode();
      }
    }

    for (let i = this.particles.length - 1; i >= 0; i--) {
      this.particles[i].update();
      if (this.particles[i].done()) {
        this.particles.splice(i, 1);
      }
    }
  }

  explode() {
    if (started && explosionSound) {
      explosionSound.play();
    }
    const particleCount = this.isSpiral ? 50 : 30;
    for (let i = 0; i < particleCount; i++) {
      const p = new Particle(
        this.firework.pos.x, 
        this.firework.pos.y, 
        this.firework.color, 
        false,
        this.isSpiral
      );
      this.particles.push(p);
    }
  }

  show() {
    if (!this.exploded) {
      this.firework.show();
    }
    for (let particle of this.particles) {
      particle.show();
    }
  }
}

function setup() {
  createCanvas(1200, 800);
  textAlign(CENTER, CENTER);
  colorMode(RGB);
  frameRate(30);
  
  if (launchSound && explosionSound) {
    launchSound.setVolume(0.3);
    explosionSound.setVolume(0.3);
  }
  
  colors = [
    color(0, 71, 157),    // 淡江藍
    color(255, 90, 95),   // 珊瑚紅
    color(255, 190, 11),  // 金黃色
    color(45, 149, 150),  // 青綠色
    color(255, 255, 0),   // 明黃色
  ];
  
  textStyle(BOLD); 

  let startButton = createButton('點擊開始');
  startButton.position(width/2 - 50, height/2);
  startButton.mousePressed(() => {
    userStartAudio().then(() => {
      started = true;
      startButton.hide();  
    });
  });
}

function draw() {
  background(0, 35);
  
  if (!started) {
    fill(255);
    textSize(32);
    text('請點擊開始按鈕', width/2, height/2 - 50);
    return;
  }

  // 學號姓名
  push();
  fill(255);
  textAlign(LEFT, TOP);
  textSize(24);
  textStyle(NORMAL);
  text("413730267 伍志倫", 20, 20);
  pop();

  // 提示文字
  push();
  fill(255);
  textAlign(RIGHT, TOP);
  textSize(24);
  textStyle(NORMAL);
  text("左鍵發射煙火", width - 20, 20);
  pop();
  
  // 更新和顯示煙火
  for (let i = fireworks.length - 1; i >= 0; i--) {
    fireworks[i].update();
    fireworks[i].show();
    if (fireworks[i].done()) {
      fireworks.splice(i, 1);
    }
  }

  // 控制發光效果
  if (glowIncreasing) {
    glowAmount += 0.5;
    if (glowAmount > 20) glowIncreasing = false;
  } else {
    glowAmount -= 0.5;
    if (glowAmount < 5) glowIncreasing = true;
  }
  
  // 控制文字大小
  if (growing) {
    fontSize += 0.2;
    if (fontSize > 54) growing = false;
  } else {
    fontSize -= 0.2;
    if (fontSize < 48) growing = true;
  }
  
  // 繪製主標題
  push();
  translate(width/2, height/2);
  rotate(sin(angle) * 0.05);
  
  // 發光效果
  for (let i = 0; i < 10; i += 2) {
    fill(255, 255, 255, 255 - i * 20);
    textSize(fontSize + i);
    text("淡江大學", 0, -80);
    text("教育科技學系", 0, 80);
  }
  
  // 彩虹文字效果
  for (let i = 0; i < "淡江大學".length; i++) {
    fill(colors[i % colors.length]);
    textSize(fontSize);
    text("淡江大學".charAt(i), 
         -120 + i * 60 + sin(angle + i) * 5,
         -80 + cos(angle + i) * 3);
  }
  
  for (let i = 0; i < "教育科技學系".length; i++) {
    fill(colors[(i + 2) % colors.length]);
    textSize(fontSize);
    text("教育科技學系".charAt(i), 
         -180 + i * 60 + sin(angle + i) * 5,
         80 + cos(angle + i) * 3);
  }
  pop();
  
  angle += 0.05;
}

function mousePressed() {
  if (!started) return;
  
  if (mouseButton === LEFT && fireworks.length < 10) {
    if (started && launchSound) {
      launchSound.play();
    }
    fireworks.push(new Firework(mouseX));
  }
} 