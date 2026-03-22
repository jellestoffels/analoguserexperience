document.addEventListener('DOMContentLoaded', () => {
  const tiles = Array.from(document.querySelectorAll('.manga-tile'));
  const grid = document.querySelector('.manga-grid');
  let current = 0;

  // Add intro animation to panels
  tiles.forEach((tile, index) => {
    tile.style.animationDelay = `${index * 0.15}s`;
    tile.classList.add('manga-enter');
    
    // Create random manga speech bubbles for fun interactive element
    const bubble = document.createElement('div');
    const texts = ['BOOM!', 'POW!', 'CLICK!', 'YEAH!', 'AWESOME!', '90s!'];
    bubble.textContent = texts[Math.floor(Math.random() * texts.length)];
    bubble.className = 'speech-bubble';
    bubble.style.right = '-20px';
    bubble.style.top = '-20px';
    tile.appendChild(bubble);
  });

  if (tiles.length > 0) {
    tiles[0].classList.add('active');
  }

  function updateActiveTile(index) {
    tiles.forEach((tile, idx) => tile.classList.toggle('active', idx === index));
    tiles[index].focus();
  }

  function runNavigation(key) {
    if (key === 'ArrowRight') current = (current + 1) % tiles.length;
    if (key === 'ArrowLeft') current = (current - 1 + tiles.length) % tiles.length;
    if (key === 'ArrowDown') current = (current + 2) % tiles.length;
    if (key === 'ArrowUp') current = (current - 2 + tiles.length) % tiles.length;
    updateActiveTile(current);
  }

  document.addEventListener('keydown', (event) => {
    const keys = ['ArrowRight', 'ArrowLeft', 'ArrowDown', 'ArrowUp', 'Enter'];
    if (!keys.includes(event.key)) return;
    event.preventDefault();

    if (event.key === 'Enter') {
      if (tiles.length > 0 && tiles[current]) {
        window.location.href = tiles[current].href;
      }
      return;
    }

    runNavigation(event.key); // simple keyboard nav logic
  });

  // Action line speedlines container
  const speedlines = document.createElement('div');
  speedlines.className = 'speedlines';
  document.body.appendChild(speedlines);
});
