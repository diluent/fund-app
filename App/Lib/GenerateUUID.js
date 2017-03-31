
/**
*  Генерация случайного UUID
* @return {string} UUID вида 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'
*/
export default () => 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    var r = Math.random() * 16 | 0,
        v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
});s