# UK Wind Forecast Monitoring & Analysis

A comprehensive dashboard and analytical suite built to evaluate national-level wind power generation forecasts in the UK for January 2024.

## 🚀 Live Demo
- **App Link:** [Insert your Vercel/Heroku URL here]
- **Demo Video:** [Insert your Unlisted YouTube Link here]

## 🛠 Tech Stack
- **Frontend:** Next.js 14, TypeScript, Tailwind CSS
- **Visualization:** Recharts
- **Data Processing:** Python 3.14, Pandas, Jupyter
- **API Integration:** Elexon BMRS API

## 📂 Directory Structure
- `/app`: Next.js frontend with real-time MAE calculation and interactive charts.
- `/lib`: Core business logic for forecast horizon filtering and data normalization.
- `/public/data`: Flattened CSV datasets (Actuals and Forecasts) for Jan 2024.
- `/analysis`: 
    - `fetch_data.py`: Automated ETL script to pull and flatten BMRS API data.
    - `wind_analysis.ipynb`: Statistical analysis of error metrics and grid reliability.

## 📈 Analysis Summary
Located in `/analysis/wind_analysis.ipynb`, the study reveals:
- **Error Scaling**: A clear linear correlation between forecast horizon and Mean Absolute Error (MAE).
- **Reliability Recommendation**: Based on a 5th-percentile Cumulative Distribution Function (CDF) analysis, we recommend a reliable baseline of **[Insert MW from your notebook] MW**. This value represents the generation floor maintained 95% of the time during peak winter volatility.

## ⚙️ Setup Instructions
1. **Clone & Install**:
   ```bash
   git clone <repo-link>
   npm install

Update Data (Optional):

Bash

source venv/bin/activate
python3 analysis/fetch_data.py
Run Locally:

Bash

npm run dev