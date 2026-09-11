import { GameManager } from './game/GameManager';
import { UIManager } from './ui/UIManager';

window.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('game-canvas') as HTMLCanvasElement;
  if (!canvas) {
    console.error('Canvas element #game-canvas not found');
    return;
  }

  const game = new GameManager(canvas);
  const ui = new UIManager(game);

  // Main Loop
  function gameLoop() {
    game.update();
    game.render();
    ui.update();
    requestAnimationFrame(gameLoop);
  }

  requestAnimationFrame(gameLoop);
});
