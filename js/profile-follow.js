let isFollowing = false;
let currentUser = null;
let artistUserId = null;

const params = new URLSearchParams(window.location.search);
const artistId = params.get("id");
console.log(artistId);

// =========================
// ELEMENT
// =========================

const chatBtn = document.getElementById("chatBtn");

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
await loadFollowing();
await checkFollowStatus();
await recordProfileView();
}

// =========================
// RECORD PROFILE VIEW
// =========================

async function recordProfileView() {

    const {
        data: { user }
    } = await supabaseClient.auth.getUser();

    const viewerId = user?.id ?? null;

    // Jangan hitung kalau artist membuka profilnya sendiri
    if (viewerId === artistUserId) return;

    const { error } = await supabaseClient
        .from("artist_views")
        .insert({
            artist_id: artistId,
            viewer_id: viewerId,
            source: "profile"
        });

    if (error) {
        console.error(error);
    }
}




async function checkFollowStatus(){

    const {
        data: { user }
    } = await supabaseClient.auth.getUser();

    if(!user) return;

    currentUser = user;

    const { data } = await supabaseClient

        .from("artist_followers")

        .select("*")

        .eq("follower_id", user.id)

        .eq("artist_id", artistId);

    isFollowing = data.length > 0;

    followBtn.textContent =
        isFollowing ? "UNFOLLOW" : "FOLLOW";

}

async function loadFollowers(){

    const { count } =
    await supabaseClient

        .from("artist_followers")

        .select("*",{

            count:"exact",

            head:true

        })

        .eq("artist_id", artistId);

    followersText.innerHTML =
        `<b>${count}</b> Followers`;

}

async function loadFollowing() {

    const { data: artistProfile, error: artistError } = await supabaseClient
        .from("artist_profiles")
        .select("id")
        .eq("user_id", artistUserId)
        .maybeSingle();

    if (artistError) {
        console.error(artistError);
        return;
    }

    // Kalau user ini belum menjadi artist
    if (!artistProfile) {
        followingText.innerHTML = "<b>0</b> Following";
        return;
    }

    const { count, error } = await supabaseClient
        .from("artist_followers")
        .select("*", {
            count: "exact",
            head: true
        })
        .eq("follower_id", artistUserId);

    if (error) {
        console.error(error);
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
        id,
        display_name,
        profile_image,
        bank_name,
        account_holder,
        account_number
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

    selectedArtwork = artwork;
window.selectedArtwork = artwork;
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

            .from("artist_followers")

            .delete()

            .eq("follower_id", currentUser.id)

            .eq("artist_id", artistId);

    }else{

       const { error } = await supabaseClient

            .from("artist_followers")

            .insert({

                  follower_id: currentUser.id,

                artist_id: artistId

            });
console.log(error);
    }

    await loadFollowers();
    await loadFollowing();
    await checkFollowStatus();

};

closePreview.addEventListener("click", () => {

    previewModal.style.display = "none";

});

chatBtn?.addEventListener("click", async () => {

    const {
        data: { user }
    } = await supabaseClient.auth.getUser();

    if (!user) {
        alert("Please login first.");
        return;
    }

    // Jangan chat dengan diri sendiri
    if (user.id === artistUserId) {
        alert("You can't chat with yourself.");
        return;
    }

    // Ambil artist_profiles.id milik user login
    const { data: myProfile, error } = await supabaseClient
        .from("artist_profiles")
        .select("id")
        .eq("user_id", user.id)
        .single();

    if (error) {
        console.log(error);
        return;
    }

    await openConversation(
        myProfile.id,
        artistId
    );

});

async function openConversation(clientId, artistId) {

    // Cari conversation dari kedua arah
    let { data: conversation, error } = await supabaseClient
        .from("conversations")
        .select("id")
        .or(
            `and(client_id.eq.${clientId},artist_id.eq.${artistId}),and(client_id.eq.${artistId},artist_id.eq.${clientId})`
        )
        .maybeSingle();

    if (error) {
        console.log(error);
        return;
    }

    // Kalau belum ada baru buat
    if (!conversation) {

        const { data, error: insertError } = await supabaseClient
            .from("conversations")
            .insert({
                client_id: clientId,
                artist_id: artistId
            })
            .select("id")
            .single();

        if (insertError) {
            console.log(insertError);
            return;
        }

        conversation = data;
    }

    window.location.href =
        `chat.html?conversation=${conversation.id}`;
}
