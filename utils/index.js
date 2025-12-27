//  工具类函数
import Message from 'tdesign-miniprogram/message';

function showMessage(type, context, msg) {
    const data = {
        context,
        offset: [20, 32],
        duration: 2000,
        content: msg
    }
    if (type === 'success') {
        Message.success(data);
    }
    else if (type === 'error') {
        Message.error(data);
    }
    else if (type === 'warning') {
        Message.warning(data);
    }
}

function getDateStr(time) {
    const date = time ? new Date(time) : new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0'); // 月份从0开始，所以要加1
    const day = String(date.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
}

function getDateTimeStr(time) {
    const date = time ? new Date(time) : new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');

    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}


function getDayOfYear(date) {
    // 获取当年的第一天
    const yearStart = new Date(date.getFullYear(), 0, 1);
    // 计算当前日期与年初的毫秒差，转换为天数
    const dayOfYear = Math.floor((date - yearStart) / (1000 * 60 * 60 * 24)) + 1;
    return dayOfYear;
}


module.exports = {
    showMessage,
    getDateStr,
    getDateTimeStr,
    getDayOfYear
};
