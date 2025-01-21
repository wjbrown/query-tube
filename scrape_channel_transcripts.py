import os
from dotenv import load_dotenv
import scrapetube
from youtube_transcript_api import YouTubeTranscriptApi
import json

load_dotenv()

def fetch_videos(channel_id):
    """Fetches videos from the specified YouTube channel."""
    return scrapetube.get_channel(channel_id)

def save_transcript(video_id, directory, prefix):
    """Fetches and saves the transcript for a given video ID."""
    try:
        transcript = YouTubeTranscriptApi.get_transcript(video_id)
        file_path = os.path.join(directory, f"{prefix}_{video_id}.json")
        with open(file_path, "w") as f:
            json.dump(transcript, f)  # Use json.dump instead of str()
        print(f"Transcript saved for {video_id} at {file_path}")
    except Exception as e:
        print(f"Could not retrieve transcript for {video_id}: {e}")

def scrape_channel_transcripts(channel_id, directory, prefix):
    """Main function to scrape transcripts from a YouTube channel."""
    videos = fetch_videos(channel_id)
    for video in videos:
        video_id = video['videoId']
        print(video_id)
        save_transcript(video_id, directory, prefix)

# Example usage
if __name__ == "__main__":
    channel_id = os.getenv("YOUTUBE_CHANNEL_ID")
    output_directory = os.getenv("PATH_TO_TRANSCRIPT_FILES")
    file_prefix = "transcript"  # Specify your file prefix here

    # Create output directory if it doesn't exist
    os.makedirs(output_directory, exist_ok=True)

    scrape_channel_transcripts(channel_id, output_directory, file_prefix)