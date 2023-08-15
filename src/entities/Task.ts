import { Allow, Entity, Fields, Validators } from "remult";

@Entity<Task>("tasks", {
  allowApiCrud: true,
})
export class Task {
  @Fields.uuid()
  id = "";

  @Fields.string({
    validate: Validators.required,
  })
  title = "";

  @Fields.boolean({
    defaultValue: () => false,
  })
  completed = false;

  @Fields.string()
  userId = "";

  @Fields.string()
  projectId = "";

  @Fields.date({ defaultValue: () => new Date() })
  createdAt?: Date;
}
