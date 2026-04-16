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

let currentTab = 'upcoming';

// 1. 🚀 BOOT ENGINE - Time check logic fixed to prevent auto-move
(function bootEngine() {
    const cachedMatches = localStorage.getItem("my_matches_cache_" + currentTab);
    if(cachedMatches) {
        const matches = JSON.parse(cachedMatches);
        const currentTime = new Date().getTime();
        const filtered = matches.filter(match => {
            const matchTime = new Date(match.time).getTime();
            
            let status = "upcoming";
            if (match.status === "completed" || match.isEnded === true) {
                status = "completed";
            } else if (currentTime >= matchTime) {
                status = "ongoing";
            }
            
            return status === currentTab;
        });
        
        renderMatches(filtered);
        hideLoader();
    }
})();

// 2. 🔐 AUTH CHECK
auth.onAuthStateChanged(user => {
    if (user) { loadUserMatches(); } 
    else { window.location.href = "login.html"; }
});

// 3. 📑 TAB SWITCHER
function switchTab(element, type) {
    document.querySelectorAll('.tab').forEach(tab => tab.classList.remove('active'));
    element.classList.add('active');
    currentTab = type;
    
    const cached = localStorage.getItem("my_matches_cache_" + type);
    if(cached) {
        renderMatches(JSON.parse(cached));
    } else {
        renderMatches([]);
    }
    loadUserMatches();
}

// 4. 🕹️ DATA FETCH & SYNC - Removed matchEndTime to stop auto-complete
async function loadUserMatches() {
    const user = auth.currentUser;
    if(!user) return;

    db.ref('matches').on('value', (mSnap) => {
        let allMyMatches = { upcoming: [], ongoing: [], completed: [] };
        const currentTime = new Date().getTime();

        if (mSnap.exists()) {
            mSnap.forEach(matchChild => {
                const data = matchChild.val();
                if(data.participants && data.participants[user.uid]) {
                    const matchTime = new Date(data.time).getTime();
                    
                    let status = "upcoming";
                    // Only moves to completed if Admin sets it
                    if (data.status === "completed" || data.isEnded === true) {
                        status = "completed";
                    } else if (currentTime >= matchTime) {
                        status = "ongoing";
                    }

                    allMyMatches[status].push({ id: matchChild.key, ...data, statusType: status });
                }
            });
        }

        Object.keys(allMyMatches).forEach(key => {
            localStorage.setItem("my_matches_cache_" + key, JSON.stringify(allMyMatches[key]));
        });
        
        renderMatches(allMyMatches[currentTab]);
        hideLoader();
    });
}

