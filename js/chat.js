
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

let otherUser = null;

const params = new URLSearchParams(window.location.search);

const conversationId = params.get("conversation");

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

if (artistId) {
    await openArtistConversation(artistId);
}

    if(conversationId){

        currentConversation = conversationId;

        await loadConversationInfo();

    }

}


async function loadConversationInfo(){

    const { data: conversation, error } =
    await supabaseClient
    .from("conversations")
    .select(`
        *,
        artist:artist_id(
            id,
            user_id,
            display_name,
            profile_image
        )
    `)
    .eq("id", currentConversation)
    .single();

    if(error){

        console.log(error);
        return;

    }

    // Kalau yang login adalah CLIENT
    if(conversation.client_id === currentUser.id){

        otherUser = conversation.artist;

        chatName.textContent =
            otherUser.display_name;

        chatAvatar.src =
            otherUser.profile_image ||
            "asset/default-profile.png";

        chatStatus.textContent =
            "Artist";

    }

    // Kalau yang login adalah ARTIST
    else if(conversation.artist.user_id === currentUser.id){

        const {
            data: client
        } = await supabaseClient
        .from("users")
        .select("username")
        .eq("id", conversation.client_id)
        .single();

        otherUser = client;

        chatName.textContent =
            client.username;

        chatAvatar.src =
            "asset/default-profile.png";

        chatStatus.textContent =
            "Client";

    }

}

async function openArtistConversation(artistId){

    const { data: artist, error } = await supabaseClient
        .from("artist_profiles")
        .select(`
            id,
            display_name,
            profile_image,
            user_id
        `)
        .eq("id", artistId)
        .single();

    if(error){

        console.log(error);
        return;

    }

    currentConversation = artist;

    chatName.textContent =
        artist.display_name;

    chatAvatar.src =
        artist.profile_image ||
        "asset/default-profile.png";

    chatStatus.textContent =
        "Ready to chat";

}
