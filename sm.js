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
}
