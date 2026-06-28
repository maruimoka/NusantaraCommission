// Login Modal
const loginBtn = document.querySelector(".login-btn");
const loginModal = document.getElementById("loginModal");
const registerModal = document.getElementById("registerModal");
const profileMenu = document.getElementById("profileMenu");
const openLoginBtn = document.getElementById("openLoginBtn");
const loginSubmitBtn = document.getElementById("loginSubmitBtn");
const registerSubmitBtn = document.getElementById("registerSubmitBtn");


loginBtn.addEventListener("click", () => {
    loginModal.style.display = "flex";
});


// Close Button
const closeLogin = document.getElementById("closelogin");
const closeRegister = document.getElementById("closeregister");

closeLogin.addEventListener("click", () => {
    loginModal.style.display = "none";
    document.getElementById("username").value = "";
    document.getElementById("password").value = "";
});

closeRegister.addEventListener("click", () => {
    registerModal.style.display = "none";
    loginModal.style.display = "none";
    document.getElementById("reg-email").value = "";
    document.getElementById("reg-username").value = "";
    document.getElementById("reg-password").value = "";
});

// Switch Modal
const showregister = document.getElementById("showregister");
showregister.addEventListener("click", (e) => {
    e.preventDefault();
    document.getElementById("loginForm").reset();
    loginModal.style.display = "none";
    registerModal.style.display = "flex";
});

const showlogin = document.getElementById("showlogin");

showlogin.addEventListener("click", (e) => {
    e.preventDefault();
    document.getElementById("registerForm").reset();
    registerModal.style.display = "none";
    loginModal.style.display = "flex";
});


loginSubmitBtn.addEventListener("click", (e) => {

    loginModal.style.display = "none";

    loginBtn.style.display = "none";

    profileMenu.style.display = "flex";

});

// hero banner
const slides = document.querySelectorAll(".slide");

let currentSlide = 0;

setInterval(() => {

    // Hilangkan slide aktif
    slides[currentSlide].classList.remove("active");

    // Pindah ke slide berikutnya
    currentSlide++;

    if(currentSlide >= slides.length){
        currentSlide = 0;
    }

    // Tampilkan slide baru
    slides[currentSlide].classList.add("active");

    updateDots();

},1400);
const dots = document.querySelectorAll(".dot");
function updateDots(){

    dots.forEach(dot => {
        dot.classList.remove("active");
    });

    dots[currentSlide].classList.add("active");

}

const params = new URLSearchParams(window.location.search);
const username = params.get("user");

