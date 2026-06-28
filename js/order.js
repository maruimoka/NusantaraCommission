const commissionModal =
document.getElementById("commissionModal");

const closeCommission =
document.getElementById("closecommission");

closeCommission.addEventListener("click", () => {
    commissionModal.style.display = "none";
});

function openOrderForm(){

    previewModal.style.display = "none";

    commissionModal.style.display = "flex";
}

window.openOrderForm = openOrderForm;

const fileInput =
document.getElementById("referenceImage");

const fileList =
document.getElementById("fileList");

let uploadedFiles = [];

fileInput.addEventListener("change", function(){

    for(let file of this.files){

        uploadedFiles.push(file);

    }

    renderFileList();

});

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

function submitOrder(){

    document.getElementById("description").value = "";

    uploadedFiles = [];

    fileList.innerHTML = "";

    fileInput.value = "";

    commissionModal.style.display = "none";

}

window.submitOrder = submitOrder;

const submitBtn =
document.getElementById("submitOrderBtn");

submitBtn.addEventListener("click", (e) => {

    e.preventDefault();

    submitOrder();

});