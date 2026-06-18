import { describe, it, expect, vi, beforeEach } from 'vitest';

// ── Mocks ──────────────────────────────────────────────────────────────────
// All collaborators are mocked so this is a true unit test of orchestrator
// logic — no file I/O, no real blockchain calls.

const mockReleaseFunds = vi.fn();
const mockRefundFunds  = vi.fn();
const mockFreezeFunds  = vi.fn();

vi.mock('../blockchain/pharosSettlementProvider', () => ({
  PharosSettlementProvider: vi.fn().mockImplementation(() => ({
    releaseFunds: mockReleaseFunds,
    refundFunds:  mockRefundFunds,
    freezeFunds:  mockFreezeFunds,
  })),
}));

const mockIsProcessed    = vi.fn();
const mockMarkProcessed  = vi.fn();

vi.mock('../services/settlementIdempotency.service', () => ({
  SettlementIdempotencyService: vi.fn().mockImplementation(() => ({
    isProcessed:   mockIsProcessed,
    markProcessed: mockMarkProcessed,
  })),
}));

const mockFindByAgreementId = vi.fn();

vi.mock('../repositories/escrow.repository', () => ({
  FileEscrowRepository: vi.fn().mockImplementation(() => ({
    findByAgreementId: mockFindByAgreementId,
  })),
}));

const mockSettlementCreate = vi.fn();

vi.mock('../repositories/settlement.repository', () => ({
  FileSettlementRepository: vi.fn().mockImplementation(() => ({
    create: mockSettlementCreate,
    update: vi.fn(),
  })),
}));

const mockPublishEvent = vi.fn();

vi.mock('../events/eventBus', () => ({
  publishEvent: mockPublishEvent,
}));

vi.mock('../config/pharos.config', () => ({
  PHAROS_CONFIG: { ESCROW_CONTRACT: '0xMockContractAddress' },
}));

// Import after mocks are registered
import { orchestrateSettlement } from './orchestrator';
import { SettlementStatus } from '../types/settlement.types';
import { EscrowStatus } from '../types/escrow.types';
import { DecisionOutcome } from '../types/risk.types';

const FUNDED_ESCROW = {
  escrowId:    'escrow-1',
  agreementId: 'agreement-1',
  amount:      0.5,
  payerAgent:  'agent:payer',
  workerAgent: 'agent:worker',
  status:      EscrowStatus.FUNDED,
};

const SUCCESS_TX = {
  transactionHash: '0xabc123',
  blockNumber:     100,
  gasUsed:         21000n,
  timestamp:       new Date(),
  status:          'success' as const,
  confirmedAt:     new Date(),
  network:         'pharos-testnet',
};

