// =======================
// CHECK SESSION
// =======================
async function checkSession() {
    const { data, error } = await supabaseClient.auth.getSession();

    if (error) {
        console.log("Session error:", error);
        return;
    }

    if (!data.session) {
        window.location.href = "index.html";
    }
}

checkSession();


// =======================
// LOGOUT MODAL ELEMENTS (SAFE)
// =======================
const logoutBtn = document.getElementById("logoutBtn");
const logoutModal = document.getElementById("logoutModal");
const closeLogout = document.querySelector(".close-logout");
const cancelLogout = document.getElementById("cancelLogout");
const confirmLogout = document.getElementById("confirmLogout");


// =======================
// OPEN MODAL
// =======================
if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
        logoutModal.style.display = "flex";
    });
}


// =======================
// CLOSE MODAL (X BUTTON)
// =======================
if (closeLogout) {
    closeLogout.addEventListener("click", () => {
        logoutModal.style.display = "none";
    });
}


// =======================
// CANCEL BUTTON
// =======================
if (cancelLogout) {
    cancelLogout.addEventListener("click", () => {
        logoutModal.style.display = "none";
    });
}


// =======================
// CLICK OUTSIDE MODAL
// =======================
window.addEventListener("click", (e) => {
    if (e.target === logoutModal) {
        logoutModal.style.display = "none";
    }
});


// =======================
// CONFIRM LOGOUT
// =======================
if (confirmLogout) {
    confirmLogout.addEventListener("click", async () => {

        const { error } = await supabaseClient.auth.signOut();

        if (error) {
            alert(error.message);
            return;
        }

        // tutup modal dulu
        logoutModal.style.display = "none";

        // redirect
        window.location.href = "index.html";
    });
}
