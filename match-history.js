// 1. FIREBASE CONFIG
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

// 2. THEME CONTROLLER
function toggleTheme() {
    const isDark = document.body.classList.toggle("dark-theme");
    document.body.classList.toggle("light-theme", !isDark);
    document.getElementById("theme-icon").className = isDark ? "fa-solid fa-sun" : "fa-solid fa-moon";
    localStorage.setItem("theme", isDark ? "dark" : "light");
}

window.onload = () => {
    if (localStorage.getItem("theme") === "dark") {
        document.body.classList.replace("light-theme", "dark-theme");
        document.getElementById("theme-icon").className = "fa-solid fa-sun";
    }
};

// 3. AUTH CHECK
auth.onAuthStateChanged(user => {
    if (user) { loadMatchHistory(user.uid); } 
    else { window.location.href = "index.html"; }
});

// 4. LOAD HISTORY
function loadMatchHistory(uid) {
    const listContainer = document.getElementById("match-list");
    db.ref("user_history").child(uid).on('value', snapshot => {
        listContainer.innerHTML = "";
        if (!snapshot.exists()) {
            listContainer.innerHTML = "<div class='loading-state'>No history found.</div>";
            return;
        }
        let historyArray = [];
        snapshot.forEach(child => historyArray.push({ id: child.key, ...child.val() }));
        historyArray.reverse().forEach(data => renderMatchCard(data, listContainer));
    });
}
// --- UPDATED RENDER FUNCTION ---
function renderMatchCard(data, container) {
    db.ref("matches").child(data.matchId).once('value', snap => {
        const info = snap.val() || {};
        const status = info.status || "Upcoming";
        
        // Nalla labels kittan info.category upayogikkunnu
        // Eg: BR PER KILL, CS HEADSHOT
        const matchLabel = info.category || data.matchTitle || "TOURNAMENT";
        
        let statusCol = status === "Ongoing" ? "#ff5722" : (status === "Completed" ? "#888" : "#28a745");
        
        const card = `
        <div class="match-card" onclick="${status === 'Completed' ? `window.location.href='card.html?id=${data.matchId}&status=completed'` : `window.location.href='card.html?id=${data.matchId}'`}" 
             style="cursor: pointer; border-left: 5px solid ${statusCol};">
            <div style="display:flex; justify-content:space-between; align-items:center;">
                <div style="flex: 1;">
                    <div style="display:flex; align-items:center; gap:8px; margin-bottom: 5px;">
                        <span style="font-weight:900; font-size:13px; color:#111; text-transform:uppercase; letter-spacing:0.5px;">
                            ${matchLabel}
                        </span>
                        <span style="font-size:8px; background:${statusCol}; color:white; padding:2px 6px; border-radius:4px; font-weight:900; text-transform: uppercase;">
                            ${status}
                        </span>
                    </div>
                    
                    <div style="display: flex; flex-direction: column; gap: 2px;">
                        <span style="font-size: 10px; font-weight: 700; color: #777;">MATCH ID: #${data.matchId}</span>
                        <span style="font-size: 10px; font-weight: 700; color: #999;">
                            <i class="fa-regular fa-clock"></i> ${data.date}
                        </span>
                    </div>
                </div>
                
                <div style="display:flex; gap:18px; text-align:right;">
                    <div>
                        <div style="font-size:9px; color:#888; font-weight: 800;">ENTRY</div>
                        <div style="font-weight:900; font-size:14px; color:#333;">₹${data.entryFee || 0}</div>
                    </div>
                    <div>
                        <div style="font-size:9px; color:#888; font-weight: 800;">WON</div>
                        <div style="font-weight:900; font-size:14px; color:#28a745;">₹${data.wonAmount || 0}</div>
                    </div>
                </div>
            </div>
        </div>`;
        
        container.insertAdjacentHTML('beforeend', card);
    });
}

