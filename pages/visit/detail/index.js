// pages/visit/detail/index.js

// 模拟数据（实际应该从列表页传入或从服务器获取）
const visitData = [
  {
    id: 1,
    title: '文成公主雕塑',
    description: '矗立于日月山巅的文成公主雕像，讲述着唐朝与吐蕃和亲的千年故事...',
    coverImage: 'https://via.placeholder.com/400x300/4CAF50/FFFFFF?text=文成公主雕塑',
    duration: '3:20',
    category: '历史景点',
    audioUrl: 'https://example.com/audio1.mp3',
    content: `文成公主雕塑位于日月山主峰，高约15米，由汉白玉雕刻而成。\n\n公元641年，文成公主远嫁吐蕃，途经日月山时，回望故土，思念家乡。传说她在此摔碎了唐太宗赐予的"日月宝镜"，形成了东边的日山和西边的月山。\n\n这座雕像于1999年建成，已成为日月山的标志性景观，每年吸引数万游客前来瞻仰，感受这段历史佳话。`
  },
  {
    id: 2,
    title: '中国地理分界石',
    description: '站在这里，一脚踏两界，感受季风与非季风区的神奇交汇...',
    coverImage: 'https://via.placeholder.com/400x300/2196F3/FFFFFF?text=地理分界石',
    duration: '2:45',
    category: '自然景观',
    audioUrl: 'https://example.com/audio2.mp3',
    content: `日月山是中国重要的地理分界线，东侧为季风区，西侧为非季风区。\n\n这块界石竖立于海拔3520米处，标志着青藏高原与黄土高原的交界，也是我国外流区与内流区的分水岭。\n\n站在这里，你可以明显感受到两侧气候的差异：东边湿润多雨，西边干燥少雨，形成了独特的自然景观。`
  },
  {
    id: 3,
    title: '古道博物馆',
    description: '穿越时空的走廊，探寻唐蕃古道上的文明印记...',
    coverImage: 'https://via.placeholder.com/400x300/FF9800/FFFFFF?text=古道博物馆',
    duration: '8:15',
    category: '文化展馆',
    audioUrl: 'https://example.com/audio3.mp3',
    content: `古道博物馆展示了唐蕃古道1300多年的历史文化。\n\n馆内收藏了200余件珍贵文物，包括唐代的陶器、铜镜，吐蕃时期的金银器皿，以及古道上的驿站遗物。\n\n通过现代科技手段，馆内还原了文成公主进藏的场景，让游客身临其境地感受这段历史。建议游览时间1-1.5小时。`
  },
  {
    id: 4,
    title: '日亭与月亭',
    description: '日月同辉，阴阳交汇，领略日月山的文化内涵...',
    coverImage: 'https://via.placeholder.com/400x300/E91E63/FFFFFF?text=日亭月亭',
    duration: '4:10',
    category: '建筑景观',
    audioUrl: 'https://example.com/audio4.mp3',
    content: `日亭和月亭是日月山的标志性建筑，分立于东西两峰。\n\n日亭建于东峰，象征太阳；月亭建于西峰，象征月亮。两亭遥相呼应，寓意日月同辉、阴阳和谐。\n\n每年夏至日，日亭正对日出方向；冬至日，月亭正对月升方向，体现了古人高超的天文历法知识。`
  }
]

Page({
  data: {
    visitDetail: {},
    isPlaying: false,
    currentTime: 0,
    duration: 200, // 默认时长（秒）
    recommendList: [],
    audioContext: null
  },

  onLoad(options) {
    const id = parseInt(options.id)
    this.loadDetail(id)
    this.loadRecommend(id)
  },

  // 加载详情数据
  loadDetail(id) {
    const detail = visitData.find(item => item.id === id)
    if (detail) {
      this.setData({
        visitDetail: detail,
        duration: this.parseDuration(detail.duration)
      })
      
      // 创建音频上下文（实际项目中使用真实音频URL）
      this.createAudioContext(detail.audioUrl)
    }
  },

  // 加载推荐内容
  loadRecommend(currentId) {
    const recommend = visitData.filter(item => item.id !== currentId).slice(0, 3)
    this.setData({
      recommendList: recommend
    })
  },

  // 创建音频上下文
  createAudioContext(audioUrl) {
    const audioContext = wx.createInnerAudioContext()
    audioContext.src = audioUrl
    
    audioContext.onPlay(() => {
      this.setData({ isPlaying: true })
    })
    
    audioContext.onPause(() => {
      this.setData({ isPlaying: false })
    })
    
    audioContext.onTimeUpdate(() => {
      this.setData({
        currentTime: Math.floor(audioContext.currentTime),
        duration: Math.floor(audioContext.duration) || this.data.duration
      })
    })
    
    audioContext.onEnded(() => {
      this.setData({
        isPlaying: false,
        currentTime: 0
      })
    })
    
    this.data.audioContext = audioContext
  },

  // 播放/暂停音频
  toggleAudio() {
    const { audioContext, isPlaying } = this.data
    
    if (!audioContext) {
      wx.showToast({
        title: '音频加载中...',
        icon: 'none'
      })
      return
    }

    if (isPlaying) {
      audioContext.pause()
    } else {
      audioContext.play()
    }
  },

  // 滑块改变
  onSliderChange(e) {
    const value = e.detail.value
    const { audioContext } = this.data
    if (audioContext) {
      audioContext.seek(value)
    }
  },

  // 跳转到其他详情页
  goToOtherDetail(e) {
    const id = e.currentTarget.dataset.id
    wx.redirectTo({
      url: `/pages/visit/detail/index?id=${id}`
    })
  },

  // 解析时长字符串（如 "3:20" -> 200秒）
  parseDuration(timeStr) {
    const parts = timeStr.split(':')
    return parseInt(parts[0]) * 60 + parseInt(parts[1])
  },

  // 格式化时间显示
  formatTime(seconds) {
    const min = Math.floor(seconds / 60)
    const sec = seconds % 60
    return `${min}:${sec.toString().padStart(2, '0')}`
  },

  onUnload() {
    // 页面卸载时销毁音频
    if (this.data.audioContext) {
      this.data.audioContext.destroy()
    }
  },

  // 分享转发功能
  onShareAppMessage() {
    const { visitDetail } = this.data
    return {
      title: `日月山景区 - ${visitDetail.title || '导览详情'}`,
      path: `/pages/visit/detail/index?id=${visitDetail.id}`,
      imageUrl: visitDetail.coverImage || ''
    }
  },

  // 分享到朋友圈
  onShareTimeline() {
    const { visitDetail } = this.data
    return {
      title: `日月山景区 - ${visitDetail.title || '导览详情'}`,
      query: `id=${visitDetail.id}`,
      imageUrl: visitDetail.coverImage || ''
    }
  }
})

