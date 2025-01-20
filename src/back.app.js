const message = document.querySelector('.message')
if (message) {
    setTimeout(() => {
        message.style.display = 'none'
    }, 2500)
}

const navBar = document.querySelectorAll('.nav-link')
navBar.forEach((menuItem) => {
    menuItem.addEventListener('click', () => {
        menuItem.classList.add('active')
        menuItem.setAttribute('aria-current', 'page');
        const currentUrl = window.location.href;
        console.log(currentUrl)
    })

})


