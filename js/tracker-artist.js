const trackerModalArtist =
document.getElementById("trackerDetailModal");
const trackerList =
document.querySelector(".tracker-list");
let currentOrder = null;

const closeBtn =
document.querySelector(".close-detail");

closeBtn.onclick = () => {
    trackerModalArtist.style.display = "none";
};

window.addEventListener("click",(e)=>{

    if(e.target===trackerModalArtist){

        trackerModalArtist.style.display="none";

    }

});

const upload =
document.getElementById("resultUpload");

const resultList =
document.getElementById("resultList");

upload.addEventListener("change",()=>{

resultList.innerHTML="";

[...upload.files].forEach(file=>{

const div=document.createElement("div");

div.className="reference-file";

div.innerHTML=`
<i class="fa-regular fa-file"></i>
${file.name}
`;

resultList.appendChild(div);

});

});

const statusModal=
document.getElementById("statusModal");

const statusBtn =
document.getElementById("changeStatusBtn");

statusBtn.onclick = () => {

    statusModal.style.display = "flex";

};

document.querySelectorAll(".status-option")
.forEach(btn=>{

btn.onclick=()=>{

statusBtn.innerText=
btn.innerText;

statusBtn.className=
btn.className;

statusModal.style.display="none";

};

});

const currentStatus =
document.getElementById("changeStatusBtn");


currentStatus.onclick = ()=>{

    statusModal.style.display="flex";

};

statusModal.onclick=(e)=>{

    if(e.target===statusModal){

        statusModal.style.display="none";

    }

}

const sendBtn = document.getElementById("sendResultBtn");

sendBtn.onclick = () => {

    // Tutup modal
    trackerModalArtist.style.display = "none";

    // Kosongkan upload
    upload.value = "";
    resultList.innerHTML = "";

    // Kosongkan note
    document.getElementById("artistNote").value = "";

    // Toast
    showToast();

};

function showToast(){

    const toast = document.getElementById("toast");

    toast.classList.add("show");

    setTimeout(()=>{

        toast.classList.remove("show");

    },2000);

}

async function initTracker(){

    const { data:{ session } } =
    await supabaseClient.auth.getSession();

    if(!session){
        console.log("Belum login");
        return;
    }

    const user = session.user;

    console.log("LOGIN USER =", user.id);

    // Ambil artist profile berdasarkan user login
    const { data: profile, error: profileError } =
    await supabaseClient
        .from("artist_profiles")
        .select("id")
        .eq("user_id", user.id)
        .single();

    if(profileError){
        console.log(profileError);
        return;
    }

    console.log("PROFILE ID =", profile.id);

    // Cari semua commission milik artist
    const { data, error } =
    await supabaseClient
        .from("commission")
        .select(`
            *,
            artwork:artwork_id(
                title,
                price,
                image_url
            )
        `)
        .eq("artist_id", profile.id);

    if(error){
        console.log(error);
        return;
    }

    console.log("DATA :", data);
    console.log("JUMLAH :", data.length);

    trackerList.innerHTML = "";

    // Loop semua order
    for(const order of data){

        const { data: clientProfile } =
        await supabaseClient
            .from("artist_profiles")
            .select("display_name, profile_image")
            .eq("user_id", order.client_id)
            .single();

        console.log(clientProfile);

        // buat card

        const card = document.createElement("div");

card.className = "tracker-card";

card.innerHTML = `
    <div class="tracker-user">

        <img src="${clientProfile.profile_image}">

        <div>

            <h3>${clientProfile.display_name}</h3>

            <p>${order.artwork.title}</p>

        </div>

    </div>
`;

card.onclick = () => {

    currentOrder = order;

    document.getElementById("clientAvatar").src =
        clientProfile.profile_image;

    document.getElementById("clientName").textContent =
        clientProfile.display_name;

    document.getElementById("commissionTitle").textContent =
        order.artwork.title;

    document.getElementById("requestDetail").value =
        order.request_detail ?? "";

    statusBtn.textContent =
        order.status ?? "WAITING";

    const referenceList =
        document.getElementById("referenceList");

    referenceList.innerHTML = "";

    (order.reference_files || []).forEach(url => {

        const div = document.createElement("div");

        div.className = "reference-file";

        div.innerHTML = `
            <i class="fa-regular fa-file"></i>
            ${url.split("/").pop()}
        `;

        referenceList.appendChild(div);

    });

    trackerModalArtist.style.display = "flex";

};
        
trackerList.appendChild(card);
    }

}
initTracker();
