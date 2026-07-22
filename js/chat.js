
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
 let currentProfileId = null;

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

    const { data: profile } = await supabaseClient
    .from("artist_profiles")
    .select("id")
    .eq("user_id", currentUser.id)
    .single();

if(profile){

    currentProfileId = profile.id;

}
else{

    currentProfileId = null;

}

    
console.log("User ID :", currentUser.id);
console.log("Profile ID :", currentProfileId);

    console.log(currentUser);
    await loadConversationList();

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
    if(conversation.client_id ===  currentUser.id){

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
    else if(conversation.artist_id === currentProfileId){

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

async function loadConversationList() {

    const { data: artistProfile } = await supabaseClient
        .from("artist_profiles")
        .select("id")
        .eq("user_id", currentUser.id)
        .maybeSingle();

    console.log("Artist Profile :", artistProfile);

    const { data, error } = await supabaseClient
        .from("conversations")
        .select("*")
        .eq("artist_id", artistProfile.id);

    console.log("Conversation Result :", data);
    console.log("Conversation Error :", error);

}

async function getOrCreateConversation() {
        return currentConversation;
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




