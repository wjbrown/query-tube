import { Pinecone } from "@pinecone-database/pinecone";
import OpenAI from "openai";
import 'dotenv/config';

const pc = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY,
});

const indexName = process.env.PINECONE_INDEX_NAME;

const index = pc.index(indexName);

const query = process.argv[2];

console.log(query);

const embedding = await pc.inference.embed("multilingual-e5-large", [query], {
  inputType: "query",
});

const queryResponse = await index.namespace("ns1").query({
  topK: 25,
  vector: embedding[0].values,
  includeValues: false,
  includeMetadata: true,
});

const fullTextResponse = queryResponse.matches.map(m => m.metadata.text).join("\n");

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

const prompt = `Based on the following transcript excerpts from YouTube videos, please answer this question: "${query}"

Relevant transcript excerpts:
${fullTextResponse}

Please provide a clear and concise answer based only on the information contained in these transcript excerpts.`;

const completion = await openai.chat.completions.create({
  messages: [{ role: "user", content: prompt }],
  model: "gpt-3.5-turbo",
});

// console.log(prompt);

console.log(completion.choices[0].message.content);



