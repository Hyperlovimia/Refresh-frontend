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

/**
 * 绘制风扇
 * @param {CanvasRenderingContext2D} ctx - Canvas 上下文
 * @param {Object} fan - 风扇数据 {x, y, direction, wallAttached, wallSide}
 * @param {number} cellSize - 单元格大小
 * @param {boolean} isSelected - 是否选中
 */
function drawFan(ctx, fan, cellSize, isSelected = false) {
  const pos = gridUtils.gridToPixel(fan.x, fan.y, cellSize)
  const centerX = pos.x + cellSize / 2
  const centerY = pos.y + cellSize / 2

  ctx.save()

  // 绘制扇叶圆圈
  ctx.fillStyle = isSelected ? '#ffebee' : '#90caf9'
  ctx.strokeStyle = isSelected ? '#f44336' : '#1976d2'
  ctx.lineWidth = isSelected ? 3 : 2

  ctx.beginPath()
  ctx.arc(centerX, centerY, cellSize * 0.3, 0, Math.PI * 2)
  ctx.fill()
  ctx.stroke()

  // 绘制朝向箭头（风扇吹风方向）
  ctx.strokeStyle = '#fff'
  ctx.lineWidth = 2
  ctx.lineCap = 'round'

  const arrowSize = cellSize * 0.15
  let angle = 0
  if (fan.direction === 'up') angle = -Math.PI / 2
  else if (fan.direction === 'right') angle = 0
  else if (fan.direction === 'down') angle = Math.PI / 2
  else if (fan.direction === 'left') angle = Math.PI

  ctx.translate(centerX, centerY)
  ctx.rotate(angle)

  ctx.beginPath()
  ctx.moveTo(0, -arrowSize)
  ctx.lineTo(0, arrowSize)
  ctx.moveTo(0, -arrowSize)
  ctx.lineTo(-arrowSize / 2, 0)
  ctx.moveTo(0, -arrowSize)
  ctx.lineTo(arrowSize / 2, 0)
  ctx.stroke()

  ctx.restore()

  // 如果挂墙，绘制墙壁连接线（使用 wallSide 而不是 direction）
  if (fan.wallAttached && fan.wallSide) {
    ctx.save()
    ctx.strokeStyle = '#757575'
    ctx.lineWidth = 1
    ctx.setLineDash([3, 3])

    let wallX = centerX
    let wallY = centerY

    // wallSide 表示墙在哪一侧
    if (fan.wallSide === 'up') wallY = pos.y
    else if (fan.wallSide === 'down') wallY = pos.y + cellSize
    else if (fan.wallSide === 'left') wallX = pos.x
    else if (fan.wallSide === 'right') wallX = pos.x + cellSize

    ctx.beginPath()
    ctx.moveTo(centerX, centerY)
    ctx.lineTo(wallX, wallY)
    ctx.stroke()
    ctx.restore()
  }
}

/**
 * 绘制椅子
 * @param {CanvasRenderingContext2D} ctx - Canvas 上下文
 * @param {Object} chair - 椅子数据 {x, y, direction}
 * @param {number} cellSize - 单元格大小
 * @param {boolean} isSelected - 是否选中
 */
function drawChair(ctx, chair, cellSize, isSelected = false) {
  const pos = gridUtils.gridToPixel(chair.x, chair.y, cellSize)
  const centerX = pos.x + cellSize / 2
  const centerY = pos.y + cellSize / 2

  ctx.save()
  ctx.translate(centerX, centerY)

  // 根据朝向旋转
  let angle = 0
  if (chair.direction === 'right') angle = Math.PI / 2
  else if (chair.direction === 'down') angle = Math.PI
  else if (chair.direction === 'left') angle = -Math.PI / 2
  ctx.rotate(angle)

  ctx.fillStyle = isSelected ? '#ffcdd2' : '#a1887f'
  ctx.strokeStyle = isSelected ? '#f44336' : '#5d4037'
  ctx.lineWidth = isSelected ? 3 : 2

  // 绘制椅背
  ctx.fillRect(-cellSize * 0.3, -cellSize * 0.35, cellSize * 0.6, cellSize * 0.1)
  ctx.strokeRect(-cellSize * 0.3, -cellSize * 0.35, cellSize * 0.6, cellSize * 0.1)

  // 绘制椅座
  ctx.fillRect(-cellSize * 0.3, -cellSize * 0.2, cellSize * 0.6, cellSize * 0.4)
  ctx.strokeRect(-cellSize * 0.3, -cellSize * 0.2, cellSize * 0.6, cellSize * 0.4)

  ctx.restore()
}

