const fs = require('fs');
let code = fs.readFileSync('scripts.js', 'utf8');

// replace the target radius physics
code = code.replace(
  `  let currentRadiusMultiplier = 0.4;

  // Main render loop
  function render() {
    ctx.clearRect(0, 0, width, height);

    let currentTargetRadiusMultiplier = 0.4;

    // Heat and Radius Physics 
    if (!hasInteracted) {
      let time = Date.now() * 0.002;
      mouse.x = width / 2 + Math.sin(time * 0.7) * (width * 0.15);
      mouse.y = height / 2 + Math.cos(time * 0.5) * (height * 0.15);
      heat = 0.25 + Math.sin(time * 1.5) * 0.1; 
      currentTargetRadiusMultiplier = 0.2;
    } else {
      if (isDown) {
        heat += 0.04;
        if (heat > 1) heat = 1;
        currentTargetRadiusMultiplier = 0.4 + (heat * 0.4);
      } else if (isHoveringBlock) {
        if (heat < 0.5) heat += 0.008;     
        else if (heat > 0.5) heat -= 0.0035; 
        currentTargetRadiusMultiplier = 0.22; 
      } else {
        heat -= 0.0035; 
        if (heat < 0) heat = 0;
        currentTargetRadiusMultiplier = 0.4 + (heat * 0.4);
      }
    }`,
  `  let currentRadiusMultiplier = 0.4;
  let targetRadius = 0.4;

  // Main render loop
  function render() {
    ctx.clearRect(0, 0, width, height);

    let currentTargetRadiusMultiplier = targetRadius;

    // Heat and Radius Physics 
    if (!hasInteracted) {
      let time = Date.now() * 0.002;
      mouse.x = width / 2 + Math.sin(time * 0.7) * (width * 0.15);
      mouse.y = height / 2 + Math.cos(time * 0.5) * (height * 0.15);
      heat = 0.25 + Math.sin(time * 1.5) * 0.1; 
      currentTargetRadiusMultiplier = 0.2;
    } else {
      if (isDown) {
        heat += 0.04;
        if (heat > 1) heat = 1;
        targetRadius = 0.4 + (heat * 0.4);
        currentTargetRadiusMultiplier = targetRadius;
      } else if (isHoveringBlock) {
        if (heat < 0.5) heat += 0.008;     
        else if (heat > 0.5) heat -= 0.0035; 
        targetRadius = 0.22; 
        currentTargetRadiusMultiplier = targetRadius;
      } else {
        heat -= 0.0035; 
        if (heat < 0) heat = 0;
        currentTargetRadiusMultiplier = targetRadius;
      }
    }`
);

fs.writeFileSync('scripts.js', code);
