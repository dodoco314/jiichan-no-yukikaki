export class MannerSystem {
  public complaintMessage: string | null = null;
  public complaintTimer: number = 0;
  public totalMannerViolations: number = 0;
  public isCarAccidentTriggered: boolean = false;
  private violationCooldown: number = 0;

  public reset() {
    this.complaintMessage = null;
    this.complaintTimer = 0;
    this.totalMannerViolations = 0;
    this.isCarAccidentTriggered = false;
    this.violationCooldown = 0;
  }

  public checkManner(_shovelX: number, _shovelY: number, isStreetZone: boolean): number {
    if (this.violationCooldown > 0) return 0;

    if (isStreetZone) {
      this.totalMannerViolations++;
      this.violationCooldown = 60; // 1 second cooldown between warnings

      if (this.totalMannerViolations >= 3) {
        this.isCarAccidentTriggered = true;
        this.complaintMessage = '💥 道路への違法投雪により車がスリップ事故発生！作業中止命令！';
        this.complaintTimer = 300;
        return -200;
      }

      this.complaintMessage = `🚨 道路への排雪禁止！警告(${this.totalMannerViolations}/3) 車のスリップ事故に繋がります!`;
      this.complaintTimer = 180; // 3 seconds
      return -80; // Deduction penalty
    }
    return 0;
  }

  public update() {
    if (this.violationCooldown > 0) {
      this.violationCooldown--;
    }
    if (this.complaintTimer > 0) {
      this.complaintTimer--;
      if (this.complaintTimer === 0) {
        this.complaintMessage = null;
      }
    }
  }

  public render(ctx: CanvasRenderingContext2D) {
    if (this.complaintMessage) {
      ctx.save();
      const flash = Math.floor(Date.now() / 150) % 2 === 0;
      ctx.fillStyle = flash ? 'rgba(213, 0, 0, 0.95)' : 'rgba(183, 28, 28, 0.9)';
      ctx.fillRect(80, 460, 640, 36);
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.strokeRect(80, 460, 640, 36);
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 13px sans-serif';
      ctx.fillText(this.complaintMessage, 95, 483);
      ctx.restore();
    }
  }
}

