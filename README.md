# query-tube

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

Convert the JSON from python format to javascript format
```pwsh
node pyJson2JsJson.js {path_to_transcripts}
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

