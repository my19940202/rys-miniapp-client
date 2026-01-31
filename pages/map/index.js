import { URL_PREFIX } from '../../constant/index';

Page({
  data: {
    // 地图配置
    mapCenter: {
      latitude: 36.442053,
      longitude: 101.095139
    },
    scale: 17,
    markers: [],
    includePoints: [], // 地图显示区域限制点
     // 分类配置
    categories: [
      { value: '历史人文', label: '历史人文', emoji: '📜' },
      { value: '自然风光', label: '自然风光', emoji: '⛰️' },
      { value: '建筑地标', label: '建筑地标', emoji: '🏛️' }
    ],
    currentTab: '历史人文',
    polylines: [],
    showRoute: false,
    showPopup: false,
    currentSpot: null,
    isAudioPlaying: false,
    audioTimeDisplay: '0:00'
  },

  async fetchSpotsByTab(tab) {
    // 切换/重新查询前统一重置UI，避免数据与展示不一致
    if (this.innerAudioContext) {
      this.innerAudioContext.stop();
    }
    this.setData({
      showPopup: false,
      currentSpot: null,
      isAudioPlaying: false,
      audioTimeDisplay: '0:00',
      showRoute: false,
      polylines: []
    });

    try {
      const app = getApp();
      if (app.getInitPromise) {
        await app.getInitPromise();
      }
      const db = app.globalData.db;
      const res = await db.collection('scenic_spots')
        .where({
          isDelete: false,
          status: 'active',
          tags: tab
        })
        .field({
          name: true,
          location: true,
          images: true,
          description: true,
          audio: true,
          tags: true
        })
        .get();

      const spots = (res?.data || []).filter(s => s?.location?.latitude && s?.location?.longitude);

      // 1x1 透明 PNG 避免显示默认红点，仅显示 callout
      const TRANSPARENT_PNG = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR4nGNgYAAAAAMAASsJTYQAAAAASUVORK5CYII=';
      const markers = spots.map((spot, idx) => ({
        id: idx,
        latitude: spot.location.latitude,
        longitude: spot.location.longitude,
        title: spot.name,
        iconPath: TRANSPARENT_PNG,
        width: 1,
        height: 1,
        callout: {
          content: spot.name,
          fontSize: 16,
          color: '#222222',
          bgColor: '#ffffff',
          borderRadius: 12,
          padding: 10,
          textAlign: 'center',
          display: 'ALWAYS',
          borderWidth: 1,
          borderColor: '#D4A574'
        }
      }));

      // 默认以第一个点为中心
      let mapCenter = this.data.mapCenter;
      if (spots.length > 0) {
        mapCenter = {
          latitude: spots[0].location.latitude,
          longitude: spots[0].location.longitude
        };
      }

      const includePoints = this.calculateBoundaryPoints(mapCenter);

      this.setData({ markers, allSpots: spots, mapCenter, includePoints });
    } catch (err) {
      console.error('获取景点数据失败:', err);
      this.setData({ markers: [], allSpots: [] });
      wx.showToast({ title: '加载失败', icon: 'none' });
    }
  },

  async onLoad() {
    this.mapContext = wx.createMapContext('scenic-map');
    this.innerAudioContext = wx.createInnerAudioContext();
    this.innerAudioContext.onEnded(() => {
      this.setData({ isAudioPlaying: false });
    });
    this.innerAudioContext.onStop(() => {
      this.setData({ isAudioPlaying: false });
    });
    this.innerAudioContext.onPause(() => {
      this.setData({ isAudioPlaying: false });
    });
    this.innerAudioContext.onError((err) => {
      console.warn('audio error:', err);
      this.setData({ isAudioPlaying: false });
    });
    
    // 初始化时先设置边界限制（基于初始 mapCenter）
    const initialIncludePoints = this.calculateBoundaryPoints(this.data.mapCenter);
    this.setData({ includePoints: initialIncludePoints });

    await this.fetchSpotsByTab(this.data.currentTab);
  },

  // 以 mapCenter 为中心计算景区边界点，用于限制地图显示区域
  calculateBoundaryPoints(mapCenter) {
    if (!mapCenter || !mapCenter.latitude || !mapCenter.longitude) {
      return [];
    }
    
    // 设置景区范围半径（约0.01度，约1公里），可根据实际景区大小调整
    const radius = 0.01;
    
    // 以中心点为中心，向四周扩展
    const minLat = mapCenter.latitude - radius;
    const maxLat = mapCenter.latitude + radius;
    const minLng = mapCenter.longitude - radius;
    const maxLng = mapCenter.longitude + radius;
    
    // 返回矩形区域的两个对角点（西南角和东北角）
    return [
      { latitude: minLat, longitude: minLng }, // 西南角
      { latitude: maxLat, longitude: maxLng }  // 东北角
    ];
  },

   // Tab切换事件
  async onTabChange(e) {
    const tab = e.detail.value;
    this.setData({ currentTab: tab });
    await this.fetchSpotsByTab(tab);
  },

  // 点击marker或callout（markerId 即创建 markers 时的 idx，与 allSpots 索引一一对应）
  onMarkerTap(e) {
    const markerId = e.detail.markerId;
    const spots = this.data.allSpots || [];
    const spot = spots[markerId];
    if (spot) {
      // 切换景点时先停止上一段音频
      if (this.innerAudioContext) {
        this.innerAudioContext.stop();
      }
      const audioDuration = spot?.audio?.duration;
      this.setData({
        currentSpot: spot,
        showPopup: true,
        isAudioPlaying: false,
        audioTimeDisplay: this.formatDuration(audioDuration)
      });
    } else {
      console.warn('未找到对应景点, markerId:', markerId, 'allSpots.length:', spots.length);
    }
  },

  // 关闭弹窗
  closePopup() {
    if (this.innerAudioContext) {
      this.innerAudioContext.stop();
    }
    this.setData({ showPopup: false, isAudioPlaying: false });
  },

  // 跳转景点详情页
  goToDetail() {
    const spot = this.data.currentSpot;
    const id = spot?._id;
    if (!id) {
      wx.showToast({ title: '缺少景点ID', icon: 'none' });
      return;
    }
    if (this.innerAudioContext) {
      this.innerAudioContext.stop();
    }
    this.setData({ showPopup: false, isAudioPlaying: false });
    wx.navigateTo({
      url: `/pages/spots/detail/index?id=${id}`
    });
  },

  // 一键导航
  goNavigation() {
    const spot = this.data.currentSpot;
    const id = spot?._id;
    if (!id) {
      wx.showToast({ title: '缺少景点ID', icon: 'none' });
      return;
    }
    wx.openLocation({
      latitude: spot.location.latitude,
      longitude: spot.location.longitude
    });
  },

  // 格式化时长显示（秒 -> m:ss）
  formatDuration(seconds) {
    if (!seconds) return '0:00';
    const min = Math.floor(seconds / 60);
    const sec = Math.floor(seconds % 60);
    return `${min}:${sec.toString().padStart(2, '0')}`;
  },

  // 播放/暂停语音讲解
  toggleAudio() {
    const spot = this.data.currentSpot;
    const url = spot?.audio?.url;
    if (!url) {
      wx.showToast({ title: '暂无语音讲解', icon: 'none' });
      return;
    }

    if (!this.innerAudioContext) {
      this.innerAudioContext = wx.createInnerAudioContext();
    }

    if (this.data.isAudioPlaying) {
      this.innerAudioContext.pause();
      this.setData({ isAudioPlaying: false });
      return;
    }

    // 切换景点时 url 可能变化，确保 src 正确
    if (this.innerAudioContext.src !== url) {
      this.innerAudioContext.stop();
      this.innerAudioContext.src = url;
    }
    this.innerAudioContext.play();
    this.setData({ isAudioPlaying: true });
  },

  // 地图缩放
  handleZoom(e) {
    const action = e.currentTarget.dataset.action;
    let newScale = this.data.scale;
    
    if (action === 'in' && newScale < 18) {
      newScale += 1;
    } else if (action === 'out' && newScale > 5) {
      newScale -= 1;
    }
    
    this.setData({ scale: newScale });
  },

  // 定位
  handleLocation() {
    wx.getLocation({
      type: 'gcj02',
      success: (res) => {
        this.mapContext.moveToLocation({
          latitude: res.latitude,
          longitude: res.longitude
        });
      },
      fail: () => {
        wx.showToast({
          title: '定位失败，请检查定位权限',
          icon: 'none'
        });
      }
    });
  },

  // 切换路线显示
  toggleRoute() {
    const { showRoute, allSpots } = this.data;
    if (!showRoute) {
      const spots = allSpots || [];
      if (spots.length === 0) {
        wx.showToast({ title: '暂无路线数据', icon: 'none' });
        return;
      }
      // 使用所有景点的顺序生成路线点
      const points = spots.map(s => ({
        latitude: s.location.latitude,
        longitude: s.location.longitude
      }));

      const polylines = [{
        points: points,
        color: '#FF6B6B',
        width: 4,
        arrowLine: true,
        borderColor: '#ffffff',
        borderWidth: 2
      }];

      this.setData({ polylines, showRoute: true });
      wx.showToast({ title: '已显示路线', icon: 'success' });
    } else {
      this.setData({ polylines: [], showRoute: false });
      wx.showToast({ title: '已隐藏路线', icon: 'none' });
    }
  },

  onUnload() {
    if (this.innerAudioContext) {
      this.innerAudioContext.destroy();
      this.innerAudioContext = null;
    }
  },

  // 分享转发功能
  onShareAppMessage() {
    return {
      title: '日月山景区导览',
      path: '/pages/map/index',
      imageUrl: URL_PREFIX + '/images/ai-bot/share-guide-new.png'
    }
  }
})