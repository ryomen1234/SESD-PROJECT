import pandas as pd
import numpy as np
import spotipy
from spotipy.oauth2 import SpotifyClientCredentials
import os
import logging
import time
from typing import List


# ensure that logs directory exists
logs_dir = "logs"
os.makedirs(logs_dir, exist_ok=True)

# define logger
logger = logging.getLogger("data_ingestion")
logger.setLevel(logging.DEBUG)

# define console handler
console_logger = logging.StreamHandler()
console_logger.setLevel(logging.DEBUG)

# define file handler
log_file_path = os.path.join(logs_dir, 'data_ingestion.log')
file_logger = logging.FileHandler(log_file_path)
file_logger.setLevel(logging.DEBUG)

# define formatter (corrected '%(asctime)s')
formatter = logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s')

# set formatter
console_logger.setFormatter(formatter)
file_logger.setFormatter(formatter)

# add handlers to logger
logger.addHandler(console_logger)
logger.addHandler(file_logger)


def load_data() -> List[dict]:
    try:
        sp = spotipy.Spotify(auth_manager=SpotifyClientCredentials(
            client_id="fba402b9adc14b94bcd0de22fe219461",
            client_secret="28ba1bdb688f4612b6e53c9d5de828f3"
        ))
        logger.debug("Authentication completed.")

        playlist_ids = [
            "37i9dQZF1DXcBWIGoYBM5M",
            "37i9dQZF1DX4JAvHpjipBk",
            "37i9dQZF1DWXRqgorJj26U",
            "37i9dQZF1DWXJfnUiYjUKT",
            "37i9dQZF1DWWEJlAGA9gs0",
            "37i9dQZF1DWYkaDif7Ztbp",
            "2Z1LgolP3fqxEJ89MS7n9C",
            "37i9dQZF1DX3wwp27Epwn5",
        ]

        track_ids = set()
        for pid in playlist_ids:
            results = sp.playlist_tracks(pid)
            while results:
                for item in results['items']:
                    track = item['track']
                    if track and track['id']:
                        track_ids.add(track['id'])
                if results['next']:
                    results = sp.next(results)
                else:
                    break
        logger.debug("Track IDs extracted: %d", len(track_ids))

        data = []
        track_ids = list(track_ids)
        for i in range(0, len(track_ids), 50):
            batch = track_ids[i:i+50]
            features = sp.audio_features(batch)
            tracks = sp.tracks(batch)['tracks']

            for feat, meta in zip(features, tracks):
                if feat and meta:
                    data.append({
                        'id': feat['id'],
                        'danceability': feat['danceability'],
                        'energy': feat['energy'],
                        'loudness': feat['loudness'],
                        'speechiness': feat['speechiness'],
                        'acousticness': feat['acousticness'],
                        'instrumentalness': feat['instrumentalness'],
                        'liveness': feat['liveness'],
                        'valence': feat['valence'],
                        'tempo': feat['tempo'],
                        'name': meta['name'],
                        'artist': meta['artists'][0]['name'],
                        'popularity': meta['popularity']
                    })
            time.sleep(0.2)
        logger.debug("Features extracted for all tracks.")

        return data

    except Exception as e:
        logger.error("Data extraction failed: %s", e)
        raise


def save_data(path: str, data: List[dict]) -> None:
    try:
        os.makedirs(path, exist_ok=True)
        df = pd.DataFrame(data)
        df.to_csv(os.path.join(path, 'raw_data.csv'), index=False)
        logger.debug("Data saved to %s", os.path.join(path, 'raw_data.csv'))
    except Exception as e:
        logger.error("Data save unsuccessful: %s", e)
        raise


def main():
    try:
        logger.debug("Data extraction started.")
        data = load_data()
        logger.debug("Data extraction completed.")

        save_data('data/raw', data)
    except Exception as e:
        logger.error("Main process failed: %s", e)
        raise


if __name__ == "__main__":
    main()
