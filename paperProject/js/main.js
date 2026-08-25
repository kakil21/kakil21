// ========== 壁纸图片列表（图片放入 img 文件夹）==========
const WALLPAPERS = [
  './img/wallpaper1.jpg',
  './img/wallpaper2.jpg',
  './img/wallpaper3.jpg',
  './img/wallpaper4.jpg',
  './img/wallpaper5.jpg',
  './img/wallpaper6.jpg',
  './img/wallpaper7.jpg',
  './img/wallpaper8.jpg',
];

// ========== DOM 元素 ==========
const imageCanvas   = document.getElementById('imageCanvas');
const scratchCanvas = document.getElementById('scratchCanvas');
const imgCtx        = imageCanvas.getContext('2d');
const scratchCtx   = scratchCanvas.getContext('2d');
const resetBtn     = document.getElementById('resetBtn');
const counter      = document.getElementById('counter');

let currentIndex  = 0;
let isScratching  = false;

// ========== 初始化画布尺寸 ==========
function resizeCanvases() {
  const w = window.innerWidth;
  const h = window.innerHeight;
  imageCanvas.width   = w; imageCanvas.height   = h;
  scratchCanvas.width = w; scratchCanvas.height = h;
}

// ========== 加载并绘制壁纸 ==========
function loadWallpaper(index) {
  const img = new Image();
  img.crossOrigin = 'anonymous';
  img.onload = () => {
    const cw = imageCanvas.width, ch = imageCanvas.height;
    // cover 模式铺满画布
    const scale = Math.max(cw / img.width, ch / img.height);
    const dw = img.width * scale, dh = img.height * scale;
    const dx = (cw - dw) / 2, dy = (ch - dh) / 2;
    imgCtx.clearRect(0, 0, cw, ch);
    imgCtx.drawImage(img, dx, dy, dw, dh);
  };
  img.onerror = () => drawFallbackGradient(index);
  img.src = WALLPAPERS[index % WALLPAPERS.length];
}

// 图片加载失败时的备用渐变背景
function drawFallbackGradient(index) {
  const cw = imageCanvas.width, ch = imageCanvas.height;
  const hues = [210, 330, 45, 160, 270, 20, 190, 300];
  const hue = hues[index % hues.length];
  const grad = imgCtx.createLinearGradient(0, 0, cw, ch);
  grad.addColorStop(0, `hsl(${hue}, 70%, 55%)`);
  grad.addColorStop(1, `hsl(${(hue + 60) % 360}, 60%, 30%)`);
  imgCtx.fillStyle = grad;
  imgCtx.fillRect(0, 0, cw, ch);
  imgCtx.fillStyle = 'rgba(255,255,255,0.12)';
  imgCtx.font = 'bold 52px sans-serif';
  imgCtx.textAlign = 'center';
  imgCtx.textBaseline = 'middle';
  imgCtx.fillText(`壁纸 ${index + 1}`, cw / 2, ch / 2);
}

// ========== 绘制刮刮乐涂层 ==========
function drawScratchLayer() {
  const w = scratchCanvas.width, h = scratchCanvas.height;
  // 金属渐变底色
  const grad = scratchCtx.createLinearGradient(0, 0, w, h);
  grad.addColorStop(0, '#4a4a5a');
  grad.addColorStop(0.5, '#6a6a7a');
  grad.addColorStop(1, '#3a3a4a');
  scratchCtx.fillStyle = grad;
  scratchCtx.fillRect(0, 0, w, h);

  // 噪点纹理
  for (let i = 0; i < 8000; i++) {
    const x = Math.random() * w;
    const y = Math.random() * h;
    scratchCtx.fillStyle = `rgba(255,255,255,${Math.random() * 0.12})`;
    scratchCtx.fillRect(x, y, 1, 1);
  }

  isScratching = false;
}

// ========== 刮开涂层（按住拖动）==========
function scratch(x, y) {
  scratchCtx.globalCompositeOperation = 'destination-out';
  scratchCtx.beginPath();
  scratchCtx.arc(x, y, 30, 0, Math.PI * 2);
  scratchCtx.fill();
  // 散布小圆，刮痕更自然
  for (let i = 0; i < 5; i++) {
    const ox = x + (Math.random() - 0.5) * 40;
    const oy = y + (Math.random() - 0.5) * 40;
    scratchCtx.beginPath();
    scratchCtx.arc(ox, oy, 8 + Math.random() * 12, 0, Math.PI * 2);
    scratchCtx.fill();
  }
  scratchCtx.globalCompositeOperation = 'source-over';
}

// ========== 鼠标事件（按住拖动刮开）==========
scratchCanvas.addEventListener('mousedown', e => {
  isScratching = true;
  scratch(e.clientX, e.clientY);
});
scratchCanvas.addEventListener('mousemove', e => {
  if (isScratching) scratch(e.clientX, e.clientY);
});
window.addEventListener('mouseup', () => { isScratching = false; });

// ========== 触摸事件（手指滑动刮开）==========
scratchCanvas.addEventListener('touchstart', e => {
  e.preventDefault();
  isScratching = true;
  scratch(e.touches[0].clientX, e.touches[0].clientY);
}, { passive: false });
scratchCanvas.addEventListener('touchmove', e => {
  e.preventDefault();
  if (isScratching) scratch(e.touches[0].clientX, e.touches[0].clientY);
}, { passive: false });
window.addEventListener('touchend', () => { isScratching = false; });

// ========== 点击刷新按钮：重新覆盖 + 切换下一张 ==========
resetBtn.addEventListener('click', () => {
  currentIndex = (currentIndex + 1) % WALLPAPERS.length;
  counter.textContent = `第 ${currentIndex + 1} 张 / 共 ${WALLPAPERS.length} 张`;

  const img = new Image();
  img.crossOrigin = 'anonymous';
  img.onload = () => {
    const cw = imageCanvas.width, ch = imageCanvas.height;
    const scale = Math.max(cw / img.width, ch / img.height);
    const dw = img.width * scale, dh = img.height * scale;
    const dx = (cw - dw) / 2, dy = (ch - dh) / 2;
    imgCtx.clearRect(0, 0, cw, ch);
    imgCtx.drawImage(img, dx, dy, dw, dh);
    drawScratchLayer();
  };
  img.onerror = () => {
    drawFallbackGradient(currentIndex);
    drawScratchLayer();
  };
  img.src = WALLPAPERS[currentIndex];

  // 按钮旋转动画
  resetBtn.style.transition = 'transform 0.4s';
  resetBtn.style.transform  = 'rotate(360deg)';
  setTimeout(() => {
    resetBtn.style.transition = '';
    resetBtn.style.transform  = '';
  }, 420);
});

// ========== 启动 ==========
window.addEventListener('resize', () => {
  resizeCanvases();
  loadWallpaper(currentIndex);
  drawScratchLayer();
});

resizeCanvases();
loadWallpaper(currentIndex);
drawScratchLayer();
