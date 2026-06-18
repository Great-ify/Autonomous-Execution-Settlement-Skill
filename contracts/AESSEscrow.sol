// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract AESSEscrow is ReentrancyGuard {
    enum EscrowStatus { CREATED, FUNDED, RELEASED, REFUNDED, FROZEN }

    struct Escrow {
        uint256 agreementId;
        address payer;
        address worker;
        uint256 amount;
        EscrowStatus status;
    }

    mapping(uint256 => Escrow) public escrows;
    address public authorizedSettlementEngine;

    event EscrowCreated(uint256 agreementId, uint256 amount);
    event EscrowFunded(uint256 agreementId, uint256 amount);
    event FundsReleased(uint256 agreementId, uint256 amount);
    event FundsRefunded(uint256 agreementId, uint256 amount);
    event EscrowFrozen(uint256 agreementId);

    constructor(address _settlementEngine) {
        authorizedSettlementEngine = _settlementEngine;
    }

    modifier onlyAuthorized() {
        require(msg.sender == authorizedSettlementEngine, "Not authorized");
        _;
    }

    function createEscrow(uint256 _agreementId, address _worker) external payable {
        escrows[_agreementId] = Escrow(_agreementId, msg.sender, _worker, msg.value, EscrowStatus.FUNDED);
        emit EscrowCreated(_agreementId, msg.value);
        emit EscrowFunded(_agreementId, msg.value);
    }

    function releaseFunds(uint256 _agreementId) external onlyAuthorized nonReentrant {
        Escrow storage escrow = escrows[_agreementId];
        require(escrow.status == EscrowStatus.FUNDED, "Not fundable");
        escrow.status = EscrowStatus.RELEASED;
        
        (bool success, ) = payable(escrow.worker).call{value: escrow.amount}("");
        require(success, "Transfer failed");
        
        emit FundsReleased(_agreementId, escrow.amount);
    }

    function refundFunds(uint256 _agreementId) external onlyAuthorized nonReentrant {
        Escrow storage escrow = escrows[_agreementId];
        require(escrow.status == EscrowStatus.FUNDED, "Not fundable");
        escrow.status = EscrowStatus.REFUNDED;
        
        (bool success, ) = payable(escrow.payer).call{value: escrow.amount}("");
        require(success, "Transfer failed");
        
        emit FundsRefunded(_agreementId, escrow.amount);
    }

    function freezeEscrow(uint256 _agreementId) external onlyAuthorized {
        Escrow storage escrow = escrows[_agreementId];
        require(escrow.status == EscrowStatus.FUNDED, "Not fundable");
        escrow.status = EscrowStatus.FROZEN;
        emit EscrowFrozen(_agreementId);
    }
}
