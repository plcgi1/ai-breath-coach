let touchStartY = 0;
let touchEndY = 0;

export function handleTouchStart(e) {
  touchStartY = e.targetTouches[0].screenY;
}

export function handleTouchMove(e) {
  touchEndY = e.targetTouches[0].screenY;
}

export function handleTouchEnd(closeFn) {
  // Если свайп вниз составил более 100 пикселей — закрываем
  if (touchEndY - touchStartY > 100) {
    closeFn();
  }
  // Сброс координат
  touchStartY = 0;
  touchEndY = 0;
}
