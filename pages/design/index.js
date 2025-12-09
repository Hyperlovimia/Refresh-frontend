/**
 * 房间设计页面主逻辑
 */

const gridUtils = require('./utils/grid.js')
const drawingUtils = require('./utils/drawing.js')
const config = require('../../config.js')

Page({
  /**
   * 页面的初始数据
   */
  data: {
    // 画布配置
    gridSize: 20, // 网格大小 20x20
    cellSize: 30, // 每格像素大小

    // 图层相关
    currentLayer: 'base', // 当前图层: base, furniture, overlay

    // 工具相关
    currentTool: 'wall', // 当前选中工具
    toolNames: {
      wall: '墙壁',
      room: '房间',
      door: '门',
      window: '窗户',
      fan: '风扇',
      chair: '椅子',
      table: '桌子',
      bed: '床',
      select: '选择'
    },

    // 设计数据
    designData: {
      base_layer: {
        walls: [],
        rooms: [],
        doors: [],
        windows: []
      },
      furniture_layer: {
        fans: [],
        chairs: [],
        tables: [],
        beds: []
      }
    },

    // UI状态
    showGrid: true, // 是否显示网格
    currentCoord: null, // 当前坐标
    selectedElement: null, // 选中的元素
    selectedElementIndex: -1, // 选中元素的索引

    // 绘制状态
    drawing: false, // 是否正在绘制
    startPoint: null, // 绘制起点

    // 文件管理
    showLoadDialog: false,
    fileList: [],
    selectedFile: null,

    // Canvas相关
    canvas: null,
    ctx: null
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    this.initCanvas()
    this.loadFromLocalCache()
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {
    // 页面显示时重新渲染
    if (this.data.ctx) {
      this.render()
    }
  },

  /**
   * 初始化Canvas
   */
  initCanvas() {
    const query = wx.createSelectorQuery()
    query
      .select('#designCanvas')
      .fields({ node: true, size: true })
      .exec((res) => {
        if (!res[0]) {
          console.error('Canvas节点获取失败')
          return
        }

        const canvas = res[0].node
        const ctx = canvas.getContext('2d')

        // 获取设备像素比
        const dpr = wx.getSystemInfoSync().pixelRatio

        // 设置Canvas实际大小
        const canvasSize = this.data.gridSize * this.data.cellSize
        canvas.width = canvasSize * dpr
        canvas.height = canvasSize * dpr
        ctx.scale(dpr, dpr)

        this.setData({
          canvas: canvas,
          ctx: ctx
        })

        // 缓存canvas的位置信息
        this.updateCanvasRect()

        // 初始渲染
        this.render()
      })
  },

  /**
   * 更新canvas位置信息缓存
   */
  updateCanvasRect() {
    const query = wx.createSelectorQuery()
    query.select('#designCanvas')
      .boundingClientRect((rect) => {
        if (rect) {
          this.canvasRect = rect
        }
      })
      .exec()
  },

  /**
   * 渲染画布
   */
  render() {
    if (!this.data.ctx) return

    const { ctx, gridSize, cellSize, showGrid, designData, selectedElement, currentLayer } = this.data
    const canvasSize = gridSize * cellSize

    // 清空画布
    drawingUtils.clearCanvas(ctx, canvasSize, canvasSize)

    // 绘制网格
    if (showGrid) {
      gridUtils.drawGrid(ctx, gridSize, cellSize)
    }

    // 绘制基础层元素
    const baseLayer = designData.base_layer

    // 绘制房间(最底层)
    baseLayer.rooms.forEach((room, index) => {
      const isSelected = selectedElement && selectedElement.type === 'room' && this.data.selectedElementIndex === index
      drawingUtils.drawRoom(ctx, room, cellSize, '#e0e0e0', isSelected)
    })

    // 绘制墙壁
    baseLayer.walls.forEach((wall, index) => {
      const isSelected = selectedElement && selectedElement.type === 'wall' && this.data.selectedElementIndex === index
      drawingUtils.drawWall(ctx, wall, cellSize, '#424242', isSelected)
    })

    // 绘制门
    baseLayer.doors.forEach((door, index) => {
      const isSelected = selectedElement && selectedElement.type === 'door' && this.data.selectedElementIndex === index
      drawingUtils.drawDoor(ctx, door, cellSize, '#8d6e63', isSelected)
    })

    // 绘制窗户
    baseLayer.windows.forEach((window, index) => {
      const isSelected = selectedElement && selectedElement.type === 'window' && this.data.selectedElementIndex === index
      drawingUtils.drawWindow(ctx, window, cellSize, '#64b5f6', isSelected)
    })

    // 绘制家具层元素
    const furnitureLayer = designData.furniture_layer

    // 绘制风扇
    furnitureLayer.fans.forEach((fan, index) => {
      const isSelected = selectedElement && selectedElement.type === 'fan' && this.data.selectedElementIndex === index
      drawingUtils.drawFan(ctx, fan, cellSize, isSelected)
    })

    // 绘制椅子
    furnitureLayer.chairs.forEach((chair, index) => {
      const isSelected = selectedElement && selectedElement.type === 'chair' && this.data.selectedElementIndex === index
      drawingUtils.drawChair(ctx, chair, cellSize, isSelected)
    })

    // 绘制桌子
    furnitureLayer.tables.forEach((table, index) => {
      const isSelected = selectedElement && selectedElement.type === 'table' && this.data.selectedElementIndex === index
      drawingUtils.drawTable(ctx, table, cellSize, isSelected)
    })

    // 绘制床
    furnitureLayer.beds.forEach((bed, index) => {
      const isSelected = selectedElement && selectedElement.type === 'bed' && this.data.selectedElementIndex === index
      drawingUtils.drawBed(ctx, bed, cellSize, isSelected)
    })
  },

  /**
   * 将触摸坐标转换为画布内坐标
   */
  touchToCanvasCoord(touch) {
    // 获取canvas元素的位置和尺寸
    const query = wx.createSelectorQuery()
    return new Promise((resolve) => {
      query.select('#designCanvas')
        .boundingClientRect((rect) => {
          if (!rect) {
            resolve({ x: touch.x, y: touch.y })
            return
          }

          // 计算触摸点相对于canvas的坐标
          const canvasX = touch.x - rect.left
          const canvasY = touch.y - rect.top

          // 计算缩放比例(实际显示尺寸 vs 逻辑尺寸)
          const logicalSize = this.data.gridSize * this.data.cellSize
          const scaleX = logicalSize / rect.width
          const scaleY = logicalSize / rect.height

          // 转换到逻辑坐标空间
          const logicalX = canvasX * scaleX
          const logicalY = canvasY * scaleY

          resolve({ x: logicalX, y: logicalY })
        })
        .exec()
    })
  },

  /**
   * 触摸开始
   */
  onTouchStart(e) {
    const touch = e.touches[0]

    // 获取canvas相对坐标(同步处理,使用缓存的rect)
    const canvasX = touch.x - (this.canvasRect?.left || 0)
    const canvasY = touch.y - (this.canvasRect?.top || 0)

    // 计算缩放比例
    const logicalSize = this.data.gridSize * this.data.cellSize
    const scaleX = this.canvasRect ? logicalSize / this.canvasRect.width : 1
    const scaleY = this.canvasRect ? logicalSize / this.canvasRect.height : 1

    const x = canvasX * scaleX
    const y = canvasY * scaleY

    const gridCoord = gridUtils.pixelToGrid(x, y, this.data.cellSize)

    // 边界检查
    if (!gridUtils.isValidGridCoord(gridCoord.x, gridCoord.y, this.data.gridSize)) {
      return
    }

    // 更新当前坐标
    this.setData({ currentCoord: gridCoord })

    // 根据当前工具处理
    if (this.data.currentTool === 'select') {
      this.handleSelect(gridCoord)
    } else if (this.data.currentLayer === 'base') {
      // 基础层工具
      if (['wall', 'room'].includes(this.data.currentTool)) {
        this.setData({
          drawing: true,
          startPoint: gridCoord
        })
      } else if (['door', 'window'].includes(this.data.currentTool)) {
        this.placeDoorOrWindow(gridCoord)
      }
    } else if (this.data.currentLayer === 'furniture') {
      // 家具层工具
      if (['fan', 'chair', 'table', 'bed'].includes(this.data.currentTool)) {
        this.placeFurniture(gridCoord)
      }
    }
  },

  /**
   * 触摸移动
   */
  onTouchMove(e) {
    const touch = e.touches[0]

    // 获取canvas相对坐标
    const canvasX = touch.x - (this.canvasRect?.left || 0)
    const canvasY = touch.y - (this.canvasRect?.top || 0)

    // 计算缩放比例
    const logicalSize = this.data.gridSize * this.data.cellSize
    const scaleX = this.canvasRect ? logicalSize / this.canvasRect.width : 1
    const scaleY = this.canvasRect ? logicalSize / this.canvasRect.height : 1

    const x = canvasX * scaleX
    const y = canvasY * scaleY

    const gridCoord = gridUtils.pixelToGrid(x, y, this.data.cellSize)

    // 边界检查
    if (!gridUtils.isValidGridCoord(gridCoord.x, gridCoord.y, this.data.gridSize)) {
      return
    }

    // 更新当前坐标
    this.setData({ currentCoord: gridCoord })

    // 如果正在绘制,显示预览
    if (this.data.drawing && this.data.startPoint) {
      this.renderPreview(gridCoord)
    }
  },

  /**
   * 触摸结束
   */
  onTouchEnd(e) {
    // 隐藏坐标指示器
    this.setData({ currentCoord: null })

    if (!this.data.drawing) return

    const touch = e.changedTouches[0]

    // 获取canvas相对坐标
    const canvasX = touch.x - (this.canvasRect?.left || 0)
    const canvasY = touch.y - (this.canvasRect?.top || 0)

    // 计算缩放比例
    const logicalSize = this.data.gridSize * this.data.cellSize
    const scaleX = this.canvasRect ? logicalSize / this.canvasRect.width : 1
    const scaleY = this.canvasRect ? logicalSize / this.canvasRect.height : 1

    const x = canvasX * scaleX
    const y = canvasY * scaleY

    const gridCoord = gridUtils.pixelToGrid(x, y, this.data.cellSize)

    // 边界检查
    if (!gridUtils.isValidGridCoord(gridCoord.x, gridCoord.y, this.data.gridSize)) {
      this.setData({
        drawing: false,
        startPoint: null
      })
      this.render()
      return
    }

    // 完成绘制
    if (this.data.currentTool === 'wall') {
      this.finishWall(gridCoord)
    } else if (this.data.currentTool === 'room') {
      this.finishRoom(gridCoord)
    }

    this.setData({
      drawing: false,
      startPoint: null
    })

    this.render()
  },

  /**
   * 渲染预览
   */
  renderPreview(endPoint) {
    // 重新渲染基础内容
    this.render()

    const { ctx, cellSize, startPoint, currentTool } = this.data

    if (currentTool === 'wall') {
      // 计算吸附后的终点
      const dx = Math.abs(endPoint.x - startPoint.x)
      const dy = Math.abs(endPoint.y - startPoint.y)

      let snappedEndX = endPoint.x
      let snappedEndY = endPoint.y

      if (dx > dy) {
        // 水平吸附
        snappedEndY = startPoint.y
      } else {
        // 垂直吸附
        snappedEndX = startPoint.x
      }

      // 预览墙壁
      const start = gridUtils.gridToPixel(startPoint.x, startPoint.y, cellSize)
      const end = gridUtils.gridToPixel(snappedEndX, snappedEndY, cellSize)

      ctx.strokeStyle = '#9e9e9e'
      ctx.lineWidth = 6
      ctx.setLineDash([5, 5])
      ctx.beginPath()
      ctx.moveTo(start.x + cellSize / 2, start.y + cellSize / 2)
      ctx.lineTo(end.x + cellSize / 2, end.y + cellSize / 2)
      ctx.stroke()
      ctx.setLineDash([])
    } else if (currentTool === 'room') {
      // 预览房间
      const x = Math.min(startPoint.x, endPoint.x)
      const y = Math.min(startPoint.y, endPoint.y)
      const width = Math.abs(endPoint.x - startPoint.x) + 1
      const height = Math.abs(endPoint.y - startPoint.y) + 1

      const pos = gridUtils.gridToPixel(x, y, cellSize)
      ctx.fillStyle = 'rgba(224, 224, 224, 0.5)'
      ctx.strokeStyle = '#bdbdbd'
      ctx.lineWidth = 2
      ctx.setLineDash([5, 5])
      ctx.fillRect(pos.x, pos.y, width * cellSize, height * cellSize)
      ctx.strokeRect(pos.x, pos.y, width * cellSize, height * cellSize)
      ctx.setLineDash([])
    }
  },

  /**
   * 完成墙壁绘制
   */
  finishWall(endPoint) {
    const { startPoint } = this.data
    if (!startPoint) return

    // 计算水平和垂直距离
    const dx = Math.abs(endPoint.x - startPoint.x)
    const dy = Math.abs(endPoint.y - startPoint.y)

    // 自动吸附到水平或垂直方向
    let finalEndX = endPoint.x
    let finalEndY = endPoint.y

    if (dx > dy) {
      // 水平方向优先 - 固定Y坐标
      finalEndY = startPoint.y
    } else {
      // 垂直方向优先 - 固定X坐标
      finalEndX = startPoint.x
    }

    const wall = {
      type: 'wall',
      startX: startPoint.x,
      startY: startPoint.y,
      endX: finalEndX,
      endY: finalEndY
    }

    const designData = this.data.designData
    designData.base_layer.walls.push(wall)
    this.setData({ designData })

    // 保存到本地缓存
    this.saveToLocalCache()
  },

  /**
   * 完成房间绘制
   */
  finishRoom(endPoint) {
    const { startPoint } = this.data
    if (!startPoint) return

    const x = Math.min(startPoint.x, endPoint.x)
    const y = Math.min(startPoint.y, endPoint.y)
    const width = Math.abs(endPoint.x - startPoint.x) + 1
    const height = Math.abs(endPoint.y - startPoint.y) + 1

    const room = {
      type: 'room',
      x: x,
      y: y,
      width: width,
      height: height
    }

    const designData = this.data.designData
    designData.base_layer.rooms.push(room)
    this.setData({ designData })

    // 保存到本地缓存
    this.saveToLocalCache()
  },

  /**
   * 检测门窗的放置方向
   * 根据周围墙壁自动判断应该是水平还是垂直
   */
  detectDoorWindowDirection(gridCoord) {
    const { designData } = this.data
    const walls = designData.base_layer.walls

    let hasHorizontalWall = false
    let hasVerticalWall = false

    // 检查周围格子是否有墙壁
    for (const wall of walls) {
      // 检查墙壁是否经过当前格子或相邻格子
      const isHorizontal = wall.startY === wall.endY
      const isVertical = wall.startX === wall.endX

      if (isHorizontal) {
        const minX = Math.min(wall.startX, wall.endX)
        const maxX = Math.max(wall.startX, wall.endX)
        const y = wall.startY

        // 检查是否与当前格子相邻或重合
        if (y >= gridCoord.y - 1 && y <= gridCoord.y + 1 &&
            gridCoord.x >= minX && gridCoord.x <= maxX) {
          hasHorizontalWall = true
        }
      }

      if (isVertical) {
        const minY = Math.min(wall.startY, wall.endY)
        const maxY = Math.max(wall.startY, wall.endY)
        const x = wall.startX

        // 检查是否与当前格子相邻或重合
        if (x >= gridCoord.x - 1 && x <= gridCoord.x + 1 &&
            gridCoord.y >= minY && gridCoord.y <= maxY) {
          hasVerticalWall = true
        }
      }
    }

    // 根据周`围墙壁方向决定门窗方向
    // 如果有水平墙壁，门窗应该是水平的(在墙上开洞)
    // 如果有垂直墙壁，门窗应该是垂直的(在墙上开洞)
    // 如果都有或都没有，默认水平
    if (hasHorizontalWall && !hasVerticalWall) {
      return 'horizontal'
    } else if (hasVerticalWall && !hasHorizontalWall) {
      return 'vertical'
    } else {
      // 默认水平
      return 'horizontal'
    }
  },

  /**
   * 放置门或窗
   */
  placeDoorOrWindow(gridCoord) {
    const { currentTool, designData } = this.data

    // 自动检测方向
    const direction = this.detectDoorWindowDirection(gridCoord)

    const element = {
      type: currentTool,
      x: gridCoord.x,
      y: gridCoord.y,
      direction: direction
    }

    if (currentTool === 'door') {
      designData.base_layer.doors.push(element)
    } else if (currentTool === 'window') {
      designData.base_layer.windows.push(element)
    }

    this.setData({ designData })
    this.render()

    // 保存到本地缓存
    this.saveToLocalCache()
  },

  /**
   * 放置家具
   */
  placeFurniture(gridCoord) {
    const { currentTool, designData } = this.data
    const furnitureLayer = designData.furniture_layer

    if (currentTool === 'fan') {
      // 风扇需要检测挂墙
      const wallInfo = this.detectAdjacentWall(gridCoord)
      const furniture = {
        x: gridCoord.x,
        y: gridCoord.y,
        direction: wallInfo.direction,
        wallAttached: wallInfo.attached
      }
      furnitureLayer.fans.push(furniture)
    } else if (currentTool === 'chair') {
      // 椅子默认朝上
      const furniture = {
        x: gridCoord.x,
        y: gridCoord.y,
        direction: 'up'
      }
      furnitureLayer.chairs.push(furniture)
    } else if (currentTool === 'table') {
      // 桌子 2x1
      const furniture = {
        x: gridCoord.x,
        y: gridCoord.y,
        direction: 'up',
        width: 2,
        height: 1
      }
      furnitureLayer.tables.push(furniture)
    } else if (currentTool === 'bed') {
      // 床 2x3
      const furniture = {
        x: gridCoord.x,
        y: gridCoord.y,
        direction: 'right',
        width: 2,
        height: 3
      }
      furnitureLayer.beds.push(furniture)
    }

    this.setData({ designData })
    this.render()

    // 保存到本地缓存
    this.saveToLocalCache()
  },

  /**
   * 检测相邻墙壁(用于风扇挂墙)
   */
  detectAdjacentWall(gridCoord) {
    const { designData } = this.data
    const walls = designData.base_layer.walls

    // 检查四个方向是否有墙壁
    const directions = [
      { dir: 'up', dx: 0, dy: -1 },
      { dir: 'down', dx: 0, dy: 1 },
      { dir: 'left', dx: -1, dy: 0 },
      { dir: 'right', dx: 1, dy: 0 }
    ]

    for (const { dir, dx, dy } of directions) {
      const checkX = gridCoord.x + dx
      const checkY = gridCoord.y + dy

      // 检查该位置是否有墙壁
      for (const wall of walls) {
        if (this.isPointOnWall({ x: checkX, y: checkY }, wall)) {
          return { attached: true, direction: dir }
        }
      }
    }

    // 没有相邻墙壁，默认朝下
    return { attached: false, direction: 'down' }
  },

  /**
   * 判断点是否在墙壁上
   */
  isPointOnWall(point, wall) {
    const minX = Math.min(wall.startX, wall.endX)
    const maxX = Math.max(wall.startX, wall.endX)
    const minY = Math.min(wall.startY, wall.endY)
    const maxY = Math.max(wall.startY, wall.endY)

    return point.x >= minX && point.x <= maxX && point.y >= minY && point.y <= maxY
  },

  /**
   * 选择元素
   */
  handleSelect(gridCoord) {
    const { designData, cellSize, currentLayer } = this.data

    let found = false

    if (currentLayer === 'furniture') {
      // 家具层选择
      const furnitureLayer = designData.furniture_layer

      // 检查风扇
      for (let i = furnitureLayer.fans.length - 1; i >= 0; i--) {
        const fan = furnitureLayer.fans[i]
        if (fan.x === gridCoord.x && fan.y === gridCoord.y) {
          this.setData({
            selectedElement: { ...fan, type: 'fan' },
            selectedElementIndex: i
          })
          found = true
          break
        }
      }

      // 检查椅子
      if (!found) {
        for (let i = furnitureLayer.chairs.length - 1; i >= 0; i--) {
          const chair = furnitureLayer.chairs[i]
          if (chair.x === gridCoord.x && chair.y === gridCoord.y) {
            this.setData({
              selectedElement: { ...chair, type: 'chair' },
              selectedElementIndex: i
            })
            found = true
            break
          }
        }
      }

      // 检查桌子
      if (!found) {
        for (let i = furnitureLayer.tables.length - 1; i >= 0; i--) {
          const table = furnitureLayer.tables[i]
          if (this.isPointInFurniture(gridCoord, table)) {
            this.setData({
              selectedElement: { ...table, type: 'table' },
              selectedElementIndex: i
            })
            found = true
            break
          }
        }
      }

      // 检查床
      if (!found) {
        for (let i = furnitureLayer.beds.length - 1; i >= 0; i--) {
          const bed = furnitureLayer.beds[i]
          if (this.isPointInFurniture(gridCoord, bed)) {
            this.setData({
              selectedElement: { ...bed, type: 'bed' },
              selectedElementIndex: i
            })
            found = true
            break
          }
        }
      }
    } else {
      // 基础层选择
      const baseLayer = designData.base_layer

      // 检查门(优先级最高)
      for (let i = baseLayer.doors.length - 1; i >= 0; i--) {
        const door = baseLayer.doors[i]
        if (door.x === gridCoord.x && door.y === gridCoord.y) {
          this.setData({
            selectedElement: door,
            selectedElementIndex: i
          })
          found = true
          break
        }
      }

      // 检查窗户
      if (!found) {
        for (let i = baseLayer.windows.length - 1; i >= 0; i--) {
          const window = baseLayer.windows[i]
          if (window.x === gridCoord.x && window.y === gridCoord.y) {
            this.setData({
              selectedElement: window,
              selectedElementIndex: i
            })
            found = true
            break
          }
        }
      }

      // 检查墙壁
      if (!found) {
        for (let i = baseLayer.walls.length - 1; i >= 0; i--) {
          const wall = baseLayer.walls[i]
          // 简单的点击检测(点在墙壁线段附近)
          if (this.isPointNearWall(gridCoord, wall)) {
            this.setData({
              selectedElement: wall,
              selectedElementIndex: i
            })
            found = true
            break
          }
        }
      }

      // 检查房间
      if (!found) {
        for (let i = baseLayer.rooms.length - 1; i >= 0; i--) {
          const room = baseLayer.rooms[i]
          if (
            gridCoord.x >= room.x &&
            gridCoord.x < room.x + room.width &&
            gridCoord.y >= room.y &&
            gridCoord.y < room.y + room.height
          ) {
            this.setData({
              selectedElement: room,
              selectedElementIndex: i
            })
            found = true
            break
          }
        }
      }
    }

    if (!found) {
      this.setData({
        selectedElement: null,
        selectedElementIndex: -1
      })
    }

    this.render()
  },

  /**
   * 判断点是否在家具范围内
   */
  isPointInFurniture(point, furniture) {
    const width = furniture.width || 1
    const height = furniture.height || 1
    return (
      point.x >= furniture.x &&
      point.x < furniture.x + width &&
      point.y >= furniture.y &&
      point.y < furniture.y + height
    )
  },

  /**
   * 判断点是否靠近墙壁
   */
  isPointNearWall(point, wall) {
    const threshold = 1 // 容错范围

    // 检查点是否在墙壁的包围盒内
    const minX = Math.min(wall.startX, wall.endX) - threshold
    const maxX = Math.max(wall.startX, wall.endX) + threshold
    const minY = Math.min(wall.startY, wall.endY) - threshold
    const maxY = Math.max(wall.startY, wall.endY) + threshold

    return point.x >= minX && point.x <= maxX && point.y >= minY && point.y <= maxY
  },

  /**
   * 选择工具
   */
  onSelectTool(e) {
    const tool = e.currentTarget.dataset.tool
    this.setData({ currentTool: tool })
  },

  /**
   * 切换图层
   */
  onSwitchLayer(e) {
    const layer = e.currentTarget.dataset.layer
    const currentTool = this.data.currentTool

    // 切换图层时重置工具
    let newTool = 'select'
    if (layer === 'base') {
      newTool = 'wall'
    } else if (layer === 'furniture') {
      newTool = 'fan'
    }

    this.setData({
      currentLayer: layer,
      currentTool: newTool,
      selectedElement: null,
      selectedElementIndex: -1
    })

    this.render()
  },

  /**
   * 删除选中元素
   */
  onDelete() {
    const { selectedElement, selectedElementIndex, designData, currentLayer } = this.data

    if (!selectedElement || selectedElementIndex < 0) {
      wx.showToast({
        title: '请先选择要删除的元素',
        icon: 'none'
      })
      return
    }

    const type = selectedElement.type

    if (currentLayer === 'furniture') {
      // 删除家具层元素
      const furnitureLayer = designData.furniture_layer
      if (type === 'fan') {
        furnitureLayer.fans.splice(selectedElementIndex, 1)
      } else if (type === 'chair') {
        furnitureLayer.chairs.splice(selectedElementIndex, 1)
      } else if (type === 'table') {
        furnitureLayer.tables.splice(selectedElementIndex, 1)
      } else if (type === 'bed') {
        furnitureLayer.beds.splice(selectedElementIndex, 1)
      }
    } else {
      // 删除基础层元素
      const baseLayer = designData.base_layer
      if (type === 'wall') {
        baseLayer.walls.splice(selectedElementIndex, 1)
      } else if (type === 'room') {
        baseLayer.rooms.splice(selectedElementIndex, 1)
      } else if (type === 'door') {
        baseLayer.doors.splice(selectedElementIndex, 1)
      } else if (type === 'window') {
        baseLayer.windows.splice(selectedElementIndex, 1)
      }
    }

    this.setData({
      designData,
      selectedElement: null,
      selectedElementIndex: -1
    })

    this.render()

    // 保存到本地缓存
    this.saveToLocalCache()

    wx.showToast({
      title: '删除成功',
      icon: 'success'
    })
  },

  /**
   * 旋转家具朝向
   */
  onRotate() {
    const { selectedElement, selectedElementIndex, designData, currentLayer } = this.data

    if (currentLayer !== 'furniture' || !selectedElement || selectedElementIndex < 0) {
      wx.showToast({
        title: '请先选择家具',
        icon: 'none'
      })
      return
    }

    const type = selectedElement.type
    const furnitureLayer = designData.furniture_layer

    // 定义旋转顺序
    const rotationOrder = ['up', 'right', 'down', 'left']
    const currentDirection = selectedElement.direction
    const currentIndex = rotationOrder.indexOf(currentDirection)
    const nextDirection = rotationOrder[(currentIndex + 1) % 4]

    // 更新对应家具的朝向
    if (type === 'fan') {
      furnitureLayer.fans[selectedElementIndex].direction = nextDirection
    } else if (type === 'chair') {
      furnitureLayer.chairs[selectedElementIndex].direction = nextDirection
    } else if (type === 'table') {
      furnitureLayer.tables[selectedElementIndex].direction = nextDirection
    } else if (type === 'bed') {
      furnitureLayer.beds[selectedElementIndex].direction = nextDirection
    }

    // 更新选中元素的朝向
    selectedElement.direction = nextDirection

    this.setData({
      designData,
      selectedElement
    })

    this.render()

    // 保存到本地缓存
    this.saveToLocalCache()
  },

  /**
   * 切换网格显示
   */
  onToggleGrid() {
    this.setData({
      showGrid: !this.data.showGrid
    })
    this.render()
  },

  /**
   * 保存设计到本地缓存
   */
  saveToLocalCache() {
    try {
      const cacheData = {
        baseLayer: this.data.designData.base_layer,
        furnitureLayer: this.data.designData.furniture_layer,
        gridSize: this.data.gridSize,
        cellSize: this.data.cellSize
      }
      wx.setStorageSync('current_design', cacheData)
    } catch (e) {
      console.error('保存到本地缓存失败', e)
    }
  },

  /**
   * 从本地缓存加载设计
   */
  loadFromLocalCache() {
    try {
      const design = wx.getStorageSync('current_design')
      if (design) {
        // 兼容旧格式
        const baseLayer = design.baseLayer || design.base_layer || {
          walls: [],
          rooms: [],
          doors: [],
          windows: []
        }

        const furnitureLayer = design.furnitureLayer || design.furniture_layer || {
          fans: [],
          chairs: [],
          tables: [],
          beds: []
        }

        this.setData({
          designData: {
            base_layer: baseLayer,
            furniture_layer: furnitureLayer
          },
          gridSize: design.gridSize || design.grid_size || 20,
          cellSize: design.cellSize || design.cell_size || design.grid_cell_size || 30
        })

        this.render()
      }
    } catch (e) {
      console.error('从本地缓存加载失败', e)
    }
  },

  /**
   * 保存设计到后端
   */
  onSave() {
    wx.showLoading({ title: '保存中...' })

    const designData = {
      name: `设计_${new Date().toLocaleString('zh-CN')}`,
      fileName: `design_${Date.now()}.json`,
      baseLayer: this.data.designData.base_layer,
      furnitureLayer: this.data.designData.furniture_layer,
      gridSize: this.data.gridSize,
      cellSize: this.data.cellSize
    }

    wx.request({
      url: `${config.apiBaseUrl}/api/designs`,
      method: 'POST',
      data: designData,
      success: (res) => {
        wx.hideLoading()
        if (res.data.success) {
          // 同时保存到本地缓存
          this.saveToLocalCache()

          const fileName = res.data.fileName || res.data.file_name || designData.fileName

          wx.showToast({
            title: `保存成功: ${fileName}`,
            icon: 'success',
            duration: 2000
          })
        } else {
          wx.showModal({
            title: '保存失败',
            content: res.data.error || '未知错误',
            showCancel: false
          })
        }
      },
      fail: (err) => {
        wx.hideLoading()
        wx.showModal({
          title: '网络错误',
          content: '无法连接到后端服务,请确保 Flask 服务已启动',
          showCancel: false
        })
      }
    })
  },

  /**
   * 加载设计文件列表(显示文件列表)
   */
  onLoadDesign() {
    wx.showLoading({ title: '加载中...' })

    wx.request({
      url: `${config.apiBaseUrl}/api/files`,
      method: 'GET',
      success: (res) => {
        wx.hideLoading()
        if (Array.isArray(res.data)) {
          this.setData({
            fileList: res.data,
            showLoadDialog: true
          })
        } else {
          wx.showToast({
            title: '获取文件列表失败',
            icon: 'none'
          })
        }
      },
      fail: (err) => {
        wx.hideLoading()
        wx.showModal({
          title: '网络错误',
          content: '无法连接到后端服务',
          showCancel: false
        })
      }
    })
  },

  /**
   * 选择文件
   */
  onSelectFile(e) {
    const filename = e.currentTarget.dataset.filename
    this.setData({ selectedFile: filename })
  },

  /**
   * 确认加载
   */
  onConfirmLoad() {
    const { selectedFile } = this.data

    if (!selectedFile) {
      wx.showToast({
        title: '请选择文件',
        icon: 'none'
      })
      return
    }

    wx.showLoading({ title: '加载中...' })

    wx.request({
      url: `${config.apiBaseUrl}/api/designs/load`,
      method: 'POST',
      data: { fileName: selectedFile },
      success: (res) => {
        wx.hideLoading()
        if (res.data.success) {
          const design = res.data.design

          // 兼容 camelCase 和 snake_case
          const baseLayer = design.baseLayer || design.base_layer || {
            walls: [],
            rooms: [],
            doors: [],
            windows: []
          }

          const furnitureLayer = design.furnitureLayer || design.furniture_layer || {
            fans: [],
            chairs: [],
            tables: [],
            beds: []
          }

          // 更新设计数据
          this.setData({
            designData: {
              base_layer: baseLayer,
              furniture_layer: furnitureLayer
            },
            gridSize: design.gridSize || design.grid_size || 20,
            cellSize: design.cellSize || design.cell_size || design.grid_cell_size || 30,
            showLoadDialog: false,
            selectedFile: null
          })

          // 保存到本地缓存
          this.saveToLocalCache()

          // 重新初始化Canvas并渲染
          this.initCanvas()

          wx.showToast({
            title: '加载成功',
            icon: 'success'
          })
        } else {
          wx.showModal({
            title: '加载失败',
            content: res.data.error || '未知错误',
            showCancel: false
          })
        }
      },
      fail: (err) => {
        wx.hideLoading()
        wx.showModal({
          title: '网络错误',
          content: '无法连接到后端服务',
          showCancel: false
        })
      }
    })
  },

  /**
   * 取消加载
   */
  onCancelLoad() {
    this.setData({
      showLoadDialog: false,
      selectedFile: null
    })
  }
})
