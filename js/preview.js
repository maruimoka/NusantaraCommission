const previewModal =
document.getElementById("previewModal");

const closePreview =
document.getElementById("closePreview");

closePreview.addEventListener("click", () => {

    previewModal.style.display = "none";

});

function openPreview(data){

    // =========================
    // Kalau dari Supabase
    // =========================

    if(data.image_url){

        document.getElementById("modalImage").src =
            data.image_url;

        document.getElementById("modalTitle").textContent =
            data.title;

        const price =
        document.querySelector(".modal-price");

        if(price){

            price.textContent =
                data.price ?? "-";

        }

        const desc =
        document.querySelector(".description-box p");

        if(desc){

            desc.textContent =
                data.description ?? "";

        }

        const artist =
        document.querySelector(".modal-artist");

        if(artist){

            artist.textContent =
                data.artist_profiles?.display_name ?? "Unknown Artist";

        }

        const avatar =
        document.querySelector(".artist-avatar img");

        if(avatar){

            avatar.src =
                data.artist_profiles?.profile_image ??
                "asset/imagesbanner1.png";

        }

    }

    // =========================
    // Kalau dari HTML Card lama
    // =========================

    else{

        const artImage =
            data.querySelector(".art-image img").src;

        const artTitle =
            data.querySelector("h3").textContent;

        const artistName =
            data.querySelector(".artist-info span").textContent;

        document.getElementById("modalImage").src =
            artImage;

        document.getElementById("modalTitle").textContent =
            artTitle;

        const artist =
        document.querySelector(".modal-artist");

        if(artist){

            artist.textContent =
                artistName;

        }

    }

    previewModal.style.display = "flex";

}

window.openPreview = openPreview;
