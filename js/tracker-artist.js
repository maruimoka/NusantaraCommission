const trackerModalArtist =
document.getElementById("trackerDetailModal");

document.querySelectorAll(".open-tracker")
.forEach(btn=>{

btn.addEventListener("click",(e)=>{

e.preventDefault();

trackerModalArtist.style.display="flex";

});

});

document.querySelector(".close-detail")
.onclick=()=>{

trackerModalArtist.style.display="none";

};

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

}

document
.querySelectorAll("#statusModal button")
.forEach(btn=>{

    btn.onclick=()=>{

        currentStatus.innerText =
        btn.dataset.status;

        currentStatus.className =
        "status";

        switch(btn.dataset.status){

            case "WAITING":
            currentStatus.classList.add("waiting");
            break;

            case "SKETCH":
            currentStatus.classList.add("sketch");
            break;

            case "LINEART":
            currentStatus.classList.add("lineart");
            break;

            case "COLORING":
            currentStatus.classList.add("coloring");
            break;

            case "REVISION":
            currentStatus.classList.add("revision");
            break;

            case "FINISH":
            currentStatus.classList.add("finish");
            break;

            case "ON HOLD":
            currentStatus.classList.add("hold");
            break;

        }

        statusModal.style.display="none";

    }

});

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