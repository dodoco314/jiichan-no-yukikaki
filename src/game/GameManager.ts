import { soundMgr } from '../engine/SoundManager';
import { PixelArt } from '../engine/PixelArt';
import type { DayConfig, GameOverReason, GameState } from '../types';
import { SnowGrid } from './SnowGrid';
import { Player } from './Player';
import { RoofHazard } from './RoofHazard';
import { SupportSystem } from './SupportSystem';
import { MannerSystem } from './MannerSystem';
import { GameEndingModal } from './GameEndingModal';

export class GameManager {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;

  public state: GameState = 'TITLE';
  public currentDayIndex: number = 0;
  public timeRemaining: number = 90;
  public score: number = 0;
  public totalSnowClearedKg: number = 0;

  // Day Definitions
  public days: DayConfig[] = [
    {
      day: 1,
      title: '1日目: しんしんと降る初雪 (玄関アプローチ)',
      stageLocation: 'YARD',
      morningQuote: 'おぉ…しんしんと降ったなぁ。まずは玄関前ば開けんば。',
      targetClearPercent: 70,
      timeLimitSec: 70,
      snowFallRate: 0,
      blizzardIntensity: 0.1,
      roofHazardEnabled: false,
      snowType: 'POWDER',
      columnTrivia: '【新潟除雪豆知識】新雪（粉雪）は軽いうちに退けるのが鉄則！放置すると固まって重くなります。',
      description: 'まずは自宅玄関前を開けましょう。体力が減ったら「休憩」するか助けを頼んでください。',
    },
    {
      day: 2,
      title: '2日目: 命がけの屋根雪下ろし (急勾配・転落危機)',
      stageLocation: 'ROOF',
      morningQuote: 'うわぁ…屋根の雪がせり出してきとる…！倒壊する前に命がけで下ろさんば…！',
      targetClearPercent: 75,
      timeLimitSec: 80,
      snowFallRate: 2,
      blizzardIntensity: 0.4,
      roofHazardEnabled: false,
      snowType: 'WET',
      columnTrivia: '【新潟除雪豆知識】除雪死傷事故の半数以上が「屋根からの転落」！命綱・ヘルメット着用と2人以上での見守りが鉄則。',
      description: '大雪で屋根が倒壊寸前！屋根に登って雪を落とします。軒先（雪庇）を踏み抜くと即転落！命綱を必ず結束しましょう。',
    },
    {
      day: 3,
      title: '3日目: 猛吹雪と落雪危機 (庭・公道の総力戦)',
      stageLocation: 'YARD',
      morningQuote: 'なんちゅう猛吹雪だ…！昨日落とした雪と合わさって庭が埋まってもうた…！誰か助けてくれー！',
      targetClearPercent: 80,
      timeLimitSec: 85,
      snowFallRate: 6,
      blizzardIntensity: 1.0,
      roofHazardEnabled: true,
      snowType: 'COMPACT',
      columnTrivia: '【新潟除雪豆知識】昨日屋根から落とした雪が庭に山積み！屋根雪庇の落雪直撃にも注意！',
      description: '昨日落とした屋根の雪山＋猛吹雪で庭が埋没！近所やボランティア総出で生活動線を死守しましょう！',
    },
  ];

  public snowGrid: SnowGrid;
  public player: Player;
  public roofHazard: RoofHazard;
  public supportSystem: SupportSystem;
  public mannerSystem: MannerSystem;
  public endingModal: GameEndingModal;

  private isDragging: boolean = false;
  private mousePos = { x: 400, y: 350 };
  private animFrame: number = 0;

  // Toki (朱鷺) animation state
  private tokiX: number = -60;
  private tokiY: number = 50;
  private isTokiActive: boolean = false;
  private tokiTimer: number = 0;

  // Car passing animation state (公道を走る車)
  private carX: number = -60;
  private carY: number = 505; // middle of street zone
  private isCarActive: boolean = false;
  private carDirection: 'left' | 'right' = 'right';
  private carTimer: number = 0; // countdown until next car
  private carSpeed: number = 3;

  // UIManager reference for day transitions
  private uiManager: { initSupportButtons: () => void } | null = null;

  // Snowflakes particles
  private snowflakes: { x: number; y: number; speed: number; size: number }[] = [];

  // Falling snow chunks off roof (for Day 2)
  private snowDrops: { x: number; y: number; size: number; alpha: number }[] = [];
  private roofSlipMessage: string | null = null;
  private roofSlipMessageTimer: number = 0;

  // Morning Day Intro & Ending state
  private dayStartTimer: number = 0;
  private lastGameOverReason: GameOverReason | null = null;

  // ===じいちゃんのリアルタイム方言セリフシステム===
  private grandpaQuote: string | null = null;
  private grandpaQuoteTimer: number = 0;
  private lastQuoteTrigger: string = '';
  private quoteCheckInterval: number = 0;

