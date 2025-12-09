/**
 * 网格计算工具模块
 * 负责网格坐标与像素坐标之间的转换
 */

/**
 * 格子坐标转像素坐标
 * @param {number} gridX - 格子 X 坐标
 * @param {number} gridY - 格子 Y 坐标
 * @param {number} cellSize - 单元格大小(像素)
 * @returns {{x: number, y: number}} 像素坐标
 */
function gridToPixel(gridX, gridY, cellSize) {
  return {
    x: gridX * cellSize,
    y: gridY * cellSize
  }
}

/**
 * 像素坐标转格子坐标(吸附到最近的格子)
 * @param {number} pixelX - 像素 X 坐标
 * @param {number} pixelY - 像素 Y 坐标
 * @param {number} cellSize - 单元格大小(像素)
 * @returns {{x: number, y: number}} 格子坐标
 */
function pixelToGrid(pixelX, pixelY, cellSize) {
  return {
    x: Math.floor(pixelX / cellSize),
    y: Math.floor(pixelY / cellSize)
  }
}

/**
 * 计算画布尺寸
 * @param {number} gridSize - 网格数量(如20表示20x20)
 * @param {number} cellSize - 单元格大小(像素)
 * @returns {{width: number, height: number}} 画布尺寸
 */
function calculateCanvasSize(gridSize, cellSize) {
  const size = gridSize * cellSize
  return {
    width: size,
    height: size
  }
}

/**
 * 检查格子坐标是否在有效范围内
 * @param {number} gridX - 格子 X 坐标
 * @param {number} gridY - 格子 Y 坐标
 * @param {number} gridSize - 网格大小
 * @returns {boolean} 是否有效
 */
function isValidGridCoord(gridX, gridY, gridSize) {
  return gridX >= 0 && gridX < gridSize && gridY >= 0 && gridY < gridSize
}

/**
 * 绘制网格线
 * @param {CanvasRenderingContext2D} ctx - Canvas 上下文
 * @param {number} gridSize - 网格数量
 * @param {number} cellSize - 单元格大小
 * @param {string} color - 网格线颜色
 */
function drawGrid(ctx, gridSize, cellSize, color = '#e0e0e0') {
  const canvasSize = gridSize * cellSize

  ctx.strokeStyle = color
  ctx.lineWidth = 1

  // 绘制垂直线
  for (let i = 0; i <= gridSize; i++) {
    const x = i * cellSize
    ctx.beginPath()
    ctx.moveTo(x, 0)
    ctx.lineTo(x, canvasSize)
    ctx.stroke()
  }

  // 绘制水平线
  for (let i = 0; i <= gridSize; i++) {
    const y = i * cellSize
    ctx.beginPath()
    ctx.moveTo(0, y)
    ctx.lineTo(canvasSize, y)
    ctx.stroke()
  }
}

module.exports = {
  gridToPixel,
  pixelToGrid,
  calculateCanvasSize,
  isValidGridCoord,
  drawGrid
}
