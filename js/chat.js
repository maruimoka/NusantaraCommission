// =========================
// SUPABASE
// =========================

const supabaseClient = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_ANON_KEY
);

// =========================
// ELEMENTS
// =========================

const conversationList =
document.getElementById("conversationList");

const chatName =
document.getElementById("chatName");

const chatAvatar =
document.getElementById("chatAvatar");

const chatStatus =
document.getElementById("chatStatus");

const chatBody =
document.getElementById("chatBody");

const messageInput =
document.getElementById("messageInput");

const sendBtn =
document.getElementById("sendBtn");

// =========================
// GLOBAL
// =========================

let currentUser = null;

let currentConversation = null;

const params = new URLSearchParams(window.location.search);

const artistId = params.get("artist");

// =========================
// INIT
// =========================

document.addEventListener("DOMContentLoaded", async () => {

    await initChat();

});

async function initChat(){

    const {
        data:{user}
    } = await supabaseClient.auth.getUser();

    if(!user){

        alert("Please login first.");

        window.location.href = "index.html";

        return;

    }

    currentUser = user;

    console.log(currentUser);

}
