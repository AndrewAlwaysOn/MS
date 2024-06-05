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
    //getRandomSymbol generates a random symbol
    getRandomSymbol() {
        return this.symbols[Math.floor(Math.random() * this.symbols.length)];
    }
    //Spin adds a new element to the Reel and removes the last one
    spin() {
        this.currentSymbols.unshift(this.getRandomSymbol());
        this.currentSymbols.pop();
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
        this.loadImages(() => {
          this.initReels();
          this.addEventListeners();
          this.resizeCanvas();
          this.drawInitialMessage();
          window.addEventListener('resize', this.resizeCanvas.bind(this));
        });
      }
    //loadImages is loading the images and then running a callback function
    loadImages(callback) {
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
        this.ctx.textAlign = "center";
        this.ctx.textBaseline = "middle";
        this.ctx.fillText(message, parseInt(this.canvas.style.width) / 2, parseInt(this.canvas.style.height) / 2);
    }
    //drawReels is drawing Reels on the canvas - 3 columns
    drawReels(){
        const reelWidth = parseInt(this.canvas.style.width) / 3;
        const reelHeight = parseInt(this.canvas.style.height);
        const margin = 0.05 * Math.min(reelWidth, reelHeight / 3);
        const maxSymbolWidth = reelWidth - margin * 2;
        const maxSymbolHeight = (reelHeight / 3) - margin * 2;
        
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.fillStyle = "white";
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
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
                const y = j * (reelHeight / 3) + (reelHeight / 3 - drawHeight) / 2;
                this.ctx.drawImage(img, x, y, drawWidth, drawHeight);
            }
        }

    }
    //imitates spin
    async spinReels(callback) {
        const spinDuration = 2000; // Total duration of the spin in milliseconds
        const frameDuration = 100 + Math.floor(Math.random() *300); // Duration of each frame in milliseconds - 100ms + random (0-300)
        const frames = Math.floor(spinDuration / frameDuration);

        for (let i = 0; i < frames; i++) {
            this.reels.forEach(reel => reel.spin());
            this.drawReels();
            await this.sleep(frameDuration);
        }

        this.reels.forEach(reel => {
        for (let i = 0; i < reel.currentSymbols.length; i++) {
            reel.currentSymbols[i] = reel.getRandomSymbol();
        }
        });
        this.drawReels();
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
            this.spinReels(() => {
                console.log('Spin complete');
            });
        });

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
        for (let row = 0; row < 3; row++) {
            const symbol = this.reels[0].currentSymbols[row];
            let win = true;
            for (let reel = 1; reel < this.reels.length; reel++) {
                if (this.reels[reel].currentSymbols[row] !== symbol) {
                    win = false;
                    break;
                }
            }
            //if there is then show a Win alert
            if (win) {
                this.showWinAlert();
                return;
            }
        }
    }
    //show win alert in the alertContainer div in above the canvas
    showWinAlert() {
        const alertContainer = document.getElementById('alertContainer');
        alertContainer.innerHTML = `
            <div class="alert alert-success" role="alert">
            WINNER!
            </div>
        `;
    }
    //clear the win alert makes the alertContainer empty
    clearWinAlert() {
        const alertContainer = document.getElementById('alertContainer');
        alertContainer.innerHTML = '';    
    }    
}


// Global object to hold the instance of the SlotMachine
let slotMachine;

//when the DOM is loaded then initiate the SlotMachine
document.addEventListener('DOMContentLoaded', () => {
    const symbols = [
    'img/banana.png', // Banana
    'img/cherry.png', // Cherry
    'img/melon.png'   // Melon
    ];
    slotMachine = new SlotMachine('slotMachineCanvas', 'spinButton', symbols);
});