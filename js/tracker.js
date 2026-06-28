
// ======================
// TRACKER MODAL
// ======================
const trackerCards = document.querySelectorAll(".tracker-card");
const trackerModal = document.getElementById("trackerModal");
const closeBtn = document.querySelector(".close");

trackerCards.forEach(card => {
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


// OPEN MODAL + FILL DATA
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


// IMAGE PREVIEW ONLY
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
// LOAD SESSION (FIXED)
// ======================
async function getUser() {
    const { data, error } = await supabaseClient.auth.getSession();

    if (error || !data.session) return null;

    return data.session.user;
}


// ======================
// SAVE PROFILE TO SUPABASE (IMPORTANT FIX)
// ======================
saveProfileBtn?.addEventListener("click", async () => {

    const user = await getUser();
    if (!user) {
        alert("Not logged in");
        return;
    }

    const username = document.getElementById("editName").value;
    const bio = document.getElementById("editBio").value;
    const social = document.getElementById("editSocial").value;
    const image = editAvatarPreview.src;

    const { error } = await supabaseClient
        .from("artist_profile")
        .update({
            display_name: username,
            bio: bio,
            social: social,
            profile_image: image
        })
        .eq("user_id", user.id);

    if (error) {
        console.log(error);
        alert("Gagal update profile");
        return;
    }

    // update UI
    document.getElementById("profileName").textContent = username;
    document.getElementById("profileBio").textContent = bio;
    document.getElementById("profileUserImage").src = image;

    editProfileModal.style.display = "none";

    alert("Profile updated!");
});


// ======================
// LOAD COMMISSIONS (FIXED)
// ======================
async function loadCommissions() {

    const user = await getUser();
    if (!user) return;

    const { data, error } = await supabaseClient
        .from("commissions")
        .select(`
            *,
            artist:artist_id(username, profile_image),
            artwork:artwork_id(title, price, cover_image)
        `)
        .eq("client_id", user.id);

    if (error) {
        console.log(error);
        return;
    }

    const trackerList = document.getElementById("trackerList");

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
}

loadCommissions();
