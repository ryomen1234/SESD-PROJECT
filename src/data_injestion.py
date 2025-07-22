import pandas as pd
import numpy as np
import os
import logging


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



          


         
    