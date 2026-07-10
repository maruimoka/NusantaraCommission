
// ==============================
// ELEMENTS
// ==============================

// Personal
const displayNameInput = document.getElementById("displayName");
const fullNameInput = document.getElementById("fullName");
const emailInput = document.getElementById("email");
const phoneInput = document.getElementById("phone");
const addressInput = document.getElementById("address");
const bioInput = document.getElementById("bio");

// Social
const instagramInput = document.getElementById("instagram");
const twitterInput = document.getElementById("twitter");
const facebookInput = document.getElementById("facebook");

// Payment
const bankNameInput = document.getElementById("bankName");
const accountNumberInput = document.getElementById("accountNumber");
const accountHolderInput = document.getElementById("accountHolder");

// Tax
const nikInput = document.getElementById("nik");
const npwpInput = document.getElementById("npwp");

// Avatar
const profilePreview = document.getElementById("profilePreview");
const profileImageInput = document.getElementById("profileImage");
const changePhotoBtn = document.querySelector(".change-photo-btn");

// Save
const saveProfileBtn = document.getElementById("saveProfileBtn");

// ==============================
// GLOBAL
// ==============================

let currentUser = null;
let currentProfile = null;
let selectedAvatar = null;

// ==============================
// LOAD PROFILE
// ==============================

document.addEventListener("DOMContentLoaded", async () => {

    await loadProfile();

});

async function loadProfile() {

    // ==========================
    // GET CURRENT USER
    // ==========================

    const { data, error } = await supabaseClient.auth.getUser();

    if (error) {
        console.error(error);
        return;
    }

    if (!data.user) {

        alert("Please login first.");
        window.location.href = "index.html";
        return;
    }

    currentUser = data.user;

    // tampilkan email dari auth
    emailInput.value = currentUser.email;

    console.log("Current User:", currentUser);

    // ==========================
    // GET ARTIST PROFILE
    // ==========================

    const { data: profile, error: profileError } = await supabaseClient
        .from("artist_profiles")
        .select("*")
        .eq("user_id", currentUser.id)
        .maybeSingle();

    if (profileError) {

        console.error(profileError);
        return;
    }

    currentProfile = profile;

    console.log("Artist Profile:", currentProfile);

    // ==========================
    // FILL FORM
    // ==========================

    if (!currentProfile) {

        console.log("Artist profile belum ada.");
        return;
    }

    displayNameInput.value = currentProfile.display_name ?? "";
    fullNameInput.value = currentProfile.full_name ?? "";
    phoneInput.value = currentProfile.phone ?? "";
    addressInput.value = currentProfile.address ?? "";
    bioInput.value = currentProfile.bio ?? "";

    instagramInput.value = currentProfile.instagram ?? "";
    twitterInput.value = currentProfile.twitter ?? "";
    facebookInput.value = currentProfile.facebook ?? "";

    bankNameInput.value = currentProfile.bank_name ?? "";
    accountNumberInput.value = currentProfile.account_number ?? "";
    accountHolderInput.value = currentProfile.account_holder ?? "";

    nikInput.value = currentProfile.nik ?? "";
    npwpInput.value = currentProfile.npwp ?? "";

    if (currentProfile.profile_image) {

        profilePreview.src = currentProfile.profile_image;

    }

}

// ==============================
// CHANGE PHOTO
// ==============================

changePhotoBtn.addEventListener("click", () => {

    profileImageInput.click();

});

profileImageInput.addEventListener("change", (event) => {

    const file = event.target.files[0];

    if (!file) return;

    selectedAvatar = file;

    profilePreview.src = URL.createObjectURL(file);

});


// ==============================
// SAVE PROFILE
// ==============================

saveProfileBtn.addEventListener("click", saveProfile);

async function saveProfile(){

    let imageUrl = currentProfile?.profile_image ??""; 

        if (selectedAvatar) {

    const fileExt = selectedAvatar.name.split(".").pop();

    const filePath = `${currentUser.id}.${fileExt}`;

    const { error: uploadError } = await supabaseClient.storage
        .from("avatars")
        .upload(filePath, selectedAvatar, {
            upsert: true
        });

    if (uploadError) {

        console.error(uploadError);

        alert("Failed to upload avatar.");

        return;

    }

    const { data } = supabaseClient.storage
        .from("avatars")
        .getPublicUrl(filePath);

    imageUrl = data.publicUrl;

}
    
    const profileData = {

        display_name: displayNameInput.value.trim(),
        full_name: fullNameInput.value.trim(),
        phone: phoneInput.value.trim(),
        address: addressInput.value.trim(),
        bio: bioInput.value.trim(),

        instagram: instagramInput.value.trim(),
        twitter: twitterInput.value.trim(),
        facebook: facebookInput.value.trim(),

        bank_name: bankNameInput.value.trim(),
        account_number: accountNumberInput.value.trim(),
        account_holder: accountHolderInput.value.trim(),

        nik: nikInput.value.trim(),
        npwp: npwpInput.value.trim(),
        
        profile_image: imageUrl

    };

    const { error } = await supabaseClient
        .from("artist_profiles")
        .update(profileData)
        .eq("user_id", currentUser.id);

    if(error){

        console.error(error);

        alert("Failed to save profile.");

        return;

    }

    alert("Profile updated successfully!");

    await loadProfile();

}
