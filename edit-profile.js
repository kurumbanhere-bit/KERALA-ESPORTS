/* ⚡ KERALA ESPORTS - PROFESSIONAL PROFILE LOGIC */
const cacheKey = "userProfile"; // Dashbord-umayitt match aakan maatti
const imgPreview = document.getElementById("profilePreview");
const uDisplay = document.getElementById("uName");
const gNameInput = document.getElementById("gameName");
const gIDInput = document.getElementById("gameID");

// 🔥 PERMANENT STUDIO CONFIG
const firebaseConfig = {
  apiKey: "AIzaSyAo9KNsWnq2AgoCGzPuCsg7YCbuw8-Apuo",
  authDomain: "studio-4988500581-b9772.firebaseapp.com",
  projectId: "studio-4988500581-b9772",
  storageBucket: "studio-4988500581-b9772.firebasestorage.app",
  messagingSenderId: "773461302160",
  appId: "1:773461302160:web:13deb67b24b267ac0b7115"
};

// Initialize Firebase
if (!firebase.apps.length) { firebase.initializeApp(firebaseConfig); }
const auth = firebase.auth();
const db = firebase.database();

// 1. Instant Cache Load (0.01s)
const cached = JSON.parse(localStorage.getItem(cacheKey));
if(cached) {
    // Game Name undo ennu aadyam nokkum
    uDisplay.innerText = cached.gameName || cached.username || cached.firstname || "Gamer";
    imgPreview.src = cached.profilePic || "https://cdn-icons-png.flaticon.com/512/149/149071.png";
    gNameInput.value = cached.gameName || "";
    gIDInput.value = cached.gameID || "";
}

// 2. Auth State and Data Sync
auth.onAuthStateChanged(user => {
    if(user) {
        db.ref("users/" + user.uid).on('value', snapshot => {
            const data = snapshot.val();
            if(data) {
                localStorage.setItem(cacheKey, JSON.stringify(data));
                uDisplay.innerText = data.gameName || data.username || data.firstname || "Gamer";
                imgPreview.src = data.profilePic || "https://cdn-icons-png.flaticon.com/512/149/149071.png";
                gNameInput.value = data.gameName || "";
                gIDInput.value = data.gameID || "";
            }
        });
    } else {
        localStorage.removeItem(cacheKey);
        window.location.href = "login.html"; 
    }
});

// ⚡ Compression to prevent Firebase Lag
function previewImage(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                canvas.width = 160; canvas.height = 160;
                ctx.drawImage(img, 0, 0, 160, 160);
                imgPreview.src = canvas.toDataURL('image/jpeg', 0.6);
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    }
}

// ⚡ Save Function
function saveData() {
    const gn = gNameInput.value.trim();
    const gi = gIDInput.value.trim();
    const pic = imgPreview.src;
    const btn = document.getElementById("saveBtn");
    const loader = document.getElementById("loader");

    if(!gn || !gi) { alert("Details fill cheyyu!"); return; }

    btn.style.display = "none";
    if(loader) loader.style.display = "block";

    db.ref("users/" + auth.currentUser.uid).update({
        gameName: gn,
        gameID: gi,
        profilePic: pic
    }).then(() => {
        alert("Profile Updated Successfully!");
        if(btn) btn.style.display = "block";
        if(loader) loader.style.display = "none";
    }).catch(e => {
        alert("Error: " + e.message);
        if(btn) btn.style.display = "block";
        if(loader) loader.style.display = "none";
    });
}

function logoutUser() {
    if(confirm("Logout cheyyano?")) {
        auth.signOut().then(() => {
            localStorage.removeItem(cacheKey);
            window.location.href = "login.html";
        });
    }
}
