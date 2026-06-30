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

    currentProfile = {
    user_id: userId,
    display_name: name,
    bio: bio,
    medsos: social,
    profile_image: imageUrl
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

<img
class="tracker-thumb"
src="${item.artwork?.image_url}">

<div class="card-left">

<h4>${item.artist?.display_name}</h4>

<div class="commission-name">
${item.artwork?.title}
</div>

</div>

<div class="card-right">

<span class="status ${item.status}">
${item.status}
</span>

</div>

</div>
`;
     
const lastCard =
trackerList.lastElementChild;

lastCard.addEventListener("click", () => {

    openTrackerModal(item);

});

});

}


function openTrackerModal(order){

trackerModal.style.display = "flex";

document.getElementById("trackerImage").src =
order.artwork.image_url;

document.getElementById("trackerTitle").textContent =
order.artwork.title;

document.getElementById("trackerPrice").textContent =
`Rp ${Number(order.artwork.price).toLocaleString("id-ID")}`;

document.getElementById("trackerArtist").textContent =
order.artist.display_name;

const status = document.getElementById("trackerStatus");
    status.textContent = order.status;
    status.className =
        `status ${order.status}`;

document.getElementById("trackerRequest").textContent =
order.request_detail;

document.getElementById("trackerArtistAvatar").src =
order.artist.profile_image || "asset/default-profile.png";

// ======================
// REFERENCE FILES
// ======================

const refList =
document.getElementById("trackerReferenceList");

refList.innerHTML = "";

if(order.reference_files){

    order.reference_files.forEach(file => {

        refList.innerHTML += `
        <div class="reference-file">

            📄
            <a href="${file}" target="_blank">
                Reference
            </a>

        </div>
        `;

    });

}


// ======================
// RESULT BUTTON
// ======================

const resultSection =
document.getElementById("resultSection");

const openBtn =
document.getElementById("openResultBtn");

if(

    order.status === "finish"

    &&

    order.result_files

    &&

    order.result_files.length > 0

){

    resultSection.style.display = "block";

    openBtn.onclick = () => {

        window.open(order.result_files[0], "_blank");

    };

}else{

    resultSection.style.display = "none";

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

    const { data, error } = await supabaseClient
        .from("artist_profiles")
        .select("*")
        .eq("user_id", user.id)
        .single();

    if (error) {
        console.log(error);
        return;
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
