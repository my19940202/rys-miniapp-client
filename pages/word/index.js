import { getDateStr, showMessage } from '../../utils/index.js';

let now = new Date()

Page({
    data: {
        date: +now,
        wordCounters: [],
        minDate: new Date(now.getFullYear(), now.getMonth(), 1).getTime(),
        maxDate: new Date(now.getFullYear(), now.getMonth() + 1, 0).getTime(),
        dateFormat: null,
        userInfos: {},
        disabled: false
    },
    dateFormat(day) {
        const { date } = day;
        const dateStr = getDateStr(date);
        const hasRecord = this.data.wordCounters.some(counter => counter.create_time.split(' ')[0] === dateStr);
        day.suffix = hasRecord ? '已完成' : '待打卡';
        day.className = hasRecord ? 'active' : '';
        return day;
    },
    onLoad() {
        const me = this;
        const openId = wx.getStorageSync('openId');
        const userInfos = wx.getStorageSync('userInfo') || {};
        const wordCounters = wx.getStorageSync('wordCounters') || [];

        me.setData({ userInfos, openId, wordCounters, dateFormat: me.dateFormat.bind(me) })
    },
    handleDateChange(event) {
        const newDate = event.detail.value;
        const hasRecord = this.data.wordCounters.some(counter => counter.create_time.split(' ')[0] === getDateStr(newDate));
        this.setData({
            date: newDate,
            disabled: hasRecord
        });


    },
    onShow() {
        const userInfos = wx.getStorageSync('userInfo') || {};
        this.setData({ userInfos });
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