/**
 * Procedural Pixel Art Renderer for 'じいちゃんの雪かき'
 * Renders retro 2D elements onto HTML5 Canvas without relying on external image files.
 */

export class PixelArt {
  // Draw Niigata Traditional Snow-resistant House (克雪住宅)
  public static drawHouse(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    width: number,
    height: number,
    icicleDanger: number = 0 // 0 to 1 for roof hazard shaking
  ) {
    ctx.save();

    // Main House Structure (Dark Wooden Timber Wall)
    ctx.fillStyle = '#3a2e2b'; // Dark wood
    ctx.fillRect(x + 20, y + 60, width - 40, height - 60);

    // Wall Planks Detail
    ctx.fillStyle = '#29201e';
    for (let py = y + 70; py < y + height - 10; py += 16) {
      ctx.fillRect(x + 20, py, width - 40, 2);
    }

    // Windows (Warm Cozy Light)
    const windowX1 = x + 40;
    const windowY1 = y + 80;
    ctx.fillStyle = '#ffe57f'; // Warm yellow light
    ctx.fillRect(windowX1, windowY1, 40, 35);
    ctx.fillStyle = '#ffa000'; // Frame
    ctx.fillRect(windowX1 + 18, windowY1, 4, 35);
    ctx.fillRect(windowX1, windowY1 + 16, 40, 4);

    // Window 2
    const windowX2 = x + width - 80;
    ctx.fillStyle = '#ffe57f';
    ctx.fillRect(windowX2, windowY1, 40, 35);
    ctx.fillStyle = '#ffa000';
    ctx.fillRect(windowX2 + 18, windowY1, 4, 35);
    ctx.fillRect(windowX2, windowY1 + 16, 40, 4);

    // House Door (玄関)
    const doorX = x + width / 2 - 20;
    const doorY = y + height - 55;
    ctx.fillStyle = '#5d4037'; // Wood door
    ctx.fillRect(doorX, doorY, 40, 55);
    ctx.fillStyle = '#3e2723'; // Door border
    ctx.strokeRect(doorX, doorY, 40, 55);
    ctx.fillStyle = '#ffd54f'; // Door handle
    ctx.fillRect(doorX + 32, doorY + 28, 4, 8);

    // Doorway Lamp (玄関灯)
    ctx.fillStyle = '#fff176';
    ctx.fillRect(doorX + 16, doorY - 14, 8, 8);
    ctx.fillStyle = 'rgba(255, 235, 59, 0.2)';
    ctx.beginPath();
    ctx.arc(doorX + 20, doorY - 10, 25, 0, Math.PI * 2);
    ctx.fill();

    // Chimney with Smoke
    const chimX = x + width - 60;
    const chimY = y + 10;
    ctx.fillStyle = '#424242';
    ctx.fillRect(chimX, chimY, 20, 45);
    ctx.fillStyle = '#616161';
    ctx.fillRect(chimX - 2, chimY, 24, 6);

    // Roof Structure (Gable Roof 瓦屋根)
    ctx.fillStyle = '#263238'; // Dark roof tile base
    ctx.beginPath();
    ctx.moveTo(x, y + 60);
    ctx.lineTo(x + width / 2, y + 15);
    ctx.lineTo(x + width, y + 60);
    ctx.closePath();
    ctx.fill();

    // Heavy Snow Layer on Roof (屋根の積雪)
    ctx.fillStyle = '#eceff1'; // Fresh snow
    ctx.beginPath();
    ctx.moveTo(x - 10, y + 60);
    ctx.lineTo(x + width / 2, y + 5);
    ctx.lineTo(x + width + 10, y + 60);
    ctx.lineTo(x + width + 5, y + 70);
    ctx.lineTo(x + width / 2, y + 25);
    ctx.lineTo(x - 5, y + 70);
    ctx.closePath();
    ctx.fill();

    // Icicles on Eaves (軒下のつらら & 落雪予兆)
    const icicleShake = icicleDanger > 0 ? Math.sin(Date.now() * 0.03) * (icicleDanger * 4) : 0;
    ctx.fillStyle = '#b3e5fc';
    for (let ix = x + 10; ix < x + width - 10; ix += 18) {
      const h = 12 + Math.sin(ix * 0.5) * 8 + (icicleDanger > 0.5 ? Math.random() * 6 : 0);
      ctx.beginPath();
      ctx.moveTo(ix + icicleShake, y + 68);
      ctx.lineTo(ix + 6 + icicleShake, y + 68);
      ctx.lineTo(ix + 3 + icicleShake, y + 68 + h);
      ctx.closePath();
      ctx.fill();
    }

    ctx.restore();
  }

