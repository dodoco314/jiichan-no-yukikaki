import { soundMgr } from '../engine/SoundManager';
import { PixelArt } from '../engine/PixelArt';
import type { SupportOption } from '../types';
import { SnowGrid } from './SnowGrid';
import { Player } from './Player';

export class SupportSystem {
  /** 当日選ばれた3つのオプション（UI表示・操作対象） */
  public options: SupportOption[] = [];
  public requestScreenShake: boolean = false;

  /** 全6種類のマスターリスト */
  private readonly allOptions: Omit<SupportOption, 'remainingCooldown' | 'usedToday'>[] = [
    {
      id: 'neighbor',
      name: '近所の佐藤さん',
      sub: '温かいお茶（体力+40）',
      icon: '🍵',
      cooldownSec: 20,
      description: '近所の佐藤さんがお茶を持って駆けつけ、体力を即時+40回復します。',
    },
    {
      id: 'grandson',
      name: '帰省した孫',
      sub: '高速自動除雪（5秒）',
      icon: '👦',
      cooldownSec: 30,
      description: '孫が帰省してお手伝い！じいちゃんの周囲の雪を自動で勢いよく除雪してくれます。',
    },
    {
      id: 'snowplow',
      name: '豪快ラッセル除雪車',
      sub: '玄関前＆道路一括除雪',
      icon: '🚜',
      cooldownSec: 0,
      description: '大迫力の除雪車がアプローチと道路の雪を一気にドカンと排雪してくれます！',
    },
    {
      id: 'melting_pipe',
      name: '新潟名物・消雪パイプ',
      sub: '井戸水散水融雪（8秒）',
      icon: '🚿',
      cooldownSec: 35,
      description: '道路や通路に井戸水を噴射し、中央エリアの雪をじわじわ溶かします。',
    },
    {
      id: 'tonjiru',
      name: '熱々豚汁の差し入れ',
      sub: '体力大幅回復（+80）',
      icon: '🍲',
      cooldownSec: 40,
      description: '具だくさんの熱々豚汁で体力大幅回復＆疲労を吹き飛ばします。',
    },
    {
      id: 'volunteer',
      name: '除雪ボランティア',
      sub: '範囲除雪（8秒後）',
      icon: '🤝',
      cooldownSec: 0,
      description: '青年ボランティアを呼びます。広範囲の雪を一気に片付けてくれます。',
    },
    {
      id: 'safety_rope',
      name: '命綱（安全帯）の結束',
      sub: '転落防止アンカー',
      icon: '🪢',
      cooldownSec: 0,
      description: '命綱を棟の固定金具に結束！屋根からの滑落事故を一度だけ防ぎます。',
    },
  ];

  public hasSafetyRope: boolean = false;

  // Active help animations & timers
  private activeVolunteerTimer: number = 0;
  private activeVolunteerCountdown: number = 0;
  private volunteerMessage: string = '';

  private activeSnowplowX: number = -100;
  private isSnowplowActive: boolean = false;

  private activeNeighborTimer: number = 0;

  // New Support Timers
  private activeGrandsonTimer: number = 0;
  private grandsonX: number = 400;
  private grandsonY: number = 320;

  private activeMeltingPipeTimer: number = 0;
  private activeTonjiruTimer: number = 0;

  constructor() {
    this.resetDay(1);
  }

  public resetDay(dayNumber: number = 1) {
    this.hasSafetyRope = false;

    if (dayNumber === 2) {
      // Day 2 (Roof stage): Guarantee safety_rope plus 2 random options
      const ropeOpt = this.allOptions.find((o) => o.id === 'safety_rope')!;
      const otherOptions = this.allOptions.filter((o) => o.id !== 'safety_rope' && o.id !== 'snowplow' && o.id !== 'melting_pipe');
      const shuffled = [...otherOptions].sort(() => Math.random() - 0.5);
      const picked = [ropeOpt, shuffled[0], shuffled[1]];

      this.options = picked.map((o) => ({
        ...o,
        remainingCooldown: 0,
        usedToday: false,
      }));
    } else {
      // Day 1 & 3: Pick 3 random options from yard options
      const yardOptions = this.allOptions.filter((o) => o.id !== 'safety_rope');
      const shuffled = [...yardOptions].sort(() => Math.random() - 0.5);
      const picked = shuffled.slice(0, 3);

      this.options = picked.map((o) => ({
        ...o,
        remainingCooldown: 0,
        usedToday: false,
      }));
    }

    this.activeVolunteerTimer = 0;
    this.activeVolunteerCountdown = 0;
    this.isSnowplowActive = false;
    this.activeNeighborTimer = 0;
    this.activeGrandsonTimer = 0;
    this.activeMeltingPipeTimer = 0;
    this.activeTonjiruTimer = 0;
    this.requestScreenShake = false;
  }

