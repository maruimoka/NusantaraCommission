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
let currentProfile = null;


// ======================
// OPEN EDIT MODAL
// ======================
openEditProfile?.addEventListener("click", () => {

   if (currentProfile) {
    document.getElementById("editName").value =
        currentProfile.display_name ?? "";

    document.getElementById("editBio").value =
        currentProfile.bio ?? "";

    document.getElementById("editSocial").value =
        currentProfile.medsos ?? "";

          document.getElementById("adultVerified").checked =
            currentProfile.adult_verified ?? false;

    editAvatarPreview.src =
        currentProfile.profile_image || "asset/imagesbanner1.png";
}

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
    const adultVerified = document.getElementById("adultVerified").checked;
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

    imageUrl = publicUrlData.publicUrl;
}
    
    const { data, error } = await supabaseClient
        .from("artist_profiles")
        .upsert(
            {
                user_id: userId,
                display_name: name,
                bio: bio,
                medsos: social,
                profile_image: imageUrl,
                adult_verified: adultVerified
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

    currentProfile = {
    user_id: userId,
    display_name: name,
    bio: bio,
    medsos: social,
    profile_image: imageUrl,
    adult_verified: adultVerified
};
    
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

    // ambil id artist_profile milik client
const { data: myProfile, error: profileError } =
await supabaseClient
.from("artist_profiles")
.select("id")
.eq("user_id", user.id)
.single();

if(profileError){
    console.log(profileError);
    return;
}

   const { data, error } = await supabaseClient
.from("commission")
.select(`
    *,
    artist:artist_id(
        id,
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
.eq("client_id", myProfile.id)
.order("created_at", {
    ascending: false
});

    if (error) {
        console.log(error);
        return;
    }

    trackerList.innerHTML = "";

data.forEach(order => {

    const card = document.createElement("div");

    card.className = "tracker-card";

const statusClass =
(order.status ?? "WAITING")
.toLowerCase()
.replace(/\s+/g,"-");

card.innerHTML = `
<div class="tracker-header">

    <h3>${order.artist?.display_name ?? "-"}</h3>

    <span class="status ${statusClass}">
        ${(order.status ?? "WAITING").toUpperCase()}
    </span>

</div>

<div class="tracker-title">
    📄 ${order.artwork?.title ?? "-"}
</div>

...
`;

    card.addEventListener("click", () => {

        openTrackerModal(order);

    });

    trackerList.appendChild(card);

});

}


function openTrackerModal(order){

trackerModal.style.display = "flex";

document.getElementById("trackerImage").src =
order.artwork?.image_url || "";

document.getElementById("trackerTitle").textContent =
order.artwork?.title ?? "-";

document.getElementById("trackerPrice").textContent =
`Rp ${Number(order.artwork?.price || 0).toLocaleString("id-ID")}`;

document.getElementById("trackerArtist").textContent =
order.artist?.display_name ?? "-";

const trackerArtist =
document.getElementById("trackerArtist");

trackerArtist.textContent =
order.artist?.display_name ?? "-";

trackerArtist.style.cursor = "pointer";

trackerArtist.onclick = () => {

    if(!order.artist?.id) return;

    window.location.href =
    `profile-follow.html?id=${order.artist.id}`;

};

const status = document.getElementById("trackerStatus");

const currentStatus =
order.status ?? "WAITING";

status.textContent = currentStatus;

const statusClass =
currentStatus
.toLowerCase()
.replace(/\s+/g,"-");

status.className =
`status ${statusClass}`;

status.className =
`status ${statusClass}`;

document.getElementById("trackerRequest").textContent =
order.request_detail ?? "-";

document.getElementById("trackerArtistAvatar").src =
order.artist?.profile_image ||"asset/default-profile.png";

// ======================
// REFERENCE FILES
// ======================

const refList =
document.getElementById("trackerReferenceList");

refList.innerHTML = "";

if(order.reference_files && order.reference_files.length > 0){
    order.reference_files.forEach(file => {
    const fileName = file.split("/").pop();
     refList.innerHTML += `
<div class="reference-file">
    📄
    <a href="${file}" target="_blank">
        ${fileName}
    </a>
</div>
`;

    });

}else{

    refList.innerHTML = `
        <p>No reference file.</p>
    `;

}


// ======================
// RESULT BUTTON
// ======================

const resultWrapper =
document.getElementById("resultSection");

const openBtn =
document.getElementById("openResultBtn");

if(
    order.status?.toUpperCase() === "FINISH" &&
    order.result_files?.length
)
{

    resultWrapper.style.display = "block";

    openBtn.onclick = () => {
        window.open(order.result_files[0], "_blank");
    };

}else{

    resultWrapper.style.display = "none";
    openBtn.onclick = null;

}
}

// ======================
// LOAD PROFILE
// ======================
async function loadProfile() {

    const {
        data: { user }
    } = await supabaseClient.auth.getUser();

    if (!user) return;

    // Cek apakah profile sudah ada
    let { data, error } = await supabaseClient
        .from("artist_profiles")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

    if (error) {
        console.log(error);
        return;
    }

    // Kalau belum ada -> buat profile default
    if (!data) {

        const { error: insertError } = await supabaseClient
            .from("artist_profiles")
            .insert({
                user_id: user.id,
                display_name: user.email.split("@")[0],
                bio: "",
                medsos: "",
                profile_image: ""
            });

        if (insertError) {
            console.log(insertError);
            return;
        }

        // Ambil lagi data yang baru dibuat
        const result = await supabaseClient
            .from("artist_profiles")
            .select("*")
            .eq("user_id", user.id)
            .single();

        data = result.data;
    }

    currentProfile = data;

    document.getElementById("profileName").textContent =
        data.display_name ?? "";

    document.getElementById("profileBio").textContent =
        data.bio ?? "";

    document.getElementById("profileUserImage").src =
        data.profile_image || "asset/imagesbanner1.png";
}
loadProfile();
initTracker();
