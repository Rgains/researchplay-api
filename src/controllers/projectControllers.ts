import { Request, Response } from "express";
import ProjectService from '../services/project.service';

export async function getProject(req: Request, res: Response) {
  return await ProjectService.getProject(req, res);
}

export async function allProjects(req: Request, res: Response) {
  return await ProjectService.getAllProjects(req, res);
}

export async function userProjects(req: Request, res: Response) {
  return await ProjectService.getUserProjects(req, res);
}

export async function createProject(req: Request, res: Response) {
  return await ProjectService.createProject(req, res);
}

export async function updateProject(req: Request, res: Response) {
  return await ProjectService.updateProject(req, res);
}

export async function awardProject(req: Request, res: Response) {
  return await ProjectService.awardProject(req, res);
}
