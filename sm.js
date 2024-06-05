class Reel{
    //Reels constructor, symbol is the graphic displayed.
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

}
