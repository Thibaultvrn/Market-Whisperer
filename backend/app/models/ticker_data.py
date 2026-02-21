"""TickerData — Section 11.2."""

from pydantic import BaseModel


class TickerData(BaseModel):
    symbol: str
    sector: str
    country: str
