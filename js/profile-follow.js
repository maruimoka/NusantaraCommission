const params = new URLSearchParams(window.location.search);
const artistId = params.get("id");
console.log(artistId);

// =========================
// ELEMENT
// =========================

const commissionSection = document.getElementById("commissionSection");
const gallerySection = document.getElementById("gallerySection");

const commissionTab = document.getElementById("commissionTab");
const galleryTab = document.getElementById("galleryTab");

const followBtn = document.getElementById("followBtn");
const followersText = document.getElementById("followers");

const previewModal = document.getElementById("previewModal");
const closePreview = document.getElementById("closePreview");

// LOAD PROFILE
async function loadProfile(){

    // Ambil profile artist
    const { data: profile, error } =
    await supabaseClient

    .from("artist_profiles")

    .select("*")

    .eq("id", artistId)

    .single();

    if(error){

        console.log(error);

        return;

    }

    // Isi profile
    document.querySelector(".profile-banner").innerHTML = `
        <img
        src="${profile.banner_image || "asset/default-banner.jpg"}"
        style="width:100%;height:100%;object-fit:cover;">
    `;

    document.querySelector(".profileavatar img").src =
        profile.profile_image || "asset/default-profile.png";

    document.querySelector(".profile-info h1").textContent =
        profile.display_name;

    document.querySelector(".profile-info p").textContent =
        profile.bio || "No bio yet.";

    loadArtwork();

}

//LOAD ARTWORK
async function loadArtwork(){

    const { data: artworks, error } =
    await supabaseClient

    .from("artwork")

    .select(`
    *,
    artist_profiles(
        display_name,
        profile_image
    )

    .eq("artist_id", artistId);

    .order("created_at",{
        ascending:false
    });

    if(error){

        console.log(error);

        return;

    }

    commissionSection.innerHTML="";
    gallerySection.innerHTML="";

    artworks.forEach(item => {

    renderCard(item, commissionSection, "COMMISSION");



// =========================
// RENDER CARD
// =========================

function renderCard(artwork, container, type){

    const card = document.createElement("div");

    card.className = "card";

    card.innerHTML = `
        <img src="${artwork.image_url}">

        <div class="card-body">

            <span class="tag">
                ${type}
            </span>

            <h3>${artwork.title}</h3>

        </div>
    `;

    card.onclick = () => {

        openPreview(artwork);

    };

    container.appendChild(card);

}


// =========================
// PREVIEW MODAL
// =========================

function openPreview(item){

    document.getElementById("modalImage").src = artwork.image_url;

    document.getElementById("modalTitle").textContent = artwork.title;

    document.querySelector(".modal-price").textContent = artwork.price;

    document.querySelector(".modal-artist").textContent = artwork.artist_id;

    document.querySelector(".description-box p").textContent = artwork.description;

     if(artwork.category==="commission"){

        document.querySelector(".modal-price").textContent =
        `Rp ${Number(artwork.price).toLocaleString("id-ID")}`;

    }else{

        document.querySelector(".modal-price").textContent =
        "";

    }

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

loadProfile();

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
// FOLLOW BUTTON
// =========================

if(followBtn){

    let followers = 25;
    let isFollowing = true;

    followBtn.onclick = function(){

        if(isFollowing){

            followers--;

            followBtn.innerText = "FOLLOW";

        }else{

            followers++;

            followBtn.innerText = "UNFOLLOW";

        }

        followersText.innerHTML = `<b>${followers}</b> Followers`;

        isFollowing = !isFollowing;

    }

}
