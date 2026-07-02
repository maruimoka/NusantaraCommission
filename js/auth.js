// =======================
// ELEMENTS
// =======================
const loginBtn = document.querySelector(".login-btn");
const loginModal = document.getElementById("loginModal");
const registerModal = document.getElementById("registerModal");
const profileMenu = document.getElementById("profileMenu");

const loginSubmitBtn = document.getElementById("loginSubmitBtn");
const registerSubmitBtn = document.getElementById("registerSubmitBtn");


// =======================
// OPEN LOGIN MODAL
// =======================
if (loginBtn && loginModal) {
    loginBtn.addEventListener("click", () => {
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

ocument.getElementById("closeregister")?.addEventListener("click", () => {

    registerModal.style.display = "none";

    loginModal.style.display = "none";

    resetRegisterForm();
    resetLoginForm();

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

        registerModal.style.display = "none";
        loginModal.style.display = "flex";
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

        alert("Login berhasil!");

        loginModal.style.display = "none";
        loginBtn.style.display = "none";
        profileMenu.style.display = "flex";
    });
}

function resetLoginForm() {

    document.getElementById("loginForm").reset();

}

function resetRegisterForm() {

    document.getElementById("registerForm").reset();

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
