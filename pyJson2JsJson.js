import fs from "fs";
import path from "path";

const __dirname = path.dirname(new URL(import.meta.url).pathname);

// read from command line
const pathToTranscripts = process.argv[2];

if (!pathToTranscripts) {
  console.error(
    "Please provide a path to the transcripts as a command line argument."
  );
  process.exit(1); // Exit the process with an error code
}

const directoryPath = path.join(__dirname, pathToTranscripts);


const convertJson = (filePath) => {
  fs.readFile(filePath, "utf8", (err, data) => {
    if (err) {
      console.error(`Error reading file ${filePath}:`, err);
      return;
    }

    try {
      // Manual parsing and fixing of JSON strings
      const lines = data.split("\n");
      const fixedLines = lines.map((line) => {
        // Matches only the outermost single quotes used for JSON properties or string values
        return line.replace(/:\s*'([^']*)'/g, (match, p1) => {
          // Escape all internal double quotes and wrap with double quotes
          return `: "${p1.replace(/"/g, '\\"')}"`;
        });
      });
      let fixedJson = fixedLines.join("\n");
      fixedJson = fixedJson.replaceAll("'duration'", '"duration"');
      fixedJson = fixedJson.replaceAll("'start'", '"start"');
      fixedJson = fixedJson.replaceAll("'text'", '"text"');
      
      fixedJson = fixedJson.replace(/\\xa0/g, ' '); // unicode non-breaking space

      // Parse JSON to ensure validity
      const jsonData = JSON.parse(fixedJson);

      // Write fixed JSON back to file
      fs.writeFile(
        filePath,
        JSON.stringify(jsonData, null, 2),
        "utf8",
        (err) => {
          if (err) {
            console.error(`Error writing file ${filePath}:`, err);
            return;
          }
          console.log(`${filePath} has been converted and saved.`);
        }
      );
    } catch (parseError) {
      console.error(`Error parsing JSON in file ${filePath}:`, parseError);
      // Delete the file if JSON is invalid
      // fs.unlink(filePath, (unlinkErr) => {
      //     if (unlinkErr) {
      //         console.error(`Error deleting invalid file ${file}:`, unlinkErr);
      //         return;
      //     }
      //     console.log(`Deleted invalid JSON file: ${file}`);
      // });
    }
  });
};

fs.readdir(directoryPath, async (err, files) => {
  if (err) {
    console.error("Unable to read directory:", err);
    return;
  }

  files.forEach((file) => {
    if (path.extname(file) === ".json") {
      const filePath = path.join(directoryPath, file);

      // if the file is empty, delete it
      if (fs.statSync(filePath).size === 0) {
        fs.unlinkSync(filePath);
        return;
      }

      convertJson(filePath);
    }
  });
});
