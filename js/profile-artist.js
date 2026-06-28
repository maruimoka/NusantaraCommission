// =========================
// ELEMENT
// =========================

const commissionSection = document.getElementById("commissionSection");
const gallerySection = document.getElementById("gallerySection");

const commissionTab = document.getElementById("commissionTab");
const galleryTab = document.getElementById("galleryTab");

const previewModal = document.getElementById("previewModal");
const closePreview = document.getElementById("closePreview");


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

    document.getElementById("profileName").textContent =
        profile.display_name ?? "New Artist";

    document.getElementById("profileBio").textContent =
        profile.bio ?? "";

    document.getElementById("profileUserImage").src =
        profile.profile_image || "asset/imagesbanner1.png";

}


// =========================
// LOAD ARTWORK
// =========================

async function loadArtwork() {

    const {
        data: { user }
    } = await supabaseClient.auth.getUser();

    if (!user) return;

    // Cari artist profile milik user
    const { data: profile } = await supabaseClient
        .from("artist_profiles")
        .select("id")
        .eq("user_id", user.id)
        .single();

    if (!profile) return;

    // Ambil artwork
    const { data: artworks, error } = await supabaseClient
        .from("artwork")
        .select("*")
        .eq("artist_id", profile.id);

    if (error) {
        console.log(error);
        return;
    }

    const commissions = artworks.filter(
        item => item.category === "commission"
    );

    const galleries = artworks.filter(
        item => item.category === "gallery"
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

    data.forEach(item => {

        const card = document.createElement("div");

        card.className = "card";

        card.innerHTML = `
            <div class="art-image">
                <img src="${item.image_url}">
            </div>

            <span class="tag">${type}</span>

            <h3>${item.title}</h3>

            <p>${item.price ?? "-"}</p>
        `;

        card.onclick = () => openPreview(item);

        container.appendChild(card);

    });

}


// =========================
// PREVIEW
// =========================

function openPreview(item){

    document.getElementById("modalImage").src =
        item.image_url;

    document.getElementById("modalTitle").textContent =
        item.title;

    document.getElementById("modalPrice").textContent =
        item.price ?? "-";

    previewModal.style.display = "flex";

}


closePreview.onclick = function(){

    previewModal.style.display = "none";

}


window.onclick = function(e){

    if(e.target == previewModal){

        previewModal.style.display = "none";

    }

}


// =========================
// TAB
// =========================

gallerySection.style.display = "none";

commissionTab.onclick = function(){

    commissionSection.style.display = "grid";
    gallerySection.style.display = "none";

    commissionTab.classList.add("active");
    galleryTab.classList.remove("active");

}

galleryTab.onclick = function(){

    commissionSection.style.display = "none";
    gallerySection.style.display = "grid";

    galleryTab.classList.add("active");
    commissionTab.classList.remove("active");

}


// =========================
// INIT
// =========================

async function init(){

    await loadProfile();

    await loadArtwork();

}

init();
