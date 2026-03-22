const tiles = Array.from(document.querySelectorAll('.manga-tile'));
let current = 0;

if (tiles.length > 0) {
  tiles[0].classList.add('active');
}

document.addEventListener('keydown', (event) => {
  const keys = ['ArrowRight', 'ArrowLeft', 'ArrowDown', 'ArrowUp', 'Enter'];
  if (!keys.includes(event.key)) return;
  event.preventDefault();

  let cols = Math.floor(document.querySelector('.manga-grid').clientWidth / 180);
  if (cols < 1) cols = 1;

  if (event.key === 'ArrowRight') current = (current + 1) % tiles.length;
  if (event.key === 'ArrowLeft') current = (current - 1 + tiles.length) % tiles.length;
  if (event.key === 'ArrowDown') current = (current + cols) % tiles.length;
  if (event.key === 'ArrowUp') current = (current - cols + tiles.length) % tiles.length;

  tiles.forEach((t, index) => {
    t.classList.toggle('active', index === current);
  });
  tiles[current].focus();

  if (event.key === 'Enter') {
    window.location.href = tiles[current].href;
  }
});
