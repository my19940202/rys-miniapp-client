Page({
  data: {
    // 地图配置
    mapCenter: {
      latitude: 36.442053,
      longitude: 101.095139
    },
    scale: 17,
    
    // 分类配置
    categories: [
    //   { value: 'all', label: '全部', emoji: '🗺️' },
      { value: 'mountain', label: '山体', emoji: '⛰️' },
      { value: 'building', label: '古建筑', emoji: '🏛️' },
      { value: 'toilet', label: '厕所', emoji: '🚻' },
      { value: 'service', label: '服务点', emoji: '🏪' }
    ],
    currentTab: 'mountain',
    
    // 所有景点数据
    allMarkers: [
      // 山体景点
      { id: 1, type: 'mountain', latitude: 36.442053, longitude: 101.095139, 
        title: '日月山主峰', description: '日月山位于青海省湟源县西南，是青海农业区与牧业区的分界线，海拔3520米。', 
        images: [], emoji: '⛰️' },
      { id: 2, type: 'mountain', latitude: 36.443200, longitude: 101.097000, 
        title: '日亭', description: '日亭建于山顶，象征着太阳升起的地方，是观赏日出的绝佳位置。', 
        images: [], emoji: '⛰️' },
      { id: 3, type: 'mountain', latitude: 36.441000, longitude: 101.093000, 
        title: '月亭', description: '月亭与日亭遥相呼应，传说文成公主在此摔碎宝镜，从此山分日月。', 
        images: [], emoji: '⛰️' },
      
      // 古建筑
      { id: 4, type: 'building', latitude: 36.442500, longitude: 101.095500, 
        title: '文成公主纪念馆', description: '纪念馆展示了文成公主进藏的历史故事和珍贵文物，是了解藏汉文化交流的重要场所。', 
        images: [], emoji: '🏛️' },
      { id: 5, type: 'building', latitude: 36.441800, longitude: 101.094500, 
        title: '日月山牌坊', description: '古老的石牌坊，见证了千年来往来商旅的历史，是茶马古道的重要标志。', 
        images: [], emoji: '🏛️' },
      { id: 6, type: 'mountain', latitude: 36.442800, longitude: 101.096200, 
        title: '藏经楼', description: '保存有珍贵的藏文经卷和历史文献，是研究藏传佛教的重要资料库。', 
        images: [], emoji: '🏛️' },
      
      // 厕所
      { id: 7, type: 'toilet', latitude: 36.442300, longitude: 101.095800, 
        title: '游客中心厕所', description: '位于游客中心旁，设施齐全，保持清洁。', 
        images: [], emoji: '🚻' },
      { id: 8, type: 'toilet', latitude: 36.441500, longitude: 101.093500, 
        title: '月亭景区厕所', description: '月亭附近公共厕所，方便游客使用。', 
        images: [], emoji: '🚻' },
      { id: 9, type: 'toilet', latitude: 36.443500, longitude: 101.097300, 
        title: '日亭景区厕所', description: '日亭区域公共厕所，设施完善。', 
        images: [], emoji: '🚻' },
      
      // 服务点
      { id: 10, type: 'service', latitude: 36.442200, longitude: 101.095300, 
        title: '游客服务中心', description: '提供咨询、购票、寄存、租赁等综合服务。营业时间：08:00-18:00', 
        images: [], emoji: '🏪' },
      { id: 11, type: 'service', latitude: 36.442600, longitude: 101.096500, 
        title: '特产商店', description: '售卖青海特色工艺品、牦牛肉干、青稞酒等地方特产。', 
        images: [], emoji: '🏪' },
      { id: 12, type: 'service', latitude: 36.441200, longitude: 101.093800, 
        title: '休息驿站', description: '提供休息座椅、热水供应和简单餐饮服务。', 
        images: [], emoji: '🏪' },
      { id: 13, type: 'service', latitude: 36.443000, longitude: 101.097500, 
        title: '观景台小卖部', description: '提供饮料、零食和应急药品，方便游客补给。', 
        images: [], emoji: '🏪' }
    ],
    
    // 当前显示的markers
    markers: [],
    
    // 推荐路线（景点ID序列）
    recommendRoute: [10, 1, 4, 2, 3, 5, 6],
    
    // 路线polyline数据
    polylines: [],
    showRoute: false,
    
    // 弹窗相关
    showPopup: false,
    currentSpot: null
  },

  onLoad() {
    this.mapContext = wx.createMapContext('scenic-map');
    // 初始化显示当前tab对应的markers
    this.filterMarkers(this.data.currentTab);
  },

  // Tab切换事件
  onTabChange(e) {
    const tab = e.detail.value;
    this.setData({ currentTab: tab });
    this.filterMarkers(tab);
  },

  // 根据分类过滤markers
  filterMarkers(type) {
    const { allMarkers } = this.data;
    let filtered = type === 'all' ? allMarkers : allMarkers.filter(m => m.type === type);
    
    // 山体景点使用的图片URL
    const mountainIconUrl = 'https://636c-cloud1-5g5eyjtze161c202-1319072486.tcb.qcloud.la/moutain.png';
    const hadaIconUrl = 'https://636c-cloud1-5g5eyjtze161c202-1319072486.tcb.qcloud.la/hada.png';
    
    // 转换为地图markers格式
    const markers = filtered.map(spot => {
      // 如果是山体景点，使用图片作为图标
      if (spot.type === 'mountain' ) {
        return {
          id: spot.id,
          latitude: spot.latitude,
          longitude: spot.longitude,
          title: spot.title,
          iconPath: spot.id === 6 ? hadaIconUrl : mountainIconUrl,
          width: spot.id === 6 ? 40 : 80,
          height: spot.id === 6 ? 40 : 80,
          callout: {
            content: spot.title,
            fontSize: 14,
            color: '#333',
            bgColor: '#ffffff',
            borderRadius: 4,
            padding: 8,
            display: 'BYCLICK'
          }
        };
      }
      
      // // 如果是古建筑且id为6，使用hada图片作为图标
      // if (spot.type === 'building' && spot.id === 6) {
      //   return {
      //     id: spot.id,
      //     latitude: spot.latitude,
      //     longitude: spot.longitude,
      //     title: spot.title,
      //     iconPath: hadaIconUrl,
      //     width: 80,
      //     height: 80,
      //     callout: {
      //       content: spot.title,
      //       fontSize: 14,
      //       color: '#333',
      //       bgColor: '#ffffff',
      //       borderRadius: 4,
      //       padding: 8,
      //       display: 'BYCLICK'
      //     }
      //   };
      // }
      
      // 其他类型使用emoji标签
      return {
        id: spot.id,
        latitude: spot.latitude,
        longitude: spot.longitude,
        title: spot.title,
        width: 20,
        height: 28,
        label: {
          content: spot.emoji,
          fontSize: 24,
          color: '#333',
          bgColor: '#ffffff',
          borderRadius: 20,
          padding: 8,
          textAlign: 'center'
        }
      };
    });
    
    this.setData({ markers });
  },

  // 点击marker
  onMarkerTap(e) {
    const markerId = e.detail.markerId;
    const spot = this.data.allMarkers.find(m => m.id === markerId);
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
    const { showRoute, recommendRoute, allMarkers } = this.data;
    
    if (!showRoute) {
      // 生成路线数据
      const points = recommendRoute.map(id => {
        const spot = allMarkers.find(m => m.id === id);
        return {
          latitude: spot.latitude,
          longitude: spot.longitude
        };
      });
      
      const polylines = [{
        points: points,
        color: '#FF6B6B',
        width: 4,
        arrowLine: true,
        borderColor: '#ffffff',
        borderWidth: 2
      }];
      
      this.setData({ 
        polylines,
        showRoute: true 
      });
      
      wx.showToast({
        title: '已显示推荐路线',
        icon: 'success'
      });
    } else {
      // 隐藏路线
      this.setData({ 
        polylines: [],
        showRoute: false 
      });
      
      wx.showToast({
        title: '已隐藏路线',
        icon: 'none'
      });
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
      imageUrl: '/images/site.png' // 分享卡片的图片
    }
  }
})