document.addEventListener("DOMContentLoaded", () => {
  const canvas = document.getElementById('scratch-canvas');
  const ctx = canvas.getContext('2d');
  const container = document.querySelector('.scratch-container');
  const resetBtn = document.getElementById('reset-btn');

  let isDrawing = false;
  let btnRevealed = false; // 按钮区域是否已被刮开

  // 1. 初始化画布尺寸和涂层
  function initCanvas() {
    // 获取容器的实际宽高
    const width = container.offsetWidth;
    const height = container.offsetHeight;

    // 设置 canvas 的实际像素大小（防止模糊）
    canvas.width = width;
    canvas.height = height;

    // 绘制灰色涂层
    ctx.fillStyle = '#CCCCCC'; // 涂层颜色
    ctx.fillRect(0, 0, width, height);

    // 在涂层上写字
    ctx.font = '24px Arial';
    ctx.fillStyle = '#666';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('刮一刮', width / 2, height / 2);

    // 设置画笔模式： destination-out 表示新绘制的内容会变透明
    ctx.globalCompositeOperation = 'destination-out';
    ctx.lineWidth = 30; // 笔触大小
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
  }

  // 2. 获取坐标工具函数
  function getPos(e) {
    const rect = canvas.getBoundingClientRect();
    let clientX, clientY;

    if (e.touches && e.touches.length > 0) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    return {
      x: clientX - rect.left,
      y: clientY - rect.top
    };
  }

  // 3. 开始刮
  function startScratch(e) {
    isDrawing = true;
    const pos = getPos(e);
    ctx.beginPath();
    ctx.moveTo(pos.x, pos.y);
    e.preventDefault(); // 防止手机端滚动页面
  }

  // 4. 正在刮
  function moveScratch(e) {
    if (!isDrawing) return;
    const pos = getPos(e);
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
    e.preventDefault();

    // 刮的同时检测按钮区域是否已被刮开
    checkButtonRevealed();
  }

  // 5. 结束刮
  function endScratch() {
    isDrawing = false;
    ctx.closePath();
  }

  // 6. 检测按钮所在区域是否已被刮开（透明像素超过一半则显示按钮）
  function checkButtonRevealed() {
    if (btnRevealed) return;

    // 计算按钮在画布坐标系中的区域
    const btnRect = resetBtn.getBoundingClientRect();
    const canvasRect = canvas.getBoundingClientRect();
    const x = Math.max(0, Math.floor(btnRect.left - canvasRect.left));
    const y = Math.max(0, Math.floor(btnRect.top - canvasRect.top));
    const w = Math.min(canvas.width - x, Math.ceil(btnRect.width));
    const h = Math.min(canvas.height - y, Math.ceil(btnRect.height));
    if (w <= 0 || h <= 0) return;

    // 间隔采样像素，避免逐像素检测造成卡顿
    const data = ctx.getImageData(x, y, w, h).data;
    const step = 4;
    let transparent = 0;
    let total = 0;
    for (let py = 0; py < h; py += step) {
      for (let px = 0; px < w; px += step) {
        total++;
        if (data[(py * w + px) * 4 + 3] < 128) transparent++; // alpha 小于半透明即视为已刮开
      }
    }

    if (transparent / total >= 0.5) {
      btnRevealed = true;
      resetBtn.classList.add('visible'); // 提升到画布之上，变为可点击
    }
  }

  // 7. 重新覆盖：重绘涂层，并把按钮重新藏起来
  function resetScratch() {
    btnRevealed = false;
    resetBtn.classList.remove('visible');
    initCanvas();
  }

  // 初始化
  initCanvas();

  // 窗口大小变化时重新适配画布（全屏模式下拖动窗口边缘也能保持覆盖）
  window.addEventListener('resize', resetScratch);

  // 按钮点击：重新覆盖图层
  resetBtn.addEventListener('click', resetScratch);

  // 绑定鼠标事件 (PC)
  canvas.addEventListener('mousedown', startScratch);
  canvas.addEventListener('mousemove', moveScratch);
  canvas.addEventListener('mouseup', endScratch);
  canvas.addEventListener('mouseleave', endScratch);

  // 绑定触摸事件 (手机)
  canvas.addEventListener('touchstart', startScratch, { passive: false });
  canvas.addEventListener('touchmove', moveScratch, { passive: false });
  canvas.addEventListener('touchend', endScratch);
});
