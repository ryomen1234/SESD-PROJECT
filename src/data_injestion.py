import pandas as pd
import numpy as np
import os
from utils.logs import get_logger



logger = get_logger(__name__, file_name='data_injestion.log')

def load_data(url: str) -> pd.DataFrame:
    '''this function load data from url and return dataframe'''
    try:
         df = pd.read_csv(url)
         logger.info("data is loaded successfully")

         return df
    except Exception as e:
         logger.error("Unexpected error occured %s",e)
         raise


def main():
     try:
          url = "hf://datasets/maharshipandya/spotify-tracks-dataset/dataset.csv"
          df = load_data(url)

          raw_data_path = 'data/raw_data'
          os.makedirs(raw_data_path, exist_ok=True)
          logger.info("raw_data dir created")

          df.to_csv(os.path.join(raw_data_path, 'raw_data.csv'), index=False)
          logger.info("raw_data.csv saved")
     except Exception as e:
          logger.error("Some unexpected error occured %s", e)
          raise


if __name__ == "__main__":
     main()



          


         
    