// connect js to firebase 
var firebaseConfig = {
    apiKey: "AIzaSyBOmTJ_t3dHHJglJ-yo-_3LhcJJhPOJisg",
    authDomain: "arcadegame-32c60.firebaseapp.com",
    databaseURL: "https://arcadegame-32c60.firebaseio.com",
    projectId: "arcadegame-32c60",
    storageBucket: "arcadegame-32c60.appspot.com",
    messagingSenderId: "300161989090",
    appId: "1:300161989090:web:2c9d796ba9d3b964aea1bb"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);


let firstPlace = new Array();
let secondPlace = new Array();
let thirdPlace = new Array();
let scores; // will take the number of survived and death of the three places and put it in one array | to 

let playersData = new Array();
function retrievePlayersData(startFrame, waitImg) {
    let oldSurvived = -1, oldDeath = -1, index = 0;
    let oldSurvived2 = -1, oldDeath2 = -1; //for secondPlace
    let oldSurvived3 = -1, oldDeath3 = -1; //for thirdPlace
    var ref = firebase.database().ref("players");
    
    ref.once("value").then(function (snapshot) { //snapshot = "players"
        snapshot.forEach(function (childSnapshot) { //childSnapshot = ID
            const username = childSnapshot.child("username").val();
            const death = parseInt(childSnapshot.child("death").val());
            const survived = parseInt(childSnapshot.child("survived").val());
            
            playersData.push(username);
            playersData.push(death);
            playersData.push(survived);
            
            /* 
             * This code below will collect all the winner of the three places
             * in the three arrays firstPlace, secondPlace, and thirdPlac.
             * to determind the winners they must have maximum survived with minimume death
            */
            if (survived > oldSurvived) {
                oldSurvived3 = oldSurvived2;
                oldSurvived2 = oldSurvived;
                oldSurvived = survived;

                oldDeath3 = oldDeath2;
                oldDeath2 = oldDeath;
                oldDeath = death;

                thirdPlace = [];
                thirdPlace = [...secondPlace];
                secondPlace = [];
                secondPlace = [...firstPlace];
                firstPlace = [];
                firstPlace.push(index);
            } else if (survived == oldSurvived && death < oldDeath){
                oldSurvived3 = oldSurvived2;
                oldSurvived2 = oldSurvived;
                oldSurvived = survived;

                oldDeath3 = oldDeath2;
                oldDeath2 = oldDeath;
                oldDeath = death;

                thirdPlace = [];
                thirdPlace = [...secondPlace];
                secondPlace = [];
                secondPlace = [...firstPlace];
                firstPlace = [];
                firstPlace.push(index);
            } else if (survived == oldSurvived && death == oldDeath){
                firstPlace.push(index);
            } else {
                if (survived > oldSurvived2){
                    oldSurvived3 = oldSurvived2;
                    oldSurvived2 = survived;

                    oldDeath3 = oldDeath2;
                    oldDeath2 = death;

                    thirdPlace = [];
                    thirdPlace = [...secondPlace];
                    secondPlace = [];
                    secondPlace.push(index);
                } else if (survived == oldSurvived2 && death < oldDeath2) {
                    oldSurvived3 = oldSurvived2;
                    oldSurvived2 = survived;

                    oldDeath3 = oldDeath2;
                    oldDeath2 = death;

                    thirdPlace = [];
                    thirdPlace = [...secondPlace];
                    secondPlace = [];
                    secondPlace.push(index);
                } else if (survived == oldSurvived2 && death == oldDeath2) {
                    secondPlace.push(index);
                } else {
                    if (survived > oldSurvived3) {
                        oldSurvived3 = survived;
                        oldDeath3 = death;
                        thirdPlace = [];
                        thirdPlace.push(index);
                    } else if (survived == oldSurvived3 && death < oldDeath3) {
                        oldSurvived3 = survived;
                        oldDeath3 = death;
                        thirdPlace = [];
                        thirdPlace.push(index);
                    } else if (survived == oldSurvived3 && death == oldDeath3) {
                        thirdPlace.push(index);
                    }
                }
            }
            index++;
        }); 
        // creatPlayerListOnHtml();
        setTimeout(function(){
            waitImg.style.display = "none";
            startFrame();
        }, 1000);
    });
    
     
}

function writePlayerData() {
    const dateObj = new Date();
    const userId = firebase.database().ref().push().key;
    firebase.database().ref('players/' + userId).set({
        username: player.name,
        death: playerInfoBar.dead,
        survived: playerInfoBar.win,
        date: `${dateObj.getDate()}/${dateObj.getMonth() + 1}/${dateObj.getFullYear()}`,
        time: `${dateObj.getHours()}:${dateObj.getMinutes()}`
    });
}

