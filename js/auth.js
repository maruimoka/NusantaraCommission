// LOGIN MODAL
const loginBtn = document.querySelector(".login-btn");
const loginModal = document.getElementById("loginModal");
const registerModal = document.getElementById("registerModal");
const profileMenu = document.getElementById("profileMenu");

const loginSubmitBtn = document.getElementById("loginSubmitBtn");
const registerSubmitBtn = document.getElementById("registerSubmitBtn");

// OPEN LOGIN
if (loginBtn) {
    loginBtn.addEventListener("click", () => {
        loginModal.style.display = "flex";
    });
}

// CLOSE LOGIN
document.getElementById("closelogin")?.addEventListener("click", () => {
    loginModal.style.display = "none";
});

// CLOSE REGISTER
document.getElementById("closeregister")?.addEventListener("click", () => {
    registerModal.style.display = "none";
    loginModal.style.display = "none";
});

// SWITCH MODAL
document.getElementById("showregister")?.addEventListener("click", (e) => {
    e.preventDefault();
    loginModal.style.display = "none";
    registerModal.style.display = "flex";
});

document.getElementById("showlogin")?.addEventListener("click", (e) => {
    e.preventDefault();
    registerModal.style.display = "none";
    loginModal.style.display = "flex";
});


// REGISTER
registerSubmitBtn.addEventListener("click", async () => {

    const email = document.getElementById("reg-email").value;
    const password = document.getElementById("reg-password").value;
    const username = document.getElementById("reg-username").value;

    // 1. signup auth
    const { data, error } = await supabaseClient.auth.signUp({
        email,
        password
    });

    if (error) {
        alert(error.message);
        return;
    }

    const user = data.user;

    // 2. insert ke tabel users
    const { error: insertError } = await supabaseClient
        .from("users")
        .insert([
            {
                id: user.id,
                username: username
            }
        ]);

    if (insertError) {
        console.log("Users insert error:", insertError);
        return;
    }

    // 3. OPTIONAL: artist profile (fix syntax)
    const { error: profileError } = await supabaseClient
        .from("artist_profile")
        .insert([
            {
                user_id: user.id,
                display_name: username
            }
        ]);

    if (profileError) {
        console.log("Profile insert error:", profileError);
    }

    alert("Register berhasil!");

    registerModal.style.display = "none";
    loginModal.style.display = "flex";
});


// LOGIN
loginSubmitBtn.addEventListener("click", async () => {

    const email = document.getElementById("username").value;
    const password = document.getElementById("password").value;

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


// CHECK SESSION
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