  // 状況別セリフリスト（新潟方言）
  private readonly quotes = {
    highStamina: [
      '「よーし！今日も気合い入れっぞ！」',
      '「こんくらいの雪、なんも怖くないね！」',
      '「シャバシャバ雪じゃ！退けるのが早いうちよ！」',
    ],
    lowStamina: [
      '「ゼーハー…腰がいてぇ…ちょっと休まんとあかんかな」',
      '「年には勝てんのう…無理すると後で大変だぞ…」',
      '「はぁはぁ…誰かに頼もうかの…恥ずかしくないぞ」',
    ],
    criticalStamina: [
      '「💔 もう…限界か…誰か…頼む…」',
      '「ウッ…倒れる前に…佐藤さん呼んでくれ…」',
    ],
    bigSnow: [
      '「なんちゅう降りぐあいだ…！こりゃ大変だ！」',
      '「去年よりひどいぞ…全部退けられるか…」',
    ],
    timeWarning: [
      '「急がんと暗くなってしまうぞ！」',
      '「日が暮れる前に終わらせんば！焦らず丁寧に！」',
    ],
    roofWarning: [
      '「うわ…軒先が怖いのう…足元に気をつけんと…」',
      '「命綱つけたか？絶対に外れちゃだめだぞ！」',
    ],
    clearProgress: [
      '「だいぶ退けてきたのう！あとひとふんばり！」',
      '「よし！いい調子だ！もう少しで開通するぞ！」',
    ],
    dayStart: [
      '「さてと、今日も始めっか…」',
      '「よいしょ！腰が重いのう…」',
    ],
    roofEdge: [
      '「ひぃ！危ない！端に近づかんとくれ！」',
      '「この高さはやっぱり怖いのう…気をつけんとな」',
    ],
  };

  // === NHK風緊急気象テロップ ===
  private telop: string | null = null;
  private telopX: number = 800;
  private telopTimer: number = 0;
  private telopInterval: number = 0;

  private readonly telopMessages = [
    '【気象情報】新潟県魚沼・上越地方に大雪警報発令中。不要不急の外出はお控えください。',
    '【除雪注意】屋根からの落雪・転落事故が相次いでいます。作業は必ず2人以上で行いましょう。',
    '【新潟県広報】一人暮らしの高齢者への見守りをお願いします。「除雪SOS」は市町村窓口へ。',
    '【道路情報】国道17号・8号線で積雪のためチェーン規制中。スタッドレスタイヤ装着でも注意を。',
    '【健康情報】雪かき作業は思わぬ重労働です。30分ごとに休憩し、温かい飲み物で体を温めましょう。',
    '【地域支援】ボランティアによる除雪支援を希望される方は「にいがた雪かき隊」までご連絡ください。',
    '【生活情報】消雪パイプの取水源（地下水）が減少しています。節水にご協力ください。',
  ];
  private telopIndex: number = 0;

  // === コンボシステム ===
  private comboCount: number = 0;
  private comboTimer: number = 0;
  private comboMessage: string | null = null;
  private comboMessageTimer: number = 0;
  private lastComboX: number = 400;
  private lastComboY: number = 300;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    const context = canvas.getContext('2d');
    if (!context) throw new Error('Could not get 2D context');
    this.ctx = context;

    this.snowGrid = new SnowGrid(canvas.width, canvas.height);
    this.player = new Player(400, 320);
    this.roofHazard = new RoofHazard();
    this.supportSystem = new SupportSystem();
    this.mannerSystem = new MannerSystem();
    this.endingModal = new GameEndingModal();

    this.initSnowflakes();
    this.setupInputs();

