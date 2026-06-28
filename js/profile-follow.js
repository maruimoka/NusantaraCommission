// =========================
// DATA
// =========================

const commissions = [
    {
        title: "Commission Result A1",
        artist: "Katsuru17.06",
        image: "sample1.jpg",
        price: "Rp150.000",
        description: "Contoh deskripsi commission A1."
    },
    {
        title: "Commission Result A2",
        artist: "Katsuru17.06",
        image: "sample2.jpg",
        price: "Rp200.000",
        description: "Contoh deskripsi commission A2."
    },
    {
        title: "Commission Result A3",
        artist: "Katsuru17.06",
        image: "sample3.jpg",
        price: "Rp250.000",
        description: "Contoh deskripsi commission A3."
    }
];

const galleries = [
    {
        title: "Artwork 1",
        artist: "Momo Tropical",
        image: "gallery1.jpg",
        price: "-",
        description: "Gallery Artwork 1"
    },
    {
        title: "Artwork 2",
        artist: "Momo Tropical",
        image: "gallery2.jpg",
        price: "-",
        description: "Gallery Artwork 2"
    },
    {
        title: "Artwork 3",
        artist: "Momo Tropical",
        image: "gallery3.jpg",
        price: "-",
        description: "Gallery Artwork 3"
    }
];


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


// =========================
// RENDER CARD
// =========================

function renderCards(data, container, type) {

    container.innerHTML = "";

    data.forEach(item => {

        const card = document.createElement("div");

card.className = "card";

card.innerHTML = `
    <img src="${item.image}">

    <div class="card-body">

        <span class="tag">
            ${type}
        </span>

        <h3>${item.title}</h3>

        <p>
            <i class="fa-regular fa-user"></i>
            ${item.artist}
        </p>

    </div>
`;

        card.addEventListener("click", () => {

            openPreview(item);

        });

        container.appendChild(card);

    });

}


// =========================
// PREVIEW MODAL
// =========================

function openPreview(item){

    document.getElementById("modalImage").src = item.image;

    document.getElementById("modalTitle").textContent = item.title;

    document.querySelector(".modal-price").textContent = item.price;

    document.querySelector(".modal-artist").textContent = item.artist;

    document.querySelector(".description-box p").textContent = item.description;

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

renderCards(commissions, commissionSection, "COMMISSION");
renderCards(galleries, gallerySection, "GALLERY");

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