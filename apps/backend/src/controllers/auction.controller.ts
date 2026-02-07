import { Request, Response } from 'express';
import { prisma } from '../services/prisma.service';
import { AuthenticatedRequest } from '../middleware/auth.middleware';

// Valid metal types for precious metals exchange
const VALID_METAL_TYPES = ['GOLD', 'SILVER', 'PLATINUM', 'PALLADIUM', 'RHODIUM', 'COPPER', 'OTHER'];

export class AuctionController {
  // List all auctions (public)
  async listAuctions(req: Request, res: Response) {
    try {
      const { 
        page = '1', 
        limit = '20', 
        status,
        search,
        metalType,
        sortBy = 'createdAt',
        sortOrder = 'desc'
      } = req.query;

      const pageNum = parseInt(page as string);
      const limitNum = parseInt(limit as string);
      const skip = (pageNum - 1) * limitNum;

      // Build filter
      const where: any = {};
      
      if (status) {
        where.status = status;
      } else {
        // Default to active auctions
        where.status = 'active';
      }

      if (metalType && VALID_METAL_TYPES.includes((metalType as string).toUpperCase())) {
        where.metalType = (metalType as string).toUpperCase();
      }

      if (search) {
        where.OR = [
          { title: { contains: search as string, mode: 'insensitive' } },
          { description: { contains: search as string, mode: 'insensitive' } },
          { metalType: { contains: search as string, mode: 'insensitive' } }
        ];
      }

      // Validate sort fields
      const validSortFields = ['createdAt', 'updatedAt', 'endTime', 'currentPrice', 'startingPrice'];
      const sortField = validSortFields.includes(sortBy as string) 
        ? sortBy as string 
        : 'createdAt';

      // Get auctions with seller info
      const [auctions, total] = await Promise.all([
        prisma.auction.findMany({
          where,
          include: {
            seller: {
              select: {
                id: true,
                name: true,
                email: true,
              }
            },
            bids: {
              select: {
                id: true,
                amount: true,
                createdAt: true,
              },
              orderBy: {
                amount: 'desc'
              },
              take: 1 // Get highest bid
            }
          },
          skip,
          take: limitNum,
          orderBy: {
            [sortField]: sortOrder as 'asc' | 'desc'
          }
        }),
        prisma.auction.count({ where })
      ]);

      return res.json({
        success: true,
        data: {
          auctions,
          meta: {
            page: pageNum,
            limit: limitNum,
            total,
            pages: Math.ceil(total / limitNum)
          }
        }
      });

    } catch (error) {
      console.error('List auctions error:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to fetch auctions'
      });
    }
  }

  // Create new auction (authenticated users only)
  async createAuction(req: AuthenticatedRequest, res: Response) {
    try {
      const user = req.user;
      if (!user) {
        return res.status(401).json({
          success: false,
          error: 'Not authenticated'
        });
      }

      const { 
        title, 
        description, 
        startingPrice,
        endTime,
        metalType = 'GOLD',
        weight,
        purity
      } = req.body;

      // Validation
      if (!title || !description || !startingPrice || !endTime) {
        return res.status(400).json({
          success: false,
          error: 'Title, description, starting price, and end time are required'
        });
      }

      if (startingPrice <= 0) {
        return res.status(400).json({
          success: false,
          error: 'Starting price must be greater than 0'
        });
      }

      // Validate metal type
      const upperMetalType = metalType.toUpperCase();
      if (!VALID_METAL_TYPES.includes(upperMetalType)) {
        return res.status(400).json({
          success: false,
          error: `Invalid metal type. Valid types: ${VALID_METAL_TYPES.join(', ')}`
        });
      }

      // Create auction with all fields
      const auction = await prisma.auction.create({
        data: {
          title,
          description,
          startingPrice: parseFloat(startingPrice),
          currentPrice: parseFloat(startingPrice), // Start with starting price
          status: 'active',
          metalType: upperMetalType,
          weight: weight ? parseFloat(weight) : null,
          purity: purity ? parseFloat(purity) : null,
          endTime: new Date(endTime),
          sellerId: user.userId,
        },
        include: {
          seller: {
            select: {
              id: true,
              name: true,
              email: true,
            }
          }
        }
      });

      return res.status(201).json({
        success: true,
        message: 'Auction created successfully',
        data: { auction }
      });

    } catch (error) {
      console.error('Create auction error:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to create auction'
      });
    }
  }

  // Other methods (getAuction, updateAuction, deleteAuction, placeBid) remain the same
  // ... [rest of the existing methods]
}

export const auctionController = new AuctionController();
