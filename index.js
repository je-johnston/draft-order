const Jimp = require("jimp");
const fs = require("fs");

const INPUT_FILE = `${__dirname}/input.json`;
const CLEAN_DIR = `${__dirname}/images/clean`;
const DIRTY_DIR = `${__dirname}/images/dirty`;
const OUTPUT_DIR = `${__dirname}/output`;
let imageDir, teamArr;

async function main() {
  console.log(`Randomizing order at: ${new Date()}`);

  //Check a flag to determine if we're loading from the clean or dirty directory.
  imageDir = process.env.dirty ? DIRTY_DIR : CLEAN_DIR;

  //Make sure we've got the file structure we need.
  await validateFiles();

  //Load the team array from the file.
  await loadTeams();

  //Shuffle the team array.
  await shuffleArray(teamArr);

  //Write the output files.
  await writeOutput();
}

//Write the output files.
async function writeOutput() {
  //Index determines draft order.
  for (let i = 0; i < teamArr.length; i++) {
    const team = teamArr[i];
    const order = i + 1; //0 based array so add 1 for readability
    
    //Read the image and get the height/width so we can place the text.
    const image = await Jimp.read(`${imageDir}/${team.file}`);
    const width = image.bitmap.height;
    const height = image.bitmap.width;

    const font = await Jimp.loadFont(Jimp.FONT_SANS_32_BLACK);
    image.print(font, width/2, height/2, `draft order: ${order}`)

    //Actually write the file to the output directory.
    await image.writeAsync(`${OUTPUT_DIR}/${team.file}`);
  }
}

//Stolen from: https://stackoverflow.com/questions/2450954/how-to-randomize-shuffle-a-javascript-array
//Basic implementation of a fisher yates shuffle: https://en.wikipedia.org/wiki/Fisher%E2%80%93Yates_shuffle
async function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

//Loads the team array from the file.
async function loadTeams() {
  teamArr = JSON.parse(fs.readFileSync(INPUT_FILE));
  if (!Array.isArray(teamArr)) {
    throw new Error(`Invalid input format`);
  }
}

//Makes sure we've got the files we need.
async function validateFiles() {
  if (!fs.existsSync(INPUT_FILE)) {
    throw new Error(`Input file: ${INPUT_FILE} not found`);
  }

  if (!fs.existsSync(CLEAN_DIR)) {
    fs.mkdirSync(CLEAN_DIR)
  }

  if (!fs.existsSync(DIRTY_DIR)) {
    fs.mkdirSync(DIRTY_DIR)
  }

  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR)
  }
}

main().then(() => {
  console.log(`Finished at: ${new Date()}`);
});
