import { Task } from "@/entities/Task";
import { useQueryClient, useQuery } from "@tanstack/react-query";
import clsx from "clsx";
import { useState, useEffect, FormEvent } from "react";
import { remult } from "remult";
import { Layout } from "@/components/layout";
import { Project } from "@/entities/Project";

const todosRepo = remult.repo(Task);
const projectsRepo = remult.repo(Project);

export default function Home() {
  return (
    <Layout>
      <main>
        <h1 className="text-[#ef4444] italic text-6xl text-center">todos</h1>
        <div className="w-1/2 min-w-[400px] bg-white border border-solid border-gray-300 rounded-lg m-auto card-shadow ">
          <TasksComponent />
        </div>
      </main>
    </Layout>
  );
}

function TasksComponent({
  userId,
  projectId,
}: {
  projectId?: string;
  userId?: string;
}) {
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const qc = useQueryClient();

  const { data: tasks, isLoading: tasksLoading } = useQuery(
    ["tasks", projectId],
    () =>
      todosRepo.find({
        where: { projectId, userId },
      })
  );

  async function addTask(e: FormEvent) {
    e.preventDefault();
    try {
      await todosRepo.insert({
        title: newTaskTitle,
        completed: false,
        createdAt: new Date(),
        userId,
        projectId,
      });
      qc.invalidateQueries(["tasks"]);
      setNewTaskTitle("");
    } catch (error: any) {
      alert(error.message);
    }
  }

  return (
    <>
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

      {tasksLoading && (
        <div className="flex">
          <div className="px-3 py-2 text-gray-500">Loading...</div>
        </div>
      )}

      {tasks?.length ? (
        tasks.map((task) => <TaskComponent task={task} key={task.id} />)
      ) : (
        <div className="flex">
          <div className="px-3 py-2 text-gray-500">No tasks found</div>
        </div>
      )}
    </>
  );
}

function TaskComponent({ task }: { task: Task }) {
  // const { membershipList } = useOrganization({ membershipList: {} });

  const qc = useQueryClient();

  // const member = membershipList?.find(
  //   (m) => m.publicUserData.userId === task.userId
  // );

  async function setCompleted(task: Task, completed: boolean) {
    try {
      task.completed = completed;
      await todosRepo.save(task);

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
        {/* {member &&
          `(${member.publicUserData.firstName} ${member.publicUserData.lastName})`} */}
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

function ProjectSelectionComponent({
  orgId,
  selectedProject,
  setSelected,
}: {
  orgId: string;
  selectedProject?: string;
  setSelected: (id: string) => void;
}) {
  const qc = useQueryClient();

  const { data: projects } = useQuery(["projects", orgId], () =>
    orgId ? projectsRepo.find({ where: { orgId } }) : []
  );

  useEffect(() => {
    if (!selectedProject) {
      setSelected(projects?.[0]?.id || "");
    }
  }, [projects, selectedProject, setSelected]);

  useEffect(() => {
    if (selectedProject && !projects?.length) {
      setSelected(``);
    }
  }, [projects, selectedProject, setSelected]);

  async function addProject() {
    try {
      if (!orgId) throw new Error("No organization found");

      const projectsLength = projects?.length || 0;

      await projectsRepo.insert({
        title: `Project ${projectsLength + 1}`,
        orgId,
      });

      qc.invalidateQueries(["projects"]);
    } catch (error: any) {
      alert(error.message);
    }
  }

  return (
    <div className="flex">
      {projects?.length ? (
        projects.map((project) => (
          <button
            key={project.id}
            onClick={() => setSelected(project.id)}
            className={clsx(
              "px-3 py-2 border-x bg-gray-100 text-gray-700",
              selectedProject === project.id && "bg-white text-black text-xl"
            )}
          >
            {project.title}
          </button>
        ))
      ) : (
        <div className="px-3 py-2 text-gray-500">No projects found</div>
      )}
      <span className="grow"></span>
      <button className="px-3 py-2 border-x" onClick={addProject}>
        Add Project
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
