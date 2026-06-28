// =========================
// ELEMENT
// =========================

const commissionSection = document.getElementById("commissionSection");
const gallerySection = document.getElementById("gallerySection");

const commissionTab = document.getElementById("commissionTab");
const galleryTab = document.getElementById("galleryTab");

const previewModal = document.getElementById("previewModal");
const closePreview = document.getElementById("closePreview");

const bannerImage = document.getElementById("bannerImage");
const bannerInput = document.getElementById("bannerInput");

const postModal = document.getElementById("postModal");
const openPostBtn = document.getElementById("openPostBtn");
const closePostModal = document.getElementById("closePostModal");

const savePostBtn = document.getElementById("savePostBtn");

const postImageInput = document.getElementById("postImageInput");
const postPreviewImage = document.getElementById("postPreviewImage");
const postUploadContent = document.getElementById("postUploadContent");

const postTitle = document.getElementById("postTitle");
const postDescription = document.getElementById("postDescription");
const postPrice = document.getElementById("postPrice");

const postCommissionTab = document.getElementById("postCommissionTab");
const postGalleryTab = document.getElementById("postGalleryTab");
const postPriceLabel = document.getElementById("postPriceLabel");

let currentProfile = null;
let postCategory = "commission";


// =========================
// LOAD PROFILE
// =========================

async function loadProfile() {

    const {
        data: { user }
    } = await supabaseClient.auth.getUser();

    if (!user) return;

    const { data: profile, error } = await supabaseClient
        .from("artist_profiles")
        .select("*")
        .eq("user_id", user.id)
        .single();

    if (error) {
        console.log(error);
        return;
    }

    currentProfile = profile;

    document.getElementById("profileName").textContent =
        profile.display_name || "New Artist";

    document.getElementById("profileBio").textContent =
        profile.bio || "No bio yet.";

    document.getElementById("profileUserImage").src =
        profile.profile_image ||
        "asset/imagesbanner1.png";

    bannerImage.src =
        profile.banner_image ||
        "asset/default-banner.jpg";
}


// =========================
// CLICK BANNER
// =========================

bannerImage.addEventListener("click", () => {

    bannerInput.click();

});


// =========================
// CHANGE BANNER
// =========================

bannerInput.addEventListener("change", async function () {

    const file = this.files[0];

    if (!file) return;

    // Preview dulu

    const reader = new FileReader();

    reader.onload = function (e) {

        bannerImage.src = e.target.result;

    };

    reader.readAsDataURL(file);

    // Login

    const {
        data: { user }
    } = await supabaseClient.auth.getUser();

    if (!user) {

        alert("Belum login");

        return;

    }

    const userId = user.id;

    const ext = file.name.split(".").pop();

    const filePath =
        `${userId}/banner.${ext}`;

    // Upload Storage

    const {
        error: uploadError
    } = await supabaseClient.storage
        .from("avatars")
        .upload(filePath, file, {

            upsert: true

        });

    if (uploadError) {

        alert(uploadError.message);

        return;

    }

    const {
        data: publicUrlData
    } = supabaseClient.storage
        .from("avatars")
        .getPublicUrl(filePath);

    // Simpan ke DB

    const {
        error
    } = await supabaseClient
        .from("artist_profiles")
        .update({

            banner_image:
                publicUrlData.publicUrl

        })
        .eq("user_id", userId);

    if (error) {

        alert(error.message);

        return;

    }

    currentProfile.banner_image =
        publicUrlData.publicUrl;

    console.log("Banner updated!");

});

// =========================
// LOAD ARTWORK
// =========================

async function loadArtwork() {

    const {
        data: { user }
    } = await supabaseClient.auth.getUser();

    if (!user) return;

    // Ambil artist profile
    const { data: profile, error: profileError } =
        await supabaseClient
            .from("artist_profiles")
            .select("id")
            .eq("user_id", user.id)
            .single();

    if (profileError) {

        console.log(profileError);

        return;

    }

    // Ambil semua artwork milik artist

    const { data: artworks, error } =
        await supabaseClient
            .from("artwork")
            .select("*")
            .eq("artist_id", profile.id)
            .order("created_at", {
                ascending: false
            });

    if (error) {

        console.log(error);

        return;

    }

    const commissions =
        artworks.filter(item =>
            item.category === "commission"
        );

    const galleries =
        artworks.filter(item =>
            item.category === "gallery"
        );

    renderCards(
        commissions,
        commissionSection,
        "COMMISSION"
    );

    renderCards(
        galleries,
        gallerySection,
        "GALLERY"
    );

}


// =========================
// RENDER CARD
// =========================

function renderCards(data, container, type) {

    container.innerHTML = "";

    if (!data.length) {

        container.innerHTML = `
            <div class="empty-card">

                <h3>No ${type} Yet</h3>

            </div>
        `;

        return;

    }

    data.forEach(item => {

        const card =
            document.createElement("div");

        card.className = "card";

        card.innerHTML = `

            <div class="art-image">

                <img
                    src="${item.image_url}"
                    alt="${item.title}">

            </div>

            <span class="tag">

                ${type}

            </span>

            <h3>

                ${item.title}

            </h3>

            <p>

                ${item.price ?? "-"}

            </p>

        `;

        card.onclick = () => {

            openPreview(item);

        };

        container.appendChild(card);

    });

}