function creatPlayerListOnHtml() {
    if (playersData.length > 0) {
        const frag = document.createDocumentFragment();
        for (let i = 0; i < playersData.length; i++) {
            const name = playersData[i];
            const death = playersData[++i];
            const survived = playersData[++i];
            
            const li = document.createElement('li');
            const pName = document.createElement('p');
            const pWinnersImg = document.createElement('p');
            const pDeathImg = document.createElement('p');
            const DeathImg = document.createElement('img');
            const pDeath = document.createElement('p');
            const pSurvivedImg = document.createElement('p');
            const SurvivedImg = document.createElement('img');
            const pSurvived = document.createElement('p');
            li.className = 'player';
            pName.innerHTML = name;
            pDeath.innerHTML = death;
            pSurvived.innerHTML = survived;
            DeathImg.src = "images/death.png";
            DeathImg.width = "25";
            DeathImg.height = "25";
            SurvivedImg.src = "images/survived.png";
            SurvivedImg.width = "25";
            SurvivedImg.height = "25";
            pDeathImg.appendChild(DeathImg);
            pSurvivedImg.appendChild(SurvivedImg);
            if (firstPlace.includes(parseInt(i / 3))){
                const WinnersImg = document.createElement('img');
                WinnersImg.src = "images/no1.png";
                WinnersImg.width = "33";
                WinnersImg.height = "33";
                pWinnersImg.appendChild(WinnersImg);
            } else if (secondPlace.includes(parseInt(i / 3))) {
                const WinnersImg = document.createElement('img');
                WinnersImg.src = "images/no2.png";
                WinnersImg.width = "33";
                WinnersImg.height = "33";
                pWinnersImg.appendChild(WinnersImg);
            } else if (thirdPlace.includes(parseInt(i / 3))) {
                const WinnersImg = document.createElement('img');
                WinnersImg.src = "images/no3.png";
                WinnersImg.width = "33";
                WinnersImg.height = "33";
                pWinnersImg.appendChild(WinnersImg);
            }
            li.appendChild(pName);
            li.appendChild(pWinnersImg);
            li.appendChild(pSurvivedImg);
            li.appendChild(pSurvived);
            li.appendChild(pDeathImg);
            li.appendChild(pDeath);
            frag.appendChild(li);
        }
        document.querySelector(".playersList").appendChild(frag);
    }
}

function addPlayerToPlayersDataArr(){
    const death = playerInfoBar.dead;
    const survived = playerInfoBar.win;
    let oldSurvived = -1, oldDeath = -1, oldSurvived2 = -1, oldDeath2 = -1, oldSurvived3 = -1, oldDeath3 = -1;

    if (playersData.length > 0){
        oldSurvived = playersData[(firstPlace[0] * 3) + 2];
        oldDeath = playersData[(firstPlace[0] * 3) + 1];

        if (secondPlace.length > 0){
            oldSurvived2 = playersData[(secondPlace[0] * 3) + 2];
            oldDeath2 = playersData[(secondPlace[0] * 3) + 1];
        }
        if (thirdPlace.length > 0) {
            oldSurvived3 = playersData[(thirdPlace[0] * 3) + 2];
            oldDeath3 = playersData[(thirdPlace[0] * 3) + 1];
        }
        playersData.push(player.name);
        playersData.push(death);
        playersData.push(survived);

        if (survived > oldSurvived) {
            thirdPlace = [];
            thirdPlace = [...secondPlace];
            secondPlace = [];
            secondPlace = [...firstPlace];
            firstPlace = [];
            firstPlace.push(playersData.length / 3 - 1);
        } else if (survived == oldSurvived && death < oldDeath) {
            thirdPlace = [];
            thirdPlace = [...secondPlace];
            secondPlace = [];
            secondPlace = [...firstPlace];
            firstPlace = [];
            firstPlace.push(playersData.length / 3 - 1);
        } else if (survived == oldSurvived && death == oldDeath) {
            firstPlace.push(playersData.length / 3 - 1);
        } else {
            if (survived > oldSurvived2) {
                thirdPlace = [];
                thirdPlace = [...secondPlace];
                secondPlace = [];
                secondPlace.push(playersData.length / 3 - 1);
            } else if (survived == oldSurvived2 && death < oldDeath2) {
                thirdPlace = [];
                thirdPlace = [...secondPlace];
                secondPlace = [];
                secondPlace.push(playersData.length / 3 - 1);
            } else if (survived == oldSurvived2 && death == oldDeath2) {
                secondPlace.push(playersData.length / 3 - 1);
            } else {
                if (survived > oldSurvived3) {
                    thirdPlace = [];
                    thirdPlace.push(playersData.length / 3 - 1);
                } else if (survived == oldSurvived3 && death < oldDeath3) {
                    thirdPlace = [];
                    thirdPlace.push(playersData.length / 3 - 1);
                } else if (survived == oldSurvived3 && death == oldDeath3) {
                    thirdPlace.push(playersData.length / 3 - 1);
                }
            }
        }
    }else {
        playersData.push(player.name);
        playersData.push(death);
        playersData.push(survived);
        
        firstPlace.push(playersData.length / 3 - 1);
    }
    
    creatPlayerListOnHtml();
}