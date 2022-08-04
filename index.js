const Jimp = require("jimp");
const fs = require("fs");

const INPUT_FILE = `${__dirname}/input.json`;
const CLEAN_DIR = `${__dirname}/images/clean`;
const DIRTY_DIR = `${__dirname}/images/dirty`;
const OUTPUT_DIR = `${__dirname}/output`;
let imageDir, teamArr, isDirty;

async function main() {
  console.log(`Randomizing order at: ${new Date()}`);

  //Make sure the directories are setup and we get the command flags.
  await parseInput();

  //Check to see if we're pulling from the clean directory or not.
  imageDir = CLEAN_DIR;
  if (isDirty) {
    console.log("Pulling images from dirty directory.");
    imageDir = DIRTY_DIR;
  }

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


    //Shamelessly stolen from: https://stackoverflow.com/questions/71213136/how-to-change-the-font-color-of-text-print-in-jimp/71213187#71213187
    let textImage = new Jimp(1000, 1000, 0x0, (err, textImage) => {
      if (err) throw err;
    });

    //It would be better to center the text and do the font sized dynamically but with 12 different image sizes
    //that's way too much work.
    Jimp.loadFont(Jimp.FONT_SANS_64_BLACK).then(async (font) => {
      textImage.print(font, 0, 0, `${team.name}: ${order}`);
      textImage.color([{ apply: "xor", params: ["#00ff00"] }]);
      image.blit(textImage, 0, 0);
      await image.writeAsync(`${OUTPUT_DIR}/${team.file}`);
    });
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
async function parseInput() {
  if (!fs.existsSync(INPUT_FILE)) {
    throw new Error(`Input file: ${INPUT_FILE} not found`);
  }

  if (!fs.existsSync(CLEAN_DIR)) {
    fs.mkdirSync(CLEAN_DIR);
  }

  if (!fs.existsSync(DIRTY_DIR)) {
    fs.mkdirSync(DIRTY_DIR);
  }

  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR);
  }

  isDirty = process.env.dirty === "true" ? true : false;
}

main().then(() => {
  console.log(`Finished at: ${new Date()}`);
});