// =========================
// PREVIEW MODAL
// =========================

function openPreview(item) {

    document.getElementById("modalImage").src =
        item.image_url;

    document.getElementById("modalTitle").textContent =
        item.title;

    document.getElementById("modalPrice").textContent =
        item.price ?? "-";

    previewModal.style.display = "flex";

}


closePreview.onclick = function () {

    previewModal.style.display = "none";

};


window.addEventListener("click", function (e) {

    if (e.target === previewModal) {

        previewModal.style.display = "none";

    }

});


// =========================
// TAB
// =========================

gallerySection.style.display = "none";

commissionTab.onclick = function () {

    commissionSection.style.display = "grid";

    gallerySection.style.display = "none";

    commissionTab.classList.add("active");

    galleryTab.classList.remove("active");

};


galleryTab.onclick = function () {

    commissionSection.style.display = "none";

    gallerySection.style.display = "grid";

    galleryTab.classList.add("active");

    commissionTab.classList.remove("active");

};

// =========================
// REFRESH PROFILE
// =========================

async function refreshProfile() {

    await loadProfile();

    await loadArtwork();

}


// =========================
// INIT
// =========================

async function init() {

    const {
        data: { session }
    } = await supabaseClient.auth.getSession();

    if (!session) {

        window.location.href = "index.html";

        return;

    }

    await loadProfile();

    await loadArtwork();

}

init();


// =========================
// OPTIONAL HELPER
// =========================

async function getCurrentArtist() {

    const {
        data: { user }
    } = await supabaseClient.auth.getUser();

    if (!user) return null;

    const { data } =
        await supabaseClient
            .from("artist_profiles")
            .select("*")
            .eq("user_id", user.id)
            .single();

    return data;

}


// =========================
// RELOAD SAAT LOGIN BERUBAH
// =========================

supabaseClient.auth.onAuthStateChange(
    async () => {

        await refreshProfile();

    }
);

openPostBtn.onclick = () => {

    postModal.style.display = "flex";

}

closePostModal.onclick = () => {

    postModal.style.display = "none";

    resetPostForm();

}

postImageInput.addEventListener("change", function(){

    const file = this.files[0];

    if(!file) return;

    const reader = new FileReader();

    reader.onload = function(e){

        postPreviewImage.src = e.target.result;

        postPreviewImage.style.display = "block";

        postUploadContent.style.display = "none";

    }

    reader.readAsDataURL(file);

});

postCommissionTab.onclick = () => {

    postCategory = "commission";

    postCommissionTab.classList.add("active");
    postGalleryTab.classList.remove("active");

    postPrice.style.display = "block";
    postPriceLabel.style.display = "block";

}

postGalleryTab.onclick = () => {

    postCategory = "gallery";

    postGalleryTab.classList.add("active");
    postCommissionTab.classList.remove("active");

    postPrice.style.display = "none";
    postPriceLabel.style.display = "none";

}

function resetPostForm(){

    document.getElementById("postForm").reset();

    postPreviewImage.style.display = "none";

    postUploadContent.style.display = "flex";

    postCategory = "commission";

    postCommissionTab.classList.add("active");
    postGalleryTab.classList.remove("active");

    postPrice.style.display = "block";
    postPriceLabel.style.display = "block";

}

function showToast(text){

    const toast = document.getElementById("toast");

    toast.innerHTML = text;

    toast.classList.add("show");

    setTimeout(()=>{

        toast.classList.remove("show");

    },2000);

}

savePostBtn.onclick = async () => {

    const {
        data: { user }
    } = await supabaseClient.auth.getUser();

    if (!user) {

        alert("Belum login");

        return;

    }

    const file = postImageInput.files[0];

    if (!file) {

        alert("Pilih gambar");

        return;

    }

    // Cari artist_profile milik user
    const { data: profile } = await supabaseClient
        .from("artist_profiles")
        .select("id")
        .eq("user_id", user.id)
        .single();

    if (!profile) {

        alert("Artist Profile tidak ditemukan");

        return;

    }

    const fileExt = file.name.split(".").pop();

    const filePath =
        `${profile.id}/${Date.now()}.${fileExt}`;

    // Upload Storage
    const { error: uploadError } =
        await supabaseClient.storage
            .from("artworks")
            .upload(filePath, file);

    if (uploadError) {

        alert(uploadError.message);

        return;

    }

    const { data: publicUrlData } =
        supabaseClient.storage
            .from("artworks")
            .getPublicUrl(filePath);

    const imageUrl =
        publicUrlData.publicUrl;
    console.log({
    artist_id: profile.id,
    title: postTitle.value,
    description: postDescription.value,
    imageUrl,
    price: postPrice.value,
    category: postCategory
});

const { error } = await supabaseClient
    .from("artwork")
            .insert({

                artist_id: profile.id,

                title: postTitle.value,

                description: postDescription.value,

                price:
                    postCategory === "commission"
                        ? postPrice.value
                        : null,

                image_url: imageUrl,

                category: postCategory

            });

    if (error) {

        alert(error.message);

        return;

    }

    showToast("✔ Artwork berhasil dipost!");

    postModal.style.display = "none";

    resetPostForm();

    await loadArtwork();

}


