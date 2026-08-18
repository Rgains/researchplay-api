import mongoose from "mongoose";

const FacultySchema = new mongoose.Schema({
    name: { type: String, required: true },
    alias: { type: String, },
    totalDepartments: { type: Number, },
    studyDuration: { type: String },
    totalAvailablePrograms: { type: Number },
    institution: { type: mongoose.Schema.Types.ObjectId, ref: "institution" }
});

const Faculty = mongoose.model('faculties', FacultySchema);

module.exports = {
    Faculty, FacultySchema
};