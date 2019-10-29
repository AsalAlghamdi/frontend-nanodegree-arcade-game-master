/* Engine.js
 * This file provides the game loop functionality (update entities and render),
 * draws the initial game board on the screen, and then calls the update and
 * render methods on your player and enemy objects (defined in your app.js).
 *
 * A game engine works by drawing the entire game screen over and over, kind of
 * like a flipbook you may have created as a kid. When your player moves across
 * the screen, it may look like just that image/character is moving or being
 * drawn but that is not the case. What's really happening is the entire "scene"
 * is being drawn over and over, presenting the illusion of animation.
 *
 * This engine makes the canvas' context (ctx) object globally available to make
 * writing app.js a little simpler to work with.
 */

var Engine = (function(global) {
    /* Predefine the variables we'll be using within this scope,
     * create the canvas element, grab the 2D context for that canvas
     * set the canvas element's height/width and add it to the DOM.
     */
    var doc = global.document,
        win = global.window,
        canvas = doc.createElement('canvas'),
        ctx = canvas.getContext('2d'),
        lastTime;

    canvas.width = 505;
    canvas.height = 606;
    document.querySelector('.cnvs').appendChild(canvas);

    let requestAnimationID;
    let cancelAnimation = false;
    let timeEnd = false;
    let startTimerBool = true;

    function startTimer(bool) {
        if (bool){
            let min = 1;
            let sec = 30;
            const intervalId = setInterval(function () {
                if (min == 0 && sec == 0) {
                    clearInterval(intervalId);
                    timeEnd = true;
                } else {
                    if (sec == 0) {
                        min--;
                        sec = 59;
                    }
                    sec--;
                    playerInfoBar.timer = `${min}:${sec}`;
                }
            }, 1000);
        }
    }
    /* This function serves as the kickoff point for the game loop itself
     * and handles properly calling the update and render methods.
     */
    function main() {
        startTimer(startTimerBool);
        if (startTimerBool) {
            lastTime = Date.now();
        }
        startTimerBool = false;
        /* Get our time delta information which is required if your game
         * requires smooth animation. Because everyone's computer processes
         * instructions at different speeds we need a constant value that
         * would be the same for everyone (regardless of how fast their
         * computer is) - hurray time!
         */
        var now = Date.now(),
            dt = (now - lastTime) / 1000.0;

        /* Call our update/render functions, pass along the time delta to
         * our update function since it may be used for smooth animation.
         */
        update(dt);
        render();

        /* Set our lastTime variable which is used to determine the time delta
         * for the next time this function is called.
         */
        lastTime = now;

        /* Use the browser's requestAnimationFrame function to call this
         * function again as soon as the browser is able to draw another frame.
         */
        if (!timeEnd) {
            requestAnimationID = win.requestAnimationFrame(main);
            if (cancelAnimation) {
                win.cancelAnimationFrame(requestAnimationID);
            }
        }else {
            endGameFrame();
        }
    }

    /* This function does some initial setup that should only occur once,
     * particularly setting the lastTime variable that is required for the
     * game loop.
     */
    function init() {
        const waitImg = loadingFrame();
        retrievePlayersData(startFrame, waitImg);
        //reset();
        // endGameFrame();//startFrame();
        // lastTime = Date.now();
        //main();
    }

    /* This function is called by main (our game loop) and itself calls all
     * of the functions which may need to update entity's data. Based on how
     * you implement your collision detection (when two entities occupy the
     * same space, for instance when your character should die), you may find
     * the need to add an additional function call here. For now, we've left
     * it commented out - you may or may not want to implement this
     * functionality this way (you could just implement collision detection
     * on the entities themselves within your app.js file).
     */
    function update(dt) {
        updateEntities(dt);
        if (player.y <= 50) {
            playerInfoBar.win++;
            player.changeCharacter();
            player.x = 220;
            player.y = 450;
        } else {
            for (let enemy = 0; enemy < allEnemies.length; enemy++) {
                let collisionOccurred = checkCollisions(player.x, player.y, player.width, player.height, allEnemies[enemy].x, allEnemies[enemy].y, allEnemies[enemy].width, allEnemies[enemy].height);
                if (collisionOccurred) {
                    cancelAnimation = true;
                    player.die(true);
                    setTimeout(function () {
                        cancelAnimation = false;
                        win.requestAnimationFrame(main);
                        player.x = 220;
                        player.y = 450;
                        player.die(false);
                        player.changeCharacter();
                        playerInfoBar.dead++;
                        //win.cancelAnimationFrame(main);
                    }, 400);
                    break;
                }
            }

        }
        
    }
    
    // I think to assign it to proto in enemy object
    // playerW, playerH, enemyW, and enemyH is Object character width and height
    function checkCollisions(playerX, playerY, playerW, playerH, enemyX, enemyY, enemyW, enemyH) {
        /* for (let i = playerX; i <= playerX + playerW; i++) {
            if (i >= enemyX && i <= enemyX + enemyW) { // to make better performance and just check the collision between border of the objects
                for (let j = playerY; j <= playerY + playerH; j++) {
                    if (j >= enemyY && j <= enemyY + enemyH) {
                        return true;
                    }
                }
                break;
            }
        }
        return false; */

        // Minimize the edges of the objects
        const minNum = 5;
        // Player Corner Points
        const pointA = [playerX + minNum, playerY + minNum];
        const pointB = [playerX + playerW - minNum, playerY + minNum];
        const pointC = [playerX + minNum, playerY + playerH - minNum];
        const pointD = [playerX + playerW - minNum, playerY - minNum + playerH];

        // Enemy Corner Points
        const pointE = [enemyX + minNum, enemyY + minNum];
        const pointF = [enemyX + enemyW - minNum, enemyY + minNum];
        const pointG = [enemyX + minNum, enemyY + enemyH - minNum];
        const pointH = [enemyX - minNum + enemyW, enemyY - minNum + enemyH];

        /* ctx.fillStyle = 'green';
        ctx.fillRect(enemyX, enemyY, 98, 67);
        ctx.fillStyle = 'red';
        ctx.fillRect(playerX + minNum, playerY, 98 - minNum, 67 - minNum); 
        */
        /*
        * check each point if its position (x,y) found in the other object.
        * CASE #1
        * if A(x) is between E(x)-F(x) AND A(y) between E(y)-G(y)
 
        E__________F
        |          |
        |    (A)___|____B
        |     |    |    |
        |_____|____|    |
        G     |    H    |
              |_________|
              C         D
        */
        if ((pointE[0] <= pointA[0] && pointF[0] >= pointA[0]) && (pointE[1] <= pointA[1] && pointG[1] >= pointA[1])) {
            return true;
        }
        /* 
        * CASE #2
        * if B(x) is between E(x)-F(x) AND B(y) between E(y)-G(y)

             E__________F
             |          |
        A____|____(B)   |
        |    |     |    |
        |    |_____|____|
        |    G     |    H
        |_____ ____|    
        C          D    
        */
        if ((pointE[0] <= pointB[0] && pointF[0] >= pointB[0]) && (pointE[1] <= pointB[1] && pointG[1] >= pointB[1])) {
            return true;
        }
        /* 
        * CASE #3
        * if C(x) is between E(x)-F(x) AND C(y) between E(y)-G(y)

             A__________B
             |          |
        E____|_____F    |
        |    |     |    |
        |    |_____|____|
        |   (C)    |    D
        |_____ ____|    
        G          H    
        
        */
        if ((pointE[0] <= pointC[0] && pointF[0] >= pointC[0]) && (pointE[1] <= pointC[1] && pointG[1] >= pointC[1])) {
            return true;
        }
        /*
        * CASE #4
        * if D(x) is between E(x)-F(x) AND D(y) between E(y)-G(y)

        A__________B
        |          |
        |     E____|____F
        |     |    |    |
        |_____|____|    |
        C     |   (D)   |
              |_________|
              D         H
        */
        if ((pointE[0] <= pointD[0] && pointF[0] >= pointD[0]) && (pointE[1] <= pointD[1] && pointG[1] >= pointD[1])) {
            return true;
        }
        /* 
        * CASE #5
        * if E(x) is between A(x)-B(x) AND E(y) between A(y)-B(y)
        
        A__________B
        |          |
        |    (E)___|____F
        |     |    |    |
        |_____|____|    |
        C     |    D    |
              |_________|
              G         H
        
        */
        if ((pointA[0] <= pointE[0] && pointB[0] >= pointE[0]) && (pointA[1] <= pointE[1] && pointC[1] >= pointE[1])) {
            return true;
        }
        /* 
        * CASE #6
        * if F(x) is between A(x)-B(x) AND F(y) between A(y)-B(y)

             A__________B
             |          |
        E____|____(F)   |
        |    |     |    |
        |    |_____|____|
        |    C     |    D
        |_____ ____|    
        G          H    
        */
        if ((pointA[0] <= pointF[0] && pointB[0] >= pointF[0]) && (pointA[1] <= pointF[1] && pointC[1] >= pointF[1])) {
            return true;
        }
        /* 
        * CASE #7
        * if G(x) is between A(x)-B(x) AND G(y) between A(y)-B(y)

             E__________F
             |          |
        A____|_____B    |
        |    |     |    |
        |    |_____|____|
        |   (G)    |    H
        |__________|    
        C          D   
        */
        if ((pointA[0] <= pointG[0] && pointB[0] >= pointG[0]) && (pointA[1] <= pointG[1] && pointC[1] >= pointG[1])) {
            return true;
        }
        /*
        * CASE #8
        * if H(x) is between A(x)-B(x) AND H(y) between A(y)-B(y)

        E__________F
        |          |
        |     A____|____B
        |     |    |    |
        |_____|____|    |
        G     |   (H)   |
              |_________|
              C         D
        */
        if ((pointA[0] <= pointH[0] && pointB[0] >= pointH[0]) && (pointA[1] <= pointH[1] && pointC[1] >= pointH[1])) {
            return true;
        }
        return false;
    }
    /* This is called by the update function and loops through all of the
     * objects within your allEnemies array as defined in app.js and calls
     * their update() methods. It will then call the update function for your
     * player object. These update methods should focus purely on updating
     * the data/properties related to the object. Do your drawing in your
     * render methods.
     */
    function updateEntities(dt) {
        allEnemies.forEach(function(enemy) {
            enemy.update(dt);
        });
        player.update();
    }
    /* This function initially draws the "game level", it will then call
     * the renderEntities function. Remember, this function is called every
     * game tick (or loop of the game engine) because that's how games work -
     * they are flipbooks creating the illusion of animation but in reality
     * they are just drawing the entire screen over and over.
     */
    function render() {
        /* This array holds the relative URL to the image used
         * for that particular row of the game level.
         */
        var rowImages = [
                'images/water-block.png',   // Top row is water
                'images/stone-block.png',   // Row 1 of 3 of stone
                'images/stone-block.png',   // Row 2 of 3 of stone
                'images/stone-block.png',   // Row 3 of 3 of stone
                'images/grass-block.png',   // Row 1 of 2 of grass
                'images/grass-block.png'    // Row 2 of 2 of grass
            ],
            numRows = 6,
            numCols = 5,
            row, col;

        // Before drawing, clear existing canvas
        ctx.clearRect(0,0,canvas.width,canvas.height);

        /* Loop through the number of rows and columns we've defined above
         * and, using the rowImages array, draw the correct image for that
         * portion of the "grid"
         */
        for (row = 0; row < numRows; row++) {
            for (col = 0; col < numCols; col++) {
                /* The drawImage function of the canvas' context element
                 * requires 3 parameters: the image to draw, the x coordinate
                 * to start drawing and the y coordinate to start drawing.
                 * We're using our Resources helpers to refer to our images
                 * so that we get the benefits of caching these images, since
                 * we're using them over and over.
                 */
                ctx.drawImage(Resources.get(rowImages[row]), col * 101, row * 83);
            }
        }
        // player Information Bar
        ctx.drawImage(Resources.get('images/death.png'), 70, 5, 40, 40);
        ctx.font = "30px Arial";
        ctx.fillText(playerInfoBar.dead, 120, 35);

        ctx.drawImage(Resources.get('images/survived.png'), 220, 2, 40, 45);
        ctx.fillText(playerInfoBar.win, 270, 35);

        ctx.drawImage(Resources.get('images/timer.png'), 360, 5, 40, 40);
        ctx.fillText(playerInfoBar.timer, 410, 35);

        renderEntities();
    }

    /* This function is called by the render function and is called on each game
     * tick. Its purpose is to then call the render functions you have defined
     * on your enemy and player entities within app.js
     */
    function renderEntities() {
        /* Loop through all of the objects within the allEnemies array and call
         * the render function you have defined.
         */
        allEnemies.forEach(function(enemy) {
            enemy.render();
        });

        player.render();
    }

    /* This function does nothing but it could have been a good place to
     * handle game reset states - maybe a new game menu or a game over screen
     * those sorts of things. It's only called once by the init() method.
     */
    function reset() {
        // noop
    }
    function loadingFrame(){
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        canvas.style.backgroundImage = "url('images/background.jpg')";
        canvas.style.backgroundRepeat = "repeat";
        canvas.style.backgroundSize = "600px 400px";

        ctx.font = "bold 40px Comic Sans MS";
        ctx.fillStyle = "#000000";
        ctx.fillText("LOADING●●●", 130, 300); 
        const waitImg = document.createElement('img');
        waitImg.src = "https://media.giphy.com/media/3o85xscgnCWS8Xxqik/giphy.gif";
        waitImg.classList.add('waitImg');
        document.querySelector('body').appendChild(waitImg);
        return waitImg;
    }
    function startFrame(){
        //canvas.style.borderStyle = "solid";
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        canvas.style.backgroundImage = "url('images/background.jpg')";
        canvas.style.backgroundRepeat = "repeat";
        canvas.style.backgroundSize = "600px 400px";
        
        ctx.font = "bold 30px Comic Sans MS";
        ctx.fillStyle = "#000000";
        ctx.fillText("WELCOME TO ARCAD GAME", 45, 150);

        ctx.font = "bold 20px Comic Sans MS";
        ctx.fillText("Our three champions", 160, 190);

        ctx.drawImage(Resources.get('images/victory.png'), 70, 100, 370, 370);
        ctx.font = "bold 17px Comic Sans MS";

        let firstWinner = "no player yet";
        let secondWinner = "no player yet";
        let thirdWinner = "no player yet";
        if (playersData.length > 0){
            firstWinner = playersData[(firstPlace[firstPlace.length-1] * 3)];
            if (secondPlace.length > 0) {
                secondWinner = playersData[(secondPlace[secondPlace.length - 1] * 3)];
            }
            if (thirdPlace.length > 0) {
                
                thirdWinner = playersData[(thirdPlace[thirdPlace.length - 1] * 3)];
            }
        }
        ctx.fillText(firstWinner, 200, 420);
        ctx.font = "bold 15px Comic Sans MS";
        ctx.fillText(secondWinner, 90, 430);
        ctx.fillText(thirdWinner, 339, 430);

        ctx.drawImage(Resources.get('images/startBtn.png'), 185, 500, 140, 140);

        canvas.addEventListener('click', displayUsernameInput);
    }
    function displayUsernameInput(){
        canvas.removeEventListener('click', displayUsernameInput);

        const usernameInputDiv = document.querySelector('.usernameInput');
        usernameInputDiv.style.display = "inline-block";

        const usernameInputTag = document.querySelector('#playerName');

        const usernameBtn = document.querySelector('#usernameBtn');
        usernameBtn.addEventListener('click', function(){
            let text = usernameInputTag.value;
            if (text === ''){
                usernameInputTag.style.border = "3px solid rgb(217, 46, 46)";
            } else {
                player.name = text;
                storyFrame();
            }
        });
    }
    function storyFrame() {
        const usernameInputDiv = document.querySelector('.usernameInput');
        usernameInputDiv.style.display = "none";

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        const theStory = `Once upon a time, there was a small happy village, and one day the EVIL WITCH came and turn everyone into dwarfs!! the poor villagers want to get back to thier normal size and the only way to heal from this curse is to go to the waterside where there is a magic water will turn off the curse. NLCMD NLCMD Your mission is to rive every villagers as possible as you can to the magic water, but be careful from the giant predatory bugs. NLCMD NLCMD Something more, you just have one minute and a half before the magic of water fades, BE FAST!!`;

        var maxWidth = 400;
        var lineHeight = 25;
        var x = (canvas.width - maxWidth) / 2;
        var y = 60;
        ctx.font = '20px Comic Sans MS';
        ctx.fillStyle = '#333';

        wrapText(ctx, theStory, x, y, maxWidth, lineHeight);

        ctx.drawImage(Resources.get('images/playBtn.png'), 185, 500, 140, 140);

        canvas.addEventListener('click', goToMain);
    }
    function endGameFrame() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        canvas.style.backgroundImage = "url('images/background.jpg')";
        canvas.style.backgroundRepeat = "repeat";
        canvas.style.backgroundSize = "600px 400px";

        let text = ``;
        if (playerInfoBar.win == 0 && playerInfoBar.dead == 0){
            text = `HELLOO! the time is over and you didn't play! don't open my game and let my character and my bugs waiting u to come back 😒😤`;
            ctx.font = "bold 20px Comic Sans MS";
            ctx.fillStyle = "#ED4A61";
        }else {
            ctx.font = "bold 20px Comic Sans MS";
            ctx.fillStyle = "#ED4A61";
            ctx.fillText("TIME IS OVER", 160, 80);
            ctx.fillStyle = "#898386";
            
            if (playerInfoBar.dead > 0) {
                if (playerInfoBar.win > 0) {
                    text += `Unfortunately, you lose ${playerInfoBar.dead} villagers :( But you do great you save ${playerInfoBar.win} villager's lifes, you break the curse from them. NLCMD Well done, ${player.name} hero`;
                } else {
                    text += `This is sad you did't save any villager's lifes :( NLCMD you lose ${playerInfoBar.dead} villagers`;
                }
            } else {
                text += `WOW you didn't lose any villager life! NLCMD you help ${playerInfoBar.win} villagers to came back to their normal size, you break the curse. NLCMD Well done, ${player.name} hero`;
            }
        }
        var maxWidth = 400;
        var lineHeight = 30;
        var x = (canvas.width - maxWidth) / 2;
        var y = 130;
        wrapText(ctx, text, x, y, maxWidth, lineHeight);

        writePlayerData();
        addPlayerToPlayersDataArr();
        document.querySelector(".playersList").style.display = "inline-block";

    }
    function goToMain() {
        canvas.removeEventListener('click', goToMain);
        canvas.style.backgroundImage = "none";
        main();
    }
    // ref(https://www.html5canvastutorials.com/tutorials/html5-canvas-wrap-text-tutorial/)
    function wrapText(context, text, x, y, maxWidth, lineHeight) {
        var words = text.split(' ');
        var line = '';

        for (var n = 0; n < words.length; n++) {
            if (words[n] != 'NLCMD') { // I add NLCMD to make new line | NLCMD (new line command)
                var testLine = line + words[n] + ' ';
                var metrics = context.measureText(testLine);
                var testWidth = metrics.width;
                if (testWidth > maxWidth && n > 0) {
                    context.fillText(line, x, y);
                    line = words[n] + ' ';
                    y += lineHeight;
                }
                else {
                    line = testLine;
                }
            }else {
                context.fillText(line, x, y);
                line = '';
                y += lineHeight;
            }
            
        }
        context.fillText(line, x, y);
    }

    function goTo(page) {
        if (page === "storyPage"){
            storyPage();
        }
        if (page === "main") {
            main();
        }
    }

    /* Go ahead and load all of the images we know we're going to need to
     * draw our game level. Then set init as the callback method, so that when
     * all of these images are properly loaded our game will start.
     */
    Resources.load([
        'images/stone-block.png',
        'images/water-block.png',
        'images/grass-block.png',
        'images/enemy-bug.png',
        'images/enemy-bug-flip.png',
        'images/char-boy.png',
        'images/char-pink-girl.png',
        'images/char-cat-girl.png',
        'images/char-horn-girl.png',
        'images/dead.png', 
        'images/death.png', 
        'images/win.png', 
        'images/timer.png',
        'images/victory.png',
        'images/startBtn.png',
        'images/playBtn.png',
        'images/survived.png'
    ]);
    Resources.onReady(init);

    /* Assign the canvas' context object to the global variable (the window
     * object when run in a browser) so that developers can use it more easily
     * from within their app.js files.
     */
    global.ctx = ctx;
})(this);

