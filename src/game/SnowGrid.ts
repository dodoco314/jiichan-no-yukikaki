import type { SnowType } from '../types';

export class SnowGrid {
  public readonly cols: number;
  public readonly rows: number;
  public readonly cellWidth: number;
  public readonly cellHeight: number;
  public readonly startX: number;
  public readonly startY: number;
  public readonly width: number;
  public readonly height: number;

  // Snow type affects color and visual texture
  public snowType: SnowType = 'POWDER';

  // Grid storing snow density from 0.0 (cleared) to 1.0 (deep snow)
  private grid: Float32Array;
  private maxCapacity: number;

  // Designated Snow Dump Zone (自宅の雪捨て場) - e.g. Left/Right yard
  public readonly dumpZoneLeft = { x: 30, y: 320, w: 100, h: 120 };
  public readonly dumpZoneRight = { x: 670, y: 320, w: 100, h: 120 };
  // Public Street Zone (公道) - bottom road
  public readonly streetZone = { x: 0, y: 470, w: 800, h: 80 };

  constructor(
    canvasWidth: number,
    _canvasHeight: number,
    gridCols: number = 80,
    gridRows: number = 50
  ) {
    this.cols = gridCols;
    this.rows = gridRows;
    this.startX = 40;
    this.startY = 180;
    this.width = canvasWidth - 80;
    // Height stops exactly at the street zone (y=470), not into the road
    this.height = 290; // 470 - 180 = 290px (was canvasHeight-240=320 which overlapped road)

    this.cellWidth = this.width / this.cols;
    this.cellHeight = this.height / this.rows;

    this.grid = new Float32Array(this.cols * this.rows);
    this.maxCapacity = this.cols * this.rows;

    this.reset(1.0);
  }

  public reset(initialDensity: number = 1.0) {
    for (let i = 0; i < this.grid.length; i++) {
      this.grid[i] = initialDensity;
    }
  }

  // Clear snow at screen position (px, py) with radius r
  public shovelAt(px: number, py: number, radiusPx: number): { removedKg: number; isDumpZone: boolean } {
    let snowRemoved = 0;

    const startC = Math.max(0, Math.floor((px - radiusPx - this.startX) / this.cellWidth));
    const endC = Math.min(this.cols - 1, Math.ceil((px + radiusPx - this.startX) / this.cellWidth));
    const startR = Math.max(0, Math.floor((py - radiusPx - this.startY) / this.cellHeight));
    const endR = Math.min(this.rows - 1, Math.ceil((py + radiusPx - this.startY) / this.cellHeight));

    const r2 = radiusPx * radiusPx;

    for (let r = startR; r <= endR; r++) {
      for (let c = startC; c <= endC; c++) {
        const cx = this.startX + (c + 0.5) * this.cellWidth;
        const cy = this.startY + (r + 0.5) * this.cellHeight;
        const dist2 = (cx - px) * (cx - px) + (cy - py) * (cy - py);

        if (dist2 <= r2) {
          const idx = r * this.cols + c;
          const current = this.grid[idx];
          if (current > 0) {
            const removeAmt = Math.min(current, 0.45); // shovel strength
            this.grid[idx] -= removeAmt;
            snowRemoved += removeAmt * 5; // kg equivalent
          }
        }
      }
    }

    const isDumpZone =
      (px >= this.dumpZoneLeft.x && px <= this.dumpZoneLeft.x + this.dumpZoneLeft.w && py >= this.dumpZoneLeft.y && py <= this.dumpZoneLeft.y + this.dumpZoneLeft.h) ||
      (px >= this.dumpZoneRight.x && px <= this.dumpZoneRight.x + this.dumpZoneRight.w && py >= this.dumpZoneRight.y && py <= this.dumpZoneRight.y + this.dumpZoneRight.h);

    return { removedKg: snowRemoved, isDumpZone };
  }

  // Clear area for Volunteers or Snowplow
  public clearRect(x: number, y: number, w: number, h: number) {
    const startC = Math.max(0, Math.floor((x - this.startX) / this.cellWidth));
    const endC = Math.min(this.cols - 1, Math.ceil((x + w - this.startX) / this.cellWidth));
    const startR = Math.max(0, Math.floor((y - this.startY) / this.cellHeight));
    const endR = Math.min(this.rows - 1, Math.ceil((y + h - this.startY) / this.cellHeight));

    for (let r = startR; r <= endR; r++) {
      for (let c = startC; c <= endC; c++) {
        const idx = r * this.cols + c;
        this.grid[idx] = 0;
      }
    }
  }

  // Snow accumulation from snowfall
  public addSnow(rate: number) {
    const cellsToFill = Math.floor(rate);
    for (let i = 0; i < cellsToFill; i++) {
      const randomIdx = Math.floor(Math.random() * this.grid.length);
      this.grid[randomIdx] = Math.min(1.0, this.grid[randomIdx] + 0.15);
    }
  }

