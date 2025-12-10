/**
 * 网格放置规则引擎
 * 负责验证和管理网格元素的放置规则
 */

// ==================== 错误类定义 ====================

class OutOfBoundsError extends Error {
  constructor(message) {
    super(message)
    this.name = 'OutOfBoundsError'
  }
}

class RoomInteriorViolationError extends Error {
  constructor(message) {
    super(message)
    this.name = 'RoomInteriorViolationError'
  }
}

class ElementConflictError extends Error {
  constructor(message) {
    super(message)
    this.name = 'ElementConflictError'
  }
}

// ==================== MultiCellHandler ====================

class MultiCellHandler {
  /**
   * 判断元素是否为多格元素
   */
  isMultiCellElement(element) {
    return (element.width && element.width > 1) || (element.height && element.height > 1)
  }

  /**
   * 获取元素占用的所有单元格坐标
   */
  getOccupiedCells(element) {
    const cells = []
    const width = element.width || 1
    const height = element.height || 1

    for (let dy = 0; dy < height; dy++) {
      for (let dx = 0; dx < width; dx++) {
        cells.push({ x: element.x + dx, y: element.y + dy })
      }
    }
    return cells
  }

  /**
   * 验证多格元素边界
   */
  validateMultiCellBounds(element, gridSize) {
    const width = element.width || 1
    const height = element.height || 1

    if (element.x < 0 || element.y < 0) return false
    if (element.x + width > gridSize || element.y + height > gridSize) return false

    return true
  }
}

// ==================== GridStateManager ====================

class GridStateManager {
  constructor(gridSize) {
    this.gridSize = gridSize
    this.cellMap = new Map() // key: "x,y", value: element
    this.roomInteriorMap = new Map() // key: "x,y", value: boolean
  }

  /**
   * 获取单元格的元素
   */
  getElementAtCell(x, y) {
    return this.cellMap.get(`${x},${y}`) || null
  }

  /**
   * 设置单元格的元素
   */
  setElementAtCell(x, y, element) {
    this.cellMap.set(`${x},${y}`, element)
  }

  /**
   * 清除单元格
   */
  clearCell(x, y) {
    this.cellMap.delete(`${x},${y}`)
  }

  /**
   * 检查单元格是否在房间内部
   */
  isRoomInterior(x, y) {
    return this.roomInteriorMap.get(`${x},${y}`) || false
  }

  /**
   * 设置单元格的房间内部状态
   */
  setRoomInterior(x, y, isInterior) {
    this.roomInteriorMap.set(`${x},${y}`, isInterior)
  }

  /**
   * 从设计数据同步状态
   */
  syncFromDesignData(designData) {
    this.cellMap.clear()

    // 同步结构元素
    const baseLayer = designData.base_layer
    if (baseLayer.walls) {
      baseLayer.walls.forEach(wall => {
        this.setElementAtCell(wall.x, wall.y, { ...wall, type: 'wall', layer: 'structural' })
      })
    }
    if (baseLayer.doors) {
      baseLayer.doors.forEach(door => {
        this.setElementAtCell(door.x, door.y, { ...door, type: 'door', layer: 'structural' })
      })
    }
    if (baseLayer.windows) {
      baseLayer.windows.forEach(window => {
        this.setElementAtCell(window.x, window.y, { ...window, type: 'window', layer: 'structural' })
      })
    }

    // 同步家具元素
    const furnitureLayer = designData.furniture_layer
    const multiCellHandler = new MultiCellHandler()

    if (furnitureLayer.fans) {
      furnitureLayer.fans.forEach(fan => {
        this.setElementAtCell(fan.x, fan.y, { ...fan, type: 'fan', layer: 'furniture' })
      })
    }
    if (furnitureLayer.chairs) {
      furnitureLayer.chairs.forEach(chair => {
        this.setElementAtCell(chair.x, chair.y, { ...chair, type: 'chair', layer: 'furniture' })
      })
    }
    if (furnitureLayer.tables) {
      furnitureLayer.tables.forEach(table => {
        const cells = multiCellHandler.getOccupiedCells(table)
        cells.forEach(cell => {
          this.setElementAtCell(cell.x, cell.y, { ...table, type: 'table', layer: 'furniture' })
        })
      })
    }
    if (furnitureLayer.beds) {
      furnitureLayer.beds.forEach(bed => {
        const cells = multiCellHandler.getOccupiedCells(bed)
        cells.forEach(cell => {
          this.setElementAtCell(cell.x, cell.y, { ...bed, type: 'bed', layer: 'furniture' })
        })
      })
    }
  }

  /**
   * 计算房间内部区域
   */
  calculateRoomInteriors(rooms) {
    this.roomInteriorMap.clear()

    rooms.forEach(room => {
      if (!room.points || room.points.length < 3) return

      // 使用射线法判断点是否在多边形内部
      for (let y = 0; y < this.gridSize; y++) {
        for (let x = 0; x < this.gridSize; x++) {
          if (this.isPointInPolygon(x + 0.5, y + 0.5, room.points)) {
            this.setRoomInterior(x, y, true)
          }
        }
      }
    })
  }

  /**
   * 射线法判断点是否在多边形内
   */
  isPointInPolygon(x, y, points) {
    let inside = false
    for (let i = 0, j = points.length - 1; i < points.length; j = i++) {
      const xi = points[i].x, yi = points[i].y
      const xj = points[j].x, yj = points[j].y

      const intersect = ((yi > y) !== (yj > y)) &&
        (x < (xj - xi) * (y - yi) / (yj - yi) + xi)
      if (intersect) inside = !inside
    }
    return inside
  }
}

// ==================== PlacementValidator ====================

