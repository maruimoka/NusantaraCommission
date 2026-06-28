// =========================
// ELEMENT
// =========================

const galleryGrid =
document.getElementById("galleryGrid");


// =========================
// LOAD HOMEPAGE
// =========================

async function loadHomepage() {

    galleryGrid.innerHTML = "";

    // Ambil semua artwork

    const { data: artworks, error } =
    await supabaseClient
        .from("artwork")
        .select("*")
        .order("created_at", {
            ascending: false
        });

    if (error) {

        console.log(error);

        return;

    }

    if (!artworks.length) {

        galleryGrid.innerHTML = `
            <h3>No Artwork Yet</h3>
        `;

        return;

    }

    // Loop semua artwork

    for (const artwork of artworks) {

        // Cari artist profile

        const { data: artist } =
        await supabaseClient
            .from("artist_profiles")
            .select("*")
            .eq("id", artwork.artist_id)
            .single();

        renderCard(
            artwork,
            artist
        );

    }

}


// =========================
// RENDER CARD
// =========================

function renderCard(
    artwork,
    artist
) {

    const card =
    document.createElement("div");

    card.className = "art-card";

card.innerHTML = `
    <div class="art-image">
        <img src="${artwork.image_url}">
    </div>

    <div class="card-content">

        <span class="tag ${artwork.category}">
            ${artwork.category.toUpperCase()}
        </span>

        <h3>
            ${artwork.title}
        </h3>

        <div class="artist-info">

            <img
                class="artist-avatar"
                src="${artist.profile_image || "asset/imagesbanner1.png"}"
            >

            <span>
                ${artist.display_name}
            </span>

        </div>

    </div>
`;

    // Simpan data untuk Preview

    card.artwork = artwork;

    card.artist = artist;

    card.onclick = () => {

        openPreview(card);

    };

    galleryGrid.appendChild(card);

}


// =========================
// INIT
// =========================

loadHomepage();
