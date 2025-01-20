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
var navBar = document.querySelectorAll('.nav-link');
navBar.forEach(function (menuItem) {
  menuItem.addEventListener('click', function () {
    menuItem.classList.add('active');
    menuItem.setAttribute('aria-current', 'page');
    var currentUrl = window.location.href;
    console.log(currentUrl);
  });
});
/******/ })()
;