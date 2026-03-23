document.addEventListener('DOMContentLoaded', () => {
  // Interactive Abstract Canvas
  const canvas = document.createElement('canvas');
  canvas.id = 'interactive-canvas';
  document.body.insertBefore(canvas, document.body.firstChild);
  
  const ctx = canvas.getContext('2d');
  let width, height;
  let lines = [];
  
  function resize() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  }
  
  window.addEventListener('resize', resize);
  resize();

  let mouse = { x: width / 2, y: height / 2, moved: false };

  window.addEventListener('mousemove', (e) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
    mouse.moved = true;
  });

  class Line {
    constructor() {
      this.x = Math.random() * width;
      this.y = Math.random() * height;
      this.vx = (Math.random() - 0.5) * 0.5;
      this.vy = (Math.random() - 0.5) * 0.5;
      this.history = [];
      this.maxLength = Math.floor(Math.random() * 30 + 10);
    }
    
    update() {
      // Move towards mouse slightly if moved
      if (mouse.moved) {
        let dx = mouse.x - this.x;
        let dy = mouse.y - this.y;
        let dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 300) {
          this.vx += (dx / dist) * 0.02;
          this.vy += (dy / dist) * 0.02;
        }
      }
      
      // Add chaotic noise
      this.vx += (Math.random() - 0.5) * 0.1;
      this.vy += (Math.random() - 0.5) * 0.1;
      
      // Limit speed
      let speed = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
      if (speed > 2) {
        this.vx = (this.vx / speed) * 2;
        this.vy = (this.vy / speed) * 2;
      }
      
      this.x += this.vx;
      this.y += this.vy;
      
      // Bounce
      if (this.x < 0 || this.x > width) this.vx *= -1;
      if (this.y < 0 || this.y > height) this.vy *= -1;
      
      this.history.push({x: this.x, y: this.y});
      if (this.history.length > this.maxLength) {
        this.history.shift();
      }
    }
    
    draw() {
      if (this.history.length === 0) return;
      ctx.beginPath();
      ctx.moveTo(this.history[0].x, this.history[0].y);
      for (let i = 1; i < this.history.length; i++) {
        ctx.lineTo(this.history[i].x, this.history[i].y);
      }
      ctx.strokeStyle = '#e6e4e0'; // Ink color
      ctx.lineWidth = 0.5;
      ctx.stroke();
    }
  }

  for (let i = 0; i < 40; i++) {
    lines.push(new Line());
  }

  function render() {
    ctx.clearRect(0, 0, width, height);
    for (let i = 0; i < lines.length; i++) {
      lines[i].update();
      lines[i].draw();
    }
    
    // Draw abstract geometric tracking cursor
    if (mouse.moved) {
      ctx.beginPath();
      ctx.moveTo(mouse.x - 20, mouse.y);
      ctx.lineTo(mouse.x + 20, mouse.y);
      ctx.moveTo(mouse.x, mouse.y - 20);
      ctx.lineTo(mouse.x, mouse.y + 20);
      ctx.strokeStyle = '#777777';
      ctx.lineWidth = 1;
      ctx.stroke();
      
      ctx.beginPath();
      ctx.arc(mouse.x, mouse.y, Math.random() * 5 + 5, 0, Math.PI * 2);
      ctx.strokeStyle = '#e6e4e0';
      ctx.stroke();
    }

    requestAnimationFrame(render);
  }
  
  render();
});
