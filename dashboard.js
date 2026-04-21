/* ⚡ KL ESPORTS - MASTER DASHBOARD & PRE-FETCH ENGINE (FIXED) */

const firebaseConfig = {
    apiKey: "AIzaSyAo9KNsWnq2AgoCGzPuCsg7YCbuw8-Apuo",
    authDomain: "studio-4988500581-b9772.firebaseapp.com",
    databaseURL: "https://studio-4988500581-b9772-default-rtdb.firebaseio.com",
    projectId: "studio-4988500581-b9772",
    storageBucket: "studio-4988500581-b9772.firebasestorage.app",
    messagingSenderId: "773461302160",
    appId: "1:773461302160:web:13deb67b24b267ac0b7115"
};

if (!firebase.apps.length) { firebase.initializeApp(firebaseConfig); }
const auth = firebase.auth();
const db = firebase.database();

let currentCategory = "BR PER KILL"; 

// 1. 🚀 DASHBOARD BOOT
(function bootEngine() {
    const userCache = localStorage.getItem("userProfile");
    if(userCache) {
        updateDashboardUI(JSON.parse(userCache));
        const loader = document.getElementById("loader");
        if(loader) loader.style.display = "none";
    }
    filterMatches(null, 'BR PER KILL');
})();
// 2. 🔐 AUTH & DUAL SYNC (Updated with Ban Check)
auth.onAuthStateChanged(user => {
    if (user) {
        localStorage.setItem("last_logged_uid", user.uid);
        
        // Status koodi check cheyyan vendi listener update cheyyunnu
        db.ref("users/" + user.uid).on('value', snap => {
            if (snap.exists()) {
                const d = snap.val();

                // --- 🛡️ BAN CHECK LOGIC START ---
                if (d.status === "Banned") {
                    alert("Your account has been suspended by Admin.");
                    auth.signOut().then(() => {
                        localStorage.clear();
                        sessionStorage.clear();
                        window.location.href = "index.html"; // Login page-ilekku thirichu vidunnu
                    });
                    return; // Pinne ulla code work aavaruthu
                }
                // --- 🛡️ BAN CHECK LOGIC END ---

                localStorage.setItem("userProfile", JSON.stringify(d));
                updateDashboardUI(d);
            }
        });
        
        preFetchMyMatches(user.uid);
        loadMatches('BR PER KILL');
    } else {
        window.location.href = "index.html";
    }
});


// 🕹️ MY-MATCHES REAL-TIME BACKGROUND PRE-FETCH ENGINE
async function preFetchMyMatches(uid) {
    console.log("Background Sync Started: Fetching Joined Matches...");

    // Firebase 'matches' node-il listener vekkunnu
    db.ref('matches').on('value', (mSnap) => {
        let allMyMatches = { 
            upcoming: [], 
            ongoing: [], 
            completed: [] 
        };
        
        const now = new Date().getTime();

        if (mSnap.exists()) {
            mSnap.forEach(matchChild => {
                const data = matchChild.val();
                const mId = matchChild.key;

                // User ee match-il participant aano ennu check cheyyunnu
                if (data.participants && data.participants[uid]) {
                    const matchTime = new Date(data.time).getTime();
                    const matchEndTime = matchTime + (60 * 60 * 1000); // Default 1 hour duration

                    let status = "upcoming";
                    
                    // Match status logic
                    if (data.status === "Completed" || data.isEnded === true || now >= matchEndTime) {
                        status = "completed";
                    } else if (now >= matchTime && now < matchEndTime) {
                        status = "ongoing";
                    }

                    const matchObj = { id: mId, ...data, statusType: status };
                    allMyMatches[status].push(matchObj);
                    
                    // Individual match data cache (optional but helpful)
                    localStorage.setItem(`match_${mId}`, JSON.stringify(matchObj));
                }
            });
        }

        // Dashboard-il irikkumbol thanne My-Matches page-inu vendi data ready akkunu
        localStorage.setItem("my_matches_cache_upcoming", JSON.stringify(allMyMatches.upcoming));
        localStorage.setItem("my_matches_cache_ongoing", JSON.stringify(allMyMatches.ongoing));
        localStorage.setItem("my_matches_cache_completed", JSON.stringify(allMyMatches.completed));
        
        console.log("Sync Success: My Matches cache updated.");
    });
}

function updateDashboardUI(d) {
    const nameEl = document.getElementById("usernameDisplay");
    const walletEl = document.getElementById("walletAmount");
    const picEl = document.getElementById("profilePic");
    if(nameEl) nameEl.innerText = d.gameName || d.username || "Gamer";
    if(picEl && d.profilePic) picEl.src = d.profilePic;
    if(walletEl) {
        let deposit = parseInt(d.wallet?.deposit) || 0;
        let winnings = parseInt(d.wallet?.winnings) || 0;
        walletEl.innerText = "₹" + (deposit + winnings);
    }
}

function filterMatches(element, category) {
    currentCategory = category;
    if(element) {
        document.querySelectorAll('.category').forEach(el => el.classList.remove('active'));
        element.classList.add('active');
    }
    const cached = localStorage.getItem("cache_" + category);
    if (cached) { renderMatches(JSON.parse(cached)); }
    loadMatches(category);
}

