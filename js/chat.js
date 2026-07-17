
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

const conversationId =
    params.get("conversation");

console.log("Conversation :", conversationId);

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

if (conversationId) {

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


async function getOrCreateConversation() {
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

   if(!currentConversation) return;
    
    const { data, error } = await supabaseClient
        .from("messages")
        .select("*")
        .eq("conversation_id", currentConversation)
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




