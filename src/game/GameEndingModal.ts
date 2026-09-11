import type { GameOverReason, HighScoreRecord } from '../types';

export class GameEndingModal {
  private containerEl: HTMLElement | null = null;

  public show(
    reason: GameOverReason,
    dayCompleted: number,
    clearancePercent: number,
    totalSnowKg: number,
    highScore: number,
    onRestart: () => void
  ) {
    this.hide();

    const newsDataMap: Record<GameOverReason, { tag: string; headline: string; subtitle: string; cause: string; isSuccess: boolean }> = {
      COMPLETED_ALL: {
        tag: '【快挙・除雪完了】',
        headline: '豪雪を乗り越え生活動線を死守！地域支え合いの勝利',
        subtitle: '一人暮らしの高齢者が周囲と連携し、全日程の安全確保に成功',
        cause: 'お助けシステム（近隣・ボランティア・除雪車）の活用と無理のない体力管理が功を奏しました。',
        isSuccess: true,
      },
      TIME_UP: {
        tag: '【緊急速報・作業断念】',
        headline: '日没と暴風雪により除雪断念…生活動線が埋没し孤立状態に',
        subtitle: '一人では時間内に退けきれず…デイサービス等への外出経路も遮断',
        cause: '降り積もる雪のペースに追いつけませんでした。一人で抱え込まず、早めの支援要請が必要です。',
        isSuccess: false,
      },
      STAMINA_EXHAUSTED: {
        tag: '【事故速報・緊急搬送】',
        headline: '新潟県内 80代男性が除雪中に心疾患・過労で倒れ救急搬送',
        subtitle: '「無理して一人で全部やろうとしてしまった…」寒冷下の激しい肉体労働が限界に',
        cause: '氷点下の過酷な環境での連続作業により心身が限界を超えました。こまめな休憩とお茶での休息が不可欠です。',
        isSuccess: false,
      },
      ROOF_AVALANCHE: {
        tag: '【重大事故・落雪直撃】',
        headline: '軒下での作業中に屋根の雪庇（せっぴ）が直撃！生き埋め事故発生',
        subtitle: '新潟の克雪住宅でも屋根の落雪は凶器。毎年多数の高齢者が被災',
        cause: '屋根の雪の緩み・揺れを見落として軒下に留まり続けました。軒下作業時は常に頭上の警戒が必要です。',
        isSuccess: false,
      },
      ROOF_FALL: {
        tag: '【重大事故・高所転落】',
        headline: '屋根の雪下ろし中に軒先から転落…新潟県内 80代男性重傷',
        subtitle: '「命綱をつけていなかった…」冬季の高齢者除雪事故で最も死亡率の高い悲惨な実態',
        cause: '屋根の端（雪庇）を踏み抜いて地上へ滑落しました。屋根雪下ろしは命綱・ヘルメット着用と、地上からの見守りが絶対に必要です。',
        isSuccess: false,
      },
      STREET_CAR_ACCIDENT: {
        tag: '【警察指導・作業中止】',
        headline: '公道への違法投雪により走行車両がスリップ衝突事故！',
        subtitle: '道路交通法第110条違反により警察出動・厳重注意および除雪作業中止命令',
        cause: '公道に雪を排雪したため、走行中の車両のタイヤがスリップしました。雪は必ず指定の雪捨て場に運ばなければなりません。',
        isSuccess: false,
      },
    };

    const info = newsDataMap[reason];

    const modalOverlay = document.createElement('div');
    modalOverlay.id = 'ending-modal-overlay';
    modalOverlay.className = 'modal-overlay';

    const card = document.createElement('div');
    card.className = `ending-card ${info.isSuccess ? 'ending-success' : 'ending-disaster'}`;

    card.innerHTML = `
      <!-- Emergency News Headline Banner -->
      <div class="news-bulletin-header ${info.isSuccess ? 'news-success' : 'news-alert'}">
        <span class="news-badge">${info.tag}</span>
        <h2 class="news-title">${info.headline}</h2>
        <p class="news-sub">${info.subtitle}</p>
      </div>

      <!-- Accident Cause & Lesson -->
      <div class="news-cause-box">
        <strong>📋 現場の状況と分析:</strong> ${info.cause}
      </div>

      <!-- Game Stats Grid -->
      <div class="ending-stats">
        <div class="stat-box">
          <span class="stat-label">到達日数</span>
          <span class="stat-val">${dayCompleted} 日目</span>
        </div>
        <div class="stat-box">
          <span class="stat-label">本日の除雪完了率</span>
          <span class="stat-val">${clearancePercent}%</span>
        </div>
        <div class="stat-box">
          <span class="stat-label">今回排雪した雪の量</span>
          <span class="stat-val">${Math.floor(totalSnowKg)} kg</span>
        </div>
        <div class="stat-box">
          <span class="stat-label">ハイスコア</span>
          <span class="stat-val highlight-gold">${highScore} P</span>
        </div>
      </div>

      <!-- Real Social Context -->
      <div class="social-message-box">
        <h3>❄️ ゲーム体験から、新潟の豪雪の現実に目を向ける</h3>
        <p class="social-text">
          新潟県内では毎年、<strong>除雪作業中に命を落としたり重傷を負う高齢者が後を絶ちません（事故の約8割が65歳以上）</strong>。
        </p>
        <p class="social-text highlight">
          「一人で無理をしないこと」「疲れたら休むこと」「そして周囲やボランティアを頼ること」。<br />
          豪雪地帯において、地域で支え合う『共助』は人の命を守る最後の砦です。
        </p>
      </div>

      <!-- Official Support Links -->
      <div class="support-info-box">
        <h4>🤝 私たちにできること・新潟県内の主な除雪支援制度</h4>
        <ul>
          <li><strong>にいがた雪かき隊（新潟県地域振興課）:</strong> 県内外のボランティアが過疎・高齢化集落の除雪を支援</li>
          <li><strong>各市町村の高齢者等除雪支援事業:</strong> 一人暮らし高齢者世帯への屋根雪下ろし助成金や間口除雪支援</li>
          <li><strong>近隣での声かけ・見守り活動:</strong> 異変の早期発見（ポストに新聞が溜まっていないか等）</li>
        </ul>
      </div>

      <!-- Actions -->
      <div class="ending-actions">
        <button id="btn-restart-game" class="btn-primary">もう一度雪かきに挑む 🔄</button>
        <button id="btn-share-score" class="btn-secondary">結果をシェア・啓発コピー 📋</button>
      </div>
    `;

    modalOverlay.appendChild(card);
    document.body.appendChild(modalOverlay);
    this.containerEl = modalOverlay;

    document.getElementById('btn-restart-game')?.addEventListener('click', () => {
      this.hide();
      onRestart();
    });

    document.getElementById('btn-share-score')?.addEventListener('click', () => {
      const text = `【じいちゃんの雪かき】新潟の豪雪・高齢者除雪体験ゲーム\n結末: ${info.tag} ${info.headline}\n到達: ${dayCompleted}日目 / 排雪量: ${Math.floor(totalSnowKg)}kg (スコア: ${highScore}P)\n高齢者の除雪負担と地域共助の重要性を体感しよう！ #じいちゃんの雪かき #新潟デジコン`;
      navigator.clipboard.writeText(text).then(() => {
        alert('結果とメッセージをクリップボードにコピーしました！');
      });
    });
  }

  public hide() {
    if (this.containerEl) {
      this.containerEl.remove();
      this.containerEl = null;
    }
  }

  public getHighScore(): HighScoreRecord {
    const raw = localStorage.getItem('yukikaki_highscore');
    if (!raw) return { highScore: 0, maxDay: 1, totalSnowClearedKg: 0, date: '' };
    try {
      return JSON.parse(raw);
    } catch {
      return { highScore: 0, maxDay: 1, totalSnowClearedKg: 0, date: '' };
    }
  }

  public saveHighScore(score: number, day: number, totalSnowKg: number): HighScoreRecord {
    const prev = this.getHighScore();
    if (score > prev.highScore) {
      const rec: HighScoreRecord = {
        highScore: score,
        maxDay: Math.max(prev.maxDay, day),
        totalSnowClearedKg: prev.totalSnowClearedKg + totalSnowKg,
        date: new Date().toLocaleDateString('ja-JP'),
      };
      localStorage.setItem('yukikaki_highscore', JSON.stringify(rec));
      return rec;
    }
    return prev;
  }
}
