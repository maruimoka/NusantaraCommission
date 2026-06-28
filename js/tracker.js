// ======================
// TRACKER MODAL
// ======================
const trackerList = document.getElementById("trackerList");
const trackerModal = document.getElementById("trackerModal");
const closeBtn = document.querySelector(".close");

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


// ======================
// OPEN EDIT MODAL
// ======================
openEditProfile?.addEventListener("click", () => {

    document.getElementById("editName").value =
        document.getElementById("profileName").textContent;

    document.getElementById("editBio").value =
        document.getElementById("profileBio").textContent;

    document.getElementById("editSocial").value = "";

    editAvatarPreview.src =
        document.getElementById("profileUserImage").src;

    editProfileModal.style.display = "flex";
});


// ======================
// CLOSE EDIT MODAL
// ======================
closeEditProfile?.addEventListener("click", () => {
    editProfileModal.style.display = "none";
});


// ======================
// IMAGE PREVIEW
// ======================
avatarInput?.addEventListener("change", function () {

    const file = this.files[0];

    if (!file) return;

    const reader = new FileReader();

    reader.onload = function (e) {
        editAvatarPreview.src = e.target.result;
    };

    reader.readAsDataURL(file);

});


// ======================
// SAVE PROFILE
// ======================
saveProfileBtn?.addEventListener("click", async () => {

    // cek login
    const {
        data: { user }
    } = await supabaseClient.auth.getUser();

    if (!user) {
        alert("User belum login");
        return;
    }

    const userId = user.id;

    const name = document.getElementById("editName").value.trim();
    const bio = document.getElementById("editBio").value.trim();
    const social = document.getElementById("editSocial").value.trim();
    const file = avatarInput.files[0];

    let imageUrl = document.getElementById("profileUserImage").src;

    console.log("USER ID :", userId);

    console.log({
        user_id: userId,
        display_name: name,
        bio: bio,
        medsos: social,
        profile_image: imageUrl
    });

// Kalau user memilih gambar baru
if (file) {
    const fileExt = file.name.split(".").pop();
    const filePath = `${userId}/profile.${fileExt}`;

    // Upload ke Storage
    const { error: uploadError } = await supabaseClient.storage
        .from("avatars")
        .upload(filePath, file, {
            upsert: true
        });

    if (uploadError) {
        alert(uploadError.message);
        return;
    }

    // Ambil Public URL
    const { data: publicUrlData } = supabaseClient.storage
        .from("avatars")
        .getPublicUrl(filePath);

    imageUrl = data.publicUrl;
}
    
    const { data, error } = await supabaseClient
        .from("artist_profiles")
        .upsert(
            {
                user_id: userId,
                display_name: name,
                bio: bio,
                medsos: social,
                profile_image: imageUrl
            },
            {
                onConflict: "user_id"
            }
        )
        .select();

    console.log("RESULT :", data);
    console.log("ERROR :", error);

    if (error) {
        alert(error.message);
        return;
    }

    // update UI
    document.getElementById("profileName").textContent = name;
    document.getElementById("profileBio").textContent = bio;
    document.getElementById("profileUserImage").src = imageUrl;

    editProfileModal.style.display = "none";

    alert("Profile berhasil disimpan!");

});


// ======================
// LOAD TRACKER
// ======================
async function initTracker() {

    const {
        data: { session }
    } = await supabaseClient.auth.getSession();

    if (!session) return;

    const user = session.user;

    const { data, error } = await supabaseClient
        .from("commission")
        .select(`
            *,
            artist:artist_id(
                display_name,
                profile_image
            ),
            artwork:artwork_id(
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

    document.querySelectorAll(".tracker-card").forEach(card => {

        card.addEventListener("click", () => {
            trackerModal.style.display = "flex";
        });

    });

}

initTracker();
