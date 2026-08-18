import mongoose from "mongoose";

const ExperienceSchema = new mongoose.Schema({
    skills: { type: [String] },
    
});