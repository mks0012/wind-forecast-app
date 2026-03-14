import requests
import pandas as pd
import os

DATA_DIR_ANALYSIS = 'analysis/data'
DATA_DIR_PUBLIC = 'public/data'
HEADERS = {'Accept': 'application/json', 'User-Agent': 'Mozilla/5.0'}

def setup_directories():
    os.makedirs(DATA_DIR_ANALYSIS, exist_ok=True)
    os.makedirs(DATA_DIR_PUBLIC, exist_ok=True)

def fetch_wind_data():
    setup_directories()
    
    a_url = "https://data.elexon.co.uk/bmrs/api/v1/generation/actual/per-type?from=2024-01-01T00:00:00Z&to=2024-02-01T00:00:00Z"
    res_a = requests.get(a_url, headers=HEADERS)
    
    if res_a.status_code == 200:
        raw_rows = res_a.json().get('data', [])
        flattened = []
        for row in raw_rows:
            wind_gen = 0
            has_wind = False
            for entry in row.get('data', []):
                if entry.get('psrType') in ['Wind Onshore', 'Wind Offshore']:
                    wind_gen += (entry.get('quantity') or 0)
                    has_wind = True
            
            if has_wind:
                flattened.append({
                    'startTime': row['startTime'],
                    'generation': wind_gen
                })
        
        df_a = pd.DataFrame(flattened).sort_values('startTime')
        df_a.to_csv(f'{DATA_DIR_PUBLIC}/actuals_jan.csv', index=False)
        df_a.to_csv(f'{DATA_DIR_ANALYSIS}/actuals_jan.csv', index=False)
        print(f"Success: Processed {len(df_a)} actual generation records.")

    f_url = "https://data.elexon.co.uk/bmrs/api/v1/forecast/generation/wind/latest?from=2024-01-01T00:00:00Z&to=2024-02-01T00:00:00Z"
    res_f = requests.get(f_url, headers=HEADERS)
    
    if res_f.status_code == 200:
        df_f = pd.DataFrame(res_f.json().get('data', [])).sort_values('startTime')
        df_f.to_csv(f'{DATA_DIR_PUBLIC}/forecasts_jan.csv', index=False)
        df_f.to_csv(f'{DATA_DIR_ANALYSIS}/forecasts_jan.csv', index=False)
        print(f"Success: Processed {len(df_f)} forecast records.")

if __name__ == "__main__":
    fetch_wind_data()