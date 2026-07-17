
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
const artistId = params.get("artist");
console.log("Artist ID :", artistId);
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

        alert("Please login first.")
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
await loadMessages();
}


async function openArtistConversation(artistId){

    // ambil artist
    const { data: artist } = await supabaseClient
        .from("artist_profiles")
        .select("id,user_id,display_name,profile_image")
        .eq("id", artistId)
        .single();

    if(!artist) return;

    // cek conversation
    let { data: conversation } = await supabaseClient
        .from("conversations")
        .select("*")
        .eq("client_id", currentUser.id)
        .eq("artist_id", artist.id)
        .maybeSingle();

    // kalau belum ada -> buat
    if(!conversation){

        const { data } = await supabaseClient
            .from("conversations")
            .insert({
                client_id: currentUser.id,
                artist_id: artist.id
            })
            .select()
            .single();

        conversation = data;
    }

    currentConversation = conversation.id;

    chatName.textContent = artist.display_name;

    chatAvatar.src =
        artist.profile_image ||
        "asset/default-profile.png";

    chatStatus.textContent = "Artist";

    otherUser = artist;
     const id = await getOrCreateConversation();
    await loadMessages();
}


async function loadMessages(){

    if(!currentConversation) return;

    const { data, error } = await supabaseClient
        .from("messages")
        .select("*")
        .eq("conversation_id", currentConversation)
        .order("created_at", {
            ascending: true
        });

    if(error){
        console.log(error);
        return;
    }

    chatBody.innerHTML = "";

    data.forEach(message=>{

        const mine =
            message.sender_id === currentUser.id;

        const bubble =
        document.createElement("div");

        bubble.className =
            mine ? "my-message" : "their-message";

        bubble.innerHTML = `
            <div class="message-bubble">
                ${message.message}
            </div>
        `;

        chatBody.appendChild(bubble);

    });

    chatBody.scrollTop =
        chatBody.scrollHeight;

}


async function getOrCreateConversation() {

    if (currentConversation?.id) {
        return currentConversation.id;
    }

    const { data: existing } = await supabaseClient
        .from("conversations")
        .select("*")
        .eq("client_id", currentUser.id)
        .eq("artist_id", artistId)
        .maybeSingle();

    if (existing) {

        currentConversation = existing;

        return existing.id;
    }

    const { data: conversation, error } = await supabaseClient
        .from("conversations")
        .insert({
            client_id: currentUser.id,
            artist_id: artistId
        })
        .select()
        .single();

    if (error) {
        console.log(error);
        return null;
    }

    currentConversation = conversation;

    return conversation.id;
}


async function sendMessage() {

    const text = messageInput.value.trim();

    if (!text) return;

    const conversationId =
        await getOrCreateConversation();

    if (!conversationId) return;

    const { error } = await supabaseClient
        .from("messages")
        .insert({

            conversation_id: conversationId,

            sender_id: currentUser.id,

            message: text

        });

    if (error) {

        console.log(error);

        return;

    }

    messageInput.value = "";

    loadMessages();

}


sendBtn.addEventListener("click", sendMessage);

messageInput.addEventListener("keypress", (e) => {

    if(e.key === "Enter"){

        sendMessage();

    }

});

async function loadMessages() {

    if(!currentConversation?.id) return;

    const { data, error } = await supabaseClient
        .from("messages")
        .select("*")
        .eq("conversation_id", currentConversation.id)
        .order("created_at");

    if(error){

        console.log(error);

        return;

    }

    chatBody.innerHTML = "";

    data.forEach(message => {

        const bubble =
            document.createElement("div");

        bubble.className =
            message.sender_id === currentUser.id
            ? "my-message"
            : "their-message";

        bubble.innerHTML = `
            <div class="bubble">
                ${message.message}
            </div>
        `;

        chatBody.appendChild(bubble);

    });

    chatBody.scrollTop =
        chatBody.scrollHeight;

}