  // Draw Grandpa (じいちゃん) Character
  public static drawGrandpa(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    state: 'IDLE' | 'SHOVEL' | 'EXHAUSTED' | 'FAINTED',
    animFrame: number
  ) {
    ctx.save();
    ctx.translate(x, y);

    const bob = state === 'IDLE' ? Math.sin(animFrame * 0.1) * 2 : 0;
    const pant = state === 'EXHAUSTED' ? Math.sin(animFrame * 0.2) * 3 : 0;

    if (state === 'FAINTED') {
      // Fallen on the ground
      ctx.translate(0, 15);
      ctx.rotate(-Math.PI / 2);
    }

    // Boots (長靴)
    ctx.fillStyle = '#212121';
    ctx.fillRect(-12, 18, 10, 14);
    ctx.fillRect(2, 18, 10, 14);

    // Trousers (防寒ズボン)
    ctx.fillStyle = '#37474f';
    ctx.fillRect(-14, 0 + bob, 12, 20);
    ctx.fillRect(2, 0 + bob, 12, 20);

    // Winter Coat (藍色のドテラ / はんてん)
    ctx.fillStyle = '#1a237e'; // Deep blue coat
    ctx.fillRect(-16, -24 + bob + pant, 32, 26);
    ctx.fillStyle = '#d32f2f'; // Red inner collar accent
    ctx.fillRect(-6, -24 + bob + pant, 12, 6);

    // Head / Face
    ctx.fillStyle = '#ffcc80'; // Skin tone
    ctx.fillRect(-10, -38 + bob + pant, 20, 14);

    // White Beard & Moustache (白いヒゲ)
    ctx.fillStyle = '#eceff1';
    ctx.fillRect(-10, -30 + bob + pant, 20, 7);
    ctx.fillRect(-6, -27 + bob + pant, 12, 8);

    // Eyes
    ctx.fillStyle = '#3e2723';
    if (state === 'EXHAUSTED' || state === 'FAINTED') {
      // Squinting / closed eyes (><)
      ctx.fillRect(-7, -35 + bob + pant, 4, 2);
      ctx.fillRect(3, -35 + bob + pant, 4, 2);
    } else {
      ctx.fillRect(-6, -35 + bob + pant, 3, 3);
      ctx.fillRect(3, -35 + bob + pant, 3, 3);
    }

    // Winter Knit Cap (ニット帽)
    ctx.fillStyle = '#c62828'; // Crimson hat
    ctx.fillRect(-12, -44 + bob + pant, 24, 8);
    ctx.fillRect(-8, -48 + bob + pant, 16, 5);
    ctx.fillStyle = '#ff8f00'; // Pom-pom on hat
    ctx.fillRect(-4, -51 + bob + pant, 8, 4);

    // Shovel (角スコップ / ママさんダンプ)
    if (state === 'SHOVEL') {
      // Shoveling action angle
      const armAngle = Math.sin(animFrame * 0.2) * 0.4;
      ctx.save();
      ctx.rotate(armAngle);
      ctx.fillStyle = '#f57f17'; // Yellow metal blade
      ctx.fillRect(14, -10, 16, 20);
      ctx.fillStyle = '#8d6e63'; // Wooden handle
      ctx.fillRect(-2, 0, 20, 5);
      ctx.restore();
    } else {
      // Holding shovel by side
      ctx.fillStyle = '#f57f17'; // Yellow shovel head
      ctx.fillRect(14, -15 + bob, 14, 18);
      ctx.fillStyle = '#8d6e63';
      ctx.fillRect(10, -35 + bob, 5, 25);
    }

    // Breath Puff (白い息) - Periodic
    if (state !== 'FAINTED' && Math.floor(animFrame / 15) % 3 === 0) {
      ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
      const breathSize = 4 + Math.sin(animFrame * 0.3) * 3;
      ctx.beginPath();
      ctx.arc(-14 - (animFrame % 10), -32 + bob + pant, breathSize, 0, Math.PI * 2);
      ctx.fill();
    }

    // Exhaustion Sweat Drop (汗マーク)
    if (state === 'EXHAUSTED') {
      ctx.fillStyle = '#40c4ff';
      ctx.beginPath();
      ctx.arc(12, -42 + pant, 3, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  }

  // Draw Municipal Snowplow Truck (行政の除雪車)
  public static drawSnowplow(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    direction: 'left' | 'right'
  ) {
    ctx.save();
    ctx.translate(x, y);
    if (direction === 'left') {
      ctx.scale(-1, 1);
    }

    // Truck Body (Orange / Yellow Public Works Vehicle)
    ctx.fillStyle = '#f57c00'; // Orange chassis
    ctx.fillRect(-60, -35, 100, 30);
    ctx.fillStyle = '#e65100'; // Darker trim
    ctx.fillRect(-60, -10, 100, 8);

    // Cab / Window
    ctx.fillStyle = '#212121';
    ctx.fillRect(0, -55, 35, 22);
    ctx.fillStyle = '#81d4fa'; // Glass window
    ctx.fillRect(5, -52, 26, 16);

    // Yellow Rotating Light (回転灯)
    ctx.fillStyle = '#ffeb3b';
    ctx.fillRect(12, -63, 10, 8);
    ctx.fillStyle = 'rgba(255, 235, 59, 0.4)';
    ctx.beginPath();
    ctx.arc(17, -59, 15, 0, Math.PI * 2);
    ctx.fill();

    // Wheels (Heavy Snow Tires)
    ctx.fillStyle = '#212121';
    ctx.beginPath();
    ctx.arc(-35, 0, 14, 0, Math.PI * 2);
    ctx.arc(20, 0, 14, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#757575'; // Hubcaps
    ctx.beginPath();
    ctx.arc(-35, 0, 6, 0, Math.PI * 2);
    ctx.arc(20, 0, 6, 0, Math.PI * 2);
    ctx.fill();

    // Front Plow Blade (大型V型ラッセル除雪板)
    ctx.fillStyle = '#78909c';
    ctx.beginPath();
    ctx.moveTo(38, -35);
    ctx.lineTo(65, 5);
    ctx.lineTo(55, 8);
    ctx.lineTo(35, -25);
    ctx.closePath();
    ctx.fill();

    // Pushed Snow Spray Effect (噴き出す雪)
    ctx.fillStyle = '#ffffff';
    for (let i = 0; i < 6; i++) {
      const sx = 55 + Math.random() * 20;
      const sy = -10 - Math.random() * 25;
      ctx.beginPath();
      ctx.arc(sx, sy, 4 + Math.random() * 5, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  }

  // Draw Volunteer Characters (除雪ボランティア)
  public static drawVolunteer(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    animFrame: number
  ) {
    ctx.save();
    ctx.translate(x, y);

    const armAngle = Math.sin(animFrame * 0.25) * 0.5;

    // Boots
    ctx.fillStyle = '#37474f';
    ctx.fillRect(-10, 16, 8, 12);
    ctx.fillRect(2, 16, 8, 12);

    // Bright Volunteer Jacket (緑のボランティアビブス)
    ctx.fillStyle = '#2e7d32'; // Green jacket
    ctx.fillRect(-12, -20, 24, 24);
    ctx.fillStyle = '#a5d6a7'; // Reflective strip
    ctx.fillRect(-12, -10, 24, 4);

    // Head
    ctx.fillStyle = '#ffcc80';
    ctx.fillRect(-8, -32, 16, 12);

    // Yellow Helmet / Cap
    ctx.fillStyle = '#fbc02d';
    ctx.fillRect(-10, -38, 20, 8);

    // Big Snow Shovel
    ctx.save();
    ctx.rotate(armAngle);
    ctx.fillStyle = '#29b6f6'; // Blue shovel
    ctx.fillRect(10, -10, 14, 16);
    ctx.fillStyle = '#8d6e63';
    ctx.fillRect(-2, 0, 16, 4);
    ctx.restore();

    ctx.restore();
  }

  // Draw Neighbor (近所の佐藤さん - お茶を持って登場)
  public static drawNeighbor(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number
  ) {
    ctx.save();
    ctx.translate(x, y);

    // Coat
    ctx.fillStyle = '#6a1b9a'; // Purple coat
    ctx.fillRect(-12, -20, 24, 24);

    // Head & Warm Scarf
    ctx.fillStyle = '#ffcc80';
    ctx.fillRect(-8, -32, 16, 12);
    ctx.fillStyle = '#e91e63'; // Pink scarf
    ctx.fillRect(-10, -22, 20, 6);

    // Thermos (保温水筒・お茶)
    ctx.fillStyle = '#00897b';
    ctx.fillRect(8, -12, 8, 14);
    ctx.fillStyle = '#e0f2f1'; // Steam from tea
    ctx.beginPath();
    ctx.arc(12, -18, 3, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  // Draw Crested Ibis (トキ / 朱鷺) Flying Animation
  public static drawToki(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    animFrame: number
  ) {
    ctx.save();
    ctx.translate(x, y);

    // Wing flap offset (-1 to 1)
    const flap = Math.sin(animFrame * 0.18);
    const wingY = flap * 10;

    // Body (White with subtle Toki pink tint)
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.ellipse(0, 0, 16, 7, 0, 0, Math.PI * 2);
    ctx.fill();

    // Crest Feather (冠羽 - 後頭部の羽毛)
    ctx.fillStyle = '#ff8a80';
    ctx.beginPath();
    ctx.moveTo(-12, -2);
    ctx.lineTo(-20, -6);
    ctx.lineTo(-14, 2);
    ctx.closePath();
    ctx.fill();

    // Wings (Beautiful Crested Ibis Pink / 朱鷺色 - #ff8a80 & #ff5252)
    // Left / Upper Wing
    ctx.fillStyle = '#ff8a80';
    ctx.beginPath();
    ctx.moveTo(-4, -2);
    ctx.quadraticCurveTo(0, -18 + wingY, 18, -14 + wingY);
    ctx.quadraticCurveTo(8, -2, 4, 0);
    ctx.closePath();
    ctx.fill();

    // Wing Tip Pink Gradient Highlight (朱鷺色のももくれない色)
    ctx.fillStyle = '#ff5252';
    ctx.beginPath();
    ctx.moveTo(8, -12 + wingY);
    ctx.lineTo(18, -14 + wingY);
    ctx.lineTo(14, -6 + wingY);
    ctx.closePath();
    ctx.fill();

    // Head (White)
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(14, -2, 5, 0, Math.PI * 2);
    ctx.fill();

    // Red Facial Skin (朱色の顔)
    ctx.fillStyle = '#d50000';
    ctx.fillRect(16, -4, 4, 4);

    // Curved Black Beak (黒く下曲がりした嘴)
    ctx.fillStyle = '#212121';
    ctx.beginPath();
    ctx.moveTo(19, -3);
    ctx.lineTo(26, 1);
    ctx.lineTo(19, 0);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#d50000'; // Red tip of beak
    ctx.fillRect(24, 0, 2, 2);

    // Tail Feathers (Toki Pink Tint)
    ctx.fillStyle = '#ff8a80';
    ctx.beginPath();
    ctx.moveTo(-14, 0);
    ctx.lineTo(-24, 2);
    ctx.lineTo(-22, 6);
    ctx.lineTo(-14, 4);
    ctx.closePath();
    ctx.fill();

    // Feet trailing back
    ctx.strokeStyle = '#d50000';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(-10, 4);
    ctx.lineTo(-20, 9);
    ctx.stroke();

    ctx.restore();
  }

  // Draw Uonuma Mountain Range (魚沼連峰の雄大な雪山背景)
  public static drawUonumaMountains(ctx: CanvasRenderingContext2D, width: number) {
    ctx.save();

    // Far Layer: Deep Snow Mountains (越後三山・八海山をイメージ)
    const horizonY = 180;

    // Distant mountain silhouette (Blue-gray snow peak gradient)
    const gradFar = ctx.createLinearGradient(0, 40, 0, horizonY);
    gradFar.addColorStop(0, '#eceff1');
    gradFar.addColorStop(0.6, '#b0bec5');
    gradFar.addColorStop(1, '#90a4ae');

    ctx.fillStyle = gradFar;
    ctx.beginPath();
    ctx.moveTo(0, horizonY);
    ctx.lineTo(0, 110);
    ctx.lineTo(70, 70); // Peak 1
    ctx.lineTo(150, 120);
    ctx.lineTo(260, 50); // Peak 2 (Hakkaisan Peak)
    ctx.lineTo(380, 130);
    ctx.lineTo(490, 60); // Peak 3 (Echigo-Komagatake Peak)
    ctx.lineTo(620, 110);
    ctx.lineTo(720, 75); // Peak 4
    ctx.lineTo(width, 140);
    ctx.lineTo(width, horizonY);
    ctx.closePath();
    ctx.fill();

    // Snow Ridges detail on peaks
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    // Ridge 1
    ctx.moveTo(260, 50);
    ctx.lineTo(240, 90);
    ctx.lineTo(270, 80);
    // Ridge 2
    ctx.moveTo(490, 60);
    ctx.lineTo(470, 100);
    ctx.lineTo(510, 95);
    ctx.closePath();
    ctx.fill();

    // Mid Layer: Foothill Pines (杉の雪林)
    ctx.fillStyle = '#546e7a';
    for (let x = 10; x < width; x += 45) {
      const treeH = 25 + (x % 3) * 8;
      ctx.beginPath();
      ctx.moveTo(x, horizonY);
      ctx.lineTo(x + 12, horizonY - treeH);
      ctx.lineTo(x + 24, horizonY);
      ctx.closePath();
      ctx.fill();
    }

    ctx.restore();
  }

  // Draw Grandson Character (帰省した孫)
  public static drawGrandson(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    animFrame: number
  ) {
    ctx.save();
    ctx.translate(x, y);

    const shovelAngle = Math.sin(animFrame * 0.3) * 0.6;

    // Red Sneakers
    ctx.fillStyle = '#e53935';
    ctx.fillRect(-10, 14, 8, 10);
    ctx.fillRect(2, 14, 8, 10);

    // Blue Jeans
    ctx.fillStyle = '#1e88e5';
    ctx.fillRect(-10, -8, 8, 22);
    ctx.fillRect(2, -8, 8, 22);

    // Bright Yellow Parka (元気なパーカー)
    ctx.fillStyle = '#fdd835';
    ctx.fillRect(-12, -26, 24, 18);

    // Head
    ctx.fillStyle = '#ffcc80';
    ctx.fillRect(-8, -38, 16, 12);

    // Black Hair & Cap
    ctx.fillStyle = '#212121';
    ctx.fillRect(-10, -44, 20, 8);
    ctx.fillStyle = '#0d47a1'; // Cap visor
    ctx.fillRect(0, -42, 12, 4);

    // Fast Shoveling Arm Animation
    ctx.save();
    ctx.rotate(shovelAngle);
    ctx.fillStyle = '#ff9800'; // Orange shovel
    ctx.fillRect(8, -12, 14, 16);
    ctx.fillStyle = '#8d6e63';
    ctx.fillRect(-2, -2, 14, 4);
    ctx.restore();

    ctx.restore();
  }

  // Draw Niigata Melting Water Pipes (消雪パイプの散水アニメーション)
  public static drawMeltingPipeSpray(
    ctx: CanvasRenderingContext2D,
    startX: number,
    startY: number,
    width: number,
    animFrame: number
  ) {
    ctx.save();

    // Pipe line in asphalt
    ctx.fillStyle = '#263238';
    ctx.fillRect(startX, startY, width, 4);

    // Water Nozzles & Geysers (消雪ノズルから噴き出す水)
    for (let x = startX + 30; x < startX + width; x += 50) {
      // Pipe Nozzle Head
      ctx.fillStyle = '#b0bec5';
      ctx.fillRect(x - 2, startY - 2, 4, 4);

      // Sprinkling Water Streams (ピュッピュッと噴き出す井戸水)
      const waterH = 12 + Math.sin((animFrame * 0.2) + x) * 6;
      ctx.fillStyle = 'rgba(129, 212, 250, 0.75)';
      ctx.beginPath();
      ctx.moveTo(x - 3, startY - 2);
      ctx.quadraticCurveTo(x, startY - waterH, x + 3, startY - 2);
      ctx.fill();

      // Water Ripple Splash on ground (溶ける水たまり)
      ctx.fillStyle = 'rgba(79, 195, 247, 0.4)';
      ctx.beginPath();
      ctx.ellipse(x, startY + 2, 14, 4, 0, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  }

  // Draw Tonjiru Hot Soup (熱々豚汁)
  public static drawTonjiru(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number
  ) {
    ctx.save();
    ctx.translate(x, y);

    // Soup Bowl (漆塗りのお椀)
    ctx.fillStyle = '#880e4f';
    ctx.beginPath();
    ctx.arc(0, 0, 16, 0, Math.PI);
    ctx.fill();
    ctx.fillStyle = '#212121'; // Bowl rim
    ctx.fillRect(-18, -2, 36, 3);

    // Miso Soup & Ingredients (豚汁の具材)
    ctx.fillStyle = '#d7ccc8'; // Miso soup color
    ctx.beginPath();
    ctx.ellipse(0, -1, 15, 4, 0, 0, Math.PI * 2);
    ctx.fill();

    // Green Onions & Pork (ネギ・豚肉)
    ctx.fillStyle = '#4caf50';
    ctx.fillRect(-6, -3, 3, 3);
    ctx.fillRect(4, -2, 3, 3);
    ctx.fillStyle = '#ff8a80';
    ctx.fillRect(-2, -4, 4, 3);

    // Hot Steam Rising (熱々の湯気)
    ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
    for (let i = 0; i < 3; i++) {
      const steamY = -8 - ((Date.now() * 0.05 + i * 20) % 25);
      const steamX = Math.sin(steamY * 0.2) * 4 - 8 + i * 8;
      ctx.beginPath();
      ctx.arc(steamX, steamY, 3, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  }

  // Draw Overhead HP Bar for Grandpa (頭上のリアルタイムミニHPバー)
  public static drawOverheadHpBar(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    stamina: number,
    maxStamina: number
  ) {
    ctx.save();
    ctx.translate(x, y - 56);

    const barW = 40;
    const barH = 6;
    const ratio = Math.max(0, stamina / maxStamina);

    // Track Border & Background
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(-barW / 2 - 1, -1, barW + 2, barH + 2);

    // Dynamic Color (Green > Yellow > Red)
    if (ratio > 0.6) {
      ctx.fillStyle = '#4caf50'; // Green
    } else if (ratio > 0.25) {
      ctx.fillStyle = '#ffb300'; // Yellow
    } else {
      ctx.fillStyle = '#f44336'; // Red
    }

    ctx.fillRect(-barW / 2, 0, barW * ratio, barH);
    ctx.restore();
  }

  // Draw Canvas-overlay HP Panel at top-left (体力パネル・左上オーバーレイ)
  public static drawHpPanel(
    ctx: CanvasRenderingContext2D,
    stamina: number,
    maxStamina: number,
    faintCount: number,
    maxFaintCount: number
  ) {
    ctx.save();

    const panelX = 10;
    const panelY = 10;
    const panelW = 180;
    const panelH = 58;

    // Panel Background
    ctx.fillStyle = 'rgba(10, 18, 30, 0.82)';
    ctx.beginPath();
    ctx.roundRect(panelX, panelY, panelW, panelH, 8);
    ctx.fill();
    ctx.strokeStyle = 'rgba(79, 195, 247, 0.45)';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // HP Label
    ctx.fillStyle = '#90caf9';
    ctx.font = 'bold 10px sans-serif';
    ctx.fillText('HP', panelX + 8, panelY + 16);

    // HP Percent
    const ratio = Math.max(0, stamina / maxStamina);
    const pct = Math.floor(ratio * 100);
    let barColor: string;
    if (ratio > 0.6) {
      barColor = '#4caf50';
    } else if (ratio > 0.25) {
      barColor = '#ffb300';
    } else {
      barColor = '#f44336';
    }
    ctx.fillStyle = barColor;
    ctx.font = 'bold 13px sans-serif';
    ctx.fillText(`${pct}%`, panelX + 28, panelY + 16);

    // HP Bar Track
    const barX = panelX + 8;
    const barY = panelY + 22;
    const barW = panelW - 16;
    const barH = 10;
    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.roundRect(barX, barY, barW, barH, 5);
    ctx.fill();

    // HP Bar Fill
    ctx.fillStyle = barColor;
    ctx.beginPath();
    ctx.roundRect(barX, barY, barW * ratio, barH, 5);
    ctx.fill();

    // Hearts (♡ lives) - max 5 displayed
    const displayMax = Math.min(maxFaintCount, 5);
    const remainingLives = Math.max(0, maxFaintCount - faintCount);
    const heartY = panelY + 48;
    ctx.font = '13px sans-serif';
    for (let i = 0; i < displayMax; i++) {
      ctx.fillStyle = i < remainingLives ? '#ef5350' : '#37474f';
      ctx.fillText(i < remainingLives ? '♥' : '♡', panelX + 8 + i * 20, heartY);
    }

    ctx.restore();
  }

  // Draw a passing car on the road (公道を走る車)
  public static drawCar(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    direction: 'left' | 'right'
  ) {
    ctx.save();
    ctx.translate(x, y);
    if (direction === 'left') {
      ctx.scale(-1, 1);
    }

    // Car Body (軽自動車っぽい丸みのあるボディ)
    ctx.fillStyle = '#1565c0'; // Dark blue kei car
    ctx.beginPath();
    ctx.roundRect(-28, -18, 56, 18, 4);
    ctx.fill();

    // Roof / Cabin
    ctx.fillStyle = '#1976d2';
    ctx.beginPath();
    ctx.roundRect(-18, -30, 36, 14, 5);
    ctx.fill();

    // Windows
    ctx.fillStyle = '#b3e5fc';
    ctx.beginPath();
    ctx.roundRect(-15, -28, 14, 10, 2);
    ctx.fill();
    ctx.beginPath();
    ctx.roundRect(1, -28, 14, 10, 2);
    ctx.fill();

    // Headlights
    ctx.fillStyle = '#fffde7';
    ctx.fillRect(24, -14, 6, 5);
    // Light glow
    ctx.fillStyle = 'rgba(255, 253, 231, 0.3)';
    ctx.beginPath();
    ctx.arc(30, -12, 8, 0, Math.PI * 2);
    ctx.fill();

    // Tail lights
    ctx.fillStyle = '#ef5350';
    ctx.fillRect(-30, -14, 4, 5);

    // Wheels
    ctx.fillStyle = '#212121';
    ctx.beginPath();
    ctx.arc(-16, 2, 7, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(16, 2, 7, 0, Math.PI * 2);
    ctx.fill();
    // Hubcaps
    ctx.fillStyle = '#9e9e9e';
    ctx.beginPath();
    ctx.arc(-16, 2, 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(16, 2, 3, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  // Draw Avalanche Burial Scene (雪崩に埋もれた死亡シーン)
  public static drawBuryInSnow(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    animFrame: number
  ) {
    ctx.save();
    ctx.translate(x, y);

    // Big Snow Mound covering Grandpa (埋もれた巨大な雪山)
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.ellipse(0, 15, 65, 32, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#cfd8dc';
    ctx.beginPath();
    ctx.ellipse(5, 10, 55, 24, 0, 0, Math.PI * 2);
    ctx.fill();

    // Grandpa's boots sticking out of snow mound (雪から突き出た長靴の足先)
    ctx.fillStyle = '#212121';
    ctx.fillRect(25, 18, 12, 16);
    ctx.fillRect(40, 22, 12, 14);

    // Shovel sticking out of the snow pile (雪から斜めに突き出た角スコップ)
    ctx.save();
    ctx.rotate(-0.4 + Math.sin(animFrame * 0.1) * 0.04);
    ctx.fillStyle = '#8d6e63'; // Wood handle
    ctx.fillRect(-6, -55, 6, 50);
    ctx.fillStyle = '#f57f17'; // Yellow shovel blade
    ctx.fillRect(-14, -72, 22, 22);
    ctx.restore();

    // Large Warning SOS Banner & Red Beacon (🚨 埋没事故警報)
    const flash = Math.floor(animFrame / 10) % 2 === 0;
    ctx.fillStyle = flash ? '#d32f2f' : '#b71c1c';
    ctx.fillRect(-130, -75, 260, 32);
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.strokeRect(-130, -75, 260, 32);

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 13px sans-serif';
    ctx.fillText('🚨 危険！屋根からの落雪で埋没事故発生！', -122, -54);

    ctx.restore();
  }

  // Draw Roof Stage Background (2日目: 命がけの屋根雪下ろし 高所パノラマビュー)
  public static drawRoofStageBackground(
    ctx: CanvasRenderingContext2D,
    width: number,
    _height: number,
    animFrame: number,
    hasSafetyRope: boolean,
    playerX: number,
    playerY: number
  ) {
    ctx.save();

    // 1. High Sky Panorama & Distant Mountains
    const skyGrad = ctx.createLinearGradient(0, 0, 0, 140);
    skyGrad.addColorStop(0, '#546e7a');
    skyGrad.addColorStop(1, '#90a4ae');
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, width, 140);

    // Distant Uonuma Mountains (viewed from roof height)
    ctx.fillStyle = '#cfd8dc';
    ctx.beginPath();
    ctx.moveTo(0, 140);
    ctx.lineTo(80, 50);
    ctx.lineTo(190, 95);
    ctx.lineTo(310, 35);
    ctx.lineTo(440, 85);
    ctx.lineTo(580, 40);
    ctx.lineTo(700, 90);
    ctx.lineTo(800, 45);
    ctx.lineTo(800, 140);
    ctx.closePath();
    ctx.fill();

    // Snow caps on distant mountains
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.moveTo(70, 60);
    ctx.lineTo(80, 50);
    ctx.lineTo(95, 65);
    ctx.lineTo(300, 45);
    ctx.lineTo(310, 35);
    ctx.lineTo(325, 48);
    ctx.lineTo(570, 50);
    ctx.lineTo(580, 40);
    ctx.lineTo(595, 52);
    ctx.lineTo(790, 52);
    ctx.lineTo(800, 45);
    ctx.lineTo(800, 75);
    ctx.lineTo(0, 75);
    ctx.fill();

    // Distant snowy pine trees & village roofs below horizon
    ctx.fillStyle = '#37474f';
    for (let tx = 10; tx < width; tx += 65) {
      ctx.fillRect(tx, 120, 24, 20);
      ctx.fillStyle = '#eceff1';
      ctx.fillRect(tx - 2, 116, 28, 5); // snow on neighbor roof
      ctx.fillStyle = '#37474f';
    }

    // 2. Ground View Below (Looking down from eaves y: 480 to 560)
    ctx.fillStyle = '#263238';
    ctx.fillRect(0, 480, width, 80);

    // Ground snowy yard & miniature road far below
    ctx.fillStyle = '#eceff1';
    ctx.fillRect(0, 485, width, 40);

    // Miniature road at bottom with small car
    ctx.fillStyle = '#37474f';
    ctx.fillRect(0, 525, width, 35);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(20, 540, 60, 2);
    ctx.fillRect(160, 540, 60, 2);
    ctx.fillRect(300, 540, 60, 2);
    ctx.fillRect(440, 540, 60, 2);
    ctx.fillRect(580, 540, 60, 2);
    ctx.fillRect(720, 540, 60, 2);

    // Miniature car passing below
    const miniCarX = ((animFrame * 1.5) % (width + 60)) - 30;
    ctx.fillStyle = '#e53935';
    ctx.fillRect(miniCarX, 532, 28, 12);
    ctx.fillStyle = '#90caf9';
    ctx.fillRect(miniCarX + 6, 534, 12, 6);

    // Ground Watcher (地上から見上げる近所のおばあちゃん)
    const watcherX = 80;
    const watcherY = 505;
    ctx.fillStyle = '#5d4037';
    ctx.fillRect(watcherX, watcherY - 14, 12, 14); // body
    ctx.fillStyle = '#ffcc80';
    ctx.fillRect(watcherX + 2, watcherY - 22, 8, 8); // head looking up
    ctx.fillStyle = '#ab47bc';
    ctx.fillRect(watcherX + 1, watcherY - 25, 10, 5); // head scarf (ほっかむり)

    // Watcher Speech Bubble (新潟弁の声かけ)
    const bubbleCycle = Math.floor(animFrame / 180) % 3;
    const phrases = [
      '「じいちゃん！一人で屋根登っちゃ危ねぇて！」',
      '「下見て落としてやー！人に当たらんように！」',
      '「足元凍ってるすけ、命綱しっかりつけなせ！」',
    ];
    ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
    ctx.fillRect(watcherX + 18, watcherY - 32, 270, 22);
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 1;
    ctx.strokeRect(watcherX + 18, watcherY - 32, 270, 22);
    ctx.fillStyle = '#0f172a';
    ctx.font = 'bold 11px sans-serif';
    ctx.fillText(phrases[bubbleCycle], watcherX + 24, watcherY - 17);

    // 3. Main Japanese Galvanized Tin Roof (勾配のあるトタン大屋根 y: 140 to 480)
    const roofGrad = ctx.createLinearGradient(0, 140, 0, 480);
    roofGrad.addColorStop(0, '#2c3e50'); // Dark slate at ridge
    roofGrad.addColorStop(1, '#34495e'); // Slightly lighter down slope
    ctx.fillStyle = roofGrad;
    ctx.fillRect(30, 140, width - 60, 340);

    // Tin Roof Standing Seams (縦ハゼ葺きの継ぎ目ライン)
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
    ctx.lineWidth = 2;
    for (let rx = 50; rx < width - 50; rx += 28) {
      ctx.beginPath();
      ctx.moveTo(rx, 140);
      ctx.lineTo(rx, 480);
      ctx.stroke();
    }

    // Snow Stopper Brackets (雪止め金具 - 三角形の突起金具)
    const stopRows = [260, 360, 440];
    for (const sRow of stopRows) {
      for (let sx = 64; sx < width - 60; sx += 56) {
        ctx.fillStyle = '#f59e0b'; // Amber metal bracket
        ctx.beginPath();
        ctx.moveTo(sx, sRow);
        ctx.lineTo(sx + 10, sRow - 8);
        ctx.lineTo(sx + 20, sRow);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = '#b45309';
        ctx.lineWidth = 1;
        ctx.stroke();
      }
    }

    // Roof Ridge (棟 / むね) at top y: 140
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(20, 134, width - 40, 12);
    ctx.fillStyle = '#475569';
    ctx.fillRect(20, 134, width - 40, 3);

    // Chimney with Puffing Smoke at Top-Right
    ctx.fillStyle = '#424242';
    ctx.fillRect(width - 120, 80, 24, 60);
    ctx.fillStyle = '#ff7043';
    ctx.fillRect(width - 124, 76, 32, 6);
    // Smoke
    ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
    const smokeOffset = (animFrame * 0.5) % 30;
    ctx.beginPath();
    ctx.arc(width - 108 - smokeOffset * 0.5, 65 - smokeOffset, 8 + smokeOffset * 0.3, 0, Math.PI * 2);
    ctx.fill();

    // Safety Anchor Ring (命綱の固定金具) at Top Center
    const anchorX = 400;
    const anchorY = 145;
    ctx.fillStyle = '#f59e0b';
    ctx.beginPath();
    ctx.arc(anchorX, anchorY, 7, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#b45309';
    ctx.lineWidth = 2;
    ctx.stroke();

    // If safety rope active, draw heavy rope from anchor to Grandpa
    if (hasSafetyRope) {
      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 3;
      ctx.setLineDash([6, 3]);
      ctx.beginPath();
      ctx.moveTo(anchorX, anchorY);
      // Slight rope sag curve
      const midX = (anchorX + playerX) / 2;
      const midY = (anchorY + playerY) / 2 + 15;
      ctx.quadraticCurveTo(midX, midY, playerX, playerY - 10);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    // 4. Overhanging Snow Cornice & Hazard Eaves (雪庇・せっぴ危険地帯 y: 460..480)
    // Left and Right Eaves Hazard
    ctx.fillStyle = 'rgba(239, 68, 68, 0.18)';
    ctx.fillRect(30, 140, 25, 340); // Left edge warning
    ctx.fillRect(width - 55, 140, 25, 340); // Right edge warning
    ctx.fillRect(30, 455, width - 60, 25); // Bottom eaves warning

    // Overhanging snow chunks along the bottom edge (雪庇)
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.moveTo(25, 475);
    for (let ex = 25; ex <= width - 25; ex += 15) {
      const dropY = 475 + 10 + Math.sin(ex * 0.2 + animFrame * 0.05) * 4;
      ctx.lineTo(ex, dropY);
    }
    ctx.lineTo(width - 25, 475);
    ctx.closePath();
    ctx.fill();

    // Eaves Hazard Warning Stripe
    ctx.fillStyle = '#dc2626';
    ctx.font = 'bold 11px sans-serif';
    ctx.fillText('⚠️ 軒先転落注意！雪庇を踏み抜くと地上へ滑落！', 250, 472);

    ctx.restore();
  }

  // Draw Snow Dropping Off Eaves Effect (屋根から下に雪が落ちる演出)
  public static drawSnowDrops(
    ctx: CanvasRenderingContext2D,
    drops: { x: number; y: number; size: number; alpha: number }[]
  ) {
    ctx.save();
    for (const drop of drops) {
      ctx.fillStyle = `rgba(255, 255, 255, ${drop.alpha})`;
      ctx.beginPath();
      ctx.arc(drop.x, drop.y, drop.size, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  // === 新潟名物・消雪パイプ（しょうせつパイプ）描画 ===
  public static drawMeltingPipes(
    ctx: CanvasRenderingContext2D,
    width: number,
    streetY: number,
    animFrame: number
  ) {
    ctx.save();
    const pipeY = streetY + 40; // center of public road

    // Small indicator badge
    ctx.fillStyle = 'rgba(2, 132, 199, 0.85)';
    ctx.fillRect(8, streetY + 6, 175, 18);
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1;
    ctx.strokeRect(8, streetY + 6, 175, 18);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 10px sans-serif';
    ctx.fillText('🚿 新潟発祥・消雪パイプ散水中', 14, streetY + 19);

    // Nozzles along the center line every 48px
    for (let px = 30; px < width; px += 48) {
      // Wet melted asphalt patch around nozzle
      ctx.fillStyle = 'rgba(25, 30, 36, 0.85)';
      ctx.beginPath();
      ctx.ellipse(px, pipeY, 20, 10, 0, 0, Math.PI * 2);
      ctx.fill();

      // Brass Nozzle head
      ctx.fillStyle = '#f59e0b';
      ctx.fillRect(px - 3, pipeY - 2, 6, 4);
      ctx.fillStyle = '#78350f';
      ctx.fillRect(px - 1, pipeY - 3, 2, 2);

      // Water Spurt / Fountain (ピュッピュッと上向きにアーチを描く地下水)
      const spurtCycle = (animFrame * 0.15 + px * 0.05) % 2;
      if (spurtCycle < 1.4) {
        const h = 10 + Math.sin(animFrame * 0.3 + px) * 4;
        ctx.strokeStyle = 'rgba(129, 212, 250, 0.8)';
        ctx.lineWidth = 1.5;

        // Left arc
        ctx.beginPath();
        ctx.moveTo(px, pipeY - 2);
        ctx.quadraticCurveTo(px - 8, pipeY - 2 - h, px - 14, pipeY + 4);
        ctx.stroke();

        // Right arc
        ctx.beginPath();
        ctx.moveTo(px, pipeY - 2);
        ctx.quadraticCurveTo(px + 8, pipeY - 2 - h, px + 14, pipeY + 4);
        ctx.stroke();

        // Splash water droplets
        ctx.fillStyle = 'rgba(224, 247, 250, 0.9)';
        ctx.fillRect(px - 14 + (animFrame % 4), pipeY + 2, 2, 2);
        ctx.fillRect(px + 12 - (animFrame % 4), pipeY + 2, 2, 2);
      }
    }
    ctx.restore();
  }

  // === 各日の朝の「カーテン開け＆じいちゃんのつぶやき」演出（DAY_START） ===
  public static drawMorningIntroduction(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    dayNum: number,
    title: string,
    quote: string,
    progress: number // 0 (start) to 1 (finish)
  ) {
    ctx.save();

    // 1. Sliding curtains opening animation
    const curtainWidth = (width / 2) * (1 - Math.min(1, progress * 1.5));
    if (curtainWidth > 0) {
      ctx.fillStyle = '#0f172a';
      // Left curtain
      ctx.fillRect(0, 0, curtainWidth, height);
      // Right curtain
      ctx.fillRect(width - curtainWidth, 0, curtainWidth, height);

      // Curtain folds
      ctx.strokeStyle = '#1e293b';
      ctx.lineWidth = 3;
      for (let cx = 20; cx < curtainWidth; cx += 20) {
        ctx.beginPath();
        ctx.moveTo(cx, 0);
        ctx.lineTo(cx, height);
        ctx.stroke();
      }
      for (let cx = width - curtainWidth + 20; cx < width; cx += 20) {
        ctx.beginPath();
        ctx.moveTo(cx, 0);
        ctx.lineTo(cx, height);
        ctx.stroke();
      }
    }

    // 2. Warm morning golden sunlight overlay
    const sunAlpha = Math.min(0.28, progress * 0.35);
    ctx.fillStyle = `rgba(254, 243, 199, ${sunAlpha})`;
    ctx.fillRect(0, 0, width, height);

    // 3. Morning Story Banner Card
    const cardY = 160;
    ctx.fillStyle = 'rgba(15, 23, 42, 0.94)';
    ctx.fillRect(50, cardY, width - 100, 160);
    ctx.strokeStyle = '#ffd54f';
    ctx.lineWidth = 3;
    ctx.strokeRect(50, cardY, width - 100, 160);

    // Day & Title header
    ctx.fillStyle = '#ffb74d';
    ctx.font = 'bold 20px sans-serif';
    ctx.fillText(`🌅 ${dayNum}日目の朝：${title}`, 80, cardY + 38);

    // Grandpa face icon box
    const iconX = 80;
    const iconY = cardY + 56;
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(iconX, iconY, 64, 64);
    ctx.strokeStyle = '#64748b';
    ctx.lineWidth = 2;
    ctx.strokeRect(iconX, iconY, 64, 64);

    // Pixel face of Grandpa inside icon
    ctx.save();
    ctx.translate(iconX + 32, iconY + 44);
    // Hat
    ctx.fillStyle = '#c62828';
    ctx.fillRect(-14, -28, 28, 10);
    ctx.fillStyle = '#ff8f00';
    ctx.fillRect(-4, -32, 8, 4);
    // Face
    ctx.fillStyle = '#ffcc80';
    ctx.fillRect(-12, -18, 24, 16);
    // Eyes
    ctx.fillStyle = '#3e2723';
    ctx.fillRect(-8, -14, 4, 3);
    ctx.fillRect(4, -14, 4, 3);
    // Beard
    ctx.fillStyle = '#eceff1';
    ctx.fillRect(-12, -8, 24, 10);
    // Breath puff
    ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
    ctx.beginPath();
    ctx.arc(16, -6, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // Speech bubble with Niigata dialect
    const bubbleX = 160;
    const bubbleY = cardY + 56;
    ctx.fillStyle = 'rgba(30, 41, 59, 0.95)';
    ctx.fillRect(bubbleX, bubbleY, width - 230, 64);
    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(bubbleX, bubbleY, width - 230, 64);

    // Speech arrow
    ctx.fillStyle = 'rgba(30, 41, 59, 0.95)';
    ctx.beginPath();
    ctx.moveTo(bubbleX, bubbleY + 20);
    ctx.lineTo(bubbleX - 10, bubbleY + 28);
    ctx.lineTo(bubbleX, bubbleY + 36);
    ctx.closePath();
    ctx.fill();

    // Dialogue text
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 14px sans-serif';
    ctx.fillText('じいちゃんの独り言：', bubbleX + 16, bubbleY + 24);
    ctx.fillStyle = '#fde047';
    ctx.font = 'bold 13px sans-serif';
    ctx.fillText(`「${quote}」`, bubbleX + 16, bubbleY + 48);

    ctx.restore();
  }

  // === 完全クリア時の感動のエピローグ一枚絵（春の光と共助の絆） ===
  public static drawEpilogueScene(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    animFrame: number
  ) {
    ctx.save();

    // Warm Spring Sky
    const sky = ctx.createLinearGradient(0, 0, 0, height);
    sky.addColorStop(0, '#64b5f6'); // bright clear spring blue
    sky.addColorStop(0.5, '#e1f5fe');
    sky.addColorStop(1, '#fffde7'); // golden ground light
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, width, height);

    // Golden sun rays streaming down
    ctx.fillStyle = 'rgba(255, 241, 118, 0.2)';
    for (let angle = 0; angle < Math.PI; angle += 0.4) {
      ctx.beginPath();
      ctx.moveTo(width / 2, 0);
      ctx.lineTo(width / 2 + Math.cos(angle) * width, height);
      ctx.lineTo(width / 2 + Math.cos(angle + 0.2) * width, height);
      ctx.closePath();
      ctx.fill();
    }

    // Meltdown snow on ground with green spring soil peeking out
    ctx.fillStyle = '#4e342e'; // warm brown soil
    ctx.fillRect(0, height - 140, width, 140);
    ctx.fillStyle = '#81c784'; // fresh green grass patches
    for (let gx = 10; gx < width; gx += 40) {
      ctx.fillRect(gx, height - 135, 24, 12);
    }
    // Lingering melted snow patches
    ctx.fillStyle = '#e0f2f1';
    for (let sx = 40; sx < width; sx += 80) {
      ctx.beginPath();
      ctx.ellipse(sx, height - 120, 22, 6, 0, 0, Math.PI * 2);
      ctx.fill();
    }

    // Butterbur bud (ふきのとう / 新潟の春の使者)
    ctx.fillStyle = '#c8e6c9';
    ctx.fillRect(70, height - 130, 8, 8);
    ctx.fillStyle = '#81c784';
    ctx.fillRect(68, height - 124, 12, 4);

    // Wooden Porch (縁側)
    const porchY = height - 180;
    ctx.fillStyle = '#8d6e63'; // warm cedar wood
    ctx.fillRect(100, porchY, width - 200, 50);
    ctx.fillStyle = '#5d4037'; // wood planks
    for (let px = 110; px < width - 100; px += 30) {
      ctx.fillRect(px, porchY, 2, 50);
    }

    // Plate with Niigata Sasa-dango (笹団子) on the porch
    const plateX = 390;
    const plateY = porchY + 18;
    ctx.fillStyle = '#eeeeee';
    ctx.beginPath();
    ctx.ellipse(plateX, plateY, 24, 8, 0, 0, Math.PI * 2);
    ctx.fill();
    // Green sasa dango balls
    ctx.fillStyle = '#2e7d32'; // deep green mugwort
    ctx.beginPath();
    ctx.arc(plateX - 8, plateY - 4, 7, 0, Math.PI * 2);
    ctx.arc(plateX + 6, plateY - 5, 8, 0, Math.PI * 2);
    ctx.fill();
    // Rush grass tie (スゲの紐)
    ctx.strokeStyle = '#d7ccc8';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Characters sitting together on the porch:
    // 1. Grandpa (smiling with warm eyes)
    const gpX = 260;
    const gpY = porchY - 10;
    ctx.fillStyle = '#1a237e'; // blue coat
    ctx.fillRect(gpX - 14, gpY - 24, 28, 28);
    ctx.fillStyle = '#ffcc80';
    ctx.fillRect(gpX - 10, gpY - 38, 20, 14);
    // Smiling eyes (^^)
    ctx.strokeStyle = '#3e2723';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(gpX - 5, gpY - 32, 3, Math.PI, 0);
    ctx.arc(gpX + 5, gpY - 32, 3, Math.PI, 0);
    ctx.stroke();
    // White beard
    ctx.fillStyle = '#eceff1';
    ctx.fillRect(-10 + gpX, -28 + gpY, 20, 8);
    // Steaming green tea cup in hand
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(gpX + 12, gpY - 14, 10, 12);
    ctx.fillStyle = '#4caf50';
    ctx.fillRect(gpX + 13, gpY - 12, 8, 3);
    // Steam
    ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
    ctx.beginPath();
    ctx.arc(gpX + 17, gpY - 20 - (animFrame % 15), 3, 0, Math.PI * 2);
    ctx.fill();

    // 2. Grandma (with purple scarf, smiling)
    const gmX = 330;
    const gmY = porchY - 10;
    ctx.fillStyle = '#6a1b9a'; // purple kimono
    ctx.fillRect(gmX - 12, gmY - 24, 24, 28);
    ctx.fillStyle = '#ffcc80';
    ctx.fillRect(gmX - 8, gmY - 36, 16, 12);
    // Smiling eyes
    ctx.beginPath();
    ctx.arc(gmX - 4, gmY - 30, 2.5, Math.PI, 0);
    ctx.arc(gmX + 4, gmY - 30, 2.5, Math.PI, 0);
    ctx.stroke();

    // 3. Grandson (red hoodie, waving hand)
    const gsX = 470;
    const gsY = porchY - 5;
    ctx.fillStyle = '#d32f2f'; // red hoodie
    ctx.fillRect(gsX - 10, gsY - 22, 20, 24);
    ctx.fillStyle = '#ffcc80';
    ctx.fillRect(gsX - 8, gsY - 34, 16, 12);
    ctx.fillStyle = '#424242'; // brown hair
    ctx.fillRect(gsX - 9, gsY - 37, 18, 6);
    // Smiling mouth
    ctx.fillStyle = '#d32f2f';
    ctx.fillRect(gsX - 3, gsY - 26, 6, 3);

    // 4. Neighbor / Volunteer (standing by waving)
    const vlX = 540;
    const vlY = porchY + 10;
    ctx.fillStyle = '#0284c7';
    ctx.fillRect(vlX - 10, vlY - 30, 20, 32);
    ctx.fillStyle = '#ffcc80';
    ctx.fillRect(vlX - 8, vlY - 42, 16, 12);
    ctx.fillStyle = '#f59e0b'; // yellow towel
    ctx.fillRect(vlX - 10, vlY - 45, 20, 4);

    // Heartwarming Epilogue Title Banner
    ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
    ctx.fillRect(60, 40, width - 120, 70);
    ctx.strokeStyle = '#ffd54f';
    ctx.lineWidth = 2;
    ctx.strokeRect(60, 40, width - 120, 70);

    ctx.fillStyle = '#ffd54f';
    ctx.font = 'bold 20px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('🌸 春を待つ縁側 〜 地域の支え合いが繋いだ命 〜', width / 2, 72);

    ctx.fillStyle = '#f8fafc';
    ctx.font = 'bold 13px sans-serif';
    ctx.fillText('この冬も、みんなの支え合いのおかげで無事に乗り越えることができました。', width / 2, 96);

    ctx.restore();
  }
}