describe('orchestrateSettlement', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockIsProcessed.mockResolvedValue(false);
    mockFindByAgreementId.mockResolvedValue({ ...FUNDED_ESCROW });
  });

  it('releases funds on APPROVED outcome and marks idempotency only after success', async () => {
    mockReleaseFunds.mockResolvedValue(SUCCESS_TX);

    await orchestrateSettlement('agreement-1', DecisionOutcome.APPROVED);

    expect(mockReleaseFunds).toHaveBeenCalledWith('agreement-1', FUNDED_ESCROW.amount);
    expect(mockRefundFunds).not.toHaveBeenCalled();

    expect(mockSettlementCreate).toHaveBeenCalledTimes(1);
    const record = mockSettlementCreate.mock.calls[0][0];
    expect(record.status).toBe(SettlementStatus.SETTLED);
    expect(record.transactionHash).toBe('0xabc123');
    expect(record.integrityHash).not.toBe('');

    // Idempotency must be marked AFTER persistence, and only on success
    expect(mockMarkProcessed).toHaveBeenCalledWith('agreement-1:RELEASE_FUNDS');
    expect(mockPublishEvent).toHaveBeenCalledWith('settlement.completed', expect.any(Object));
  });

  it('refunds funds on REJECTED outcome', async () => {
    mockRefundFunds.mockResolvedValue(SUCCESS_TX);

    await orchestrateSettlement('agreement-1', DecisionOutcome.REJECTED);

    expect(mockRefundFunds).toHaveBeenCalledWith('agreement-1', FUNDED_ESCROW.amount);
    expect(mockReleaseFunds).not.toHaveBeenCalled();
    expect(mockMarkProcessed).toHaveBeenCalledWith('agreement-1:REFUND_FUNDS');
  });

  it('freezes funds on an outcome with no explicit policy mapping', async () => {
    mockFreezeFunds.mockResolvedValue(SUCCESS_TX);

    await orchestrateSettlement('agreement-1', 'UNKNOWN_OUTCOME' as DecisionOutcome);

    expect(mockFreezeFunds).toHaveBeenCalledWith('agreement-1');
    expect(mockMarkProcessed).toHaveBeenCalledWith('agreement-1:FREEZE_FUNDS');
  });

  it('blocks duplicate settlement attempts before touching the chain', async () => {
    mockIsProcessed.mockResolvedValue(true);

    await orchestrateSettlement('agreement-1', DecisionOutcome.APPROVED);

    expect(mockReleaseFunds).not.toHaveBeenCalled();
    expect(mockFindByAgreementId).not.toHaveBeenCalled();
    expect(mockSettlementCreate).not.toHaveBeenCalled();
  });

  it('throws when the escrow is not in FUNDED status', async () => {
    mockFindByAgreementId.mockResolvedValue({ ...FUNDED_ESCROW, status: EscrowStatus.RELEASED });

    await expect(
      orchestrateSettlement('agreement-1', DecisionOutcome.APPROVED)
    ).rejects.toThrow(/Escrow validation failed/);

    expect(mockReleaseFunds).not.toHaveBeenCalled();
  });

  it('does NOT mark idempotency when the blockchain call fails, so a retry remains possible', async () => {
    mockReleaseFunds.mockRejectedValue(new Error('RPC timeout'));

    await expect(
      orchestrateSettlement('agreement-1', DecisionOutcome.APPROVED)
    ).rejects.toThrow('RPC timeout');

    // A failure record should still be persisted for audit purposes
    expect(mockSettlementCreate).toHaveBeenCalledTimes(1);
    const record = mockSettlementCreate.mock.calls[0][0];
    expect(record.status).toBe(SettlementStatus.SETTLEMENT_FAILED);
    expect(record.failureReason).toBe('RPC timeout');

    // Critical: idempotency must NOT be marked on failure
    expect(mockMarkProcessed).not.toHaveBeenCalled();

    expect(mockPublishEvent).toHaveBeenCalledWith(
      'settlement.failed',
      expect.objectContaining({ agreementId: 'agreement-1', reason: 'RPC timeout' }),
    );
    expect(mockPublishEvent).not.toHaveBeenCalledWith('settlement.completed', expect.anything());
  });

  it('generates a unique settlementId per call using crypto.randomUUID, not Math.random', async () => {
    mockReleaseFunds.mockResolvedValue(SUCCESS_TX);
    mockIsProcessed.mockResolvedValue(false);

    await orchestrateSettlement('agreement-1', DecisionOutcome.APPROVED);
    const firstId = mockSettlementCreate.mock.calls[0][0].settlementId;

    vi.clearAllMocks();
    mockIsProcessed.mockResolvedValue(false);
    mockFindByAgreementId.mockResolvedValue({ ...FUNDED_ESCROW });
    mockReleaseFunds.mockResolvedValue(SUCCESS_TX);

    await orchestrateSettlement('agreement-1', DecisionOutcome.APPROVED);
    const secondId = mockSettlementCreate.mock.calls[0][0].settlementId;

    // UUID v4 format check
    expect(firstId).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i);
    expect(firstId).not.toBe(secondId);
  });
});
