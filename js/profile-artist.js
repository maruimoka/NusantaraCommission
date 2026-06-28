// =========================
// DATA
// =========================

const { data: { session } } = await supabaseClient.auth.getSession();

const user = session.user;

const { data: artist } = await supabaseClient
.from("users")
.select("id")
.eq("auth_id", user.id)
.single();

const { data: artworks, error } =
await supabaseClient
.from("artwork")
.select("*")
.eq("artist_id", artist.id);

const commissions =
artworks.filter(item =>
item.category === "commission");

const galleries =
artworks.filter(item =>
item.category === "gallery");

renderCards(
commissions,
commissionSection,
"COMMISSION"
);

renderCards(
galleries,
gallerySection,
"GALLERY"
);
// =========================
// ELEMENT
// =========================

const commissionSection = document.getElementById("commissionSection");
const gallerySection = document.getElementById("gallerySection");

const commissionTab = document.getElementById("commissionTab");
const galleryTab = document.getElementById("galleryTab");

const followBtn = document.getElementById("followBtn");
const followersText = document.getElementById("followers");

const previewModal = document.getElementById("previewModal");
const closePreview = document.getElementById("closePreview");


// =========================
// RENDER CARD
// =========================

function renderCards(data, container, type) {

    container.innerHTML = "";

    data.forEach(item => {

        const card = document.createElement("div");

card.className = "card";

card.innerHTML = `

<img src="${item.image}" alt="${item.title}">

   <div class="card-body">

    <span class="tag">
        ${type}
    </span>

    <h3>${item.title}</h3>

    <p>
        <i class="fa-regular fa-user"></i>
        ${item.artist}
    </p>

   </div>
`;

        card.addEventListener("click", () => {

            openPreview(item);

        });

        container.appendChild(card);

    });

}


// =========================
// PREVIEW MODAL
// =========================

function openPreview(item){

    document.getElementById("modalImage").src =
        item.image;

    document.getElementById("modalTitle").textContent =
        item.title;

    document.getElementById("modalPrice").textContent =
        item.price;

    previewModal.style.display = "flex";

}


closePreview.onclick = function(){

    previewModal.style.display = "none";

}


window.onclick = function(e){

    if(e.target == previewModal){

        previewModal.style.display = "none";

    }

}


// =========================
// TAB
// =========================

renderCards(commissions, commissionSection, "COMMISSION");
renderCards(galleries, gallerySection, "GALLERY");

gallerySection.style.display = "none";

commissionTab.onclick = function(){

    commissionSection.style.display = "grid";
    gallerySection.style.display = "none";

    commissionTab.classList.add("active");
    galleryTab.classList.remove("active");

}

galleryTab.onclick = function(){

    commissionSection.style.display = "none";
    gallerySection.style.display = "grid";

    galleryTab.classList.add("active");
    commissionTab.classList.remove("active");

}


// =========================
// FOLLOW BUTTON
// =========================

if(followBtn){

    let followers = 25;
    let isFollowing = true;

    followBtn.onclick = function(){

        if(isFollowing){

            followers--;

            followBtn.innerText = "FOLLOW";

        }else{

            followers++;

            followBtn.innerText = "UNFOLLOW";

        }

        followersText.innerHTML = `<b>${followers}</b> Followers`;

        isFollowing = !isFollowing;

    }

}



const editModal = document.getElementById("editModal");

const closeEdit = document.getElementById("closeEdit");

const saveEditBtn = document.getElementById("saveEditBtn");

const editBtn = document.querySelector(".edit-btn");

editBtn.onclick = function(){

    previewModal.style.display = "none";

    editModal.style.display = "flex";

}

closeEdit.onclick = function(){

    editModal.style.display = "none";

    reseteditForm();

}

saveEditBtn.onclick = function(){

    showToast();

    editModal.style.display = "none";

    reseteditForm();

}

const commissionBtn = document.getElementById("editCommissionTab");

const galleryBtn = document.getElementById("editGalleryTab");

const priceLabel = document.getElementById("priceLabel");

const priceInput = document.getElementById("editPrice");

commissionBtn.onclick = function(){

    commissionBtn.classList.add("active");

    galleryBtn.classList.remove("active");

    priceLabel.style.display = "block";

    priceInput.style.display = "block";

}

