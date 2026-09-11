import { soundMgr } from '../engine/SoundManager';
import { PixelArt } from '../engine/PixelArt';
import { Player } from './Player';

export class RoofHazard {
  public instability: number = 0; // 0.0 to 1.0
  public warningActive: boolean = false;
  public warningTimer: number = 0;
  public warningDurationSec: number = 2.5; // 2.5 seconds warning
  public avalancheTriggered: boolean = false;

  // Burial animation state
  public isBuried: boolean = false;
  public buriedX: number = 0;
  public buriedY: number = 0;
  public burialTimer: number = 0;

  // Falling snow chunk Y animation
  private fallingSnowY: number = 0;
  private isSnowFalling: boolean = false;

  // Eaves danger zone boundaries
  private eavesYStart: number = 180;
  private eavesYEnd: number = 260;

  private warningX: number = 400; // center of current hazard

  public reset() {
    this.instability = 0;
    this.warningActive = false;
    this.warningTimer = 0;
    this.avalancheTriggered = false;
    this.isBuried = false;
    this.buriedX = 0;
    this.buriedY = 0;
    this.burialTimer = 0;
    this.isSnowFalling = false;
  }

  // Called whenever shoveling occurs in eaves zone
  public registerShovelAction(shovelX: number, shovelY: number, enabled: boolean) {
    if (!enabled || this.isBuried) return;

    if (shovelY >= this.eavesYStart && shovelY <= this.eavesYEnd) {
      this.instability += 0.04;
      this.warningX = shovelX;

      if (this.instability >= 1.0 && !this.warningActive) {
        this.warningActive = true;
        this.warningTimer = this.warningDurationSec * 60; // frames
        soundMgr.playWarningCreak();
      }
    } else {
      // Slowly decay instability when shoveling elsewhere
      this.instability = Math.max(0, this.instability - 0.002);
    }
  }

  public update(player: Player, enabled: boolean): 'NONE' | 'AVALANCHE_HIT' {
    if (!enabled) return 'NONE';

    // Handle Burial Death Sequence Timer (倒れて埋もれる演出を見せてからゲームオーバーへ)
    if (this.isBuried) {
      this.burialTimer--;
      if (this.burialTimer <= 0) {
        return 'AVALANCHE_HIT';
      }
      return 'NONE';
    }

    if (this.isSnowFalling) {
      this.fallingSnowY += 12; // Falling fast down
      if (this.fallingSnowY > 320) {
        this.isSnowFalling = false;
      }
    }

    if (this.warningActive) {
      this.warningTimer--;

      if (this.warningTimer % 30 === 0) {
        soundMgr.playWarningCreak();
      }

      if (this.warningTimer <= 0) {
        // Avalanche falls!
        soundMgr.playAvalanche();
        this.warningActive = false;
        this.instability = 0;
        this.avalancheTriggered = true;
        this.isSnowFalling = true;
        this.fallingSnowY = this.eavesYStart;

        // Check hit with player
        const hitDistance = Math.abs(player.x - this.warningX);
        if (hitDistance < 120 && player.y < this.eavesYEnd + 60) {
          player.state = 'FAINTED';
          this.isBuried = true;
          this.buriedX = player.x;
          this.buriedY = player.y;
          this.burialTimer = 110; // 1.8 seconds burial animation sequence
        }
      }
    }

    return 'NONE';
  }

  public render(ctx: CanvasRenderingContext2D, enabled: boolean) {
    if (!enabled) return;

    // Render Burial Scene if player got hit and buried under avalanche
    if (this.isBuried) {
      PixelArt.drawBuryInSnow(ctx, this.buriedX, this.buriedY, Date.now() * 0.05);
      return;
    }

    // Instability Indicator over Roof Eaves
    if (this.instability > 0.3 && !this.warningActive) {
      ctx.save();
      ctx.fillStyle = `rgba(255, 152, 0, ${this.instability * 0.7})`;
      ctx.fillRect(this.warningX - 60, this.eavesYStart - 10, 120, 6);
      ctx.restore();
    }

    // Active Falling Warning (ポロポロ落ちる雪 + 拡大する影 + 警告マーク)
    if (this.warningActive) {
      ctx.save();

      const progress = 1.0 - this.warningTimer / (this.warningDurationSec * 60);

      // 1. Expanding Danger Shadow on Ground
      const shadowRadius = 40 + progress * 50;
      ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
      ctx.beginPath();
      ctx.ellipse(this.warningX, this.eavesYStart + 50, shadowRadius, 20, 0, 0, Math.PI * 2);
      ctx.fill();

      // 2. Dripping Snow Flakes (ポロポロ落下)
      ctx.fillStyle = '#ffffff';
      for (let i = 0; i < 5; i++) {
        const dropY = this.eavesYStart + ((Date.now() * 0.3 + i * 40) % 60);
        ctx.fillRect(this.warningX - 30 + i * 15, dropY, 4, 6);
      }

      // 3. Flashing Warning Banner
      if (Math.floor(Date.now() / 200) % 2 === 0) {
        ctx.fillStyle = '#f44336';
        ctx.font = 'bold 16px sans-serif';
        ctx.fillText('⚠️ 屋根からの落雪注意！避難してください！', this.warningX - 140, this.eavesYStart - 20);
      }

      ctx.restore();
    }

    // Render Falling Snow Avalanche Block (落下中の巨大雪塊)
    if (this.isSnowFalling) {
      ctx.save();
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.ellipse(this.warningX, this.fallingSnowY, 70, 35, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }
}

