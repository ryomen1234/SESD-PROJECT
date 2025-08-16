import pandas as pd
import numpy as np
import os
import time
import pickle
from sklearn.cluster import KMeans
from src.utils.logs import get_logger
from sklearn.metrics import silhouette_score, calinski_harabasz_score

try:
 logger = get_logger(__name__, file_name='train.log')
except ModuleNotFoundError as msg:
    print(f"Module not found: {msg}")
    raise

def train_model(data: np.ndarray) -> KMeans:
    """
    This method uses the KMeans algorithm.
    A NumPy array of shape (m x n) is passed as input.
    It returns the trained model in pickle format.
    """
    try:
        logger.info("Model training started.")
        model = KMeans(n_clusters=3, max_iter=100, random_state=42)
        
        start = time.time()
        model.fit(data)
        logger.info(f"Time elapsed to train model: {time.time() -start}.")
        
        return model
    except Exception as e:
        logger.error(f"Some unexpected error occured: {e} ", exc_info=True)
        raise 

def evalute(model: KMeans, data: np.ndarray, df: pd.DataFrame) -> pd.DataFrame:
    '''
    this method evalute the model using 'Silhouette Score' and 'calinski_harabasz_score'.
    '''

    try: 

        labels = model.labels_
        logger.info(f"labels predicted/nlabels shape: {labels.shape}")
        score1 = silhouette_score(data, labels)
        score2 = calinski_harabasz_score(data, labels)
        logger.info(f"metrics computed successfully./nsilhouette_score: {score1}/ncalinski_harabasz_score: {score2}")
        
        df['labels'] = labels
        logger.info(f"labels concatenated with dataframe.")

        return df
    except Exception as e:
        logger.error("Some unexpected error occured: ",e)
        raise


def main():
    '''
    This upload clean data from data/clean_data,
    and pass has argument to train_model.

    save the returned model using pickel.
    in the moddels folder.
    '''
    
    try:
        models_path = r'E:\TY\SESD\SESD-PROJECT\models'
        os.makedirs(models_path, exist_ok=True)
        logger.info(f"Models folder created: {models_path}")
        
        data_path = r'E:\TY\SESD\SESD-PROJECT\data\clean_data\train_data.npy'
        train_data = np.load(data_path)
        logger.info(f"Data loaded from: {data_path}\n Type: {train_data.dtype}\n Shape: {train_data.shape}")
        
        model = train_model(train_data)
        logger.info("Model trained successfully.")
        
        file_path = os.path.join(models_path, 'model_v0.0.pkl')
        logger.info(f"Saving model to: {file_path}")
        
        df_path = r"E:\TY\SESD\SESD-PROJECT\music-store\music_data.csv"
        df = pd.read_csv(df_path)
        df = evalute(model, train_data, df)
        logger.info("Model evaluat successfull.")
        
        music_list_path = r'E:\TY\SESD\SESD-PROJECT\music-store'
        df.to_csv(os.path.join(music_list_path, 'music_list.csv'), index=False)
        logger.info(f"music-list saved successfully in: {music_list_path}")
        
        with open(file_path, 'wb') as f: 
            pickle.dump(model, f, pickle.HIGHEST_PROTOCOL)
        logger.info("Model saved successfully.")
        
    except Exception as e:
        logger.error(f"Unexpected error occurred: {e}", exc_info=True)
        raise

if __name__ == "__main__":
    main()


























































































































































































































































































































































