function renderMatches(matches) {
    const container = document.getElementById('matchContent');
    if(!container) return;
    
    container.innerHTML = ''; 
    const currentTime = new Date().getTime();

    const finalDisplayList = matches.filter(match => {
        const matchTime = new Date(match.time).getTime();
        let calculatedStatus = "upcoming";
        
        if (match.status === "completed" || match.isEnded === true) {
            calculatedStatus = "completed";
        } else if (currentTime >= matchTime) {
            calculatedStatus = "ongoing";
        }
        return calculatedStatus === currentTab;
    });

    if(finalDisplayList.length === 0) {
        container.innerHTML = `<div id="emptyMsg" style="text-align:center; padding:50px; color:#999; font-weight:700;">NO MATCHES FOUND</div>`;
        return;
    }

    finalDisplayList.forEach(match => {
        const joinedCount = Object.keys(match.participants || {}).length;
        const maxSlots = Number(match.max) || 48;
        const mDate = new Date(match.time);
        const formattedTime = mDate.toLocaleString('en-IN', { 
            day: '2-digit', month: 'short', hour: 'numeric', minute: '2-digit', hour12: true 
        }).toUpperCase().replace(',', '');

        let btnText = "JOINED";
        let btnColor = "#6c757d"; 

        if(currentTab === 'ongoing') { btnText = "LIVE NOW"; btnColor = "#ff5722"; }
        else if(currentTab === 'completed') { btnText = "VIEW RESULT"; btnColor = "#111"; }

        container.innerHTML += `
        <div class="match-card" onclick="location.href='card.html?id=${match.id}${currentTab === 'completed' ? '&status=completed' : ''}'" 
             style="background:#fff; border-radius:12px; padding:15px; margin:5px; box-shadow:0 4px 15px rgba(0,0,0,0.08); border-top:4.5px solid #ff5722; position:relative; overflow:hidden; display:flex; flex-direction:column;">
            
            <div style="display:flex; justify-content:space-between; align-items:flex-start;">
                <div style="flex:1;">
                    <div style="display:flex; gap:6px; margin-bottom:10px;">
                        <span style="border:1px solid #ccc; padding:2px 10px; border-radius:6px; font-size:10px; font-weight:900; color:#555;">${match.teamType || 'SOLO'}</span>
                        <span style="border:1px solid #ccc; padding:2px 10px; border-radius:6px; font-size:10px; font-weight:900; color:#555;">${match.map || 'BERMUDA'}</span>
                    </div>
                    <div style="font-size:14px; font-weight:800; color:#111;">FREE FIRE - ${match.category}</div>
                    <div style="font-size:16px; font-weight:900; color:#28a745; margin-top:40px;">Prize Pool - ₹${match.totalPrize || 0}</div>
                </div>
                
                <div style="text-align:center;">
                    <img src="${match.thumbnail || 'img/default.png'}" style="width:120px; height:120px; border-radius:12px; object-fit:cover; border: 1px solid #f0f0f0;">
                    <div style="font-size:11px; font-weight:900; margin-top:5px; color:#333;">${formattedTime}</div>
                </div>
            </div>

            <div style="width:60%; height:6px; background:#f0f0f0; border-radius:10px; margin-top:15px; overflow:hidden;">
                <div style="width:${(joinedCount/maxSlots)*100}%; height:100%; background:#28a745;"></div>
            </div>

            <div style="display:flex; align-items:flex-end; justify-content:space-between; margin-top:auto;">
                <div style="font-size:11px; font-weight:900; color:#ff5722;">${maxSlots - joinedCount} spots left</div>
                
                <div style="background-color:${btnColor}; color:white; padding:15px 10px; width:155px; font-weight:900; text-align:center; clip-path:polygon(15% 0%, 100% 0%, 100% 100%, 0% 100%); margin-right:-16px; margin-bottom:-16px; font-size:13px; letter-spacing:0.5px;">
                    ${btnText}
                </div>
            </div>
        </div>`;
    });
}

function hideLoader() {
    const loader = document.getElementById("loader");
    if(loader) loader.style.display = "none";
}

// --- 📱 SWIPE ANIMATION ENGINE ---
let touchstartX = 0;
let touchendX = 0;
const gestureZone = document.getElementById('matchContent');

gestureZone.addEventListener('touchstart', (e) => { touchstartX = e.changedTouches[0].screenX; }, false);
gestureZone.addEventListener('touchend', (e) => { touchendX = e.changedTouches[0].screenX; handleGesture(); }, false);

function handleGesture() {
    const tabs = ['upcoming', 'ongoing', 'completed'];
    let currentIndex = tabs.indexOf(currentTab);
    const container = document.getElementById('matchContent');

    if (touchendX < touchstartX - 80) {
        if (currentIndex < tabs.length - 1) {
            container.style.opacity = "0";
            setTimeout(() => {
                switchTab(document.querySelectorAll('.tab')[currentIndex + 1], tabs[currentIndex + 1]);
                container.style.opacity = "1";
            }, 200);
        }
    }

    if (touchendX > touchstartX + 80) {
        if (currentIndex > 0) {
            container.style.opacity = "0";
            setTimeout(() => {
                switchTab(document.querySelectorAll('.tab')[currentIndex - 1], tabs[currentIndex - 1]);
                container.style.opacity = "1";
            }, 200);
        }
    }
}