class PlacementValidator {
  constructor(gridStateManager, multiCellHandler) {
    this.gridStateManager = gridStateManager
    this.multiCellHandler = multiCellHandler
  }

  /**
   * 验证放置操作
   */
  validatePlacement(element, elementType) {
    const cells = this.multiCellHandler.getOccupiedCells(element)

    // 边界检查
    if (!this.multiCellHandler.validateMultiCellBounds(element, this.gridStateManager.gridSize)) {
      throw new OutOfBoundsError('元素超出画布边界')
    }

    // 家具必须在房间内部
    if (this.isFurniture(elementType)) {
      for (const cell of cells) {
        if (!this.gridStateManager.isRoomInterior(cell.x, cell.y)) {
          throw new RoomInteriorViolationError('家具只能放置在房间内部')
        }
      }
    }

    // 检查元素互斥性
    for (const cell of cells) {
      const existing = this.gridStateManager.getElementAtCell(cell.x, cell.y)
      if (existing && !this.canOverwrite(elementType, existing.layer)) {
        throw new ElementConflictError(`位置已被${existing.type}占用`)
      }
    }

    return true
  }

  /**
   * 判断是否为家具
   */
  isFurniture(elementType) {
    return ['fan', 'chair', 'table', 'bed'].includes(elementType)
  }

  /**
   * 判断是否可以覆盖
   */
  canOverwrite(newType, existingLayer) {
    const newLayer = this.isFurniture(newType) ? 'furniture' : 'structural'
    return newLayer === existingLayer
  }
}

// ==================== OverwriteManager ====================

class OverwriteManager {
  constructor(gridStateManager, multiCellHandler) {
    this.gridStateManager = gridStateManager
    this.multiCellHandler = multiCellHandler
  }

  /**
   * 应用覆盖规则
   */
  applyOverwriteRule(newElement, designData) {
    const removedElements = []
    const cells = this.multiCellHandler.getOccupiedCells(newElement)

    // 收集需要移除的元素
    const toRemove = new Set()
    cells.forEach(cell => {
      const existing = this.gridStateManager.getElementAtCell(cell.x, cell.y)
      if (existing) {
        toRemove.add(existing)
      }
    })

    // 移除冲突的元素
    toRemove.forEach(element => {
      const removed = this.removeElement(element, designData)
      if (removed) removedElements.push(removed)
    })

    return removedElements
  }

  /**
   * 从设计数据中移除元素
   */
  removeElement(element, designData) {
    const layer = element.layer === 'furniture' ? designData.furniture_layer : designData.base_layer
    const arrayName = this.getArrayName(element.type)

    if (!layer[arrayName]) return null

    const index = layer[arrayName].findIndex(e =>
      e.x === element.x && e.y === element.y
    )

    if (index !== -1) {
      const removed = layer[arrayName].splice(index, 1)[0]

      // 清除该元素占用的所有单元格
      const cells = this.multiCellHandler.getOccupiedCells(element)
      cells.forEach(cell => {
        this.gridStateManager.clearCell(cell.x, cell.y)
      })

      return removed
    }

    return null
  }

  /**
   * 获取元素类型对应的数组名称
   */
  getArrayName(type) {
    const map = {
      'wall': 'walls',
      'door': 'doors',
      'window': 'windows',
      'fan': 'fans',
      'chair': 'chairs',
      'table': 'tables',
      'bed': 'beds'
    }
    return map[type] || type + 's'
  }
}

// ==================== GridPlacementEngine ====================

class GridPlacementEngine {
  constructor(gridSize) {
    this.gridStateManager = new GridStateManager(gridSize)
    this.multiCellHandler = new MultiCellHandler()
    this.placementValidator = new PlacementValidator(this.gridStateManager, this.multiCellHandler)
    this.overwriteManager = new OverwriteManager(this.gridStateManager, this.multiCellHandler)
  }

  /**
   * 同步设计数据
   */
  syncDesignData(designData) {
    this.gridStateManager.syncFromDesignData(designData)
    if (designData.base_layer.rooms) {
      this.gridStateManager.calculateRoomInteriors(designData.base_layer.rooms)
    }
  }

  /**
   * 验证并放置元素
   */
  placeElement(element, elementType, designData) {
    try {
      // 验证放置
      this.placementValidator.validatePlacement(element, elementType)

      // 应用覆盖规则
      const removedElements = this.overwriteManager.applyOverwriteRule(element, designData)

      // 添加新元素到设计数据
      const layer = this.placementValidator.isFurniture(elementType)
        ? designData.furniture_layer
        : designData.base_layer
      const arrayName = this.overwriteManager.getArrayName(elementType)

      if (!layer[arrayName]) {
        layer[arrayName] = []
      }
      layer[arrayName].push(element)

      // 更新网格状态
      const cells = this.multiCellHandler.getOccupiedCells(element)
      cells.forEach(cell => {
        this.gridStateManager.setElementAtCell(cell.x, cell.y, {
          ...element,
          type: elementType,
          layer: this.placementValidator.isFurniture(elementType) ? 'furniture' : 'structural'
        })
      })

      return {
        success: true,
        element: element,
        removedElements: removedElements,
        errorMessage: null
      }
    } catch (error) {
      return {
        success: false,
        element: null,
        removedElements: [],
        errorMessage: error.message
      }
    }
  }

  /**
   * 更新房间内部区域
   */
  updateRoomInteriors(rooms) {
    this.gridStateManager.calculateRoomInteriors(rooms)
  }
}

module.exports = {
  GridPlacementEngine,
  OutOfBoundsError,
  RoomInteriorViolationError,
  ElementConflictError
}
