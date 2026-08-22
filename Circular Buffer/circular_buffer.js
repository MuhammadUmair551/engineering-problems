const readline = require("readline");

class CircularBuffer {
  constructor(capacity, overwriteMode = false) {
    if (capacity <= 0) throw new Error("Capacity must be > 0");

    this.capacity = capacity;       
    this.buffer = new Array(capacity).fill(null); 
    this.head = 0;                 
    this.tail = 0;                  
    this.size = 0;                  
    this.overwriteMode = overwriteMode;
  }

  isFull() {
    return this.size === this.capacity;
  }

  isEmpty() {
    return this.size === 0;
  }

  write(item) {
    if (this.isFull()) {
      if (this.overwriteMode) {
        console.log(`[OVERWRITE] Buffer full! Slot ${this.head} ka purana data "${this.buffer[this.head]}" delete ho raha hai`);
        this.buffer[this.tail] = item;
        this.tail = (this.tail + 1) % this.capacity; 
        this.head = (this.head + 1) % this.capacity; 
      } else {
        console.log(`[BLOCKING] Buffer full! "${item}" write nahi ho saka. Space ka intezaar...`);
        return false;
      }
    } else {
      this.buffer[this.tail] = item;
      this.tail = (this.tail + 1) % this.capacity;
      this.size++;
    }

    console.log(`[WRITE] "${item}" likha gaya | Size: ${this.size}/${this.capacity}`);
    return true;
  }

  read() {
    if (this.isEmpty()) {
      console.log("[READ] Buffer empty hai, kuch nahi mila");
      return null;
    }

    const item = this.buffer[this.head];
    this.buffer[this.head] = null;     
    this.head = (this.head + 1) % this.capacity;
    this.size--;

    console.log(`[READ] "${item}" nikala gaya | Size: ${this.size}/${this.capacity}`);
    return item;
  }

  display() {
    console.log("\n--- Buffer State ---");
    console.log(`Capacity: ${this.capacity} | Size: ${this.size} | Full: ${this.isFull()} | Empty: ${this.isEmpty()}`);
    console.log(`Head (read) index: ${this.head} | Tail (write) index: ${this.tail}`);
    console.log(`Overwrite Mode: ${this.overwriteMode ? "ON" : "OFF"}`);

    let visual = "[ ";
    for (let i = 0; i < this.capacity; i++) {
      const val = this.buffer[i] !== null ? `"${this.buffer[i]}"` : "null";
      const isHead = i === this.head ? "H" : "";
      const isTail = i === this.tail ? "T" : "";
      const marker = isHead && isTail ? "(HT)" : isHead ? "(H)" : isTail ? "(T)" : "";
      visual += `${val}${marker}`;
      if (i < this.capacity - 1) visual += ", ";
    }
    visual += " ]";
    console.log("Array:", visual);
    console.log("--------------------\n");
  }
}

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function ask(question) {
  return new Promise((resolve) => rl.question(question, resolve));
}

async function main() {
  console.log("CIRCULAR BUFFER\n");

  const capInput = await ask("Buffer ki capacity enter karo (e.g. 5): ");
  const capacity = parseInt(capInput);

  if (isNaN(capacity) || capacity <= 0) {
    console.log("Invalid capacity! Ek positive number chahiye.");
    rl.close();
    return;
  }

  const modeInput = await ask("Overwrite mode ON karna hai? (y/n): ");
  const overwriteMode = modeInput.trim().toLowerCase() === "y";

  const cb = new CircularBuffer(capacity, overwriteMode);
  console.log(`\nBuffer create ho gaya! Capacity: ${capacity}, Overwrite: ${overwriteMode ? "ON" : "OFF"}\n`);

  const demoItems = ["Alpha", "Beta", "Gamma", "Delta", "Epsilon", "Zeta"];

  console.log("DEMO: Values likhna");
  for (const item of demoItems) {
    cb.write(item);
  }
  cb.display();

  console.log("DEMO: 2 values padhna");
  cb.read();
  cb.read();
  cb.display();

  console.log("DEMO: Phir 2 naye values likhna");
  cb.write("Eta");
  cb.write("Theta");
  cb.display();

  console.log("MANUAL MODE");
  while (true) {
    console.log("Options: [w] Write, [r] Read, [d] Display, [q] Quit");
    const choice = await ask("Choice: ");

    if (choice.trim() === "q") {
      console.log("Bye!");
      break;
    } else if (choice.trim() === "w") {
      const val = await ask("Write karne ki value: ");
      cb.write(val.trim());
    } else if (choice.trim() === "r") {
      const result = cb.read();
      if (result !== null) console.log(`Mila: "${result}"`);
    } else if (choice.trim() === "d") {
      cb.display();
    } else {
      console.log("Invalid choice, dobara try karo");
    }
  }

  rl.close();
}

main();