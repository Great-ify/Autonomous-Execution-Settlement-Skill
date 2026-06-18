export class BlockchainError extends Error {
  constructor(public message: string) { super(message); }
}

export class TransactionTimeoutError extends BlockchainError {
  constructor(public message: string = 'Transaction timeout') { super(message); }
}

export class TransactionRevertedError extends BlockchainError {
  constructor(public message: string = 'Transaction reverted') { super(message); }
}

export class ProviderUnavailableError extends BlockchainError {
  constructor(public message: string = 'RPC provider unavailable') { super(message); }
}

export class ConfirmationFailureError extends BlockchainError {
  constructor(public message: string = 'Confirmation failure') { super(message); }
}
