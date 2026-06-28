
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

    document.getElementById("editSocial").value =
    currentProfile.medsos;

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
saveProfileBtn?.addEventListener("click", async () => {

    console.log("SAVE CLICKED");
    const user = await supabaseClient.auth.getUser();
    console.log("USER:", user);

    if (!user.data?.user) {
        alert("User tidak login");
        return;
    }

    const userId = user.data.user.id;

    const name = document.getElementById("editName").value;
    const bio = document.getElementById("editBio").value;
    const social = document.getElementById("editSocial").value;
    const image = document.getElementById("editAvatarPreview").src;

const { data, error } = await supabaseClient
    .from("artist_profiles")
    .upsert({
        display_name: name,
        bio: bio,
        medsos: social,
        profile_image: image
    })
    .eq("user_id", userId)
    .select();
    
console.log("UPDATE DATA:", data);
console.log("UPDATE ERROR:", error);

    if (error) {
        console.log("UPDATE ERROR:", error);
        alert(error.message);
        return;
    }

    // update UI juga
    document.getElementById("profileName").textContent = name;
    document.getElementById("profileBio").textContent = bio;
    document.getElementById("profileUserImage").src = image;

    editProfileModal.style.display = "none";

    alert("Profile berhasil disimpan!");

    console.log("USER ID:", user.data.user.id);

    console.log("UPDATE TRIGGERED");
});




// ======================
// SAFE INIT (FIX AWAY FROM GLOBAL AWAIT)
// ======================
async function initTracker() {

    const { data: sessionData } = await supabaseClient.auth.getSession();

    if (!sessionData?.session) return;

    const user = sessionData.session.user;

    const { data, error } = await supabaseClient
        .from("commission")
        .select(`
            *,
            artist:artist_id (
                display_name,
                profile_image
            ),
            artwork:artwork_id (
                title,
                price,
                description,
                image_url,
                category
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

                <h4>${item.artist?.display_name ?? "-"}</h4>

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
