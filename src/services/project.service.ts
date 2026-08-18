import { Request, Response } from "express";
import Project from "../models/Project/Project";
import logger from "../utils/logger";

class ProjectService {
    constructor() {}

    async getProject(req: Request, res: Response) {
        var project_id;
        if (req.params.project_id) project_id = req.params.project_id;
        if (req.query.project_id) project_id = req.query.project_id;

        if (!project_id) {
            logger.error("[PROJECT REQUEST] invalid project id provided", project_id);
            res.status(400).json({
            status: "bad request",
            message: "Invalid project id",
            });
        }

        try {
            const selected_project = await Project.findById(project_id);

            res.status(200).json({
            status: "success ok",
            project: selected_project,
            });
        } catch (error) {
            logger.error("[PROJECT REQUEST] server error", error);
            res.status(500).json({
            status: "internal server error",
            error: error,
            });
        }
    }

    async getAllProjects(req: Request, res: Response) {
        try {
            const projects = await Project.find();

            logger.info("[PROJECT SERVICE] List all projects");
            res.status(200).json({ status: "", message: "", projects: projects });
        } catch (error) {}
    }

    async getUserProjects(req: Request, res: Response) {
        try {
            const projects = await Project.find({ 
                user: req.params.uid 
            }).lean();
        
            logger.info("[PROJECT SERVICE] List user projects");
            res.status(200).json({ status: "", message: "", projects: projects });
        } catch (error) {}
    }

    async createProject(req: Request, res: Response) {
        const data = req.body;

        try {
            const proj = await Project.create({
            ...data,
            });

            logger.info("[NEW PROJECT] creation successful", proj);
            res.status(200).json(proj);
        } catch (error) {
            console.log(error);

            logger.error("[NEW PROJECT] creation failed", error);
        }
    }

    async  updateProject(req: Request, res: Response) {
        const data = req.body;

        if (data.phase == 2) {
            const updated = await Project.findByIdAndUpdate(data.id, data, {
            upsert: true,
            });

            console.log(updated);
        } else if (data.phase == 3) {
            const updated = await Project.findByIdAndUpdate(data.id, data, {
            upsert: true,
            });

            console.log(updated);
        }
    }

    async awardProject(req: Request, res: Response) {
        const project = await Project.findByIdAndUpdate(
            req.params.id, 
            { awardee: req.body.bidder_id }, 
            { new: true, upsert: true }
        );
    }
}

export default new ProjectService();