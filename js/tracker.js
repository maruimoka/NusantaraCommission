const trackerList = document.getElementById("tracker-list");

let commissions = [];

const trackerCards = document.querySelectorAll(".tracker-card");

const trackerModal = document.getElementById("trackerModal");

const closeBtn = document.querySelector(".close");

trackerCards.forEach(card=>{

    card.addEventListener("click",()=>{

        trackerModal.style.display="flex";

    });

});

closeBtn.addEventListener("click",()=>{

    trackerModal.style.display="none";

});

window.addEventListener("click",(e)=>{

    if(e.target===trackerModal){

        trackerModal.style.display="none";

    }

});

const editProfileModal =
document.getElementById("editProfileModal");

const openEditProfile =
document.getElementById("openEditProfile");

const closeEditProfile =
document.getElementById("closeEditProfile");

openEditProfile.onclick = function(){

    // isi form sesuai profile sekarang

    document.getElementById("editName").value =
    document.getElementById("profileName").textContent;

    document.getElementById("editBio").value =
    document.getElementById("profileBio").textContent;

    editProfileModal.style.display = "flex";

}

closeEditProfile.onclick = function(){

    editProfileModal.style.display = "none";

}

const avatarInput =
document.getElementById("avatarInput");

const editAvatarPreview =
document.getElementById("editAvatarPreview");

avatarInput.addEventListener("change",function(){

    const file = this.files[0];

    if(!file) return;

    const reader = new FileReader();

    reader.onload = function(e){

        editAvatarPreview.src = e.target.result;

    }

    reader.readAsDataURL(file);

});

const saveProfileBtn = document.getElementById("saveProfileBtn");

saveProfileBtn.onclick = function(){

    document.getElementById("profileName").textContent =
        document.getElementById("editName").value;

    document.getElementById("profileBio").textContent =
        document.getElementById("editBio").value;

    document.getElementById("profileUserImage").src =
        document.getElementById("editAvatarPreview").src;

    // Tutup modal
    editProfileModal.style.display = "none";

    // Toast
    showToast();

}

const { data: sessionData } =
await supabaseClient.auth.getSession();

const user = sessionData.session.user;

const { data: commissions } = await supabaseClient
.from("commissions")
.select("*")
.eq("client_id", user.id);

commissions.forEach(item => {

    

});

commissions.forEach(item => {

 trackerList.innerHTML += `
<div class="tracker-card">

    <div class="card-left">

        <h4>${item.artist.username}</h4>

        <div class="commission-name">
            <i class="fa-regular fa-file"></i>
            <span>${item.artwork.title}</span>
        </div>

        <a href="#" class="open-tracker">
            • OPEN
        </a>

    </div>

    <div class="card-right">

        <span class="status">
            ${item.status}
        </span>

    </div>

</div>
`;

});

const { data, error } = await supabaseClient
    .from("commissions")
    .select(`
        *,
        artist:artist_id (
            username,
            profile_image
        ),
        artwork:artwork_id (
            title,
            price,
            cover_image
        )
    `)
    .eq("client_id", user.id);
