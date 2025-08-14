import os
import pandas as pd
import numpy as np
from sklearn.preprocessing import StandardScaler
from utils.logs import get_logger

logger = get_logger(__name__, file_name="preprocessing.log")


def preprocess(df: pd.DataFrame) -> np.ndarray:
    """
    Preprocess the data by:
    1. Removing unnecessary columns.
    2. Scaling numeric features using StandardScaler.
    
    Parameters:
        df (pd.DataFrame): Input DataFrame.
        
    Returns:
        np.ndarray: Transformed data.
    """
    try:
        # Drop 'index' column if present
        if 'index' in df.columns:
            df.drop(columns=['index'], inplace=True)
            logger.info("'index' column removed.")
        else:
            logger.warning("'index' column not found. Skipping removal.")

        # Check for empty DataFrame
        if df.empty:
            logger.error("Input DataFrame is empty after column removal.")
            raise ValueError("No data to process.")

        # Scaling
        scaler = StandardScaler()
        logger.info("Created instance of StandardScaler.")

        df_transformed = scaler.fit_transform(df)
        logger.info(
            "Data transformation completed. Before: %s, After: %s",
            df.shape,
            df_transformed.shape
        )

        return df_transformed

    except Exception:
        logger.exception("Unexpected error occurred during preprocessing.")
        raise


def main():
    """
    Main function to load, preprocess, and save cleaned data.
    """
    try:
        logger.info("Data preprocessing started.")

        data_path = r"E:\TY\SESD\SESD-PROJECT\data\clean_data\clean_data_set2.csv"
        if not os.path.exists(data_path):
            logger.error("Data file not found at path: %s", data_path)
            raise FileNotFoundError(f"Data file not found: {data_path}")

        df = pd.read_csv(data_path)
        logger.info("Data loaded successfully from %s", data_path)

        train_data = preprocess(df)

        clean_data_path = os.path.join("data", "clean_data")
        os.makedirs(clean_data_path, exist_ok=True)
        output_file = os.path.join(clean_data_path, "train_data.npy")

        np.save(output_file, train_data)
        logger.info("Clean data saved to %s", output_file)

    except FileNotFoundError:
        logger.exception("File not found error.")
        raise
    except Exception:
        logger.exception("Unexpected error occurred in main().")
        raise


if __name__ == "__main__":
    main()