  // Roof Avalanche dumping heavy snow on specific area
  public addAvalancheSnow(centerX: number, widthPx: number) {
    const startC = Math.max(0, Math.floor((centerX - widthPx / 2 - this.startX) / this.cellWidth));
    const endC = Math.min(this.cols - 1, Math.ceil((centerX + widthPx / 2 - this.startX) / this.cellWidth));
    const startR = 0;
    const endR = Math.min(this.rows - 1, 15); // near house front

    for (let r = startR; r <= endR; r++) {
      for (let c = startC; c <= endC; c++) {
        const idx = r * this.cols + c;
        this.grid[idx] = 1.0; // max snow pile
      }
    }
  }

  // Calculate snow clearance percentage
  public getClearancePercent(): number {
    let totalSnow = 0;
    for (let i = 0; i < this.grid.length; i++) {
      totalSnow += this.grid[i];
    }
    const clearedRatio = 1.0 - totalSnow / this.maxCapacity;
    return Math.max(0, Math.min(100, Math.floor(clearedRatio * 100)));
  }

  // Add extra dense snow piles dropped from the roof (for Day 3)
  public addRoofDroppedSnowPiles() {
    for (let r = 0; r < this.rows; r++) {
      for (let c = 0; c < this.cols; c++) {
        // Deep snow banks along left/right eaves and house base
        if (c < 20 || c > this.cols - 21 || r < 14) {
          this.grid[r * this.cols + c] = 1.0;
        }
      }
    }
  }

  // Render Snow Field
  public render(ctx: CanvasRenderingContext2D, isRoofStage: boolean = false) {
    ctx.save();

    if (!isRoofStage) {
      // Ground Base (Dark stone / Asphalt walkway underneath)
      ctx.fillStyle = '#37474f';
      ctx.fillRect(this.startX, this.startY, this.width, this.height);

      // Driveway paving tiles detail
      ctx.strokeStyle = '#263238';
      ctx.lineWidth = 1;
      for (let x = this.startX; x < this.startX + this.width; x += 40) {
        ctx.beginPath();
        ctx.moveTo(x, this.startY);
        ctx.lineTo(x, this.startY + this.height);
        ctx.stroke();
      }

      // Snow Dump Zones Outline & Indicators
      this.renderDumpZones(ctx);
    }

    // Render Snow Grid Cells
    for (let r = 0; r < this.rows; r++) {
      for (let c = 0; c < this.cols; c++) {
        const density = this.grid[r * this.cols + c];
        if (density > 0.05) {
          const cx = this.startX + c * this.cellWidth;
          const cy = this.startY + r * this.cellHeight;

          // Color shading based on snow depth + snow type
          if (this.snowType === 'POWDER') {
            // 新雪：純白でふわふわ
            if (density > 0.7) ctx.fillStyle = '#ffffff';
            else if (density > 0.4) ctx.fillStyle = '#eceff1';
            else ctx.fillStyle = '#cfd8dc';
          } else if (this.snowType === 'WET') {
            // 湿雪：やや青みがかった重そうな色
            if (density > 0.7) ctx.fillStyle = '#e3eaef';
            else if (density > 0.4) ctx.fillStyle = '#b0bec5';
            else ctx.fillStyle = '#90a4ae';
          } else {
            // 固雪/圧雪：灰色がかったアイスカラー
            if (density > 0.7) ctx.fillStyle = '#cfd8dc';
            else if (density > 0.4) ctx.fillStyle = '#a3b9c2';
            else ctx.fillStyle = '#78909c';
          }

          ctx.fillRect(cx, cy, this.cellWidth + 0.5, this.cellHeight + 0.5);

          // Subtle pixel shadow for depth
          if (density > 0.5 && r % 3 === 0 && c % 4 === 0) {
            ctx.fillStyle = this.snowType === 'COMPACT' ? '#546e7a' : '#b0bec5';
            ctx.fillRect(cx + 1, cy + this.cellHeight - 1, 2, 1);
          }
        }
      }
    }

    ctx.restore();
  }

