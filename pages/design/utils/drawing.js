/**
 * 绘制工具模块
 * 负责在 Canvas 上绘制各种元素
 */

const gridUtils = require('./grid.js')

/**
 * 绘制墙壁
 * @param {CanvasRenderingContext2D} ctx - Canvas 上下文
 * @param {Object} wall - 墙壁数据 {x, y, width, height}
 * @param {number} cellSize - 单元格大小
 * @param {string} color - 墙壁颜色
 * @param {boolean} isSelected - 是否选中
 */
function drawWall(ctx, wall, cellSize, color = '#000000', isSelected = false) {
  const pos = gridUtils.gridToPixel(wall.x, wall.y, cellSize)
  const width = wall.width * cellSize
  const height = wall.height * cellSize

  // 填充墙壁区域
  ctx.fillStyle = isSelected ? '#f44336' : color
  ctx.fillRect(pos.x, pos.y, width, height)

  // 墙壁边框
  ctx.strokeStyle = isSelected ? '#c62828' : color
  ctx.lineWidth = isSelected ? 3 : 2
  ctx.strokeRect(pos.x, pos.y, width, height)
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
 * @param {Object} door - 门数据 {x, y, width, height, type}
 * @param {number} cellSize - 单元格大小
 * @param {string} color - 门颜色
 * @param {boolean} isSelected - 是否选中
 */
function drawDoor(ctx, door, cellSize, color = '#964B00', isSelected = false) {
  const pos = gridUtils.gridToPixel(door.x, door.y, cellSize)
  const width = (door.width || 1) * cellSize
  const height = (door.height || 1) * cellSize

  // 填充门区域（占满整个格子）
  ctx.fillStyle = isSelected ? '#ffcdd2' : color
  ctx.fillRect(pos.x, pos.y, width, height)

  // 绘制门把手
  ctx.fillStyle = '#DAA520'
  ctx.beginPath()
  ctx.arc(
    pos.x + width - cellSize * 0.3,
    pos.y + height / 2,
    3, 0, Math.PI * 2
  )
  ctx.fill()

  // 绘制边框
  if (isSelected) {
    ctx.strokeStyle = '#f44336'
    ctx.lineWidth = 3
    ctx.strokeRect(pos.x, pos.y, width, height)
  }
}

/**
 * 绘制窗户
 * @param {CanvasRenderingContext2D} ctx - Canvas 上下文
 * @param {Object} window - 窗户数据 {x, y, width, height, type}
 * @param {number} cellSize - 单元格大小
 * @param {string} color - 窗户颜色
 * @param {boolean} isSelected - 是否选中
 */
function drawWindow(ctx, window, cellSize, color = '#87CEEB', isSelected = false) {
  const pos = gridUtils.gridToPixel(window.x, window.y, cellSize)
  const width = (window.width || 1) * cellSize
  const height = (window.height || 1) * cellSize

  // 绘制窗户边框（占满整个格子）
  ctx.strokeStyle = isSelected ? '#f44336' : color
  ctx.lineWidth = isSelected ? 3 : 3
  ctx.strokeRect(pos.x, pos.y, width, height)

  // 绘制窗户分格
  ctx.strokeStyle = isSelected ? '#f44336' : '#4682B4'
  ctx.lineWidth = isSelected ? 2 : 1

  // 垂直分割线
  ctx.beginPath()
  ctx.moveTo(pos.x + width / 2, pos.y)
  ctx.lineTo(pos.x + width / 2, pos.y + height)
  ctx.stroke()

  // 水平分割线
  ctx.beginPath()
  ctx.moveTo(pos.x, pos.y + height / 2)
  ctx.lineTo(pos.x + width, pos.y + height / 2)
  ctx.stroke()
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
 * @param {Object} fan - 风扇数据，支持原始系统格式
 * @param {number} cellSize - 单元格大小
 * @param {boolean} isSelected - 是否选中
 */
function drawFan(ctx, fan, cellSize, isSelected = false) {
  let centerX, centerY

  // 支持原始系统的挂墙风扇格式
  if (fan.mount_cell_x !== undefined && fan.mount_cell_y !== undefined && fan.mount_face) {
    const mx = fan.mount_cell_x
    const my = fan.mount_cell_y
    const face = fan.mount_face

    // 根据挂墙面计算风扇中心位置
    if (face === 'N') {
      centerX = mx * cellSize + cellSize / 2
      centerY = my * cellSize - cellSize * 0.4
    } else if (face === 'S') {
      centerX = mx * cellSize + cellSize / 2
      centerY = (my + 1) * cellSize + cellSize * 0.4
    } else if (face === 'W') {
      centerX = mx * cellSize - cellSize * 0.4
      centerY = my * cellSize + cellSize / 2
    } else { // 'E'
      centerX = (mx + 1) * cellSize + cellSize * 0.4
      centerY = my * cellSize + cellSize / 2
    }
  } else {
    // 兼容当前系统格式
    const pos = gridUtils.gridToPixel(fan.x || 0, fan.y || 0, cellSize)
    centerX = pos.x + cellSize / 2
    centerY = pos.y + cellSize / 2
  }

  const radius = cellSize * 0.3

  ctx.save()

  // 绘制风扇底座
  ctx.fillStyle = isSelected ? '#ffebee' : '#708090'
  ctx.beginPath()
  ctx.arc(centerX, centerY, radius * 0.3, 0, Math.PI * 2)
  ctx.fill()

  // 绘制风扇中心
  ctx.fillStyle = isSelected ? '#f44336' : '#2F4F4F'
  ctx.beginPath()
  ctx.arc(centerX, centerY, radius * 0.15, 0, Math.PI * 2)
  ctx.fill()

  // 绘制风扇叶片（静态表示）
  ctx.fillStyle = isSelected ? '#90caf9' : '#4682B4'
  const bladeAngles = [0, 120, 240]
  bladeAngles.forEach(angle => {
    ctx.save()
    ctx.translate(centerX, centerY)
    ctx.rotate((angle * Math.PI) / 180)

    ctx.beginPath()
    ctx.moveTo(0, 0)
    ctx.lineTo(radius * 0.8, -radius * 0.1)
    ctx.lineTo(radius * 0.8, radius * 0.1)
    ctx.closePath()
    ctx.fill()

    ctx.restore()
  })

  // 绘制风扇方向指示器
  ctx.fillStyle = '#FF0000'
  ctx.font = 'bold 16px Arial'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'

  const directionSymbols = {
    'N': '↑', 'NE': '↗', 'E': '→', 'SE': '↘',
    'S': '↓', 'SW': '↙', 'W': '←', 'NW': '↖', 'C': '●',
    // 兼容当前系统的方向命名
    'up': '↑', 'right': '→', 'down': '↓', 'left': '←'
  }

  const direction = fan.default_direction || fan.direction || 'C'
  ctx.fillText(
    directionSymbols[direction] || '●',
    centerX,
    centerY + radius + 15
  )

  ctx.restore()

  // 如果是挂墙风扇，绘制到墙体的连接线
  if (fan.mount_face && fan.mount_cell_x !== undefined && fan.mount_cell_y !== undefined) {
    ctx.save()
    ctx.strokeStyle = '#757575'
    ctx.lineWidth = 1
    ctx.setLineDash([3, 3])

    const mx = fan.mount_cell_x
    const my = fan.mount_cell_y
    let wallX = mx * cellSize + cellSize / 2
    let wallY = my * cellSize + cellSize / 2

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
 * @param {Object} chair - 椅子数据 {x, y, orientation}
 * @param {number} cellSize - 单元格大小
 * @param {boolean} isSelected - 是否选中
 */
function drawChair(ctx, chair, cellSize, isSelected = false) {
  const pos = gridUtils.gridToPixel(chair.x, chair.y, cellSize)
  const centerX = pos.x + cellSize / 2
  const centerY = pos.y + cellSize / 2

  ctx.save()
  ctx.translate(centerX, centerY)

  // 根据朝向旋转，支持原始系统的 N/E/S/W 格式
  let angle = 0
  const orientation = chair.orientation || chair.direction || 'N'
  if (orientation === 'E' || orientation === 'right') angle = Math.PI / 2
  else if (orientation === 'S' || orientation === 'down') angle = Math.PI
  else if (orientation === 'W' || orientation === 'left') angle = -Math.PI / 2
  // N 或 up 默认为 0

  ctx.rotate(angle)

  ctx.fillStyle = isSelected ? '#ffcdd2' : '#A0522D'
  ctx.strokeStyle = isSelected ? '#f44336' : '#8B4513'
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
 * @param {Object} table - 桌子数据 {x, y, orientation, width, height}
 * @param {number} cellSize - 单元格大小
 * @param {boolean} isSelected - 是否选中
 */
function drawTable(ctx, table, cellSize, isSelected = false) {
  const pos = gridUtils.gridToPixel(table.x, table.y, cellSize)
  const width = (table.width || 2) * cellSize
  const height = (table.height || 1) * cellSize

  ctx.fillStyle = isSelected ? '#ffe0b2' : '#8B4513'
  ctx.strokeStyle = isSelected ? '#f44336' : '#654321'
  ctx.lineWidth = isSelected ? 3 : 2

  // 绘制桌面（占满格子）
  ctx.fillRect(pos.x, pos.y, width, height)
  ctx.strokeRect(pos.x, pos.y, width, height)

  // 绘制桌腿
  const legSize = cellSize * 0.2
  ctx.fillStyle = isSelected ? '#ff9800' : '#654321'
  
  // 四个角的桌腿
  ctx.fillRect(pos.x, pos.y, legSize, legSize)
  ctx.fillRect(pos.x + width - legSize, pos.y, legSize, legSize)
  ctx.fillRect(pos.x, pos.y + height - legSize, legSize, legSize)
  ctx.fillRect(pos.x + width - legSize, pos.y + height - legSize, legSize, legSize)
}

/**
 * 绘制床
 * @param {CanvasRenderingContext2D} ctx - Canvas 上下文
 * @param {Object} bed - 床数据 {x, y, orientation, width, height}
 * @param {number} cellSize - 单元格大小
 * @param {boolean} isSelected - 是否选中
 */
function drawBed(ctx, bed, cellSize, isSelected = false) {
  const pos = gridUtils.gridToPixel(bed.x, bed.y, cellSize)
  const width = (bed.width || 2) * cellSize
  const height = (bed.height || 3) * cellSize

  ctx.fillStyle = isSelected ? '#f8bbd0' : '#9370DB'
  ctx.strokeStyle = isSelected ? '#f44336' : '#6A5ACD'
  ctx.lineWidth = isSelected ? 3 : 2

  // 绘制床垫（占满格子）
  ctx.fillRect(pos.x, pos.y, width, height)
  ctx.strokeRect(pos.x, pos.y, width, height)

  // 绘制床的细节
  ctx.fillStyle = isSelected ? '#f48fb1' : '#6A5ACD'
  ctx.fillRect(pos.x, pos.y, width, cellSize * 0.3)

  // 绘制枕头区域，根据朝向决定枕头位置
  ctx.fillStyle = isSelected ? '#ffcdd2' : '#F0F8FF'

  const orientation = bed.orientation || bed.direction || 'N'
  const pillowSize = cellSize * 0.6
  const margin = cellSize * 0.2

  if (orientation === 'N' || orientation === 'up') {
    // 枕头在顶部
    ctx.fillRect(pos.x + margin, pos.y + margin, pillowSize, cellSize * 0.5)
    ctx.strokeRect(pos.x + margin, pos.y + margin, pillowSize, cellSize * 0.5)
  } else if (orientation === 'S' || orientation === 'down') {
    // 枕头在底部
    ctx.fillRect(pos.x + margin, pos.y + height - margin - cellSize * 0.5, pillowSize, cellSize * 0.5)
    ctx.strokeRect(pos.x + margin, pos.y + height - margin - cellSize * 0.5, pillowSize, cellSize * 0.5)
  } else if (orientation === 'W' || orientation === 'left') {
    // 枕头在左侧
    ctx.fillRect(pos.x + margin, pos.y + margin, cellSize * 0.5, pillowSize)
    ctx.strokeRect(pos.x + margin, pos.y + margin, cellSize * 0.5, pillowSize)
  } else if (orientation === 'E' || orientation === 'right') {
    // 枕头在右侧
    ctx.fillRect(pos.x + width - margin - cellSize * 0.5, pos.y + margin, cellSize * 0.5, pillowSize)
    ctx.strokeRect(pos.x + width - margin - cellSize * 0.5, pos.y + margin, cellSize * 0.5, pillowSize)
  }
}

/**
 * 绘制热力图
 * @param {CanvasRenderingContext2D} ctx - Canvas 上下文
 * @param {Object} heatmapData - 热力图数据 { grid: number[][], minValue, maxValue, unit }
 * @param {number} gridSize - 网格大小（行列数）
 * @param {number} cellSize - 单元格大小
 */
function drawHeatmap(ctx, heatmapData, gridSize, cellSize) {
  if (!heatmapData || !heatmapData.grid) return

  const { grid, minValue, maxValue } = heatmapData
  const range = maxValue - minValue

  // 遍历热力图网格
  for (let y = 0; y < grid.length; y++) {
    for (let x = 0; x < grid[y].length; x++) {
      const value = grid[y][x]

      // 归一化值到 0-1 范围
      const normalized = range > 0 ? (value - minValue) / range : 0.5

      // 颜色映射：蓝色(低) -> 绿色(中) -> 黄色 -> 红色(高)
      const color = valueToColor(normalized)

      // 绘制格子（半透明叠加）
      const pos = gridUtils.gridToPixel(x, y, cellSize)
      ctx.fillStyle = color
      ctx.fillRect(pos.x, pos.y, cellSize, cellSize)
    }
  }
}

/**
 * 将归一化值(0-1)映射为颜色
 * @param {number} value - 归一化值 [0, 1]
 * @returns {string} - RGBA 颜色字符串
 */
function valueToColor(value) {
  // 颜色梯度：蓝 -> 青 -> 绿 -> 黄 -> 红
  let r, g, b

  if (value < 0.25) {
    // 蓝色 -> 青色
    const t = value / 0.25
    r = 0
    g = Math.floor(255 * t)
    b = 255
  } else if (value < 0.5) {
    // 青色 -> 绿色
    const t = (value - 0.25) / 0.25
    r = 0
    g = 255
    b = Math.floor(255 * (1 - t))
  } else if (value < 0.75) {
    // 绿色 -> 黄色
    const t = (value - 0.5) / 0.25
    r = Math.floor(255 * t)
    g = 255
    b = 0
  } else {
    // 黄色 -> 红色
    const t = (value - 0.75) / 0.25
    r = 255
    g = Math.floor(255 * (1 - t))
    b = 0
  }

  // 返回半透明颜色（alpha=0.6）以不完全遮挡底层
  return `rgba(${r}, ${g}, ${b}, 0.6)`
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
  clearCanvas,
  drawHeatmap
}
