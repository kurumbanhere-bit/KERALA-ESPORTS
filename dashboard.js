/* ⚡ KERALA ESPORTS - LIGHTNING MATCH ENGINE */

// 1. INSTANT UI LOAD (Profile + Matches from Cache)
(function loadInstantDashboard() {
    const userCache = localStorage.getItem("userProfile");
    const matchCache = localStorage.getItem("matchCache");

    // Profile Cache Load
    if (userCache) {
        const d = JSON.parse(userCache);
        const uName = d.gameName || d.username || d.firstname || "Gamer";
        if (document.getElementById("usernameDisplay")) document.getElementById("usernameDisplay").innerText = uName;
        if (document.getElementById("profilePic") && d.profilePic) document.getElementById("profilePic").src = d.profilePic;
        if (document.getElementById("walletAmount")) document.getElementById("walletAmount").innerText = "₹" + (d.wallet || 0);
        document.getElementById("loader").style.display = "none";
    }

    // Match Cache Load (Instant Match Display)
    if (matchCache) {
        renderMatches(JSON.parse(matchCache));
    }
})();

const firebaseConfig = {
  apiKey: "AIzaSyAo9KNsWnq2AgoCGzPuCsg7YCbuw8-Apuo",
  authDomain: "studio-4988500581-b9772.firebaseapp.com",
  projectId: "studio-4988500581-b9772",
  storageBucket: "studio-4988500581-b9772.firebasestorage.app",
  messagingSenderId: "773461302160",
  appId: "1:773461302160:web:13deb67b24b267ac0b7115"
};

if (!firebase.apps.length) { firebase.initializeApp(firebaseConfig); }
const auth = firebase.auth();
const db = firebase.database();

let currentCategory = "BR PER KILL";

auth.onAuthStateChanged(user => {
    if (user) {
        // Real-time Profile Sync
        db.ref("users/" + user.uid).on('value', snapshot => {
            const userData = snapshot.val();
            if (userData) {
                localStorage.setItem("userProfile", JSON.stringify(userData));
                document.getElementById("usernameDisplay").innerText = userData.gameName || userData.username || "Gamer";
                document.getElementById("walletAmount").innerText = "₹" + (userData.wallet || 0);
            }
            document.getElementById("loader").style.display = "none";
        });

        // Real-time Matches Sync
        db.ref('matches').on('value', snapshot => {
            let allMatches = [];
            snapshot.forEach(child => {
                let d = child.val(); d.key = child.key;
                allMatches.push(d);
            });
            // Update Match Cache
            localStorage.setItem("matchCache", JSON.stringify(allMatches));
            renderMatches(allMatches);
        });
    } else { window.location.href = "login.html"; }
});

function renderMatches(matchesData) {
    const container = document.getElementById('matchContainer');
    if(!container) return;
    
    let htmlContent = "";
    matchesData.forEach(data => {
        if (data.category === currentCategory) {
            htmlContent += `
                <div class="match-card" onclick="location.href='card.html?id=${data.key}'">
                    <div class="card-top">
                        <span class="tag">${data.teamType || 'SOLO'}</span>
                        <span class="tag">${data.map || 'BERMUDA'}</span>
                    </div>
                    <div class="m-title">FREE FIRE - ${data.title || 'TOURNAMENT'}</div>
                    <div class="prize-txt">Prize Pool - ₹${data.prize || 0}</div>
                    <button class="join-btn-dashboard">₹${data.entry || 0} JOIN</button>
                </div>`;
        }
    });
    container.innerHTML = htmlContent || "<div style='text-align:center; padding:50px; color:#ccc;'>No matches found.</div>";
}

function filterMatches(element, category) {
    document.querySelectorAll('.category').forEach(c => c.classList.remove('active'));
    element.classList.add('active');
    currentCategory = category;
    
    // Load from cache instantly when switching category
    const matchCache = localStorage.getItem("matchCache");
    if(matchCache) renderMatches(JSON.parse(matchCache));
}
