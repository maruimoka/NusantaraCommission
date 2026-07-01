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

    const {
        data:{session}
    }=await supabaseClient.auth.getSession();

    if(!session) return;

    const user=session.user;

    const {data,error}=await supabaseClient
    .from("commission")
    .select(`
        *,
        client:client_id(
            display_name,
            profile_image
        ),
        artwork:artwork_id(
            title,
            price,
            image_url
        )
    `)
    .eq("artist_id",user.id);

    console.log(data);

}

initTracker();
