const paymentModal =
document.getElementById("paymentModal");

const paymentProof =
document.getElementById("paymentProof");

const confirmPaymentBtn =
document.getElementById("confirmPaymentBtn");

const commissionModal =
document.getElementById("commissionModal");

const closeCommission =
document.getElementById("closecommission");

const paymentMethod =
document.getElementById("paymentMethod");

closeCommission.addEventListener("click", () => {
    commissionModal.style.display = "none";
});

function openOrderForm(){

    previewModal.style.display = "none";

    document.getElementById("orderArtworkImage").src =
    selectedArtwork.image_url;

document.getElementById("orderArtworkTitle").textContent =
    selectedArtwork.title;

document.getElementById("orderArtworkPrice").textContent =
    `Rp ${Number(selectedArtwork.price).toLocaleString("id-ID")}`;

    commissionModal.style.display = "flex";
}

window.openOrderForm = openOrderForm;

const fileInput =
document.getElementById("referenceImage");

const fileList =
document.getElementById("fileList");

let uploadedFiles = [];
let pendingOrder = {};
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

    const { data: myProfile, error: profileError } =
await supabaseClient
.from("artist_profiles")
.select("id")
.eq("user_id", user.id)
.single();

if (profileError) {
    console.log(profileError);
    alert("Profile tidak ditemukan.");
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

pendingOrder = {

    client_id: myProfile.id,

    artist_id: selectedArtwork.artist_id,

    artwork_id: selectedArtwork.id,

    request_detail: request,

    reference_files: referenceUrls

};

// reset form
document.getElementById("description").value = "";

uploadedFiles = [];
fileList.innerHTML = "";
fileInput.value = "";

// tutup order
commissionModal.style.display = "none";

console.log("Sampai sini");
console.log(paymentModal);

// isi informasi pembayaran
document.getElementById("paymentBank").value =
selectedArtwork.artist_profiles?.bank_name || "";

document.getElementById("paymentAccountName").value =
selectedArtwork.artist_profiles?.account_holder || "";

document.getElementById("paymentAccountNumber").value =
selectedArtwork.artist_profiles?.account_number || "";

document.getElementById("paymentAmount").value =
`Rp ${Number(selectedArtwork.price).toLocaleString("id-ID")}`;

// buka payment
paymentModal.style.display = "flex";
};

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

const paymentFileName =
document.getElementById("paymentFileName");

paymentProof?.addEventListener("change", () => {

    if(paymentProof.files.length){

        paymentFileName.textContent =
        paymentProof.files[0].name;

    }

});

confirmPaymentBtn.onclick = async () => {

    const {
        data: { user }
    } = await supabaseClient.auth.getUser();

    if (!user) {

        alert("Please login.");
        return;

    }

    if (!paymentProof.files.length) {

        alert("Upload payment proof first.");
        return;

    }

    const file = paymentProof.files[0];

    const filePath =
        `${user.id}/${Date.now()}-${file.name}`;


        const { error: uploadError } =
    await supabaseClient.storage
        .from("payment-proofs")
        .upload(filePath, file);

    if(uploadError){

        alert(uploadError.message);
        return;

    }

    const { data: publicData } =
    supabaseClient.storage
        .from("payment-proofs")
        .getPublicUrl(filePath);

    const proofUrl =
        publicData.publicUrl;

    const { data: commission, error } =
await supabaseClient

.from("commission")

.insert({

    ...pendingOrder,

    status: "Waiting Payment Verification"

})

.select()

.single();

    if(error){

    console.log(error);

    alert(error.message);

    return;

}

// =============================
// AMBIL NAMA CLIENT
// =============================
const { data: clientProfile } =
await supabaseClient
.from("artist_profiles")
.select("id, display_name")
.eq("user_id", user.id)
.single();

// =============================
// SIMPAN PAYMENT
// =============================
const { error: paymentError } =
await supabaseClient
.from("payment_confirmations")
.insert({

    commission_id: commission.id,

    client_id: clientProfile.id,

    sender_name: clientProfile.display_name,

    transfer_amount: selectedArtwork.price,

    transfer_date: new Date().toISOString().split("T")[0],

    proof_image: proofUrl,

    status: "Pending"

});

    if(paymentError){

    console.log(paymentError);

    alert(paymentError.message);

    return;

}

    alert("Payment submitted successfully!");

paymentModal.style.display = "none";

paymentProof.value = "";

paymentFileName.textContent = "";

pendingOrder = {};

window.location.href = "Trackerlist-client.html";
}