  private renderDumpZones(ctx: CanvasRenderingContext2D) {
    ctx.save();

    // Left Snow Dump Site (指定雪捨て場 左)
    ctx.fillStyle = 'rgba(76, 175, 80, 0.15)';
    ctx.fillRect(this.dumpZoneLeft.x, this.dumpZoneLeft.y, this.dumpZoneLeft.w, this.dumpZoneLeft.h);
    ctx.strokeStyle = '#4caf50';
    ctx.lineWidth = 2;
    ctx.setLineDash([6, 4]);
    ctx.strokeRect(this.dumpZoneLeft.x, this.dumpZoneLeft.y, this.dumpZoneLeft.w, this.dumpZoneLeft.h);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(this.dumpZoneLeft.x + 4, this.dumpZoneLeft.y + 6, 92, 22);
    ctx.fillStyle = '#2e7d32';
    ctx.font = 'bold 11px sans-serif';
    ctx.fillText('⭕️ 雪捨て場(左)', this.dumpZoneLeft.x + 8, this.dumpZoneLeft.y + 21);

    // Right Snow Dump Site (指定雪捨て場 右)
    ctx.fillStyle = 'rgba(76, 175, 80, 0.15)';
    ctx.fillRect(this.dumpZoneRight.x, this.dumpZoneRight.y, this.dumpZoneRight.w, this.dumpZoneRight.h);
    ctx.strokeStyle = '#4caf50';
    ctx.strokeRect(this.dumpZoneRight.x, this.dumpZoneRight.y, this.dumpZoneRight.w, this.dumpZoneRight.h);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(this.dumpZoneRight.x + 4, this.dumpZoneRight.y + 6, 92, 22);
    ctx.fillStyle = '#2e7d32';
    ctx.font = 'bold 11px sans-serif';
    ctx.fillText('⭕️ 雪捨て場(右)', this.dumpZoneRight.x + 8, this.dumpZoneRight.y + 21);

    // ---- Public Road (公道) リアル路面描写 ----
    const sz = this.streetZone;

    // Asphalt base (路面アスファルト)
    ctx.setLineDash([]);
    ctx.fillStyle = '#2e333a';
    ctx.fillRect(sz.x, sz.y, sz.w, sz.h);

    // Slight texture lines for asphalt grain
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.04)';
    ctx.lineWidth = 1;
    for (let ax = sz.x; ax < sz.x + sz.w; ax += 8) {
      ctx.beginPath();
      ctx.moveTo(ax, sz.y);
      ctx.lineTo(ax, sz.y + sz.h);
      ctx.stroke();
    }

    // === Snow on road surface (積雪路面) ===
    // Thin snow layer over the whole road (路面全体に薄く積もった雪)
    ctx.fillStyle = 'rgba(210, 225, 232, 0.28)';
    ctx.fillRect(sz.x, sz.y, sz.w, sz.h);

    // Tire tracks / ruts in the snow (わだち - 車が踏み固めた跡)
    const trackY1 = sz.y + 14; // upper lane tiretrack
    const trackY2 = sz.y + sz.h / 2 + 14; // lower lane tiretrack
    for (let tx = sz.x; tx < sz.x + sz.w; tx += 1) {
      const noiseL = Math.sin(tx * 0.07 + 3.1) * 1.5;
      const noiseR = Math.sin(tx * 0.09 + 1.4) * 1.5;
      ctx.fillStyle = 'rgba(46, 52, 58, 0.55)';
      ctx.fillRect(tx, trackY1 + noiseL, 1, 6);
      ctx.fillRect(tx, trackY1 + 18 + noiseR, 1, 6);
      ctx.fillRect(tx, trackY2 + noiseL, 1, 6);
      ctx.fillRect(tx, trackY2 + 18 + noiseR, 1, 6);
    }

    // Road shoulder / edge lines (路側帯 白線)
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
    ctx.lineWidth = 2;
    ctx.setLineDash([]);
    ctx.beginPath();
    ctx.moveTo(sz.x, sz.y + 3);
    ctx.lineTo(sz.x + sz.w, sz.y + 3);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(sz.x, sz.y + sz.h - 3);
    ctx.lineTo(sz.x + sz.w, sz.y + sz.h - 3);
    ctx.stroke();

    // Center dashed line (センターライン 黄色破線)
    ctx.strokeStyle = 'rgba(255, 213, 79, 0.7)';
    ctx.lineWidth = 2;
    ctx.setLineDash([22, 14]);
    ctx.beginPath();
    ctx.moveTo(sz.x, sz.y + sz.h / 2);
    ctx.lineTo(sz.x + sz.w, sz.y + sz.h / 2);
    ctx.stroke();
    ctx.setLineDash([]);

    // Snow bank at road edge / top (路脇の雪山 - 除雪された雪が積まれている)
    const bankGrad = ctx.createLinearGradient(0, sz.y, 0, sz.y + 12);
    bankGrad.addColorStop(0, 'rgba(235, 242, 246, 0.95)');
    bankGrad.addColorStop(1, 'rgba(210, 225, 232, 0)');
    ctx.fillStyle = bankGrad;
    ctx.beginPath();
    ctx.moveTo(sz.x, sz.y);
    for (let sx = sz.x; sx <= sz.x + sz.w; sx += 10) {
      const snowH = 4 + Math.sin(sx * 0.19) * 3 + Math.cos(sx * 0.11) * 2;
      ctx.lineTo(sx, sz.y + snowH);
    }
    ctx.lineTo(sz.x + sz.w, sz.y);
    ctx.closePath();
    ctx.fill();

    // ✔ 公道注意バナー（底部に小さめに表示）
    ctx.fillStyle = 'rgba(180, 0, 0, 0.75)';
    ctx.fillRect(180, sz.y + sz.h - 22, 440, 18);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 11px sans-serif';
    ctx.fillText('⛔️ 公道―道路に雪を出してはいけません! マナー違反・事故の原因', 195, sz.y + sz.h - 9);

    ctx.restore();
  }



}
