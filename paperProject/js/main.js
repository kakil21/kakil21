// ========== 壁纸图片列表（请将图片放入 img 文件夹）==========
// 文件名格式：wallpaper1.jpg, wallpaper2.jpg, ...
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

const imageCanvas   = document.getElementById('imageCanvas');
const scratchCanvas = document.getElementById('scratchCanvas');
const imgCtx        = imageCanvas.getContext('2d');
const scratchCtx   = scratchCanvas.getContext('2d');
const resetBtn     = document.getElementById('resetBtn');
const counter      = document.getElementById('counter');
const hint         = document.getElementById('hint');

let currentIndex  = 0;
let isScratching  = false;
let totalPixels   = 0;

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
    // 按比例铺满（cover 效果）
    const cw = imageCanvas.width, ch = imageCanvas.height;
    const scale = Math.max(cw / img.width, ch / img.height);
    const dw = img.width * scale, dh = img.height * scale;
    const dx = (cw - dw) / 2, dy = (ch - dh) / 2;
    imgCtx.clearRect(0, 0, cw, ch);
    imgCtx.drawImage(img, dx, dy, dw, dh);
  };
  img.onerror = () => {
    // 加载失败时使用渐变色代替
    drawFallbackGradient(index);
  };
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
  imgCtx.fillStyle = 'rgba(255,255,255,0.15)';
  imgCtx.font = 'bold 48px sans-serif';
  imgCtx.textAlign = 'center';
  imgCtx.fillText(`壁纸 ${index + 1}`, cw / 2, ch / 2);
}

// ========== 绘制刮刮乐涂层 ==========
function drawScratchLayer() {
  const w = scratchCanvas.width, h = scratchCanvas.height;
  // 深灰金属质感涂层
  const grad = scratchCtx.createLinearGradient(0, 0, w, h);
  grad.addColorStop(0, '#4a4a5a');
  grad.addColorStop(0.5, '#6a6a7a');
  grad.addColorStop(1, '#3a3a4a');
  scratchCtx.fillStyle = grad;
  scratchCtx.fillRect(0, 0, w, h);

  // 添加细微噪点纹理
  for (let i = 0; i < 8000; i++) {
    const x = Math.random() * w;
    const y = Math.random() * h;
    const alpha = Math.random() * 0.12;
    scratchCtx.fillStyle = `rgba(255,255,255,${alpha})`;
    scratchCtx.fillRect(x, y, 1, 1);
  }

  // 中央提示文字
  scratchCtx.fillStyle = 'rgba(255,255,255,0.35)';
  scratchCtx.font = 'bold 22px sans-serif';
  scratchCtx.textAlign = 'center';
  scratchCtx.textBaseline = 'middle';
  scratchCtx.fillText('✨ 刮开此处查看壁纸 ✨', w / 2, h / 2);
}

// ========== 刮刮乐交互逻辑 ==========
function scratch(x, y) {
  scratchCtx.globalCompositeOperation = 'destination-out';
  scratchCtx.beginPath();
  scratchCtx.arc(x, y, 22, 0, Math.PI * 2);
  scratchCtx.fill();

  // 额外散布几个小圆，让刮痕更自然
  for (let i = 0; i < 4; i++) {
    const ox = x + (Math.random() - 0.5) * 30;
    const oy = y + (Math.random() - 0.5) * 30;
    scratchCtx.beginPath();
    scratchCtx.arc(ox, oy, 8 + Math.random() * 8, 0, Math.PI * 2);
    scratchCtx.fill();
  }
  scratchCtx.globalCompositeOperation = 'source-over';
}

// 鼠标事件
scratchCanvas.addEventListener('mousedown', e => {
  isScratching = true;
  scratch(e.clientX, e.clientY);
});
scratchCanvas.addEventListener('mousemove', e => {
  if (isScratching) scratch(e.clientX, e.clientY);
});
window.addEventListener('mouseup', () => { isScratching = false; });

// 触摸事件
scratchCanvas.addEventListener('touchstart', e => {
  e.preventDefault();
  isScratching = true;
  const t = e.touches[0];
  scratch(t.clientX, t.clientY);
}, { passive: false });
scratchCanvas.addEventListener('touchmove', e => {
  e.preventDefault();
  if (isScratching) {
    const t = e.touches[0];
    scratch(t.clientX, t.clientY);
  }
}, { passive: false });
window.addEventListener('touchend', () => { isScratching = false; });

// ========== 重新覆盖 & 轮换下一张 ==========
resetBtn.addEventListener('click', () => {
  // 切换到下一张
  currentIndex = (currentIndex + 1) % WALLPAPERS.length;
  counter.textContent = `第 ${currentIndex + 1} 张 / 共 ${WALLPAPERS.length} 张`;

  // 先加载新壁纸，再重绘涂层
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

  // 按钮旋转动画反馈
  resetBtn.style.transition = 'transform 0.4s';
  resetBtn.style.transform = 'rotate(360deg)';
  setTimeout(() => {
    resetBtn.style.transition = '';
    resetBtn.style.transform = '';
  }, 420);
});

// ========== 启动游戏 ==========
window.addEventListener('resize', () => {
  resizeCanvases();
  loadWallpaper(currentIndex);
  drawScratchLayer();
});

// 初始显示提示
hint.classList.add('show');
setTimeout(() => hint.classList.remove('show'), 2500);

resizeCanvases();
loadWallpaper(currentIndex);
drawScratchLayer();
