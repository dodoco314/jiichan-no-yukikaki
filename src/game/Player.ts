import { soundMgr } from '../engine/SoundManager';
import { PixelArt } from '../engine/PixelArt';
import type { ToolType } from '../types';

export class Player {
  public x: number;
  public y: number;
  public shovelX: number;
  public shovelY: number;

  public stamina: number = 100.0;
  public maxStamina: number = 100.0;
  public isResting: boolean = false;
  public state: 'IDLE' | 'SHOVEL' | 'EXHAUSTED' | 'FAINTED' = 'IDLE';

  // Tool & Back pain state
  public currentTool: ToolType = 'SHOVEL';
  public hasBackPain: boolean = false;
  public backPainTimer: number = 0;
  private continuousShovelFrames: number = 0;

  // Faint & Overwork Exhaustion Counters (Heart limit: 3 lives)
  public faintCount: number = 0;
  public maxFaintCount: number = 3;
  private wasFainted: boolean = false;

  private animFrame: number = 0;
  private breathTimer: number = 0;
  private heartbeatTimer: number = 0;

  constructor(startX: number, startY: number) {
    this.x = startX;
    this.y = startY;
    this.shovelX = startX;
    this.shovelY = startY + 20;
  }

  public reset(startX: number, startY: number) {
    this.x = startX;
    this.y = startY;
    this.shovelX = startX;
    this.shovelY = startY + 20;
    this.stamina = 100.0;
    this.isResting = false;
    this.state = 'IDLE';
    this.hasBackPain = false;
    this.backPainTimer = 0;
    this.continuousShovelFrames = 0;
    this.faintCount = 0;
    this.wasFainted = false;
  }

  public setTool(tool: ToolType) {
    this.currentTool = tool;
  }

  // Shovel radius & stamina drain based on current tool
  public getShovelRadius(): number {
    return this.currentTool === 'DUMP' ? 44 : 26;
  }

  public getStaminaDrain(): number {
    return this.currentTool === 'DUMP' ? 0.26 : 0.14;
  }

  // Trigger safe rest on porch
  public startRest() {
    this.isResting = true;
    this.hasBackPain = false;
    this.backPainTimer = 0;
    soundMgr.playTeaSlurp();
  }

  // Update Grandpa state & physical drag resistance
  public update(targetMouseX: number, targetMouseY: number, isDragging: boolean) {
    this.animFrame++;

    if (this.stamina <= 0) {
      if (!this.wasFainted) {
        this.faintCount++;
        this.wasFainted = true;
        soundMgr.playBreath();
      }
      this.state = 'FAINTED';
      this.stamina = 0;
      return;
    } else {
      this.wasFainted = false;
    }

    if (isDragging) {
      this.isResting = false;
      this.continuousShovelFrames++;

      // Overwork Risk: Back pain accident (ギックリ腰) if shoveling non-stop for > 7 seconds
      if (this.continuousShovelFrames > 420 && !this.hasBackPain) {
        if (Math.random() < 0.01) {
          this.hasBackPain = true;
          this.backPainTimer = 240; // 4 seconds of heavy back agony
          soundMgr.playBreath();
        }
      }
    } else {
      this.continuousShovelFrames = 0;
    }

    // Check if resting: smoothly guide Grandpa back to the safe porch/yard (never on road!)
    if (this.isResting) {
      this.state = 'IDLE';
      this.stamina = Math.min(this.maxStamina, this.stamina + 0.45); // restore stamina while resting
      this.hasBackPain = false;
      this.backPainTimer = 0;

      // Walk safely to the house entrance porch (x: 400, y: 270)
      const targetRestX = 400;
      const targetRestY = 270;
      this.x += (targetRestX - this.x) * 0.06;
      this.y += (targetRestY - this.y) * 0.06;
      this.shovelX = this.x + 18;
      this.shovelY = this.y + 12;

      if (this.stamina >= this.maxStamina) {
        this.isResting = false;
      }
      return;
    }

    // Heartbeat Warning Sound when stamina is dangerously low
    if (this.stamina < 22 && this.state !== 'FAINTED') {
      this.heartbeatTimer++;
      if (this.heartbeatTimer >= 48) {
        soundMgr.playHeartbeat();
        this.heartbeatTimer = 0;
      }
    }

    // Back Pain Timer Countdown
    if (this.hasBackPain) {
      this.backPainTimer--;
      if (this.backPainTimer <= 0) {
        this.hasBackPain = false;
      }
    }

    // Stamina-based movement responsiveness (Heavy Drag Feel / つらさの体感演出)
    const staminaRatio = Math.max(0, this.stamina / this.maxStamina);
    let lerpFactor = 0.04 + staminaRatio * 0.31; // Normal range: 0.04 to 0.35

    if (this.currentTool === 'DUMP') {
      lerpFactor *= 0.72; // Snowdump is heavy
    }

    if (this.hasBackPain) {
      lerpFactor = 0.02; // Heavy back agony slows Grandpa to crawl
    }

    // Shovel follows mouse with fatigue inertia
    this.shovelX += (targetMouseX - this.shovelX) * lerpFactor;
    this.shovelY += (targetMouseY - this.shovelY) * lerpFactor;

    // === Boundary clamp: 公道(470)より手前までは自由に、実際に道路上・路肩に差し込む動作は許可(475まで) ===
    this.shovelY = Math.max(190, Math.min(this.shovelY, 475));
    this.shovelX = Math.max(30, Math.min(this.shovelX, 770));

    // Grandpa walks towards shovel position
    const dx = this.shovelX - this.x;
    const dy = this.shovelY - 40 - this.y;
    this.x += dx * (this.hasBackPain ? 0.03 : 0.08);
    this.y += dy * (this.hasBackPain ? 0.03 : 0.08);

    // Hard clamp on Grandpa's position: feet must NEVER touch road
    this.y = Math.max(210, Math.min(this.y, 400));
    this.x = Math.max(40, Math.min(this.x, 760));

    // State determination
    if (this.stamina < 25) {
      this.state = 'EXHAUSTED';
    } else if (isDragging) {
      this.state = 'SHOVEL';
    } else {
      this.state = 'IDLE';
    }

    // Stamina consumption while shoveling
    if (isDragging && this.state === 'SHOVEL') {
      const drain = this.getStaminaDrain();
      this.stamina = Math.max(0, this.stamina - drain);
    }

    // Heavy breathing audio feedback
    if (this.state === 'EXHAUSTED' || this.hasBackPain) {
      this.breathTimer++;
      if (this.breathTimer % 60 === 0) {
        soundMgr.playBreath();
      }
      this.heartbeatTimer++;
      if (this.heartbeatTimer % 40 === 0) {
        soundMgr.playHeartbeat();
      }
    }
  }