  public triggerSupport(
    id: SupportOption['id'],
    player: Player,
    snowGrid: SnowGrid
  ): boolean {
    const opt = this.options.find((o) => o.id === id);
    if (!opt || opt.remainingCooldown > 0 || opt.usedToday) return false;

    soundMgr.playChime();

    if (id === 'safety_rope') {
      opt.usedToday = true;
      this.hasSafetyRope = true;
      return true;
    }

    if (id === 'neighbor') {
      opt.remainingCooldown = opt.cooldownSec;
      player.restoreStamina(40);
      this.activeNeighborTimer = 180; // 3 seconds
      return true;
    }

    if (id === 'grandson') {
      opt.remainingCooldown = opt.cooldownSec;
      this.activeGrandsonTimer = 300; // 5 seconds
      this.grandsonX = player.x + 40;
      this.grandsonY = player.y + 20;
      return true;
    }

    if (id === 'tonjiru') {
      opt.remainingCooldown = opt.cooldownSec;
      player.restoreStamina(80);
      this.activeTonjiruTimer = 240; // 4 seconds
      return true;
    }

    if (id === 'melting_pipe') {
      opt.remainingCooldown = opt.cooldownSec;
      this.activeMeltingPipeTimer = 450; // 7.5 seconds
      return true;
    }

    if (id === 'volunteer') {
      opt.usedToday = true;
      this.activeVolunteerCountdown = 8 * 60; // 8 seconds delay
      this.volunteerMessage = '除雪ボランティアへ要請中... 到着まで 8秒';
      return true;
    }

    if (id === 'snowplow') {
      opt.usedToday = true;
      this.isSnowplowActive = true;
      this.activeSnowplowX = -120;
      this.requestScreenShake = true; // Trigger Screen Shake!
      soundMgr.playSnowplow();

      // HEAVILY BUFFED SNOWPLOW: Clear street AND front driveway entrance!
      setTimeout(() => {
        snowGrid.clearRect(0, 330, 800, 220); // Huge clearing area
      }, 1000);
      return true;
    }

    return false;
  }

  public update(player: Player, snowGrid: SnowGrid) {
    // Update Cooldowns
    for (const opt of this.options) {
      if (opt.remainingCooldown > 0) {
        opt.remainingCooldown = Math.max(0, opt.remainingCooldown - 1 / 60);
      }
    }

    // 1. Volunteer Countdown
    if (this.activeVolunteerCountdown > 0) {
      this.activeVolunteerCountdown--;
      const secondsLeft = Math.ceil(this.activeVolunteerCountdown / 60);
      this.volunteerMessage = `除雪ボランティアへ要請中... 到着まで ${secondsLeft}秒`;

      if (this.activeVolunteerCountdown === 0) {
        soundMgr.playChime();
        this.activeVolunteerTimer = 240;
        snowGrid.clearRect(100, 240, 600, 200); // Clear large area
      }
    }

    if (this.activeVolunteerTimer > 0) {
      this.activeVolunteerTimer--;
    }

    // 2. Neighbor Timer
    if (this.activeNeighborTimer > 0) {
      this.activeNeighborTimer--;
    }

    // 3. Tonjiru Timer
    if (this.activeTonjiruTimer > 0) {
      this.activeTonjiruTimer--;
    }

    // 4. Grandson Active Shoveling
    if (this.activeGrandsonTimer > 0) {
      this.activeGrandsonTimer--;
      // Grandson moves around Grandpa and shovels rapidly
      const angle = (300 - this.activeGrandsonTimer) * 0.1;
      this.grandsonX = player.x + Math.cos(angle) * 60;
      this.grandsonY = player.y + Math.sin(angle) * 40;
      snowGrid.shovelAt(this.grandsonX, this.grandsonY, 35);
    }

    // 5. Melting Pipe Active Water Sprinkling
    if (this.activeMeltingPipeTimer > 0) {
      this.activeMeltingPipeTimer--;
      // Melting pipe slowly clears middle driveway (y: 380, width: 600)
      if (this.activeMeltingPipeTimer % 15 === 0) {
        const meltX = 100 + Math.random() * 600;
        snowGrid.shovelAt(meltX, 400, 40);
        snowGrid.shovelAt(meltX, 460, 40);
      }
    }

    // 6. Snowplow Vehicle Movement & Screen Shake
    if (this.isSnowplowActive) {
      this.activeSnowplowX += 8;
      if (this.activeSnowplowX > 920) {
        this.isSnowplowActive = false;
      }
    }
  }

