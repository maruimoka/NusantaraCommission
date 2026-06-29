// =========================
// ELEMENT
// =========================

const galleryGrid =
document.getElementById("galleryGrid"); 

const previewModal =
document.getElementById("previewModal");

const modalImage =
document.getElementById("modalImage");

const modalTitle =
document.getElementById("modalTitle");

const modalPrice =
document.getElementById("modalPrice");

const modalDescription =
document.getElementById("modalDescription");

const modalArtist =
document.getElementById("modalArtist");

const modalArtistAvatar =
document.getElementById("modalArtistAvatar");

const closePreview =
document.getElementById("closePreview");
// =========================
// LOAD HOMEPAGE
// =========================

async function loadHomepage() {
    const { data: artworks, error } = await supabaseClient
        .from("artwork")
        .select(`
        *,
        artist_profiles(
            id,
            display_name,
            profile_image,
            bio
        )
    `)
        .order("created_at",{
        ascending:false
    });

    if(error){

        console.log(error);

        return;

    }

    if (error) {

        console.log(error);

        return;

    }
galleryGrid.innerHTML = "";
artworks.forEach(renderCard);

}

// =========================
// RENDER CARD
// =========================

function renderCard(artwork) {
    const card = document.createElement("div");

    card.className = "art-card";
    
card.innerHTML = `
    <div class="art-image">
    <img 
    src="${artwork.image_url}" 
    alt="${artwork.title}">
    </div>

    <div class="card-content">

        <span class="tag ${artwork.category}">
        ${artwork.category.toUpperCase()}
        </span>

        <h3>${artwork.title}</h3>

        <div class="artist-row">
        <img
        src="${
            artwork.artist_profiles?.profile_image ||
            "asset/default-profile.png"
        }"
        class="artist-avatar">
        <span>
        ${
            artwork.artist_profiles?.display_name ||
            "Unknown Artist"
        }
        </span>
        </div>
        </div>
    `;

    card.artwork = artwork;
    card.onclick = () => {

        openPreview(artwork);
    }

    galleryGrid.appendChild(card);

}

function openPreview(artwork){

    previewModal.style.display="flex";

    modalImage.src=
        artwork.image_url;

    modalTitle.textContent=
        artwork.title;

    modalDescription.textContent=
        artwork.description;

    modalArtist.textContent=
        artwork.artist_profiles.display_name;

    modalArtistAvatar.src=
        artwork.artist_profiles.profile_image;

    if(artwork.category==="commission"){

        modalPrice.style.display="block";

        modalPrice.textContent=
            `Rp ${Number(artwork.price).toLocaleString("id-ID")}`;

    }

    else{

        modalPrice.style.display="none";

    }

modalArtist.onclick = () => {

window.location.href =
`artist-profile-person.html?id=${artwork.artist_profiles.id}`;

}

}

// =========================
// INIT
// =========================

loadHomepage();