    // Schedule first car to appear after 20-40 seconds
    this.carTimer = 1200 + Math.floor(Math.random() * 1200);
  }

  private initSnowflakes() {
    this.snowflakes = [];
    for (let i = 0; i < 100; i++) {
      this.snowflakes.push({
        x: Math.random() * this.canvas.width,
        y: Math.random() * this.canvas.height,
        speed: 1 + Math.random() * 3,
        size: 1.5 + Math.random() * 3,
      });
    }
  }

  private setupInputs() {
    const getPos = (e: MouseEvent | TouchEvent) => {
      const rect = this.canvas.getBoundingClientRect();
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
      const rawX = Math.floor(((clientX - rect.left) / rect.width) * this.canvas.width);
      const rawY = Math.floor(((clientY - rect.top) / rect.height) * this.canvas.height);
      return {
        x: Math.max(30, Math.min(rawX, 770)),
        y: Math.max(190, Math.min(rawY, 475)), // 公道(470)への意図的な投雪までは疑わない（475=道路上まで到達可能）
      };
    };

    const handleStart = (e: MouseEvent | TouchEvent) => {
      if (this.state !== 'PLAYING') return;
      this.isDragging = true;
      this.mousePos = getPos(e);
    };

    const handleMove = (e: MouseEvent | TouchEvent) => {
      if (this.state !== 'PLAYING') return;
      this.mousePos = getPos(e);
    };

    const handleEnd = () => {
      this.isDragging = false;
    };

    this.canvas.addEventListener('mousedown', handleStart);
    this.canvas.addEventListener('mousemove', handleMove);
    window.addEventListener('mouseup', handleEnd);

    this.canvas.addEventListener('touchstart', (e) => {
      handleStart(e);
      e.preventDefault();
    }, { passive: false });
    this.canvas.addEventListener('touchmove', (e) => {
      handleMove(e);
      e.preventDefault();
    }, { passive: false });
    window.addEventListener('touchend', handleEnd);
  }

  public startNewGame() {
    this.currentDayIndex = 0;
    this.score = 0;
    this.totalSnowClearedKg = 0;
    this.startDay(0);
  }

  public startDay(dayIdx: number) {
    this.currentDayIndex = dayIdx;
    const dayConfig = this.days[dayIdx];
    this.timeRemaining = dayConfig.timeLimitSec;
    this.snowGrid.reset(1.0);
    this.snowGrid.snowType = dayConfig.snowType; // Set visual snow type for this day
    this.player.reset(400, 320);
    this.roofHazard.reset();
    this.mannerSystem.reset();
    this.supportSystem.resetDay(dayIdx + 1); // Pass day number (Day 2 gets safety_rope)
    this.snowDrops = [];
    this.roofSlipMessage = null;
    this.roofSlipMessageTimer = 0;

    // Day 3 special continuity: Yesterday's dropped roof snow is now piled up in the yard!
    if (dayIdx === 2) {
      this.snowGrid.addRoofDroppedSnowPiles();
    }

    this.state = 'DAY_START';
    this.dayStartTimer = 150; // 2.5 seconds morning introduction
    soundMgr.playCurtain();
    soundMgr.startBGM();
    soundMgr.setBlizzardIntensity(dayConfig.blizzardIntensity);

    // Re-initialize support buttons for new day selection
    this.uiManager?.initSupportButtons();

    // Trigger Toki flyby at day start
    this.triggerToki();
  }

  /** Register UIManager so startDay can refresh support buttons */
  public setUIManager(ui: { initSupportButtons: () => void }) {
    this.uiManager = ui;
  }

  private triggerToki() {
    this.isTokiActive = true;
    this.tokiX = -50;
    this.tokiY = 40 + Math.random() * 40;
  }

  // Screen Shake Effect State
  private screenShakeTimer: number = 0;
  private shakeIntensity: number = 0;

  public triggerScreenShake(durationFrames: number = 30, intensity: number = 8) {
    this.screenShakeTimer = durationFrames;
    this.shakeIntensity = intensity;
  }

  public update() {
    this.animFrame++;

    // Update gentle winter music box BGM
    soundMgr.updateBGM(this.player.stamina < 25);

    // Morning Introduction Transition
    if (this.state === 'DAY_START') {
      this.dayStartTimer--;
      if (this.dayStartTimer <= 0) {
        this.state = 'PLAYING';
        // Day start quote
        this.triggerGrandpaQuote('dayStart');
      }
      return; // Freeze game actions during morning curtain opening
    }

    if (this.state !== 'PLAYING') return;

    // === Update Grandpa Quote System ===
    if (this.grandpaQuoteTimer > 0) {
      this.grandpaQuoteTimer--;
      if (this.grandpaQuoteTimer === 0) this.grandpaQuote = null;
    }
    this.quoteCheckInterval++;
    if (this.quoteCheckInterval >= 300) { // Every 5 seconds
      this.quoteCheckInterval = 0;
      this.updateGrandpaQuote();
    }

    // === Update NHK-Style Telop ===
    if (this.telopTimer > 0) {
      this.telopX -= 2.5;
      this.telopTimer--;
      if (this.telopTimer === 0) {
        this.telop = null;
        this.telopInterval = 600 + Math.floor(Math.random() * 600); // 10-20s break
      }
    } else if (this.telopInterval > 0) {
      this.telopInterval--;
    } else if (this.telop === null) {
      // Start new telop
      this.telop = this.telopMessages[this.telopIndex % this.telopMessages.length];
      this.telopIndex++;
      this.telopX = this.canvas.width + 10;
      this.telopTimer = Math.ceil((this.canvas.width + this.telop.length * 14 + 50) / 2.5);
    }

    // Check for Screen Shake trigger from Support System (Snowplow)
    if (this.supportSystem.requestScreenShake) {
      this.supportSystem.requestScreenShake = false;
      this.triggerScreenShake(50, 10);
    }

    // Update Toki Flying animation
    if (this.isTokiActive) {
      this.tokiX += 2.2;
      this.tokiY += Math.sin(this.animFrame * 0.05) * 0.4;
      if (this.tokiX > this.canvas.width + 60) {
        this.isTokiActive = false;
        this.tokiTimer = 600 + Math.random() * 600; // Next flyby in 10-20 sec
      }
    } else if (this.tokiTimer > 0) {
      this.tokiTimer--;
      if (this.tokiTimer <= 0) {
        this.triggerToki();
      }
    }

    // Update snowflakes animation
    const blizzard = this.days[this.currentDayIndex]?.blizzardIntensity || 0.1;
    for (const flake of this.snowflakes) {
      flake.y += flake.speed * (1 + blizzard * 1.5);
      flake.x += Math.sin(this.animFrame * 0.05) + blizzard * 2;
      if (flake.y > this.canvas.height) {
        flake.y = -10;
        flake.x = Math.random() * this.canvas.width;
      }
    }

    // Update car passing animation (車の通過アニメ)
    if (this.isCarActive) {
      this.carX += this.carDirection === 'right' ? this.carSpeed : -this.carSpeed;
      const isGone = this.carDirection === 'right'
        ? this.carX > this.canvas.width + 80
        : this.carX < -80;
      if (isGone) {
        this.isCarActive = false;
        // Next car: 30〖60 seconds (overcast rural pace)
        this.carTimer = 1800 + Math.floor(Math.random() * 1800);
      }
    } else if (this.state === 'PLAYING') {
      this.carTimer--;
      if (this.carTimer <= 0) {
        this.isCarActive = true;
        this.carDirection = Math.random() < 0.5 ? 'right' : 'left';
        this.carX = this.carDirection === 'right' ? -80 : this.canvas.width + 80;
        this.carSpeed = 2.5 + Math.random() * 1.5;
      }
    }

    if (this.state !== 'PLAYING') return;

    const dayConfig = this.days[this.currentDayIndex];

    // Freeze player input and timers if player is currently buried under roof avalanche (4-second impact freeze)
    if (this.roofHazard.isBuried) {
      const hazardStatus = this.roofHazard.update(this.player, true);
      if (hazardStatus === 'AVALANCHE_HIT') {
        this.snowGrid.addAvalancheSnow(this.player.x, 180);
        this.gameOver('ROOF_AVALANCHE');
      }
      return; // Freeze the rest of update during burial!
    }

    // Snow Accumulation from weather
    if (dayConfig.snowFallRate > 0 && this.animFrame % 10 === 0) {
      this.snowGrid.addSnow(dayConfig.snowFallRate);
    }

    // Update Player position & Stamina
    this.player.update(this.mousePos.x, this.mousePos.y, this.isDragging);

    // Perform Shoveling
    if (this.isDragging && this.player.state === 'SHOVEL') {
      const radius = this.player.getShovelRadius();
      const { removedKg, isDumpZone } = this.snowGrid.shovelAt(this.player.shovelX, this.player.shovelY, radius);

      if (removedKg > 0) {
        this.totalSnowClearedKg += removedKg;
        let gainedScore = Math.floor(removedKg * 2);
        if (isDumpZone) {
          gainedScore += 10; // Bonus for dumping in proper snow dump zone
        }

        // Combo System: consecutive shoveling within 2 seconds builds combo
        this.comboCount++;
        this.comboTimer = 120; // 2 second window
        const comboMult = Math.min(3.0, 1.0 + (this.comboCount - 1) * 0.1);
        gainedScore = Math.floor(gainedScore * comboMult);

        if (this.comboCount >= 5 && this.comboCount % 10 === 0) {
          // Show combo message every 10 combos
          const level = Math.floor(this.comboCount / 10);
          this.comboMessage = `🔥 ${this.comboCount} COMBO! x${comboMult.toFixed(1)}`;
          if (level >= 3) this.comboMessage = `⚡ SUPER ${this.comboCount} COMBO!! x${comboMult.toFixed(1)}`;
          this.comboMessageTimer = 90;
          this.lastComboX = this.player.shovelX;
          this.lastComboY = this.player.shovelY - 30;
        }

        this.score += gainedScore;

        if (this.animFrame % 8 === 0) {
          soundMgr.playShovel();
        }

        // On Roof Stage: if shoveling near eaves/edge, dump snow down to ground with particle effect
        if (dayConfig.stageLocation === 'ROOF') {
          if (this.player.shovelY > 410 || this.player.shovelX < 90 || this.player.shovelX > 710) {
            for (let i = 0; i < 4; i++) {
              this.snowDrops.push({
                x: this.player.shovelX + (Math.random() * 24 - 12),
                y: Math.min(this.player.shovelY + 10, 480),
                size: 2 + Math.random() * 3.5,
                alpha: 1.0,
              });
            }
            if (this.animFrame % 14 === 0) {
              soundMgr.playSnowDrop();
            }
          }
        }

        // Roof Hazard Check (Yard stages only)
        if (dayConfig.stageLocation === 'YARD') {
          this.roofHazard.registerShovelAction(
            this.player.shovelX,
            this.player.shovelY,
            dayConfig.roofHazardEnabled
          );

          // Snow Dump Manner Check: 公道の手前（路肩）で雪を掃くのはOK。公道ライン(470)に実際に差し込んだ時のみ違反
          const isStreet = this.player.shovelY > this.snowGrid.streetZone.y - 3;
          const penalty = this.mannerSystem.checkManner(this.player.shovelX, this.player.shovelY, isStreet);
          if (penalty < 0) {
            this.score = Math.max(0, this.score + penalty); // Deduct score for illegal dumping
          }

          // Check if road dumping caused a car traffic collision
          if (this.mannerSystem.isCarAccidentTriggered) {
            soundMgr.playCarBrake();
            this.triggerScreenShake(50, 12);
            this.gameOver('STREET_CAR_ACCIDENT');
            return;
          }
        }
      }
    }

    // === Day 2 Roof Stage: Slip & Fall Hazard Check ===
    if (dayConfig.stageLocation === 'ROOF') {
      // Footstep on tin roof
      if (this.isDragging && this.animFrame % 28 === 0) {
        soundMgr.playRoofCreak();
      }

      // Check if player stepped onto the dangerous snow cornice / eaves edge
      const isDangerousEaves = this.player.y >= 435 || this.player.x <= 48 || this.player.x >= 752;
      if (isDangerousEaves) {
        if (this.player.y >= 445 || this.player.x <= 40 || this.player.x >= 760) {
          if (this.supportSystem.hasSafetyRope) {
            // Safety rope catches Grandpa!
            this.supportSystem.hasSafetyRope = false;
            this.triggerScreenShake(30, 8);
            soundMgr.playRoofCreak();
            this.player.y = 350;
            this.player.x = 400;
            this.player.shovelY = 370;
            this.player.shovelX = 420;
            // 入力アンカーも中央へ戻し、端へ走り戻って再度転落しないようにする
            this.mousePos = { x: 420, y: 370 };
            this.roofSlipMessage = '🪢 命綱が作動！滑落を踏みとどまり、屋根の中央へ戻りました！（命綱消費）';
            this.roofSlipMessageTimer = 180;
          } else {
            // Fatal slip and fall from roof!
            soundMgr.playSlipFall();
            this.triggerScreenShake(60, 15);
            this.gameOver('ROOF_FALL');
            return;
          }
        }
      }
    }

    // Update snow drops particles (Day 2 falling snow)
    for (let i = this.snowDrops.length - 1; i >= 0; i--) {
      const drop = this.snowDrops[i];
      drop.y += 4;
      drop.alpha -= 0.025;
      if (drop.alpha <= 0 || drop.y > 560) {
        this.snowDrops.splice(i, 1);
      }
    }

    // Roof Slip Message Timer
    if (this.roofSlipMessageTimer > 0) {
      this.roofSlipMessageTimer--;
      if (this.roofSlipMessageTimer === 0) {
        this.roofSlipMessage = null;
      }
    }

    // Update Roof Hazard
    const hazardStatus = this.roofHazard.update(this.player, dayConfig.roofHazardEnabled);
    if (hazardStatus === 'AVALANCHE_HIT') {
      this.snowGrid.addAvalancheSnow(this.player.x, 180);
      this.gameOver('ROOF_AVALANCHE');
      return;
    }

    // Update Support System animations & timers
    this.supportSystem.update(this.player, this.snowGrid);
    this.mannerSystem.update();

    // Update Timer (1 second interval)
    if (this.animFrame % 60 === 0) {
      this.timeRemaining--;

      // Check win condition for the day
      if (this.snowGrid.getClearancePercent() >= dayConfig.targetClearPercent) {
        this.dayCleared();
        return;
      }

      // Check time out
      if (this.timeRemaining <= 0) {
        if (this.snowGrid.getClearancePercent() >= dayConfig.targetClearPercent) {
          this.dayCleared();
        } else {
          this.gameOver('TIME_UP');
        }
        return;
      }

      // Check stamina faint out limit (10 times max)
      if (this.player.faintCount >= this.player.maxFaintCount) {
        this.gameOver('STAMINA_EXHAUSTED');
        return;
      }
    }

    // Update Combo Timer (reset combo if not shoveling)
    if (!this.isDragging) {
      if (this.comboTimer > 0) {
        this.comboTimer--;
        if (this.comboTimer === 0) {
          this.comboCount = 0;
        }
      }
    }

    // Update Combo Message Timer
    if (this.comboMessageTimer > 0) {
      this.comboMessageTimer--;
      if (this.comboMessageTimer === 0) this.comboMessage = null;
    }
  }

  // === じいちゃんセリフ管理 ===
  private triggerGrandpaQuote(category: keyof typeof this.quotes) {
    if (this.grandpaQuoteTimer > 90) return; // Don't interrupt active quote
    const list = this.quotes[category];
    if (!list || list.length === 0) return;
    const q = list[Math.floor(Math.random() * list.length)];
    this.grandpaQuote = q;
    this.grandpaQuoteTimer = 220; // ~3.7 seconds
    this.lastQuoteTrigger = category;
  }

  private updateGrandpaQuote() {
    const stamina = this.player.stamina;
    const timeLeft = this.timeRemaining;
    const clearance = this.snowGrid.getClearancePercent();
    const dayConfig = this.days[this.currentDayIndex];
    const isRoof = dayConfig?.stageLocation === 'ROOF';

    // Priority triggers
    if (stamina < 15 && this.lastQuoteTrigger !== 'criticalStamina') {
      this.triggerGrandpaQuote('criticalStamina');
    } else if (stamina < 35 && this.lastQuoteTrigger !== 'lowStamina') {
      this.triggerGrandpaQuote('lowStamina');
    } else if (timeLeft <= 20 && timeLeft > 0 && this.lastQuoteTrigger !== 'timeWarning') {
      this.triggerGrandpaQuote('timeWarning');
    } else if (clearance >= 50 && clearance < 70 && this.lastQuoteTrigger !== 'clearProgress') {
      this.triggerGrandpaQuote('clearProgress');
    } else if (isRoof && (this.player.y > 410 || this.player.x < 80 || this.player.x > 720) && this.lastQuoteTrigger !== 'roofEdge') {
      this.triggerGrandpaQuote('roofEdge');
    } else if (dayConfig?.blizzardIntensity >= 0.8 && this.lastQuoteTrigger !== 'bigSnow' && Math.random() < 0.3) {
      this.triggerGrandpaQuote('bigSnow');
    } else if (stamina > 70 && Math.random() < 0.25) {
      this.triggerGrandpaQuote('highStamina');
    }
  }

  private dayCleared() {
    this.score += 600 + this.timeRemaining * 15;
    soundMgr.stopBGM();
    soundMgr.playFanfare();
    this.state = 'DAY_CLEAR';
    this.player.startRest(); // Grandpa drinks warm tea and rests

    if (this.currentDayIndex < this.days.length - 1) {
      setTimeout(() => {
        this.startDay(this.currentDayIndex + 1);
      }, 2500);
    } else {
      setTimeout(() => {
        this.gameOver('COMPLETED_ALL');
      }, 2200);
    }
  }

  private gameOver(reason: GameOverReason) {
    this.state = 'ENDING';
    this.lastGameOverReason = reason;
    soundMgr.stopBGM();
    soundMgr.stopBlizzard();

    if (reason !== 'COMPLETED_ALL') {
      soundMgr.playAmbulance();
      this.triggerScreenShake(55, 12);
    } else {
      soundMgr.playFanfare();
    }

    const currentDayNum = this.currentDayIndex + 1;
    const clearance = this.snowGrid.getClearancePercent();
    const savedRec = this.endingModal.saveHighScore(this.score, currentDayNum, this.totalSnowClearedKg);

    // Brief delay for dramatic shake/siren before showing the news bulletin modal
    setTimeout(() => {
      this.endingModal.show(
        reason,
        currentDayNum,
        clearance,
        this.totalSnowClearedKg,
        savedRec.highScore,
        () => {
          this.startNewGame();
        }
      );
    }, 900);
  }

  public render() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // Apply Screen Shake if active
    let isShaking = false;
    if (this.screenShakeTimer > 0) {
      this.screenShakeTimer--;
      isShaking = true;
      const shakeX = (Math.random() * 2 - 1) * this.shakeIntensity;
      const shakeY = (Math.random() * 2 - 1) * this.shakeIntensity;
      this.ctx.save();
      this.ctx.translate(shakeX, shakeY);
    }

    const isRoofStage = this.days[this.currentDayIndex]?.stageLocation === 'ROOF';

    if (isRoofStage) {
      // 2日目: 屋根の上ステージ背景（高所パノラマビュー、トタン屋根、見守りおばあちゃん）
      PixelArt.drawRoofStageBackground(
        this.ctx,
        this.canvas.width,
        this.canvas.height,
        this.animFrame,
        this.supportSystem.hasSafetyRope,
        this.player.x,
        this.player.y
      );

      // 屋根の上の積雪グリッド
      this.snowGrid.render(this.ctx, true);

      // 屋根から地上へ落ちる雪の塊エフェクト
      PixelArt.drawSnowDrops(this.ctx, this.snowDrops);
    } else {
      // 1日目 & 3日目: 自宅玄関・庭先・公道ステージ
      const blizzard = this.days[this.currentDayIndex]?.blizzardIntensity || 0.1;
      this.ctx.fillStyle = blizzard > 0.6 ? '#607d8b' : '#90a4ae';
      this.ctx.fillRect(0, 0, this.canvas.width, 180);

      // Render Uonuma Mountain Range (魚沼連峰の雪山背景)
      PixelArt.drawUonumaMountains(this.ctx, this.canvas.width);

      // Render Crested Ibis (トキ / 朱鷺) Flying Upper Sky
      if (this.isTokiActive) {
        PixelArt.drawToki(this.ctx, this.tokiX, this.tokiY, this.animFrame);
      }

      // Render Niigata Traditional Snow-resistant House
      PixelArt.drawHouse(
        this.ctx,
        120,
        50,
        560,
        140,
        this.roofHazard.warningActive ? 1.0 : this.roofHazard.instability
      );

      // Render Snow Grid Field (Yard & Road)
      this.snowGrid.render(this.ctx, false);

      // Render Niigata iconic Melting Pipe groundwater sprayers (消雪パイプ)
      PixelArt.drawMeltingPipes(this.ctx, this.canvas.width, this.snowGrid.streetZone.y, this.animFrame);

      // Render passing car on the public road
      if (this.isCarActive) {
        PixelArt.drawCar(this.ctx, this.carX, this.carY, this.carDirection);
      }
    }

    // Render Support Animations
    this.supportSystem.render(this.ctx, this.animFrame);

    // Render Grandpa Player
    this.player.render(this.ctx);

    // Render Tutorial Hand Indicator on Day 1 early
    if (this.currentDayIndex === 0 && this.timeRemaining > 64 && !this.isDragging) {
      this.ctx.save();
      const bounceX = 400 + Math.sin(this.animFrame * 0.1) * 30;
      this.ctx.fillStyle = '#ffffff';
      this.ctx.font = 'bold 14px sans-serif';
      this.ctx.fillText('👈 ドラッグして雪を掻く！', bounceX, 300);
      this.ctx.restore();
    }

    // Render Roof Hazard Warning Indicators (Yard stages only)
    if (!isRoofStage) {
      this.roofHazard.render(this.ctx, this.days[this.currentDayIndex]?.roofHazardEnabled || false);
      this.mannerSystem.render(this.ctx);
    }

    // Render Roof Slip Saved Message (if rope triggered)
    if (this.roofSlipMessage) {
      this.ctx.save();
      this.ctx.fillStyle = 'rgba(245, 158, 11, 0.95)';
      this.ctx.fillRect(80, 200, this.canvas.width - 160, 36);
      this.ctx.strokeStyle = '#ffffff';
      this.ctx.lineWidth = 2;
      this.ctx.strokeRect(80, 200, this.canvas.width - 160, 36);
      this.ctx.fillStyle = '#ffffff';
      this.ctx.font = 'bold 13px sans-serif';
      this.ctx.fillText(this.roofSlipMessage, 100, 223);
      this.ctx.restore();
    }

    // Render Falling Snowflakes Particles
    this.ctx.fillStyle = '#ffffff';
    for (const flake of this.snowflakes) {
      this.ctx.beginPath();
      this.ctx.arc(flake.x, flake.y, flake.size, 0, Math.PI * 2);
      this.ctx.fill();
    }

    // === Render NHK-Style Emergency Telop (下部テロップ) ===
    if (this.telop && (this.state === 'PLAYING' || this.state === 'DAY_START')) {
      const telopY = this.canvas.height - 28;
      this.ctx.save();
      // Telop background bar
      this.ctx.fillStyle = 'rgba(0, 30, 80, 0.88)';
      this.ctx.fillRect(0, telopY, this.canvas.width, 26);
      this.ctx.strokeStyle = '#ffdd00';
      this.ctx.lineWidth = 1.5;
      this.ctx.strokeRect(0, telopY, this.canvas.width, 26);
      // Station logo area
      this.ctx.fillStyle = '#cc0000';
      this.ctx.fillRect(0, telopY, 78, 26);
      this.ctx.fillStyle = '#ffffff';
      this.ctx.font = 'bold 10px sans-serif';
      this.ctx.textAlign = 'left';
      this.ctx.fillText('NNN緊急情報', 4, telopY + 17);
      // Scrolling text
      this.ctx.fillStyle = '#ffff80';
      this.ctx.font = 'bold 12px sans-serif';
      this.ctx.fillText(this.telop, this.telopX, telopY + 18);
      this.ctx.restore();
    }

    // === Render Grandpa Live Reaction Quotes (吹き出しセリフ) ===
    if (this.grandpaQuote && this.state === 'PLAYING') {
      const alpha = Math.min(1, this.grandpaQuoteTimer / 30);
      const qx = Math.max(60, Math.min(this.player.x - 100, this.canvas.width - 320));
      const qy = Math.max(30, this.player.y - 80);
      this.ctx.save();
      this.ctx.globalAlpha = alpha;
      // Bubble background
      this.ctx.fillStyle = 'rgba(255, 255, 255, 0.97)';
      this.ctx.strokeStyle = '#ffb300';
      this.ctx.lineWidth = 2.5;
      const bw = Math.min(310, this.grandpaQuote.length * 10 + 30);
      this.ctx.beginPath();
      const bx = qx, by = qy;
      this.ctx.roundRect(bx, by, bw, 32, 8);
      this.ctx.fill();
      this.ctx.stroke();
      // Tail of speech bubble
      this.ctx.fillStyle = 'rgba(255, 255, 255, 0.97)';
      this.ctx.strokeStyle = '#ffb300';
      this.ctx.lineWidth = 1.5;
      this.ctx.beginPath();
      this.ctx.moveTo(bx + 20, by + 32);
      this.ctx.lineTo(bx + 12, by + 46);
      this.ctx.lineTo(bx + 32, by + 32);
      this.ctx.closePath();
      this.ctx.fill();
      this.ctx.stroke();
      // Text
      this.ctx.fillStyle = '#1a1a1a';
      this.ctx.font = 'bold 12px sans-serif';
      this.ctx.textAlign = 'left';
      this.ctx.fillText(this.grandpaQuote, bx + 10, by + 21);
      this.ctx.restore();
    }

    // === Render Combo Message ===
    if (this.comboMessage && this.state === 'PLAYING') {
      const alpha = Math.min(1, this.comboMessageTimer / 20);
      this.ctx.save();
      this.ctx.globalAlpha = alpha;
      const cx = Math.max(60, Math.min(this.lastComboX, this.canvas.width - 200));
      const cy = this.lastComboY - (90 - this.comboMessageTimer) * 0.6;
      this.ctx.font = 'bold 18px sans-serif';
      this.ctx.textAlign = 'center';
      // Shadow
      this.ctx.fillStyle = 'rgba(0,0,0,0.6)';
      this.ctx.fillText(this.comboMessage, cx + 2, cy + 2);
      // Text
      this.ctx.fillStyle = '#ffdd00';
      this.ctx.fillText(this.comboMessage, cx, cy);
      this.ctx.restore();
    }

    // Render HP panel at canvas top-left
    if (this.state === 'PLAYING' || this.state === 'DAY_CLEAR') {
      PixelArt.drawHpPanel(
        this.ctx,
        this.player.stamina,
        this.player.maxStamina,
        this.player.faintCount,
        this.player.maxFaintCount
      );
    }

    // Day Clear Celebration Banner
    if (this.state === 'DAY_CLEAR') {
      this.ctx.save();
      this.ctx.fillStyle = 'rgba(15, 23, 42, 0.92)';
      this.ctx.fillRect(40, 190, this.canvas.width - 80, 160);
      this.ctx.strokeStyle = '#ffd54f';
      this.ctx.lineWidth = 3;
      this.ctx.strokeRect(40, 190, this.canvas.width - 80, 160);

      this.ctx.fillStyle = '#ffb74d';
      this.ctx.font = 'bold 23px sans-serif';
      this.ctx.textAlign = 'center';

      if (this.currentDayIndex === 1) {
        // Day 2 (Roof Clear) Message
        this.ctx.fillText(`🎉 2日目クリア！ 屋根の雪下ろし完了！倒壊危機を脱出！`, this.canvas.width / 2, 235);
        this.ctx.fillStyle = '#ffffff';
        this.ctx.font = 'bold 14px sans-serif';
        this.ctx.fillText('🍵 縁側でお茶を一服… ※落とした雪が明朝、庭に巨大な雪山となって立ちはだかります！', this.canvas.width / 2, 275);
      } else {
        this.ctx.fillText(`🎉 ${this.currentDayIndex + 1}日目 クリア！ 生活動線が開通しました！`, this.canvas.width / 2, 235);
        this.ctx.fillStyle = '#ffffff';
        this.ctx.font = 'bold 15px sans-serif';
        this.ctx.fillText('🍵 縁側であたたかいお茶と笹団子を一服… 体力が全回復しました', this.canvas.width / 2, 275);
      }

      this.ctx.fillStyle = '#90caf9';
      this.ctx.font = '13px sans-serif';
      this.ctx.fillText('次の大雪に備えて、少し息を整えましょう…', this.canvas.width / 2, 312);
      this.ctx.restore();
    }

    // Morning Introduction Overlay (DAY_START)
    if (this.state === 'DAY_START') {
      const progress = 1 - Math.max(0, this.dayStartTimer) / 150;
      const dayConf = this.days[this.currentDayIndex];
      PixelArt.drawMorningIntroduction(
        this.ctx,
        this.canvas.width,
        this.canvas.height,
        dayConf.day,
        dayConf.title,
        dayConf.morningQuote,
        progress
      );
    }

    // True Ending Epilogue Scene (COMPLETED_ALL)
    if (this.state === 'ENDING' && this.lastGameOverReason === 'COMPLETED_ALL') {
      PixelArt.drawEpilogueScene(this.ctx, this.canvas.width, this.canvas.height, this.animFrame);
    }

    if (isShaking) {
      this.ctx.restore();
    }
  }
}

