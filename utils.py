import yfinance as yf
from datetime import datetime
import sqlite3
import humanize

def format_date(pub_date):
    """Convert ISO 8601 date format to 'Month Day, Year' format"""
    pub_datetime = datetime.fromisoformat(pub_date.replace("Z", "+00:00"))
    return pub_datetime

def get_stock_news(ticker_symbol):
    """Fetch and return the latest stock news for the given ticker symbol, sorted by recent date"""
    stock = yf.Ticker(ticker_symbol)
    news = stock.news
    
    news_summary = [
        {
            "title": item["content"]["title"],
            "pubDate": format_date(item["content"]["pubDate"]).strftime("%B %d, %Y"),  # For display
            "date_obj": format_date(item["content"]["pubDate"]),  # For sorting
            "summary": item["content"].get("summary", "No summary available"),
            "url": item["content"]["canonicalUrl"]["url"]
        }
        for item in news[:6]  # Get only the first 6 items
    ]

    # Sort news by date (most recent first)
    sorted_news = sorted(news_summary, key=lambda x: x["date_obj"], reverse=True)

    return sorted_news

def get_companies():
    conn = sqlite3.connect("static/db/ESG_DATA.db",check_same_thread=False)  # Replace with your DB name
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM COMPANY")
    companies = cursor.fetchall()
    conn.close()
    return companies

def get_data_by_ticker(ticker):
    conn = sqlite3.connect("static/db/ESG_DATA.db",check_same_thread=False)  # Replace with your DB name
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM COMPANY WHERE ticker = ?", (ticker,))
    data = cursor.fetchone()
    conn.close()
    return data

def get_stock_data(ticker):
    stock = yf.Ticker(ticker)
    df = stock.history(period="1y")
    df.reset_index(inplace=True)
    df['Date'] = df['Date'].dt.strftime('%Y-%m-%d')  # Convert datetime to string
    return df[['Date', 'Open', 'High', 'Low', 'Close']].to_dict(orient="records")

def get_esg_risk(score):
    """Return ESG risk label and CSS class based on the ESG score."""
    if score < 10:
        return "Negligible Risk", "negligible-risk"
    elif 10 <= score < 20:
        return "Low Risk", "low-risk"
    elif 20 <= score < 30:
        return "Medium Risk", "medium-risk"
    elif 30 <= score < 40:
        return "High Risk", "high-risk"
    else:
        return "Severe Risk", "severe-risk"


def get_company_data(ticker):
    stock = yf.Ticker(ticker)
    company_data = stock.info
    extracted_data = {
    'longName': company_data.get('longName'),
    'country': company_data.get('country'),
    'website': company_data.get('website'),
    'sector': company_data.get('sector'),
    'fullTimeEmployees': humanize.intword(company_data.get('fullTimeEmployees')),
    'companyOfficers': [{'name': officer['name'], 'title': officer['title']} for officer in company_data.get('companyOfficers', [])],
    'irWebsite': company_data.get('irWebsite'),
    'totalRevenue': humanize.intword(company_data.get('totalRevenue')),
    'grossProfits': company_data.get('grossProfits'),
    'revenueGrowth': company_data.get('revenueGrowth')
    }
    return extracted_data

