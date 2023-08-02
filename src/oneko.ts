// oneko.js: https://github.com/adryd325/oneko.js

type SpriteSet = [number, number][];
type SpriteSets = {
  [key: string]: SpriteSet;
}

export class Cat {
  private nekoEl = document.createElement("div");
  private isReduced = window.matchMedia(`(prefers-reduced-motion: reduce)`) && window.matchMedia(`(prefers-reduced-motion: reduce)`).matches === true;
  private nekoPosX: number = 32;
  private nekoPosY: number = 32;
  private mousePosX: number = 0;
  private mousePosY: number = 0;
  private frameCount: number = 0;
  private idleTime: number = 0;
  private idleAnimation: string = null;
  private idleAnimationFrame: number = 0;
  private avalibleIdleAnimations: string[] = ["sleeping", "scratchSelf"];
  private nekoSpeed: number = 10;
  private spriteSets: SpriteSets = {
    idle: [[-3, -3]],
    alert: [[-7, -3]],
    scratchSelf: [
      [-5, 0],
      [-6, 0],
      [-7, 0],
    ],
    scratchWallN: [
      [0, 0],
      [0, -1],
    ],
    scratchWallS: [
      [-7, -1],
      [-6, -2],
    ],
    scratchWallE: [
      [-2, -2],
      [-2, -3],
    ],
    scratchWallW: [
      [-4, 0],
      [-4, -1],
    ],
    tired: [[-3, -2]],
    sleeping: [
      [-2, 0],
      [-2, -1],
    ],
    N: [
      [-1, -2],
      [-1, -3],
    ],
    NE: [
      [0, -2],
      [0, -3],
    ],
    E: [
      [-3, 0],
      [-3, -1],
    ],
    SE: [
      [-5, -1],
      [-5, -2],
    ],
    S: [
      [-6, -3],
      [-7, -2],
    ],
    SW: [
      [-5, -3],
      [-6, -1],
    ],
    W: [
      [-4, -2],
      [-4, -3],
    ],
    NW: [
      [-1, 0],
      [-1, -1],
    ],
  };
  
  constructor() {
    if (this.isReduced) {
      return;
    }
    this.create();
  }

  private create() {
    this.nekoEl.id = "oneko";
    this.nekoEl.style.width = "32px";
    this.nekoEl.style.height = "32px";
    this.nekoEl.style.position = "fixed";
    this.nekoEl.style.pointerEvents = "none";
    this.nekoEl.style.backgroundImage = "url('./oneko.gif')";
    this.nekoEl.style.imageRendering = "pixelated";
    this.nekoEl.style.left = `${this.nekoPosX - 16}px`;
    this.nekoEl.style.top = `${this.nekoPosY - 16}px`;
    this.nekoEl.style.zIndex = ''+Number.MAX_VALUE;

    document.body.appendChild(this.nekoEl);

    document.onmousemove = (event) => {
      this.mousePosX = event.clientX;
      this.mousePosY = event.clientY;
    };

    (window as any)['onekoInterval'] = setInterval(this.frame.bind(this), 100);
  }

  private resetIdleAnimation() {
    this.idleAnimation = null;
    this.idleAnimationFrame = 0;
  }

  private idle() {
    this.idleTime += 1;

    // every ~ 20 seconds
    if (
      this.idleTime > 10 &&
      Math.floor(Math.random() * 200) == 0 &&
      this.idleAnimation == null
    ) {
      if (this.nekoPosX < 32) {
        this.avalibleIdleAnimations.push("scratchWallW");
      }
      if (this.nekoPosY < 32) {
        this.avalibleIdleAnimations.push("scratchWallN");
      }
      if (this.nekoPosX > window.innerWidth - 32) {
        this.avalibleIdleAnimations.push("scratchWallE");
      }
      if (this.nekoPosY > window.innerHeight - 32) {
        this.avalibleIdleAnimations.push("scratchWallS");
      }
      this.idleAnimation =
      this.avalibleIdleAnimations[
          Math.floor(Math.random() * this.avalibleIdleAnimations.length)
        ];
    }

    switch (this.idleAnimation) {
      case "sleeping":
        if (this.idleAnimationFrame < 8) {
          this.setSprite("tired", 0);
          break;
        }
        this.setSprite("sleeping", Math.floor(this.idleAnimationFrame / 4));
        if (this.idleAnimationFrame > 192) {
          this.resetIdleAnimation();
        }
        break;
      case "scratchWallN":
      case "scratchWallS":
      case "scratchWallE":
      case "scratchWallW":
      case "scratchSelf":
        this.setSprite(this.idleAnimation, this.idleAnimationFrame);
        if (this.idleAnimationFrame > 9) {
          this.resetIdleAnimation();
        }
        break;
      default:
        this.setSprite("idle", 0);
        return;
    }
    this.idleAnimationFrame += 1;
  }

  private frame() {
    this.frameCount += 1;
    const diffX = this.nekoPosX - this.mousePosX;
    const diffY = this.nekoPosY - this.mousePosY;
    const distance = Math.sqrt(diffX ** 2 + diffY ** 2);

    if (distance < this.nekoSpeed || distance < 48) {
      this.idle();
      return;
    }

    this.idleAnimation = null;
    this.idleAnimationFrame = 0;

    if (this.idleTime > 1) {
      this.setSprite("alert", 0);
      // count down after being alerted before moving
      this.idleTime = Math.min(this.idleTime, 7);
      this.idleTime -= 1;
      return;
    }

    let direction;
    direction = diffY / distance > 0.5 ? "N" : "";
    direction += diffY / distance < -0.5 ? "S" : "";
    direction += diffX / distance > 0.5 ? "W" : "";
    direction += diffX / distance < -0.5 ? "E" : "";
    this.setSprite(direction, this.frameCount);

    this.nekoPosX -= (diffX / distance) * this.nekoSpeed;
    this.nekoPosY -= (diffY / distance) * this.nekoSpeed;

    this.nekoPosX = Math.min(Math.max(16, this.nekoPosX), window.innerWidth - 16);
    this.nekoPosY = Math.min(Math.max(16, this.nekoPosY), window.innerHeight - 16);

    this.nekoEl.style.left = `${this.nekoPosX - 16}px`;
    this.nekoEl.style.top = `${this.nekoPosY - 16}px`;
  }

  private setSprite(name: string, frame: number) {
    const sprite = this.spriteSets[name][frame % this.spriteSets[name].length];
    this.nekoEl.style.backgroundPosition = `${sprite[0] * 32}px ${sprite[1] * 32}px`;
  }
}

const cat = new Cat();