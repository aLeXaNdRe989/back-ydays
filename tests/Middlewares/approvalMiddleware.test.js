const { requireApproval } = require('../../middlewares/approvalMiddleware');

describe('Tests Approval Middleware', () => {

    let mockReq;
    let mockRes;
    let nextFunction;

    beforeEach(() => {
        mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn().mockReturnThis()
        };
        nextFunction = jest.fn();
    });

    // ===== TEST ADMIN BYPASS =====
    it('devrait laisser passer un admin sans verification', () => {
        mockReq = {
            user: {
                role: 'admin',
                isApproved: 'pending'
            }
        };

        requireApproval(mockReq, mockRes, nextFunction);

        expect(nextFunction).toHaveBeenCalled();
        expect(mockRes.status).not.toHaveBeenCalled();
    });

    // ===== TEST APPROVED USER =====
    it('devrait laisser passer un utilisateur approuve', () => {
        mockReq = {
            user: {
                role: 'candidat',
                isApproved: 'approved'
            }
        };

        requireApproval(mockReq, mockRes, nextFunction);

        expect(nextFunction).toHaveBeenCalled();
        expect(mockRes.status).not.toHaveBeenCalled();
    });

    it('devrait laisser passer une entreprise approuvee', () => {
        mockReq = {
            user: {
                role: 'entreprise',
                isApproved: 'approved'
            }
        };

        requireApproval(mockReq, mockRes, nextFunction);

        expect(nextFunction).toHaveBeenCalled();
    });

    // ===== TEST PENDING USER =====
    it('devrait bloquer un utilisateur en attente', () => {
        mockReq = {
            user: {
                role: 'candidat',
                isApproved: 'pending'
            }
        };

        requireApproval(mockReq, mockRes, nextFunction);

        expect(nextFunction).not.toHaveBeenCalled();
        expect(mockRes.status).toHaveBeenCalledWith(403);
        expect(mockRes.json).toHaveBeenCalledWith(
            expect.objectContaining({
                status: 'pending',
                message: expect.stringMatching(/attente/i)
            })
        );
    });

    it('devrait bloquer une entreprise en attente', () => {
        mockReq = {
            user: {
                role: 'entreprise',
                isApproved: 'pending'
            }
        };

        requireApproval(mockReq, mockRes, nextFunction);

        expect(nextFunction).not.toHaveBeenCalled();
        expect(mockRes.status).toHaveBeenCalledWith(403);
    });

    // ===== TEST REJECTED USER =====
    it('devrait bloquer un utilisateur rejete', () => {
        mockReq = {
            user: {
                role: 'candidat',
                isApproved: 'rejected',
                rejectionReason: 'Documents invalides'
            }
        };

        requireApproval(mockReq, mockRes, nextFunction);

        expect(nextFunction).not.toHaveBeenCalled();
        expect(mockRes.status).toHaveBeenCalledWith(403);
        expect(mockRes.json).toHaveBeenCalledWith(
            expect.objectContaining({
                status: 'rejected',
                reason: 'Documents invalides'
            })
        );
    });

    it('devrait bloquer une entreprise rejetee et afficher le motif', () => {
        mockReq = {
            user: {
                role: 'entreprise',
                isApproved: 'rejected',
                rejectionReason: 'Entreprise non verifiee'
            }
        };

        requireApproval(mockReq, mockRes, nextFunction);

        expect(nextFunction).not.toHaveBeenCalled();
        expect(mockRes.status).toHaveBeenCalledWith(403);
        expect(mockRes.json).toHaveBeenCalledWith(
            expect.objectContaining({
                status: 'rejected',
                reason: 'Entreprise non verifiee'
            })
        );
    });
});
