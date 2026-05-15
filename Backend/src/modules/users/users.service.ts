import { prisma } from '../../config/database';
import { ApiError } from '../../shared/utils/ApiError';

export const usersService = {
  async searchByEmail(email: string, currentUserId: string) {
    if (!email || email.length < 3) {
      throw new ApiError(400, 'Enter at least 3 characters to search');
    }

    const users = await prisma.user.findMany({
      where: {
        email: { contains: email, mode: 'insensitive' },
        id: { not: currentUserId }, // exclude self
      },
      select: {
        id: true,
        name: true,
        email: true,
        accounts: {
          where: { isActive: true },
          select: {
            id: true,
            name: true,
            accountType: true,
            currency: true,
          },
        },
      },
      take: 5,
    });

    return users;
  },
};