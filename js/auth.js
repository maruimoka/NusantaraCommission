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

registerSubmitBtn.addEventListener("click", async () => {

    const email = document.getElementById("reg-email").value;
    const password = document.getElementById("reg-password").value;
    const username = document.getElementById("reg-username").value;

    const { data, error } = await supabaseClient.auth.signUp({
        email,
        password
    });

    if (error) {
        alert(error.message);
        return;
    }

    const user = data.user;

    const { error: insertError } = await supabaseClient
        .from("users")
        .insert([
            {
                id: user.id,
                username: username
            }
        ]);

    if (insertError) {
        console.log(insertError);
    }

    alert("Register berhasil!");

    registerModal.style.display = "none";
    loginModal.style.display = "flex";

const { error: profileError } = await supabaseClient
.from("artist_profile")
.insert([
{
    user_id: user.id,
    display_name: username
}]);

console.log(profileError);
]);
});   // <-- HARUS ADA INI
    
console.log("Menutup register");

registerModal.style.display = "none";
loginModal.style.display = "flex";
});

loginSubmitBtn.addEventListener("click", async () => {

    const email = document.getElementById("username").value;
    const password = document.getElementById("password").value;

    const { data, error } = await supabaseClient.auth.signInWithPassword({
        email: email,
        password: password
    });

    if (error) {
        alert(error.message);
        return;
    }

    alert("Login berhasil!");
    
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

async function checkLogin() {

    const { data } = await supabaseClient.auth.getSession();

    if (data.session) {

        loginBtn.style.display = "none";
        profileMenu.style.display = "flex";

    } else {

        loginBtn.style.display = "block";
        profileMenu.style.display = "none";

    }

}

checkLogin();
