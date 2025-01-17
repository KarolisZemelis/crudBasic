const message = document.querySelector('.message')
if (message) {
    setTimeout(() => {
        message.style.display = 'none'
    }, 2500)
}

const hamMenu = document.querySelector('.ham-menu')
const offScreenMenu = document.querySelector('.off-screen-menu')

hamMenu.addEventListener('click', () => {
    hamMenu.classList.toggle('active');
    offScreenMenu.classList.toggle('active')
})

