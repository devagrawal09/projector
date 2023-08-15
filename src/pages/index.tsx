import { Task } from "@/entities/Task";
import {
  useUser,
  useOrganization,
  useClerk,
  SignInButton,
} from "@clerk/nextjs";
import { useQueryClient, useQuery } from "@tanstack/react-query";
import clsx from "clsx";
import { useState, useEffect, FormEvent } from "react";
import { remult } from "remult";
import { Layout } from "@/components/layout";
import { Project } from "@/entities/Project";

const todosRepo = remult.repo(Task);
const projectsRepo = remult.repo(Project);

export default function Home() {
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [_selectedProject, setSelected] = useLocalStorage("selectedProject");

  const qc = useQueryClient();
  const { user, isLoaded } = useUser();
  const { organization } = useOrganization();

  const selectedProject = organization ? _selectedProject : undefined;

  const { data: projects } = useQuery(["projects", organization?.id], () =>
    organization
      ? projectsRepo.find({
          where: { orgId: organization?.id },
        })
      : []
  );

  const { data: tasks, isLoading } = useQuery(["tasks", selectedProject], () =>
    todosRepo.find({
      where: { projectId: selectedProject },
    })
  );

  useEffect(() => {
    if (!selectedProject) {
      setSelected(projects?.[0]?.id || "");
    }
  }, [projects, selectedProject, setSelected]);

  async function addTask(e: FormEvent) {
    e.preventDefault();
    try {
      await todosRepo.insert({
        title: newTaskTitle,
        completed: false,
        createdAt: new Date(),
        userId: user?.id,
        projectId: selectedProject,
      });
      qc.invalidateQueries(["tasks"]);
      setNewTaskTitle("");
    } catch (error: any) {
      alert(error.message);
    }
  }

  async function addProject() {
    try {
      if (!organization) throw new Error("No organization found");

      const projectsLength = projects?.length || 0;

      await projectsRepo.insert({
        title: `Project ${projectsLength + 1}`,
        orgId: organization.id,
      });

      qc.invalidateQueries(["projects"]);
    } catch (error: any) {
      alert(error.message);
    }
  }

  return (
    <Layout>
      <main>
        <h1 className="text-[#ef4444] italic text-6xl text-center">todos</h1>

        {!isLoaded && (
          <div className=" w-1/2 min-w-[400px] bg-white border border-solid border-gray-300 rounded-lg m-auto card-shadow ">
            <div className="flex">
              <div className="px-3 py-2 text-gray-500">Loading...</div>
            </div>
          </div>
        )}
        {isLoaded && !user && (
          <div className=" w-1/2 min-w-[400px] bg-white border border-solid border-gray-300 rounded-lg m-auto card-shadow ">
            <div className="flex">
              <div className="px-3 py-2 text-gray-500">
                Please{" "}
                <SignInButton>
                  <button className="underline">sign in</button>
                </SignInButton>{" "}
                to continue
              </div>
            </div>
          </div>
        )}
        {isLoaded && user && (
          <div className=" w-1/2 min-w-[400px] bg-white border border-solid border-gray-300 rounded-lg m-auto card-shadow ">
            <div className="flex">
              {organization && (
                <>
                  {projects?.length ? (
                    projects.map((project) => (
                      <button
                        key={project.id}
                        onClick={() => setSelected(project.id)}
                        className={clsx(
                          "px-3 py-2 border-x bg-gray-100 text-gray-700",
                          selectedProject === project.id &&
                            "bg-white text-black text-xl"
                        )}
                      >
                        {project.title}
                      </button>
                    ))
                  ) : (
                    <div className="px-3 py-2 text-gray-500">
                      No projects found
                    </div>
                  )}
                  <span className="grow"></span>
                  <button className="px-3 py-2 border-x" onClick={addProject}>
                    Add Project
                  </button>
                </>
              )}
            </div>
            <form
              onSubmit={addTask}
              className="border border-b border-solid flex px-2 py-1 items-center todo"
            >
              <input
                value={newTaskTitle}
                placeholder="What needs to be done?"
                onChange={(e) => setNewTaskTitle(e.target.value)}
                className="w-full p-1 outline-none placeholder:italic"
              />
              <button className="font-medium rounded-full border px-4 py-2 text-md font-sans bg-white border-none text-white hover:text-inherit hover:bg-gray-200">
                Add
              </button>
            </form>

            {isLoading && <div>Loading...</div>}

            {tasks?.map((task) => (
              <TaskComponent task={task} key={task.id} />
            ))}
          </div>
        )}
      </main>
    </Layout>
  );
}

function TaskComponent({ task }: { task: Task }) {
  const { membershipList } = useOrganization({ membershipList: {} });

  const qc = useQueryClient();

  const member = membershipList?.find(
    (m) => m.publicUserData.userId === task.userId
  );

  async function setCompleted(task: Task, completed: boolean) {
    try {
      await task.toggleCompleted(completed);

      qc.invalidateQueries(["tasks"]);
    } catch (error: any) {
      alert(error.message);
    }
  }

  async function deleteTask(task: Task) {
    try {
      await todosRepo.delete(task.id);
      qc.invalidateQueries(["tasks"]);
    } catch (error: any) {
      alert(error.message);
    }
  }

  return (
    <div className="border-b flex px-2 py-1 gap-4 items-center todo">
      <input
        type="checkbox"
        checked={task.completed}
        onChange={(e) => setCompleted(task, e.target.checked)}
        className="w-5 h-5"
      />
      <span className={clsx("p-1 grow", task.completed && "line-through")}>
        {task.title}{" "}
        {member &&
          `(${member.publicUserData.firstName} ${member.publicUserData.lastName})`}
      </span>
      <button
        onClick={() => deleteTask(task)}
        className="font-medium rounded-full border px-4 py-2 text-md font-sans bg-white border-none text-white hover:text-inherit hover:bg-gray-200"
      >
        x
      </button>
    </div>
  );
}

function useLocalStorage(key: string, init?: string) {
  const [value, setValue] = useState<string>(() => {
    if (typeof window === "undefined") return "";
    return localStorage.getItem(key) || init || "";
  });

  useEffect(() => {
    if (typeof window === "undefined") return;
    localStorage.setItem(key, value);
  }, [key, value]);

  return [value, setValue] as const;
}
