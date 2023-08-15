import { Project } from "@/entities/Project";
import { Task } from "@/entities/Task";
import { getAuth } from "@clerk/nextjs/server";
import { JsonDataProvider } from "remult";
import { remultNext } from "remult/remult-next";
import { JsonEntityFileStorage } from "remult/server";

export default remultNext({
  entities: [Task, Project],
  getUser: async (req) => {
    const { userId } = getAuth(req);
    if (userId) return { id: userId };
  },
  logApiEndPoints: true,
  dataProvider: new JsonDataProvider(new JsonEntityFileStorage("./db")),
});
