document.querySelector('.join-btn').addEventListener('click', function() {
    let playerName = prompt("Enter your In-Game Name (IGN):");
    
    if (playerName) {
        alert("Welcome " + playerName + "! Registration for Kerala Esports will open soon.");
    } else {
        alert("Please enter a valid name to continue.");
    }
});

document.querySelector('.rank-btn').addEventListener('click', function() {
    alert("Leaderboard is being updated. Check back later!");
});
