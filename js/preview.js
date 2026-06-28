// =========================
// ELEMENT
// =========================

const previewModal =
document.getElementById("previewModal");

const closePreview =
document.getElementById("closePreview");


// =========================
// CLOSE
// =========================

closePreview.onclick = () => {

    previewModal.style.display = "none";

};


window.onclick = (e) => {

    if (e.target === previewModal) {

        previewModal.style.display = "none";

    }

};


// =========================
// OPEN PREVIEW
// =========================

function openPreview(card){

    const artwork = card.artwork;

    const artist = card.artist;

    // Image

    document.getElementById("modalImage").src =
        artwork.image_url;

    // Title

    document.getElementById("modalTitle").textContent =
        artwork.title;

    // Price

    document.getElementById("modalPrice").textContent =
        artwork.category === "commission"
        ? artwork.price
        : "Gallery";

    // Description

    document.getElementById("modalDescription").textContent =
        artwork.description || "-";

    // Artist Avatar

    document.getElementById("modalArtistAvatar").src =
        artist?.profile_image ||
        "asset/imagesbanner1.png";

    // Artist Name

    const artistLink =
    document.getElementById("modalArtist");

    artistLink.textContent =
        artist?.display_name ||
        "Unknown Artist";

    // (Nanti Part 5 kita isi link profile)

    artistLink.href = "#";

    // Simpan artwork aktif untuk Order

    window.currentArtwork = artwork;

    // Show Modal

    previewModal.style.display = "flex";

}


// supaya bisa dipanggil homepage.js

window.openPreview = openPreview;
