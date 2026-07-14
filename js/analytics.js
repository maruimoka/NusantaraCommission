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

const revenueChartCanvas = document.getElementById("revenueChart");

const revenueYear = document.getElementById("revenueYear");

const orderYear = document.getElementById("orderYear");

const orderMonth = document.getElementById("orderMonth");

const recentOrdersList = document.getElementById("recentOrdersList");

const statusClass = order.status.toLowerCase().replace(/\s+/g,"-");

let revenueChart = null;

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

    populateYearFilter();
    populateMonthFilter();

    await loadArtist(user.id);

    if(!artistProfile) return;

    await loadArtwork();
    await loadFollowers();
    await loadViews();
    await loadLikes();

    await loadOrderAnalytics();
    
    await loadRevenueChart();
    await loadRecentOrders();

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

// =========================
// REVENUE CHART
// =========================

async function loadRevenueChart() {

    const selectedYear = Number(revenueYear.value);

    const { data: orders, error } = await supabaseClient
        .from("commission")
        .select(`
            created_at,
            status,
            artwork:artwork_id(
                price
            )
        `)
        .eq("artist_id", artistProfile.id)
        .eq("status", "FINISH");

    if (error) {

        console.log(error);
        return;

    }

    // Revenue tiap bulan
    const monthlyRevenue = new Array(12).fill(0);

    orders.forEach(order => {

        const date = new Date(order.created_at);

        if (date.getFullYear() !== selectedYear) return;

        const month = date.getMonth();

        monthlyRevenue[month] += Number(order.artwork?.price || 0);

    });

    const labels = [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec"
    ];

    if (revenueChart) {

        revenueChart.destroy();

    }

    revenueChart = new Chart(revenueChartCanvas, {

        type: "line",

        data: {

            labels,

            datasets: [

                {

                    label: "Revenue",

                    data: monthlyRevenue,

                    borderWidth: 3,

                    tension: 0.3,

                    fill: true

                }

            ]

        },

        options: {

            responsive: true,

            plugins: {

                legend: {

                    display: false

                }

            },

            scales: {

                y: {

                    beginAtZero: true,

                    ticks: {

                        callback(value) {

                            return "Rp " + value.toLocaleString("id-ID");

                        }

                    }

                }

            }

        }

    });

}

// =========================
// RECENT ORDERS
// =========================

async function loadRecentOrders() {

    const year = Number(orderYear.value);
    const month = Number(orderMonth.value);

    const { data: orders, error } = await supabaseClient
        .from("commission")
        .select(`
            created_at,
            status,
            client:client_id(
                username
            ),
            artwork:artwork_id(
                title,
                price
            )
        `)
        .eq("artist_id", artistProfile.id)
        .order("created_at", { ascending: false });

    if (error) {

        console.log(error);
        return;

    }

    recentOrdersList.innerHTML = "";

    orders.forEach(order => {

        const date = new Date(order.created_at);

        if (date.getFullYear() !== year) return;

        if (month !== 0 && date.getMonth() + 1 !== month) return;

        recentOrdersList.innerHTML += `

            <tr>

                <td>${order.client?.username ?? "-"}</td>

                <td>${order.artwork?.title ?? "-"}</td>

                <td>
                    Rp ${Number(order.artwork?.price ?? 0).toLocaleString("id-ID")}
                </td>

               <td>

    <span class="status-badge ${order.status.toLowerCase()}">

        ${order.status}

    </span>

</td>

                <td>
                    ${date.toLocaleDateString("id-ID")}
                </td>

            </tr>

        `;

    });

}
// =========================
// YEAR FILTER
// =========================

function populateYearFilter() {

    const currentYear = new Date().getFullYear();

    revenueYear.innerHTML = "";
    orderYear.innerHTML = "";

    for (let year = currentYear; year >= currentYear - 5; year--) {

        const option1 = document.createElement("option");
        option1.value = year;
        option1.textContent = year;
        revenueYear.appendChild(option1);

        const option2 = document.createElement("option");
        option2.value = year;
        option2.textContent = year;
        orderYear.appendChild(option2);

    }

}

// =========================
// MONTH FILTER
// =========================

function populateMonthFilter() {

    const months = [
        "All Months",
        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December"
    ];

    orderMonth.innerHTML = "";

    months.forEach((month, index) => {

        const option = document.createElement("option");

        option.value = index;
        option.textContent = month;

        orderMonth.appendChild(option);

    });

}

// =========================
// EVENTS
// =========================

revenueYear.addEventListener("change", () => {

    loadRevenueChart();

});

orderYear.addEventListener("change", () => {

    loadRecentOrders();

});

orderMonth.addEventListener("change", () => {

    loadRecentOrders();

});
