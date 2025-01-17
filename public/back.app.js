/******/ (() => { // webpackBootstrap
/*!*************************!*\
  !*** ./src/back.app.js ***!
  \*************************/
var message = document.querySelector('.message');
if (message) {
  setTimeout(function () {
    message.style.display = 'none';
  }, 2500);
}
var hamMenu = document.querySelector('.ham-menu');
var offScreenMenu = document.querySelector('.off-screen-menu');
hamMenu.addEventListener('click', function () {
  hamMenu.classList.toggle('active');
  offScreenMenu.classList.toggle('active');
});
/******/ })()
;