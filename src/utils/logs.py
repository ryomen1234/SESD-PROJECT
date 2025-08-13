import logging
import os

log_path = 'logs'
os.makedirs(log_path, exist_ok=True)

def get_logger(name: str, file_name: str = "logs.log") -> logging.Logger:
       
       log_file_path = os.path.join(log_path, file_name)
       logger = logging.getLogger(name)
       logger.setLevel(logging.DEBUG)

       if not logger.handlers:
              file_logger = logging.FileHandler(log_file_path)
              console_logger = logging.StreamHandler()

              file_logger.setLevel(logging.DEBUG)
              console_logger.setLevel(logging.DEBUG)

              formatter = logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s')
              file_logger.setFormatter(formatter)
              console_logger.setFormatter(formatter)

              logger.addHandler(file_logger)
              logger.addHandler(console_logger)

       return logger
              

       
