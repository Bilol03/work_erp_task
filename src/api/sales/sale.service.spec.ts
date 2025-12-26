import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { BadRequestException, NotFoundException } from '@nestjs/common';

import { SalesService } from './sales.service';
import { InventoryService } from '../inventory/inventory.service';
import { Sale } from './schema/sale.schema';

describe('SaleService.confirm', () => {
  let service: SalesService;
  let saleModel: any;
  let inventoryService: InventoryService;

  beforeEach(async () => {
    saleModel = {
      findById: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SalesService,
        {
          provide: getModelToken(Sale.name),
          useValue: saleModel,
        },
        {
          provide: InventoryService,
          useValue: {
            checkAvailability: jest.fn(),
            decreaseStock: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get(SalesService);
    inventoryService = module.get(InventoryService);
  });

  /* ===============================
     ✅ HAPPY PATH
  =============================== */
  it('should confirm sale and decrease stock', async () => {
    const mockSale: any = {
      _id: 'sale1',
      status: 'DRAFT',
      warehouse_id: 'wh1',
      lines: [
        {
          product_id: 'p1',
          quantity: 2,
          serial_numbers: ['SN001', 'SN002'],
        },
      ],
      save: jest.fn().mockResolvedValue(true),
    };

    saleModel.findById.mockResolvedValue(mockSale);

    await service.confirm('sale1');

    // availability check
    expect(inventoryService.checkAvailability).toHaveBeenCalledWith(
      'p1',
      'wh1',
      2,
      {
        serial_numbers: ['SN001', 'SN002'],
        lot_code: undefined,
        expiration_date: undefined,
      },
    );

    // stock decrease
    expect(inventoryService.decreaseStock).toHaveBeenCalledWith(
      'p1',
      'wh1',
      2,
      {
        serial_numbers: ['SN001', 'SN002'],
        lot_code: undefined,
        expiration_date: undefined,
      },
    );

    // status update
    expect(mockSale.status).toBe('CONFIRMED');
    expect(mockSale.confirmed_by).toBe('system');
    expect(mockSale.confirmed_at).toBeInstanceOf(Date);
    expect(mockSale.save).toHaveBeenCalled();
  });

  /* ===============================
     ❌ SALE NOT FOUND
  =============================== */
  it('should throw if sale not found', async () => {
    saleModel.findById.mockResolvedValue(null);

    await expect(service.confirm('bad-id')).rejects.toThrow(
      NotFoundException,
    );
  });

  /* ===============================
     ❌ INVALID STATUS
  =============================== */
  it('should throw if sale is not DRAFT', async () => {
    saleModel.findById.mockResolvedValue({
      status: 'CONFIRMED',
    });

    await expect(service.confirm('sale1')).rejects.toThrow(
      BadRequestException,
    );
  });
});



describe('SaleService.cancel', () => {
  let service: SalesService;
  let saleModel: any;
  let inventoryService: InventoryService;

  beforeEach(async () => {
    saleModel = {
      findById: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SalesService,
        {
          provide: getModelToken(Sale.name),
          useValue: saleModel,
        },
        {
          provide: InventoryService,
          useValue: {
            increaseStock: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get(SalesService);
    inventoryService = module.get(InventoryService);
  });

  /* ===============================
     ✅ HAPPY PATH
  =============================== */
  it('should cancel confirmed sale and restore stock', async () => {
    const mockSale: any = {
      _id: 's1',
      status: 'CONFIRMED',
      warehouse_id: 'wh1',
      lines: [
        {
          product_id: 'p1',
          quantity: 3,
          serial_numbers: ['SN1', 'SN2', 'SN3'],
        },
      ],
      save: jest.fn().mockResolvedValue(true),
    };

    saleModel.findById.mockResolvedValue(mockSale);

    await service.cancel('s1', 'Customer returned items');

    expect(inventoryService.increaseStock).toHaveBeenCalledWith(
      'p1',
      'wh1',
      3,
      {
        serial_numbers: ['SN1', 'SN2', 'SN3'],
        lot_code: undefined,
        expiration_date: undefined,
      },
    );

    expect(mockSale.status).toBe('CANCELLED');
    expect(mockSale.cancelled_by).toBe('system');
    expect(mockSale.cancellation_reason).toBe('Customer returned items');
    expect(mockSale.cancelled_at).toBeInstanceOf(Date);
    expect(mockSale.save).toHaveBeenCalled();
  });

  /* ===============================
     ❌ SALE NOT FOUND
  =============================== */
  it('should throw if sale not found', async () => {
    saleModel.findById.mockResolvedValue(null);

    await expect(
      service.cancel('bad-id', 'reason'),
    ).rejects.toThrow(NotFoundException);
  });

  /* ===============================
     ❌ INVALID STATUS
  =============================== */
  it('should throw if sale is not CONFIRMED', async () => {
    saleModel.findById.mockResolvedValue({
      status: 'DRAFT',
    });

    await expect(
      service.cancel('s1', 'reason'),
    ).rejects.toThrow(BadRequestException);
  });

  /* ===============================
     ❌ NO CANCELLATION REASON
  =============================== */
  it('should throw if cancellation reason is missing', async () => {
    saleModel.findById.mockResolvedValue({
      status: 'CONFIRMED',
    });

    await expect(
      service.cancel('s1', ''),
    ).rejects.toThrow(BadRequestException);
  });
});