  public render(ctx: CanvasRenderingContext2D, animFrame: number) {
    // 1. Neighbor Visual Popup
    if (this.activeNeighborTimer > 0) {
      PixelArt.drawNeighbor(ctx, 160, 240);
      ctx.save();
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(190, 190, 200, 36);
      ctx.strokeStyle = '#333333';
      ctx.strokeRect(190, 190, 200, 36);
      ctx.fillStyle = '#212121';
      ctx.font = 'bold 12px sans-serif';
      ctx.fillText('佐藤さん「無理すんなよ！温かいお茶飲みな」', 195, 212);
      ctx.restore();
    }

    // 2. Tonjiru Visual Popup
    if (this.activeTonjiruTimer > 0) {
      PixelArt.drawTonjiru(ctx, 680, 240);
      ctx.save();
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(470, 190, 200, 36);
      ctx.strokeStyle = '#880e4f';
      ctx.lineWidth = 2;
      ctx.strokeRect(470, 190, 200, 36);
      ctx.fillStyle = '#880e4f';
      ctx.font = 'bold 12px sans-serif';
      ctx.fillText('「熱々の豚汁召し上がれ！体力+80！」', 475, 212);
      ctx.restore();
    }

    // 3. Grandson Active Animation
    if (this.activeGrandsonTimer > 0) {
      PixelArt.drawGrandson(ctx, this.grandsonX, this.grandsonY, animFrame);
      ctx.save();
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(this.grandsonX - 60, this.grandsonY - 50, 120, 22);
      ctx.fillStyle = '#d84315';
      ctx.font = 'bold 11px sans-serif';
      ctx.fillText('孫「じいちゃん任せて！」', this.grandsonX - 54, this.grandsonY - 35);
      ctx.restore();
    }

    // 4. Melting Pipe Water Sprinkling Lines
    if (this.activeMeltingPipeTimer > 0) {
      PixelArt.drawMeltingPipeSpray(ctx, 80, 450, 640, animFrame);
    }

    // 5. Volunteer Visual Popup
    if (this.activeVolunteerCountdown > 0) {
      ctx.save();
      ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
      ctx.fillRect(240, 140, 320, 35);
      ctx.fillStyle = '#ffe082';
      ctx.font = 'bold 14px sans-serif';
      ctx.fillText(this.volunteerMessage, 255, 162);
      ctx.restore();
    }

    if (this.activeVolunteerTimer > 0) {
      PixelArt.drawVolunteer(ctx, 280, 340, animFrame);
      PixelArt.drawVolunteer(ctx, 480, 340, animFrame + 10);
      ctx.save();
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(320, 270, 220, 32);
      ctx.strokeStyle = '#2e7d32';
      ctx.lineWidth = 2;
      ctx.strokeRect(320, 270, 220, 32);
      ctx.fillStyle = '#2e7d32';
      ctx.font = 'bold 13px sans-serif';
      ctx.fillText('「じいちゃん！ここは俺達にまかせて！」', 325, 291);
      ctx.restore();
    }

    // 6. Heavily Buffed Snowplow Vehicle Animation & Spray
    if (this.isSnowplowActive) {
      PixelArt.drawSnowplow(ctx, this.activeSnowplowX, 470, 'right');
      ctx.save();
      ctx.fillStyle = '#ff3d00';
      ctx.fillRect(this.activeSnowplowX - 140, 390, 260, 30);
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.strokeRect(this.activeSnowplowX - 140, 390, 260, 30);
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 13px sans-serif';
      ctx.fillText('【豪快除雪車】道路・玄関前を大爆進排雪！', this.activeSnowplowX - 130, 410);
      ctx.restore();
    }
  }
}
