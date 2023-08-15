import { Project } from "@/entities/Project";
import { Task } from "@/entities/Task";
import { JsonDataProvider } from "remult";
import { remultNext } from "remult/remult-next";
import { JsonEntityFileStorage } from "remult/server";

export default remultNext({
  entities: [Task, Project],
  logApiEndPoints: true,
  dataProvider: new JsonDataProvider(new JsonEntityFileStorage("./db")),
  getUser: async (req) => {
    return undefined;
  },
});
