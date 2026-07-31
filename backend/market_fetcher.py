import urllib.request
import urllib.parse
import json
import re

def get_live_market_data(query: str) -> str:
    query_lower = query.lower()
    
    # If the user isn't asking for live data like price, share, stock, nav, fund, don't delay the response
    keywords = ["price", "stock", "share", "nav", "mutual fund", "fund", "rate", "value", "current"]
    if not any(k in query_lower for k in keywords):
        return ""
        
    # Clean up query while preserving fund name keywords
    stop_phrases = ["what is the price of", "what is the", "current nav of", "current value of", 
                     "show me", "search for", "find", "tell me about", "add", "track"]
    extracted_query = query_lower
    for phrase in stop_phrases:
        extracted_query = extracted_query.replace(phrase, "")
    # Remove generic words but preserve fund-specific terms
    for word in ["stock", "price", "rate", "current", "value", "please", "the", "of"]:
        extracted_query = extracted_query.replace(word, "")
    extracted_query = extracted_query.strip(" ?.!,")
    if not extracted_query or len(extracted_query) < 2:
        return ""

    results = []

    # 1. Try fetching from MF API - use search endpoint first (faster)
    try:
        url = f"https://api.mfapi.in/mf/search?q={urllib.parse.quote(extracted_query)}"
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
        res = urllib.request.urlopen(req, timeout=5).read()
        funds = json.loads(res)[:3]  # Get top 3 matches
        for f in funds:
            code = f['schemeCode']
            detail_url = f"https://api.mfapi.in/mf/{code}"
            detail_req = urllib.request.Request(detail_url, headers={'User-Agent': 'Mozilla/5.0'})
            detail_res = urllib.request.urlopen(detail_req, timeout=3).read()
            detail = json.loads(detail_res)
            if detail.get('data') and len(detail['data']) > 0:
                results.append(f"Mutual Fund: {detail['meta']['scheme_name']} (Code: {code}) | Current NAV: ₹{detail['data'][0]['nav']} (as of {detail['data'][0]['date']})")
    except Exception as e:
        pass

    # 2. Try fetching from Yahoo Finance (for stocks)
    try:
        # We search Yahoo finance for the ticker
        search_query = extracted_query
        if "reliance" in search_query.lower() and "nippon" not in search_query.lower():
            search_query = "RELIANCE.NS"
        elif "sbi" in search_query.lower() and "fund" not in search_query.lower():
            search_query = "SBIN.NS"
        elif "hdfc" in search_query.lower() and "fund" not in search_query.lower():
            search_query = "HDFCBANK.NS"
        elif "tcs" in search_query.lower():
            search_query = "TCS.NS"
        elif "itc" in search_query.lower():
            search_query = "ITC.NS"
        elif "infosys" in search_query.lower() or "infy" in search_query.lower():
            search_query = "INFY.NS"
            
        y_url = f"https://query2.finance.yahoo.com/v1/finance/search?q={urllib.parse.quote(search_query)}"
        y_req = urllib.request.Request(y_url, headers={'User-Agent': 'Mozilla/5.0'})
        y_res = urllib.request.urlopen(y_req, timeout=3).read()
        y_data = json.loads(y_res)
        
        if y_data.get('quotes') and len(y_data['quotes']) > 0:
            best_ticker = None
            for q in y_data['quotes']:
                # Prioritize NSE/BSE Indian stocks if we are in India app
                if q.get('exchange') in ['NSI', 'BSE', 'NSE']:
                    best_ticker = q.get('symbol')
                    break
            if not best_ticker:
                best_ticker = y_data['quotes'][0].get('symbol')
                
            if best_ticker:
                # Fetch live price
                p_url = f"https://query1.finance.yahoo.com/v8/finance/chart/{best_ticker}"
                p_req = urllib.request.Request(p_url, headers={'User-Agent': 'Mozilla/5.0'})
                p_res = urllib.request.urlopen(p_req, timeout=3).read()
                p_data = json.loads(p_res)
                
                meta = p_data['chart']['result'][0]['meta']
                price = meta['regularMarketPrice']
                currency = meta['currency']
                symbol = meta['symbol']
                results.append(f"Stock: {symbol} | Current Price: {price} {currency}")
    except Exception as e:
        pass

    if results:
        return "LIVE MARKET DATA: " + " | ".join(results)
    return ""
