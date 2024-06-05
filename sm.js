class Reel{
    //Reels constructor, symbol is the graphic displayed. A Reel is a column of 3 symbols
    constructor(symbols) {
        this.symbols = symbols;
        this.currentSymbols = [];
        this.initReel();
    }
    //Init Reel get's random 3 symbols
    initReel() {
        for (let i = 0; i < 3; i++) {
            this.currentSymbols.push(this.getRandomSymbol());
        }
    }
    //Init Reel get's random 3 symbols
    clearReel() {
        this.currentSymbols = [];        
    }
    //getRandomSymbol generates a random symbol
    getRandomSymbol() {
        return this.symbols[Math.floor(Math.random() * this.symbols.length)];
    }
    //Spin adds a new element to the Reel and removes the last one
    spin() {
        this.currentSymbols.unshift(this.getRandomSymbol());
        this.currentSymbols.pop();
    }   
    spinStart() {
        for(let i=0; i<10; i++)
            this.currentSymbols.push(this.getRandomSymbol());
        
    }   
    spinStop() {
        for(let i=0; i<10; i++)
            this.currentSymbols.shift();        
    }   
}

class SlotMachine{
    //Slot Machine constructor initilizes the stage
    constructor(canvasId, buttonId, symbols) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.button = document.getElementById(buttonId);
        this.reels = [];
        this.symbols = symbols;
        this.images = {};
        this.loadSymbols();
        this.loadImages(() => {
            this.initReels();
            this.addEventListeners();
            this.resizeCanvas();
            this.drawInitialMessage();
            window.addEventListener('resize', this.resizeCanvasAndImages.bind(this));
        });
      }
    //loadImages is loading the images and then running a callback function
    loadImages(callback) {
        console.log("load IMAGES");
        this.images = [];
        const promises = this.symbols.map(symbol => new Promise((resolve, reject) => {
          const img = new Image();
          img.src = symbol;
          img.onload = () => {
            this.images[symbol] = img;
            resolve();
          };
          img.onerror = reject;
        }));
    
        Promise.all(promises).then(callback).catch(error => {
          console.error('Error loading images:', error);
        });
    }  
    //initReels is adding 3 Reels, 3 columns to the Slot Machine  
    initReels() {
        for (let i = 0; i < 3; i++) {
            this.reels.push(new Reel(this.symbols));
        }
    }
    //upon start there will be a start message displayed on the canvas / slotMachine
    drawInitialMessage() {
        const message = "Press spin to play";
        this.ctx.clearRect(0, 0, parseInt(this.canvas.style.width), parseInt(this.canvas.style.height));
        this.ctx.fillStyle = "white";
        this.ctx.fillRect(0, 0, parseInt(this.canvas.style.width), parseInt(this.canvas.style.height));
        this.ctx.fillStyle = "black";        
        this.ctx.font = "30px Arial";
        if(parseInt(this.canvas.style.width)<300) this.ctx.font = "15px Arial";
        if(parseInt(this.canvas.style.width)<200) this.ctx.font = "10px Arial";
        this.ctx.textAlign = "center";
        this.ctx.textBaseline = "middle";
        this.ctx.fillText(message, parseInt(this.canvas.style.width) / 2, parseInt(this.canvas.style.height) / 2);
    }
    //drawReels is drawing Reels on the canvas - 3 columns
    drawReels(spiningPercentage = 0){
        const reelWidth = parseInt(this.canvas.style.width) / 3;
        const reelHeight = parseInt(this.canvas.style.height);
        const margin = 0.05 * Math.min(reelWidth, reelHeight / 3);
        const maxSymbolWidth = reelWidth - margin * 2;
        const maxSymbolHeight = (reelHeight / 3) - margin * 2;
        
        this.ctx.clearRect(0, 0, parseInt(this.canvas.style.width), parseInt(this.canvas.style.height));
        this.ctx.fillStyle = "white";
        this.ctx.fillRect(0, 0, parseInt(this.canvas.style.width), parseInt(this.canvas.style.height));
        for (let i = 0; i < this.reels.length; i++) {
            for (let j = 0; j < this.reels[i].currentSymbols.length; j++) {
                const symbol = this.reels[i].currentSymbols[j];
                const img = this.images[symbol];

                // Maintain aspect ratio
                const aspectRatio = img.width / img.height;
                let drawWidth = maxSymbolWidth;
                let drawHeight = maxSymbolWidth / aspectRatio;

                if (drawHeight > maxSymbolHeight) {
                    drawHeight = maxSymbolHeight;
                    drawWidth = maxSymbolHeight * aspectRatio;
                }

                const x = i * reelWidth + (reelWidth - drawWidth) / 2;
                //simulating spin
                const y = j * (reelHeight / 3) + (reelHeight / 3 - drawHeight) / 2 - ((this.reels[i].currentSymbols.length-3) * spiningPercentage * (reelHeight / 3)); 
                //if(spiningPercentage == 0) console.log(j," y=",y);
                this.ctx.drawImage(img, x, y, drawWidth, drawHeight);
            }
        }

    }
    //imitates spin
    async spinReels(callback) {
        const spinDuration = 2000; // Total duration of the spin in milliseconds
        const frameDuration = 100 ; // Duration of each frame in milliseconds - 100ms + random (0-300)
        const frames = Math.floor(spinDuration / frameDuration);

        for (let i = 0; i < frames; i++) {
            this.reels.forEach(reel => reel.spin());
            this.drawReels(i/frames);
            await this.sleep(frameDuration);
        }

        this.reels.forEach(reel => {
        for (let i = 0; i < reel.currentSymbols.length; i++) {
            reel.currentSymbols[i] = reel.getRandomSymbol();
        }
        });
        this.drawReels(0);
        this.checkWin();
        if (callback) callback();
    }

    async spinReels2(callback) {
        const spinDuration = 2000; // Total duration of the spin in milliseconds
        const frameDuration = 50 ; // Duration of each frame in milliseconds - 100ms + random (0-300)
        const frames = Math.floor(spinDuration / frameDuration);

        this.reels.forEach(reel => reel.spinStart());

        for (let i = 0; i < frames; i++) {            
            this.drawReels(i/frames);
            await this.sleep(frameDuration);
        }

        this.reels.forEach(reel => reel.spinStop());

        this.drawReels(0);
        this.checkWin();
        if (callback) callback();
    }


    //sleep is used to create a delay in the spinning
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    //addEventListeners for the spin button click / clearing win alert and console.log the end of spin for debug
    addEventListeners(){
        this.button.addEventListener('click', () => {
            this.clearWinAlert();
            this.spinReels2(() => {
                console.log('Spin complete');
            });
        });

    }
    resizeCanvasAndImages(){
        this.loadSymbols();
        this.loadImages(() => {
            this.resizeCanvas();
        });        
        for (let reel = 0; reel < this.reels.length; reel++) {
            this.reels[reel].symbols = this.symbols;
            this.reels[reel].clearReel();
            this.reels[reel].initReel();
        }
    }
    //resizeCanvas to adjust to the window size / canvas size dynamically
    resizeCanvas(){        
        let canvasSize = document.documentElement.clientWidth*0.8;
        if(document.documentElement.clientHeight < document.documentElement.clientWidth)
            canvasSize = document.documentElement.clientHeight*0.8;
        const ratio = window.devicePixelRatio || 1;
        this.canvas.width = canvasSize * ratio;
        this.canvas.height = canvasSize * ratio;
        this.canvas.style.width = `${canvasSize}px`;
        this.canvas.style.height = `${canvasSize}px`;
        this.ctx.setTransform(ratio, 0, 0, ratio, 0, 0); // Reset the transform before drawing
        this.drawInitialMessage();       
        
    }
    //checkWin is launched after each spin to check if a winning combination is there in any row
    checkWin() {
        let winSymbol;
        for (let row = 0; row < 3; row++) {
            const symbol = this.reels[0].currentSymbols[row];
            winSymbol = symbol;
            let win = true;
            for (let reel = 1; reel < this.reels.length; reel++) {
                if (this.reels[reel].currentSymbols[row] !== symbol) {
                    win = false;                    
                    break;
                }
            }
            //if there is then show a Win alert
            if (win) {
                this.showWinAlert(winSymbol);
                return;
            }
        }
    }
    //show win alert in the alertContainer div in above the canvas
    showWinAlert(symbol) {
        const alertContainer = document.getElementById('alertContainer');
        alertContainer.innerHTML = `
            <div class="alert alert-success" role="alert">
            WINNER!
            </div>
        `;
        this.ctx.fillStyle = "yellow";
        this.ctx.fillRect(parseInt(this.canvas.style.width)*0.20, parseInt(this.canvas.style.height)*0.20, parseInt(this.canvas.style.width)*0.60, parseInt(this.canvas.style.height)*0.60);        
        const img = this.images[symbol];

        this.ctx.drawImage(img, parseInt(this.canvas.style.width)*0.25, parseInt(this.canvas.style.height)*0.25, parseInt(this.canvas.style.width)*0.5, parseInt(this.canvas.style.height)*0.5);
    }
    //clear the win alert makes the alertContainer empty
    clearWinAlert() {
        const alertContainer = document.getElementById('alertContainer');
        alertContainer.innerHTML = '';    
    }    
    updateSymbols(){
        this.symbols = loadSymbols();
    }
    loadSymbols(){
        let symbols;
        if(document.documentElement.clientHeight >200 && document.documentElement.clientWidth > 200){
            symbols = [
                'img/banana.png', // Banana
                'img/cherry.png', // Cherry
                'img/melon.png'   // Melon
            ];
        } else {
            symbols = [
                'img/bananaXs.png', // Banana
                'img/cherryXs.png', // Cherry
                'img/melonXs.png'   // Melon
            ];
        }
        this.symbols = symbols;
    }
}


// Global object to hold the instance of the SlotMachine
let slotMachine;

//when the DOM is loaded then initiate the SlotMachine
document.addEventListener('DOMContentLoaded', () => {
    
    slotMachine = new SlotMachine('slotMachineCanvas', 'spinButton');
});

