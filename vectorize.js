import 'dotenv/config'; // Load environment variables from .env file
import fs from "fs";
import { Pinecone } from "@pinecone-database/pinecone";
import path from 'path';

// Get indexName from command line arguments
const pathToTranscripts = process.env.PATH_TO_TRANSCRIPT_FILES;

// Check for at least one .json file in the directory
const files = fs.readdirSync(pathToTranscripts);
const jsonFiles = files.filter(file => path.extname(file) === '.json');

if (jsonFiles.length === 0) {
    console.error("The directory does not contain any transcript files.");
    process.exit(1); // Exit the process with an error code
}

const indexName = process.env.PINECONE_INDEX_NAME;

const pc = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY, // Read API key from environment variable
});

const index = pc.index(indexName);

const vectorize = async (data) => {
  // split data into chunks of 96 for pinecone
  for (let i = 0; i < data.length; i += 96) {

    const toEmbed = data.slice(i, i + 96);

    const embeddings = await pc.inference.embed(
      "multilingual-e5-large",
      toEmbed.map((d) => d.text),
      { inputType: "passage", truncate: "END" }
    );

    console.log("created embeddings i=" + i);

    const vectors = toEmbed.map((d, i) => ({
      id: d.id,
      values: embeddings[i].values,
      metadata: { text: d.text, start: d.start, video_id: d.video_id },
    }));

    console.log("created vectors i=" + i);

    await index.namespace("ns1").upsert(vectors);

    console.log("upserted vectors i=" + i);
  }
};

// Given a filepath to a YouTube transcript JSON file, 
// this function reads the file, combines "chunkSize" rows into a single row, 
// and returns a new JSON object as an array of combined chunks. 
// For example, if the original file has 100 lines and a chunk size of 4, 
// the result will contain 25 lines, each one being 4 times larger than the original rows.
const combineTranscriptChunks = (filepath, chunkSize) => {

  const file = fs.readFileSync(filepath, "utf8");
  const filename = filepath.split("/").pop().split(".")[0];
  const video_id = filename.split("transcript_")[1];
  console.log(`Processing ${filename} with ${video_id}`);
  const rows = JSON.parse(file);

  console.log(`Processing ${filename} with ${rows.length} rows`);

  const chunks = [];
  for (let i = 0; i < rows.length; i += chunkSize) {
      chunks.push({
          video_id: video_id,
          id: `${video_id}-${i}`,
          text: rows.slice(i, i + chunkSize).map(r => r.text).join(" "),
          start: rows[i].start
      });
  }


  console.log(`Created ${chunks.length} chunks for ${filename}`);

  return chunks;
};

// loop over files in ./transcripts
const filesToLoad = fs.readdirSync(pathToTranscripts);

for (const file of filesToLoad) {
    
  const data = combineTranscriptChunks(`${pathToTranscripts}/${file}`, 20);

  await vectorize(data);

}

console.log("done");