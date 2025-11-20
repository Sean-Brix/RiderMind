import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function deleteAcc(req, res) {
	try {
		const { id } = req.params;
		const currentUserId = req.user.id;
		
		// Convert id to number
		const userId = parseInt(id);
		
		if (isNaN(userId)) {
			return res.status(400).json({ error: 'Invalid user ID' });
		}
		
		// Prevent user from deleting their own account
		if (userId === currentUserId) {
			return res.status(403).json({ error: 'You cannot delete your own account' });
		}
		
		// Check if user exists
		const userToDelete = await prisma.user.findUnique({
			where: { id: userId },
			select: { id: true, email: true, role: true, first_name: true, last_name: true }
		});
		
		if (!userToDelete) {
			return res.status(404).json({ error: 'User not found' });
		}
		
		// Prevent deletion of the last admin
		if (userToDelete.role === 'ADMIN') {
			const adminCount = await prisma.user.count({
				where: { role: 'ADMIN' }
			});
			
			if (adminCount <= 1) {
				return res.status(403).json({ error: 'Cannot delete the last admin account' });
			}
		}
		
		// Delete the user
		await prisma.user.delete({
			where: { id: userId }
		});
		
		const displayName = [userToDelete.first_name, userToDelete.last_name].filter(Boolean).join(' ') || userToDelete.email;
		
		return res.json({ 
			message: 'User account deleted successfully',
			deletedUser: {
				id: userToDelete.id,
				email: userToDelete.email,
				displayName
			}
		});
	} catch (err) {
		console.error('Delete user error', err);
		return res.status(500).json({ error: 'Internal server error' });
	}
}
