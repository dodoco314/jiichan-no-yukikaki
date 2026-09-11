import { soundMgr } from '../engine/SoundManager';
import { GameManager } from '../game/GameManager';

export class UIManager {
  private game: GameManager;

  private dayTitleEl!: HTMLElement;
  private timeTextEl!: HTMLElement;
  private clearPercentEl!: HTMLElement;
  private targetPercentEl!: HTMLElement;
  private staminaFillEl!: HTMLElement;
  private staminaTextEl!: HTMLElement;
  private scoreTextEl!: HTMLElement;
  private triviaBannerEl!: HTMLElement;

  private btnRest!: HTMLButtonElement;
  private btnToolShovel!: HTMLButtonElement;
  private btnToolDump!: HTMLButtonElement;

  private supportContainerEl!: HTMLElement;
  private supportBtnMap: Map<string, { btn: HTMLButtonElement; statusEl: HTMLElement }> = new Map();

  private overlayVignetteEl!: HTMLElement;
  private titleOverlayEl!: HTMLElement;

  constructor(game: GameManager) {
    this.game = game;
    this.bindDOM();
    this.initSupportButtons();
    // Register self so GameManager can call initSupportButtons on day change
    this.game.setUIManager(this);
  }

  private bindDOM() {
    this.dayTitleEl = document.getElementById('ui-day-title')!;
    this.timeTextEl = document.getElementById('ui-time-text')!;
    this.clearPercentEl = document.getElementById('ui-clear-percent')!;
    this.targetPercentEl = document.getElementById('ui-target-percent')!;
    this.staminaFillEl = document.getElementById('ui-stamina-fill')!;
    this.staminaTextEl = document.getElementById('ui-stamina-text')!;
    this.scoreTextEl = document.getElementById('ui-score-text')!;
    this.triviaBannerEl = document.getElementById('ui-column-trivia')!;

    this.btnRest = document.getElementById('btn-rest') as HTMLButtonElement;
    this.btnToolShovel = document.getElementById('btn-tool-shovel') as HTMLButtonElement;
    this.btnToolDump = document.getElementById('btn-tool-dump') as HTMLButtonElement;

    this.supportContainerEl = document.getElementById('ui-support-container')!;
    this.overlayVignetteEl = document.getElementById('ui-fatigue-vignette')!;
    this.titleOverlayEl = document.getElementById('title-screen-overlay')!;

    // Sound Mute Toggle
    const btnMute = document.getElementById('btn-sound-toggle');
    btnMute?.addEventListener('click', () => {
      const isMuted = soundMgr.toggleMute();
      btnMute.textContent = isMuted ? '🔇 Sound OFF' : '🔊 Sound ON';
    });

    // Tool Switcher Buttons
    this.btnToolShovel?.addEventListener('click', () => {
      this.game.player.setTool('SHOVEL');
      this.updateToolButtons();
    });

    this.btnToolDump?.addEventListener('click', () => {
      this.game.player.setTool('DUMP');
      this.updateToolButtons();
    });

    // Rest Button (starts safe porch resting with tea)
    this.btnRest?.addEventListener('click', () => {
      this.game.player.startRest();
    });

    // Start Game Button
    document.getElementById('btn-start-game')?.addEventListener('click', () => {
      this.titleOverlayEl.style.display = 'none';
      this.game.startNewGame();
    });

    // Show highscore on title screen
    const hsRecord = this.game.endingModal.getHighScore();
    const hsScoreEl = document.getElementById('title-hs-score');
    const hsDetailEl = document.getElementById('title-hs-detail');
    if (hsScoreEl && hsRecord.highScore > 0) {
      hsScoreEl.textContent = `${hsRecord.highScore} P`;
      if (hsDetailEl) {
        hsDetailEl.textContent = `最大${hsRecord.maxDay}日目到達 / 累計排雪 ${Math.floor(hsRecord.totalSnowClearedKg)}kg (${hsRecord.date})`;
      }
    } else if (hsScoreEl) {
      hsScoreEl.textContent = 'まだ記録なし';
    }
  }

  private updateToolButtons() {
    if (this.game.player.currentTool === 'SHOVEL') {
      this.btnToolShovel.classList.add('active');
      this.btnToolDump.classList.remove('active');
    } else {
      this.btnToolShovel.classList.remove('active');
      this.btnToolDump.classList.add('active');
    }
  }

