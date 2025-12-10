/**
 * 房间设计页面主逻辑
 */

const gridUtils = require('./utils/grid.js')
const drawingUtils = require('./utils/drawing.js')
const config = require('../../config.js')
const { GridPlacementEngine } = require('./utils/gridPlacementEngine.js')

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

    // 风扇参数
    fanDirection: 'C', // 风扇方向: N, NE, E, SE, S, SW, W, NW, C
    mountFaceOptions: [
      { value: 'N', label: '上 (N)' },
      { value: 'S', label: '下 (S)' },
      { value: 'W', label: '左 (W)' },
      { value: 'E', label: '右 (E)' }
    ],
    mountFaceIndex: 0, // 默认选择上方
    mountOffset: 0.5, // 沿墙偏移 0-1
    rotationMin: -45, // 转动角度最小值
    rotationMax: 45, // 转动角度最大值
    speedMin: 0, // 转速最小值
    speedMax: 120, // 转速最大值

    // 家具朝向参数
    orientationOptions: [
      { value: 'N', label: '朝上 (N)' },
      { value: 'E', label: '朝右 (E)' },
      { value: 'S', label: '朝下 (S)' },
      { value: 'W', label: '朝左 (W)' }
    ],
    orientationIndex: 0, // 默认朝上

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
      },
      overlay_layer: {
        heatmap: null // 热力图数据: { grid: number[][], minValue, maxValue, unit }
      }
    },

    // UI状态
    showGrid: true, // 是否显示网格
    currentCoord: null, // 当前坐标
    currentHeatmapValue: null, // 当前热力图值
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
    ctx: null,
    canvasDisplaySize: 600,

    // 网格放置引擎
    placementEngine: null
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    // 初始化网格放置引擎
    this.data.placementEngine = new GridPlacementEngine(this.data.gridSize)

    this.initCanvas()
    this.loadFromLocalCache()
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {
    if (wx.onWindowResize) {
      this.windowResizeHandler = () => {
        this.updateCanvasDisplaySize()
      }
      wx.onWindowResize(this.windowResizeHandler)
    }
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {
    // 页面显示时重新渲染
    this.updateCanvasDisplaySize()
    if (this.data.ctx) {
      this.render()
    }
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload() {
    if (wx.offWindowResize && this.windowResizeHandler) {
      wx.offWindowResize(this.windowResizeHandler)
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
        }, () => {
          this.updateCanvasDisplaySize()
        })

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
   * 根据容器大小更新canvas显示尺寸，确保保持方形比例
   */
  updateCanvasDisplaySize() {
    const query = wx.createSelectorQuery()
    query.select('#canvasContainer')
      .boundingClientRect((rect) => {
        if (!rect) return
        const size = Math.min(rect.width, rect.height)
        if (size <= 0) return

        // 仅当尺寸变化时才更新，避免不必要的 setData
        if (Math.abs(size - this.data.canvasDisplaySize) < 0.5) {
          this.updateCanvasRect()
          return
        }

        this.setData({
          canvasDisplaySize: size
        }, () => {
          wx.nextTick(() => {
            this.updateCanvasRect()
          })
        })
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

    // 绘制基础层元素（始终显示）
    const baseLayer = designData.base_layer

    // 绘制房间(最底层)
    baseLayer.rooms.forEach((room, index) => {
      const isSelected = selectedElement && selectedElement.type === 'room' && this.data.selectedElementIndex === index
      drawingUtils.drawRoom(ctx, room, cellSize, '#e0e0e0', isSelected)
    })

    // 绘制墙壁
    baseLayer.walls.forEach((wall, index) => {
      const isSelected = selectedElement && selectedElement.type === 'wall' && this.data.selectedElementIndex === index
      drawingUtils.drawWall(ctx, wall, cellSize, '#000000', isSelected)
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

    // 绘制家具层元素（仅在家具层和叠加层显示）
    if (currentLayer === 'furniture' || currentLayer === 'overlay') {
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
    }

    // 绘制叠加层（热力图等）
    if (currentLayer === 'overlay') {
      const overlayLayer = designData.overlay_layer
      if (overlayLayer && overlayLayer.heatmap) {
        drawingUtils.drawHeatmap(ctx, overlayLayer.heatmap, gridSize, cellSize)
      }
    }
  },

  /**
   * 将触摸坐标转换为画布内坐标
   */
  touchToCanvasCoord(touch) {
    const rect = this.canvasRect
    if (!rect) {
      // 如果还未拿到位置信息，回退到原始坐标避免阻塞交互
      return { x: touch.x || touch.clientX, y: touch.y || touch.clientY }
    }

    const touchX = typeof touch.clientX === 'number' ? touch.clientX : touch.x
    const touchY = typeof touch.clientY === 'number' ? touch.clientY : touch.y

    const canvasX = touchX - rect.left
    const canvasY = touchY - rect.top

    const logicalSize = this.data.gridSize * this.data.cellSize
    const scaleX = logicalSize / rect.width
    const scaleY = logicalSize / rect.height

    return {
      x: canvasX * scaleX,
      y: canvasY * scaleY
    }
  },

  /**
   * 触摸开始
   */
  onTouchStart(e) {
    const touch = e.touches[0]
    const { x, y } = this.touchToCanvasCoord(touch)

    const gridCoord = gridUtils.pixelToGrid(x, y, this.data.cellSize)

    // 边界检查
    if (!gridUtils.isValidGridCoord(gridCoord.x, gridCoord.y, this.data.gridSize)) {
      return
    }

    // 更新当前坐标
    this.setData({ currentCoord: gridCoord })

    // 叠加层模式：显示热力图值，禁用绘制工具
    if (this.data.currentLayer === 'overlay') {
      this.updateHeatmapValue(gridCoord)
      return
    }

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
    const { x, y } = this.touchToCanvasCoord(touch)

    const gridCoord = gridUtils.pixelToGrid(x, y, this.data.cellSize)

    // 边界检查
    if (!gridUtils.isValidGridCoord(gridCoord.x, gridCoord.y, this.data.gridSize)) {
      return
    }

    // 更新当前坐标
    this.setData({ currentCoord: gridCoord })

    // 叠加层模式：更新热力图值显示
    if (this.data.currentLayer === 'overlay') {
      this.updateHeatmapValue(gridCoord)
      return
    }

    // 如果正在绘制,显示预览
    if (this.data.drawing && this.data.startPoint) {
      this.renderPreview(gridCoord)
    }
  },

  /**
   * 触摸结束
   */
  onTouchEnd(e) {
    // 隐藏坐标指示器和热力图值
    this.setData({
      currentCoord: null,
      currentHeatmapValue: null
    })

    if (!this.data.drawing) return

    const touch = e.changedTouches[0]
    const { x, y } = this.touchToCanvasCoord(touch)

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

      // 转换为矩形格式预览墙壁
      const x = Math.min(startPoint.x, snappedEndX)
      const y = Math.min(startPoint.y, snappedEndY)
      const width = Math.abs(snappedEndX - startPoint.x) + 1
      const height = Math.abs(snappedEndY - startPoint.y) + 1

      const pos = gridUtils.gridToPixel(x, y, cellSize)
      ctx.fillStyle = 'rgba(66, 66, 66, 0.5)'
      ctx.fillRect(pos.x, pos.y, width * cellSize, height * cellSize)

      // 绘制虚线边框
      ctx.strokeStyle = '#9e9e9e'
      ctx.lineWidth = 2
      ctx.setLineDash([5, 5])
      ctx.strokeRect(pos.x, pos.y, width * cellSize, height * cellSize)
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

    // 转换为矩形格式 {x, y, width, height}
    const x = Math.min(startPoint.x, finalEndX)
    const y = Math.min(startPoint.y, finalEndY)
    const width = Math.abs(finalEndX - startPoint.x) + 1
    const height = Math.abs(finalEndY - startPoint.y) + 1

    const wall = {
      id: Date.now() + Math.random(),
      type: 'wall',
      x: x,
      y: y,
      width: width,
      height: height
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
      id: Date.now() + Math.random(),
      type: 'room',
      x: x,
      y: y,
      width: width,
      height: height,
      points: [
        { x: x, y: y },
        { x: x + width, y: y },
        { x: x + width, y: y + height },
        { x: x, y: y + height }
      ]
    }

    const designData = this.data.designData
    designData.base_layer.rooms.push(room)

    // 更新房间内部区域
    this.data.placementEngine.updateRoomInteriors(designData.base_layer.rooms)

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
      const minX = wall.x
      const maxX = wall.x + wall.width - 1
      const minY = wall.y
      const maxY = wall.y + wall.height - 1
      const isHorizontal = wall.height === 1 && wall.width > 1
      const isVertical = wall.width === 1 && wall.height > 1

      if (isHorizontal) {
        // 检查是否与当前格子相邻或重合
        if (minY >= gridCoord.y - 1 && minY <= gridCoord.y + 1 &&
            gridCoord.x >= minX && gridCoord.x <= maxX) {
          hasHorizontalWall = true
        }
      }

      if (isVertical) {
        // 检查是否与当前格子相邻或重合
        if (minX >= gridCoord.x - 1 && minX <= gridCoord.x + 1 &&
            gridCoord.y >= minY && gridCoord.y <= maxY) {
          hasVerticalWall = true
        }
      }
    }

    // 根据周围墙壁方向决定门窗方向
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
      id: Date.now() + Math.random(),
      type: currentTool,
      x: gridCoord.x,
      y: gridCoord.y,
      width: 1, // 占满整个格子
      height: 1, // 占满整个格子
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
    const { currentTool, designData, fanDirection, mountFaceOptions, mountFaceIndex, mountOffset, rotationMin, rotationMax, speedMin, speedMax, orientationOptions, orientationIndex } = this.data
    const furnitureLayer = designData.furniture_layer

    // 同步设计数据到放置引擎
    this.data.placementEngine.syncDesignData(designData)

    if (currentTool === 'fan') {
      // 风扇放置逻辑，参考原始系统
      const selectedFace = mountFaceOptions[mountFaceIndex].value
      
      // 尝试在点击的格子内找到墙体
      let chosenWall = null
      for (let i = 0; i < designData.base_layer.walls.length; i++) {
        const wall = designData.base_layer.walls[i]
        const wx0 = wall.x
        const wy0 = wall.y
        const wx1 = wall.x + Math.max(1, wall.width) - 1
        const wy1 = wall.y + Math.max(1, wall.height) - 1
        if (gridCoord.x >= wx0 && gridCoord.x <= wx1 && gridCoord.y >= wy0 && gridCoord.y <= wy1) {
          chosenWall = wall
          break
        }
      }

      let mountInfo = null
      if (chosenWall) {
        // 用户点击的是墙体内部：使用 UI 指定的面与偏移计算挂载格
        const wall = chosenWall
        const face = selectedFace
        let cellX = wall.x
        let cellY = wall.y
        
        if (face === 'N') {
          const idx = Math.round(wall.x + mountOffset * Math.max(0, wall.width - 1))
          cellX = Math.max(wall.x, Math.min(wall.x + Math.max(0, wall.width - 1), idx))
          cellY = wall.y
        } else if (face === 'S') {
          const idx = Math.round(wall.x + mountOffset * Math.max(0, wall.width - 1))
          cellX = Math.max(wall.x, Math.min(wall.x + Math.max(0, wall.width - 1), idx))
          cellY = wall.y + Math.max(0, wall.height - 1)
        } else if (face === 'W') {
          const idx = Math.round(wall.y + mountOffset * Math.max(0, wall.height - 1))
          cellY = Math.max(wall.y, Math.min(wall.y + Math.max(0, wall.height - 1), idx))
          cellX = wall.x
        } else { // E
          const idx = Math.round(wall.y + mountOffset * Math.max(0, wall.height - 1))
          cellY = Math.max(wall.y, Math.min(wall.y + Math.max(0, wall.height - 1), idx))
          cellX = wall.x + Math.max(0, wall.width - 1)
        }

        mountInfo = { wall: wall, face: face, offset: mountOffset, cellX: cellX, cellY: cellY }
      } else {
        // 点击的格子不在墙体内部，尝试查找紧邻的墙体
        const adj = this.getAdjacentWall(gridCoord.x, gridCoord.y)
        if (!adj) {
          wx.showToast({
            title: '风扇必须挂在墙体上或紧邻墙体的格子',
            icon: 'none'
          })
          return
        }
        const face = selectedFace || adj.face
        mountInfo = { wall: adj.wall, face: face, offset: adj.offset, cellX: adj.cellX, cellY: adj.cellY }
      }

      const fan = {
        id: Date.now() + Math.random(),
        wallId: mountInfo.wall.id,
        mount_face: mountInfo.face,
        mount_offset: mountInfo.offset,
        mount_cell_x: mountInfo.cellX,
        mount_cell_y: mountInfo.cellY,
        x: mountInfo.cellX,
        y: mountInfo.cellY,
        default_direction: fanDirection,
        direction: fanDirection,
        rotation_range: { min: rotationMin, max: rotationMax },
        speed_range: { min: speedMin, max: speedMax },
        width: 1,
        height: 1
      }

      const result = this.data.placementEngine.placeElement(fan, 'fan', designData)
      if (!result.success) {
        wx.showToast({
          title: result.errorMessage,
          icon: 'none'
        })
        return
      }
    } else if (currentTool === 'chair') {
      // 椅子固定为 1x1
      const orientation = orientationOptions[orientationIndex].value
      const chair = {
        id: Date.now() + Math.random(),
        x: gridCoord.x,
        y: gridCoord.y,
        width: 1,
        height: 1,
        orientation: orientation
      }

      const result = this.data.placementEngine.placeElement(chair, 'chair', designData)
      if (!result.success) {
        wx.showToast({
          title: result.errorMessage,
          icon: 'none'
        })
        return
      }
    } else if (currentTool === 'table') {
      // 桌子默认 2x1，可根据朝向旋转
      const orientation = orientationOptions[orientationIndex].value
      let width = 2, height = 1
      if (orientation === 'E' || orientation === 'W') {
        [width, height] = [height, width]
      }

      const table = {
        id: Date.now() + Math.random(),
        x: gridCoord.x,
        y: gridCoord.y,
        width: width,
        height: height,
        orientation: orientation
      }

      const result = this.data.placementEngine.placeElement(table, 'table', designData)
      if (!result.success) {
        wx.showToast({
          title: result.errorMessage,
          icon: 'none'
        })
        return
      }
    } else if (currentTool === 'bed') {
      // 床默认 2x3，可根据朝向旋转
      const orientation = orientationOptions[orientationIndex].value
      let width = 2, height = 3
      if (orientation === 'E' || orientation === 'W') {
        [width, height] = [height, width]
      }

      const bed = {
        id: Date.now() + Math.random(),
        x: gridCoord.x,
        y: gridCoord.y,
        width: width,
        height: height,
        orientation: orientation
      }

      const result = this.data.placementEngine.placeElement(bed, 'bed', designData)
      if (!result.success) {
        wx.showToast({
          title: result.errorMessage,
          icon: 'none'
        })
        return
      }
    }

    this.setData({ designData })
    this.render()

    // 保存到本地缓存
    this.saveToLocalCache()
  },

  /**
   * 检测相邻墙壁(用于风扇挂墙)
   * @returns {Object} {attached: boolean, direction: string, wallSide: string}
   *   - attached: 是否挂墙
   *   - direction: 风扇朝向（朝向房内，与墙相反）
   *   - wallSide: 墙在哪一侧（用于绘制连线）
   */
  detectAdjacentWall(gridCoord) {
    const { designData } = this.data
    const walls = designData.base_layer.walls

    // 检查四个方向是否有墙壁
    const directions = [
      { dir: 'up', opposite: 'down', dx: 0, dy: -1 }, // 墙在上方，风扇朝下
      { dir: 'down', opposite: 'up', dx: 0, dy: 1 },  // 墙在下方，风扇朝上
      { dir: 'left', opposite: 'right', dx: -1, dy: 0 }, // 墙在左侧，风扇朝右
      { dir: 'right', opposite: 'left', dx: 1, dy: 0 }  // 墙在右侧，风扇朝左
    ]

    for (const { dir, opposite, dx, dy } of directions) {
      const checkX = gridCoord.x + dx
      const checkY = gridCoord.y + dy

      // 检查该位置是否有墙壁
      for (const wall of walls) {
        if (this.isPointOnWall({ x: checkX, y: checkY }, wall)) {
          return {
            attached: true,
            direction: opposite,  // 风扇朝向与墙相反，朝向房内
            wallSide: dir         // 墙在哪一侧
          }
        }
      }
    }

    // 没有相邻墙壁，默认朝上
    return { attached: false, direction: 'up', wallSide: null }
  },

  /**
   * 查找给定画格是否紧邻某个墙体（原始系统方法）
   * @param {number} gridX 
   * @param {number} gridY 
   * @returns {Object|null} 返回墙体信息或null
   */
  getAdjacentWall(gridX, gridY) {
    const { designData } = this.data
    const walls = designData.base_layer.walls

    // 遍历每个墙体，检查墙体覆盖的每个格子
    for (let i = 0; i < walls.length; i++) {
      const wall = walls[i]

      const startX = wall.x
      const startY = wall.y
      const endX = wall.x + Math.max(1, wall.width) - 1
      const endY = wall.y + Math.max(1, wall.height) - 1

      for (let wy = startY; wy <= endY; wy++) {
        for (let wx = startX; wx <= endX; wx++) {
          // 检查四个方向的相邻格
          if (gridX === wx - 1 && gridY === wy) {
            // 点击在墙格左侧 -> 挂在墙的西侧 (W)，偏移按垂直方向计算
            const offset = (wy - startY + 0.5) / Math.max(1, wall.height)
            return { wall: wall, face: 'W', offset: Math.max(0, Math.min(1, offset)), cellX: wx, cellY: wy }
          }
          if (gridX === wx + 1 && gridY === wy) {
            // 右侧 -> E
            const offset = (wy - startY + 0.5) / Math.max(1, wall.height)
            return { wall: wall, face: 'E', offset: Math.max(0, Math.min(1, offset)), cellX: wx, cellY: wy }
          }
          if (gridX === wx && gridY === wy - 1) {
            // 上方 -> N
            const offset = (wx - startX + 0.5) / Math.max(1, wall.width)
            return { wall: wall, face: 'N', offset: Math.max(0, Math.min(1, offset)), cellX: wx, cellY: wy }
          }
          if (gridX === wx && gridY === wy + 1) {
            // 下方 -> S
            const offset = (wx - startX + 0.5) / Math.max(1, wall.width)
            return { wall: wall, face: 'S', offset: Math.max(0, Math.min(1, offset)), cellX: wx, cellY: wy }
          }
        }
      }
    }

    return null
  },

  /**
   * 判断点是否在墙壁上
   */
  isPointOnWall(point, wall) {
    const minX = wall.x
    const maxX = wall.x + wall.width - 1
    const minY = wall.y
    const maxY = wall.y + wall.height - 1

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

      // 检查风扇（支持挂墙风扇的选择）
      for (let i = furnitureLayer.fans.length - 1; i >= 0; i--) {
        const fan = furnitureLayer.fans[i]
        let isInFan = false
        
        if (fan.mount_cell_x !== undefined && fan.mount_cell_y !== undefined) {
          // 挂墙风扇，检查挂载格子
          isInFan = (gridCoord.x === fan.mount_cell_x && gridCoord.y === fan.mount_cell_y)
        } else if (fan.x !== undefined && fan.y !== undefined) {
          // 普通风扇
          isInFan = (gridCoord.x >= fan.x && gridCoord.x < fan.x + (fan.width || 1) && 
                     gridCoord.y >= fan.y && gridCoord.y < fan.y + (fan.height || 1))
        }
        
        if (isInFan) {
          this.setData({
            selectedElement: {
              ...fan,
              type: 'fan'
            },
            selectedElementIndex: i
          })
          this.syncFanControlsToSelected(fan)
          found = true
          break
        }
      }

      // 检查椅子
      if (!found) {
        for (let i = furnitureLayer.chairs.length - 1; i >= 0; i--) {
          const chair = furnitureLayer.chairs[i]
          if (this.isPointInFurniture(gridCoord, chair)) {
            this.setData({
              selectedElement: { ...chair, type: 'chair' },
              selectedElementIndex: i
            })
            this.syncFurnitureControlsToSelected(chair)
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
            this.syncFurnitureControlsToSelected(table)
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
            this.syncFurnitureControlsToSelected(bed)
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

    const minX = wall.x - threshold
    const maxX = wall.x + wall.width - 1 + threshold
    const minY = wall.y - threshold
    const maxY = wall.y + wall.height - 1 + threshold

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
    const { selectedElement, selectedElementIndex, designData, currentLayer, gridSize } = this.data

    if (currentLayer !== 'furniture' || !selectedElement || selectedElementIndex < 0) {
      wx.showToast({
        title: '请先选择家具',
        icon: 'none'
      })
      return
    }

    const type = selectedElement.type
    const furnitureLayer = designData.furniture_layer

    // 风扇挂墙时不允许旋转
    if (type === 'fan' && selectedElement.wallAttached) {
      wx.showToast({
        title: '挂墙风扇不可旋转',
        icon: 'none'
      })
      return
    }

    // 定义旋转顺序
    const rotationOrder = ['up', 'right', 'down', 'left']
    const currentDirection = selectedElement.direction
    const currentIndex = rotationOrder.indexOf(currentDirection)
    const nextDirection = rotationOrder[(currentIndex + 1) % 4]

    // 对于多格家具，需要交换宽高并检查越界
    if (type === 'table' || type === 'bed') {
      const furniture = type === 'table' ? furnitureLayer.tables[selectedElementIndex] : furnitureLayer.beds[selectedElementIndex]

      // 计算旋转后的尺寸
      const currentWidth = furniture.width || 1
      const currentHeight = furniture.height || 1

      // 旋转90度时交换宽高
      const isVerticalRotation = (currentDirection === 'up' || currentDirection === 'down') && (nextDirection === 'left' || nextDirection === 'right')
      const isHorizontalRotation = (currentDirection === 'left' || currentDirection === 'right') && (nextDirection === 'up' || nextDirection === 'down')

      let newWidth = currentWidth
      let newHeight = currentHeight

      if (isVerticalRotation || isHorizontalRotation) {
        // 交换宽高
        newWidth = currentHeight
        newHeight = currentWidth
      }

      // 越界检查
      if (furniture.x + newWidth > gridSize || furniture.y + newHeight > gridSize) {
        wx.showToast({
          title: '旋转后超出边界',
          icon: 'none'
        })
        return
      }

      // 更新宽高和朝向
      furniture.width = newWidth
      furniture.height = newHeight
      furniture.direction = nextDirection

      // 更新选中元素
      selectedElement.width = newWidth
      selectedElement.height = newHeight
      selectedElement.direction = nextDirection
    } else {
      // 单格家具（风扇、椅子）只需更新朝向
      if (type === 'fan') {
        furnitureLayer.fans[selectedElementIndex].direction = nextDirection
      } else if (type === 'chair') {
        furnitureLayer.chairs[selectedElementIndex].direction = nextDirection
      }

      // 更新选中元素的朝向
      selectedElement.direction = nextDirection
    }

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
        overlayLayer: this.data.designData.overlay_layer,
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

        const overlayLayer = design.overlayLayer || design.overlay_layer || {
          heatmap: null
        }

        // 兼容旧版风扇数据（没有 wallSide 字段）
        furnitureLayer.fans = furnitureLayer.fans.map(fan => {
          if (fan.wallAttached && !fan.wallSide) {
            // 旧数据：direction 表示墙的位置，需要转换
            const oppositeMap = {
              'up': 'down',
              'down': 'up',
              'left': 'right',
              'right': 'left'
            }
            return {
              ...fan,
              wallSide: fan.direction, // 旧的 direction 实际是墙的位置
              direction: oppositeMap[fan.direction] || 'down' // 风扇朝向相反
            }
          }
          return fan
        })

        this.setData({
          designData: {
            base_layer: baseLayer,
            furniture_layer: furnitureLayer,
            overlay_layer: overlayLayer
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
      overlayLayer: this.data.designData.overlay_layer,
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

          const overlayLayer = design.overlayLayer || design.overlay_layer || {
            heatmap: null
          }

          // 兼容旧版风扇数据（没有 wallSide 字段）
          furnitureLayer.fans = furnitureLayer.fans.map(fan => {
            if (fan.wallAttached && !fan.wallSide) {
              // 旧数据：direction 表示墙的位置，需要转换
              const oppositeMap = {
                'up': 'down',
                'down': 'up',
                'left': 'right',
                'right': 'left'
              }
              return {
                ...fan,
                wallSide: fan.direction, // 旧的 direction 实际是墙的位置
                direction: oppositeMap[fan.direction] || 'down' // 风扇朝向相反
              }
            }
            return fan
          })

          // 更新设计数据
          this.setData({
            designData: {
              base_layer: baseLayer,
              furniture_layer: furnitureLayer,
              overlay_layer: overlayLayer
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
  },

  /**
   * 加载分析数据（热力图）
   */
  onLoadAnalysis() {
    wx.showLoading({ title: '加载分析数据...' })

    // 尝试从后端API加载
    wx.request({
      url: `${config.apiBaseUrl}/api/analysis/heatmap`,
      method: 'GET',
      success: (res) => {
        wx.hideLoading()
        if (res.data.success && res.data.heatmap) {
          this.loadHeatmapData(res.data.heatmap)
        } else {
          // 后端API不可用，加载Mock数据
          this.loadMockHeatmap()
        }
      },
      fail: (err) => {
        wx.hideLoading()
        // 网络错误，加载Mock数据
        this.loadMockHeatmap()
      }
    })
  },

  /**
   * 加载Mock热力图数据（用于演示）
   */
  loadMockHeatmap() {
    const { gridSize } = this.data

    // 生成模拟的通风效率数据
    const grid = []
    let minValue = Infinity
    let maxValue = -Infinity

    for (let y = 0; y < gridSize; y++) {
      const row = []
      for (let x = 0; x < gridSize; x++) {
        // 使用简单的径向渐变模拟通风效率
        // 假设中心有风扇，边缘效率较低
        const centerX = gridSize / 2
        const centerY = gridSize / 2
        const distance = Math.sqrt(Math.pow(x - centerX, 2) + Math.pow(y - centerY, 2))
        const maxDistance = Math.sqrt(centerX * centerX + centerY * centerY)

        // 效率值：中心高，边缘低，加入随机扰动
        const baseValue = 1 - (distance / maxDistance)
        const noise = (Math.random() - 0.5) * 0.2
        const value = Math.max(0, Math.min(1, baseValue + noise)) * 100 // 0-100范围

        row.push(value)
        minValue = Math.min(minValue, value)
        maxValue = Math.max(maxValue, value)
      }
      grid.push(row)
    }

    const heatmapData = {
      grid: grid,
      minValue: minValue,
      maxValue: maxValue,
      unit: '%' // 百分比单位
    }

    this.loadHeatmapData(heatmapData)
  },

  /**
   * 加载热力图数据到叠加层
   */
  loadHeatmapData(heatmapData) {
    const designData = this.data.designData
    designData.overlay_layer.heatmap = heatmapData

    this.setData({ designData })

    // 切换到叠加层以显示热力图
    if (this.data.currentLayer !== 'overlay') {
      this.setData({ currentLayer: 'overlay' })
    }

    this.render()

    // 保存到本地缓存
    this.saveToLocalCache()

    wx.showToast({
      title: '分析数据加载成功',
      icon: 'success'
    })
  },

  /**
   * 清除热力图
   */
  onClearHeatmap() {
    const designData = this.data.designData
    designData.overlay_layer.heatmap = null

    this.setData({ designData })
    this.render()

    // 保存到本地缓存
    this.saveToLocalCache()

    wx.showToast({
      title: '热力图已清除',
      icon: 'success'
    })
  },

  /**
   * 更新热力图值显示（在叠加层触摸时调用）
   */
  updateHeatmapValue(gridCoord) {
    const { designData } = this.data
    const heatmap = designData.overlay_layer.heatmap

    if (!heatmap || !heatmap.grid) {
      this.setData({ currentHeatmapValue: null })
      return
    }

    // 检查坐标是否有效
    if (gridCoord.y >= 0 && gridCoord.y < heatmap.grid.length &&
        gridCoord.x >= 0 && gridCoord.x < heatmap.grid[gridCoord.y].length) {
      const value = heatmap.grid[gridCoord.y][gridCoord.x]
      this.setData({
        currentHeatmapValue: {
          value: value,
          unit: heatmap.unit
        }
      })
    } else {
      this.setData({ currentHeatmapValue: null })
    }
  },

  /**
   * 选择风扇方向
   */
  onSelectFanDirection(e) {
    const direction = e.currentTarget.dataset.direction
    this.setData({ fanDirection: direction })

    // 如果当前选中的是风扇，同步更新
    if (this.data.selectedElement && this.data.selectedElement.type === 'fan') {
      this.updateSelectedFanDirection(direction)
    }
  },

  /**
   * 更新选中风扇的方向
   */
  updateSelectedFanDirection(direction) {
    const { selectedElement, selectedElementIndex, designData } = this.data
    if (!selectedElement || selectedElement.type !== 'fan' || selectedElementIndex < 0) return

    // 更新数据
    const fan = designData.furniture_layer.fans[selectedElementIndex]
    fan.default_direction = direction
    fan.direction = direction

    // 更新选中元素
    selectedElement.default_direction = direction
    selectedElement.direction = direction

    this.setData({
      designData,
      selectedElement
    })

    this.render()
    this.saveToLocalCache()
  },

  /**
   * 挂墙面选择变化
   */
  onMountFaceChange(e) {
    const index = e.detail.value
    this.setData({ mountFaceIndex: index })

    // 如果当前选中的是风扇，同步更新
    if (this.data.selectedElement && this.data.selectedElement.type === 'fan') {
      const face = this.data.mountFaceOptions[index].value
      this.updateSelectedFanMountFace(face)
    }
  },

  /**
   * 更新选中风扇的挂墙面
   */
  updateSelectedFanMountFace(face) {
    const { selectedElement, selectedElementIndex, designData } = this.data
    if (!selectedElement || selectedElement.type !== 'fan' || selectedElementIndex < 0) return

    const fan = designData.furniture_layer.fans[selectedElementIndex]
    fan.mount_face = face

    // 重新计算挂载位置（如果有关联的墙体）
    if (fan.wallId) {
      const wall = designData.base_layer.walls.find(w => w.id === fan.wallId)
      if (wall) {
        const offset = this.data.mountOffset
        let cellX = wall.x
        let cellY = wall.y

        if (face === 'N') {
          const idx = Math.round(wall.x + offset * Math.max(0, wall.width - 1))
          cellX = Math.max(wall.x, Math.min(wall.x + Math.max(0, wall.width - 1), idx))
          cellY = wall.y
        } else if (face === 'S') {
          const idx = Math.round(wall.x + offset * Math.max(0, wall.width - 1))
          cellX = Math.max(wall.x, Math.min(wall.x + Math.max(0, wall.width - 1), idx))
          cellY = wall.y + Math.max(0, wall.height - 1)
        } else if (face === 'W') {
          const idx = Math.round(wall.y + offset * Math.max(0, wall.height - 1))
          cellY = Math.max(wall.y, Math.min(wall.y + Math.max(0, wall.height - 1), idx))
          cellX = wall.x
        } else { // E
          const idx = Math.round(wall.y + offset * Math.max(0, wall.height - 1))
          cellY = Math.max(wall.y, Math.min(wall.y + Math.max(0, wall.height - 1), idx))
          cellX = wall.x + Math.max(0, wall.width - 1)
        }

        fan.mount_cell_x = cellX
        fan.mount_cell_y = cellY
        selectedElement.mount_cell_x = cellX
        selectedElement.mount_cell_y = cellY
      }
    }

    selectedElement.mount_face = face

    this.setData({
      designData,
      selectedElement
    })

    this.render()
    this.saveToLocalCache()
  },

  /**
   * 沿墙偏移变化
   */
  onMountOffsetChange(e) {
    const offset = e.detail.value
    this.setData({ mountOffset: offset })

    // 如果当前选中的是风扇，同步更新
    if (this.data.selectedElement && this.data.selectedElement.type === 'fan') {
      this.updateSelectedFanMountOffset(offset)
    }
  },

  /**
   * 更新选中风扇的沿墙偏移
   */
  updateSelectedFanMountOffset(offset) {
    const { selectedElement, selectedElementIndex, designData } = this.data
    if (!selectedElement || selectedElement.type !== 'fan' || selectedElementIndex < 0) return

    const fan = designData.furniture_layer.fans[selectedElementIndex]
    fan.mount_offset = offset

    // 重新计算挂载位置
    if (fan.wallId && fan.mount_face) {
      const wall = designData.base_layer.walls.find(w => w.id === fan.wallId)
      if (wall) {
        const face = fan.mount_face
        let cellX = wall.x
        let cellY = wall.y

        if (face === 'N') {
          const idx = Math.round(wall.x + offset * Math.max(0, wall.width - 1))
          cellX = Math.max(wall.x, Math.min(wall.x + Math.max(0, wall.width - 1), idx))
          cellY = wall.y
        } else if (face === 'S') {
          const idx = Math.round(wall.x + offset * Math.max(0, wall.width - 1))
          cellX = Math.max(wall.x, Math.min(wall.x + Math.max(0, wall.width - 1), idx))
          cellY = wall.y + Math.max(0, wall.height - 1)
        } else if (face === 'W') {
          const idx = Math.round(wall.y + offset * Math.max(0, wall.height - 1))
          cellY = Math.max(wall.y, Math.min(wall.y + Math.max(0, wall.height - 1), idx))
          cellX = wall.x
        } else { // E
          const idx = Math.round(wall.y + offset * Math.max(0, wall.height - 1))
          cellY = Math.max(wall.y, Math.min(wall.y + Math.max(0, wall.height - 1), idx))
          cellX = wall.x + Math.max(0, wall.width - 1)
        }

        fan.mount_cell_x = cellX
        fan.mount_cell_y = cellY
        selectedElement.mount_cell_x = cellX
        selectedElement.mount_cell_y = cellY
      }
    }

    selectedElement.mount_offset = offset

    this.setData({
      designData,
      selectedElement
    })

    this.render()
    this.saveToLocalCache()
  },

  /**
   * 转动角度范围变化
   */
  onRotationMinChange(e) {
    const value = parseFloat(e.detail.value) || -45
    this.setData({ rotationMin: value })
    this.updateSelectedFanRotationRange()
  },

  onRotationMaxChange(e) {
    const value = parseFloat(e.detail.value) || 45
    this.setData({ rotationMax: value })
    this.updateSelectedFanRotationRange()
  },

  /**
   * 更新选中风扇的转动角度范围
   */
  updateSelectedFanRotationRange() {
    const { selectedElement, selectedElementIndex, designData, rotationMin, rotationMax } = this.data
    if (!selectedElement || selectedElement.type !== 'fan' || selectedElementIndex < 0) return

    const fan = designData.furniture_layer.fans[selectedElementIndex]
    fan.rotation_range = { min: rotationMin, max: rotationMax }
    selectedElement.rotation_range = { min: rotationMin, max: rotationMax }

    this.setData({
      designData,
      selectedElement
    })

    this.saveToLocalCache()
  },

  /**
   * 转速范围变化
   */
  onSpeedMinChange(e) {
    const value = parseFloat(e.detail.value) || 0
    this.setData({ speedMin: value })
    this.updateSelectedFanSpeedRange()
  },

  onSpeedMaxChange(e) {
    const value = parseFloat(e.detail.value) || 120
    this.setData({ speedMax: value })
    this.updateSelectedFanSpeedRange()
  },

  /**
   * 更新选中风扇的转速范围
   */
  updateSelectedFanSpeedRange() {
    const { selectedElement, selectedElementIndex, designData, speedMin, speedMax } = this.data
    if (!selectedElement || selectedElement.type !== 'fan' || selectedElementIndex < 0) return

    const fan = designData.furniture_layer.fans[selectedElementIndex]
    fan.speed_range = { min: speedMin, max: speedMax }
    selectedElement.speed_range = { min: speedMin, max: speedMax }

    this.setData({
      designData,
      selectedElement
    })

    this.saveToLocalCache()
  },

  /**
   * 家具朝向变化
   */
  onOrientationChange(e) {
    const index = e.detail.value
    this.setData({ orientationIndex: index })

    // 如果当前选中的是家具，同步更新
    if (this.data.selectedElement && ['chair', 'table', 'bed'].includes(this.data.selectedElement.type)) {
      const orientation = this.data.orientationOptions[index].value
      this.updateSelectedFurnitureOrientation(orientation)
    }
  },

  /**
   * 更新选中家具的朝向
   */
  updateSelectedFurnitureOrientation(orientation) {
    const { selectedElement, selectedElementIndex, designData, gridSize } = this.data
    if (!selectedElement || selectedElementIndex < 0) return

    const type = selectedElement.type
    const furnitureLayer = designData.furniture_layer

    if (type === 'chair') {
      const chair = furnitureLayer.chairs[selectedElementIndex]
      chair.orientation = orientation
      selectedElement.orientation = orientation
    } else if (type === 'table') {
      const table = furnitureLayer.tables[selectedElementIndex]
      
      // 桌子需要根据朝向调整宽高
      let newWidth = 2, newHeight = 1
      if (orientation === 'E' || orientation === 'W') {
        [newWidth, newHeight] = [newHeight, newWidth] // 交换宽高
      }

      // 检查是否越界
      if (table.x + newWidth > gridSize || table.y + newHeight > gridSize) {
        wx.showToast({
          title: '旋转后超出边界',
          icon: 'none'
        })
        return
      }

      table.orientation = orientation
      table.width = newWidth
      table.height = newHeight
      selectedElement.orientation = orientation
      selectedElement.width = newWidth
      selectedElement.height = newHeight
    } else if (type === 'bed') {
      const bed = furnitureLayer.beds[selectedElementIndex]
      
      // 床需要根据朝向调整宽高
      let newWidth = 2, newHeight = 3
      if (orientation === 'E' || orientation === 'W') {
        [newWidth, newHeight] = [newHeight, newWidth] // 交换宽高
      }

      // 检查是否越界
      if (bed.x + newWidth > gridSize || bed.y + newHeight > gridSize) {
        wx.showToast({
          title: '旋转后超出边界',
          icon: 'none'
        })
        return
      }

      bed.orientation = orientation
      bed.width = newWidth
      bed.height = newHeight
      selectedElement.orientation = orientation
      selectedElement.width = newWidth
      selectedElement.height = newHeight
    }

    this.setData({
      designData,
      selectedElement
    })

    this.render()
    this.saveToLocalCache()
  },

  /**
   * 同步风扇控件到选中的风扇
   */
  syncFanControlsToSelected(fan) {
    // 同步风扇方向
    const direction = fan.default_direction || fan.direction || 'C'
    
    // 同步挂墙面
    let mountFaceIndex = 0
    if (fan.mount_face) {
      const faceIndex = this.data.mountFaceOptions.findIndex(opt => opt.value === fan.mount_face)
      if (faceIndex >= 0) mountFaceIndex = faceIndex
    }

    // 同步其他参数
    const mountOffset = fan.mount_offset !== undefined ? fan.mount_offset : 0.5
    const rotationMin = fan.rotation_range ? fan.rotation_range.min : -45
    const rotationMax = fan.rotation_range ? fan.rotation_range.max : 45
    const speedMin = fan.speed_range ? fan.speed_range.min : 0
    const speedMax = fan.speed_range ? fan.speed_range.max : 120

    this.setData({
      fanDirection: direction,
      mountFaceIndex: mountFaceIndex,
      mountOffset: mountOffset,
      rotationMin: rotationMin,
      rotationMax: rotationMax,
      speedMin: speedMin,
      speedMax: speedMax
    })
  },

  /**
   * 同步家具控件到选中的家具
   */
  syncFurnitureControlsToSelected(furniture) {
    // 同步朝向
    let orientationIndex = 0
    if (furniture.orientation) {
      const index = this.data.orientationOptions.findIndex(opt => opt.value === furniture.orientation)
      if (index >= 0) orientationIndex = index
    }

    this.setData({
      orientationIndex: orientationIndex
    })
  }
})
