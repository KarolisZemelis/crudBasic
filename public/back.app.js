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
var image = document.querySelector('.card-img-top');
var imageInput = document.querySelector('.image-upload');
if (imageInput) {
  imageInput.addEventListener('change', function (_) {
    var file = imageInput.files[0]; // Get the selected file
    if (file) {
      var reader = new FileReader(); // Create a FileReader object
      reader.onload = function (e) {
        image.src = e.target.result; // Update the image source with the data URL
      };
      reader.readAsDataURL(file); // Read the file as a data URL
    }
  });
}
/******/ })()
;