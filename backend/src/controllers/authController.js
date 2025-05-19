import userModel from '../models/userModel.js';

export const authCallback = async (req,res)=>{
    try {
        const {id,firstName,lastName,imageUrl} = req.body;
        
        //check if user already exists
        const user = await userModel.findOne({clerkId: id});

        if(!user){
            //create new user
            await userModel.create({
                clerkId: id,
                fullName: `${firstName} ${lastName}`,
                image: imageUrl
            })
        }
        res.status(200).json({success:true})
    } catch (error) {
        console.log("Error in auth callback",error);
        res.status(500).json({message: "Internal server error",error});
    }
}