let isFollowing = false;
let currentUser = null;
let artistUserId = null;

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

const followingText =
document.getElementById("following");

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

artistUserId = profile.user_id;
    
await loadArtwork();
await loadFollowers();
await checkFollowStatus();
}

async function checkFollowStatus(){

    const {
        data: { user }
    } = await supabaseClient.auth.getUser();

    if(!user) return;

    currentUser = user;

    const { data } = await supabaseClient

        .from("followers")

        .select("*")

        .eq("user_id", user.id)

        .eq("artist_id", artistId);

    isFollowing = data.length > 0;

    followBtn.textContent =
        isFollowing ? "UNFOLLOW" : "FOLLOW";

}

async function loadFollowers(){

    const { count } =
    await supabaseClient

        .from("followers")

        .select("*",{

            count:"exact",

            head:true

        })

        .eq("artist_id", artistId);

    followersText.innerHTML =
        `<b>${count}</b> Followers`;

}

async function loadFollowing(){

    const { count, error } = await supabaseClient
        .from("followers")
        .select("*", {
            count: "exact",
            head: true
        })
        .eq("user_id", artistUserId);

    if(error){

        console.log(error);
        return;

    }

    followingText.innerHTML =
        `<b>${count}</b> Following`;

}

//LOAD ARTWORK//
async function loadArtwork() {

    const { data: artworks, error } =
    await supabaseClient
        .from("artwork")
        .select(`
            *,
            artist_profiles(
                display_name,
                profile_image
            )
        `)
        .eq("artist_id", artistId)
        .order("created_at", {
            ascending: false
        });

    if (error) {

        console.log(error);

        return;

    }

    commissionSection.innerHTML = "";
    gallerySection.innerHTML = "";

    artworks.forEach(artwork => {

        if (artwork.category === "commission") {

            renderCard(
                artwork,
                commissionSection,
                "COMMISSION"
            );

        } else {

            renderCard(
                artwork,
                gallerySection,
                "GALLERY"
            );

        }

    });

}

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

        <p>
            <i class="fa-regular fa-user"></i>
            ${artwork.artist_profiles?.display_name || "Unknown Artist"}
        </p>

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

function openPreview(artwork){
    selectedArtwork = (artwork);
    console.log("Selected Artwork:", selectedArtwork);

    document.getElementById("modalImage").src =
        artwork.image_url;

    document.getElementById("modalTitle").textContent =
        artwork.title;

    document.querySelector(".description-box p").textContent =
        artwork.description;

    document.querySelector(".modal-artist").textContent =
        artwork.artist_profiles?.display_name || "Unknown Artist";

    document.getElementById("modalArtistAvatar").src =
        artwork.artist_profiles?.profile_image || "asset/default-profile.png";

    if(artwork.category === "commission"){

        document.querySelector(".modal-price").textContent =
        `Rp ${Number(artwork.price).toLocaleString("id-ID")}`;

    }else{

        document.querySelector(".modal-price").textContent = "";

    }

    previewModal.style.display = "flex";

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

followBtn.onclick = async () => {

    if(!currentUser){

        alert("Silakan login terlebih dahulu.");

        return;

    }

    if(isFollowing){

        await supabaseClient

            .from("followers")

            .delete()

            .eq("user_id", currentUser.id)

            .eq("artist_id", artistId);

    }else{

       const { error } = await supabaseClient

            .from("followers")

            .insert({

                user_id: currentUser.id,

                artist_id: artistId

            });
console.log(error);
    }

    await loadFollowers();

    await checkFollowStatus();

};

closePreview.addEventListener("click", () => {

    previewModal.style.display = "none";

});
