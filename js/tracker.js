
// ======================
// TRACKER MODAL
// ======================
const trackerList = document.getElementById("trackerList");
const trackerModal = document.getElementById("trackerModal");
const closeBtn = document.querySelector(".close");

document.querySelectorAll(".tracker-card").forEach(card => {
    card.addEventListener("click", () => {
        trackerModal.style.display = "flex";
    });
});

closeBtn?.addEventListener("click", () => {
    trackerModal.style.display = "none";
});

window.addEventListener("click", (e) => {
    if (e.target === trackerModal) {
        trackerModal.style.display = "none";
    }
});


// ======================
// EDIT PROFILE MODAL
// ======================
const editProfileModal = document.getElementById("editProfileModal");
const openEditProfile = document.getElementById("openEditProfile");
const closeEditProfile = document.getElementById("closeEditProfile");

const saveProfileBtn = document.getElementById("saveProfileBtn");

const avatarInput = document.getElementById("avatarInput");
const editAvatarPreview = document.getElementById("editAvatarPreview");


// OPEN MODAL
openEditProfile?.addEventListener("click", () => {

    document.getElementById("editName").value =
        document.getElementById("profileName").textContent;

    document.getElementById("editBio").value =
        document.getElementById("profileBio").textContent;

    editProfileModal.style.display = "flex";
});


// CLOSE MODAL
closeEditProfile?.addEventListener("click", () => {
    editProfileModal.style.display = "none";
});


// IMAGE PREVIEW
avatarInput?.addEventListener("change", function () {

    const file = this.files[0];
    if (!file) return;

    const reader = new FileReader();

    reader.onload = (e) => {
        editAvatarPreview.src = e.target.result;
    };

    reader.readAsDataURL(file);
});


// ======================
// SAVE PROFILE (UI ONLY - kalau DB sudah di auth.js)
// ======================
saveProfileBtn?.addEventListener("click", () => {

    document.getElementById("profileName").textContent =
        document.getElementById("editName").value;

    document.getElementById("profileBio").textContent =
        document.getElementById("editBio").value;

    document.getElementById("profileUserImage").src =
        document.getElementById("editAvatarPreview").src;

    editProfileModal.style.display = "none";

    if (typeof showToast === "function") {
        showToast();
    }
});


// ======================
// SAFE INIT (FIX AWAY FROM GLOBAL AWAIT)
// ======================
async function initTracker() {

    const { data: sessionData } = await supabaseClient.auth.getSession();

    if (!sessionData?.session) return;

    const user = sessionData.session.user;

    const { data, error } = await supabaseClient
        .from("commissions")
        .select(`
            *,
            artist:artist_id (
                username,
                profile_image
            ),
            artwork:artwork_id (
                title,
                price,
                cover_image
            )
        `)
        .eq("client_id", user.id);

    if (error) {
        console.log(error);
        return;
    }

    trackerList.innerHTML = "";

    data.forEach(item => {

        trackerList.innerHTML += `
        <div class="tracker-card">

            <div class="card-left">

                <h4>${item.artist?.username ?? "-"}</h4>

                <div class="commission-name">
                    <span>${item.artwork?.title ?? "-"}</span>
                </div>

            </div>

            <div class="card-right">
                <span>${item.status}</span>
            </div>

        </div>
        `;
    });

    // rebind click event AFTER render
    document.querySelectorAll(".tracker-card").forEach(card => {
        card.addEventListener("click", () => {
            trackerModal.style.display = "flex";
        });
    });
}

initTracker();
