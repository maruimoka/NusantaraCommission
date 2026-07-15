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

const searchInput = document.querySelector(".search-bar input");
let allArtworks = [];

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

allArtworks = artworks;
galleryGrid.innerHTML = "";
artworks.forEach(renderCard);

}

// =========================
// RENDER CARD

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

        <button class="like-btn">
    <i class="fa-regular fa-heart"></i>
    <span class="like-count">0</span>
</button>
        </div>
    `;

    card.artwork = artwork;


const likeBtn = card.querySelector(".like-btn");


likeBtn.onclick = async(e)=>{

    e.stopPropagation();

    await toggleLike(
        artwork.id,
        likeBtn
    );

};



loadLike(
    artwork.id,
    likeBtn
);



card.onclick = () => {

    openPreview(artwork);

}

    galleryGrid.appendChild(card);

    

}

async function toggleLike(
    artworkId,
    button
){

    const {
        data:{
            user
        }
    } = await supabaseClient.auth.getUser();


    if(!user){

        alert("Login dulu untuk like artwork");

        return;

    }


    const {
        data:existing,
        error
    } = await supabaseClient
    .from("artwork_likes")
    .select("id")
    .eq("artwork_id", artworkId)
    .eq("user_id", user.id)
    .maybesingle();



    if(existing){


        await supabaseClient
        .from("artwork_likes")
        .delete()
        .eq("id",existing.id);



    }
    else{


        await supabaseClient
        .from("artwork_likes")
        .insert({

            artwork_id: artworkId,
            user_id:user.id

        });


    }


    loadLike(
        artworkId,
        button
    );

}

async function loadLike(
    artworkId,
    button
){

    const {
        data,
        error
    } = await supabaseClient
    .from("artwork_likes")
    .select("*")
    .eq(
        "artwork_id",
        artworkId
    );


    if(error){

        console.log(error);
        return;

    }


    const count =
    button.querySelector(".like-count");


    count.textContent =
    data.length;


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
    const orderBtn = document.getElementById("orderBtn");

orderBtn.onclick = () => {
     console.log("Order diklik!");
    setSelectedArtwork(artwork);

    openOrderForm();

};

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
searchInput.addEventListener("input", () => {

    const keyword = searchInput.value.toLowerCase().trim();

    galleryGrid.innerHTML = "";

    const filtered = allArtworks.filter(artwork => {

        const title =
            artwork.title?.toLowerCase() || "";

        const artist =
            artwork.artist_profiles?.display_name?.toLowerCase() || "";

        return (
            title.includes(keyword) ||
            artist.includes(keyword)
        );

    });

    filtered.forEach(renderCard);

});

loadHomepage();
