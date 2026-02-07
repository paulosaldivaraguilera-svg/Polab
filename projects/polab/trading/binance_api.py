#!/usr/bin/env python3
"""
Binance Exchange API Integration for PauloARIS Trading Bot
REST API for spot trading
"""

import os
import time
import hmac
import hashlib
import logging
import json
import requests
from datetime import datetime
from typing import Optional, Dict, List

# Configuration
API_KEY = os.getenv('BINANCE_API_KEY', '')
API_SECRET = os.getenv('BINANCE_API_SECRET', '')
BASE_URL = 'https://api.binance.com'
TESTNET_URL = 'https://testnet.binance.vision'

# Rate limits (Binance)
REQUESTS_PER_MINUTE = 1200
REQUESTS_PER_SECOND = 20
REQUEST_WEIGHT = 2400

# Logging setup
logging.basicConfig(
    level=getattr(logging, os.getenv('LOG_LEVEL', 'INFO')),
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger('BinanceAPI')


class BinanceAPI:
    """Binance REST API client"""
    
    def __init__(self, api_key: str, api_secret: str, testnet: bool = False):
        self.api_key = api_key
        self.api_secret = api_secret
        self.testnet = testnet
        self.base_url = TESTNET_URL if testnet else BASE_URL
        
        logger.info(f"Binance API {'Testnet' if testnet else 'Mainnet'} initialized")
    
    def _generate_signature(self, params: Dict, timestamp: int) -> str:
        """Generate HMAC SHA256 signature for signed requests"""
        query_string = '&'.join([f"{k}={v}" for k, v in sorted(params.items())])
        
        signature = hmac.new(
            self.api_secret.encode('utf-8'),
            query_string.encode('utf-8'),
            hashlib.sha256
        ).hexdigest()
        
        return signature
    
    def _make_request(self, method: str, endpoint: str, signed: bool = False,
                    params: Optional[Dict] = None, data: Optional[Dict] = None) -> Dict:
        """Make HTTP request to Binance API with retry logic"""
        url = f"{self.base_url}{endpoint}"
        headers = {
            'X-MBX-APIKEY': self.api_key,
            'Content-Type': 'application/json'
        }
        
        # Add signature if required
        if signed:
            timestamp = int(time.time() * 1000)
            params = params or {}
            params['timestamp'] = timestamp
            params['recvWindow'] = 5000  # 5 seconds
            
            signature = self._generate_signature(params, timestamp)
            headers['X-MBX-SIGNATURE'] = signature
            headers['X-MBX-TIMESTAMP'] = str(timestamp)
        
        # Retry logic
        max_retries = 3
        for attempt in range(max_retries):
            try:
                if method == 'GET':
                    response = requests.get(url, headers=headers, params=params, timeout=10)
                elif method == 'POST':
                    response = requests.post(url, headers=headers, params=params, json=data, timeout=10)
                elif method == 'DELETE':
                    response = requests.delete(url, headers=headers, params=params, timeout=10)
                
                # Check rate limits
                if response.status_code == 418:
                    retry_after = int(response.headers.get('Retry-After', 1))
                    logger.warning(f"Rate limited. Retry after {retry_after}s")
                    time.sleep(retry_after)
                    continue
                elif response.status_code == 429:
                    retry_after = int(response.headers.get('Retry-After', 60))
                    logger.warning(f"Too many requests. Retry after {retry_after}s")
                    time.sleep(retry_after)
                    continue
                
                return response
                
            except requests.exceptions.RequestException as e:
                logger.error(f"Request failed (attempt {attempt + 1}/{max_retries}): {e}")
                if attempt < max_retries - 1:
                    time.sleep(2 ** attempt)  # Exponential backoff
        
        logger.error(f"Max retries exceeded for {endpoint}")
        return None
    
    def get_account_info(self) -> Optional[Dict]:
        """Get account information"""
        logger.debug("Fetching account info...")
        response = self._make_request('GET', '/api/v3/account', signed=True)
        
        if response and response.status_code == 200:
            return response.json()
        else:
            logger.error(f"Failed to fetch account info: {response.status_code if response else 'None'}")
            return None
    
    def get_account_status(self) -> Optional[Dict]:
        """Get account status (trading enabled)"""
        response = self._make_request('GET', '/api/v3/account/status', signed=True)
        
        if response and response.status_code == 200:
            return response.json()
        else:
            return None
    
    def get_ticker_price(self, symbol: str) -> Optional[float]:
        """Get current price for a trading pair"""
        endpoint = f'/api/v3/ticker/price'
        params = {'symbol': symbol}
        
        response = self._make_request('GET', endpoint)
        
        if response and response.status_code == 200:
            data = response.json()
            return float(data['price'])
        else:
            logger.error(f"Failed to fetch ticker price: {response.status_code if response else 'None'}")
            return None
    
    def get_symbol_info(self, symbol: str) -> Optional[Dict]:
        """Get exchange symbol information"""
        endpoint = f'/api/v3/exchangeInfo'
        params = {'symbol': symbol}
        
        response = self._make_request('GET', endpoint)
        
        if response and response.status_code == 200:
            data = response.json()
            if symbol in data.get('symbols', []):
                return data['symbols'][0]
        
        return None
    
    def place_order(self, symbol: str, side: str, order_type: str, 
                  quantity: float, price: Optional[float] = None) -> Optional[Dict]:
        """Place a new order on Binance"""
        logger.info(f"Placing {side} order: {quantity} {symbol} @ {price if price else 'MARKET'}")
        
        endpoint = '/api/v3/order/test' if self.testnet else '/api/v3/order'
        
        params = {
            'symbol': symbol,
            'side': side.upper(),
            'type': order_type.upper(),
            'quantity': f"{quantity:.8f}",
        }
        
        if price:
            params['price'] = f"{price:.2f}"
            params['timeInForce'] = 'GTC'  # Good Till Cancelled
        else:
            params['timeInForce'] = 'IOC'  # Immediate Or Cancel
        
        response = self._make_request('POST', endpoint, signed=True, params=params)
        
        if response and response.status_code in [200, 201]:
            logger.info(f"✅ Order placed successfully: {response.json()}")
            return response.json()
        else:
            error_msg = response.text if response else 'Unknown error'
            logger.error(f"❌ Order failed: {response.status_code} - {error_msg}")
            return None
    
    def get_open_orders(self, symbol: Optional[str] = None) -> Optional[List[Dict]]:
        """Get all open orders"""
        endpoint = '/api/v3/openOrders'
        params = {}
        
        if symbol:
            params['symbol'] = symbol
        
        response = self._make_request('GET', endpoint, signed=True, params=params)
        
        if response and response.status_code == 200:
            return response.json()
        else:
            logger.error(f"Failed to fetch open orders: {response.status_code if response else 'None'}")
            return None
    
    def cancel_order(self, symbol: str, order_id: str) -> bool:
        """Cancel an existing order"""
        logger.info(f"Cancelling order {order_id}...")
        
        endpoint = '/api/v3/order'
        params = {
            'symbol': symbol,
            'orderId': order_id
        }
        
        response = self._make_request('DELETE', endpoint, signed=True, params=params)
        
        if response and response.status_code == 200:
            logger.info(f"✅ Order cancelled successfully")
            return True
        else:
            logger.error(f"❌ Cancel order failed: {response.status_code if response else 'None'}")
            return False
    
    def get_order(self, symbol: str, order_id: str) -> Optional[Dict]:
        """Check order status"""
        endpoint = '/api/v3/order'
        params = {
            'symbol': symbol,
            'orderId': order_id
        }
        
        response = self._make_request('GET', endpoint, signed=True, params=params)
        
        if response and response.status_code == 200:
            return response.json()
        else:
            return None


def main():
    """Test Binance API integration"""
    print("\n" + "="*60)
    print("🔷 BINANCE API INTEGRATION TEST")
    print("="*60)
    
    if not API_KEY or not API_SECRET:
        print("\n⚠️  WARNING: API credentials not set")
        print("Set environment variables:")
        print("  export BINANCE_API_KEY='your_key'")
        print("  export BINANCE_API_SECRET='your_secret'")
        print("  export BINANCE_TESTNET='true'  # Optional, for testnet")
        print("\nFor testnet credentials:")
        print("  https://testnet.binance.vision/")
        sys.exit(1)
    
    # Initialize API client
    testnet = os.getenv('BINANCE_TESTNET', 'false').lower() == 'true'
    api = BinanceAPI(API_KEY, API_SECRET, testnet=testnet)
    
    print(f"\n🌐 Mode: {'TESTNET' if testnet else 'MAINNET'}")
    print(f"📊 Trading Pair: {os.getenv('TRADING_PAIR', 'BTCUSDT')}")
    
    # Test 1: Get account info
    print("\n" + "-"*60)
    print("Test 1: Account Information")
    print("-"*60)
    
    account_info = api.get_account_info()
    if account_info:
        print(f"✅ Account connected")
        print(f"   Balances:")
        for balance in account_info.get('balances', []):
            if float(balance['free']) > 0:
                print(f"   - {balance['asset']}: {float(balance['free']):.8f}")
    else:
        print("❌ Failed to fetch account info")
    
    # Test 2: Get current price
    print("\n" + "-"*60)
    print("Test 2: Current Price")
    print("-"*60)
    
    symbol = os.getenv('TRADING_PAIR', 'BTCUSDT')
    price = api.get_ticker_price(symbol)
    if price:
        print(f"✅ Current {symbol} price: ${price:.2f}")
    else:
        print("❌ Failed to fetch price")
    
    # Test 3: Get symbol info
    print("\n" + "-"*60)
    print("Test 3: Symbol Information")
    print("-"*60)
    
    symbol_info = api.get_symbol_info(symbol)
    if symbol_info:
        print(f"✅ Symbol: {symbol_info['symbol']}")
        print(f"   Status: {'Trading Enabled' if symbol_info.get('status') == 'TRADING' else 'Trading Disabled'}")
        print(f"   Filters: {symbol_info.get('filters', [])}")
    else:
        print("❌ Failed to fetch symbol info")
    
    print("\n" + "="*60)
    print("✅ Binance API integration test completed")
    print("="*60)


if __name__ == '__main__':
    main()
