"""Currency normalization service for retail order transactions."""

from datetime import date
from decimal import Decimal, ROUND_HALF_UP
import logging
from typing import Dict, Optional, Union

logger = logging.getLogger(__name__)

# Default reference exchange rates to USD (base rate: 1 unit of foreign currency = X USD)
DEFAULT_EXCHANGE_RATES: Dict[str, Decimal] = {
    "USD": Decimal("1.0000"),
    "EUR": Decimal("1.0850"),
    "GBP": Decimal("1.2750"),
    "CAD": Decimal("0.7350"),
    "AUD": Decimal("0.6550"),
    "JPY": Decimal("0.0067"),
    "CHF": Decimal("1.1250"),
    "CNY": Decimal("0.1380"),
    "INR": Decimal("0.0120"),
    "MXN": Decimal("0.0550"),
    "BRL": Decimal("0.1800"),
    "SGD": Decimal("0.7450"),
    "NZD": Decimal("0.6050"),
    "HKD": Decimal("0.1280"),
    "SEK": Decimal("0.0950"),
    "NOK": Decimal("0.0920"),
}


class CurrencyNormalizer:
    """Service to normalize transaction amounts in foreign currencies to USD."""

    def __init__(
        self,
        custom_rates: Optional[Dict[str, Union[float, Decimal]]] = None,
        date_specific_rates: Optional[Dict[str, Dict[str, Union[float, Decimal]]]] = None,
    ):
        self.rates: Dict[str, Decimal] = {
            k.upper(): Decimal(str(v)) for k, v in DEFAULT_EXCHANGE_RATES.items()
        }
        if custom_rates:
            for k, v in custom_rates.items():
                self.rates[k.upper()] = Decimal(str(v))

        # Date-specific rates dictionary: {"YYYY-MM-DD": {"EUR": Decimal("1.09"), ...}}
        self.date_specific_rates: Dict[str, Dict[str, Decimal]] = {}
        if date_specific_rates:
            for d_str, rates_map in date_specific_rates.items():
                self.date_specific_rates[d_str] = {
                    k.upper(): Decimal(str(v)) for k, v in rates_map.items()
                }

    def get_exchange_rate(
        self,
        currency: str,
        rate_date: Optional[Union[str, date]] = None,
    ) -> Decimal:
        """Fetch the USD exchange rate for a currency, optionally checking date-specific rates."""
        curr_upper = currency.strip().upper() if currency else "USD"

        if curr_upper == "USD":
            return Decimal("1.0000")

        # Check date-specific rate if date is provided
        if rate_date:
            date_key = str(rate_date)
            if (
                date_key in self.date_specific_rates
                and curr_upper in self.date_specific_rates[date_key]
            ):
                return self.date_specific_rates[date_key][curr_upper]

        if curr_upper in self.rates:
            return self.rates[curr_upper]

        logger.warning(
            "Currency '%s' not found in exchange rate tables. Defaulting to 1.0 (USD equivalent).",
            curr_upper,
        )
        return Decimal("1.0000")

    def convert_to_usd(
        self,
        amount: Union[float, int, str, Decimal],
        currency: str,
        rate_date: Optional[Union[str, date]] = None,
    ) -> tuple[Decimal, Decimal]:
        """
        Convert an original amount into USD using the appropriate exchange rate.

        Returns:
            (amount_usd, exchange_rate_used) as Decimals rounded to 4 decimal places for rate
            and 2 decimal places for amount.
        """
        try:
            amt_decimal = Decimal(str(amount))
        except Exception as e:
            raise ValueError(f"Invalid numeric amount '{amount}': {e}") from e

        rate = self.get_exchange_rate(currency, rate_date)
        amount_usd = (amt_decimal * rate).quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)
        rate_used = rate.quantize(Decimal("0.0001"), rounding=ROUND_HALF_UP)

        return amount_usd, rate_used