  public initSupportButtons() {
    this.supportContainerEl.innerHTML = '';
    this.supportBtnMap.clear();

    for (const opt of this.game.supportSystem.options) {
      const btn = document.createElement('button');
      btn.className = 'support-card-btn';
      btn.type = 'button';

      btn.innerHTML = `
        <div class="support-header">
          <span class="support-icon">${opt.icon}</span>
          <span class="support-name">${opt.name}</span>
        </div>
        <div class="support-sub">${opt.sub}</div>
        <div class="support-status">助けを呼ぶ 📢</div>
      `;

      const statusEl = btn.querySelector('.support-status') as HTMLElement;

      btn.addEventListener('click', (e) => {
        e.preventDefault();
        this.game.supportSystem.triggerSupport(opt.id, this.game.player, this.game.snowGrid);
      });

      this.supportContainerEl.appendChild(btn);
      this.supportBtnMap.set(opt.id, { btn, statusEl });
    }
  }

  public update() {
    if (this.game.state === 'TITLE') {
      this.titleOverlayEl.style.display = 'flex';
      return;
    } else {
      this.titleOverlayEl.style.display = 'none';
    }

    const currentDay = this.game.days[this.game.currentDayIndex];
    if (currentDay) {
      this.dayTitleEl.textContent = currentDay.title;
      this.targetPercentEl.textContent = `${currentDay.targetClearPercent}%`;
      this.triviaBannerEl.innerHTML = `🌾 ${currentDay.columnTrivia}`;
    }

    // Time & Clearance Percent
    this.timeTextEl.textContent = `${this.game.timeRemaining}s`;
    const currentClearance = this.game.snowGrid.getClearancePercent();
    this.clearPercentEl.textContent = `${currentClearance}%`;
    this.scoreTextEl.textContent = `${this.game.score} P`;

    // Rest Button Status Update
    if (this.game.player.hasBackPain) {
      this.btnRest.textContent = '💥 腰痛発症中！【休憩】で回復！';
      this.btnRest.classList.add('pulse-alert');
    } else if (this.game.player.isResting) {
      this.btnRest.textContent = '🍵 休憩中...（回復中）';
      this.btnRest.classList.remove('pulse-alert');
    } else {
      this.btnRest.textContent = '🍵 休憩する（お茶を飲む）';
      this.btnRest.classList.remove('pulse-alert');
    }

    // Stamina Bar & Heart Life Counter
    const stamina = Math.max(0, Math.floor(this.game.player.stamina));
    this.staminaFillEl.style.width = `${stamina}%`;

    const remainingLife = Math.max(0, this.game.player.maxFaintCount - this.game.player.faintCount);
    const hearts = '❤️'.repeat(remainingLife) + '🖤'.repeat(this.game.player.faintCount);
    this.staminaTextEl.textContent = `HP ${stamina}% | 限界ライフ: ${hearts}`;

    if (stamina < 25) {
      this.staminaFillEl.style.backgroundColor = '#f44336'; // Red
      this.overlayVignetteEl.classList.add('active-low-stamina');
    } else if (stamina < 60) {
      this.staminaFillEl.style.backgroundColor = '#ff9800'; // Orange
      this.overlayVignetteEl.classList.remove('active-low-stamina');
    } else {
      this.staminaFillEl.style.backgroundColor = '#4caf50'; // Green
      this.overlayVignetteEl.classList.remove('active-low-stamina');
    }

    // Update Support Buttons state
    this.updateSupportButtons();
    this.updateToolButtons();
  }


  private updateSupportButtons() {
    for (const opt of this.game.supportSystem.options) {
      const entry = this.supportBtnMap.get(opt.id);
      if (!entry) continue;

      let statusText = '';
      let isDisabled = false;

      if (opt.usedToday && opt.id !== 'neighbor') {
        statusText = '本日の要請完了';
        isDisabled = true;
      } else if (opt.remainingCooldown > 0) {
        statusText = `待機中 (${Math.ceil(opt.remainingCooldown)}s)`;
        isDisabled = true;
      } else {
        statusText = '助けを呼ぶ 📢';
      }

      if (entry.btn.disabled !== isDisabled) {
        entry.btn.disabled = isDisabled;
      }
      if (entry.statusEl.textContent !== statusText) {
        entry.statusEl.textContent = statusText;
      }
    }
  }
}

