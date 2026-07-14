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
const totalOrders = document.getElementById("totalOrders");
const totalRevenue = document.getElementById("totalRevenue");

const pendingOrders = document.getElementById("pendingOrders");
const progressOrders = document.getElementById("progressOrders");
const finishedOrders = document.getElementById("finishedOrders");

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

    await loadOrderAnalytics();

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

    const { count, error } = await supabaseClient
        .from("followers")
        .select("*",{
            count:"exact",
            head:true
        })
        .eq("artist_id",artistProfile.id);

    console.log("Followers Count:",count);
    console.log("Followers Error:",error);

    totalFollowers.textContent = count ?? 0;

}
// =========================
// VIEWS
// =========================

async function loadViews(){

    const { count, error } = await supabaseClient
        .from("artist_views")
        .select("*",{
            count:"exact",
            head:true
        })
        .eq("artist_id",artistProfile.id);

    console.log("Views Count:",count);
    console.log("Views Error:",error);

    totalViews.textContent = count ?? 0;

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


// =========================
// ORDER ANALYTICS
// =========================

async function loadOrderAnalytics(){

    const { data: orders, error } = await supabaseClient
        .from("commission")
        .select(`
            status,
            artwork:artwork_id(
                price
            )
        `)
        .eq("artist_id", artistProfile.id);

    if(error){

        console.log(error);
        return;

    }

    let pending = 0;
    let progress = 0;
    let finished = 0;
    let revenue = 0;

    orders.forEach(order=>{

        const status = (order.status || "").toUpperCase();

        if(status==="PENDING"){

            pending++;

        }

        else if(
            status==="WAITING" ||
            status==="SKETCH" ||
            status==="LINEART" ||
            status==="COLORING" ||
            status==="REVISION" ||
            status==="ON HOLD"
        ){

            progress++;

        }

        else if(status==="FINISH"){

            finished++;

            revenue += Number(order.artwork?.price || 0);

        }

    });

    totalOrders.textContent = orders.length;

    pendingOrders.textContent = pending;

    progressOrders.textContent = progress;

    finishedOrders.textContent = finished;

    totalRevenue.textContent =
        "Rp " +
        revenue.toLocaleString("id-ID");

}
