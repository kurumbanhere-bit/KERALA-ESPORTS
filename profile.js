/* ⚡ PROFILE ENGINE - SPEED 0.01s */

// 1. INSTANT UI LOAD FROM CACHE
(function loadInstantProfile() {
    const cacheData = localStorage.getItem("userProfile");
    if(cacheData) {
        const data = JSON.parse(cacheData);
        
        // Priority: 1. gameName, 2. username, 3. firstname
        const finalName = data.gameName || data.username || data.firstname || "Gamer";
        
        if(document.getElementById("uName")) {
            document.getElementById("uName").innerText = finalName;
        }
        if(document.getElementById("userImg")) {
            document.getElementById("userImg").src = data.profilePic || "https://cdn-icons-png.flaticon.com/512/149/149071.png";
        }
        
        // Instant hide loader
        const loader = document.getElementById("loader");
        if(loader) loader.style.display = "none";
    }
})();

// 🔥 OUR PERMANENT FIREBASE CONFIG
const firebaseConfig = {
  apiKey: "AIzaSyAo9KNsWnq2AgoCGzPuCsg7YCbuw8-Apuo",
  authDomain: "studio-4988500581-b9772.firebaseapp.com",
  projectId: "studio-4988500581-b9772",
  storage: "studio-4988500581-b9772.firebasestorage.app",
  messagingSenderId: "773461302160",
  appId: "1:773461302160:web:13deb67b24b267ac0b7115"
};

// Initialize Firebase
if (!firebase.apps.length) { firebase.initializeApp(firebaseConfig); }
const auth = firebase.auth();
const db = firebase.database();

auth.onAuthStateChanged(user => {
    if(user) {
        db.ref("users").child(user.uid).on('value', snapshot => {
            const myData = snapshot.val();
            if(myData) {
                // Background-il data update cheythu cache-il veykkunnu
                localStorage.setItem("userProfile", JSON.stringify(myData));
                
                const latestName = myData.gameName || myData.username || myData.firstname || "Gamer";
                
                if(document.getElementById("uName")) {
                    document.getElementById("uName").innerText = latestName;
                }
                if(document.getElementById("userImg")) {
                    document.getElementById("userImg").src = myData.profilePic || "https://cdn-icons-png.flaticon.com/512/149/149071.png";
                }
                
                // Final check to hide loader
                const loader = document.getElementById("loader");
                if(loader) loader.style.display = "none";
            }
        });
    } else { 
        localStorage.removeItem("userProfile");
        window.location.href = "index.html"; 
    }
});

const infoData = {
    faq: `<b>How do I join a match?</b><br>Go to home, select a match, and click JOIN.<br><br><b>How to withdraw?</b><br>Go to Wallet, enter UPI ID.<br><br><b>Hack Policy:</b><br>Permanent ban for hackers.`,
    about: `<b>Kerala Esports</b> is the #1 platform for FF enthusiasts in Kerala, founded in 2026.`,
    terms: `1. Must be 18+ to play.<br>2. Fair play only.<br>3. No refunds.<br>4. Only one account per person.`
};

function openModal(type) {
    const titles = { faq: 'FAQs', about: 'About Us', terms: 'Terms & Conditions' };
    document.getElementById("modalTitle").innerText = titles[type];
    document.getElementById("modalBody").innerHTML = infoData[type];
    document.getElementById("infoModal").style.display = "flex";
}

function closeModal() { document.getElementById("infoModal").style.display = "none"; }

function logoutUser() {
    if(confirm("Are you sure you want to logout?")) {
        auth.signOut().then(() => { 
            localStorage.clear(); // Ellam cache-um clean aakkunnu
            window.location.href = "lohin.html"; 
        }).catch(err => { alert("Logout Error: " + err.message); });
    }
}
