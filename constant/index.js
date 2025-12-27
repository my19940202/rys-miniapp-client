// 公共常量
const userOptions = {
    schools: [
        { label: '初中', value: 'middle' },
        { label: '高中', value: 'high' }
    ],
    grades: [
        { label: '初一', value: 'm1' },
        { label: '初二', value: 'm2' },
        { label: '初三', value: 'm3' },
        { label: '高一', value: 'h1' },
        { label: '高二', value: 'h2' },
        { label: '高三', value: 'h3' }
    ],
};

const gradeMap = {
    m1: '初一',
    m2: '初二',
    m3: '初三',
    h1: '高一',
    h2: '高二',
    h3: '高三'
};

module.exports = {
    userOptions,
    gradeMap
};
