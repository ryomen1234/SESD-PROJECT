import pandas as pd
import numpy as np
from typing import List, Dict

import os
from src.utils.logs import get_logger


try:
 logger = get_logger(__name__, file_name='train.log')
except ModuleNotFoundError as msg:
    print(f"Module not found: {msg}")
    raise

def predict(index: int, path: str) -> List[Dict]:
    """
    Return 10 random songs from the same cluster as the given index.

    Args:
        index (int): Song index.
        path (str): Path to the music list CSV.

    Returns:
        list[dict]: List of 10 songs with keys ['artists', 'album_name', 'track_name'].
    """
    try:
        # Load dataset
        df = pd.read_csv(path)
        logger.info(f"Data loaded successfully from {path} (shape: {df.shape})")

        # Validate index range
        if index < 0 or index >= len(df):
            raise IndexError(f"Index {index} is out of range. Dataframe length: {len(df)}")

        # Get the label for the given song
        song_label = df.iloc[index, 4]
        logger.info(f"Song label fetched successfully: {song_label}")

        # Filter songs belonging to the same cluster
        song_cluster = df[df['labels'] == song_label]
        if song_cluster.empty:
            raise ValueError(f"No songs found for label {song_label}")

        # Sample 10 random songs (or fewer if cluster < 10)
        sample_size = min(10, len(song_cluster))
        song_sample = song_cluster[['artists', 'album_name', 'track_name']].sample(sample_size)
        song_list = song_sample.to_dict(orient="records")

        logger.info(f"{sample_size} songs fetched successfully from cluster with label {song_label}")

        return song_list

    except FileNotFoundError:
        logger.error(f"File not found at path: {path}")
        raise
    except IndexError as e:
        logger.error(f"Index error: {e}")
        raise
    except ValueError as e:
        logger.error(f"Value error: {e}")
        raise
    except Exception as e:
        logger.error(f"Unexpected error occurred: {e}")
        raise

def main():
    ''' 
    this method is starting point get the data path and index of song.

    '''

    try:

        #song data path
        song_path = r"E:\TY\SESD\SESD-PROJECT\music-store\mudic_recommedation_list_4.csv"
       
        #index corresponding to song user like.
        index = int(input("Enter the index"))
        logger.info(f"User selected song index: {index}")
       
        #predict 10 song user will like.
        song_list = predict(index=index, path=song_path)
        print("10 song user may like")
        for i in range(len(song_list)):
            print(song_list[i])

    except Exception as e:
        logger.error("Some unexpected error occured", e)
        raise


if __name__ == "__main__":
    main()