galleryBtn.onclick = function(){

    galleryBtn.classList.add("active");

    commissionBtn.classList.remove("active");

    priceLabel.style.display = "none";

    priceInput.style.display = "none";

}


const imageInput = document.getElementById("imageInput");

const imagePreview = document.getElementById("imagePreview");

const uploadContent = document.getElementById("uploadContent");

imageInput.addEventListener("change", function(){

    const file = this.files[0];

    if(file){

        const reader = new FileReader();

        reader.onload = function(e){

            imagePreview.src = e.target.result;

            imagePreview.style.display = "block";

            uploadContent.style.display = "none";

        }

        reader.readAsDataURL(file);

    }

});


function reseteditForm(){

    // Kosongkan input
    document.getElementById("editTitle").value = "";
    document.getElementById("editDescription").value = "";
    document.getElementById("editPrice").value = "";

    // Reset upload gambar
    imageInput.value = "";

    imagePreview.src = "";
    imagePreview.style.display = "none";

    uploadContent.style.display = "flex";

    // Kembalikan tab ke Commission
    commissionBtn.classList.add("active");
    galleryBtn.classList.remove("active");

    priceLabel.style.display = "block";
    priceInput.style.display = "block";

}

function showToast(){

    const toast = document.getElementById("toast");

    toast.classList.add("show");

    setTimeout(function(){

        toast.classList.remove("show");

    },2000);

}


const postModal = document.getElementById("postModal");

const openPostBtn =
document.getElementById("openPostBtn");
const savePostBtn =
document.getElementById("savePostBtn");

savePostBtn.onclick = function(){

    // nanti di sini proses simpan data

    showToast();

    postModal.style.display = "none";

    resetPostForm();

}
console.log(postModal);
console.log(openPostBtn);

const closePostModal =
document.getElementById("closePostModal");

openPostBtn.onclick = function(){

    console.log("POST DIKLIK");

    postModal.style.display = "flex";

}
closePostModal.onclick = function(){

    postModal.style.display = "none";

    resetPostForm();

}

const postInput =
document.getElementById("postImageInput");

const postPreview =
document.getElementById("postPreviewImage");

const postUploadContent =
document.getElementById("postUploadContent");

postInput.addEventListener("change", function () {

    const file = this.files[0];

    if (!file) return;

    const reader = new FileReader();

    reader.onload = function (e) {

        postPreview.src = e.target.result;

        postPreview.style.display = "block";

        postUploadContent.style.display = "none";

    };

    reader.readAsDataURL(file);

});


function resetPostForm(){

    document.getElementById("postForm").reset();

    postPreview.style.display="none";

    postUploadContent.style.display="flex";

}

const postCommissionTab = document.getElementById("postCommissionTab");
const postGalleryTab = document.getElementById("postGalleryTab");

const postPrice = document.getElementById("postPrice");

postCommissionTab.onclick = function () {

    postCommissionTab.classList.add("active");
    postGalleryTab.classList.remove("active");

    postPrice.style.display = "block";

}

postGalleryTab.onclick = function () {

    postGalleryTab.classList.add("active");
    postCommissionTab.classList.remove("active");

    postPrice.style.display = "none";

}

const postPriceLabel =
document.getElementById("postPriceLabel");

postCommissionTab.onclick = function () {

    postCommissionTab.classList.add("active");
    postGalleryTab.classList.remove("active");

    postPrice.style.display = "block";
    postPriceLabel.style.display = "block";

}

postGalleryTab.onclick = function () {

    postGalleryTab.classList.add("active");
    postCommissionTab.classList.remove("active");

    postPrice.style.display = "none";
    postPriceLabel.style.display = "none";

}

const deleteBtn = document.querySelector(".delete-btn");

deleteBtn.onclick = function(){

    // Tutup modal preview
    previewModal.style.display = "none";

    // Toast
    showDeleteToast();

}

function showDeleteToast(){

    const toast = document.getElementById("toast");

    toast.innerHTML = "🗑️ Data berhasil dihapus!";

    toast.classList.add("show");

    setTimeout(function(){

        toast.classList.remove("show");

        toast.innerHTML = "🗑️ Data berhasil dihapus!";

    },2000);

}
