import Budget from "../models/Project/Budget";
import Project from "../models/Project/Project";
import { EventEmitter, once } from "stream";

class DashboardService {
    event = new EventEmitter();

    constructor() {
        console.log(this.event.listenerCount)
    }

    async getAggregatedData() {
        try{
            const [projects, budgets] = await Promise.all([
                Project.find(),
                Budget.find()
            ]);
        } catch(error: any) {
            console.log(error);
        }
    }
}

export default new DashboardService;