const galleryGrid =
document.getElementById("galleryGrid");

let allArtwork = [];

// =====================
// LOAD ARTWORK
// =====================

async function loadHomepageArtwork(){

    const { data, error } =
    await supabaseClient
    .from("artwork")
    .select(`
        *,
        artist_profiles(
            id,
            display_name,
            profile_image
        )
    `)
    .order("created_at",{
        ascending:false
    });

    if(error){

        console.log(error);

        return;

    }

    allArtwork = data;

    renderHomepage(data);

}

// =====================
// RENDER CARD
// =====================

function renderHomepage(data){

    galleryGrid.innerHTML="";

    data.forEach(item=>{

        const card=document.createElement("div");

        card.className="art-card";

        card.innerHTML=`

        <div class="art-image">

            <img src="${item.image_url}">

        </div>

        <span class="tag ${item.category}">

            ${item.category.toUpperCase()}

        </span>

        <h3>

            ${item.title}

        </h3>

        <div class="artist-info">

            <img
            class="artist-avatar"
            src="${
                item.artist_profiles.profile_image ??
                "asset/imagesbanner1.png"
            }">

            <span>

                ${
                    item.artist_profiles.display_name
                }

            </span>

        </div>

        `;

        card.onclick=()=>{

            openPreview(item);

        }

        galleryGrid.appendChild(card);

    });

}
