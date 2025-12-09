/**
 * 绘制工具模块
 * 负责在 Canvas 上绘制各种元素
 */

const gridUtils = require('./grid.js')

/**
 * 绘制墙壁
 * @param {CanvasRenderingContext2D} ctx - Canvas 上下文
 * @param {Object} wall - 墙壁数据 {startX, startY, endX, endY}
 * @param {number} cellSize - 单元格大小
 * @param {string} color - 墙壁颜色
 * @param {boolean} isSelected - 是否选中
 */
function drawWall(ctx, wall, cellSize, color = '#424242', isSelected = false) {
  const start = gridUtils.gridToPixel(wall.startX, wall.startY, cellSize)
  const end = gridUtils.gridToPixel(wall.endX, wall.endY, cellSize)

  ctx.strokeStyle = isSelected ? '#f44336' : color
  ctx.lineWidth = isSelected ? 8 : 6
  ctx.lineCap = 'round'

  ctx.beginPath()
  ctx.moveTo(start.x + cellSize / 2, start.y + cellSize / 2)
  ctx.lineTo(end.x + cellSize / 2, end.y + cellSize / 2)
  ctx.stroke()
}

/**
 * 绘制房间
 * @param {CanvasRenderingContext2D} ctx - Canvas 上下文
 * @param {Object} room - 房间数据 {x, y, width, height}
 * @param {number} cellSize - 单元格大小
 * @param {string} color - 房间颜色
 * @param {boolean} isSelected - 是否选中
 */
function drawRoom(ctx, room, cellSize, color = '#e0e0e0', isSelected = false) {
  const pos = gridUtils.gridToPixel(room.x, room.y, cellSize)
  const width = room.width * cellSize
  const height = room.height * cellSize

  // 填充房间
  ctx.fillStyle = isSelected ? '#ffebee' : color
  ctx.fillRect(pos.x, pos.y, width, height)

  // 绘制边框
  ctx.strokeStyle = isSelected ? '#f44336' : '#bdbdbd'
  ctx.lineWidth = isSelected ? 3 : 2
  ctx.strokeRect(pos.x, pos.y, width, height)
}

/**
 * 绘制门
 * @param {CanvasRenderingContext2D} ctx - Canvas 上下文
 * @param {Object} door - 门数据 {x, y, direction}
 * @param {number} cellSize - 单元格大小
 * @param {string} color - 门颜色
 * @param {boolean} isSelected - 是否选中
 */
function drawDoor(ctx, door, cellSize, color = '#8d6e63', isSelected = false) {
  const pos = gridUtils.gridToPixel(door.x, door.y, cellSize)
  const centerX = pos.x + cellSize / 2
  const centerY = pos.y + cellSize / 2

  ctx.fillStyle = isSelected ? '#ffcdd2' : color
  ctx.strokeStyle = isSelected ? '#f44336' : '#5d4037'
  ctx.lineWidth = isSelected ? 3 : 2

  if (door.direction === 'horizontal') {
    // 水平门
    ctx.fillRect(pos.x + cellSize * 0.1, pos.y + cellSize * 0.3, cellSize * 0.8, cellSize * 0.4)
    ctx.strokeRect(pos.x + cellSize * 0.1, pos.y + cellSize * 0.3, cellSize * 0.8, cellSize * 0.4)
  } else {
    // 垂直门
    ctx.fillRect(pos.x + cellSize * 0.3, pos.y + cellSize * 0.1, cellSize * 0.4, cellSize * 0.8)
    ctx.strokeRect(pos.x + cellSize * 0.3, pos.y + cellSize * 0.1, cellSize * 0.4, cellSize * 0.8)
  }

  // 绘制门把手
  ctx.fillStyle = '#333'
  if (door.direction === 'horizontal') {
    ctx.fillRect(centerX - 3, centerY - 3, 6, 6)
  } else {
    ctx.fillRect(centerX - 3, centerY - 3, 6, 6)
  }
}

/**
 * 绘制窗户
 * @param {CanvasRenderingContext2D} ctx - Canvas 上下文
 * @param {Object} window - 窗户数据 {x, y, direction}
 * @param {number} cellSize - 单元格大小
 * @param {string} color - 窗户颜色
 * @param {boolean} isSelected - 是否选中
 */
function drawWindow(ctx, window, cellSize, color = '#64b5f6', isSelected = false) {
  const pos = gridUtils.gridToPixel(window.x, window.y, cellSize)

  ctx.fillStyle = isSelected ? '#e3f2fd' : color
  ctx.strokeStyle = isSelected ? '#f44336' : '#1976d2'
  ctx.lineWidth = isSelected ? 3 : 2

  if (window.direction === 'horizontal') {
    // 水平窗户
    ctx.fillRect(pos.x + cellSize * 0.1, pos.y + cellSize * 0.2, cellSize * 0.8, cellSize * 0.6)
    ctx.strokeRect(pos.x + cellSize * 0.1, pos.y + cellSize * 0.2, cellSize * 0.8, cellSize * 0.6)

    // 窗框
    ctx.beginPath()
    ctx.moveTo(pos.x + cellSize / 2, pos.y + cellSize * 0.2)
    ctx.lineTo(pos.x + cellSize / 2, pos.y + cellSize * 0.8)
    ctx.stroke()
  } else {
    // 垂直窗户
    ctx.fillRect(pos.x + cellSize * 0.2, pos.y + cellSize * 0.1, cellSize * 0.6, cellSize * 0.8)
    ctx.strokeRect(pos.x + cellSize * 0.2, pos.y + cellSize * 0.1, cellSize * 0.6, cellSize * 0.8)

    // 窗框
    ctx.beginPath()
    ctx.moveTo(pos.x + cellSize * 0.2, pos.y + cellSize / 2)
    ctx.lineTo(pos.x + cellSize * 0.8, pos.y + cellSize / 2)
    ctx.stroke()
  }
}

/**
 * 清空画布
 * @param {CanvasRenderingContext2D} ctx - Canvas 上下文
 * @param {number} width - 画布宽度
 * @param {number} height - 画布高度
 */
function clearCanvas(ctx, width, height) {
  ctx.clearRect(0, 0, width, height)
  ctx.fillStyle = '#ffffff'
  ctx.fillRect(0, 0, width, height)
}

module.exports = {
  drawWall,
  drawRoom,
  drawDoor,
  drawWindow,
  clearCanvas
}
