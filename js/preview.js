const previewModal =
document.getElementById("previewModal");

const closePreview =
document.getElementById("closePreview");

closePreview.addEventListener("click", () => {
    previewModal.style.display = "none";
});

function openPreview(card) {

    const artImage =
        card.querySelector(".art-image img").src;

    const artTitle =
        card.querySelector("h3").textContent;

    const artistName =
        card.querySelector(".artist-info span").textContent;

    document.getElementById("modalImage").src =
        artImage;

    document.getElementById("modalTitle").textContent =
        artTitle;

    document.querySelector(".modal-artist").textContent =
        `By ${artistName}`;

    previewModal.style.display = "flex";
}

window.openPreview = openPreview;