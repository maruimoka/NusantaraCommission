const commissionModal =
document.getElementById("commissionModal");

const closeCommission =
document.getElementById("closecommission");

closeCommission.addEventListener("click", () => {
    commissionModal.style.display = "none";
});

function openOrderForm(){

    previewModal.style.display = "none";

    document.getElementById("orderImage").src =
        selectedArtwork.image_url;

    document.getElementById("orderTitle").textContent =
        selectedArtwork.title;

    document.getElementById("orderPrice").textContent =
        `Rp ${Number(selectedArtwork.price).toLocaleString("id-ID")}`;

    document.getElementById("orderArtist").textContent =
        selectedArtwork.artist_profiles.display_name;

    commissionModal.style.display = "flex";
}

window.openOrderForm = openOrderForm;

const fileInput =
document.getElementById("referenceImage");

const fileList =
document.getElementById("fileList");

let uploadedFiles = [];
let selectedArtwork = null;

function setSelectedArtwork(artwork){

    selectedArtwork = artwork;

}

window.setSelectedArtwork = setSelectedArtwork;

fileInput.addEventListener("change", function(){

    for(let file of this.files){

        uploadedFiles.push(file);

    }

    renderFileList();

});

const submitBtn =
document.getElementById("submitOrderBtn");

submitBtn.onclick = async () => {

    const {
        data: { user }
    } = await supabaseClient.auth.getUser();

    if(!user){

        alert("Silakan login");

        return;

    }

   const request =
document.getElementById("description").value.trim();

let referenceUrls = [];

for(const file of uploadedFiles){

    const filePath =
`${user.id}/${Date.now()}-${file.name}`;

    const { error: uploadError } =
    await supabaseClient.storage
        .from("reference-files")
        .upload(filePath, file);

    if(uploadError){

        alert(uploadError.message);
        return;

    }

    const { data } =
    supabaseClient.storage
        .from("reference-files")
        .getPublicUrl(filePath);

    referenceUrls.push(data.publicUrl);

}
    
console.log(referenceUrls);
    const { error } =
    await supabaseClient
    .from("commission")
    .insert({

        client_id: user.id,

    artist_id: selectedArtwork.artist_id,

    artwork_id: selectedArtwork.id,

    request_detail: request,

    reference_files: referenceUrls,

    status: "pending"

    });

    if(error){

        console.log(error);

        alert(error.message);

        return;

    }

    alert("Order berhasil!");

    document.getElementById("description").value = "";

    uploadedFiles = [];

    fileList.innerHTML = "";

    fileInput.value = "";

    commissionModal.style.display = "none";

}




function renderFileList(){

    fileList.innerHTML = "";

    uploadedFiles.forEach(file => {

        fileList.innerHTML += `
            <div class="file-item">
                📄 ${file.name}
            </div>
        `;

    });

}
