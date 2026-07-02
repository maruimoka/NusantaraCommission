// =========================
// ELEMENT
// =========================

const galleryGrid =
document.getElementById("galleryGrid"); 

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

        <div class="card-artist">
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
`profile-follow.html?id=${artwork.artist_profiles.id}`;

}

}

// HERO BANNER
// =========================
// HERO SLIDER
// =========================

const slides = document.querySelectorAll(".slide");
const dots = document.querySelectorAll(".dot");

let currentSlide = 0;

function showSlide(index){

    slides.forEach(slide =>
        slide.classList.remove("active")
    );

    dots.forEach(dot =>
        dot.classList.remove("active")
    );

    slides[index].classList.add("active");
    dots[index].classList.add("active");

}

function nextSlide(){

    currentSlide++;

    if(currentSlide >= slides.length){
        currentSlide = 0;
    }

    showSlide(currentSlide);

}

setInterval(nextSlide, 1200);

// =========================
// INIT
// =========================

loadHomepage();
