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
    //   { value: 'all', label: '全部', emoji: '🗺️' },
      { value: 'mountain', label: '山体', emoji: '⛰️' },
      { value: 'building', label: '古建筑', emoji: '🏛️' },
      { value: 'toilet', label: '厕所', emoji: '🚻' },
      { value: 'service', label: '服务点', emoji: '🏪' }
    ],
    currentTab: 'mountain',
    polylines: [],
    showRoute: false,
    showPopup: false,
    currentSpot: null
  },

  async onLoad() {
    this.mapContext = wx.createMapContext('scenic-map');
    
    // 初始化时先设置边界限制（基于初始 mapCenter）
    const initialIncludePoints = this.calculateBoundaryPoints(this.data.mapCenter);
    this.setData({ includePoints: initialIncludePoints });
    
    // 等待全局云开发初始化
    const app = getApp();
    if (app.getInitPromise) {
      await app.getInitPromise();
    }
    const db = app.globalData.db;
    // 查询景点数据
    db.collection('scenic_spots').get().then(res => {
      const spots = res.data || [];
      // 1x1 透明 PNG data URI，避免显示默认红点，仅显示 callout
      const TRANSPARENT_PNG = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR4nGNgYAAAAAMAASsJTYQAAAAASUVORK5CYII=';
      // 组装markers（使用透明 iconPath + callout 文本）
      const markers = spots.map((spot, idx) => ({
        id: spot._id || idx,
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
          display: 'ALWAYS'
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
      
      // 以 mapCenter 为中心计算景区边界点，限制地图显示区域
      const includePoints = this.calculateBoundaryPoints(mapCenter);
      
      this.setData({ markers, allSpots: spots, mapCenter, includePoints });
    });
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
  onTabChange(e) {
    const tab = e.detail.value;
    this.setData({ currentTab: tab });
    this.filterMarkers(tab);
  },

  // 点击marker
  onMarkerTap(e) {
    const markerId = e.detail.markerId;
    const spot = (this.data.allSpots || [])
        .find(m => (m._id || m.id) === markerId || m.id === markerId);
    if (spot) {
      this.setData({
        currentSpot: spot,
        showPopup: true
      });
    }
  },

  // 关闭弹窗
  closePopup() {
    this.setData({ showPopup: false });
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

  // 播放语音（占位功能）
  playAudio() {
    wx.showToast({
      title: '语音讲解功能待开发',
      icon: 'none'
    });
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