'use strict';

var bar = 'xxxx';
let foo = ()=>alert(bar);
foo();
// alert('ok');
// new Promise((resolve) => {
//   setTimeout(resolve, 1000);
// }).then(function() { document.write('ffff'); });
// try {
//   var a = () => {alert(13)};
//   a();
// } catch (err) {
//   alert('ffff');
// }
window.onerror=function(){alert(Array.prototype.join.call(arguments, ', '))}
// const foo = 'xx';
// var a = '123';
// alert(a)
// try {
//   alert(12)
//   alert(()=>{})
// } catch (err) {
//   alert('xxx')
// }
