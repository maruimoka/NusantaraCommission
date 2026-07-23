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

    const { data: conversations, error } = await supabaseClient
        .from("conversations")
        .select(`
            *,
            artist:artist_id(
                id,
                display_name,
                profile_image
            ),
            client:client_id(
                id,
                display_name,
                profile_image
            )
        `)
        .or(
            `artist_id.eq.${currentProfileId},client_id.eq.${currentProfileId}`
        )
        .order("last_message_at", {
            ascending: false
        });

    if (error) {
        console.log(error);
        return;
    }

    console.log("Conversation List :", conversations);

    for (const conversation of conversations) {

        const item = document.createElement("div");
        item.className = "conversation-item";

        let target;

        if (conversation.artist_id === currentProfileId) {

            target = conversation.client;

        } else {

            target = conversation.artist;

        }

        const name =
            target?.display_name || "Unknown User";

        const avatar =
            target?.profile_image ||
            "asset/default-profile.png";

        item.innerHTML = `
            <img class="conversation-avatar" src="${avatar}">

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

    if (!currentConversation && conversations.length > 0) {

        currentConversation = conversations[0].id;

        await loadConversationInfo();

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
    ),
    client:client_id(
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

   let target;

if (conversation.artist_id === currentProfileId) {

    target = conversation.client;
    chatStatus.textContent = "Client";

} else {

    target = conversation.artist;
    chatStatus.textContent = "Artist";

}

chatName.textContent = target?.display_name || "Unknown User";
     
chatAvatar.src =
    target?.profile_image ||
    "asset/default-profile.png";

     // =========================
// VIEW PROFILE BUTTON
// =========================

const viewProfileBtn = document.getElementById("viewProfileBtn");

viewProfileBtn.onclick = () => {
    window.location.href =
        `profile-follow.html?id=${target.id}`;
};

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

// UPDATE LAST MESSAGE
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

supabaseClient
.channel("messages")

.on(
    "postgres_changes",
    {
        event: "INSERT",
        schema: "public",
        table: "messages"
    },
    payload => {

        if(
            payload.new.conversation_id === currentConversation
        ){

            loadMessages();

        }

        loadConversationList();

    }
)
.subscribe();

