// =========================
// ELEMENTS
// =========================

const artistAvatar = document.getElementById("artistAvatar");
const artistName = document.getElementById("artistName");
const artistUsername = document.getElementById("artistUsername");

const totalArtwork = document.getElementById("totalArtwork");
const totalFollowers = document.getElementById("totalFollowers");
const totalViews = document.getElementById("totalViews");
const totalLikes = document.getElementById("totalLikes");

let artistProfile = null;

// =========================
// INIT
// =========================

initAnalytics();

async function initAnalytics(){

    const {
        data:{user}
    } = await supabaseClient.auth.getUser();

    if(!user){

        alert("Please login first.");
        location.href="index.html";
        return;

    }

    await loadArtist(user.id);

    if(!artistProfile) return;

    await loadArtwork();
    await loadFollowers();
    await loadViews();
    await loadLikes();

}

// =========================
// LOAD ARTIST
// =========================

async function loadArtist(userId){

    const {data,error} = await supabaseClient
    .from("artist_profiles")
    .select("*")
    .eq("user_id",userId)
    .single();

    if(error){

        console.log(error);
        return;

    }

    artistProfile=data;

    artistAvatar.src=
        data.profile_image ||
        "asset/default-profile.png";

    artistName.textContent=
        data.display_name;

    artistUsername.textContent=
        "@"+data.display_name.replace(/\s+/g,"").toLowerCase();

}

// =========================
// TOTAL ARTWORK
// =========================

async function loadArtwork(){

    const {count,error}=await supabaseClient
    .from("artwork")
    .select("*",{count:"exact",head:true})
    .eq("artist_id",artistProfile.id);

    if(error){

        console.log(error);
        return;

    }

    totalArtwork.textContent=count;

}

// =========================
// FOLLOWERS
// =========================

async function loadFollowers(){

    const {count,error}=await supabaseClient
    .from("artist_followers")
    .select("*",{count:"exact",head:true})
    .eq("artist_id",artistProfile.id);

    if(error){

        console.log(error);
        return;

    }

    totalFollowers.textContent=count;

}

// =========================
// VIEWS
// =========================

async function loadViews(){

    const {count,error}=await supabaseClient
    .from("artist_views")
    .select("*",{count:"exact",head:true})
    .eq("artist_id",artistProfile.id);

    if(error){

        console.log(error);
        return;

    }

    totalViews.textContent=count;

}

// =========================
// LIKES
// =========================

async function loadLikes(){

    // Ambil semua artwork artist

    const {data:artworks,error}=await supabaseClient
    .from("artwork")
    .select("id")
    .eq("artist_id",artistProfile.id);

    if(error){

        console.log(error);
        return;

    }

    if(!artworks.length){

        totalLikes.textContent=0;
        return;

    }

    const ids=artworks.map(a=>a.id);

    const {count}=await supabaseClient
    .from("artwork_likes")
    .select("*",{count:"exact",head:true})
    .in("artwork_id",ids);

    totalLikes.textContent=count;

}