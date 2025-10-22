import { describe, expect, it } from 'vitest'
import { mapEventTypeToBibSaleType, transformBibsToBibSales, transformBibToBibSale } from '@/lib/transformers/bib'
import { mockBib, mockEvent, mockUser } from '@/tests/mocks/data'

describe('bibTransformers', () => {
	describe('mapEventTypeToBibSaleType', () => {
		it('should map event types correctly', () => {
			expect(mapEventTypeToBibSaleType('road')).toBe('road')
			expect(mapEventTypeToBibSaleType('trail')).toBe('trail')
			expect(mapEventTypeToBibSaleType('triathlon')).toBe('triathlon')
			expect(mapEventTypeToBibSaleType('cycle')).toBe('cycle')
			expect(mapEventTypeToBibSaleType(undefined)).toBe('other')
		})
	})

	describe('transformBibToBibSale', () => {
		it('should transform a bib to a bib sale', () => {
			const bibSale = transformBibToBibSale(mockBib)
			expect(bibSale).not.toBeNull()
			if (!bibSale) return

			expect(bibSale.id).toBe(mockBib.id)
			expect(bibSale.price).toBe(mockBib.price)
			expect(bibSale.originalPrice).toBe(mockBib.originalPrice)
			expect(bibSale.status).toBe('available')
			expect(bibSale.user.id).toBe(mockUser.id)
			expect(bibSale.event.id).toBe(mockEvent.id)
			expect(bibSale.event.type).toBe('trail')
		})

		it('should return null if expand data is missing', () => {
			const bibWithoutExpand = { ...mockBib, expand: undefined }
			const bibSale = transformBibToBibSale(bibWithoutExpand)
			expect(bibSale).toBeNull()
		})
	})

	describe('transformBibsToBibSales', () => {
		it('should transform a list of bibs to bib sales', () => {
			const bibs = [mockBib, mockBib]
			const bibSales = transformBibsToBibSales(bibs)
			expect(bibSales.length).toBe(2)
		})

		it('should filter out bibs that cannot be transformed', () => {
			const bibs = [mockBib, { ...mockBib, expand: undefined }]
			const bibSales = transformBibsToBibSales(bibs)
			expect(bibSales.length).toBe(1)
		})
	})
})
