This repo is a patched together way to use AI to query a youtube channel. Put simply, it:

1. pulls a list of video transcripts from a youtube channel
2. loads those transcripts into a pinecone vector db
3. when you ask a question, it finds related records from pinecone and shoves those into a chatgpt prompt with your original question

# Install & Setup

```pwsh
pip install scrapetube
pip install youtube-transcript-api
npm install
mkdir transcripts
```

Create a .env file with the following:
```pwsh
PINECONE_API_KEY=
OPENAI_API_KEY=
PINECONE_INDEX_NAME=transcripts
PATH_TO_TRANSCRIPT_FILES=transcripts
YOUTUBE_CHANNEL_ID=
```

To get the channel id from a youtube channel, you can visit the youtube channel, view page source, search for "/channel/" and copy the channel id

# Running

Scrape the transcripts for the channel
```pwsh
python scrape_channel_transcripts.py
```

Delete the current vector database (optional)
```pwsh
node pinecone.js delete
```

Create the vector database
```pwsh
node pinecone.js create
```

Vectorize the transcripts
```pwsh
node vectorize.js
```

Query the vector database
```pwsh
node query.js "{query}"
```

