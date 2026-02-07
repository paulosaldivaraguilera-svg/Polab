#!/usr/bin/env python3
"""
Market Maker Bot - PauloARIS Trading Bot
Grid Trading + DCA Strategy
Paper Mode (No real money)
"""

import os
import sys
import time
import json
import logging
from datetime import datetime
from dataclasses import dataclass
from typing import Optional, List
from enum import Enum

# Configuration
LOG_LEVEL = os.getenv('LOG_LEVEL', 'INFO')
EXCHANGE = os.getenv('EXCHANGE', 'binance')  # binance, coinbase
MODE = os.getenv('MODE', 'paper')  # paper, live
TRADING_PAIR = os.getenv('TRADING_PAIR', 'BTC/USDT')

# Strategy parameters
GRID_LEVELS = int(os.getenv('GRID_LEVELS', '10'))
GRID_SPREAD = float(os.getenv('GRID_SPREAD', '0.01'))  # 1%
DCA_AMOUNT = float(os.getenv('DCA_AMOUNT', '10'))  # USDT
DCA_INTERVAL = int(os.getenv('DCA_INTERVAL', '3600'))  # 1 hour

# Logging setup
logging.basicConfig(
    level=getattr(logging, LOG_LEVEL),
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger('MarketMakerBot')


class TradingMode(Enum):
    PAPER = "paper"
    LIVE = "live"


class OrderStatus(Enum):
    PENDING = "pending"
    FILLED = "filled"
    CANCELLED = "cancelled"
    REJECTED = "rejected"


class OrderType(Enum):
    BUY = "buy"
    SELL = "sell"


@dataclass
class Order:
    id: str
    type: OrderType
    status: OrderStatus
    price: float
    quantity: float
    timestamp: datetime
    fee: float = 0.0
    
    def to_dict(self):
        return {
            'id': self.id,
            'type': self.type.value,
            'status': self.status.value,
            'price': self.price,
            'quantity': self.quantity,
            'timestamp': self.timestamp.isoformat(),
            'fee': self.fee
        }


@dataclass
class Position:
    symbol: str
    side: OrderType
    entry_price: float
    quantity: float
    unrealized_pnl: float = 0.0
    
    def to_dict(self):
        return {
            'symbol': self.symbol,
            'side': self.side.value,
            'entry_price': self.entry_price,
            'quantity': self.quantity,
            'unrealized_pnl': self.unrealized_pnl
        }


class MarketMakerBot:
    """Market Maker Bot with Grid Trading + DCA"""
    
    def __init__(self, mode: TradingMode = TradingMode.PAPER):
        self.mode = mode
        self.running = False
        self.balance_usdt = 10000.0  # Paper balance
        self.balance_btc = 0.0
        self.current_price = 0.0
        self.orders: List[Order] = []
        self.positions: List[Position] = []
        self.grid_levels: List[float] = []
        
        logger.info(f"Market Maker Bot initialized")
        logger.info(f"Mode: {self.mode.value}")
        logger.info(f"Exchange: {EXCHANGE}")
        logger.info(f"Trading Pair: {TRADING_PAIR}")
        logger.info(f"Grid Levels: {GRID_LEVELS}")
        logger.info(f"Grid Spread: {GRID_SPREAD * 100}%")
        logger.info(f"DCA Amount: ${DCA_AMOUNT} USDT")
        logger.info(f"DCA Interval: {DCA_INTERVAL}s")
    
    def get_current_price(self) -> float:
        """Get current price from exchange (simulated in paper mode)"""
        if self.mode == TradingMode.PAPER:
            # Simulated price movement
            if self.current_price == 0:
                self.current_price = 45000.0  # Starting BTC price
            
            # Random walk simulation
            import random
            change_pct = (random.random() - 0.5) * 0.002  # ±0.1%
            self.current_price *= (1 + change_pct)
            
            return self.current_price
        else:
            # Real exchange API call (to be implemented)
            pass
    
    def calculate_grid_levels(self, base_price: float) -> List[float]:
        """Calculate grid levels around current price"""
        levels = []
        for i in range(-GRID_LEVELS // 2, GRID_LEVELS // 2 + 1):
            level_price = base_price * (1 + GRID_SPREAD * i)
            levels.append(level_price)
        return sorted(levels)
    
    def place_grid_orders(self) -> List[Order]:
        """Place buy/sell orders at grid levels"""
        if not self.grid_levels:
            return []
        
        orders = []
        base_price = self.current_price
        
        for level in self.grid_levels:
            if level < base_price:
                # Buy order below current price
                quantity = DCA_AMOUNT / level
                order = Order(
                    id=f"grid_buy_{int(time.time())}_{len(orders)}",
                    type=OrderType.BUY,
                    status=OrderStatus.PENDING,
                    price=level,
                    quantity=quantity,
                    timestamp=datetime.now()
                )
                orders.append(order)
            elif level > base_price:
                # Sell order above current price
                if self.balance_btc > 0:
                    quantity = min(self.balance_btc, 0.01)  # Sell max 0.01 BTC
                    order = Order(
                        id=f"grid_sell_{int(time.time())}_{len(orders)}",
                        type=OrderType.SELL,
                        status=OrderStatus.PENDING,
                        price=level,
                        quantity=quantity,
                        timestamp=datetime.now()
                    )
                    orders.append(order)
        
        self.orders.extend(orders)
        logger.info(f"Placed {len(orders)} grid orders")
        for order in orders:
            logger.debug(f"  {order.type.value} {order.quantity:.8f} @ {order.price:.2f}")
        
        return orders
    
    def execute_dca(self):
        """Execute Dollar Cost Average buy"""
        if self.mode == TradingMode.PAPER:
            quantity = DCA_AMOUNT / self.current_price
            self.balance_usdt -= DCA_AMOUNT
            self.balance_btc += quantity
            
            logger.info(f"DCA Buy: {quantity:.8f} BTC @ ${self.current_price:.2f} = ${DCA_AMOUNT}")
            logger.info(f"Balance: ${self.balance_usdt:.2f} USDT, {self.balance_btc:.8f} BTC")
    
    def check_filled_orders(self):
        """Check if any orders should be filled"""
        if self.mode == TradingMode.PAPER:
            filled_orders = []
            
            for order in self.orders:
                if order.status == OrderStatus.PENDING:
                    should_fill = False
                    
                    if order.type == OrderType.BUY and self.current_price <= order.price:
                        should_fill = True
                    elif order.type == OrderType.SELL and self.current_price >= order.price:
                        should_fill = True
                    
                    if should_fill:
                        order.status = OrderStatus.FILLED
                        filled_orders.append(order)
                        
                        # Update balances
                        if order.type == OrderType.BUY:
                            fee = order.price * order.quantity * 0.001  # 0.1% fee
                            total_cost = order.price * order.quantity + fee
                            self.balance_usdt -= total_cost
                            self.balance_btc += order.quantity
                        elif order.type == OrderType.SELL:
                            fee = order.price * order.quantity * 0.001
                            total_received = order.price * order.quantity - fee
                            self.balance_usdt += total_received
                            self.balance_btc -= order.quantity
                        
                        logger.info(f"Order filled: {order.type.value} {order.quantity:.8f} @ ${order.price:.2f}")
            
            return filled_orders
        
        return []
    
    def calculate_pnl(self) -> float:
        """Calculate total PnL (profit and loss)"""
        # Initial portfolio value
        initial_value = 10000.0  # Starting with 10000 USDT
        
        # Current portfolio value
        current_btc_value = self.balance_btc * self.current_price
        current_value = self.balance_usdt + current_btc_value
        
        # PnL
        pnl = current_value - initial_value
        pnl_pct = (pnl / initial_value) * 100
        
        return pnl, pnl_pct
    
    def get_status(self) -> dict:
        """Get bot status"""
        pnl, pnl_pct = self.calculate_pnl()
        
        return {
            'mode': self.mode.value,
            'running': self.running,
            'current_price': self.current_price,
            'balance_usdt': self.balance_usdt,
            'balance_btc': self.balance_btc,
            'portfolio_value': self.balance_usdt + (self.balance_btc * self.current_price),
            'pnl': pnl,
            'pnl_pct': pnl_pct,
            'active_orders': len([o for o in self.orders if o.status == OrderStatus.PENDING]),
            'filled_orders': len([o for o in self.orders if o.status == OrderStatus.FILLED])
        }
    
    def run(self):
        """Main bot loop"""
        self.running = True
        logger.info("Starting Market Maker Bot...")
        
        dca_counter = 0
        
        try:
            while self.running:
                # Get current price
                self.current_price = self.get_current_price()
                logger.info(f"Current price: ${self.current_price:.2f}")
                
                # Calculate grid levels (if first run or price moved significantly)
                if not self.grid_levels or abs(self.current_price - self.grid_levels[len(self.grid_levels)//2]) > self.current_price * 0.02:
                    self.grid_levels = self.calculate_grid_levels(self.current_price)
                    logger.info(f"Grid levels recalculated: {len(self.grid_levels)} levels")
                    self.place_grid_orders()
                
                # Check for filled orders
                filled = self.check_filled_orders()
                
                # Execute DCA every interval
                dca_counter += 1
                if dca_counter >= DCA_INTERVAL:
                    self.execute_dca()
                    dca_counter = 0
                
                # Print status
                status = self.get_status()
                logger.info(f"Status: USDT=${status['balance_usdt']:.2f}, "
                          f"BTC={status['balance_btc']:.8f}, "
                          f"PnL={status['pnl_pct']:+.2f}%")
                
                # Save status to file
                self.save_status(status)
                
                # Wait
                time.sleep(10)  # Check every 10 seconds
        
        except KeyboardInterrupt:
            logger.info("Bot stopped by user")
        except Exception as e:
            logger.error(f"Error: {e}")
        finally:
            self.running = False
            self.shutdown()
    
    def save_status(self, status: dict):
        """Save bot status to JSON file"""
        status_file = '/home/pi/.openclaw/workspace/state/trading-bot-status.json'
        status['timestamp'] = datetime.now().isoformat()
        
        try:
            with open(status_file, 'w') as f:
                json.dump(status, f, indent=2)
        except Exception as e:
            logger.error(f"Failed to save status: {e}")
    
    def shutdown(self):
        """Graceful shutdown"""
        logger.info("Shutting down...")
        logger.info(f"Final balances: ${self.balance_usdt:.2f} USDT, {self.balance_btc:.8f} BTC")
        pnl, pnl_pct = self.calculate_pnl()
        logger.info(f"Total PnL: ${pnl:.2f} ({pnl_pct:+.2f}%)")


def main():
    """Main entry point"""
    print("\n" + "="*60)
    print("🤖 MARKET MAKER BOT - PauloARIS")
    print("="*60)
    print(f"\n⏰ Started: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print(f"🌐 Exchange: {EXCHANGE}")
    print(f"📊 Pair: {TRADING_PAIR}")
    print(f"🎯 Mode: {MODE}")
    print(f"📈 Grid Levels: {GRID_LEVELS}")
    print(f"💰 DCA Amount: ${DCA_AMOUNT}")
    print("\n" + "="*60)
    
    # Check mode
    if MODE == "live":
        response = input("\n⚠️  LIVE MODE - Real money will be traded!\n"
                      "Type 'CONFIRM' to continue: ")
        if response != "CONFIRM":
            print("Aborted.")
            sys.exit(0)
    
    # Create bot
    bot = MarketMakerBot(mode=TradingMode(MODE))
    
    # Run bot
    bot.run()


if __name__ == "__main__":
    main()
