const firebaseConfig = {
    apiKey: "AIzaSyBrHcONT6y0he3fzrtRGqdQMZfIMpGxcNo",
    authDomain: "kl-esports.firebaseapp.com",
    databaseURL: "https://kl-esports-default-rtdb.firebaseio.com",
    projectId: "kl-esports",
    storageBucket: "kl-esports.appspot.com",
    messagingSenderId: "440301376580",
    appId: "1:440301376580:web:fb0b8ae0df3fe096bd1811"
};

firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.database();

let currentCategory = "BR PER KILL";
let allMatches = [];
let userGameDetails = { name: "", id: "" }; 

auth.onAuthStateChanged(user => {
    if(user){
        db.ref("users/" + user.uid).on('value', snapshot => {
            const userData = snapshot.val();
            if(userData) {
                userGameDetails.name = userData.gameName || "";
                userGameDetails.id = userData.gameID || "";
                document.getElementById("usernameDisplay").innerText = userData.username || "Gamer";
                
                let total = 0;
                if(userData.wallet && typeof userData.wallet === 'object') {
                    total = (parseInt(userData.wallet.deposit) || 0) + (parseInt(userData.wallet.winnings) || 0);
                } else { total = parseInt(userData.wallet || 0); }
                document.getElementById("walletAmount").innerText = "₹" + total;
                document.getElementById("profilePic").src = userData.profilePic || "https://cdn-icons-png.flaticon.com/512/149/149071.png";
                
                if(userData.bonusClaimed !== true) {
                    document.getElementById('rewardPopup').style.display = 'flex';
                }
            }
            // 5 SECOND LOCK LOGIC
            setTimeout(() => {
                document.getElementById("loader").style.display = "none";
            }, 5000); 
        });

        db.ref('matches').limitToLast(25).on('value', snapshot => {
            allMatches = [];
            snapshot.forEach(child => {
                let d = child.val(); d.key = child.key;
                allMatches.push(d);
            });
            allMatches.sort((a, b) => new Date(a.time) - new Date(b.time));
            renderMatches();
        });

    } else { window.location.href = "login.html"; }
});

function renderMatches() {
    const container = document.getElementById('matchContainer');
    const user = auth.currentUser;
    const now = new Date().getTime();
    let htmlContent = "";

    // Data load aayi thudangumbol skeleton automatic aayi replace aakum
    allMatches.forEach(data => {
        if(data.category === currentCategory) {
            if(new Date(data.time).getTime() <= now) return;
            if(data.participants && user && data.participants[user.uid]) return;

            const joined = parseInt(data.joined) || 0;
            const max = parseInt(data.max) || 48;
            const progress = (joined / max) * 100;

            htmlContent += `
                <div class="match-card" onclick="location.href='card.html?id=${data.key}'">
                    <div style="display:flex; gap:6px; margin-bottom:12px;">
                        <span class="tag" style="font-size:9px; padding:3px 10px; background:#f9f9f9; border:1px solid #eee; border-radius:6px; color:#888; font-weight:700;">${data.teamType}</span>
                        <span class="tag" style="font-size:9px; padding:3px 10px; background:#f9f9f9; border:1px solid #eee; border-radius:6px; color:#888; font-weight:700;">${data.map || 'BERMUDA'}</span>
                    </div>
                    <div style="display:flex; justify-content:space-between;">
                        <div>
                            <div class="m-title">FREE FIRE - ${data.category}</div>
                            <div class="prize-txt">Prize Pool - ₹${data.prize}</div>
                        </div>
                        <img src="${data.thumbnail}" class="match-thumb">
                    </div>
                    <div class="bar-bg"><div class="bar-fill" style="width:${progress}%"></div></div>
                    <button class="join-btn-dashboard">₹${data.entry} JOIN</button>
                </div>`;
        }
    });
    container.innerHTML = htmlContent || "<div style='text-align:center; padding:50px; color:#ccc;'>No matches found.</div>";
}

function filterMatches(element, category) {
    document.querySelectorAll('.category').forEach(c => c.classList.remove('active'));
    element.classList.add('active');
    currentCategory = category;
    renderMatches();
}

function claimReward() {
    const user = auth.currentUser;
    if(!user) return;
    db.ref('users/' + user.uid + '/bonusClaimed').set(true);
    document.getElementById('rewardPopup').style.display = 'none';
}
