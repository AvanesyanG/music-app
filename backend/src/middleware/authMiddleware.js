import { clerkClient } from '@clerk/clerk-sdk-node';

export const protectRoute = async (req, res, next) => {
    try {
        console.log('Auth middleware - Request headers:', {
            authorization: req.headers.authorization ? 'Present' : 'Missing',
            origin: req.headers.origin,
            host: req.headers.host
        });

        // Get the session token from the Authorization header
        const authHeader = req.headers.authorization;
        console.log('Auth header:', authHeader);

        if (!authHeader) {
            console.log('No Authorization header found');
            return res.status(401).json({ message: "No Authorization header provided" });
        }

        const token = authHeader.split(' ')[1];
        console.log('Token (first 20 chars):', token ? `${token.substring(0, 20)}...` : 'Missing');

        if (!token) {
            console.log('No token found in Authorization header');
            return res.status(401).json({ message: "No token provided" });
        }

        try {
            // Verify the token using Clerk's SDK
            const decodedToken = await clerkClient.verifyToken(token);
            console.log('Token verified:', {
                userId: decodedToken.sub,
                exp: new Date(decodedToken.exp * 1000).toISOString(),
                iat: new Date(decodedToken.iat * 1000).toISOString()
            });

            // Add the user ID to the request object
            req.auth = {
                userId: decodedToken.sub
            };

            console.log('Auth middleware - Request authenticated successfully');
            next();
        } catch (verifyError) {
            console.error('Token verification failed:', {
                error: verifyError.message,
                code: verifyError.code,
                status: verifyError.status
            });
            return res.status(401).json({ 
                message: "Invalid token",
                details: verifyError.message
            });
        }
    } catch (error) {
        console.error('Auth middleware error:', {
            message: error.message,
            code: error.code,
            status: error.status,
            stack: error.stack
        });
        return res.status(401).json({ 
            message: "Authentication failed",
            details: error.message
        });
    }
};

export const requireAdmin = async (req, res, next) => {
    try {
        const currentUser = await clerkClient.users.getUser(req.auth.userId);
        const isAdmin = process.env.ADMIN_EMAIL === currentUser.emailAddresses[0].emailAddress;
        if (!isAdmin) {
            return res.status(403).json({ message: "Unauthorized - you must be an admin" });
        }
        next();
    } catch (error) {
        return res.status(500).json({ message: "Internal server error" });
    }
};
