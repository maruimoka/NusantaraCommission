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
.forEach(btn => {

    btn.onclick = async () => {

        if (!currentOrder) return;

        const newStatus = btn.dataset.status;

       const { error } =
await supabaseClient
    .from("commission")
    .update({

        result_files: uploadedUrls,

        status: "FINISH"

    })
    .eq("id", currentOrder.id);

        if (error) {
            alert(error.message);
            return;
        }

        // update data lokal
        currentOrder.status = newStatus;

        // update tampilan tombol
        statusBtn.textContent = newStatus;

        statusModal.style.display = "none";

        showToast("Status berhasil diubah!");

    };

});

statusModal.onclick=(e)=>{

    if(e.target===statusModal){

        statusModal.style.display="none";

    }

}

const sendBtn = document.getElementById("sendResultBtn");

sendBtn.onclick = async () => {

    if (!currentOrder) return;

    const files = [...upload.files];

    if (files.length === 0) {
        alert("Pilih file terlebih dahulu.");
        return;
    }

    const uploadedUrls = [];

    // Upload semua file
    for (const file of files) {

        const filePath =
        `${currentOrder.id}/${Date.now()}-${file.name}`;

        const { error: uploadError } =
        await supabaseClient.storage
            .from("result-files")
            .upload(filePath, file);

        if (uploadError) {
            alert(uploadError.message);
            return;
        }

        // Ambil public URL
        const { data } =
        supabaseClient.storage
            .from("result-files")
            .getPublicUrl(filePath);

        uploadedUrls.push(data.publicUrl);

    }

    // Simpan ke database
    const { error } =
    await supabaseClient
        .from("commission")
        .update({

            result_files: uploadedUrls

        })
        .eq("id", currentOrder.id);

    if (error) {
        alert(error.message);
        return;
    }

    // update data lokal
    currentOrder.result_files = uploadedUrls;

    trackerModalArtist.style.display = "none";

    upload.value = "";
    resultList.innerHTML = "";

    showToast("Result berhasil dikirim!");

};

function showToast(text){

    const toast =
    document.getElementById("toast");

    toast.textContent = text;

    toast.classList.add("show");

    setTimeout(() => {

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

const statusClass =
(order.status ?? "WAITING")
.toLowerCase()
.replace(/\s+/g,"-");

card.innerHTML = `

<div class="tracker-header">

    <h3>${clientProfile.display_name}</h3>

    <span class="status ${statusClass}">
        ${(order.status ?? "WAITING").toUpperCase()}
    </span>

</div>

<div class="tracker-result">
    📄 OPEN
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

    const referenceList =
document.getElementById("referenceList");

referenceList.innerHTML = "";

if(order.reference_files && order.reference_files.length){

    order.reference_files.forEach(url=>{

        const fileName = url.split("/").pop();

        const div = document.createElement("div");

        div.className = "reference-file";

        div.innerHTML = `
            <i class="fa-regular fa-file"></i>
            <a href="${url}" target="_blank">
                ${fileName}
            </a>
        `;

        referenceList.appendChild(div);

    });

}else{

    referenceList.innerHTML =
    "<p>Tidak ada file.</p>";

}
    
    statusBtn.textContent =
        order.status ?? "WAITING";

    trackerModalArtist.style.display = "flex";

};
        
trackerList.appendChild(card);
    }

}
loadProfile();
initTracker();


async function loadProfile(){

    const {
        data:{ user }
    } = await supabaseClient.auth.getUser();

    if(!user) return;

    const { data, error } = await supabaseClient
        .from("artist_profiles")
        .select("*")
        .eq("user_id", user.id)
        .single();

    if(error){
        console.log(error);
        return;
    }

    document.getElementById("profileName").textContent =
        data.display_name ?? "";

    document.getElementById("profileBio").textContent =
        data.bio ?? "";

    document.getElementById("profileUserImage").src =
        data.profile_image || "asset/imagesbanner1.png";

}
