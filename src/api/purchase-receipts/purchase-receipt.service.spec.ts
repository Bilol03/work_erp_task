import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { BadRequestException, NotFoundException } from '@nestjs/common';

import { PurchaseReceiptsService } from './purchase-receipts.service'
import { InventoryService } from '../inventory/inventory.service';
import { PurchaseReceipt } from './schemas/purchase-receipt.schema';

describe('PurchaseReceiptService.confirm', () => {
  let service: PurchaseReceiptsService;
  let receiptModel: any;
  let inventoryService: InventoryService;

  beforeEach(async () => {
    receiptModel = {
      findById: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PurchaseReceiptsService,
        {
          provide: getModelToken(PurchaseReceipt.name),
          useValue: receiptModel,
        },
        {
          provide: InventoryService,
          useValue: {
            increaseStock: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get(PurchaseReceiptsService);
    inventoryService = module.get(InventoryService);
  });

  /* ===============================
     ✅ HAPPY PATH
  =============================== */
  it('should confirm receipt and increase stock', async () => {
    const mockReceipt: any = {
      _id: 'receipt1',
      status: 'DRAFT',
      warehouse_id: 'wh1',
      lines: [
        {
          product_id: 'p1',
          quantity: 5,
          expiration_date: new Date(),
        },
      ],
      save: jest.fn().mockResolvedValue(true),
    };

    receiptModel.findById.mockResolvedValue(mockReceipt);

    await service.confirm('receipt1');

    // stock increase chaqirilganmi?
    expect(inventoryService.increaseStock).toHaveBeenCalledWith(
      'p1',
      'wh1',
      5,
      {
        expiration_date: mockReceipt.lines[0].expiration_date,
        lot_code: undefined,
        serial_numbers: undefined,
      },
    );

    // status o'zgardimi?
    expect(mockReceipt.status).toBe('CONFIRMED');
    expect(mockReceipt.confirmed_by).toBe('system');
    expect(mockReceipt.confirmed_at).toBeInstanceOf(Date);
    expect(mockReceipt.save).toHaveBeenCalled();
  });

  /* ===============================
     ❌ NOT FOUND
  =============================== */
  it('should throw if receipt not found', async () => {
    receiptModel.findById.mockResolvedValue(null);

    await expect(service.confirm('bad-id')).rejects.toThrow(
      NotFoundException,
    );
  });

  /* ===============================
     ❌ INVALID STATUS
  =============================== */
  it('should throw if receipt is not DRAFT', async () => {
    receiptModel.findById.mockResolvedValue({
      status: 'CONFIRMED',
    });

    await expect(service.confirm('receipt1')).rejects.toThrow(
      BadRequestException,
    );
  });
});





describe('PurchaseReceiptService.cancel', () => {
  let service: PurchaseReceiptsService;
  let receiptModel: any;
  let inventoryService: InventoryService;

  beforeEach(async () => {
    receiptModel = {
      findById: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PurchaseReceiptsService,
        {
          provide: getModelToken(PurchaseReceipt.name),
          useValue: receiptModel,
        },
        {
          provide: InventoryService,
          useValue: {
            decreaseStock: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get(PurchaseReceiptsService);
    inventoryService = module.get(InventoryService);
  });

  /* ===============================
     ✅ HAPPY PATH
  =============================== */
  it('should cancel confirmed receipt and revert stock', async () => {
    const mockReceipt: any = {
      _id: 'r1',
      status: 'CONFIRMED',
      warehouse_id: 'wh1',
      lines: [
        {
          product_id: 'p1',
          quantity: 10,
          lot_code: 'LOT-001',
        },
      ],
      save: jest.fn().mockResolvedValue(true),
    };

    receiptModel.findById.mockResolvedValue(mockReceipt);

    await service.cancel('r1', 'Supplier mistake');

    expect(inventoryService.decreaseStock).toHaveBeenCalledWith(
      'p1',
      'wh1',
      10,
      {
        lot_code: 'LOT-001',
        expiration_date: undefined,
        serial_numbers: undefined,
      },
    );

    expect(mockReceipt.status).toBe('CANCELLED');
    expect(mockReceipt.cancelled_by).toBe('system');
    expect(mockReceipt.cancellation_reason).toBe('Supplier mistake');
    expect(mockReceipt.cancelled_at).toBeInstanceOf(Date);
    expect(mockReceipt.save).toHaveBeenCalled();
  });

  /* ===============================
     ❌ NOT FOUND
  =============================== */
  it('should throw if receipt not found', async () => {
    receiptModel.findById.mockResolvedValue(null);

    await expect(
      service.cancel('bad-id', 'reason'),
    ).rejects.toThrow(NotFoundException);
  });

  /* ===============================
     ❌ INVALID STATUS
  =============================== */
  it('should throw if receipt is not CONFIRMED', async () => {
    receiptModel.findById.mockResolvedValue({
      status: 'DRAFT',
    });

    await expect(
      service.cancel('r1', 'reason'),
    ).rejects.toThrow(BadRequestException);
  });

  /* ===============================
     ❌ NO REASON
  =============================== */
  it('should throw if cancellation reason is missing', async () => {
    receiptModel.findById.mockResolvedValue({
      status: 'CONFIRMED',
    });

    await expect(
      service.cancel('r1', ''),
    ).rejects.toThrow(BadRequestException);
  });
});