function loadMatches(category) {
    db.ref('matches').orderByChild('category').equalTo(category).on('value', (snapshot) => {
        if (category !== currentCategory) return;
        const matchesArray = [];
        if (snapshot.exists()) {
            snapshot.forEach((child) => {
                const matchData = { id: child.key, ...child.val() };
                matchesArray.push(matchData);
                localStorage.setItem(`match_${child.key}`, JSON.stringify(matchData));
            });
        }
        localStorage.setItem("cache_" + category, JSON.stringify(matchesArray));
        renderMatches(matchesArray);
        const loader = document.getElementById("loader");
        if(loader) loader.style.display = "none";
    });
}

function renderMatches(matches) {
    const container = document.getElementById('matchContainer');
    if(!container) return;
    container.innerHTML = ''; 
    const currentUid = auth.currentUser ? auth.currentUser.uid : (localStorage.getItem("last_logged_uid") || "");

    if (!matches || matches.length === 0) {
        container.innerHTML = `<div style="text-align:center; width:100%; margin-top:50px; color:#888;">No Matches Available</div>`;
        return;
    }

    const now = new Date().getTime();
    const upcomingCache = JSON.parse(localStorage.getItem("my_matches_cache_upcoming") || "[]");
    const joinedMatchIds = upcomingCache.map(m => String(m.id));

    matches.forEach((match, index) => {
        const matchTime = new Date(match.time).getTime();
        if (matchTime <= now) return; 

        const mDate = new Date(match.time);
        const formattedTime = mDate.toLocaleString('en-IN', { 
            day: '2-digit', month: 'short', hour: 'numeric', minute: '2-digit', hour12: true 
        }).toUpperCase().replace(',', '');

        const participants = match.participants || {};
        const isJoined = (currentUid && participants[currentUid]) || joinedMatchIds.includes(String(match.id));
        const joinedCount = Object.keys(participants).length;
       const maxSlots = Number(match.maxSlots) || Number(match.max) || 48;

        // Ivide 'animate-card' class-um animation-delay-um add cheythittund
        container.innerHTML += `
        <div id="card-${match.id}" class="match-card animate-card" onclick="joinMatch('${match.id}', '${match.entry}')" 
             style="animation-delay: ${index * 0.1}s; background:white; border-radius:12px; padding:15px; margin:15px; box-shadow:0 4px 15px rgba(0,0,0,0.08); border-top:4px solid #ff5722; display:flex; flex-direction:column; overflow:hidden;">
            <div style="display:flex; justify-content:space-between; align-items:flex-start;">
                <div style="flex:1;">
                    <div style="display:flex; gap:6px; margin-bottom:10px;">
                        <span style="border:1px solid #ccc; padding:2px 8px; border-radius:6px; font-size:10px; font-weight:bold;">${match.teamType}</span>
                        <span style="border:1px solid #ccc; padding:2px 8px; border-radius:6px; font-size:10px; font-weight:bold;">${match.map}</span>
                    </div>
                    <div style="font-size:14px; font-weight:700;">FREE FIRE - ${match.category}</div>
                    <div style="font-size:16px; font-weight:bold; color:#28a745; margin-top:40px;">Prize Pool - ₹${match.totalPrize || 0}</div>
                </div>
                <div style="text-align:center;">
                   <img src="${match.image || match.thumbnail || 'https://via.placeholder.com/120'}" style="width:120px; height:120px; border-radius:12px; object-fit:cover;">
                    <div style="font-size:11px; font-weight:900; margin-top:5px; color:#333;">${formattedTime}</div>
                </div>
            </div>
            <div style="width:60%; height:6px; background:#eee; border-radius:10px; margin-top:15px; overflow:hidden;">
                <div style="width:${(joinedCount/maxSlots)*100}%; height:100%; background:#28a745;"></div>
            </div>
            <div style="display:flex; align-items:flex-end; justify-content:space-between; margin-top:auto;">
                <div style="font-size:11px; font-weight:bold; color:#ff5722;">${maxSlots - joinedCount} spots left</div>
                <div style="background-color:${isJoined ? '#6c757d' : '#28a745'}; color:white; padding:12px 10px; width:150px; font-weight:900; text-align:center; clip-path:polygon(15% 0%, 100% 0%, 100% 100%, 0% 100%); margin-right:-15px; margin-bottom:-15px;">
                    ${isJoined ? 'JOINED' : 'ENTRY ₹' + match.entry}
                </div>
            </div>
        </div>`;
    });
}

// 🔥 FAKE JOIN FIX: Status temporary memory-il veykunnu
function joinMatch(id, fee) { 
    sessionStorage.setItem("pending_join_id", id); 
    window.location.href = `card.html?id=${id}&fee=${fee}`; 
}
// Dashboard-ന്റെ ഏറ്റവും താഴെ ഇത് പേസ്റ്റ് ചെയ്യുക
setTimeout(() => {
    const hint = document.getElementById('taskHint');
    if (hint) {
        hint.style.display = 'block';
        
        // ഇത് ബോക്സിനെ ഒന്ന് തുള്ളി കളിക്കാൻ സഹായിക്കും (Animation)
        hint.animate([
            { transform: 'translateY(0px)' },
            { transform: 'translateY(-5px)' },
            { transform: 'translateY(0px)' }
        ], {
            duration: 1500,
            iterations: Infinity
        });
    }
}, 7000); // 7000 എന്നത് 7 സെക്കന്റ് ആണ് (Splash screen കഴിഞ്ഞു വരാൻ)

