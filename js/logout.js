async function checkSession(){

    const { data } =
    await supabaseClient.auth.getSession();

    if(!data.session){

        window.location.href = "index.html";

    }

}

checkSession();



//LOGOUT
const logoutBtn = document.getElementById("logoutBtn");
const logoutModal = document.getElementById("logoutModal");

const closeLogout = document.querySelector(".close-logout");
const cancelLogout = document.getElementById("cancelLogout");
const confirmLogout = document.getElementById("confirmLogout");

logoutBtn.addEventListener("click", () => {

    logoutModal.style.display = "flex";

});

closeLogout.addEventListener("click", () => {

    logoutModal.style.display = "none";

});

cancelLogout.addEventListener("click", () => {

    logoutModal.style.display = "none";

});

window.addEventListener("click", (e)=>{

    if(e.target === logoutModal){

        logoutModal.style.display = "none";

    }

});

confirmLogout.addEventListener("click", async () => {

    const { error } = await supabaseClient.auth.signOut();

    if(error){
        alert(error.message);
        return;
    }

    window.location.href = "index.html";

});
