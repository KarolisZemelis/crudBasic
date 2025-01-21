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

const image = document.querySelector('.card-img-top')
const imageInput = document.querySelector('.image-upload')
if (imageInput) {
    imageInput.addEventListener('change', _ => {
        const file = imageInput.files[0]; // Get the selected file
        if (file) {
            const reader = new FileReader(); // Create a FileReader object
            reader.onload = (e) => {
                image.src = e.target.result; // Update the image source with the data URL
            };
            reader.readAsDataURL(file); // Read the file as a data URL
        }
    })
}


