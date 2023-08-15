import { Allow, Entity, Fields, IdEntity, Validators } from "remult";

@Entity<Project>("projects", {
  allowApiCrud: Allow.authenticated,
})
export class Project extends IdEntity {
  @Fields.uuid()
  id = "";

  @Fields.string({
    validate: Validators.required,
  })
  title = "";

  @Fields.string({
    validate: Validators.required,
  })
  orgId = "";

  @Fields.date({ defaultValue: () => new Date() })
  createdAt?: Date;
}
