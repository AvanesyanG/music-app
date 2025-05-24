import userModel from '../models/userModel.js';
import { clerkClient } from '@clerk/clerk-sdk-node';

export const authCallback = async (req, res) => {
    try {
        console.log('Auth callback received:', { 
            body: req.body,
            headers: req.headers
        });

        const { id, emailAddress } = req.body;
        
        if (!id || !emailAddress) {
            console.error('Missing required fields:', { id, emailAddress });
            return res.status(400).json({ 
                success: false, 
                message: "Missing required fields: id and emailAddress" 
            });
        }

        // First check if user exists by clerkId
        let existingUser = await userModel.findOne({ clerkId: id });
        
        if (existingUser) {
            console.log('User found by clerkId:', { 
                userId: existingUser._id,
                email: existingUser.email,
                clerkId: existingUser.clerkId
            });
            return res.status(200).json({ 
                success: true,
                message: "User found",
                userId: existingUser._id
            });
        }

        // Then check if user exists by email
        existingUser = await userModel.findOne({ email: emailAddress });
        
        if (existingUser) {
            // Update the existing user's clerkId
            console.log('User found by email, updating clerkId:', { 
                userId: existingUser._id,
                email: existingUser.email,
                oldClerkId: existingUser.clerkId,
                newClerkId: id
            });

            existingUser.clerkId = id;
            await existingUser.save();

            return res.status(200).json({ 
                success: true,
                message: "User updated with new clerkId",
                userId: existingUser._id
            });
        }

        // If no existing user found, create new user
        try {
            const newUser = await userModel.create({
                clerkId: id,
                email: emailAddress
            });

            console.log('New user created successfully:', { 
                id: newUser._id, 
                email: newUser.email,
                clerkId: newUser.clerkId 
            });
            
            return res.status(201).json({ 
                success: true,
                message: "User created successfully",
                userId: newUser._id
            });
        } catch (createError) {
            console.error('Error creating user:', {
                error: createError,
                code: createError.code,
                message: createError.message,
                userData: { clerkId: id, email: emailAddress }
            });

            // If it's a duplicate key error, try to find the user again
            if (createError.code === 11000) {
                const duplicateUser = await userModel.findOne({
                    $or: [
                        { clerkId: id },
                        { email: emailAddress }
                    ]
                });

                if (duplicateUser) {
                    return res.status(200).json({
                        success: true,
                        message: "User already exists",
                        userId: duplicateUser._id
                    });
                }
            }

            throw createError;
        }
    } catch (error) {
        console.error("Error in auth callback:", {
            message: error.message,
            stack: error.stack,
            code: error.code,
            body: req.body
        });

        res.status(500).json({ 
            success: false,
            message: "Internal server error",
            error: error.message,
            code: error.code
        });
    }
};

// Get user profile
export const getUserProfile = async (req, res) => {
    try {
        const { userId } = req.auth;
        console.log('Getting profile for user:', userId);
        
        const user = await userModel.findOne({ clerkId: userId });
        
        if (!user) {
            console.log('User not found:', userId);
            return res.status(404).json({ 
                success: false, 
                message: "User not found" 
            });
        }

        console.log('User profile found:', { 
            id: user._id,
            email: user.email,
            clerkId: user.clerkId
        });

        res.status(200).json({ 
            success: true, 
            user: {
                email: user.email,
                clerkId: user.clerkId,
                createdAt: user.createdAt,
                updatedAt: user.updatedAt
            }
        });
    } catch (error) {
        console.error("Error getting user profile:", {
            message: error.message,
            stack: error.stack,
            userId: req.auth?.userId
        });
        res.status(500).json({ 
            success: false,
            message: "Internal server error",
            error: error.message 
        });
    }
};