// =======================
// ELEMENTS
// =======================
const loginBtn = document.querySelector(".login-btn");
const loginModal = document.getElementById("loginModal");
const registerModal = document.getElementById("registerModal");
const profileMenu = document.getElementById("profileMenu");

const loginSubmitBtn = document.getElementById("loginSubmitBtn");
const registerSubmitBtn = document.getElementById("registerSubmitBtn");

const forgotModal =
document.getElementById("forgotModal");

const forgotPasswordBtn =
document.getElementById("forgotPassword");

const forgotSubmitBtn =
document.getElementById("forgotSubmitBtn");

const rememberMe =
document.getElementById("rememberMe");

const loginEmail =
document.getElementById("username");


// =======================
// OPEN LOGIN MODAL
// =======================
if (loginBtn && loginModal) {
    loginBtn.addEventListener("click", () => {

    const savedEmail =
    localStorage.getItem("rememberEmail");

    if(savedEmail){

        loginEmail.value = savedEmail;

        rememberMe.checked = true;

    }

    loginModal.style.display = "flex";

});
}


// =======================
// CLOSE MODALS
// =======================
document.getElementById("closelogin")?.addEventListener("click", () => {

    loginModal.style.display = "none";

    resetLoginForm();

});

document.getElementById("closeregister")?.addEventListener("click", () => {

    registerModal.style.display = "none";

    loginModal.style.display = "none";

    resetRegisterForm();
    resetLoginForm();

});


// =======================
// FORGOT PASSWORD
// =======================

forgotPasswordBtn?.addEventListener("click",(e)=>{

    e.preventDefault();

    loginModal.style.display="none";

    forgotModal.style.display="flex";

    document.getElementById("forgotEmail").value =
    loginEmail.value;

});

document.getElementById("closeforgot")
?.addEventListener("click",()=>{

    forgotModal.style.display="none";

    loginModal.style.display="flex";

    resetForgotForm();

});

forgotSubmitBtn?.addEventListener("click",async()=>{

    const email =
    document.getElementById("forgotEmail").value.trim();

    if(!email){

        alert("Masukkan email.");

        return;

    }

    const { error } =
    await supabaseClient.auth.resetPasswordForEmail(email,{

        redirectTo:
        "https://maruimoka.github.io/NusantaraCommission/reset-password.html"

    });

    if(error){

        alert(error.message);

        return;

    }

    alert("Reset password link telah dikirim.");

    forgotModal.style.display="none";

    loginModal.style.display="flex";

    resetForgotForm();

});
// =======================
// SWITCH MODAL
// =======================
document.getElementById("showregister")?.addEventListener("click", (e) => {
    e.preventDefault();
    resetLoginForm();
    loginModal.style.display = "none";
    registerModal.style.display = "flex";
});

document.getElementById("showlogin")?.addEventListener("click", (e) => {
    e.preventDefault();
     resetRegisterForm();
    registerModal.style.display = "none";
    loginModal.style.display = "flex";
});


// =======================
// REGISTER
// =======================
if (registerSubmitBtn) {
    registerSubmitBtn.addEventListener("click", async () => {

        const email = document.getElementById("reg-email").value;
        const password = document.getElementById("reg-password").value;
        const username = document.getElementById("reg-username").value;

        // basic validation
        if (!email || !password || !username) {
            alert("Semua field harus diisi!");
            return;
        }

        // 1. AUTH SIGNUP
        const { data, error } = await supabaseClient.auth.signUp({
            email,
            password
        });

        if (error) {
            console.log("Signup error:", error);
            alert(error.message);
            return;
        }

        const user = data.user;

        if (!user) {
            alert("Signup gagal: user tidak terbentuk");
            return;
        }

        // 2. INSERT USERS TABLE
        const { error: insertError } = await supabaseClient
            .from("users")
            .insert(
                {
                    id: user.id,
                    username: username
                }
            );

        if (insertError) {
             alert(insertError.message);
            return;
        }
        
        alert("Register berhasil!");
        const { data: sessionData } =
            await supabaseClient.auth.getSession();
        console.log(sessionData.session);

        registerModal.style.display = "none";
        loginModal.style.display = "none";
        
        loginBtn.style.display = "none";
        profileMenu.style.display = "flex";

        resetRegisterForm();
        resetLoginForm();
    });
}


// =======================
// LOGIN
// =======================
if (loginSubmitBtn) {
    loginSubmitBtn.addEventListener("click", async () => {

        const email = document.getElementById("username").value;
        const password = document.getElementById("password").value;

        if (!email || !password) {
            alert("Email dan password wajib diisi!");
            return;
        }

        const { error } = await supabaseClient.auth.signInWithPassword({
            email,
            password
        });

if (error) {
            alert(error.message);
            return;
        }
if (rememberMe.checked) {

    localStorage.setItem(
        "rememberEmail",
        email
    );

} else {

    localStorage.removeItem(
        "rememberEmail"
    );

}
        
        alert("Login berhasil!");

        resetLoginForm();

        loginModal.style.display = "none";
        loginBtn.style.display = "none";
        profileMenu.style.display = "flex";
    });
}

function resetLoginForm() {

    document.getElementById("password").value = "";

}

function resetRegisterForm() {

    document.getElementById("registerForm").reset();

}

function resetForgotForm() {

    document.getElementById("forgotEmail").value = "";

}
// =======================
// CHECK SESSION
// =======================
async function checkLogin() {
    const { data, error } = await supabaseClient.auth.getSession();

    if (error) {
        console.log("Session error:", error);
        return;
    }

    if (data.session) {
        loginBtn.style.display = "none";
        profileMenu.style.display = "flex";
    } else {
        loginBtn.style.display = "block";
        profileMenu.style.display = "none";
    }
}

checkLogin();
window.addEventListener("load", () => {

    resetLoginForm();
    resetRegisterForm();
    resetForgotForm();

    const savedEmail =
    localStorage.getItem("rememberEmail");

    if(savedEmail){

        loginEmail.value = savedEmail;

        rememberMe.checked = true;

    }

});

// hide password
const togglePassword =
document.getElementById("togglePassword");

const passwordInput =
document.getElementById("password");

togglePassword?.addEventListener("click",()=>{

    if(passwordInput.type==="password"){

        passwordInput.type="text";

        togglePassword.classList.remove("fa-eye");
        togglePassword.classList.add("fa-eye-slash");

    }else{

        passwordInput.type="password";

        togglePassword.classList.remove("fa-eye-slash");
        togglePassword.classList.add("fa-eye");

    }

});

const toggleRegPassword =
document.getElementById("toggleRegPassword");

const regPasswordInput =
document.getElementById("reg-password");

toggleRegPassword?.addEventListener("click",()=>{

    if(regPasswordInput.type==="password"){

        regPasswordInput.type="text";

        toggleRegPassword.classList.remove("fa-eye");
        toggleRegPassword.classList.add("fa-eye-slash");

    }else{

        regPasswordInput.type="password";

        toggleRegPassword.classList.remove("fa-eye-slash");
        toggleRegPassword.classList.add("fa-eye");

    }

});
