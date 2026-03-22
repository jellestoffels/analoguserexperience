const tiles = Array.from(document.querySelectorAll('.manga-tile'));
const grid = document.querySelector('.manga-grid');
let current = 0;

if (tiles.length > 0) {
  tiles[0].classList.add('active');
}

function updateActiveTile(index) {
  tiles.forEach((tile, idx) => tile.classList.toggle('active', idx === index));
  tiles[index].focus();
}

function runNavigation(key) {
  const colCount = 6;
  if (key === 'ArrowRight') current = (current + 1) % tiles.length;
  if (key === 'ArrowLeft') current = (current - 1 + tiles.length) % tiles.length;
  if (key === 'ArrowDown') current = (current + colCount) % tiles.length;
  if (key === 'ArrowUp') current = (current - colCount + tiles.length) % tiles.length;
  updateActiveTile(current);
}

document.addEventListener('keydown', (event) => {
  const keys = ['ArrowRight', 'ArrowLeft', 'ArrowDown', 'ArrowUp', 'Enter'];
  if (!keys.includes(event.key)) return;
  event.preventDefault();

  if (event.key === 'Enter') {
    window.location.href = tiles[current].href;
    return;
  }

  runNavigation(event.key);
});

if (grid) {
  grid.addEventListener('mousemove', (event) => {
    const rect = grid.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width * 2 - 1;
    const y = (event.clientY - rect.top) / rect.height * 2 - 1;
    grid.style.setProperty('--rotate-x', `${y * 7}deg`);
    grid.style.setProperty('--rotate-y', `${x * 7}deg`);
  });

  grid.addEventListener('mouseleave', () => {
    grid.style.setProperty('--rotate-x', '0deg');
    grid.style.setProperty('--rotate-y', '0deg');
  });

  tiles.forEach((tile) => {
    tile.addEventListener('mouseenter', () => {
      tile.style.setProperty('--hi', '1');
    });
    tile.addEventListener('mouseleave', () => {
      tile.style.removeProperty('--hi');
    });
  });
}