/**
 * 绘制桌子
 * @param {CanvasRenderingContext2D} ctx - Canvas 上下文
 * @param {Object} table - 桌子数据 {x, y, direction, width, height}
 * @param {number} cellSize - 单元格大小
 * @param {boolean} isSelected - 是否选中
 */
function drawTable(ctx, table, cellSize, isSelected = false) {
  const pos = gridUtils.gridToPixel(table.x, table.y, cellSize)
  const width = (table.width || 2) * cellSize
  const height = (table.height || 1) * cellSize

  ctx.fillStyle = isSelected ? '#ffe0b2' : '#bcaaa4'
  ctx.strokeStyle = isSelected ? '#f44336' : '#6d4c41'
  ctx.lineWidth = isSelected ? 3 : 2

  // 绘制桌面
  ctx.fillRect(pos.x + cellSize * 0.1, pos.y + cellSize * 0.1, width - cellSize * 0.2, height - cellSize * 0.2)
  ctx.strokeRect(pos.x + cellSize * 0.1, pos.y + cellSize * 0.1, width - cellSize * 0.2, height - cellSize * 0.2)

  // 绘制桌腿
  const legSize = cellSize * 0.08
  ctx.fillStyle = isSelected ? '#ff9800' : '#5d4037'
  ctx.fillRect(pos.x + cellSize * 0.15, pos.y + cellSize * 0.15, legSize, legSize)
  ctx.fillRect(pos.x + width - cellSize * 0.15 - legSize, pos.y + cellSize * 0.15, legSize, legSize)
  ctx.fillRect(pos.x + cellSize * 0.15, pos.y + height - cellSize * 0.15 - legSize, legSize, legSize)
  ctx.fillRect(pos.x + width - cellSize * 0.15 - legSize, pos.y + height - cellSize * 0.15 - legSize, legSize, legSize)
}

/**
 * 绘制床
 * @param {CanvasRenderingContext2D} ctx - Canvas 上下文
 * @param {Object} bed - 床数据 {x, y, direction, width, height}
 * @param {number} cellSize - 单元格大小
 * @param {boolean} isSelected - 是否选中
 */
function drawBed(ctx, bed, cellSize, isSelected = false) {
  const pos = gridUtils.gridToPixel(bed.x, bed.y, cellSize)
  const width = (bed.width || 2) * cellSize
  const height = (bed.height || 3) * cellSize

  ctx.fillStyle = isSelected ? '#f8bbd0' : '#e1bee7'
  ctx.strokeStyle = isSelected ? '#f44336' : '#8e24aa'
  ctx.lineWidth = isSelected ? 3 : 2

  // 绘制床垫
  ctx.fillRect(pos.x + cellSize * 0.05, pos.y + cellSize * 0.05, width - cellSize * 0.1, height - cellSize * 0.1)
  ctx.strokeRect(pos.x + cellSize * 0.05, pos.y + cellSize * 0.05, width - cellSize * 0.1, height - cellSize * 0.1)

  // 绘制枕头区域，根据朝向决定枕头位置
  ctx.fillStyle = isSelected ? '#f48fb1' : '#ce93d8'

  const pillowThickness = cellSize * 0.8
  const margin = cellSize * 0.1

  if (bed.direction === 'up') {
    // 枕头在顶部
    ctx.fillRect(pos.x + margin, pos.y + margin, width - cellSize * 0.2, pillowThickness)
    ctx.strokeRect(pos.x + margin, pos.y + margin, width - cellSize * 0.2, pillowThickness)
  } else if (bed.direction === 'down') {
    // 枕头在底部
    ctx.fillRect(pos.x + margin, pos.y + height - margin - pillowThickness, width - cellSize * 0.2, pillowThickness)
    ctx.strokeRect(pos.x + margin, pos.y + height - margin - pillowThickness, width - cellSize * 0.2, pillowThickness)
  } else if (bed.direction === 'left') {
    // 枕头在左侧
    ctx.fillRect(pos.x + margin, pos.y + margin, pillowThickness, height - cellSize * 0.2)
    ctx.strokeRect(pos.x + margin, pos.y + margin, pillowThickness, height - cellSize * 0.2)
  } else if (bed.direction === 'right') {
    // 枕头在右侧
    ctx.fillRect(pos.x + width - margin - pillowThickness, pos.y + margin, pillowThickness, height - cellSize * 0.2)
    ctx.strokeRect(pos.x + width - margin - pillowThickness, pos.y + margin, pillowThickness, height - cellSize * 0.2)
  }
}

module.exports = {
  drawWall,
  drawRoom,
  drawDoor,
  drawWindow,
  drawFan,
  drawChair,
  drawTable,
  drawBed,
  clearCanvas
}
