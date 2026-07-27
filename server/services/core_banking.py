import uuid
from decimal import Decimal
from sqlalchemy.orm import Session
from server.models import Account, Transaction


class CoreBankingService:
    @staticmethod
    def verify_account_balance(db: Session, account_id: str, amount: Decimal) -> bool:
        """Verify if the account has sufficient balance in the core banking system."""
        account = db.query(Account).filter(Account.id == account_id).first()
        if not account:
            return False
        return account.balance >= amount

    @staticmethod
    def execute_transfer(
        db: Session, source_account_id: str, dest_account_id: str, amount: Decimal
    ) -> str:
        """Execute a funds transfer in the core banking system and return a transaction ID."""
        source_account = (
            db.query(Account).filter(Account.id == source_account_id).first()
        )
        dest_account = db.query(Account).filter(Account.id == dest_account_id).first()

        if not source_account or not dest_account:
            raise ValueError("Invalid accounts")

        if source_account.balance < amount:
            raise ValueError("Insufficient funds")

        # Update balances
        source_account.balance -= amount
        dest_account.balance += amount

        # Generate core banking transaction ID
        core_tx_id = "CORE-TXN-" + str(uuid.uuid4())[:8].upper()

        # Create transaction records
        source_tx = Transaction(
            account_id=source_account.id,
            description=f"Transfer to {dest_account.account_type} (...{dest_account.account_number_masked[-4:]})",
            category="Transfer",
            amount=-amount,
            status="completed",
            reference_id="TXN" + str(uuid.uuid4())[:8].upper(),
        )
        dest_tx = Transaction(
            account_id=dest_account.id,
            description=f"Transfer from {source_account.account_type} (...{source_account.account_number_masked[-4:]})",
            category="Transfer",
            amount=amount,
            status="completed",
            reference_id="TXN" + str(uuid.uuid4())[:8].upper(),
        )
        db.add_all([source_tx, dest_tx])
        db.commit()

        return core_tx_id
