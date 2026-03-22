document.addEventListener('DOMContentLoaded', () => {
  const tiles = Array.from(document.querySelectorAll('.manga-tile'));
  let current = 0;

  // Append edgy speech bubbles to each panel
  tiles.forEach((tile) => {
    const bubble = document.createElement('div');
    const texts = ['GOGOGO!!', 'ZAAAP!!', 'SHK!', 'DOOOM', 'KRAK!', 'SHT!'];
    bubble.textContent = texts[Math.floor(Math.random() * texts.length)];
    bubble.className = 'speech-bubble';
    
    // Position randomly on the left or the right
    if (Math.random() > 0.5) {
        bubble.style.right = '10%';
    } else {
        bubble.style.left = '10%';
    }
    // Random height near the top
    bubble.style.top = Math.floor(Math.random() * 15 + 5) + '%';
    
    tile.appendChild(bubble);
  });

  if (tiles.length > 0) {
    tiles[0].classList.add('active');
  }

  function updateActiveTile(index) {
    tiles.forEach((tile, idx) => tile.classList.toggle('active', idx === index));
    if (tiles[index]) tiles[index].focus();
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

    if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
        current = (current + 1) % tiles.length;
    } else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
        current = (current - 1 + tiles.length) % tiles.length;
    }
    updateActiveTile(current);
  });
});