  // Restore stamina (from tea / neighbor help)
  public restoreStamina(amount: number) {
    this.stamina = Math.min(this.maxStamina, this.stamina + amount);
    this.hasBackPain = false;
    this.backPainTimer = 0;
    if (this.state === 'FAINTED' && this.stamina > 0) {
      this.state = 'IDLE';
    }
  }

  public render(ctx: CanvasRenderingContext2D) {
    PixelArt.drawGrandpa(ctx, this.x, this.y, this.state, this.animFrame);

    // Draw Overhead Mini HP Bar for Grandpa
    if (this.state !== 'FAINTED') {
      PixelArt.drawOverheadHpBar(ctx, this.x, this.y, this.stamina, this.maxStamina);
    }

    // Fainted Warning Bubble (💔 過労ダウン!)
    if (this.state === 'FAINTED') {
      ctx.save();
      ctx.fillStyle = '#b71c1c';
      ctx.fillRect(this.x - 70, this.y - 65, 140, 26);
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(this.x - 70, this.y - 65, 140, 26);
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 12px sans-serif';
      ctx.fillText(`💔 過労ダウン (${this.faintCount}/${this.maxFaintCount})`, this.x - 62, this.y - 48);
      ctx.restore();
    } else if (this.isResting) {
      // Resting on Porch Bubble (🍵 縁側でお茶休憩中)
      ctx.save();
      ctx.fillStyle = 'rgba(2, 132, 199, 0.9)';
      ctx.fillRect(this.x - 85, this.y - 72, 170, 26);
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(this.x - 85, this.y - 72, 170, 26);
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 11px sans-serif';
      ctx.fillText('🍵 縁側で休憩中... (笹団子で回復)', this.x - 80, this.y - 55);
      ctx.restore();
    } else if (this.hasBackPain) {
      ctx.save();
      ctx.fillStyle = '#d32f2f';
      ctx.fillRect(this.x - 50, this.y - 70, 100, 24);
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(this.x - 50, this.y - 70, 100, 24);
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 12px sans-serif';
      ctx.fillText('💥 ウッ...腰が...!', this.x - 44, -54 + this.y);
      ctx.restore();
    }

    // Draw shovel cursor / shovel ring
    if (this.state !== 'FAINTED') {
      ctx.save();
      ctx.strokeStyle = this.hasBackPain ? '#d32f2f' : this.state === 'EXHAUSTED' ? '#f44336' : '#ffd54f';
      ctx.lineWidth = 2;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      const radius = this.getShovelRadius();
      ctx.arc(this.shovelX, this.shovelY, radius, 0, Math.PI * 2);
      ctx.stroke();

      // Tool Icon overlay
      ctx.fillStyle = this.currentTool === 'DUMP' ? '#00bcd4' : '#ffb300';
      ctx.fillRect(this.shovelX - 8, this.shovelY - 8, 16, 16);
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 10px monospace';
      ctx.fillText(this.currentTool === 'DUMP' ? 'ダンプ' : '角スコ', this.shovelX - 14, this.shovelY + 20);
      ctx.restore();
    }
  }
}

