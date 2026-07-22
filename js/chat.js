// =========================
// GLOBAL
// =========================

let currentUser = null;          // users.id
let currentProfileId = null;     // artist_profiles.id (kalau artist)

let currentConversation = null;
let otherUser = null;

const params = new URLSearchParams(window.location.search);

const conversationId =
params.get("conversation");

console.log("Conversation :", conversationId);

async function initChat() {

     console.log("INIT CHAT");

    const {
        data: { user }
    } = await supabaseClient.auth.getUser();

    if (!user) {

        alert("Please login first.");
        window.location.href = "index.html";
        return;
    }

    currentUser = user;

    // cek apakah user ini artist
    const { data: profile } = await supabaseClient
        .from("artist_profiles")
        .select("id")
        .eq("user_id", currentUser.id)
        .maybeSingle();

    currentProfileId = profile?.id ?? null;

    console.log("User ID :", currentUser.id);
    console.log("Artist Profile ID :", currentProfileId);

    await loadConversationList();

    if (conversationId) {

        currentConversation = conversationId;

        await loadConversationInfo();

    }

}

async function loadConversationList() {

    conversationList.innerHTML = "";

    let conversations = [];

    // =========================
    // LOGIN SEBAGAI ARTIST
    // =========================
    if (currentProfileId) {

        const { data, error } = await supabaseClient
           .from("conversations")
    .select("*")
    .eq("artist_id", currentProfileId)
    .order("created_at", {
        ascending: false
    });

        if (error) {
            console.log(error);
            return;
        }

        conversations = data;

    }

    // =========================
    // LOGIN SEBAGAI CLIENT
    // =========================
    else {

        const { data, error } = await supabaseClient
            .from("conversations")
            .select(`
                *,
                artist:artist_id(
                    id,
                    display_name,
                    profile_image
                )
            `)
            .eq("client_id", currentUser.id)
            .order("created_at", {
                ascending: false
            });

        if (error) {
            console.log(error);
            return;
        }

        conversations = data;

    }

    console.log("Conversation List :", conversations);

    for (const conversation of conversations) {
         
        const item = document.createElement("div");
        item.className = "conversation-item";

        let name = "";
        let avatar = "asset/default-profile.png";

        // =========================
        // Artist melihat Client
        // =========================
        if (currentProfileId) {

            const { data: client } = await supabaseClient
        .from("users")
        .select("username")
        .eq("id", conversation.client_id)
        .single();

    console.log("Client :", client);

    name = client?.username || "Unknown Client";

        }

        // =========================
        // Client melihat Artist
        // =========================
        else {

            name = conversation.artist?.display_name || "Unknown Artist";

            avatar =
                conversation.artist?.profile_image ||
                avatar;

        }

        item.innerHTML = `
            <img
                class="conversation-avatar"
                src="${avatar}">

            <div class="conversation-info">

                <h4>${name}</h4>

                <p>${conversation.last_message || "Start chatting..."}</p>

            </div>
        `;

        item.onclick = async () => {

            currentConversation = conversation.id;

            await loadConversationInfo();
        };

        conversationList.appendChild(item);

    }

}


async function loadConversationInfo() {

    if (!currentConversation) return;

    const { data: conversation, error } = await supabaseClient
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

    if (error) {
        console.log(error);
        return;
    }

    // =========================
    // LOGIN SEBAGAI CLIENT
    // =========================
    if (conversation.client_id === currentUser.id) {

        chatName.textContent =
            conversation.artist.display_name;

        chatAvatar.src =
            conversation.artist.profile_image ||
            "asset/default-profile.png";

        chatStatus.textContent = "Artist";
    }

    // =========================
    // LOGIN SEBAGAI ARTIST
    // =========================
    else {

        const { data: client } = await supabaseClient
            .from("users")
            .select("username")
            .eq("id", conversation.client_id)
            .single();

        chatName.textContent =
            client.username;

        chatAvatar.src =
            "asset/default-profile.png";

        chatStatus.textContent =
            "Client";
    }

    await loadMessages();

}

async function loadMessages() {

    if (!currentConversation) return;

    const { data: messages, error } = await supabaseClient
        .from("messages")
        .select("*")
        .eq("conversation_id", currentConversation)
        .order("created_at", {
            ascending: true
        });

    if (error) {
        console.log(error);
        return;
    }

    console.log("Messages :", messages);

    chatBody.innerHTML = "";

    messages.forEach(message => {

        const bubble = document.createElement("div");

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

    chatBody.scrollTop = chatBody.scrollHeight;

}

async function sendMessage() {

    const text = messageInput.value.trim();

    if (!text || !currentConversation) return;

    const { error } = await supabaseClient
        .from("messages")
        .insert({
            conversation_id: currentConversation,
            sender_id: currentUser.id,
            message: text
        });

    if (error) {
        console.log(error);
        return;
    }

    // update preview conversation
    await supabaseClient
        .from("conversations")
        .update({
            last_message: text,
            last_message_at: new Date().toISOString()
        })
        .eq("id", currentConversation);

    messageInput.value = "";

    await loadMessages();
}

sendBtn.addEventListener("click", sendMessage);

messageInput.addEventListener("keypress", (e) => {

    if (e.key === "Enter") {
        sendMessage();
    }

});

document.addEventListener("DOMContentLoaded", async () => {

    await initChat();

});
